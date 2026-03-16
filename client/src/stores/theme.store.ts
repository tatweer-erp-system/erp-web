/**
 * Zustand store for the Tatweer ERP theme customizer.
 * Persists all theme preferences to localStorage and applies CSS variables.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  ThemeConfig,
  ThemeMode,
  FontSize,
  BorderRadiusPreset,
  LayoutStyle,
  NavStyle,
  TableDensity,
  Direction,
  SidebarPosition,
} from "@/theme/theme.types";
import {
  applyColorPalette,
  applyBorderRadius,
  applyFontSize,
  applyFontFamily,
  applyDarkMode,
  applyAccentOverride,
  resolveMode,
} from "@/theme/theme.utils";
import { resolveColorPalette } from "@/theme/theme.config";

// ─── Default Config ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ThemeConfig = {
  primaryColor: "",
  accentColor: "",
  mode: "dark",
  fontSize: "medium",
  fontFamily: "inherit",
  borderRadius: "medium",
  layout: "sidebar-expanded",
  sidebarPosition: "left",
  navStyle: "filled",
  tableDensity: "default",
  direction: "ltr",
  presetId: "default",
};

// ─── Store Shape ─────────────────────────────────────────────────────────────

type ThemeActions = {
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setPreset: (presetId: string | null) => void;
  setFontSize: (size: FontSize) => void;
  setFontFamily: (family: string) => void;
  setBorderRadius: (radius: BorderRadiusPreset) => void;
  setLayout: (layout: LayoutStyle) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  setNavStyle: (style: NavStyle) => void;
  setTableDensity: (density: TableDensity) => void;
  setDirection: (direction: Direction) => void;
  resetToDefault: () => void;
  hydrate: () => void;
};

type ThemeStore = ThemeConfig & ThemeActions;

// ─── Side-Effect Helper ──────────────────────────────────────────────────────

function applyAllEffects(config: ThemeConfig): void {
  const resolved = resolveMode(config.mode);
  const isDark = resolved === "dark";

  applyDarkMode(isDark);

  const palette = resolveColorPalette(config);
  applyColorPalette(palette);

  if (config.accentColor) {
    applyAccentOverride(config.accentColor);
  } else if (config.primaryColor) {
    applyAccentOverride(config.primaryColor);
  }

  applyBorderRadius(config.borderRadius);
  applyFontSize(config.fontSize);
  applyFontFamily(config.fontFamily);
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      setMode: mode => {
        set({ mode });
        applyAllEffects({ ...get(), mode });
      },

      setPrimaryColor: primaryColor => {
        set({ primaryColor });
        applyAllEffects({ ...get(), primaryColor });
      },

      setAccentColor: accentColor => {
        set({ accentColor });
        applyAllEffects({ ...get(), accentColor });
      },

      setPreset: presetId => {
        set({ presetId, primaryColor: "", accentColor: "" });
        applyAllEffects({
          ...get(),
          presetId,
          primaryColor: "",
          accentColor: "",
        });
      },

      setFontSize: fontSize => {
        set({ fontSize });
        applyFontSize(fontSize);
      },

      setFontFamily: fontFamily => {
        set({ fontFamily });
        applyFontFamily(fontFamily);
      },

      setBorderRadius: borderRadius => {
        set({ borderRadius });
        applyBorderRadius(borderRadius);
      },

      setLayout: layout => {
        set({ layout });
      },

      setSidebarPosition: sidebarPosition => {
        set({ sidebarPosition });
      },

      setNavStyle: navStyle => {
        set({ navStyle });
      },

      setTableDensity: tableDensity => {
        set({ tableDensity });
      },

      setDirection: direction => {
        set({ direction });
        document.documentElement.setAttribute("dir", direction);
        document.documentElement.setAttribute(
          "lang",
          direction === "rtl" ? "ar" : "en"
        );
      },

      resetToDefault: () => {
        set(DEFAULT_CONFIG);
        applyAllEffects(DEFAULT_CONFIG);
      },

      hydrate: () => {
        applyAllEffects(get());
      },
    }),
    {
      name: "erp-theme-config",
      partialize: state => ({
        primaryColor: state.primaryColor,
        accentColor: state.accentColor,
        mode: state.mode,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        borderRadius: state.borderRadius,
        layout: state.layout,
        sidebarPosition: state.sidebarPosition,
        navStyle: state.navStyle,
        tableDensity: state.tableDensity,
        direction: state.direction,
        presetId: state.presetId,
      }),
      onRehydrate: (_state, _error) => {
        // Called after rehydration completes; apply stored theme to DOM
        return rehydratedState => {
          if (rehydratedState) {
            applyAllEffects(rehydratedState);
          }
        };
      },
    }
  )
);
