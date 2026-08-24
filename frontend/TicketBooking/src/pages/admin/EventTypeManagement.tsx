import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import type {
  ApiErrorResponse,
  ApiResponse,
  EventCategory,
  EventTypeDetail,
  PastEvent,
} from "../../Common/interface";
import api from "../../Api/axios";
import { API_ROUTES } from "../../Constant/apiRoutes";
import ConfirmDialog from "../Shared/ConfirmDialog";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message || error.message || "An error occurred"
    );
  }
  return "An unexpected error occurred";
};

const EventTypeManagement = () => {
  const theme = useTheme();

  const [eventTypes, setEventTypes] = useState<EventTypeDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState<EventTypeDetail | null>(
    null,
  );

  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeModalLoading, setTypeModalLoading] = useState(false);

  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [selectedTypeForCategories, setSelectedTypeForCategories] =
    useState<EventTypeDetail | null>(null);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");
  const [categoryModalLoading, setCategoryModalLoading] = useState(false);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteConfirmData, setDeleteConfirmData] = useState<{
    type: "type" | "category";
    id: number;
    name: string;
    reason?: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [pastEventsOpen, setPastEventsOpen] = useState(false);
  const [selectedCategoryForPastEvents, setSelectedCategoryForPastEvents] =
    useState<EventCategory | null>(null);
  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [pastEventsLoading, setPastEventsLoading] = useState(false);

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<EventTypeDetail[]>>(
        API_ROUTES.EVENT_MANAGEMENT.TYPES,
      );
      setEventTypes(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (typeId: number) => {
    try {
      setCategoriesLoading(true);
      const response = await api.get<ApiResponse<EventCategory[]>>(
        API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_BY_TYPE_ID(typeId),
      );
      setCategories(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPastEvents = async (categoryId: number) => {
    try {
      setPastEventsLoading(true);
      const response = await api.get<ApiResponse<PastEvent[]>>(
        API_ROUTES.EVENT_MANAGEMENT.PAST_EVENT_BY_CATEGORY(categoryId),
      );
      setPastEvents(response.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setPastEventsLoading(false);
    }
  };

  useEffect(() => {
    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        const response = await api.get<ApiResponse<EventTypeDetail[]>>(
          API_ROUTES.EVENT_MANAGEMENT.TYPES,
        );
        setEventTypes(response.data.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventTypes();
  }, []);

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
    if (!typeName.trim()) {
      toast.error("Type name cannot be empty");
      return;
    }

    try {
      setTypeModalLoading(true);
      const payload = { name: typeName };

      if (editingTypeId) {
        await api.put(
          API_ROUTES.EVENT_MANAGEMENT.TYPES_ID(editingTypeId),
          payload,
        );
        toast.success("Event type updated successfully");
      } else {
        await api.post(API_ROUTES.EVENT_MANAGEMENT.TYPES, payload);
        toast.success("Event type created successfully");
      }

      handleCloseTypeModal();
      fetchEventTypes();
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setTypeModalLoading(false);
    }
  };

  const handleOpenManageCategories = (type: EventTypeDetail) => {
    setSelectedTypeForCategories(type);
    setManageCategoriesOpen(true);
    fetchCategories(type.id);
    handleCloseMenu();
  };

  const handleCloseManageCategories = () => {
    setManageCategoriesOpen(false);
    setSelectedTypeForCategories(null);
    setCategories([]);
  };

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
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (!selectedTypeForCategories) return;

    try {
      setCategoryModalLoading(true);
      const payload = {
        name: categoryName,
        eventTypeId: selectedTypeForCategories.id,
      };

      if (editingCategoryId) {
        await api.put(
          API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_ID(editingCategoryId),
          payload,
        );
        toast.success("Category updated successfully");
      } else {
        await api.post(API_ROUTES.EVENT_MANAGEMENT.CATEGORIES, payload);
        toast.success("Category created successfully");
        fetchEventTypes();
      }

      handleCloseCategoryModal();
      fetchCategories(selectedTypeForCategories.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
    } finally {
      setCategoryModalLoading(false);
    }
  };

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

    try {
      setDeleteLoading(true);
      const endpoint =
        deleteConfirmData.type === "type"
          ? API_ROUTES.EVENT_MANAGEMENT.TYPES_ID(deleteConfirmData.id)
          : API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_ID(deleteConfirmData.id);

      const response = await api.delete<ApiResponse<null>>(endpoint);

      toast.success(response.data.message);
      setDeleteConfirmOpen(false);
      setDeleteConfirmData(null);

      if (deleteConfirmData.type === "type") {
        fetchEventTypes();
      } else if (selectedTypeForCategories) {
        fetchCategories(selectedTypeForCategories.id);
        fetchEventTypes();
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorCode = axiosError.response?.data?.errorCode;
      const errorMsg = getErrorMessage(error);

      if (
        errorCode === "ACTIVE_EVENTS_EXIST" ||
        errorCode === "CATEGORIES_EXIST"
      ) {
        toast.error(`${errorMsg} - Page state has changed. Refreshing...`);
        if (selectedTypeForCategories) {
          fetchCategories(selectedTypeForCategories.id);
        }
      } else {
        toast.error(errorMsg);
      }

      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPastEvents = async (category: EventCategory) => {
    setSelectedCategoryForPastEvents(category);
    setPastEventsOpen(true);
    await fetchPastEvents(category.id);
  };

  const handleClosePastEvents = () => {
    setPastEventsOpen(false);
    setSelectedCategoryForPastEvents(null);
    setPastEvents([]);
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

      <Dialog
        open={typeModalOpen}
        onClose={handleCloseTypeModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingTypeId ? "Edit Event Type" : "Create Event Type"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Type Name"
            margin="dense"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            placeholder="e.g., Concert, Theater, Sports"
            disabled={typeModalLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypeModal} disabled={typeModalLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveType}
            variant="contained"
            disabled={typeModalLoading || !typeName.trim()}
          >
            {typeModalLoading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={manageCategoriesOpen}
        onClose={handleCloseManageCategories}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Manage Categories: {selectedTypeForCategories?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {categoriesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {categories.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
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
                            onClick={() => handleOpenCategoryModal(category)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {category.pastEventCount > 0 && (
                          <Tooltip title="View past events">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewPastEvents(category)}
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
                              onClick={() => handleDeleteCategory(category)}
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
            onClick={() => handleOpenCategoryModal()}
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
          <Button onClick={handleCloseManageCategories}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingCategoryId ? "Edit Category" : "Create Category"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Category Name"
            margin="dense"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Live Performance, Theater Show"
            disabled={categoryModalLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseCategoryModal}
            disabled={categoryModalLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            disabled={categoryModalLoading || !categoryName.trim()}
          >
            {categoryModalLoading ? <CircularProgress size={24} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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
      <Dialog
        open={pastEventsOpen}
        onClose={handleClosePastEvents}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Past Events: {selectedCategoryForPastEvents?.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {pastEventsLoading ? (
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
          <Button onClick={handleClosePastEvents}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventTypeManagement;
