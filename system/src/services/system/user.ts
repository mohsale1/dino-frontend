/**
 * System User Service
 * Handles API calls for system user management.
 * Backend routes are under /system/users/* (apiService baseURL is /api/v1).
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { DEFAULTS } from '../../constants/app';

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

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId?: string;
  organizationId?: string;
  isActive?: boolean;
  password?: string;
}

export interface GetUsersParams {
  workspace_id?: string;
  organization_id?: string;
  skip?: number;
  limit?: number;
}

class SystemUserService {
  async getUsers(pageOrParams?: number | GetUsersParams, limit?: number): Promise<SystemUser[]> {
    let params: GetUsersParams = {};
    if (typeof pageOrParams === 'number') {
      const skip = ((pageOrParams ?? 1) - 1) * (limit ?? DEFAULTS.LARGE_PAGE_SIZE);
      params = { skip, limit: limit ?? DEFAULTS.LARGE_PAGE_SIZE };
    } else if (pageOrParams !== undefined) {
      params = pageOrParams;
    }
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.USERS.BASE, { params });
    return (response.data as SystemUser[]) ?? [];
  }

  async getUser(id: string): Promise<SystemUser> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.USERS.BY_ID(id));
    return response.data as SystemUser;
  }

  async createUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    password: string;
    roleId?: string | number;
    isActive?: boolean;
  }): Promise<SystemUser> {
    const payload = {
      ...data,
      role_id: data.roleId ? Number(data.roleId) : undefined,
    };
    const response = await apiService.post(API_ENDPOINTS.SYSTEM.USERS.BASE, payload);
    return response.data as SystemUser;
  }

  async updateUser(id: string, data: UserUpdateDTO): Promise<SystemUser> {
    const response = await apiService.put(API_ENDPOINTS.SYSTEM.USERS.BY_ID(id), data);
    return response.data as SystemUser;
  }

  async activateUser(id: string): Promise<SystemUser> {
    const response = await apiService.put(API_ENDPOINTS.SYSTEM.USERS.BY_ID(id), { is_active: true });
    return response.data as SystemUser;
  }

  async deactivateUser(id: string): Promise<SystemUser> {
    const response = await apiService.put(API_ENDPOINTS.SYSTEM.USERS.BY_ID(id), { is_active: false });
    return response.data as SystemUser;
  }

  async deleteUser(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.SYSTEM.USERS.BY_ID(id));
  }

  formatUserName(user: Pick<SystemUser, 'firstName' | 'lastName' | 'email'>): string {
    const first = user.firstName?.trim() ?? '';
    const last = user.lastName?.trim() ?? '';
    if (first || last) {
      return `${first} ${last}`.trim();
    }
    return user.email;
  }

  getUserInitials(user: Pick<SystemUser, 'firstName' | 'lastName' | 'email'>): string {
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    if (first) {
      return first[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  }
}

export const systemUserService = new SystemUserService();
export default systemUserService;
