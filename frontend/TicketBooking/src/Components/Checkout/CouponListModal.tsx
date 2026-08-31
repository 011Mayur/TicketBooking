import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CouponOfferCard from "./CouponOfferCard";
import type { CouponOffer } from "../../types";

interface CouponListModalProps {
  open: boolean;
  onClose: () => void;
  coupons: CouponOffer[];
  loading: boolean;
  selectedCode?: string;
  onApply: (code: string) => void;
}

const CouponListModal = ({
  open,
  onClose,
  coupons,
  loading,
  selectedCode,
  onApply,
}: CouponListModalProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 1.5,
      }}
    >
      All Coupons
      <IconButton size="small" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>
    <DialogContent
      sx={{ display: "flex", flexDirection: "column", gap: 1.25, pb: 2.5 }}
    >
      {loading ? (
        <Box sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress size={22} />
        </Box>
      ) : coupons.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", textAlign: "center", py: 2 }}
        >
          No coupons available for this event.
        </Typography>
      ) : (
        coupons.map((c) => (
          <CouponOfferCard
            key={c.id}
            code={c.code}
            discountPercentage={c.discountPercentage}
            isUsed={c.isUsed}
            isSelected={selectedCode === c.code}
            onApply={() => {
              onApply(c.code);
              onClose();
            }}
            fullWidth
          />
        ))
      )}
    </DialogContent>
  </Dialog>
);

export default CouponListModal;
