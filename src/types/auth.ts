export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: Permission[];
  workspaceId?: string;
  venueId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: RoleName | string;
  displayName: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ============================================================================
// PERMISSION CONSTANTS (using dot notation to match backend)
// ============================================================================

export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard.read',
  
  // Orders permissions
  ORDERS_VIEW: 'order.read',
  ORDERS_UPDATE: 'order.update',
  ORDERS_CREATE: 'order.create',
  ORDERS_DELETE: 'order.delete',
  
  // Menu permissions
  MENU_VIEW: 'menu.read',
  MENU_UPDATE: 'menu.update',
  MENU_CREATE: 'menu.create',
  MENU_DELETE: 'menu.delete',
  
  // Coupons permissions
  COUPONS_MANAGE: 'coupon.manage',
  
  // Tables permissions
  TABLES_VIEW: 'table.read',
  TABLES_UPDATE: 'table.update',
  TABLES_CREATE: 'table.create',
  TABLES_DELETE: 'table.delete',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  
  // User management permissions
  USERS_VIEW: 'user.read',
  USERS_UPDATE: 'user.update',
  USERS_CREATE: 'user.create',
  USERS_DELETE: 'user.delete',
  
  // Workspace permissions
  WORKSPACE_VIEW: 'workspace.read',
  WORKSPACE_UPDATE: 'workspace.update',
  WORKSPACE_CREATE: 'workspace.create',
  WORKSPACE_DELETE: 'workspace.delete',
  WORKSPACE_SWITCH: 'workspace.manage',
  
  // Venue management permissions
  VENUE_ACTIVATE: 'venue.update',
  VENUE_DEACTIVATE: 'venue.update',
  VENUE_VIEW_ALL: 'venue.read',
  VENUE_SWITCH: 'venue.manage',
  
  // Template permissions
  TEMPLATE_VIEW: 'template.read',
  TEMPLATE_UPDATE: 'template.update',
  TEMPLATE_CREATE: 'template.create',
  TEMPLATE_DELETE: 'template.delete',
} as const;

// ============================================================================
// ROLE DEFINITIONS (matches backend create-roles.sh)
// ============================================================================

export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  DINOS: 'dinos', // Platform access
} as const;

export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type RoleName = typeof ROLES[keyof typeof ROLES];

// Ensure proper typing for role names
export type SuperAdminRole = typeof ROLES.SUPERADMIN;
export type AdminRole = typeof ROLES.ADMIN;
export type OperatorRole = typeof ROLES.OPERATOR;
export type DinosRole = typeof ROLES.DINOS;

// ============================================================================
// ROLE UTILITIES
// ============================================================================

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  [ROLES.OPERATOR]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPERADMIN]: 3,
  [ROLES.DINOS]: 4, // Highest - platform access
} as const;

// Role Display Names
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.SUPERADMIN]: 'Super Administrator',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.OPERATOR]: 'Operator',
  [ROLES.DINOS]: 'Dinos Platform',
} as const;

/**
 * Check if role is SuperAdmin
 */
export const isSuperAdmin = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLES.SUPERADMIN;
};

/**
 * Check if role is Admin
 */
export const isAdmin = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLES.ADMIN;
};

/**
 * Check if role is Operator
 */
export const isOperator = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLES.OPERATOR;
};

/**
 * Check if role is Dinos platform role
 */
export const isDinos = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLES.DINOS;
};

/**
 * Check if role has admin-level access (Admin, SuperAdmin, or Dinos)
 */
export const isAdminLevel = (role?: string | null): boolean => {
  if (!role) return false;
  return isAdmin(role) || isSuperAdmin(role) || isDinos(role);
};

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role?: string | null): string => {
  if (!role) return 'Unknown';
  const normalized = role.toLowerCase().trim() as RoleName;
  return ROLE_DISPLAY_NAMES[normalized] || role;
};

/**
 * Get hierarchy level for a role
 */
export const getRoleHierarchy = (role?: string | null): number => {
  if (!role) return 0;
  const normalized = role.toLowerCase().trim() as RoleName;
  return ROLE_HIERARCHY[normalized] || 0;
};

/**
 * Check if user role has higher or equal hierarchy than required role
 */
export const hasHigherOrEqualRole = (userRole?: string | null, requiredRole?: string | null): boolean => {
  if (!userRole || !requiredRole) return false;
  return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
};

/**
 * Check if role can access admin features
 */
export const canAccessAdminFeatures = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

/**
 * Check if role can manage users
 */
export const canManageUsers = (role?: string | null): boolean => {
  return isSuperAdmin(role) || isAdmin(role) || isDinos(role);
};

/**
 * Check if role can manage menu
 */
export const canManageMenu = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

/**
 * Check if role can manage orders
 */
export const canManageOrders = (role?: string | null): boolean => {
  return isOperator(role) || isAdminLevel(role);
};

/**
 * Check if role can view analytics
 */
export const canViewAnalytics = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

/**
 * Check if a string is a valid role
 */
export const isValidRole = (role?: string | null): role is RoleName => {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return Object.values(ROLES).includes(normalized as RoleName);
};

/**
 * Get all available roles
 */
export const getAllRoles = (): readonly RoleName[] => {
  return Object.values(ROLES);
};

// Available roles for assignment
export const ASSIGNABLE_ROLES: readonly RoleName[] = [
  ROLES.OPERATOR,
  ROLES.ADMIN,
  ROLES.SUPERADMIN,
] as const;

// Roles that can be assigned by different user levels
export const ROLE_ASSIGNMENT_PERMISSIONS: Record<RoleName, readonly RoleName[]> = {
  [ROLES.DINOS]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.OPERATOR, ROLES.DINOS],
  [ROLES.SUPERADMIN]: [ROLES.ADMIN, ROLES.OPERATOR],
  [ROLES.ADMIN]: [ROLES.OPERATOR],
  [ROLES.OPERATOR]: [],
} as const;

/**
 * Check if assigner can assign target role
 */
export const canAssignRole = (assignerRole?: string | null, targetRole?: string | null): boolean => {
  if (!assignerRole || !targetRole) return false;
  const normalized = assignerRole.toLowerCase().trim() as RoleName;
  const permissions = ROLE_ASSIGNMENT_PERMISSIONS[normalized];
  return permissions ? permissions.includes(targetRole.toLowerCase().trim() as RoleName) : false;
};

// ============================================================================
// WORKSPACE AND VENUE INTERFACES
// ============================================================================

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  workspaceId: string;
  ownerId: string;
  logo?: string;
  isActive: boolean;
  isOpen: boolean;
  openingHours?: OpeningHours;
  settings: VenueSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

export interface VenueSettings {
  currency: string;
  timezone: string;
  orderTimeout: number;
  allowOnlineOrders: boolean;
  requireCustomerInfo: boolean;
}