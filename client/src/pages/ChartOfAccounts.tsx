import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Tree, Card, Row, Col, Tag, Space, Typography, Button, Input,
  Drawer, Descriptions, Statistic, Tabs, Badge, Grid, Tooltip,
  Divider, theme as antTheme, Modal, Form, Select, Switch, message,
} from "antd";
import type { TreeDataNode } from "antd";
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  FolderOutlined, FileTextOutlined, BankOutlined,
  DollarOutlined, LineChartOutlined, PercentageOutlined, ApartmentOutlined,
  SettingOutlined, EyeOutlined, CloseOutlined, SaveOutlined,
  ArrowLeftOutlined, SubnodeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Shared account data ───────────────────────────────────────────────────────

interface Account {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  subtype: string;
  normalBal: "debit" | "credit";
  balance: number;
  ytdDebit: number;
  ytdCredit: number;
  active: boolean;
  description: string;
  children?: Account[];
}

const ACCOUNTS: Account[] = [
  {
    code: "1000", name: "Assets", type: "asset", subtype: "Header", normalBal: "debit",
    balance: 4820000, ytdDebit: 0, ytdCredit: 0, active: true, description: "All company assets",
    children: [
      {
        code: "1100", name: "Current Assets", type: "asset", subtype: "Header", normalBal: "debit",
        balance: 1940000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Assets expected to be converted to cash within one year",
        children: [
          { code: "1110", name: "Cash & Bank",           type: "asset", subtype: "Cash",        normalBal: "debit",  balance: 842000,  ytdDebit: 3840000, ytdCredit: 2998000, active: true,  description: "Cash on hand and bank balances" },
          { code: "1120", name: "Accounts Receivable",   type: "asset", subtype: "Receivable",  normalBal: "debit",  balance: 634000,  ytdDebit: 2960000, ytdCredit: 2326000, active: true,  description: "Amounts owed by customers" },
          { code: "1130", name: "Inventory",             type: "asset", subtype: "Inventory",   normalBal: "debit",  balance: 348000,  ytdDebit: 1240000, ytdCredit: 892000,  active: true,  description: "Goods held for sale" },
          { code: "1140", name: "Prepaid Expenses",      type: "asset", subtype: "Prepaid",     normalBal: "debit",  balance: 84000,   ytdDebit: 192000,  ytdCredit: 108000,  active: true,  description: "Expenses paid in advance" },
          { code: "1150", name: "Short-term Investments",type: "asset", subtype: "Investment",  normalBal: "debit",  balance: 132000,  ytdDebit: 480000,  ytdCredit: 348000,  active: false, description: "Investments maturing within 12 months" },
        ],
      },
      {
        code: "1200", name: "Fixed Assets", type: "asset", subtype: "Header", normalBal: "debit",
        balance: 2880000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Long-term tangible assets",
        children: [
          { code: "1210", name: "Property & Equipment",      type: "asset", subtype: "Fixed",        normalBal: "debit",  balance: 3480000, ytdDebit: 480000,  ytdCredit: 0,      active: true,  description: "Land, buildings, and equipment" },
          { code: "1220", name: "Accumulated Depreciation",  type: "asset", subtype: "Contra",       normalBal: "credit", balance: -600000, ytdDebit: 0,       ytdCredit: 120000, active: true,  description: "Accumulated depreciation contra account" },
          { code: "1230", name: "Intangible Assets",         type: "asset", subtype: "Intangible",   normalBal: "debit",  balance: 180000,  ytdDebit: 60000,   ytdCredit: 0,      active: true,  description: "Patents, trademarks, goodwill" },
        ],
      },
    ],
  },
  {
    code: "2000", name: "Liabilities", type: "liability", subtype: "Header", normalBal: "credit",
    balance: 1940000, ytdDebit: 0, ytdCredit: 0, active: true, description: "All company obligations",
    children: [
      {
        code: "2100", name: "Current Liabilities", type: "liability", subtype: "Header", normalBal: "credit",
        balance: 840000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Obligations due within one year",
        children: [
          { code: "2110", name: "Accounts Payable",    type: "liability", subtype: "Payable",   normalBal: "credit", balance: 412000, ytdDebit: 1820000, ytdCredit: 2232000, active: true, description: "Amounts owed to vendors" },
          { code: "2120", name: "Accrued Expenses",    type: "liability", subtype: "Accrued",   normalBal: "credit", balance: 184000, ytdDebit: 640000,  ytdCredit: 824000,  active: true, description: "Expenses incurred but not yet paid" },
          { code: "2130", name: "VAT Payable",         type: "liability", subtype: "Tax",       normalBal: "credit", balance: 98000,  ytdDebit: 342000,  ytdCredit: 440000,  active: true, description: "VAT collected from customers" },
          { code: "2140", name: "Short-term Loans",    type: "liability", subtype: "Loan",      normalBal: "credit", balance: 146000, ytdDebit: 200000,  ytdCredit: 346000,  active: true, description: "Loans due within one year" },
        ],
      },
      {
        code: "2200", name: "Long-term Liabilities", type: "liability", subtype: "Header", normalBal: "credit",
        balance: 1100000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Obligations due beyond one year",
        children: [
          { code: "2210", name: "Bank Loans",          type: "liability", subtype: "Loan",      normalBal: "credit", balance: 840000,  ytdDebit: 120000, ytdCredit: 960000, active: true,  description: "Long-term bank financing" },
          { code: "2220", name: "Deferred Tax",        type: "liability", subtype: "Tax",       normalBal: "credit", balance: 260000,  ytdDebit: 48000,  ytdCredit: 308000, active: false, description: "Deferred tax liability" },
        ],
      },
    ],
  },
  {
    code: "3000", name: "Equity", type: "equity", subtype: "Header", normalBal: "credit",
    balance: 2880000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Owners' equity",
    children: [
      { code: "3100", name: "Share Capital",          type: "equity", subtype: "Capital",  normalBal: "credit", balance: 1800000, ytdDebit: 0,      ytdCredit: 0,      active: true, description: "Paid-in share capital" },
      { code: "3200", name: "Retained Earnings",      type: "equity", subtype: "Retained", normalBal: "credit", balance: 823000,  ytdDebit: 0,      ytdCredit: 757000, active: true, description: "Accumulated profits" },
      { code: "3300", name: "Current Year Earnings",  type: "equity", subtype: "Earnings", normalBal: "credit", balance: 257000,  ytdDebit: 0,      ytdCredit: 257000, active: true, description: "Net income for current period" },
    ],
  },
  {
    code: "4000", name: "Revenue", type: "revenue", subtype: "Header", normalBal: "credit",
    balance: 3256000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Income from operations",
    children: [
      { code: "4100", name: "Product Sales",       type: "revenue", subtype: "Sales",   normalBal: "credit", balance: 2692000, ytdDebit: 148000, ytdCredit: 2840000, active: true, description: "Revenue from product sales" },
      { code: "4200", name: "Service Revenue",     type: "revenue", subtype: "Service", normalBal: "credit", balance: 478000,  ytdDebit: 24000,  ytdCredit: 502000,  active: true, description: "Revenue from services rendered" },
      { code: "4300", name: "Other Income",        type: "revenue", subtype: "Other",   normalBal: "credit", balance: 86000,   ytdDebit: 4000,   ytdCredit: 90000,   active: true, description: "Miscellaneous income" },
    ],
  },
  {
    code: "5000", name: "Expenses", type: "expense", subtype: "Header", normalBal: "debit",
    balance: 2499000, ytdDebit: 0, ytdCredit: 0, active: true, description: "Operating costs",
    children: [
      { code: "5100", name: "Cost of Goods Sold", type: "expense", subtype: "COGS",    normalBal: "debit", balance: 1522000, ytdDebit: 1522000, ytdCredit: 0,      active: true, description: "Direct cost of products sold" },
      {
        code: "5200", name: "Operating Expenses", type: "expense", subtype: "Header",  normalBal: "debit",
        balance: 977000, ytdDebit: 0, ytdCredit: 0, active: true, description: "General operating expenses",
        children: [
          { code: "5210", name: "Salaries & Benefits",     type: "expense", subtype: "Payroll",   normalBal: "debit", balance: 648000, ytdDebit: 648000, ytdCredit: 0,     active: true,  description: "Employee compensation" },
          { code: "5220", name: "Rent & Utilities",        type: "expense", subtype: "Overhead",  normalBal: "debit", balance: 87000,  ytdDebit: 87000,  ytdCredit: 0,     active: true,  description: "Office rent and utilities" },
          { code: "5230", name: "Marketing",               type: "expense", subtype: "Marketing", normalBal: "debit", balance: 124000, ytdDebit: 124000, ytdCredit: 0,     active: true,  description: "Advertising and marketing spend" },
          { code: "5240", name: "Depreciation Expense",    type: "expense", subtype: "Non-cash",  normalBal: "debit", balance: 54000,  ytdDebit: 54000,  ytdCredit: 0,     active: true,  description: "Periodic asset depreciation" },
          { code: "5250", name: "Interest Expense",        type: "expense", subtype: "Finance",   normalBal: "debit", balance: 34000,  ytdDebit: 34000,  ytdCredit: 0,     active: true,  description: "Interest on borrowings" },
          { code: "5260", name: "Professional Services",   type: "expense", subtype: "Services",  normalBal: "debit", balance: 30000,  ytdDebit: 30000,  ytdCredit: 0,     active: false, description: "Legal, audit, consulting fees" },
        ],
      },
    ],
  },
];

// ─── Shared helpers ────────────────────────────────────────────────────────────

const TYPE_META: Record<string, { color: string; label: string }> = {
  asset:     { color: "#3B82F6", label: "Asset"     },
  liability: { color: "#F59E0B", label: "Liability" },
  equity:    { color: "#10B981", label: "Equity"    },
  revenue:   { color: "#8B5CF6", label: "Revenue"   },
  expense:   { color: "#EF4444", label: "Expense"   },
};

const SUBTYPE_OPTIONS: Record<string, string[]> = {
  asset:     ["Cash", "Receivable", "Inventory", "Prepaid", "Investment", "Fixed", "Contra", "Intangible", "Other"],
  liability: ["Payable", "Accrued", "Tax", "Loan", "Other"],
  equity:    ["Capital", "Retained", "Earnings", "Other"],
  revenue:   ["Sales", "Service", "Other"],
  expense:   ["COGS", "Payroll", "Overhead", "Marketing", "Non-cash", "Finance", "Services", "Other"],
};

function fmtAmt(n: number) {
  const abs = Math.abs(n);
  const s = abs >= 1_000_000 ? `$${(abs / 1_000_000).toFixed(2)}M`
           : abs >= 1_000    ? `$${(abs / 1_000).toFixed(0)}K`
           : `$${abs}`;
  return n < 0 ? `(${s})` : s;
}

function nextChildCode(parent: Account): string {
  const existing = parent.children?.map((c) => parseInt(c.code, 10)) ?? [];
  const parentNum = parseInt(parent.code, 10);
  const step = parent.code.length === 4 ? 10 : 1;
  const next = existing.length > 0 ? Math.max(...existing) + step : parentNum + step;
  return String(next).padStart(parent.code.length, "0");
}

// ─── Create Child Account Modal ───────────────────────────────────────────────

function CreateChildModal({
  open,
  parent,
  onClose,
}: {
  open: boolean;
  parent: Account | null;
  onClose: () => void;
}) {
  const { token } = antTheme.useToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      // TODO: API call to create child account
      await new Promise((r) => setTimeout(r, 600));
      message.success("Child account created successfully");
      form.resetFields();
      onClose();
    } catch {
      // validation failed
    } finally {
      setSubmitting(false);
    }
  };

  const typeColor = parent ? TYPE_META[parent.type]?.color : token.colorPrimary;
  const suggestedCode = parent ? nextChildCode(parent) : "";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnClose
      width={520}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
      }}
    >
      {/* ── Gradient header ─────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
          padding: "22px 24px 56px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{
              background: "rgba(255,255,255,0.18)",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              New Child Account
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.18)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 13,
              }}
            >
              <CloseOutlined />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(255,255,255,0.22)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 800, color: "#fff",
              flexShrink: 0,
            }}>
              <SubnodeOutlined />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                Add Sub-account
              </div>
              {parent && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>
                  Under {parent.code} &middot; {parent.name}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
          background: token.colorBgContainer,
          borderRadius: "24px 24px 0 0",
        }} />
      </div>

      {/* ── Form body ───────────────────────────────────────────────── */}
      <div style={{ padding: "4px 24px 8px" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            code: suggestedCode,
            type: parent?.type,
            normalBal: parent?.normalBal,
            active: true,
          }}
        >
          {/* Account Code */}
          <div style={{
            background: token.colorBgLayout,
            borderRadius: 10,
            padding: "14px 16px 4px",
            marginBottom: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <Form.Item
              name="code"
              label={
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Account Code</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: token.colorError,
                    background: `${token.colorError}14`, borderRadius: 4,
                    padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>req</span>
                </div>
              }
              rules={[{ required: true, message: "Account code is required" }]}
              style={{ marginBottom: 14 }}
            >
              <Input placeholder={suggestedCode} style={{ fontFamily: "monospace" }} />
            </Form.Item>
          </div>

          {/* Account Name */}
          <div style={{
            background: token.colorBgLayout,
            borderRadius: 10,
            padding: "14px 16px 4px",
            marginBottom: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <Form.Item
              name="name"
              label={
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>Account Name</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, color: token.colorError,
                    background: `${token.colorError}14`, borderRadius: 4,
                    padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.05em",
                  }}>req</span>
                </div>
              }
              rules={[{ required: true, message: "Account name is required" }]}
              style={{ marginBottom: 14 }}
            >
              <Input placeholder="e.g. Petty Cash" />
            </Form.Item>
          </div>

          {/* Type + Subtype row */}
          <Row gutter={10}>
            <Col span={12}>
              <div style={{
                background: token.colorBgLayout,
                borderRadius: 10,
                padding: "14px 16px 4px",
                marginBottom: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Form.Item
                  name="type"
                  label={<span style={{ fontSize: 12, fontWeight: 700 }}>Account Type</span>}
                  style={{ marginBottom: 14 }}
                >
                  <Select disabled>
                    {Object.entries(TYPE_META).map(([k, v]) => (
                      <Select.Option key={k} value={k}>
                        <Tag color={v.color} style={{ borderRadius: 20, marginRight: 4 }}>{v.label}</Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </Col>
            <Col span={12}>
              <div style={{
                background: token.colorBgLayout,
                borderRadius: 10,
                padding: "14px 16px 4px",
                marginBottom: 10,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                <Form.Item
                  name="subtype"
                  label={
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>Sub-type</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: token.colorError,
                        background: `${token.colorError}14`, borderRadius: 4,
                        padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>req</span>
                    </div>
                  }
                  rules={[{ required: true, message: "Sub-type is required" }]}
                  style={{ marginBottom: 14 }}
                >
                  <Select placeholder="Select…">
                    {(SUBTYPE_OPTIONS[parent?.type ?? "asset"] ?? []).map((s) => (
                      <Select.Option key={s} value={s}>{s}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </Col>
          </Row>

          {/* Normal Balance */}
          <div style={{
            background: token.colorBgLayout,
            borderRadius: 10,
            padding: "14px 16px 4px",
            marginBottom: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <Form.Item
              name="normalBal"
              label={<span style={{ fontSize: 12, fontWeight: 700 }}>Normal Balance</span>}
              style={{ marginBottom: 14 }}
            >
              <Select>
                <Select.Option value="debit">Debit (Dr)</Select.Option>
                <Select.Option value="credit">Credit (Cr)</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* Description */}
          <div style={{
            background: token.colorBgLayout,
            borderRadius: 10,
            padding: "14px 16px 4px",
            marginBottom: 10,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <Form.Item
              name="description"
              label={<span style={{ fontSize: 12, fontWeight: 700 }}>Description</span>}
              style={{ marginBottom: 14 }}
            >
              <Input.TextArea rows={2} placeholder="Brief description of this account…" />
            </Form.Item>
          </div>

          {/* Active status card */}
          <div style={{
            background: token.colorBgLayout,
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 4,
            border: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: token.colorText }}>Active Status</span>
              </div>
              <div style={{ fontSize: 11, color: token.colorTextSecondary, paddingInlineStart: 16 }}>
                Toggle to enable or disable this account
              </div>
            </div>
            <Form.Item name="active" valuePropName="checked" style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={{
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: "14px 24px",
        display: "flex",
        gap: 10,
      }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting}
          onClick={handleSave}
          size="large"
          style={{
            flex: 1,
            height: 42,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
            border: "none",
            boxShadow: `0 4px 12px ${typeColor}44`,
          }}
        >
          Create Account
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          size="large"
          style={{ height: 42, fontWeight: 600, minWidth: 100 }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Chart of Accounts — Dashboard + Tree tabs with type filter
// ─────────────────────────────────────────────────────────────────────────────

function ChartOfAccountsContent() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [activeTab,    setActiveTab]    = useState("all");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["1000","2000","3000","4000","5000","1100","1200","2100","2200","5200"]);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [selected,     setSelected]     = useState<Account | null>(null);
  const [search,       setSearch]       = useState("");
  const [history,      setHistory]      = useState<Account[]>([]);
  const [childModalOpen, setChildModalOpen] = useState(false);

  const typeFilter = activeTab === "all" ? null : activeTab;
  const visibleRoots = typeFilter ? ACCOUNTS.filter((a) => a.type === typeFilter) : ACCOUNTS;

  const openAccount = (acct: Account, pushHistory = true) => {
    if (pushHistory && selected) {
      setHistory((prev) => [...prev, selected]);
    }
    setSelected(acct);
    setDrawerOpen(true);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setSelected(prev);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setHistory([]);
  };

  function buildTree(accounts: Account[]): TreeDataNode[] {
    return accounts.map((a) => {
      const isHeader = !!a.children?.length;
      return {
        key: a.code,
        isLeaf: !isHeader,
        children: a.children ? buildTree(a.children) : undefined,
        title: (
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 12, width: "100%" }}
            onClick={() => openAccount(a, false)}
          >
            <Space size={6}>
              {isHeader
                ? <FolderOutlined style={{ color: TYPE_META[a.type]?.color }} />
                : <FileTextOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />}
              <Text style={{ fontFamily: "monospace", fontSize: 11, color: token.colorTextTertiary }}>{a.code}</Text>
              <Text style={{ fontWeight: isHeader ? 600 : 400 }}>{a.name}</Text>
              {!a.active && <Tag style={{ borderRadius: 20, fontSize: 10, marginLeft: 4 }}>Off</Tag>}
            </Space>
            <Space size={8}>
              <Text style={{ fontFamily: "monospace", fontSize: 12, color: a.balance < 0 ? token.colorError : token.colorTextSecondary }}>
                {a.ytdDebit || a.ytdCredit ? fmtAmt(a.balance) : ""}
              </Text>
              <Tooltip title="View details">
                <EyeOutlined style={{ color: token.colorTextQuaternary, fontSize: 12 }} />
              </Tooltip>
            </Space>
          </div>
        ),
      };
    });
  }

  const tabItems = [
    { key: "all",       label: <Space><ApartmentOutlined />All</Space> },
    { key: "asset",     label: <Space><BankOutlined      style={{ color: TYPE_META.asset.color     }} />Assets</Space>     },
    { key: "liability", label: <Space><DollarOutlined    style={{ color: TYPE_META.liability.color }} />Liabilities</Space> },
    { key: "equity",    label: <Space><PercentageOutlined style={{ color: TYPE_META.equity.color   }} />Equity</Space>     },
    { key: "revenue",   label: <Space><LineChartOutlined style={{ color: TYPE_META.revenue.color   }} />Revenue</Space>    },
    { key: "expense",   label: <Space><SettingOutlined   style={{ color: TYPE_META.expense.color   }} />Expenses</Space>   },
  ];

  const typeColor = selected ? TYPE_META[selected.type]?.color : token.colorPrimary;

  return (
    <>
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {ACCOUNTS.map((a) => (
          <Col xs={24} sm={12} lg={4} key={a.code} style={{ flex: 1 }}>
            <Card
              size="small"
              styles={{ body: { padding: "14px 16px" } }}
              style={{ borderLeft: `4px solid ${TYPE_META[a.type]?.color}`, cursor: "pointer" }}
              onClick={() => setActiveTab(a.type)}
            >
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{a.name}</Text>
              <div style={{ fontSize: 20, fontWeight: 700, color: TYPE_META[a.type]?.color, marginTop: 6 }}>{fmtAmt(a.balance)}</div>
              <Text type="secondary" style={{ fontSize: 11 }}>{a.children?.length ?? 0} sub-accounts</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Main tree card ───────────────────────────────────────────────── */}
      <Card
        styles={{ body: { padding: 0 } }}
        title={
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: -1 }}
            size="small"
          />
        }
        extra={
          <Space>
            <Input
              prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
              placeholder="Search…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 180 }}
            />
            <Button size="small" icon={<DownloadOutlined />}>Export</Button>
            <Button size="small" type="primary" icon={<PlusOutlined />}>New Account</Button>
          </Space>
        }
      >
        <div style={{ padding: "8px 12px" }}>
          <Tree
            treeData={buildTree(visibleRoots)}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys)}
            blockNode
            showLine={{ showLeafIcon: false }}
            style={{ fontSize: 13 }}
          />
        </div>
      </Card>

      {/* ── Enhanced Account Detail Drawer ──────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        width={isMobile ? "100%" : 480}
        title={null}
        closable={false}
        destroyOnClose
        styles={{
          body: { padding: 0, background: token.colorBgLayout, display: "flex", flexDirection: "column" },
          mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
        }}
      >
        {selected && (
          <>
            {/* ── Gradient header ─────────────────────────────────────── */}
            <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <div style={{
                background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
                padding: "22px 24px 60px",
              }}>
                {/* top bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {history.length > 0 && (
                      <button
                        onClick={goBack}
                        style={{
                          width: 30, height: 30, borderRadius: 8,
                          background: "rgba(255,255,255,0.18)",
                          border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 13,
                        }}
                      >
                        <ArrowLeftOutlined />
                      </button>
                    )}
                    <div style={{
                      background: "rgba(255,255,255,0.18)",
                      borderRadius: 6,
                      padding: "3px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#fff",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}>
                      {selected.children?.length ? "Group Account" : "Leaf Account"}
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: "rgba(255,255,255,0.18)",
                      border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 13,
                    }}
                  >
                    <CloseOutlined />
                  </button>
                </div>
                {/* account info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: "rgba(255,255,255,0.22)",
                    border: "2px solid rgba(255,255,255,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "monospace",
                    flexShrink: 0,
                  }}>
                    {selected.code}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                      {selected.name}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3, display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{TYPE_META[selected.type]?.label}</span>
                      <span>&middot;</span>
                      <span>{selected.subtype}</span>
                      {!selected.active && (
                        <>
                          <span>&middot;</span>
                          <Tag style={{ borderRadius: 20, fontSize: 10, background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", margin: 0 }}>Inactive</Tag>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {/* balance in header */}
                <div style={{ marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "10px 16px",
                    flex: 1,
                    minWidth: 120,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 2, fontFamily: "monospace" }}>{fmtAmt(selected.balance)}</div>
                  </div>
                  {(selected.ytdDebit > 0 || selected.ytdCredit > 0) && (
                    <>
                      <div style={{
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 10,
                        padding: "10px 16px",
                        flex: 1,
                        minWidth: 90,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>YTD Debit</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: "monospace" }}>{fmtAmt(selected.ytdDebit)}</div>
                      </div>
                      <div style={{
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 10,
                        padding: "10px 16px",
                        flex: 1,
                        minWidth: 90,
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>YTD Credit</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginTop: 2, fontFamily: "monospace" }}>{fmtAmt(selected.ytdCredit)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* curved bottom mask */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: 28,
                background: token.colorBgLayout,
                borderRadius: "24px 24px 0 0",
              }} />
            </div>

            {/* ── Scrollable content ──────────────────────────────────── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}>
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                {/* Account details card */}
                <div style={{
                  background: token.colorBgContainer,
                  borderRadius: 10,
                  padding: "16px",
                  border: `1px solid ${token.colorBorderSecondary}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    Account Details
                  </div>
                  <Descriptions column={1} size="small" colon={false}
                    labelStyle={{ fontWeight: 600, color: token.colorTextSecondary, fontSize: 12, width: 130 }}
                    contentStyle={{ fontSize: 13 }}
                  >
                    <Descriptions.Item label="Code">
                      <Text style={{ fontFamily: "monospace", fontWeight: 600 }}>{selected.code}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Type">
                      <Tag color={typeColor} style={{ borderRadius: 20 }}>{TYPE_META[selected.type]?.label}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Sub-type">{selected.subtype}</Descriptions.Item>
                    <Descriptions.Item label="Normal Balance">
                      <Tag color={selected.normalBal === "debit" ? "blue" : "green"} style={{ borderRadius: 20 }}>
                        {selected.normalBal === "debit" ? "Debit (Dr)" : "Credit (Cr)"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Badge status={selected.active ? "success" : "default"} text={selected.active ? "Active" : "Inactive"} />
                    </Descriptions.Item>
                  </Descriptions>
                  {selected.description && (
                    <div style={{ marginTop: 10, padding: "10px 12px", background: token.colorBgLayout, borderRadius: 8, fontSize: 12, color: token.colorTextSecondary, lineHeight: 1.6 }}>
                      {selected.description}
                    </div>
                  )}
                </div>

                {/* Sub-accounts section */}
                {selected.children && selected.children.length > 0 && (
                  <div style={{
                    background: token.colorBgContainer,
                    borderRadius: 10,
                    padding: "16px",
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: token.colorTextSecondary, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Sub-accounts ({selected.children.length})
                      </div>
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        style={{ fontSize: 12, fontWeight: 600, color: typeColor }}
                        onClick={() => setChildModalOpen(true)}
                      >
                        Add
                      </Button>
                    </div>
                    <Space direction="vertical" size={6} style={{ width: "100%" }}>
                      {selected.children.map((c) => (
                        <div
                          key={c.code}
                          onClick={() => openAccount(c)}
                          style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 12px", borderRadius: 8,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background: token.colorBgLayout,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = typeColor + "60"; e.currentTarget.style.background = typeColor + "08"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = token.colorBorderSecondary; e.currentTarget.style.background = token.colorBgLayout; }}
                        >
                          <Space size={8}>
                            {c.children?.length
                              ? <FolderOutlined style={{ color: typeColor, fontSize: 13 }} />
                              : <FileTextOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />}
                            <Text style={{ fontFamily: "monospace", fontSize: 11 }} type="secondary">{c.code}</Text>
                            <Text style={{ fontSize: 13 }}>{c.name}</Text>
                            {!c.active && <Tag style={{ borderRadius: 20, fontSize: 10 }}>Off</Tag>}
                          </Space>
                          <Text style={{ fontFamily: "monospace", fontWeight: 600, fontSize: 12, color: c.balance < 0 ? token.colorError : token.colorTextSecondary }}>
                            {fmtAmt(c.balance)}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </div>

            {/* ── Sticky footer ───────────────────────────────────────── */}
            <div style={{
              background: token.colorBgContainer,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              padding: "12px 20px",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}>
              <Button
                type="primary"
                icon={<SubnodeOutlined />}
                onClick={() => setChildModalOpen(true)}
                style={{
                  flex: 1,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
                  border: "none",
                  boxShadow: `0 4px 12px ${typeColor}44`,
                }}
              >
                Add Child Account
              </Button>
              <Button icon={<EditOutlined />}>Edit</Button>
              <Button danger icon={<DeleteOutlined />}>Delete</Button>
            </div>
          </>
        )}
      </Drawer>

      {/* ── Create Child Account Modal ──────────────────────────────────── */}
      <CreateChildModal
        open={childModalOpen}
        parent={selected}
        onClose={() => setChildModalOpen(false)}
      />
    </>
  );
}

export default function ChartOfAccounts() {
  return (
    <DashboardLayout
      currentPage="Chart of Accounts"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Accounting" }, { label: "Chart of Accounts" }]}
    >
      <ChartOfAccountsContent />
    </DashboardLayout>
  );
}
