import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

interface EventTypeFormDialogProps {
  open: boolean;
  editingTypeId: number | null;
  typeName: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const EventTypeFormDialog = ({
  open,
  editingTypeId,
  typeName,
  loading,
  onNameChange,
  onClose,
  onSave,
}: EventTypeFormDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      {editingTypeId ? "Edit Event Type" : "Create Event Type"}
    </DialogTitle>
    <DialogContent>
      <TextField
        fullWidth
        label="Type Name"
        margin="dense"
        value={typeName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g., Concert, Theater, Sports"
        disabled={loading}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        disabled={loading || !typeName.trim()}
      >
        {loading ? <CircularProgress size={24} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default EventTypeFormDialog;
