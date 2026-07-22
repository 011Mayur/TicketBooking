import type { Role } from "./types";

export interface LoginResponse {
  message: string;
  userId: number;
  role: Role;
}

export interface ApiErrorResponse {
  field?: string;
  message: string;
}