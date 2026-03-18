/**
 * Pricelists module types — pricelists, pricelist items, and computed prices.
 * Field names match the backend API responses exactly.
 */

// ─── Enums (as const) ────────────────────────────────────────────────────────

export const PricelistDiscountPolicy = {
  INCLUDE_IN_PRICE: "include_in_price",
  DISCOUNT_ON_SALE: "discount_on_sale",
} as const;
export type PricelistDiscountPolicy =
  (typeof PricelistDiscountPolicy)[keyof typeof PricelistDiscountPolicy];

export const PricelistApplyOn = {
  ALL: "all",
  CATEGORY: "category",
  PRODUCT: "product",
} as const;
export type PricelistApplyOn =
  (typeof PricelistApplyOn)[keyof typeof PricelistApplyOn];

export const PricelistComputation = {
  FIXED: "fixed",
  PERCENTAGE: "percentage",
  FORMULA: "formula",
} as const;
export type PricelistComputation =
  (typeof PricelistComputation)[keyof typeof PricelistComputation];

// ─── Pricelist Item ──────────────────────────────────────────────────────────

/** Full pricelist item as returned by GET /pricelists/:id/items */
export type PricelistItem = {
  id: string;
  pricelistId: string;
  applyOn: PricelistApplyOn;
  productId: string | null;
  categoryId: string | null;
  minQty: number;
  computation: PricelistComputation;
  price: number | null;
  discountPct: number | null;
  startDate: string | null;
  endDate: string | null;
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
  categoryNameEn?: string | null;
  categoryNameAr?: string | null;
};

// ─── Pricelist (full detail) ─────────────────────────────────────────────────

/** Full pricelist as returned by GET /pricelists/:id */
export type Pricelist = {
  id: string;
  nameEn: string;
  nameAr: string;
  currencyId: string | null;
  discountPolicy: PricelistDiscountPolicy;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  // ── Joined relation fields (read-only, from API) ──
  currencyCode?: string | null;
  currencySymbol?: string | null;
  currencyNameEn?: string | null;
  currencyNameAr?: string | null;
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
};

// ─── Pricelist Row (list page) ───────────────────────────────────────────────

/** Lighter shape for the pricelists list table */
export type PricelistRow = {
  id: string;
  nameEn: string;
  nameAr: string;
  currencyId: string | null;
  discountPolicy: PricelistDiscountPolicy;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
  // ── Joined relation fields (read-only, from API) ──
  currencyCode?: string | null;
  currencySymbol?: string | null;
  currencyNameEn?: string | null;
  currencyNameAr?: string | null;
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
};

// ─── Create / Update DTOs ────────────────────────────────────────────────────

/** Payload for POST /pricelists */
export type CreatePricelistInput = {
  nameEn: string;
  nameAr: string;
  currencyId?: string;
  discountPolicy?: PricelistDiscountPolicy;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
};

/** Payload for PUT /pricelists/:id */
export type UpdatePricelistInput = {
  version: number;
  nameEn?: string;
  nameAr?: string;
  currencyId?: string;
  discountPolicy?: PricelistDiscountPolicy;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
};

/** Payload for POST /pricelists/:id/items */
export type CreatePricelistItemInput = {
  applyOn?: PricelistApplyOn;
  productId?: string;
  categoryId?: string;
  minQty?: number;
  computation?: PricelistComputation;
  price?: number;
  discountPct?: number;
  startDate?: string;
  endDate?: string;
  sequence?: number;
};

/** Payload for PUT /pricelist-items/:id */
export type UpdatePricelistItemInput = {
  version: number;
  applyOn?: PricelistApplyOn;
  productId?: string;
  categoryId?: string;
  minQty?: number;
  computation?: PricelistComputation;
  price?: number;
  discountPct?: number;
  startDate?: string;
  endDate?: string;
  sequence?: number;
};

// ─── Computed Price ──────────────────────────────────────────────────────────

/** Response from GET /pricelists/compute-price */
export type ComputedPrice = {
  originalPrice: number;
  computedPrice: number;
  discount: number;
  pricelistItemId: string | null;
};

/** Query params for GET /pricelists/compute-price */
export type ComputePriceParams = {
  pricelistId: string;
  productId: string;
  qty?: number;
};

// ─── Filter Params ───────────────────────────────────────────────────────────

/** Query params for GET /pricelists */
export type PricelistFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: "ASC" | "DESC";
};
