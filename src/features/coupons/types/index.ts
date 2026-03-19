
/**
 * Coupon Types
 */

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  workspaceId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreate {
  code: string;
  name: string;
  description?: string;
  workspaceId: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isAvailable?: boolean;
}

export interface CouponUpdate {
  name?: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom?: string;
  validUntil?: string;
  isAvailable?: boolean;
}

export interface CouponValidationRequest {
  code: string;
  workspaceId: string;
  orderAmount: number;
}

export interface CouponValidationResponse {
  valid: boolean;
  message: string;
  discountAmount: number;
  coupon?: Coupon;
}