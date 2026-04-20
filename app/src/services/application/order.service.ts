/**
 * Order Service
 * Handles order-related API operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  customer_name?: string;
  table_number?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  items_count: number;
  createdAt: string; // mapped from created_at by axios camelCase interceptor
}

export interface OrderItem {
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderDetail {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  customer_name?: string;
  customer_phone?: string;
  table_number?: string;
  special_instructions?: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_charge: number;
  discount_amount: number;
  total: number;
  items_count: number;
  payment_status: string;
  createdAt: string;
}

export interface OrderFilters {
  workspaceId?: string;
  organizationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  page_size?: number;
}

export interface OrderPagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  totalPages: number;
  pagination: OrderPagination;
}

class OrderService {
  /**
   * Get all orders with pagination support.
   * The backend returns { success, data: Order[], pagination: {...} }.
   * Returns the full unwrapped paginated payload so callers can access
   * both the order list and pagination metadata.
   */
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<PaginatedOrders>> {
    try {
      const params: any = {};
      if (filters?.workspaceId) params.workspace_id = filters.workspaceId;
      if (filters?.organizationId) params.organization_id = filters.organizationId;
      if (filters?.status) params.status = filters.status;
      if (filters?.startDate) params.start_date = filters.startDate;
      if (filters?.endDate) params.end_date = filters.endDate;
      if (filters?.page) params.page = filters.page;
      if (filters?.page_size) params.page_size = filters.page_size;

      const response = await apiService.get<any>('/application/orders', { params });

      // Backend returns { success, data: Order[], pagination: { page, page_size, total, total_pages } }
      const raw = response.data as any;
      const items: Order[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      const pagination: OrderPagination = raw?.pagination ?? {
        page: filters?.page ?? 1,
        page_size: filters?.page_size ?? 20,
        total: items.length,
        total_pages: 1,
      };

      return {
        success: true,
        data: {
          items,
          total: pagination.total,
          totalPages: pagination.total_pages,
          pagination,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          totalPages: 0,
          pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
        },
        error: error.message || 'Failed to fetch orders',
      };
    }
  }

  /**
   * Get order by ID.
   * Backend returns { success, data: OrderDetail }; the axios interceptor
   * converts snake_case keys to camelCase automatically.
   */
  async getOrder(orderId: string): Promise<ApiResponse<OrderDetail>> {
    try {
      const response = await apiService.get<any>(`/application/orders/${orderId}`);
      const raw = response.data as any;
      const detail: OrderDetail = raw?.data ?? raw;
      return { success: true, data: detail };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order');
    }
  }


  /**
   * Create a new order
   */
  async createOrder(data: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.post<Order>('/application/orders', data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<Order>(`/application/orders/${orderId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order');
    }
  }

  /**
   * Update order status.
   * Sends an empty object body (not null) to satisfy FastAPI's PUT body parser,
   * while passing new_status as a query parameter.
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<Order>(
        `/application/orders/${orderId}/status`,
        {},
        { params: { new_status: status } }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<Order>(`/application/orders/${orderId}/cancel`, {});
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  /**
   * Delete order
   */
  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/application/orders/${orderId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete order');
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics(workspaceId: string, dateRange?: { startDate: string; endDate: string }, organizationId?: string): Promise<any> {
    try {
      const params: any = { workspace_id: workspaceId };
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }
      if (organizationId) params.organization_id = organizationId;

      const response = await apiService.get(`/application/orders/statistics`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order statistics:', error);
      return null;
    }
  }
}

export const orderService = new OrderService();