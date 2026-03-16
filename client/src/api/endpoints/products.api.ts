import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "@/types/modules/inventory";

/** Fetch a paginated list of products */
export function getProducts(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<Product>>("/products", { params })
    .then(r => r.data);
}

/** Fetch a single product by ID */
export function getProduct(id: string) {
  return apiClient
    .get<ApiResponse<Product>>(`/products/${id}`)
    .then(r => r.data);
}

/** Create a new product */
export function createProduct(dto: CreateProductDto) {
  return apiClient
    .post<ApiResponse<Product>>("/products", dto)
    .then(r => r.data);
}

/** Update an existing product */
export function updateProduct(id: string, dto: UpdateProductDto) {
  return apiClient
    .put<ApiResponse<Product>>(`/products/${id}`, dto)
    .then(r => r.data);
}

/** Delete a product by ID */
export function deleteProduct(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/products/${id}`)
    .then(r => r.data);
}
