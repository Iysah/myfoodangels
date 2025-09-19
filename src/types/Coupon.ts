export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number; // percentage (0-100) or fixed amount
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number; // for percentage discounts
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  applicableCategories?: string[]; // empty array means all categories
  createdAt: Date;
  updatedAt: Date;
}

export interface AppliedCoupon {
  coupon: Coupon;
  discountAmount: number;
}

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount?: number;
}