import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

interface CategoryFormDialogProps {
  open: boolean;
  editingCategoryId: number | null;
  categoryName: string;
  loading: boolean;
  onNameChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

const CategoryFormDialog = ({
  open,
  editingCategoryId,
  categoryName,
  loading,
  onNameChange,
  onClose,
  onSave,
}: CategoryFormDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>
      {editingCategoryId ? "Edit Category" : "Create Category"}
    </DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <TextField
        fullWidth
        label="Category Name"
        margin="dense"
        value={categoryName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g., Live Performance, Theater Show"
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
        disabled={loading || !categoryName.trim()}
      >
        {loading ? <CircularProgress size={24} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);

export default CategoryFormDialog;
