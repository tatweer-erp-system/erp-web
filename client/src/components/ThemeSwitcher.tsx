import React from "react";
import { useAppSettings } from "../contexts/AppSettingsContext";
import { Moon, Sun } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setMode, preset, setPreset, presets, accentColor } =
    useAppSettings();

  const activeColor =
    accentColor ||
    (preset ? presets.find(p => p.id === preset)?.[theme].primary : null) ||
    "#3B82F6";

  return (
    <div className="space-y-6">
      {/* Light/Dark Mode Toggle */}
      <div>
        <label className="block text-sm font-medium mb-4 text-foreground">
          Display Mode
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Sun size={18} />
            <span>Light</span>
          </button>
          <button
            onClick={() => setMode("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <Moon size={18} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Theme Presets */}
      <div>
        <label className="block text-sm font-medium mb-4 text-foreground">
          Color Theme
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presets.map(p => {
            const colors = p[theme];
            const isActive = preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(isActive ? null : p.id)}
                className={`p-4 rounded-lg border-2 transition-all text-center`}
                style={{
                  borderColor: isActive ? colors.primary : "var(--border)",
                  backgroundColor: colors.card,
                }}
              >
                <div className="grid grid-cols-2 gap-1 mb-3">
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: colors.secondary }}
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: colors.background }}
                  />
                  <div
                    className="h-4 rounded"
                    style={{ backgroundColor: colors.border }}
                  />
                </div>
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.foreground }}
                >
                  {p.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
