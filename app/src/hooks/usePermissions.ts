/**
 * usePermissions Hook
 *
 * All permission checks are derived dynamically from the stored permission
 * objects ({ resource, action }) via hasPerm — no hardcoded permission strings.
 *
 * Module-visibility flags use the 'view' action (sidebar visibility only).
 * Action-level flags use read / create / update / delete / status / payment.
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';

// ---------------------------------------------------------------------------
// Module names returned by getAccessibleModules()
// ---------------------------------------------------------------------------

export type AccessibleModule =
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'catalog'
  | 'locations'
  | 'coupons'
  | 'users'
  | 'settings';

// ---------------------------------------------------------------------------
// Return-type interface
// ---------------------------------------------------------------------------

export interface UsePermissionsReturn {
  // --- Core helpers ---
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  canPerformAction: (action: string) => boolean;
  getAccessibleRoutes: () => string[];
  getUserActions: () => string[];
  getAccessibleModules: () => AccessibleModule[];

  // --- Module-visibility flags (*.view — sidebar visibility only) ---
  canViewDashboard: boolean;
  canViewPOS: boolean;
  canViewOrders: boolean;
  canViewCatalog: boolean;
  canViewLocations: boolean;
  canViewCoupons: boolean;
  canViewUsers: boolean;
  canViewSettings: boolean;

  // --- Orders action flags ---
  canReadOrders: boolean;
  canCreateOrders: boolean;
  canUpdateOrderStatus: boolean;
  canDeleteOrders: boolean;
  canProcessPayments: boolean;
  canUpdateStatus: boolean;

  // --- Catalog / Items action flags ---
  canReadCatalog: boolean;
  canCreateCatalogItems: boolean;
  canUpdateCatalogItems: boolean;
  canDeleteCatalogItems: boolean;

  // --- Categories action flags ---
  canReadCategories: boolean;
  canCreateCategories: boolean;
  canUpdateCategories: boolean;
  canDeleteCategories: boolean;

  // --- Locations / Areas action flags ---
  canReadLocations: boolean;
  canCreateAreas: boolean;
  canUpdateAreas: boolean;
  canDeleteAreas: boolean;

  // --- Tables action flags ---
  canReadTables: boolean;
  canCreateTables: boolean;
  canUpdateTables: boolean;
  canDeleteTables: boolean;

  // --- Coupons action flags ---
  canReadCoupons: boolean;
  canCreateCoupons: boolean;
  canUpdateCoupons: boolean;
  canDeleteCoupons: boolean;

  // --- Users action flags ---
  canReadUsers: boolean;
  canCreateUsers: boolean;
  canUpdateUsers: boolean;
  canDeleteUsers: boolean;

  // --- Workspace action flags ---
  canReadWorkspace: boolean;
  canManageWorkspace: boolean;
  canUpdateWorkspace: boolean;

  // --- Persona action flags ---
  canReadPersonas: boolean;
  canCreatePersonas: boolean;
  canUpdatePersonas: boolean;
  canDeletePersonas: boolean;

  // --- Backward-compat aliases ---
  /** @deprecated Use canReadUsers instead */
  canManageUsers: boolean;
  /** @deprecated Use canReadCatalog instead */
  canReadCatalogItems: boolean;

  // --- Derived data ---
  userPermissions: string[];
  userRole: string | null;
  permissionsData: any;
  user: any;
}

// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------

export const usePermissions = (): UsePermissionsReturn => {
  const {
    user,
    hasPerm,
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

  // --- Module-visibility flags (resource, 'view') ---

  const canViewDashboard  = useMemo(() => hasPerm('dashboard',  'view'), [hasPerm]);
  const canViewPOS        = useMemo(() => hasPerm('pos',        'view'), [hasPerm]);
  const canViewOrders     = useMemo(() => hasPerm('orders',     'view'), [hasPerm]);
  const canViewCatalog    = useMemo(() => hasPerm('catalog',    'view'), [hasPerm]);
  const canViewLocations  = useMemo(() => hasPerm('locations',  'view'), [hasPerm]);
  const canViewCoupons    = useMemo(() => hasPerm('coupons',    'view'), [hasPerm]);
  const canViewUsers      = useMemo(() => hasPerm('users',      'view'), [hasPerm]);
  const canViewSettings   = useMemo(() => hasPerm('settings',   'view'), [hasPerm]);

  // --- getAccessibleModules: derived from view flags ---

  const getAccessibleModules = useCallback((): AccessibleModule[] => {
    const modules: AccessibleModule[] = [];
    if (hasPerm('dashboard', 'view'))  modules.push('dashboard');
    if (hasPerm('pos',       'view'))  modules.push('pos');
    if (hasPerm('orders',    'view'))  modules.push('orders');
    if (hasPerm('catalog',   'view'))  modules.push('catalog');
    if (hasPerm('locations', 'view'))  modules.push('locations');
    if (hasPerm('coupons',   'view'))  modules.push('coupons');
    if (hasPerm('users',     'view'))  modules.push('users');
    if (hasPerm('settings',  'view'))  modules.push('settings');
    return modules;
  }, [hasPerm]);

  // --- Orders action flags ---

  const canReadOrders       = useMemo(() => hasPerm('orders', 'read'),    [hasPerm]);
  const canCreateOrders     = useMemo(() => hasPerm('orders', 'create'),  [hasPerm]);
  const canUpdateOrderStatus = useMemo(() => hasPerm('orders', 'status'), [hasPerm]);
  const canDeleteOrders     = useMemo(() => hasPerm('orders', 'delete'),  [hasPerm]);
  const canProcessPayments  = useMemo(() => hasPerm('orders', 'payment'), [hasPerm]);
  const canUpdateStatus     = useMemo(() => hasPerm('status', 'update'),  [hasPerm]);

  // --- Catalog / Items action flags ---

  const canReadCatalog        = useMemo(() => hasPerm('items', 'read'),   [hasPerm]);
  const canCreateCatalogItems = useMemo(() => hasPerm('items', 'create'), [hasPerm]);
  const canUpdateCatalogItems = useMemo(() => hasPerm('items', 'update'), [hasPerm]);
  const canDeleteCatalogItems = useMemo(() => hasPerm('items', 'delete'), [hasPerm]);

  // --- Categories action flags ---

  const canReadCategories   = useMemo(() => hasPerm('categories', 'read'),   [hasPerm]);
  const canCreateCategories = useMemo(() => hasPerm('categories', 'create'), [hasPerm]);
  const canUpdateCategories = useMemo(() => hasPerm('categories', 'update'), [hasPerm]);
  const canDeleteCategories = useMemo(() => hasPerm('categories', 'delete'), [hasPerm]);

  // --- Locations / Areas action flags ---

  const canReadLocations = useMemo(() => hasPerm('areas', 'read'),   [hasPerm]);
  const canCreateAreas   = useMemo(() => hasPerm('areas', 'create'), [hasPerm]);
  const canUpdateAreas   = useMemo(() => hasPerm('areas', 'update'), [hasPerm]);
  const canDeleteAreas   = useMemo(() => hasPerm('areas', 'delete'), [hasPerm]);

  // --- Tables action flags ---

  const canReadTables   = useMemo(() => hasPerm('tables', 'read'),   [hasPerm]);
  const canCreateTables = useMemo(() => hasPerm('tables', 'create'), [hasPerm]);
  const canUpdateTables = useMemo(() => hasPerm('tables', 'update'), [hasPerm]);
  const canDeleteTables = useMemo(() => hasPerm('tables', 'delete'), [hasPerm]);

  // --- Coupons action flags ---

  const canReadCoupons   = useMemo(() => hasPerm('coupons', 'read'),   [hasPerm]);
  const canCreateCoupons = useMemo(() => hasPerm('coupons', 'create'), [hasPerm]);
  const canUpdateCoupons = useMemo(() => hasPerm('coupons', 'update'), [hasPerm]);
  const canDeleteCoupons = useMemo(() => hasPerm('coupons', 'delete'), [hasPerm]);

  // --- Users action flags ---

  const canReadUsers   = useMemo(() => hasPerm('users', 'read'),   [hasPerm]);
  const canCreateUsers = useMemo(() => hasPerm('users', 'create'), [hasPerm]);
  const canUpdateUsers = useMemo(() => hasPerm('users', 'update'), [hasPerm]);
  const canDeleteUsers = useMemo(() => hasPerm('users', 'delete'), [hasPerm]);

  // --- Workspace action flags ---

  const canReadWorkspace   = useMemo(() => hasPerm('workspace', 'read'),   [hasPerm]);
  const canManageWorkspace = useMemo(() => hasPerm('workspace', 'manage'), [hasPerm]);
  const canUpdateWorkspace = useMemo(() => hasPerm('workspace', 'update'), [hasPerm]);

  // --- Persona action flags ---

  const canReadPersonas   = useMemo(() => hasPerm('personas', 'read'),   [hasPerm]);
  const canCreatePersonas = useMemo(() => hasPerm('persona',  'create'), [hasPerm]);
  const canUpdatePersonas = useMemo(() => hasPerm('persona',  'update'), [hasPerm]);
  const canDeletePersonas = useMemo(() => hasPerm('persona',  'delete'), [hasPerm]);

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
    // Core helpers
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canPerformAction,
    getAccessibleRoutes,
    getUserActions,
    getAccessibleModules,

    // Module-visibility flags
    canViewDashboard,
    canViewPOS,
    canViewOrders,
    canViewCatalog,
    canViewLocations,
    canViewCoupons,
    canViewUsers,
    canViewSettings,

    // Orders
    canReadOrders,
    canCreateOrders,
    canUpdateOrderStatus,
    canDeleteOrders,
    canProcessPayments,
    canUpdateStatus,

    // Catalog / Items
    canReadCatalog,
    canCreateCatalogItems,
    canUpdateCatalogItems,
    canDeleteCatalogItems,

    // Categories
    canReadCategories,
    canCreateCategories,
    canUpdateCategories,
    canDeleteCategories,

    // Locations / Areas
    canReadLocations,
    canCreateAreas,
    canUpdateAreas,
    canDeleteAreas,

    // Tables
    canReadTables,
    canCreateTables,
    canUpdateTables,
    canDeleteTables,

    // Coupons
    canReadCoupons,
    canCreateCoupons,
    canUpdateCoupons,
    canDeleteCoupons,

    // Users
    canReadUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,

    // Workspace
    canReadWorkspace,
    canManageWorkspace,
    canUpdateWorkspace,

    // Personas
    canReadPersonas,
    canCreatePersonas,
    canUpdatePersonas,
    canDeletePersonas,

    // Backward-compat aliases
    canManageUsers:     canReadUsers,
    canReadCatalogItems: canReadCatalog,

    // Derived data
    userPermissions: userPermissionsList,
    userRole,
    permissionsData: userPermissions,
    user,
  };
};

export default usePermissions;