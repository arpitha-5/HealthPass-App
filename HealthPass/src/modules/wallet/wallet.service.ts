import prisma from '../../lib/prisma';
import { AppError } from '../../utils/AppError';

export const walletService = {
  async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
        include: { transactions: { take: 20 } },
      });
    }
    return wallet;
  },

  async redeemCredits(userId: string, amount: number, reason: string) {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new AppError('Wallet not found', 404);
    if (wallet.balance < amount) throw new AppError('Insufficient wallet balance', 400);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: amount } },
    });
    await prisma.walletTransaction.create({
      data: { walletId: wallet.id, amount, type: 'DEBIT', reason },
    });

    return { message: 'Credits redeemed', newBalance: wallet.balance - amount };
  },
};
