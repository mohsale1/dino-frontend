import { apiService } from '../../utils/api';
import { PaginatedResponse } from '../../types';

export interface Role {
  id: string;
  name: string;
  description: string;
  permission_ids: string[];
  permissions?: any[];
  user_count?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoleFilters {
  page?: number;
  page_size?: number;
  search?: string;
}

class RoleService {
  /**
   * Get all roles with pagination
   */
  async getRoles(filters?: RoleFilters): Promise<PaginatedResponse<Role>> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await apiService.get<any>(`/application/roles?${params.toString()}`);

      // Backend returns: { success: true, data: [...roles], pagination: { page, page_size, total, total_pages } }
      if (response && response.data) {
        if (Array.isArray(response.data.data)) {
          const rolesArray = response.data.data;
          return {
            success: true,
            data: rolesArray,
            total: response.data.total || response.data.pagination?.total || 0,
            page: response.data.page || response.data.pagination?.page || 1,
            page_size: response.data.pageSize || response.data.page_size || response.data.pagination?.page_size || 10,
            total_pages: response.data.totalPages || response.data.total_pages || response.data.pagination?.total_pages || 0,
            has_next: response.data.hasNext !== undefined ? response.data.hasNext : (response.data.has_next || false),
            has_prev: response.data.hasPrev !== undefined ? response.data.hasPrev : (response.data.has_prev || false),
          };
        }

        // Fallback: data is directly an array
        if (Array.isArray(response.data)) {
          return {
            success: true,
            data: response.data,
            total: response.data.length,
            page: 1,
            page_size: response.data.length,
            total_pages: 1,
            has_next: false,
            has_prev: false,
          };
        }
      }

      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      };
    } catch (error) {
      // FIX: log error for debugging so callers can see what went wrong
      console.error('RoleService.getRoles error:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false,
      };
    }
  }

  /**
   * Get role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const response = await apiService.get<Role>(`/application/roles/${roleId}`);
      return response.data || null;
    } catch (error) {
      console.error('RoleService.getRole error:', error);
      return null;
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(roleName: string): string {
    const displayNames: Record<string, string> = {
      'superadmin': 'Super Admin',
      'admin': 'Admin',
      'operator': 'Operator',
      'customer': 'Customer',
    };
    return displayNames[roleName.toLowerCase()] || roleName;
  }

  /**
   * Get role color
   */
  getRoleColor(roleName: string): string {
    const colors: Record<string, string> = {
      'superadmin': '#7c3aed',
      'admin': '#dc2626',
      'operator': '#2563eb',
      'customer': '#059669',
    };
    return colors[roleName.toLowerCase()] || '#6b7280';
  }

  /**
   * Get all roles with their permissions.
   * FIX: the /with-permissions endpoint does not exist in the backend.
   * Delegates to GET /application/roles instead and returns the data array.
   */
  async getRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    try {
      const response = await this.getRoles({ page: 1, page_size: 100 });
      if (response.success && response.data) {
        return response.data as unknown as RoleWithPermissions[];
      }
      return [];
    } catch (error) {
      console.error('RoleService.getRolesWithPermissions error:', error);
      return [];
    }
  }
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  user_count: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export const roleService = new RoleService();
export default roleService;
