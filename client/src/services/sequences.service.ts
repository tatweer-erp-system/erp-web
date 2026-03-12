import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Sequence {
  id: string;
  entityType: string;
  prefix: string;
  currentValue: number;
  padding: number;
  branchId?: string;
}

export const sequencesService = {
  list: () =>
    apiClient.get<ApiResponse<Sequence[]>>("/sequences").then((r) => r.data),

  create: (data: Omit<Sequence, "id">) =>
    apiClient.post<ApiResponse<Sequence>>("/sequences", data).then((r) => r.data),

  update: (id: string, data: Partial<Sequence>) =>
    apiClient.put<ApiResponse<Sequence>>(`/sequences/${id}`, data).then((r) => r.data),

  reset: (id: string) =>
    apiClient.post<ApiResponse<Sequence>>(`/sequences/${id}/reset`).then((r) => r.data),
};
