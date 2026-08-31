import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import type { Event, EventCategory, EventSortColumn, EventTypeDetail } from "../../types";
import type { SortDir } from "../../types";
import type { CategoryEventsState } from "../../hooks/admin/useEventList";

interface SortState {
  field: EventSortColumn;
  direction: SortDir;
}

interface EventTableSectionProps {
  selectedType: EventTypeDetail | undefined;
  selectedCategory: EventCategory;
  eventState: CategoryEventsState | null;
  sorts: Record<number, SortState | null>;
  defaultPageSize: number;
  onAddEvent: () => void;
  onMenuOpen: (e: React.MouseEvent<HTMLButtonElement>, event: Event) => void;
  onHeaderClick: (categoryId: number, column: EventSortColumn) => void;
  onFetchEvents: (categoryId: number, page: number, pageSize: number) => void;
}

const getSortIcon = (
  sorts: Record<number, SortState | null>,
  categoryId: number,
  column: EventSortColumn,
) => {
  const sort = sorts[categoryId];
  if (!sort || sort.field !== column) {
    return (
      <UnfoldMoreIcon
        sx={{
          fontSize: "0.95rem",
          ml: 0.3,
          opacity: 0.3,
          verticalAlign: "middle",
          display: "inline-block",
        }}
      />
    );
  }
  return sort.direction === "asc" ? (
    <ArrowUpwardIcon
      sx={{
        fontSize: "0.95rem",
        ml: 0.3,
        color: "#1976d2",
        verticalAlign: "middle",
        display: "inline-block",
      }}
    />
  ) : (
    <ArrowDownwardIcon
      sx={{
        fontSize: "0.95rem",
        ml: 0.3,
        color: "#1976d2",
        verticalAlign: "middle",
        display: "inline-block",
      }}
    />
  );
};

const sortedCellSx = (isSorted: boolean) => ({
  py: 1.5,
  cursor: "pointer",
  userSelect: "none" as const,
  whiteSpace: "nowrap" as const,
  backgroundColor: isSorted ? "#e3f2fd" : "transparent",
  borderLeft: isSorted ? "3px solid #1976d2" : "3px solid transparent",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: isSorted ? "#e3f2fd" : "#f5f5f5",
    borderLeftColor: "#1976d2",
  },
});

const EventTableSection = ({
  selectedType,
  selectedCategory,
  eventState,
  sorts,
  defaultPageSize,
  onAddEvent,
  onMenuOpen,
  onHeaderClick,
  onFetchEvents,
}: EventTableSectionProps) => {
  const isSorted = (column: EventSortColumn) =>
    sorts[selectedCategory.id]?.field === column;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: "8px",
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Panel header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {selectedCategory.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "#1976d2" }}>
            {selectedType?.name} · {selectedCategory.activeEventCount} events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddEvent}
          sx={{ textTransform: "none" }}
        >
          Add event
        </Button>
      </Box>

      {/* Table */}
      {eventState?.loading && !eventState.loaded ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table
            size="small"
            sx={{
              border: "1px solid rgba(224, 224, 224, 1)",
              "& .MuiTableCell-root": {
                borderBottom: "1px solid rgba(224, 224, 224, 1)",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: "#f5f5f5",
                  "& th": {
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "#666",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  },
                }}
              >
                <TableCell
                  onClick={() => onHeaderClick(selectedCategory.id, "title")}
                  sx={sortedCellSx(isSorted("title"))}
                >
                  Event Name
                  {getSortIcon(sorts, selectedCategory.id, "title")}
                </TableCell>

                <TableCell
                  onClick={() =>
                    onHeaderClick(selectedCategory.id, "eventDate")
                  }
                  sx={sortedCellSx(isSorted("eventDate"))}
                >
                  Date
                  {getSortIcon(sorts, selectedCategory.id, "eventDate")}
                </TableCell>

                <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                  Seats
                </TableCell>

                <TableCell
                  onClick={() =>
                    onHeaderClick(selectedCategory.id, "ticketPrice")
                  }
                  sx={sortedCellSx(isSorted("ticketPrice"))}
                >
                  Price
                  {getSortIcon(sorts, selectedCategory.id, "ticketPrice")}
                </TableCell>

                <TableCell sx={{ py: 1.5 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!eventState || eventState.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No events found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eventState.items.map((event) => (
                  <TableRow
                    key={event.id}
                    hover
                    sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {event.title}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">
                        {new Date(event.eventDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">
                        {event.availableSeats}/{event.totalSeats}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">
                        <CurrencyRupeeIcon fontSize="small" />
                        {event.ticketPrice}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }} align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => onMenuOpen(e, event)}
                        sx={{
                          color: "#666",
                          "&:hover": { color: "#1976d2" },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={eventState?.totalCount ?? 0}
            page={eventState?.page ?? 0}
            rowsPerPage={eventState?.pageSize ?? defaultPageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={(_, newPage) =>
              onFetchEvents(
                selectedCategory.id,
                newPage,
                eventState?.pageSize ?? defaultPageSize,
              )
            }
            onRowsPerPageChange={(e) =>
              onFetchEvents(
                selectedCategory.id,
                0,
                parseInt(e.target.value, 10),
              )
            }
          />
        </TableContainer>
      )}
    </Paper>
  );
};

export default EventTableSection;
