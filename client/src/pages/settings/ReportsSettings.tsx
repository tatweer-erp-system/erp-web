import { useParams, useLocation } from "wouter";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  MailOutlined,
  PrinterOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

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
  {
    key: "general",
    label: "General",
    icon: <SettingOutlined />,
    comingSoon: true,
  },
  {
    key: "display",
    label: "Display Options",
    icon: <BarChartOutlined />,
    comingSoon: true,
  },
  {
    key: "scheduling",
    label: "Scheduling",
    icon: <CalendarOutlined />,
    comingSoon: true,
  },
  {
    key: "export",
    label: "Export Settings",
    icon: <CloudDownloadOutlined />,
    comingSoon: true,
  },
  {
    key: "email",
    label: "Email Delivery",
    icon: <MailOutlined />,
    comingSoon: true,
  },
  {
    key: "print",
    label: "Print Settings",
    icon: <PrinterOutlined />,
    comingSoon: true,
  },
  {
    key: "access",
    label: "Access Control",
    icon: <FileTextOutlined />,
    comingSoon: true,
  },
];

function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
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
          }}
        >
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
      )}
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function SaveRow({ onSave }: { onSave: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Button disabled type="primary" icon={<SaveOutlined />} onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <Section title="Report Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Date Range {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="thisMonth"
                  options={[
                    { value: "today", label: "Today" },
                    { value: "thisWeek", label: "This Week" },
                    { value: "thisMonth", label: "This Month" },
                    { value: "thisQuarter", label: "This Quarter" },
                    { value: "thisYear", label: "This Year" },
                    { value: "lastMonth", label: "Last Month" },
                    { value: "lastYear", label: "Last Year" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Comparison Period {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="lastYear"
                  options={[
                    { value: "none", label: "No Comparison" },
                    { value: "lastPeriod", label: "Previous Period" },
                    { value: "lastYear", label: "Same Period Last Year" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Currency {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="functional"
                  options={[
                    { value: "functional", label: "Functional Currency" },
                    { value: "USD", label: "USD" },
                    { value: "EUR", label: "EUR" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Number of decimal places {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="2"
                  options={[
                    { value: "0", label: "0 (1,234)" },
                    { value: "2", label: "2 (1,234.56)" },
                    { value: "3", label: "3 (1,234.567)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show zero-value rows {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-refresh report data {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("General settings saved")} />
    </>
  );
}

function DisplayTab() {
  return (
    <>
      <Section title="Chart & Visual Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Chart Type {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="bar"
                  options={[
                    { value: "bar", label: "Bar Chart" },
                    { value: "line", label: "Line Chart" },
                    { value: "pie", label: "Pie Chart" },
                    { value: "area", label: "Area Chart" },
                    { value: "table", label: "Table Only" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show charts by default {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable data labels on charts {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Rows per page (tables) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="25"
                  options={[
                    { value: "10", label: "10 rows" },
                    { value: "25", label: "25 rows" },
                    { value: "50", label: "50 rows" },
                    { value: "100", label: "100 rows" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show totals row {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show subtotals {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Display settings saved")} />
    </>
  );
}

function SchedulingTab() {
  return (
    <>
      <Section title="Automated Report Generation">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable scheduled reports {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Daily report time {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="08:00"
                  options={Array.from({ length: 24 }, (_, i) => ({
                    value: `${String(i).padStart(2, "0")}:00`,
                    label: `${String(i).padStart(2, "0")}:00`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Weekly report day {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="monday"
                  options={[
                    { value: "monday", label: "Monday" },
                    { value: "tuesday", label: "Tuesday" },
                    { value: "wednesday", label: "Wednesday" },
                    { value: "thursday", label: "Thursday" },
                    { value: "friday", label: "Friday" },
                    { value: "saturday", label: "Saturday" },
                    { value: "sunday", label: "Sunday" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Monthly report date {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="1"
                  options={Array.from({ length: 28 }, (_, i) => ({
                    value: String(i + 1),
                    label: `${i + 1}${["st", "nd", "rd"][i] ?? "th"} of month`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Scheduling settings saved")} />
    </>
  );
}

function ExportTab() {
  return (
    <>
      <Section title="Export Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Export Format {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="xlsx"
                  options={[
                    { value: "xlsx", label: "Excel (.xlsx)" },
                    { value: "csv", label: "CSV (.csv)" },
                    { value: "pdf", label: "PDF (.pdf)" },
                    { value: "json", label: "JSON (.json)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Include header row in exports {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Date format in exports {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="YYYY-MM-DD"
                  options={[
                    { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                    { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                    { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Include company logo in PDF exports {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Compress exported files (ZIP) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Export settings saved")} />
    </>
  );
}

function EmailTab() {
  return (
    <>
      <Section title="Email Delivery Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable email delivery {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default recipients {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  mode="tags"
                  placeholder="Add email addresses"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Report email subject prefix {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="[Report]" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Attach report as {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="pdf"
                  options={[
                    { value: "pdf", label: "PDF attachment" },
                    { value: "xlsx", label: "Excel attachment" },
                    { value: "link", label: "Link only" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={<>Email body template {SOON}</>}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  disabled
                  rows={3}
                  defaultValue="Please find the attached report. This is an automated message from the ERP system."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Email settings saved")} />
    </>
  );
}

function PrintTab() {
  return (
    <>
      <Section title="Print Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Paper Size {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="A4"
                  options={[
                    { value: "A4", label: "A4 (210 × 297 mm)" },
                    { value: "Letter", label: "US Letter (8.5 × 11 in)" },
                    { value: "Legal", label: "Legal (8.5 × 14 in)" },
                    { value: "A3", label: "A3 (297 × 420 mm)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Orientation {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="portrait"
                  options={[
                    { value: "portrait", label: "Portrait" },
                    { value: "landscape", label: "Landscape" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show page numbers {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show print date/time {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Include company header {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Include footer note {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Print settings saved")} />
    </>
  );
}

function AccessTab() {
  const reportModules = [
    { label: "Sales Reports", roles: ["Admin", "Manager", "Accountant"] },
    { label: "Purchase Reports", roles: ["Admin", "Accountant"] },
    { label: "Inventory Reports", roles: ["Admin", "Manager"] },
    { label: "Financial Reports", roles: ["Admin", "Accountant"] },
    { label: "HR Reports", roles: ["Admin"] },
    { label: "Tax Reports", roles: ["Admin", "Accountant"] },
  ];
  return (
    <>
      <Alert
        type="info"
        showIcon
        message="Control which roles can access each report module."
        style={{ marginBottom: 16, fontSize: 12 }}
      />
      {reportModules.map(r => (
        <Section key={r.label} title={r.label}>
          <Form layout="vertical">
            <Form.Item
              label={<>Allowed Roles {SOON}</>}
              style={{ marginBottom: 0 }}
            >
              <Select
                disabled
                mode="multiple"
                defaultValue={r.roles}
                options={[
                  { value: "SuperAdmin", label: "Super Admin" },
                  { value: "Admin", label: "Admin" },
                  { value: "Manager", label: "Manager" },
                  { value: "Accountant", label: "Accountant" },
                  { value: "Viewer", label: "Viewer" },
                ]}
              />
            </Form.Item>
          </Form>
        </Section>
      ))}
      <SaveRow onSave={() => message.success("Access settings saved")} />
    </>
  );
}

export default function ReportsSettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    display: <DisplayTab />,
    scheduling: <SchedulingTab />,
    export: <ExportTab />,
    email: <EmailTab />,
    print: <PrintTab />,
    access: <AccessTab />,
  };

  return (
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
          <BarChartOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Reports Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure report defaults, scheduling, export formats, and access
            control
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
              onClick={() => setLocation(`/settings/reports/${tab.key}`)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 16px",
                background:
                  activeTab === tab.key ? token.colorPrimaryBg : "transparent",
                color:
                  activeTab === tab.key ? token.colorPrimary : token.colorText,
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
              <span style={{ flex: 1 }}>
                {tab.label}
                {tab.comingSoon && SOON}
              </span>
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
  );
}
