import axios from "axios";
import { API_ROUTES } from "../constants/apiRoutes";
import type { ApiErrorResponse } from "../types";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const apiError = error.response?.data as ApiErrorResponse;

    const isRefreshCall = originalRequest?.url?.includes(
      API_ROUTES.AUTH.REFRESH_TOKEN,
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall &&
      apiError?.errorCode !== "INVALID_CREDENTIALS"
    ) {
      originalRequest._retry = true;

      try {
        await api.post(API_ROUTES.AUTH.REFRESH_TOKEN);
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
