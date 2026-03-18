/**
 * Invoices module types — invoices, invoice lines, and payments.
 * Field names match the backend API responses exactly.
 */

import type {
  InvoiceTypeNew,
  InvoiceStatusNew,
  InvoicePaymentStatus,
  PaymentTypeNew,
  PaymentStatusNew,
} from "@/constants/enums";

// ─── Invoice Line ────────────────────────────────────────────────────────────

export type InvoiceLine = {
  id: string;
  invoiceId: string;
  productId: string | null;
  productVariantId: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  sequence: number;
  // Joined fields
  productNameEn?: string | null;
  productNameAr?: string | null;
  productSku?: string | null;
  variantName?: string | null;
};

// ─── Invoice ─────────────────────────────────────────────────────────────────

export type Invoice = {
  id: string;
  branchId: string;
  partnerId: string;
  invoiceType: InvoiceTypeNew;
  status: InvoiceStatusNew;
  paymentStatus: InvoicePaymentStatus;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  paymentTermId: string | null;
  saleOrderId: string | null;
  purchaseOrderId: string | null;
  currencyId: string | null;
  exchangeRate: number | null;
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  amountResidual: number;
  amountTotalBase: number | null;
  reference: string | null;
  narration: string | null;
  journalEntryId: string | null;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  lines?: InvoiceLine[];
  // Joined fields
  partnerNameEn?: string | null;
  partnerNameAr?: string | null;
  branchNameEn?: string | null;
  branchNameAr?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  paymentTermNameEn?: string | null;
  paymentTermNameAr?: string | null;
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
};

// ─── Invoice Row (list page) ────────────────────────────────────────────────

export type InvoiceRow = {
  id: string;
  branchId: string;
  partnerId: string;
  invoiceType: InvoiceTypeNew;
  status: InvoiceStatusNew;
  paymentStatus: InvoicePaymentStatus;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  amountUntaxed: number;
  amountTax: number;
  amountTotal: number;
  amountResidual: number;
  createdAt: string;
  version: number;
  // Joined fields
  partnerNameEn?: string | null;
  partnerNameAr?: string | null;
  branchNameEn?: string | null;
  branchNameAr?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
};

// ─── Create / Update DTOs ───────────────────────────────────────────────────

export type CreateInvoiceLineInput = {
  productId: string;
  productVariantId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
};

export type CreateInvoiceInput = {
  partnerId: string;
  invoiceType: InvoiceTypeNew;
  invoiceDate: string;
  dueDate?: string;
  paymentTermId?: string;
  currencyId?: string;
  reference?: string;
  narration?: string;
  lines: CreateInvoiceLineInput[];
};

export type UpdateInvoiceInput = {
  version: number;
  partnerId?: string;
  invoiceDate?: string;
  dueDate?: string;
  paymentTermId?: string;
  reference?: string;
  narration?: string;
  lines?: CreateInvoiceLineInput[];
};

export type RegisterPaymentInput = {
  paymentDate: string;
  amount: number;
  memo?: string;
};

// ─── Invoice Summary ────────────────────────────────────────────────────────

export type InvoiceSummary = {
  totalRecords: number;
  totalAmount: number;
  totalPaid: number;
  totalUnpaid: number;
  byStatus: Record<string, number>;
  byPaymentStatus: Record<string, number>;
};

// ─── Standalone Payments (Customer Receipts / Vendor Payments) ──────────────

export interface Payment {
  id: string;
  branchId: string;
  partnerId: string;
  paymentType: PaymentTypeNew;
  status: PaymentStatusNew;
  paymentNumber: string;
  paymentDate: string;
  amount: number;
  currencyId?: string;
  exchangeRate?: number;
  amountBase?: number;
  memo?: string;
  treasuryAccountId?: string;
  journalEntryId?: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  version?: number;
  createdAt?: string;
}

export interface CreatePaymentDto {
  partnerId: string;
  paymentType: PaymentTypeNew;
  paymentDate: string;
  amount: number;
  currencyId?: string;
  memo?: string;
  treasuryAccountId?: string;
}

// ─── Filter Params ──────────────────────────────────────────────────────────

export type InvoiceFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  invoiceType?: InvoiceTypeNew;
  status?: InvoiceStatusNew;
  paymentStatus?: InvoicePaymentStatus;
  partnerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};
