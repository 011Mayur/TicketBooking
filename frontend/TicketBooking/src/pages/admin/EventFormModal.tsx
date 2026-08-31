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
  DialogTitle,
} from "@mui/material";
import { toast } from "react-toastify";
import { eventSchema } from "../../zodSchema/eventSchema";
import api from "../../api/axios";

import type { CouponCode } from "../../types";
import type { AxiosError } from "axios";
import type z from "zod";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { API_ROUTES } from "../../constants/apiRoutes";

import CloseIcon from "@mui/icons-material/Close";
import ConfirmDialog from "../shared/ConfirmDialog";
import { MESSAGES } from "../../constants/messages";
import { useEventForm } from "../../hooks/admin/useEventForm";
import PosterUploadZone from "../../components/admin/PosterUploadZone";

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

  const [enableBulkDiscount, setEnableBulkDiscount] = useState(false);
  const [selectedCoupons, setSelectedCoupons] = useState<CouponCode[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [posterImageUrl, setPosterImageUrl] = useState<string>();
  const [removeImageDialogOpen, setRemoveImageDialogOpen] = useState(false);

  // Data fetching via hook
  const { coupons, couponLoading, loading, eventData } = useEventForm({
    mode,
    eventId,
    typeId,
    categoryId,
  });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Set category for add mode
  useEffect(() => {
    if (mode === "add" && categoryId) {
      setValue("eventCategoryId", categoryId);
    }
  }, [mode, categoryId, setValue]);

  // Populate form when eventData is loaded in edit mode
  useEffect(() => {
    if (!eventData) return;

    const hasBulkDiscount =
      eventData.bulkTicketForDiscount && eventData.bulkTicketForDiscount > 0;

    reset({
      title: eventData.title || "",
      artistName: eventData.artistName || "",
      venue: eventData.venue || "",
      eventDate: eventData.eventDate?.slice(0, 10) || "",
      eventTime: eventData.eventTime?.slice(0, 5) || "",
      ticketPrice: eventData.ticketPrice || 0,
      totalSeats: eventData.totalSeats || 0,
      bulkTicketForDiscount: eventData.bulkTicketForDiscount
        ? String(eventData.bulkTicketForDiscount)
        : "",
      discountPercentage: eventData.discountPercentage
        ? String(eventData.discountPercentage)
        : "",
      eventCategoryId: eventData.eventCategoryId || null,
      description: eventData.description || "",
    });

    setEnableBulkDiscount(!!hasBulkDiscount);

    if (eventData.couponIds?.length > 0) {
      setSelectedCoupons(eventData.appliedCoupons);
    }

    if (eventData.posterImageUrl) {
      setPosterImageUrl(eventData.posterImageUrl);
    }
  }, [eventData, reset]);

  // Category set for edit mode after type loads
  useEffect(() => {
    if (categoryId && mode === "edit") {
      setValue("eventCategoryId", categoryId);
    }
  }, [categoryId, mode, setValue]);

  // Reset bulk discount fields when toggled off
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

  const handleRemoveImageConfirm = () => {
    setPosterImageUrl("");
    setRemoveImageDialogOpen(false);
    toast.success(MESSAGES.SUCCESS.REMOVED_IMAGE);
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
      {/* Header */}
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
        <Button
          size="small"
          onClick={handleClose}
          sx={{ color: "#999", minWidth: "auto" }}
        >
          <CloseIcon fontSize="small" />
        </Button>
      </Box>

      {/* Form */}
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
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
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

            <TextField
              label="Description"
              multiline
              rows={4}
              size="small"
              fullWidth
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

            {/* Poster upload — own component */}
            <PosterUploadZone
              posterImageUrl={posterImageUrl}
              uploading={imageUploading}
              onUploaded={setPosterImageUrl}
              onUploading={setImageUploading}
              onRemoveRequest={() => setRemoveImageDialogOpen(true)}
            />

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

            {/* Action buttons */}
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
