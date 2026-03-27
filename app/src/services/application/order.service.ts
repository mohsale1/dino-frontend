/**
 * Order Service
 * Handles order-related API operations
 */

import { apiService } from '../../utils/api';
import type { ApiResponse } from '../../types';

export interface Order {
  id: string;
  order_number: string;
  table_number?: string;
  customer_name?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  items_count: number;
  venueId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  venueId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  page_size?: number;
}

class OrderService {
  /**
   * Get all orders
   */
  async getOrders(filters?: OrderFilters): Promise<ApiResponse<Order[]>> {
    try {
      const params: any = {};
      if (filters?.venueId) params.venueId = filters.venueId;
      if (filters?.status) params.status = filters.status;
      if (filters?.startDate) params.start_date = filters.startDate;
      if (filters?.endDate) params.end_date = filters.endDate;
      if (filters?.page) params.page = filters.page;
      if (filters?.page_size) params.page_size = filters.page_size;

      const response = await apiService.get<Order[]>('/application/orders', { params });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch orders',
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.get<Order>(`/application/orders/${orderId}`);
      return {
        success: true,
        data: response.data,
      };
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

  async updateOrderStatus(
    orderId: string,
    status: Order['status']
  ): Promise<ApiResponse<Order>> {
    try {
      const response = await apiService.put<Order>(
        `/application/orders/${orderId}/status`,
        null,
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
  async getOrderStatistics(venueId: string, dateRange?: { startDate: string; endDate: string }): Promise<any> {
    try {
      const params: any = { venueId };
      if (dateRange) {
        params.start_date = dateRange.startDate;
        params.end_date = dateRange.endDate;
      }

      const response = await apiService.get(`/application/orders/statistics`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order statistics:', error);
      return null;
    }
  }
}

export const orderService = new OrderService();