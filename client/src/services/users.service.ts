import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type { User } from "@/types/auth";

export const usersService = {
  list: (params: TableParams) =>
    apiClient
      .get<PaginatedResponse<User>>("/users", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<User>>(`/users/${id}`).then(r => r.data),

  create: (data: Omit<User, "id">) =>
    apiClient.post<ApiResponse<User>>("/users", data).then(r => r.data),

  update: (id: string, data: Partial<User>) =>
    apiClient.put<ApiResponse<User>>(`/users/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/users/${id}`).then(r => r.data),
};
