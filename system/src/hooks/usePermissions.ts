/**
 * usePermissions Hook
 * Delegates all permission checks to the Auth context via hasBackendPermission.
 * No role-based logic. No hardcoded booleans.
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';
import { PERMISSIONS } from '../types/auth/permissions';

export interface UsePermissionsReturn {
  // --- Core helpers ---
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  canPerformAction: (action: string) => boolean;
  getAccessibleRoutes: () => string[];
  getUserActions: () => string[];
  getAccessibleModules: () => any[];

  // --- Module-visibility flags (system.*.view) ---
  canViewDashboard: boolean;
  canViewWorkspaces: boolean;
  canViewUsers: boolean;
  canViewRoles: boolean;
  canViewBilling: boolean;
  canViewRegistration: boolean;
  canViewSettings: boolean;

  // --- Workspace action flags ---
  canReadWorkspaces: boolean;
  canCreateWorkspaces: boolean;
  canUpdateWorkspaces: boolean;
  canDeleteWorkspaces: boolean;

  // --- User action flags ---
  canReadUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;

  // --- Role action flags ---
  canReadRoles: boolean;
  canCreateRoles: boolean;
  canUpdateRoles: boolean;
  canDeleteRoles: boolean;

  // --- Billing action flags ---
  canReadBilling: boolean;
  canUpdateBilling: boolean;
  canManageBilling: boolean;

  // --- Registration action flags ---
  canReadRegistration: boolean;
  canCreateRegistration: boolean;
  canDeleteRegistration: boolean;

  // --- Permission action flags ---
  canReadPermissions: boolean;
  canCreatePermissions: boolean;
  canUpdatePermissions: boolean;
  canDeletePermissions: boolean;

  // --- Legacy flags (kept for backward compatibility) ---
  canManageUsers: boolean;
  canManageVenues: boolean;
  canManageOrders: boolean;
  canManageMenu: boolean;
  canManageTables: boolean;

  // --- Derived data ---
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

  // --- Module-visibility flags (system.*.view) ---

  const canViewDashboard = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_DASHBOARD_VIEW),
    [hasBackendPermission]
  );

  const canViewWorkspaces = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW),
    [hasBackendPermission]
  );

  const canViewUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_VIEW),
    [hasBackendPermission]
  );

  const canViewRoles = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_ROLES_VIEW),
    [hasBackendPermission]
  );

  const canViewBilling = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_VIEW),
    [hasBackendPermission]
  );

  const canViewRegistration = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_REGISTRATION_VIEW),
    [hasBackendPermission]
  );

  const canViewSettings = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_SETTINGS_VIEW),
    [hasBackendPermission]
  );

  // --- Workspace action flags ---

  const canReadWorkspaces = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_READ),
    [hasBackendPermission]
  );

  const canCreateWorkspaces = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_CREATE),
    [hasBackendPermission]
  );

  const canUpdateWorkspaces = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteWorkspaces = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_DELETE),
    [hasBackendPermission]
  );

  // --- User action flags ---

  const canReadUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_READ),
    [hasBackendPermission]
  );

  const canCreateUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_DELETE),
    [hasBackendPermission]
  );

  // --- Role action flags ---

  const canReadRoles = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_ROLES_READ),
    [hasBackendPermission]
  );

  const canCreateRoles = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_ROLES_CREATE),
    [hasBackendPermission]
  );

  const canUpdateRoles = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_ROLES_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteRoles = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_ROLES_DELETE),
    [hasBackendPermission]
  );

  // --- Billing action flags ---

  const canReadBilling = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_READ),
    [hasBackendPermission]
  );

  const canUpdateBilling = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_UPDATE),
    [hasBackendPermission]
  );

  const canManageBilling = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_BILLING_SUBSCRIPTION),
    [hasBackendPermission]
  );

  // --- Registration action flags ---

  const canReadRegistration = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_REGISTRATION_READ),
    [hasBackendPermission]
  );

  const canCreateRegistration = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_REGISTRATION_CREATE),
    [hasBackendPermission]
  );

  const canDeleteRegistration = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_REGISTRATION_DELETE),
    [hasBackendPermission]
  );

  // --- Permission action flags ---

  const canReadPermissions = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_PERMISSIONS_READ),
    [hasBackendPermission]
  );

  const canCreatePermissions = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_PERMISSIONS_CREATE),
    [hasBackendPermission]
  );

  const canUpdatePermissions = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_PERMISSIONS_UPDATE),
    [hasBackendPermission]
  );

  const canDeletePermissions = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_PERMISSIONS_DELETE),
    [hasBackendPermission]
  );

  // --- Legacy flags (kept for backward compatibility) ---

  const canManageUsers = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_USERS_VIEW),
    [hasBackendPermission]
  );

  const canManageVenues = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_UPDATE),
    [hasBackendPermission]
  );

  const canManageOrders = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW),
    [hasBackendPermission]
  );

  const canManageMenu = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW),
    [hasBackendPermission]
  );

  const canManageTables = useMemo(
    () => hasBackendPermission(PERMISSIONS.SYSTEM_WORKSPACES_VIEW),
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
    canViewWorkspaces,
    canViewUsers,
    canViewRoles,
    canViewBilling,
    canViewRegistration,
    canViewSettings,
    canReadWorkspaces,
    canCreateWorkspaces,
    canUpdateWorkspaces,
    canDeleteWorkspaces,
    canReadUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canReadRoles,
    canCreateRoles,
    canUpdateRoles,
    canDeleteRoles,
    canReadBilling,
    canUpdateBilling,
    canManageBilling,
    canReadRegistration,
    canCreateRegistration,
    canDeleteRegistration,
    canReadPermissions,
    canCreatePermissions,
    canUpdatePermissions,
    canDeletePermissions,
    canManageUsers,
    canManageVenues,
    canManageOrders,
    canManageMenu,
    canManageTables,
    userPermissions: userPermissionsList,
    userRole,
    permissionsData: userPermissions,
    user,
  };
};

export default usePermissions;