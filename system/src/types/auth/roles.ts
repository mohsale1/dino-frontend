/**
 * Role Types, Constants, and Utilities
 *
 * Defines all role-related types, constants, hierarchy, and utility functions
 * for role-based access control (RBAC).
 *
 * Application Roles (roleType=1): Owner, Manager, User
 * System      Roles (roleType=0): SuperAdmin, Admin, Operator
 */

// ============================================================================
// APPLICATION ROLE DEFINITIONS
// ============================================================================

export const ROLES = {
  OWNER:   'Owner',
  MANAGER: 'Manager',
  USER:    'User',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export type OwnerRole   = typeof ROLES.OWNER;
export type ManagerRole = typeof ROLES.MANAGER;
export type UserRole    = typeof ROLES.USER;

// ============================================================================
// SYSTEM ROLE DEFINITIONS
// ============================================================================

export const SYSTEM_ROLES = {
  SUPERADMIN: 'SuperAdmin',
  ADMIN:      'Admin',
  OPERATOR:   'Operator',
} as const;

export type SystemRoleName = typeof SYSTEM_ROLES[keyof typeof SYSTEM_ROLES];

// ============================================================================
// APPLICATION ROLE HIERARCHY AND DISPLAY
// ============================================================================

export const ROLE_HIERARCHY: Record<RoleName, number> = {
  [ROLES.USER]:    1,
  [ROLES.MANAGER]: 2,
  [ROLES.OWNER]:   3,
} as const;

export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLES.OWNER]:   'Owner',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.USER]:    'User',
} as const;

export const ASSIGNABLE_ROLES: readonly RoleName[] = [
  ROLES.USER,
  ROLES.MANAGER,
  ROLES.OWNER,
] as const;

export const ROLE_ASSIGNMENT_PERMISSIONS: Record<RoleName, readonly RoleName[]> = {
  [ROLES.OWNER]:   [ROLES.OWNER, ROLES.MANAGER, ROLES.USER],
  [ROLES.MANAGER]: [ROLES.USER],
  [ROLES.USER]:    [],
} as const;

// ============================================================================
// SYSTEM ROLE HIERARCHY AND DISPLAY
// ============================================================================

export const SYSTEM_ROLE_HIERARCHY: Record<SystemRoleName, number> = {
  [SYSTEM_ROLES.OPERATOR]:   1,
  [SYSTEM_ROLES.ADMIN]:      2,
  [SYSTEM_ROLES.SUPERADMIN]: 3,
} as const;

export const SYSTEM_ROLE_DISPLAY_NAMES: Record<SystemRoleName, string> = {
  [SYSTEM_ROLES.SUPERADMIN]: 'Super Admin',
  [SYSTEM_ROLES.ADMIN]:      'Admin',
  [SYSTEM_ROLES.OPERATOR]:   'Operator',
} as const;

// ============================================================================
// APPLICATION ROLE CHECK UTILITIES
// ============================================================================

/**
 * Normalize application role name to standard format.
 * Only maps application roles â€” does NOT map system roles.
 */
export const normalizeRole = (role?: string | object | null): RoleName | null => {
  if (!role) return null;

  const roleStr = typeof role === 'object' ? (role as any)?.name : role;
  if (!roleStr || typeof roleStr !== 'string') return null;

  const normalized = roleStr.trim().toLowerCase();

  if (normalized === 'owner') return ROLES.OWNER;
  if (normalized === 'manager' || normalized === 'administrator') return ROLES.MANAGER;
  if (normalized === 'user' || normalized === 'staff') return ROLES.USER;

  return null;
};

export const isOwner = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.OWNER;
};

export const isManager = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.MANAGER;
};

export const isUser = (role?: string | null): boolean => {
  const normalized = normalizeRole(role);
  return normalized === ROLES.USER;
};

export const isAdminLevel = (role?: string | null): boolean => {
  return isOwner(role) || isManager(role);
};

export const isValidRole = (role?: string | null): role is RoleName => {
  return normalizeRole(role) !== null;
};

// ============================================================================
// SYSTEM ROLE CHECK UTILITIES
// ============================================================================

/**
 * Normalize system role name to standard format.
 * Independent from application role normalizer.
 */
export const normalizeSystemRole = (role?: string | object | null): SystemRoleName | null => {
  if (!role) return null;

  const roleStr = typeof role === 'object' ? (role as any)?.name : role;
  if (!roleStr || typeof roleStr !== 'string') return null;

  const normalized = roleStr.trim().toLowerCase();

  if (normalized === 'superadmin' || normalized === 'super_admin') return SYSTEM_ROLES.SUPERADMIN;
  if (normalized === 'admin')                                       return SYSTEM_ROLES.ADMIN;
  if (normalized === 'operator')                                    return SYSTEM_ROLES.OPERATOR;

  return null;
};

export const isSuperAdmin = (role?: string | null): boolean => {
  return normalizeSystemRole(role) === SYSTEM_ROLES.SUPERADMIN;
};

export const isAdmin = (role?: string | null): boolean => {
  return normalizeSystemRole(role) === SYSTEM_ROLES.ADMIN;
};

export const isOperator = (role?: string | null): boolean => {
  return normalizeSystemRole(role) === SYSTEM_ROLES.OPERATOR;
};

export const isValidSystemRole = (role?: string | null): role is SystemRoleName => {
  return normalizeSystemRole(role) !== null;
};

// ============================================================================
// APPLICATION ROLE INFORMATION UTILITIES
// ============================================================================

export const getRoleDisplayName = (role?: string | null): string => {
  const normalized = normalizeRole(role);
  if (!normalized) return 'Unknown';
  return ROLE_DISPLAY_NAMES[normalized];
};

export const getRoleHierarchy = (role?: string | null): number => {
  const normalized = normalizeRole(role);
  if (!normalized) return 0;
  return ROLE_HIERARCHY[normalized];
};

export const getAllRoles = (): readonly RoleName[] => {
  return Object.values(ROLES);
};

// ============================================================================
// SYSTEM ROLE INFORMATION UTILITIES
// ============================================================================

export const getSystemRoleDisplayName = (role?: string | null): string => {
  const normalized = normalizeSystemRole(role);
  if (!normalized) return 'Unknown';
  return SYSTEM_ROLE_DISPLAY_NAMES[normalized];
};

export const getSystemRoleHierarchy = (role?: string | null): number => {
  const normalized = normalizeSystemRole(role);
  if (!normalized) return 0;
  return SYSTEM_ROLE_HIERARCHY[normalized];
};

export const getAllSystemRoles = (): readonly SystemRoleName[] => {
  return Object.values(SYSTEM_ROLES);
};

// ============================================================================
// APPLICATION ROLE COMPARISON UTILITIES
// ============================================================================

export const hasHigherOrEqualRole = (userRole?: string | null, requiredRole?: string | null): boolean => {
  if (!userRole || !requiredRole) return false;
  return getRoleHierarchy(userRole) >= getRoleHierarchy(requiredRole);
};

export const canAssignRole = (assignerRole?: string | null, targetRole?: string | null): boolean => {
  const normalizedAssigner = normalizeRole(assignerRole);
  const normalizedTarget   = normalizeRole(targetRole);

  if (!normalizedAssigner || !normalizedTarget) return false;

  const permissions = ROLE_ASSIGNMENT_PERMISSIONS[normalizedAssigner];
  return permissions ? permissions.includes(normalizedTarget) : false;
};

// ============================================================================
// PERMISSION CHECK UTILITIES
// ============================================================================

export const canAccessAdminFeatures = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

export const canManageUsers = (role?: string | null): boolean => {
  return isOwner(role) || isManager(role);
};

export const canManageItems = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

export const canManageOrders = (role?: string | null): boolean => {
  return isAdminLevel(role) || isUser(role);
};

export const canViewAnalytics = (role?: string | null): boolean => {
  return isAdminLevel(role);
};

// ============================================================================
// LEGACY COMPATIBILITY ALIASES
// ============================================================================

/** @deprecated Use isOwner() for application roles */
export const isAppOwner = isOwner;
/** @deprecated Use isManager() for application roles */
export const isAppManager = isManager;
/** @deprecated Use isUser() for application roles */
export const isAppUser = isUser;