/**
 * Authentication Components Index
 * Centralized exports for all authentication-related components
 */

export { default as ProtectedRoute } from './ProtectedRoute';
export { default as UserProfile } from './UserProfile';
export { default as PermissionSync } from './PermissionSync';
export { usePermissionSync } from './PermissionSync';

// Export usePermissions hook for convenience
export { usePermissions } from '../../hooks/usePermissions';