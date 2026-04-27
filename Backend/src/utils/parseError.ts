// Centralized Error Parsing Utility
// Responsibilities include normalizing various error formats into a standard object
// Provides type-safe extraction of status codes and descriptive error messages
// Ensures consistent error reporting across the entire backend infrastructure
import { ParsedError } from '../types/index.js';

// Transforms unknown error types into a structured ParsedError object
export const parseError = (error: unknown): ParsedError => {
  // Define default values for unexpected or malformed error objects
  let status = 500;
  let message = 'Internal server error';

  // Validate that the error is a non-null object before attempting property access
  if (error !== null && typeof error === 'object') {
    // Safely extract numeric status code if present on the error object
    if ('status' in error && typeof (error as { status: unknown }).status === 'number') {
      status = (error as { status: number }).status;
    }

    // Safely extract string message if present on the error object
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      message = (error as { message: string }).message;
    }
  }

  // Return the normalized error structure for API responses
  return { status, message };
};
