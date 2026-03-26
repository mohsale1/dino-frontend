/**
 * System User Service
 * Handles API calls for system user management
 */

import { apiService } from '../../utils/api';

export interface SystemUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
    displayName?: string;
    roleType?: number;
  };
  workspaceId?: string;
  organizationId?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  workspaceIds?: string[];
}

export interface SystemUserCreate {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: string;
  organizationId?: string;
}

export interface SystemUserUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  organizationId?: string;
  isActive?: boolean;
  password?: string;
}

class SystemUserService {
  private baseUrl = '/system/users';

  async getUsers(page: number = 1, pageSize: number = 100, includeDeleted: boolean = false) {
    const response = await apiService.get(this.baseUrl, {
      params: {
        page,
        page_size: pageSize,
        include_deleted: includeDeleted,
        order_by: 'created_at',
        order_direction: 'desc',
      },
    });
    return response.data as any || [];
  }

  async getUser(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  async createUser(data: SystemUserCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as any;
  }

  async updateUser(id: string, data: SystemUserUpdate) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return response.data as any;
  }

  async deleteUser(id: string) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restoreUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  async activateUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/activate`, {});
  }

  async deactivateUser(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/deactivate`, {});
  }

  async updateUserRole(id: string, roleId: string) {
    await apiService.put(`${this.baseUrl}/${id}/role`, { role_id: roleId });
  }
}

export const systemUserService = new SystemUserService();
export default systemUserService;