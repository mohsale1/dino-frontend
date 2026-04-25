/**
 * Dashboard Service
 */
import { apiService } from '../../utils/api';
import type { DashboardResponse } from '../../types/dashboard';

export interface DashboardFilters {
  personaId?: string; // maps to persona_id query param
  startDate?: string;
  endDate?: string;
}

class DashboardService {
  /**
   * Get full dashboard data - GET /application/dashboard
   * Backend scopes by JWT - workspace_id and organization_id are NOT sent.
   */
  async getDashboard(filters: DashboardFilters = {}): Promise<DashboardResponse> {
    const params: Record<string, string> = {};
    if (filters.personaId) params.persona_id = filters.personaId;
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;

    const response = await apiService.get<DashboardResponse>('/application/dashboard', { params });
    if (!response.data) throw new Error('No data returned from dashboard API');
    return response.data;
  }

  /**
   * Get dashboard stats - GET /application/dashboard/stats
   */
  async getStats(personaId?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (personaId) params.persona_id = personaId;

    const response = await apiService.get('/application/dashboard/stats', { params });
    return response.data;
  }

  /**
   * Get revenue trend - GET /application/dashboard/revenue-trend
   */
  async getRevenueTrend(personaId?: string, days?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (personaId) params.persona_id = personaId;
    if (days !== undefined) params.days = days;

    const response = await apiService.get('/application/dashboard/revenue-trend', { params });
    return response.data;
  }

  /**
   * Get orders by status breakdown - GET /application/dashboard/orders-by-status
   */
  async getOrdersByStatus(personaId?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (personaId) params.persona_id = personaId;

    const response = await apiService.get('/application/dashboard/orders-by-status', { params });
    return response.data;
  }

  /**
   * Get top performing items - GET /application/dashboard/top-items
   */
  async getTopItems(personaId?: string, limit?: number): Promise<any> {
    const params: Record<string, any> = {};
    if (personaId) params.persona_id = personaId;
    if (limit !== undefined) params.limit = limit;

    const response = await apiService.get('/application/dashboard/top-items', { params });
    return response.data;
  }

  /**
   * Get hourly order distribution - GET /application/dashboard/hourly-orders
   */
  async getHourlyOrders(personaId?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (personaId) params.persona_id = personaId;

    const response = await apiService.get('/application/dashboard/hourly-orders', { params });
    return response.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
