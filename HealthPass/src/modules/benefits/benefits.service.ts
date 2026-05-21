import prisma from '../../lib/prisma';

export const benefitsService = {
  async getBenefits(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (!subscription) {
      return { active: false, message: 'No active subscription found' };
    }

    const [wallet, _appointments] = await Promise.all([
      prisma.wallet.findUnique({ where: { userId } }),
      prisma.appointment.count({ where: { userId, status: 'COMPLETED', freeVisitDeducted: true } }),
    ]);

    const plan = subscription.plan;
    const features = plan.features as Record<string, unknown>;

    return {
      active: true,
      plan: plan.displayName,
      validUntil: subscription.endDate,
      benefits: {
        freeVisits: {
          total: plan.freeVisits,
          used: plan.freeVisits - subscription.freeVisitsRemaining,
          remaining: subscription.freeVisitsRemaining,
        },
        walletCredits: {
          balance: wallet?.balance ?? 0,
          currency: 'INR',
        },
        features,
      },
    };
  },
};
