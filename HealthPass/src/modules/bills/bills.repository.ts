import type { BillType } from '@prisma/client';
import prisma from '../../lib/prisma';

export const billsRepository = {
  async createBill(
    userId: string,
    data: {
      billType: BillType;
      fileUrl: string;
      providerName?: string;
      billAmount?: number;
      billDate?: Date;
      patientName?: string;
    }
  ) {
    return prisma.bill.create({ data: { userId, status: 'SUBMITTED', ...data } });
  },

  async getUserBills(userId: string) {
    return prisma.bill.findMany({ where: { userId }, orderBy: { submittedAt: 'desc' } });
  },

  async findBillById(id: string) {
    return prisma.bill.findUnique({ where: { id } });
  },

  async checkDuplicate(userId: string, fileUrl: string) {
    return prisma.bill.findFirst({ where: { userId, fileUrl } });
  },

  async getActiveSubscription(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });
  },

  async getCreditRule(planId: string, billType: BillType) {
    return prisma.creditRule.findFirst({ where: { planId, billType, isActive: true } });
  },

  async updateBillStatus(
    id: string,
    data: Partial<{
      status: string;
      creditAmount: number;
      rejectionReason: string;
      adminNote: string;
      reviewedBy: string;
      reviewedAt: Date;
    }>
  ) {
    return prisma.bill.update({ where: { id }, data: data as Record<string, unknown> });
  },

  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) wallet = await prisma.wallet.create({ data: { userId, balance: 0 } });
    return wallet;
  },

  async creditWallet(walletId: string, amount: number, reason: string, creditExpiryDays?: number) {
    const expiresAt = creditExpiryDays
      ? new Date(Date.now() + creditExpiryDays * 24 * 60 * 60 * 1000)
      : undefined;

    await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
    });
    await prisma.walletTransaction.create({
      data: { walletId, amount, type: 'CREDIT', reason, expiresAt },
    });
  },
};
