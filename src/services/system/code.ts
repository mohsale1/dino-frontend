/**
 * Registration Code Service
 * Handles registration code operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface RegistrationCode {
  id: string;
  code: string;
  description?: string;
  maxUses: number;
  currentUses: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationCodeCreate {
  code?: string;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface RegistrationCodeUpdate {
  description?: string;
  maxUses?: number;
  expiresAt?: string;
  isActive?: boolean;
}

class RegistrationCodeService {
  /**
   * Get all registration codes
   */
  async getCodes(): Promise<ApiResponse<RegistrationCode[]>> {
    try {
      const response = await apiService.get<RegistrationCode[]>('/system/registration/codes');
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch registration codes',
      };
    }
  }

  /**
   * Get registration code by ID
   */
  async getCode(codeId: string): Promise<ApiResponse<RegistrationCode>> {
    try {
      const response = await apiService.get<RegistrationCode>(`/system/registration/codes/${codeId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch registration code');
    }
  }

  /**
   * Create a new registration code
   */
  async createCode(data: RegistrationCodeCreate): Promise<ApiResponse<RegistrationCode>> {
    try {
      const response = await apiService.post<RegistrationCode>('/system/registration/codes', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create registration code');
    }
  }

  /**
   * Update registration code
   */
  async updateCode(codeId: string, data: RegistrationCodeUpdate): Promise<ApiResponse<RegistrationCode>> {
    try {
      const response = await apiService.put<RegistrationCode>(`/system/registration/codes/${codeId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update registration code');
    }
  }

  /**
   * Delete registration code
   */
  async deleteCode(codeId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/system/registration/codes/${codeId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete registration code');
    }
  }

  async validateCode(code: string): Promise<ApiResponse<{ valid: boolean; message?: string }>> {
    try {
      const response = await apiService.get<{ valid: boolean; message?: string }>('/application/auth/validate-referral', { params: { code } });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        data: { valid: false, message: error.message || 'Invalid code' },
        error: error.message,
      };
    }
  }

}

export const registrationCodeService = new RegistrationCodeService();
