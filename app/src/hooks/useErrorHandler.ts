/**
 * Error Handler Hook
 * 
 * Provides centralized error handling with user-friendly messages and toast notifications
 */

import { useCallback } from 'react';
import { useToast } from '../contexts/common/Toast';
import { 
  getUserFriendlyErrorMessage, 
  getErrorDetails,
  isAuthError,
  isNetworkError,
  formatErrorForDisplay 
} from '../config/errorMessages';

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  onAuthError?: () => void;
  onNetworkError?: () => void;
}

export interface UseErrorHandlerReturn {
  handleError: (error: any, customMessage?: string) => void;
  handleApiError: (error: any, context?: string) => void;
  handleValidationError: (error: any) => Record<string, string>;
  clearError: () => void;
}

/**
 * Custom hook for error handling
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const {
    showToast = true,
    onAuthError,
    onNetworkError,
  } = options;

  const toast = useToast();

  /**
   * Handle generic errors
   */
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorDetails = getErrorDetails(error);

    if (showToast) {
      const message = customMessage || errorDetails.message;
      toast.showError(message);
    }

    if (isAuthError(error) && onAuthError) {
      onAuthError();
    }

    if (isNetworkError(error) && onNetworkError) {
      onNetworkError();
    }
  }, [showToast, toast, onAuthError, onNetworkError]);

  /**
   * Handle API errors with context
   */
  const handleApiError = useCallback((error: any, context?: string) => {
    const formattedError = formatErrorForDisplay(error);

    if (showToast) {
      const severity = formattedError.severity;
      const message = context 
        ? `${context}: ${formattedError.message}`
        : formattedError.message;
      
      switch (severity) {
        case 'error':
          toast.showError(message);
          break;
        case 'warning':
          toast.showWarning(message);
          break;
        case 'info':
          toast.showInfo(message);
          break;
      }
    }

    if (isAuthError(error) && onAuthError) {
      onAuthError();
    }

    if (isNetworkError(error) && onNetworkError) {
      onNetworkError();
    }
  }, [showToast, toast, onAuthError, onNetworkError]);

  /**
   * Handle validation errors and return field errors
   */
  const handleValidationError = useCallback((error: any): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};

    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
      error.response.data.detail.forEach((err: any) => {
        const field = err.loc ? err.loc[err.loc.length - 1] : 'general';
        const message = err.msg || 'Invalid value';
        fieldErrors[field] = message;
      });

      if (showToast) {
        const errorCount = Object.keys(fieldErrors).length;
        toast.showWarning(
          `Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`
        );
      }
    } else {
      const message = getUserFriendlyErrorMessage(error);
      fieldErrors.general = message;

      if (showToast) {
        toast.showWarning(message);
      }
    }

    return fieldErrors;
  }, [showToast, toast]);

  /**
   * Clear error state (for manual error clearing)
   */
  const clearError = useCallback(() => {}, []);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    clearError,
  };
}

export default useErrorHandler;
