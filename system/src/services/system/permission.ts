/**
 * System Permission Service
 * Handles API calls for permission management
 *
 * Backend contract (verified from seed-permissions.sh):
 *   GET  /system/permissions                        → { data: Permission[], pagination: {...} }
 *   GET  /system/permissions/{id}                   → Permission
 *   POST /system/permissions                        → Permission
 *   PUT  /system/permissions/{id}                   → Permission
 *   DELETE /system/permissions/{id}
 *   GET  /system/permissions/metadata/categories    → string[]
 *   GET  /system/permissions/metadata/resources     → string[]
 *   GET  /system/permissions/metadata/actions       → string[]
 *
 * Permission IDs are integers on the backend.
 */

import { apiService } from '../../utils/api';

export interface Permission {
  id: string;           // integer ID as string
  name: string;         // dot-notation: "system.dashboard.view"
  displayName?: string;
  description?: string;
  category: string;     // "system" | "application"
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

// ---------------------------------------------------------------------------
// Helper — extract array from any response shape
// ---------------------------------------------------------------------------
function extractPermissions(data: any): Permission[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.permissions)) return data.permissions;
  return [];
}

function toIntId(id: any): string {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid permission ID: "${id}"`);
  }
  return String(Math.round(n));
}

class SystemPermissionService {
  private baseUrl = '/system/permissions';

  /**
   * Fetch all permissions, auto-paginating if needed.
   * Returns a flat array of Permission objects.
   */
  async getPermissions(page: number = 1, pageSize: number = 200, category?: string): Promise<Permission[]> {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc',
    };
    if (category) params.category = category;

    const response = await apiService.get(this.baseUrl, { params });
    return extractPermissions(response.data);
  }

  async getPermission(id: string): Promise<Permission> {
    const safeId = toIntId(id);
    const response = await apiService.get(`${this.baseUrl}/${safeId}`);
    return response.data as Permission;
  }

  async createPermission(data: PermissionCreate): Promise<Permission> {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as Permission;
  }

  async updatePermission(id: string, data: PermissionUpdate): Promise<Permission> {
    const safeId = toIntId(id);
    const response = await apiService.put(`${this.baseUrl}/${safeId}`, data);
    return response.data as Permission;
  }

  async deletePermission(id: string): Promise<void> {
    const safeId = toIntId(id);
    await apiService.delete(`${this.baseUrl}/${safeId}`);
  }

  async restorePermission(id: string): Promise<void> {
    const safeId = toIntId(id);
    await apiService.put(`${this.baseUrl}/${safeId}/restore`, {});
  }

  async getCategories(): Promise<string[]> {
    const response = await apiService.get(`${this.baseUrl}/metadata/categories`);
    return (response.data as any) || [];
  }

  async getResources(): Promise<string[]> {
    const response = await apiService.get(`${this.baseUrl}/metadata/resources`);
    return (response.data as any) || [];
  }

  async getActions(): Promise<string[]> {
    const response = await apiService.get(`${this.baseUrl}/metadata/actions`);
    return (response.data as any) || [];
  }
}

export const systemPermissionService = new SystemPermissionService();
export default systemPermissionService;