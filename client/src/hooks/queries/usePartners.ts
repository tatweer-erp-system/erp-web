import { useQuery } from "@tanstack/react-query";

import { partnersApi } from "@/api/endpoints/partners.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** Paginated partner (customer/vendor) list */
export function usePartners(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.PARTNERS, params],
    queryFn: () => partnersApi.list(params),
  });
}

/** Single partner by ID */
export function usePartner(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.PARTNERS, id],
    queryFn: () => partnersApi.get(id!),
    enabled: !!id,
  });
}
