/**
 * Dashboard Service
 *
 * Communicates with the backend dashboard API.
 * All paths are relative to /api/v1 and prefixed with /application/dashboard.
 */
import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import type { DashboardResponse } from '../../types/dashboard';
import type {
  DashboardStats,
  RevenueTrendPoint,
  OrderStatusBreakdown,
  PopularItem,
  DashboardPaymentMethod,
  PeakHourPoint,
} from '../../types/dashboard';

// ── Query parameter interfaces ────────────────────────────────────────────────

export interface DashboardFilters {
  venueId?: string;
  startDate?: string;
  endDate?: string;
}


// ── Response types ────────────────────────────────────────────────────────────

export interface StatsResponse {
  success: boolean;
  data: DashboardStats;
}

export interface RevenueTrendResponse {
  success: boolean;
  data: RevenueTrendPoint[];
}

export interface OrdersByStatusResponse {
  success: boolean;
  data: OrderStatusBreakdown;
}

export interface OrdersByTypeResponse {
  success: boolean;
  data: Array<{
    type: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
}

export interface TopItemsResponse {
  success: boolean;
  data: PopularItem[];
}

export interface PaymentSummaryResponse {
  success: boolean;
  data: DashboardPaymentMethod[];
}

export interface HourlyOrdersResponse {
  success: boolean;
  data: PeakHourPoint[];
}

function buildParams(filters: DashboardFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.venueId) params.persona_id = filters.venueId;
  return params;
}


// ── Service ───────────────────────────────────────────────────────────────────

class DashboardService {
  /**
   * GET /application/dashboard
   * Returns the full dashboard snapshot for the authenticated user's context.
   */
  async getDashboard(filters: DashboardFilters = {}): Promise<DashboardResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<DashboardResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.BASE,
      { params },
    );
    if (!response.data) throw new Error('No data returned from dashboard API');
    return response.data;
  }

  /**
   * GET /application/dashboard/stats
   * Returns key metric stats for the venue.
   */
  async getStats(filters: DashboardFilters = {}): Promise<StatsResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<StatsResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.STATS,
      { params },
    );
    if (!response.data) throw new Error('No data returned from dashboard stats API');
    return response.data;
  }

  /**
   * GET /application/dashboard/revenue-trend
   * Returns revenue data points over the requested period.
   */
  async getRevenueTrend(filters: DashboardFilters = {}): Promise<RevenueTrendResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<RevenueTrendResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.REVENUE_TREND,
      { params },
    );
    if (!response.data) throw new Error('No data returned from revenue trend API');
    return response.data;
  }

  /**
   * GET /application/dashboard/orders-by-status
   * Returns order counts broken down by status.
   */
  async getOrdersByStatus(filters: DashboardFilters = {}): Promise<OrdersByStatusResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<OrdersByStatusResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.ORDERS_BY_STATUS,
      { params },
    );
    if (!response.data) throw new Error('No data returned from orders-by-status API');
    return response.data;
  }

  /**
   * GET /application/dashboard/orders-by-type
   * Returns order counts broken down by order type.
   */
  async getOrdersByType(filters: DashboardFilters = {}): Promise<OrdersByTypeResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<OrdersByTypeResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.ORDERS_BY_TYPE,
      { params },
    );
    if (!response.data) throw new Error('No data returned from orders-by-type API');
    return response.data;
  }

  /**
   * GET /application/dashboard/top-items
   * Returns the top-performing menu items for the given period.
   */
  async getTopItems(filters: DashboardFilters = {}): Promise<TopItemsResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<TopItemsResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.TOP_ITEMS,
      { params },
    );
    if (!response.data) throw new Error('No data returned from top-items API');
    return response.data;
  }

  /**
   * GET /application/dashboard/payment-summary
   * Returns a breakdown of revenue and counts by payment method.
   */
  async getPaymentSummary(filters: DashboardFilters = {}): Promise<PaymentSummaryResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<PaymentSummaryResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.PAYMENT_SUMMARY,
      { params },
    );
    if (!response.data) throw new Error('No data returned from payment-summary API');
    return response.data;
  }

  /**
   * GET /application/dashboard/hourly-orders
   * Returns order and revenue counts grouped by hour of day.
   */
  async getHourlyOrders(filters: DashboardFilters = {}): Promise<HourlyOrdersResponse> {
    const params = buildParams(filters);
    const response = await apiService.get<HourlyOrdersResponse>(
      API_ENDPOINTS.APPLICATION.DASHBOARD.HOURLY_ORDERS,
      { params },
    );
    if (!response.data) throw new Error('No data returned from hourly-orders API');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;