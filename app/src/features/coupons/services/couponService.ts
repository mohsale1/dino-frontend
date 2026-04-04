/**
 * Coupon Service
 * Handles API calls for coupon operations
 */

import { apiService } from '../../../utils/api';
import type { Coupon, CouponCreate, CouponUpdate, CouponValidationRequest, CouponValidationResponse } from '../types';

/**
 * Convert a 'YYYY-MM-DD' date string to a full ISO 8601 datetime string.
 * If the value is already a full datetime string (contains 'T'), it is returned as-is.
 */
function toISODateTime(date: string): string {
  if (!date) return date;
  return date.includes('T') ? date : `${date}T00:00:00.000Z`;
}

class CouponService {
  private baseUrl = '/application/coupons';

  // ==================== Coupons ====================
  
  /**
   * Get coupons list.
   * The backend may return a paginated envelope { data: Coupon[], pagination: {...} }
   * or a plain array. Both shapes are handled.
   */
  async getCoupons(workspaceId: string, page: number = 1, pageSize: number = 100, isAvailable?: boolean): Promise<Coupon[]> {
    const params: any = {
      workspace_id: workspaceId,
      page,
      page_size: pageSize,
      order_by: 'created_at',
      order_direction: 'desc'
    };
    
    if (isAvailable !== undefined) {
      params.is_available = isAvailable;
    }
    
    const response = await apiService.get(this.baseUrl, { params });
    const raw = response.data as any;

    // Unwrap paginated envelope if present
    if (raw && Array.isArray(raw.data)) {
      return raw.data;
    }

    return Array.isArray(raw) ? raw : [];
  }

  async getCoupon(id: string): Promise<Coupon> {
    const response = await apiService.get(`${this.baseUrl}/${id}`);
    return response.data as any;
  }

  async getCouponByCode(code: string, workspaceId: string): Promise<Coupon> {
    const response = await apiService.get(`${this.baseUrl}/code/${code}`, {
      params: { workspace_id: workspaceId }
    });
    return response.data as any;
  }

  async createCoupon(data: CouponCreate): Promise<Coupon> {
    const response = await apiService.post(this.baseUrl, {
      code: data.code,
      name: data.name,
      description: data.description,
      workspace_id: data.workspaceId,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      max_discount_amount: data.maxDiscountAmount,
      min_order_amount: data.minOrderAmount,
      usage_limit: data.usageLimit,
      usage_limit_per_user: data.usageLimitPerUser,
      valid_from: data.validFrom ? toISODateTime(data.validFrom) : undefined,
      valid_until: data.validUntil ? toISODateTime(data.validUntil) : undefined,
      is_available: data.isAvailable ?? true,
    });
    return response.data as any;
  }

  /**
   * Update a coupon.
   * - Includes 'code' in the payload when provided.
   * - Converts validFrom/validUntil from 'YYYY-MM-DD' to ISO 8601 datetime.
   */
  async updateCoupon(id: string, data: CouponUpdate): Promise<Coupon> {
    const payload: any = {};
    if (data.code !== undefined) payload.code = data.code;
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.discountType !== undefined) payload.discount_type = data.discountType;
    if (data.discountValue !== undefined) payload.discount_value = data.discountValue;
    if (data.maxDiscountAmount !== undefined) payload.max_discount_amount = data.maxDiscountAmount;
    if (data.minOrderAmount !== undefined) payload.min_order_amount = data.minOrderAmount;
    if (data.usageLimit !== undefined) payload.usage_limit = data.usageLimit;
    if (data.usageLimitPerUser !== undefined) payload.usage_limit_per_user = data.usageLimitPerUser;
    if (data.validFrom !== undefined) payload.valid_from = toISODateTime(data.validFrom);
    if (data.validUntil !== undefined) payload.valid_until = toISODateTime(data.validUntil);
    if (data.isAvailable !== undefined) payload.is_available = data.isAvailable;
    
    const response = await apiService.put(`${this.baseUrl}/${id}`, payload);
    return response.data as any;
  }

  async deleteCoupon(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restoreCoupon(id: string): Promise<void> {
    await apiService.put(`${this.baseUrl}/${id}/restore`, {});
  }

  async validateCoupon(request: CouponValidationRequest): Promise<CouponValidationResponse> {
    const response = await apiService.post(`${this.baseUrl}/validate`, {
      code: request.code,
      workspace_id: request.workspaceId,
      order_amount: request.orderAmount,
    });
    return response.data as any;
  }

  async applyCoupon(id: string): Promise<void> {
    await apiService.post(`${this.baseUrl}/${id}/apply`, {});
  }
}

export const couponService = new CouponService();
export default couponService;
