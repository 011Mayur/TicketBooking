import { useEffect, useState } from "react";
import axios from "axios";
import type { BookingResponse, EventResponse, ApiErrorResponse } from "../Common/interface";
import api from "../Api/axios";

interface Args {
    eventId?: number;
    bookingId?: number;
}

/**
 * Fetch booking and event details for payment page display
 * Accepts object with eventId and bookingId properties
 * ✅ FIXED: Handles null/undefined safely
 */
export const usePaymentData = ({
    eventId,
    bookingId,
}: Args) => {
    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [event, setEvent] = useState<EventResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ========================================
    // Fetch booking if bookingId provided
    // ========================================
    useEffect(() => {
        // ✅ FIXED: Guard clause - don't proceed if no bookingId
        if (!bookingId || bookingId === 0) {
            setBooking(null);
            return;
        }

        const fetchBooking = async () => {
            setLoading(true);
            setError(null);

            try {

                const response = await api.get<{ success: boolean; data: BookingResponse }>(
                    `/bookings/get-booking/${bookingId}`
                );

                if (response.data.success && response.data.data) {

                    setBooking(response.data.data);
                    setError(null);
                } else {
                    console.warn("No booking data returned");
                    setBooking(null);
                }
            } catch (err) {
                const errorMsg = axios.isAxiosError(err)
                    ? (err.response?.data as ApiErrorResponse)?.message || "Failed to fetch booking"
                    : "Failed to fetch booking";
                console.error("Booking fetch error:", errorMsg);
                setError(errorMsg);
                setBooking(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId]);

    // ========================================
    // Fetch event if eventId provided
    // ========================================
    useEffect(() => {
        // ✅ FIXED: Guard clause - don't proceed if no eventId
        if (!eventId || eventId === 0) {
            setEvent(null);
            return;
        }

        const fetchEvent = async () => {
            try {

                const response = await api.get<{ success: boolean; data: EventResponse }>(
                    `/bookings/get-event/${eventId}`
                );

                if (response.data.success && response.data.data) {

                    setEvent(response.data.data);
                } else {
                    console.warn("No event data returned");
                    setEvent(null);
                }
            } catch (err) {
                const errorMsg = axios.isAxiosError(err)
                    ? (err.response?.data as ApiErrorResponse)?.message || "Failed to fetch event"
                    : "Failed to fetch event";
                console.error("Event fetch error:", errorMsg);
                setEvent(null);
            }
        };

        fetchEvent();
    }, [eventId]);

    return {
        booking,
        event,
        loading,
        error,
    };
};