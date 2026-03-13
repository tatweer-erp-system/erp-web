import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { ProjectMember } from "@/types/modules/sales";

export const projectsService = {
  getMembers: (projectId: string) =>
    apiClient
      .get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
      .then(r => r.data),

  addMember: (projectId: string, data: { userId: string; role: string }) =>
    apiClient
      .post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, data)
      .then(r => r.data),

  updateMemberRole: (
    projectId: string,
    userId: string,
    data: { role: string }
  ) =>
    apiClient
      .put<
        ApiResponse<ProjectMember>
      >(`/projects/${projectId}/members/${userId}`, data)
      .then(r => r.data),

  removeMember: (projectId: string, userId: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/projects/${projectId}/members/${userId}`)
      .then(r => r.data),
};
