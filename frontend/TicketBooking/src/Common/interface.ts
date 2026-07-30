import type { Role } from "./types";

export interface LoginResponse {
  message: string;
  userId: number;
  role: Role;
}

export interface ApiErrorResponse {
  field?: string;
  message: string;
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
}

export interface CouponCode {
  id: number;
  code: string;
  discountPercentage: number;
}
