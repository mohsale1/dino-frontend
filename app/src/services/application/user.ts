/**
 * Application User Service
 * Handles API calls for application user management
 */

import { apiService } from '../../utils/api';

export interface ApplicationUser {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id: number;
  role?: {
    id: number;
    name: string;
    role_type: number;
  };
  workspace_id: number;
  persona_ids?: number[];
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface ApplicationUserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id: number;
  persona_ids?: number[];
}

export interface ApplicationUserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: number;
  password?: string;
}

export interface UserFilters {
  persona_id?: number;
  role_id?: number;
  is_active?: boolean;
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
    };

    if (filters) {
      if (filters.persona_id !== undefined) params.persona_id = filters.persona_id;
      if (filters.role_id !== undefined) params.role_id = filters.role_id;
      if (filters.is_active !== undefined) params.is_active = filters.is_active;
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
  async getUser(id: number) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  /**
   * Create new application user
   */
  async createUser(data: ApplicationUserCreate) {
    const payload: any = {
      email: data.email,
      password: data.password,
      role_id: data.role_id,
    };

    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.persona_ids !== undefined) payload.persona_ids = data.persona_ids;

    const response = await apiService.post(this.baseUrl, payload);
    return response.data as any;
  }

  /**
   * Update application user
   */
  async updateUser(id: number, data: ApplicationUserUpdate) {
    const payload: any = {};
    if (data.email !== undefined) payload.email = data.email;
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.role_id !== undefined) payload.role_id = data.role_id;
    if (data.password !== undefined) payload.password = data.password;

    const response = await apiService.put(`${this.baseUrl}/${id}`, payload);
    return response.data as any;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: number) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Restore soft-deleted user (POST, not PUT)
   */
  async restoreUser(id: number) {
    await apiService.post(`${this.baseUrl}/${id}/restore`, {});
  }

  /**
   * Activate user — backend has no /activate endpoint.
   * Uses PUT /users/{id} with { is_active: true }.
   */
  async activateUser(id: number) {
    await apiService.put(`${this.baseUrl}/${id}`, { is_active: true });
  }

  /**
   * Deactivate user — backend has no /deactivate endpoint.
   * Uses PUT /users/{id} with { is_active: false }.
   */
  async deactivateUser(id: number) {
    await apiService.put(`${this.baseUrl}/${id}`, { is_active: false });
  }

  /**
   * Update user role
   */
  async updateUserRole(id: number, roleId: number) {
    await apiService.put(`${this.baseUrl}/${id}`, { role_id: roleId });
  }
}

export const applicationUserService = new ApplicationUserService();
export default applicationUserService;
