import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * validate – Zod schema middleware.
 * Validates req.body, req.query, and req.params against the given Zod schema.
 * On failure, ZodError is passed to next() and caught by the global errorHandler.
 */
export const validate = (schema: ZodSchema) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: unknown) {
      next(err);
    }
  });
