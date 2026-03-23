/**
 * System Workspace Service
 * Handles API calls for workspace management
 */

import { apiService } from '../../utils/api';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  ownerId?: string;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  isActive?: boolean;
}

class SystemWorkspaceService {
  private baseUrl = '/system/workspaces';

  async getWorkspaces(page: number = 1, pageSize: number = 100, includeDeleted: boolean = false) {
    const response = await apiService.get(this.baseUrl, {
      params: {
        page,
        page_size: pageSize,
        include_deleted: includeDeleted,
        order_by: 'created_at',
        order_direction: 'desc',
      },
    });
    // Backend returns { success, message, data: [...workspaces...], pagination }
    // apiService already transforms to camelCase
    return (response.data as any) || [];
  }

  async getWorkspace(id: string) {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return (response.data as any) || null;
  }

  async createWorkspace(data: WorkspaceCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return (response.data as any) || null;
  }

  async updateWorkspace(id: string, data: WorkspaceUpdate) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return (response.data as any) || null;
  }

  async deleteWorkspace(id: string) {
    const response = await apiService.delete(`${this.baseUrl}/${id}`);
    return response.success;
  }

  async restoreWorkspace(id: string) {
    const response = await apiService.put(`${this.baseUrl}/${id}/restore`, {});
    return response.success;
  }
}

export const systemWorkspaceService = new SystemWorkspaceService();
export default systemWorkspaceService;