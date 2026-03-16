/**
 * Shared API response types used across all modules.
 * Mirrors the backend envelope structure.
 */

/** Standard API success envelope */
export type ApiResponse<T> = {
  data: T;
  message?: string;
  success: boolean;
};

/** Structured API error returned by the backend */
export type ApiError = {
  message: string;
  code: string;
  field?: string;
  status: number;
};

/** Paginated list response from the backend */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Sort direction for list queries */
export type SortOrder = "asc" | "desc";

/** Params sent to any paginated list endpoint */
export type ListParams = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  filters?: Record<string, string | number | boolean>;
};
