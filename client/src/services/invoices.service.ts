import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Invoice,
  InvoiceRow,
  InvoiceSummary,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  RegisterPaymentInput,
  InvoiceFilterParams,
  Payment,
  CreatePaymentDto,
} from "@/types/modules/invoices";

// ─── Invoices ───────────────────────────────────────────────────────────────

export const invoicesService = {
  list: (params?: Partial<InvoiceFilterParams>) =>
    apiClient
      .get<PaginatedResponse<InvoiceRow>>("/invoices", { params })
      .then(r => r.data),

  summary: (params?: { invoiceType?: string }) =>
    apiClient
      .get<ApiResponse<InvoiceSummary>>("/invoices/summary", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Invoice>>(`/invoices/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateInvoiceInput) =>
    apiClient
      .post<ApiResponse<Invoice>>("/invoices", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateInvoiceInput) =>
    apiClient
      .patch<ApiResponse<Invoice>>(`/invoices/${id}`, dto)
      .then(r => r.data.data),

  post: (id: string) =>
    apiClient
      .post<ApiResponse<Invoice>>(`/invoices/${id}/post`)
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<Invoice>>(`/invoices/${id}/cancel`)
      .then(r => r.data.data),

  registerPayment: (id: string, dto: RegisterPaymentInput) =>
    apiClient
      .post<ApiResponse<Invoice>>(`/invoices/${id}/register-payment`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/invoices/${id}`).then(r => r.data),
};

// ─── Payments ───────────────────────────────────────────────────────────────

export const paymentsService = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<PaginatedResponse<Payment>>("/payments", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Payment>>(`/payments/${id}`)
      .then(r => r.data.data),

  create: (dto: CreatePaymentDto) =>
    apiClient
      .post<ApiResponse<Payment>>("/payments", dto)
      .then(r => r.data.data),

  post: (id: string) =>
    apiClient
      .post<ApiResponse<Payment>>(`/payments/${id}/post`)
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<Payment>>(`/payments/${id}/cancel`)
      .then(r => r.data.data),
};
