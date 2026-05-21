import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { paymentsService } from './payments.service';

export const paymentsController = {
  createSubscription: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.createSubscription(req.user!.id, req.body);
    res.status(201).json({ success: true, data: result });
  }),

  getActiveSubscription: asyncHandler(async (req: Request, res: Response) => {
    const sub = await paymentsService.getActiveSubscription(req.user!.id);
    res.status(200).json({ success: true, data: sub });
  }),

  confirmPayment: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentsService.confirmPayment(req.user!.id, req.body);
    res.status(200).json({ success: true, data: result });
  }),

  getHistory: asyncHandler(async (req: Request, res: Response) => {
    const history = await paymentsService.getPaymentHistory(req.user!.id);
    res.status(200).json({ success: true, data: history });
  }),
};
