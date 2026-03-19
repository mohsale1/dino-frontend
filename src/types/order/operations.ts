/**
 * Order Operations Types
 * 
 * Types for order creation, updates, and filters.
 */

import type { OrderType, OrderStatus, PaymentStatus } from './order';

export interface OrderItemCreate {
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
}

export interface OrderCreate {
  venueId: string;
  customer_id?: string;
  order_type: OrderType;
  table_id?: string;
  items: OrderItemCreate[];
  special_instructions?: string;
}

export interface CustomerCreate {
  name: string;
  phone: string;
  email?: string;
  date_of_birth?: string;
  preferences?: Record<string, any>;
  dietary_restrictions?: string[];
  marketing_consent?: boolean;
}

export interface PublicOrderCreate {
  venueId: string;
  table_id?: string;
  customer: CustomerCreate;
  items: OrderItemCreate[];
  order_type: OrderType;
  special_instructions?: string;
  estimated_guests?: number;
}

export interface OrderUpdate {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  estimated_ready_time?: string;
  special_instructions?: string;
}

export interface OrderFilters {
  venueId?: string;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  order_type?: OrderType;
  page?: number;
  page_size?: number;
}