import { useQuery } from "@tanstack/react-query";

import {
  getPricelists,
  getPricelist,
  getPricelistItems,
  computePrice,
  getPricelistSummary,
} from "@/api/endpoints/pricelists.api";
import { queryKeys } from "@/shared/constants/query-keys";
import { useBranchStore } from "@/stores/branch.store";
import type {
  PricelistFilterParams,
  ComputePriceParams,
} from "@/types/modules/pricelists";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the active branch ID from the store, used in every query key */
function useActiveBranchId(): string | null {
  return useBranchStore(s => s.activeBranch?.id ?? null);
}

// ─── Pricelists ─────────────────────────────────────────────────────────────

/** Paginated list of pricelists with optional search filters */
export function usePricelists(params?: PricelistFilterParams) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.pricelists.list({ ...params, branchId })],
    queryFn: () => getPricelists(params),
    enabled: !!branchId,
  });
}

/** Single pricelist detail, disabled when id is undefined */
export function usePricelist(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.pricelists.detail(id!), branchId],
    queryFn: () => getPricelist(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

// ─── Pricelist Items ────────────────────────────────────────────────────────

/** All items for a specific pricelist */
export function usePricelistItems(pricelistId: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.pricelists.items(pricelistId!), branchId],
    queryFn: () => getPricelistItems(pricelistId!),
    select: res => res.data,
    enabled: !!pricelistId && !!branchId,
  });
}

// ─── Pricelist Summary ──────────────────────────────────────────────────────

/** Pricelist summary stats for KPI cards */
export function usePricelistSummary() {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: ["pricelists", "summary", branchId],
    queryFn: () => getPricelistSummary(),
    enabled: !!branchId,
  });
}

// ─── Compute Price ──────────────────────────────────────────────────────────

/** Compute the effective price of a product for a given pricelist and quantity */
export function useComputePrice(
  params: ComputePriceParams | undefined,
  enabled = true
) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [
      ...queryKeys.pricelists.computePrice({
        ...params,
        branchId,
      }),
    ],
    queryFn: () => computePrice(params!),
    select: res => res.data,
    enabled:
      !!params?.pricelistId && !!params?.productId && !!branchId && enabled,
  });
}
