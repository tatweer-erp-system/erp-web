import { useParams, useLocation } from "wouter";
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

const TABS = [
  { key: "general", label: "General", icon: <SettingOutlined /> },
  { key: "employees", label: "Employees", icon: <UsergroupAddOutlined /> },
  { key: "attendance", label: "Attendance", icon: <ClockCircleOutlined /> },
  { key: "leave", label: "Leave Management", icon: <CalendarOutlined /> },
  { key: "payroll", label: "Payroll", icon: <DollarOutlined /> },
  { key: "departments", label: "Departments", icon: <ApartmentOutlined /> },
  { key: "performance", label: "Performance", icon: <TrophyOutlined /> },
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
      <Button type="primary" icon={<SaveOutlined />} onClick={onSave}>
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
              <Form.Item label="Work Week" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="5"
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
                label="Work Hours per Day"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={8}
                  min={1}
                  max={24}
                  style={{ width: "100%" }}
                  addonAfter="hrs"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Employee ID Prefix"
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="EMP-" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Next Employee Number"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={1001}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Probation Period (months)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={3}
                  min={0}
                  max={12}
                  style={{ width: "100%" }}
                  addonAfter="months"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Notice Period (days)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={30}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("General settings saved")} />
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
                label="Require manager approval for new hires"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Auto-create user account on hire"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Mandatory fields" style={{ marginBottom: 16 }}>
                <Select
                  mode="multiple"
                  defaultValue={["name", "department", "position"]}
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
                label="Enable employee self-service portal"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Employee settings saved")} />
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
              <Form.Item label="Attendance Method" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="manual"
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
                label="Late arrival grace period (minutes)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={15}
                  min={0}
                  max={60}
                  style={{ width: "100%" }}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Overtime policy" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="approval"
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
                label="Overtime rate multiplier"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={1.5}
                  min={1}
                  step={0.25}
                  style={{ width: "100%" }}
                  addonAfter="x"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Track break time" style={{ marginBottom: 16 }}>
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Geolocation check-in required"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Attendance settings saved")} />
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
                label="Annual Leave (days/year)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={21}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Sick Leave (days/year)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Leave accrual period"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="monthly"
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
                label="Allow leave carryover"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Max carryover days"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Minimum notice for leave request (days)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={3}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require manager approval for leave"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow negative leave balance"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Leave settings saved")} />
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
              <Form.Item label="Payroll Currency" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="USD"
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
                label="Income Tax Calculation"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="auto"
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
                label="Social Insurance (%)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={14}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require payroll approval"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
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
                label="Require department for all employees"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require department head"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Department budget tracking"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Cost center per department"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Department settings saved")} />
    </>
  );
}

function PerformanceTab() {
  return (
    <>
      <Section title="Performance Review Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Review Cycle" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="annually"
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
              <Form.Item label="Rating Scale" style={{ marginBottom: 16 }}>
                <Radio.Group defaultValue="5">
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
                label="Enable 360° feedback"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Self-assessment required"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Link performance to salary increment"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Performance settings saved")} />
    </>
  );
}

export default function HRSettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
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
              onClick={() => setLocation(`/settings/hr/${tab.key}`)}
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
  );
}
