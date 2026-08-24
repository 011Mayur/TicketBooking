import { useEffect, useRef } from 'react';
import { cancelBooking } from '../Services/checkoutService';



export function useAbandonedBookingCleanup(bookingId: number | null) {
    const isCompletedRef = useRef(false);

    useEffect(() => {
        isCompletedRef.current = false;
    }, [bookingId]);

    useEffect(() => {
        return () => {
            if (bookingId && !isCompletedRef.current) {
                cancelBooking(bookingId).catch(() => {

                });
            }
        };
    }, [bookingId]);


    const markCompleted = () => {
        isCompletedRef.current = true;
    };

    return { markCompleted };
}