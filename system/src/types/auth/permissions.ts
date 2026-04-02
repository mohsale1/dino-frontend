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
 *   - subscription, moderate : domain-specific actions
 */

export interface Permission {
  id: string;
  name: string;
  resource: string; // Format: scope.module.action (e.g. system.workspaces.read)
  action: string;
  description: string;
  category: 'system' | 'application';
}

// ============================================================================
// PERMISSION CONSTANTS (using dot notation: scope.module.action)
// ============================================================================

export const PERMISSIONS = {
  // ==================== SYSTEM - MODULE VISIBILITY ====================
  // Controls which sidebar entries are rendered in the admin app (UI gate only).
  // Checked via hasBackendPermission() in AppSidebar before rendering each nav item.

  SYSTEM_DASHBOARD_VIEW:    'system.dashboard.view',
  SYSTEM_WORKSPACES_VIEW:   'system.workspaces.view',
  SYSTEM_USERS_VIEW:        'system.users.view',
  SYSTEM_ROLES_VIEW:        'system.roles.view',
  SYSTEM_BILLING_VIEW:      'system.billing.view',
  SYSTEM_REGISTRATION_VIEW: 'system.registration.view',
  SYSTEM_SETTINGS_VIEW:     'system.settings.view',

  // ==================== SYSTEM - DATA PERMISSIONS ====================

  // Workspace permissions (system level)
  SYSTEM_WORKSPACES_READ:   'system.workspaces.read',
  SYSTEM_WORKSPACES_CREATE: 'system.workspaces.create',
  SYSTEM_WORKSPACES_UPDATE: 'system.workspaces.update',
  SYSTEM_WORKSPACES_DELETE: 'system.workspaces.delete',

  // Billing permissions
  SYSTEM_BILLING_READ:         'system.billing.read',
  SYSTEM_BILLING_UPDATE:       'system.billing.update',
  SYSTEM_BILLING_SUBSCRIPTION: 'system.billing.subscription',

  // Registration permissions
  SYSTEM_REGISTRATION_READ:   'system.registration.read',
  SYSTEM_REGISTRATION_CREATE: 'system.registration.create',
  SYSTEM_REGISTRATION_DELETE: 'system.registration.delete',

  // Role permissions
  SYSTEM_ROLES_READ:   'system.roles.read',
  SYSTEM_ROLES_CREATE: 'system.roles.create',
  SYSTEM_ROLES_UPDATE: 'system.roles.update',
  SYSTEM_ROLES_DELETE: 'system.roles.delete',

  // User permissions (system)
  SYSTEM_USERS_READ:   'system.users.read',
  SYSTEM_USERS_CREATE: 'system.users.create',
  SYSTEM_USERS_UPDATE: 'system.users.update',
  SYSTEM_USERS_DELETE: 'system.users.delete',

  // Permission permissions
  SYSTEM_PERMISSIONS_READ:   'system.permissions.read',
  SYSTEM_PERMISSIONS_CREATE: 'system.permissions.create',
  SYSTEM_PERMISSIONS_UPDATE: 'system.permissions.update',
  SYSTEM_PERMISSIONS_DELETE: 'system.permissions.delete',

  // ==================== APPLICATION - MODULE VISIBILITY ====================
  // Tenant app sidebar visibility — used by the system admin when managing
  // role permissions that apply to the application (tenant) scope.

  APPLICATION_DASHBOARD_VIEW: 'application.dashboard.view',
  APPLICATION_POS_VIEW:       'application.pos.view',       // order_type=1 (POS/manual) only
  APPLICATION_ORDERS_VIEW:    'application.orders.view',
  APPLICATION_CATALOG_VIEW:   'application.catalog.view',
  APPLICATION_LOCATIONS_VIEW: 'application.locations.view', // order_type=0 (online/QR) only
  APPLICATION_COUPONS_VIEW:   'application.coupons.view',
  APPLICATION_USERS_VIEW:     'application.users.view',
  APPLICATION_SETTINGS_VIEW:  'application.settings.view',

  // ==================== APPLICATION - DATA PERMISSIONS ====================

  // Workspace permissions (application level)
  WORKSPACE_READ:   'application.workspace.read',
  WORKSPACE_UPDATE: 'application.workspace.update',
  WORKSPACE_MANAGE: 'application.workspace.manage',

  // Organization permissions
  ORGANIZATION_READ:   'application.organization.read',
  ORGANIZATION_CREATE: 'application.organization.create',
  ORGANIZATION_UPDATE: 'application.organization.update',
  ORGANIZATION_DELETE: 'application.organization.delete',

  // Item permissions (menu items)
  ITEMS_READ:   'application.items.read',
  ITEMS_CREATE: 'application.items.create',
  ITEMS_UPDATE: 'application.items.update',
  ITEMS_DELETE: 'application.items.delete',

  // Category permissions
  CATEGORIES_READ:   'application.categories.read',
  CATEGORIES_CREATE: 'application.categories.create',
  CATEGORIES_UPDATE: 'application.categories.update',
  CATEGORIES_DELETE: 'application.categories.delete',

  // Area permissions (service areas)
  AREAS_READ:   'application.areas.read',
  AREAS_CREATE: 'application.areas.create',
  AREAS_UPDATE: 'application.areas.update',
  AREAS_DELETE: 'application.areas.delete',

  // Table permissions
  TABLES_READ:   'application.tables.read',
  TABLES_CREATE: 'application.tables.create',
  TABLES_UPDATE: 'application.tables.update',
  TABLES_DELETE: 'application.tables.delete',

  // Review permissions
  REVIEWS_READ:     'application.reviews.read',
  REVIEWS_CREATE:   'application.reviews.create',
  REVIEWS_UPDATE:   'application.reviews.update',
  REVIEWS_DELETE:   'application.reviews.delete',
  REVIEWS_MODERATE: 'application.reviews.moderate',

  // Order permissions
  ORDERS_READ:    'application.orders.read',
  ORDERS_CREATE:  'application.orders.create',
  ORDERS_UPDATE:  'application.orders.update',
  ORDERS_DELETE:  'application.orders.delete',
  ORDERS_STATUS:  'application.orders.status',
  ORDERS_PAYMENT: 'application.orders.payment',

  // User permissions (application)
  USERS_READ:   'application.users.read',
  USERS_CREATE: 'application.users.create',
  USERS_UPDATE: 'application.users.update',
  USERS_DELETE: 'application.users.delete',

  // Dashboard permissions
  DASHBOARD_READ: 'application.dashboard.read',

  // Coupon permissions
  COUPONS_READ:   'application.coupons.read',
  COUPONS_CREATE: 'application.coupons.create',
  COUPONS_UPDATE: 'application.coupons.update',
  COUPONS_DELETE: 'application.coupons.delete',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// PERMISSION GROUPS
// ============================================================================

export const PERMISSION_GROUPS = {
  // --------------------------------------------------------------------------
  // System module view permissions — admin sidebar visibility gates
  // --------------------------------------------------------------------------
  MODULE_VIEW_PERMISSIONS: {
    label: 'Module Visibility',
    permissions: [
      PERMISSIONS.SYSTEM_DASHBOARD_VIEW,
      PERMISSIONS.SYSTEM_WORKSPACES_VIEW,
      PERMISSIONS.SYSTEM_USERS_VIEW,
      PERMISSIONS.SYSTEM_ROLES_VIEW,
      PERMISSIONS.SYSTEM_BILLING_VIEW,
      PERMISSIONS.SYSTEM_REGISTRATION_VIEW,
      PERMISSIONS.SYSTEM_SETTINGS_VIEW,
    ],
  },

  // --------------------------------------------------------------------------
  // Application module view permissions — tenant sidebar visibility gates
  // --------------------------------------------------------------------------
  APPLICATION_MODULE_VIEW_PERMISSIONS: {
    label: 'Application Module Visibility',
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
  SYSTEM: {
    label: 'System Permissions',
    permissions: [
      PERMISSIONS.SYSTEM_WORKSPACES_READ,
      PERMISSIONS.SYSTEM_WORKSPACES_CREATE,
      PERMISSIONS.SYSTEM_WORKSPACES_UPDATE,
      PERMISSIONS.SYSTEM_WORKSPACES_DELETE,
      PERMISSIONS.SYSTEM_BILLING_READ,
      PERMISSIONS.SYSTEM_BILLING_UPDATE,
      PERMISSIONS.SYSTEM_BILLING_SUBSCRIPTION,
      PERMISSIONS.SYSTEM_REGISTRATION_READ,
      PERMISSIONS.SYSTEM_REGISTRATION_CREATE,
      PERMISSIONS.SYSTEM_REGISTRATION_DELETE,
      PERMISSIONS.SYSTEM_ROLES_READ,
      PERMISSIONS.SYSTEM_ROLES_CREATE,
      PERMISSIONS.SYSTEM_ROLES_UPDATE,
      PERMISSIONS.SYSTEM_ROLES_DELETE,
      PERMISSIONS.SYSTEM_USERS_READ,
      PERMISSIONS.SYSTEM_USERS_CREATE,
      PERMISSIONS.SYSTEM_USERS_UPDATE,
      PERMISSIONS.SYSTEM_USERS_DELETE,
      PERMISSIONS.SYSTEM_PERMISSIONS_READ,
      PERMISSIONS.SYSTEM_PERMISSIONS_CREATE,
      PERMISSIONS.SYSTEM_PERMISSIONS_UPDATE,
      PERMISSIONS.SYSTEM_PERMISSIONS_DELETE,
    ],
  },
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
 * e.g. 'system.workspaces.read' -> 'Workspaces - Read'
 */
export const formatPermissionName = (permission: string): string => {
  const { module, action } = parsePermission(permission);
  const moduleName = module ? module.charAt(0).toUpperCase() + module.slice(1) : '';
  const actionName = action ? action.charAt(0).toUpperCase() + action.slice(1) : '';
  return `${moduleName} - ${actionName}`;
};
