/**
 * System Registration Code Service
 * Handles API calls for registration code management
 */

import { apiService } from '../../utils/api';

export interface RegistrationCode {
  id: string;
  code: string;
  workspaceId: string;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationCodeCreate {
  workspaceId: string;
  maxUses?: number;
  expiresInDays?: number;
}

class SystemRegistrationService {
  private baseUrl = '/system/registration/codes';

  async getCodes(page: number = 1, pageSize: number = 100, includeDeleted: boolean = false) {
    const response = await apiService.get(this.baseUrl, {
      params: {
        page,
        page_size: pageSize,
        include_deleted: includeDeleted,
        order_by: 'created_at',
        order_direction: 'desc',
      },
    });
    return response.data as any || [];
  }

  async getCode(code: string) {
    const response = await apiService.get(`${this.baseUrl}/${code}`);
    return response.data as any;
  }

  async createCode(data: RegistrationCodeCreate) {
    const response = await apiService.post(this.baseUrl, data);
    return response.data as any;
  }

  async deleteCode(id: string) {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restoreCode(id: string) {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  async getStats() {
    const response = await apiService.get(`${this.baseUrl.replace('/codes', '')}/stats`);
    return response.data as any;
  }

  async updateCode(id: string, data: Partial<RegistrationCodeCreate>) {
    const response = await apiService.put(`${this.baseUrl}/${id}`, data);
    return response.data as any;
  }
}

export const systemRegistrationService = new SystemRegistrationService();
export default systemRegistrationService;