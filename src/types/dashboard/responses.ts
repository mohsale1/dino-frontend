/**
 * Dashboard Response Types
 * 
 * Contains role-specific dashboard response structures for different user types:
 * - ComprehensiveDashboardData (base)
 * - AdminDashboardResponse
 * - OperatorDashboardResponse
 * - SuperAdminDashboardResponse
 */

import type { DashboardPeriod, VenueDashboardStats, RecentOrder, TopMenuItem, StaffPerformance } from './stats';
import type { RevenueDataPoint, OrderStatusBreakdown, TableStatusBreakdown, PeakHour, DashboardAlert } from './analytics';

export interface ComprehensiveDashboardData {
  venueId: string;
  venue_name: string;
  period: DashboardPeriod;
  
  // Core statistics
  stats: VenueDashboardStats;
  
  // Recent activity
  recent_orders: RecentOrder[];
  
  // Analytics data
  revenue_trend: RevenueDataPoint[]; // Last 7 days
  order_status_breakdown: OrderStatusBreakdown[];
  table_status_breakdown: TableStatusBreakdown[];
  
  // Performance data
  top_menu_items: TopMenuItem[]; // Top 10
  staff_performance: StaffPerformance[]; // Top 5
  
  // Operational insights
  peak_hours: PeakHour[];
  
  // Alerts and notifications
  alerts: DashboardAlert[];
  
  // Last updated timestamp
  last_updated: string;
}

// Simplified response for different user roles
export interface AdminDashboardResponse extends ComprehensiveDashboardData {}

export interface OperatorDashboardResponse {
  venueId: string;
  venue_name: string;
  
  // Operator-focused stats
  stats: {
    active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
    tables_occupied: number;
    tables_available: number;
  };
  
  // Real-time data
  active_orders: RecentOrder[];
  table_status_breakdown: TableStatusBreakdown[];
  
  // Operational alerts
  alerts: Array<{
    type: 'urgent' | 'normal';
    message: string;
    order_id?: string;
    table_id?: string;
  }>;
  
  last_updated: string;
}

export interface SuperAdminDashboardResponse {
  // Enhanced system-wide statistics
  system_stats: {
    total_workspaces: number;
    total_venues: number;
    total_active_venues: number;
    total_users: number;
    total_orders: number;
    total_orders_today: number;
    total_revenue: number;
    total_revenue_today: number;
    active_orders: number;
    total_tables: number;
    occupied_tables: number;
    total_menu_items: number;
    active_menu_items: number;
    table_occupancy_rate: number;
    avg_order_value: number;
  };
  
  // Workspace details with enhanced data
  workspaces: Array<{
    id: string;
    name: string;
    venue_count: number;
    user_count: number;
    total_orders: number;
    total_revenue: number;
    isActive: boolean;
    createdAt: string;
  }>;
  
  // Venue performance metrics
  venue_performance: Array<{
    id: string;
    name: string;
    total_orders: number;
    today_orders: number;
    total_revenue: number;
    total_tables: number;
    occupied_tables: number;
    occupancy_rate: number;
    is_open: boolean;
    status: string;
  }>;
  
  // Top performing menu items
  top_menu_items: Array<{
    id: string;
    name: string;
    venue_name: string;
    category: string;
    orders: number;
    revenue: number;
    quantity_sold: number;
    price: number;
    rating: number;
  }>;
  
  // Recent activity across all venues
  recent_activity: Array<{
    id: string;
    order_number: string;
    venue_name: string;
    table_number?: string;
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    status: string;
    payment_status: string;
    createdAt: string;
  }>;
  
  // Analytics data
  analytics: {
    order_status_breakdown: Record<string, number>;
    table_status_breakdown: Record<string, number>;
    revenue_by_venue: Record<string, number>;
  };
  
  // SuperAdmin enhancement flags
  is_superadmin_view?: boolean;
  currentVenueId?: string;
}