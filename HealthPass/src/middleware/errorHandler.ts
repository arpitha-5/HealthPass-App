import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * AppError type guard — checks if err is our operational AppError.
 * Avoids circular import by using duck-typing instead of instanceof.
 */
function isAppError(
  err: unknown
): err is { message: string; statusCode: number; isOperational: boolean } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    'isOperational' in err &&
    (err as { isOperational: boolean }).isOperational === true
  );
}

/**
 * Global error handler – registered as the LAST middleware in server.ts.
 * Handles AppError (operational), ZodError (validation), and unexpected errors.
 */
export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  // Operational AppError (duck-typed to avoid circular imports)
  if (isAppError(err)) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown / programming error
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled error:', err);
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
