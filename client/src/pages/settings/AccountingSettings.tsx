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
  Tooltip,
  Typography,
  message,
  theme as antTheme,
} from "antd";
import {
  CalculatorOutlined,
  CalendarOutlined,
  BookOutlined,
  DollarOutlined,
  FundOutlined,
  LockOutlined,
  PercentageOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SoonTag = (
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
    key: "accounts",
    label: "Default Accounts",
    icon: <BookOutlined />,
    comingSoon: true,
  },
  {
    key: "journal",
    label: "Journal Settings",
    icon: <FundOutlined />,
    comingSoon: true,
  },
  { key: "fiscal", label: "Fiscal Year", icon: <CalendarOutlined /> },
  { key: "tax", label: "Tax Settings", icon: <PercentageOutlined /> },
  {
    key: "currency",
    label: "Currencies",
    icon: <DollarOutlined />,
    comingSoon: true,
  },
  {
    key: "closing",
    label: "Period Closing",
    icon: <LockOutlined />,
    comingSoon: true,
  },
];

function Section({
  title,
  description,
  children,
}: {
  title?: React.ReactNode;
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
  const btn = (
    <Button
      type="primary"
      icon={<SaveOutlined />}
      onClick={onSave}
      disabled={disabled}
    >
      Save Changes
    </Button>
  );
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      {disabled ? <Tooltip title="Coming Soon">{btn}</Tooltip> : btn}
    </div>
  );
}

function GeneralTab() {
  return (
    <>
      <Section title="Accounting Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Accounting Standard{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="ifrs"
                  disabled
                  options={[
                    { value: "ifrs", label: "IFRS (International)" },
                    { value: "gaap", label: "US GAAP" },
                    { value: "local", label: "Local GAAP" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Functional Currency{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="SAR"
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
                label={<span>Auto-post journal entries{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Require narration on journal entries{SoonTag}</span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Allow back-dated entries{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>Require approval for manual entries{SoonTag}</span>
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
        onSave={() => message.success("General settings saved")}
        disabled
      />
    </>
  );
}

function AccountsTab() {
  const accounts = [
    { label: "Accounts Receivable", default: "1100 · Trade Receivables" },
    { label: "Accounts Payable", default: "2100 · Trade Payables" },
    { label: "Cash & Equivalents", default: "1010 · Cash" },
    { label: "Bank Account", default: "1020 · Bank" },
    { label: "Sales Revenue", default: "4000 · Sales Revenue" },
    { label: "COGS", default: "5000 · Cost of Goods Sold" },
    { label: "Inventory", default: "1300 · Inventory" },
    { label: "Tax Payable (Output)", default: "2200 · VAT Payable" },
    { label: "Tax Receivable (Input)", default: "1400 · VAT Receivable" },
    { label: "Retained Earnings", default: "3200 · Retained Earnings" },
  ];
  return (
    <>
      <Alert
        type="info"
        showIcon
        message="These default accounts are used when no specific account is assigned to a transaction."
        style={{ marginBottom: 16, fontSize: 12 }}
      />
      <Section title={<span>Default Chart of Accounts Mapping{SoonTag}</span>}>
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            {accounts.map(a => (
              <Col xs={24} sm={12} key={a.label}>
                <Form.Item label={a.label} style={{ marginBottom: 16 }}>
                  <Select
                    defaultValue={a.default}
                    disabled
                    options={[{ value: a.default, label: a.default }]}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Default accounts saved")}
        disabled
      />
    </>
  );
}

function JournalTab() {
  return (
    <>
      <Section title="Journal Entry Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Default Journal Type{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="general"
                  disabled
                  options={[
                    { value: "general", label: "General Journal" },
                    { value: "sales", label: "Sales Journal" },
                    { value: "purchase", label: "Purchase Journal" },
                    { value: "cash", label: "Cash Journal" },
                    { value: "bank", label: "Bank Journal" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Journal Entry Prefix{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="JE-" maxLength={10} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Next Journal Number{SoonTag}</span>}
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
                label={<span>Require balanced entries{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Allow multi-currency journals{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Attach documents to entries{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Journal settings saved")}
        disabled
      />
    </>
  );
}

function FiscalTab() {
  return (
    <>
      <Section title="Fiscal Year Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Fiscal Year Start Month"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="1"
                  options={[
                    { value: "1", label: "January" },
                    { value: "2", label: "February" },
                    { value: "3", label: "March" },
                    { value: "4", label: "April" },
                    { value: "7", label: "July" },
                    { value: "10", label: "October" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Fiscal Year Duration{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="12"
                  disabled
                  options={[
                    { value: "12", label: "12 months (Annual)" },
                    { value: "6", label: "6 months (Semi-annual)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Period Type{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="monthly"
                  disabled
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Auto-create periods{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Fiscal year settings saved")} />
    </>
  );
}

function TaxTab() {
  return (
    <>
      <Section title="Tax Configuration">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Default Tax Rate" style={{ marginBottom: 16 }}>
                <InputNumber
                  defaultValue={15}
                  min={0}
                  max={100}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Tax Filing Frequency{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="quarterly"
                  disabled
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                    { value: "annually", label: "Annually" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Tax Basis{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Radio.Group defaultValue="accrual" disabled>
                  <Space orientation="vertical" size={8}>
                    <Radio value="accrual">Accrual Basis</Radio>
                    <Radio value="cash">Cash Basis</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Enable tax groups{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Tax settings saved")} />
    </>
  );
}

function CurrencyTab() {
  return (
    <>
      <Section title="Multi-Currency">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Functional Currency{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="SAR"
                  disabled
                  options={[
                    { value: "SAR", label: "Saudi Riyal (SAR)" },
                    { value: "USD", label: "US Dollar (USD)" },
                    { value: "EUR", label: "Euro (EUR)" },
                    { value: "AED", label: "UAE Dirham (AED)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Enable Multi-Currency{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Exchange Rate Source{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="manual"
                  disabled
                  options={[
                    { value: "manual", label: "Manual Entry" },
                    { value: "auto", label: "Auto-fetch (Live Rates)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Rate Update Frequency{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="daily"
                  disabled
                  options={[
                    { value: "realtime", label: "Real-time" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>FX Gain/Loss Account{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="5301"
                  disabled
                  options={[
                    { value: "5301", label: "5301 · Foreign Exchange Losses" },
                    { value: "4202", label: "4202 · Foreign Exchange Gains" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Currency settings saved")}
        disabled
      />
    </>
  );
}

function ClosingTab() {
  return (
    <>
      <Alert
        type="warning"
        showIcon
        message="Period closing is irreversible. Closed periods cannot have new transactions posted."
        style={{ marginBottom: 16, fontSize: 12 }}
      />
      <Section title="Period Closing Rules">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Require approval to close period{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span>
                    Allow posting to closed periods (with override){SoonTag}
                  </span>
                }
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Closing journal type{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="closing"
                  disabled
                  options={[
                    { value: "closing", label: "Closing Journal" },
                    { value: "general", label: "General Journal" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span>Auto-reverse adjustment entries{SoonTag}</span>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Period closing settings saved")}
        disabled
      />
    </>
  );
}

export default function AccountingSettings() {
  const params = useParams<"tab">();
  const navigate = useNavigate();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    accounts: <AccountsTab />,
    journal: <JournalTab />,
    fiscal: <FiscalTab />,
    tax: <TaxTab />,
    currency: <CurrencyTab />,
    closing: <ClosingTab />,
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
          <CalculatorOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Accounting Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure journal settings, fiscal year, tax, and closing rules
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
              onClick={() => navigate(`/settings/accounting/${tab.key}`)}
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
                {tab.comingSoon && SoonTag}
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
