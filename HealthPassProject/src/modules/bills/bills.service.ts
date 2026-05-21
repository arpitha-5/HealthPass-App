import type { BillType } from '@prisma/client';
import prisma from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import { billsRepository } from './bills.repository';
import type { UploadBillInput } from './bills.schema';

export const billsService = {
  async uploadBill(userId: string, data: UploadBillInput) {
    // Check active subscription
    const sub = await billsRepository.getActiveSubscription(userId);
    if (!sub) throw new AppError('Active membership required to upload bills', 403);

    // Duplicate check
    const dup = await billsRepository.checkDuplicate(userId, data.fileUrl);
    if (dup) throw new AppError('This bill has already been uploaded', 400);

    // Date range check (bills within last 90 days)
    if (data.billDate) {
      const billDate = new Date(data.billDate);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      if (billDate < ninetyDaysAgo)
        throw new AppError('Bill date is outside the eligible range (90 days)', 400);
    }

    const bill = await billsRepository.createBill(userId, {
      billType: data.billType as BillType,
      fileUrl: data.fileUrl,
      providerName: data.providerName,
      billAmount: data.billAmount,
      billDate: data.billDate ? new Date(data.billDate) : undefined,
      patientName: data.patientName,
    });

    // Notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'BILL_UPLOADED',
        title: 'Bill Submitted',
        body: 'Your bill is under review. Expected within 3 hours.',
      },
    });

    return bill;
  },

  async getUserBills(userId: string) {
    return billsRepository.getUserBills(userId);
  },

  async getBillDetail(userId: string, billId: string) {
    const bill = await billsRepository.findBillById(billId);
    if (!bill) throw new AppError('Bill not found', 404);
    if (bill.userId !== userId) throw new AppError('Unauthorized', 403);
    return bill;
  },

  // Called by admin service — approves bill and credits wallet
  async approveBill(billId: string, adminId: string, creditAmount: number, note?: string) {
    const bill = await billsRepository.findBillById(billId);
    if (!bill) throw new AppError('Bill not found', 404);

    const sub = await billsRepository.getActiveSubscription(bill.userId);
    const rule = sub ? await billsRepository.getCreditRule(sub.planId, bill.billType) : null;

    // Cap credit per-bill if rule exists
    let finalCredit = creditAmount;
    if (rule?.maxPerBill) finalCredit = Math.min(finalCredit, rule.maxPerBill);

    await billsRepository.updateBillStatus(billId, {
      status: 'ADMIN_APPROVED',
      creditAmount: finalCredit,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminNote: note,
    });

    const wallet = await billsRepository.getOrCreateWallet(bill.userId);
    await billsRepository.creditWallet(
      wallet.id,
      finalCredit,
      `Bill credit for ${bill.billType}`,
      rule?.creditExpiryDays ?? undefined
    );

    await prisma.notification.create({
      data: {
        userId: bill.userId,
        type: 'BILL_APPROVED',
        title: 'Bill Approved',
        body: `Your bill has been approved. ₹${finalCredit} credited to your wallet.`,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: 'Bill',
        entityId: billId,
        action: 'ADMIN_APPROVED',
        performedBy: adminId,
        metadata: { creditAmount: finalCredit, note },
      },
    });

    return { message: 'Bill approved and wallet credited', creditAmount: finalCredit };
  },

  async rejectBill(billId: string, adminId: string, reason: string) {
    const bill = await billsRepository.findBillById(billId);
    if (!bill) throw new AppError('Bill not found', 404);

    await billsRepository.updateBillStatus(billId, {
      status: 'REJECTED',
      rejectionReason: reason,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    });

    await prisma.notification.create({
      data: {
        userId: bill.userId,
        type: 'BILL_REJECTED',
        title: 'Bill Rejected',
        body: `Your bill was rejected. Reason: ${reason}`,
      },
    });

    return { message: 'Bill rejected' };
  },

  async requestMoreInfo(billId: string, adminId: string, note: string) {
    const bill = await billsRepository.findBillById(billId);
    if (!bill) throw new AppError('Bill not found', 404);

    await billsRepository.updateBillStatus(billId, {
      status: 'MORE_INFO_REQUESTED',
      adminNote: note,
      reviewedBy: adminId,
    });

    return { message: 'Clarification requested' };
  },

  async getPendingBills() {
    return prisma.bill.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: { user: { select: { name: true, mobile: true } } },
      orderBy: { submittedAt: 'asc' },
    });
  },
};
