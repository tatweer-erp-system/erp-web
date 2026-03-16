import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inventoryApi } from "@/api/endpoints/inventory.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

type CreateTransferDto = {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  lines: { productId: string; quantity: number }[];
  notes?: string;
};

/** Create a stock transfer between warehouses */
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTransferDto) => inventoryApi.createTransfer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_MOVES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_LEVELS] });
    },
  });
}
