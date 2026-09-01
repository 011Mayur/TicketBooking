import { useRef, useCallback } from "react";
import { Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { API_ROUTES } from "../../constants/apiRoutes";
import api from "../../api/axios";
import type { BookingSummaryResponse } from "../../types";

interface TicketDownloadProps {
  booking: BookingSummaryResponse;
  variant?: "button" | "icon";
}

const TicketDownload = ({
  booking,
  variant = "button",
}: TicketDownloadProps) => {
  const downloading = useRef(false);

  const handleDownload = useCallback(async () => {
    if (downloading.current) return;
    downloading.current = true;

    try {
      const response = await api.get(API_ROUTES.BOOKING.TICKET_PDF(booking.id), {
        responseType: "blob",
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      const safeName = booking.eventTitle
        .replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 30);
      link.href = url;
      link.setAttribute("download", `ticket-${safeName}-${booking.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download ticket:", err);
    } finally {
      downloading.current = false;
    }
  }, [booking]);

  if (variant === "icon") {
    return (
      <Button
        size="small"
        onClick={handleDownload}
        sx={{ minWidth: "auto", p: 0.75 }}
        title="Download Ticket"
      >
        <DownloadIcon fontSize="small" />
      </Button>
    );
  }

  return (
    <Button
      variant="outlined"
      fullWidth
      size="small"
      startIcon={<DownloadIcon />}
      onClick={handleDownload}
      sx={{ textTransform: "none" }}
    >
      Download Ticket
    </Button>
  );
};

export default TicketDownload;
