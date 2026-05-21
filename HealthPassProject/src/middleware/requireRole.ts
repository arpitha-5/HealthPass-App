import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

/**
 * requireRole – role-based guard middleware.
 * Usage: router.use(authenticate, requireRole('ADMIN'))
 */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Not authenticated', 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission', 403));
      return;
    }
    next();
  };
