import { useEffect, useRef, useState } from "react";
import { Box, IconButton, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { HomePageEvent } from "../types";
import EventCard from "./EventCard";
import SkeletonCard from "./SkeletonCard";

interface EventCarouselProps {
  events: HomePageEvent[];
  loading: boolean;
  loadingMore: boolean;
  onScrollEnd: () => void;
  hasNextPage: boolean;
}

const EventCarousel = ({
  events,
  loading,
  loadingMore,
  onScrollEnd,
  hasNextPage,
}: EventCarouselProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const itemsVisible = isMobile ? 1 : isTablet ? 2 : 4;
  const cardWidth = isMobile
    ? "calc(100% - 16px)"
    : isTablet
      ? "calc(50% - 12px)"
      : "calc(25% - 12px)";
  const isNearEnd = () => {
    const el = scrollContainerRef.current;
    if (!el) return false;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    return scrollWidth - clientWidth - scrollLeft <= 400;
  };
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth - clientWidth - scrollLeft > 1;
    setCanScrollRight(hasOverflow || hasNextPage);
  };
  const handleArrowClick = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;

    if (direction === "right" && !hasOverflow) {
      onScrollEnd();
      return;
    }

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };
  const handleScroll = () => {
    if (isNearEnd()) onScrollEnd();
    updateScrollState();
  };
  useEffect(() => {
    updateScrollState();
  }, [events, loading, loadingMore, hasNextPage]);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || loading || loadingMore) return;
    if (el.scrollWidth <= el.clientWidth && events.length > 0) {
      onScrollEnd();
    }
  }, [events, loading, loadingMore]);

  useEffect(() => {
    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hasNextPage]);
  return (
    <Box sx={{ position: "relative" }}>
      {!isMobile && (
        <IconButton
          onClick={() => handleArrowClick("left")}
          sx={{
            position: "absolute",
            left: -50,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            color: theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: "50%",
            width: 44,
            height: 44,
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "translateY(-50%) scale(1.1)",
            },
          }}
        >
          <ChevronLeftIcon sx={{ fontSize: 24 }} />
        </IconButton>
      )}

      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          overflowY: "hidden",
          scrollBehavior: "smooth",
          scrollSnapType: "x mandatory",
          pb: 1,
          "&::-webkit-scrollbar": { height: 6 },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: 3,
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme.palette.primary.main,
            borderRadius: 3,
          },
        }}
      >
        {loading
          ? Array.from({ length: itemsVisible }).map((_, i) => (
              <Box
                key={`skeleton-${i}`}
                sx={{
                  flex: `0 0 ${cardWidth}`,
                  scrollSnapAlign: "start",
                  minWidth: cardWidth,
                }}
              >
                <SkeletonCard />
              </Box>
            ))
          : events.map((event) => (
              <Box
                key={`event-${event.id}`}
                sx={{
                  flex: `0 0 ${cardWidth}`,
                  scrollSnapAlign: "start",
                  minWidth: cardWidth,
                }}
              >
                <EventCard event={event} />
              </Box>
            ))}

        {loadingMore &&
          Array.from({ length: 4 }).map((_, i) => (
            <Box
              key={`loading-skeleton-${i}`}
              sx={{
                flex: `0 0 ${cardWidth}`,
                scrollSnapAlign: "start",
                minWidth: cardWidth,
              }}
            >
              <SkeletonCard />
            </Box>
          ))}
      </Box>

      {!isMobile && canScrollRight && (
        <IconButton
          onClick={() => handleArrowClick("right")}
          sx={{
            position: "absolute",
            right: -50,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            color: theme.palette.primary.main,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: "50%",
            width: 44,
            height: 44,
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "translateY(-50%) scale(1.1)",
            },
          }}
        >
          <ChevronRightIcon sx={{ fontSize: 24 }} />
        </IconButton>
      )}
    </Box>
  );
};

export default EventCarousel;
