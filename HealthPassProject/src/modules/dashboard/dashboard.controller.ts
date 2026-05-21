import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.getDashboard(req.user!.id);
    res.status(200).json({ success: true, data });
  }),
};
