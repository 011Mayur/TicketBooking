import type { CouponCode } from "./coupon.types";

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

export interface HomePageEvent {
  id: number;
  title: string;
  venue: string;
  eventDate: string;
  posterImageUrl?: string;
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
