import { useState } from "react";
import axios from "axios";
import { createBooking } from "../Services/checkoutService";
import type { ApiErrorResponse, BookingData, BookingResponse } from "../Common/interface";

export const useBooking = () => {
    const [creatingBooking, setCreatingBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    const submitBooking = async (payload: BookingData): Promise<BookingResponse | null> => {
        try {
            setCreatingBooking(true);
            setBookingError(null);
            return await createBooking(payload);
        } catch (err) {
            const apiError = axios.isAxiosError(err)
                ? (err.response?.data as ApiErrorResponse)?.message
                : null;
            setBookingError(apiError || "Failed to create booking");
            return null;
        } finally {
            setCreatingBooking(false);
        }
    };

    return { creatingBooking, bookingError, submitBooking };
};