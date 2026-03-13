import { useParams } from "wouter";
import { useLocation } from "wouter";
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
  CalculatorOutlined,
  CalendarOutlined,
  BookOutlined,
  FundOutlined,
  GlobalOutlined,
  LockOutlined,
  PercentageOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TABS = [
  { key: "general", label: "General", icon: <SettingOutlined /> },
  { key: "accounts", label: "Default Accounts", icon: <BookOutlined /> },
  { key: "journal", label: "Journal Settings", icon: <FundOutlined /> },
  { key: "fiscal", label: "Fiscal Year", icon: <CalendarOutlined /> },
  { key: "tax", label: "Tax Settings", icon: <PercentageOutlined /> },
  { key: "currency", label: "Currency", icon: <GlobalOutlined /> },
  { key: "closing", label: "Period Closing", icon: <LockOutlined /> },
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
      <Section title="Accounting Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Accounting Standard"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="ifrs"
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
                label="Functional Currency"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="USD"
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
                label="Auto-post journal entries"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require narration on journal entries"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow back-dated entries"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Require approval for manual entries"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("General settings saved")} />
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
      <Section title="Default Chart of Accounts Mapping">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            {accounts.map(a => (
              <Col xs={24} sm={12} key={a.label}>
                <Form.Item label={a.label} style={{ marginBottom: 16 }}>
                  <Select
                    defaultValue={a.default}
                    options={[{ value: a.default, label: a.default }]}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Default accounts saved")} />
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
                label="Default Journal Type"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="general"
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
                label="Journal Entry Prefix"
                style={{ marginBottom: 16 }}
              >
                <Input defaultValue="JE-" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Next Journal Number"
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
                label="Require balanced entries"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow multi-currency journals"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Attach documents to entries"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Journal settings saved")} />
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
                label="Fiscal Year Duration"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="12"
                  options={[
                    { value: "12", label: "12 months (Annual)" },
                    { value: "6", label: "6 months (Semi-annual)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Period Type" style={{ marginBottom: 16 }}>
                <Select
                  defaultValue="monthly"
                  options={[
                    { value: "monthly", label: "Monthly" },
                    { value: "quarterly", label: "Quarterly" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Auto-create periods"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
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
            <Col xs={24} sm={12}>
              <Form.Item label="Tax Basis" style={{ marginBottom: 16 }}>
                <Radio.Group defaultValue="accrual">
                  <Space direction="vertical" size={8}>
                    <Radio value="accrual">Accrual Basis</Radio>
                    <Radio value="cash">Cash Basis</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Enable tax groups" style={{ marginBottom: 16 }}>
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

function CurrencyTab() {
  return (
    <>
      <Section title="Multi-Currency Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Enable multi-currency"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Exchange rate source"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="manual"
                  options={[
                    { value: "manual", label: "Manual entry" },
                    { value: "auto", label: "Auto-fetch (live rates)" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Exchange rate update frequency"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="daily"
                  options={[
                    { value: "realtime", label: "Real-time" },
                    { value: "daily", label: "Daily" },
                    { value: "weekly", label: "Weekly" },
                    { value: "monthly", label: "Monthly" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Unrealised FX gains/losses account"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="6100"
                  options={[
                    { value: "6100", label: "6100 · FX Gain/Loss" },
                    { value: "6110", label: "6110 · Unrealised FX" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Realised FX gains/losses account"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="6100"
                  options={[
                    { value: "6100", label: "6100 · FX Gain/Loss" },
                    { value: "6120", label: "6120 · Realised FX" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Currency settings saved")} />
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
                label="Require approval to close period"
                style={{ marginBottom: 16 }}
              >
                <Switch defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Allow posting to closed periods (with override)"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Closing journal type"
                style={{ marginBottom: 16 }}
              >
                <Select
                  defaultValue="closing"
                  options={[
                    { value: "closing", label: "Closing Journal" },
                    { value: "general", label: "General Journal" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Auto-reverse adjustment entries"
                style={{ marginBottom: 16 }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Period closing settings saved")}
      />
    </>
  );
}

export default function AccountingSettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
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
              onClick={() => setLocation(`/settings/accounting/${tab.key}`)}
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
