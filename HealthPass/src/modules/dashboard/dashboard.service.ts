import prisma from '../../lib/prisma';
import { dashboardRepository } from './dashboard.repository';

export const dashboardService = {
  async getDashboard(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const [subscription, familyCount, wallet, insurances, appointments, nearbyHospitals] =
      await Promise.all([
        dashboardRepository.getActiveSubscription(userId),
        dashboardRepository.getFamilyCount(userId),
        dashboardRepository.getWallet(userId),
        dashboardRepository.getInsurances(userId),
        dashboardRepository.getUpcomingAppointments(userId),
        user?.city ? dashboardRepository.getNearbyHospitals(user.city) : Promise.resolve([]),
      ]);

    return {
      user: { name: user?.name, mobile: user?.mobile, city: user?.city },
      membership: subscription
        ? {
            plan: subscription.plan.displayName,
            status: subscription.status,
            validUntil: subscription.endDate,
            freeVisitsRemaining: subscription.freeVisitsRemaining,
          }
        : null,
      familyMembersCount: familyCount,
      wallet: { balance: wallet?.balance ?? 0 },
      linkedInsurances: insurances.length,
      upcomingAppointments: appointments,
      nearbyHospitals,
    };
  },
};
