/**
 * Sales module types — sales orders, quotations, and order lines.
 * Field names match the backend API responses exactly.
 */

// ─── Enums (as const) ────────────────────────────────────────────────────────

export const SalesOrderStatus = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;
export type SalesOrderStatus =
  (typeof SalesOrderStatus)[keyof typeof SalesOrderStatus];

export const SalesOrderInvoiceStatus = {
  NOTHING: "nothing",
  TO_INVOICE: "to_invoice",
  INVOICED: "invoiced",
} as const;
export type SalesOrderInvoiceStatus =
  (typeof SalesOrderInvoiceStatus)[keyof typeof SalesOrderInvoiceStatus];

export const SalesOrderDeliveryStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  DONE: "done",
} as const;
export type SalesOrderDeliveryStatus =
  (typeof SalesOrderDeliveryStatus)[keyof typeof SalesOrderDeliveryStatus];

export const SalesDiscountType = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;
export type SalesDiscountType =
  (typeof SalesDiscountType)[keyof typeof SalesDiscountType];

export const CreateInvoiceType = {
  REGULAR: "regular",
  DOWN_PAYMENT_PERCENTAGE: "down_payment_percentage",
  DOWN_PAYMENT_FIXED: "down_payment_fixed",
} as const;
export type CreateInvoiceType =
  (typeof CreateInvoiceType)[keyof typeof CreateInvoiceType];

// ─── Sales Order Line ────────────────────────────────────────────────────────

/** Full sales order line as returned by GET /sales/orders/:id */
export type SalesOrderLine = {
  id: string;
  orderId: string;
  productId: string | null;
  productVariantId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  currencyId: string | null;
  lineTotalBase: number | null;
  qtyDelivered: number;
  qtyInvoiced: number;
  isComboParent: boolean;
  comboParentLineId: string | null;
  sequence: number;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  // ── Joined relation fields (read-only, from API) ──
  productNameEn?: string | null;
  productNameAr?: string | null;
  productSku?: string | null;
  variantName?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
};

// ─── Sales Order (full detail) ───────────────────────────────────────────────

/** Full sales order as returned by GET /sales/orders/:id (includes lines) */
export type SalesOrder = {
  id: string;
  orderNumber: string;
  partnerId: string | null;
  branchId: string | null;
  pricelistId: string | null;
  paymentTermId: string | null;
  salespersonId: string | null;
  fiscalPositionId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyId: string | null;
  exchangeRate: number;
  totalAmountBase: number | null;
  discountType: SalesDiscountType | null;
  discountValue: number | null;
  status: SalesOrderStatus;
  invoiceStatus: SalesOrderInvoiceStatus;
  deliveryStatus: SalesOrderDeliveryStatus;
  notes: string | null;
  internalNotes: string | null;
  confirmedAt: string | null;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  lines: SalesOrderLine[];
  // ── Joined relation fields (read-only, from API) ──
  partnerNameEn?: string | null;
  partnerNameAr?: string | null;
  salespersonNameEn?: string | null;
  salespersonNameAr?: string | null;
  branchNameEn?: string | null;
  branchNameAr?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  currencyNameEn?: string | null;
  paymentTermNameEn?: string | null;
  paymentTermNameAr?: string | null;
  pricelistNameEn?: string | null;
  pricelistNameAr?: string | null;
  fiscalPositionNameEn?: string | null;
  fiscalPositionNameAr?: string | null;
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
};

// ─── Sales Order Row (list page) ─────────────────────────────────────────────

/** Lighter shape for the sales orders list table (no lines) */
export type SalesOrderRow = {
  id: string;
  orderNumber: string;
  partnerId: string | null;
  branchId: string | null;
  salespersonId: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyId: string | null;
  totalAmountBase: number | null;
  discountType: SalesDiscountType | null;
  discountValue: number | null;
  status: SalesOrderStatus;
  invoiceStatus: SalesOrderInvoiceStatus;
  deliveryStatus: SalesOrderDeliveryStatus;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
  // ── Joined relation fields (read-only, from API) ──
  partnerNameEn?: string | null;
  partnerNameAr?: string | null;
  salespersonNameEn?: string | null;
  salespersonNameAr?: string | null;
  branchNameEn?: string | null;
  branchNameAr?: string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
};

/**
 * Quotation is a draft sales order.
 * Same row shape — filtered by status === 'draft' on the frontend.
 */
export type QuotationRow = SalesOrderRow;

// ─── Create / Update DTOs ────────────────────────────────────────────────────

/** Payload for POST /sales/orders */
export type CreateSalesOrderInput = {
  partnerId: string;
  branchId?: string;
  currencyId?: string;
  pricelistId?: string;
  paymentTermId?: string;
  salespersonId?: string;
  fiscalPositionId?: string;
  notes?: string;
  discountType?: SalesDiscountType;
  discountValue?: number;
  lines: CreateSalesOrderLineInput[];
};

/** Payload for PUT /sales/orders/:id */
export type UpdateSalesOrderInput = {
  version: number;
  partnerId?: string;
  pricelistId?: string;
  paymentTermId?: string;
  salespersonId?: string;
  fiscalPositionId?: string;
  notes?: string;
  discountType?: SalesDiscountType;
  discountValue?: number;
  lines?: CreateSalesOrderLineInput[];
};

/** Payload for POST /sales/orders/:id/lines */
export type CreateSalesOrderLineInput = {
  productId: string;
  productVariantId?: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
  description?: string;
};

/** Payload for PUT /sales/orders/:id/lines/:lineId */
export type UpdateSalesOrderLineInput = {
  version: number;
  quantity?: number;
  unitPrice?: number;
  discountPct?: number;
  taxRate?: number;
  description?: string;
};

/** Payload for POST /sales/orders/:id/create-invoice */
export type CreateInvoiceFromSOInput = {
  type: CreateInvoiceType;
  value?: number;
};

// ─── Filter Params ───────────────────────────────────────────────────────────

/** Query params for GET /sales/orders */
export type SalesOrderFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: SalesOrderStatus;
  invoiceStatus?: SalesOrderInvoiceStatus;
  deliveryStatus?: SalesOrderDeliveryStatus;
  partnerId?: string;
  salespersonId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
};

// ─── SalesInvoice alias ───────────────────────────────────────────────────────
// Backward-compat alias — prefer importing Invoice directly from @/types/modules/invoices
export type { Invoice as SalesInvoice } from "@/types/modules/invoices";

// ─── ProjectMember ────────────────────────────────────────────────────────────
// Backward-compat alias — prefer importing ProjectMember directly from @/types/modules/projects
export type { ProjectMember } from "@/types/modules/projects";
