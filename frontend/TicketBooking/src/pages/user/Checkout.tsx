import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { APP_ROUTES } from "../../constants/appRoutes";
import { useAuth } from "../../hooks/auth/useAuth";
import { useEventDetail } from "../../hooks/event/useEventDetail";
import { useCheckout } from "../../hooks/checkout/useCheckout";
import { useCoupons } from "../../hooks/checkout/useCoupons";
import { validateCoupon } from "../../services/couponService";
import { validateCheckout } from "../../services/bookingService";
import CouponOfferCard from "../../components/Checkout/CouponOfferCard";
import CouponListModal from "../../components/Checkout/CouponListModal";
import PriceRow from "../../components/Checkout/PriceRow";

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ========================================
  // DATA FETCHING
  // ========================================
  const { event, loading, error } = useEventDetail(eventId);
  const { coupons, loading: couponsLoading } = useCoupons(event?.id);

  // ========================================
  // LOCAL STATE
  // ========================================
  const quantity: number = location.state?.quantity || 1;
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [validatingCheckout, setValidatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // ========================================
  // PRICE & DISCOUNT CALCULATION
  // ========================================
  const checkout = useCheckout({
    eventId: event?.id || 0,
    quantity,
    unitPrice: event?.ticketPrice || 0,
    bulkTicketForDiscount: event?.bulkTicketForDiscount,
    bulkDiscountPercentage: event?.discountPercentage,
    availableSeats: event?.availableSeats || 0,
  });

  // ========================================
  // HANDLERS
  // ========================================

  const applyCouponByCode = async (code: string) => {
    if (!event) return;
    try {
      setApplyingCoupon(true);
      checkout.setCouponErrorMsg("");
      const coupon = await validateCoupon(code, event.id);
      checkout.applyCoupon(coupon);
      setCouponCode("");
    } catch (err) {
      const apiError =
        err instanceof Error ? err.message : "Invalid coupon code";
      checkout.setCouponErrorMsg(apiError);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    if (!event) {
      setCheckoutError("Event data not loaded");
      return;
    }

    setValidatingCheckout(true);
    setCheckoutError(null);

    try {
      const isValid = await validateCheckout({
        eventId: event.id,
        quantity,
        discountType: checkout.checkoutState.discountType,
        couponCode: checkout.couponData?.code || null,
      });

      if (isValid) {
        navigate(APP_ROUTES.PAYMENT(event.id), {
          state: {
            checkoutData: {
              eventId: event.id,
              quantity,
              unitPrice: event.ticketPrice,
              discountType: checkout.checkoutState.discountType,
              couponCode: checkout.couponData?.code || null,
            },
          },
        });
      } else {
        setCheckoutError("Checkout validation failed");
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Validation failed. Please try again.";
      console.error("Checkout error:", errorMsg);
      setCheckoutError(errorMsg);
    } finally {
      setValidatingCheckout(false);
    }
  };

  const handleLoginRedirect = () => {
    setLoginDialogOpen(false);
    navigate(APP_ROUTES.USER_LOGIN, {
      state: { from: APP_ROUTES.CHECKOUT(eventId || ""), state: { quantity } },
    });
  };

  // ========================================
  // LOADING / ERROR STATES
  // ========================================
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Alert severity="error">{error || "Event not found"}</Alert>
        <Button
          variant="contained"
          onClick={() => navigate(APP_ROUTES.HOME)}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  // ========================================
  // RENDER
  // ========================================
  const pricing = checkout.pricing;
  const hasCouponDiscount =
    checkout.checkoutState.discountType === "Coupon" &&
    !!pricing.couponDiscountAmount;
  const hasBulkDiscount =
    checkout.checkoutState.discountType === "Bulk" &&
    !!pricing.bulkDiscountAmount;
  const visibleCoupons = coupons.slice(0, 5);

  return (
    <Container
      maxWidth="lg"
      sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, md: 3 }, pb: 4 }}
    >
      <Button
        onClick={() => navigate(APP_ROUTES.EVENT(event.id))}
        sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
      >
        <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} /> Back to Event
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" },
          gap: { xs: 2, md: 3 },
        }}
      >
        {/* LEFT: Order details */}
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}
        >
          {/* Order Summary Card */}
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Your order
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mb: 2 }}
              >
                Complete payment to confirm your seat
              </Typography>

              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, lineHeight: 1.3 }}
                  >
                    {event.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {event.venue}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, color: "text.secondary" }}
                  >
                    {quantity} ticket{quantity > 1 ? "s" : ""} × ₹
                    {event.ticketPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Coupons Card */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <CardContent
              sx={{ p: 2.5, minWidth: 0, "&:last-child": { pb: 2.5 } }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 0.5,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Coupons & Offers
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Apply a code to save on this booking
                  </Typography>
                </Box>
                <Button
                  size="small"
                  sx={{
                    textTransform: "none",
                    flexShrink: 0,
                    fontWeight: 600,
                    borderRadius: 28,
                  }}
                  onClick={() => setCouponModalOpen(true)}
                  variant="outlined"
                >
                  View All
                </Button>
              </Box>

              {couponsLoading ? (
                <Box sx={{ py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : visibleCoupons.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 1,
                    mt: 2,
                    mb: 0.5,
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    pb: 1,
                    "& > *": {
                      flexShrink: 0,
                    },
                  }}
                >
                  {visibleCoupons.map((c) => (
                    <CouponOfferCard
                      key={c.id}
                      code={c.code}
                      discountPercentage={c.discountPercentage}
                      savingsAmount={
                        (pricing.subTotal * c.discountPercentage) / 100
                      }
                      isUsed={c.isUsed}
                      isSelected={checkout.couponData?.code === c.code}
                      onApply={() => applyCouponByCode(c.code)}
                    />
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    mt: 2,
                    mb: 2,
                  }}
                >
                  No offers available right now.
                </Typography>
              )}

              {checkout.couponData ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: "rgba(25, 118, 210, 0.06)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {checkout.couponData.code} applied
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={checkout.removeCoupon}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Have another code? Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      disabled={applyingCoupon}
                      onKeyDown={(e) =>
                        e.key === "Enter" && applyCouponByCode(couponCode)
                      }
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={() => applyCouponByCode(couponCode)}
                      disabled={applyingCoupon || !couponCode.trim()}
                      sx={{ borderRadius: 2, px: 3 }}
                    >
                      {applyingCoupon ? (
                        <CircularProgress size={18} sx={{ color: "inherit" }} />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </Box>
                  {checkout.couponError && (
                    <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>
                      {checkout.couponError}
                    </Alert>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT: Price breakdown */}
        <Box sx={{ height: isMobile ? "auto" : "100%" }}>
          <Card
            sx={{
              position: isMobile ? "static" : "sticky",
              top: 16,
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              height: isMobile ? "auto" : "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                p: 2.5,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                "&:last-child": { pb: 2.5 },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                Price breakdown
              </Typography>

              <PriceRow
                label={`${quantity} ticket${quantity > 1 ? "s" : ""}`}
                value={`₹${pricing.subTotal.toFixed(2)}`}
              />

              {hasCouponDiscount && (
                <PriceRow
                  label={`Coupon (${checkout.couponData?.code})`}
                  value={`-₹${pricing.couponDiscountAmount!.toFixed(2)}`}
                  color="success.main"
                />
              )}
              {hasBulkDiscount && (
                <PriceRow
                  label={`Bulk discount (${pricing.bulkDiscountPercentage}%)`}
                  value={`-₹${pricing.bulkDiscountAmount!.toFixed(2)}`}
                  color="success.main"
                />
              )}

              <Box
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                  pt: 1,
                  mt: 1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Total payable
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  ₹{pricing.finalAmount.toFixed(2)}
                </Typography>
              </Box>

              {checkoutError && (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                  {checkoutError}
                </Alert>
              )}

              <Box sx={{ flexGrow: 1 }} />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleProceedToPayment}
                disabled={validatingCheckout}
                sx={{ mt: 2, py: 1.25, fontWeight: 600 }}
              >
                {validatingCheckout ? (
                  <CircularProgress size={20} sx={{ color: "inherit" }} />
                ) : isAuthenticated ? (
                  `Pay ₹${pricing.finalAmount.toFixed(2)} securely`
                ) : (
                  "Login to Continue"
                )}
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  textAlign: "center",
                  mt: 1.5,
                  color: "text.secondary",
                }}
              >
                By continuing you agree to the Terms & Refund policy.
              </Typography>

              {event.availableSeats <= 15 && (
                <Alert severity="warning" sx={{ mt: 1.5, py: 0.5 }}>
                  Only {event.availableSeats} seats left at this price
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modals */}
      <CouponListModal
        open={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        coupons={coupons}
        loading={couponsLoading}
        selectedCode={checkout.couponData?.code}
        onApply={applyCouponByCode}
      />

      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogTitle>Sign in to Complete Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            You need to be logged in to complete your booking.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLoginRedirect} variant="contained" autoFocus>
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;
