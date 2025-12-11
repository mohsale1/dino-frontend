/**
 * Common components index
 * Centralized exports for all common/shared components
 */

export { default as AppInitializer } from './AppInitializer';
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as Layout, default } from './Layout';
export { default as ThemeToggle } from './ThemeToggle';
export { default as NotificationCenter } from './NotificationCenter';
export { default as DateRangePicker } from './DateRangePicker';
export { default as PaginationControl, usePagination } from './PaginationControl';
export type { DateRange, DateFilterPreset } from './DateRangePicker';
export type { PaginationState } from './PaginationControl';

// Re-export from existing common folder
export * from '../common/FeatureFlag';
export * from '../common/PermissionWrapper';
export * from '../common/VenueAssignmentCheck';
export * from '../common/WorkspaceErrorBoundary';