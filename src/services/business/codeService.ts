/**
 * Code Service
 * Handles API calls for code management (dinos role only)
 */
import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types/api';

export interface CodeData {
  code: string;
  digits: string[];
}

export interface CodeResponse {
  code: string;
  digits: string[];
}

class CodeService {
  private readonly baseUrl = '/code';

  /**
   * Get current code
   */
  async getCurrentCode(): Promise<ApiResponse<CodeResponse>> {
    try {
      const response = await apiService.get<CodeResponse>(`${this.baseUrl}/current`);
      return response;
    } catch (error: any) {
      console.error('Error getting current code:', error);
      throw error;
    }
  }

  /**
   * Refresh code - generate new random 4-digit code
   */
  async refreshCode(): Promise<ApiResponse<CodeResponse>> {
    try {
      const response = await apiService.post<CodeResponse>(`${this.baseUrl}/refresh`);
      return response;
    } catch (error: any) {
      console.error('Error refreshing code:', error);
      throw error;
    }
  }
}

export const codeService = new CodeService();
export default codeService;