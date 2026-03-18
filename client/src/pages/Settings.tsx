import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLangStore } from "@/stores/lang.store";
import { useThemeStore } from "@/stores/theme.store";
import { usePOSStore } from "@/modules/pos/store/posStore";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Grid,
  Input,
  InputNumber,
  List,
  Radio,
  Row,
  Select,
  Segmented,
  Slider,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
  notification,
  theme as antTheme,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  BgColorsOutlined,
  ApiOutlined,
  SaveOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyOutlined,
  MobileOutlined,
  DesktopOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  KeyOutlined,
  LinkOutlined,
  DisconnectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  GiftOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { LoginResult } from "@/constants/enums";

const { Title, Text } = Typography;
const { Password } = Input;

// ─── Accent colours ─────────────────────────────────────────────────────────
const ACCENT_COLORS = [
  { label: "Blue", hex: "#3B82F6" },
  { label: "Green", hex: "#10B981" },
  { label: "Purple", hex: "#A855F7" },
  { label: "Orange", hex: "#F97316" },
  { label: "Pink", hex: "#EC4899" },
  { label: "Teal", hex: "#14B8A6" },
  { label: "Indigo", hex: "#6366F1" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Rose", hex: "#F43F5E" },
  { label: "Dark Green", hex: "#25671E" },
  { label: "Dark Blue", hex: "#0D1A63" },
  { label: "Navy", hex: "#09122C" },
  { label: "Dark Purple", hex: "#2E073F" },
];

// ─── Mock data ───────────────────────────────────────────────────────────────
interface LoginRecord {
  key: string;
  device: string;
  location: string;
  ip: string;
  time: string;
  status: LoginResult;
}

const LOGIN_HISTORY: LoginRecord[] = [
  {
    key: "1",
    device: "Chrome / Windows",
    location: "New York, US",
    ip: "192.168.1.1",
    time: "5 min ago",
    status: LoginResult.SUCCESS,
  },
  {
    key: "2",
    device: "Safari / iPhone",
    location: "London, UK",
    ip: "10.0.0.42",
    time: "2 hrs ago",
    status: LoginResult.SUCCESS,
  },
  {
    key: "3",
    device: "Firefox / Linux",
    location: "Berlin, DE",
    ip: "172.16.0.10",
    time: "Yesterday",
    status: LoginResult.FAILED,
  },
  {
    key: "4",
    device: "Edge / Windows",
    location: "Toronto, CA",
    ip: "192.168.0.5",
    time: "3 days ago",
    status: LoginResult.SUCCESS,
  },
];

const INTEGRATIONS = [
  {
    key: "stripe",
    name: "Stripe",
    desc: "Payment processing",
    icon: "💳",
    connected: true,
  },
  {
    key: "gdrive",
    name: "Google Drive",
    desc: "Cloud file storage",
    icon: "📁",
    connected: false,
  },
  {
    key: "slack",
    name: "Slack",
    desc: "Team communication",
    icon: "💬",
    connected: true,
  },
  {
    key: "zapier",
    name: "Zapier",
    desc: "Workflow automation",
    icon: "⚡",
    connected: false,
  },
  {
    key: "quickb",
    name: "QuickBooks",
    desc: "Accounting integration",
    icon: "📊",
    connected: false,
  },
  {
    key: "twilio",
    name: "Twilio",
    desc: "SMS & voice notifications",
    icon: "📱",
    connected: true,
  },
];

const NOTIF_ITEMS = [
  {
    key: "email",
    label: "Email Notifications",
    desc: "Receive updates via email",
    defaultOn: true,
  },
  {
    key: "orders",
    label: "Order Updates",
    desc: "Get notified when orders change status",
    defaultOn: true,
  },
  {
    key: "inventory",
    label: "Inventory Alerts",
    desc: "Alert when stock falls below threshold",
    defaultOn: true,
  },
  {
    key: "system",
    label: "System Alerts",
    desc: "Critical system and security notifications",
    defaultOn: true,
  },
  {
    key: "reports",
    label: "Weekly Reports",
    desc: "Receive a weekly summary digest",
    defaultOn: false,
  },
  {
    key: "billing",
    label: "Billing Reminders",
    desc: "Payment due and overdue alerts",
    defaultOn: true,
  },
  {
    key: "promotions",
    label: "Product Updates",
    desc: "New features and product announcements",
    defaultOn: false,
  },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  title,
  extra,
  children,
}: {
  title?: string;
  extra?: React.ReactNode;
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
      }}
    >
      {title && (
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text strong style={{ fontSize: 13 }}>
            {title}
          </Text>
          {extra}
        </div>
      )}
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function Settings() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const themeMode = useThemeStore(s => s.mode);
  const setMode = useThemeStore(s => s.setMode);
  const accentColor = useThemeStore(s => s.accentColor);
  const setAccentColor = useThemeStore(s => s.setAccentColor);
  const language = useLangStore(s => s.lang);
  const setLanguage = useLangStore(s => s.setLang);
  const [financialYear, setFinancialYear] = useState("2025-2026");
  const settingsLayout = "vertical" as "vertical" | "horizontal";
  const theme = themeMode === "dark" ? "dark" : "light";
  const toggleTheme = () => setMode(themeMode === "dark" ? "light" : "dark");
  const isDark = theme === "dark";

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [notifStates, setNotifStates] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_ITEMS.map(n => [n.key, n.defaultOn]))
  );
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions] = useState([
    {
      id: "1",
      device: "Chrome on Windows",
      ip: "192.168.1.1",
      last: "5 min ago",
      current: true,
    },
    {
      id: "2",
      device: "Safari on iPhone",
      ip: "10.0.0.42",
      last: "2 hrs ago",
      current: false,
    },
    {
      id: "3",
      device: "Firefox on macOS",
      ip: "172.16.0.8",
      last: "Yesterday",
      current: false,
    },
  ]);
  const [activeTab, setActiveTab] = useState("general");
  const [fontSize, setFontSize] = useState(14);
  const [density, setDensity] = useState<"compact" | "default" | "comfortable">(
    "default"
  );

  // POS settings from posStore
  const maxOrders = usePOSStore(s => s.maxOrders);
  const setMaxOrders = usePOSStore(s => s.setMaxOrders);
  const posSessionSettings = usePOSStore(s => s.posSessionSettings);
  const setPOSSessionSettings = usePOSStore(s => s.setPOSSessionSettings);

  function saveProfile() {
    profileForm.validateFields().then(() => {
      notification.success({
        message: "Profile Updated",
        description: "Your profile changes have been saved.",
        icon: <CheckCircleOutlined style={{ color: "#10B981" }} />,
      });
    });
  }

  function savePassword() {
    passwordForm.validateFields().then(() => {
      notification.success({
        message: "Password Changed",
        description: "Your password has been updated successfully.",
        icon: <CheckCircleOutlined style={{ color: "#10B981" }} />,
      });
      passwordForm.resetFields();
    });
  }

  function toggleIntegration(key: string) {
    const target = integrations.find(i => i.key === key);
    if (target) {
      message.success(
        target.connected
          ? `${target.name} disconnected`
          : `${target.name} connected`
      );
    }
    setIntegrations(prev =>
      prev.map(i => (i.key === key ? { ...i, connected: !i.connected } : i))
    );
  }

  const loginHistoryCols: ColumnsType<LoginRecord> = [
    {
      title: "Device",
      dataIndex: "device",
      render: v => (
        <Space>
          {v.includes("iPhone") ? <MobileOutlined /> : <DesktopOutlined />}
          <Text style={{ fontSize: 13 }}>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      render: v => (
        <Space size={4}>
          <EnvironmentOutlined style={{ color: token.colorTextQuaternary }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            {v}
          </Text>
        </Space>
      ),
    },
    {
      title: "IP",
      dataIndex: "ip",
      render: v => (
        <Text code style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Time",
      dataIndex: "time",
      render: v => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: v => (
        <Tag
          icon={
            v === LoginResult.SUCCESS ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          color={v === LoginResult.SUCCESS ? "success" : "error"}
          style={{ fontSize: 11 }}
        >
          {v === LoginResult.SUCCESS ? "Success" : "Failed"}
        </Tag>
      ),
    },
  ];

  const connectedCount = integrations.filter(i => i.connected).length;
  const activeNotifCount = NOTIF_ITEMS.filter(n => notifStates[n.key]).length;

  // ── Tab: General ────────────────────────────────────────────────────────────
  const GeneralTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Regional & Locale">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="System Language" style={{ marginBottom: 16 }}>
                <Select
                  value={language}
                  onChange={setLanguage}
                  options={[
                    { value: "en", label: "🇺🇸  English" },
                    { value: "ar", label: "🇸🇦  العربية" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Timezone" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="UTC-5"
                  options={[
                    { value: "UTC-8", label: "UTC-8 · Pacific Time" },
                    { value: "UTC-7", label: "UTC-7 · Mountain Time" },
                    { value: "UTC-6", label: "UTC-6 · Central Time" },
                    { value: "UTC-5", label: "UTC-5 · Eastern Time" },
                    { value: "UTC+0", label: "UTC+0 · GMT / London" },
                    { value: "UTC+1", label: "UTC+1 · CET / Paris" },
                    { value: "UTC+3", label: "UTC+3 · AST / Riyadh" },
                    { value: "UTC+5.5", label: "UTC+5:30 · IST / Delhi" },
                    { value: "UTC+8", label: "UTC+8 · CST / Shanghai" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Date Format" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="MM/DD/YYYY"
                  options={[
                    "MM/DD/YYYY",
                    "DD/MM/YYYY",
                    "YYYY-MM-DD",
                    "DD MMM YYYY",
                  ].map(v => ({ value: v, label: v }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Currency" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="USD"
                  options={[
                    "USD",
                    "EUR",
                    "GBP",
                    "AED",
                    "SAR",
                    "INR",
                    "CNY",
                    "JPY",
                    "AUD",
                    "CAD",
                  ].map(v => ({ value: v, label: v }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Financial Year" style={{ marginBottom: 0 }}>
                <Select
                  value={financialYear}
                  onChange={setFinancialYear}
                  options={[
                    "2025-2026",
                    "2024-2025",
                    "2023-2024",
                    "2022-2023",
                  ].map(v => ({ value: v, label: v }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Number Format" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue="1,234.56"
                  options={["1,234.56", "1.234,56", "1 234,56"].map(v => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      <Section title="Data & Backup">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Automatic Backup
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Last backup: 2 hours ago · Daily at 02:00 UTC
              </Text>
            </div>
            <Space>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={() =>
                  message.loading({
                    content: "Backing up…",
                    key: "bk",
                    duration: 2,
                  })
                }
              >
                Backup Now
              </Button>
              <Switch defaultChecked size="small" />
            </Space>
          </div>
          <Divider style={{ margin: 0 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Export Data
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Download a full export of your account data
              </Text>
            </div>
            <Button
              icon={<DatabaseOutlined />}
              onClick={() =>
                message.info(
                  "Export queued — you will receive an email shortly."
                )
              }
            >
              Export CSV
            </Button>
          </div>
        </div>
      </Section>

      <Section title="POS Configuration">
        <Form layout="vertical" style={{ padding: "4px 0" }}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="Maximum Open Orders"
                tooltip="How many simultaneous order tabs a cashier can open in the POS screen"
                style={{ marginBottom: 0 }}
              >
                <InputNumber
                  min={1}
                  max={10}
                  value={maxOrders}
                  onChange={v => v != null && setMaxOrders(v)}
                  style={{ width: "100%" }}
                  addonAfter="tabs"
                />
              </Form.Item>
              <div
                style={{
                  fontSize: 11,
                  color: token.colorTextTertiary,
                  marginTop: 4,
                }}
              >
                Default: 5 · Range: 1–10
              </div>
            </Col>
          </Row>
        </Form>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("General settings saved")}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  // ── Tab: Profile ────────────────────────────────────────────────────────────
  const ProfileTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <Upload showUploadList={false} beforeUpload={() => false}>
            <div style={{ position: "relative", cursor: "pointer" }}>
              <Avatar
                size={80}
                style={{
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}aa)`,
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                JD
              </Avatar>
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: token.colorPrimary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${token.colorBgContainer}`,
                }}
              >
                <CameraOutlined style={{ fontSize: 12, color: "#fff" }} />
              </div>
            </div>
          </Upload>
          <div>
            <Title level={5} style={{ margin: 0, marginBottom: 2 }}>
              John Doe
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              System Administrator
            </Text>
            <div style={{ marginTop: 6 }}>
              <Tag color="blue" style={{ fontSize: 11 }}>
                Admin
              </Tag>
              <Tag color="success" style={{ fontSize: 11 }}>
                Active
              </Tag>
            </div>
          </div>
        </div>

        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            company: "Tech Solutions Inc.",
            jobTitle: "System Administrator",
            bio: "ERP system administrator with 5+ years of experience.",
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true }]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="jobTitle" label="Job Title">
                <Input
                  prefix={
                    <TeamOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[{ type: "email", required: true }]}
              >
                <Input
                  prefix={
                    <MailOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input
                  prefix={
                    <PhoneOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="company" label="Company">
                <Input
                  prefix={
                    <BankOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="location" label="Location">
                <Input
                  prefix={
                    <EnvironmentOutlined
                      style={{ color: token.colorTextQuaternary }}
                    />
                  }
                  placeholder="City, Country"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="bio" label="Bio" style={{ marginBottom: 0 }}>
                <Input.TextArea
                  rows={3}
                  maxLength={300}
                  showCount
                  placeholder="A short bio about yourself..."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={saveProfile}>
          Save Profile
        </Button>
      </div>
    </div>
  );

  // ── Tab: Notifications ──────────────────────────────────────────────────────
  const NotificationsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Notification Channels">
        <List
          dataSource={NOTIF_ITEMS}
          renderItem={item => (
            <List.Item
              style={{ padding: "10px 0" }}
              actions={[
                <Switch
                  key="sw"
                  checked={notifStates[item.key]}
                  onChange={v =>
                    setNotifStates(prev => ({ ...prev, [item.key]: v }))
                  }
                  size="small"
                />,
              ]}
            >
              <List.Item.Meta
                title={<Text style={{ fontSize: 13 }}>{item.label}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.desc}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Section>

      <Section title="Delivery Preferences">
        <Form layout="vertical">
          <Form.Item
            label="Email digest frequency"
            style={{ marginBottom: 16 }}
          >
            <Radio.Group defaultValue="realtime">
              <Space orientation="vertical" size={8}>
                <Radio value="realtime">Real-time (immediately)</Radio>
                <Radio value="hourly">Hourly digest</Radio>
                <Radio value="daily">Daily digest (08:00 AM)</Radio>
                <Radio value="weekly">Weekly summary</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Quiet Hours" style={{ marginBottom: 0 }}>
            <Space>
              <Select
                defaultValue="22:00"
                style={{ width: 110 }}
                options={Array.from({ length: 24 }, (_, i) => ({
                  value: `${String(i).padStart(2, "0")}:00`,
                  label: `${String(i).padStart(2, "0")}:00`,
                }))}
              />
              <Text type="secondary">to</Text>
              <Select
                defaultValue="08:00"
                style={{ width: 110 }}
                options={Array.from({ length: 24 }, (_, i) => ({
                  value: `${String(i).padStart(2, "0")}:00`,
                  label: `${String(i).padStart(2, "0")}:00`,
                }))}
              />
            </Space>
          </Form.Item>
        </Form>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Notification preferences saved")}
        >
          Save Preferences
        </Button>
      </div>
    </div>
  );

  // ── Tab: Security ───────────────────────────────────────────────────────────
  const SecurityTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Change Password">
        <Form form={passwordForm} layout="vertical" style={{ maxWidth: 440 }}>
          <Form.Item
            name="current"
            label="Current Password"
            rules={[{ required: true }]}
          >
            <Password
              prefix={
                <LockOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder="Enter current password"
            />
          </Form.Item>
          <Form.Item
            name="newPass"
            label="New Password"
            rules={[
              { required: true },
              { min: 8, message: "At least 8 characters" },
            ]}
          >
            <Password
              prefix={
                <LockOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder="Min. 8 characters"
            />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Confirm New Password"
            dependencies={["newPass"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPass") === value)
                    return Promise.resolve();
                  return Promise.reject("Passwords do not match");
                },
              }),
            ]}
            style={{ marginBottom: 16 }}
          >
            <Password
              prefix={
                <LockOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder="Repeat new password"
            />
          </Form.Item>
          <Button type="primary" icon={<KeyOutlined />} onClick={savePassword}>
            Update Password
          </Button>
        </Form>
      </Section>

      <Section
        title="Two-Factor Authentication"
        extra={
          <Switch
            checked={twoFAEnabled}
            onChange={v => {
              setTwoFAEnabled(v);
              message.success(v ? "2FA enabled" : "2FA disabled");
            }}
          />
        }
      >
        {twoFAEnabled ? (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            message="Two-factor authentication is active"
            description="Your account is protected by an authenticator app. Every login requires a one-time code."
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Two-factor authentication is not enabled"
            description="Enable 2FA to add an extra layer of security to your account. Requires an authenticator app."
          />
        )}
      </Section>

      <Section title="Active Sessions">
        <List
          dataSource={sessions}
          renderItem={s => (
            <List.Item
              style={{ padding: "10px 0" }}
              actions={
                s.current
                  ? [
                      <Tag key="cur" color="success">
                        This device
                      </Tag>,
                    ]
                  : [
                      <Button
                        key="revoke"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => message.success("Session terminated")}
                      >
                        Revoke
                      </Button>,
                    ]
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={
                      s.device.includes("iPhone") ? (
                        <MobileOutlined />
                      ) : (
                        <DesktopOutlined />
                      )
                    }
                    style={{
                      background: s.current
                        ? token.colorPrimary
                        : token.colorFillSecondary,
                      color: s.current ? "#fff" : token.colorTextSecondary,
                    }}
                  />
                }
                title={<Text style={{ fontSize: 13 }}>{s.device}</Text>}
                description={
                  <Space size={12}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <ClockCircleOutlined /> {s.last}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      IP: {s.ip}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <Divider style={{ margin: "8px 0 16px" }} />
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => message.success("All other sessions revoked")}
        >
          Revoke All Other Sessions
        </Button>
      </Section>

      <Section title="Login History">
        <Table
          size="small"
          dataSource={LOGIN_HISTORY}
          columns={loginHistoryCols}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      </Section>
    </div>
  );

  // ── Tab: Appearance ─────────────────────────────────────────────────────────
  const AppearanceTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Theme Mode">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Text style={{ fontSize: 13 }}>
              {isDark ? "Dark mode" : "Light mode"}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {isDark
                ? "Optimised for low-light environments."
                : "Optimised for bright environments."}
            </Text>
          </div>
          <Segmented
            value={isDark ? "dark" : "light"}
            onChange={v => {
              if ((v === "dark") !== isDark) toggleTheme();
            }}
            options={[
              {
                value: "light",
                label: (
                  <Space size={4}>
                    <Sun size={13} />
                    Light
                  </Space>
                ),
              },
              {
                value: "dark",
                label: (
                  <Space size={4}>
                    <Moon size={13} />
                    Dark
                  </Space>
                ),
              },
            ]}
          />
        </div>
      </Section>

      <Section title="Accent Color">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {ACCENT_COLORS.map(c => {
            const isActive = accentColor === c.hex;
            return (
              <Tooltip key={c.hex} title={c.label}>
                <button
                  onClick={() => setAccentColor(c.hex)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: c.hex,
                    border: isActive
                      ? `3px solid ${token.colorBgContainer}`
                      : "2px solid transparent",
                    outline: isActive ? `2px solid ${c.hex}` : "none",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    transform: isActive ? "scale(1.18)" : "scale(1)",
                  }}
                />
              </Tooltip>
            );
          })}
        </div>
      </Section>

      <Section title="Interface Font Size">
        <Row align="middle" gutter={16}>
          <Col flex="28px">
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 600 }}>
              Aa
            </Text>
          </Col>
          <Col flex={1}>
            <Slider
              min={12}
              max={18}
              step={1}
              value={fontSize}
              onChange={setFontSize}
              marks={{ 12: "12", 14: "14", 16: "16", 18: "18" }}
              tooltip={{ formatter: v => `${v}px` }}
            />
          </Col>
          <Col flex="48px">
            <Text type="secondary" style={{ fontSize: 12 }}>
              {fontSize}px
            </Text>
          </Col>
        </Row>
      </Section>

      <Section title="Layout Density">
        <Radio.Group value={density} onChange={e => setDensity(e.target.value)}>
          <Space orientation="vertical" size={10}>
            <Radio value="compact">
              <Text style={{ fontSize: 13 }}>Compact</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                Tighter spacing, more content per screen
              </Text>
            </Radio>
            <Radio value="default">
              <Text style={{ fontSize: 13 }}>Default</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                Balanced spacing for everyday use
              </Text>
            </Radio>
            <Radio value="comfortable">
              <Text style={{ fontSize: 13 }}>Comfortable</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                Relaxed spacing, easier to scan
              </Text>
            </Radio>
          </Space>
        </Radio.Group>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Appearance settings saved")}
        >
          Save Appearance
        </Button>
      </div>
    </div>
  );

  // ── Tab: Integrations ───────────────────────────────────────────────────────
  const IntegrationsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Alert
        type="info"
        showIcon
        message="Connect third-party services to extend the platform's capabilities."
        style={{ fontSize: 12 }}
      />
      <Row gutter={[12, 12]}>
        {integrations.map(intg => (
          <Col xs={24} sm={12} key={intg.key}>
            <div
              style={{
                padding: "16px",
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <Space size={12} align="center">
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: token.colorFillAlter,
                    flexShrink: 0,
                  }}
                >
                  {intg.icon}
                </div>
                <div>
                  <Text strong style={{ fontSize: 13 }}>
                    {intg.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {intg.desc}
                  </Text>
                  <br />
                  <Tag
                    style={{ marginTop: 4, fontSize: 11 }}
                    icon={
                      intg.connected ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    color={intg.connected ? "success" : "default"}
                  >
                    {intg.connected ? "Connected" : "Not connected"}
                  </Tag>
                </div>
              </Space>
              <Button
                size="small"
                type={intg.connected ? "default" : "primary"}
                danger={intg.connected}
                icon={
                  intg.connected ? <DisconnectOutlined /> : <LinkOutlined />
                }
                onClick={() => toggleIntegration(intg.key)}
                style={{ flexShrink: 0 }}
              >
                {intg.connected ? "Disconnect" : "Connect"}
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );

  // ── Tab: Loyalty Settings ────────────────────────────────────────────────────
  const [loyaltyEnabled, setLoyaltyEnabled] = useState(true);
  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDays, setExpiryDays] = useState(365);
  const [minRedeem, setMinRedeem] = useState(50);
  const [partialRedeem, setPartialRedeem] = useState(true);
  const [showOnReceipt, setShowOnReceipt] = useState(true);

  const LoyaltySettingsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Loyalty Program">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Enable toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Enable Loyalty Program
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Allow customers to earn and redeem points at POS
              </Text>
            </div>
            <Switch checked={loyaltyEnabled} onChange={setLoyaltyEnabled} />
          </div>

          {/* Points expiry */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              opacity: loyaltyEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Points Expiry
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Automatically expire unused loyalty points
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {expiryEnabled && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <InputNumber
                    size="small"
                    min={30}
                    max={3650}
                    value={expiryDays}
                    onChange={v => setExpiryDays(v ?? 365)}
                    disabled={!loyaltyEnabled}
                    style={{ width: 80 }}
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    days
                  </Text>
                </div>
              )}
              <Switch
                size="small"
                checked={expiryEnabled}
                onChange={setExpiryEnabled}
                disabled={!loyaltyEnabled}
              />
            </div>
          </div>

          {/* Minimum points to redeem */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              opacity: loyaltyEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Minimum Points to Redeem
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Customer must have at least this many points to redeem
              </Text>
            </div>
            <InputNumber
              size="small"
              min={0}
              value={minRedeem}
              onChange={v => setMinRedeem(v ?? 0)}
              disabled={!loyaltyEnabled}
              addonAfter="pts"
              style={{ width: 120 }}
            />
          </div>

          {/* Allow partial redemption */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              opacity: loyaltyEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Allow Partial Redemption
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Customers can redeem a portion of their points (not
                all-or-nothing)
              </Text>
            </div>
            <Switch
              size="small"
              checked={partialRedeem}
              onChange={setPartialRedeem}
              disabled={!loyaltyEnabled}
            />
          </div>

          {/* Show points on receipt */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              opacity: loyaltyEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Show Points on Receipt
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Print points earned and balance on customer receipts
              </Text>
            </div>
            <Switch
              size="small"
              checked={showOnReceipt}
              onChange={setShowOnReceipt}
              disabled={!loyaltyEnabled}
            />
          </div>
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Loyalty settings saved")}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );

  // ── Tab: Vouchers & Gift Cards ───────────────────────────────────────────────
  const [voucherEnabled, setVoucherEnabled] = useState(true);
  const [gcRedemptionEnabled, setGcRedemptionEnabled] = useState(true);
  const [gcIssuanceEnabled, setGcIssuanceEnabled] = useState(true);
  const [gcExpiryDays, setGcExpiryDays] = useState(365);
  const [multipleGCEnabled, setMultipleGCEnabled] = useState(true);

  // ── Tab: POS Session ────────────────────────────────────────────────────────
  const POSSessionTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="POS Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Maximum Open Orders (Tabs)"
                style={{ marginBottom: 16 }}
                help="Max simultaneous order tabs per POS session (1–10)"
              >
                <InputNumber
                  min={1}
                  max={10}
                  value={maxOrders}
                  onChange={v => setMaxOrders(v ?? 5)}
                  addonAfter="tabs"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>

      <Section title="Session Security">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Inactivity lock */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Inactivity Lock Timeout
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Automatically lock the terminal after a period of inactivity
              </Text>
            </div>
            <InputNumber
              min={1}
              max={60}
              value={posSessionSettings.inactivityLockMinutes}
              onChange={v =>
                setPOSSessionSettings({
                  ...posSessionSettings,
                  inactivityLockMinutes: v ?? 5,
                })
              }
              addonAfter="min"
              style={{ width: 120 }}
            />
          </div>

          {/* Max PIN attempts */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Max PIN Attempts
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Lock / deny override after this many failed PIN entries
              </Text>
            </div>
            <InputNumber
              min={1}
              max={10}
              value={posSessionSettings.maxPINAttempts}
              onChange={v =>
                setPOSSessionSettings({
                  ...posSessionSettings,
                  maxPINAttempts: v ?? 3,
                })
              }
              addonAfter="tries"
              style={{ width: 130 }}
            />
          </div>

          {/* Require manager for refunds */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Require Manager Approval for Refunds
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cashier must request manager override before processing any
                refund
              </Text>
            </div>
            <Switch
              checked={posSessionSettings.requireManagerForRefunds}
              onChange={v =>
                setPOSSessionSettings({
                  ...posSessionSettings,
                  requireManagerForRefunds: v,
                })
              }
            />
          </div>

          {/* Discount threshold */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Manager Override Discount Threshold
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Percentage discounts above this value require manager approval
              </Text>
            </div>
            <InputNumber
              min={0}
              max={100}
              value={posSessionSettings.requireManagerForDiscountsAbove}
              onChange={v =>
                setPOSSessionSettings({
                  ...posSessionSettings,
                  requireManagerForDiscountsAbove: v ?? 20,
                })
              }
              addonAfter="%"
              style={{ width: 120 }}
            />
          </div>
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("POS session settings saved")}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );

  const VouchersGiftCardsTab = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Voucher Settings">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Allow Voucher Redemption
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Let cashiers apply voucher codes at POS checkout
              </Text>
            </div>
            <Switch checked={voucherEnabled} onChange={setVoucherEnabled} />
          </div>
        </div>
      </Section>

      <Section title="Gift Card Settings">
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Allow Gift Card Redemption
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Accept gift cards as payment at POS
              </Text>
            </div>
            <Switch
              checked={gcRedemptionEnabled}
              onChange={setGcRedemptionEnabled}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Allow Gift Card Issuance at POS
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Cashiers can issue new gift cards from the POS terminal
              </Text>
            </div>
            <Switch
              checked={gcIssuanceEnabled}
              onChange={setGcIssuanceEnabled}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
              opacity: gcIssuanceEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Gift Card Default Expiry
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Default validity period for newly issued gift cards
              </Text>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <InputNumber
                size="small"
                min={0}
                max={3650}
                value={gcExpiryDays}
                onChange={v => setGcExpiryDays(v ?? 365)}
                disabled={!gcIssuanceEnabled}
                addonAfter="days"
                style={{ width: 130 }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              opacity: gcRedemptionEnabled ? 1 : 0.45,
            }}
          >
            <div>
              <Text strong style={{ fontSize: 13 }}>
                Allow Multiple Gift Cards per Sale
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Customers can use more than one gift card per transaction
              </Text>
            </div>
            <Switch
              size="small"
              checked={multipleGCEnabled}
              onChange={setMultipleGCEnabled}
              disabled={!gcRedemptionEnabled}
            />
          </div>
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Voucher & gift card settings saved")}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      currentPage="Settings"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Page header with profile identity */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar
              size={52}
              style={{
                background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}aa)`,
                fontSize: 18,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              JD
            </Avatar>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                John Doe
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                admin@tatweer.io &nbsp;·&nbsp; System Administrator
              </Text>
            </div>
          </div>
          <Button
            icon={<EditOutlined />}
            onClick={() => message.info("Switch to Profile tab to edit")}
          >
            Edit Profile
          </Button>
        </div>

        {/* Nav + content — layout driven by settingsLayout */}
        {(() => {
          const NAV_ITEMS = [
            { key: "general", icon: <SettingOutlined />, label: "General" },
            { key: "profile", icon: <UserOutlined />, label: "Profile" },
            { key: "security", icon: <SafetyOutlined />, label: "Security" },
            {
              key: "appearance",
              icon: <BgColorsOutlined />,
              label: "Appearance",
            },
            {
              key: "integrations",
              icon: <ApiOutlined />,
              label: "Integrations",
              badge: connectedCount,
              badgeColor: "#10B981",
            },
          ];

          const contentArea = (
            <Card
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                flex: 1,
                minWidth: 0,
              }}
              styles={{ body: { padding: 24 } }}
            >
              {activeTab === "general" && GeneralTab}
              {activeTab === "profile" && ProfileTab}
              {activeTab === "security" && SecurityTab}
              {activeTab === "appearance" && AppearanceTab}
              {activeTab === "integrations" && IntegrationsTab}
              {activeTab === "pos-session" && POSSessionTab}
            </Card>
          );

          if (settingsLayout === "horizontal") {
            return (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Top nav card */}
                <Card
                  style={{
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusLG,
                  }}
                  styles={{ body: { padding: "4px 8px" } }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {NAV_ITEMS.map(item => {
                      const isActive = activeTab === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setActiveTab(item.key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: token.borderRadius,
                            background: isActive
                              ? token.colorPrimaryBg
                              : "transparent",
                            color: isActive
                              ? token.colorPrimary
                              : token.colorText,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: isActive ? 600 : 400,
                            borderBottom: isActive
                              ? `2px solid ${token.colorPrimary}`
                              : "2px solid transparent",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 15,
                              opacity: isActive ? 1 : 0.65,
                            }}
                          >
                            {item.icon}
                          </span>
                          {item.label}
                          {item.badge ? (
                            <Badge
                              count={item.badge}
                              size="small"
                              color={item.badgeColor}
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </Card>
                {contentArea}
              </div>
            );
          }

          // Vertical (default): left-nav card + right content card
          return (
            <div
              style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <Card
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  width: isMobile ? "100%" : 220,
                  flexShrink: 0,
                }}
                styles={{ body: { padding: isMobile ? "4px 8px" : "8px 0" } }}
              >
                <div
                  style={
                    isMobile
                      ? { display: "flex", flexWrap: "wrap", gap: 4 }
                      : undefined
                  }
                >
                  {NAV_ITEMS.map(item => (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      style={
                        isMobile
                          ? {
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "7px 12px",
                              background:
                                activeTab === item.key
                                  ? token.colorPrimaryBg
                                  : "transparent",
                              color:
                                activeTab === item.key
                                  ? token.colorPrimary
                                  : token.colorText,
                              border: "none",
                              borderRadius: token.borderRadius,
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: activeTab === item.key ? 600 : 400,
                              borderBottom:
                                activeTab === item.key
                                  ? `2px solid ${token.colorPrimary}`
                                  : "2px solid transparent",
                            }
                          : {
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 16px",
                              background:
                                activeTab === item.key
                                  ? token.colorPrimaryBg
                                  : "transparent",
                              color:
                                activeTab === item.key
                                  ? token.colorPrimary
                                  : token.colorText,
                              border: "none",
                              borderRadius: 0,
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: activeTab === item.key ? 600 : 400,
                              borderInlineStart:
                                activeTab === item.key
                                  ? `3px solid ${token.colorPrimary}`
                                  : "3px solid transparent",
                              transition: "background 0.15s, color 0.15s",
                              textAlign: "left",
                            }
                      }
                      onMouseEnter={e => {
                        if (activeTab !== item.key)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = token.colorFillAlter;
                      }}
                      onMouseLeave={e => {
                        if (activeTab !== item.key)
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          opacity: activeTab === item.key ? 1 : 0.65,
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {item.badge ? (
                        <Badge
                          count={item.badge}
                          size="small"
                          color={item.badgeColor}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </Card>
              {contentArea}
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
}
