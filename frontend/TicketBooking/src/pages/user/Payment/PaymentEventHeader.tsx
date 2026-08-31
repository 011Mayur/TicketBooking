import { Box, Typography, Skeleton } from "@mui/material";
import type { EventResponse } from "../../../types";

const PaymentEventHeader = ({ event }: { event: EventResponse | null }) => {
  if (!event) {
    return (
      <Box sx={{ mb: 3 }}>
        <Skeleton width={280} height={40} />
        <Skeleton width={320} height={28} sx={{ mt: 1 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "1.4rem", sm: "2rem" },
          mb: 1.5,
        }}
      >
        {event.title}
      </Typography>
    </Box>
  );
};

export default PaymentEventHeader;
