/**
 * System Role Service
 * Handles API calls for role management
 */

import { apiService } from '../../utils/api';

export interface SystemRole {
  id: string;
  name: string;
  description?: string;
  roleType: number; // 0 = System, 1 = Application
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SystemRoleCreate {
  name: string;
  description?: string;
  roleType: number;
  permissions?: string[];
}

export interface SystemRoleUpdate {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

class SystemRoleService {
  private baseUrl = '/system/roles';

  async getRoles(page: number = 1, pageSize: number = 100, roleType?: number) {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc',
    };
    
    if (roleType !== undefined) {
      params.role_type = roleType;
    }

    const response = await apiService.get(this.baseUrl, { params });
    return response.data as any || [];
  }

  async getSystemRoles() {
    const response = await apiService.get(`${this.baseUrl}/system`);
    return response.data as any || [];
  }

  async getApplicationRoles() {
    const response = await apiService.get(`${this.baseUrl}/application`);
    return response.data as any || [];
  }

  async getRole(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  async createRole(data: SystemRoleCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as any;
  }

  async updateRole(id: string, data: SystemRoleUpdate) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return response.data as any;
  }

  async deleteRole(id: string) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restoreRole(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  async addPermissions(id: string, permissions: string[]) {
    await apiService.post(`${this.baseUrl}/${id}/permissions`, permissions);
  }

  async removePermissions(id: string, permissions: string[]) {
    await apiService.delete(`${this.baseUrl}/${id}/permissions`, {
      data: permissions,
    });
  }

  async getRoleUsers(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}/users`);
    return response.data as any;
  }
}

export const systemRoleService = new SystemRoleService();
export default systemRoleService;