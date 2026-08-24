import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Stack,
  Tooltip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../Api/axios";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  type ApiErrorResponse,
  type ApiResponse,
  type EventDetail,
} from "../../Common/interface";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Celebration from "@mui/icons-material/Celebration";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import LockIcon from "@mui/icons-material/Lock";
import VerifiedIcon from "@mui/icons-material/Verified";
import axios from "axios";
import { API_ROUTES } from "../../Constant/apiRoutes";
import { useAuth } from "../../Hooks/useAuth";
import { APP_ROUTES } from "../../Constant/appRoutes";

const EventDetails = () => {
  const { isAuthenticated } = useAuth();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const isEventPast = (): boolean => {
    if (!event) return false;
    const eventDateTime = new Date(`${event.eventDate}T${event.eventTime}`);
    return eventDateTime < new Date();
  };

  const isSoldOut = (): boolean => {
    if (!event) return false;
    return event.availableSeats <= 0;
  };

  const isBookingDisabled = (): boolean => {
    return isEventPast() || isSoldOut();
  };

  const getDisabledMessage = (): string => {
    if (isSoldOut()) return "This event is Sold Out";
    if (isEventPast())
      return "Booking window closed - Event has already passed";
    return "";
  };

  const hasBulkDiscount = (): boolean => {
    return event?.bulkTicketForDiscount > 0 && event?.discountPercentage > 0;
  };

  const qualifiesForDiscount = (): boolean => {
    return quantity >= (event?.bulkTicketForDiscount || 0);
  };

  const calculateTotalPrice = (): number => {
    if (!event) return 0;
    let total = event.ticketPrice * quantity;

    if (hasBulkDiscount() && qualifiesForDiscount()) {
      const discountAmount = (total * event.discountPercentage) / 100;
      total -= discountAmount;
    }

    return total;
  };

  const discountedPrice = calculateTotalPrice();
  const originalPrice = (event?.ticketPrice ?? 0) * quantity;
  const isSavingMoney = discountedPrice < originalPrice;

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!eventId) {
          setError("Event ID is missing");
          return;
        }

        const response = await api.get<ApiResponse<EventDetail>>(
          API_ROUTES.EVENTBOOKING.EVENT(eventId),
        );
        setEvent(response.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiError = err.response?.data as ApiErrorResponse;

          setError(apiError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleIncreaseQuantity = () => {
    if (!event) return;
    if (quantity < event.availableSeats) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (!event) return;

    if (value < 1) {
      setQuantity(1);
    } else if (value > event.availableSeats) {
      setQuantity(event.availableSeats);
    } else {
      setQuantity(value);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    navigate(APP_ROUTES.CHECKOUT(eventId!), {
      state: { quantity, totalPrice: discountedPrice },
    });
  };

  const handleLoginRedirect = () => {
    setLoginDialogOpen(false);
    navigate("/user-login", { state: { returnUrl: `/events/${eventId}` } });
  };

  const timeFormat = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formattedTime;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton
          variant="rectangular"
          height={400}
          sx={{ mb: 3, borderRadius: 2 }}
        />
        <Skeleton variant="text" height={40} width="80%" sx={{ mb: 2 }} />
        <Skeleton variant="text" height={24} width="60%" sx={{ mb: 3 }} />
        <Skeleton variant="text" height={100} sx={{ mb: 3 }} />
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Event not found"}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ mt: 2 }}
        >
          Back to Events
        </Button>
      </Container>
    );
  }

  // Small reusable info chip used for Venue / Date / Seats row
  const InfoChip = ({
    icon,
    label,
    value,
    valueColor,
    tooltip = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string; // narrowed from ReactNode — tooltip needs raw text to display
    valueColor?: string;
    tooltip?: boolean;
  }) => {
    const valueRef = useRef<HTMLElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const checkOverflow = () => {
      const el = valueRef.current;
      if (el) setIsOverflowing(el.scrollWidth > el.clientWidth);
    };

    const valueNode = (
      <Typography
        ref={valueRef}
        variant="body2"
        sx={{ fontWeight: 600, color: valueColor }}
        noWrap
        onMouseEnter={tooltip ? checkOverflow : undefined}
      >
        {value}
      </Typography>
    );

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1.25,
          flex: "1 1 140px",
          minWidth: 0,
          p: 1.5,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: `${theme.palette.primary.main}14`,
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary, display: "block" }}
          >
            {label}
          </Typography>
          {tooltip ? (
            <Tooltip title={value} arrow disableHoverListener={!isOverflowing}>
              {valueNode}
            </Tooltip>
          ) : (
            valueNode
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, pb: 6 }}>
      <Button
        onClick={() => navigate("/")}
        sx={{
          mb: 3,
          textTransform: "none",
          fontSize: "1rem",
          color: theme.palette.primary.main,
        }}
      >
        <ArrowBackIcon /> Back to Events
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
          gap: { xs: 3, md: 5 },
        }}
      >
        {/* LEFT COLUMN: image + about */}
        <Box sx={{ minWidth: 0 }}>
          <Box
            component="img"
            src={event.posterImageUrl || "/placeholder-event.png"}
            alt={event.title}
            sx={{
              width: "100%",
              height: "auto",
              borderRadius: 2,
              mb: 3,
              aspectRatio: "4/3",
              objectFit: "contain",
              backgroundColor: "#f0f0f0",
            }}
          />

          {event.description && (
            <Card
              variant="outlined"
              sx={{ borderRadius: 2, bgcolor: theme.palette.background.paper }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  About the event
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.text.secondary,
                    whiteSpace: "pre-line",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                  }}
                >
                  {event.description}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* RIGHT COLUMN: details + booking */}
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1.5,
              color: theme.palette.text.primary,
            }}
          >
            {event.title}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", mb: 3 }}
          >
            {" "}
            <Avatar sx={{ width: 28, height: 28, fontSize: "0.85rem" }}>
              {event.artistName?.charAt(0)}
            </Avatar>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
            >
              by {event.artistName}
            </Typography>
            <VerifiedIcon
              sx={{ fontSize: 18, color: theme.palette.primary.main }}
            />
          </Stack>

          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{ flexWrap: "wrap", mb: 3 }}
          >
            {" "}
            <InfoChip
              icon={<LocationOnIcon fontSize="small" />}
              label="Venue"
              value={event.venue}
              tooltip
            />
            <InfoChip
              icon={<CalendarMonthIcon fontSize="small" />}
              label="Date & Time"
              value={`${new Date(event.eventDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })} · ${timeFormat(event.eventTime)}`}
            />
            <InfoChip
              icon={<EventSeatIcon fontSize="small" />}
              label="Seats Left"
              value={`${event.availableSeats} seats`}
              valueColor={
                event.availableSeats <= 10
                  ? theme.palette.error.main
                  : theme.palette.success.main
              }
            />
          </Stack>

          {hasBulkDiscount() && (
            <Alert
              icon={<Celebration fontSize="small" />}
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 2,
                bgcolor: "rgba(102, 187, 106, 0.1)",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Book {event.bulkTicketForDiscount}+ tickets and get{" "}
                {event.discountPercentage}% off!
              </Typography>
              {qualifiesForDiscount() && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mt: 0.5,
                    color: theme.palette.success.main,
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 14 }} /> You qualify for the
                  discount
                </Typography>
              )}
            </Alert>
          )}

          {/* Price + quantity stepper, merged into one row */}
          <Card
            variant="outlined"
            sx={{
              mb: 2,
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  component="span"
                  variant="h6"
                  sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                >
                  ₹{event.ticketPrice.toFixed(2)}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, ml: 0.75 }}
                >
                  per ticket
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  sx={{ border: `1px solid ${theme.palette.divider}` }}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  variant="standard"
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: event.availableSeats,
                      style: { textAlign: "center" },
                    },
                    input: { disableUnderline: true },
                  }}
                  sx={{
                    width: 36,
                    "& input": { fontWeight: 600 },
                  }}
                />

                <IconButton
                  size="small"
                  onClick={handleIncreaseQuantity}
                  disabled={quantity >= event.availableSeats}
                  sx={{ border: `1px solid ${theme.palette.divider}` }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                px: 2,
                pb: 1.5,
                color: theme.palette.text.secondary,
              }}
            >
              Max {event.availableSeats} tickets per order
            </Typography>
          </Card>

          <Card
            variant="outlined"
            sx={{ mb: 3, borderRadius: 2, bgcolor: "#FAFAFA" }}
          >
            <CardContent>
              <Box sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">
                    {quantity} × ₹{event.ticketPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    ₹{originalPrice.toFixed(2)}
                  </Typography>
                </Box>

                {isSavingMoney && (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.success.main }}
                      >
                        Discount ({event.discountPercentage}%)
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.success.main,
                          fontWeight: 600,
                        }}
                      >
                        -₹{(originalPrice - discountedPrice).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        borderTop: `1px solid ${theme.palette.divider}`,
                        pt: 1,
                      }}
                    />
                  </>
                )}
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                  }}
                >
                  ₹{discountedPrice.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {isBookingDisabled() && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {getDisabledMessage()}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={
              !isBookingDisabled() ? <LockIcon fontSize="small" /> : undefined
            }
            onClick={handleBookNow}
            disabled={isBookingDisabled()}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            {isBookingDisabled() ? getDisabledMessage() : "Book Now"}
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 2,
              color: theme.palette.text.secondary,
            }}
          >
            You'll complete payment on the next page
          </Typography>
        </Box>
      </Box>

      <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
        <DialogTitle>Sign in to Continue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            You need to be logged in to book tickets for this event.
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

export default EventDetails;
