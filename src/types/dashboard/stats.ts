/**
 * Core Dashboard Types
 * 
 * Contains fundamental dashboard data structures for venue statistics,
 * recent orders, and top menu items.
 */

export interface DashboardPeriod {
  start_date: string;
  end_date: string;
  period_type: 'today' | 'week' | 'month' | 'custom';
}

export interface VenueDashboardStats {
  // Today's metrics
  today: {
    orders_count: number;
    revenue: number;
    average_order_value: number;
    customers_served: number;
  };
  
  // Current status
  current: {
    tables_total: number;
    tables_occupied: number;
    tables_available: number;
    tables_reserved: number;
    menu_items_total: number;
    menu_items_active: number;
    staff_total: number;
    staff_active: number;
  };
  
  // Period comparison (vs previous period)
  comparison: {
    orders_growth: number; // percentage
    revenue_growth: number; // percentage
    customer_growth: number; // percentage
  };
}

export interface RecentOrder {
  id: string;
  order_number: string;
  table_number: string;
  customer_name?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  items_count: number;
  createdAt: string;
  estimated_ready_time?: string;
}

export interface TopMenuItem {
  id: string;
  name: string;
  category_name: string;
  price: number;
  orders_count: number;
  total_revenue: number;
  percentage_of_total: number;
}

export interface StaffPerformance {
  user_id: string;
  name: string;
  role: string;
  orders_handled: number;
  revenue_generated: number;
  average_service_time: number; // in minutes
  customer_rating?: number;
}