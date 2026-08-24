import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getEventDetail } from "../Services/eventService";
import type { ApiErrorResponse, EventDetail } from "../Common/interface";

export const useEventDetail = (eventId: string | undefined) => {
    const [event, setEvent] = useState<EventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvent = useCallback(async () => {
        if (!eventId) {
            setError("Event ID is missing");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setEvent(await getEventDetail(eventId));
        } catch (err) {
            const apiError = axios.isAxiosError(err)
                ? (err.response?.data as ApiErrorResponse)?.message
                : null;
            setError(apiError || "Failed to load event");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    return { event, loading, error, refetch: fetchEvent };
};