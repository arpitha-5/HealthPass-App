import type { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

// Extend Express Request with user context
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        mobile: string;
      };
    }
  }
}

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? 'fallback_secret_change_me'
);

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    let payload: Awaited<ReturnType<typeof jwtVerify>>['payload'];
    try {
      const result = await jwtVerify(token, accessSecret);
      payload = result.payload;
    } catch {
      return next(new AppError('Invalid or expired token', 401));
    }

    if (payload.type !== 'access') {
      return next(new AppError('Invalid token type', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, role: true, mobile: true, isBlocked: true },
    });

    if (!user) return next(new AppError('User not found', 401));
    if (user.isBlocked) return next(new AppError('Account is blocked', 403));

    req.user = { id: user.id, role: user.role, mobile: user.mobile };
    next();
  }
);
