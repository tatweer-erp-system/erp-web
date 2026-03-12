import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Branch } from "@/types/auth";

export const branchesService = {
  list: () =>
    apiClient.get<ApiResponse<Branch[]>>("/branches").then((r) => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Branch>>(`/branches/${id}`).then((r) => r.data),
};
