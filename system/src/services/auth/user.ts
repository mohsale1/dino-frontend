import { apiService } from '../../utils/api';
import { DEFAULTS } from '../../constants/app';
import {
  User,
  UserCreate,
  UserUpdate,
  VenueUser,
  PaginatedResponse,
  ApiResponse,
  UserFilters
} from '../../types';

class UserService {
  // =============================================================================
  // USER MANAGEMENT
  // =============================================================================

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.workspaceId) params.append('workspace_id', filters.workspaceId);
      if (filters?.venueId) params.append('venueId', filters.venueId);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.isActive !== undefined) params.append('is_active', filters.isActive.toString());

      const response = await apiService.get<PaginatedResponse<User>>(`/users?${params.toString()}`);

      return response.data || {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: DEFAULTS.DEFAULT_PAGE_SIZE,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    } catch {
      return {
        success: true,
        data: [],
        total: 0,
        page: 1,
        page_size: DEFAULTS.DEFAULT_PAGE_SIZE,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  }

  async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiService.get<User>(`/users/${userId}`);
      return response.data || null;
    } catch {
      return null;
    }
  }

  async getUsersByVenueId(venueId: string): Promise<ApiResponse<VenueUser[]>> {
    try {
      const response = await apiService.get<VenueUser[]>(`/venues/${venueId}/users`);
      return {
        success: true,
        data: response.data || [],
        message: 'Users loaded successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.response?.data?.detail || error.message || 'Failed to load users',
        message: 'Failed to load users for venue'
      };
    }
  }

  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      return await apiService.post<User>('/users', userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create user');
    }
  }

  async updateUser(userId: string, userData: UserUpdate): Promise<ApiResponse<User>> {
    try {
      return await apiService.put<User>(`/users/${userId}`, userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update user');
    }
  }

  async deactivateUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/users/${userId}/deactivate`, {});
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to deactivate user');
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(`/users/${userId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to delete user');
    }
  }

  async activateUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/users/${userId}/activate`, {});
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to activate user');
    }
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      return await apiService.put<void>(`/users/${userId}/password`, {
        password: newPassword
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to update password');
    }
  }

  // =============================================================================
  // USER STATISTICS AND ANALYTICS
  // =============================================================================

  async getUserStatistics(workspaceId?: string, venueId?: string): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Record<string, number>;
    recent_logins: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (workspaceId) params.append('workspace_id', workspaceId);
      if (venueId) params.append('venueId', venueId);

      const response = await apiService.get<{
        total_users: number;
        active_users: number;
        users_by_role: Record<string, number>;
        recent_logins: number;
      }>(`/users/statistics?${params.toString()}`);

      if (response.success && response.data) {
        return response.data;
      }

      return { total_users: 0, active_users: 0, users_by_role: {}, recent_logins: 0 };
    } catch {
      return { total_users: 0, active_users: 0, users_by_role: {}, recent_logins: 0 };
    }
  }
}

export const userService = new UserService();

export type { User, UserCreate, UserUpdate, VenueUser } from '../../types';
