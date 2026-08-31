import { useRef, useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface InfoChipProps {
  icon: React.ReactNode;
  label: string;
  /** Must be a plain string so tooltip can display it. */
  value: string;
  valueColor?: string;
  tooltip?: boolean;
}

/**
 * Small info card used in EventDetails to display Venue, Date, and Seats.
 * Extracted from EventDetails.tsx where it was defined inline inside the
 * render body — which is a React anti-pattern (new function identity each render).
 */
const InfoChip = ({
  icon,
  label,
  value,
  valueColor,
  tooltip = false,
}: InfoChipProps) => {
  const theme = useTheme();
  const valueRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkOverflow = () => {
    const el = valueRef.current;
    if (el) setIsOverflowing(el.scrollWidth > el.clientWidth);
  };

  const valueNode = (
    <Typography
      ref={valueRef}
      variant="body2"
      sx={{ fontWeight: 600, color: valueColor }}
      noWrap
      onMouseEnter={tooltip ? checkOverflow : undefined}
    >
      {value}
    </Typography>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        flex: "1 1 140px",
        minWidth: 0,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${theme.palette.primary.main}14`,
          color: theme.palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, display: "block" }}
        >
          {label}
        </Typography>
        {tooltip ? (
          <Tooltip title={value} arrow disableHoverListener={!isOverflowing}>
            {valueNode}
          </Tooltip>
        ) : (
          valueNode
        )}
      </Box>
    </Box>
  );
};

export default InfoChip;
