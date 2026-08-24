import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../../Constant/appRoutes";
import BookingCard from "./BookingCard";
import type { BookingCategory } from "../../utils/bookingUtils";
import { useMyBookings } from "../../Hooks/useMyBookings";

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
        <Grid container spacing={2.5}>
          {visible.map((b) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={b.id}>
              <BookingCard booking={b} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyBookings;
