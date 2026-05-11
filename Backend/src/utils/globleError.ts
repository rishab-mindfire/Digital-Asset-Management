/**
 * Custom operational error class to standardize application failures.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    // Restore prototype chain to fix 'instanceof' checks in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Universal error processor to ensure all failures follow the AppError format.
 */
export const handleGlobalError = (error: unknown): never => {
  // Prevent double-wrapping if error is already an AppError
  if (error instanceof AppError) {
    throw error;
  }

  // Convert standard native Errors to AppError with default 500 status
  if (error instanceof Error) {
    throw new AppError(error.message, 500);
  }

  // Fallback for edge cases where a non-Error object is thrown
  throw new AppError('An unexpected error occurred', 500);
};
