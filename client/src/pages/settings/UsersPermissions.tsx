import { useParams, useLocation } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  List,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import {
  UsergroupAddOutlined,
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  KeyOutlined,
  DesktopOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { LoginResult, UserStatus } from "@/constants/enums";

const { Title, Text } = Typography;

const SOON = (
  <Tag
    color="blue"
    style={{
      fontSize: 9,
      lineHeight: "16px",
      padding: "0 4px",
      marginInlineStart: 6,
      borderRadius: 4,
      verticalAlign: "middle",
    }}
  >
    Soon
  </Tag>
);

const TABS = [
  { key: "management", label: "User Management", icon: <UserOutlined /> },
  { key: "roles", label: "Roles & Permissions", icon: <LockOutlined /> },
  {
    key: "login",
    label: "Login Methods",
    icon: <GlobalOutlined />,
    comingSoon: true,
  },
  {
    key: "session",
    label: "Session Policy",
    icon: <ClockCircleOutlined />,
    comingSoon: true,
  },
  {
    key: "2fa",
    label: "2FA Settings",
    icon: <SafetyOutlined />,
    comingSoon: true,
  },
  { key: "activity", label: "Activity Log", icon: <HistoryOutlined /> },
];

function Section({
  title,
  description,
  extra,
  children,
}: {
  title?: string;
  description?: string;
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
        marginBottom: 16,
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
          <div>
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
          {extra}
        </div>
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

const USERS = [
  {
    key: "1",
    name: "John Doe",
    email: "john@corp.com",
    role: "Admin",
    dept: "IT",
    status: UserStatus.ACTIVE,
    last: "2 min ago",
  },
  {
    key: "2",
    name: "Sarah Ahmed",
    email: "sarah@corp.com",
    role: "Manager",
    dept: "Sales",
    status: UserStatus.ACTIVE,
    last: "1 hr ago",
  },
  {
    key: "3",
    name: "Omar Hassan",
    email: "omar@corp.com",
    role: "Staff",
    dept: "Finance",
    status: UserStatus.ACTIVE,
    last: "Yesterday",
  },
  {
    key: "4",
    name: "Lisa Chen",
    email: "lisa@corp.com",
    role: "Staff",
    dept: "HR",
    status: UserStatus.INACTIVE,
    last: "3 days ago",
  },
  {
    key: "5",
    name: "Mark Johnson",
    email: "mark@corp.com",
    role: "Viewer",
    dept: "Sales",
    status: UserStatus.ACTIVE,
    last: "5 hrs ago",
  },
];

const ROLES = [
  {
    name: "Administrator",
    users: 2,
    color: "#ef4444",
    permissions: ["All modules: Full access"],
  },
  {
    name: "Manager",
    users: 5,
    color: "#f97316",
    permissions: ["Sales, Purchases, HR: Full", "Finance: Read only"],
  },
  {
    name: "Accountant",
    users: 3,
    color: "#3b82f6",
    permissions: ["Accounting, Treasury: Full", "Reports: Read only"],
  },
  {
    name: "Sales Staff",
    users: 8,
    color: "#10b981",
    permissions: ["Sales: Full", "Inventory: Read only"],
  },
  {
    name: "Viewer",
    users: 4,
    color: "#8b5cf6",
    permissions: ["All modules: Read only"],
  },
];

const ACTIVITY_LOG = [
  {
    key: "1",
    user: "John Doe",
    action: "Created invoice #INV-2024-001",
    module: "Accounting",
    ip: "192.168.1.1",
    time: "2 min ago",
    status: LoginResult.SUCCESS,
  },
  {
    key: "2",
    user: "Sarah Ahmed",
    action: "Updated customer profile",
    module: "Sales",
    ip: "10.0.0.42",
    time: "15 min ago",
    status: LoginResult.SUCCESS,
  },
  {
    key: "3",
    user: "Unknown",
    action: "Failed login attempt",
    module: "Auth",
    ip: "185.44.2.10",
    time: "1 hr ago",
    status: LoginResult.FAILED,
  },
  {
    key: "4",
    user: "Omar Hassan",
    action: "Approved purchase order",
    module: "Purchases",
    ip: "10.0.0.8",
    time: "2 hrs ago",
    status: LoginResult.SUCCESS,
  },
  {
    key: "5",
    user: "Lisa Chen",
    action: "Exported employee report",
    module: "HR",
    ip: "192.168.1.5",
    time: "Yesterday",
    status: LoginResult.SUCCESS,
  },
];

function ManagementTab() {
  const userCols = [
    {
      title: "Name",
      dataIndex: "name",
      render: (v: string, r: (typeof USERS)[0]) => (
        <Space>
          <Avatar size={28} style={{ background: "#6366f1", fontSize: 11 }}>
            {v[0]}
          </Avatar>
          <Text style={{ fontSize: 13 }}>{v}</Text>
          {r.status === UserStatus.INACTIVE && (
            <Tag color="default" style={{ fontSize: 11 }}>
              Inactive
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (v: string) => (
        <Tag
          color={
            v === "Admin"
              ? "red"
              : v === "Manager"
                ? "orange"
                : v === "Viewer"
                  ? "purple"
                  : "blue"
          }
          style={{ fontSize: 11 }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Dept",
      dataIndex: "dept",
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => (
        <Badge
          status={v === UserStatus.ACTIVE ? "success" : "default"}
          text={v}
        />
      ),
    },
    {
      title: "Last Active",
      dataIndex: "last",
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Actions",
      render: () => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Input.Search
          placeholder="Search users..."
          style={{ width: 260 }}
          size="small"
        />
        <Space>
          <Select
            size="small"
            defaultValue="all"
            style={{ width: 130 }}
            options={[
              { value: "all", label: "All Roles" },
              { value: "admin", label: "Admin" },
              { value: "manager", label: "Manager" },
              { value: "staff", label: "Staff" },
            ]}
          />
          <Button type="primary" icon={<PlusOutlined />} size="small">
            Invite User
          </Button>
        </Space>
      </div>
      <Table
        size="small"
        dataSource={USERS}
        columns={userCols}
        pagination={{ pageSize: 10, size: "small" }}
      />
    </>
  );
}

function RolesTab() {
  const { token } = antTheme.useToken();
  const MODULES = [
    "Sales",
    "Purchases",
    "Inventory",
    "Accounting",
    "Treasury",
    "HR",
    "Reports",
    "Settings",
  ];
  const PERMS = ["View", "Create", "Edit", "Delete", "Export"];
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Text strong>Roles ({ROLES.length})</Text>
        <Button type="primary" icon={<PlusOutlined />} size="small">
          New Role
        </Button>
      </div>
      {ROLES.map(role => (
        <div
          key={role.name}
          style={{
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: token.colorFillAlter,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: role.color,
                }}
              />
              <Text strong style={{ fontSize: 13 }}>
                {role.name}
              </Text>
              <Tag style={{ fontSize: 11 }}>{role.users} users</Tag>
            </Space>
            <Space>
              <Button size="small" icon={<EditOutlined />}>
                Edit Permissions
              </Button>
            </Space>
          </div>
          <div style={{ padding: "10px 16px" }}>
            {role.permissions.map(p => (
              <Tag
                key={p}
                color="blue"
                style={{ margin: "2px 4px 2px 0", fontSize: 11 }}
              >
                {p}
              </Tag>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function LoginMethodsTab() {
  const { token } = antTheme.useToken();
  const methods = [
    {
      key: "email",
      label: "Email & Password",
      desc: "Standard email/password login",
      enabled: true,
      disabled: false,
      icon: <UserOutlined />,
    },
    {
      key: "google",
      label: "Google SSO",
      desc: "Sign in with Google Workspace",
      enabled: false,
      disabled: true,
      icon: <GlobalOutlined />,
    },
    {
      key: "microsoft",
      label: "Microsoft SSO",
      desc: "Sign in with Microsoft / Entra ID",
      enabled: false,
      disabled: true,
      icon: <DesktopOutlined />,
    },
    {
      key: "saml",
      label: "SAML 2.0",
      desc: "Enterprise SAML identity provider",
      enabled: false,
      disabled: true,
      icon: <KeyOutlined />,
    },
  ];
  return (
    <>
      <Section title="Authentication Methods">
        <List
          dataSource={methods}
          renderItem={m => (
            <List.Item
              style={{ padding: "12px 0" }}
              actions={[
                <Switch
                  key="sw"
                  defaultChecked={m.enabled}
                  size="small"
                  disabled={m.disabled}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={m.icon}
                    style={{
                      background: token.colorFillSecondary,
                      color: token.colorPrimary,
                    }}
                  />
                }
                title={
                  <Text style={{ fontSize: 13 }}>
                    {m.label}
                    {m.disabled && SOON}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {m.desc}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Section>
      <Section title="Password Policy">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Minimum Password Length {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="8"
                  disabled
                  options={["6", "8", "10", "12", "16"].map(v => ({
                    value: v,
                    label: `${v} characters`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Password Expiry {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="90"
                  disabled
                  options={[
                    { value: "never", label: "Never expires" },
                    { value: "30", label: "Every 30 days" },
                    { value: "90", label: "Every 90 days" },
                    { value: "180", label: "Every 180 days" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Space orientation="vertical" size={8}>
                <Checkbox defaultChecked disabled>
                  Require uppercase letters {SOON}
                </Checkbox>
                <Checkbox defaultChecked disabled>
                  Require numbers {SOON}
                </Checkbox>
                <Checkbox defaultChecked disabled>
                  Require special characters {SOON}
                </Checkbox>
                <Checkbox disabled>
                  Prevent reuse of last 5 passwords {SOON}
                </Checkbox>
              </Space>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SafetyOutlined />} disabled>
          Save Settings
        </Button>
      </div>
    </>
  );
}

function SessionPolicyTab() {
  return (
    <>
      <Section title="Session Timeout">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Idle Session Timeout {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="30"
                  disabled
                  options={[
                    { value: "15", label: "15 minutes" },
                    { value: "30", label: "30 minutes" },
                    { value: "60", label: "1 hour" },
                    { value: "120", label: "2 hours" },
                    { value: "480", label: "8 hours (work day)" },
                    { value: "never", label: "Never (not recommended)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Absolute Session Limit {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="480"
                  disabled
                  options={[
                    { value: "240", label: "4 hours" },
                    { value: "480", label: "8 hours" },
                    { value: "720", label: "12 hours" },
                    { value: "1440", label: "24 hours" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Max Concurrent Sessions per User {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="3"
                  disabled
                  options={[
                    { value: "1", label: "1 session only" },
                    { value: "3", label: "Up to 3 sessions" },
                    { value: "5", label: "Up to 5 sessions" },
                    { value: "unlimited", label: "Unlimited" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Remember Me Duration {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="7"
                  disabled
                  options={[
                    { value: "1", label: "1 day" },
                    { value: "7", label: "7 days" },
                    { value: "30", label: "30 days" },
                    { value: "never", label: "Disabled" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Divider style={{ margin: "4px 0 16px" }} />
          <Space orientation="vertical" size={10}>
            <Switch defaultChecked disabled />{" "}
            <Text style={{ fontSize: 13, marginLeft: 8 }}>
              Show warning dialog 5 minutes before session expires {SOON}
            </Text>
            <div>
              <Switch disabled />{" "}
              <Text style={{ fontSize: 13, marginLeft: 8 }}>
                Force re-authentication on sensitive actions (delete, export){" "}
                {SOON}
              </Text>
            </div>
          </Space>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" disabled>
          Save Policy
        </Button>
      </div>
    </>
  );
}

function TwoFATab() {
  return (
    <>
      <Section
        title="Two-Factor Authentication Policy"
        extra={<Switch defaultChecked disabled />}
      >
        <Alert
          type="info"
          showIcon
          message="Two-factor authentication is coming soon"
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>2FA Enforcement {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="required_admin"
                  disabled
                  options={[
                    { value: "optional", label: "Optional (user choice)" },
                    {
                      value: "required_admin",
                      label: "Required for Admins & Managers",
                    },
                    { value: "required_all", label: "Required for all users" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Grace Period (days to set up) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="7"
                  disabled
                  options={[
                    { value: "0", label: "No grace period" },
                    { value: "3", label: "3 days" },
                    { value: "7", label: "7 days" },
                    { value: "14", label: "14 days" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Allowed 2FA Methods">
        <List
          dataSource={[
            {
              label: "Authenticator App (TOTP)",
              desc: "Google Authenticator, Authy, etc.",
              enabled: true,
            },
            {
              label: "SMS One-Time Code",
              desc: "Sent to registered mobile number",
              enabled: true,
            },
            {
              label: "Email One-Time Code",
              desc: "Sent to registered email address",
              enabled: false,
            },
            {
              label: "Hardware Security Key",
              desc: "FIDO2 / WebAuthn (YubiKey, etc.)",
              enabled: false,
            },
          ]}
          renderItem={m => (
            <List.Item
              style={{ padding: "10px 0" }}
              actions={[
                <Switch
                  key="sw"
                  defaultChecked={m.enabled}
                  size="small"
                  disabled
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <Text style={{ fontSize: 13 }}>
                    {m.label} {SOON}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {m.desc}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<SafetyOutlined />} disabled>
          Save 2FA Settings
        </Button>
      </div>
    </>
  );
}

function ActivityLogTab() {
  const logCols = [
    {
      title: "User",
      dataIndex: "user",
      render: (v: string) => (
        <Space>
          <Avatar size={24} style={{ background: "#6366f1", fontSize: 10 }}>
            {v[0]}
          </Avatar>
          <Text style={{ fontSize: 13 }}>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Module",
      dataIndex: "module",
      render: (v: string) => (
        <Tag color="blue" style={{ fontSize: 11 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: "IP",
      dataIndex: "ip",
      render: (v: string) => (
        <Text code style={{ fontSize: 11 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Time",
      dataIndex: "time",
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          icon={
            v === "success" ? <CheckCircleOutlined /> : <CloseCircleOutlined />
          }
          color={v === "success" ? "success" : "error"}
          style={{ fontSize: 11 }}
        >
          {v}
        </Tag>
      ),
    },
  ];
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Space>
          <Input.Search
            placeholder="Search logs..."
            style={{ width: 220 }}
            size="small"
          />
          <Select
            size="small"
            defaultValue="all"
            style={{ width: 120 }}
            options={[
              { value: "all", label: "All modules" },
              { value: "auth", label: "Auth" },
              { value: "sales", label: "Sales" },
              { value: "accounting", label: "Accounting" },
            ]}
          />
        </Space>
        <Button size="small">Export Log</Button>
      </div>
      <Table
        size="small"
        dataSource={ACTIVITY_LOG}
        columns={logCols}
        pagination={{ pageSize: 10, size: "small" }}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function UsersPermissions() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "management";

  const tabContent: Record<string, React.ReactNode> = {
    management: <ManagementTab />,
    roles: <RolesTab />,
    login: <LoginMethodsTab />,
    session: <SessionPolicyTab />,
    "2fa": <TwoFATab />,
    activity: <ActivityLogTab />,
  };

  return (
    <DashboardLayout
      currentPage="Users & Permissions"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Settings" },
        { label: "Users & Permissions" },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            <UsergroupAddOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Users & Permissions
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Manage users, roles, and access control
            </Text>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
                onClick={() => setLocation(`/settings/users/${tab.key}`)}
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
                <span style={{ flex: 1 }}>{tab.label}</span>
                {tab.comingSoon && SOON}
              </button>
            ))}
          </Card>

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
                {TABS.find(t => t.key === activeTab)?.icon}
                <Text strong>{TABS.find(t => t.key === activeTab)?.label}</Text>
              </Space>
            }
          >
            {tabContent[activeTab] ?? (
              <Alert type="info" message="Content coming soon" />
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
