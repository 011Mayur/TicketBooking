export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: string;
  errors?: Record<string, string[]>;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
}
