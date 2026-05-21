import prisma from '../../lib/prisma';

export const appointmentsRepository = {
  async searchHospitals(city?: string, specialty?: string, name?: string) {
    return prisma.hospital.findMany({
      where: {
        isActive: true,
        ...(city && { city }),
        ...(specialty && { specialties: { has: specialty } }),
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
      },
      include: { doctors: true },
    });
  },

  async findHospitalById(id: string) {
    return prisma.hospital.findUnique({
      where: { id },
      include: { doctors: { where: { isActive: true } } },
    });
  },

  async findFamilyMemberById(id: string, userId: string) {
    return prisma.familyMember.findFirst({
      where: { id, userId },
    });
  },

  async getAvailableSlots(hospitalId: string, doctorId?: string, date?: string) {
    return prisma.timeSlot.findMany({
      where: {
        hospitalId,
        isAvailable: true,
        ...(doctorId && { doctorId }),
        ...(date && { date: { gte: new Date(date) } }),
      },
      include: { doctor: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  },

  async findSlotById(id: string) {
    return prisma.timeSlot.findUnique({ where: { id } });
  },

  async markSlotUnavailable(id: string) {
    return prisma.timeSlot.update({ where: { id }, data: { isAvailable: false } });
  },

  async markSlotAvailable(id: string) {
    return prisma.timeSlot.update({ where: { id }, data: { isAvailable: true } });
  },

  async createAppointment(data: {
    userId: string;
    hospitalId: string;
    doctorId: string;
    slotId: string;
    familyMemberId?: string;
    freeVisitDeducted: boolean;
    freeVisitPolicy: 'AT_BOOKING' | 'AT_COMPLETION';
  }) {
    return prisma.appointment.create({
      data,
      include: { hospital: true, doctor: true, slot: true },
    });
  },

  async getAppointmentById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { hospital: true, doctor: true, slot: true },
    });
  },

  async getUserAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId },
      include: { hospital: true, doctor: true, slot: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateAppointmentStatus(
    id: string,
    data: Partial<{
      status: string;
      cancelledAt: Date;
      completedAt: Date;
      cancellationReason: string;
    }>
  ) {
    return prisma.appointment.update({ where: { id }, data: data as Record<string, unknown> });
  },

  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });
  },

  async decrementFreeVisits(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { freeVisitsRemaining: { decrement: 1 } },
    });
  },

  async incrementFreeVisits(subscriptionId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { freeVisitsRemaining: { increment: 1 } },
    });
  },
};
