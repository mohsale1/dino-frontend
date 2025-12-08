/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 * Uses stored permissions from localStorage (no hardcoded permissions)
 */

import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';

export interface PermissionGuardProps {
  children: ReactNode;
  
  // Permission-based guards
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
  
  // Role-based guards
  role?: string;
  roles?: string[];
  
  // Action-based guards
  action?: string;
  
  // Route-based guards
  route?: string;
  
  // Fallback content when permission is denied
  fallback?: ReactNode;
  
  // Inverse logic - render when permission is NOT present
  inverse?: boolean;
}

/**
 * PermissionGuard - Conditionally render content based on permissions
 * 
 * Examples:
 * <PermissionGuard permission="menu.read">
 *   <MenuComponent />
 * </PermissionGuard>
 * 
 * <PermissionGuard permissions={["order.read", "order.update"]} requireAll>
 *   <OrderEditor />
 * </PermissionGuard>
 * 
 * <PermissionGuard role="admin">
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * <PermissionGuard action="create_order">
 *   <CreateOrderButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  action,
  route,
  fallback = null,
  inverse = false,
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canPerformAction,
    canAccessRoute,
  } = usePermissions();

  // Determine if user has access
  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }
  // Check single role
  else if (role) {
    hasAccess = hasRole(role);
  }
  // Check multiple roles
  else if (roles && roles.length > 0) {
    hasAccess = roles.some(r => hasRole(r));
  }
  // Check action
  else if (action) {
    hasAccess = canPerformAction(action);
  }
  // Check route
  else if (route) {
    hasAccess = canAccessRoute(route);
  }
  // No guards specified - allow access by default
  else {
    hasAccess = true;
  }

  // Apply inverse logic if specified
  if (inverse) {
    hasAccess = !hasAccess;
  }

  // Render children if access is granted, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

/**
 * Higher-order component version of PermissionGuard
 */
export const withPermission = (
  Component: React.ComponentType<any>,
  guardProps: Omit<PermissionGuardProps, 'children'>
) => {
  return (props: any) => (
    <PermissionGuard {...guardProps}>
      <Component {...props} />
    </PermissionGuard>
  );
};

/**
 * Hook version for conditional logic in components
 */
export const usePermissionGuard = (guardProps: Omit<PermissionGuardProps, 'children' | 'fallback'>): boolean => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canPerformAction,
    canAccessRoute,
  } = usePermissions();

  const {
    permission,
    permissions,
    requireAll = false,
    role,
    roles,
    action,
    route,
    inverse = false,
  } = guardProps;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (role) {
    hasAccess = hasRole(role);
  } else if (roles && roles.length > 0) {
    hasAccess = roles.some(r => hasRole(r));
  } else if (action) {
    hasAccess = canPerformAction(action);
  } else if (route) {
    hasAccess = canAccessRoute(route);
  } else {
    hasAccess = true;
  }

  return inverse ? !hasAccess : hasAccess;
};

export default PermissionGuard;