import { useState } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Menu,
  MenuItem,
  Dialog,
} from "@mui/material";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { API_ROUTES } from "../../constants/apiRoutes";
import { MESSAGES } from "../../constants/messages";
import ConfirmDialog from "../shared/ConfirmDialog";

import type { Event } from "../../types";
import EventFormModal from "./EventFormModal";
import { useEventList } from "../../hooks/admin/useEventList";
import EventTypeChips from "../../components/admin/EventTypeChips";
import EventCategoryChips from "../../components/admin/EventCategoryChips";
import EventTableSection from "../../components/admin/EventTableSection";

const EventList = () => {
  const {
    eventTypes,
    typesLoading,
    selectedTypeId,
    selectedCategoryId,
    categoriesForSelectedType,
    categoriesLoading,
    selectedType,
    selectedCategory,
    eventState,
    sorts,
    handleSelectType,
    setSelectedCategoryId,
    handleHeaderClick,
    fetchCategoryEvents,
    DEFAULT_PAGE_SIZE,
  } = useEventList();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuEvent, setMenuEvent] = useState<Event | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const state = eventState;
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
      const catState = eventState;
      setDeleteTarget(null);
      if (catState && selectedCategoryId !== null) {
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
          <EventTypeChips
            eventTypes={eventTypes}
            selectedTypeId={selectedTypeId}
            onSelectType={handleSelectType}
          />

          <EventCategoryChips
            categories={categoriesForSelectedType}
            selectedCategoryId={selectedCategoryId}
            categoriesLoading={categoriesLoading[selectedTypeId ?? -1] ?? false}
            onSelectCategory={setSelectedCategoryId}
          />

          {selectedCategory && (
            <EventTableSection
              selectedType={selectedType}
              selectedCategory={selectedCategory}
              eventState={eventState}
              sorts={sorts}
              defaultPageSize={DEFAULT_PAGE_SIZE}
              onAddEvent={openAddEventModal}
              onMenuOpen={handleMenuOpen}
              onHeaderClick={handleHeaderClick}
              onFetchEvents={fetchCategoryEvents}
            />
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
          typeName={selectedType?.name}
          categoryName={selectedCategory?.name}
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
