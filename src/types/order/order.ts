/**
 * Order Types
 * 
 * Core order-related types and interfaces.
 */

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'qr_scan' | 'walk_in' | 'online' | 'phone';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'served' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'wallet' | 'net_banking';

export interface OrderItem {
  menu_item_id: string;
  menu_item_name: string;
  variant_id?: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  special_instructions?: string;
}

export interface Order {
  id: string;
  order_number: string;
  venueId: string;
  table_id?: string;
  table_number?: string;
  customer_id: string;
  order_type: OrderType;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount?: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod;
  special_instructions?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderReceipt {
  order_id: string;
  order_number: string;
  venue: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_date: string;
  table_number?: string;
}

export interface OrderValidation {
  is_valid: boolean;
  venue_open: boolean;
  items_available: string[];
  items_unavailable: string[];
  estimated_total: number;
  estimated_preparation_time?: number;
  message?: string;
  errors: string[];
}