import { useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export interface PaginationState {
  page: number;
  limit: number;
}

export function usePagination(initialLimit = DEFAULT_PAGE_SIZE) {
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: initialLimit });

  const goToPage = (page: number) => setPagination((p) => ({ ...p, page }));
  const setLimit = (limit: number) => setPagination({ page: 1, limit });
  const reset = () => setPagination({ page: 1, limit: initialLimit });

  return { pagination, setPagination, goToPage, setLimit, reset };
}
