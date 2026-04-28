/**
 * Coupon Service
 * Handles API calls for coupon operations against /api/v1/application/coupons
 */

import { apiService } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import type { Coupon, CouponValidationResponse } from '../types';

// ── Backend request DTOs (snake_case, matching FastAPI models) ────────────────

export interface CouponCreateDTO {
  code: string;
  venue_id: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  expiry_date: string;
  max_discount_amount?: number;
  min_order_amount?: number;
  is_active?: boolean;
  usage_limit?: number;
  per_user_limit?: number;
  description?: string;
  terms_and_conditions?: string;
}

export interface CouponUpdateDTO {
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

export interface ApplyCouponRequest {
  coupon_code: string;
  venue_id: string;
  order_amount: number;
  user_id?: string;
}

export interface GetVenueCouponsParams {
  include_inactive?: boolean;
  include_expired?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

class CouponService {
  private readonly baseUrl = API_ENDPOINTS.APPLICATION.COUPONS.BASE;

  /**
   * GET /application/coupons/venue/{venue_id}
   * Returns all coupons for a venue. Optionally includes inactive/expired ones.
   */
  async getCouponsByVenue(venueId: string, params?: GetVenueCouponsParams): Promise<Coupon[]> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.COUPONS.BY_VENUE(venueId), { params });
    const raw = response.data as any;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * GET /application/coupons/venue/{venue_id}/active
   * Returns only active, non-expired coupons for a venue.
   */
  async getActiveCouponsByVenue(venueId: string): Promise<Coupon[]> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.COUPONS.ACTIVE_BY_VENUE(venueId));
    const raw = response.data as any;
    if (raw && Array.isArray(raw.data)) return raw.data;
    return Array.isArray(raw) ? raw : [];
  }

  /**
   * GET /application/coupons/{id}
   */
  async getCoupon(id: string): Promise<Coupon> {
    const response = await apiService.get(API_ENDPOINTS.APPLICATION.COUPONS.BY_ID(id));
    return response.data as Coupon;
  }

  /**
   * POST /application/coupons
   */
  async createCoupon(data: CouponCreateDTO): Promise<Coupon> {
    const response = await apiService.post(API_ENDPOINTS.APPLICATION.COUPONS.BASE, data);
    return response.data as Coupon;
  }

  /**
   * PUT /application/coupons/{id}
   * Accepts a partial CouponUpdateDTO; only provided fields are sent.
   */
  async updateCoupon(id: string, data: CouponUpdateDTO): Promise<Coupon> {
    const payload: CouponUpdateDTO = {};

    if (data.code !== undefined) payload.code = data.code;
    if (data.discount_type !== undefined) payload.discount_type = data.discount_type;
    if (data.discount_value !== undefined) payload.discount_value = data.discount_value;
    if (data.expiry_date !== undefined) payload.expiry_date = data.expiry_date;
    if (data.max_discount_amount !== undefined) payload.max_discount_amount = data.max_discount_amount;
    if (data.min_order_amount !== undefined) payload.min_order_amount = data.min_order_amount;
    if (data.is_active !== undefined) payload.is_active = data.is_active;
    if (data.usage_limit !== undefined) payload.usage_limit = data.usage_limit;
    if (data.per_user_limit !== undefined) payload.per_user_limit = data.per_user_limit;
    if (data.description !== undefined) payload.description = data.description;
    if (data.terms_and_conditions !== undefined) payload.terms_and_conditions = data.terms_and_conditions;

    const response = await apiService.put(API_ENDPOINTS.APPLICATION.COUPONS.BY_ID(id), payload);
    return response.data as Coupon;
  }

  /**
   * DELETE /application/coupons/{id}
   * Pass hardDelete=true to permanently remove the record.
   */
  async deleteCoupon(id: string, hardDelete?: boolean): Promise<void> {
    await apiService.delete(API_ENDPOINTS.APPLICATION.COUPONS.BY_ID(id), {
      params: hardDelete !== undefined ? { hard_delete: hardDelete } : undefined,
    });
  }

  /**
   * POST /application/coupons/apply
   * Applies a coupon to an order and returns the discount result.
   */
  async applyCoupon(request: ApplyCouponRequest): Promise<CouponValidationResponse> {
    const response = await apiService.post(API_ENDPOINTS.APPLICATION.COUPONS.APPLY, request);
    return response.data as CouponValidationResponse;
  }

  /**
   * POST /application/coupons/validate
   * Validates a coupon code for a venue without consuming usage.
   */
  async validateCoupon(couponCode: string, venueId: string): Promise<CouponValidationResponse> {
    const response = await apiService.post(API_ENDPOINTS.APPLICATION.COUPONS.VALIDATE, null, {
      params: { coupon_code: couponCode, venue_id: venueId },
    });
    return response.data as CouponValidationResponse;
  }
}

export const couponService = new CouponService();
export default couponService;
