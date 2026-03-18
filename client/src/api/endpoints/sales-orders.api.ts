import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  SalesOrder,
  SalesOrderRow,
  SalesOrderLine,
  SalesOrderFilterParams,
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  CreateSalesOrderLineInput,
  UpdateSalesOrderLineInput,
  CreateInvoiceFromSOInput,
} from "@/types/modules/sales";

// ─── Sales Orders CRUD ──────────────────────────────────────────────────────

/** Fetch a paginated list of sales orders with optional filters */
export function getSalesOrders(params?: SalesOrderFilterParams) {
  return apiClient
    .get<PaginatedResponse<SalesOrderRow>>("/sales/orders", { params })
    .then(r => r.data);
}

/** Fetch a single sales order by ID (includes lines) */
export function getSalesOrder(id: string) {
  return apiClient
    .get<ApiResponse<SalesOrder>>(`/sales/orders/${id}`)
    .then(r => r.data);
}

/** Create a new draft sales order */
export function createSalesOrder(data: CreateSalesOrderInput) {
  return apiClient
    .post<ApiResponse<SalesOrder>>("/sales/orders", data)
    .then(r => r.data);
}

/** Update a draft sales order */
export function updateSalesOrder(id: string, data: UpdateSalesOrderInput) {
  return apiClient
    .put<ApiResponse<SalesOrder>>(`/sales/orders/${id}`, data)
    .then(r => r.data);
}

/** Soft-delete a draft sales order */
export function deleteSalesOrder(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/sales/orders/${id}`)
    .then(r => r.data);
}

// ─── Sales Order Actions ────────────────────────────────────────────────────

/** Confirm a draft sales order — locks exchange rate, reserves stock */
export function confirmSalesOrder(id: string) {
  return apiClient
    .post<ApiResponse<SalesOrder>>(`/sales/orders/${id}/confirm`)
    .then(r => r.data);
}

/** Cancel a sales order (draft or confirmed, no linked invoices/deliveries) */
export function cancelSalesOrder(id: string) {
  return apiClient
    .post<ApiResponse<SalesOrder>>(`/sales/orders/${id}/cancel`)
    .then(r => r.data);
}

/** Create an invoice from a sales order */
export function createInvoiceFromSO(
  id: string,
  data: CreateInvoiceFromSOInput
) {
  return apiClient
    .post<ApiResponse<unknown>>(`/sales/orders/${id}/create-invoice`, data)
    .then(r => r.data);
}

/** Create a delivery from a sales order */
export function createDeliveryFromSO(id: string) {
  return apiClient
    .post<ApiResponse<unknown>>(`/sales/orders/${id}/create-delivery`)
    .then(r => r.data);
}

// ─── Sales Order Lines ──────────────────────────────────────────────────────

/** Add a line to a draft sales order */
export function addSalesOrderLine(
  orderId: string,
  data: CreateSalesOrderLineInput
) {
  return apiClient
    .post<ApiResponse<SalesOrderLine>>(`/sales/orders/${orderId}/lines`, data)
    .then(r => r.data);
}

/** Update a line on a draft sales order */
export function updateSalesOrderLine(
  orderId: string,
  lineId: string,
  data: UpdateSalesOrderLineInput
) {
  return apiClient
    .put<
      ApiResponse<SalesOrderLine>
    >(`/sales/orders/${orderId}/lines/${lineId}`, data)
    .then(r => r.data);
}

/** Remove a line from a draft sales order */
export function deleteSalesOrderLine(orderId: string, lineId: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/sales/orders/${orderId}/lines/${lineId}`)
    .then(r => r.data);
}

// ─── Reports ────────────────────────────────────────────────────────────────

/** Query params for the sales summary report */
type SalesReportQueryParams = {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
  status?: string;
  format?: "pdf" | "xlsx";
};

/** Fetch sales summary report (totals, breakdowns by status) */
export function getSalesSummary(params?: SalesReportQueryParams) {
  return apiClient
    .get<ApiResponse<unknown>>("/sales/orders/reports/summary", { params })
    .then(r => r.data);
}

// ─── Namespace for object-style access ──────────────────────────────────────

export const salesOrdersApi = {
  list: getSalesOrders,
  get: getSalesOrder,
  create: createSalesOrder,
  update: updateSalesOrder,
  remove: deleteSalesOrder,
  confirm: confirmSalesOrder,
  cancel: cancelSalesOrder,
  createInvoice: createInvoiceFromSO,
  createDelivery: createDeliveryFromSO,
  addLine: addSalesOrderLine,
  updateLine: updateSalesOrderLine,
  removeLine: deleteSalesOrderLine,
  summary: getSalesSummary,
};
