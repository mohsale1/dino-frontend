/**
 * Orders Feature Types
 */

import { BaseEntity } from '../../../types/common';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'online' | 'wallet';

export interface OrderItem {
  id: string;
  catalogItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  customizations?: Record<string, any>;
}

export interface Order extends BaseEntity {
  orderNumber: string;
  workspaceId: string;
  locationId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  estimatedTime?: number;
  completedAt?: string | Date;
}

export interface OrderCreate {
  workspaceId: string;
  locationId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: Omit<OrderItem, 'id'>[];
  notes?: string;
  paymentMethod?: PaymentMethod;
}

export interface OrderUpdate {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  estimatedTime?: number;
}

export interface OrderFilters {
  workspaceId?: string;
  locationId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string | Date;
  endDate?: string | Date;
  searchQuery?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}