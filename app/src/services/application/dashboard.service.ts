/**
 * Dashboard Service
 */
import { apiService } from '../../utils/api';
import type { DashboardResponse } from '../../types/dashboard';

export interface DashboardFilters {
  workspaceId?: string;
  organizationId?: string;
  startDate?: string;
  endDate?: string;
}

class DashboardService {
  async getDashboard(filters: DashboardFilters = {}): Promise<DashboardResponse> {
    const params: Record<string, string> = {};
    if (filters.workspaceId)  params.workspace_id    = filters.workspaceId;
    if (filters.organizationId) params.organization_id = filters.organizationId;
    if (filters.startDate)    params.start_date      = filters.startDate;
    if (filters.endDate)      params.end_date        = filters.endDate;

    const response = await apiService.get<DashboardResponse>('/application/dashboard', { params });
    if (!response.data) throw new Error('No data returned from dashboard API');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;