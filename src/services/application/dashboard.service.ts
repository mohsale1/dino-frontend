
/**
 * Dashboard Service
 * Handles dashboard data API operations
 */

import { apiService } from '../../utils/api';
import type { 
  AdminDashboardResponse, 
  SuperAdminDashboardResponse, 
  OperatorDashboardResponse 
} from '../../types/dashboard';

export interface DateRange {
  startDate: string;
  endDate: string;
}

class DashboardService {
  /**
   * Get admin dashboard data
   */
  async getAdminDashboard(dateRange?: DateRange): Promise<AdminDashboardResponse> {
    try {
      const params = dateRange ? {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      } : {};
      
      const response = await apiService.get<AdminDashboardResponse>('/application/dashboard/admin', { params });
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  }

  /**
   * Get super admin dashboard data
   */
  async getSuperAdminDashboard(dateRange?: DateRange): Promise<SuperAdminDashboardResponse> {
    try {
      const params = dateRange ? {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      } : {};
      
      const response = await apiService.get<SuperAdminDashboardResponse>('/application/dashboard/superadmin', { params });
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching super admin dashboard:', error);
      throw error;
    }
  }

  /**
   * Get operator dashboard data
   */
  async getOperatorDashboard(): Promise<OperatorDashboardResponse> {
    try {
      const response = await apiService.get<OperatorDashboardResponse>('/application/dashboard/operator');
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching operator dashboard:', error);
      throw error;
    }
  }

  /**
   * Get venue dashboard data
   */
  async getVenueDashboard(venueId: string, dateRange?: DateRange): Promise<any> {
    try {
      const params = dateRange ? {
        start_date: dateRange.startDate,
        end_date: dateRange.endDate,
      } : {};
      
      const response = await apiService.get(`/application/dashboard/venue/${venueId}`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching venue dashboard:', error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();