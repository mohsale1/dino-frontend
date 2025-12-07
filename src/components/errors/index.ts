/**
 * Error Components Barrel Export
 * 
 * Centralized export for all error-related components
 */

import React from 'react';
import GenericErrorPage from './GenericErrorPage';

// Main generic error page
export { default as GenericErrorPage } from './GenericErrorPage';
export type { ErrorType } from './GenericErrorPage';

// Standard error page (kept for backward compatibility)
export {
  StandardErrorPage,
  NotFoundErrorPage as StandardNotFoundPage,
  ServerErrorPage as StandardServerErrorPage,
  NetworkErrorPage as StandardNetworkErrorPage,
  AccessDeniedErrorPage,
} from './StandardErrorPage';

// Re-export existing error components for backward compatibility
export { default as GlobalErrorBoundary } from '../ErrorBoundary/GlobalErrorBoundary';
export { default as ErrorBoundary } from '../ErrorBoundary/GlobalErrorBoundary';

// Convenience exports using GenericErrorPage

/**
 * 404 Not Found Page
 */
export const NotFoundPage: React.FC<{
  title?: string;
  message?: string;
}> = (props) => React.createElement(GenericErrorPage, { type: '404', ...props });

/**
 * 500 Server Error Page
 */
export const ServerErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { type: '500', ...props });

/**
 * Network Error Page
 */
export const NetworkErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { type: 'network', ...props });

/**
 * Venue Not Accepting Orders Page
 */
export const VenueNotAcceptingOrdersPage: React.FC<{
  venueName?: string;
  venueStatus?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ venueName, venueStatus, ...props }) => 
  React.createElement(GenericErrorPage, { 
    type: 'venue-not-accepting', 
    context: { venueName, venueStatus },
    ...props 
  });

/**
 * Venue Closed Page
 */
export const VenueClosedPage: React.FC<{
  venueName?: string;
  venueStatus?: string;
  message?: string;
  onRetry?: () => void;
}> = ({ venueName, venueStatus, ...props }) => 
  React.createElement(GenericErrorPage, { 
    type: 'venue-closed', 
    context: { venueName, venueStatus },
    ...props 
  });

/**
 * No Venue Found Page
 */
export const NoVenuePage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { type: 'no-venue', ...props });

/**
 * No User Found Page
 */
export const NoUserPage: React.FC<{
  title?: string;
  message?: string;
}> = (props) => React.createElement(GenericErrorPage, { type: 'no-user', ...props });

/**
 * Access Denied Page
 */
export const AccessDeniedPage: React.FC<{
  title?: string;
  message?: string;
}> = (props) => React.createElement(GenericErrorPage, { type: 'access-denied', ...props });

/**
 * Generic Error Page (for custom errors)
 */
export const ErrorPage: React.FC<{
  title?: string;
  message?: string;
  errorCode?: string | number;
  onRetry?: () => void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showGoHome?: boolean;
}> = (props) => React.createElement(GenericErrorPage, { type: 'generic', ...props });