import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * asyncHandler – wraps any async Express handler so unhandled
 * rejections are forwarded to next() and caught by the global errorHandler.
 * Define once, use everywhere.
 */
export const asyncHandler =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
