import { useState } from "react";
import {
  Button, Collapse, Drawer, Space, Tooltip, Typography,
  theme as antTheme,
} from "antd";
import {
  BgColorsOutlined, CheckOutlined, ReloadOutlined, LockOutlined,
  AppstoreOutlined, MobileOutlined, ProfileOutlined, FormOutlined,
  ShopOutlined, LayoutOutlined, SettingOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import { useAppSettings } from "@/contexts/AppSettingsContext";

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

const RADIUS_PRESETS = [
  { label: "Sharp",   value: 2,  preview: 2 },
  { label: "Default", value: 6,  preview: 6 },
  { label: "Rounded", value: 10, preview: 10 },
  { label: "Pill",    value: 16, preview: 16 },
];

function SectionLabel({ children }: { children: string }) {
  return (
    <Text type="secondary" style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", display: "block", marginBottom: 10,
    }}>
      {children}
    </Text>
  );
}

function OptionButton({
  isActive, onClick, children, style,
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
  const {
    theme, toggleTheme,
    accentColor, setAccentColor,
    themeRadius, setThemeRadius,
    pinStyle, setPinStyle,
    definitionsLayout, setDefinitionsLayout,
    settingsLayout, setSettingsLayout,
    definitionsCrudStyle, setDefinitionsCrudStyle,
    posCardStyle, setPOSCardStyle,
    posGridCols, setPOSGridCols,
  } = useAppSettings();

  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  function reset() {
    setAccentColor("");
    setThemeRadius(6);
  }

  const activeColor = accentColor || token.colorPrimary;

  // ── Appearance section content ─────────────────────────────────────────────
  const appearanceContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Theme Mode */}
      <div>
        <SectionLabel>Theme Mode</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { value: "light", icon: <Sun size={15} />, label: "Light" },
            { value: "dark",  icon: <Moon size={15} />, label: "Dark" },
          ].map((opt) => {
            const isActive = isDark ? opt.value === "dark" : opt.value === "light";
            return (
              <OptionButton
                key={opt.value}
                isActive={isActive}
                onClick={() => { if ((opt.value === "dark") !== isDark) toggleTheme(); }}
                style={{ padding: "10px 8px" }}
              >
                {opt.icon}
                {opt.label}
              </OptionButton>
            );
          })}
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <SectionLabel>Primary Color</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7, marginBottom: 12 }}>
          {PALETTE.map((c) => {
            const isActive = accentColor === c.hex;
            return (
              <Tooltip key={c.hex} title={c.label} placement="top">
                <button
                  onClick={() => setAccentColor(c.hex)}
                  style={{
                    width: "100%", aspectRatio: "1",
                    borderRadius: 7, background: c.hex,
                    border: isActive ? `2px solid ${token.colorBgContainer}` : "2px solid transparent",
                    outline: isActive ? `2px solid ${c.hex}` : "2px solid transparent",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: isActive ? "scale(1.12)" : "scale(1)",
                    transition: "transform 0.15s, outline 0.15s",
                  }}
                >
                  {isActive && <CheckOutlined style={{ fontSize: 10, color: "#fff" }} />}
                </button>
              </Tooltip>
            );
          })}
        </div>
        {/* Custom color picker */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px",
          background: token.colorFillAlter,
          borderRadius: token.borderRadiusLG,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: activeColor, border: `1px solid ${token.colorBorderSecondary}` }} />
            <input type="color" value={activeColor} onChange={(e) => setAccentColor(e.target.value)}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 11, display: "block", fontWeight: 500 }}>Custom color</Text>
            <Text type="secondary" style={{ fontSize: 11, fontFamily: "monospace" }}>{activeColor.toUpperCase()}</Text>
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <SectionLabel>Border Radius</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {RADIUS_PRESETS.map((p) => {
            const isActive = themeRadius === p.value;
            return (
              <OptionButton
                key={p.value}
                isActive={isActive}
                onClick={() => setThemeRadius(p.value)}
                style={{ padding: "10px 8px", borderRadius: p.preview }}
              >
                <div style={{ width: 32, height: 12, background: isActive ? token.colorPrimary : token.colorFillSecondary, borderRadius: p.preview }} />
                {p.label}
              </OptionButton>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── Layout section content ─────────────────────────────────────────────────
  const layoutContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* PIN Lock Style */}
      <div>
        <SectionLabel>PIN Lock Style</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { value: 1 as const, label: "Minimal", icon: <LockOutlined style={{ fontSize: 16 }} /> },
            { value: 2 as const, label: "Split",   icon: <AppstoreOutlined style={{ fontSize: 16 }} /> },
            { value: 3 as const, label: "Phone",   icon: <MobileOutlined style={{ fontSize: 16 }} /> },
          ].map((opt) => (
            <OptionButton key={opt.value} isActive={pinStyle === opt.value} onClick={() => setPinStyle(opt.value)} style={{ padding: "12px 6px 10px" }}>
              {opt.icon}
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>

      {/* Definitions Layout */}
      <div>
        <SectionLabel>Definitions Layout</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            { value: "vertical"   as const, label: "Vertical" },
            { value: "horizontal" as const, label: "Horizontal" },
          ]).map((opt) => {
            const isActive = definitionsLayout === opt.value;
            const isVert = opt.value === "vertical";
            return (
              <OptionButton key={opt.value} isActive={isActive} onClick={() => setDefinitionsLayout(opt.value)} style={{ padding: "12px 6px 10px" }}>
                {isVert ? (
                  <div style={{ display: "flex", gap: 3, width: 32, height: 20 }}>
                    <div style={{ width: 9, background: isActive ? token.colorPrimary : token.colorBorderSecondary, borderRadius: 2 }} />
                    <div style={{ flex: 1, background: isActive ? `${token.colorPrimary}30` : token.colorFillAlter, borderRadius: 2 }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 32, height: 20 }}>
                    <div style={{ height: 6, background: isActive ? token.colorPrimary : token.colorBorderSecondary, borderRadius: 2 }} />
                    <div style={{ flex: 1, background: isActive ? `${token.colorPrimary}30` : token.colorFillAlter, borderRadius: 2 }} />
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([
            { value: "vertical"   as const, label: "Vertical" },
            { value: "horizontal" as const, label: "Horizontal" },
          ]).map((opt) => {
            const isActive = settingsLayout === opt.value;
            const isVert = opt.value === "vertical";
            return (
              <OptionButton key={opt.value} isActive={isActive} onClick={() => setSettingsLayout(opt.value)} style={{ padding: "12px 6px 10px" }}>
                {isVert ? (
                  <div style={{ display: "flex", gap: 3, width: 32, height: 20 }}>
                    <div style={{ width: 9, background: isActive ? token.colorPrimary : token.colorBorderSecondary, borderRadius: 2 }} />
                    <div style={{ flex: 1, background: isActive ? `${token.colorPrimary}30` : token.colorFillAlter, borderRadius: 2 }} />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 32, height: 20 }}>
                    <div style={{ height: 6, background: isActive ? token.colorPrimary : token.colorBorderSecondary, borderRadius: 2 }} />
                    <div style={{ flex: 1, background: isActive ? `${token.colorPrimary}30` : token.colorFillAlter, borderRadius: 2 }} />
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { value: "drawer" as const, label: "Drawer", icon: <ProfileOutlined style={{ fontSize: 16 }} /> },
            { value: "modal"  as const, label: "Modal",  icon: <FormOutlined style={{ fontSize: 16 }} /> },
          ].map((opt) => (
            <OptionButton key={opt.value} isActive={definitionsCrudStyle === opt.value} onClick={() => setDefinitionsCrudStyle(opt.value)} style={{ padding: "12px 6px 10px" }}>
              {opt.icon}
              {opt.label}
            </OptionButton>
          ))}
        </div>
      </div>
    </div>
  );

  // ── POS section content ────────────────────────────────────────────────────
  const posContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Card Style */}
      <div>
        <SectionLabel>Card Style</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {([
            {
              value: "card" as const, label: "Card",
              preview: (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  {[1, 2].map((i) => (
                    <div key={i} style={{ borderRadius: 3, overflow: "hidden", border: `1px solid currentColor`, opacity: 0.5 }}>
                      <div style={{ height: 12, background: "currentColor", opacity: 0.3 }} />
                      <div style={{ padding: "2px 3px" }}>
                        <div style={{ height: 2.5, background: "currentColor", borderRadius: 1, marginBottom: 2, opacity: 0.5, width: "80%" }} />
                        <div style={{ height: 2.5, background: "currentColor", borderRadius: 1, opacity: 0.9, width: "50%" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              value: "compact" as const, label: "Compact",
              preview: (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 2, border: `1px solid currentColor`, borderRadius: 3, padding: "2px 3px", opacity: 0.5 }}>
                      <div style={{ width: 9, height: 9, borderRadius: 2, background: "currentColor", flexShrink: 0, opacity: 0.6 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 2, background: "currentColor", borderRadius: 1, marginBottom: 1, width: "70%", opacity: 0.5 }} />
                        <div style={{ height: 2, background: "currentColor", borderRadius: 1, width: "40%", opacity: 0.9 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              value: "list" as const, label: "List",
              preview: (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 2, border: `1px solid currentColor`, borderRadius: 3, padding: "2px 3px", opacity: 0.5 }}>
                      <div style={{ width: 11, height: 11, borderRadius: 2, background: "currentColor", flexShrink: 0, opacity: 0.6 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 2, background: "currentColor", borderRadius: 1, marginBottom: 1, width: "65%", opacity: 0.5 }} />
                        <div style={{ height: 2, background: "currentColor", borderRadius: 1, width: "35%", opacity: 0.4 }} />
                      </div>
                      <div style={{ width: 11, height: 7, borderRadius: 2, background: "currentColor", opacity: 0.7 }} />
                    </div>
                  ))}
                </div>
              ),
            },
          ]).map((opt) => {
            const isActive = posCardStyle === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPOSCardStyle(opt.value)}
                style={{
                  padding: "10px 6px 8px",
                  border: `2px solid ${isActive ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  background: isActive ? token.colorPrimaryBg : token.colorBgContainer,
                  color: isActive ? token.colorPrimary : token.colorTextSecondary,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                }}
              >
                {opt.preview}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Columns */}
      <div>
        <SectionLabel>Grid Columns</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {([2, 3, 4, 5] as const).map((cols) => {
            const isActive = posGridCols === cols;
            return (
              <button
                key={cols}
                onClick={() => setPOSGridCols(cols)}
                style={{
                  padding: "8px 4px",
                  border: `2px solid ${isActive ? token.colorPrimary : token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  background: isActive ? token.colorPrimaryBg : token.colorBgContainer,
                  color: isActive ? token.colorPrimary : token.colorTextSecondary,
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1.5, width: "100%" }}>
                  {Array.from({ length: cols * 2 }).map((_, i) => (
                    <div key={i} style={{ height: 5, borderRadius: 1, background: "currentColor", opacity: isActive ? 0.7 : 0.3 }} />
                  ))}
                </div>
                {cols}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const collapseItems = [
    {
      key: "appearance",
      label: (
        <Space size={6}>
          <BgColorsOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Appearance</span>
        </Space>
      ),
      children: appearanceContent,
    },
    {
      key: "layout",
      label: (
        <Space size={6}>
          <LayoutOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>UI & Layout</span>
        </Space>
      ),
      children: layoutContent,
    },
    {
      key: "pos",
      label: (
        <Space size={6}>
          <ShopOutlined style={{ color: token.colorPrimary }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>POS Display</span>
        </Space>
      ),
      children: posContent,
    },
  ];

  return (
    <>
      {/* ── Floating trigger ─────────────────────────────────────────────── */}
      <div style={{
        position: "fixed",
        right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 999,
      }}>
        <Tooltip title="Customize Theme" placement="left">
          <button
            onClick={() => setOpen(true)}
            style={{
              width: 40, height: 48,
              background: activeColor,
              border: "none",
              borderRadius: "8px 0 0 8px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
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
          <Space>
            <BgColorsOutlined style={{ color: token.colorPrimary }} />
            <span>Theme Customizer</span>
          </Space>
        }
        placement="right"
        width={300}
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: "12px 16px 20px" } }}
        extra={
          <Tooltip title="Reset color & radius">
            <Button size="small" icon={<ReloadOutlined />} onClick={reset}>Reset</Button>
          </Tooltip>
        }
      >
        <Collapse
          defaultActiveKey={["appearance"]}
          accordion={false}
          ghost={false}
          size="small"
          style={{ background: "transparent" }}
          items={collapseItems}
        />
      </Drawer>
    </>
  );
}
