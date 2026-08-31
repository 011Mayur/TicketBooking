import { useEffect, useState } from "react";
import axios from "axios";
import type { BookingResponse, EventResponse, ApiErrorResponse } from "../../types";
import { getBookingById } from "../../services/bookingService";
import { getEventById } from "../../services/eventService";

interface Args {
    eventId?: number;
    bookingId?: number;
}

/**
 * Fetch booking and event details for payment page display
 * Accepts object with eventId and bookingId properties
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
        // bookingId of 0 means no real booking exists yet (payment not verified).
        // Skip the fetch entirely to avoid a pointless 404 error.
        if (!bookingId || bookingId <= 0) {
            setBooking(null);
            return;
        }

        const fetchBooking = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await getBookingById(bookingId);
                setBooking(data);
                setError(null);
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
        if (!eventId || eventId === 0) {
            setEvent(null);
            return;
        }

        const fetchEvent = async () => {
            try {
                const data = await getEventById(eventId);
                setEvent(data);
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
