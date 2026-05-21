import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { subscriptionService } from './subscription.service';

export const subscriptionController = {
  // Get current user's subscription
  getMySubscription: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const subscription = await subscriptionService.getUserSubscription(userId);
    res.status(200).json({ success: true, subscription });
  }),

  // Subscribe to a plan
  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { planId, billingCycle } = req.body;

    const subscription = await subscriptionService.createSubscription({
      userId,
      planId,
      billingCycle,
    });

    res.status(201).json({
      success: true,
      subscription,
      message: 'Successfully subscribed to plan',
    });
  }),

  // Cancel subscription
  cancel: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const subscription = await subscriptionService.cancelSubscription(userId);
    res.status(200).json({ success: true, subscription });
  }),

  // Get wallet with transactions
  getWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const wallet = await subscriptionService.getWallet(userId);
    res.status(200).json({
      success: true,
      wallet,
      transactions: wallet.transactions,
    });
  }),

  // Get wallet balance only
  getWalletBalance: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const wallet = await subscriptionService.getWallet(userId);
    res.status(200).json({
      success: true,
      wallet: { balance: wallet.balance },
    });
  }),

  // Apply wallet credits (deduct during payment)
  applyWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { amount, type, referenceId } = req.body;

    const wallet = await subscriptionService.applyWalletCredits({
      userId,
      amount,
      type,
      referenceId,
    });

    res.status(200).json({
      success: true,
      wallet,
      message: 'Wallet credits applied successfully',
    });
  }),

  // Top up wallet
  topUpWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!amount || amount < 100) {
      res.status(400).json({ success: false, message: 'Minimum top-up amount is ₹100' });
      return;
    }

    const wallet = await subscriptionService.topUpWallet(userId, amount);

    res.status(200).json({
      success: true,
      wallet,
      message: 'Wallet topped up successfully',
    });
  }),

  // Credit wallet for approved bill
  creditForBill: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { billAmount, billType } = req.body;

    const result = await subscriptionService.creditForBill(userId, billAmount, billType);

    if (!result) {
      res.status(200).json({
        success: true,
        credited: false,
        message: 'No cashback applicable for this bill type',
      });
      return;
    }

    res.status(200).json({
      success: true,
      credited: true,
      creditAmount: result.creditAmount,
      newBalance: result.newBalance,
    });
  }),

  // Get benefits
  getBenefits: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const benefits = await subscriptionService.getBenefits(userId);
    res.status(200).json({ success: true, ...benefits });
  }),
};
