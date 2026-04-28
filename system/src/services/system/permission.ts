/**
 * System Permission Service
 *
 * Backend routes (base: /api/v1, prefix already set in apiService):
 *   GET    /system/permissions          params: role_type?, resource?
 *   POST   /system/permissions          body: PermissionCreateDTO { name, resource, action }
 *   DELETE /system/permissions/{id}
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

export interface Permission {
  id: string;
  name: string;
  resource?: string;
  action?: string;
}

export interface PermissionCreateDTO {
  name: string;
  resource: string;
  action: string;
}

export interface PermissionListParams {
  role_type?: string;
  resource?: string;
}

function extractPermissions(data: unknown): Permission[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Permission[];
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj['data'])) return obj['data'] as Permission[];
    if (Array.isArray(obj['permissions'])) return obj['permissions'] as Permission[];
  }
  return [];
}

class SystemPermissionService {
  async getPermissions(pageOrParams?: number | PermissionListParams, limit?: number): Promise<Permission[]> {
    let params: PermissionListParams | undefined;
    if (typeof pageOrParams === 'number') {
      // Called as getPermissions(page, limit) — positional convention used by RolesPermissions
      // The backend filter params don't include pagination, so we just call without params
      params = undefined;
    } else {
      params = pageOrParams;
    }
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.PERMISSIONS.BASE, { params });
    return extractPermissions(response.data);
  }

  async createPermission(data: PermissionCreateDTO): Promise<Permission> {
    const response = await apiService.post(API_ENDPOINTS.SYSTEM.PERMISSIONS.BASE, data);
    return response.data as Permission;
  }

  async deletePermission(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.SYSTEM.PERMISSIONS.BY_ID(id));
  }
}

export const systemPermissionService = new SystemPermissionService();
export default systemPermissionService;
