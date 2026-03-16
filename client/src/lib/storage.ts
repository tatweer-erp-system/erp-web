/**
 * Centralized localStorage wrapper.
 * All localStorage keys are defined here to prevent typos and enable type safety.
 * Components should use AppSettingsContext or AuthContext instead of these directly.
 * This module is for use by stores, contexts, and low-level utilities only.
 */

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: "web_access_token",
  REFRESH_TOKEN: "web_refresh_token",
  USER: "erp_user",
  TENANT: "erp_tenant",
  BRANCHES: "erp_branches",
  SELECTED_BRANCH: "erp_selected_branch",

  // App settings
  THEME: "app-theme",
  ACCENT_COLOR: "app-accent-color",
  THEME_RADIUS: "app-theme-radius",
  PRESET: "app-preset",
  LANGUAGE: "app-language",
  BRANCH: "app-branch",
  PIN_STYLE: "app-pin-style",
  DEFINITIONS_TAB_POS: "app-definitions-tab-pos",
  DEFINITIONS_LAYOUT: "app-definitions-layout",
  SETTINGS_LAYOUT: "app-settings-layout",
  DEFINITIONS_CRUD_STYLE: "app-definitions-crud-style",
  POS_CARD_STYLE: "app-pos-card-style",
  POS_GRID_COLS: "app-pos-grid-cols",
  DENSITY: "app-density",
  THEME_OPTION: "app-theme-option",

  // Sidebar
  SIDEBAR_OPEN_KEYS: "sidebarOpenKeys",

  // Login
  REMEMBERED_EMAIL: "remembered-email",

  // POS
  POS_CASHIER_SESSION: "pos-cashier-session",
  POS_RESTAURANT_MODE: "pos-restaurant-mode",
  POS_TABLE_MANAGEMENT: "pos-restaurant-table-management",
  POS_COURSE_MANAGEMENT: "pos-restaurant-course-management",
  POS_KITCHEN_PRINTING: "pos-restaurant-kitchen-printing",
  POS_AUTO_SEND_KITCHEN: "pos-restaurant-auto-send-kitchen",
  POS_ALLOW_TAKEAWAY: "pos-restaurant-allow-takeaway",
  POS_DEFAULT_GUESTS: "pos-restaurant-default-guests",
  POS_OFFLINE_ENABLED: "pos-offline-enabled",
  POS_CACHE_INTERVAL: "pos-cache-interval",
  POS_LAST_CACHE_SYNC: "pos-last-cache-sync",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function getStorageItem(key: StorageKey): string | null {
  return localStorage.getItem(key);
}

export function setStorageItem(key: StorageKey, value: string): void {
  localStorage.setItem(key, value);
}

export function removeStorageItem(key: StorageKey): void {
  localStorage.removeItem(key);
}

export function getStorageJSON<T>(key: StorageKey): T | null {
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
}

export function setStorageJSON(key: StorageKey, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
