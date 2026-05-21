import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { billsService } from './bills.service';

export const billsController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.uploadBill(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.getUserBills(req.user!.id);
    res.status(200).json({ success: true, data });
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const data = await billsService.getBillDetail(req.user!.id, String(req.params.id));
    res.status(200).json({ success: true, data });
  }),
};
