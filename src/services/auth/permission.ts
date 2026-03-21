import { Permission, UserRoleObject, PERMISSIONS, ROLES, PermissionName, RoleName, AuthUser } from '../../types/auth';
import { isOwner, isManager, isUser, normalizeRole, getRoleDisplayName as getDisplayName } from '../../types/auth/roles';
import StorageManager from '../../utils/storage';
import { apiService } from '../../utils/api';

class PermissionService {
  private static permissionsCache: Map<string, { permissions: any[], role: any, timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get user permissions — reads from localStorage cache populated by Auth context.
   * The Auth context derives permissions from user.role.permissions (IDs resolved via
   * /system/permissions) on every login and page load. This method simply reads that
   * cached result so other parts of the app can access it synchronously.
   *
   * NOTE: The /auth/permissions endpoint does not exist on the backend.
   * Permissions are embedded in the login/me response as user.role.permissions.
   */
  static async fetchUserPermissions(forceRefresh: boolean = false): Promise<{ permissions: any[], role: any } | null> {
    // Always read from the localStorage cache that Auth context maintains.
    // forceRefresh is a no-op here — the Auth context handles re-fetching via refreshPermissions().
    return this.getStoredPermissions();
  }


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
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: AuthUser | null, permissions: PermissionName[]): boolean {
    if (!user) {
      return false;
    }

    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: AuthUser | null, permissions: PermissionName[]): boolean {
    if (!user) {
      return false;
    }

    return permissions.every(permission => this.hasPermission(user, permission));
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
   * Get user's role from backend
   */
  static getUserRole(user: AuthUser | null): any | null {
    if (!user) {
      return null;
    }

    return this.getBackendRole();
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
   * Get allowed routes for user
   */
  static getAllowedRoutes(user: AuthUser | null): string[] {
    if (!user) return [];

    const allRoutes = [
      '/admin',
      '/admin/orders',
      '/admin/menu',
      '/admin/tables',
      '/admin/settings',
      '/admin/users',
      '/admin/workspace',
      '/admin/coupons',
    ];

    return allRoutes.filter(route => this.canAccessRoute(user, route));
  }

  /**
   * Check if user can perform an action on a resource
   */
  static canPerformAction(user: AuthUser | null, resource: string, action: string): boolean {
    if (!user) {
      return false;
    }

    const permission = `${resource}.${action}` as PermissionName;
    return this.hasPermission(user, permission);
  }

  /**
   * Get user's permissions for a specific resource
   */
  static getResourcePermissions(user: AuthUser | null, resource: string): Permission[] {
    if (!user) {
      return [];
    }

    const allPermissions = this.getUserPermissions();
    return allPermissions.filter(p => p.resource === resource);
  }

  /**
   * Check if user is Owner
   */
  static isOwner(user: AuthUser | null): boolean {
    if (!user) return false;
    const backendRole = this.getBackendRole();
    if (backendRole) {
      return isOwner(backendRole.name);
    }
    return isOwner(user.role);
  }

  /**
   * Check if user is Manager
   */
  static isManager(user: AuthUser | null): boolean {
    if (!user) return false;
    const backendRole = this.getBackendRole();
    if (backendRole) {
      return isManager(backendRole.name);
    }
    return isManager(user.role);
  }

  /**
   * Check if user is User
   */
  static isUser(user: AuthUser | null): boolean {
    if (!user) return false;
    const backendRole = this.getBackendRole();
    if (backendRole) {
      return isUser(backendRole.name);
    }
    return isUser(user.role);
  }

  /**
   * Get user's permissions as readable list
   */
  static getUserPermissionsList(user: AuthUser | null): string[] {
    if (!user) {
      return [];
    }
    
    const permissions = this.getUserPermissions();
    return permissions.map(p => p.description || p.name);
  }

  /**
   * Check if user can manage workspace
   */
  static canManageWorkspace(user: AuthUser | null): boolean {
    return this.isOwner(user) || this.hasPermission(user, PERMISSIONS.WORKSPACE_UPDATE);
  }

  /**
   * Check if user can switch cafes
   */
  static canSwitchCafe(user: AuthUser | null): boolean {
    return this.isOwner(user) || this.hasPermission(user, 'venue.manage' as PermissionName);
  }

  /**
   * Check if user can activate/deactivate cafe
   */
  static canManageCafeStatus(user: AuthUser | null): boolean {
    return this.isOwner(user) || this.hasPermission(user, 'venue.update' as PermissionName);
  }

  // =============================================================================
  // USER MANAGEMENT FOR PERMISSIONS
  // =============================================================================

  /**
   * Get users for the current venue with their roles and permissions
   */
  static async getVenueUsers(venueId?: string): Promise<any[]> {
    try {
      const { userService } = await import('./user');
      
      if (!venueId) {
        const userData = StorageManager.getUserData();
        venueId = userData?.venue?.id;
      }

      if (!venueId) {
        return [];
      }

      const response = await userService.getUsersByVenueId(venueId);
      
      if (response.success && response.data) {
        const usersWithPermissions = response.data.map((user: any) => ({
          id: user.id,
          firstName: user.firstName || user.firstName,
          lastName: user.lastName || user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roleDisplayName: user.role_display_name || this.getRoleDisplayName(user.role),
          isActive: user.isActive !== undefined ? user.isActive : (user.status === 'active'),
          status: user.status || (user.isActive ? 'active' : 'inactive'),
          lastLogin: user.last_login ? new Date(user.last_login) : null,
          permissions: [], // Permissions are now fetched per user from backend
          venueId: user.venueId || user.venueId,
          workspaceId: user.workspaceId || user.workspaceId,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
        }));

        return usersWithPermissions;
      } else {
        return [];
      }
    } catch (error) {
      
      return [];
    }
  }

  /**
   * Get role display name for UI
   */
  static getRoleDisplayName(role: string): string {
    return getDisplayName(role);
  }

  /**
   * Get user statistics for permissions dashboard
   */
  static async getUserStatistics(venueId?: string): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentLogins: number;
  }> {
    try {
      const users = await this.getVenueUsers(venueId);
      
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.isActive).length;
      
      const usersByRole: Record<string, number> = {};
      users.forEach(user => {
        const role = user.role || 'unknown';
        usersByRole[role] = (usersByRole[role] || 0) + 1;
      });
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogins = users.filter(u => {
        if (!u.lastLogin) return false;
        const loginDate = new Date(u.lastLogin);
        const isRecent = loginDate > oneDayAgo;
        console.log(`User ${u.email}: lastLogin=${u.lastLogin}, loginDate=${loginDate}, oneDayAgo=${oneDayAgo}, isRecent=${isRecent}`);
        return isRecent;
      }).length;
      
      console.log(`Recent logins calculation: ${recentLogins} users logged in within last 24 hours`);
      
      return {
        totalUsers,
        activeUsers,
        usersByRole,
        recentLogins
      };
    } catch (error) {
      
      return {
        totalUsers: 0,
        activeUsers: 0,
        usersByRole: {},
        recentLogins: 0
      };
    }
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
  
  /**
   * Get user permissions from role (for backward compatibility)
   */
  static getUserPermissionsFromRole(role: string): any[] {
    // This is a placeholder - actual permissions come from backend
    // Return empty array as permissions are fetched from backend
    return [];
  }
}

export default PermissionService;
