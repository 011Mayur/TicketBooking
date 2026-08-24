import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
  Dialog,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { toast } from "react-toastify";
import api from "../../Api/axios";
import { API_ROUTES } from "../../Constant/apiRoutes";
import { MESSAGES } from "../../Constant/messages";
import ConfirmDialog from "../Shared/ConfirmDialog";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";

import type {
  ApiResponse,
  Event,
  EventCategory,
  EventTypeDetail,
  PagedResult,
} from "../../Common/interface";
import EventFormModal from "./EventFormModal";
import type { EventSortColumn, SortDir } from "../../Common/types";
import { buildSortParams } from "../../utils/sortParams";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

interface CategoryEventsState {
  items: Event[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  loaded: boolean;
}

const DEFAULT_PAGE_SIZE = 5;

// --- shared chip visual styles, so type-chips and category-chips stay consistent ---
const chipSx = (selected: boolean) => ({
  height: 34,
  borderRadius: "20px",
  fontWeight: 600,
  px: 0.5,
  border: selected ? "none" : "1px solid #e0e0e0",
  backgroundColor: selected ? undefined : "#fff",
  "&:hover": {
    backgroundColor: selected ? undefined : "#f5f5f5",
  },
});

const CountBadge = ({
  count,
  selected,
}: {
  count: number;
  selected: boolean;
}) => (
  <Box
    component="span"
    sx={{
      minWidth: 20,
      height: 20,
      px: 0.6,
      borderRadius: "10px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.7rem",
      fontWeight: 700,
      lineHeight: 1,
      bgcolor: selected ? "rgba(255,255,255,0.25)" : "#e3f2fd",
      color: selected ? "#fff" : "#1976d2",
    }}
  >
    {count}
  </Box>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="overline"
    sx={{
      fontWeight: 700,
      fontSize: "0.72rem",
      color: "#666",
      letterSpacing: "0.5px",
      display: "block",
      mb: 1,
    }}
  >
    {children}
  </Typography>
);

const EventList = () => {
  const [eventTypes, setEventTypes] = useState<EventTypeDetail[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [sorts, setSorts] = useState<
    Record<number, { field: EventSortColumn; direction: SortDir } | null>
  >({});

  const [categoriesByType, setCategoriesByType] = useState<
    Record<number, EventCategory[]>
  >({});
  const [categoriesLoading, setCategoriesLoading] = useState<
    Record<number, boolean>
  >({});

  const [eventsByCategory, setEventsByCategory] = useState<
    Record<number, CategoryEventsState>
  >({});

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuEvent, setMenuEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- load event types ----------
  useEffect(() => {
    const fetchTypes = async () => {
      setTypesLoading(true);
      try {
        const res = await api.get<ApiResponse<EventTypeDetail[]>>(
          API_ROUTES.EVENT_MANAGEMENT.TYPES,
        );
        setEventTypes(res.data.data);
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
      } finally {
        setTypesLoading(false);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (eventTypes.length && selectedTypeId === null) {
      handleSelectType(eventTypes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypes]);

  const loadCategoriesForType = useCallback(
    async (typeId: number): Promise<EventCategory[]> => {
      setCategoriesLoading((prev) => ({ ...prev, [typeId]: true }));
      try {
        const res = await api.get<ApiResponse<EventCategory[]>>(
          API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_BY_TYPE_ID(typeId),
        );
        setCategoriesByType((prev) => ({ ...prev, [typeId]: res.data.data }));

        return res.data.data;
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
        return [];
      } finally {
        setCategoriesLoading((prev) => ({ ...prev, [typeId]: false }));
      }
    },
    [],
  );

  const handleSelectType = useCallback(
    async (typeId: number) => {
      setSelectedTypeId(typeId);
      const cached = categoriesByType[typeId];
      const categories = cached ?? (await loadCategoriesForType(typeId));
      setSelectedCategoryId(categories.length ? categories[0].id : null);
    },
    [categoriesByType, loadCategoriesForType],
  );

  const handleHeaderClick = (
    categoryId: number,
    columnKey: EventSortColumn,
  ) => {
    setSorts((prevSorts) => {
      const currentSort = prevSorts[categoryId];
      if (currentSort?.field === columnKey) {
        return {
          ...prevSorts,
          [categoryId]: {
            field: columnKey,
            direction: currentSort.direction === "asc" ? "desc" : "asc",
          },
        };
      }
      return {
        ...prevSorts,
        [categoryId]: { field: columnKey, direction: "asc" },
      };
    });
  };

  const getSortIcon = (categoryId: number, column: EventSortColumn) => {
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

  const isSorted = (categoryId: number, column: EventSortColumn) =>
    sorts[categoryId]?.field === column;

  const fetchCategoryEvents = useCallback(
    async (categoryId: number, page: number, pageSize: number) => {
      setEventsByCategory((prev) => ({
        ...prev,
        [categoryId]: {
          items: prev[categoryId]?.items ?? [],
          totalCount: prev[categoryId]?.totalCount ?? 0,
          page,
          pageSize,
          loading: true,
          loaded: prev[categoryId]?.loaded ?? false,
        },
      }));
      try {
        const sortParams = buildSortParams(
          sorts[categoryId] ? [sorts[categoryId]] : [],
        );
        const res = await api.get<ApiResponse<PagedResult<Event>>>(
          API_ROUTES.EVENT.GET_PAGED(categoryId),
          { params: { page: page + 1, pageSize, ...sortParams } },
        );
        setEventsByCategory((prev) => ({
          ...prev,
          [categoryId]: {
            items: res.data.data.items,
            totalCount: res.data.data.totalCount,
            page,
            pageSize,
            loading: false,
            loaded: true,
          },
        }));
      } catch {
        toast.error(MESSAGES.ERROR.FAILED_LOAD_EVENTS);
        setEventsByCategory((prev) => ({
          ...prev,
          [categoryId]: {
            items: prev[categoryId]?.items ?? [],
            totalCount: prev[categoryId]?.totalCount ?? 0,
            page: prev[categoryId]?.page ?? 0,
            pageSize: prev[categoryId]?.pageSize ?? DEFAULT_PAGE_SIZE,
            loading: false,
            loaded: prev[categoryId]?.loaded ?? false,
          },
        }));
      }
    },
    [sorts],
  );

  // load events for whichever category becomes active, if not cached yet
  useEffect(() => {
    if (
      selectedCategoryId !== null &&
      !eventsByCategory[selectedCategoryId]?.loaded
    ) {
      fetchCategoryEvents(selectedCategoryId, 0, DEFAULT_PAGE_SIZE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  // re-fetch page 0 when the sort for the *currently active* category changes
  useEffect(() => {
    if (selectedCategoryId === null) return;
    const state = eventsByCategory[selectedCategoryId];
    if (state?.loaded) {
      fetchCategoryEvents(selectedCategoryId, 0, state.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId !== null ? sorts[selectedCategoryId] : null]);

  const openAddEventModal = () => {
    setModalMode("add");
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditEventModal = (event: Event) => {
    setModalMode("edit");
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleEventSaved = () => {
    handleModalClose();
    if (selectedCategoryId !== null) {
      const state = eventsByCategory[selectedCategoryId];
      fetchCategoryEvents(
        selectedCategoryId,
        state?.page ?? 0,
        state?.pageSize ?? DEFAULT_PAGE_SIZE,
      );
    }
  };

  const handleMenuOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    event: Event,
  ) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setMenuEvent(event);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuEvent(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(API_ROUTES.EVENT.DELETE(deleteTarget.id));
      toast.success(MESSAGES.SUCCESS.EVENT_DELETED);
      const catState = eventsByCategory[deleteTarget.eventCategoryId];
      setDeleteTarget(null);
      if (catState) {
        fetchCategoryEvents(
          deleteTarget.eventCategoryId,
          catState.page,
          catState.pageSize,
        );
      }
    } catch {
      toast.error(MESSAGES.ERROR.EVENT_DELETED);
    } finally {
      setDeleting(false);
    }
  };

  const selectedType = eventTypes.find((t) => t.id === selectedTypeId);
  const categoriesForSelectedType = selectedTypeId
    ? (categoriesByType[selectedTypeId] ?? [])
    : [];
  const selectedCategory = categoriesForSelectedType.find(
    (c) => c.id === selectedCategoryId,
  );

  const eventState =
    selectedCategoryId !== null ? eventsByCategory[selectedCategoryId] : null;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Events
      </Typography>

      {typesLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !eventTypes.length ? (
        <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "#fafafa" }}>
          <Typography color="textSecondary">No event types found.</Typography>
        </Paper>
      ) : (
        <>
          {/* Event Type chips */}
          <SectionLabel>Event Type</SectionLabel>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
            {eventTypes.map((type) => {
              const selected = type.id === selectedTypeId;
              return (
                <Chip
                  key={type.id}
                  clickable
                  onClick={() => handleSelectType(type.id)}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  sx={chipSx(selected)}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <span>{type.name}</span>
                    </Box>
                  }
                />
              );
            })}
          </Box>

          {/* Category chips */}
          {categoriesLoading[selectedTypeId ?? -1] ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : categoriesForSelectedType.length === 0 ? (
            <Typography color="textSecondary" variant="body2" sx={{ mb: 3 }}>
              No categories available for this type.
            </Typography>
          ) : (
            <>
              <SectionLabel>Category</SectionLabel>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {categoriesForSelectedType.map((category) => {
                  const selected = category.id === selectedCategoryId;
                  return (
                    <Chip
                      key={category.id}
                      clickable
                      onClick={() => setSelectedCategoryId(category.id)}
                      color={selected ? "primary" : "default"}
                      variant={selected ? "filled" : "outlined"}
                      sx={chipSx(selected)}
                      label={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                          }}
                        >
                          <span>{category.name}</span>
                          <CountBadge
                            count={category.activeEventCount}
                            selected={selected}
                          />
                        </Box>
                      }
                    />
                  );
                })}
              </Box>
            </>
          )}

          {/* Selected category panel */}
          {selectedCategory && (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
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
                    {selectedType?.name} · {selectedCategory.activeEventCount}{" "}
                    events
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddEventModal}
                  sx={{ textTransform: "none" }}
                >
                  Add event
                </Button>
              </Box>

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
                          onClick={() =>
                            handleHeaderClick(selectedCategory.id, "title")
                          }
                          sx={{
                            py: 1.5,
                            cursor: "pointer",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                            backgroundColor: isSorted(
                              selectedCategory.id,
                              "title",
                            )
                              ? "#e3f2fd"
                              : "transparent",
                            borderLeft: isSorted(selectedCategory.id, "title")
                              ? "3px solid #1976d2"
                              : "3px solid transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: isSorted(
                                selectedCategory.id,
                                "title",
                              )
                                ? "#e3f2fd"
                                : "#f5f5f5",
                              borderLeftColor: "#1976d2",
                            },
                          }}
                        >
                          Event Name
                          {getSortIcon(selectedCategory.id, "title")}
                        </TableCell>

                        <TableCell
                          onClick={() =>
                            handleHeaderClick(selectedCategory.id, "eventDate")
                          }
                          sx={{
                            py: 1.5,
                            cursor: "pointer",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                            backgroundColor: isSorted(
                              selectedCategory.id,
                              "eventDate",
                            )
                              ? "#e3f2fd"
                              : "transparent",
                            borderLeft: isSorted(
                              selectedCategory.id,
                              "eventDate",
                            )
                              ? "3px solid #1976d2"
                              : "3px solid transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: isSorted(
                                selectedCategory.id,
                                "eventDate",
                              )
                                ? "#e3f2fd"
                                : "#f5f5f5",
                              borderLeftColor: "#1976d2",
                            },
                          }}
                        >
                          Date
                          {getSortIcon(selectedCategory.id, "eventDate")}
                        </TableCell>

                        <TableCell sx={{ py: 1.5, whiteSpace: "nowrap" }}>
                          Seats
                        </TableCell>

                        <TableCell
                          onClick={() =>
                            handleHeaderClick(
                              selectedCategory.id,
                              "ticketPrice",
                            )
                          }
                          sx={{
                            py: 1.5,
                            cursor: "pointer",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                            backgroundColor: isSorted(
                              selectedCategory.id,
                              "ticketPrice",
                            )
                              ? "#e3f2fd"
                              : "transparent",
                            borderLeft: isSorted(
                              selectedCategory.id,
                              "ticketPrice",
                            )
                              ? "3px solid #1976d2"
                              : "3px solid transparent",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              backgroundColor: isSorted(
                                selectedCategory.id,
                                "ticketPrice",
                              )
                                ? "#e3f2fd"
                                : "#f5f5f5",
                              borderLeftColor: "#1976d2",
                            },
                          }}
                        >
                          Price
                          {getSortIcon(selectedCategory.id, "ticketPrice")}
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
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {event.title}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2">
                                {new Date(event.eventDate).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
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
                                onClick={(e) => handleMenuOpen(e, event)}
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
                    rowsPerPage={eventState?.pageSize ?? DEFAULT_PAGE_SIZE}
                    rowsPerPageOptions={[5, 10, 25]}
                    onPageChange={(_, newPage) =>
                      fetchCategoryEvents(
                        selectedCategory.id,
                        newPage,
                        eventState?.pageSize ?? DEFAULT_PAGE_SIZE,
                      )
                    }
                    onRowsPerPageChange={(e) =>
                      fetchCategoryEvents(
                        selectedCategory.id,
                        0,
                        parseInt(e.target.value, 10),
                      )
                    }
                  />
                </TableContainer>
              )}
            </Paper>
          )}
        </>
      )}

      {/* Action Menu */}
      <Menu
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (menuEvent) openEditEventModal(menuEvent);
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteTarget(menuEvent);
            handleMenuClose();
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        <EventFormModal
          mode={modalMode}
          eventId={editingEvent?.id}
          typeId={selectedTypeId}
          categoryId={selectedCategoryId}
          onClose={handleModalClose}
          onSave={handleEventSaved}
        />
      </Dialog>

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
        onCancel={() => setDeleteTarget(null)}
        abortButton="Cancel"
        confirmButton="Delete"
      />
    </Box>
  );
};

export default EventList;
