/**
 * Standardized Permission Wrapper Component
 *
 * Handles permission-based access control using backend permissions as the
 * single source of truth. No role-based shortcuts or owner bypasses.
 */

import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/common/Auth';
import { RoleName } from '../../types/auth';

// ============================================================================
// PROPS INTERFACE
// ============================================================================

interface PermissionWrapperProps {
  children: React.ReactNode;

  // Permission-based access
  permission?: string;
  permissions?: string[];
  requireAllPermissions?: boolean; // true = ALL required; false = ANY sufficient

  // Role-based access (fallback when no permission prop is provided)
  role?: RoleName;
  roles?: RoleName[];
  requireAllRoles?: boolean; // true = ALL required; false = ANY sufficient

  // Custom permission check (takes precedence over permission/role props)
  customCheck?: () => boolean;

  // Fallback content when access is denied
  fallback?: React.ReactNode;
  showFallback?: boolean;

  // Optional inline permission error display
  showPermissionError?: boolean;
  permissionErrorMessage?: string;

  // Loading state override
  loading?: React.ReactNode;

  // Inverse logic — render children when user LACKS the permission
  inverse?: boolean;

  // Wrapper styling
  className?: string;
  sx?: any;
}

// ============================================================================
// CORE COMPONENT
// ============================================================================

const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  permissions = [],
  requireAllPermissions = false,
  role,
  roles = [],
  requireAllRoles = false,
  customCheck,
  fallback = null,
  showFallback = true,
  showPermissionError = false,
  permissionErrorMessage = "You don't have permission to access this feature.",
  loading = null,
  inverse = false,
  className,
  sx = {},
}) => {
  const { isAuthenticated, loading: authLoading, hasBackendPermission, hasRole } = useAuth();

  if (authLoading) {
    return loading ? <>{loading}</> : null;
  }

  // ---- Determine access ----
  let hasAccess: boolean;

  if (customCheck) {
    // 1. Custom check takes full precedence
    hasAccess = customCheck();
  } else if (permission || permissions.length > 0) {
    // 2. Permission-based check via backend permissions
    if (!isAuthenticated) {
      hasAccess = false;
    } else {
      const allPerms: string[] = [
        ...(permission ? [permission] : []),
        ...permissions,
      ];
      hasAccess = requireAllPermissions
        ? allPerms.every((p) => hasBackendPermission(p))
        : allPerms.some((p) => hasBackendPermission(p));
    }
  } else if (role || roles.length > 0) {
    // 3. Role-based check (only when no permission props are provided)
    if (!isAuthenticated) {
      hasAccess = false;
    } else {
      const allRoles: RoleName[] = [
        ...(role ? [role] : []),
        ...roles,
      ];
      hasAccess = requireAllRoles
        ? allRoles.every((r) => hasRole(r))
        : allRoles.some((r) => hasRole(r));
    }
  } else {
    // 4. No restriction specified — default to open
    hasAccess = true;
  }

  // Apply inverse flag
  const shouldRender = inverse ? !hasAccess : hasAccess;

  // ---- Render ----
  if (!shouldRender) {
    if (showPermissionError) {
      return (
        <Alert severity="warning" sx={{ m: 1 }}>
          <Typography variant="body2">{permissionErrorMessage}</Typography>
        </Alert>
      );
    }
    return showFallback ? <>{fallback}</> : null;
  }

  if (className || Object.keys(sx).length > 0) {
    return (
      <Box className={className} sx={sx}>
        {children}
      </Box>
    );
  }

  return <>{children}</>;
};

export default PermissionWrapper;

// ============================================================================
// PERMISSION-BASED CONVENIENCE COMPONENTS
// Each wires directly to hasBackendPermission via the permission prop.
// ============================================================================

export const CanViewDashboard: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper {...props} permission="dashboard:read" />
);

export const CanManageOrders: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={['orders:read', 'orders:create', 'orders:update']}
    requireAllPermissions={false}
  />
);

export const CanManageMenu: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={[
      'items:read',
      'items:create',
      'items:update',
      'categories:read',
      'categories:create',
      'categories:update',
    ]}
    requireAllPermissions={false}
  />
);

export const CanManageTables: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={['tables:read', 'tables:create', 'tables:update']}
    requireAllPermissions={false}
  />
);

export const CanManageUsers: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={['users:read', 'users:create', 'users:update']}
    requireAllPermissions={false}
  />
);

export const CanManageVenues: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={['organization:read', 'organization:update', 'workspace:manage']}
    requireAllPermissions={false}
  />
);

export const CanViewSettings: React.FC<Omit<PermissionWrapperProps, 'permission' | 'permissions' | 'customCheck'>> = (props) => (
  <PermissionWrapper
    {...props}
    permissions={['workspace:read', 'workspace:update', 'workspace:manage']}
    requireAllPermissions={false}
  />
);

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  permissionProps: Omit<PermissionWrapperProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <PermissionWrapper {...permissionProps}>
      <Component {...props} />
    </PermissionWrapper>
  );
  WrappedComponent.displayName = `withPermissions(${Component.displayName ?? Component.name ?? 'Component'})`;
  return WrappedComponent;
};

// ============================================================================
// HOOK — usePermissionCheck
// ============================================================================

export const usePermissionCheck = () => {
  const { user, isAuthenticated, hasBackendPermission, hasRole } = useAuth();

  const checkPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    return hasBackendPermission(permission);
  };

  const checkPermissions = (perms: string[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    return requireAll
      ? perms.every((p) => hasBackendPermission(p))
      : perms.some((p) => hasBackendPermission(p));
  };

  const checkRole = (role: RoleName): boolean => {
    if (!isAuthenticated || !user) return false;
    return hasRole(role);
  };

  const checkRoles = (roles: RoleName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    return requireAll
      ? roles.every((r) => hasRole(r))
      : roles.some((r) => hasRole(r));
  };

  return {
    checkPermission,
    checkPermissions,
    checkRole,
    checkRoles,
    isAuthenticated,
    user,
  };
};
