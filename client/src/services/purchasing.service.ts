import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  PurchaseOrder,
  PurchaseOrderRow,
  PurchaseOrderSummary,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderFilterParams,
} from "@/types/modules/purchasing";

// ─── Purchase Orders ──────────────────────────────────────────────────────

export const purchaseOrdersService = {
  list: (params?: Partial<PurchaseOrderFilterParams>) =>
    apiClient
      .get<PaginatedResponse<PurchaseOrderRow>>("/purchase-orders", { params })
      .then(r => r.data),

  summary: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<PurchaseOrderSummary>>("/purchase-orders/summary", {
        params,
      })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`)
      .then(r => r.data.data),

  create: (dto: CreatePurchaseOrderDto) =>
    apiClient
      .post<ApiResponse<PurchaseOrder>>("/purchase-orders", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdatePurchaseOrderDto) =>
    apiClient
      .put<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}`, dto)
      .then(r => r.data.data),

  confirm: (id: string) =>
    apiClient
      .post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/confirm`)
      .then(r => r.data.data),

  createReceipt: (id: string, dto?: Record<string, unknown>) =>
    apiClient
      .post<
        ApiResponse<PurchaseOrder>
      >(`/purchase-orders/${id}/create-receipt`, dto || {})
      .then(r => r.data.data),

  createBill: (id: string, dto?: Record<string, unknown>) =>
    apiClient
      .post<
        ApiResponse<PurchaseOrder>
      >(`/purchase-orders/${id}/create-bill`, dto || {})
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<PurchaseOrder>>(`/purchase-orders/${id}/cancel`)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/purchase-orders/${id}`)
      .then(r => r.data),
};
