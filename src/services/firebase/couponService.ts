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

  async getAllUserCoupons(userId?: string): Promise<Coupon[]> {
    try {
      const couponCodesRef = collection(firestore, 'couponCodes');
      let q = query(couponCodesRef, where('isActive', '==', true));
      
      // If userId is provided, filter by user-specific coupons
      // For now, we'll get all active coupons since the structure doesn't show user-specific filtering
      
      const querySnapshot = await getDocs(q);
      const coupons: Coupon[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const coupon: Coupon = {
          id: doc.id,
          applicableCategories: data.applicableCategories || [],
          applicableProducts: data.applicableProducts || [],
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          expirationDate: data.expirationDate?.toDate() || new Date(),
          isActive: data.isActive,
          minSpend: data.minSpend || 0,
          name: data.name,
          oneTimeUse: data.oneTimeUse || false,
          purpose: data.purpose,
          slug: data.slug,
        };
        
        // Only include non-expired coupons
        if (coupon.expirationDate > new Date()) {
          coupons.push(coupon);
        }
      });
      
      return coupons;
    } catch (error) {
      console.error('Error fetching user coupons:', error);
      return [];
    }
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

      // Check expiration date
      const now = new Date();
      if (now > coupon.expirationDate) {
        return {
          isValid: false,
          message: 'This coupon has expired'
        };
      }

      // Check minimum spend amount
      if (coupon.minSpend && orderTotal < coupon.minSpend) {
        return {
          isValid: false,
          message: `Minimum order amount of ₦${coupon.minSpend} required`
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
      const couponCodesRef = collection(firestore, 'couponCodes');
      const q = query(couponCodesRef, where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        applicableCategories: data.applicableCategories || [],
        applicableProducts: data.applicableProducts || [],
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        expirationDate: data.expirationDate?.toDate() || new Date(),
        isActive: data.isActive,
        minSpend: data.minSpend || 0,
        name: data.name,
        oneTimeUse: data.oneTimeUse || false,
        purpose: data.purpose,
        slug: data.slug,
      };
    } catch (error) {
      console.error('Error fetching coupon:', error);
      return null;
    }
  }

  private calculateDiscountAmount(coupon: Coupon, orderTotal: number): number {
    let discountAmount = 0;
    const discountValue = parseFloat(coupon.discountAmount);

    if (coupon.discountType === 'percentage') {
      discountAmount = (orderTotal * discountValue) / 100;
    } else if (coupon.discountType === 'fixed_amount') {
      discountAmount = discountValue;
      
      // Don't allow discount to exceed order total
      if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
      }
    }

    return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
  }
}

export const couponService = CouponService.getInstance();