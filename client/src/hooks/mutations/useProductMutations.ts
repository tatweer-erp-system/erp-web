import { useMutation, useQueryClient } from "@tanstack/react-query";

import { productsService } from "@/services/inventory.service";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type {
  CreateProductDto,
  UpdateProductDto,
} from "@/types/modules/inventory";

/** Create a new product */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
}

/** Update an existing product */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      productsService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
}

/** Delete a product */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: (_data, id) => {
      // Remove detail query so it doesn't refetch the now-deleted product
      queryClient.removeQueries({
        queryKey: [QUERY_KEYS.PRODUCTS, "detail", id],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
    },
  });
}
