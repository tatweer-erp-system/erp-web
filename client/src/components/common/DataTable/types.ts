export type { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";

export interface PaginationState {
  pageIndex: number;  // 0-based
  pageSize: number;
}
