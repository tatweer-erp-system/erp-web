/**
 * AntProvider — wraps Ant Design ConfigProvider + StyleProvider.
 * Reads theme config from Zustand stores so antd tokens match the active theme.
 * Usage: wrap the DashboardLayout shell — covers sidebar, navbar, and all pages.
 */
import * as React from "react";
import { ConfigProvider, theme as antTheme } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";
import { useLangStore } from "@/stores/lang.store";
import { useThemeStore } from "@/stores/theme.store";
import { generateAntTheme } from "@/theme/theme.config";

export function AntProvider({ children }: { children: React.ReactNode }) {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";

  const mode = useThemeStore(s => s.mode);
  const primaryColor = useThemeStore(s => s.primaryColor);
  const accentColor = useThemeStore(s => s.accentColor);
  const fontSize = useThemeStore(s => s.fontSize);
  const fontFamily = useThemeStore(s => s.fontFamily);
  const borderRadius = useThemeStore(s => s.borderRadius);
  const layout = useThemeStore(s => s.layout);
  const sidebarPosition = useThemeStore(s => s.sidebarPosition);
  const navStyle = useThemeStore(s => s.navStyle);
  const tableDensity = useThemeStore(s => s.tableDensity);
  const direction = useThemeStore(s => s.direction);
  const presetId = useThemeStore(s => s.presetId);

  const config = React.useMemo(
    () =>
      generateAntTheme({
        primaryColor,
        accentColor,
        mode,
        fontSize,
        fontFamily,
        borderRadius,
        layout,
        sidebarPosition,
        navStyle,
        tableDensity,
        direction,
        presetId,
      }),
    [
      primaryColor,
      accentColor,
      mode,
      fontSize,
      fontFamily,
      borderRadius,
      layout,
      sidebarPosition,
      navStyle,
      tableDensity,
      direction,
      presetId,
    ]
  );

  return (
    <StyleProvider layer>
      <ConfigProvider theme={config} direction={isRTL ? "rtl" : "ltr"}>
        <div
          className="antd-scope"
          dir={isRTL ? "rtl" : "ltr"}
          style={{ display: "contents" }}
        >
          {children}
        </div>
      </ConfigProvider>
    </StyleProvider>
  );
}
