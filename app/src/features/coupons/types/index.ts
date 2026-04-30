/**
 * Coupon Types
 * Aligned with the FastAPI backend response shapes (/api/v1/coupons)
 */

export interface Coupon {
  id: string;
  code: string;
  venue_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  max_discount_amount?: number;
  min_order_amount?: number;
  is_active: boolean;
  usage_limit?: number;
  usage_count: number;
  per_user_limit?: number;
  description?: string;
  terms_and_conditions?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  message: string;
  discount_amount: number;
  coupon?: Coupon;
}

export interface CouponUpdate {
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  expiry_date?: string;
  max_discount_amount?: number;
  min_order_amount?: number;
  is_active?: boolean;
  usage_limit?: number;
  per_user_limit?: number;
  description?: string;
  terms_and_conditions?: string;
}