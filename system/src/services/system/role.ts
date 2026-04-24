/**
 * System Role Service
 * Handles API calls for role management
 *
 * Backend contract (verified from seed-roles.sh):
 *   GET  /system/roles                      → { data: Role[], pagination: {...} }
 *   GET  /system/roles?role_type=0           → { data: Role[], pagination: {...} }  (system roles)
 *   GET  /system/roles?role_type=1           → { data: Role[], pagination: {...} }  (application roles)
 *   GET  /system/roles/{id}                 → Role
 *   POST /system/roles                      → Role   body: { name, description, role_type }
 *   PUT  /system/roles/{id}                 → Role   body: { name?, description?, isActive? }
 *   DELETE /system/roles/{id}
 *   POST /system/roles/{id}/permissions     → body: ["permId1", "permId2", ...]  (integer IDs as strings)
 *   DELETE /system/roles/{id}/permissions   → body: ["permId1", "permId2", ...]
 *
 * IMPORTANT: role IDs and permission IDs are integers on the backend.
 * Always coerce to Number before building path segments or payloads.
 */

import { apiService } from '../../utils/api';

export interface SystemRole {
  id: string;
  name: string;
  description?: string;
  roleType: number; // 0 = System, 1 = Application
  permissions: string[]; // permission IDs (as strings) or names — normalised by extractRoles()
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the roles array from any response shape the backend may return. */
function extractRoles(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.roles)) return data.roles;
  return [];
}

/** Coerce a role/permission id to a safe integer string for URL path segments. */
function toIntId(id: any): string {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid ID: "${id}" is not a valid positive integer`);
  }
  return String(Math.round(n));
}

class SystemRoleService {
  private baseUrl = '/system/roles';

  async getRoles(page: number = 1, pageSize: number = 100, roleType?: number): Promise<any[]> {
    const params: any = {
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc',
    };
    if (roleType !== undefined) params.role_type = roleType;

    const response = await apiService.get(this.baseUrl, { params });
    return extractRoles(response.data);
  }

  async getSystemRoles(): Promise<any[]> {
    const response = await apiService.get(this.baseUrl, { params: { role_type: 0, page: 1, page_size: 100 } });
    return extractRoles(response.data);
  }

  async getApplicationRoles(): Promise<any[]> {
    const response = await apiService.get(this.baseUrl, { params: { role_type: 1, page: 1, page_size: 100 } });
    return extractRoles(response.data);
  }

  async getRole(id: string): Promise<any> {
    const safeId = toIntId(id);
    const response = await apiService.get(`${this.baseUrl}/${safeId}`);
    return response.data;
  }

  async createRole(data: SystemRoleCreate): Promise<any> {
    const response = await apiService.post(this.baseUrl, data);
    return response.data;
  }

  async updateRole(id: string, data: SystemRoleUpdate): Promise<any> {
    const safeId = toIntId(id);
    const response = await apiService.put(`${this.baseUrl}/${safeId}`, data);
    return response.data;
  }

  async deleteRole(id: string): Promise<void> {
    const safeId = toIntId(id);
    await apiService.delete(`${this.baseUrl}/${safeId}`);
  }

  async restoreRole(id: string): Promise<void> {
    const safeId = toIntId(id);
    await apiService.put(`${this.baseUrl}/${safeId}/restore`, {});
  }

  /**
   * Assign permissions to a role.
   * Backend expects a plain JSON array of integer permission IDs.
   * @param id          Role ID (integer)
   * @param permissionIds  Array of permission IDs (integers or integer strings)
   */
  async addPermissions(id: string, permissionIds: (string | number)[]): Promise<void> {
    const safeId = toIntId(id);
    // Coerce each permission ID to an integer
    const ids = permissionIds.map(p => {
      const n = Number(p);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error(`Invalid permission ID: "${p}"`);
      }
      return Math.round(n);
    });
    await apiService.post(`${this.baseUrl}/${safeId}/permissions`, ids);
  }

  /**
   * Remove permissions from a role.
   * Backend expects a plain JSON array of integer permission IDs.
   */
  async removePermissions(id: string, permissionIds: (string | number)[]): Promise<void> {
    const safeId = toIntId(id);
    const ids = permissionIds.map(p => {
      const n = Number(p);
      if (!Number.isFinite(n) || n <= 0) {
        throw new Error(`Invalid permission ID: "${p}"`);
      }
      return Math.round(n);
    });
    await apiService.delete(`${this.baseUrl}/${safeId}/permissions`, { data: ids });
  }

  /**
   * Get permission IDs assigned to a role.
   * Returns a flat array of integer IDs: [1, 5, 12, ...]
   * Endpoint: GET /system/roles/{id}/permissions
   */
  async getRolePermissions(id: any): Promise<number[]> {
    const safeId = toIntId(id);
    const response = await apiService.get(`${this.baseUrl}/${safeId}/permissions`);
    // Response: { success, data: [1, 5, 12] }
    const raw: any = response.data;
    if (Array.isArray(raw)) return (raw as any[]).map(Number);
    if (Array.isArray(raw?.data)) return (raw.data as any[]).map(Number);
    return [];
  }

  async getRoleUsers(id: string): Promise<any> {
    const safeId = toIntId(id);
    const response = await apiService.get(`${this.baseUrl}/${safeId}/users`);
    return response.data;
  }
}

export const systemRoleService = new SystemRoleService();
export default systemRoleService;
