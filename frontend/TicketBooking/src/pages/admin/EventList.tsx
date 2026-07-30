import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { EventSortColumn, SortDir } from "../../Common/types";
import type { Event, PagedResult } from "../../Common/interface";
import api from "../../Api/axios";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { MESSAGES } from "../../Constant/messages";

const COLUMNS: { key: EventSortColumn; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "artistName", label: "Artist" },
  { key: "venue", label: "Venue" },
  { key: "eventDate", label: "Date" },
  { key: "ticketPrice", label: "Price" },
  { key: "totalSeats", label: "Seats" },
];

const EventList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PagedResult<Event> | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState<EventSortColumn>("eventDate");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    eventId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(eventId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PagedResult<Event>>("/Event/GetPaged", {
        params: {
          search: search || undefined,
          sortColumn,
          sortDir,
          page: page + 1,
          pageSize,
        },
      });
      setData(res.data);
    } catch {
      toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
    } finally {
      setLoading(false);
    }
  }, [search, sortColumn, sortDir, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, 400);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  const handleSort = (column: EventSortColumn) => {
    if (sortColumn === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDir("asc");
    }
    setPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleDeleteClick = (event: Event) => {
    setDeleteTarget(event);
  };

  const handleDeleteCancel = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/Event/Delete/${deleteTarget.id}`);
      toast.success(MESSAGES.SUCCESS.EVENT_DELETED);
      setDeleteTarget(null);
      fetchEvents();
    } catch {
      toast.error(MESSAGES.ERROR.EVENT_DELETED);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Events
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/admin/events/new")}
        >
          Create Event
        </Button>
      </Box>

      <TextField
        placeholder="Search by title, artist, or venue"
        fullWidth
        size="small"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col.key}>
                  <TableSortLabel
                    active={sortColumn === col.key}
                    direction={sortColumn === col.key ? sortDir : "asc"}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : data && data.items.length > 0 ? (
              data.items.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell>{event.title}</TableCell>
                  <TableCell>{event.artistName}</TableCell>
                  <TableCell>{event.venue}</TableCell>
                  <TableCell>
                    {new Date(event.eventDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>₹{event.ticketPrice}</TableCell>
                  <TableCell>
                    {event.availableSeats} / {event.totalSeats}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, event.id)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Menu
                      open={Boolean(anchorEl) && menuRowId === event.id}
                      onClose={handleMenuClose}
                      anchorEl={anchorEl}
                    >
                      <MenuItem
                        onClick={() =>
                          navigate(`/admin/events/${event.id}/edit`)
                        }
                      >
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteClick(event)}>
                        Delete
                      </MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={data?.totalCount ?? 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete event"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        abortButton="cancle"
        confirmButton="Delete"
      />
    </div>
  );
};

export default EventList;
