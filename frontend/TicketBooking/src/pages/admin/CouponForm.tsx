import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import {
  couponSchema,
  type CouponFormValues,
} from "../../zodSchema/couponSchema";
import type { Coupon } from "../../Common/interface";
import api from "../../Api/axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { MESSAGES } from "../../Constant/messages";

const CouponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountPercentage: undefined,
      expiryDate: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isEditMode) return;

    const fetchCoupon = async () => {
      try {
        const res = await api.get<Coupon>(`/coupon/GetById/${id}`);
        const coupon = res.data;
        reset({
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          expiryDate: coupon.expiryDate.slice(0, 10),
          isActive: true,
        });
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_COUPONS);
        navigate("/admin/coupons");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id, isEditMode, reset, navigate]);

  const onSubmit = async (data: CouponFormValues) => {
    try {
      if (isEditMode) {
        await api.put(`/Coupon/Update/${id}`, {
          id: Number(id),
          ...data,
          isActive: true,
        });
        toast.success(MESSAGES.SUCCESS.UPDATED_COUPON);
      } else {
        await api.post("/coupon/Create", data);
        toast.success(MESSAGES.SUCCESS.CREATED_COUPON);
      }
      navigate("/admin/coupons");
    } catch (err) {
      const axiosErr = err as AxiosError<{ field?: string; message?: string }>;

      if (
        axiosErr.response?.status === 409 &&
        axiosErr.response.data.field === "code"
      ) {
        setError("code", { message: axiosErr.response.data.message });
        return;
      }

      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.ERROR.FAILED_SAVE_COUPONS,
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 6 },
        display: "flex",
        justifyContent: "center",
        minHeight: "auto",
      }}
    >
      <Paper
        elevation={4}
        sx={{ width: "100%", maxWidth: 500, p: { xs: 3, sm: 4 } }}
      >
        <Typography variant="h5" className="mb-6 font-semibold">
          {isEditMode ? "Edit Coupon" : "Create Coupon"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Coupon Code"
              fullWidth
              {...register("code")}
              size="small"
              error={!!errors.code}
              helperText={errors.code?.message}
            />
            <TextField
              label="Discount Percentage"
              type="number"
              fullWidth
              size="small"
              slotProps={{ htmlInput: { min: 1, max: 100 } }}
              {...register("discountPercentage", { valueAsNumber: true })}
              error={!!errors.discountPercentage}
              helperText={errors.discountPercentage?.message}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="expiryDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Expiry Date"
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
                        error: !!errors.expiryDate,
                        helperText: errors.expiryDate?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mt: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={() => navigate("/admin/coupons")}
                disabled={isSubmitting}
                sx={{ minHeight: 44 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{ minHeight: 44 }}
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Coupon"
                    : "Create Coupon"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CouponForm;
