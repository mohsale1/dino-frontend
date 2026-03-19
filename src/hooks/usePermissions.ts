/**
 * usePermissions Hook - SIMPLIFIED (Permissions Disabled)
 * All permission checks now return true
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isOwner: boolean;
  isManager: boolean;
  isUser: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isOperator: boolean;
  canAccessRoute: (route: string) => boolean;
  getAccessibleRoutes: () => string[];
  canPerformAction: (action: string) => boolean;
  getUserActions: () => string[];
  getAccessibleModules: () => any[];
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canManageVenues: boolean;
  canManageOrders: boolean;
  canManageMenu: boolean;
  canManageTables: boolean;
  canViewSettings: boolean;
  userPermissions: string[];
  userRole: string | null;
  permissionsData: any;
  user: any;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();

  // All permission checks return true
  const hasPermission = useCallback(() => true, []);
  const hasAnyPermission = useCallback(() => true, []);
  const hasAllPermissions = useCallback(() => true, []);
  const hasRole = useCallback(() => true, []);
  const canAccessRoute = useCallback(() => true, []);
  const canPerformAction = useCallback(() => true, []);
  
  const getAccessibleRoutes = useCallback(() => [], []);
  const getUserActions = useCallback(() => [], []);
  const getAccessibleModules = useCallback(() => [], []);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isOwner: true,
    isManager: true,
    isUser: true,
    isSuperAdmin: true,
    isAdmin: true,
    isOperator: true,
    canAccessRoute,
    getAccessibleRoutes,
    canPerformAction,
    getUserActions,
    getAccessibleModules,
    canViewDashboard: true,
    canManageUsers: true,
    canManageVenues: true,
    canManageOrders: true,
    canManageMenu: true,
    canManageTables: true,
    canViewSettings: true,
    userPermissions: [],
    userRole: null,
    permissionsData: null,
    user,
  };
};

export default usePermissions;