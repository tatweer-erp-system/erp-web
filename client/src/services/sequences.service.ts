import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface Sequence {
  id: string;
  entityType: string;
  prefix: string;
  separator: string;
  currentValue: number;
  padding: number;
  resetCycle: string;
  fiscalYear: number | null;
  fiscalMonth: number | null;
  branchId: string | null;
  branchCode: string | null;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSequenceDto {
  prefix?: string;
  padding?: number;
  resetCycle?: string;
  separator?: string;
  version: number;
}

export const sequencesService = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<Sequence[]>>("/sequences", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Sequence>>(`/sequences/${id}`).then(r => r.data),

  update: (id: string, data: UpdateSequenceDto) =>
    apiClient
      .put<ApiResponse<Sequence>>(`/sequences/${id}`, data)
      .then(r => r.data),
};
