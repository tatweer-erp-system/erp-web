/**
 * Pagination metadata and result wrapper.
 * Used by hooks and components that render paginated tables.
 */

/** Pagination metadata returned alongside a paginated list */
export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Generic paginated result combining items with pagination meta */
export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};
