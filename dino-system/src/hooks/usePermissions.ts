/**
 * usePermissions Hook
 * Delegates all permission checks to the Auth context via hasBackendPermission.
 * No role-based logic. No hardcoded booleans.
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';

export interface UsePermissionsReturn {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  canPerformAction: (action: string) => boolean;
  getAccessibleRoutes: () => string[];
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
  const {
    user,
    hasBackendPermission,
    getPermissionsList,
    userPermissions,
  } = useAuth();

  // --- Core permission checks ---

  const hasPermission = useCallback(
    (permission: string): boolean => hasBackendPermission(permission),
    [hasBackendPermission]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => permissions.some((p) => hasBackendPermission(p)),
    [hasBackendPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => permissions.every((p) => hasBackendPermission(p)),
    [hasBackendPermission]
  );

  // --- Route / action / module helpers ---

  const canAccessRoute = useCallback(
    (route: string): boolean => hasBackendPermission(route),
    [hasBackendPermission]
  );

  const canPerformAction = useCallback(
    (action: string): boolean => hasBackendPermission(action),
    [hasBackendPermission]
  );

  const getAccessibleRoutes = useCallback(
    (): string[] => getPermissionsList(),
    [getPermissionsList]
  );

  const getUserActions = useCallback(
    (): string[] => getPermissionsList(),
    [getPermissionsList]
  );

  const getAccessibleModules = useCallback((): any[] => [], []);

  // --- Capability flags (single source of truth: backend permissions) ---

  const canViewDashboard = useMemo(
    () => hasBackendPermission('application.dashboard.read'),
    [hasBackendPermission]
  );

  const canManageUsers = useMemo(
    () => hasBackendPermission('application.users.read'),
    [hasBackendPermission]
  );

  const canManageVenues = useMemo(
    () => hasBackendPermission('application.workspace.update'),
    [hasBackendPermission]
  );

  const canManageOrders = useMemo(
    () => hasBackendPermission('application.orders.read'),
    [hasBackendPermission]
  );

  const canManageMenu = useMemo(
    () => hasBackendPermission('application.items.read'),
    [hasBackendPermission]
  );

  const canManageTables = useMemo(
    () => hasBackendPermission('application.tables.read'),
    [hasBackendPermission]
  );

  const canViewSettings = useMemo(
    () => hasBackendPermission('application.workspace.read'),
    [hasBackendPermission]
  );

  // --- Derived data ---

  const userPermissionsList = useMemo(
    () => getPermissionsList(),
    [getPermissionsList]
  );

  const userRole = useMemo(
    () => (userPermissions as any)?.role?.name ?? null,
    [userPermissions]
  );

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction,
    getAccessibleRoutes,
    getUserActions,
    getAccessibleModules,
    canViewDashboard,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    canViewSettings,
    userPermissions: userPermissionsList,
    userRole,
    permissionsData: userPermissions,
    user,
  };
};

export default usePermissions;