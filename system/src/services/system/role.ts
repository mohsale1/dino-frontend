/**
 * System Role Service
 *
 * Backend routes (apiService baseURL = /api/v1):
 *
 * Roles:
 *   GET    /system/roles                          → Role[]
 *   POST   /system/roles                          → Role         body: SystemRoleCreateDTO | ApplicationRoleCreateDTO
 *   DELETE /system/roles/{id}
 *   GET    /system/roles/{id}/permissions         → number[]
 *   POST   /system/roles/{id}/permissions         body: { permission_ids: number[] }
 *   DELETE /system/roles/{id}/permissions         body: { permission_ids: number[] }
 *   GET    /system/roles/{id}/users               → User[]
 */

import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

// ---------------------------------------------------------------------------
// DTOs — Role
// ---------------------------------------------------------------------------

export interface SystemRoleCreateDTO {
  name: string;
  description?: string;
}

export interface ApplicationRoleCreateDTO {
  name: string;
  description?: string;
  workspace_id?: string;
  organization_id?: string;
}

// ---------------------------------------------------------------------------
// DTOs — Role Assignment (kept for type compatibility)
// ---------------------------------------------------------------------------

export interface SystemRoleAssignmentDTO {
  user_id: string;
  role_name: string;
}

export interface ApplicationRoleAssignmentDTO {
  user_id: string;
  role_name: string;
  workspace_id?: string;
  organization_id?: string;
}

export interface BulkRoleAssignmentDTO {
  assignments: Array<SystemRoleAssignmentDTO | ApplicationRoleAssignmentDTO>;
}

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface SystemRole {
  id: string;
  name: string;
  description?: string;
  role_type?: number;
  roleType?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRole {
  id: string;
  name: string;
  description?: string;
  workspace_id?: string;
  organization_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleAssignment {
  id: string;
  user_id: string;
  role_name: string;
  workspace_id?: string;
  organization_id?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractArray(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any).data)) return (data as any).data;
  return [];
}

// ---------------------------------------------------------------------------
// Role Service
// ---------------------------------------------------------------------------

class SystemRoleService {
  // ---- Roles ----------------------------------------------------------------

  async getSystemRoles(): Promise<SystemRole[]> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.ROLES.BASE);
    return extractArray(response.data) as SystemRole[];
  }

  async getApplicationRoles(params?: {
    workspace_id?: string;
    organization_id?: string;
  }): Promise<ApplicationRole[]> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.ROLES.BASE, { params });
    return extractArray(response.data) as ApplicationRole[];
  }

  async createSystemRole(data: SystemRoleCreateDTO): Promise<SystemRole> {
    const response = await apiService.post(API_ENDPOINTS.SYSTEM.ROLES.BASE, data);
    return response.data as SystemRole;
  }

  async createApplicationRole(data: ApplicationRoleCreateDTO): Promise<ApplicationRole> {
    const response = await apiService.post(API_ENDPOINTS.SYSTEM.ROLES.BASE, data);
    return response.data as ApplicationRole;
  }

  async deleteRole(id: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.SYSTEM.ROLES.BY_ID(id));
  }

  async getRoles(page?: number, limit?: number): Promise<SystemRole[]> {
    const roles = await this.getSystemRoles();
    return roles.map((role) => ({
      ...role,
      roleType: role.role_type ?? role.roleType ?? 0,
    }));
  }

  async getRolePermissions(roleId: string | number): Promise<number[]> {
    const response = await apiService.get(API_ENDPOINTS.SYSTEM.ROLES.PERMISSIONS(roleId));
    return extractArray(response.data) as number[];
  }

  async addPermissions(roleId: string | number, permissionIds: string[]): Promise<void> {
    await apiService.post(API_ENDPOINTS.SYSTEM.ROLES.PERMISSIONS(roleId), {
      permission_ids: permissionIds.map(Number),
    });
  }

  async removePermissions(roleId: string | number, permissionIds: string[]): Promise<void> {
    await apiService.delete(API_ENDPOINTS.SYSTEM.ROLES.PERMISSIONS(roleId), {
      data: { permission_ids: permissionIds.map(Number) },
    });
  }
}

export const systemRoleService = new SystemRoleService();
export default systemRoleService;
