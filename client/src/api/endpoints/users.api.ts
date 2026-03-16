import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type { User, UserRole } from "@/types/auth";

type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleId?: string;
  preferredLang?: string;
};

type UpdateUserDto = Partial<Omit<CreateUserDto, "password">> & {
  isActive?: boolean;
};

type AssignRoleDto = {
  roleId: string;
};

/** Fetch a paginated list of users */
export function getUsers(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<User>>("/users", { params })
    .then(r => r.data);
}

/** Fetch a single user by ID */
export function getUser(id: string) {
  return apiClient.get<ApiResponse<User>>(`/users/${id}`).then(r => r.data);
}

/** Create a new user */
export function createUser(dto: CreateUserDto) {
  return apiClient.post<ApiResponse<User>>("/users", dto).then(r => r.data);
}

/** Update an existing user */
export function updateUser(id: string, dto: UpdateUserDto) {
  return apiClient
    .put<ApiResponse<User>>(`/users/${id}`, dto)
    .then(r => r.data);
}

/** Fetch all available roles */
export function getRoles() {
  return apiClient.get<ApiResponse<UserRole[]>>("/roles").then(r => r.data);
}

/** Assign a role to a user */
export function assignRole(userId: string, dto: AssignRoleDto) {
  return apiClient
    .post<ApiResponse<void>>(`/users/${userId}/role`, dto)
    .then(r => r.data);
}
