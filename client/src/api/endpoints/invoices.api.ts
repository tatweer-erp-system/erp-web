import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type { SalesInvoice } from "@/types/modules/sales";

type CreateInvoiceDto = {
  partnerId: string;
  invoiceDate: string;
  dueDate: string;
  lines: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  notes?: string;
};

type UpdateInvoiceDto = Partial<CreateInvoiceDto> & {
  version: number;
};

/** Fetch a paginated list of invoices */
export function getInvoices(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<SalesInvoice>>("/invoices", { params })
    .then(r => r.data);
}

/** Fetch a single invoice by ID */
export function getInvoice(id: string) {
  return apiClient
    .get<ApiResponse<SalesInvoice>>(`/invoices/${id}`)
    .then(r => r.data);
}

/** Create a new draft invoice */
export function createInvoice(dto: CreateInvoiceDto) {
  return apiClient
    .post<ApiResponse<SalesInvoice>>("/invoices", dto)
    .then(r => r.data);
}

/** Update a draft invoice */
export function updateInvoice(id: string, dto: UpdateInvoiceDto) {
  return apiClient
    .patch<ApiResponse<SalesInvoice>>(`/invoices/${id}`, dto)
    .then(r => r.data);
}

/** Post (confirm) an invoice — transitions from draft to posted */
export function postInvoice(id: string) {
  return apiClient
    .post<ApiResponse<SalesInvoice>>(`/invoices/${id}/post`)
    .then(r => r.data);
}

/** Cancel an invoice */
export function cancelInvoice(id: string) {
  return apiClient
    .post<ApiResponse<SalesInvoice>>(`/invoices/${id}/cancel`)
    .then(r => r.data);
}

/** Namespace for hooks that prefer object-style access */
export const invoicesApi = {
  list: getInvoices,
  get: getInvoice,
  create: createInvoice,
  update: updateInvoice,
  post: postInvoice,
  cancel: cancelInvoice,
};
