import { Box, Chip, CircularProgress, Typography } from "@mui/material";
import type { EventCategory } from "../../types";

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

const CountBadge = ({
  count,
  selected,
}: {
  count: number;
  selected: boolean;
}) => (
  <Box
    component="span"
    sx={{
      minWidth: 20,
      height: 20,
      px: 0.6,
      borderRadius: "10px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.7rem",
      fontWeight: 700,
      lineHeight: 1,
      bgcolor: selected ? "rgba(255,255,255,0.25)" : "#e3f2fd",
      color: selected ? "#fff" : "#1976d2",
    }}
  >
    {count}
  </Box>
);

interface EventCategoryChipsProps {
  categories: EventCategory[];
  selectedCategoryId: number | null;
  categoriesLoading: boolean;
  onSelectCategory: (categoryId: number) => void;
}

const EventCategoryChips = ({
  categories,
  selectedCategoryId,
  categoriesLoading,
  onSelectCategory,
}: EventCategoryChipsProps) => {
  if (categoriesLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (categories.length === 0) {
    return (
      <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>
        No categories available for this type.
      </Typography>
    );
  }

  return (
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
        Category
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {categories.map((category) => {
          const selected = category.id === selectedCategoryId;
          return (
            <Chip
              key={category.id}
              clickable
              onClick={() => onSelectCategory(category.id)}
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              sx={chipSx(selected)}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <span>{category.name}</span>
                  <CountBadge
                    count={category.activeEventCount}
                    selected={selected}
                  />
                </Box>
              }
            />
          );
        })}
      </Box>
    </>
  );
};

export default EventCategoryChips;
