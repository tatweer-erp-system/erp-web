import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/types/api";
import type { LoginResponse, RefreshResponse } from "@/types/auth";
import type {
  UserProfile,
  UpdateProfileDto,
  ChangePasswordDto,
} from "@/services/settings.service";

type LoginParams = {
  email: string;
  password: string;
};

type ChangePasswordParams = ChangePasswordDto;

type UpdateProfileParams = UpdateProfileDto;

/** Authenticate user with email and password */
export function login(params: LoginParams) {
  return apiClient
    .post<ApiResponse<LoginResponse>>("/auth/login", params)
    .then(r => r.data);
}

/** End the current session */
export function logout() {
  return apiClient.post<ApiResponse<void>>("/auth/logout").then(r => r.data);
}

/** Exchange a refresh token for new token pair */
export function refreshToken(token: string) {
  return apiClient
    .post<ApiResponse<RefreshResponse>>("/auth/refresh", {
      refreshToken: token,
    })
    .then(r => r.data);
}

/** Fetch the currently authenticated user */
export function getMe() {
  return apiClient.get<ApiResponse<UserProfile>>("/users/me").then(r => r.data);
}

/** Update the current user's profile */
export function updateProfile(params: UpdateProfileParams) {
  return apiClient
    .patch<ApiResponse<UserProfile>>("/users/me/profile", params)
    .then(r => r.data);
}

/** Change the current user's password */
export function changePassword(params: ChangePasswordParams) {
  return apiClient
    .patch<ApiResponse<void>>("/users/me/password", params)
    .then(r => r.data);
}
