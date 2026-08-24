import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Card,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Variant = "loading" | "not-found" | "success";

const PaymentStateScreen = ({
  variant,
  onBack,
}: {
  variant: Variant;
  onBack?: () => void;
}) => {
  const theme = useTheme();

  if (variant === "loading") {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading payment details...</Typography>
      </Container>
    );
  }

  if (variant === "not-found") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Booking details not found</Alert>
        <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
          Back to Events
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ textAlign: "center", p: 4, borderRadius: 3 }}>
        <CheckCircleIcon
          sx={{ fontSize: 80, color: theme.palette.success.main, mb: 2 }}
        />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Payment Successful!
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 3, color: theme.palette.text.secondary }}
        >
          Your booking has been confirmed. Redirecting to your bookings...
        </Typography>
        <CircularProgress />
      </Card>
    </Container>
  );
};

export default PaymentStateScreen;
