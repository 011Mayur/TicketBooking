import api from "../Api/axios";
import { type ApiResponse, type LoginResponse } from "../Common/interface";
import { API_ROUTES } from "../Constant/apiRoutes";
import type { LoginFormValues } from "../zodSchema/loginSchema";

export const userLogin = async (data: LoginFormValues) => {
  const response = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, data);

  return response.data;
};

export const userLogout = async()=>{
  const response = await api.post<ApiResponse<null>>(API_ROUTES.AUTH.LOGOUT);
  return response.data;
}
