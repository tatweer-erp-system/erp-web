import { memo } from "react";
import { Link } from "wouter";
import {
  Avatar, Button, Divider, Dropdown, Grid, Input, Tooltip,
  theme as antTheme,
} from "antd";
import type { MenuProps } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  FullscreenOutlined,
  CalendarOutlined,
  GlobalOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { Moon, Sun } from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { usePinLock } from "@/contexts/PinLockContext";
import { useAuthContext, ROLE_DISPLAY } from "@/contexts/AuthContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isRTL: boolean;
}

function NavbarInner({ sidebarOpen, setSidebarOpen, isRTL }: NavbarProps) {
  const { token } = antTheme.useToken();
  const { theme, language, financialYear, toggleTheme, setLanguage, setFinancialYear } =
    useAppSettings();
  const { lock } = usePinLock();
  const { user, logout } = useAuthContext();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const isDark = theme === "dark";

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }


  // Financial year menu
  const fyItems: MenuProps["items"] = ["2025-2026","2024-2025","2023-2024","2022-2023"].map((y) => ({
    key: y,
    label: y,
    style: y === financialYear ? { color: token.colorPrimary, fontWeight: 600 } : {},
  }));

  // Profile menu
  const profileItems: MenuProps["items"] = [
    {
      key: "profile-header",
      label: (
        <div style={{ padding: "4px 0 8px" }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{user?.name ?? "User"}</div>
          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>{user?.email ?? ""}</div>
          {user && (
            <div style={{
              display: "inline-block", marginTop: 4, fontSize: 10, fontWeight: 600,
              padding: "1px 6px", borderRadius: 20,
              color: ROLE_DISPLAY[user.role].color,
              background: ROLE_DISPLAY[user.role].bg,
            }}>
              {ROLE_DISPLAY[user.role].label}
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "profile",  label: <Link href="/settings">My Profile</Link>,  icon: <UserOutlined /> },
    { key: "settings", label: <Link href="/settings">Settings</Link>,     icon: <SettingOutlined /> },
    { type: "divider" },
    { key: "logout",   label: "Logout", icon: <LogoutOutlined />, danger: true },
  ];

  const iconBtnStyle = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <header style={{
      background: token.colorBgContainer,
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      padding: "0 20px",
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"} placement={isRTL ? "right" : "left"}>
          <Button
            type="text"
            icon={
              <span style={{ display: "inline-flex", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
                {sidebarOpen
                  ? <MenuFoldOutlined style={{ fontSize: 17 }} />
                  : <MenuUnfoldOutlined style={{ fontSize: 17 }} />}
              </span>
            }
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={iconBtnStyle}
          />
        </Tooltip>

        {!isMobile && (
          <Input
            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="Search anything..."
            variant="filled"
            style={{ width: 240 }}
            allowClear
          />
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Financial Year */}
        <Dropdown
          menu={{
            items: fyItems,
            onClick: ({ key }) => setFinancialYear(key),
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Tooltip title="Financial Year">
            <Button type="text" style={{ ...iconBtnStyle, width: "auto", padding: "0 10px", gap: 6, fontSize: 12, fontWeight: 600 }}>
              <CalendarOutlined />
              <span className="hidden sm:inline">{financialYear}</span>
            </Button>
          </Tooltip>
        </Dropdown>

        {/* Fullscreen — desktop only */}
        {!isMobile && (
          <Tooltip title="Toggle fullscreen">
            <Button
              type="text"
              icon={<FullscreenOutlined style={{ fontSize: 16 }} />}
              onClick={toggleFullscreen}
              style={iconBtnStyle}
            />
          </Tooltip>
        )}

        {/* Theme toggle */}
        <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
          <Button
            type="text"
            icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
            onClick={toggleTheme}
            style={iconBtnStyle}
          />
        </Tooltip>

        {/* Lock screen */}
        <Tooltip title="Lock screen">
          <Button
            type="text"
            icon={<LockOutlined style={{ fontSize: 16 }} />}
            onClick={lock}
            style={iconBtnStyle}
          />
        </Tooltip>

        <Divider type="vertical" style={{ height: 20, margin: "0 4px" }} />

        {/* Notifications */}
        <NotificationCenter />

        {/* Settings shortcut */}
        <Tooltip title="Settings">
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 16 }} />}
            style={iconBtnStyle}
          >
            <Link href="/settings" style={{ position: "absolute", inset: 0 }} />
          </Button>
        </Tooltip>

        <Divider type="vertical" style={{ height: 20, margin: "0 4px" }} />

        {/* Language */}
        <Dropdown
          menu={{
            items: [
              { key: "en", label: "English", style: language === "en" ? { color: token.colorPrimary, fontWeight: 600 } : {} },
              { key: "ar", label: "العربية", style: language === "ar" ? { color: token.colorPrimary, fontWeight: 600 } : {} },
            ],
            onClick: ({ key }) => setLanguage(key),
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Tooltip title="Language">
            <Button type="text" style={{ ...iconBtnStyle, width: "auto", padding: "0 8px", gap: 5, fontSize: 12, fontWeight: 700, color: token.colorPrimary }}>
              <GlobalOutlined style={{ fontSize: 14, color: token.colorPrimary }} />
              <span>{language === "en" ? "EN" : "AR"}</span>
            </Button>
          </Tooltip>
        </Dropdown>

        {/* Profile */}
        <Dropdown
          menu={{ items: profileItems, onClick: ({ key }) => { if (key === "logout") { logout(); window.location.href = "/login"; } } }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            style={{ background: user ? ROLE_DISPLAY[user.role].color : token.colorPrimary, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
            size={32}
          >
            {user ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?"}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  );
}

export const Navbar = memo(NavbarInner);
