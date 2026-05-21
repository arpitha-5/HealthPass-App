import {
  type BillingCycle,
  type PaymentMethod,
  type PaymentStatus,
  SubscriptionStatus,
} from '@prisma/client';
import prisma from '../../lib/prisma';

export const paymentsRepository = {
  async findPlanById(id: string) {
    return prisma.plan.findUnique({ where: { id } });
  },

  async createSubscription(
    userId: string,
    planId: string,
    billingCycle: BillingCycle,
    freeVisits: number
  ) {
    return prisma.subscription.create({
      data: { userId, planId, billingCycle, freeVisitsRemaining: freeVisits },
      include: { plan: true },
    });
  },

  async findSubscriptionById(id: string) {
    return prisma.subscription.findUnique({ where: { id }, include: { plan: true } });
  },

  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async activateSubscription(id: string, startDate: Date, endDate: Date) {
    return prisma.subscription.update({
      where: { id },
      data: { status: SubscriptionStatus.ACTIVE, startDate, endDate },
    });
  },

  async createPayment(userId: string, subscriptionId: string, amount: number, walletUsed: number) {
    return prisma.payment.create({
      data: { userId, subscriptionId, amount, walletUsed },
    });
  },

  async updatePayment(
    id: string,
    data: Partial<{ status: PaymentStatus; method: PaymentMethod; txnId: string }>
  ) {
    return prisma.payment.update({ where: { id }, data });
  },

  async getWallet(userId: string) {
    return prisma.wallet.findUnique({ where: { userId } });
  },

  async deductWallet(walletId: string, amount: number, _userId: string) {
    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { decrement: amount } },
    });
    await prisma.walletTransaction.create({
      data: { walletId, amount, type: 'DEBIT', reason: 'Used for subscription payment' },
    });
  },

  async getPaymentHistory(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      include: { subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },
};
