import type { ProductType, InvoicePolicy } from "@/constants/enums";

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  unitPrice: number;
  costPrice?: number;
  currency?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  taxRate?: number;
  isActive: boolean;
  images?: string[];
  productType: ProductType;
  invoicePolicy?: InvoicePolicy;
  canBeSold?: boolean;
  canBePurchased?: boolean;
  hasVariants?: boolean;
  hasSerialTracking?: boolean;
  hasLotTracking?: boolean;
  hasExpiryDate?: boolean;
  reorderMinQty?: number;
  reorderQty?: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  category?: ProductCategory;
}

export interface CreateProductDto {
  nameEn: string;
  nameAr: string;
  sku: string;
  descriptionEn?: string;
  descriptionAr?: string;
  categoryId: string;
  unitPrice: number;
  costPrice?: number;
  taxRate?: number;
  barcode?: string;
  unitOfMeasure?: string;
  reorderPoint?: number;
  productType?: ProductType;
  invoicePolicy?: InvoicePolicy;
  isActive?: boolean;
  canBeSold?: boolean;
  canBePurchased?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  version: number;
}

// ─── Product Category ────────────────────────────────────────────────────────

export interface ProductCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  parentId?: string;
  version?: number;
  createdAt?: string;
}

export interface CreateCategoryDto {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  parentId?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  version: number;
}

// ─── Warehouse ───────────────────────────────────────────────────────────────

export interface Warehouse {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  location?: string;
  branchId?: string;
  isActive: boolean;
  allowNegativeStock?: boolean;
  version?: number;
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

export interface DropdownItem {
  id: string;
  nameEn: string;
  nameAr: string;
}
