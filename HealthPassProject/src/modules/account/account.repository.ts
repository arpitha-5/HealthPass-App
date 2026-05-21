import type { Gender } from '@prisma/client';
import prisma from '../../lib/prisma';

export const accountRepository = {
  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      language: string;
      city: string;
      consentAccepted: boolean;
      consentAt: Date;
      referralCode: string;
      isProfileComplete: boolean;
    }>
  ) {
    return prisma.user.update({ where: { id }, data });
  },

  async getFamilyMembers(userId: string) {
    return prisma.familyMember.findMany({ where: { userId } });
  },

  async addFamilyMember(
    userId: string,
    data: { name: string; age: number; gender: Gender; relation: string; mobile?: string }
  ) {
    return prisma.familyMember.create({ data: { userId, ...data } });
  },

  async findFamilyMember(id: string, userId: string) {
    return prisma.familyMember.findFirst({ where: { id, userId } });
  },

  async deleteFamilyMember(id: string) {
    return prisma.familyMember.delete({ where: { id } });
  },

  async countFamilyMembers(userId: string) {
    return prisma.familyMember.count({ where: { userId } });
  },
};
