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
  DollarOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
  ShopOutlined,
  TagsOutlined,
  TeamOutlined,
  PercentageOutlined,
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
    key: "invoicing",
    label: "Invoicing",
    icon: <FileProtectOutlined />,
    comingSoon: true,
  },
  {
    key: "customers",
    label: "Customers",
    icon: <TeamOutlined />,
    comingSoon: true,
  },
  {
    key: "pricing",
    label: "Pricing & Discounts",
    icon: <TagsOutlined />,
    comingSoon: true,
  },
  {
    key: "numbering",
    label: "Numbering Series",
    icon: <FileTextOutlined />,
    comingSoon: true,
  },
  {
    key: "returns",
    label: "Returns & Refunds",
    icon: <DollarOutlined />,
    comingSoon: true,
  },
  {
    key: "tax",
    label: "Tax Settings",
    icon: <PercentageOutlined />,
    comingSoon: true,
  },
  { key: "pos", label: "POS", icon: <ShopOutlined />, comingSoon: true },
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
      <Section title="Sales Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Price List {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="retail"
                  options={[
                    { value: "retail", label: "Retail Price List" },
                    { value: "wholesale", label: "Wholesale Price List" },
                    { value: "vip", label: "VIP Price List" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Payment Terms {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="net30"
                  options={[
                    { value: "immediate", label: "Immediate" },
                    { value: "net15", label: "Net 15 days" },
                    { value: "net30", label: "Net 30 days" },
                    { value: "net60", label: "Net 60 days" },
                    { value: "net90", label: "Net 90 days" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Salesperson {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="none"
                  options={[
                    { value: "none", label: "— None —" },
                    { value: "current", label: "Current User" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Sales Order Approval {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="auto"
                  options={[
                    { value: "auto", label: "Auto-confirm" },
                    { value: "manual", label: "Require approval" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Lock confirmed orders {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Send order confirmation email {SOON}</>}
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

function InvoicingTab() {
  return (
    <>
      <Section title="Invoice Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Invoice Policy {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="order"
                  options={[
                    { value: "order", label: "Invoice on Order" },
                    { value: "delivery", label: "Invoice on Delivery" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Due Date (days) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={30}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Invoice Template {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="standard"
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "detailed", label: "Detailed" },
                    { value: "compact", label: "Compact" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Include taxes in line total {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show bank details on invoice {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-send invoice on confirmation {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={<>Invoice Footer Note {SOON}</>}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  disabled
                  rows={2}
                  defaultValue="Thank you for your business. Payment is due within the specified terms."
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Invoice settings saved")} />
    </>
  );
}

function CustomersTab() {
  return (
    <>
      <Section title="Customer Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Credit Limit {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={5000}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enforce Credit Limit {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="warn"
                  options={[
                    { value: "none", label: "No restriction" },
                    { value: "warn", label: "Warn but allow" },
                    { value: "block", label: "Block sales" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow walk-in (no customer) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require customer address on invoice {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Customer Portal">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable customer portal {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow online payment {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Customer settings saved")} />
    </>
  );
}

function PricingTab() {
  return (
    <>
      <Section title="Pricing Policy">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Price includes tax {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow manual price override {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Price rounding {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="0.01"
                  options={[
                    { value: "0.01", label: "0.01 (2 decimal places)" },
                    { value: "0.1", label: "0.10 (1 decimal place)" },
                    { value: "1", label: "1.00 (whole number)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Margin (%) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={30}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Discounts">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow line discounts {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow global discount {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Maximum discount (%) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={20}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval above max discount {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Pricing settings saved")} />
    </>
  );
}

function NumberingTab() {
  const series = [
    { label: "Quotations", prefix: "QUO-", next: 1001 },
    { label: "Sales Orders", prefix: "SO-", next: 5001 },
    { label: "Sales Invoices", prefix: "INV-", next: 3001 },
    { label: "Credit Notes", prefix: "CRN-", next: 101 },
    { label: "Delivery Orders", prefix: "DO-", next: 2001 },
  ];
  return (
    <>
      <Alert
        type="info"
        showIcon
        message="Changes to numbering series only affect new documents."
        style={{ marginBottom: 16, fontSize: 12 }}
      />
      {series.map(s => (
        <Section key={s.label} title={s.label}>
          <Form layout="vertical">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<>Prefix {SOON}</>}
                  style={{ marginBottom: 0 }}
                >
                  <Input disabled defaultValue={s.prefix} maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<>Next Number {SOON}</>}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber
                    disabled
                    defaultValue={s.next}
                    min={1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label={<>Padding {SOON}</>}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    disabled
                    defaultValue={4}
                    options={[3, 4, 5, 6].map(v => ({
                      value: v,
                      label: `${v} digits`,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Section>
      ))}
      <SaveRow onSave={() => message.success("Numbering settings saved")} />
    </>
  );
}

function ReturnsTab() {
  return (
    <>
      <Section title="Return Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow sales returns {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Return window (days) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={30}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require reason for return {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for returns {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Refund method {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="credit"
                  options={[
                    { value: "credit", label: "Credit Note" },
                    { value: "refund", label: "Cash Refund" },
                    { value: "exchange", label: "Exchange" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Restock returned items {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Return settings saved")} />
    </>
  );
}

function TaxTab() {
  return (
    <>
      <Section title="Sales Tax Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Sales Tax {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="vat15"
                  options={[
                    { value: "none", label: "No Tax" },
                    { value: "vat5", label: "VAT 5%" },
                    { value: "vat15", label: "VAT 15%" },
                    { value: "vat20", label: "VAT 20%" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Tax calculation {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Radio.Group disabled defaultValue="exclusive">
                  <Space>
                    <Radio value="exclusive">
                      Tax exclusive (added on top)
                    </Radio>
                    <Radio value="inclusive">
                      Tax inclusive (included in price)
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show tax breakdown on invoice {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Apply tax to shipping {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Tax settings saved")} />
    </>
  );
}

function POSTab() {
  return (
    <>
      <Section title="Stock & Sales">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow Negative Stock {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Tax Rate (%) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={15}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Loyalty & Orders">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable Loyalty Program {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Max Held Orders {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={5}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Receipt">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Receipt Header Text {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="Welcome to our store" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Receipt Footer Text {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="Thank you for your purchase!" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-print Receipt {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Kitchen Display">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable Kitchen Display {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("POS settings saved")} />
    </>
  );
}

export default function SalesSettings() {
  const params = useParams<"tab">();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    invoicing: <InvoicingTab />,
    customers: <CustomersTab />,
    pricing: <PricingTab />,
    numbering: <NumberingTab />,
    returns: <ReturnsTab />,
    tax: <TaxTab />,
    pos: <POSTab />,
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
          <FileProtectOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Sales Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure invoicing, pricing, discounts, and sales policies
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
              onClick={() => navigate(`/settings/sales/${tab.key}`)}
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
