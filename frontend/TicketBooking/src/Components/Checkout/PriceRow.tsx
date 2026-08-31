import { Box, Typography } from "@mui/material";

interface PriceRowProps {
  label: string;
  value: string;
  color?: string;
}

/**
 * A simple label/value row used in the Checkout price breakdown panel.
 * Extracted from the bottom of Checkout.tsx where it was defined after
 * the default export — which obscures its relationship to the component.
 */
const PriceRow = ({ label, value, color }: PriceRowProps) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
    <Typography variant="body2" sx={{ color: color || "text.primary" }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ color: color || "text.primary", fontWeight: color ? 600 : 400 }}
    >
      {value}
    </Typography>
  </Box>
);

export default PriceRow;
