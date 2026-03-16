/**
 * Generates Ant Design 6 ConfigProvider theme tokens from the current ThemeConfig.
 * Keeps all antd token computation in a single place.
 */

import { theme as antTheme } from "antd";
import type { ThemeConfig as AntThemeConfig } from "antd";

import type { ThemeConfig, ThemeColorPalette } from "@/theme/theme.types";
import {
  FONT_SIZE_MAP,
  BORDER_RADIUS_MAP,
  TABLE_DENSITY_MAP,
} from "@/theme/theme.types";
import { getPresetById } from "@/theme/theme.presets";
import { resolveMode } from "@/theme/theme.utils";

// ─── Fallback Palettes ───────────────────────────────────────────────────────

const LIGHT_FALLBACK: ThemeColorPalette = {
  primary: "#3B82F6",
  primaryForeground: "#FFFFFF",
  primaryLight: "#EFF6FF",
  primaryDark: "#2563EB",
  secondary: "#64748B",
  secondaryForeground: "#FFFFFF",
  secondaryLight: "#F1F5F9",
  background: "#F8FAFC",
  foreground: "#1E293B",
  card: "#FFFFFF",
  cardForeground: "#1E293B",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",
  accent: "#3B82F6",
  accentForeground: "#FFFFFF",
  border: "#E2E8F0",
  input: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
  chart1: "#3B82F6",
  chart2: "#6366F1",
  chart3: "#8B5CF6",
  chart4: "#EC4899",
  chart5: "#F43F5E",
};

const DARK_FALLBACK: ThemeColorPalette = {
  primary: "#37D399",
  primaryForeground: "#0f1f16",
  primaryLight: "#1a3a2a",
  primaryDark: "#059669",
  secondary: "#8a9a8a",
  secondaryForeground: "#e8ede8",
  secondaryLight: "#1a201a",
  background: "#060D08",
  foreground: "#e8ede8",
  card: "#2C2E2D",
  cardForeground: "#e8ede8",
  muted: "#0E120E",
  mutedForeground: "#8a9a8a",
  accent: "#37D399",
  accentForeground: "#0f1f16",
  border: "#1a201a",
  input: "#060D08",
  success: "#34D399",
  warning: "#FBBF24",
  error: "#F87171",
  info: "#60A5FA",
  chart1: "#37D399",
  chart2: "#60A5FA",
  chart3: "#A78BFA",
  chart4: "#F472B6",
  chart5: "#FB7185",
};

// ─── Palette Resolution ──────────────────────────────────────────────────────

/** Resolves the active color palette based on config and mode */
export function resolveColorPalette(config: ThemeConfig): ThemeColorPalette {
  const mode = resolveMode(config.mode);
  const preset = config.presetId ? getPresetById(config.presetId) : undefined;

  if (preset) return preset[mode];
  return mode === "dark" ? DARK_FALLBACK : LIGHT_FALLBACK;
}

// ─── Primary Color Resolution ────────────────────────────────────────────────

/** Resolves the effective primary color (accent override > preset > fallback) */
function resolvePrimary(
  config: ThemeConfig,
  palette: ThemeColorPalette
): string {
  if (config.accentColor) return config.accentColor;
  if (config.primaryColor) return config.primaryColor;
  return palette.primary;
}

// ─── Token Generator ─────────────────────────────────────────────────────────

/** Generates a complete Ant Design theme config from the app ThemeConfig */
export function generateAntTheme(config: ThemeConfig): AntThemeConfig {
  const isDark = resolveMode(config.mode) === "dark";
  const palette = resolveColorPalette(config);
  const primary = resolvePrimary(config, palette);
  const fontSize = FONT_SIZE_MAP[config.fontSize];
  const borderRadius = BORDER_RADIUS_MAP[config.borderRadius];
  const density = TABLE_DENSITY_MAP[config.tableDensity];

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primary,
      colorBgBase: palette.background,
      colorBgContainer: palette.card,
      colorBgLayout: palette.background,
      colorBorder: palette.border,
      colorBorderSecondary: isDark ? "#232923" : "#EFF3F7",
      colorText: palette.foreground,
      colorTextSecondary: palette.mutedForeground,
      colorTextTertiary: palette.mutedForeground,
      colorTextQuaternary: palette.mutedForeground,
      colorFill: palette.muted,
      colorFillAlter: isDark ? "#1a1f1a" : "#F8FAFC",
      colorFillSecondary: palette.muted,
      borderRadius,
      borderRadiusLG: Math.min(borderRadius + 2, 20),
      borderRadiusSM: Math.max(borderRadius - 2, 0),
      borderRadiusXS: Math.max(borderRadius - 4, 0),
      fontFamily: config.fontFamily || "inherit",
      fontSize,
      fontSizeSM: Math.max(fontSize - 2, 10),
      lineHeight: 1.5,
      colorError: palette.error,
      colorWarning: palette.warning,
      colorSuccess: palette.success,
      colorInfo: palette.info,
      controlHeight: 34,
      controlHeightSM: 28,
      controlHeightLG: 40,
      paddingContentVertical: 10,
      boxShadow:
        "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
      boxShadowSecondary:
        "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
    },
    components: {
      Menu: buildMenuTokens(primary, palette, isDark),
      Table: buildTableTokens(palette, isDark, density),
      Card: { paddingLG: 16, headerBg: "transparent" },
      Modal: { titleFontSize: 15, paddingMD: 24, headerBg: palette.card },
      Form: {
        labelFontSize: Math.max(fontSize - 1, 11),
        verticalLabelPadding: "0 0 5px",
        itemMarginBottom: 16,
      },
      Button: {
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
      },
      Input: {
        paddingInline: 12,
        colorBgContainer: palette.card,
        activeBorderColor: primary,
        hoverBorderColor: isDark ? "#232923" : "#EFF3F7",
      },
      InputNumber: { paddingInline: 12, colorBgContainer: palette.card },
      Select: {
        optionPadding: "6px 12px",
        colorBgContainer: palette.card,
        selectorBg: palette.card,
      },
      DatePicker: {
        colorBgContainer: palette.card,
        colorBgElevated: palette.card,
      },
      Segmented: {
        trackBg: palette.muted,
        itemSelectedBg: palette.card,
        itemSelectedColor: palette.foreground,
      },
      Statistic: {
        titleFontSize: Math.max(fontSize - 1, 11),
        contentFontSize: 24,
      },
      Tag: { defaultBg: palette.muted },
      Progress: { defaultColor: primary },
      Breadcrumb: {
        linkColor: palette.mutedForeground,
        linkHoverColor: primary,
        lastItemColor: palette.foreground,
        separatorColor: isDark ? "#232923" : "#EFF3F7",
        fontSize: Math.max(fontSize - 1, 11),
      },
      Layout: {
        headerBg: palette.card,
        headerHeight: 56,
        siderBg: isDark ? "#141714" : palette.card,
        triggerBg: palette.muted,
        triggerColor: palette.foreground,
      },
      Dropdown: { colorBgElevated: palette.card },
      Popover: { colorBgElevated: palette.card },
    },
  };
}

// ─── Component Token Builders ────────────────────────────────────────────────

function buildMenuTokens(
  primary: string,
  palette: ThemeColorPalette,
  isDark: boolean
) {
  return {
    itemBg: "transparent",
    subMenuItemBg: "transparent",
    itemSelectedBg: isDark ? "#0E120E" : palette.muted,
    itemHoverBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    itemSelectedColor: primary,
    itemColor: isDark ? "rgba(232,237,232,0.6)" : "rgba(30,41,59,0.6)",
    itemHoverColor: palette.foreground,
    groupTitleColor: isDark
      ? "rgba(138,154,138,0.45)"
      : "rgba(100,116,139,0.5)",
    groupTitleFontSize: 10,
    activeBarBorderSize: 0,
    activeBarWidth: 0,
    itemBorderRadius: 8,
    itemMarginInline: 6,
    itemMarginBlock: 1,
    itemPaddingInline: 12,
    iconSize: 15,
    iconMarginInlineEnd: 10,
    popupBg: isDark ? "#141714" : palette.card,
    darkPopupBg: isDark ? "#141714" : palette.card,
  };
}

function buildTableTokens(
  palette: ThemeColorPalette,
  isDark: boolean,
  density: { block: number; inline: number }
) {
  return {
    headerBg: isDark ? "#0E120E" : palette.muted,
    rowHoverBg: isDark ? "#1a201a" : palette.muted,
    borderColor: palette.border,
    headerSplitColor: "transparent",
    headerColor: palette.mutedForeground,
    rowSelectedBg: isDark ? "#1a2a1a" : "#EFF6FF",
    rowSelectedHoverBg: isDark ? "#1f2f1f" : "#DBEAFE",
    cellPaddingBlock: density.block,
    cellPaddingInline: density.inline,
  };
}
