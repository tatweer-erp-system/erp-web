import { useState } from "react";
import {
  Button,
  Divider,
  Drawer,
  Tooltip,
  Typography,
  theme as antTheme,
} from "antd";
import {
  BgColorsOutlined,
  CheckOutlined,
  ReloadOutlined,
  LockOutlined,
  AppstoreOutlined,
  MobileOutlined,
  ProfileOutlined,
  FormOutlined,
  LayoutOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";
import { useThemeStore } from "@/stores/theme.store";
import { useUiStore } from "@/stores/ui.store";
import { THEME_PRESETS } from "@/theme/theme.presets";
import {
  BORDER_RADIUS_MAP,
  type BorderRadiusPreset,
} from "@/theme/theme.types";

const { Text } = Typography;

const PALETTE: { hex: string; label: string }[] = [
  { hex: "#3B82F6", label: "Blue" },
  { hex: "#10B981", label: "Emerald" },
  { hex: "#A855F7", label: "Purple" },
  { hex: "#F97316", label: "Orange" },
  { hex: "#EC4899", label: "Pink" },
  { hex: "#14B8A6", label: "Teal" },
  { hex: "#6366F1", label: "Indigo" },
  { hex: "#06B6D4", label: "Cyan" },
  { hex: "#F59E0B", label: "Amber" },
  { hex: "#F43F5E", label: "Rose" },
  { hex: "#64748B", label: "Slate" },
  { hex: "#84CC16", label: "Lime" },
  { hex: "#0EA5E9", label: "Sky" },
  { hex: "#D946EF", label: "Fuchsia" },
  { hex: "#25671E", label: "Forest" },
  { hex: "#0D1A63", label: "Dark Blue" },
  { hex: "#7C3AED", label: "Violet" },
  { hex: "#DC2626", label: "Red" },
  { hex: "#059669", label: "Green" },
  { hex: "#09122C", label: "Navy" },
];

const RADIUS_PRESETS: {
  label: string;
  value: BorderRadiusPreset;
  preview: number;
}[] = [
  { label: "None", value: "none", preview: 0 },
  { label: "Small", value: "small", preview: 4 },
  { label: "Medium", value: "medium", preview: 6 },
  { label: "Large", value: "large", preview: 10 },
];

function SectionLabel({ children }: { children: string }) {
  const { token } = antTheme.useToken();
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: token.colorTextTertiary,
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function OptionButton({
  isActive,
  onClick,
  children,
  style,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const { token } = antTheme.useToken();
  return (
    <button
      onClick={onClick}
      style={{
        border: `2px solid ${isActive ? token.colorPrimary : token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: isActive ? token.colorPrimaryBg : token.colorBgContainer,
        color: isActive ? token.colorPrimary : token.colorText,
        cursor: "pointer",
        fontSize: 11,
        fontWeight: isActive ? 600 : 400,
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function ThemeCustomizer() {
  const { token } = antTheme.useToken();
  const mode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);
  const accentColor = useThemeStore(s => s.accentColor);
  const setAccentColor = useThemeStore(s => s.setAccentColor);
  const borderRadius = useThemeStore(s => s.borderRadius);
  const setBorderRadius = useThemeStore(s => s.setBorderRadius);
  const presetId = useThemeStore(s => s.presetId);
  const setPreset = useThemeStore(s => s.setPreset);
  const resetToDefault = useThemeStore(s => s.resetToDefault);

  const pinStyle = useUiStore(s => s.pinStyle);
  const setPinStyle = useUiStore(s => s.setPinStyle);
  const definitionsLayout = useUiStore(s => s.definitionsLayout);
  const setDefinitionsLayout = useUiStore(s => s.setDefinitionsLayout);
  const settingsLayout = useUiStore(s => s.settingsLayout);
  const setSettingsLayout = useUiStore(s => s.setSettingsLayout);
  const definitionsCrudStyle = useUiStore(s => s.definitionsCrudStyle);
  const setDefinitionsCrudStyle = useUiStore(s => s.setDefinitionsCrudStyle);

  const [open, setOpen] = useState(false);
  const isDark = mode === "dark";
  const activeColor = accentColor || token.colorPrimary;

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 999,
        }}
      >
        <Tooltip title="Customize Theme" placement="left">
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 40,
              height: 48,
              background: activeColor,
              border: "none",
              borderRadius: "8px 0 0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              boxShadow: `-3px 0 16px ${activeColor}55`,
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          >
            <SettingOutlined style={{ fontSize: 18 }} />
          </button>
        </Tooltip>
      </div>

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BgColorsOutlined
              style={{ color: token.colorPrimary, fontSize: 16 }}
            />
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Theme Customizer
            </span>
          </div>
        }
        extra={
          <Tooltip title="Reset to default theme">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={resetToDefault}
            >
              Reset
            </Button>
          </Tooltip>
        }
        placement="right"
        size={300}
        open={open}
        onClose={() => setOpen(false)}
        styles={{
          body: {
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            overflowX: "hidden",
          },
        }}
      >
        {/* ── Theme Mode ─────────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Appearance</SectionLabel>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              block
              type={!isDark ? "primary" : "default"}
              icon={<SunOutlined />}
              onClick={() => setMode("light")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Light
            </Button>
            <Button
              block
              type={isDark ? "primary" : "default"}
              icon={<MoonOutlined />}
              onClick={() => setMode("dark")}
              style={{ borderRadius: 8, fontWeight: 600 }}
            >
              Dark
            </Button>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* ── Theme Presets ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Theme Presets</SectionLabel>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {THEME_PRESETS.map(p => {
              const colors = p[isDark ? "dark" : "light"];
              const isActive = presetId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setPreset(isActive ? null : p.id);
                    setAccentColor("");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border: `2px solid ${isActive ? colors.primary : token.colorBorderSecondary}`,
                    background: isActive
                      ? `${colors.primary}12`
                      : token.colorFillAlter,
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                      {[
                        colors.primary,
                        colors.secondary,
                        colors.accent,
                        colors.background,
                      ].map((c, i) => (
                        <div
                          key={i}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: c,
                            border: `1px solid ${token.colorBorder}`,
                          }}
                        />
                      ))}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: isActive ? colors.primary : token.colorText,
                      }}
                    >
                      {p.name}
                    </div>
                  </div>
                  {isActive && (
                    <CheckOutlined
                      style={{ color: colors.primary, fontSize: 12 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* ── Primary Color ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Primary Color</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 7,
              marginBottom: 12,
            }}
          >
            {PALETTE.map(c => {
              const isActive = accentColor === c.hex;
              return (
                <Tooltip key={c.hex} title={c.label} placement="top">
                  <button
                    onClick={() => setAccentColor(c.hex)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: 7,
                      background: c.hex,
                      border: isActive
                        ? `2px solid ${token.colorBgContainer}`
                        : "2px solid transparent",
                      outline: isActive
                        ? `2px solid ${c.hex}`
                        : "2px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: isActive ? "scale(1.12)" : "scale(1)",
                      transition: "transform 0.15s, outline 0.15s",
                    }}
                  >
                    {isActive && (
                      <CheckOutlined style={{ fontSize: 10, color: "#fff" }} />
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              background: token.colorFillAlter,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: activeColor,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              />
              <input
                type="color"
                value={activeColor}
                onChange={e => setAccentColor(e.target.value)}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 11, display: "block", fontWeight: 500 }}>
                Custom color
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 11, fontFamily: "monospace" }}
              >
                {activeColor.toUpperCase()}
              </Text>
            </div>
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* ── Border Radius ──────────────────────────────────────────────── */}
        <div>
          <SectionLabel>Border Radius</SectionLabel>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {RADIUS_PRESETS.map(p => {
              const isActive = borderRadius === p.value;
              return (
                <OptionButton
                  key={p.value}
                  isActive={isActive}
                  onClick={() => setBorderRadius(p.value)}
                  style={{
                    padding: "10px 8px",
                    borderRadius: p.preview,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 12,
                      background: isActive
                        ? token.colorPrimary
                        : token.colorFillSecondary,
                      borderRadius: p.preview,
                    }}
                  />
                  {p.label}
                </OptionButton>
              );
            })}
          </div>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* ── UI & Layout ────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: -10,
            }}
          >
            <LayoutOutlined
              style={{ color: token.colorPrimary, fontSize: 13 }}
            />
            <span
              style={{ fontSize: 12, fontWeight: 700, color: token.colorText }}
            >
              UI & Layout
            </span>
          </div>

          {/* PIN Lock Style */}
          <div>
            <SectionLabel>PIN Lock Style</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
              }}
            >
              {[
                {
                  value: 1 as const,
                  label: "Minimal",
                  icon: <LockOutlined style={{ fontSize: 16 }} />,
                },
                {
                  value: 2 as const,
                  label: "Split",
                  icon: <AppstoreOutlined style={{ fontSize: 16 }} />,
                },
                {
                  value: 3 as const,
                  label: "Phone",
                  icon: <MobileOutlined style={{ fontSize: 16 }} />,
                },
              ].map(opt => (
                <OptionButton
                  key={opt.value}
                  isActive={pinStyle === opt.value}
                  onClick={() => setPinStyle(opt.value)}
                  style={{ padding: "12px 6px 10px" }}
                >
                  {opt.icon}
                  {opt.label}
                </OptionButton>
              ))}
            </div>
          </div>

          {/* Definitions Layout */}
          <div>
            <SectionLabel>Definitions Layout</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                { value: "vertical" as const, label: "Vertical" },
                { value: "horizontal" as const, label: "Horizontal" },
              ].map(opt => {
                const isActive = definitionsLayout === opt.value;
                const isVert = opt.value === "vertical";
                return (
                  <OptionButton
                    key={opt.value}
                    isActive={isActive}
                    onClick={() => setDefinitionsLayout(opt.value)}
                    style={{ padding: "12px 6px 10px" }}
                  >
                    {isVert ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 3,
                          width: 32,
                          height: 20,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            background: isActive
                              ? token.colorPrimary
                              : token.colorBorderSecondary,
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: isActive
                              ? `${token.colorPrimary}30`
                              : token.colorFillAlter,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          width: 32,
                          height: 20,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            background: isActive
                              ? token.colorPrimary
                              : token.colorBorderSecondary,
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: isActive
                              ? `${token.colorPrimary}30`
                              : token.colorFillAlter,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    )}
                    {opt.label}
                  </OptionButton>
                );
              })}
            </div>
          </div>

          {/* Settings Layout */}
          <div>
            <SectionLabel>Settings Layout</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                { value: "vertical" as const, label: "Vertical" },
                { value: "horizontal" as const, label: "Horizontal" },
              ].map(opt => {
                const isActive = settingsLayout === opt.value;
                const isVert = opt.value === "vertical";
                return (
                  <OptionButton
                    key={opt.value}
                    isActive={isActive}
                    onClick={() => setSettingsLayout(opt.value)}
                    style={{ padding: "12px 6px 10px" }}
                  >
                    {isVert ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 3,
                          width: 32,
                          height: 20,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            background: isActive
                              ? token.colorPrimary
                              : token.colorBorderSecondary,
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: isActive
                              ? `${token.colorPrimary}30`
                              : token.colorFillAlter,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                          width: 32,
                          height: 20,
                        }}
                      >
                        <div
                          style={{
                            height: 6,
                            background: isActive
                              ? token.colorPrimary
                              : token.colorBorderSecondary,
                            borderRadius: 2,
                          }}
                        />
                        <div
                          style={{
                            flex: 1,
                            background: isActive
                              ? `${token.colorPrimary}30`
                              : token.colorFillAlter,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                    )}
                    {opt.label}
                  </OptionButton>
                );
              })}
            </div>
          </div>

          {/* Definitions CRUD Style */}
          <div>
            <SectionLabel>Definitions CRUD Style</SectionLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                {
                  value: "drawer" as const,
                  label: "Drawer",
                  icon: <ProfileOutlined style={{ fontSize: 16 }} />,
                },
                {
                  value: "modal" as const,
                  label: "Modal",
                  icon: <FormOutlined style={{ fontSize: 16 }} />,
                },
              ].map(opt => (
                <OptionButton
                  key={opt.value}
                  isActive={definitionsCrudStyle === opt.value}
                  onClick={() => setDefinitionsCrudStyle(opt.value)}
                  style={{ padding: "12px 6px 10px" }}
                >
                  {opt.icon}
                  {opt.label}
                </OptionButton>
              ))}
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
}
