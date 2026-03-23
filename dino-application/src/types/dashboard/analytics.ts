/**
 * Dashboard Analytics Types
 * 
 * Contains analytics-specific types for revenue trends, breakdowns,
 * and operational insights.
 */

import type { Order, OrderStatus, PaymentStatus } from '../order';

export interface RevenueDataPoint {
  date: string; // YYYY-MM-DD
  day_name: string; // Monday, Tuesday, etc.
  orders_count: number;
  revenue: number;
  customers_count: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

export interface TableStatusBreakdown {
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  count: number;
  percentage: number;
  color: string;
}

export interface PeakHour {
  hour: number; // 0-23
  orders_count: number;
  revenue: number;
}

export interface DashboardAlert {
  type: 'warning' | 'info' | 'error';
  message: string;
  action_required: boolean;
}

export interface LiveOrderData {
  venueId: string;
  timestamp: string;
  summary: {
    total_active_orders: number;
    pending_orders: number;
    preparing_orders: number;
    ready_orders: number;
  };
  orders_by_status: Record<string, Order[]>;
}

export interface VenueAnalyticsData {
  venueId: string;
  period: {
    start_date: string;
    end_date: string;
  };
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  status_breakdown: Record<OrderStatus, number>;
  payment_breakdown: Record<PaymentStatus, number>;
}