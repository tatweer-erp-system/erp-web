import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  DropdownItem,
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  StockLevel,
  StockMovement,
  CreateMovementDto,
  StockAdjustment,
  CreateAdjustmentDto,
  StockTransfer,
  CreateTransferDto,
  UnitOfMeasure,
  CreateUomDto,
  UpdateUomDto,
  AdjustmentReason,
  CreateAdjustmentReasonDto,
  UpdateAdjustmentReasonDto,
  ValuationRow,
  LowStockAlert,
} from "@/types/modules/inventory";

// ─── Products ────────────────────────────────────────────────────────────────

export const productsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Product>>("/products", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Product>>(`/products/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateProductDto) =>
    apiClient
      .post<ApiResponse<Product>>("/products", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateProductDto) =>
    apiClient
      .put<ApiResponse<Product>>(`/products/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/products/${id}`).then(r => r.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<DropdownItem[]>>("/products/dropdown", { params })
      .then(r => r.data.data),
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoriesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<ProductCategory>>("/categories", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<ProductCategory>>(`/categories/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateCategoryDto) =>
    apiClient
      .post<ApiResponse<ProductCategory>>("/categories", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateCategoryDto) =>
    apiClient
      .put<ApiResponse<ProductCategory>>(`/categories/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/categories/${id}`).then(r => r.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<DropdownItem[]>>("/categories/dropdown", { params })
      .then(r => r.data.data),
};

// ─── Warehouses ─────────────────────────────────────────────────────────────

export const warehousesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Warehouse>>("/warehouses", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Warehouse>>(`/warehouses/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateWarehouseDto) =>
    apiClient
      .post<ApiResponse<Warehouse>>("/warehouses", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateWarehouseDto) =>
    apiClient
      .put<ApiResponse<Warehouse>>(`/warehouses/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/warehouses/${id}`).then(r => r.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<DropdownItem[]>>("/warehouses/dropdown", { params })
      .then(r => r.data.data),
};

// ─── Stock ──────────────────────────────────────────────────────────────────

export const stockService = {
  getStockLevels: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<StockLevel>>("/inventory/stock-levels", { params })
      .then(r => r.data),

  getStockLevelsByProduct: (productId: string, params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<StockLevel>
      >(`/inventory/stock-levels/${productId}`, { params })
      .then(r => r.data),

  getLowStockAlerts: () =>
    apiClient
      .get<ApiResponse<LowStockAlert[]>>("/inventory/low-stock")
      .then(r => r.data.data),

  getMovements: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<StockMovement>>("/inventory/movements", { params })
      .then(r => r.data),

  getMovement: (id: string) =>
    apiClient
      .get<ApiResponse<StockMovement>>(`/inventory/movements/${id}`)
      .then(r => r.data.data),

  createMovement: (dto: CreateMovementDto) =>
    apiClient
      .post<ApiResponse<StockMovement>>("/inventory/movements", dto)
      .then(r => r.data.data),

  getValuation: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<ValuationRow>>("/inventory/valuation", { params })
      .then(r => r.data),
};

// ─── Adjustments ────────────────────────────────────────────────────────────

export const adjustmentsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<StockAdjustment>>("/inventory/adjustments", {
        params,
      })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<StockAdjustment>>(`/inventory/adjustments/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateAdjustmentDto) =>
    apiClient
      .post<ApiResponse<StockAdjustment>>("/inventory/adjustments", dto)
      .then(r => r.data.data),
};

// ─── Transfers ──────────────────────────────────────────────────────────────

export const transfersService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<StockTransfer>>("/inventory/transfers", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<StockTransfer>>(`/inventory/transfers/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateTransferDto) =>
    apiClient
      .post<ApiResponse<StockTransfer>>("/inventory/transfers", dto)
      .then(r => r.data.data),
};

// ─── Units of Measure ───────────────────────────────────────────────────────

export const uomService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<UnitOfMeasure>
      >("/inventory/definitions/units-of-measure", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<
        ApiResponse<UnitOfMeasure>
      >(`/inventory/definitions/units-of-measure/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateUomDto) =>
    apiClient
      .post<
        ApiResponse<UnitOfMeasure>
      >("/inventory/definitions/units-of-measure", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateUomDto) =>
    apiClient
      .put<
        ApiResponse<UnitOfMeasure>
      >(`/inventory/definitions/units-of-measure/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<
        ApiResponse<void>
      >(`/inventory/definitions/units-of-measure/${id}`)
      .then(r => r.data),
};

// ─── Adjustment Reasons ─────────────────────────────────────────────────────

export const adjustmentReasonsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<AdjustmentReason>
      >("/inventory/definitions/adjustment-reasons", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<
        ApiResponse<AdjustmentReason>
      >(`/inventory/definitions/adjustment-reasons/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateAdjustmentReasonDto) =>
    apiClient
      .post<
        ApiResponse<AdjustmentReason>
      >("/inventory/definitions/adjustment-reasons", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateAdjustmentReasonDto) =>
    apiClient
      .put<
        ApiResponse<AdjustmentReason>
      >(`/inventory/definitions/adjustment-reasons/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<
        ApiResponse<void>
      >(`/inventory/definitions/adjustment-reasons/${id}`)
      .then(r => r.data),
};
