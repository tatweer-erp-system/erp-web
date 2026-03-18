import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export interface RoleDetail {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isSystem?: boolean;
  isActive?: boolean;
  usersCount?: number;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionItem {
  id: string;
  nameEn: string;
  nameAr: string;
  module: string;
  action: string;
}

export interface CreateRoleDto {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  permissionIds?: string[];
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  version?: number;
}

export const rolesService = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<RoleDetail[]>>("/roles", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient.get<ApiResponse<RoleDetail>>(`/roles/${id}`).then(r => r.data),

  create: (dto: CreateRoleDto) =>
    apiClient.post<ApiResponse<RoleDetail>>("/roles", dto).then(r => r.data),

  update: (id: string, dto: UpdateRoleDto) =>
    apiClient
      .put<ApiResponse<RoleDetail>>(`/roles/${id}`, dto)
      .then(r => r.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/roles/${id}`).then(r => r.data),

  getPermissions: (id: string) =>
    apiClient
      .get<ApiResponse<PermissionItem[]>>(`/roles/${id}/permissions`)
      .then(r => r.data),

  assignPermissions: (id: string, permissionIds: string[]) =>
    apiClient
      .put<ApiResponse<void>>(`/roles/${id}/permissions`, { permissionIds })
      .then(r => r.data),

  listAllPermissions: (params?: Record<string, unknown>) =>
    apiClient
      .get<ApiResponse<PermissionItem[]>>("/roles/permissions", { params })
      .then(r => r.data),
};
