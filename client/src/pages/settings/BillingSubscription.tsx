import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  List,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Timeline,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import {
  PayCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  BankOutlined,
  ReloadOutlined,
  ControlOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ArrowUpOutlined,
  WarningOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { InvoiceStatus } from "@/constants/enums";

const { Title, Text } = Typography;

const TABS = [
  { key: "plan", label: "Subscription Plan", icon: <StarOutlined /> },
  { key: "contact", label: "Billing Contact", icon: <UserOutlined /> },
  { key: "invoices", label: "Invoice Preferences", icon: <FileTextOutlined /> },
  {
    key: "cost-centers",
    label: "Cost Center Billing",
    icon: <ApartmentOutlined />,
  },
  { key: "payment", label: "Payment Method", icon: <PayCircleOutlined /> },
  { key: "renewal", label: "Auto-Renewal", icon: <ReloadOutlined /> },
  { key: "limits", label: "Spending Limits", icon: <ControlOutlined /> },
  { key: "history", label: "Invoice History", icon: <HistoryOutlined /> },
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

function PlanTab() {
  const { token } = antTheme.useToken();
  const features = [
    "Unlimited users",
    "All ERP modules",
    "Priority support 24/7",
    "5 branch locations",
    "Advanced analytics & reports",
    "API access & webhooks",
    "Custom integrations",
    "99.9% SLA uptime",
  ];
  const usage = [
    { label: "Users", used: 24, total: "Unlimited", pct: 0 },
    { label: "Storage", used: 18, total: 100, pct: 18, unit: "GB" },
    { label: "API Calls", used: 42, total: 100, pct: 42, unit: "K/mo" },
    { label: "Branches", used: 3, total: 5, pct: 60 },
  ];
  return (
    <>
      <Section title="Current Plan">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}88)`,
                  borderRadius: 8,
                  padding: "4px 12px",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                  Enterprise
                </Text>
              </div>
              <Tag
                color="success"
                icon={<CheckCircleOutlined />}
                style={{ fontSize: 12 }}
              >
                Active
              </Tag>
            </div>
            <Title level={2} style={{ margin: "0 0 4px" }}>
              $4,800
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 400 }}>
                /year
              </Text>
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Renews on Jan 15, 2026 · Billed annually
            </Text>
          </div>
          <Button
            type="primary"
            icon={<ArrowUpOutlined />}
            onClick={() => message.info("Contact sales to upgrade")}
          >
            Upgrade Plan
          </Button>
        </div>
        <Divider style={{ margin: "16px 0" }} />
        <Text
          strong
          style={{ fontSize: 13, display: "block", marginBottom: 10 }}
        >
          Included Features
        </Text>
        <Row gutter={[8, 8]}>
          {features.map(f => (
            <Col xs={24} sm={12} key={f}>
              <Space size={6}>
                <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                <Text style={{ fontSize: 12 }}>{f}</Text>
              </Space>
            </Col>
          ))}
        </Row>
      </Section>
      <Section title="Usage This Period">
        <Row gutter={[16, 16]}>
          {usage.map(u => (
            <Col xs={24} sm={12} key={u.label}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ fontSize: 13 }}>{u.label}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {u.used}
                  {u.unit ?? ""} /{" "}
                  {typeof u.total === "number"
                    ? `${u.total}${u.unit ?? ""}`
                    : u.total}
                </Text>
              </div>
              {u.pct > 0 && (
                <Progress
                  percent={u.pct}
                  showInfo={false}
                  strokeColor={u.pct > 80 ? "#ef4444" : token.colorPrimary}
                  size="small"
                />
              )}
            </Col>
          ))}
        </Row>
      </Section>
    </>
  );
}

function BillingContactTab() {
  return (
    <>
      <Section
        title="Billing Contact Information"
        description="This person receives all invoices and billing communications"
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Full Name"
                required
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="John Doe" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Job Title" style={{ marginBottom: 16 }}>
                <Input defaultValue="Chief Financial Officer" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Billing Email"
                required
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="billing@techsol.com" type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Phone" style={{ marginBottom: 16 }}>
                <Input defaultValue="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Billing Address" style={{ marginBottom: 16 }}>
                <Input defaultValue="123 Business Avenue, Suite 400, New York, NY 10001" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tax / VAT Number (for invoices)"
                style={{ marginBottom: 0 }}
              >
                <Input defaultValue="VAT-US-123456789" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Billing contact saved")}
        >
          Save Contact
        </Button>
      </div>
    </>
  );
}

function InvoicePreferencesTab() {
  return (
    <>
      <Section title="Invoice Delivery & Format">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Invoice Format" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="pdf"
                  options={[
                    { value: "pdf", label: "PDF (Standard)" },
                    {
                      value: "pdf_detailed",
                      label: "PDF (Detailed breakdown)",
                    },
                    { value: "csv", label: "CSV (machine-readable)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Delivery Method" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="email"
                  options={[
                    { value: "email", label: "Email only" },
                    { value: "portal", label: "Portal only (download)" },
                    { value: "both", label: "Email + Portal" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Invoice Currency" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="USD"
                  options={["USD", "EUR", "GBP", "AED", "SAR"].map(v => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Invoice Numbering Format"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="INV-YYYY-NNNN"
                  options={[
                    { value: "INV-YYYY-NNNN", label: "INV-2024-0001" },
                    { value: "YYYY-MM-NNNN", label: "2024-01-0001" },
                    { value: "custom", label: "Custom prefix..." },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Additional Invoice Notes (printed on all invoices)"
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={2}
                  defaultValue="Thank you for your business. Payment due within 30 days."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Invoice preferences saved")}
        >
          Save Preferences
        </Button>
      </div>
    </>
  );
}

function CostCentersTab() {
  const { token } = antTheme.useToken();
  const centers = [
    {
      key: "1",
      dept: "Information Technology",
      allocation: 30,
      manager: "John Doe",
      budget: "$1,440",
    },
    {
      key: "2",
      dept: "Sales & Marketing",
      allocation: 35,
      manager: "Sarah Ahmed",
      budget: "$1,680",
    },
    {
      key: "3",
      dept: "Finance",
      allocation: 20,
      manager: "Omar Hassan",
      budget: "$960",
    },
    {
      key: "4",
      dept: "Human Resources",
      allocation: 15,
      manager: "Lisa Chen",
      budget: "$720",
    },
  ];
  const cols = [
    {
      title: "Department",
      dataIndex: "dept",
      render: (v: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Budget Manager",
      dataIndex: "manager",
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Allocation",
      dataIndex: "allocation",
      render: (v: number) => (
        <Space>
          <Progress
            percent={v}
            size="small"
            style={{ width: 80 }}
            showInfo={false}
          />
          <Text style={{ fontSize: 12 }}>{v}%</Text>
        </Space>
      ),
    },
    {
      title: "Est. Annual Cost",
      dataIndex: "budget",
      render: (v: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    { title: "Actions", render: () => <Button size="small">Edit</Button> },
  ];
  return (
    <>
      <Alert
        type="info"
        showIcon
        message="Total allocations must equal 100%. Adjust percentages before saving."
        style={{ marginBottom: 12, fontSize: 12 }}
      />
      <Table
        size="small"
        dataSource={centers}
        columns={cols}
        pagination={false}
      />
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Cost center allocation saved")}
        >
          Save Allocation
        </Button>
      </div>
    </>
  );
}

function PaymentMethodTab() {
  const { token } = antTheme.useToken();
  return (
    <>
      <Section title="Payment Method on File">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            background: token.colorFillAlter,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 52,
              height: 36,
              background: `linear-gradient(135deg, #1a1f71, #009be0)`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PayCircleOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div style={{ flex: 1 }}>
            <Text strong style={{ fontSize: 13 }}>
              Visa ending in •••• 4242
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Expires 08/2027 · Auto-renewal enabled
            </Text>
          </div>
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Default
          </Tag>
        </div>
        <Space>
          <Button
            icon={<PayCircleOutlined />}
            onClick={() => message.info("Card update dialog")}
          >
            Update Card
          </Button>
          <Button onClick={() => message.info("Add payment method")}>
            Add Payment Method
          </Button>
        </Space>
      </Section>
      <Section
        title="Bank Transfer Details"
        description="For manual wire transfers"
      >
        <Descriptions size="small" column={2} bordered>
          <Descriptions.Item label="Bank Name">
            First National Bank
          </Descriptions.Item>
          <Descriptions.Item label="Account Name">
            Tech Solutions Inc.
          </Descriptions.Item>
          <Descriptions.Item label="Account Number">
            ••••••7890
          </Descriptions.Item>
          <Descriptions.Item label="Routing Number">
            021000021
          </Descriptions.Item>
          <Descriptions.Item label="SWIFT/BIC">FNBAUS3N</Descriptions.Item>
          <Descriptions.Item label="IBAN">
            US12 FNBA 0000 1234 5678 90
          </Descriptions.Item>
        </Descriptions>
      </Section>
    </>
  );
}

function RenewalTab() {
  return (
    <>
      <Section title="Auto-Renewal Settings" extra={<Switch defaultChecked />}>
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Auto-renewal is enabled"
          description="Your subscription will automatically renew on Jan 15, 2026. You will be notified 30 days before renewal."
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Send renewal notice before"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="30"
                  options={[
                    { value: "7", label: "7 days before" },
                    { value: "14", label: "14 days before" },
                    { value: "30", label: "30 days before" },
                    { value: "60", label: "60 days before" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Renewal notification recipient"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="billing"
                  options={[
                    { value: "billing", label: "Billing contact only" },
                    { value: "admin", label: "All admins" },
                    { value: "both", label: "Billing contact + Admins" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Renewal settings saved")}
        >
          Save Settings
        </Button>
      </div>
    </>
  );
}

function SpendingLimitsTab() {
  const depts = [
    {
      key: "1",
      dept: "Information Technology",
      monthly: 5000,
      spent: 3200,
      pct: 64,
    },
    {
      key: "2",
      dept: "Sales & Marketing",
      monthly: 8000,
      spent: 7100,
      pct: 89,
    },
    { key: "3", dept: "Finance", monthly: 3000, spent: 900, pct: 30 },
    { key: "4", dept: "Human Resources", monthly: 2000, spent: 1500, pct: 75 },
  ];
  const cols = [
    {
      title: "Department",
      dataIndex: "dept",
      render: (v: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Monthly Limit",
      dataIndex: "monthly",
      render: (v: number) => <Text>${v.toLocaleString()}</Text>,
    },
    {
      title: "Spent (MTD)",
      dataIndex: "spent",
      render: (v: number, r: (typeof depts)[0]) => (
        <Space>
          <Progress
            percent={r.pct}
            size="small"
            style={{ width: 80 }}
            showInfo={false}
            strokeColor={
              r.pct > 85 ? "#ef4444" : r.pct > 70 ? "#f59e0b" : "#10b981"
            }
          />
          <Text style={{ fontSize: 12 }}>
            ${v.toLocaleString()} ({r.pct}%)
          </Text>
          {r.pct > 85 && <WarningOutlined style={{ color: "#ef4444" }} />}
        </Space>
      ),
    },
    {
      title: "Alert at",
      render: () => (
        <Select
          size="small"
          defaultValue="80"
          style={{ width: 90 }}
          options={["70", "80", "90", "95"].map(v => ({
            value: v,
            label: `${v}%`,
          }))}
        />
      ),
    },
    {
      title: "Actions",
      render: () => <Button size="small">Edit Limit</Button>,
    },
  ];
  return (
    <>
      <Alert
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        message="Sales & Marketing is at 89% of monthly spending limit"
        style={{ marginBottom: 12, fontSize: 12 }}
      />
      <Table
        size="small"
        dataSource={depts}
        columns={cols}
        pagination={false}
      />
      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Spending limits saved")}
        >
          Save Limits
        </Button>
      </div>
    </>
  );
}

function InvoiceHistoryTab() {
  const invoices = [
    {
      key: "1",
      number: "INV-2025-0012",
      date: "Jan 15, 2025",
      amount: "$4,800.00",
      period: "Jan 2025 – Jan 2026",
      status: InvoiceStatus.PAID,
    },
    {
      key: "2",
      number: "INV-2024-0009",
      date: "Jan 15, 2024",
      amount: "$4,200.00",
      period: "Jan 2024 – Jan 2025",
      status: InvoiceStatus.PAID,
    },
    {
      key: "3",
      number: "INV-2023-0006",
      date: "Jan 15, 2023",
      amount: "$3,600.00",
      period: "Jan 2023 – Jan 2024",
      status: InvoiceStatus.PAID,
    },
    {
      key: "4",
      number: "INV-2022-0003",
      date: "Jan 15, 2022",
      amount: "$3,600.00",
      period: "Jan 2022 – Jan 2023",
      status: InvoiceStatus.PAID,
    },
  ];
  const cols = [
    {
      title: "Invoice #",
      dataIndex: "number",
      render: (v: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (v: string) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: "Period",
      dataIndex: "period",
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color="success"
          icon={<CheckCircleOutlined />}
          style={{ fontSize: 11 }}
        >
          Paid
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: () => (
        <Button size="small" icon={<DownloadOutlined />}>
          PDF
        </Button>
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
        <Text type="secondary" style={{ fontSize: 12 }}>
          All past invoices and payment records
        </Text>
        <Button size="small" icon={<DownloadOutlined />}>
          Export All
        </Button>
      </div>
      <Table
        size="small"
        dataSource={invoices}
        columns={cols}
        pagination={false}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BillingSubscription() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "plan";

  const tabContent: Record<string, React.ReactNode> = {
    plan: <PlanTab />,
    contact: <BillingContactTab />,
    invoices: <InvoicePreferencesTab />,
    "cost-centers": <CostCentersTab />,
    payment: <PaymentMethodTab />,
    renewal: <RenewalTab />,
    limits: <SpendingLimitsTab />,
    history: <InvoiceHistoryTab />,
  };

  return (
    <DashboardLayout
      currentPage="Billing & Subscription"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Settings" },
        { label: "Billing & Subscription" },
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
            <PayCircleOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Billing & Subscription
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Manage your subscription plan, invoices, and billing details
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
                onClick={() => setLocation(`/settings/billing/${tab.key}`)}
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
