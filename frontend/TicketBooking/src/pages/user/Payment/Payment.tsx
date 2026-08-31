import { Container, Box, Button, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentDetailsCard from "./PaymentDetailsCard";
import OrderSummaryCard from "./OrderSummaryCard";
import PaymentLoginDialog from "./PaymentLoginDialog";
import PaymentStateScreen from "./PaymentStateScreen";
import { useAuth } from "../../../hooks/auth/useAuth";
import type { BookingResponse, EventResponse } from "../../../types";
import { usePaymentData } from "../../../hooks/payment/usePaymentData";
import { useRazorpayScript } from "../../../hooks/payment/useRazorPayScript";
import { usePaymentOrder } from "../../../hooks/payment/usePaymentOrder";
import { usePaymentSuccessRedirect } from "../../../hooks/payment/usePaymentSuccessRedirect";
import { useRazorpayCheckout } from "../../../hooks/payment/useRazorPayCheckout";
import PaymentEventHeader from "./PaymentEventHeader";
import { APP_ROUTES } from "../../../constants/appRoutes";

const Payment = () => {
  // ========================================
  // STEP 1: Get all routing hooks FIRST
  // ========================================
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // ========================================
  // STEP 2: Get auth hook FIRST (unconditionally)
  // ========================================
  const { isAuthenticated, loading: authLoading } = useAuth();

  // ========================================
  // STEP 3: Extract state data
  // ========================================
  const checkoutData = location.state?.checkoutData;

  // ========================================
  // STEP 4: Call ALL hooks UNCONDITIONALLY
  // (before any guard checks)
  // ========================================
  const {
    paymentOrder,
    loading: orderLoading,
    error: orderError,
  } = usePaymentOrder({
    checkoutData,
    enabled: !!checkoutData && isAuthenticated,
  });

  const {
    booking,
    event: paymentEvent,
    loading: paymentDataLoading,
    error: paymentDataError,
  } = usePaymentData({
    eventId: checkoutData?.eventId,
    bookingId: paymentOrder?.bookingId,
  });

  const scriptLoaded = useRazorpayScript();

  const [paymentSuccess, setPaymentSuccess] =
    usePaymentSuccessRedirect(navigate);

  const {
    pay,
    processing,
    error: payError,
  } = useRazorpayCheckout({
    bookingId: paymentOrder?.bookingId || 0,
    paymentOrder,
    scriptLoaded,
    onSuccess: () => {
      setPaymentSuccess(true);
    },
    onFailure: () => {
      console.error("Payment failed");
    },
    onDismiss: () => {},
  });




  if (authLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
        <CircularProgress />
        <Box sx={{ mt: 2 }}>Verifying your session...</Box>
      </Container>
    );
  }

  // Guard 2: Check authentication
  if (!isAuthenticated) {
    console.error("User not authenticated");
    return (
      <PaymentStateScreen
        variant="not-found"
        onBack={() => navigate(APP_ROUTES.HOME)}
      />
    );
  }

  // Guard 3: Check checkout data exists
  if (!checkoutData) {
    console.error("No checkoutData found");
    return (
      <PaymentStateScreen
        variant="not-found"
        onBack={() => navigate(APP_ROUTES.HOME)}
      />
    );
  }

  // Guard 4: Check payment order loaded
  if (orderLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
        <CircularProgress />
        <Box sx={{ mt: 2 }}>Initializing payment...</Box>
      </Container>
    );
  }

  // Guard 5: Check payment order error
  if (orderError) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">
          Failed to initialize payment: {orderError}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Guard 6: Check payment order created
  if (!paymentOrder) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">
          Payment order not created. Please try again.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  // Guard 7: Check payment success
  if (paymentSuccess) {
    return <PaymentStateScreen variant="success" />;
  }

  // ========================================
  // STEP 7: Render logic (all guards passed)
  // ========================================

  // ✅ Use checkoutData.unitPrice if available, fallback to fetched event
  const displayEvent: EventResponse = paymentEvent || {
    id: checkoutData.eventId,
    title: "Event",
    venue: "",
    availableSeats: 0,
    ticketPrice: checkoutData?.unitPrice || 0, // ✅ USE PASSED unitPrice
    artistName: "",
    eventDate: new Date().toISOString().split("T")[0],
    eventTime: "00:00:00",
  };

  // ✅ Use checkoutData.unitPrice for calculation
  const displayBooking: BookingResponse =
    booking ||
    ({
      id: paymentOrder?.bookingId || 0,
      eventId: checkoutData.eventId,
      eventTitle: displayEvent?.title || "Event",
      quantity: checkoutData.quantity,
      unitPrice: checkoutData?.unitPrice || displayEvent?.ticketPrice || 0, // ✅ USE PASSED unitPrice
      subTotal:
        (checkoutData?.unitPrice || displayEvent?.ticketPrice || 0) *
        checkoutData.quantity, // ✅ USE PASSED unitPrice
      finalAmount: paymentOrder?.amount || 0,
      status: "Pending",
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
    } as BookingResponse);

  // Combine all errors
  const allErrors = orderError || paymentDataError || payError;

  // Disable pay button conditions
  const isPayDisabled =
    !paymentOrder || processing || !scriptLoaded || paymentDataLoading;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}>
      <Button
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: "none" }}
      >
        <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} /> Back
      </Button>

      {/* Event header */}
      {displayEvent && <PaymentEventHeader event={displayEvent} />}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: { xs: 2.5, md: 4 },
        }}
      >
        {/* LEFT: Payment form */}
        <PaymentDetailsCard
          booking={displayBooking}
          event={displayEvent}
          error={allErrors}
          processing={processing}
          payDisabled={isPayDisabled}
          onPay={pay}
        />

        {/* RIGHT: Order summary */}
        <OrderSummaryCard booking={displayBooking} event={displayEvent} />
      </Box>

      {/* Login guard (should not show since we guard at top) */}
      <PaymentLoginDialog
        open={!isAuthenticated}
        bookingIdParam={id}
        locationState={location.state}
      />
    </Container>
  );
};

export default Payment;
