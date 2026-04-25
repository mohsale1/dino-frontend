/**
 * Permission Types and Constants
 *
 * Defines all permission types and constants using dot notation (scope.module.action)
 * to match backend permission structure.
 *
 * Action types:
 *   - view   : sidebar module visibility (UI-only gate)
 *   - read   : data access
 *   - create : create records
 *   - update : edit records
 *   - delete : remove records
 *   - status, payment, moderate : domain-specific actions
 *
 * Notes on view permissions:
 *   - application.pos.view       : only shown when venue.orderType === 1 (POS/manual)
 *   - application.locations.view : only shown when venue.orderType === 0 (online/QR)
 */

export interface Permission {
  id: string;
  name: string;
  resource: string; // Format: scope.module.action (e.g. application.items.read)
  action: string;
  description: string;
  category: 'system' | 'application';
}

// ============================================================================
// PERMISSION CONSTANTS (using dot notation: scope.module.action)
// ============================================================================

export const PERMISSIONS = {
  // ==================== APPLICATION - MODULE VISIBILITY ====================
  // Controls which nav entries are rendered (UI gate only).
  // Checked via hasBackendPermission() — must match backend 'resource:action' codenames exactly.

  SYSTEM_WORKSPACES_READ: 'workspaces:read',

  APPLICATION_DASHBOARD_VIEW: 'dashboard:view',
  APPLICATION_POS_VIEW:       'pos:view',        // order_type=1 (POS/manual) only
  APPLICATION_ORDERS_VIEW:    'orders:view',
  APPLICATION_CATALOG_VIEW:   'catalog:view',
  APPLICATION_LOCATIONS_VIEW: 'locations:view',  // order_type=0 (online/QR) only
  APPLICATION_COUPONS_VIEW:   'coupons:view',
  APPLICATION_USERS_VIEW:     'users:view',
  APPLICATION_SETTINGS_VIEW:  'settings:view',
  APPLICATION_PERSONAS_VIEW:  'personas:read',

  // ==================== APPLICATION - DATA PERMISSIONS ====================

  // Workspace permissions
  WORKSPACE_READ:   'workspace:read',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_MANAGE: 'workspace:manage',

  // Organization permissions
  ORGANIZATION_READ:   'organization:read',
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',

  // Item permissions (menu items)
  ITEMS_READ:   'items:read',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',

  // Category permissions
  CATEGORIES_READ:   'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',

  // Area permissions (service areas)
  AREAS_READ:   'areas:read',
  AREAS_CREATE: 'areas:create',
  AREAS_UPDATE: 'areas:update',
  AREAS_DELETE: 'areas:delete',

  // Table permissions
  TABLES_READ:   'tables:read',
  TABLES_CREATE: 'tables:create',
  TABLES_UPDATE: 'tables:update',
  TABLES_DELETE: 'tables:delete',

  // Review permissions
  REVIEWS_READ:     'reviews:read',
  REVIEWS_CREATE:   'reviews:create',
  REVIEWS_UPDATE:   'reviews:update',
  REVIEWS_DELETE:   'reviews:delete',
  REVIEWS_MODERATE: 'reviews:moderate',

  // Order permissions
  ORDERS_READ:    'orders:read',
  ORDERS_CREATE:  'orders:create',
  ORDERS_UPDATE:  'orders:update',
  ORDERS_DELETE:  'orders:delete',
  ORDERS_STATUS:  'orders:status',
  ORDERS_PAYMENT: 'orders:payment',

  // User permissions
  USERS_READ:   'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',

  // Dashboard permissions
  DASHBOARD_READ: 'dashboard:read',

  // Status permissions
  STATUS_UPDATE: 'status:update',

  // Coupon permissions
  COUPONS_READ:   'coupons:read',
  COUPONS_CREATE: 'coupons:create',
  COUPONS_UPDATE: 'coupons:update',
  COUPONS_DELETE: 'coupons:delete',

  // Persona permissions
  PERSONA_CREATE: 'persona:create',
  PERSONA_UPDATE: 'persona:update',
  PERSONA_DELETE: 'persona:delete',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// PERMISSION GROUPS
// ============================================================================

export const PERMISSION_GROUPS = {
  // --------------------------------------------------------------------------
  // Module view permissions — sidebar visibility gates (application scope only)
  // --------------------------------------------------------------------------
  MODULE_VIEW_PERMISSIONS: {
    label: 'Module Visibility',
    permissions: [
      PERMISSIONS.APPLICATION_DASHBOARD_VIEW,
      PERMISSIONS.APPLICATION_POS_VIEW,
      PERMISSIONS.APPLICATION_ORDERS_VIEW,
      PERMISSIONS.APPLICATION_CATALOG_VIEW,
      PERMISSIONS.APPLICATION_LOCATIONS_VIEW,
      PERMISSIONS.APPLICATION_COUPONS_VIEW,
      PERMISSIONS.APPLICATION_USERS_VIEW,
      PERMISSIONS.APPLICATION_SETTINGS_VIEW,
    ],
  },

  // --------------------------------------------------------------------------
  // Data and action permissions
  // --------------------------------------------------------------------------
  WORKSPACE: {
    label: 'Workspace Management',
    permissions: [
      PERMISSIONS.WORKSPACE_READ,
      PERMISSIONS.WORKSPACE_UPDATE,
      PERMISSIONS.WORKSPACE_MANAGE,
    ],
  },
  ORGANIZATION: {
    label: 'Organization Management',
    permissions: [
      PERMISSIONS.ORGANIZATION_READ,
      PERMISSIONS.ORGANIZATION_CREATE,
      PERMISSIONS.ORGANIZATION_UPDATE,
      PERMISSIONS.ORGANIZATION_DELETE,
    ],
  },
  ITEMS: {
    label: 'Item Management',
    permissions: [
      PERMISSIONS.ITEMS_READ,
      PERMISSIONS.ITEMS_CREATE,
      PERMISSIONS.ITEMS_UPDATE,
      PERMISSIONS.ITEMS_DELETE,
    ],
  },
  CATEGORIES: {
    label: 'Category Management',
    permissions: [
      PERMISSIONS.CATEGORIES_READ,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,
      PERMISSIONS.CATEGORIES_DELETE,
    ],
  },
  AREAS: {
    label: 'Area Management',
    permissions: [
      PERMISSIONS.AREAS_READ,
      PERMISSIONS.AREAS_CREATE,
      PERMISSIONS.AREAS_UPDATE,
      PERMISSIONS.AREAS_DELETE,
    ],
  },
  TABLES: {
    label: 'Table Management',
    permissions: [
      PERMISSIONS.TABLES_READ,
      PERMISSIONS.TABLES_CREATE,
      PERMISSIONS.TABLES_UPDATE,
      PERMISSIONS.TABLES_DELETE,
    ],
  },
  REVIEWS: {
    label: 'Review Management',
    permissions: [
      PERMISSIONS.REVIEWS_READ,
      PERMISSIONS.REVIEWS_CREATE,
      PERMISSIONS.REVIEWS_UPDATE,
      PERMISSIONS.REVIEWS_DELETE,
      PERMISSIONS.REVIEWS_MODERATE,
    ],
  },
  ORDERS: {
    label: 'Order Management',
    permissions: [
      PERMISSIONS.ORDERS_READ,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_DELETE,
      PERMISSIONS.ORDERS_STATUS,
      PERMISSIONS.ORDERS_PAYMENT,
    ],
  },
  USERS: {
    label: 'User Management',
    permissions: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ],
  },
  DASHBOARD: {
    label: 'Dashboard & Analytics',
    permissions: [
      PERMISSIONS.DASHBOARD_READ,
    ],
  },
  STATUS: {
    label: 'Status Management',
    permissions: [
      PERMISSIONS.STATUS_UPDATE,
    ],
  },
  COUPONS: {
    label: 'Coupon Management',
    permissions: [
      PERMISSIONS.COUPONS_READ,
      PERMISSIONS.COUPONS_CREATE,
      PERMISSIONS.COUPONS_UPDATE,
      PERMISSIONS.COUPONS_DELETE,
    ],
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a user's permission set includes the required permission.
 * Uses exact match only — no wildcards.
 */
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the required permissions
 */
export const hasAnyPermission = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.some(perm => hasPermission(userPermissions, perm));
};

/**
 * Check if user has all of the required permissions
 */
export const hasAllPermissions = (userPermissions: string[], requiredPermissions: string[]): boolean => {
  return requiredPermissions.every(perm => hasPermission(userPermissions, perm));
};

/**
 * Parse a dot-notation permission string (scope.module.action) into its parts.
 */
export const parsePermission = (permission: string): { scope: string; module: string; action: string } => {
  const [scope, module, action] = permission.split('.');
  return { scope, module, action };
};

/**
 * Format a dot-notation permission string for display.
 * e.g. 'application.items.read' -> 'Items - Read'
 */
export const formatPermissionName = (permission: string): string => {
  const { module, action } = parsePermission(permission);
  const moduleName = module ? module.charAt(0).toUpperCase() + module.slice(1) : '';
  const actionName = action ? action.charAt(0).toUpperCase() + action.slice(1) : '';
  return `${moduleName} - ${actionName}`;
};
