import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { CreatePaymentOrderResponse, ApiErrorResponse } from "../../types";
import { createPaymentOrderWithBooking } from "../../services/paymentService";

interface CheckoutData {
    eventId: number;
    quantity: number;
    discountType: string;
    unitPrice: number;
    couponCode?: string | null;
}

interface Args {
    checkoutData?: CheckoutData;
    enabled?: boolean;
}
export const usePaymentOrder = ({
    checkoutData,
    enabled = true,
}: Args) => {
    const hasFiredRef = useRef(false);
    const [paymentOrder, setPaymentOrder] = useState<CreatePaymentOrderResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !checkoutData || hasFiredRef.current) return;
        hasFiredRef.current = true;

        const createOrder = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await createPaymentOrderWithBooking({
                    eventId: checkoutData.eventId,
                    quantity: checkoutData.quantity,
                    discountType: checkoutData.discountType,
                    couponCode: checkoutData.couponCode || null,
                });

                setPaymentOrder(data);
                setError(null);
            } catch (err) {
                let errorMsg = "Failed to create payment order";
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 422) {
                        errorMsg = " Please try again in 15 minutes.";
                    } else {
                        errorMsg = (err.response?.data as ApiErrorResponse)?.message || err.message || errorMsg;
                    }
                }

                console.error("Payment order exception:", errorMsg, err);
                setError(errorMsg);
                setPaymentOrder(null);
            } finally {
                setLoading(false);
            }
        };

        createOrder();
    }, [enabled, checkoutData, checkoutData?.eventId, checkoutData?.quantity]);

    return {
        paymentOrder,
        loading,
        error,
    };
};
