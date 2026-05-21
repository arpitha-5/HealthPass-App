/**
 * AppError – operational error with an HTTP status code.
 * Throw this anywhere; the global errorHandler will catch it.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Backwards-compat alias (biome will flag — remove once all files updated)
export { AppError as apiError };
