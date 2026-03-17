import { useThemeStore } from "@/stores/theme.store";
import { getPresetById } from "@/theme/theme.presets";

/**
 * Convenience wrapper around the theme store for theme-related state.
 *
 * Returns the current theme mode, accent color, radius, preset, and their setters.
 */
export function useTheme() {
  const mode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);
  const accentColor = useThemeStore(s => s.accentColor);
  const setAccentColor = useThemeStore(s => s.setAccentColor);
  const borderRadius = useThemeStore(s => s.borderRadius);
  const setBorderRadius = useThemeStore(s => s.setBorderRadius);
  const presetId = useThemeStore(s => s.presetId);
  const setPreset = useThemeStore(s => s.setPreset);

  const currentPreset = presetId ? (getPresetById(presetId) ?? null) : null;

  return {
    mode,
    toggleMode: () => setMode(mode === "dark" ? "light" : "dark"),
    setMode,
    accentColor,
    setAccentColor,
    borderRadius,
    setBorderRadius,
    preset: presetId,
    setPreset,
    currentPreset,
  };
}
