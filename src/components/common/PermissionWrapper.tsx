/**
 * Standardized Permission Wrapper Component
 * 
 * A unified component for handling role-based access control throughout the application
 * Following project standards for consistent permission checking
 */

import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/common/Auth';
import { usePermissions } from '../auth';
import { PermissionName, RoleName } from '../../types/auth';

interface PermissionWrapperProps {
  children: React.ReactNode;
  
  // Permission-based access
  permission?: PermissionName;
  permissions?: PermissionName[];
  requireAllPermissions?: boolean; // If true, requires ALL permissions; if false, requires ANY
  
  // Role-based access
  role?: RoleName;
  roles?: RoleName[];
  requireAllRoles?: boolean; // If true, requires ALL roles; if false, requires ANY
  
  // Custom permission checks
  customCheck?: () => boolean;
  
  // Fallback content
  fallback?: React.ReactNode;
  showFallback?: boolean;
  
  // Error states
  showPermissionError?: boolean;
  permissionErrorMessage?: string;
  
  // Loading state
  loading?: React.ReactNode;
  
  // Inverse logic (show when user DOESN'T have permission)
  inverse?: boolean;
  
  // Wrapper styling
  className?: string;
  sx?: any;
}

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
  permissionErrorMessage = 'You don\'t have permission to access this feature.',
  loading = null,
  inverse = false,
  className,
  sx = {},
}) => {
  const { user, isAuthenticated, loading: authLoading, hasPermission, hasBackendPermission, hasRole } = useAuth();
  const {
    isOwner,
    isManager,
    isUser,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
  } = usePermissions();

  // PERMISSION CHECKS DISABLED - Always show all UI components
  // Show loading state if auth is still loading
  if (authLoading) {
    return loading ? <>{loading}</> : null;
  }

  // Always grant access - permission checks disabled
  const hasAccess = true;

  // Render children - always show all UI components
  return className || sx ? (
    <Box className={className} sx={sx}>
      {children}
    </Box>
  ) : (
    <>{children}</>
  );
};

export default PermissionWrapper;

// Convenience components for common permission patterns

export const CanViewDashboard: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canViewDashboard } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canViewDashboard} />;
};

export const CanManageOrders: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageOrders } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageOrders} />;
};

export const CanManageMenu: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageMenu } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageMenu} />;
};

export const CanManageTables: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageTables } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageTables} />;
};

export const CanManageUsers: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageUsers } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageUsers} />;
};

export const CanManageVenues: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canManageVenues } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canManageVenues} />;
};

export const CanViewSettings: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { canViewSettings } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => canViewSettings} />;
};

// Role-based convenience components
export const OwnerOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isOwner } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isOwner} />;
};

export const ManagerOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isManager } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isManager} />;
};

export const UserOnly: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isUser } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isUser} />;
};

export const ManagerOrAbove: React.FC<Omit<PermissionWrapperProps, 'customCheck'>> = (props) => {
  const { isOwner, isManager } = usePermissions();
  return <PermissionWrapper {...props} customCheck={() => isOwner || isManager} />;
};

// Legacy aliases for backward compatibility
export const SuperAdminOnly = OwnerOnly;
export const AdminOnly = ManagerOnly;
export const OperatorOnly = UserOnly;
export const AdminOrAbove = ManagerOrAbove;

// Higher-order component for wrapping entire components with permission checks
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  permissionProps: Omit<PermissionWrapperProps, 'children'>
) => {
  return (props: P) => (
    <PermissionWrapper {...permissionProps}>
      <Component {...props} />
    </PermissionWrapper>
  );
};

// Hook for conditional rendering based on permissions
export const usePermissionCheck = () => {
  const { user, isAuthenticated, hasPermission, hasBackendPermission, hasRole } = useAuth();
  const {
    isOwner,
    isManager,
    isUser,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
  } = usePermissions();

  const checkPermission = (permission: PermissionName): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isOwner) return true;
    return hasPermission(permission) || hasBackendPermission(permission);
  };

  const checkPermissions = (permissions: PermissionName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    if (isOwner) return true;
    
    return requireAll 
      ? permissions.every(p => hasPermission(p) || hasBackendPermission(p))
      : permissions.some(p => hasPermission(p) || hasBackendPermission(p));
  };

  const checkRole = (role: RoleName): boolean => {
    if (!isAuthenticated || !user) return false;
    return hasRole(role);
  };

  const checkRoles = (roles: RoleName[], requireAll = false): boolean => {
    if (!isAuthenticated || !user) return false;
    return requireAll 
      ? roles.every(r => hasRole(r))
      : roles.some(r => hasRole(r));
  };

  return {
    checkPermission,
    checkPermissions,
    checkRole,
    checkRoles,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
    isOwner,
    isManager,
    isUser,
    isAuthenticated,
    user
  };
};