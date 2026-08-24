
import api from "../Api/axios";
import type { ApiResponse, BookingSummaryResponse } from "../Common/interface";
import { API_ROUTES } from "../Constant/apiRoutes";

export const getMyBookings = async (): Promise<BookingSummaryResponse[]> => {
    const { data } = await api.get<ApiResponse<BookingSummaryResponse[]>>(API_ROUTES.BOOKING.MY_BOOKINGS);
    return data.data;
};