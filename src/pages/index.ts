/**
 * Pages index
 * Centralized exports for all pages organized by category
 */

// Common pages (public/auth)
export * from './common';

// System pages (with prefixes to avoid conflicts)
export { Dashboard as SystemDashboard } from './system';

// Application pages (business)
export { 
  Dashboard as ApplicationDashboard,
  Catalog,
  Locations,
  Orders,
  Users,
  Settings,
} from './application';
