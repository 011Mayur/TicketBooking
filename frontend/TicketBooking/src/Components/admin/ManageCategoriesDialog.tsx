import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { EventCategory, EventTypeDetail } from "../../types";

interface ManageCategoriesDialogProps {
  open: boolean;
  selectedType: EventTypeDetail | null;
  categories: EventCategory[];
  categoriesLoading: boolean;
  onClose: () => void;
  onAddCategory: () => void;
  onEditCategory: (category: EventCategory) => void;
  onDeleteCategory: (category: EventCategory) => void;
  onViewPastEvents: (category: EventCategory) => void;
}

const ManageCategoriesDialog = ({
  open,
  selectedType,
  categories,
  categoriesLoading,
  onClose,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onViewPastEvents,
}: ManageCategoriesDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Categories: {selectedType?.name}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {categoriesLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {categories.length === 0 ? (
              <Typography
                color="textSecondary"
                align="center"
                sx={{ py: 2 }}
              >
                No categories yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: "400px", overflowY: "auto" }}>
                {categories.map((category) => (
                  <Box
                    key={category.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      bgcolor: theme.palette.grey[50],
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {category.activeEventCount} active ·{" "}
                        {category.pastEventCount} past events
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEditCategory(category)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {category.pastEventCount > 0 && (
                        <Tooltip title="View past events">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onViewPastEvents(category)}
                          >
                            {category.pastEventCount} Past
                          </Button>
                        </Tooltip>
                      )}

                      {category.canDelete ? (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeleteCategory(category)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={category.deletionReason}>
                          <span>
                            <IconButton size="small" disabled>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onAddCategory}
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Category
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
