import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, Row, Col, Table, Tag, Space, Typography, Button, Select,
  Divider, Statistic, theme as antTheme, Tooltip, Dropdown,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowUpOutlined, ArrowDownOutlined, FundOutlined, PrinterOutlined,
  DownloadOutlined, ExportOutlined, MinusOutlined,
} from "@ant-design/icons";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

const { Text, Title } = Typography;

// ─── Mock data ─────────────────────────────────────────────────────────────────

const monthlyPL = [
  { month: "Jan", income: 142000, expenses: 98000,  net: 44000  },
  { month: "Feb", income: 168000, expenses: 112000, net: 56000  },
  { month: "Mar", income: 195000, expenses: 138000, net: 57000  },
  { month: "Apr", income: 183000, expenses: 154000, net: 29000  },
  { month: "May", income: 221000, expenses: 167000, net: 54000  },
  { month: "Jun", income: 247000, expenses: 189000, net: 58000  },
  { month: "Jul", income: 238000, expenses: 172000, net: 66000  },
  { month: "Aug", income: 264000, expenses: 198000, net: 66000  },
  { month: "Sep", income: 289000, expenses: 212000, net: 77000  },
  { month: "Oct", income: 271000, expenses: 204000, net: 67000  },
  { month: "Nov", income: 318000, expenses: 241000, net: 77000  },
  { month: "Dec", income: 356000, expenses: 268000, net: 88000  },
];

interface PLRow {
  key: string;
  label: string;
  ytd: number;
  prev: number;
  change: number;
  type: "header" | "item" | "subtotal" | "total";
}

const plRows: PLRow[] = [
  { key: "rev-h",   label: "REVENUE",                  ytd: 0,         prev: 0,        change: 0,    type: "header"   },
  { key: "rev-1",   label: "Product Sales",             ytd: 2692000,   prev: 2314000,  change: 16.3, type: "item"     },
  { key: "rev-2",   label: "Service Revenue",           ytd: 478000,    prev: 412000,   change: 16.0, type: "item"     },
  { key: "rev-3",   label: "Other Income",              ytd: 86000,     prev: 74000,    change: 16.2, type: "item"     },
  { key: "rev-t",   label: "Total Revenue",             ytd: 3256000,   prev: 2800000,  change: 16.3, type: "subtotal" },
  { key: "cogs-h",  label: "COST OF GOODS SOLD",        ytd: 0,         prev: 0,        change: 0,    type: "header"   },
  { key: "cogs-1",  label: "Direct Materials",          ytd: 924000,    prev: 812000,   change: 13.8, type: "item"     },
  { key: "cogs-2",  label: "Direct Labor",              ytd: 412000,    prev: 378000,   change: 9.0,  type: "item"     },
  { key: "cogs-3",  label: "Manufacturing Overhead",    ytd: 186000,    prev: 162000,   change: 14.8, type: "item"     },
  { key: "cogs-t",  label: "Total COGS",                ytd: 1522000,   prev: 1352000,  change: 12.6, type: "subtotal" },
  { key: "gp",      label: "GROSS PROFIT",              ytd: 1734000,   prev: 1448000,  change: 19.8, type: "total"    },
  { key: "opex-h",  label: "OPERATING EXPENSES",        ytd: 0,         prev: 0,        change: 0,    type: "header"   },
  { key: "opex-1",  label: "Salaries & Benefits",       ytd: 648000,    prev: 594000,   change: 9.1,  type: "item"     },
  { key: "opex-2",  label: "Marketing & Advertising",   ytd: 124000,    prev: 98000,    change: 26.5, type: "item"     },
  { key: "opex-3",  label: "Rent & Utilities",          ytd: 87000,     prev: 84000,    change: 3.6,  type: "item"     },
  { key: "opex-4",  label: "Depreciation",              ytd: 54000,     prev: 51000,    change: 5.9,  type: "item"     },
  { key: "opex-5",  label: "Other Expenses",            ytd: 38000,     prev: 32000,    change: 18.8, type: "item"     },
  { key: "opex-t",  label: "Total OpEx",                ytd: 951000,    prev: 859000,   change: 10.7, type: "subtotal" },
  { key: "ebit",    label: "OPERATING INCOME (EBIT)",   ytd: 783000,    prev: 589000,   change: 32.9, type: "total"    },
  { key: "fin-1",   label: "Interest Expense",          ytd: -34000,    prev: -38000,   change: -10.5,type: "item"     },
  { key: "fin-2",   label: "Interest Income",           ytd: 8000,      prev: 6000,     change: 33.3, type: "item"     },
  { key: "ni",      label: "NET INCOME",                ytd: 757000,    prev: 557000,   change: 35.9, type: "total"    },
];

const balanceKpis = [
  { label: "Total Assets",      value: 4820000, prev: 4210000, color: "#3B82F6" },
  { label: "Total Liabilities", value: 1940000, prev: 1780000, color: "#F59E0B" },
  { label: "Equity",            value: 2880000, prev: 2430000, color: "#10B981" },
  { label: "Current Ratio",     value: 2.41,    prev: 2.18,    color: "#8B5CF6", isRatio: true },
  { label: "Debt-to-Equity",    value: 0.67,    prev: 0.73,    color: "#EC4899", isRatio: true },
  { label: "Return on Equity",  value: 26.3,    prev: 22.9,    color: "#06B6D4", isPct: true   },
];

function fmt(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${n < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${n < 0 ? "-" : ""}$${(abs / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtVal(n: number, isRatio?: boolean, isPct?: boolean) {
  if (isRatio) return n.toFixed(2);
  if (isPct)   return `${n.toFixed(1)}%`;
  return fmt(n);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FinancialReports() {
  const { token } = antTheme.useToken();
  const [period, setPeriod] = useState("ytd");

  const plColumns: TableColumnsType<PLRow> = [
    {
      title: "Account", dataIndex: "label",
      render: (v, row) => {
        if (row.type === "header")   return <Text type="secondary" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>{v}</Text>;
        if (row.type === "total")    return <Text strong style={{ fontSize: 14 }}>{v}</Text>;
        if (row.type === "subtotal") return <Text strong>{v}</Text>;
        return <Text style={{ paddingLeft: 16 }}>{v}</Text>;
      },
    },
    {
      title: "YTD 2024", dataIndex: "ytd", align: "right", width: 140,
      render: (v, row) => {
        if (row.type === "header") return null;
        const style = row.type === "total" ? { fontWeight: 700, fontSize: 14, color: v >= 0 ? token.colorSuccess : token.colorError } : {};
        return <Text style={style}>{fmt(v)}</Text>;
      },
    },
    {
      title: "YTD 2023", dataIndex: "prev", align: "right", width: 140,
      render: (v, row) => {
        if (row.type === "header") return null;
        return <Text type="secondary">{fmt(v)}</Text>;
      },
    },
    {
      title: "Change", dataIndex: "change", align: "center", width: 110,
      render: (v, row) => {
        if (row.type === "header" || v === 0) return null;
        return (
          <Tag
            icon={v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            color={v >= 0 ? "success" : "error"}
            style={{ borderRadius: 20, fontWeight: 600 }}
          >
            {Math.abs(v)}%
          </Tag>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      currentPage="Financial Reports"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Financial" }]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>

        {/* ── Header controls ─────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Space>
            <FundOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>Financial Statements</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Consolidated · Fiscal Year 2024</Text>
            </div>
          </Space>
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 140 }}
              options={[
                { value: "ytd",  label: "Year to Date" },
                { value: "q4",   label: "Q4 2024" },
                { value: "q3",   label: "Q3 2024" },
                { value: "2023", label: "Full Year 2023" },
              ]}
            />
            <Tooltip title="Print"><Button icon={<PrinterOutlined />} onClick={() => window.print()} /></Tooltip>
            <Dropdown menu={{ items: [
              { key: "pdf",  label: "Export PDF",   icon: <ExportOutlined /> },
              { key: "xlsx", label: "Export Excel", icon: <ExportOutlined /> },
            ]}}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          </Space>
        </div>

        {/* ── Balance Sheet KPIs ──────────────────────────────────────────── */}
        <Row gutter={[12, 12]}>
          {balanceKpis.map((k) => {
            const change = ((k.value - k.prev) / Math.abs(k.prev)) * 100;
            const positive = change >= 0;
            return (
              <Col xs={12} sm={8} lg={4} key={k.label}>
                <Card
                  size="small"
                  styles={{ body: { padding: "14px 16px" } }}
                  style={{ borderTop: `3px solid ${k.color}`, height: "100%" }}
                >
                  <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {k.label}
                  </Text>
                  <Statistic
                    value={fmtVal(k.value, k.isRatio, k.isPct)}
                    valueStyle={{ fontSize: 20, fontWeight: 700, color: k.color }}
                    style={{ marginTop: 4 }}
                  />
                  <Tag
                    icon={positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    color={positive ? "success" : "error"}
                    style={{ borderRadius: 20, marginTop: 4 }}
                  >
                    {Math.abs(change).toFixed(1)}%
                  </Tag>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* ── P&L Chart ───────────────────────────────────────────────────── */}
        <Card title={<Text strong>Income vs Expenses vs Net Profit (Monthly)</Text>} styles={{ body: { paddingTop: 8 } }}>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyPL}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={{ fontSize: 11 }} />
              <RTooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="income"   fill="#3B82F6" radius={[3,3,0,0]} name="Income"   opacity={0.85} />
              <Bar dataKey="expenses" fill="#F59E0B" radius={[3,3,0,0]} name="Expenses" opacity={0.85} />
              <Line type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} name="Net Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        {/* ── P&L Statement Table ─────────────────────────────────────────── */}
        <Card
          title={<Space><MinusOutlined /><Text strong>Profit & Loss Statement</Text></Space>}
          extra={<Tag color="blue">YTD Jan – Dec 2024</Tag>}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            size="small"
            columns={plColumns}
            dataSource={plRows}
            pagination={false}
            scroll={{ x: "max-content" }}
            rowClassName={(row) =>
              row.type === "header"   ? "bg-muted/30" :
              row.type === "total"    ? "font-bold"   :
              row.type === "subtotal" ? "bg-muted/10" : ""
            }
            onRow={(row) => ({
              style: {
                background:
                  row.type === "header"   ? token.colorFillAlter   :
                  row.type === "total"    ? token.colorPrimaryBg   :
                  row.type === "subtotal" ? token.colorFillSecondary : undefined,
              },
            })}
          />
        </Card>

        {/* ── Notes ───────────────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            All figures in USD. Financial data is unaudited and for management reporting purposes only.
            Comparative period is Jan – Dec 2023. YTD = Year to Date as of Dec 31, 2024.
          </Text>
        </Card>

      </Space>
    </DashboardLayout>
  );
}
