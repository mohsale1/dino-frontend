/**
 * usePermissions Hook
 * Delegates all permission checks to the Auth context via hasBackendPermission.
 * No role-based logic. No hardcoded booleans.
 *
 * Module-visibility flags use *.view permissions (sidebar visibility only).
 * Action-level flags use *.read / *.create / *.update / *.delete / *.status /
 * *.payment / *.manage permissions (data access and action buttons).
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/common/Auth';

// ---------------------------------------------------------------------------
// Permission string constants
// ---------------------------------------------------------------------------

const P = {
  // Dashboard
  DASHBOARD_VIEW:        'application.dashboard.view',

  // POS
  POS_VIEW:              'application.pos.view',

  // Orders
  ORDERS_VIEW:           'application.orders.view',
  ORDERS_READ:           'application.orders.read',
  ORDERS_CREATE:         'application.orders.create',
  ORDERS_UPDATE:         'application.orders.update',
  ORDERS_DELETE:         'application.orders.delete',
  ORDERS_STATUS:         'application.orders.status',
  ORDERS_PAYMENT:        'application.orders.payment',

  // Status
  STATUS_UPDATE:         'application.status.update',

  // Catalog (module view)
  CATALOG_VIEW:          'application.catalog.view',

  // Items (action-level, under catalog module)
  CATEGORIES_READ:       'application.categories.read',
  ITEMS_CREATE:          'application.items.create',
  ITEMS_UPDATE:          'application.items.update',
  ITEMS_DELETE:          'application.items.delete',

  // Categories (action-level)
  CATEGORIES_CREATE:     'application.categories.create',
  CATEGORIES_UPDATE:     'application.categories.update',
  CATEGORIES_DELETE:     'application.categories.delete',

  // Locations
  LOCATIONS_VIEW:        'application.locations.view',
  AREAS_READ:            'application.areas.read',
  AREAS_CREATE:          'application.areas.create',
  AREAS_UPDATE:          'application.areas.update',
  AREAS_DELETE:          'application.areas.delete',
  TABLES_CREATE:         'application.tables.create',
  TABLES_UPDATE:         'application.tables.update',
  TABLES_DELETE:         'application.tables.delete',

  // Coupons
  COUPONS_VIEW:          'application.coupons.view',
  COUPONS_READ:          'application.coupons.read',
  COUPONS_CREATE:        'application.coupons.create',
  COUPONS_UPDATE:        'application.coupons.update',
  COUPONS_DELETE:        'application.coupons.delete',

  // Users
  USERS_VIEW:            'application.users.view',
  USERS_READ:            'application.users.read',
  USERS_CREATE:          'application.users.create',
  USERS_UPDATE:          'application.users.update',
  USERS_DELETE:          'application.users.delete',

  // Settings / Workspace
  SETTINGS_VIEW:         'application.settings.view',
  WORKSPACE_MANAGE:      'application.workspace.manage',
  WORKSPACE_UPDATE:      'application.workspace.update',
} as const;

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
  canCreateCategories: boolean;
  canUpdateCategories: boolean;
  canDeleteCategories: boolean;

  // --- Locations / Areas action flags ---
  canReadLocations: boolean;
  canCreateAreas: boolean;
  canUpdateAreas: boolean;
  canDeleteAreas: boolean;

  // --- Tables action flags ---
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
  canManageWorkspace: boolean;
  canUpdateWorkspace: boolean;

  // --- Backward-compat aliases ---
  /** @deprecated Use canReadUsers instead */
  canManageUsers: boolean;

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
  const { user, hasBackendPermission, getPermissionsList, userPermissions } = useAuth();

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

  // --- Route / action helpers ---

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

  // --- Module-visibility flags (*.view) ---

  const canViewDashboard = useMemo(
    () => hasBackendPermission(P.DASHBOARD_VIEW),
    [hasBackendPermission]
  );

  const canViewPOS = useMemo(
    () => hasBackendPermission(P.POS_VIEW),
    [hasBackendPermission]
  );

  const canViewOrders = useMemo(
    () => hasBackendPermission(P.ORDERS_VIEW),
    [hasBackendPermission]
  );

  const canViewCatalog = useMemo(
    () => hasBackendPermission(P.CATALOG_VIEW),
    [hasBackendPermission]
  );

  const canViewLocations = useMemo(
    () => hasBackendPermission(P.LOCATIONS_VIEW),
    [hasBackendPermission]
  );

  const canViewCoupons = useMemo(
    () => hasBackendPermission(P.COUPONS_VIEW),
    [hasBackendPermission]
  );

  const canViewUsers = useMemo(
    () => hasBackendPermission(P.USERS_VIEW),
    [hasBackendPermission]
  );

  const canViewSettings = useMemo(
    () => hasBackendPermission(P.SETTINGS_VIEW),
    [hasBackendPermission]
  );

  // --- getAccessibleModules: derived from *.view flags ---

  const getAccessibleModules = useCallback((): AccessibleModule[] => {
    const modules: AccessibleModule[] = [];
    if (hasBackendPermission(P.DASHBOARD_VIEW))  modules.push('dashboard');
    if (hasBackendPermission(P.POS_VIEW))         modules.push('pos');
    if (hasBackendPermission(P.ORDERS_VIEW))      modules.push('orders');
    if (hasBackendPermission(P.CATALOG_VIEW))     modules.push('catalog');
    if (hasBackendPermission(P.LOCATIONS_VIEW))   modules.push('locations');
    if (hasBackendPermission(P.COUPONS_VIEW))     modules.push('coupons');
    if (hasBackendPermission(P.USERS_VIEW))       modules.push('users');
    if (hasBackendPermission(P.SETTINGS_VIEW))    modules.push('settings');
    return modules;
  }, [hasBackendPermission]);

  // --- Orders action flags ---

  const canReadOrders = useMemo(
    () => hasBackendPermission(P.ORDERS_READ),
    [hasBackendPermission]
  );

  const canCreateOrders = useMemo(
    () => hasBackendPermission(P.ORDERS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateOrderStatus = useMemo(
    () => hasBackendPermission(P.ORDERS_STATUS),
    [hasBackendPermission]
  );

  const canDeleteOrders = useMemo(
    () => hasBackendPermission(P.ORDERS_DELETE),
    [hasBackendPermission]
  );

  const canProcessPayments = useMemo(
    () => hasBackendPermission(P.ORDERS_PAYMENT),
    [hasBackendPermission]
  );

  const canUpdateStatus = useMemo(
    () => hasBackendPermission(P.STATUS_UPDATE),
    [hasBackendPermission]
  );

  // --- Catalog / Items action flags ---

  const canReadCatalog = useMemo(
    () => hasBackendPermission(P.CATEGORIES_READ),
    [hasBackendPermission]
  );

  const canCreateCatalogItems = useMemo(
    () => hasBackendPermission(P.ITEMS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateCatalogItems = useMemo(
    () => hasBackendPermission(P.ITEMS_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteCatalogItems = useMemo(
    () => hasBackendPermission(P.ITEMS_DELETE),
    [hasBackendPermission]
  );

  // --- Categories action flags ---

  const canCreateCategories = useMemo(
    () => hasBackendPermission(P.CATEGORIES_CREATE),
    [hasBackendPermission]
  );

  const canUpdateCategories = useMemo(
    () => hasBackendPermission(P.CATEGORIES_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteCategories = useMemo(
    () => hasBackendPermission(P.CATEGORIES_DELETE),
    [hasBackendPermission]
  );

  // --- Locations / Areas action flags ---

  const canReadLocations = useMemo(
    () => hasBackendPermission(P.AREAS_READ),
    [hasBackendPermission]
  );

  const canCreateAreas = useMemo(
    () => hasBackendPermission(P.AREAS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateAreas = useMemo(
    () => hasBackendPermission(P.AREAS_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteAreas = useMemo(
    () => hasBackendPermission(P.AREAS_DELETE),
    [hasBackendPermission]
  );

  // --- Tables action flags ---

  const canCreateTables = useMemo(
    () => hasBackendPermission(P.TABLES_CREATE),
    [hasBackendPermission]
  );

  const canUpdateTables = useMemo(
    () => hasBackendPermission(P.TABLES_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteTables = useMemo(
    () => hasBackendPermission(P.TABLES_DELETE),
    [hasBackendPermission]
  );

  // --- Coupons action flags ---

  const canReadCoupons = useMemo(
    () => hasBackendPermission(P.COUPONS_READ),
    [hasBackendPermission]
  );

  const canCreateCoupons = useMemo(
    () => hasBackendPermission(P.COUPONS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateCoupons = useMemo(
    () => hasBackendPermission(P.COUPONS_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteCoupons = useMemo(
    () => hasBackendPermission(P.COUPONS_DELETE),
    [hasBackendPermission]
  );

  // --- Users action flags ---

  const canReadUsers = useMemo(
    () => hasBackendPermission(P.USERS_READ),
    [hasBackendPermission]
  );

  const canCreateUsers = useMemo(
    () => hasBackendPermission(P.USERS_CREATE),
    [hasBackendPermission]
  );

  const canUpdateUsers = useMemo(
    () => hasBackendPermission(P.USERS_UPDATE),
    [hasBackendPermission]
  );

  const canDeleteUsers = useMemo(
    () => hasBackendPermission(P.USERS_DELETE),
    [hasBackendPermission]
  );

  // --- Workspace action flags ---

  const canManageWorkspace = useMemo(
    () => hasBackendPermission(P.WORKSPACE_MANAGE),
    [hasBackendPermission]
  );

  const canUpdateWorkspace = useMemo(
    () => hasBackendPermission(P.WORKSPACE_UPDATE),
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
    canCreateCategories,
    canUpdateCategories,
    canDeleteCategories,

    // Locations / Areas
    canReadLocations,
    canCreateAreas,
    canUpdateAreas,
    canDeleteAreas,

    // Tables
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
    canManageWorkspace,
    canUpdateWorkspace,

    // Backward-compat aliases
    canManageUsers: canReadUsers,

    // Derived data
    userPermissions: userPermissionsList,
    userRole,
    permissionsData: userPermissions,
    user,
  };
};

export default usePermissions;