import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

import { AxiosError } from "axios";
import { loginSchema, type LoginFormValues } from "../zodSchema/loginSchema";
import type { ApiErrorResponse, LoginResponse } from "../Common/interface";
import api from "../Api/axios";
import { API_ROUTES } from "../Constant/apiRoutes";
import { MESSAGES } from "../Constant/messages";
import { APP_ROUTES } from "../Constant/appRoutes";

const Login = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
      toast.success(MESSAGES.LOGIN_SUCCESS);
      navigate(res.data.role === "Admin" ? "/admin" : "/user");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.LOGIN_FAIL_DEFAULT,
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Paper elevation={3} className="w-full max-w-md p-8">
        <Typography variant="h5" className="mb-6 text-center font-semibold">
          Log in
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            fullWidth
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <Typography className="mt-4 text-center text-sm">
          Don't have an account? <Link to={APP_ROUTES.LOGIN}>Register</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default Login;
