import prisma from '../../lib/prisma';

export const authRepository = {
  async findOtpByMobile(mobile: string) {
    return prisma.otpAttempt.findFirst({
      where: { mobile },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createOtp(mobile: string, hashedCode: string, expiresAt: Date) {
    return prisma.otpAttempt.create({
      data: { mobile, code: hashedCode, expiresAt },
    });
  },

  async incrementOtpAttempts(id: string) {
    return prisma.otpAttempt.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  },

  async blockOtp(id: string, blockedUntil: Date) {
    return prisma.otpAttempt.update({
      where: { id },
      data: { isBlocked: true, blockedUntil },
    });
  },

  async deleteOtpsByMobile(mobile: string) {
    return prisma.otpAttempt.deleteMany({ where: { mobile } });
  },

  async findUserByMobile(mobile: string) {
    return prisma.user.findUnique({ where: { mobile } });
  },

  async createUser(mobile: string) {
    return prisma.user.create({ data: { mobile } });
  },

  async saveRefreshToken(userId: string, refreshToken: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async clearRefreshToken(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },
};
