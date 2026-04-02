/**
 * UI Components Barrel Export
 * Single entry point for all UI components
 */

// ===================================================================
// ATOMS - Basic building blocks
// ===================================================================

// Button Components
export { Button, default as ButtonComponent } from './Button';

// Card Components  
export { 
  Card, 
  ContentCard,
  MediaCard,
  ProfileCard,
  StatsCard,
  default as CardComponent 
} from './Card';

// Loading Components
export { 
  LoadingSpinner, 
  PageLoader, 
  ContentLoader, 
  InlineLoader,
  default as LoadingSpinnerComponent 
} from './LoadingSpinner';

// Loading States & Skeletons
export {
  TableLoadingSkeleton,
  CardLoadingSkeleton,
  PageLoadingSkeleton,
  InlineLoader as LoadingStatesInlineLoader,
  FullPageLoader,
  RetryLoader,
  EmptyState,
  SmartLoading,
  EnhancedFullPageLoader,
  default as LoadingStates
} from './LoadingStates';

// Logo Component
export { default as DinoLogo } from './DinoLogo';

// Form Components
export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

// Navigation Components
export { Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';
export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

// Data Display Components
export { DataGrid } from './DataGrid';
export type { DataGridProps } from './DataGrid';

// Layout Components
export { PageContainer } from './PageContainer';
export type { PageContainerProps } from './PageContainer';

// Input Components
export { SearchField } from './SearchField';
export type { SearchFieldProps } from './SearchField';

// ===================================================================
// MOLECULES - Component combinations
// ===================================================================

// Animated Components
export { default as AnimatedCounter } from './AnimatedCounter';

// Stats Components
export { default as StatsCards } from './StatsCards';

// ===================================================================
// LEGACY EXPORTS (for backward compatibility)
// ===================================================================

export { Button as StandardButton } from './Button';
export { Card as StandardCard } from './Card';

// Page Transition Loader
export { PageTransitionLoader, usePageTransition } from './PageTransitionLoader';