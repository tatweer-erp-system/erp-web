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
  AccountBookOutlined,
  BankOutlined,
  CheckSquareOutlined,
  PayCircleOutlined,
  MoneyCollectOutlined,
  RetweetOutlined,
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
    key: "cash",
    label: "Cash Accounts",
    icon: <AccountBookOutlined />,
    comingSoon: true,
  },
  {
    key: "bank",
    label: "Bank Accounts",
    icon: <BankOutlined />,
    comingSoon: true,
  },
  {
    key: "receipts",
    label: "Receipts",
    icon: <MoneyCollectOutlined />,
    comingSoon: true,
  },
  {
    key: "payments",
    label: "Payments",
    icon: <PayCircleOutlined />,
    comingSoon: true,
  },
  {
    key: "transfers",
    label: "Bank Transfers",
    icon: <RetweetOutlined />,
    comingSoon: true,
  },
  {
    key: "reconciliation",
    label: "Reconciliation",
    icon: <CheckSquareOutlined />,
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
      <Section title="Treasury Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Cash Account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="main-cash"
                  options={[
                    { value: "main-cash", label: "Main Cash Box" },
                    { value: "petty", label: "Petty Cash" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Bank Account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="main-bank"
                  options={[
                    { value: "main-bank", label: "Main Bank Account" },
                    { value: "usd-bank", label: "USD Account" },
                    { value: "eur-bank", label: "EUR Account" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Default Payment Method {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="bank"
                  options={[
                    { value: "bank", label: "Bank Transfer" },
                    { value: "cash", label: "Cash" },
                    { value: "check", label: "Check" },
                    { value: "card", label: "Card" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require reference number {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <Section title="Petty Cash">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Enable Petty Cash {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Petty Cash Limit {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={500}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for petty cash {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Max single petty cash amount {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={100}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
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

function CashTab() {
  return (
    <>
      <Section title="Cash Account Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow negative cash balance {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Warn on low cash balance {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Low cash balance threshold {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={1000}
                  min={0}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require cash count on close of day {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Cash GL Account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="1010"
                  options={[
                    { value: "1010", label: "1010 · Cash" },
                    { value: "1015", label: "1015 · Petty Cash" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Cash settings saved")} />
    </>
  );
}

function BankTab() {
  return (
    <>
      <Section title="Bank Account Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-import bank statements {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Statement import format {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="ofx"
                  options={[
                    { value: "ofx", label: "OFX / QFX" },
                    { value: "csv", label: "CSV" },
                    { value: "mt940", label: "MT940" },
                    { value: "camt", label: "CAMT.053" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Bank GL Account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="1020"
                  options={[
                    { value: "1020", label: "1020 · Bank" },
                    { value: "1025", label: "1025 · USD Bank Account" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Bank charges account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="6200"
                  options={[
                    { value: "6200", label: "6200 · Bank Charges" },
                    { value: "6210", label: "6210 · Finance Costs" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Bank settings saved")} />
    </>
  );
}

function ReceiptsTab() {
  return (
    <>
      <Section title="Receipt Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Receipt Prefix {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="RCP-" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Next Receipt Number {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={1001}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-reconcile receipts with invoices {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Allow partial receipts {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Print receipt on confirmation {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Send receipt via email {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Receipt settings saved")} />
    </>
  );
}

function PaymentsTab() {
  return (
    <>
      <Section title="Payment Defaults">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Payment Prefix {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="PAY-" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Next Payment Number {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={1001}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for payments {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Approval threshold {SOON}</>}
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
                label={<>Allow partial payments {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-reconcile with vendor invoices {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Payment settings saved")} />
    </>
  );
}

function TransfersTab() {
  return (
    <>
      <Section title="Bank Transfer Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Transfer Prefix {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Input disabled defaultValue="BT-" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Next Transfer Number {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={1001}
                  min={1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require approval for transfers {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Transfer charge account {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Select
                  disabled
                  defaultValue="6200"
                  options={[
                    { value: "6200", label: "6200 · Bank Charges" },
                    { value: "6210", label: "6210 · Transfer Fees" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow onSave={() => message.success("Transfer settings saved")} />
    </>
  );
}

function ReconciliationTab() {
  return (
    <>
      <Section title="Bank Reconciliation Settings">
        <Form layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Auto-match transactions {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Matching tolerance (amount) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={0.01}
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Matching tolerance (days) {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <InputNumber
                  disabled
                  defaultValue={3}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<>Require reconciliation before period close {SOON}</>}
                style={{ marginBottom: 16 }}
              >
                <Switch disabled defaultChecked />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Section>
      <SaveRow
        onSave={() => message.success("Reconciliation settings saved")}
      />
    </>
  );
}

export default function TreasurySettings() {
  const params = useParams<{ tab?: string }>();
  const [, setLocation] = useLocation();
  const { token } = antTheme.useToken();
  const activeTab = params.tab ?? "general";

  const tabContent: Record<string, React.ReactNode> = {
    general: <GeneralTab />,
    cash: <CashTab />,
    bank: <BankTab />,
    receipts: <ReceiptsTab />,
    payments: <PaymentsTab />,
    transfers: <TransfersTab />,
    reconciliation: <ReconciliationTab />,
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
          <BankOutlined style={{ fontSize: 20, color: "#fff" }} />
        </div>
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Treasury Settings
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Configure cash, bank accounts, payments, and reconciliation
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
              onClick={() => setLocation(`/settings/treasury/${tab.key}`)}
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
