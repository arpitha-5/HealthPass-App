import prisma from '../../lib/prisma';

export const plansRepository = {
  async findAllActive() {
    return prisma.plan.findMany({ where: { isActive: true } });
  },

  async findById(id: string) {
    return prisma.plan.findUnique({ where: { id } });
  },

  async findByName(name: 'BASIC' | 'ADVANCED' | 'ENHANCED') {
    return prisma.plan.findUnique({ where: { name } });
  },
};
