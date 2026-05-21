/**
 * apiError – operational error with an HTTP status code.
 * Throw this anywhere; the global errorHandler will catch it.
 */
export class apiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, apiError);
    }

    Object.setPrototypeOf(this, apiError.prototype);
  }
}
