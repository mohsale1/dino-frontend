import { User, Permission, UserRole, PERMISSIONS, ROLES, PermissionName, RoleName } from '../../types/auth';
import StorageManager from '../../utils/storage';
import { apiService } from '../../utils/api';
import { authService } from './authService';

class PermissionService {
  private static permissionsCache: Map<string, { permissions: any[], role: any, timestamp: number }> = new Map();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Fetch user permissions from backend API
   */
  static async fetchUserPermissions(forceRefresh: boolean = false): Promise<{ permissions: any[], role: any } | null> {
    try {
      const userId = StorageManager.getUserId();
      if (!userId) {
        return null;
      }

      // Check cache first
      const cached = this.permissionsCache.get(userId);
      if (!forceRefresh && cached && (Date.now() - cached.timestamp < this.CACHE_DURATION)) {
        return { permissions: cached.permissions, role: cached.role };
      }

      // Fetch from API
      const response = await apiService.get<{ permissions: any[], role: any }>('/auth/permissions');
      
      if (response.success && response.data) {
        const { permissions, role } = response.data;
        
        // Cache the result
        this.permissionsCache.set(userId, {
          permissions: permissions || [],
          role: role || null,
          timestamp: Date.now()
        });

        // Store in localStorage for offline access
        StorageManager.setPermissions({
          permissions: permissions || [],
          role: role || null,
          userId,
          timestamp: new Date().toISOString()
        });

        return { permissions: permissions || [], role: role || null };
      }

      return null;
    } catch (error) {
      return this.getStoredPermissions();
    }
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
  static hasPermission(user: User | null, permission: PermissionName): boolean {
    if (!user) {
      return false;
    }

    // Get backend permissions
    const stored = this.getStoredPermissions();
    const backendPermissions = stored?.permissions || [];
    const backendRole = stored?.role;
    
    // If user is superadmin, grant all permissions
    if (backendRole && backendRole.name === 'superadmin') {
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
  static hasAnyPermission(user: User | null, permissions: PermissionName[]): boolean {
    if (!user) {
      return false;
    }

    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: User | null, permissions: PermissionName[]): boolean {
    if (!user) {
      return false;
    }

    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has a specific role (backend-driven)
   */
  static hasRole(user: User | null, roleName: string | RoleName): boolean {
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
  static getUserRole(user: User | null): any | null {
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
      scope: p.scope
    }));
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(user: User | null, route: string): boolean {
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
  static getAllowedRoutes(user: User | null): string[] {
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
  static canPerformAction(user: User | null, resource: string, action: string): boolean {
    if (!user) {
      return false;
    }

    const permission = `${resource}.${action}` as PermissionName;
    return this.hasPermission(user, permission);
  }

  /**
   * Get user's permissions for a specific resource
   */
  static getResourcePermissions(user: User | null, resource: string): Permission[] {
    if (!user) {
      return [];
    }

    const allPermissions = this.getUserPermissions();
    return allPermissions.filter(p => p.resource === resource);
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: User | null): boolean {
    return this.hasRole(user, ROLES.ADMIN);
  }

  /**
   * Check if user is operator
   */
  static isOperator(user: User | null): boolean {
    return this.hasRole(user, ROLES.OPERATOR);
  }

  /**
   * Check if user is superadmin
   */
  static isSuperAdmin(user: User | null): boolean {
    return this.hasRole(user, ROLES.SUPERADMIN);
  }

  /**
   * Get user's permissions as readable list
   */
  static getUserPermissionsList(user: User | null): string[] {
    if (!user) {
      return [];
    }
    
    const permissions = this.getUserPermissions();
    return permissions.map(p => p.description || p.name);
  }

  /**
   * Check if user can manage workspace
   */
  static canManageWorkspace(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.hasPermission(user, PERMISSIONS.WORKSPACE_UPDATE);
  }

  /**
   * Check if user can switch cafes
   */
  static canSwitchCafe(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.hasPermission(user, 'venue.manage' as PermissionName);
  }

  /**
   * Check if user can activate/deactivate cafe
   */
  static canManageCafeStatus(user: User | null): boolean {
    return this.isSuperAdmin(user) || this.hasPermission(user, 'venue.update' as PermissionName);
  }

  // =============================================================================
  // USER MANAGEMENT FOR PERMISSIONS
  // =============================================================================

  /**
   * Get users for the current venue with their roles and permissions
   */
  static async getVenueUsers(venueId?: string): Promise<any[]> {
    try {
      const { userService } = await import('./userService');
      
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
    const roleDisplayMap: Record<string, string> = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator', 
      'operator': 'Operator',
      'staff': 'Staff',
      'customer': 'Customer',
      'manager': 'Manager'
    };
    
    return roleDisplayMap[role?.toLowerCase()] || role || 'Unknown Role';
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
    const roleDefinitions: Record<string, { id: string; name: string; displayName: string; description: string; permissions: any[] }> = {
      'superadmin': { id: 'superadmin', name: 'superadmin', displayName: 'Super Administrator', description: 'Full system access', permissions: [] },
      'admin': { id: 'admin', name: 'admin', displayName: 'Administrator', description: 'Venue administration', permissions: [] },
      'operator': { id: 'operator', name: 'operator', displayName: 'Operator', description: 'Order management', permissions: [] },
      'staff': { id: 'staff', name: 'staff', displayName: 'Staff', description: 'Basic staff access', permissions: [] },
      'customer': { id: 'customer', name: 'customer', displayName: 'Customer', description: 'Customer access', permissions: [] },
      'manager': { id: 'manager', name: 'manager', displayName: 'Manager', description: 'Manager access', permissions: [] }
    };
    
    const roleName = role?.toLowerCase() || 'unknown';
    return roleDefinitions[roleName] || { 
      id: roleName, 
      name: roleName, 
      displayName: role || 'Unknown Role', 
      description: 'Custom role', 
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