import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { ApiErrorResponse, BookingSummaryResponse } from "../Common/interface";
import { getMyBookings } from "../Services/bookingService";
import { classifyBooking, type BookingCategory } from "../utils/bookingUtils";

export const useMyBookings = () => {
    const [bookings, setBookings] = useState<BookingSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                setBookings(await getMyBookings());
            } catch (err) {
                setError(
                    axios.isAxiosError(err)
                        ? (err.response?.data as ApiErrorResponse)?.message || "Failed to load your bookings"
                        : "Failed to load your bookings",
                );
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const grouped = useMemo(() => {
        const groups: Record<BookingCategory, BookingSummaryResponse[]> = {
            upcoming: [], past: [], pending: [], failed: [],
        };
        bookings.forEach((b) => groups[classifyBooking(b)].push(b));
        groups.upcoming.sort((a, b) => +new Date(a.eventDate) - +new Date(b.eventDate)); // soonest first
        groups.past.sort((a, b) => +new Date(b.eventDate) - +new Date(a.eventDate));     // most recent first
        return groups;
    }, [bookings]);

    return { bookings, grouped, loading, error };
};