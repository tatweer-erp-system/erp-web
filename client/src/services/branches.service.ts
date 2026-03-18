import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "@/types/auth";

export interface BranchDetail extends Branch {
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchDto {
  nameEn: string;
  nameAr: string;
  code: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  isMain?: boolean;
  isActive?: boolean;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {
  version: number;
}

export const branchesService = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<BranchDetail[]>>("/branches", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<BranchDetail>>(`/branches/${id}`)
      .then(r => r.data),

  create: (dto: CreateBranchDto) =>
    apiClient
      .post<ApiResponse<BranchDetail>>("/branches", dto)
      .then(r => r.data),

  update: (id: string, dto: UpdateBranchDto) =>
    apiClient
      .put<ApiResponse<BranchDetail>>(`/branches/${id}`, dto)
      .then(r => r.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/branches/${id}`).then(r => r.data),
};
