import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../../constants/appRoutes";

const PaymentLoginDialog = ({
  open,
  bookingIdParam,
  locationState,
}: {
  open: boolean;
  bookingIdParam?: string;
  locationState: unknown;
}) => {
  const navigate = useNavigate();
  const handleLoginRedirect = () =>
    navigate(APP_ROUTES.USER_LOGIN, {
      state: {
        from: APP_ROUTES.PAYMENT(bookingIdParam || ""),
        state: locationState,
      },
    });

  return (
    <Dialog open={open} onClose={() => {}}>
      <DialogTitle>Sign in Required</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mt: 1 }}>
          You need to be logged in to complete the payment. Please sign in with
          your account.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleLoginRedirect} variant="contained" autoFocus>
          Go to Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentLoginDialog;
