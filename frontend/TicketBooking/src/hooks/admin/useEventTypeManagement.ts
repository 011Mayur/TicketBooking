import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import api from "../../api/axios";
import { API_ROUTES } from "../../constants/apiRoutes";
import { getErrorMessage } from "../../utils/errorUtils";
import type {
  ApiErrorResponse,
  ApiResponse,
  EventCategory,
  EventTypeDetail,
  PastEvent,
} from "../../types";

export function useEventTypeManagement() {
  const [eventTypes, setEventTypes] = useState<EventTypeDetail[]>([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [pastEvents, setPastEvents] = useState<PastEvent[]>([]);
  const [pastEventsLoading, setPastEventsLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [typeModalLoading, setTypeModalLoading] = useState(false);
  const [categoryModalLoading, setCategoryModalLoading] = useState(false);

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
    fetchEventTypes();
  }, []);

  const saveType = async (
    typeName: string,
    editingTypeId: number | null,
  ): Promise<boolean> => {
    if (!typeName.trim()) {
      toast.error("Type name cannot be empty");
      return false;
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
      fetchEventTypes();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
      return false;
    } finally {
      setTypeModalLoading(false);
    }
  };

  const saveCategory = async (
    categoryName: string,
    typeId: number,
    editingCategoryId: number | null,
  ): Promise<boolean> => {
    if (!categoryName.trim()) {
      toast.error("Category name cannot be empty");
      return false;
    }
    try {
      setCategoryModalLoading(true);
      const payload = { name: categoryName, eventTypeId: typeId };
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
      await fetchCategories(typeId);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      console.error(error);
      return false;
    } finally {
      setCategoryModalLoading(false);
    }
  };

  const confirmDelete = async (
    deleteData: { type: "type" | "category"; id: number; name: string },
    selectedTypeForCategories: EventTypeDetail | null,
  ): Promise<boolean> => {
    try {
      setDeleteLoading(true);
      const endpoint =
        deleteData.type === "type"
          ? API_ROUTES.EVENT_MANAGEMENT.TYPES_ID(deleteData.id)
          : API_ROUTES.EVENT_MANAGEMENT.CATEGORIES_ID(deleteData.id);

      const response = await api.delete<ApiResponse<null>>(endpoint);
      toast.success(response.data.message);

      if (deleteData.type === "type") {
        fetchEventTypes();
      } else if (selectedTypeForCategories) {
        fetchCategories(selectedTypeForCategories.id);
        fetchEventTypes();
      }
      return true;
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
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  return {
    // data
    eventTypes,
    loading,
    categories,
    categoriesLoading,
    pastEvents,
    pastEventsLoading,
    deleteLoading,
    typeModalLoading,
    categoryModalLoading,
    // actions
    fetchCategories,
    fetchPastEvents,
    saveType,
    saveCategory,
    confirmDelete,
  };
}
