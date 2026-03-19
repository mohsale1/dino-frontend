/**
 * Error Types
 * 
 * Error handling types and error code constants.
 */

export interface ApiError {
  success: false;
  error: string;
  error_code: string;
  details?: {
    field?: string;
    message?: string;
  };
  timestamp: string;
}

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  VENUE_CLOSED: 'VENUE_CLOSED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  INVALID_QR_CODE: 'INVALID_QR_CODE',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];