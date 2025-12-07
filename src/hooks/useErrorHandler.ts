/**
 * Error Handler Hook
 * 
 * Provides centralized error handling with user-friendly messages and toast notifications
 */

import { useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { 
  getUserFriendlyErrorMessage, 
  getErrorDetails,
  isAuthError,
  isNetworkError,
  formatErrorForDisplay 
} from '../utils/errorMessages';

export interface UseErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
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
    logError = true,
    onAuthError,
    onNetworkError,
  } = options;

  const toast = useToast();

  /**
   * Handle generic errors
   */
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorDetails = getErrorDetails(error);
    
    // Log error if enabled
    if (logError) {    }

    // Show toast notification if enabled
    if (showToast) {
      const message = customMessage || errorDetails.message;
      toast.showError(message);
    }

    // Handle specific error types
    if (isAuthError(error) && onAuthError) {
      onAuthError();
    }

    if (isNetworkError(error) && onNetworkError) {
      onNetworkError();
    }
  }, [showToast, logError, toast, onAuthError, onNetworkError]);

  /**
   * Handle API errors with context
   */
  const handleApiError = useCallback((error: any, context?: string) => {
    const errorDetails = getErrorDetails(error);
    const formattedError = formatErrorForDisplay(error);
    
    // Log error with context
    if (logError) {    }

    // Show toast with formatted message
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

    // Handle specific error types
    if (isAuthError(error) && onAuthError) {
      onAuthError();
    }

    if (isNetworkError(error) && onNetworkError) {
      onNetworkError();
    }
  }, [showToast, logError, toast, onAuthError, onNetworkError]);

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

      // Log validation errors
      if (logError) {      }

      // Show toast for validation errors
      if (showToast) {
        const errorCount = Object.keys(fieldErrors).length;
        toast.showWarning(
          `Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''}`
        );
      }
    } else {
      // Generic validation error
      const message = getUserFriendlyErrorMessage(error);
      fieldErrors.general = message;

      if (showToast) {
        toast.showWarning(message);
      }
    }

    return fieldErrors;
  }, [showToast, logError, toast]);

  /**
   * Clear error state (for manual error clearing)
   */
  const clearError = useCallback(() => {
    // This is a placeholder for future error state management
    // Currently, toasts auto-dismiss, so no action needed
  }, []);

  return {
    handleError,
    handleApiError,
    handleValidationError,
    clearError,
  };
}

export default useErrorHandler;
