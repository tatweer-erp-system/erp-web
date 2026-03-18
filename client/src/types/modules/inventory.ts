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
  address?: string;
  city?: string;
  branchId?: string;
  branchNameEn?: string;
  branchNameAr?: string;
  isDefault?: boolean;
  isActive: boolean;
  allowNegativeStock?: boolean;
  version?: number;
  createdAt?: string;
}

// ─── Dropdown ────────────────────────────────────────────────────────────────

export interface DropdownItem {
  id: string;
  nameEn: string;
  nameAr: string;
}

// ─── Warehouse DTOs ─────────────────────────────────────────────────────────

export interface CreateWarehouseDto {
  nameEn: string;
  nameAr: string;
  address?: string;
  city?: string;
  isDefault?: boolean;
  branchId?: string;
  allowNegativeStock?: boolean;
  isActive?: boolean;
}

export interface UpdateWarehouseDto extends Partial<CreateWarehouseDto> {
  version: number;
}

// ─── Stock Level ────────────────────────────────────────────────────────────

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  locationId?: string;
  productVariantId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  quantity: number;
  reservedQuantity: number;
  averageCost: number;
  lastCostPrice?: number;
  currencyId?: string;
  createdAt?: string;
  updatedAt?: string;
  // JOINed fields
  productNameEn?: string;
  productNameAr?: string;
  productSku?: string;
  warehouseNameEn?: string;
  warehouseNameAr?: string;
  categoryNameEn?: string;
  categoryNameAr?: string;
  reorderPoint?: number;
}

// ─── Stock Movement ─────────────────────────────────────────────────────────

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  movementType: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
  unitCost?: number;
  totalCost?: number;
  currencyId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  branchId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  productVariantId?: string;
  createdAt?: string;
  // JOINed
  productNameEn?: string;
  productNameAr?: string;
  productSku?: string;
  warehouseNameEn?: string;
  warehouseNameAr?: string;
}

export interface CreateMovementDto {
  type: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  toWarehouseId?: string;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  locationId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  productVariantId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  currencyId?: string;
}

// ─── Adjustment ─────────────────────────────────────────────────────────────

export interface StockAdjustment {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  unitCost?: number;
  totalCost?: number;
  averageCost?: number;
  locationId?: string;
  productVariantId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  createdAt?: string;
  productNameEn?: string;
  productNameAr?: string;
  productSku?: string;
  warehouseNameEn?: string;
  warehouseNameAr?: string;
}

export interface CreateAdjustmentDto {
  productId: string;
  warehouseId: string;
  quantity: number;
  reason: string;
  unitCost?: number;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  locationId?: string;
  productVariantId?: string;
}

// ─── Transfer ───────────────────────────────────────────────────────────────

export interface StockTransfer {
  id: string;
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  notes?: string;
  fromLocationId?: string;
  toLocationId?: string;
  productVariantId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  createdAt?: string;
  productNameEn?: string;
  productNameAr?: string;
  productSku?: string;
  sourceWarehouseNameEn?: string;
  sourceWarehouseNameAr?: string;
  destinationWarehouseNameEn?: string;
  destinationWarehouseNameAr?: string;
}

export interface CreateTransferDto {
  productId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  quantity: number;
  notes?: string;
  fromLocationId?: string;
  toLocationId?: string;
  productVariantId?: string;
  lotNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
}

// ─── Stock Location ─────────────────────────────────────────────────────────

export interface StockLocation {
  id: string;
  warehouseId?: string;
  nameEn: string;
  nameAr: string;
  fullName?: string;
  parentId?: string;
  locationType: string;
  isScrap?: boolean;
  isReturn?: boolean;
  isActive: boolean;
  version?: number;
  createdAt?: string;
}

// ─── Unit of Measure ────────────────────────────────────────────────────────

export interface UnitOfMeasure {
  id: string;
  nameEn: string;
  nameAr: string;
  symbol: string;
  uomType: string;
  isActive: boolean;
  version?: number;
  createdAt?: string;
}

export interface CreateUomDto {
  nameEn: string;
  nameAr: string;
  symbol: string;
  uomType?: string;
  isActive?: boolean;
}

export interface UpdateUomDto extends Partial<CreateUomDto> {
  version: number;
}

// ─── Adjustment Reason ──────────────────────────────────────────────────────

export interface AdjustmentReason {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  isActive: boolean;
  version?: number;
}

export interface CreateAdjustmentReasonDto {
  nameEn: string;
  nameAr: string;
  type?: string;
  isActive?: boolean;
}

export interface UpdateAdjustmentReasonDto extends Partial<CreateAdjustmentReasonDto> {
  version: number;
}

// ─── Valuation ──────────────────────────────────────────────────────────────

export interface ValuationRow {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  productSku: string;
  categoryNameEn?: string;
  categoryNameAr?: string;
  warehouseNameEn?: string;
  warehouseNameAr?: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
}

// ─── Low Stock Alert ────────────────────────────────────────────────────────

export interface LowStockAlert {
  productId: string;
  productNameEn: string;
  productNameAr: string;
  productSku: string;
  warehouseId: string;
  warehouseNameEn: string;
  warehouseNameAr: string;
  quantity: number;
  reorderPoint: number;
}
