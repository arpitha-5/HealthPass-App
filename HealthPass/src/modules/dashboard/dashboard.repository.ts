import prisma from '../../lib/prisma';

export const dashboardRepository = {
  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getFamilyCount(userId: string) {
    return prisma.familyMember.count({ where: { userId } });
  },

  async getWallet(userId: string) {
    return prisma.wallet.findUnique({ where: { userId } });
  },

  async getInsurances(userId: string) {
    return prisma.insurance.findMany({ where: { userId } });
  },

  async getUpcomingAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId, status: 'BOOKED', slot: { date: { gte: new Date() } } },
      include: { hospital: true, doctor: true, slot: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getNearbyHospitals(city: string) {
    return prisma.hospital.findMany({ where: { city, isActive: true }, take: 5 });
  },
};
