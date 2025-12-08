/**
 * usePermissions Hook
 * Custom hook for permission-based access control
 * Uses stored permissions from localStorage (set during login)
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PermissionRegistry } from '../services/auth/permissionRegistry';
import { StorageManager } from '../utils/storage';
import PermissionService from '../services/auth/permissionService';

export interface UsePermissionsReturn {
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role checks
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isOperator: boolean;
  isSuperAdmin: boolean;
  
  // Route access
  canAccessRoute: (route: string) => boolean;
  getAccessibleRoutes: () => string[];
  
  // Action checks
  canPerformAction: (action: string) => boolean;
  getUserActions: () => string[];
  
  // Module access
  getAccessibleModules: () => any[];
  
  // Specific permission helpers (for backward compatibility)
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageVenues: boolean;
  canManageOrders: boolean;
  canManageMenu: boolean;
  canManageTables: boolean;
  canViewSettings: boolean;
  
  // Raw data
  userPermissions: string[];
  userRole: string | null;
  permissionsData: any;
  user: any;
}

/**
 * Hook to access user permissions and perform permission checks
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { user, userPermissions: contextPermissions } = useAuth();

  // Get permissions from storage (set during login)
  const permissionsData = useMemo(() => {
    return StorageManager.getPermissions();
  }, [contextPermissions]); // Re-compute when context permissions change

  // Extract permission names and role
  const userPermissions = useMemo(() => {
    if (!permissionsData?.permissions) return [];
    return permissionsData.permissions.map((p: any) => p.name || p);
  }, [permissionsData]);

  const userRole = useMemo(() => {
    if (!permissionsData?.role) return null;
    return permissionsData.role.name || null;
  }, [permissionsData]);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) {
      console.log(`[usePermissions] No user, denying permission: ${permission}`);
      return false;
    }
    
    // Ensure we have valid permissions array
    if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
      console.log(`[usePermissions] No permissions array for user, denying: ${permission}`);
      return false;
    }
    
    // STRICT PERMISSION ENFORCEMENT - No superadmin bypass
    // Even superadmins must have explicit permissions

    // Check exact match
    if (userPermissions.includes(permission)) {
      console.log(`[usePermissions] Exact match found for: ${permission}`);
      return true;
    }

    // Check for manage permission (e.g., "menu.manage" grants all menu permissions)
    const [resource] = permission.split('.');
    const managePermission = `${resource}.manage`;
    if (userPermissions.includes(managePermission)) {
      console.log(`[usePermissions] Manage permission found for: ${permission} via ${managePermission}`);
      return true;
    }

    console.log(`[usePermissions] Permission denied: ${permission}`, {
      userPermissions,
      userRole,
    });
    return false;
  }, [user, userPermissions, userRole]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    
    // STRICT PERMISSION ENFORCEMENT - No superadmin bypass
    return permissions.some(permission => hasPermission(permission));
  }, [user, hasPermission]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!user) return false;
    
    // STRICT PERMISSION ENFORCEMENT - No superadmin bypass
    return permissions.every(permission => hasPermission(permission));
  }, [user, hasPermission]);

  // Check if user has a specific role
  const hasRole = useCallback((role: string): boolean => {
    if (!user || !userRole) return false;
    return userRole.toLowerCase() === role.toLowerCase();
  }, [user, userRole]);

  // Role shortcuts
  const isAdmin = useMemo(() => {
    return hasRole('admin') || hasRole('superadmin') || hasRole('super_admin');
  }, [hasRole]);

  const isOperator = useMemo(() => {
    return hasRole('operator');
  }, [hasRole]);

  const isSuperAdmin = useMemo(() => {
    return hasRole('superadmin') || hasRole('super_admin');
  }, [hasRole]);

  // Check if user can access a specific route
  const canAccessRoute = useCallback((route: string): boolean => {
    if (!user) return false;
    
    // STRICT PERMISSION ENFORCEMENT - No superadmin bypass
    return PermissionRegistry.canAccessRoute(userPermissions, route, userRole || undefined);
  }, [user, userPermissions, userRole]);

  // Get all accessible routes
  const getAccessibleRoutes = useCallback((): string[] => {
    if (!user) return [];
    
    return PermissionRegistry.getAccessibleRoutes(userPermissions);
  }, [user, userPermissions]);

  // Check if user can perform a specific action
  const canPerformAction = useCallback((action: string): boolean => {
    if (!user) return false;
    
    // STRICT PERMISSION ENFORCEMENT - No superadmin bypass
    return PermissionRegistry.canPerformAction(userPermissions, action);
  }, [user, userPermissions]);

  // Get all actions user can perform
  const getUserActions = useCallback((): string[] => {
    if (!user) return [];
    
    return PermissionRegistry.getUserActions(userPermissions);
  }, [user, userPermissions]);

  // Get all accessible modules
  const getAccessibleModules = useCallback(() => {
    if (!user) return [];
    
    return PermissionRegistry.getAccessibleModules(userPermissions, userRole || undefined);
  }, [user, userPermissions, userRole]);

  // Specific permission helpers (computed as booleans for backward compatibility)
  const canViewDashboard = useMemo(() => hasPermission('dashboard.read'), [hasPermission]);
  const canManageUsers = useMemo(() => hasPermission('user.update') || hasPermission('user.manage'), [hasPermission]);
  const canManageVenues = useMemo(() => hasPermission('venue.update') || hasPermission('venue.manage'), [hasPermission]);
  const canManageOrders = useMemo(() => hasPermission('order.update') || hasPermission('order.manage'), [hasPermission]);
  const canManageMenu = useMemo(() => hasPermission('menu.update') || hasPermission('menu.manage'), [hasPermission]);
  const canManageTables = useMemo(() => hasPermission('table.update') || hasPermission('table.manage'), [hasPermission]);
  const canViewSettings = useMemo(() => hasPermission('settings.read'), [hasPermission]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAdmin,
    isOperator,
    isSuperAdmin,
    canAccessRoute,
    getAccessibleRoutes,
    canPerformAction,
    getUserActions,
    getAccessibleModules,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
    userPermissions,
    userRole,
    permissionsData,
    user,
  };
};

export default usePermissions;
