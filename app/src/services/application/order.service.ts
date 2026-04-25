/**
 * Order Service
 * Handles order-related API operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
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
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
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

/**
 * Payload shape expected by POST /application/orders
 * workspace_id is injected from JWT — do NOT include in body
 * persona_id IS required in body
 */
export interface OrderCreate {
  persona_id: number;
  order_type?: string;        // default "dine_in"
  customer_name?: string;
  table_id?: number;
  area_id?: number;
  currency?: string;
  special_instructions?: string;
  tax_amount?: number;
  service_charge?: number;
  discount_amount?: number;
  items: Array<{ item_id: number; quantity: number }>;
}

export interface OrderFilters {
  personaId?: string;   // maps to persona_id query param
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
   * Backend scopes by JWT — workspace_id and organization_id are NOT sent.
   * Use personaId to filter by persona.
   */
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<PaginatedOrders>> {
    try {
      const params: any = {};
      if (filters?.personaId) params.persona_id = filters.personaId;
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
   * Get order by ID — GET /application/orders/{id}
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
   * Create a new order — POST /application/orders
   * persona_id IS required. workspace_id is injected from JWT.
   */
  async createOrder(data: OrderCreate): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.post<any>('/application/orders', data);
      const raw = response.data as any;
      return {
        success: true,
        data: raw?.data ?? raw,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Update order — PUT /application/orders/{id}
   */
  async updateOrder(orderId: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<any>(`/application/orders/${orderId}`, data);
      const raw = response.data as any;
      return {
        success: true,
        data: raw?.data ?? raw,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order');
    }
  }

  /**
   * Update order status — PUT /application/orders/{id}/status
   * Backend expects { status } in request body, NOT as a query param.
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<any>(
        `/application/orders/${orderId}/status`,
        { status }
      );
      const raw = response.data as any;
      return {
        success: true,
        data: raw?.data ?? raw,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  /**
   * Cancel order — PUT /application/orders/{id}/cancel
   */
  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<any>(`/application/orders/${orderId}/cancel`, {});
      const raw = response.data as any;
      return {
        success: true,
        data: raw?.data ?? raw,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  /**
   * Delete order — DELETE /application/orders/{id}
   */
  async deleteOrder(orderId: string): Promise<ApiResponse<void>> {
    try {
      await apiService.delete(`/application/orders/${orderId}`);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete order');
    }
  }

  /**
   * Get order statistics — GET /application/orders/statistics
   * Backend scopes by JWT — workspace_id is NOT sent.
   * Use personaId to filter by persona.
   */
  async getOrderStatistics(
    personaId?: string,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<any> {
    try {
      const params: any = {};
      if (personaId) params.persona_id = personaId;
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }

      const response = await apiService.get('/application/orders/statistics', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order statistics:', error);
      return null;
    }
  }
}

export const orderService = new OrderService();
