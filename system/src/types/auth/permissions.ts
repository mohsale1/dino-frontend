/**
 * Permission Types and Helpers
 *
 * Permissions are driven entirely by the backend response.
 * Format: "resource:action"  e.g. "dashboard:view", "users:read", "roles:update"
 * There is NO category/scope prefix — the backend emits bare resource:action strings.
 *
 * Action types:
 *   - view         : sidebar module visibility (UI-only gate)
 *   - read         : data access
 *   - create       : create records
 *   - update       : edit records
 *   - delete       : remove records
 *   - subscription, moderate, manage, status, payment : domain-specific actions
 */

export interface Permission {
  id: string;
  name: string;
  resource: string; // Format: resource:action (e.g. "users:read")
  action: string;
  description: string;
  category: 'system' | 'application';
}

export type PermissionName = string;

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
 * Parse a colon-notation permission string (resource:action) into its parts.
 */
export const parsePermission = (permission: string): { resource: string; action: string } => {
  const [resource, action] = permission.split(':');
  return { resource, action };
};

/**
 * Format a colon-notation permission string for display.
 * e.g. 'users:read' -> 'Users - Read'
 */
export const formatPermissionName = (permission: string): string => {
  const { resource, action } = parsePermission(permission);
  const resourceName = resource ? resource.charAt(0).toUpperCase() + resource.slice(1) : '';
  const actionName   = action   ? action.charAt(0).toUpperCase()   + action.slice(1)   : '';
  return `${resourceName} - ${actionName}`;
};
