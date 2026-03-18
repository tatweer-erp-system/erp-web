/**
 * Partners module types — customers, suppliers, and contacts.
 * Field names match the backend API responses exactly.
 */

// ─── Enums (as const) ────────────────────────────────────────────────────────

export const PartnerType = {
  CUSTOMER: "customer",
  SUPPLIER: "supplier",
  BOTH: "both",
  INDIVIDUAL: "individual",
} as const;
export type PartnerType = (typeof PartnerType)[keyof typeof PartnerType];

// ─── Partner Contact ────────────────────────────────────────────────────────

/** Partner contact as returned by GET /partners/:id (nested in contacts) */
export type PartnerContact = {
  id: string;
  partnerId: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  position: string | null;
  isMain: boolean;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
};

// ─── Partner (full detail) ──────────────────────────────────────────────────

/** Full partner as returned by GET /partners/:id (includes contacts) */
export type Partner = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: PartnerType;
  isCustomer: boolean;
  isSupplier: boolean;
  taxNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  website: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zip: string | null;
  creditLimit: number;
  paymentTermId: string | null;
  pricelistId: string | null;
  arAccountId: string | null;
  apAccountId: string | null;
  fiscalPositionId: string | null;
  bankIban: string | null;
  bankName: string | null;
  notes: string | null;
  isActive: boolean;
  tenantId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  contacts: PartnerContact[];
  // ── Joined relation fields (read-only, from API) ──
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
  updatedByNameEn?: string | null;
  updatedByNameAr?: string | null;
};

// ─── Partner Row (list page) ────────────────────────────────────────────────

/** Lighter shape for the partners list table (no contacts) */
export type PartnerRow = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: PartnerType;
  isCustomer: boolean;
  isSupplier: boolean;
  taxNumber: string | null;
  vatNumber: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  creditLimit: number;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  // ── Joined relation fields (read-only, from API) ──
  createdByNameEn?: string | null;
  createdByNameAr?: string | null;
};

// ─── Partner Dropdown ───────────────────────────────────────────────────────

/** Minimal shape returned by GET /partners/dropdown */
export type PartnerDropdownItem = {
  id: string;
  nameEn: string;
  nameAr: string;
  type: PartnerType;
  isCustomer: boolean;
  isSupplier: boolean;
};

// ─── Create / Update DTOs ───────────────────────────────────────────────────

/** Payload for POST /partners */
export type CreatePartnerInput = {
  nameEn: string;
  nameAr: string;
  type: PartnerType;
  taxNumber?: string;
  vatNumber?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  website?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  creditLimit?: number;
  paymentTermId?: string;
  pricelistId?: string;
  arAccountId?: string;
  apAccountId?: string;
  fiscalPositionId?: string;
  bankIban?: string;
  bankName?: string;
  notes?: string;
  isActive?: boolean;
};

/** Payload for PUT /partners/:id */
export type UpdatePartnerInput = Partial<CreatePartnerInput> & {
  version: number;
};

/** Payload for POST /partners/contacts */
export type CreatePartnerContactInput = {
  partnerId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  position?: string;
  isMain?: boolean;
};

/** Payload for PUT /partners/contacts/:id */
export type UpdatePartnerContactInput = {
  version: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  position?: string;
  isMain?: boolean;
};

// ─── Filter Params ──────────────────────────────────────────────────────────

/** Query params for GET /partners */
export type PartnerFilterParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartnerType;
  isCustomer?: boolean;
  isSupplier?: boolean;
  isActive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: "ASC" | "DESC";
};
