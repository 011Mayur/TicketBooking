import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { API_ROUTES } from "../../constants/apiRoutes";
import { MESSAGES } from "../../constants/messages";
import { buildSortParams } from "../../utils/sortParams";
import type {
  ApiResponse,
  Event,
  EventCategory,
  EventTypeDetail,
  PagedResult,
} from "../../types";
import type { EventSortColumn, SortDir } from "../../types";

export interface CategoryEventsState {
  items: Event[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading: boolean;
  loaded: boolean;
}

const DEFAULT_PAGE_SIZE = 5;

export function useEventList() {
  const [eventTypes, setEventTypes] = useState<EventTypeDetail[]>([]);
  const [typesLoading, setTypesLoading] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  // Auto-select first type once loaded
  useEffect(() => {
    if (eventTypes.length && selectedTypeId === null) {
      handleSelectType(eventTypes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypes]);

  const handleHeaderClick = (categoryId: number, columnKey: EventSortColumn) => {
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

  // Load events for whichever category becomes active, if not cached yet
  useEffect(() => {
    if (
      selectedCategoryId !== null &&
      !eventsByCategory[selectedCategoryId]?.loaded
    ) {
      fetchCategoryEvents(selectedCategoryId, 0, DEFAULT_PAGE_SIZE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  // Re-fetch page 0 when the sort for the currently active category changes
  useEffect(() => {
    if (selectedCategoryId === null) return;
    const state = eventsByCategory[selectedCategoryId];
    if (state?.loaded) {
      fetchCategoryEvents(selectedCategoryId, 0, state.pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId !== null ? sorts[selectedCategoryId] : null]);

  const categoriesForSelectedType = selectedTypeId
    ? (categoriesByType[selectedTypeId] ?? [])
    : [];

  const selectedType = eventTypes.find((t) => t.id === selectedTypeId);
  const selectedCategory = categoriesForSelectedType.find(
    (c) => c.id === selectedCategoryId,
  );
  const eventState =
    selectedCategoryId !== null ? eventsByCategory[selectedCategoryId] : null;

  return {
    // data
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
    // actions
    handleSelectType,
    setSelectedCategoryId,
    handleHeaderClick,
    fetchCategoryEvents,
    DEFAULT_PAGE_SIZE,
  };
}
