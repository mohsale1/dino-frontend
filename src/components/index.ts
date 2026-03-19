/**
 * Components index
 * Centralized exports for all components organized by category
 */

// Authentication components
export * from './auth';

// Common components
export * from './common';

// UI components
export * from './ui';

// Layout components
export * from './layout';

// Dialog components
export * from './dialogs';

// Dashboard components
export { UnifiedDashboard } from './dashboards';

// Error components (selective exports to avoid conflicts)
export {
  GenericErrorPage,
  GlobalErrorBoundary,
} from './errors';

// Home page components
export * from './home';