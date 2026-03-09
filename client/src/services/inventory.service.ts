import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type { InventoryItem } from "@/types/modules/inventory";

export const inventoryService = {
  list: (params: TableParams) =>
    apiClient.get<PaginatedResponse<InventoryItem>>("/inventory", { params }).then((r) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<InventoryItem>>(`/inventory/${id}`).then((r) => r.data),

  create: (data: Omit<InventoryItem, "id" | "lastUpdated">) =>
    apiClient.post<ApiResponse<InventoryItem>>("/inventory", data).then((r) => r.data),

  update: (id: string, data: Partial<InventoryItem>) =>
    apiClient.put<ApiResponse<InventoryItem>>(`/inventory/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/inventory/${id}`).then((r) => r.data),
};
