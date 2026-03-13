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
  DollarOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  PercentageOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TABS = [
  { key: "general", label: "General", icon: <SettingOutlined /> },
  { key: "invoicing", label: "Invoicing", icon: <FileProtectOutlined /> },
  { key: "customers", label: "Customers", icon: <TeamOutlined /> },
  { key: "pricing", label: "Pricing & Discounts", icon: <TagsOutlined /> },
  { key: "numbering", label: "Numbering Series", icon: <FileTextOutlined /> },
  { key: "returns", label: "Returns & Refunds", icon: <DollarOutlined /> },
  { key: "tax", label: "Tax Settings", icon: <PercentageOutlined /> },
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
      <Section title="Sales Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Default Price List"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Default Payment Terms"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Default Salesperson"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Sales Order Approval"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Lock confirmed orders"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Send order confirmation email"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
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
              <Form.Item label="Invoice Policy" style={{ marginBottom: 16 }}>
                <Select
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
                label="Default Due Date (days)"
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
            <Col xs={24} sm={12}>
              <Form.Item
                label="Default Invoice Template"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Include taxes in line total"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Show bank details on invoice"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Auto-send invoice on confirmation"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Invoice Footer Note"
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
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
                label="Default Credit Limit"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={5000}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Enforce Credit Limit"
                style={{ marginBottom: 16 }}
              >
                <Select
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
                label="Allow walk-in (no customer)"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require customer address on invoice"
                style={{ marginBottom: 16 }}
              >
                <Switch />
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
                label="Enable customer portal"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow online payment"
                style={{ marginBottom: 16 }}
              >
                <Switch />
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
                label="Price includes tax"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow manual price override"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Price rounding" style={{ marginBottom: 16 }}>
                <Select
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
                label="Default Margin (%)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
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
                label="Allow line discounts"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow global discount"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Maximum discount (%)"
                style={{ marginBottom: 16 }}
              >
                <InputNumber
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
                label="Require approval above max discount"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
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
                <Form.Item label="Prefix" style={{ marginBottom: 0 }}>
                  <Input defaultValue={s.prefix} maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Next Number" style={{ marginBottom: 0 }}>
                  <InputNumber
                    defaultValue={s.next}
                    min={1}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Padding" style={{ marginBottom: 0 }}>
                  <Select
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
                label="Allow sales returns"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Return window (days)"
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
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require reason for return"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require approval for returns"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Refund method" style={{ marginBottom: 16 }}>
                <Select
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
                label="Restock returned items"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
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
              <Form.Item label="Default Sales Tax" style={{ marginBottom: 16 }}>
                <Select
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
              <Form.Item label="Tax calculation" style={{ marginBottom: 16 }}>
                <Radio.Group defaultValue="exclusive">
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
                label="Show tax breakdown on invoice"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Apply tax to shipping"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Tax settings saved")} />
    </>
  );
}

export default function SalesSettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
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
              onClick={() => setLocation(`/settings/sales/${tab.key}`)}
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
