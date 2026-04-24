/**
 * usePermissions Hook
 * Delegates all permission checks to the Auth context via hasBackendPermission.
 * No role-based logic. No hardcoded booleans.
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';

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
  canViewReferrals: boolean;
  canViewAppearance: boolean;
  /** @deprecated use canViewReferrals */
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

  // Single generic helper — checks the backend permission objects directly.
  // Avoids any hardcoded "resource:action" string constants.
  const hasPerm = useCallback(
    (resource: string, action: string): boolean => {
      const perms: any[] = (userPermissions as any)?.permissions ?? [];
      return perms.some((p: any) => p?.resource === resource && p?.action === action);
    },
    [userPermissions]
  );

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

  // --- Module-visibility flags — derived from backend objects, no string constants ---

  const canViewDashboard  = useMemo(() => hasPerm('dashboard',  'view'), [hasPerm]);
  const canViewWorkspaces = useMemo(() => hasPerm('workspaces', 'view'), [hasPerm]);
  const canViewUsers      = useMemo(() => hasPerm('users',      'view'), [hasPerm]);
  const canViewRoles      = useMemo(() => hasPerm('roles',      'view'), [hasPerm]);
  const canViewBilling    = useMemo(() => hasPerm('billing',    'view'), [hasPerm]);
  const canViewReferrals  = useMemo(() => hasPerm('referrals',  'view'), [hasPerm]);
  const canViewAppearance = useMemo(() => hasPerm('appearance', 'view'), [hasPerm]);
  const canViewSettings   = useMemo(() => hasPerm('settings',   'view'), [hasPerm]);

  // @deprecated — kept for backward compatibility
  const canViewRegistration = canViewReferrals;

  // --- Workspace action flags ---

  const canReadWorkspaces   = useMemo(() => hasPerm('workspaces', 'read'),   [hasPerm]);
  const canCreateWorkspaces = useMemo(() => hasPerm('workspaces', 'create'), [hasPerm]);
  const canUpdateWorkspaces = useMemo(() => hasPerm('workspaces', 'update'), [hasPerm]);
  const canDeleteWorkspaces = useMemo(() => hasPerm('workspaces', 'delete'), [hasPerm]);

  // --- User action flags ---

  const canReadUsers   = useMemo(() => hasPerm('users', 'read'),   [hasPerm]);
  const canCreateUsers = useMemo(() => hasPerm('users', 'create'), [hasPerm]);
  const canUpdateUsers = useMemo(() => hasPerm('users', 'update'), [hasPerm]);
  const canDeleteUsers = useMemo(() => hasPerm('users', 'delete'), [hasPerm]);

  // --- Role action flags ---

  const canReadRoles   = useMemo(() => hasPerm('roles', 'read'),   [hasPerm]);
  const canCreateRoles = useMemo(() => hasPerm('roles', 'create'), [hasPerm]);
  const canUpdateRoles = useMemo(() => hasPerm('roles', 'update'), [hasPerm]);
  const canDeleteRoles = useMemo(() => hasPerm('roles', 'delete'), [hasPerm]);

  // --- Billing action flags ---

  const canReadBilling   = useMemo(() => hasPerm('billing', 'read'),         [hasPerm]);
  const canUpdateBilling = useMemo(() => hasPerm('billing', 'update'),       [hasPerm]);
  const canManageBilling = useMemo(() => hasPerm('billing', 'subscription'), [hasPerm]);

  // --- Referral action flags ---

  const canReadRegistration   = useMemo(() => hasPerm('referrals', 'read'),   [hasPerm]);
  const canCreateRegistration = useMemo(() => hasPerm('referrals', 'create'), [hasPerm]);
  const canDeleteRegistration = useMemo(() => hasPerm('referrals', 'delete'), [hasPerm]);

  // --- Permission action flags ---

  const canReadPermissions   = useMemo(() => hasPerm('permissions', 'read'),   [hasPerm]);
  const canCreatePermissions = useMemo(() => hasPerm('permissions', 'create'), [hasPerm]);
  const canUpdatePermissions = useMemo(() => hasPerm('permissions', 'update'), [hasPerm]);
  const canDeletePermissions = useMemo(() => hasPerm('permissions', 'delete'), [hasPerm]);

  // --- Legacy flags (kept for backward compatibility) ---

  const canManageUsers   = canViewUsers;
  const canManageVenues  = canUpdateWorkspaces;
  const canManageOrders  = canViewWorkspaces;
  const canManageMenu    = canViewWorkspaces;
  const canManageTables  = canViewWorkspaces;

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
    canViewReferrals,
    canViewAppearance,
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
