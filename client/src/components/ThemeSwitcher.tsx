import React from "react";
import { useThemeSystem, type ColorScheme, type ThemeMode } from "../contexts/AppSettingsContext";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, mode, setTheme, setMode, toggleMode, themes, currentColors } = useThemeSystem();

  return (
    <div className="space-y-6">
      {/* Light/Dark Mode Toggle */}
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: currentColors.textPrimary }}>
          Display Mode
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              mode === "light"
                ? "border-current bg-opacity-10"
                : "border-current opacity-50"
            }`}
            style={{
              borderColor: currentColors.accent,
              backgroundColor: mode === "light" ? currentColors.accent + "20" : "transparent",
              color: mode === "light" ? currentColors.accent : currentColors.textPrimary,
            }}
          >
            <Sun size={18} />
            <span>Light</span>
          </button>
          <button
            onClick={() => setMode("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              mode === "dark"
                ? "border-current bg-opacity-10"
                : "border-current opacity-50"
            }`}
            style={{
              borderColor: currentColors.accent,
              backgroundColor: mode === "dark" ? currentColors.accent + "20" : "transparent",
              color: mode === "dark" ? currentColors.accent : currentColors.textPrimary,
            }}
          >
            <Moon size={18} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: currentColors.textPrimary }}>
          Color Theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {themes.map((t) => {
            const themeColors = t[mode];
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as ColorScheme)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  theme === t.id
                    ? "border-2"
                    : "border-current opacity-70 hover:opacity-100"
                }`}
                style={{
                  borderColor: theme === t.id ? themeColors.accent : currentColors.border,
                  backgroundColor: themeColors.surface,
                }}
              >
                {/* Color swatches */}
                <div className="grid grid-cols-2 gap-1 mb-3">
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: themeColors.accent }}
                    title="Accent"
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: themeColors.border }}
                    title="Border"
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: themeColors.background }}
                    title="Background"
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: themeColors.sidebar }}
                    title="Sidebar"
                  />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: themeColors.textPrimary }}
                >
                  {t.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Theme Preview */}
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: currentColors.textPrimary }}>
          Preview
        </label>
        <div
          className="p-6 rounded-lg border-2 space-y-4"
          style={{
            backgroundColor: currentColors.surface,
            borderColor: currentColors.border,
          }}
        >
          <div>
            <p
              className="text-sm font-medium mb-2"
              style={{ color: currentColors.textPrimary }}
            >
              Primary Text
            </p>
            <p style={{ color: currentColors.textSecondary }}>Secondary Text</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded text-white text-sm"
              style={{ backgroundColor: currentColors.accent }}
            >
              Accent Button
            </button>
            <div
              className="px-3 py-1 rounded text-sm"
              style={{
                backgroundColor: currentColors.border,
                color: currentColors.textPrimary,
              }}
            >
              Border Element
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
