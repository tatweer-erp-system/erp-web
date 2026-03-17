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
  AppstoreOutlined,
  BarChartOutlined,
  BarcodeOutlined,
  ControlOutlined,
  HomeOutlined,
  InboxOutlined,
  SaveOutlined,
  SettingOutlined,
  SwapOutlined,
  WarningOutlined,
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
    key: "costing",
    label: "Costing Method",
    icon: <BarChartOutlined />,
    comingSoon: true,
  },
  {
    key: "numbering",
    label: "Numbering Series",
    icon: <BarcodeOutlined />,
    comingSoon: true,
  },
  { key: "stock", label: "Stock Management", icon: <InboxOutlined /> },
  {
    key: "warehouse",
    label: "Warehouses",
    icon: <HomeOutlined />,
    comingSoon: true,
  },
  {
    key: "transfers",
    label: "Transfers",
    icon: <SwapOutlined />,
    comingSoon: true,
  },
  {
    key: "alerts",
    label: "Alerts & Thresholds",
    icon: <WarningOutlined />,
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
      <Section title="Default Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Unit of Measure{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="pcs"
                  disabled
                  options={[
                    { value: "pcs", label: "Pieces (pcs)" },
                    { value: "kg", label: "Kilogram (kg)" },
                    { value: "ltr", label: "Litre (ltr)" },
                    { value: "m", label: "Meter (m)" },
                    { value: "box", label: "Box" },
                    { value: "ctn", label: "Carton" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Currency{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="USD"
                  disabled
                  options={[
                    { value: "USD", label: "US Dollar (USD)" },
                    { value: "EUR", label: "Euro (EUR)" },
                    { value: "GBP", label: "British Pound (GBP)" },
                    { value: "AED", label: "UAE Dirham (AED)" },
                    { value: "SAR", label: "Saudi Riyal (SAR)" },
                    { value: "EGP", label: "Egyptian Pound (EGP)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Product Type{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="storable"
                  disabled
                  options={[
                    { value: "storable", label: "Storable Product" },
                    { value: "consumable", label: "Consumable" },
                    { value: "service", label: "Service" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Tax{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="vat15"
                  disabled
                  options={[
                    { value: "none", label: "No Tax" },
                    { value: "vat5", label: "VAT 5%" },
                    { value: "vat15", label: "VAT 15%" },
                    { value: "vat20", label: "VAT 20%" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Product Catalog">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Show product images in lists{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable product variants{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable serial number tracking{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable lot / batch tracking{SOON_TAG}</>}
                style={{ marginBottom: 0 }}
              >
                <Switch disabled />
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

function CostingTab() {
  return (
    <>
      <Alert
        type="info"
        showIcon
        message="Changing the costing method affects how product cost is calculated across all transactions."
        style={{ marginBottom: 16, fontSize: 12 }}
      />
      <Section title="Inventory Costing Method">
        <Form layout="vertical">
          <Form.Item
            label={<>Costing Method{SOON_TAG}</>}
            style={{ marginBottom: 24 }}
          >
            <Radio.Group defaultValue="avg" disabled>
              <Space orientation="vertical" size={14}>
                <Radio value="fifo">
                  <Text strong>FIFO — First In, First Out</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cost of oldest inventory is used first. Best for perishable
                    or time-sensitive goods.
                  </Text>
                </Radio>
                <Radio value="avg">
                  <Text strong>Average Cost (Weighted Average)</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cost is averaged across all units. Simple and common for
                    most businesses.
                  </Text>
                </Radio>
                <Radio value="lifo">
                  <Text strong>LIFO — Last In, First Out</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Cost of newest inventory is used first. Not allowed under
                    IFRS.
                  </Text>
                </Radio>
                <Radio value="standard">
                  <Text strong>Standard Cost</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    A predefined cost is set manually and used consistently.
                    Variances are posted to accounts.
                  </Text>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={<>Include Landed Costs in Product Cost{SOON_TAG}</>}
            style={{ marginBottom: 16 }}
          >
            <Switch defaultChecked disabled />
          </Form.Item>
          <Form.Item
            label={<>Revaluation on Currency Change{SOON_TAG}</>}
            style={{ marginBottom: 0 }}
          >
            <Switch disabled />
          </Form.Item>
        </Form>
      </Section>
      <Section title="Cost Accounts">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Inventory Account{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="1300"
                  disabled
                  options={[
                    { value: "1300", label: "1300 · Inventory" },
                    { value: "1310", label: "1310 · Raw Materials" },
                    { value: "1320", label: "1320 · Finished Goods" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>COGS Account{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="5100"
                  disabled
                  options={[
                    { value: "5100", label: "5100 · Cost of Goods Sold" },
                    { value: "5200", label: "5200 · Direct Materials" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Costing settings saved")}
        disabled
      />
    </>
  );
}

function NumberingTab() {
  return (
    <>
      <Section title="Product Numbering">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-generate Product Code{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Product Code Prefix{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="PRD-" maxLength={10} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Next Sequence Number{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={1001}
                  min={1}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Padding (digits){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue={4}
                  disabled
                  options={[3, 4, 5, 6].map(v => ({
                    value: v,
                    label: `${v} digits (e.g. ${String(1).padStart(v, "0")})`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Barcode">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Barcode Type{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="ean13"
                  disabled
                  options={[
                    { value: "ean13", label: "EAN-13" },
                    { value: "ean8", label: "EAN-8" },
                    { value: "code128", label: "Code 128" },
                    { value: "qr", label: "QR Code" },
                    { value: "upc", label: "UPC-A" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-generate Barcode{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Numbering settings saved")}
        disabled
      />
    </>
  );
}

function StockTab() {
  return (
    <>
      <Section title="Stock Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              {/* Allow Negative Stock — has backend support, kept enabled */}
              <Form.Item
                label="Allow Negative Stock"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-deduct stock on invoice{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-replenishment (reorder rules){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require quality check before receiving{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Reorder Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Reorder Point (units){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Reorder Quantity (units){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={50}
                  min={1}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Lead Time (days){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={7}
                  min={0}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Safety Stock (units){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={5}
                  min={0}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      {/* Save enabled — Allow Negative Stock has backend support */}
      <SaveRow onSave={() => message.success("Stock settings saved")} />
    </>
  );
}

function WarehouseTab() {
  return (
    <>
      <Section title="Warehouse Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Warehouse{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="main"
                  disabled
                  options={[
                    { value: "main", label: "Main Warehouse" },
                    { value: "store1", label: "Store 1" },
                    { value: "store2", label: "Store 2" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Multi-warehouse Mode{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable bin / location tracking{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for warehouse creation{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Warehouse settings saved")}
        disabled
      />
    </>
  );
}

function TransfersTab() {
  return (
    <>
      <Section title="Transfer Policies">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for transfers{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow partial transfers{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-validate transfers{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Transfer Prefix{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="TRF-" maxLength={10} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Transfer settings saved")}
        disabled
      />
    </>
  );
}

function AlertsTab() {
  return (
    <>
      <Section title="Stock Alerts">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Low Stock Alert{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Low Stock Threshold (units){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={10}
                  min={0}
                  style={{ width: "100%" }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Out-of-Stock Alert{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Overstock Alert{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Expiry Date Alert (days before){SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  defaultValue={30}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Alert Notification Channel{SOON_TAG}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="email"
                  mode="multiple"
                  disabled
                  options={[
                    { value: "email", label: "Email" },
                    { value: "inapp", label: "In-App" },
                    { value: "sms", label: "SMS" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Alert settings saved")}
        disabled
      />
    </>
  );
}

export default function InventorySettings() {
  const params = useParams<"tab">();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    costing: <CostingTab />,
    numbering: <NumberingTab />,
    stock: <StockTab />,
    warehouse: <WarehouseTab />,
    transfers: <TransfersTab />,
    alerts: <AlertsTab />,
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
          <AppstoreOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Inventory Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure stock management, costing methods, warehouses, and alerts
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
              onClick={() => navigate(`/settings/inventory/${tab.key}`)}
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
