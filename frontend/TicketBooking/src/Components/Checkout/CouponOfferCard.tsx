import { Box, Typography, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface CouponOfferCardProps {
  code: string;
  discountPercentage: number;
  savingsAmount?: number;
  isUsed: boolean;
  isSelected: boolean;
  onApply: () => void;

  fullWidth?: boolean;
}

const CouponOfferCard = ({
  code,
  discountPercentage,
  savingsAmount,
  isUsed,
  isSelected,
  onApply,

  fullWidth,
}: CouponOfferCardProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.25,
      p: 1.25,
      minWidth: fullWidth ? "auto" : 200,
      width: fullWidth ? "100%" : { xs: "calc(50% - 6px)", sm: 200 },
      borderRadius: 2.5,
      border: "1px solid",
      borderColor: isSelected ? "success.main" : "divider",
      bgcolor: isSelected ? "rgba(76, 175, 80, 0.06)" : "background.paper",
      flexShrink: 0,
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        flexShrink: 0,
        bgcolor: "rgba(93, 76, 227, 0.1)",
        color: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      <img src="/SealPercent.svg" alt="%" width={18} height={18} />
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, lineHeight: 1.3 }}
        noWrap
      >
        {code}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block" }}
        noWrap
      >
        {discountPercentage}% off
        {savingsAmount ? ` · saves ₹${savingsAmount.toFixed(2)}` : ""}
      </Typography>
    </Box>

    {isSelected ? (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.25,
          color: "success.main",
          flexShrink: 0,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 16 }} />
        <Typography variant="caption" sx={{ fontWeight: 700 }}>
          Applied
        </Typography>
      </Box>
    ) : (
      <IconButton
        size="small"
        disabled={isUsed}
        onClick={onApply}
        sx={{ flexShrink: 0 }}
      >
        {isUsed ? (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontWeight: 600, fontSize: 11 }}
          >
            Used
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 12, color: "primary.main" }}>
            Apply
          </Typography>
        )}
      </IconButton>
    )}
  </Box>
);

export default CouponOfferCard;
