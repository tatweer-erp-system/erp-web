import { useQuery } from "@tanstack/react-query";

import { productsService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** Paginated product list with optional filters */
export function useProducts(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, params],
    queryFn: () => productsService.list(params),
  });
}

/** Single product by ID */
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, id],
    queryFn: () => productsService.get(id!),
    enabled: !!id,
  });
}
