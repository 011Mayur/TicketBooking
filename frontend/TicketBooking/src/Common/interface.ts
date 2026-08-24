import type { BookingDiscountTypeValue, PaymentStatus, Role } from "./types";

export interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<string>;
}
export interface LoginResponse {
  message: string;
  userId: number;
  role: Role;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: Record<string, string[]>;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface EventType {
  id: number;
  name: string;
}

export interface Event {
  id: number;
  title: string;
  artistName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  ticketPrice: number;
  totalSeats: number;
  availableSeats: number;
  bulkTicketForDiscount: number;
  discountPercentage: number;
  couponIds: number[];
  appliedCoupons: CouponCode[];
  posterImageUrl: string;
  eventCategoryId: number;
  eventTypeId: number;
  description: string;
}

export interface PosterImageUrl {
  url: string;
}
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
export interface HomePageEvent {
  id: number;
  title: string;
  venue: string;
  eventDate: string;
  posterImageUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
}

export interface EventDetail {
  id: number;
  title: string;
  artistName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  posterImageUrl: string;
  ticketPrice: number;
  availableSeats: number;
  bulkTicketForDiscount: number;
  discountPercentage: number;
  description: string;
}
export interface EventTypeDetail {
  id: number;
  name: string;
  categoryCount: number;
  canDelete: boolean;
  deletionReason?: string;
  createdAt: string;
}

export interface EventCategory {
  id: number;
  name: string;
  eventTypeId: number;
  activeEventCount: number;
  pastEventCount: number;
  canDelete: boolean;
  deletionReason?: string;
  createdAt: string;
}

export interface PastEvent {
  id: number;
  title: string;
  artistName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  ticketPrice: number;
  totalSeats: number;
  availableSeats: number;
  isActive: boolean;
  updatedAt?: string;
}



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

export interface CreatePaymentOrderRequest {
  bookingId: number;
}

export interface CreatePaymentOrderResponse {
  orderId: string;
  bookingId: number;
  amount: number;
  currency: string;
  razorpayKeyId: string;
}

export interface VerifyPaymentRequest {
  bookingId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
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

export interface EventResponse {
  id: number;
  title: string;
  artistName: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  availableSeats: number;
  ticketPrice: number;
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

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  config_id?: string;
  name: string;
  description?: string;
  theme?: { color?: string };
  handler: (response: RazorpayPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}
export interface VerifyPaymentResult {
  isValid: boolean;
  message: string;
  bookingId?: number;
}
export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}