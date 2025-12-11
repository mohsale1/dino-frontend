/**
 * Permission Registry
 * Central registry that maps backend permissions to UI modules, routes, and features
 * This eliminates hardcoded permissions from UI components
 */

import { ReactNode } from 'react';

export interface UIModule {
  id: string;
  label: string;
  path: string;
  icon?: ReactNode;
  requiredPermissions: string[]; // Backend permission names (e.g., "menu.read")
  requiredRoles?: string[]; // Optional role requirements
  children?: UIModule[];
  badge?: string | number;
  flagKey?: string; // Feature flag key
  description?: string;
}

export interface PermissionMapping {
  permission: string; // Backend permission name
  modules: string[]; // UI module IDs that this permission grants access to
  routes: string[]; // Routes that this permission grants access to
  actions: string[]; // UI actions this permission enables
}

/**
 * Permission Registry Class
 * Manages the mapping between backend permissions and UI elements
 */
export class PermissionRegistry {
  private static moduleRegistry: Map<string, UIModule> = new Map();
  private static permissionMappings: Map<string, PermissionMapping> = new Map();
  private static initialized = false;

  /**
   * Initialize the registry with UI modules and permission mappings
   */
  static initialize(): void {
    if (this.initialized) return;

    // Register all UI modules
    this.registerModules();
    
    // Create permission mappings
    this.createPermissionMappings();
    
    this.initialized = true;
  }

  /**
   * Register all UI modules with their permission requirements
   */
  private static registerModules(): void {
    const modules: UIModule[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        requiredPermissions: ['dashboard.read'],
        description: 'Main dashboard with analytics and overview'
      },
      {
        id: 'orders',
        label: 'Orders',
        path: '/admin/orders',
        requiredPermissions: ['order.read'],
        description: 'Order management and tracking',
        children: [
          {
            id: 'orders-active',
            label: 'Active Orders',
            path: '/admin/orders/active',
            requiredPermissions: ['order.read']
          },
          {
            id: 'orders-history',
            label: 'Order History',
            path: '/admin/orders/history',
            requiredPermissions: ['order.read']
          },
          {
            id: 'orders-create',
            label: 'New Order',
            path: '/admin/orders/create',
            requiredPermissions: ['order.create']
          }
        ]
      },
      {
        id: 'menu',
        label: 'Menu',
        path: '/admin/menu',
        requiredPermissions: ['menu.read'],
        description: 'Menu items and categories management',
        children: [
          {
            id: 'menu-items',
            label: 'Menu Items',
            path: '/admin/menu/items',
            requiredPermissions: ['menu.read']
          },
          {
            id: 'menu-categories',
            label: 'Categories',
            path: '/admin/menu/categories',
            requiredPermissions: ['menu.update']
          }
        ]
      },
      {
        id: 'tables',
        label: 'Tables',
        path: '/admin/tables',
        requiredPermissions: ['table.read'],
        description: 'Table management and QR codes',
        children: [
          {
            id: 'tables-management',
            label: 'Table Management',
            path: '/admin/tables/management',
            requiredPermissions: ['table.read']
          },
          {
            id: 'tables-qr',
            label: 'QR Codes',
            path: '/admin/tables/qr',
            requiredPermissions: ['table.update']
          }
        ]
      },
      {
        id: 'coupons',
        label: 'Coupons',
        path: '/admin/coupons',
        requiredPermissions: ['coupon.manage'],
        description: 'Coupon and discount management'
      },
      {
        id: 'menu-template',
        label: 'Menu Template',
        path: '/admin/menu-template',
        requiredPermissions: ['template.read'],
        description: 'Customize menu appearance and theme'
      },
      {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
        requiredPermissions: ['user.read'],
        description: 'User management and permissions',
        children: [
          {
            id: 'users-management',
            label: 'User Management',
            path: '/admin/users/management',
            requiredPermissions: ['user.read']
          },
          {
            id: 'users-permissions',
            label: 'Permissions',
            path: '/admin/users/permissions',
            requiredPermissions: ['user.update']
          }
        ]
      },
      {
        id: 'permissions',
        label: 'Permissions',
        path: '/admin/permissions',
        requiredPermissions: ['user.read'],
        description: 'Role and permission management'
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        requiredPermissions: ['settings.read'],
        description: 'Application and venue settings',
        children: [
          {
            id: 'settings-general',
            label: 'General',
            path: '/admin/settings/general',
            requiredPermissions: ['settings.read']
          },
          {
            id: 'settings-venue',
            label: 'Venue Settings',
            path: '/admin/settings/venue',
            requiredPermissions: ['settings.update']
          }
        ]
      },
      {
        id: 'workspace',
        label: 'Workspace',
        path: '/admin/workspace',
        requiredPermissions: ['workspace.read'],
        requiredRoles: ['superadmin'],
        description: 'Workspace and multi-venue management'
      },
      {
        id: 'code',
        label: 'Code',
        path: '/admin/code',
        requiredPermissions: ['code.manage'],
        description: 'Code management (Dinos role only)'
      }
    ];

    // Register each module
    modules.forEach(module => {
      this.moduleRegistry.set(module.id, module);
      
      // Register children if they exist
      if (module.children) {
        module.children.forEach(child => {
          this.moduleRegistry.set(child.id, child);
        });
      }
    });
  }

  /**
   * Create permission mappings from modules
   */
  private static createPermissionMappings(): void {
    const mappings: PermissionMapping[] = [
      {
        permission: 'dashboard.read',
        modules: ['dashboard'],
        routes: ['/admin'],
        actions: ['view_dashboard', 'view_analytics']
      },
      {
        permission: 'order.read',
        modules: ['orders', 'orders-active', 'orders-history'],
        routes: ['/admin/orders', '/admin/orders/active', '/admin/orders/history'],
        actions: ['view_orders', 'view_order_details']
      },
      {
        permission: 'order.create',
        modules: ['orders-create'],
        routes: ['/admin/orders/create'],
        actions: ['create_order']
      },
      {
        permission: 'order.update',
        modules: ['orders'],
        routes: ['/admin/orders'],
        actions: ['update_order', 'change_order_status']
      },
      {
        permission: 'order.delete',
        modules: ['orders'],
        routes: ['/admin/orders'],
        actions: ['delete_order', 'cancel_order']
      },
      {
        permission: 'menu.read',
        modules: ['menu', 'menu-items'],
        routes: ['/admin/menu', '/admin/menu/items'],
        actions: ['view_menu', 'view_menu_items']
      },
      {
        permission: 'menu.create',
        modules: ['menu'],
        routes: ['/admin/menu'],
        actions: ['create_menu_item', 'create_category']
      },
      {
        permission: 'menu.update',
        modules: ['menu', 'menu-categories'],
        routes: ['/admin/menu', '/admin/menu/categories'],
        actions: ['update_menu_item', 'update_category']
      },
      {
        permission: 'menu.delete',
        modules: ['menu'],
        routes: ['/admin/menu'],
        actions: ['delete_menu_item', 'delete_category']
      },
      {
        permission: 'table.read',
        modules: ['tables', 'tables-management'],
        routes: ['/admin/tables', '/admin/tables/management'],
        actions: ['view_tables', 'view_table_status']
      },
      {
        permission: 'table.create',
        modules: ['tables'],
        routes: ['/admin/tables'],
        actions: ['create_table']
      },
      {
        permission: 'table.update',
        modules: ['tables', 'tables-qr'],
        routes: ['/admin/tables', '/admin/tables/qr'],
        actions: ['update_table', 'generate_qr']
      },
      {
        permission: 'table.delete',
        modules: ['tables'],
        routes: ['/admin/tables'],
        actions: ['delete_table']
      },
      {
        permission: 'coupon.manage',
        modules: ['coupons'],
        routes: ['/admin/coupons'],
        actions: ['view_coupons', 'create_coupon', 'update_coupon', 'delete_coupon']
      },
      {
        permission: 'template.read',
        modules: ['menu-template'],
        routes: ['/admin/menu-template'],
        actions: ['view_template']
      },
      {
        permission: 'template.update',
        modules: ['menu-template'],
        routes: ['/admin/menu-template'],
        actions: ['update_template', 'customize_theme']
      },
      {
        permission: 'user.read',
        modules: ['users', 'users-management', 'permissions'],
        routes: ['/admin/users', '/admin/users/management', '/admin/permissions'],
        actions: ['view_users', 'view_permissions']
      },
      {
        permission: 'user.create',
        modules: ['users'],
        routes: ['/admin/users'],
        actions: ['create_user', 'invite_user']
      },
      {
        permission: 'user.update',
        modules: ['users', 'users-permissions'],
        routes: ['/admin/users', '/admin/users/permissions'],
        actions: ['update_user', 'assign_role', 'update_permissions']
      },
      {
        permission: 'user.delete',
        modules: ['users'],
        routes: ['/admin/users'],
        actions: ['delete_user', 'deactivate_user']
      },
      {
        permission: 'settings.read',
        modules: ['settings', 'settings-general'],
        routes: ['/admin/settings', '/admin/settings/general'],
        actions: ['view_settings']
      },
      {
        permission: 'settings.update',
        modules: ['settings', 'settings-venue'],
        routes: ['/admin/settings', '/admin/settings/venue'],
        actions: ['update_settings', 'configure_venue']
      },
      {
        permission: 'workspace.read',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['view_workspace', 'view_venues']
      },
      {
        permission: 'workspace.create',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['create_workspace', 'create_venue']
      },
      {
        permission: 'workspace.update',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['update_workspace', 'update_venue']
      },
      {
        permission: 'workspace.manage',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['switch_workspace', 'switch_venue']
      },
      {
        permission: 'venue.read',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['view_venue_details']
      },
      {
        permission: 'venue.update',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['update_venue_status', 'activate_venue', 'deactivate_venue']
      },
      {
        permission: 'venue.manage',
        modules: ['workspace'],
        routes: ['/admin/workspace'],
        actions: ['switch_venue']
      },
      {
        permission: 'code.manage',
        modules: ['code'],
        routes: ['/admin/code'],
        actions: ['view_code', 'update_code']
      }
    ];

    // Register each mapping
    mappings.forEach(mapping => {
      this.permissionMappings.set(mapping.permission, mapping);
    });
  }

  /**
   * Get all registered modules
   */
  static getAllModules(): UIModule[] {
    this.initialize();
    return Array.from(this.moduleRegistry.values());
  }

  /**
   * Get module by ID
   */
  static getModule(moduleId: string): UIModule | undefined {
    this.initialize();
    return this.moduleRegistry.get(moduleId);
  }

  /**
   * Get modules accessible with given permissions
   */
  static getAccessibleModules(userPermissions: string[], userRole?: string): UIModule[] {
    this.initialize();
    
    const allModules = this.getAllModules();
    
    return allModules.filter(module => {
      // Check role requirement first - if module requires specific roles
      if (module.requiredRoles && module.requiredRoles.length > 0) {
        // User must have one of the required roles
        if (!userRole || !module.requiredRoles.includes(userRole.toLowerCase())) {
          return false;
        }
        // If role matches and no additional permissions required, grant access
        if (module.requiredPermissions.length === 0) {
          return true;
        }
        // Role matches, now check permissions below
      }

      // Check if user has any of the required permissions (if any are required)
      if (module.requiredPermissions.length === 0) {
        // No permissions required AND no role requirements (or role already matched above)
        // Only grant access if there were no role requirements
        return !module.requiredRoles || module.requiredRoles.length === 0;
      }
      
      return module.requiredPermissions.some(requiredPerm => 
        this.hasPermission(userPermissions, requiredPerm)
      );
    });
  }

  /**
   * Get routes accessible with given permissions
   */
  static getAccessibleRoutes(userPermissions: string[]): string[] {
    this.initialize();
    
    const accessibleRoutes = new Set<string>();
    
    userPermissions.forEach(permission => {
      const mapping = this.permissionMappings.get(permission);
      if (mapping) {
        mapping.routes.forEach(route => accessibleRoutes.add(route));
      }
    });
    
    return Array.from(accessibleRoutes);
  }

  /**
   * Check if user can access a specific route
   */
  static canAccessRoute(userPermissions: string[], route: string, userRole?: string): boolean {
    this.initialize();
    
    // Find module for this route
    const module = Array.from(this.moduleRegistry.values()).find(m => m.path === route);
    
    if (!module) {
      return false; // Route not registered
    }

    // Check role requirement
    if (module.requiredRoles && module.requiredRoles.length > 0) {
      if (!userRole || !module.requiredRoles.includes(userRole.toLowerCase())) {
        return false;
      }
      // If role matches and no permissions required, grant access
      if (module.requiredPermissions.length === 0) {
        return true;
      }
    }

    // Check permissions (if any are required)
    if (module.requiredPermissions.length === 0) {
      return true; // No permissions required
    }
    
    return module.requiredPermissions.some(requiredPerm => 
      this.hasPermission(userPermissions, requiredPerm)
    );
  }

  /**
   * Check if user can perform an action
   */
  static canPerformAction(userPermissions: string[], action: string): boolean {
    this.initialize();
    
    for (const mapping of this.permissionMappings.values()) {
      if (mapping.actions.includes(action)) {
        if (this.hasPermission(userPermissions, mapping.permission)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Helper: Check if user has a specific permission
   * Supports exact match and wildcard matching (e.g., "menu.manage" grants all menu permissions)
   */
  private static hasPermission(userPermissions: string[], requiredPermission: string): boolean {
    // Check for exact match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for manage permission (e.g., "menu.manage" grants "menu.read", "menu.create", etc.)
    const [resource] = requiredPermission.split('.');
    const managePermission = `${resource}.manage`;
    if (userPermissions.includes(managePermission)) {
      return true;
    }

    return false;
  }

  /**
   * Get permission mapping for a specific permission
   */
  static getPermissionMapping(permission: string): PermissionMapping | undefined {
    this.initialize();
    return this.permissionMappings.get(permission);
  }

  /**
   * Get all actions user can perform
   */
  static getUserActions(userPermissions: string[]): string[] {
    this.initialize();
    
    const actions = new Set<string>();
    
    userPermissions.forEach(permission => {
      const mapping = this.permissionMappings.get(permission);
      if (mapping) {
        mapping.actions.forEach(action => actions.add(action));
      }
    });
    
    return Array.from(actions);
  }

  /**
   * Clear the registry (useful for testing)
   */
  static clear(): void {
    this.moduleRegistry.clear();
    this.permissionMappings.clear();
    this.initialized = false;
  }
}

// Auto-initialize on module load
PermissionRegistry.initialize();

export default PermissionRegistry;