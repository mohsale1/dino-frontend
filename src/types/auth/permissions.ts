/**
 * Permission Types and Constants
 * 
 * Defines all permission types and constants using colon notation
 * to match backend permission structure.
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  category: 'system' | 'application';
}

// ============================================================================
// PERMISSION CONSTANTS (using colon notation to match backend)
// ============================================================================

export const PERMISSIONS = {
  // ==================== SYSTEM PERMISSIONS ====================
  
  // System wildcard
  SYSTEM_ALL: 'system:*',
  
  // Workspace permissions (system level)
  SYSTEM_WORKSPACES_ALL: 'system:workspaces:*',
  SYSTEM_WORKSPACES_READ: 'system:workspaces:read',
  SYSTEM_WORKSPACES_CREATE: 'system:workspaces:create',
  SYSTEM_WORKSPACES_UPDATE: 'system:workspaces:update',
  SYSTEM_WORKSPACES_DELETE: 'system:workspaces:delete',
  
  // Billing permissions
  SYSTEM_BILLING_ALL: 'system:billing:*',
  SYSTEM_BILLING_READ: 'system:billing:read',
  SYSTEM_BILLING_UPDATE: 'system:billing:update',
  SYSTEM_BILLING_SUBSCRIPTION: 'system:billing:subscription',
  
  // Registration permissions
  SYSTEM_REGISTRATION_ALL: 'system:registration:*',
  SYSTEM_REGISTRATION_READ: 'system:registration:read',
  SYSTEM_REGISTRATION_CREATE: 'system:registration:create',
  SYSTEM_REGISTRATION_DELETE: 'system:registration:delete',
  
  // Role permissions
  SYSTEM_ROLES_ALL: 'system:roles:*',
  SYSTEM_ROLES_READ: 'system:roles:read',
  SYSTEM_ROLES_CREATE: 'system:roles:create',
  SYSTEM_ROLES_UPDATE: 'system:roles:update',
  SYSTEM_ROLES_DELETE: 'system:roles:delete',
  
  // User permissions (system)
  SYSTEM_USERS_ALL: 'system:users:*',
  SYSTEM_USERS_READ: 'system:users:read',
  SYSTEM_USERS_CREATE: 'system:users:create',
  SYSTEM_USERS_UPDATE: 'system:users:update',
  SYSTEM_USERS_DELETE: 'system:users:delete',
  
  // Permission permissions
  SYSTEM_PERMISSIONS_ALL: 'system:permissions:*',
  SYSTEM_PERMISSIONS_READ: 'system:permissions:read',
  SYSTEM_PERMISSIONS_CREATE: 'system:permissions:create',
  SYSTEM_PERMISSIONS_UPDATE: 'system:permissions:update',
  SYSTEM_PERMISSIONS_DELETE: 'system:permissions:delete',
  
  // ==================== APPLICATION PERMISSIONS ====================
  
  // Application wildcard
  WORKSPACE_ALL: 'workspace:*',
  
  // Workspace permissions (application level)
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_MANAGE: 'workspace:manage',
  
  // Organization permissions
  ORGANIZATION_ALL: 'organization:*',
  ORGANIZATION_READ: 'organization:read',
  ORGANIZATION_CREATE: 'organization:create',
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
  
  // Item permissions (menu items)
  ITEMS_ALL: 'items:*',
  ITEMS_READ: 'items:read',
  ITEMS_CREATE: 'items:create',
  ITEMS_UPDATE: 'items:update',
  ITEMS_DELETE: 'items:delete',
  
  // Category permissions
  CATEGORIES_ALL: 'categories:*',
  CATEGORIES_READ: 'categories:read',
  CATEGORIES_CREATE: 'categories:create',
  CATEGORIES_UPDATE: 'categories:update',
  CATEGORIES_DELETE: 'categories:delete',
  
  // Area permissions (service areas)
  AREAS_ALL: 'areas:*',
  AREAS_READ: 'areas:read',
  AREAS_CREATE: 'areas:create',
  AREAS_UPDATE: 'areas:update',
  AREAS_DELETE: 'areas:delete',
  
  // Table permissions
  TABLES_ALL: 'tables:*',
  TABLES_READ: 'tables:read',
  TABLES_CREATE: 'tables:create',
  TABLES_UPDATE: 'tables:update',
  TABLES_DELETE: 'tables:delete',
  
  // Review permissions
  REVIEWS_ALL: 'reviews:*',
  REVIEWS_READ: 'reviews:read',
  REVIEWS_CREATE: 'reviews:create',
  REVIEWS_UPDATE: 'reviews:update',
  REVIEWS_DELETE: 'reviews:delete',
  REVIEWS_MODERATE: 'reviews:moderate',
  
  // Order permissions
  ORDERS_ALL: 'orders:*',
  ORDERS_READ: 'orders:read',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_STATUS: 'orders:status',
  ORDERS_PAYMENT: 'orders:payment',
  
  // User permissions (application)
  USERS_ALL: 'users:*',
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Dashboard permissions
  DASHBOARD_ALL: 'dashboard:*',
  DASHBOARD_READ: 'dashboard:read',
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// PERMISSION GROUPS
// ============================================================================

export const PERMISSION_GROUPS = {
  SYSTEM: {
    label: 'System Permissions',
    permissions: [
      PERMISSIONS.SYSTEM_ALL,
      PERMISSIONS.SYSTEM_WORKSPACES_ALL,
      PERMISSIONS.SYSTEM_BILLING_ALL,
      PERMISSIONS.SYSTEM_REGISTRATION_ALL,
      PERMISSIONS.SYSTEM_ROLES_ALL,
      PERMISSIONS.SYSTEM_USERS_ALL,
      PERMISSIONS.SYSTEM_PERMISSIONS_ALL,
    ]
  },
  WORKSPACE: {
    label: 'Workspace Management',
    permissions: [
      PERMISSIONS.WORKSPACE_ALL,
      PERMISSIONS.WORKSPACE_READ,
      PERMISSIONS.WORKSPACE_UPDATE,
      PERMISSIONS.WORKSPACE_MANAGE,
    ]
  },
  ORGANIZATION: {
    label: 'Organization Management',
    permissions: [
      PERMISSIONS.ORGANIZATION_ALL,
      PERMISSIONS.ORGANIZATION_READ,
      PERMISSIONS.ORGANIZATION_CREATE,
      PERMISSIONS.ORGANIZATION_UPDATE,
      PERMISSIONS.ORGANIZATION_DELETE,
    ]
  },
  ITEMS: {
    label: 'Item Management',
    permissions: [
      PERMISSIONS.ITEMS_ALL,
      PERMISSIONS.ITEMS_READ,
      PERMISSIONS.ITEMS_CREATE,
      PERMISSIONS.ITEMS_UPDATE,
      PERMISSIONS.ITEMS_DELETE,
    ]
  },
  CATEGORIES: {
    label: 'Category Management',
    permissions: [
      PERMISSIONS.CATEGORIES_ALL,
      PERMISSIONS.CATEGORIES_READ,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,
      PERMISSIONS.CATEGORIES_DELETE,
    ]
  },
  AREAS: {
    label: 'Area Management',
    permissions: [
      PERMISSIONS.AREAS_ALL,
      PERMISSIONS.AREAS_READ,
      PERMISSIONS.AREAS_CREATE,
      PERMISSIONS.AREAS_UPDATE,
      PERMISSIONS.AREAS_DELETE,
    ]
  },
  TABLES: {
    label: 'Table Management',
    permissions: [
      PERMISSIONS.TABLES_ALL,
      PERMISSIONS.TABLES_READ,
      PERMISSIONS.TABLES_CREATE,
      PERMISSIONS.TABLES_UPDATE,
      PERMISSIONS.TABLES_DELETE,
    ]
  },
  REVIEWS: {
    label: 'Review Management',
    permissions: [
      PERMISSIONS.REVIEWS_ALL,
      PERMISSIONS.REVIEWS_READ,
      PERMISSIONS.REVIEWS_CREATE,
      PERMISSIONS.REVIEWS_UPDATE,
      PERMISSIONS.REVIEWS_DELETE,
      PERMISSIONS.REVIEWS_MODERATE,
    ]
  },
  ORDERS: {
    label: 'Order Management',
    permissions: [
      PERMISSIONS.ORDERS_ALL,
      PERMISSIONS.ORDERS_READ,
      PERMISSIONS.ORDERS_CREATE,
      PERMISSIONS.ORDERS_UPDATE,
      PERMISSIONS.ORDERS_DELETE,
      PERMISSIONS.ORDERS_STATUS,
      PERMISSIONS.ORDERS_PAYMENT,
    ]
  },
  USERS: {
    label: 'User Management',
    permissions: [
      PERMISSIONS.USERS_ALL,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ]
  },
  DASHBOARD: {
    label: 'Dashboard & Analytics',
    permissions: [
      PERMISSIONS.DASHBOARD_ALL,
      PERMISSIONS.DASHBOARD_READ,
    ]
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a permission grants access to another permission
 * Supports wildcard matching (e.g., "items:*" grants "items:read")
 */
export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  // Check for exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Check for wildcard permissions
  const [resource] = requiredPermission.split(':');
  const wildcardPermission = `${resource}:*`;
  if (userPermissions.includes(wildcardPermission)) {
    return true;
  }

  // Check for system:* (grants all system permissions)
  if (requiredPermission.startsWith('system:') && userPermissions.includes('system:*')) {
    return true;
  }

  // Check for workspace:* (grants all application permissions)
  if (!requiredPermission.startsWith('system:') && userPermissions.includes('workspace:*')) {
    return true;
  }

  return false;
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
 * Get permission resource and action from permission name
 */
export const parsePermission = (permission: string): { resource: string; action: string } => {
  const [resource, action] = permission.split(':');
  return { resource, action };
};

/**
 * Format permission name for display
 */
export const formatPermissionName = (permission: string): string => {
  const { resource, action } = parsePermission(permission);
  const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1);
  const actionName = action === '*' ? 'All' : action.charAt(0).toUpperCase() + action.slice(1);
  return `${resourceName} - ${actionName}`;
};