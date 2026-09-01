import { useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { uploadPoster } from "../../services/eventService";
import { MESSAGES } from "../../constants";

interface PosterUploadZoneProps {
  posterImageUrl: string | undefined;
  uploading: boolean;
  onUploaded: (url: string) => void;
  onUploading: (value: boolean) => void;
  onRemoveRequest: () => void;
}

const PosterUploadZone = ({
  posterImageUrl,
  uploading,
  onUploaded,
  onUploading,
  onRemoveRequest,
}: PosterUploadZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(MESSAGES.ERROR.INVALID_IMAGE);
      return;
    }
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(MESSAGES.ERROR.IMAGE_TOO_LARGE(maxSizeMB));
      return;
    }

    onUploading(true);
    try {
      const poster = await uploadPoster(file);
      onUploaded(poster.url);
      toast.success(MESSAGES.SUCCESS.IMAGE_UPLOADED);
    } catch (error) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? "Failed to upload image.");
    } finally {
      onUploading(false);
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

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
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
        disabled={uploading}
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
          <Typography variant="body2" sx={{ mb: 1, color: "success.main" }}>
            ✓ Poster uploaded
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={triggerFilePicker}
              disabled={uploading}
              fullWidth
            >
              Change
            </Button>
            <IconButton
              size="small"
              onClick={onRemoveRequest}
              disabled={uploading}
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
          {uploading ? (
            <Box sx={{ py: 2 }}>
              <CircularProgress size={28} sx={{ mb: 1 }} />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
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
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                (Optional) JPG, PNG • Max 5MB
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            onClick={triggerFilePicker}
            disabled={uploading}
            fullWidth
            sx={{ mt: 1 }}
            size="small"
          >
            {uploading ? "Uploading..." : "Choose image"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PosterUploadZone;
