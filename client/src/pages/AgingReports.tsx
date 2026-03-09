import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, Row, Col, Table, Tag, Space, Typography, Button, Segmented,
  Input, Tooltip, Dropdown, theme as antTheme, Alert,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  SearchOutlined, DownloadOutlined, PrinterOutlined, ExportOutlined,
  ReloadOutlined, WarningOutlined, CheckCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";

const { Text, Title } = Typography;

// ─── Types & data ─────────────────────────────────────────────────────────────

type AgingMode = "ar" | "ap";

interface AgingRow {
  id: string;
  name: string;
  current: number;
  d30: number;
  d60: number;
  d90: number;
  d90plus: number;
  total: number;
  type: "ar" | "ap";
}

const arData: AgingRow[] = [
  { id: "C001", name: "Tech Corp",          current: 42000, d30: 18000, d60: 8500,  d90: 3200, d90plus: 0,    total: 71700,  type: "ar" },
  { id: "C002", name: "Global Industries",  current: 31500, d30: 0,     d60: 0,     d90: 7800, d90plus: 4200, total: 43500,  type: "ar" },
  { id: "C003", name: "Enterprise Ltd",     current: 19200, d30: 12400, d60: 0,     d90: 0,    d90plus: 0,    total: 31600,  type: "ar" },
  { id: "C004", name: "Startup Inc",        current: 8700,  d30: 4100,  d60: 6200,  d90: 0,    d90plus: 2800, total: 21800,  type: "ar" },
  { id: "C005", name: "Local Business",     current: 15400, d30: 0,     d60: 3300,  d90: 1900, d90plus: 0,    total: 20600,  type: "ar" },
  { id: "C006", name: "Metro Retail",       current: 28900, d30: 9800,  d60: 0,     d90: 0,    d90plus: 0,    total: 38700,  type: "ar" },
  { id: "C007", name: "Premium Partners",   current: 0,     d30: 16200, d60: 4800,  d90: 3100, d90plus: 6700, total: 30800,  type: "ar" },
  { id: "C008", name: "Swift Solutions",    current: 22100, d30: 0,     d60: 0,     d90: 0,    d90plus: 0,    total: 22100,  type: "ar" },
];

const apData: AgingRow[] = [
  { id: "V001", name: "Alpha Supplies Co.", current: 38400, d30: 14200, d60: 0,    d90: 0,    d90plus: 0,    total: 52600,  type: "ap" },
  { id: "V002", name: "Beta Manufacturing", current: 21700, d30: 8900,  d60: 5400, d90: 2100, d90plus: 0,    total: 38100,  type: "ap" },
  { id: "V003", name: "Gamma Distribution", current: 14200, d30: 0,    d60: 0,    d90: 0,    d90plus: 0,    total: 14200,  type: "ap" },
  { id: "V004", name: "Delta Trading LLC",  current: 9800,  d30: 4300,  d60: 3100, d90: 1800, d90plus: 3400, total: 22400,  type: "ap" },
  { id: "V005", name: "Epsilon Global",     current: 31200, d30: 0,    d60: 7800, d90: 0,    d90plus: 0,    total: 39000,  type: "ap" },
  { id: "V006", name: "Zeta Industrial",    current: 18900, d30: 6700,  d60: 0,    d90: 4200, d90plus: 1800, total: 31600,  type: "ap" },
];

const BUCKET_COLORS = {
  current: "#10B981",
  d30:     "#3B82F6",
  d60:     "#F59E0B",
  d90:     "#F97316",
  d90plus: "#EF4444",
};

const BUCKET_LABELS = {
  current: "Current",
  d30:     "1–30 Days",
  d60:     "31–60 Days",
  d90:     "61–90 Days",
  d90plus: "90+ Days",
};

function fmt(n: number) {
  if (n === 0) return "—";
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function riskTag(row: AgingRow) {
  const overdue = row.d60 + row.d90 + row.d90plus;
  const pct = row.total ? overdue / row.total : 0;
  if (pct > 0.4)  return <Tag color="error"   style={{ borderRadius: 20 }}>High Risk</Tag>;
  if (pct > 0.15) return <Tag color="warning"  style={{ borderRadius: 20 }}>Medium</Tag>;
  return               <Tag color="success"  style={{ borderRadius: 20 }}>Good</Tag>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgingReports() {
  const { token } = antTheme.useToken();
  const [mode,   setMode]   = useState<AgingMode>("ar");
  const [search, setSearch] = useState("");

  const data = mode === "ar" ? arData : apData;

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((r) => r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  }, [data, search]);

  // Bucket totals
  const totals = useMemo(() => filtered.reduce(
    (acc, r) => ({
      current: acc.current + r.current,
      d30:     acc.d30     + r.d30,
      d60:     acc.d60     + r.d60,
      d90:     acc.d90     + r.d90,
      d90plus: acc.d90plus + r.d90plus,
      total:   acc.total   + r.total,
    }),
    { current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0, total: 0 }
  ), [filtered]);

  // Chart data: one row per entity, stacked by bucket
  const chartData = filtered.map((r) => ({
    name: r.name.split(" ")[0],
    Current:     r.current,
    "1–30 Days": r.d30,
    "31–60 Days": r.d60,
    "61–90 Days": r.d90,
    "90+ Days":  r.d90plus,
  }));

  function handleExport() {
    const csv = [
      ["ID", "Name", "Current", "1-30", "31-60", "61-90", "90+", "Total"],
      ...filtered.map((r) => [r.id, r.name, r.current, r.d30, r.d60, r.d90, r.d90plus, r.total]),
    ].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `aging-${mode}-report.csv`;
    a.click();
  }

  const overdueTotal = totals.d60 + totals.d90 + totals.d90plus;
  const overdueRate  = totals.total ? ((overdueTotal / totals.total) * 100).toFixed(1) : "0";

  const columns: TableColumnsType<AgingRow> = [
    { title: mode === "ar" ? "Customer" : "Vendor", dataIndex: "name", render: (v, row) => <Space><Text style={{ fontFamily: "monospace", fontSize: 11 }} type="secondary">{row.id}</Text><Text strong>{v}</Text></Space>, width: 220 },
    { title: "Current",     dataIndex: "current", align: "right", render: (v) => <Text style={{ color: BUCKET_COLORS.current, fontWeight: v ? 600 : 400 }}>{fmt(v)}</Text> },
    { title: "1–30 Days",   dataIndex: "d30",     align: "right", render: (v) => <Text style={{ color: BUCKET_COLORS.d30,     fontWeight: v ? 600 : 400 }}>{fmt(v)}</Text> },
    { title: "31–60 Days",  dataIndex: "d60",     align: "right", render: (v) => <Text style={{ color: BUCKET_COLORS.d60,     fontWeight: v ? 600 : 400 }}>{fmt(v)}</Text> },
    { title: "61–90 Days",  dataIndex: "d90",     align: "right", render: (v) => <Text style={{ color: BUCKET_COLORS.d90,     fontWeight: v ? 600 : 400 }}>{fmt(v)}</Text> },
    { title: "90+ Days",    dataIndex: "d90plus", align: "right", render: (v) => <Text style={{ color: BUCKET_COLORS.d90plus, fontWeight: v ? 600 : 400 }}>{fmt(v)}</Text> },
    { title: "Total",       dataIndex: "total",   align: "right", render: (v) => <Text strong>${(v / 1000).toFixed(0)}K</Text>, sorter: (a, b) => a.total - b.total },
    { title: "Risk",        key: "risk",          align: "center", render: (_, row) => riskTag(row) },
  ];

  return (
    <DashboardLayout
      currentPage="Aging Reports"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Aging" }]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>

        {/* ── Mode toggle ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {mode === "ar" ? "Accounts Receivable" : "Accounts Payable"} Aging
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>As of December 31, 2024</Text>
          </div>
          <Space>
            <Segmented
              value={mode}
              onChange={(v) => { setMode(v as AgingMode); setSearch(""); }}
              options={[{ value: "ar", label: "A/R Aging" }, { value: "ap", label: "A/P Aging" }]}
            />
            <Tooltip title="Print"><Button icon={<PrinterOutlined />} onClick={() => window.print()} /></Tooltip>
            <Dropdown menu={{ items: [
              { key: "csv",  label: "Export CSV",   icon: <ExportOutlined />, onClick: handleExport },
              { key: "xlsx", label: "Export Excel", icon: <ExportOutlined /> },
              { key: "pdf",  label: "Export PDF",   icon: <ExportOutlined /> },
            ]}}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          </Space>
        </div>

        {/* ── Alert if high overdue ───────────────────────────────────────── */}
        {parseFloat(overdueRate) > 20 && (
          <Alert
            icon={<WarningOutlined />}
            showIcon
            type="warning"
            message={`${overdueRate}% of total ${mode === "ar" ? "receivables" : "payables"} ($${(overdueTotal / 1000).toFixed(0)}K) are overdue by more than 60 days.`}
            style={{ borderRadius: 8 }}
          />
        )}

        {/* ── Bucket totals strip ─────────────────────────────────────────── */}
        <Row gutter={[12, 12]}>
          {(["current","d30","d60","d90","d90plus"] as const).map((k) => (
            <Col xs={12} sm={8} lg={4} key={k} style={{ flex: 1 }}>
              <Card
                size="small"
                styles={{ body: { padding: "14px 16px" } }}
                style={{ borderLeft: `4px solid ${BUCKET_COLORS[k]}`, background: `${BUCKET_COLORS[k]}08` }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>{BUCKET_LABELS[k]}</Text>
                <div style={{ fontWeight: 700, fontSize: 20, color: BUCKET_COLORS[k], marginTop: 4 }}>
                  ${(totals[k] / 1000).toFixed(0)}K
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {totals.total ? ((totals[k] / totals.total) * 100).toFixed(1) : 0}% of total
                </Text>
              </Card>
            </Col>
          ))}
          <Col xs={12} sm={8} lg={4} style={{ flex: 1 }}>
            <Card
              size="small"
              styles={{ body: { padding: "14px 16px" } }}
              style={{ borderLeft: `4px solid ${token.colorPrimary}`, background: token.colorPrimaryBg }}
            >
              <Text type="secondary" style={{ fontSize: 11 }}>Total Outstanding</Text>
              <div style={{ fontWeight: 700, fontSize: 20, color: token.colorPrimary, marginTop: 4 }}>
                ${(totals.total / 1000).toFixed(0)}K
              </div>
              <Space size={4}>
                <CheckCircleOutlined style={{ fontSize: 11, color: token.colorSuccess }} />
                <Text type="secondary" style={{ fontSize: 11 }}>{filtered.length} {mode === "ar" ? "customers" : "vendors"}</Text>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* ── Stacked bar chart ───────────────────────────────────────────── */}
        <Card title={<Text strong>Aging Distribution by {mode === "ar" ? "Customer" : "Vendor"}</Text>} styles={{ body: { paddingTop: 8 } }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v / 1000}K`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <RTooltip formatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
              <Legend />
              <Bar dataKey="Current"     stackId="a" fill={BUCKET_COLORS.current} />
              <Bar dataKey="1–30 Days"   stackId="a" fill={BUCKET_COLORS.d30} />
              <Bar dataKey="31–60 Days"  stackId="a" fill={BUCKET_COLORS.d60} />
              <Bar dataKey="61–90 Days"  stackId="a" fill={BUCKET_COLORS.d90} />
              <Bar dataKey="90+ Days"    stackId="a" fill={BUCKET_COLORS.d90plus} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Detail table ────────────────────────────────────────────────── */}
        <Card
          title={<Text strong>Aging Detail</Text>}
          styles={{ body: { padding: 0 } }}
          extra={
            <Space>
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder={`Search ${mode === "ar" ? "customer" : "vendor"}…`}
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              <Tooltip title="Reload"><Button size="small" icon={<ReloadOutlined />} /></Tooltip>
            </Space>
          }
        >
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: "max-content" }}
            pagination={false}
            summary={() => (
              <Table.Summary.Row style={{ background: token.colorFillAlter, fontWeight: 700 }}>
                <Table.Summary.Cell index={0}><Text strong>TOTAL</Text></Table.Summary.Cell>
                {(["current","d30","d60","d90","d90plus","total"] as const).map((k, i) => (
                  <Table.Summary.Cell key={k} index={i + 1} align="right">
                    <Text strong style={{ color: k !== "total" ? BUCKET_COLORS[k as keyof typeof BUCKET_COLORS] : token.colorPrimary }}>
                      ${(totals[k] / 1000).toFixed(0)}K
                    </Text>
                  </Table.Summary.Cell>
                ))}
                <Table.Summary.Cell index={7} />
              </Table.Summary.Row>
            )}
          />
        </Card>

      </Space>
    </DashboardLayout>
  );
}
