import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authService } from './auth.service';
import { AppError } from '../../utils/AppError';

export const authController = {
  sendOtp: asyncHandler(async (req: Request, res: Response) => {
    const { mobile, isSignup } = req.body;
    const result = await authService.sendOtp(mobile, isSignup);
    res.status(200).json({ success: true, data: result });
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const { mobile, otp } = req.body;
    const result = await authService.verifyOtp(mobile, otp);
    res.status(200).json({ success: true, data: result });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokens(refreshToken);
    res.status(200).json({ success: true, data: result });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError('User not authenticated', 401);
    }
    const result = await authService.logout(req.user.id);
    res.status(200).json({ success: true, data: result });
  }),
};
