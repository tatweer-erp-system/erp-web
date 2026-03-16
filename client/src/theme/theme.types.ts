/**
 * Theme system types for the Tatweer ERP theme customizer.
 * All theme-related shapes are defined here as the single source of truth.
 */

// ─── Primitive Unions (as const) ─────────────────────────────────────────────

export const ThemeMode = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

export const LayoutStyle = {
  SIDEBAR_EXPANDED: "sidebar-expanded",
  SIDEBAR_COLLAPSED: "sidebar-collapsed",
} as const;
export type LayoutStyle = (typeof LayoutStyle)[keyof typeof LayoutStyle];

export const NavStyle = {
  FILLED: "filled",
  OUTLINED: "outlined",
  MINIMAL: "minimal",
} as const;
export type NavStyle = (typeof NavStyle)[keyof typeof NavStyle];

export const TableDensity = {
  COMPACT: "compact",
  DEFAULT: "default",
  COMFORTABLE: "comfortable",
} as const;
export type TableDensity = (typeof TableDensity)[keyof typeof TableDensity];

export const FontSize = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;
export type FontSize = (typeof FontSize)[keyof typeof FontSize];

export const BorderRadiusPreset = {
  NONE: "none",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;
export type BorderRadiusPreset =
  (typeof BorderRadiusPreset)[keyof typeof BorderRadiusPreset];

export const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const SidebarPosition = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type SidebarPosition =
  (typeof SidebarPosition)[keyof typeof SidebarPosition];

// ─── Color Palette ───────────────────────────────────────────────────────────

export type ThemeColorPalette = {
  primary: string;
  primaryForeground: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryForeground: string;
  secondaryLight: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
};

// ─── Preset ──────────────────────────────────────────────────────────────────

export type ThemePreset = {
  id: string;
  name: string;
  label: string;
  light: ThemeColorPalette;
  dark: ThemeColorPalette;
};

// ─── Full Theme Config ───────────────────────────────────────────────────────

export type ThemeConfig = {
  primaryColor: string;
  accentColor: string;
  mode: ThemeMode;
  fontSize: FontSize;
  fontFamily: string;
  borderRadius: BorderRadiusPreset;
  layout: LayoutStyle;
  sidebarPosition: SidebarPosition;
  navStyle: NavStyle;
  tableDensity: TableDensity;
  direction: Direction;
  presetId: string | null;
};

// ─── Font Size Pixel Map ─────────────────────────────────────────────────────

export const FONT_SIZE_MAP: Record<FontSize, number> = {
  small: 12,
  medium: 14,
  large: 16,
} as const;

// ─── Border Radius Pixel Map ─────────────────────────────────────────────────

export const BORDER_RADIUS_MAP: Record<BorderRadiusPreset, number> = {
  none: 0,
  small: 4,
  medium: 6,
  large: 10,
} as const;

// ─── Table Density Padding Map ───────────────────────────────────────────────

export const TABLE_DENSITY_MAP: Record<
  TableDensity,
  { block: number; inline: number }
> = {
  compact: { block: 6, inline: 10 },
  default: { block: 10, inline: 14 },
  comfortable: { block: 14, inline: 18 },
} as const;
