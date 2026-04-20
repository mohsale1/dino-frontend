/**
 * Dashboard Response Types — matches GET /application/dashboard
 * Fields are camelCase (axios interceptor converts snake_case automatically)
 */

// ── Stats block ──────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue: number;
  todaysRevenue: number;
  todaysOrders: number;
  avgOrderValue: number;
  tableOccupancyRate: number; // 0-100
  totalCategories: number;
  activeItems: number;
}

// ── Analytics block ───────────────────────────────────────────────────────────

export interface RevenueTrendPoint {
  date: string;
  period: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdown {
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
}

export interface PopularItem {
  id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  quantity: number;
  rating: number;
}

export interface CategoryPerformance {
  category: string;
  orders: number;
  revenue: number;
  percentage: number;
}

export interface DashboardPaymentMethod {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface PeakHourPoint {
  hour: number; // 0-23
  orders: number;
  revenue: number;
}

export interface DashboardAnalytics {
  revenueTrend: RevenueTrendPoint[];
  orderStatusBreakdown: OrderStatusBreakdown;
  popularItems: PopularItem[];
  categoryPerformance: CategoryPerformance[];
  paymentMethods: DashboardPaymentMethod[];
  peakHours: PeakHourPoint[];
}

// ── Recent activity ───────────────────────────────────────────────────────────

export interface RecentActivityItem {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  tableNumber?: string | number;
  venueName?: string;
  createdAt: string;
}

// ── Table statuses ────────────────────────────────────────────────────────────

export interface DashboardTableStatus {
  id: string;
  tableNumber: string | number;
  status: string;
  capacity: number;
  areaId?: string;
  currentOrderId?: string;
  occupancyTime?: string;
}

// ── Summary block ─────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  totalTables: number;
  totalMenuItems: number;
  activeMenuItems: number;
  todaysRevenue: number;
  todaysOrders: number;
  avgOrderValue: number;
  tableOccupancyRate: number;
  occupiedTables: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  activeOrders: number;
}

// ── Top-level response ────────────────────────────────────────────────────────

export interface DashboardData {
  stats: DashboardStats;
  analytics: DashboardAnalytics;
  recentActivity: RecentActivityItem[];
  tableStatuses: DashboardTableStatus[];
  summary: DashboardSummary;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// Legacy alias kept for backward compatibility with TabbedDashboard tabs
// that may still reference the old shape — remove once all tabs are updated
export type { DashboardData as LegacyDashboardResponse };