import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse, RefreshResponse } from "@/types/auth";

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", { email, password });
  return data.data;
}

export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<ApiResponse<RefreshResponse>>("/auth/refresh", { refreshToken });
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
