/**
 * Purchasing module types — purchase orders and purchase order lines.
 * Field names match the backend API responses exactly.
 */

import type {
  PurchaseOrderStatusNew,
  PurchaseOrderBillStatus,
  PurchaseOrderReceiptStatus,
} from "@/constants/enums";

// ─── Purchase Order Line ──────────────────────────────────────────────────

export interface PurchaseOrderLine {
  id: string;
  orderId: string;
  productId: string;
  productVariantId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
  receivedQuantity: number;
  qtyBilled: number;
  discountAmount: number;
  // Joined fields
  productNameEn?: string | null;
  productNameAr?: string | null;
  productSku?: string | null;
  variantName?: string | null;
}

// ─── Purchase Order ───────────────────────────────────────────────────────

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  partnerId: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  branchId: string;
  branchNameEn?: string;
  branchNameAr?: string;
  buyerId?: string;
  paymentTermId?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  currencyId?: string;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRate?: number;
  totalAmountBase?: number;
  discountAmount: number;
  status: PurchaseOrderStatusNew;
  billStatus: PurchaseOrderBillStatus;
  receiptStatus: PurchaseOrderReceiptStatus;
  expectedDeliveryDate?: string;
  invoiceNumber?: string;
  notes?: string;
  receivedAt?: string;
  lines?: PurchaseOrderLine[];
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  createdByNameEn?: string;
  createdByNameAr?: string;
}

// ─── Purchase Order Row (list page) ──────────────────────────────────────

export interface PurchaseOrderRow {
  id: string;
  orderNumber: string;
  partnerId: string;
  partnerNameEn?: string;
  partnerNameAr?: string;
  branchId: string;
  branchNameEn?: string;
  branchNameAr?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  discountAmount: number;
  status: PurchaseOrderStatusNew;
  billStatus: PurchaseOrderBillStatus;
  receiptStatus: PurchaseOrderReceiptStatus;
  expectedDeliveryDate?: string;
  currencyCode?: string;
  currencySymbol?: string;
  createdAt: string;
  version: number;
}

// ─── Create / Update DTOs ────────────────────────────────────────────────

export interface CreatePurchaseOrderLineDto {
  productId: string;
  productVariantId?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  description?: string;
}

export interface CreatePurchaseOrderDto {
  partnerId: string;
  branchId: string;
  currencyId?: string;
  paymentTermId?: string;
  buyerId?: string;
  expectedDeliveryDate?: string;
  discountAmount?: number;
  notes?: string;
  lines: CreatePurchaseOrderLineDto[];
}

export interface UpdatePurchaseOrderDto extends Partial<CreatePurchaseOrderDto> {
  version: number;
}

// ─── Purchase Order Summary ─────────────────────────────────────────────

export interface PurchaseOrderSummary {
  totalRecords: number;
  totalDraft: number;
  totalConfirmed: number;
  totalDone: number;
  totalAmount: number;
}

// ─── Filter Params ──────────────────────────────────────────────────────

export interface PurchaseOrderFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatusNew;
  billStatus?: PurchaseOrderBillStatus;
  receiptStatus?: PurchaseOrderReceiptStatus;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
