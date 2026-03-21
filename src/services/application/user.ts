/**
 * Application User Service
 * Handles API calls for application user management
 */

import { apiService } from '../../utils/api';

export interface ApplicationUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    roleType: number;
  };
  workspaceId: string;
  organizationId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface ApplicationUserCreate {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: string;
  organizationId?: string;
}

export interface ApplicationUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  organizationId?: string;
  isActive?: boolean;
  password?: string;
}

export interface UserFilters {
  workspaceId?: string;
  organizationId?: string;
  roleId?: string;
  isActive?: boolean;
  search?: string;
}

class ApplicationUserService {
  private baseUrl = '/application/users';

  /**
   * Get all application users with pagination and filters
   */
  async getUsers(
    page: number = 1,
    pageSize: number = 100,
    filters?: UserFilters,
    includeDeleted: boolean = false
  ) {
    const params: any = {
      page,
      page_size: pageSize,
      include_deleted: includeDeleted,
      order_by: 'created_at',
      order_direction: 'desc',
    };

    if (filters) {
      if (filters.workspaceId) params.workspace_id = filters.workspaceId;
      if (filters.organizationId) params.organization_id = filters.organizationId;
      if (filters.roleId) params.role_id = filters.roleId;
      if (filters.isActive !== undefined) params.is_active = filters.isActive;
      if (filters.search) params.search = filters.search;
    }

    const response = await apiService.get(this.baseUrl, { params });
    const raw = response.data as any;
    // Handle paginated response: { data: [...], pagination: {...} } or a plain array
    return (Array.isArray(raw) ? raw : raw?.data ?? raw) || [];
  }

  /**
   * Get user by ID
   */
  async getUser(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  /**
   * Create new application user
   */
  async createUser(data: ApplicationUserCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as any;
  }

  /**
   * Update application user
   */
  async updateUser(id: string, data: ApplicationUserUpdate) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return response.data as any;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore soft-deleted user
   */
  async restoreUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  /**
   * Activate user
   */
  async activateUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/activate`, {});
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/deactivate`, {});
  }

  /**
   * Update user role
   */
  async updateUserRole(id: string, roleId: string) {
    await apiService.put(`${this.baseUrl}/${id}/role`, { role_id: roleId });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string) {
    const response = await apiService.get(`${this.baseUrl}/role/${roleId}`);
    return response.data as any;
  }

  /**
   * Get users by workspace
   */
  async getUsersByWorkspace(workspaceId: string) {
    const response = await apiService.get(`${this.baseUrl}/workspace/${workspaceId}`);
    return response.data as any;
  }

  /**
   * Get users by organization
   */
  async getUsersByOrganization(organizationId: string) {
    const response = await apiService.get(`${this.baseUrl}/organization/${organizationId}`);
    return response.data as any;
  }
}

export const applicationUserService = new ApplicationUserService();
export default applicationUserService;
