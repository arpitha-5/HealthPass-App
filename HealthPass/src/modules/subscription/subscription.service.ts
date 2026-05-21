import { AppError } from '../../utils/AppError';
import { prisma } from '../../lib/prisma';

interface SubscriptionInput {
  userId: string;
  planId: string;
  billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
}

interface WalletInput {
  userId: string;
  amount: number;
  type?: string;
  referenceId?: string;
}

export const subscriptionService = {
  // ─── Get User Subscription ─────────────────────────────────────────────────
  async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });
    return subscription;
  },

  // ─── Create Subscription ────────────────────────────────────────────────────
  async createSubscription({ userId, planId, billingCycle = 'MONTHLY' }: SubscriptionInput) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError('Plan not found', 404);

    // Cancel existing subscription
    const existing = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });
    }

    // Calculate pricing based on billing cycle
    const priceMap = {
      MONTHLY: plan.priceMonthly,
      QUARTERLY: plan.priceQuarterly,
      ANNUAL: plan.priceAnnually,
    };
    const price = priceMap[billingCycle];

    // Calculate dates
    const durationDays = billingCycle === 'MONTHLY' ? 30 : billingCycle === 'QUARTERLY' ? 90 : 365;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        billingCycle,
        status: 'ACTIVE',
        startDate,
        endDate,
        freeVisitsRemaining: plan.freeVisits,
        payments: {
          create: {
            amount: price,
            status: 'SUCCESS',
            method: 'FREE', // First subscription
          },
        },
      },
      include: { plan: true },
    });

    // Add wallet credits from plan
    const planFeatures = plan.features as { walletCredits?: number } || {};
    if (planFeatures.walletCredits && planFeatures.walletCredits > 0) {
      await this.addWalletCredits({
        userId,
        amount: planFeatures.walletCredits,
        reason: `Welcome bonus for ${plan.displayName} plan`,
      });
    }

    return subscription;
  },

  // ─── Cancel Subscription ────────────────────────────────────────────────────
  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) throw new AppError('No active subscription found', 404);

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  },

  // ─── Deduct Free Visit ──────────────────────────────────────────────────────
  async deductFreeVisit(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) throw new AppError('No active subscription', 400);
    if (subscription.freeVisitsRemaining <= 0) {
      throw new AppError('No free visits remaining', 400);
    }

    return prisma.subscription.update({
      where: { id: subscription.id },
      data: { freeVisitsRemaining: { decrement: 1 } },
    });
  },

  // ─── Get Wallet ─────────────────────────────────────────────────────────────
  async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
      });
    }

    return wallet;
  },

  // ─── Add Wallet Credits (for bill cashback, referrals, etc.) ─────────────────
  async addWalletCredits({ userId, amount, reason }: { userId: string; amount: number; reason: string }) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'CREDIT',
        reason,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      },
    });

    return updatedWallet;
  },

  // ─── Apply Wallet Credits (deduct during payment) ────────────────────────────
  async applyWalletCredits({ userId, amount, type, referenceId }: WalletInput) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) throw new AppError('Wallet not found', 404);
    if (wallet.balance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'DEBIT',
        reason: `Used for ${type}${referenceId ? ` - ${referenceId}` : ''}`,
      },
    });

    return updatedWallet;
  },

  // ─── Top Up Wallet ───────────────────────────────────────────────────────────
  async topUpWallet(userId: string, amount: number) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        type: 'CREDIT',
        reason: 'Wallet top-up',
      },
    });

    return updatedWallet;
  },

  // ─── Credit Wallet for Approved Bill ────────────────────────────────────────
  async creditForBill(userId: string, billAmount: number, billType: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (!subscription) return null;

    const creditRule = await prisma.creditRule.findFirst({
      where: { planId: subscription.planId, billType: billType as any, isActive: true },
    });

    if (!creditRule) return null;

    const creditAmount = Math.min(
      (billAmount * creditRule.percentage) / 100,
      creditRule.maxPerBill || Infinity
    );

    if (creditAmount <= 0) return null;

    const updatedWallet = await this.addWalletCredits({
      userId,
      amount: creditAmount,
      reason: `Cashback for ${billType} bill`,
    });

    return { creditAmount, newBalance: updatedWallet.balance };
  },

  // ─── Get Benefits ────────────────────────────────────────────────────────────
  async getBenefits(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    const familyCount = await prisma.familyMember.count({ where: { userId } });

    if (!subscription) {
      return {
        subscription: null,
        planBenefits: [],
        usageStats: {
          consultationsUsed: 0,
          consultationsTotal: 0,
          walletCredits: wallet?.balance || 0,
          familyMembersAdded: familyCount,
          familyMembersLimit: 0,
        },
      };
    }

    const plan = subscription.plan;
    const planFeatures = plan.features as any || {};
    const planMedical = plan.medical as any || {};

    return {
      subscription,
      planBenefits: this.getPlanBenefitsList(plan),
      usageStats: {
        consultationsUsed: plan.freeVisits - subscription.freeVisitsRemaining,
        consultationsTotal: plan.freeVisits,
        walletCredits: wallet?.balance || 0,
        familyMembersAdded: familyCount,
        familyMembersLimit: plan.maxAdults + plan.maxChildren,
      },
    };
  },

  // ─── Helper: Get Plan Benefits List ─────────────────────────────────────────
  getPlanBenefitsList(plan: any) {
    const benefits = [];
    const planFeatures = plan.features || {};
    const planMedical = plan.medical || {};
    const planExtra = plan.extraFeatures || {};

    if (plan.freeVisits > 0) {
      benefits.push(`${plan.freeVisits} Free Doctor Consultations/month`);
    }
    if (planMedical.bloodTestsDiscount > 0) {
      benefits.push(`${planMedical.bloodTestsDiscount}% Off on Lab Tests`);
    }
    if (planMedical.diagnosticsDiscount > 0) {
      benefits.push(`${planMedical.diagnosticsDiscount}% Off on Diagnostics`);
    }
    if (planFeatures.priorityLine) {
      benefits.push('Priority Booking Line');
    }
    if (planFeatures.claimTracking) {
      benefits.push('Track Claims Online');
    }
    if (plan.accidentalCoverage?.enabled) {
      benefits.push(`Accidental Coverage up to ₹${plan.accidentalCoverage.maxAmount?.toLocaleString()}`);
    }
    if (planExtra.aiSupport) {
      benefits.push('24/7 AI Health Assistant');
    }
    if (planExtra.reminders) {
      benefits.push('Appointment Reminders');
    }

    return benefits;
  },
};
