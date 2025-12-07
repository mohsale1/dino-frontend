/**
 * User-Friendly Error Messages
 * 
 * Converts technical error messages into user-friendly messages
 */

export interface ErrorDetails {
  code?: string;
  message: string;
  technicalMessage?: string;
  field?: string;
}

/**
 * Error message mappings for common error codes
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'The request took too long. Please try again.',
  
  // Authentication errors
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  
  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  REQUIRED_FIELD: 'This field is required.',
  
  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  ALREADY_EXISTS: 'This item already exists.',
  CONFLICT: 'This action conflicts with existing data.',
  
  // Server errors
  INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action.',
  INVALID_OPERATION: 'This operation is not allowed.',
  RESOURCE_LOCKED: 'This resource is currently locked. Please try again later.',
  
  // Order errors
  ORDER_NOT_FOUND: 'Order not found. Please check the order ID and try again.',
  INVALID_ORDER_STATUS: 'Cannot perform this action on an order with this status.',
  VENUE_CLOSED: 'This venue is currently closed and not accepting orders.',
  TABLE_UNAVAILABLE: 'This table is not available for orders.',
  
  // Menu errors
  MENU_ITEM_UNAVAILABLE: 'This menu item is currently unavailable.',
  INVALID_QUANTITY: 'Please enter a valid quantity.',
  
  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed. Please try again or use a different payment method.',
  INVALID_PAYMENT_METHOD: 'The selected payment method is not valid.',
  
  // File upload errors
  FILE_TOO_LARGE: 'The file is too large. Please upload a smaller file.',
  INVALID_FILE_TYPE: 'This file type is not supported.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
};

/**
 * HTTP status code to error code mapping
 */
const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'SERVICE_UNAVAILABLE',
  503: 'SERVICE_UNAVAILABLE',
  504: 'TIMEOUT_ERROR',
};

/**
 * Get user-friendly error message from error object
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // If error is already a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // Extract error code
  let errorCode: string | undefined;
  
  if (error.code) {
    errorCode = error.code;
  } else if (error.response?.status) {
    errorCode = HTTP_STATUS_TO_ERROR_CODE[error.response.status];
  }
  
  // Get user-friendly message from error code
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }
  
  // Try to extract message from error object
  if (error.message) {
    // Check if message contains technical jargon
    if (isUserFriendlyMessage(error.message)) {
      return error.message;
    }
  }
  
  // Try to extract from response data
  if (error.response?.data) {
    const data = error.response.data;
    
    if (typeof data === 'string') {
      return isUserFriendlyMessage(data) ? data : 'An error occurred. Please try again.';
    }
    
    if (data.message && isUserFriendlyMessage(data.message)) {
      return data.message;
    }
    
    if (data.detail) {
      if (typeof data.detail === 'string' && isUserFriendlyMessage(data.detail)) {
        return data.detail;
      }
      
      // Handle Pydantic validation errors
      if (Array.isArray(data.detail)) {
        const fieldErrors = data.detail.map((err: any) => {
          const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
          const message = err.msg || 'Invalid value';
          return `${formatFieldName(field)}: ${message}`;
        });
        return fieldErrors.join('. ');
      }
    }
  }
  
  // Default fallback message
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Check if a message is user-friendly (doesn't contain technical jargon)
 */
function isUserFriendlyMessage(message: string): boolean {
  const technicalTerms = [
    'undefined',
    'null',
    'NaN',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'stack trace',
    'at Object',
    'at Function',
    'Promise',
    'async',
    'await',
  ];
  
  const lowerMessage = message.toLowerCase();
  return !technicalTerms.some(term => lowerMessage.includes(term.toLowerCase()));
}

/**
 * Format field name for display (convert snake_case to Title Case)
 */
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Get error details for logging and debugging
 */
export function getErrorDetails(error: any): ErrorDetails {
  return {
    code: error.code || error.response?.status?.toString(),
    message: getUserFriendlyErrorMessage(error),
    technicalMessage: error.message || error.toString(),
    field: error.response?.data?.field,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    !error.response ||
    error.code === 'NETWORK_ERROR' ||
    error.message?.includes('Network Error') ||
    error.message?.includes('ERR_NETWORK')
  );
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: any): boolean {
  return (
    error.response?.status === 401 ||
    error.code === 'UNAUTHORIZED' ||
    error.code === 'TOKEN_EXPIRED'
  );
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: any): boolean {
  return (
    error.response?.status === 400 ||
    error.response?.status === 422 ||
    error.code === 'VALIDATION_ERROR'
  );
}

/**
 * Get validation errors from error response
 */
export function getValidationErrors(error: any): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
    error.response.data.detail.forEach((err: any) => {
      const field = err.loc ? err.loc[err.loc.length - 1] : 'general';
      const message = err.msg || 'Invalid value';
      errors[field] = message;
    });
  }
  
  return errors;
}

/**
 * Format error for display in UI
 */
export function formatErrorForDisplay(error: any): {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
} {
  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message: getUserFriendlyErrorMessage(error),
      severity: 'error',
    };
  }
  
  if (isAuthError(error)) {
    return {
      title: 'Authentication Required',
      message: getUserFriendlyErrorMessage(error),
      severity: 'warning',
    };
  }
  
  if (isValidationError(error)) {
    return {
      title: 'Validation Error',
      message: getUserFriendlyErrorMessage(error),
      severity: 'warning',
    };
  }
  
  return {
    title: 'Error',
    message: getUserFriendlyErrorMessage(error),
    severity: 'error',
  };
}
