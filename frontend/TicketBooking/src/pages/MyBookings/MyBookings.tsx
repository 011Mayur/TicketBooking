import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../constants/appRoutes";
import type { BookingCategory } from "../../utils/bookingUtils";
import { useMyBookings } from "../../hooks/booking/useMyBookings";
import { formatEventDateTime } from "../../utils/dateUtils";
import { classifyBooking } from "../../utils/bookingUtils";
import BookingStatusChip from "./BookingStatusChip";
import TicketDownload from "../../components/Checkout/TicketDownload";

type TabKey = "all" | BookingCategory;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const MyBookings = () => {
  const navigate = useNavigate();
  const { bookings, grouped, loading, error } = useMyBookings();
  const [tab, setTab] = useState<TabKey>("all");

  const visible = tab === "all" ? bookings : grouped[tab];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          My Bookings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          onClick={() => navigate(APP_ROUTES.HOME)}
        >
          Browse Events
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((t) => (
          <Tab
            key={t.key}
            value={t.key}
            label={`${t.label} (${t.key === "all" ? bookings.length : (grouped[t.key as BookingCategory]?.length ?? 0)})`}
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        ))}
      </Tabs>

      {loading && (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && visible.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No bookings here yet.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate(APP_ROUTES.HOME)}
            sx={{ textTransform: "none" }}
          >
            Browse Events
          </Button>
        </Box>
      )}

      {!loading && !error && visible.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.02)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Venue</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Tickets</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((b) => {
                const category = classifyBooking(b);
                const isPending = category === "pending";
                
                return (
                  <TableRow key={b.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{b.eventTitle}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {formatEventDateTime(b.eventDate, b.eventTime)}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>{b.venue}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{b.quantity}</TableCell>
                    <TableCell sx={{ textAlign: "right", fontWeight: 600 }}>
                      ₹{b.finalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <BookingStatusChip category={category} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                        <Tooltip title="View Event">
                          <IconButton size="small" onClick={() => navigate(APP_ROUTES.EVENT(b.eventId))}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {isPending && (
                          <Tooltip title="Complete Payment">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() =>
                                navigate(APP_ROUTES.PAYMENT(String(b.id)), {
                                  state: { bookingId: b.id },
                                })
                              }
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {(category === "upcoming" || category === "past") && (
                          <TicketDownload booking={b} variant="icon" />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default MyBookings;
