/**
 * System Workspace Service
 * Handles API calls for workspace management.
 * Backend routes are under /system/workspaces/* (apiService baseURL is /api/v1).
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { DEFAULTS } from '../../constants/app';

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

export interface WorkspaceCreateDTO {
  name: string;
  description?: string;
  ownerId?: string;
}

export interface WorkspaceUpdateDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

class SystemWorkspaceService {
  async getWorkspaces(skip: number = 0, limit: number = DEFAULTS.LARGE_PAGE_SIZE): Promise<Workspace[]> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.WORKSPACES.BASE, {
      params: { skip, limit },
    });
    return (response.data as Workspace[]) ?? [];
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.WORKSPACES.BY_ID(id));
    return (response.data as Workspace) ?? null;
  }

  async createWorkspace(data: WorkspaceCreateDTO): Promise<Workspace | null> {
    const response = await apiService.post(API_ENDPOINTS.SYSTEM.WORKSPACES.BASE, data);
    return (response.data as Workspace) ?? null;
  }

  async updateWorkspace(id: string, data: WorkspaceUpdateDTO): Promise<Workspace | null> {
    const response = await apiService.put(API_ENDPOINTS.SYSTEM.WORKSPACES.BY_ID(id), data);
    return (response.data as Workspace) ?? null;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    const response = await apiService.delete(API_ENDPOINTS.SYSTEM.WORKSPACES.BY_ID(id));
    return response.success;
  }
}

export const systemWorkspaceService = new SystemWorkspaceService();
export default systemWorkspaceService;
