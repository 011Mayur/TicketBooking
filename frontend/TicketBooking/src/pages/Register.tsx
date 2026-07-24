import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField, Button, MenuItem, Paper, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../Common/interface";
import {
  registerSchema,
  type RegisterFormValues,
} from "../zodSchema/registerSchema";
import api from "../Api/axios";
import { API_ROUTES } from "../Constant/apiRoutes";
import { MESSAGES } from "../Constant/messages";
import { APP_ROUTES } from "../Constant/appRoutes";

const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const { ...rest } = data;
      await api.post(API_ROUTES.AUTH.REGISTER, { ...rest, role: "User" });
      toast.success(MESSAGES.REGISTER_SUCCESS);
      navigate(APP_ROUTES.LOGIN);
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;

      if (axiosErr.response?.status === 409 && axiosErr.response.data.field) {
        const { field, message } = axiosErr.response.data;
        setError(field as keyof RegisterFormValues, { message });
        toast.error(message);
        return;
      }

      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.REGISTER_FAIL_DEFAULT,
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Paper elevation={3} className="w-full max-w-md p-8">
        <Typography variant="h5" className="mb-6 text-center font-semibold">
          Create an account
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="First Name"
            fullWidth
            {...register("firstName")}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
          />
          <TextField
            label="Last Name"
            fullWidth
            {...register("lastName")}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
          />
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Mobile Number"
            fullWidth
            {...register("mobileNumber")}
            error={!!errors.mobileNumber}
            helperText={errors.mobileNumber?.message}
          />
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
            {...register("dateOfBirth")}
            error={!!errors.dateOfBirth}
            helperText={errors.dateOfBirth?.message}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Gender"
                fullWidth
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
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
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
            {isSubmitting ? "Creating account..." : "Register"}
          </Button>
        </form>

        <Typography className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login">Log in</Link>
        </Typography>
      </Paper>
    </div>
  );
};
export default Register;
