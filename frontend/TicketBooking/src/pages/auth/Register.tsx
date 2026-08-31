import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { AxiosError } from "axios";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  registerSchema,
  type RegisterFormValues,
} from "../../zodSchema/registerSchema";
import { API_ROUTES } from "../../constants/apiRoutes";
import api from "../../api/axios";
import { MESSAGES } from "../../constants/messages";
import { APP_ROUTES } from "../../constants/appRoutes";
import type { ApiErrorResponse } from "../../types";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    control,

    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { ...rest } = data;
      await api.post(API_ROUTES.AUTH.REGISTER, { ...rest, role: "User" });
      toast.success(MESSAGES.AUTH.REGISTER_SUCCESS);

      const from = location.state?.from;
      const checkoutState = location.state?.state;

      navigate(APP_ROUTES.USER_LOGIN, {
        state: {
          from,
          state: checkoutState,
        },
      });
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;

      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.AUTH.REGISTER_FAIL_DEFAULT,
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
        py: 2,
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
          Create an account
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              label="First Name"
              fullWidth
              size="small"
              {...register("firstName")}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last Name"
              fullWidth
              size="small"
              {...register("lastName")}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Email"
              fullWidth
              size="small"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Mobile Number"
              fullWidth
              size="small"
              {...register("mobileNumber")}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber?.message}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Date Of Birth"
                    format="DD/MM/YYYY"
                    value={
                      field.value ? dayjs(field.value, "YYYY-MM-DD") : null
                    }
                    onChange={(newValue) =>
                      field.onChange(
                        newValue ? newValue.format("YYYY-MM-DD") : "",
                      )
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: !!errors.dateOfBirth,
                        helperText: errors.dateOfBirth?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Gender"
                  fullWidth
                  size="small"
                  {...field}
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </TextField>
              )}
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
              sx={{ mt: 1, minHeight: 44 }}
              fullWidth
            >
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </Box>
        </form>
        <Typography sx={{ mt: 3, textAlign: "center", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link to={APP_ROUTES.USER_LOGIN} style={{ color: "#4540e1" }}>
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
