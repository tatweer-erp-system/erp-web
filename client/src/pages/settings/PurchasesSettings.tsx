import { useParams, useLocation } from "wouter";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
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
  CarOutlined,
  DollarOutlined,
  FileTextOutlined,
  SaveOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UndoOutlined,
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
    key: "orders",
    label: "Purchase Orders",
    icon: <ShoppingOutlined />,
    comingSoon: true,
  },
  { key: "vendors", label: "Vendors", icon: <CarOutlined />, comingSoon: true },
  {
    key: "receiving",
    label: "Receiving",
    icon: <FileTextOutlined />,
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
    label: "Returns",
    icon: <UndoOutlined />,
    comingSoon: true,
  },
  {
    key: "tax",
    label: "Tax Settings",
    icon: <PercentageOutlined />,
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
      <Section title="Purchase Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
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
                label={<>Default Currency {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="USD"
                  options={[
                    { value: "USD", label: "US Dollar (USD)" },
                    { value: "EUR", label: "Euro (EUR)" },
                    { value: "GBP", label: "British Pound (GBP)" },
                    { value: "AED", label: "UAE Dirham (AED)" },
                    { value: "SAR", label: "Saudi Riyal (SAR)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Delivery Lead Time (days) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={7}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-send PO to vendor {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("General settings saved")} />
    </>
  );
}

function OrdersTab() {
  return (
    <>
      <Section title="Purchase Order Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Purchase Order Approval {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="auto"
                  options={[
                    { value: "auto", label: "Auto-confirm" },
                    { value: "manual", label: "Require approval" },
                    { value: "above", label: "Require approval above amount" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Approval threshold amount {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={10000}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow partial receiving {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Lock confirmed POs {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow over-receipt (above ordered qty) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Over-receipt tolerance (%) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={5}
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
      <SaveRow onSave={() => message.success("Order settings saved")} />
    </>
  );
}

function VendorsTab() {
  return (
    <>
      <Section title="Vendor Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Vendor Payment Method {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="bank"
                  options={[
                    { value: "bank", label: "Bank Transfer" },
                    { value: "check", label: "Check" },
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Credit Card" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Tax for Purchases {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="vat15"
                  options={[
                    { value: "none", label: "No Tax" },
                    { value: "vat5", label: "VAT 5%" },
                    { value: "vat15", label: "VAT 15%" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require vendor approval before ordering {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow purchase from unapproved vendors {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Vendor settings saved")} />
    </>
  );
}

function ReceivingTab() {
  return (
    <>
      <Section title="Goods Receipt Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require quality inspection on receipt {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-validate receipt {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default destination warehouse {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="main"
                  options={[
                    { value: "main", label: "Main Warehouse" },
                    { value: "store1", label: "Store 1" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Create bill on receipt {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>3-way matching (PO → Receipt → Invoice) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Receiving settings saved")} />
    </>
  );
}

function NumberingTab() {
  const series = [
    { label: "Purchase Orders", prefix: "PO-", next: 4001 },
    { label: "Purchase Invoices", prefix: "BILL-", next: 2001 },
    { label: "Goods Receipts", prefix: "GRN-", next: 1001 },
    { label: "Debit Notes", prefix: "DN-", next: 101 },
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
      <Section title="Purchase Return Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow purchase returns {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
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
                label={<>Auto-deduct from vendor balance {SOON}</>}
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
      <Section title="Purchase Tax Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Input Tax (VAT) {SOON}</>}
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
                label={<>Show tax on purchase documents {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Withholding Tax {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Withholding Tax Rate (%) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={5}
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
      <SaveRow onSave={() => message.success("Tax settings saved")} />
    </>
  );
}

export default function PurchasesSettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    orders: <OrdersTab />,
    vendors: <VendorsTab />,
    receiving: <ReceivingTab />,
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
          <ShoppingOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Purchases Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure purchase orders, vendor policies, and receiving
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
              onClick={() => setLocation(`/settings/purchases/${tab.key}`)}
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
