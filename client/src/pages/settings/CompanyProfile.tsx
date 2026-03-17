import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  TimePicker,
  Tooltip,
  Typography,
  Upload,
  message,
  theme as antTheme,
} from "antd";
import {
  ApartmentOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  DollarOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  PercentageOutlined,
  PhoneOutlined,
  SaveOutlined,
  ShopOutlined,
  FileProtectOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { UserStatus } from "@/constants/enums";

const { Title, Text, Paragraph } = Typography;

// ─── Tab definitions ─────────────────────────────────────────────────────────
const TABS = [
  { key: "profile", label: "Name & Logo", icon: <ShopOutlined /> },
  {
    key: "registration",
    label: "Registration Number",
    icon: <FileProtectOutlined />,
  },
  { key: "tax", label: "Tax / VAT Number", icon: <PercentageOutlined /> },
  { key: "address", label: "Company Address", icon: <EnvironmentOutlined /> },
  { key: "contact", label: "Contact Info", icon: <PhoneOutlined /> },
  { key: "hours", label: "Working Hours", icon: <ClockCircleOutlined /> },
  { key: "branches", label: "Branches", icon: <BranchesOutlined /> },
  { key: "billing", label: "Billing & Subscription", icon: <DollarOutlined /> },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const BRANCHES_DATA = [
  {
    key: "1",
    name: "Main Branch",
    city: "New York",
    country: "USA",
    manager: "John Doe",
    status: UserStatus.ACTIVE,
  },
  {
    key: "2",
    name: "Cairo Branch",
    city: "Cairo",
    country: "Egypt",
    manager: "Ahmed Ali",
    status: UserStatus.ACTIVE,
  },
  {
    key: "3",
    name: "Dubai Branch",
    city: "Dubai",
    country: "UAE",
    manager: "Sara Hassan",
    status: UserStatus.INACTIVE,
  },
];

// ─── Section wrapper ─────────────────────────────────────────────────────────
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

// ─── Tab content components ───────────────────────────────────────────────────
function ProfileTab() {
  const { token } = antTheme.useToken();
  return (
    <>
      <Section title="Company Logo">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            accept="image/*"
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 16,
                border: `2px dashed ${token.colorBorderSecondary}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: token.colorFillAlter,
                gap: 6,
              }}
            >
              <CloudUploadOutlined
                style={{ fontSize: 24, color: token.colorTextQuaternary }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Upload
              </Text>
            </div>
          </Upload>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              Company Logo
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              PNG or SVG, 512×512px recommended, max 2MB
            </Text>
            <br />
            <Space style={{ marginTop: 8 }}>
              <Button size="small" icon={<CloudUploadOutlined />}>
                Upload new
              </Button>
              <Button size="small" danger>
                Remove
              </Button>
            </Space>
          </div>
        </div>
      </Section>
      <Section title="Company Identity">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Legal Company Name"
                required
                style={{ marginBottom: 16 }}
              >
                <Input
                  defaultValue="Tech Solutions Inc."
                  placeholder="As per registration"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Display Name / Trade Name"
                style={{ marginBottom: 16 }}
              >
                <Input
                  defaultValue="TechSol"
                  placeholder="Brand / short name"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Company Tagline" style={{ marginBottom: 16 }}>
                <Input defaultValue="Enterprise solutions for modern business" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Company Code / Abbreviation"
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="TSI" maxLength={6} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Company Description"
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={3}
                  defaultValue="A leading provider of enterprise ERP solutions."
                  showCount
                  maxLength={500}
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
          onClick={() => message.success("Company identity saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function RegistrationTab() {
  return (
    <>
      <Section
        title="Commercial Registration"
        description="Official government-issued business registration details"
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Registration Number"
                required
                style={{ marginBottom: 16 }}
              >
                <Input
                  defaultValue="CR-2019-00847312"
                  prefix={<FileProtectOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Issuing Authority" style={{ marginBottom: 16 }}>
                <Input defaultValue="Ministry of Commerce" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Issue Date" style={{ marginBottom: 16 }}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Expiry Date" style={{ marginBottom: 16 }}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Country of Registration"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="US"
                  options={[
                    { value: "US", label: "United States" },
                    { value: "EG", label: "Egypt" },
                    { value: "AE", label: "UAE" },
                    { value: "GB", label: "United Kingdom" },
                    { value: "SA", label: "Saudi Arabia" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Business License Number"
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="BL-2019-54321" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section
        title="Document Upload"
        description="Upload scanned copies of your registration documents"
      >
        <Upload.Dragger
          beforeUpload={() => false}
          multiple
          style={{ padding: "12px 0" }}
        >
          <CloudUploadOutlined style={{ fontSize: 32, color: "#8c8c8c" }} />
          <p style={{ margin: "8px 0 4px", fontSize: 13 }}>
            Drag & drop files here, or click to browse
          </p>
          <Text type="secondary" style={{ fontSize: 12 }}>
            PDF, PNG, JPG up to 10MB each
          </Text>
        </Upload.Dragger>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Registration details saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function TaxTab() {
  return (
    <>
      <Section
        title="Tax / VAT Registration"
        description="Tax identification and VAT registration details"
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="VAT Registration Number"
                required
                style={{ marginBottom: 16 }}
              >
                <Input
                  defaultValue="VAT-US-123456789"
                  prefix={<PercentageOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tax Type" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="vat"
                  options={[
                    { value: "vat", label: "VAT (Value Added Tax)" },
                    { value: "gst", label: "GST (Goods & Services Tax)" },
                    { value: "sales", label: "Sales Tax" },
                    { value: "corporate", label: "Corporate Tax" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tax Registration Date"
                style={{ marginBottom: 16 }}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Default VAT Rate (%)"
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="15" suffix="%" type="number" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Tax Authority" style={{ marginBottom: 16 }}>
                <Input defaultValue="IRS" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tax Filing Frequency"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="quarterly"
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annually", label: "Annually" },
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
          onClick={() => message.success("Tax details saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function AddressTab() {
  return (
    <>
      <Section
        title="Registered Address"
        description="Primary legal address of the company"
      >
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Country" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="US"
                  showSearch
                  options={[
                    { value: "US", label: "🇺🇸 United States" },
                    { value: "EG", label: "🇪🇬 Egypt" },
                    { value: "AE", label: "🇦🇪 UAE" },
                    { value: "GB", label: "🇬🇧 United Kingdom" },
                    { value: "SA", label: "🇸🇦 Saudi Arabia" },
                    { value: "DE", label: "🇩🇪 Germany" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="State / Region" style={{ marginBottom: 16 }}>
                <Input defaultValue="New York" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="City" style={{ marginBottom: 16 }}>
                <Input defaultValue="New York City" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Postal Code" style={{ marginBottom: 16 }}>
                <Input defaultValue="10001" />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Street Address" style={{ marginBottom: 16 }}>
                <Input defaultValue="123 Business Avenue, Suite 400" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Building / Floor" style={{ marginBottom: 16 }}>
                <Input defaultValue="Floor 4, Tower B" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="PO Box" style={{ marginBottom: 0 }}>
                <Input defaultValue="PO Box 5400" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Address saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function ContactTab() {
  return (
    <>
      <Section title="Official Contact Information">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Primary Email"
                required
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="info@techsol.com" type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Support Email" style={{ marginBottom: 16 }}>
                <Input defaultValue="support@techsol.com" type="email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Primary Phone"
                required
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="+1 (555) 123-4567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Secondary Phone" style={{ marginBottom: 16 }}>
                <Input defaultValue="+1 (555) 987-6543" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Fax" style={{ marginBottom: 16 }}>
                <Input defaultValue="+1 (555) 123-4568" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Company Website" style={{ marginBottom: 16 }}>
                <Input
                  defaultValue="https://www.techsol.com"
                  prefix={<LinkOutlined />}
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
          onClick={() => message.success("Contact info saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function HoursTab() {
  const { token } = antTheme.useToken();
  return (
    <>
      <Section title="Working Days & Hours">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DAYS.map(day => {
            const isWeekend = day === "Saturday" || day === "Sunday";
            return (
              <div
                key={day}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: token.colorFillAlter,
                }}
              >
                <Checkbox
                  defaultChecked={!isWeekend}
                  style={{ width: 110, fontWeight: 500 }}
                >
                  {day}
                </Checkbox>
                <TimePicker
                  defaultValue={undefined}
                  placeholder="Start"
                  format="HH:mm"
                  size="small"
                  style={{ width: 100 }}
                  disabled={isWeekend}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  to
                </Text>
                <TimePicker
                  defaultValue={undefined}
                  placeholder="End"
                  format="HH:mm"
                  size="small"
                  style={{ width: 100 }}
                  disabled={isWeekend}
                />
                <Select
                  size="small"
                  defaultValue="1hr"
                  style={{ width: 130 }}
                  disabled={isWeekend}
                  options={[
                    { value: "none", label: "No break" },
                    { value: "30min", label: "30 min break" },
                    { value: "1hr", label: "1 hr break" },
                    { value: "1.5hr", label: "1.5 hr break" },
                  ]}
                  placeholder="Break"
                />
              </div>
            );
          })}
        </div>
      </Section>
      <Section title="Timezone">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Company Timezone" style={{ marginBottom: 0 }}>
                <Select
                  defaultValue="UTC-5"
                  options={[
                    { value: "UTC-8", label: "UTC-8 · Pacific Time" },
                    { value: "UTC-5", label: "UTC-5 · Eastern Time" },
                    { value: "UTC+0", label: "UTC+0 · GMT / London" },
                    { value: "UTC+3", label: "UTC+3 · Riyadh / Cairo" },
                    { value: "UTC+4", label: "UTC+4 · Dubai" },
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
          onClick={() => message.success("Working hours saved")}
        >
          Save Changes
        </Button>
      </div>
    </>
  );
}

function BranchesTab() {
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
      render: (v: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (v: string) => (
        <Space size={4}>
          <EnvironmentOutlined />
          <Text style={{ fontSize: 13 }}>{v}</Text>
        </Space>
      ),
    },
    { title: "Country", dataIndex: "country", key: "country" },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => (
        <Badge
          status={v === UserStatus.ACTIVE ? "success" : "default"}
          text={v === UserStatus.ACTIVE ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
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
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          Branch Locations
        </Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info("Add branch modal")}
        >
          Add Branch
        </Button>
      </div>
      <Card style={{ border: "none" }} styles={{ body: { padding: 0 } }}>
        <Table
          size="small"
          dataSource={BRANCHES_DATA}
          columns={columns}
          pagination={false}
        />
      </Card>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CompanyProfile() {
  const params = useParams<"tab">();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "profile";

  const activeLabel =
    TABS.find(t => t.key === activeTab)?.label ?? "Company Profile";

  const tabContent: Record<string, React.ReactNode> = {
    profile: <ProfileTab />,
    registration: <RegistrationTab />,
    tax: <TaxTab />,
    address: <AddressTab />,
    contact: <ContactTab />,
    hours: <HoursTab />,
    branches: <BranchesTab />,
  };

  return (
    <DashboardLayout
      currentPage="Company Profile"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Settings" },
        { label: "Company Profile" },
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
            <ApartmentOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Company Profile
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Manage your company's official information and legal details
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
                onClick={() => {
                  if (tab.key === "billing") {
                    navigate("/settings/billing");
                    return;
                  }
                  navigate(`/settings/company/${tab.key}`);
                }}
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
                {TABS.find(t => t.key === activeTab)?.icon}
                <Text strong>{activeLabel}</Text>
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
