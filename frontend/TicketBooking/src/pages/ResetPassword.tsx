import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../zodSchema/resetPasswordSchema";
import api from "../Api/axios";
import { APP_ROUTES } from "../Constant/appRoutes";
import { API_ROUTES } from "../Constant/apiRoutes";
import { MESSAGES } from "../Constant/messages";

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
      navigate(APP_ROUTES.LOGIN);
    } catch {
      toast.error(MESSAGES.LINK_EXPIRED);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Paper elevation={3} className="w-full max-w-md p-8">
        <Typography variant="h5" className="mb-6 text-center font-semibold">
          Reset Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="New Password"
            type="password"
            fullWidth
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            label="Confirm Password"
            type="password"
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
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default ResetPassword;
