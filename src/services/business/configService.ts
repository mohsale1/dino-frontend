import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';

export interface ConfigValue {
  key: string;
  value: any;
}

export interface ConfigVerificationResponse {
  valid: boolean;
}

class ConfigService {
  /**
   * Get configuration value by key
   */
  async getConfigValue(key: string): Promise<any> {
    try {
      const response = await apiService.get<ConfigValue>(`/config/value/${key}`);
      
      if (response.success && response.data) {
        return response.data.value;
      }
      
      throw new Error(response.message || 'Failed to get configuration value');
    } catch (error: any) {      throw new Error(error.response?.data?.detail || error.message || 'Failed to get configuration value');
    }
  }

  /**
   * Get registration code from backend
   */
  async getRegistrationCode(): Promise<string> {
    try {
      const value = await this.getConfigValue('dino.registration.code');
      return String(value);
    } catch (error: any) {      throw new Error('Failed to retrieve registration code');
    }
  }

  /**
   * Verify registration code
   */
  async verifyRegistrationCode(code: string): Promise<boolean> {
    try {
      const response = await apiService.post<ConfigVerificationResponse>(
        `/config/verify-registration-code?code=${code}`
      );
      
      if (response.success && response.data) {
        return response.data.valid;
      }
      
      return false;
    } catch (error: any) {      // Return false instead of throwing to allow UI to show error message
      return false;
    }
  }
}

export const configService = new ConfigService();
