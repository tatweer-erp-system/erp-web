import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Alert, Button, Card, Col, Divider, Form, Input, List, Radio,
  Row, Select, Space, Switch, Table, Tag, Typography, message, theme as antTheme,
} from "antd";
import {
  BellOutlined, AlertOutlined, ThunderboltOutlined, NotificationOutlined,
  GlobalOutlined, ClockCircleOutlined, SaveOutlined, PlusOutlined,
  MailOutlined, MobileOutlined, DesktopOutlined, MessageOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TABS = [
  { key: "preferences",   label: "Notification Prefs",   icon: <BellOutlined /> },
  { key: "alerts",        label: "Alert Types",           icon: <AlertOutlined /> },
  { key: "escalation",    label: "Escalation Rules",      icon: <ThunderboltOutlined /> },
  { key: "announcements", label: "Announcements",         icon: <NotificationOutlined /> },
  { key: "language",      label: "Language per Notif",    icon: <GlobalOutlined /> },
  { key: "quiet-hours",   label: "Quiet Hours",           icon: <ClockCircleOutlined /> },
];

function Section({ title, description, extra, children }: { title?: string; description?: string; extra?: React.ReactNode; children: React.ReactNode }) {
  const { token } = antTheme.useToken();
  return (
    <div style={{ background: token.colorBgContainer, border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, overflow: "hidden", marginBottom: 16 }}>
      {title && (
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${token.colorBorderSecondary}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Text strong style={{ fontSize: 13 }}>{title}</Text>
            {description && <><br /><Text type="secondary" style={{ fontSize: 12 }}>{description}</Text></>}
          </div>
          {extra}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

const NOTIF_CATEGORIES = [
  { module: "Sales",      items: ["New order received", "Order status changed", "Customer payment received", "Quotation expiring soon"] },
  { module: "Purchases",  items: ["Purchase order approved", "Vendor invoice received", "Delivery confirmed"] },
  { module: "Inventory",  items: ["Low stock alert", "Stock count discrepancy", "Inventory adjustment made"] },
  { module: "Accounting", items: ["Invoice overdue", "Period closing reminder", "Bank reconciliation needed"] },
  { module: "HR",         items: ["Leave request submitted", "Payroll processing due", "Employee document expiring"] },
  { module: "System",     items: ["Backup completed", "Login from new device", "User role changed"] },
];

const ALERT_TYPES = [
  { key: "1", name: "Critical System Error",  severity: "critical", channels: ["Email", "SMS", "In-App"], color: "#ef4444" },
  { key: "2", name: "Low Stock Warning",       severity: "high",     channels: ["Email", "In-App"],        color: "#f97316" },
  { key: "3", name: "Payment Overdue",         severity: "high",     channels: ["Email", "SMS"],            color: "#f97316" },
  { key: "4", name: "New Order Placed",        severity: "medium",   channels: ["In-App"],                  color: "#3b82f6" },
  { key: "5", name: "Report Generated",        severity: "low",      channels: ["Email"],                   color: "#10b981" },
];

const ESCALATION_RULES = [
  { key: "1", trigger: "Invoice unpaid > 30 days",      level1: "Account Manager (2hrs)", level2: "Finance Manager (24hrs)", level3: "Director (48hrs)" },
  { key: "2", trigger: "Critical stock level reached",  level1: "Warehouse Staff (1hr)",  level2: "Operations Manager (4hrs)", level3: "— " },
  { key: "3", trigger: "Failed login attempts > 5",     level1: "IT Admin (immediate)",    level2: "Security Officer (1hr)",  level3: "— " },
];

function PreferencesTab() {
  const { token } = antTheme.useToken();
  const channels = [
    { key: "email",   label: "Email",          icon: <MailOutlined /> },
    { key: "sms",     label: "SMS",             icon: <MobileOutlined /> },
    { key: "inapp",   label: "In-App",          icon: <DesktopOutlined /> },
    { key: "push",    label: "Push / Browser",  icon: <BellOutlined /> },
  ];
  return (
    <>
      <Alert type="info" showIcon message="Changes apply to all users. Individual users can further customize their preferences from their profile." style={{ marginBottom: 16, fontSize: 12 }} />
      {NOTIF_CATEGORIES.map((cat) => (
        <Section key={cat.module} title={cat.module}>
          {cat.items.map((item) => (
            <div key={item} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 0", borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}>
              <Text style={{ fontSize: 13 }}>{item}</Text>
              <Space size={16}>
                {channels.map((ch) => (
                  <Tooltip key={ch.key} title={ch.label}>
                    <Switch defaultChecked={ch.key !== "sms"} size="small" />
                  </Tooltip>
                ))}
              </Space>
            </div>
          ))}
        </Section>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Notification preferences saved")}>Save Preferences</Button>
      </div>
    </>
  );
}

function AlertTypesTab() {
  const severityColor: Record<string, string> = { critical: "red", high: "orange", medium: "blue", low: "green" };
  const alertCols = [
    { title: "Alert Name", dataIndex: "name", render: (v: string) => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
    { title: "Severity", dataIndex: "severity", render: (v: string) => <Tag color={severityColor[v]} style={{ fontSize: 11, textTransform: "capitalize" }}>{v}</Tag> },
    { title: "Channels", dataIndex: "channels", render: (v: string[]) => <Space wrap>{v.map(c => <Tag key={c} style={{ fontSize: 11 }}>{c}</Tag>)}</Space> },
    { title: "Actions", render: () => <Button size="small" icon={<SaveOutlined />}>Configure</Button> },
  ];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Configure channels and recipients per alert type</Text>
        <Button type="primary" icon={<PlusOutlined />} size="small">New Alert Type</Button>
      </div>
      <Table size="small" dataSource={ALERT_TYPES} columns={alertCols} pagination={false} />
    </>
  );
}

function EscalationTab() {
  const { token } = antTheme.useToken();
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Define auto-escalation rules when alerts go unacknowledged</Text>
        <Button type="primary" icon={<PlusOutlined />} size="small">New Rule</Button>
      </div>
      {ESCALATION_RULES.map((rule) => (
        <div key={rule.key} style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Space>
              <ThunderboltOutlined style={{ color: token.colorPrimary }} />
              <Text strong style={{ fontSize: 13 }}>{rule.trigger}</Text>
            </Space>
            <Button size="small" icon={<SaveOutlined />}>Edit</Button>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[{ label: "Level 1", value: rule.level1 }, { label: "Level 2", value: rule.level2 }, { label: "Level 3", value: rule.level3 }].map((l) => (
              <div key={l.label} style={{ background: token.colorFillAlter, borderRadius: 6, padding: "8px 14px", minWidth: 160 }}>
                <Text type="secondary" style={{ fontSize: 11, display: "block" }}>{l.label}</Text>
                <Text style={{ fontSize: 12 }}>{l.value}</Text>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function AnnouncementsTab() {
  return (
    <>
      <Section title="Internal Announcement Settings" description="Control how company-wide announcements are broadcast">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Announcement Channel" style={{ marginBottom: 16 }}>
                <Select defaultValue="inapp" options={[
                  { value: "inapp", label: "In-App Banner" },
                  { value: "email", label: "Email" },
                  { value: "both", label: "Both (In-App + Email)" },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Announcement Retention (days)" style={{ marginBottom: 16 }}>
                <Select defaultValue="30" options={["7","14","30","60","90"].map(v => ({ value: v, label: `${v} days` }))} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Who Can Send Announcements" style={{ marginBottom: 16 }}>
                <Select mode="multiple" defaultValue={["admin", "manager"]} options={[
                  { value: "admin", label: "Administrators" },
                  { value: "manager", label: "Managers" },
                  { value: "hr", label: "HR Department" },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "4px 0 16px" }} />
          <Space direction="vertical" size={10}>
            <div><Switch defaultChecked size="small" /> <Text style={{ fontSize: 13, marginLeft: 8 }}>Require acknowledgment for critical announcements</Text></div>
            <div><Switch size="small" /> <Text style={{ fontSize: 13, marginLeft: 8 }}>Auto-archive announcements after retention period</Text></div>
            <div><Switch defaultChecked size="small" /> <Text style={{ fontSize: 13, marginLeft: 8 }}>Send email digest of missed announcements</Text></div>
          </Space>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Announcement settings saved")}>Save Settings</Button>
      </div>
    </>
  );
}

function LanguageTab() {
  return (
    <>
      <Section title="Notification Language Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Notification Language" style={{ marginBottom: 16 }}>
                <Select defaultValue="en" options={[
                  { value: "en", label: "🇺🇸 English" },
                  { value: "ar", label: "🇸🇦 Arabic (العربية)" },
                  { value: "fr", label: "🇫🇷 French" },
                  { value: "de", label: "🇩🇪 German" },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="User Override" style={{ marginBottom: 16 }}>
                <Select defaultValue="allowed" options={[
                  { value: "allowed", label: "Allow users to set their own language" },
                  { value: "forced", label: "Force default language for all users" },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "4px 0 16px" }} />
          <Text strong style={{ fontSize: 13, display: "block", marginBottom: 12 }}>Notification Type Language Override</Text>
          <List dataSource={[
            { name: "Financial Alerts", lang: "en" },
            { name: "HR Notifications", lang: "ar" },
            { name: "System Alerts",    lang: "en" },
          ]} renderItem={(item) => (
            <List.Item style={{ padding: "8px 0" }}>
              <Text style={{ fontSize: 13, flex: 1 }}>{item.name}</Text>
              <Select defaultValue={item.lang} size="small" style={{ width: 160 }} options={[
                { value: "default", label: "Use default" },
                { value: "en", label: "🇺🇸 English" },
                { value: "ar", label: "🇸🇦 Arabic" },
                { value: "fr", label: "🇫🇷 French" },
              ]} />
            </List.Item>
          )} />
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Language settings saved")}>Save Settings</Button>
      </div>
    </>
  );
}

function QuietHoursTab() {
  const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return (
    <>
      <Section title="Quiet Hours" description="No non-critical notifications will be sent during these hours" extra={<Switch defaultChecked />}>
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Quiet Hours Start" style={{ marginBottom: 16 }}>
                <Select defaultValue="22:00" options={Array.from({ length: 24 }, (_, i) => ({ value: `${String(i).padStart(2,"0")}:00`, label: `${String(i).padStart(2,"0")}:00` }))} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Quiet Hours End" style={{ marginBottom: 16 }}>
                <Select defaultValue="08:00" options={Array.from({ length: 24 }, (_, i) => ({ value: `${String(i).padStart(2,"0")}:00`, label: `${String(i).padStart(2,"0")}:00` }))} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Apply on Days" style={{ marginBottom: 16 }}>
                <Select mode="multiple" defaultValue={["Saturday","Sunday"]} options={DAYS.map(d => ({ value: d, label: d }))} />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "4px 0 16px" }} />
          <Space direction="vertical" size={10}>
            <div><Switch defaultChecked size="small" /> <Text style={{ fontSize: 13, marginLeft: 8 }}>Critical alerts bypass quiet hours</Text></div>
            <div><Switch size="small" /> <Text style={{ fontSize: 13, marginLeft: 8 }}>Deliver queued notifications at end of quiet period</Text></div>
          </Space>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success("Quiet hours saved")}>Save Settings</Button>
      </div>
    </>
  );
}

// ─── Tooltip import ──────────────────────────────────────────────────────────
import { Tooltip } from "antd";

// ─── Main page ────────────────────────────────────────────────────────────────
export default function NotificationsConfig() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "preferences";

  const tabContent: Record<string, React.ReactNode> = {
    preferences:   <PreferencesTab />,
    alerts:        <AlertTypesTab />,
    escalation:    <EscalationTab />,
    announcements: <AnnouncementsTab />,
    language:      <LanguageTab />,
    "quiet-hours": <QuietHoursTab />,
  };

  return (
    <DashboardLayout
      currentPage="Notifications & Communication"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Settings" }, { label: "Notifications" }]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: `linear-gradient(135deg, ${token.colorPrimary}dd, ${token.colorPrimary}88)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BellOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>Notifications & Communication</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Configure how and when your team receives alerts and notifications</Text>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <Card style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, width: 210, flexShrink: 0 }} styles={{ body: { padding: "8px 0" } }}>
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setLocation(`/settings/notifications/${tab.key}`)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", background: activeTab === tab.key ? token.colorPrimaryBg : "transparent", color: activeTab === tab.key ? token.colorPrimary : token.colorText, border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400, transition: "background 0.15s, color 0.15s", textAlign: "left" }}
                onMouseEnter={(e) => { if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.background = token.colorFillAlter; }}
                onMouseLeave={(e) => { if (activeTab !== tab.key) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <span style={{ fontSize: 14, opacity: activeTab === tab.key ? 1 : 0.55 }}>{tab.icon}</span>
                <span style={{ flex: 1 }}>{tab.label}</span>
              </button>
            ))}
          </Card>

          <Card style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadiusLG, flex: 1, minWidth: 0 }}
            styles={{ body: { padding: 24 } }}
            title={<Space>{TABS.find(t => t.key === activeTab)?.icon}<Text strong>{TABS.find(t => t.key === activeTab)?.label}</Text></Space>}
          >
            {tabContent[activeTab] ?? <Alert type="info" message="Content coming soon" />}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
