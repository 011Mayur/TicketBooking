import { useEffect, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";

export const usePaymentSuccessRedirect = (navigate: NavigateFunction) => {
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => navigate(APP_ROUTES.MY_BOOKINGS, { replace: true }), 2000);
        return () => clearTimeout(timer);
    }, [success, navigate]);

    return [success, setSuccess] as const;
};
