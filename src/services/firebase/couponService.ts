import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { firestore } from './config';
import { Coupon, CouponValidationResult } from '../../types/Coupon';

export class CouponService {
  private static instance: CouponService;

  static getInstance(): CouponService {
    if (!CouponService.instance) {
      CouponService.instance = new CouponService();
    }
    return CouponService.instance;
  }

  async validateCoupon(
    code: string, 
    orderTotal: number, 
    cartItems: any[] = []
  ): Promise<CouponValidationResult> {
    try {
      const coupon = await this.getCouponByCode(code);
      
      if (!coupon) {
        return {
          isValid: false,
          message: 'Invalid coupon code'
        };
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return {
          isValid: false,
          message: 'This coupon is no longer active'
        };
      }

      // Check validity dates
      const now = new Date();
      if (now < coupon.validFrom) {
        return {
          isValid: false,
          message: 'This coupon is not yet valid'
        };
      }

      if (now > coupon.validUntil) {
        return {
          isValid: false,
          message: 'This coupon has expired'
        };
      }

      // Check usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return {
          isValid: false,
          message: 'This coupon has reached its usage limit'
        };
      }

      // Check minimum order amount
      if (coupon.minimumOrderAmount && orderTotal < coupon.minimumOrderAmount) {
        return {
          isValid: false,
          message: `Minimum order amount of ₦${coupon.minimumOrderAmount} required`
        };
      }

      // Calculate discount amount
      const discountAmount = this.calculateDiscountAmount(coupon, orderTotal);

      return {
        isValid: true,
        message: 'Coupon applied successfully',
        discountAmount
      };

    } catch (error) {
      console.error('Error validating coupon:', error);
      return {
        isValid: false,
        message: 'Error validating coupon. Please try again.'
      };
    }
  }

  private async getCouponByCode(code: string): Promise<Coupon | null> {
    try {
      const couponsRef = collection(firestore, 'coupons');
      const q = query(couponsRef, where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        code: data.code,
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minimumOrderAmount: data.minimumOrderAmount,
        maximumDiscountAmount: data.maximumDiscountAmount,
        usageLimit: data.usageLimit,
        usedCount: data.usedCount || 0,
        isActive: data.isActive,
        validFrom: data.validFrom?.toDate() || new Date(),
        validUntil: data.validUntil?.toDate() || new Date(),
        applicableCategories: data.applicableCategories || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error fetching coupon:', error);
      return null;
    }
  }

  private calculateDiscountAmount(coupon: Coupon, orderTotal: number): number {
    let discountAmount = 0;

    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      
      // Apply maximum discount limit if specified
      if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
        discountAmount = coupon.maximumDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed_amount') {
      discountAmount = coupon.discountValue;
      
      // Don't allow discount to exceed order total
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
      }
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }
}

export const couponService = CouponService.getInstance();