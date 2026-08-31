import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { ApiErrorResponse, CouponOffer } from "../../types";
import { getAvailableCoupons } from "../../services/couponService";

export const useCoupons = (eventId: number | undefined) => {
    const [coupons, setCoupons] = useState<CouponOffer[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCoupons = useCallback(async () => {
        if (!eventId) return;
        try {
            setLoading(true);
            setError(null);
            setCoupons(await getAvailableCoupons(eventId));
        } catch (err) {
            const apiError = axios.isAxiosError(err)
                ? (err.response?.data as ApiErrorResponse)?.message
                : null;
            setError(apiError || "Failed to load coupons");
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

    return { coupons, loading, error };
};
