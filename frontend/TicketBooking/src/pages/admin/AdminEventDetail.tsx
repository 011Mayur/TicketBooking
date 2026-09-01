import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Button,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import PersonIcon from "@mui/icons-material/Person";
import DiscountIcon from "@mui/icons-material/Discount";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DescriptionIcon from "@mui/icons-material/Description";
import api from "../../api/axios";
import { API_ROUTES } from "../../constants/apiRoutes";
import { APP_ROUTES } from "../../constants/appRoutes";
import type { Event, ApiResponse } from "../../types";

/* ─── helpers ─────────────────────────────────────────────── */

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ─── reusable stat card ──────────────────────────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

const StatCard = ({ icon, label, value, highlight }: StatCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        borderRadius: "10px",
        border: `1px solid ${theme.palette.divider}`,
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 12px rgba(69,64,225,0.08)",
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: highlight
            ? `${theme.palette.primary.main}18`
            : `${theme.palette.primary.main}0D`,
          color: highlight
            ? theme.palette.primary.main
            : theme.palette.text.secondary,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            display: "block",
            mb: 0.25,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: highlight
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

/* ─── main component ──────────────────────────────────────── */

const AdminEventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<ApiResponse<Event>>(
          API_ROUTES.EVENT.GET_BY_ID(eventId!)
        );
        setEvent(res.data.data);
      } catch {
        setError("Failed to load event details.");
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  /* ── loading skeleton ── */
  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Skeleton width={120} height={36} sx={{ mb: 2 }} />
        <Paper
          variant="outlined"
          sx={{ p: { xs: 2, sm: 3 }, borderRadius: "10px" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "300px 1fr" },
              gap: 3,
            }}
          >
            <Skeleton
              variant="rounded"
              sx={{ width: "100%", height: 240, borderRadius: "10px" }}
            />
            <Box>
              <Skeleton width="60%" height={36} sx={{ mb: 1 }} />
              <Skeleton width="40%" height={24} sx={{ mb: 3 }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 2,
                }}
              >
                {[...Array(6)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={72}
                    sx={{ borderRadius: "10px" }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  /* ── error state ── */
  if (error || !event) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Event not found."}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(APP_ROUTES.ADMIN_EVENTS)}
        >
          Back to Events
        </Button>
      </Box>
    );
  }

  const seatsBooked = event.totalSeats - event.availableSeats;
  const occupancyPct =
    event.totalSeats > 0
      ? Math.round((seatsBooked / event.totalSeats) * 100)
      : 0;
  const isPast = new Date(`${event.eventDate}T${event.eventTime}`) < new Date();
  const isSoldOut = event.availableSeats <= 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(APP_ROUTES.ADMIN_EVENTS)}
        sx={{
          mb: 2,
          color: theme.palette.text.secondary,
          "&:hover": { color: theme.palette.primary.main },
        }}
      >
        Back to Events
      </Button>

      {/* Main card */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: "10px",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        {/* ─── Hero row: poster + title ─── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            gap: { xs: 0, md: 0 },
          }}
        >
          {/* Poster */}
          <Box
            sx={{
              bgcolor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, md: 2.5 },
              minHeight: { xs: 200, md: 260 },
            }}
          >
            <Box
              component="img"
              src={event.posterImageUrl || "/placeholder-event.png"}
              alt={event.title}
              sx={{
                width: "100%",
                maxHeight: { xs: 240, md: 280 },
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </Box>

          {/* Title + status badges */}
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                mb: 1.5,
              }}
            >
              {isPast && (
                <Chip
                  label="Past Event"
                  size="small"
                  sx={{
                    bgcolor: theme.palette.text.secondary,
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                  }}
                />
              )}
              {isSoldOut && !isPast && (
                <Chip
                  label="Sold Out"
                  size="small"
                  color="error"
                  sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                />
              )}
              {!isPast && !isSoldOut && (
                <Chip
                  label="Active"
                  size="small"
                  sx={{
                    bgcolor: `${theme.palette.success.main}22`,
                    color: theme.palette.success.main,
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    border: `1px solid ${theme.palette.success.main}44`,
                  }}
                />
              )}
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 0.75,
                lineHeight: 1.3,
              }}
            >
              {event.title}
            </Typography>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}
            >
              <PersonIcon
                sx={{
                  fontSize: 18,
                  color: theme.palette.text.secondary,
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
              >
                {event.artistName}
              </Typography>
            </Box>

            {/* Occupancy progress bar */}
            <Box sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.4px",
                    fontSize: "0.7rem",
                  }}
                >
                  Occupancy
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color:
                      occupancyPct >= 90
                        ? theme.palette.error.main
                        : occupancyPct >= 70
                          ? "#ED6C02"
                          : theme.palette.primary.main,
                  }}
                >
                  {occupancyPct}%
                </Typography>
              </Box>
              <Box
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: theme.palette.divider,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${occupancyPct}%`,
                    borderRadius: 3,
                    bgcolor:
                      occupancyPct >= 90
                        ? theme.palette.error.main
                        : occupancyPct >= 70
                          ? "#ED6C02"
                          : theme.palette.primary.main,
                    transition: "width 0.6s ease",
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                }}
              >
                {seatsBooked} of {event.totalSeats} seats booked
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ─── Stat cards grid ─── */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: theme.palette.text.secondary,
              fontSize: "0.75rem",
              mb: 2,
            }}
          >
            Event Information
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
            }}
          >
            <StatCard
              icon={<LocationOnIcon fontSize="small" />}
              label="Venue"
              value={event.venue}
            />
            <StatCard
              icon={<CalendarMonthIcon fontSize="small" />}
              label="Date"
              value={formatDate(event.eventDate)}
            />
            <StatCard
              icon={<AccessTimeIcon fontSize="small" />}
              label="Time"
              value={formatTime(event.eventTime)}
            />
            <StatCard
              icon={<EventSeatIcon fontSize="small" />}
              label="Seats (Available / Total)"
              value={`${event.availableSeats} / ${event.totalSeats}`}
              highlight={event.availableSeats <= 10}
            />
            <StatCard
              icon={<CurrencyRupeeIcon fontSize="small" />}
              label="Ticket Price"
              value={`₹${event.ticketPrice.toLocaleString("en-IN")}`}
              highlight
            />
            <StatCard
              icon={<ConfirmationNumberIcon fontSize="small" />}
              label="Tickets Sold"
              value={seatsBooked.toString()}
            />
          </Box>
        </Box>

        {/* ─── Discount info ─── */}
        {event.bulkTicketForDiscount > 0 && event.discountPercentage > 0 && (
          <>
            <Divider />
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  mb: 2,
                }}
              >
                Bulk Discount
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "10px",
                  border: `1px solid ${theme.palette.success.main}44`,
                  bgcolor: `${theme.palette.success.main}08`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <DiscountIcon
                  sx={{ color: theme.palette.success.main, fontSize: 28 }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {event.discountPercentage}% off on{" "}
                    {event.bulkTicketForDiscount}+ tickets
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Automatic bulk purchase discount applied at checkout
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </>
        )}

        {/* ─── Applied Coupons ─── */}
        {event.appliedCoupons && event.appliedCoupons.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  mb: 2,
                }}
              >
                Applied Coupons
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {event.appliedCoupons.map((coupon) => (
                  <Chip
                    key={coupon.id}
                    icon={<LocalOfferIcon sx={{ fontSize: "16px !important" }} />}
                    label={coupon.code}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      bgcolor: `${theme.palette.primary.main}10`,
                      color: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      "& .MuiChip-icon": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* ─── Description ─── */}
        {event.description && (
          <>
            <Divider />
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <DescriptionIcon
                  sx={{
                    fontSize: 18,
                    color: theme.palette.text.secondary,
                  }}
                />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                  }}
                >
                  Description
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  whiteSpace: "pre-line",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  lineHeight: 1.7,
                }}
              >
                {event.description}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AdminEventDetail;
