import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../zodSchema/resetPasswordSchema";
import api from "../../api/axios";
import { APP_ROUTES } from "../../constants/appRoutes";
import { API_ROUTES } from "../../constants/apiRoutes";
import { MESSAGES } from "../../constants/messages";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Typography>Invalid or missing reset link.</Typography>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      const res = await api.post(API_ROUTES.AUTH.RESET_PASSWORD, {
        token,
        newPassword: data.newPassword,
      });
      toast.success(res.data.message);
      navigate(APP_ROUTES.ADMIN_LOGIN);
    } catch {
      toast.error(MESSAGES.AUTH.LINK_EXPIRED);
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
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              size="small"
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
            <TextField
              label="Confirm Password"
              type="password"
              size="small"
              fullWidth
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
              sx={{ mt: 1, minHeight: 44 }}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;
