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
  async getAdminDashboard(dateRange?: DateRange, workspaceId?: string): Promise<AdminDashboardResponse> {
    try {
      const params: Record<string, string> = {};
      if (workspaceId) params.workspace_id = workspaceId;
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }

      const response = await apiService.get<AdminDashboardResponse>('/application/dashboard', { params });
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  }


  async getSuperAdminDashboard(dateRange?: DateRange, workspaceId?: string): Promise<SuperAdminDashboardResponse> {
    try {
      const params: Record<string, string> = {};
      if (workspaceId) params.workspace_id = workspaceId;
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }

      const response = await apiService.get<SuperAdminDashboardResponse>('/application/dashboard/analytics', { params });
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching super admin dashboard:', error);
      throw error;
    }
  }


  async getOperatorDashboard(workspaceId?: string): Promise<OperatorDashboardResponse> {
    try {
      const params: Record<string, string> = {};
      if (workspaceId) params.workspace_id = workspaceId;

      const response = await apiService.get<OperatorDashboardResponse>('/application/dashboard/stats', { params });
      if (!response.data) {
        throw new Error('No data returned from API');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error fetching operator dashboard:', error);
      throw error;
    }
  }


  async getVenueDashboard(venueId: string, dateRange?: DateRange): Promise<any> {
    try {
      const params: any = { workspace_id: venueId };
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }

      const response = await apiService.get('/application/dashboard', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching venue dashboard:', error);
      throw error;
    }
  }

}


export const dashboardService = new DashboardService();