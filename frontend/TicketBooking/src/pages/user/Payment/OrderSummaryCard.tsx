import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import type { BookingResponse, EventResponse } from "../../../types";

const Row = ({
  label,
  value,
  emphasis,
  positive,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  positive?: boolean;
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
    <Typography
      variant={emphasis ? "h6" : "body2"}
      sx={{
        fontWeight: emphasis ? 700 : 400,
        color: positive ? "success.main" : "text.primary",
      }}
    >
      {label}
    </Typography>
    <Typography
      variant={emphasis ? "h6" : "body2"}
      sx={{
        fontWeight: emphasis ? 700 : 600,
        color: positive
          ? "success.main"
          : emphasis
            ? "primary.main"
            : "text.primary",
      }}
    >
      {value}
    </Typography>
  </Box>
);

const OrderSummaryCard = ({
  booking,
  event,
}: {
  booking: BookingResponse;
  event: EventResponse | null;
}) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Order Summary
        </Typography>

        {event && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
              pb: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Avatar
              sx={{
                bgcolor: `${theme.palette.primary.light}33`,
                color: "primary.main",
                width: 36,
                height: 36,
              }}
            >
              <ConfirmationNumberIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {booking.quantity} × ₹{booking.unitPrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        )}

        <Row label="Subtotal" value={`₹${booking.subTotal.toFixed(2)}`} />
        {booking.bulkDiscountAmount && (
          <Row
            label="Bulk Discount"
            value={`-₹${booking.bulkDiscountAmount.toFixed(2)}`}
            positive
          />
        )}
        {booking.couponDiscountAmount && (
          <Row
            label={`Coupon (${booking.couponCode})`}
            value={`-₹${booking.couponDiscountAmount.toFixed(2)}`}
            positive
          />
        )}

        <Box
          sx={{
            pt: 1.5,
            mt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Row
            label="Total"
            value={`₹${booking.finalAmount.toFixed(2)}`}
            emphasis
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
