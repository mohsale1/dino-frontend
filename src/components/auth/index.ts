/**
 * Authentication Components Index
 * Centralized exports for all authentication-related components
 */

export { default as ProtectedRoute } from './ProtectedRoute';
export { default as UserProfile } from './UserProfile';
export { default as PermissionSync } from './PermissionSync';
export { default as DynamicRoute } from './DynamicRoute';
export { default as PermissionGate } from './PermissionGate';
export { default as RoleBasedComponent } from './RoleBasedComponent';
export { default as UserPermissions } from './UserPermissions';
export { default as PasswordStrengthIndicator } from './PasswordStrengthIndicator';
export { default as PasswordUpdateDialog } from './PasswordUpdateDialog';

// Export usePermissions hook for convenience
export { usePermissions } from '../../hooks/usePermissions';