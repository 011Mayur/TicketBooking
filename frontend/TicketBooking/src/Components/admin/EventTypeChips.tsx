import { Box, Chip, Typography } from "@mui/material";
import type { EventTypeDetail } from "../../types";

// --- shared chip visual styles ---
const chipSx = (selected: boolean) => ({
  height: 34,
  borderRadius: "20px",
  fontWeight: 600,
  px: 0.5,
  border: selected ? "none" : "1px solid #e0e0e0",
  backgroundColor: selected ? undefined : "#fff",
  "&:hover": {
    backgroundColor: selected ? undefined : "#f5f5f5",
  },
});

interface EventTypeChipsProps {
  eventTypes: EventTypeDetail[];
  selectedTypeId: number | null;
  onSelectType: (typeId: number) => void;
}

const EventTypeChips = ({
  eventTypes,
  selectedTypeId,
  onSelectType,
}: EventTypeChipsProps) => (
  <>
    <Typography
      variant="overline"
      sx={{
        fontWeight: 700,
        fontSize: "0.72rem",
        color: "#666",
        letterSpacing: "0.5px",
        display: "block",
        mb: 1,
      }}
    >
      Event Type
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
      {eventTypes.map((type) => {
        const selected = type.id === selectedTypeId;
        return (
          <Chip
            key={type.id}
            clickable
            onClick={() => onSelectType(type.id)}
            color={selected ? "primary" : "default"}
            variant={selected ? "filled" : "outlined"}
            sx={chipSx(selected)}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <span>{type.name}</span>
              </Box>
            }
          />
        );
      })}
    </Box>
  </>
);

export default EventTypeChips;
