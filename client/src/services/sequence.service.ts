import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";

export interface Sequence {
  id: string;
  entity: string;
  prefix: string;
  lastValue: number;
  padding: number;
  resetCycle: "never" | "yearly" | "monthly";
  scope: "company" | string; // branch name when branch-level
  branchId?: string;
  branchName?: string;
  version: number;
  branchLevelEnabled?: boolean;
  updatedAt: string;
}

export interface SequenceUpdatePayload {
  prefix: string;
  padding: number;
  resetCycle: "never" | "yearly" | "monthly";
  version: number;
}

export interface SequenceResetPayload {
  reason: string;
}

export const sequenceService = {
  list: (params?: TableParams) =>
    apiClient
      .get<PaginatedResponse<Sequence>>("/sequences", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<Sequence>>(`/sequences/${id}`).then(r => r.data),

  update: (id: string, data: SequenceUpdatePayload) =>
    apiClient
      .put<ApiResponse<Sequence>>(`/sequences/${id}`, data)
      .then(r => r.data),

  reset: (id: string, data: SequenceResetPayload) =>
    apiClient
      .post<ApiResponse<Sequence>>(`/sequences/${id}/reset`, data)
      .then(r => r.data),

  enableBranchLevel: (id: string) =>
    apiClient
      .post<ApiResponse<Sequence[]>>(`/sequences/${id}/branch-level`)
      .then(r => r.data),

  disableBranchLevel: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/sequences/${id}/branch-level`)
      .then(r => r.data),
};
