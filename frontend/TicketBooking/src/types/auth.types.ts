import type { Role } from "./common.types";

export interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<string>;
}

export interface LoginResponse {
  message: string;
  userId: number;
  role: Role;
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
