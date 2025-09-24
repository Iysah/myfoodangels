export interface Coupon {
  id?: string; // Firebase document ID
  applicableCategories: string[];
  applicableProducts: string[];
  code: string;
  discountAmount: string;
  discountType: 'percentage' | 'fixed_amount';
  expirationDate: Date;
  isActive: boolean;
  minSpend: number;
  name: string;
  oneTimeUse: boolean;
  purpose: string;
  slug: string;
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