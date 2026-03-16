/**
 * Theme system types for the ThemeCustomizer and theme store.
 * Mirrors the Ant Design 6 token system with ERP-specific extensions.
 */

/** Light / Dark / System mode */
export const ThemeMode = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

/** Pre-built theme presets */
export const ThemePreset = {
  DEFAULT: "default",
  DARK: "dark",
  OCEAN: "ocean",
  FOREST: "forest",
  SUNSET: "sunset",
  CORPORATE: "corporate",
} as const;
export type ThemePreset = (typeof ThemePreset)[keyof typeof ThemePreset];

/** Sidebar position */
export const SidebarPosition = {
  LEFT: "left",
  RIGHT: "right",
} as const;
export type SidebarPosition =
  (typeof SidebarPosition)[keyof typeof SidebarPosition];

/** Navigation visual style */
export const NavStyle = {
  FILLED: "filled",
  OUTLINED: "outlined",
  MINIMAL: "minimal",
} as const;
export type NavStyle = (typeof NavStyle)[keyof typeof NavStyle];

/** Table row density */
export const TableDensity = {
  COMPACT: "compact",
  DEFAULT: "default",
  COMFORTABLE: "comfortable",
} as const;
export type TableDensity = (typeof TableDensity)[keyof typeof TableDensity];

/** Border radius preset */
export const BorderRadiusPreset = {
  NONE: "none",
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;
export type BorderRadiusPreset =
  (typeof BorderRadiusPreset)[keyof typeof BorderRadiusPreset];

/** Font size preset */
export const FontSizePreset = {
  SMALL: "small",
  MEDIUM: "medium",
  LARGE: "large",
} as const;
export type FontSizePreset =
  (typeof FontSizePreset)[keyof typeof FontSizePreset];

/** Text direction */
export const Direction = {
  LTR: "ltr",
  RTL: "rtl",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

/** Full theme configuration persisted in the theme store */
export type ThemeConfig = {
  /** Active preset name */
  preset: ThemePreset;

  /** Light / dark / system */
  mode: ThemeMode;

  /** Primary brand color (hex) */
  primaryColor: string;

  /** Accent / secondary color (hex) */
  accentColor: string;

  /** Font family name */
  fontFamily: string;

  /** Font size preset */
  fontSize: FontSizePreset;

  /** Border radius preset */
  borderRadius: BorderRadiusPreset;

  /** Whether sidebar is collapsed */
  isSidebarCollapsed: boolean;

  /** Sidebar position */
  sidebarPosition: SidebarPosition;

  /** Navigation item visual style */
  navStyle: NavStyle;

  /** Table row density */
  tableDensity: TableDensity;

  /** Text direction */
  direction: Direction;
};
