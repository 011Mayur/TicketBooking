import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  type ButtonProps,
} from "@mui/material";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;              
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  abortButton: string;
  confirmButton: string;
  confirmColor?: ButtonProps["color"]; 
}

const ConfirmDialog = ({
  open,
  title,
  message,
  loading = false,
  onConfirm,
  onCancel,
  abortButton,
  confirmButton,
  confirmColor = "primary", 
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} aria-labelledby="confirm-dialog-title">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText component="div">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={onCancel} disabled={loading}>
          {abortButton}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained" disabled={loading}>
          {loading ? "Loading..." : confirmButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;