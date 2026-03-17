import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
  LoginResponse,
  RefreshResponse,
  SelectBranchResponse,
} from "@/types/auth";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    { email, password }
  );
  return data.data;
}

export async function selectBranch(
  branchId: string
): Promise<SelectBranchResponse> {
  const { data } = await apiClient.post<ApiResponse<SelectBranchResponse>>(
    "/auth/select-branch",
    { branchId }
  );
  return data.data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<ApiResponse<RefreshResponse>>(
    "/auth/refresh",
    { refreshToken }
  );
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
