import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, Paper, Typography, Box } from "@mui/material";
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
      toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate(res.data.role === "Admin" ? "/admin" : "/user");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.AUTH.LOGIN_FAIL_DEFAULT,
      );
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
          Log in
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
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
              sx={{ mt: 1, minHeight: 44 }}
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>
          </Box>
        </form>

        <Box
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 2,
            fontSize: "0.875rem",
          }}
        >
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link to={APP_ROUTES.REGISTER} style={{ color: "#4540e1" }}>
              Register
            </Link>
          </Typography>
          <Link to="/forgot-password" style={{ color: "#4540e1" }}>
            <Typography variant="body2">Forgot password?</Typography>
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
