import api from "../Api/axios";
import type { ApiResponse, EventDetail, PosterImageUrl } from "../Common/interface";
import { API_ROUTES } from "../Constant/apiRoutes";

export const uploadPoster = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<ApiResponse<PosterImageUrl>>(
    API_ROUTES.EVENT.UPLOAD_POSTER,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.data;
};

export const getEventDetail = async (eventId: string): Promise<EventDetail> => {
  const response = await api.get<ApiResponse<EventDetail>>(
    API_ROUTES.EVENTBOOKING.EVENT(eventId),
  );
  return response.data.data;
};