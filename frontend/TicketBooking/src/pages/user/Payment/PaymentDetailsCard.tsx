import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Avatar,
  useTheme,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PlaceIcon from "@mui/icons-material/Place";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { formatEventDateTime } from "../../../utils/dateUtils";
import type { BookingResponse, EventResponse } from "../../../Common/interface";

interface Props {
  booking: BookingResponse;
  event: EventResponse | null;
  error: string | null;
  processing: boolean;
  payDisabled: boolean;
  onPay: () => void;
}

const cardShell = (theme: any) => ({
  borderRadius: 3,
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  position: "relative" as const,
  "&::before": {
    content: '""',
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
  },
});

const PaymentDetailsCard = ({
  booking,
  event,

  processing,
  payDisabled,
  onPay,
}: Props) => {
  const theme = useTheme();

  return (
    <Card sx={cardShell(theme)}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <CreditCardIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Payment Details
          </Typography>
        </Box>

        {event && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              mb: 2,
              borderRadius: 2,
              bgcolor: "grey.50",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: `${theme.palette.primary.light}33`,
                color: "primary.main",
              }}
            >
              <ConfirmationNumberIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{event.title}</Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarMonthIcon
                    fontSize="inherit"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {formatEventDateTime(event.eventDate, event.eventTime)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PlaceIcon
                    fontSize="inherit"
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {event.venue}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: `${theme.palette.primary.light}1A`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Order Amount
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            ₹{booking.finalAmount.toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""} × ₹
            {booking.unitPrice.toFixed(2)}
          </Typography>
        </Box>

        {processing ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CircularProgress size={28} />
            <Typography sx={{ mt: 1.5 }} variant="body2">
              Processing payment...
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onPay}
            disabled={payDisabled}
            sx={{
              py: 1.5,
              fontWeight: 700,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
            }}
          >
            Pay with Razorpay
          </Button>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 2.5,
            color: "text.secondary",
          }}
        >
          <PhoneIphoneIcon fontSize="small" />
          <CreditCardOutlinedIcon fontSize="small" />
          <AccountBalanceWalletIcon fontSize="small" />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 0.5,
            mt: 1,
          }}
        >
          <LockIcon sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            Encrypted & secure payment powered by Razorpay
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentDetailsCard;
