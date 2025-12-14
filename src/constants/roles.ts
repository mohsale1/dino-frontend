/**
 * Role Constants and Utilities
 * 
 * Centralized role definitions matching backend (create-roles.sh)
 * ONLY 4 roles: superadmin, admin, operator, dinos
 */

// Role Names - Matches create-roles.sh exactly
export const ROLE_NAMES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  DINOS: 'dinos',
} as const;

// Type for role names
export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES];

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<RoleName, number> = {
  [ROLE_NAMES.OPERATOR]: 1,
  [ROLE_NAMES.ADMIN]: 2,
  [ROLE_NAMES.SUPERADMIN]: 3,
  [ROLE_NAMES.DINOS]: 4, // Highest - platform access
} as const;

// Role Display Names
export const ROLE_DISPLAY_NAMES: Record<RoleName, string> = {
  [ROLE_NAMES.SUPERADMIN]: 'Super Administrator',
  [ROLE_NAMES.ADMIN]: 'Administrator',
  [ROLE_NAMES.OPERATOR]: 'Operator',
  [ROLE_NAMES.DINOS]: 'Dinos Platform',
} as const;

// ============================================================================
// ROLE CHECKING FUNCTIONS
// ============================================================================

/**
 * Check if role is SuperAdmin
 */
export const isSuperAdmin = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLE_NAMES.SUPERADMIN;
};

/**
 * Check if role is Admin
 */
export const isAdmin = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLE_NAMES.ADMIN;
};

/**
 * Check if role is Operator
 */
export const isOperator = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLE_NAMES.OPERATOR;
};

/**
 * Check if role is Dinos platform role
 */
export const isDinos = (role?: string | null): boolean => {
  if (!role) return false;
  return role.toLowerCase().trim() === ROLE_NAMES.DINOS;
};

/**
 * Check if role has admin-level access (Admin, SuperAdmin, or Dinos)
 */
export const isAdminLevel = (role?: string | null): boolean => {
  if (!role) return false;
  return isAdmin(role) || isSuperAdmin(role) || isDinos(role);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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

// ============================================================================
// ROLE ASSIGNMENT
// ============================================================================

// Available roles for assignment
export const ASSIGNABLE_ROLES: readonly RoleName[] = [
  ROLE_NAMES.OPERATOR,
  ROLE_NAMES.ADMIN,
  ROLE_NAMES.SUPERADMIN,
] as const;

// Roles that can be assigned by different user levels
export const ROLE_ASSIGNMENT_PERMISSIONS: Record<RoleName, readonly RoleName[]> = {
  [ROLE_NAMES.DINOS]: [ROLE_NAMES.SUPERADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.OPERATOR, ROLE_NAMES.DINOS],
  [ROLE_NAMES.SUPERADMIN]: [ROLE_NAMES.ADMIN, ROLE_NAMES.OPERATOR],
  [ROLE_NAMES.ADMIN]: [ROLE_NAMES.OPERATOR],
  [ROLE_NAMES.OPERATOR]: [],
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
// ROLE VALIDATION
// ============================================================================

/**
 * Check if a string is a valid role
 */
export const isValidRole = (role?: string | null): role is RoleName => {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return Object.values(ROLE_NAMES).includes(normalized as RoleName);
};

/**
 * Get all available roles
 */
export const getAllRoles = (): readonly RoleName[] => {
  return Object.values(ROLE_NAMES);
};