import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography } from "@mui/material";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Paper elevation={3} className="w-full max-w-md p-8">
        <Typography variant="h5" className="mb-6 text-center font-semibold">
          Forgot Password
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>

        <Typography className="mt-4 text-center text-sm">
          <Link to={APP_ROUTES.LOGIN}>Back to login</Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default ForgotPassword;
