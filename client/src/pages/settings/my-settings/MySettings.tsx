import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, Space, Tag, Typography, theme as antTheme } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  SafetyOutlined,
  BgColorsOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import ProfileTab from "./ProfileTab";
import GeneralTab from "./GeneralTab";
import NotificationsTab from "./NotificationsTab";
import SecurityTab from "./SecurityTab";
import AppearanceTab from "./AppearanceTab";
import { IntegrationsTab } from "./ComingSoonTab";

const { Title, Text } = Typography;

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  {
    key: "general",
    labelKey: "mySettings.tabs.general",
    icon: <SettingOutlined />,
  },
  {
    key: "profile",
    labelKey: "mySettings.tabs.profile",
    icon: <UserOutlined />,
  },
  {
    key: "notifications",
    labelKey: "mySettings.tabs.notifications",
    icon: <BellOutlined />,
  },
  {
    key: "security",
    labelKey: "mySettings.tabs.security",
    icon: <SafetyOutlined />,
  },
  {
    key: "appearance",
    labelKey: "mySettings.tabs.appearance",
    icon: <BgColorsOutlined />,
  },
  {
    key: "integrations",
    labelKey: "mySettings.tabs.integrations",
    icon: <ApiOutlined />,
    comingSoon: true,
  },
];

// ─── Main page ───────────────────────────────────────────────────────────────
export default function MySettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const { language } = useAppSettings();
  const lang = language;
  const activeTab = params.tab ?? "general";

  const activeLabel =
    TABS.find(tab => tab.key === activeTab)?.labelKey ?? "mySettings.title";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    appearance: <AppearanceTab />,
    integrations: <IntegrationsTab />,
  };

  return (
    <DashboardLayout
      currentPage={t("mySettings.title", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Settings", lang) },
        { label: t("mySettings.title", lang) },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              flexShrink: 0,
              background: `linear-gradient(135deg, ${token.colorPrimary}dd, ${token.colorPrimary}88)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SettingOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              {t("mySettings.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t("mySettings.subtitle", lang)}
            </Text>
          </div>
        </div>

        {/* Two-card layout */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Nav card */}
          <Card
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              width: 210,
              flexShrink: 0,
            }}
            styles={{ body: { padding: "8px 0" } }}
          >
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setLocation(`/my-settings/${tab.key}`)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 16px",
                  background:
                    activeTab === tab.key
                      ? token.colorPrimaryBg
                      : "transparent",
                  color:
                    activeTab === tab.key
                      ? token.colorPrimary
                      : token.colorText,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  transition: "background 0.15s, color 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab.key)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      token.colorFillAlter;
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    opacity: activeTab === tab.key ? 1 : 0.55,
                  }}
                >
                  {tab.icon}
                </span>
                <span style={{ flex: 1 }}>{t(tab.labelKey, lang)}</span>
                {tab.comingSoon && (
                  <Tag
                    color="blue"
                    style={{
                      fontSize: 9,
                      lineHeight: "16px",
                      padding: "0 4px",
                      marginRight: 0,
                    }}
                  >
                    {t("mySettings.comingSoon", lang)}
                  </Tag>
                )}
              </button>
            ))}
          </Card>

          {/* Content card */}
          <Card
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              flex: 1,
              minWidth: 0,
            }}
            styles={{ body: { padding: 24 } }}
            title={
              <Space>
                {TABS.find(tab => tab.key === activeTab)?.icon}
                <Text strong>{t(activeLabel, lang)}</Text>
              </Space>
            }
          >
            {tabContent[activeTab] ?? (
              <Text type="secondary">{t("mySettings.comingSoon", lang)}</Text>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
