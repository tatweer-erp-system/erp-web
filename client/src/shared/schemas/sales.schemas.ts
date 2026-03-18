/**
 * Zod schemas for sales order forms and filters.
 * Used with react-hook-form via zodResolver.
 */

import { z } from "zod";

// ─── Enum values (used in schemas) ──────────────────────────────────────────

const SALES_DISCOUNT_TYPES = ["percentage", "fixed"] as const;
const SALES_ORDER_STATUSES = [
  "draft",
  "confirmed",
  "done",
  "cancelled",
] as const;
const SALES_INVOICE_STATUSES = ["nothing", "to_invoice", "invoiced"] as const;
const SALES_DELIVERY_STATUSES = ["pending", "partial", "done"] as const;
const CREATE_INVOICE_TYPES = [
  "regular",
  "down_payment_percentage",
  "down_payment_fixed",
] as const;
const SORT_ORDERS = ["ASC", "DESC"] as const;

// ─── Line Schemas ───────────────────────────────────────────────────────────

/** Schema for creating a sales order line */
export const createSalesOrderLineSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid().optional(),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
});

export type CreateSalesOrderLineFormValues = z.infer<
  typeof createSalesOrderLineSchema
>;

/** Schema for updating a single sales order line */
export const updateSalesOrderLineSchema = z.object({
  version: z.coerce.number().int().min(0),
  quantity: z.coerce.number().min(0.001).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
});

export type UpdateSalesOrderLineFormValues = z.infer<
  typeof updateSalesOrderLineSchema
>;

// ─── Order Schemas ──────────────────────────────────────────────────────────

/** Schema for creating a sales order */
export const createSalesOrderSchema = z.object({
  partnerId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  currencyId: z.string().uuid().optional(),
  pricelistId: z.string().uuid().optional(),
  paymentTermId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
  fiscalPositionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  discountType: z.enum(SALES_DISCOUNT_TYPES).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  lines: z.array(createSalesOrderLineSchema).min(1),
});

export type CreateSalesOrderFormValues = z.infer<typeof createSalesOrderSchema>;

/** Schema for updating a sales order (draft only) */
export const updateSalesOrderSchema = z.object({
  version: z.coerce.number().int().min(0),
  partnerId: z.string().uuid().optional(),
  pricelistId: z.string().uuid().optional(),
  paymentTermId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
  fiscalPositionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  discountType: z.enum(SALES_DISCOUNT_TYPES).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  lines: z.array(createSalesOrderLineSchema).min(1).optional(),
});

export type UpdateSalesOrderFormValues = z.infer<typeof updateSalesOrderSchema>;

/** Schema for creating an invoice from a sales order */
export const createInvoiceFromSOSchema = z.object({
  type: z.enum(CREATE_INVOICE_TYPES),
  value: z.coerce.number().min(0.01).optional(),
});

export type CreateInvoiceFromSOFormValues = z.infer<
  typeof createInvoiceFromSOSchema
>;

// ─── Filter Schema ──────────────────────────────────────────────────────────

/** Schema for sales order list filters */
export const salesOrderFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  status: z.enum(SALES_ORDER_STATUSES).optional(),
  invoiceStatus: z.enum(SALES_INVOICE_STATUSES).optional(),
  deliveryStatus: z.enum(SALES_DELIVERY_STATUSES).optional(),
  partnerId: z.string().uuid().optional(),
  salespersonId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(SORT_ORDERS).optional(),
});

export type SalesOrderFilterFormValues = z.infer<typeof salesOrderFilterSchema>;
