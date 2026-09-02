import api from "../api/axios";
import type { ApiResponse, BookingResponse, BookingSummaryResponse } from "../types";
import { API_ROUTES } from "../constants/apiRoutes";



export const getBookingById = async (bookingId: number): Promise<BookingResponse> => {
  const response = await api.get<ApiResponse<BookingResponse>>(
    API_ROUTES.BOOKING.GET_BY_ID(bookingId)
  );
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
    API_ROUTES.BOOKING.VALIDATE_CHECKOUT,
    checkoutData
  );
  return response.data.success;
};

export const getMyBookings = async (): Promise<BookingSummaryResponse[]> => {
  const { data } = await api.get<ApiResponse<BookingSummaryResponse[]>>(API_ROUTES.BOOKING.MY_BOOKINGS);
  return data.data;
};