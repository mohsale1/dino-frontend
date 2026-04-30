/**
 * Application User Service
 * Handles API calls for user management.
 * Base URL: /api/v1 (set in apiService) — all paths start with /application/users.
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

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
  venue_ids?: number[];
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface ApplicationUserCreate {
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  password: string;
  role_id?: number;
  venue_ids?: number[];
}

export interface ApplicationUserUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role_id?: number;
  venue_ids?: number[];
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface PaginatedUsers {
  data: ApplicationUser[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

const BASE = API_ENDPOINTS.APPLICATION.USERS.BASE;

class ApplicationUserService {
  async getUsers(
    page: number = 1,
    pageSize: number = 100,
    filters?: UserFilters & Record<string, any>
  ): Promise<PaginatedUsers> {
    const params: Record<string, unknown> = { page, page_size: pageSize };

    if (filters) {
      if (filters.search !== undefined && filters.search !== '') params.search = filters.search;
      if (filters.role_id !== undefined) params.role_id = filters.role_id;
      if (filters.is_active !== undefined) params.is_active = filters.is_active;
      // Pass through any extra filters (workspaceId, organizationId, etc.)
      const { search, role_id, is_active, ...extra } = filters;
      Object.assign(params, extra);
    }

    const response = await apiService.get<any>(BASE, { params });
    const raw = response.data as any;

    // Handle flat array response: { success, message, data: [...] }
    if (Array.isArray(raw)) {
      return { data: raw, pagination: { page, page_size: pageSize, total: raw.length, total_pages: 1 } };
    }

    // Handle paginated response: { data: [...], pagination: {...} }
    if (raw && Array.isArray(raw.data)) {
      return raw as PaginatedUsers;
    }

    // Fallback — empty result
    return { data: [], pagination: { page, page_size: pageSize, total: 0, total_pages: 0 } };
  }


  /**
   * POST /application/users — create a new user.
   */
  async createUser(data: ApplicationUserCreate): Promise<ApplicationUser> {
    const payload: Record<string, unknown> = {
      email: data.email,
      password: data.password,
    };

    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.role_id !== undefined) payload.role_id = data.role_id;
    if (data.venue_ids !== undefined) payload.venue_ids = data.venue_ids;

    const response = await apiService.post<ApplicationUser>(BASE, payload);
    return response.data as ApplicationUser;
  }

  /**
   * GET /application/users/{id} — fetch a single user by ID.
   */
  async getUser(id: number): Promise<ApplicationUser> {
    const response = await apiService.get<ApplicationUser>(API_ENDPOINTS.APPLICATION.USERS.BY_ID(id));
    return response.data as ApplicationUser;
  }

  /**
   * PUT /application/users/{id} — update user fields.
   */
  async updateUser(id: number, data: ApplicationUserUpdate): Promise<ApplicationUser> {
    const payload: Record<string, unknown> = {};

    if (data.email !== undefined) payload.email = data.email;
    if (data.first_name !== undefined) payload.first_name = data.first_name;
    if (data.last_name !== undefined) payload.last_name = data.last_name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.role_id !== undefined) payload.role_id = data.role_id;
    if (data.venue_ids !== undefined) payload.venue_ids = data.venue_ids;

    const response = await apiService.put<ApplicationUser>(API_ENDPOINTS.APPLICATION.USERS.BY_ID(id), payload);
    return response.data as ApplicationUser;
  }

  /**
   * PUT /application/users/{id} with { is_active: false } — deactivate a user account.
   * The backend has no dedicated /deactivate endpoint; use the standard update endpoint.
   */
  async deactivateUser(id: number): Promise<void> {
    await apiService.put(API_ENDPOINTS.APPLICATION.USERS.BY_ID(id), { is_active: false });
  }

  /**
   * PUT /application/users/{id} with { is_active: true } — activate a user account.
   * The backend has no dedicated /activate endpoint; use the standard update endpoint.
   */
  async activateUser(id: number): Promise<void> {
    await apiService.put(API_ENDPOINTS.APPLICATION.USERS.BY_ID(id), { is_active: true });
  }

  /**
   * DELETE /application/users/{id} — soft delete a user.
   */
  async deleteUser(id: number): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.USERS.BY_ID(id));
  }

  // NOTE: updateUserPassword has been removed. The backend exposes no
  // /application/users/{id}/password endpoint. Password changes for admin
  // operations are not supported via this service.

  /**
   * GET /application/users/me/data — fetch the current authenticated user's profile.
   */
  async getMyData(): Promise<ApplicationUser> {
    const response = await apiService.get<ApplicationUser>(API_ENDPOINTS.APPLICATION.USERS.ME_DATA);
    return response.data as ApplicationUser;
  }

  // NOTE: refreshMyData has been removed — /users/me/refresh-data does not exist on the backend.
  // NOTE: getMyStatistics has been removed — /users/me/statistics does not exist on the backend.
}

export const applicationUserService = new ApplicationUserService();
export default applicationUserService;
