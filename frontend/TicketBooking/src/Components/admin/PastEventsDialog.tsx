import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import type { EventCategory, PastEvent } from "../../types";

interface PastEventsDialogProps {
  open: boolean;
  selectedCategory: EventCategory | null;
  pastEvents: PastEvent[];
  loading: boolean;
  onClose: () => void;
}

const PastEventsDialog = ({
  open,
  selectedCategory,
  pastEvents,
  loading,
  onClose,
}: PastEventsDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Past Events: {selectedCategory?.name}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : pastEvents.length === 0 ? (
          <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
            No past events
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Artist</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pastEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.artistName}</TableCell>
                    <TableCell>
                      {new Date(event.eventDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      {event.isActive ? (
                        <Chip label="Past" size="small" color="default" />
                      ) : (
                        <Chip
                          label="Deleted"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PastEventsDialog;
