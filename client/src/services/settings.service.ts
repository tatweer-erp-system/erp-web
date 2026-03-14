import apiClient from "@/lib/api";
import type { ApiResponse } from "@/types/api";

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
  avatarUrl?: string;
  preferredLang: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string;
  bio?: string;
}

export const profileService = {
  get: () =>
    apiClient.get<ApiResponse<UserProfile>>("/users/me").then(r => r.data.data),

  update: (dto: UpdateProfileDto) =>
    apiClient
      .patch<ApiResponse<UserProfile>>("/users/me/profile", dto)
      .then(r => r.data.data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return apiClient
      .post<ApiResponse<{ avatarUrl: string }>>("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(r => r.data.data);
  },
};

// ─── General Settings ─────────────────────────────────────────────────────────

export interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  financialYear: string;
  numberFormat: string;
}

export const generalSettingsService = {
  get: () =>
    apiClient
      .get<ApiResponse<GeneralSettings>>("/config/general")
      .then(r => r.data.data),

  update: (dto: Partial<GeneralSettings>) =>
    apiClient
      .patch<ApiResponse<GeneralSettings>>("/config/general", dto)
      .then(r => r.data.data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationPreference {
  eventType: string;
  channel: string;
  enabled: boolean;
}

export interface NotificationSettings {
  preferences: NotificationPreference[];
  digestFrequency?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export const notificationSettingsService = {
  get: () =>
    apiClient
      .get<ApiResponse<NotificationSettings>>("/notifications/preferences")
      .then(r => r.data.data),

  update: (dto: Partial<NotificationSettings>) =>
    apiClient
      .patch<
        ApiResponse<NotificationSettings>
      >("/notifications/preferences", dto)
      .then(r => r.data.data),
};

// ─── Security ─────────────────────────────────────────────────────────────────

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  qrCodeUri: string;
  secret: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export const securityService = {
  changePassword: (dto: ChangePasswordDto) =>
    apiClient
      .patch<ApiResponse<void>>("/users/me/password", dto)
      .then(r => r.data),

  get2faSetup: () =>
    apiClient
      .get<ApiResponse<TwoFactorSetup>>("/auth/2fa/setup")
      .then(r => r.data.data),

  verify2fa: (code: string) =>
    apiClient
      .post<ApiResponse<void>>("/auth/2fa/verify", { code })
      .then(r => r.data),

  disable2fa: (password: string) =>
    apiClient
      .delete<ApiResponse<void>>("/auth/2fa", { data: { password } })
      .then(r => r.data),

  getSessions: () =>
    apiClient
      .get<ApiResponse<Session[]>>("/auth/sessions")
      .then(r => r.data.data),

  revokeSession: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/auth/sessions/${id}`)
      .then(r => r.data),

  revokeAllSessions: () =>
    apiClient.delete<ApiResponse<void>>("/auth/sessions").then(r => r.data),
};

// ─── Appearance ───────────────────────────────────────────────────────────────

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  primaryColor: string;
  language: "en" | "ar";
  density: "compact" | "default" | "comfortable";
}

export const appearanceService = {
  get: () =>
    apiClient
      .get<ApiResponse<AppearanceSettings>>("/users/me/appearance")
      .then(r => r.data.data),

  update: (dto: Partial<AppearanceSettings>) =>
    apiClient
      .patch<ApiResponse<AppearanceSettings>>("/users/me/appearance", dto)
      .then(r => r.data.data),
};
