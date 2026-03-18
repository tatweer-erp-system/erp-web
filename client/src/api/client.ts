import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/token";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import type { ApiError } from "@/types/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

// ─── Request interceptor ────────────────────────────────────────────────────
apiClient.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Request-Id"] = crypto.randomUUID();
  config.headers["Accept-Language"] = useLangStore.getState().lang ?? "en";

  const branchId = useBranchStore.getState().activeBranch?.id;
  if (branchId) {
    config.headers["x-branch-id"] = String(branchId);
  }

  return config;
});

// ─── Response interceptor: silent token refresh on 401 ──────────────────────
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  for (const p of pendingQueue) {
    if (error) p.reject(error);
    else p.resolve(token!);
  }
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/refresh"
    ) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as Record<string, unknown> | undefined;

      const nested = data?.error as Record<string, unknown> | undefined;
      const apiError: ApiError = {
        message:
          (nested?.message as string) ??
          (data?.message as string) ??
          error.message ??
          "An unexpected error occurred",
        code:
          (nested?.code as string) ?? (data?.code as string) ?? "UNKNOWN_ERROR",
        field: data?.field as string | undefined,
        status,
      };

      return Promise.reject(apiError);
    }

    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        { refreshToken: refreshTokenValue },
        { headers: { "Content-Type": "application/json" } }
      );

      setTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearTokens();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
