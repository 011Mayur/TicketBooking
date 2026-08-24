import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  FormControlLabel,
  Switch,
  Autocomplete,
  IconButton,
  Card,
  CardMedia,
  DialogTitle,
} from "@mui/material";
import { toast } from "react-toastify";
import { eventSchema } from "../../zodSchema/eventSchema";
import api from "../../Api/axios";

import {
  type ApiResponse,
  type CouponCode,
  type Event,
  type EventCategory,
  type EventTypeDetail,
} from "../../Common/interface";
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
import { uploadPoster } from "../../Services/eventService";

type EventFormInput = z.input<typeof eventSchema>;
type EventFormOutput = z.output<typeof eventSchema>;

interface EventFormModalProps {
  mode: "add" | "edit";
  eventId?: number;
  typeId: number | null;
  categoryId: number | null;
  onClose: () => void;
  onSave: () => void;
}

const EventFormModal = ({
  mode,
  eventId,
  typeId,
  categoryId,
  onClose,
  onSave,
}: EventFormModalProps) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormInput, typeof eventSchema, EventFormOutput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      artistName: "",
      venue: "",
      eventDate: "",
      eventTime: "",
      ticketPrice: 0,
      totalSeats: 0,
      bulkTicketForDiscount: "",
      discountPercentage: "",
      eventCategoryId: null,
      enableBulkDiscount: false,
      description: "",
    },
  });
  const hasResetBulkDiscountRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const [enableBulkDiscount, setEnableBulkDiscount] = useState(false);
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<CouponCode[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [posterImageUrl, setPosterImageUrl] = useState<string>();
  const [removeImageDialogOpen, setRemoveImageDialogOpen] = useState(false);

  const [selectedEventType, setSelectedEventType] =
    useState<EventTypeDetail | null>(null);
  const [, setCategories] = useState<EventCategory[]>([]);
  const [, setCategoriesLoading] = useState(false);

  const prevTypeRef = useRef<EventTypeDetail | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  useEffect(() => {
    if (typeId) {
      const fetchTypes = async () => {
        try {
          const res = await api.get<ApiResponse<EventTypeDetail[]>>(
            API_ROUTES.EVENT_MANAGEMENT.TYPES,
          );
          const matched = res.data.data.find((t) => t.id === typeId);
          if (matched) {
            setSelectedEventType(matched);
            prevTypeRef.current = matched;
          }
        } catch {
          toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
        }
      };
      fetchTypes();
    }
  }, [typeId]);

  useEffect(() => {
    if (!selectedEventType) return;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await api.get<ApiResponse<EventCategory[]>>(
          API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_BY_TYPE_ID(
            selectedEventType.id,
          ),
        );
        setCategories(res.data.data);

        if (categoryId && mode === "edit") {
          setValue("eventCategoryId", categoryId);
        }
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [selectedEventType, categoryId, mode]);
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
  }, []);
  useEffect(() => {
    if (mode === "add" && categoryId) {
      setValue("eventCategoryId", categoryId);
    }
  }, [mode, categoryId]);

  useEffect(() => {
    if (!enableBulkDiscount && !hasResetBulkDiscountRef.current) {
      hasResetBulkDiscountRef.current = true;
      reset((formValues) => ({
        ...formValues,
        bulkTicketForDiscount: "",
        discountPercentage: "",
      }));
    } else if (enableBulkDiscount) {
      hasResetBulkDiscountRef.current = false;
    }
  }, [enableBulkDiscount, reset]);

  useEffect(() => {
    if (mode !== "edit" || !eventId) {
      hasFetchedRef.current = false;
      return;
    }

    // Guard: only fetch once per eventId
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const fetchEvent = async () => {
      try {
        const res = await api.get<ApiResponse<Event>>(
          API_ROUTES.EVENT.GET_BY_ID(eventId),
        );
        const event = res.data.data;

        const hasBulkDiscount =
          event.bulkTicketForDiscount && event.bulkTicketForDiscount > 0;

        reset({
          title: event.title || "",
          artistName: event.artistName || "",
          venue: event.venue || "",
          eventDate: event.eventDate?.slice(0, 10) || "",
          eventTime: event.eventTime?.slice(0, 5) || "",
          ticketPrice: event.ticketPrice || 0,
          totalSeats: event.totalSeats || 0,
          bulkTicketForDiscount: event.bulkTicketForDiscount
            ? String(event.bulkTicketForDiscount)
            : "",
          discountPercentage: event.discountPercentage
            ? String(event.discountPercentage)
            : "",
          eventCategoryId: event.eventCategoryId || null,
          description: event.description || "",
        });

        setEnableBulkDiscount(hasBulkDiscount);

        if (event.couponIds && event.couponIds.length > 0) {
          setSelectedCoupons(event.appliedCoupons);
        }

        if (event.posterImageUrl) {
          setPosterImageUrl(event.posterImageUrl);
        }
      } catch (error) {
        console.error(error);
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
        handleClose();
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [mode, eventId]); // ← Keep only these two

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
      const poster = await uploadPoster(file);

      setPosterImageUrl(poster.url);
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
      if (mode === "edit" && eventId) {
        await api.put(API_ROUTES.EVENT.UPDATE(eventId), {
          id: eventId,
          ...payload,
        });
        toast.success(MESSAGES.SUCCESS.UPDATE_EVENT);
      } else {
        await api.post(API_ROUTES.EVENT.CREATE, payload);
        toast.success(MESSAGES.SUCCESS.CREATE_EVENT);
      }
      onSave();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ?? MESSAGES.SUCCESS.FAILED_SAVE_EVENT,
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <DialogTitle sx={{ p: 0, m: 0 }}>
          {mode === "add" ? "Create Event" : "Edit Event"}
        </DialogTitle>
        <IconButton size="small" onClick={onClose} sx={{ color: "#999" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        <form
          onSubmit={handleSubmit(onSubmit, (errs) =>
            console.error("VALIDATION FAILED:", errs),
          )}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
            }}
          >
            {/* Title */}
            <TextField
              label="Title"
              fullWidth
              size="small"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            {/* Artist Name */}
            <TextField
              label="Artist Name"
              fullWidth
              size="small"
              {...register("artistName")}
              error={!!errors.artistName}
              helperText={errors.artistName?.message}
            />

            {/* Venue */}
            <TextField
              label="Venue"
              fullWidth
              size="small"
              {...register("venue")}
              error={!!errors.venue}
              helperText={errors.venue?.message}
            />

            {/* Date & Time */}
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

            {/* Ticket Price */}
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

            {/* Total Seats */}
            <TextField
              label="Total Seats"
              size="small"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
              {...register("totalSeats")}
              error={!!errors.totalSeats}
              helperText={errors.totalSeats?.message}
            />

            {/* Coupons */}
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

            <TextField
              label="Description"
              multiline
              rows={4}
              size="small"
              type="number"
              fullWidth
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              sx={{ gridColumn: "-1/1" }}
            />

            {selectedCoupons.length > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "green", gridColumn: "1 / -1" }}
              >
                {selectedCoupons.length} coupon(s) will be added
              </Typography>
            )}

            {/* Image Upload */}
            <Box
              sx={{
                gridColumn: "1 / -1",
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
                      height="150"
                      image={posterImageUrl}
                      alt="Event poster"
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
                    >
                      Change
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
                      <CircularProgress size={28} sx={{ mb: 1 }} />
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        Uploading...
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ py: 2 }}>
                      <CloudUploadIcon
                        sx={{ fontSize: 32, color: "primary.main", mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Drop image or click to browse
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
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    {imageUploading ? "Uploading..." : "Choose image"}
                  </Button>
                </Box>
              )}
            </Box>

            {/* Bulk Discount */}
            <FormControlLabel
              control={
                <Switch
                  checked={enableBulkDiscount}
                  onChange={(e) => {
                    setEnableBulkDiscount(e.target.checked);
                  }}
                />
              }
              label="Enable discount on bulk tickets"
              sx={{ gridColumn: "1 / -1" }}
            />
            <Box
              sx={{
                display: enableBulkDiscount ? "flex" : "none",
                gap: 2,
                gridColumn: "1 / -1",
              }}
            >
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

            {/* Buttons */}
            <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 2, mt: 2 }}>
              <Button
                type="button"
                variant="outlined"
                fullWidth
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "add"
                    ? "Create Event"
                    : "Update Event"}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>

      {/* Remove Image Confirmation */}
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

export default EventFormModal;
