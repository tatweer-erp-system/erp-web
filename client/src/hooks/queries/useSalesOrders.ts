import { useQuery } from "@tanstack/react-query";

import {
  getSalesOrders,
  getSalesOrder,
  getSalesSummary,
} from "@/api/endpoints/sales-orders.api";
import { queryKeys } from "@/shared/constants/query-keys";
import { useBranchStore } from "@/stores/branch.store";
import type { SalesOrderFilterParams } from "@/types/modules/sales";
import { SalesOrderStatus } from "@/types/modules/sales";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the active branch ID from the store, used in every query key */
function useActiveBranchId(): string | null {
  return useBranchStore(s => s.activeBranch?.id ?? null);
}

// ─── Sales Orders ───────────────────────────────────────────────────────────

/** Paginated list of sales orders with optional search, status, date filters */
export function useSalesOrders(params?: SalesOrderFilterParams) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.saleOrders.list({ ...params, branchId })],
    queryFn: () => getSalesOrders(params),
    enabled: !!branchId,
  });
}

/** Single sales order detail (includes lines), disabled when id is undefined */
export function useSalesOrder(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.saleOrders.detail(id!), branchId],
    queryFn: () => getSalesOrder(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

// ─── Quotations ─────────────────────────────────────────────────────────────

/** Paginated list of quotations (draft sales orders) with independent cache */
export function useQuotations(params?: Omit<SalesOrderFilterParams, "status">) {
  const branchId = useActiveBranchId();
  const quotationParams: SalesOrderFilterParams = {
    ...params,
    status: SalesOrderStatus.DRAFT,
  };

  return useQuery({
    queryKey: [
      ...queryKeys.saleOrders.quotationList({ ...quotationParams, branchId }),
    ],
    queryFn: () => getSalesOrders(quotationParams),
    enabled: !!branchId,
  });
}

/** Single quotation detail by ID, disabled when id is undefined */
export function useQuotation(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.saleOrders.quotationDetail(id!), branchId],
    queryFn: () => getSalesOrder(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

// ─── Sales Summary ──────────────────────────────────────────────────────────

/** Summary report params (date range) */
type SalesSummaryParams = {
  dateFrom?: string;
  dateTo?: string;
};

/** Sales summary/statistics report for the active branch */
export function useSalesSummary(params?: SalesSummaryParams) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: ["sale-orders", "summary", { ...params, branchId }],
    queryFn: () =>
      getSalesSummary({ ...params, branchId: branchId ?? undefined }),
    enabled: !!branchId,
  });
}
