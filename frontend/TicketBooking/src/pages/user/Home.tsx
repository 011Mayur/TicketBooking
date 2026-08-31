import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAllEventsFeed } from "../../hooks/event/useAllEventsFeed";
import { useEventTypes } from "../../hooks/event/useEventTypes";
import { useTypeEventRow } from "../../hooks/event/useTypeEventRow";
import EventCarousel from "../../components/EventCarousel";
import TypeFilterChips from "../../components/TypeFilterChips";

const Home = () => {
  const theme = useTheme();

  const {
    events,
    loading,
    loadingMore,
    error,
    searchQuery,
    isSearching,
    handleSearchInput,
    handleSearchSubmit,
    loadMore,
    hasNextPage,
  } = useAllEventsFeed();

  const { types } = useEventTypes();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const effectiveTypeId =
    selectedTypeId ?? (types.length > 0 ? types[0].id : null);

  const selectedType = types.find((t) => t.id === effectiveTypeId) ?? null;
  const {
    events: typeEvents,
    loading: typeLoading,
    loadingMore: typeLoadingMore,
    loadMore: typeLoadMore,
  } = useTypeEventRow(effectiveTypeId);

  return (
    <Box
      sx={{ width: "100%", backgroundColor: theme.palette.background.default }}
    >
      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: { xs: 280, sm: 340, md: 400 },
            backgroundImage: `url('/hero_banner.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: { xs: 0, sm: 3, md: 4 },
            overflow: "hidden",
            mx: { xs: 0, sm: 2, md: 3 },
            mt: { xs: 0, sm: 2, md: 3 },
            mb: 4,
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 1,
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              px: { xs: 2, sm: 3, md: 4 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "0.875rem", md: "1rem" },
                fontWeight: 500,
              }}
            >
              Find Your Next Amazing Event
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                width: "100%",
                maxWidth: 500,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.95)",
                borderRadius: 50,
                padding: "8px 16px",
                boxShadow: "0 4px 20px rgba(69,64,225,0.2)",
                "&:hover": { boxShadow: "0 6px 24px rgba(69,64,225,0.3)" },
                "&:focus-within": {
                  boxShadow: "0 6px 24px rgba(69,64,225,0.4)",
                },
              }}
            >
              <SearchIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 24,
                  flexShrink: 0,
                }}
              />
              <TextField
                fullWidth
                placeholder="Search events, venues..."
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                variant="standard"
                slotProps={{ input: { disableUnderline: true } }}
                sx={{
                  "& .MuiInputBase-input": {
                    color: theme.palette.text.primary,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    padding: "8px 0",
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchSubmit}
                sx={{
                  flexShrink: 0,
                  px: { xs: 2, md: 3 },
                  py: 1,
                  borderRadius: 50,
                  backgroundColor: theme.palette.primary.main,
                  color: "white",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { backgroundColor: theme.palette.primary.dark },
                }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>

      <Container
        maxWidth="xl"
        sx={{ py: { xs: 3, md: 6 }, px: { xs: 2, sm: 3 } }}
      >
        {error && (
          <Box
            sx={{
              p: 3,
              bgcolor: "#FFEBEE",
              borderLeft: `4px solid ${theme.palette.error.main}`,
              borderRadius: 1,
              mb: 3,
            }}
          >
            <Typography sx={{ color: theme.palette.error.main }}>
              {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1,
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            {isSearching ? "Search Results" : "All Events"}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              fontSize: { xs: "0.95rem", md: "1rem" },
            }}
          >
            {isSearching
              ? `Results for "${searchQuery}"`
              : "Everything happening, in one place"}
          </Typography>

          {!loading && events.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
              >
                {isSearching
                  ? "No events match your search"
                  : "No events available at the moment"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mt: 1 }}
              >
                {isSearching
                  ? "Try a different search term"
                  : "Check back soon for upcoming events!"}
              </Typography>
            </Box>
          ) : (
            <EventCarousel
              events={events}
              loading={loading}
              loadingMore={loadingMore}
              onScrollEnd={loadMore}
              hasNextPage={hasNextPage}
            />
          )}
        </Box>

        {!isSearching && types.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 1,
                fontSize: { xs: "1.75rem", md: "2.125rem" },
              }}
            >
              Find Best For You
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                mb: 2,
                fontSize: { xs: "0.95rem", md: "1rem" },
              }}
            >
              Match Your interest
            </Typography>

            <TypeFilterChips
              types={types}
              selectedTypeId={effectiveTypeId}
              onChange={setSelectedTypeId}
            />

            {!typeLoading && typeEvents.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography
                  variant="h6"
                  sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                >
                  No {selectedType?.name.toLowerCase()} events right now
                </Typography>
              </Box>
            ) : (
              <EventCarousel
                events={typeEvents}
                loading={typeLoading}
                loadingMore={typeLoadingMore}
                onScrollEnd={typeLoadMore}
                hasNextPage={hasNextPage}
              />
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;
