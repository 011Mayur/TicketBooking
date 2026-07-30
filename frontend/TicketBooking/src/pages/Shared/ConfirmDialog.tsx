import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  abortButton: string;
  confirmButton: string;
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
}: ConfirmDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          color="primary"
          onClick={onCancel}
          disabled={loading}
        >
          {abortButton}
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? "Loading..." : confirmButton}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
