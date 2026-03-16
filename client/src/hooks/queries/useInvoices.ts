import { useQuery } from "@tanstack/react-query";

import { invoicesApi } from "@/api/endpoints/invoices.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** Paginated invoice list with optional filters */
export function useInvoices(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICES, params],
    queryFn: () => invoicesApi.list(params),
  });
}

/** Single invoice by ID */
export function useInvoice(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICES, id],
    queryFn: () => invoicesApi.get(id!),
    enabled: !!id,
  });
}
