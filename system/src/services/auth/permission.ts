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

  /**
   * Check if user has a specific permission (backend-driven)
   */
  static hasPermission(user: AuthUser | null, permission: PermissionName): boolean {
    if (!user) {
      return false;
    }

    // Get backend permissions
    const stored = this.getStoredPermissions();
    const backendPermissions = stored?.permissions || [];
    const backendRole = stored?.role;
    
    // If user is Owner, grant all permissions
    if (backendRole && isOwner(backendRole.name)) {
      return true;
    }

    // Check if permission exists in backend permissions
    if (backendPermissions.length > 0) {
      // Check for exact match (e.g., "menu.create")
      const hasExactMatch = backendPermissions.some((p: any) => p.name === permission);
      if (hasExactMatch) {
        return true;
      }

      // Check for manage permission (e.g., "menu.manage" grants all menu permissions)
      const [resource, action] = permission.split('.');
      const hasManagePermission = backendPermissions.some((p: any) => 
        p.resource === resource && p.action === 'manage'
      );
      if (hasManagePermission) {
        return true;
      }

      // Check by resource and action
      const hasResourceAction = backendPermissions.some((p: any) => 
        p.resource === resource && p.action === action
      );
      if (hasResourceAction) {
        return true;
      }
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

  /**
   * Get permissions for current user
   */
  static getUserPermissions(): Permission[] {
    const backendPermissions = this.getBackendPermissions();
    
    // Transform backend permissions to frontend Permission format
    return backendPermissions.map((p: any) => ({
      id: p.id,
      name: p.name,
      resource: p.resource,
      action: p.action,
      description: p.description || `${p.action} ${p.resource}`,
      category: p.category || (p.name.startsWith('system:') ? 'system' : 'application') as 'system' | 'application'
    }));
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: AuthUser | null, route: string): boolean {
    if (!user) return false;

    // Route-based access control using backend permissions
    const routePermissions: Record<string, string[]> = {
      '/admin': ['dashboard.read'],
      '/admin/orders': ['order.read'],
      '/admin/menu': ['menu.read'],
      '/admin/tables': ['table.read'],
      '/admin/settings': ['settings.read'],
      '/admin/users': ['user.read'],
      '/admin/workspace': ['workspace.read'],
      '/admin/coupons': ['coupon.read'],
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) {
      return false;
    }

    return requiredPermissions.some(perm => this.hasPermission(user, perm as PermissionName));
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
