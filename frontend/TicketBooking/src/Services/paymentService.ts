import api from "../api/axios";
import type { ApiResponse, CreatePaymentOrderResponse, VerifyPaymentRequest } from "../types";
import { API_ROUTES } from "../constants/apiRoutes";

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

export const checkPaymentAttempt = async (
  orderId: string
): Promise<{ paymentAttempted: boolean; razorpayPaymentId?: string }> => {
  const response = await api.get<ApiResponse<{ paymentAttempted: boolean; razorpayPaymentId?: string }>
  >(API_ROUTES.PAYMENT.CHECK_ATTEMPT(orderId));
  return response.data.data;
};

export const createPaymentOrderWithBooking = async (
  bookingData: {
    eventId: number;
    quantity: number;
    discountType: string;
    couponCode?: string | null;
  }
): Promise<CreatePaymentOrderResponse> => {
  const response = await api.post<{
    success: boolean;
    data: CreatePaymentOrderResponse;
    message?: string;
  }>(API_ROUTES.PAYMENT.CREATE_ORDER, {
    bookingId: 0,
    bookingData,
  });
  return response.data.data;
};
