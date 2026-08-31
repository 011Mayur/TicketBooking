import type { BookingDiscountTypeValue, PaymentStatus } from "./common.types";

export interface CheckoutState {
  eventId: number;
  quantity: number;
  discountType: BookingDiscountTypeValue;
  couponCode?: string;
  bulkDiscountPercentage?: number;
  couponDiscountPercentage?: number;
}

export interface BookingData {
  eventId: number;
  quantity: number;
  discountType: BookingDiscountTypeValue;
  couponCode?: string;
}

export interface BookingResponse {
  id: number;
  eventId: number;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  bulkDiscountPercentage?: number;
  bulkDiscountAmount?: number;
  couponCode?: string;
  couponDiscountPercentage?: number;
  couponDiscountAmount?: number;
  finalAmount: number;
  status: string;
  expiresAt: string;
}

export interface BookingSummaryResponse {
  id: number;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  quantity: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
}

export interface PricingBreakdown {
  unitPrice: number;
  quantity: number;
  subTotal: number;
  bulkDiscountPercentage?: number;
  bulkDiscountAmount?: number;
  couponDiscountPercentage?: number;
  couponDiscountAmount?: number;
  finalAmount: number;
  discountType: BookingDiscountTypeValue;
  bulkEligible: boolean;
}
