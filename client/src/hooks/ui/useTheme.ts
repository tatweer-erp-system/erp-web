import { useAppSettings } from "@/contexts/AppSettingsContext";

/**
 * Convenience wrapper around the app settings context for theme-related state.
 *
 * Returns the current theme mode, accent color, radius, preset, and their setters.
 * Once `theme.store.ts` replaces `AppSettingsContext`, this hook's internals change
 * but the public API stays the same.
 */
export function useTheme() {
  const {
    theme,
    toggleTheme,
    setMode,
    accentColor,
    setAccentColor,
    themeRadius,
    setThemeRadius,
    preset,
    setPreset,
    presets,
    currentPreset,
  } = useAppSettings();

  return {
    mode: theme,
    toggleMode: toggleTheme,
    setMode,
    accentColor,
    setAccentColor,
    borderRadius: themeRadius,
    setBorderRadius: setThemeRadius,
    preset,
    setPreset,
    presets,
    currentPreset,
  };
}
