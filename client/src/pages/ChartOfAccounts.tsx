import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Tree, Table, Card, Row, Col, Tag, Space, Typography, Button, Input, Select,
  Drawer, Descriptions, Statistic, Tabs, Badge, Dropdown, Grid, Tooltip, Segmented,
  Modal, Form, Switch, Divider, theme as antTheme, Alert,
} from "antd";
import type { TableColumnsType, TreeDataNode } from "antd";
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined,
  FolderOutlined, FileTextOutlined, ExportOutlined, BankOutlined,
  DollarOutlined, LineChartOutlined, PercentageOutlined, ApartmentOutlined,
  SettingOutlined, EyeOutlined, ReloadOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

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

function fmtAmt(n: number) {
  const abs = Math.abs(n);
  const s = abs >= 1_000_000 ? `$${(abs / 1_000_000).toFixed(2)}M`
           : abs >= 1_000    ? `$${(abs / 1_000).toFixed(0)}K`
           : `$${abs}`;
  return n < 0 ? `(${s})` : s;
}

function flattenAccounts(accounts: Account[]): Account[] {
  return accounts.flatMap((a) => [a, ...(a.children ? flattenAccounts(a.children) : [])]);
}

const ALL_FLAT = flattenAccounts(ACCOUNTS);

// Convert to Ant Design TreeDataNode
function toTreeNodes(accounts: Account[]): TreeDataNode[] {
  return accounts.map((a) => ({
    key: a.code,
    title: a.code + " — " + a.name,
    children: a.children ? toTreeNodes(a.children) : undefined,
    isLeaf: !a.children || a.children.length === 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
//  DESIGN 1 — Explorer: vertical tree panel + detail panel
// ─────────────────────────────────────────────────────────────────────────────

function Design1() {
  const { token } = antTheme.useToken();
  const [selected, setSelected] = useState<Account | null>(null);
  const [search, setSearch] = useState("");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["1000","2000","3000","4000","5000"]);

  const filtered = search
    ? ALL_FLAT.filter((a) => a.code.includes(search) || a.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  const treeData = toTreeNodes(ACCOUNTS);

  function onSelect(keys: React.Key[]) {
    const code = keys[0] as string;
    setSelected(ALL_FLAT.find((a) => a.code === code) ?? null);
  }

  const TypeIcon = ({ type }: { type: string }) => (
    <span style={{ color: TYPE_META[type]?.color, marginRight: 6, fontSize: 13 }}>
      {type === "asset" ? "A" : type === "liability" ? "L" : type === "equity" ? "E" : type === "revenue" ? "R" : "X"}
    </span>
  );

  return (
    <div style={{ display: "flex", gap: 16, height: "calc(100vh - 180px)", minHeight: 600 }}>
      {/* ── Tree panel ───────────────────────────────────────────────────── */}
      <Card
        style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
        styles={{ body: { padding: 0, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" } }}
        title={
          <Space>
            <ApartmentOutlined style={{ color: token.colorPrimary }} />
            <Text strong>Account Tree</Text>
          </Space>
        }
        extra={
          <Button size="small" type="primary" icon={<PlusOutlined />}>New</Button>
        }
      >
        <div style={{ padding: "10px 12px", borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          <Input
            prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
            placeholder="Search by code or name…"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 4px" }}>
          {search && filtered ? (
            // Flat search results
            <Space direction="vertical" size={2} style={{ width: "100%", padding: "0 8px" }}>
              {filtered.map((a) => (
                <div
                  key={a.code}
                  onClick={() => setSelected(a)}
                  style={{
                    padding: "7px 10px", borderRadius: 8, cursor: "pointer",
                    background: selected?.code === a.code ? token.colorPrimaryBg : "transparent",
                    border: `1px solid ${selected?.code === a.code ? token.colorPrimary : "transparent"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Space size={6}>
                      <Text style={{ fontFamily: "monospace", fontSize: 11, color: token.colorTextSecondary }}>{a.code}</Text>
                      <Text style={{ fontSize: 13 }}>{a.name}</Text>
                    </Space>
                    <Tag color={TYPE_META[a.type]?.color} style={{ borderRadius: 20, fontSize: 10, margin: 0 }}>
                      {TYPE_META[a.type]?.label}
                    </Tag>
                  </div>
                </div>
              ))}
            </Space>
          ) : (
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys)}
              onSelect={onSelect}
              selectedKeys={selected ? [selected.code] : []}
              blockNode
              style={{ fontSize: 13 }}
              titleRender={(node) => {
                const a = ALL_FLAT.find((x) => x.code === (node.key as string));
                if (!a) return <span>{node.title as string}</span>;
                const isHeader = !!a.children?.length;
                return (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: 8, width: "100%" }}>
                    <Space size={4}>
                      {isHeader ? <FolderOutlined style={{ color: TYPE_META[a.type]?.color, fontSize: 13 }} /> : <FileTextOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />}
                      <Text style={{ fontFamily: "monospace", fontSize: 11, color: token.colorTextSecondary }}>{a.code}</Text>
                      <Text style={{ fontSize: 13, fontWeight: isHeader ? 600 : 400 }}>{a.name}</Text>
                    </Space>
                    {!a.children?.length && !a.active && <Badge status="default" text={<Text style={{ fontSize: 10 }} type="secondary">Inactive</Text>} />}
                  </div>
                );
              }}
            />
          )}
        </div>
      </Card>

      {/* ── Detail panel ─────────────────────────────────────────────────── */}
      {selected ? (
        <Card
          style={{ flex: 1, overflow: "auto" }}
          title={
            <Space>
              <span style={{ fontFamily: "monospace", color: token.colorTextSecondary }}>{selected.code}</span>
              <Title level={5} style={{ margin: 0 }}>{selected.name}</Title>
              <Tag color={TYPE_META[selected.type]?.color} style={{ borderRadius: 20 }}>{TYPE_META[selected.type]?.label}</Tag>
              {!selected.active && <Tag style={{ borderRadius: 20 }}>Inactive</Tag>}
            </Space>
          }
          extra={
            <Space>
              <Button size="small" icon={<EditOutlined />}>Edit</Button>
              <Button size="small" danger icon={<DeleteOutlined />}>Delete</Button>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic title="Balance" value={fmtAmt(selected.balance)} valueStyle={{ color: selected.balance >= 0 ? token.colorSuccess : token.colorError, fontSize: 28, fontWeight: 700 }} />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic title="YTD Debit"  value={fmtAmt(selected.ytdDebit)}  valueStyle={{ color: "#3B82F6", fontSize: 20 }} />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic title="YTD Credit" value={fmtAmt(selected.ytdCredit)} valueStyle={{ color: "#10B981", fontSize: 20 }} />
            </Col>
          </Row>

          <Divider />

          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Account Code">{selected.code}</Descriptions.Item>
            <Descriptions.Item label="Account Type"><Tag color={TYPE_META[selected.type]?.color}>{TYPE_META[selected.type]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="Sub-type">{selected.subtype}</Descriptions.Item>
            <Descriptions.Item label="Normal Balance"><Tag>{selected.normalBal === "debit" ? "Debit (Dr)" : "Credit (Cr)"}</Tag></Descriptions.Item>
            <Descriptions.Item label="Status"><Switch checked={selected.active} disabled /></Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>{selected.description}</Descriptions.Item>
          </Descriptions>

          {selected.children && (
            <>
              <Divider><Text type="secondary" style={{ fontSize: 12 }}>Sub-accounts ({selected.children.length})</Text></Divider>
              <Space direction="vertical" size={6} style={{ width: "100%" }}>
                {selected.children.map((child) => (
                  <div
                    key={child.code}
                    onClick={() => setSelected(child)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      border: `1px solid ${token.colorBorderSecondary}`,
                      background: token.colorFillAlter,
                      transition: "all 0.15s",
                    }}
                  >
                    <Space size={8}>
                      <Text style={{ fontFamily: "monospace", fontSize: 12, color: token.colorTextSecondary }}>{child.code}</Text>
                      <Text strong>{child.name}</Text>
                    </Space>
                    <Space>
                      {!child.active && <Tag style={{ borderRadius: 20, fontSize: 10 }}>Inactive</Tag>}
                      <Text style={{ fontFamily: "monospace", fontWeight: 600, color: child.balance >= 0 ? token.colorSuccess : token.colorError }}>
                        {fmtAmt(child.balance)}
                      </Text>
                    </Space>
                  </div>
                ))}
              </Space>
            </>
          )}
        </Card>
      ) : (
        <Card style={{ flex: 1 }} styles={{ body: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%" } }}>
          <div style={{ textAlign: "center" }}>
            <ApartmentOutlined style={{ fontSize: 48, color: token.colorTextQuaternary, marginBottom: 12 }} />
            <Title level={5} style={{ color: token.colorTextSecondary }}>Select an account</Title>
            <Text type="secondary">Click any account in the tree to view its details</Text>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DESIGN 2 — Spreadsheet: TreeTable with all data inline
// ─────────────────────────────────────────────────────────────────────────────

interface FlatRow extends Account {
  key: string;
  isHeader: boolean;
  depth: number;
  children?: FlatRow[];
}

function toFlatRows(accounts: Account[], depth = 0): FlatRow[] {
  return accounts.map((a) => ({
    ...a,
    key: a.code,
    isHeader: !!(a.children && a.children.length > 0),
    depth,
    children: a.children ? toFlatRows(a.children, depth + 1) : undefined,
  }));
}

function Design2() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editing, setEditing] = useState<Account | null>(null);

  const treeData = toFlatRows(ACCOUNTS);

  const columns: TableColumnsType<FlatRow> = [
    {
      title: "Code", dataIndex: "code", width: 90,
      render: (v, row) => (
        <Text style={{ fontFamily: "monospace", fontSize: 12, color: row.isHeader ? token.colorPrimary : token.colorTextSecondary }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Account Name", dataIndex: "name",
      render: (v, row) => (
        <Text style={{ fontWeight: row.isHeader ? 700 : 400, color: row.depth === 0 ? TYPE_META[row.type]?.color : undefined }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Type", dataIndex: "type", width: 100,
      render: (v) => (
        <Tag style={{ borderRadius: 20, fontSize: 11, background: `${TYPE_META[v]?.color}18`, color: TYPE_META[v]?.color, border: `1px solid ${TYPE_META[v]?.color}40` }}>
          {TYPE_META[v]?.label}
        </Tag>
      ),
    },
    { title: "Sub-type", dataIndex: "subtype", width: 110, render: (v) => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: "Normal Bal", dataIndex: "normalBal", align: "center", width: 100,
      render: (v) => <Tag color={v === "debit" ? "blue" : "green"} style={{ borderRadius: 20 }}>{v === "debit" ? "Dr" : "Cr"}</Tag>,
    },
    {
      title: "YTD Debit", dataIndex: "ytdDebit", align: "right", width: 120,
      render: (v) => v ? <Text style={{ color: "#3B82F6", fontFamily: "monospace" }}>{fmtAmt(v)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "YTD Credit", dataIndex: "ytdCredit", align: "right", width: 120,
      render: (v) => v ? <Text style={{ color: "#10B981", fontFamily: "monospace" }}>{fmtAmt(v)}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Balance", dataIndex: "balance", align: "right", width: 120,
      sorter: (a, b) => a.balance - b.balance,
      render: (v, row) => row.isHeader
        ? <Text strong style={{ fontFamily: "monospace", color: TYPE_META[row.type]?.color }}>{fmtAmt(v)}</Text>
        : <Text style={{ fontFamily: "monospace", color: v < 0 ? token.colorError : token.colorSuccess }}>{fmtAmt(v)}</Text>,
    },
    {
      title: "Status", dataIndex: "active", align: "center", width: 80,
      render: (v) => <Badge status={v ? "success" : "default"} text={<Text style={{ fontSize: 11 }}>{v ? "Active" : "Off"}</Text>} />,
    },
    {
      title: "", key: "actions", width: 80, align: "center",
      render: (_, row) => !row.isHeader && (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => setEditing(row)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={<Space><LineChartOutlined style={{ color: token.colorPrimary }} /><Text strong>Chart of Accounts</Text></Space>}
        styles={{ body: { padding: 0 } }}
        extra={
          <Space>
            <Input
              prefix={<SearchOutlined style={{ color: token.colorTextQuaternary }} />}
              placeholder="Search code or name…"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
            <Select
              size="small"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 130 }}
              options={[
                { value: "all",       label: "All Types" },
                { value: "asset",     label: "Assets" },
                { value: "liability", label: "Liabilities" },
                { value: "equity",    label: "Equity" },
                { value: "revenue",   label: "Revenue" },
                { value: "expense",   label: "Expenses" },
              ]}
            />
            <Tooltip title="Reload"><Button size="small" icon={<ReloadOutlined />} /></Tooltip>
            <Dropdown menu={{ items: [
              { key: "csv",  label: "Export CSV",   icon: <ExportOutlined /> },
              { key: "xlsx", label: "Export Excel", icon: <ExportOutlined /> },
            ]}}>
              <Button size="small" icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
            <Button size="small" type="primary" icon={<PlusOutlined />}>Add Account</Button>
          </Space>
        }
      >
        {/* Summary row */}
        <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
          {ACCOUNTS.map((a) => (
            <div key={a.code} style={{ flex: 1, padding: "12px 16px", borderRight: `1px solid ${token.colorBorderSecondary}`, textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>{a.name}</Text>
              <div style={{ fontSize: 18, fontWeight: 700, color: TYPE_META[a.type]?.color, marginTop: 4 }}>{fmtAmt(a.balance)}</div>
            </div>
          ))}
        </div>
        <Table
          rowKey="code"
          size="small"
          columns={columns}
          dataSource={treeData}
          pagination={false}
          scroll={{ x: "max-content", y: 480 }}
          expandable={{ defaultExpandAllRows: true }}
          onRow={(row) => ({
            style: {
              background: row.depth === 0 ? `${TYPE_META[row.type]?.color}08`
                         : row.isHeader  ? token.colorFillAlter
                         : undefined,
            },
          })}
        />
      </Card>

      {/* Edit Drawer */}
      <Drawer
        title={editing ? `Edit: ${editing.code} — ${editing.name}` : ""}
        open={!!editing}
        onClose={() => setEditing(null)}
        width={isMobile ? "100%" : 400}
        extra={<Button type="primary" onClick={() => setEditing(null)}>Save</Button>}
      >
        {editing && (
          <Form layout="vertical">
            <Form.Item label="Account Code"><Input defaultValue={editing.code} /></Form.Item>
            <Form.Item label="Account Name"><Input defaultValue={editing.name} /></Form.Item>
            <Form.Item label="Type">
              <Select defaultValue={editing.type} options={["asset","liability","equity","revenue","expense"].map((v) => ({ value: v, label: TYPE_META[v].label }))} />
            </Form.Item>
            <Form.Item label="Sub-type"><Input defaultValue={editing.subtype} /></Form.Item>
            <Form.Item label="Normal Balance">
              <Select defaultValue={editing.normalBal} options={[{ value: "debit", label: "Debit (Dr)" }, { value: "credit", label: "Credit (Cr)" }]} />
            </Form.Item>
            <Form.Item label="Description"><Input.TextArea defaultValue={editing.description} rows={3} /></Form.Item>
            <Form.Item label="Active"><Switch defaultChecked={editing.active} /></Form.Item>
          </Form>
        )}
      </Drawer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DESIGN 3 — Dashboard + Tree tabs with type filter
// ─────────────────────────────────────────────────────────────────────────────

function Design3() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [activeTab,    setActiveTab]    = useState("all");
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(["1000","2000","3000","4000","5000","1100","1200","2100","2200","5200"]);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [selected,     setSelected]     = useState<Account | null>(null);
  const [search,       setSearch]       = useState("");

  const typeFilter = activeTab === "all" ? null : activeTab;
  const visibleRoots = typeFilter ? ACCOUNTS.filter((a) => a.type === typeFilter) : ACCOUNTS;

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
            onClick={() => { setSelected(a); setDrawerOpen(true); }}
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

      {/* ── Account detail drawer ────────────────────────────────────────── */}
      <Drawer
        title={
          selected ? (
            <Space>
              <Text style={{ fontFamily: "monospace", color: token.colorTextSecondary }}>{selected.code}</Text>
              <Text strong>{selected.name}</Text>
              <Tag color={TYPE_META[selected.type]?.color} style={{ borderRadius: 20 }}>{TYPE_META[selected.type]?.label}</Tag>
            </Space>
          ) : null
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={isMobile ? "100%" : 420}
        extra={<Space><Button icon={<EditOutlined />}>Edit</Button><Button danger icon={<DeleteOutlined />}>Delete</Button></Space>}
      >
        {selected && (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={24}>
                <Card size="small" style={{ background: `${TYPE_META[selected.type]?.color}10`, border: `1px solid ${TYPE_META[selected.type]?.color}40` }}>
                  <Statistic
                    title="Current Balance"
                    value={fmtAmt(selected.balance)}
                    valueStyle={{ fontSize: 28, fontWeight: 800, color: TYPE_META[selected.type]?.color }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}><Card size="small"><Statistic title="YTD Debit" value={fmtAmt(selected.ytdDebit)} valueStyle={{ color: "#3B82F6", fontSize: 18 }} /></Card></Col>
              <Col xs={24} sm={12}><Card size="small"><Statistic title="YTD Credit" value={fmtAmt(selected.ytdCredit)} valueStyle={{ color: "#10B981", fontSize: 18 }} /></Card></Col>
            </Row>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Code">{selected.code}</Descriptions.Item>
              <Descriptions.Item label="Type"><Tag color={TYPE_META[selected.type]?.color}>{TYPE_META[selected.type]?.label}</Tag></Descriptions.Item>
              <Descriptions.Item label="Sub-type">{selected.subtype}</Descriptions.Item>
              <Descriptions.Item label="Normal Balance">{selected.normalBal === "debit" ? "Debit (Dr)" : "Credit (Cr)"}</Descriptions.Item>
              <Descriptions.Item label="Status"><Badge status={selected.active ? "success" : "default"} text={selected.active ? "Active" : "Inactive"} /></Descriptions.Item>
              <Descriptions.Item label="Description">{selected.description}</Descriptions.Item>
            </Descriptions>

            {selected.children && (
              <>
                <Divider><Text type="secondary" style={{ fontSize: 12 }}>Sub-accounts</Text></Divider>
                {selected.children.map((c) => (
                  <div
                    key={c.code}
                    style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, border: `1px solid ${token.colorBorderSecondary}`, cursor: "pointer" }}
                    onClick={() => setSelected(c)}
                  >
                    <Space>
                      <Text style={{ fontFamily: "monospace", fontSize: 11 }} type="secondary">{c.code}</Text>
                      <Text>{c.name}</Text>
                    </Space>
                    <Text style={{ fontFamily: "monospace", fontWeight: 600 }}>{fmtAmt(c.balance)}</Text>
                  </div>
                ))}
              </>
            )}
          </Space>
        )}
      </Drawer>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main page — design switcher
// ─────────────────────────────────────────────────────────────────────────────

export default function ChartOfAccounts() {
  const [design, setDesign] = useState<"1" | "2" | "3">("1");

  return (
    <DashboardLayout
      currentPage="Chart of Accounts"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Accounting" }, { label: "Chart of Accounts" }]}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* Design picker — remove once you pick one */}
        <Alert
          type="info"
          showIcon
          message={
            <Space>
              <Text strong>Preview Mode — Pick your preferred design:</Text>
              <Segmented
                value={design}
                onChange={(v) => setDesign(v as "1" | "2" | "3")}
                options={[
                  { value: "1", label: "Design 1 — Explorer (Tree + Detail Panel)" },
                  { value: "2", label: "Design 2 — Spreadsheet (Tree Table)" },
                  { value: "3", label: "Design 3 — Dashboard + Tabbed Tree + Drawer" },
                ]}
              />
            </Space>
          }
          style={{ borderRadius: 8 }}
        />

        {design === "1" && <Design1 />}
        {design === "2" && <Design2 />}
        {design === "3" && <Design3 />}
      </Space>
    </DashboardLayout>
  );
}
