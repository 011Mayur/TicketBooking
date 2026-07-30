import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Box,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Card,
  CardMedia,
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { eventSchema } from "../../zodSchema/eventSchema";
import api from "../../Api/axios";

import type { CouponCode, Event } from "../../Common/interface";
import type { AxiosError } from "axios";
import type z from "zod";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { API_ROUTES } from "../../Constant/apiRoutes";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { MESSAGES } from "../../Constant/messages";

const EventForm = () => {
  const [enableBulkDiscount, setEnableBulkDiscount] = useState(false);

  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<CouponCode[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [posterImageUrl, setPosterImageUrl] = useState<string>();
  const [removeImageDialogOpen, setRemoveImageDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  type EventFormInput = z.input<typeof eventSchema>;
  type EventFormOutput = z.output<typeof eventSchema>;

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${maxSizeMB}MB.`);
      return;
    }

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(
        API_ROUTES.EVENT.UPLOAD_POSTER,

        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setPosterImageUrl(response.data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ?? "Failed to upload image.",
      );
    } finally {
      setImageUploading(false);
    }
  };
  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageUpload(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleRemoveImageConfirm = () => {
    setPosterImageUrl("");
    setRemoveImageDialogOpen(false);
    toast.success(MESSAGES.SUCCESS.REMOVED_IMAGE);
  };
  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };
  const handleRemoveImageClick = () => {
    setRemoveImageDialogOpen(true);
  };
  useEffect(() => {
    const fetchCoupons = async () => {
      setCouponLoading(true);
      try {
        const res = await api.get<CouponCode[]>(
          API_ROUTES.COUPON.GET_ALL_ACTIVE,
        );
        setCoupons(res.data);
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_COUPONS);
      } finally {
        setCouponLoading(false);
      }
    };

    fetchCoupons();
  }, [isEditMode]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInput, typeof eventSchema, EventFormOutput>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (!isEditMode) return;
    const fetchEvent = async () => {
      try {
        const res = await api.get<Event>(
          API_ROUTES.EVENT.GET_BY_ID(Number(id)),
        );
        const event = res.data;

        const hasBulkDiscount =
          event.bulkTicketForDiscount && event.bulkTicketForDiscount > 0;

        reset({
          title: event.title,
          artistName: event.artistName,
          venue: event.venue,
          eventDate: event.eventDate.slice(0, 10),
          eventTime: event.eventTime.slice(0, 5),
          ticketPrice: event.ticketPrice,
          totalSeats: event.totalSeats,
          bulkTicketForDiscount: event.bulkTicketForDiscount || "",
          discountPercentage: event.discountPercentage || "",
        });

        setEnableBulkDiscount(hasBulkDiscount);
        if (event.couponIds && event.couponIds.length > 0) {
          setSelectedCoupons(event.appliedCoupons);
        }

        if (event.posterImageUrl) {
          setPosterImageUrl(event.posterImageUrl);
        }
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
        navigate("/admin/events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [isEditMode, coupons, id, navigate, reset]);

  const onSubmit = async (data: EventFormOutput) => {
    const payload = {
      ...data,
      eventTime: `${data.eventTime}:00`,
      selectedCouponIds: selectedCoupons.map((c) => c.id),
      bulkTicketForDiscount: enableBulkDiscount
        ? data.bulkTicketForDiscount
        : null,
      discountPercentage: enableBulkDiscount ? data.discountPercentage : null,
      posterImageUrl: posterImageUrl || null,
    };

    try {
      if (isEditMode) {
        await api.put(API_ROUTES.EVENT.UPDATE(Number(id)), {
          id: Number(id),
          ...payload,
        });
        toast.success(MESSAGES.SUCCESS.UPDATE_EVENT);
      } else {
        await api.post(API_ROUTES.EVENT.CREATE, payload);
        toast.success(MESSAGES.SUCCESS.CREATE_EVENT);
      }
      navigate("/admin/events");
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.SUCCESS.FAILED_SAVE_EVENT,
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
        elevation={3}
        sx={{ width: "100%", maxWidth: 500, p: { xs: 3, sm: 4 } }}
      >
        <Typography variant="h5" className="mb-6 font-semibold">
          {isEditMode ? "Edit Event" : "Create Event"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              size="small"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              label="Artist Name"
              fullWidth
              size="small"
              {...register("artistName")}
              error={!!errors.artistName}
              helperText={errors.artistName?.message}
            />
            <TextField
              label="Venue"
              fullWidth
              size="small"
              {...register("venue")}
              error={!!errors.venue}
              helperText={errors.venue?.message}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="eventDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Event Date"
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
                        error: !!errors.eventDate,
                        helperText: errors.eventDate?.message,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="eventTime"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Event Time"
                    views={["hours", "minutes"]}
                    ampm={false}
                    value={field.value ? dayjs(field.value, "HH:mm") : null}
                    onChange={(newValue) =>
                      field.onChange(newValue ? newValue.format("HH:mm") : "")
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: !!errors.eventTime,
                        helperText: errors.eventTime?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
            <TextField
              label="Ticket Price"
              type="number"
              size="small"
              fullWidth
              slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
              {...register("ticketPrice")}
              error={!!errors.ticketPrice}
              helperText={errors.ticketPrice?.message}
            />
            <TextField
              label="Total Seats"
              size="small"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
              {...register("totalSeats")}
              error={!!errors.totalSeats}
              helperText={errors.totalSeats?.message}
            />

            <Autocomplete
              multiple
              size="small"
              options={coupons}
              getOptionLabel={(option) =>
                `${option.code} (${option.discountPercentage}%)`
              }
              value={selectedCoupons}
              onChange={(_, newValue) => setSelectedCoupons(newValue)}
              loading={couponLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Coupons (Optional)"
                  placeholder="Search or select coupons"
                  size="small"
                />
              )}
            />
            {selectedCoupons.length > 0 && (
              <Typography variant="caption" sx={{ color: "green" }}>
                {selectedCoupons.length} coupon(s) will be added
              </Typography>
            )}

            <Box
              sx={{
                border: "2px dashed",
                borderColor: posterImageUrl ? "success.main" : "divider",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                transition: "all 0.3s ease",
                backgroundColor: posterImageUrl
                  ? "rgba(102, 187, 106, 0.05)"
                  : "transparent",
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
                disabled={imageUploading}
              />

              {posterImageUrl ? (
                <Box>
                  <Card sx={{ mb: 1.5, overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={posterImageUrl}
                      alt="Event poster preview"
                    />
                  </Card>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: "success.main" }}
                  >
                    ✓ Poster uploaded
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={triggerFilePicker}
                      disabled={imageUploading}
                      fullWidth
                      sx={{ minHeight: 36 }}
                    >
                      Change image
                    </Button>

                    <IconButton
                      size="small"
                      onClick={handleRemoveImageClick}
                      disabled={imageUploading}
                      sx={{
                        color: "error.main",
                        border: "1px solid",
                        borderColor: "error.main",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Box>
                  {imageUploading ? (
                    <Box sx={{ py: 2 }}>
                      <CircularProgress size={32} sx={{ mb: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "text.secondary" }}
                      >
                        Uploading...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ py: 2 }}>
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Drop poster image or click to browse
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        (Optional) JPG, PNG • Max 5MB
                      </Typography>
                    </Box>
                  )}

                  <Button
                    variant="contained"
                    onClick={triggerFilePicker}
                    disabled={imageUploading}
                    fullWidth
                    sx={{ mt: 1, minHeight: 44 }}
                  >
                    {imageUploading ? "Uploading..." : "Choose image"}
                  </Button>
                </Box>
              )}
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={enableBulkDiscount}
                  onChange={(e) => setEnableBulkDiscount(e.target.checked)}
                />
              }
              label="Enabel discount on bulk Ticket"
            />
            {enableBulkDiscount && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <TextField
                  label="Tickets Required"
                  type="number"
                  fullWidth
                  size="small"
                  slotProps={{ htmlInput: { step: "1", min: 1 } }}
                  {...register("bulkTicketForDiscount")}
                  error={!!errors.bulkTicketForDiscount}
                  helperText={errors.bulkTicketForDiscount?.message}
                />

                <TextField
                  label="Discount Percentage"
                  type="number"
                  size="small"
                  fullWidth
                  slotProps={{ htmlInput: { step: "0.01", min: 1, max: 100 } }}
                  {...register("discountPercentage")}
                  error={!!errors.discountPercentage}
                  helperText={errors.discountPercentage?.message}
                />
              </Box>
            )}

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
                onClick={() => navigate("/admin/events")}
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
                    ? "Update Event"
                    : "Create Event"}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
      <ConfirmDialog
        open={removeImageDialogOpen}
        title="Remove Image"
        message="Are you sure you want to remove this poster image?"
        onConfirm={handleRemoveImageConfirm}
        onCancel={() => setRemoveImageDialogOpen(false)}
        abortButton="Cancel"
        confirmButton="Remove"
      />
    </Box>
  );
};

export default EventForm;
