import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { Branch } from "@/types/auth";
import type { GeneralSettings } from "@/services/settings.service";

type CreateBranchDto = {
  nameEn: string;
  nameAr: string;
  code: string;
  isDefault?: boolean;
};

type UpdateBranchDto = Partial<CreateBranchDto> & {
  version?: number;
};

/** Fetch general application settings */
export function getSettings() {
  return apiClient
    .get<ApiResponse<GeneralSettings>>("/config/general")
    .then(r => r.data);
}

/** Update general application settings */
export function updateSettings(dto: Partial<GeneralSettings>) {
  return apiClient
    .patch<ApiResponse<GeneralSettings>>("/config/general", dto)
    .then(r => r.data);
}

/** Fetch all branches */
export function getBranches() {
  return apiClient.get<ApiResponse<Branch[]>>("/branches").then(r => r.data);
}

/** Create a new branch */
export function createBranch(dto: CreateBranchDto) {
  return apiClient
    .post<ApiResponse<Branch>>("/branches", dto)
    .then(r => r.data);
}

/** Update an existing branch */
export function updateBranch(id: string, dto: UpdateBranchDto) {
  return apiClient
    .patch<ApiResponse<Branch>>(`/branches/${id}`, dto)
    .then(r => r.data);
}

/** Namespace for hooks that prefer object-style access */
export const settingsApi = {
  getSettings,
  updateSettings,
  getBranches,
  createBranch,
  updateBranch,
};
