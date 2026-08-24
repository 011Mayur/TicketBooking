import { useEffect, useState } from "react";

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const useRazorpayScript = () => {
    const [loaded, setLoaded] = useState(!!window.Razorpay);

    useEffect(() => {
        if (window.Razorpay) return setLoaded(true);
        const script = document.createElement("script");
        script.src = RAZORPAY_SRC;
        script.async = true;
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    return loaded;
};