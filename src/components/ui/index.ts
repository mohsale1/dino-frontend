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

// Toast Notifications
export {
  ToastContainer,
  useToast,
  type ToastSeverity,
  type ToastMessage
} from './ToastNotification';
export { default as ToastNotification } from './ToastNotification';
export { default as FragmentNavigation } from './FragmentNavigation';

// ===================================================================
// MOLECULES - Component combinations
// ===================================================================

// Animated Components
export { default as AnimatedBackground } from './AnimatedBackground';
export { default as AnimatedCounter } from './AnimatedCounter';

// Stats Components
export { default as StatsCards } from './StatsCards';

// ===================================================================
// LEGACY EXPORTS (for backward compatibility)
// ===================================================================

export { Button as StandardButton } from './Button';
export { Card as StandardCard } from './Card';