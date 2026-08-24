import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  useTheme,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../Constant/appRoutes";
import type { BookingSummaryResponse } from "../../Common/interface";
import BookingStatusChip from "./BookingStatusChip";
import { classifyBooking } from "../../utils/bookingUtils";
import { formatEventDateTime } from "../../utils/dateUtils";

const BookingCard = ({ booking }: { booking: BookingSummaryResponse }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const category = classifyBooking(booking);
  const isPending = category === "pending";

  return (
    <Card
      sx={{ borderRadius: 3, p: 0.5, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: "1.05rem", pr: 1 }}
          >
            {booking.eventTitle}
          </Typography>
          <BookingStatusChip category={category} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <CalendarMonthIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
          <Typography variant="body2" color="text.secondary">
            {formatEventDateTime(booking.eventDate, booking.eventTime)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
          <PlaceIcon fontSize="small" sx={{ color: "text.secondary" }} />
          <Typography variant="body2" color="text.secondary">
            {booking.venue}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
          </Typography>
          <Typography
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            ₹{booking.finalAmount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => navigate(APP_ROUTES.EVENT(booking.eventId))}
          >
            View Event
          </Button>
          {isPending && (
            <Button
              variant="contained"
              fullWidth
              size="small"
              sx={{ textTransform: "none" }}
              onClick={() =>
                navigate(APP_ROUTES.PAYMENT(String(booking.id)), {
                  state: { bookingId: booking.id },
                })
              }
            >
              Complete Payment
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
