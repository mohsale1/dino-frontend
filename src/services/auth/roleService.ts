import { apiService } from '../../utils/api';
import { ApiResponse, PaginatedResponse } from '../../types/api';

export interface Role {
  id: string;
  name: string;
  description: string;
  permission_ids: string[];
  permissions?: any[];
  user_count?: number;
  created_at: string;
  updated_at: string;
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

      const response = await apiService.get<PaginatedResponse<Role>>(`/roles?${params.toString()}`);
      
      return response.data || {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    } catch (error) {
      console.error('Error fetching roles:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  /**
   * Get role by ID
   */
  async getRole(roleId: string): Promise<Role | null> {
    try {
      const response = await apiService.get<Role>(`/roles/${roleId}`);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching role:', error);
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
      'customer': 'Customer'
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
      'customer': '#059669'
    };
    return colors[roleName.toLowerCase()] || '#6b7280';
  }
}

export const roleService = new RoleService();
export default roleService;
