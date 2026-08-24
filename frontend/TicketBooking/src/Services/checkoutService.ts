import api from "../Api/axios";
import type { ApiResponse, BookingData, BookingResponse, CouponOffer, CouponValidation, CreatePaymentOrderResponse, EventResponse, VerifyPaymentRequest } from "../Common/interface";
import { API_ROUTES } from "../Constant/apiRoutes";

// Booking API calls
export const createBooking = async (
  bookingData: BookingData
): Promise<BookingResponse> => {
  const response = await api.post<ApiResponse<BookingResponse>>(
    API_ROUTES.BOOKING.CREATE,
    bookingData
  );
  return response.data.data;
};

export const getBookingById = async (bookingId: number): Promise<BookingResponse> => {
  const response = await api.get<ApiResponse<BookingResponse>>(
    API_ROUTES.BOOKING.GET_BY_ID(bookingId)
  );
  return response.data.data;
};

// Coupon API calls
export const validateCoupon = async (
  code: string,
  eventId: number
): Promise<CouponValidation> => {
  const response = await api.post<ApiResponse<CouponValidation>>(
    API_ROUTES.BOOKING.COUPON_APPLY,
    { code, eventId }
  );
  return response.data.data;
};

// Payment API calls
export const createPaymentOrder = async (
  bookingId: number
): Promise<CreatePaymentOrderResponse> => {
  const response = await api.post<ApiResponse<CreatePaymentOrderResponse>>(
    API_ROUTES.PAYMENT.CREATE_ORDER,
    { bookingId }
  );
  return response.data.data;
};

export const verifyPayment = async (
  verifyData: VerifyPaymentRequest
): Promise<{ isValid: boolean; message: string }> => {
  const response = await api.post<
    ApiResponse<{ isValid: boolean; message: string }>
  >(API_ROUTES.PAYMENT.VERIFY, verifyData);
  return response.data.data;
};

export const getAvailableCoupons = async (eventId: number): Promise<CouponOffer[]> => {
  const response = await api.get<ApiResponse<CouponOffer[]>>(
    API_ROUTES.BOOKING.EVENT_COUPON(eventId),
  );
  return response.data.data;
};



export const getEventById = async (eventId: number): Promise<EventResponse> => {
  const response = await api.get<ApiResponse<EventResponse>>(API_ROUTES.BOOKING.EVENT_BY_ID(eventId));
  return response.data.data;
};

export const cancelBooking = async (bookingId: number): Promise<ApiResponse<boolean>> => {
  const { data } = await api.post(API_ROUTES.BOOKING.CANCEL(bookingId));
  return data.data;
}

export const releaseBooking = async (
  bookingId: number,
  status: "Pending" | "Failed",
  razorpayPaymentId?: string
): Promise<boolean> => {
  const response = await api.post<ApiResponse<boolean>>(
    API_ROUTES.BOOKING.RELEASE(bookingId),
    {
      status,
      razorpayPaymentId: razorpayPaymentId || null
    }
  );
  return response.data.data;
};

export const checkPaymentAttempt = async (
  orderId: string
): Promise<{ paymentAttempted: boolean; razorpayPaymentId?: string }> => {
  const response = await api.get<ApiResponse<{ paymentAttempted: boolean; razorpayPaymentId?: string }>
  >(API_ROUTES.PAYMENT.CHECK_ATTEMPT(orderId));
  return response.data.data;
};

export const validateCheckout = async (
  checkoutData: {
    eventId: number;
    quantity: number;
    discountType: string;
    couponCode?: string | null;
  }
): Promise<boolean> => {
  const response = await api.post<ApiResponse<boolean>>(
    "/bookings/validate-checkout",
    checkoutData
  );
  return response.data.success;
};

