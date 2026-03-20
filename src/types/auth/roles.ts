/**
 * Role Types, Constants, and Utilities
 * 
 * Defines all role-related types, constants, hierarchy, and utility functions
 * for role-based access control (RBAC).
 * 
 * Application Roles: Owner, Manager, User
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

export const ROLES = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  USER: 'User',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

// Ensure proper typing for role names
export type OwnerRole = typeof ROLES.OWNER;
export type ManagerRole = typeof ROLES.MANAGER;
export type UserRole = typeof ROLES.USER;

// ============================================================================
// ROLE HIERARCHY AND DISPLAY
// ============================================================================

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  [ROLES.USER]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.OWNER]: 3,
} as const;

// Role Display Names
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.OWNER]: 'Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.USER]: 'User',
} as const;

// Available roles for assignment
export const ASSIGNABLE_ROLES: readonly RoleName[] = [
  ROLES.USER,
  ROLES.MANAGER,
  ROLES.OWNER,
] as const;

// Roles that can be assigned by different user levels
export const ROLE_ASSIGNMENT_PERMISSIONS: Record<RoleName, readonly RoleName[]> = {
  [ROLES.OWNER]: [ROLES.OWNER, ROLES.MANAGER, ROLES.USER],
  [ROLES.MANAGER]: [ROLES.USER],
  [ROLES.USER]: [],
} as const;

// ============================================================================
// ROLE CHECK UTILITIES
// ============================================================================

/**
 * Normalize role name to standard format
 */
export const normalizeRole = (role?: string | object | null): RoleName | null => {
  if (!role) return null;

  // Backend may pass the full role object — extract the name string
  const roleStr = typeof role === 'object' ? (role as any)?.name : role;
  if (!roleStr || typeof roleStr !== 'string') return null;

  const normalized = roleStr.trim().toLowerCase();
  
  // Map various formats to standard roles
  if (normalized === 'owner') return ROLES.OWNER;
  if (normalized === 'manager' || normalized === 'admin' || normalized === 'administrator') return ROLES.MANAGER;
  if (normalized === 'user' || normalized === 'operator' || normalized === 'staff') return ROLES.USER;
  
  // Legacy role mappings
  if (normalized === 'superadmin' || normalized === 'super_admin') return ROLES.OWNER;
  
  return null;
};

/**
 * Check if role is Owner
 */
export const isOwner = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.OWNER;
};

/**
 * Check if role is Manager
 */
export const isManager = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.MANAGER;
};

/**
 * Check if role is User
 */
export const isUser = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.USER;
};

/**
 * Check if role has admin-level access (Owner or Manager)
 */
export const isAdminLevel = (role?: string | null): boolean => {
  return isOwner(role) || isManager(role);
};

/**
 * Check if a string is a valid role
 */
export const isValidRole = (role?: string | null): role is RoleName => {
  return normalizeRole(role) !== null;
};

// ============================================================================
// ROLE INFORMATION UTILITIES
// ============================================================================

/**
 * Get display name for a role
 */
export const getRoleDisplayName = (role?: string | null): string => {
  const normalized = normalizeRole(role);
  if (!normalized) return 'Unknown';
  return ROLE_DISPLAY_NAMES[normalized];
};

/**
 * Get hierarchy level for a role
 */
export const getRoleHierarchy = (role?: string | null): number => {
  const normalized = normalizeRole(role);
  if (!normalized) return 0;
  return ROLE_HIERARCHY[normalized];
};

/**
 * Get all available roles
 */
export const getAllRoles = (): readonly RoleName[] => {
  return Object.values(ROLES);
};

// ============================================================================
// ROLE COMPARISON UTILITIES
// ============================================================================

/**
 * Check if user role has higher or equal hierarchy than required role
 */
export const hasHigherOrEqualRole = (userRole?: string | null, requiredRole?: string | null): boolean => {
  if (!userRole || !requiredRole) return false;
  return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
};

/**
 * Check if assigner can assign target role
 */
export const canAssignRole = (assignerRole?: string | null, targetRole?: string | null): boolean => {
  const normalizedAssigner = normalizeRole(assignerRole);
  const normalizedTarget = normalizeRole(targetRole);
  
  if (!normalizedAssigner || !normalizedTarget) return false;
  
  const permissions = ROLE_ASSIGNMENT_PERMISSIONS[normalizedAssigner];
  return permissions ? permissions.includes(normalizedTarget) : false;
};

// ============================================================================
// PERMISSION CHECK UTILITIES
// ============================================================================

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
  return isOwner(role) || isManager(role);
};

/**
 * Check if role can manage items
 */
export const canManageItems = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

/**
 * Check if role can manage orders
 */
export const canManageOrders = (role?: string | null): boolean => {
  return isAdminLevel(role) || isUser(role);
};

/**
 * Check if role can view analytics
 */
export const canViewAnalytics = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

// Aliases for backward compatibility
export const isSuperAdmin = isOwner;
export const isAdmin = isManager;
export const isOperator = isUser;
