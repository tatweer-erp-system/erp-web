import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
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
  ApartmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  IdcardOutlined,
  SaveOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SOON_TAG = (
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
    key: "employees",
    label: "Employees",
    icon: <UsergroupAddOutlined />,
    comingSoon: true,
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: <ClockCircleOutlined />,
    comingSoon: true,
  },
  {
    key: "leave",
    label: "Leave Management",
    icon: <CalendarOutlined />,
    comingSoon: true,
  },
  { key: "payroll", label: "Payroll", icon: <DollarOutlined /> },
  {
    key: "departments",
    label: "Departments",
    icon: <ApartmentOutlined />,
    comingSoon: true,
  },
  {
    key: "performance",
    label: "Performance",
    icon: <TrophyOutlined />,
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

function SaveRow({
  onSave,
  disabled,
}: {
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        onClick={onSave}
        disabled={disabled}
      >
        Save Changes
      </Button>
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <Section title="HR General Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Work Week{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="5"
                  disabled
                  options={[
                    { value: "5", label: "5 days (Mon–Fri)" },
                    { value: "6", label: "6 days (Mon–Sat)" },
                    { value: "7", label: "7 days" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Work Hours per Day{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={8}
                  min={1}
                  max={24}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="hrs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Employee ID Prefix{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="EMP-" maxLength={10} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Next Employee Number{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={1001}
                  min={1}
                  disabled
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Probation Period (months){SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={3}
                  min={0}
                  max={12}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="months"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Notice Period (days){SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={30}
                  min={0}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("General settings saved")}
        disabled
      />
    </>
  );
}

function EmployeesTab() {
  return (
    <>
      <Section title="Employee Management">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Require manager approval for new hires{SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Auto-create user account on hire{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Mandatory fields{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  mode="multiple"
                  defaultValue={["name", "department", "position"]}
                  disabled
                  options={[
                    { value: "name", label: "Full Name" },
                    { value: "department", label: "Department" },
                    { value: "position", label: "Job Position" },
                    { value: "phone", label: "Phone" },
                    { value: "address", label: "Address" },
                    { value: "national_id", label: "National ID" },
                    { value: "bank", label: "Bank Account" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Enable employee self-service portal{SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Employee settings saved")}
        disabled
      />
    </>
  );
}

function AttendanceTab() {
  return (
    <>
      <Section title="Attendance Tracking">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Attendance Method{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="manual"
                  disabled
                  options={[
                    { value: "manual", label: "Manual Entry" },
                    { value: "biometric", label: "Biometric Device" },
                    { value: "qrcode", label: "QR Code Scan" },
                    { value: "app", label: "Mobile App" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Late arrival grace period (minutes){SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={15}
                  min={0}
                  max={60}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Overtime policy{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="approval"
                  disabled
                  options={[
                    { value: "auto", label: "Auto-calculate" },
                    { value: "approval", label: "Require approval" },
                    { value: "none", label: "No overtime" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Overtime rate multiplier{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={1.5}
                  min={1}
                  step={0.25}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="x"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Track break time{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Geolocation check-in required{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Attendance settings saved")}
        disabled
      />
    </>
  );
}

function LeaveTab() {
  return (
    <>
      <Section title="Leave Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Annual Leave (days/year){SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={21}
                  min={0}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Sick Leave (days/year){SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Leave accrual period{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="monthly"
                  disabled
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annually", label: "Annually (lump sum)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Allow leave carryover{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Max carryover days{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Minimum notice for leave request (days){SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={3}
                  min={0}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Require manager approval for leave{SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Allow negative leave balance{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Leave settings saved")}
        disabled
      />
    </>
  );
}

function PayrollTab() {
  return (
    <>
      <Section title="Payroll Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Pay Period" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="monthly"
                  options={[
                    { value: "weekly", label: "Weekly" },
                    { value: "biweekly", label: "Bi-weekly" },
                    { value: "semimonthly", label: "Semi-monthly" },
                    { value: "monthly", label: "Monthly" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Pay Day" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="last"
                  options={[
                    { value: "1", label: "1st of month" },
                    { value: "15", label: "15th of month" },
                    { value: "last", label: "Last day of month" },
                    { value: "custom", label: "Custom" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Payroll Currency{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="USD"
                  disabled
                  options={[
                    { value: "USD", label: "US Dollar (USD)" },
                    { value: "EUR", label: "Euro (EUR)" },
                    { value: "AED", label: "UAE Dirham (AED)" },
                    { value: "SAR", label: "Saudi Riyal (SAR)" },
                    { value: "EGP", label: "Egyptian Pound (EGP)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Income Tax Calculation{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="auto"
                  disabled
                  options={[
                    { value: "auto", label: "Auto-calculate" },
                    { value: "manual", label: "Manual entry" },
                    { value: "none", label: "Not applicable" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Social Insurance (%){SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={14}
                  min={0}
                  max={100}
                  disabled
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Require payroll approval{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Payroll settings saved")} />
    </>
  );
}

function DepartmentsTab() {
  return (
    <>
      <Section title="Department Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Require department for all employees{SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Require department head{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Department budget tracking{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Cost center per department{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Department settings saved")}
        disabled
      />
    </>
  );
}

function PerformanceTab() {
  return (
    <>
      <Alert
        type="info"
        message="Performance evaluation module is coming soon."
        style={{ marginBottom: 16 }}
      />
      <Section title="Performance Review Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Review Cycle{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="annually"
                  disabled
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "semiannually", label: "Semi-annually" },
                    { value: "annually", label: "Annually" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Rating Scale{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Radio.Group defaultValue="5" disabled>
                  <Space>
                    <Radio value="3">3-point</Radio>
                    <Radio value="5">5-point</Radio>
                    <Radio value="10">10-point</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Enable 360° feedback{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Self-assessment required{SOON_TAG}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Link performance to salary increment{SOON_TAG}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Performance settings saved")}
        disabled
      />
    </>
  );
}

export default function HRSettings() {
  const params = useParams<"tab">();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    employees: <EmployeesTab />,
    attendance: <AttendanceTab />,
    leave: <LeaveTab />,
    payroll: <PayrollTab />,
    departments: <DepartmentsTab />,
    performance: <PerformanceTab />,
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
          <IdcardOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            HR Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure employees, attendance, leave, payroll, and performance
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
              onClick={() => navigate(`/settings/hr/${tab.key}`)}
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
                {tab.comingSoon && SOON_TAG}
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
