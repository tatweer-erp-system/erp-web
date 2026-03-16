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
