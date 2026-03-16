import { useRef, useState, useEffect, useCallback } from "react";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import type { ThemeMode } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { useMutation } from "@tanstack/react-query";
import { Radio, Typography, theme as antTheme } from "antd";
import { CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import { appearanceService } from "@/services/settings.service";
import type { AppearanceSettings } from "@/services/settings.service";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "@/lib/storage";

const { Text } = Typography;

// ─── Color presets ────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  { name: "Blue", value: "#1677ff" },
  { name: "Purple", value: "#722ED1" },
  { name: "Green", value: "#52C41A" },
  { name: "Orange", value: "#FA8C16" },
  { name: "Red", value: "#F5222D" },
  { name: "Cyan", value: "#13C2C2" },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  const { token } = antTheme.useToken();
  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {title && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {title}
          </Text>
          {description && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {description}
              </Text>
            </>
          )}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  const { token } = antTheme.useToken();
  return (
    <div
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border: selected ? `3px solid ${color}` : "3px solid transparent",
        outline: selected ? `2px solid ${token.colorBgContainer}` : "none",
        outlineOffset: -5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
    >
      {selected && (
        <CheckOutlined
          style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}
        />
      )}
    </div>
  );
}

// ─── AppearanceTab ────────────────────────────────────────────────────────────

export default function AppearanceTab() {
  const { token } = antTheme.useToken();
  const { theme, setMode, accentColor, setAccentColor, language, setLanguage } =
    useAppSettings();

  const [themeOption, setThemeOption] = useState<"light" | "dark">(() => theme);

  const [density, setDensity] = useState<"compact" | "default" | "comfortable">(
    () => {
      return (
        (getStorageItem(STORAGE_KEYS.DENSITY) as
          | "compact"
          | "default"
          | "comfortable") ?? "default"
      );
    }
  );

  const [showSaved, setShowSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lang = language;

  // ── API mutation (silently fails — backend not built yet) ──────────────────

  const saveMutation = useMutation({
    mutationFn: (dto: Partial<AppearanceSettings>) =>
      appearanceService.update(dto),
    onSuccess: () => {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    },
    onError: () => {
      // Suppress errors — backend not built yet
    },
  });

  // ── Debounced save ─────────────────────────────────────────────────────────

  const debouncedSave = useCallback(
    (dto: Partial<AppearanceSettings>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveMutation.mutate(dto);
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleThemeChange = (value: "light" | "dark") => {
    setThemeOption(value);
    setStorageItem(STORAGE_KEYS.THEME_OPTION, value);
    setMode(value);
    debouncedSave({ theme: value });
  };

  const handleColorChange = (color: string) => {
    setAccentColor(color);
    debouncedSave({ primaryColor: color });
  };

  const handleLanguageChange = (value: "en" | "ar") => {
    setLanguage(value);
    document.documentElement.setAttribute(
      "dir",
      value === "ar" ? "rtl" : "ltr"
    );
    debouncedSave({ language: value });
  };

  const handleDensityChange = (
    value: "compact" | "default" | "comfortable"
  ) => {
    setDensity(value);
    setStorageItem(STORAGE_KEYS.DENSITY, value);
    debouncedSave({ density: value });
  };

  return (
    <>
      {/* Saved indicator */}
      {showSaved && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: token.colorSuccess,
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <CheckCircleOutlined /> {t("mySettings.appearance.saved", lang)}
        </div>
      )}

      {/* Section 1: Theme */}
      <Section title={t("mySettings.appearance.theme", lang)}>
        <Radio.Group
          value={themeOption}
          onChange={e => handleThemeChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="light">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sun size={14} />
              {t("mySettings.appearance.themeLight", lang)}
            </span>
          </Radio.Button>
          <Radio.Button value="dark">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Moon size={14} />
              {t("mySettings.appearance.themeDark", lang)}
            </span>
          </Radio.Button>
        </Radio.Group>
      </Section>

      {/* Section 2: Primary Color */}
      <Section title={t("mySettings.appearance.primaryColor", lang)}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {COLOR_PRESETS.map(preset => (
            <ColorSwatch
              key={preset.value}
              color={preset.value}
              selected={accentColor === preset.value}
              onClick={() => handleColorChange(preset.value)}
            />
          ))}
        </div>
      </Section>

      {/* Section 3: Language */}
      <Section title={t("mySettings.appearance.language", lang)}>
        <Radio.Group
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="en">English</Radio.Button>
          <Radio.Button value="ar">
            <span dir="rtl">
              {"\u0627\u0644\u0639\u0631\u0628\u064A\u0629"}
            </span>
          </Radio.Button>
        </Radio.Group>
      </Section>

      {/* Section 4: Display Density */}
      <Section title={t("mySettings.appearance.density", lang)}>
        <Radio.Group
          value={density}
          onChange={e => handleDensityChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="compact">
            {t("mySettings.appearance.densityCompact", lang)}
          </Radio.Button>
          <Radio.Button value="default">
            {t("mySettings.appearance.densityDefault", lang)}
          </Radio.Button>
          <Radio.Button value="comfortable">
            {t("mySettings.appearance.densityComfortable", lang)}
          </Radio.Button>
        </Radio.Group>
      </Section>
    </>
  );
}
