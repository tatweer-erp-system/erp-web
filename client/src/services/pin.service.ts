import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";

export const pinService = {
  status: () =>
    apiClient
      .get<ApiResponse<{ hasPin: boolean }>>("/auth/pin/status")
      .then(r => r.data),

  setPin: (pin: string) =>
    apiClient
      .post<ApiResponse<void>>("/auth/pin/set", { pin })
      .then(r => r.data),

  verifyPin: (pin: string) =>
    apiClient
      .post<ApiResponse<void>>("/auth/pin/verify", { pin })
      .then(r => r.data),
};
