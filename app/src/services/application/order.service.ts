/**
 * Order Service
 * Handles order-related API operations against /api/v1/application/orders
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';
import { API_ENDPOINTS } from '../../config/apiEndpoints';
import { DEFAULTS } from '../../constants/app';

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
  createdAt: string;
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

export interface OrderTransaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: string;
  createdAt: string;
}

export interface OrderStatistics {
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_by_status: Record<string, number>;
  orders_by_type: Record<string, number>;
}

export interface OrderCreateItem {
  item_id: number;
  quantity: number;
}

export interface OrderCreate {
  persona_id: number;
  table_id?: number;
  area_id?: number;
  items: OrderCreateItem[];
  customer_name?: string;
  discount_amount?: number;
  special_instructions?: string;
  currency?: string;
  tax_amount?: number;
  service_charge?: number;
}

export interface OrderFilters {
  page?: number;
  page_size?: number;
  persona_id?: number;
  status?: string;
  payment_status?: string;
  order_type?: string;
  start_date?: string;
  end_date?: string;
}

export interface StatisticsFilters {
  persona_id?: number;
  start_date?: string;
  end_date?: string;
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
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<PaginatedOrders>> {
    try {
      const params: Record<string, unknown> = {};
      if (filters?.page !== undefined) params.page = filters.page;
      if (filters?.page_size !== undefined) params.page_size = filters.page_size;
      if (filters?.persona_id !== undefined) params.persona_id = filters.persona_id;
      if (filters?.status) params.status = filters.status;
      if (filters?.payment_status) params.payment_status = filters.payment_status;
      if (filters?.order_type) params.order_type = filters.order_type;
      if (filters?.start_date) params.start_date = filters.start_date;
      if (filters?.end_date) params.end_date = filters.end_date;

      const response = await apiService.get<any>(API_ENDPOINTS.APPLICATION.ORDERS.BASE, { params });

      // The API interceptor applies camelCase transformation to the full response.
      // Backend shape: { success, data: { items: [...], pagination: {...} } }
      //            or: { success, data: [...], pagination: {...} }
      // After camelCase: snake_case keys like total_pages → totalPages, page_size → pageSize
      const raw = response.data as any;

      // Resolve the orders array — handle both nested (data.items) and flat (data) shapes
      let items: Order[] = [];
      let paginationRaw: any = null;

      if (raw?.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
        // Shape: { data: { items: [...], pagination: {...} } }
        const inner = raw.data;
        items = Array.isArray(inner?.items) ? inner.items : [];
        paginationRaw = inner?.pagination ?? raw?.pagination ?? null;
      } else if (Array.isArray(raw?.data)) {
        // Shape: { data: [...], pagination: {...} }
        items = raw.data;
        paginationRaw = raw?.pagination ?? null;
      } else if (Array.isArray(raw)) {
        // Shape: [...] (bare array)
        items = raw;
        paginationRaw = null;
      }

      // Resolve pagination — handle both camelCase (after transform) and snake_case keys
      const pagination: OrderPagination = {
        page: paginationRaw?.page ?? filters?.page ?? 1,
        page_size: paginationRaw?.pageSize ?? paginationRaw?.page_size ?? filters?.page_size ?? DEFAULTS.DEFAULT_PAGE_SIZE,
        total: paginationRaw?.total ?? items.length,
        total_pages: paginationRaw?.totalPages ?? paginationRaw?.total_pages ?? 1,
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
          pagination: { page: 1, page_size: DEFAULTS.DEFAULT_PAGE_SIZE, total: 0, total_pages: 0 },
        },
        error: error.message || 'Failed to fetch orders',
      };
    }
  }


  /**
   * Get order by ID — GET /application/orders/{id}
   */
  async getOrder(orderId: string, personaId: number): Promise<ApiResponse<OrderDetail>> {
    try {
      const response = await apiService.get<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.BY_ID(orderId),
        { params: { persona_id: personaId } }
      );
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order');
    }
  }

  /**
   * Create a new order — POST /application/orders
   */
  async createOrder(data: OrderCreate): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.post<any>(API_ENDPOINTS.APPLICATION.ORDERS.BASE, data);
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create order');
    }
  }

  /**
   * Update order — PUT /application/orders/{id}
   */
  async updateOrder(orderId: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<any>(API_ENDPOINTS.APPLICATION.ORDERS.BY_ID(orderId), data);
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order');
    }
  }

  /**
   * Update order status — PUT /application/orders/{id}/status
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: Order['status'],
    personaId: number
  ): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.STATUS(orderId),
        { status: newStatus },
        { params: { persona_id: personaId } }
      );
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update order status');
    }
  }

  /**
   * Cancel order — PUT /application/orders/{id}/cancel
   */
  async cancelOrder(orderId: string, personaId: number, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const params: Record<string, unknown> = { persona_id: personaId };
      if (reason) params.reason = reason;

      const response = await apiService.put<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.CANCEL(orderId),
        null,
        { params }
      );
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel order');
    }
  }

  /**
   * Get items for an order — GET /application/orders/{id}/items
   */
  async getOrderItems(orderId: string, personaId: number): Promise<ApiResponse<OrderItem[]>> {
    try {
      const response = await apiService.get<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.ITEMS(orderId),
        { params: { persona_id: personaId } }
      );
      const raw = response.data as any;
      const items: OrderItem[] = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      return { success: true, data: items };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order items');
    }
  }

  /**
   * Get transaction for an order — GET /application/orders/{id}/transaction
   */
  async getOrderTransaction(orderId: string, personaId: number): Promise<ApiResponse<OrderTransaction>> {
    try {
      const response = await apiService.get<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.TRANSACTION(orderId),
        { params: { persona_id: personaId } }
      );
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order transaction');
    }
  }

  /**
   * Get order statistics — GET /application/orders/statistics
   */
  async getStatistics(params?: StatisticsFilters): Promise<ApiResponse<OrderStatistics>> {
    try {
      const queryParams: Record<string, unknown> = {};
      if (params?.persona_id !== undefined) queryParams.persona_id = params.persona_id;
      if (params?.start_date) queryParams.start_date = params.start_date;
      if (params?.end_date) queryParams.end_date = params.end_date;

      const response = await apiService.get<any>(
        API_ENDPOINTS.APPLICATION.ORDERS.STATISTICS,
        { params: queryParams }
      );
      const raw = response.data as any;
      return { success: true, data: raw?.data ?? raw };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch order statistics');
    }
  }
}

export const orderService = new OrderService();
