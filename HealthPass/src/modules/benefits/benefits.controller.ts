import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { benefitsService } from './benefits.service';

export const benefitsController = {
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await benefitsService.getBenefits(req.user!.id);
    res.status(200).json({ success: true, data });
  }),
};
