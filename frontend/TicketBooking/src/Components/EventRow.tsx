
import { Box, Typography, useTheme } from "@mui/material";
import { useTypeEventRow } from "../Hooks/useTypeEventRow";
import EventCarousel from "./EventCarousel";
import type { EventType } from "../Common/interface";

interface EventRowProps {
  type: EventType;
}

const EventRow = ({ type }: EventRowProps) => {
  const theme = useTheme();
  const { events, loading, loadingMore, hasNextPage, isEmpty, loadMore } = useTypeEventRow(type.id);

  if (isEmpty) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
      >
        {type.name}
      </Typography>
      <EventCarousel events={events} loading={loading} loadingMore={loadingMore} hasNextPage={hasNextPage} onScrollEnd={loadMore} />
    </Box>
  );
};

export default EventRow;