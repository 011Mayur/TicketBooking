import { API_ROUTES } from "../constants/apiRoutes";
import type {
  ApiResponse,
  EventTypeDetail,
  HomePageEvent,
  PaginatedResponse,
} from "../types";
import api from "../api/axios";

export const homeService = {
  getEvents: async (page: number, typeId: number | null) => {
    const response = await api.get<ApiResponse<PaginatedResponse<HomePageEvent>>>(
      API_ROUTES.HOME.GET_ALL_EVENTS,
      { params: { page, typeId: typeId ?? undefined } },
    );
    return response.data.data;
  },

  searchEvents: async (searchQuery: string, page: number, typeId: number | null) => {
    const response = await api.get<ApiResponse<PaginatedResponse<HomePageEvent>>>(
      API_ROUTES.HOME.SEARCH_EVENTS,
      { params: { searchQuery, page, typeId: typeId ?? undefined } },
    );
    return response.data.data;
  },

  getEventTypes: async () => {
    const response = await api.get<ApiResponse<EventTypeDetail[]>>(
      API_ROUTES.HOME.GET_EVENT_TYPES,
    );
    return response.data.data;
  },
};