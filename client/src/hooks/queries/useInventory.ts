import { useQuery } from "@tanstack/react-query";

import { inventoryApi } from "@/api/endpoints/inventory.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { TableParams } from "@/types/api";

/** All warehouses */
export function useWarehouses() {
  return useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES],
    queryFn: () => inventoryApi.warehouses(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Stock levels for a specific warehouse */
export function useStockLevels(warehouseId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_LEVELS, warehouseId],
    queryFn: () => inventoryApi.stockLevels(warehouseId!),
    enabled: !!warehouseId,
  });
}

/** Paginated stock moves (transfers, adjustments) */
export function useStockMoves(params?: Partial<TableParams>) {
  return useQuery({
    queryKey: [QUERY_KEYS.STOCK_MOVES, params],
    queryFn: () => inventoryApi.stockMoves(params),
  });
}
