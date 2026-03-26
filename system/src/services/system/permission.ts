/**
 * System Permission Service
 * Handles API calls for permission management
 */

import { apiService } from '../../utils/api';

export interface Permission {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  category: string;
  resource?: string;
  action?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCreate {
  name: string;
  displayName?: string;
  description?: string;
  category: string;
  resource?: string;
  action?: string;
}

export interface PermissionUpdate {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

class SystemPermissionService {
  private baseUrl = '/system/permissions';

  async getPermissions(page: number = 1, pageSize: number = 100, category?: string) {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc',
    };
    
    if (category) {
      params.category = category;
    }

    const response = await apiService.get(this.baseUrl, { params });
    return response.data as any || [];
  }

  async getPermission(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  async createPermission(data: PermissionCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as any;
  }

  async updatePermission(id: string, data: PermissionUpdate) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return response.data as any;
  }

  async deletePermission(id: string) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restorePermission(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  async getCategories() {
    const response = await apiService.get(`${this.baseUrl}/metadata/categories`);
    return response.data as any || [];
  }

  async getResources() {
    const response = await apiService.get(`${this.baseUrl}/metadata/resources`);
    return response.data as any || [];
  }

  async getActions() {
    const response = await apiService.get(`${this.baseUrl}/metadata/actions`);
    return response.data as any || [];
  }
}

export const systemPermissionService = new SystemPermissionService();
export default systemPermissionService;