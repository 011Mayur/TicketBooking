export interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  isActive: boolean;
  description: string;
}

export interface CouponCode {
  id: number;
  code: string;
  discountPercentage: number;
}

export interface CouponOffer {
  id: number;
  code: string;
  discountPercentage: number;
  isUsed: boolean;
}

export interface CouponValidation {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  isActive: boolean;
  isLinkedToEvent: boolean;
  alreadyUsedByUser: boolean;
}
