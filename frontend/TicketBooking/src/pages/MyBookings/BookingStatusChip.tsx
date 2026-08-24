import { Chip } from "@mui/material";
import { CATEGORY_META, type BookingCategory } from "../../utils/bookingUtils";

const BookingStatusChip = ({ category }: { category: BookingCategory }) => {
  const meta = CATEGORY_META[category];
  return (
    <Chip
      label={meta.label}
      color={meta.color}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

export default BookingStatusChip;
