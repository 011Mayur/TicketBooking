import { useState } from "react";
import axios from "axios";
import { useTheme } from "@mui/material";
import type {
    ApiErrorResponse,
    RazorpayOptions,
    RazorpayPaymentResponse,
} from "../Common/interface";
import { verifyPayment, checkPaymentAttempt } from "../Services/checkoutService";

interface Args {
    bookingId: number;
    paymentOrder: any;
    scriptLoaded: boolean;
    onSuccess: () => void;
    onFailure?: () => void;
    onDismiss?: () => void;
}

export const useRazorpayCheckout = ({
    bookingId,
    paymentOrder,
    scriptLoaded,
    onSuccess,
    onFailure,
    onDismiss,
}: Args) => {
    const theme = useTheme();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async (response: RazorpayPaymentResponse) => {
        try {
            // NEW: Call verify which creates booking on success or deletes lock on failure
            const result = await verifyPayment({
                bookingId: bookingId,
                razorpayOrderId: paymentOrder.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
            });

            if (result.isValid) {
                onSuccess();
            } else {
                setProcessing(false);
                setError(result.message || "Payment verification failed.");
                onFailure?.();
            }
        } catch (err) {
            setProcessing(false);
            const errorMsg = axios.isAxiosError(err)
                ? (err.response?.data as ApiErrorResponse)?.message ||
                "Payment verification failed"
                : "Payment verification failed";
            setError(errorMsg);
            onFailure?.();
        }
    };

    const pay = () => {
        if (!paymentOrder || !scriptLoaded || !window.Razorpay) {
            setError("Payment service not available");
            return;
        }

        setProcessing(true);
        setError(null);

        const options: RazorpayOptions = {
            key: paymentOrder.razorpayKeyId,
            amount: paymentOrder.amount * 100,
            currency: paymentOrder.currency,
            order_id: paymentOrder.orderId,
            config_id: "config_TP7MqVcGQGfWcb",
            name: "Resonance",
            description: `Event Booking #${paymentOrder.bookingId}`,
            theme: { color: theme.palette.primary.main },
            handler: handleVerify,
            modal: {
                ondismiss: async () => {
                    setProcessing(false);

                    try {
                        // Check if user attempted payment
                        const { paymentAttempted } =
                            await checkPaymentAttempt(paymentOrder.orderId);

                        if (paymentAttempted) {
                            // Payment was attempted but failed
                            setError("Payment failed. Please try again.");
                            onFailure?.();
                            // Lock will be deleted by backend when payment is marked failed
                        } else {
                            // User dismissed without attempting payment - lock will be auto-deleted
                            setError("Payment cancelled");
                            onDismiss?.();
                        }
                    } catch (err) {
                        setError("Payment cancelled");
                        onDismiss?.();
                    }
                },
            },
        };

        new window.Razorpay(options).open();
    };

    return { pay, processing, error };
};