import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { UserRole } from "@/types/auth";

export const rolesService = {
  list: () =>
    apiClient.get<ApiResponse<UserRole[]>>("/roles").then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<UserRole>>(`/roles/${id}`).then(r => r.data),
};
