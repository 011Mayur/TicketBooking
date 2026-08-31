import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  useTheme,
  Typography,
  Container,
  Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ManageIcon from "@mui/icons-material/Settings";

import type { EventCategory, EventTypeDetail } from "../../types";
import ConfirmDialog from "../shared/ConfirmDialog";
import { useEventTypeManagement } from "../../hooks/admin/useEventTypeManagement";
import EventTypeFormDialog from "../../components/admin/EventTypeFormDialog";
import ManageCategoriesDialog from "../../components/admin/ManageCategoriesDialog";
import CategoryFormDialog from "../../components/admin/CategoryFormDialog";
import PastEventsDialog from "../../components/admin/PastEventsDialog";

const EventTypeManagement = () => {
  const theme = useTheme();

  const {
    eventTypes,
    loading,
    categories,
    categoriesLoading,
    pastEvents,
    pastEventsLoading,
    deleteLoading,
    typeModalLoading,
    categoryModalLoading,
    fetchCategories,
    fetchPastEvents,
    saveType,
    saveCategory,
    confirmDelete,
  } = useEventTypeManagement();

  // ── Context menu ──
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState<EventTypeDetail | null>(null);

  // ── Event Type modal ──
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState("");

  // ── Manage Categories dialog ──
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedTypeForCategories, setSelectedTypeForCategories] =
    useState<EventTypeDetail | null>(null);

  // ── Category modal ──
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // ── Delete confirm ──
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    type: "type" | "category";
    id: number;
    name: string;
    reason?: string;
  } | null>(null);

  // ── Past events dialog ──
  const [pastEventsOpen, setPastEventsOpen] = useState(false);
  const [selectedCategoryForPastEvents, setSelectedCategoryForPastEvents] =
    useState<EventCategory | null>(null);

  // ── Menu handlers ──
  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    type: EventTypeDetail,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedType(type);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedType(null);
  };

  // ── Type modal handlers ──
  const handleOpenTypeModal = (type?: EventTypeDetail) => {
    if (type) {
      setEditingTypeId(type.id);
      setTypeName(type.name);
    } else {
      setEditingTypeId(null);
      setTypeName("");
    }
    setTypeModalOpen(true);
  };

  const handleCloseTypeModal = () => {
    setTypeModalOpen(false);
    setEditingTypeId(null);
    setTypeName("");
  };

  const handleSaveType = async () => {
    const ok = await saveType(typeName, editingTypeId);
    if (ok) handleCloseTypeModal();
  };

  // ── Manage Categories handlers ──
  const handleOpenManageCategories = (type: EventTypeDetail) => {
    setSelectedTypeForCategories(type);
    setManageCategoriesOpen(true);
    fetchCategories(type.id);
    handleCloseMenu();
  };

  const handleCloseManageCategories = () => {
    setManageCategoriesOpen(false);
    setSelectedTypeForCategories(null);
  };

  // ── Category modal handlers ──
  const handleOpenCategoryModal = (category?: EventCategory) => {
    if (category) {
      setEditingCategoryId(category.id);
      setCategoryName(category.name);
    } else {
      setEditingCategoryId(null);
      setCategoryName("");
    }
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryName("");
  };

  const handleSaveCategory = async () => {
    if (!selectedTypeForCategories) return;
    const ok = await saveCategory(
      categoryName,
      selectedTypeForCategories.id,
      editingCategoryId,
    );
    if (ok) handleCloseCategoryModal();
  };

  // ── Delete handlers ──
  const handleDeleteType = (type: EventTypeDetail) => {
    setDeleteConfirmData({
      type: "type",
      id: type.id,
      name: type.name,
      reason: type.deletionReason,
    });
    setDeleteConfirmOpen(true);
    handleCloseMenu();
  };

  const handleDeleteCategory = (category: EventCategory) => {
    setDeleteConfirmData({
      type: "category",
      id: category.id,
      name: category.name,
      reason: category.deletionReason,
    });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmData) return;
    const ok = await confirmDelete(deleteConfirmData, selectedTypeForCategories);
    if (ok) {
      setDeleteConfirmOpen(false);
      setDeleteConfirmData(null);
    }
  };

  // ── Past events handlers ──
  const handleViewPastEvents = async (category: EventCategory) => {
    setSelectedCategoryForPastEvents(category);
    setPastEventsOpen(true);
    await fetchPastEvents(category.id);
  };

  const handleClosePastEvents = () => {
    setPastEventsOpen(false);
    setSelectedCategoryForPastEvents(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Event Type Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenTypeModal()}
        >
          Add Type
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: theme.palette.grey[100] }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Categories
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No event types found. Create one to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                eventTypes.map((type) => (
                  <TableRow key={type.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>
                        {type.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={type.categoryCount} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="More actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenMenu(e, type)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => selectedType && handleOpenTypeModal(selectedType)}
        >
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedType && handleOpenManageCategories(selectedType)
          }
        >
          <ManageIcon sx={{ mr: 1, fontSize: 18 }} />
          Manage Categories
        </MenuItem>
        <MenuItem
          disabled={!selectedType?.canDelete}
          onClick={() => selectedType && handleDeleteType(selectedType)}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
        {!selectedType?.canDelete && (
          <Typography variant="caption" sx={{ px: 2, py: 1, display: "block" }}>
            {selectedType?.deletionReason}
          </Typography>
        )}
      </Menu>

      {/* Extracted dialogs */}
      <EventTypeFormDialog
        open={typeModalOpen}
        editingTypeId={editingTypeId}
        typeName={typeName}
        loading={typeModalLoading}
        onNameChange={setTypeName}
        onClose={handleCloseTypeModal}
        onSave={handleSaveType}
      />

      <ManageCategoriesDialog
        open={manageCategoriesOpen}
        selectedType={selectedTypeForCategories}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onClose={handleCloseManageCategories}
        onAddCategory={() => handleOpenCategoryModal()}
        onEditCategory={handleOpenCategoryModal}
        onDeleteCategory={handleDeleteCategory}
        onViewPastEvents={handleViewPastEvents}
      />

      <CategoryFormDialog
        open={categoryModalOpen}
        editingCategoryId={editingCategoryId}
        categoryName={categoryName}
        loading={categoryModalLoading}
        onNameChange={setCategoryName}
        onClose={handleCloseCategoryModal}
        onSave={handleSaveCategory}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Confirm Delete"
        message={
          deleteConfirmData
            ? `${deleteConfirmData.reason ?? "Are you sure you want to delete this item?"} "${deleteConfirmData.name}" will be permanently deleted.`
            : ""
        }
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
        abortButton="Cancel"
        confirmButton="Delete"
      />

      <PastEventsDialog
        open={pastEventsOpen}
        selectedCategory={selectedCategoryForPastEvents}
        pastEvents={pastEvents}
        loading={pastEventsLoading}
        onClose={handleClosePastEvents}
      />
    </Container>
  );
};

export default EventTypeManagement;
