import { Box, Chip } from "@mui/material";
import type { EventType } from "../Common/interface";

interface TypeFilterChipsProps {
  types: EventType[];
  selectedTypeId: number | null;
  onChange: (typeId: number) => void;
}

const TypeFilterChips = ({
  types,
  selectedTypeId,
  onChange,
}: TypeFilterChipsProps) => (
  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
    {types.map((type) => (
      <Chip
        key={type.id}
        label={type.name}
        color={selectedTypeId === type.id ? "primary" : "default"}
        onClick={() => onChange(type.id)}
        sx={{ fontWeight: 600 }}
      />
    ))}
  </Box>
);

export default TypeFilterChips;
