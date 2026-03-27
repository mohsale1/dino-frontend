/**
 * Error Components Barrel Export
 * 
 * Centralized export for all error-related components
 * Organized into boundaries and pages
 */

import React from 'react';
import GenericErrorPage from './pages/GenericErrorPage';

// ============================================================================
// ERROR BOUNDARIES
// ============================================================================

/**
 * Global Error Boundary - Catches JavaScript errors anywhere in the app
 */
export { default as GlobalErrorBoundary } from './boundaries/GlobalErrorBoundary';

/**
 * Error Boundary - Alias for GlobalErrorBoundary
 */
export { default as ErrorBoundary } from './boundaries/GlobalErrorBoundary';

/**
 * Workspace Error Boundary - Validates workspace context
 */
export { default as WorkspaceErrorBoundary } from './boundaries/WorkspaceErrorBoundary';

// ============================================================================
// ERROR PAGES
// ============================================================================

/**
 * Generic Error Page - Main unified error page component
 */
export { default as GenericErrorPage } from './pages/GenericErrorPage';
export type { ErrorType } from './pages/GenericErrorPage';

// ============================================================================
// CONVENIENCE ERROR PAGE EXPORTS
// ============================================================================

/**
 * 404 Not Found Page
 */
export const NotFoundPage: React.FC<{
  title?: string;
  message?: string;
}> = (props) => React.createElement(GenericErrorPage, { type: 'not-found', ...props });

/**
 * 500 Server Error Page
 */
export const ServerErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { type: 'server-error', ...props });

/**
 * Network Error Page
 */
export const NetworkErrorPage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { type: 'network-error', ...props });

/**
 * Venue Not Accepting Orders Page
 */
export const VenueNotAcceptingOrdersPage: React.FC<{
  venueName?: string;
  venueStatus?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ venueName, venueStatus, message, ...props }) => 
  React.createElement(GenericErrorPage, { 
    type: 'venue-error',
    title: 'Venue Not Accepting Orders',
    message: message || `${venueName || 'This venue'} is currently not accepting orders.`,
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
}> = ({ venueName, venueStatus, message, ...props }) => 
  React.createElement(GenericErrorPage, { 
    type: 'venue-error',
    title: 'Venue Closed',
    message: message || `${venueName || 'This venue'} is currently closed.`,
    ...props 
  });

/**
 * No Venue Found Page
 */
export const NoVenuePage: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = (props) => React.createElement(GenericErrorPage, { 
  type: 'venue-error',
  title: props.title || 'No Venue Found',
  message: props.message || 'Unable to find the requested venue.',
  ...props 
});

/**
 * No User Found Page
 */
export const NoUserPage: React.FC<{
  title?: string;
  message?: string;
}> = (props) => React.createElement(GenericErrorPage, { 
  type: 'unauthorized',
  title: props.title || 'User Not Found',
  message: props.message || 'Unable to find user information. Please log in again.',
  ...props 
});

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