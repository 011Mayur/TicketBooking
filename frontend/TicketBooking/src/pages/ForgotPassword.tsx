import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../zodSchema/forgotPasswordSchema";
import api from "../Api/axios";
import { API_ROUTES } from "../Constant/apiRoutes";
import { APP_ROUTES } from "../Constant/appRoutes";
import { MESSAGES } from "../Constant/messages";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const res = await api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
      toast.success(res.data.message);
      setTimeout(() => navigate(APP_ROUTES.LOGIN), 1500);
    } catch {
      toast.error(MESSAGES.GENERAL_ERROR);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{ width: "100%", maxWidth: 400, p: { xs: 3, sm: 4 } }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}
        >
          Forgot Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              {...register("email")}
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 1, minHeight: 44 }}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </Box>
        </form>

        <Typography sx={{ mt: 3, textAlign: "center", fontSize: "0.875rem" }}>
          <Link to={APP_ROUTES.LOGIN} style={{ color: "#4540e1" }}>
            Back to login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
