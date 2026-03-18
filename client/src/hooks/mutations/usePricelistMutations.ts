import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPricelist,
  updatePricelist,
  deletePricelist,
  createPricelistItem,
  updatePricelistItem,
  deletePricelistItem,
} from "@/api/endpoints/pricelists.api";
import { queryKeys } from "@/shared/constants/query-keys";
import type {
  CreatePricelistInput,
  UpdatePricelistInput,
  CreatePricelistItemInput,
  UpdatePricelistItemInput,
} from "@/types/modules/pricelists";

// ─── Pricelist CRUD ─────────────────────────────────────────────────────────

/** Create a new pricelist */
export function useCreatePricelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePricelistInput) => createPricelist(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricelists.all });
    },
  });
}

/** Update a pricelist */
export function useUpdatePricelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePricelistInput }) =>
      updatePricelist(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricelists.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.detail(id),
      });
    },
  });
}

/** Soft-delete a pricelist */
export function useDeletePricelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePricelist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pricelists.all });
    },
  });
}

// ─── Pricelist Item CRUD ────────────────────────────────────────────────────

/** Add an item to a pricelist */
export function useCreatePricelistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pricelistId,
      dto,
    }: {
      pricelistId: string;
      dto: CreatePricelistItemInput;
    }) => createPricelistItem(pricelistId, dto),
    onSuccess: (_data, { pricelistId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.items(pricelistId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.detail(pricelistId),
      });
    },
  });
}

/** Update a pricelist item */
export function useUpdatePricelistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      pricelistId: _pricelistId,
      dto,
    }: {
      itemId: string;
      pricelistId: string;
      dto: UpdatePricelistItemInput;
    }) => updatePricelistItem(itemId, dto),
    onSuccess: (_data, { pricelistId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.items(pricelistId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.detail(pricelistId),
      });
    },
  });
}

/** Delete a pricelist item */
export function useDeletePricelistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      pricelistId: _pricelistId,
    }: {
      itemId: string;
      pricelistId: string;
    }) => deletePricelistItem(itemId),
    onSuccess: (_data, { pricelistId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.items(pricelistId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.pricelists.detail(pricelistId),
      });
    },
  });
}
