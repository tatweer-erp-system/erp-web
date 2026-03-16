/**
 * Theme utility functions: CSS variable application, system mode detection,
 * and resolved mode computation.
 */

import type {
  ThemeColorPalette,
  ThemeMode,
  BorderRadiusPreset,
  FontSize,
} from "@/theme/theme.types";
import { BORDER_RADIUS_MAP, FONT_SIZE_MAP } from "@/theme/theme.types";

// ─── System Mode Detection ───────────────────────────────────────────────────

/** Returns the OS-level color scheme preference */
export function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
}

/** Resolves 'system' mode to the actual light/dark value */
export function resolveMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return getSystemMode();
  return mode;
}

// ─── CSS Variable Application ────────────────────────────────────────────────

/** Applies a full color palette to :root CSS variables */
export function applyColorPalette(palette: ThemeColorPalette): void {
  const root = document.documentElement;

  root.style.setProperty("--primary", palette.primary);
  root.style.setProperty("--primary-foreground", palette.primaryForeground);
  root.style.setProperty("--secondary", palette.secondary);
  root.style.setProperty("--secondary-foreground", palette.secondaryForeground);
  root.style.setProperty("--background", palette.background);
  root.style.setProperty("--foreground", palette.foreground);
  root.style.setProperty("--card", palette.card);
  root.style.setProperty("--card-foreground", palette.cardForeground);
  root.style.setProperty("--popover", palette.card);
  root.style.setProperty("--popover-foreground", palette.cardForeground);
  root.style.setProperty("--muted", palette.muted);
  root.style.setProperty("--muted-foreground", palette.mutedForeground);
  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-foreground", palette.accentForeground);
  root.style.setProperty("--border", palette.border);
  root.style.setProperty("--input", palette.input);
  root.style.setProperty("--ring", palette.primary);
  root.style.setProperty("--chart-1", palette.chart1);
  root.style.setProperty("--chart-2", palette.chart2);
  root.style.setProperty("--chart-3", palette.chart3);
  root.style.setProperty("--chart-4", palette.chart4);
  root.style.setProperty("--chart-5", palette.chart5);
}

/** Applies border radius CSS variables from a preset name */
export function applyBorderRadius(preset: BorderRadiusPreset): void {
  const root = document.documentElement;
  const px = BORDER_RADIUS_MAP[preset];

  root.style.setProperty("--radius", `${px}px`);
  root.style.setProperty("--radius-sm", `${Math.max(px - 4, 0)}px`);
  root.style.setProperty("--radius-md", `${Math.max(px - 2, 0)}px`);
  root.style.setProperty("--radius-lg", `${px + 2}px`);
  root.style.setProperty("--radius-xl", `${px + 4}px`);
}

/** Applies font size CSS variable from a size preset name */
export function applyFontSize(size: FontSize): void {
  const px = FONT_SIZE_MAP[size];
  document.documentElement.style.setProperty("--font-size-base", `${px}px`);
}

/** Applies font family to :root */
export function applyFontFamily(family: string): void {
  document.documentElement.style.setProperty("--font-family", family);
}

/** Toggles the dark class on <html> and sets color-scheme */
export function applyDarkMode(isDark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.setProperty("color-scheme", isDark ? "dark" : "light");
}

/** Override the primary color CSS variables (for custom accent) */
export function applyAccentOverride(hex: string): void {
  if (!hex) return;
  const root = document.documentElement;
  root.style.setProperty("--primary", hex);
  root.style.setProperty("--ring", hex);
  root.style.setProperty("--sidebar-primary", hex);
}
