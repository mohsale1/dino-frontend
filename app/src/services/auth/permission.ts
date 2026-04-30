import { Permission, ROLES, PermissionName, RoleName, AuthUser } from '../../types/auth';
import { isOwner, normalizeRole } from '../../types/auth/roles';
import StorageManager from '../../utils/storage';

class PermissionService {
  /**
   * Get stored permissions from localStorage
   */
  static getStoredPermissions(): { permissions: any[], role: any } | null {
    try {
      const permissionsData = StorageManager.getPermissions();
      if (permissionsData) {
        return {
          permissions: permissionsData.permissions || [],
          role: permissionsData.role || null
        };
      }
    } catch (error) {
      
    }
    return null;
  }

  static hasPermission(user: AuthUser | null, permission: PermissionName): boolean {
    if (!user) return false;

    const stored = this.getStoredPermissions();
    const backendPermissions = stored?.permissions || [];
    const backendRole = stored?.role;

    // Owner gets everything
    if (backendRole && isOwner(backendRole.name)) return true;

    if (backendPermissions.length > 0) {
      // Normalise to colon format — handle both 'resource:action' and 'scope.module.action' dot notation.
      // For dot notation, the last segment is the action and the second-to-last is the resource.
      const permStr = permission as string;
      let colonPerm: string;
      if (permStr.includes(':')) {
        colonPerm = permStr;
      } else {
        const parts = permStr.split('.');
        // e.g. 'application.dashboard.view' -> 'dashboard:view'
        colonPerm = parts.length >= 2
          ? `${parts[parts.length - 2]}:${parts[parts.length - 1]}`
          : permStr;
      }
      const [resource, action] = colonPerm.split(':');

      // Exact match on stored name
      if (backendPermissions.some((p: any) => (p.name ?? `${p.resource}:${p.action}`) === colonPerm)) return true;

      // resource:manage covers read/create/update/delete
      if (backendPermissions.some((p: any) => p.resource === resource && p.action === 'manage')) return true;

      // resource:action match
      if (backendPermissions.some((p: any) => p.resource === resource && p.action === action)) return true;
    }

    return false;
  }



  /**
   * Get backend permissions from localStorage
   */
  static getBackendPermissions(): any[] {
    const stored = this.getStoredPermissions();
    return stored?.permissions || [];
  }

  /**
   * Get backend role information
   */
  static getBackendRole(): any | null {
    const stored = this.getStoredPermissions();
    return stored?.role || null;
  }

  /**
   * Check if user has a specific role (backend-driven)
   */
  static hasRole(user: AuthUser | null, roleName: string | RoleName): boolean {
    if (!user) {
      return false;
    }

    const backendRole = this.getBackendRole();
    if (backendRole) {
      return backendRole.name === roleName || backendRole.name === roleName.toLowerCase();
    }

    return false;
  }

  static getUserPermissions(): Permission[] {
    const backendPermissions = this.getBackendPermissions();
    return backendPermissions.map((p: any) => ({
      id: p.id,
      name: p.name ?? `${p.resource}:${p.action}`,
      resource: p.resource,
      action: p.action,
      description: p.description || `${p.action} ${p.resource}`,
      category: p.category || 'application' as 'system' | 'application',
    }));
  }


  static canAccessRoute(user: AuthUser | null, route: string): boolean {
    if (!user) return false;

    const routePermissions: Record<string, string[]> = {
      '/admin':           ['dashboard:read', 'dashboard:view'],
      '/admin/orders':    ['orders:read',    'orders:view'],
      '/admin/menu':      ['items:read',     'catalog:view'],
      '/admin/tables':    ['tables:read',    'locations:view'],
      '/admin/settings':  ['settings:view',  'workspace:read'],
      '/admin/users':     ['users:read',     'users:view'],
      '/admin/workspace': ['workspace:read', 'workspace:manage'],
      '/admin/coupons':   ['coupons:read',   'coupons:view'],
    };

    const required = routePermissions[route];
    if (!required) return false;

    return required.some(perm => this.hasPermission(user, perm as PermissionName));
  }

  /**
   * Get role definition with display name and other metadata
   */
  static getRoleDefinition(role: string): { id: string; name: string; displayName: string; description: string; permissions: any[] } {
    const normalized = normalizeRole(role);
    
    const roleDefinitions: Record<string, { id: string; name: string; displayName: string; description: string; permissions: any[] }> = {
      [ROLES.OWNER]: { id: ROLES.OWNER, name: ROLES.OWNER, displayName: 'Owner', description: 'Full system access', permissions: [] },
      [ROLES.MANAGER]: { id: ROLES.MANAGER, name: ROLES.MANAGER, displayName: 'Manager', description: 'Management access', permissions: [] },
      [ROLES.USER]: { id: ROLES.USER, name: ROLES.USER, displayName: 'User', description: 'Basic user access', permissions: [] },
    };
    
    if (normalized && roleDefinitions[normalized]) {
      return roleDefinitions[normalized];
    }
    
    return { 
      id: ROLES.USER, 
      name: ROLES.USER, 
      displayName: 'User', 
      description: 'Basic user access', 
      permissions: [] 
    };
  }
}

export default PermissionService;
