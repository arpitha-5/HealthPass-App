import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { plansService } from './plans.service';
import { subscriptionService } from '../subscription/subscription.service';

export const plansController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const plans = await plansService.getAllPlans();
    res.status(200).json({ success: true, plans });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const plan = await plansService.getPlanById(String(req.params.id));
    res.status(200).json({ success: true, plan });
  }),

  subscribe: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { planId } = req.body;

    const subscription = await subscriptionService.createSubscription(userId, planId);
    res.status(201).json({ success: true, subscription });
  }),

  cancelSubscription: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const subscription = await subscriptionService.cancelSubscription(userId);
    res.status(200).json({ success: true, subscription });
  }),
};
