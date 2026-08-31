import api from "../api/axios";
import type { ApiResponse, LoginResponse, CurrentUser } from "../types";
import { API_ROUTES } from "../constants/apiRoutes";
import type { LoginFormValues } from "../zodSchema/loginSchema";

export const userLogin = async (data: LoginFormValues) => {
  const response = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);
  return response.data;
};

export const userLogout = async () => {
  const response = await api.post<ApiResponse<null>>(API_ROUTES.AUTH.LOGOUT);
  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const response = await api.get<ApiResponse<CurrentUser>>(
    API_ROUTES.AUTH.CURRENT_USER,
  );
  return response.data.data;
};
