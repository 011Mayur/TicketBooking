import api from "./axios";
import { API_ROUTES } from "../Constant/apiRoutes";
import type { ApiResponse, CurrentUser } from "../Common/interface";

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<ApiResponse<CurrentUser>>(
    API_ROUTES.AUTH.CURRENT_USER,
  );
  return response.data.data;
};

