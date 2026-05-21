import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { plansService } from './plans.service';

export const plansController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const plans = await plansService.getAllPlans();
    res.status(200).json({ success: true, data: plans });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const plan = await plansService.getPlanById(String(req.params.id));
    res.status(200).json({ success: true, data: plan });
  }),
};
