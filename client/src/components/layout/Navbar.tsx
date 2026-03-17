import { memo } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Grid,
  Input,
  Tooltip,
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
import { NotificationCenter } from "@/components/NotificationCenter";
import { useLangStore } from "@/stores/lang.store";
import { useThemeStore } from "@/stores/theme.store";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { usePinLock } from "@/contexts/PinLockContext";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_DISPLAY } from "@/contexts/AuthContext";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isRTL: boolean;
}

function NavbarInner({ sidebarOpen, setSidebarOpen, isRTL }: NavbarProps) {
  const { token } = antTheme.useToken();
  const language = useLangStore(s => s.lang);
  const setLanguage = useLangStore(s => s.setLang);
  const themeMode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);
  const { financialYear, setFinancialYear } = useAppSettings();
  const { lock } = usePinLock();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const isDark = themeMode === "dark";

  function toggleFullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  }

  // Financial year menu
  const fyItems: MenuProps["items"] = [
    "2025-2026",
    "2024-2025",
    "2023-2024",
    "2022-2023",
  ].map(y => ({
    key: y,
    label: y,
    style:
      y === financialYear ? { color: token.colorPrimary, fontWeight: 600 } : {},
  }));

  // Profile menu
  const profileItems: MenuProps["items"] = [
    {
      key: "profile-header",
      label: (
        <div style={{ padding: "4px 0 8px" }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {user
              ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                "User"
              : "User"}
          </div>
          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {user?.email ?? ""}
          </div>
          {user && ROLE_DISPLAY[user.role] && (
            <div
              style={{
                display: "inline-block",
                marginTop: 4,
                fontSize: 10,
                fontWeight: 600,
                padding: "1px 6px",
                borderRadius: 20,
                color: ROLE_DISPLAY[user.role].color,
                background: ROLE_DISPLAY[user.role].bg,
              }}
            >
              {ROLE_DISPLAY[user.role].label}
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "profile",
      label: <Link to="/settings">My Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "settings",
      label: <Link to="/settings">Settings</Link>,
      icon: <SettingOutlined />,
    },
    { type: "divider" },
    { key: "logout", label: "Logout", icon: <LogoutOutlined />, danger: true },
  ];

  const iconBtnStyle = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <header
      style={{
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        padding: "0 20px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Tooltip
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          placement={isRTL ? "right" : "left"}
        >
          <Button
            type="text"
            icon={
              <span
                style={{
                  display: "inline-flex",
                  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                {sidebarOpen ? (
                  <MenuFoldOutlined style={{ fontSize: 17 }} />
                ) : (
                  <MenuUnfoldOutlined style={{ fontSize: 17 }} />
                )}
              </span>
            }
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={iconBtnStyle}
          />
        </Tooltip>

        {!isMobile && (
          <Input
            prefix={
              <SearchOutlined style={{ color: token.colorTextQuaternary }} />
            }
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
            <Button
              type="text"
              style={{
                ...iconBtnStyle,
                width: "auto",
                padding: "0 10px",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
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
            onClick={() => setMode(isDark ? "light" : "dark")}
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

        <Divider
          orientation="vertical"
          style={{ height: 20, margin: "0 4px" }}
        />

        {/* Notifications */}
        <NotificationCenter />

        <Divider
          orientation="vertical"
          style={{ height: 20, margin: "0 4px" }}
        />

        {/* Language */}
        <Tooltip title={isRTL ? "Switch to English" : "التبديل إلى العربية"}>
          {isMobile ? (
            <Button
              type="text"
              icon={<GlobalOutlined />}
              onClick={() => setLanguage(isRTL ? "en" : "ar")}
              style={{ ...iconBtnStyle, fontSize: 11, fontWeight: 700 }}
            />
          ) : (
            <Button
              icon={<GlobalOutlined />}
              onClick={() => setLanguage(isRTL ? "en" : "ar")}
              style={{
                borderRadius: 10,
                height: 36,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {isRTL ? "EN" : "AR"}
            </Button>
          )}
        </Tooltip>

        {/* Profile */}
        <Dropdown
          menu={{
            items: profileItems,
            onClick: ({ key }) => {
              if (key === "logout") {
                logout();
                window.location.href = "/login";
              }
            },
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            style={{
              background: user
                ? (ROLE_DISPLAY[user.role]?.color ?? token.colorPrimary)
                : token.colorPrimary,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
            size={32}
          >
            {user
              ? `${(user.firstName ?? "U")[0]}${(user.lastName ?? "")[0]}`.toUpperCase()
              : "?"}
          </Avatar>
        </Dropdown>
      </div>
    </header>
  );
}

export const Navbar = memo(NavbarInner);
