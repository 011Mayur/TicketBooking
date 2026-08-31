import api from "../api/axios";
import type { ApiResponse, CouponOffer, CouponValidation } from "../types";
import { API_ROUTES } from "../constants/apiRoutes";

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

export const getAvailableCoupons = async (eventId: number): Promise<CouponOffer[]> => {
  const response = await api.get<ApiResponse<CouponOffer[]>>(
    API_ROUTES.BOOKING.EVENT_COUPON(eventId),
  );
  return response.data.data;
};
