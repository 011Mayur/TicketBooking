import { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  useTheme,
} from "@mui/material";
import { APP_ROUTES } from "../../Constant/appRoutes";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginSchema, type LoginFormValues } from "../../zodSchema/loginSchema";
import { toast } from "react-toastify";
import { MESSAGES } from "../../Constant/messages";
import { userLogin } from "../../Services/authService";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../Common/interface";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../../Hooks/useAuth";

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "User",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await userLogin({
        ...data,
        role: "User",
      });

      await refreshUser();

      toast.success(MESSAGES.AUTH.LOGIN_SUCCESS);

      const returnUrl = location.state?.returnUrl;

      navigate(returnUrl || APP_ROUTES.HOME, {
        replace: true,
      });
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
        minHeight: "100%",
        bgcolor: "background.default",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          height: "100vh",
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <Grid
          container
          sx={{
            height: "100%",
          }}
        >
          {/* LEFT SECTION */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              height: "100%",
              p: { xs: 3, sm: 5, md: 6 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "100%" }}>
              {/* LOGO */}
              <Box
                component="img"
                src="logo.png"
                sx={{ height: 40, mr: 2, mb: 2 }}
              />

              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                }}
              >
                Welcome To Resonance
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Where the Right Energy Finds You!
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* EMAIL */}
                  <TextField
                    label="Email"
                    type="email"
                    size="small"
                    fullWidth
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  {/* PASSWORD */}
                  <TextField
                    label="Password"
                    size="small"
                    fullWidth
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    type={showPassword ? "text" : "password"}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <img
                                src={
                                  showPassword
                                    ? "/eye-show-svgrepo-com.svg"
                                    : "/eye-off-svgrepo-com.svg"
                                }
                                alt="toggle"
                                width={20}
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <input type="hidden" {...register("role")} value="User" />
                  {/* LOGIN BUTTON */}
                  <Button
                    type="submit"
                    fullWidth
                    size="small"
                    variant="contained"
                    disabled={isSubmitting}
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
                <Link
                  to={APP_ROUTES.FORGOT_PASSWORD}
                  style={{ color: "#4540e1" }}
                >
                  <Typography variant="body2">Forgot password?</Typography>
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT SECTION */}
          <Grid
            size={{ xs: 0, md: 7 }}
            sx={{
              height: "100%",
              display: {
                xs: "none",
                md: "block",
              },
            }}
          >
            <Box
              component="img"
              src="/placeholder-event.png"
              alt="Login Illustration"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UserLogin;
