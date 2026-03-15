import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  DatePicker,
  Input,
  Tooltip,
  Dropdown,
  Progress,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ShoppingOutlined,
  DollarOutlined,
  CarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PurchaseReportStatus } from "@/constants/enums";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ─── Mock data ─────────────────────────────────────────────────────────────────

const monthlySpend = [
  { month: "Jan", purchases: 98000, budget: 110000, returns: 4200 },
  { month: "Feb", purchases: 112000, budget: 110000, returns: 5100 },
  { month: "Mar", purchases: 87000, budget: 110000, returns: 3800 },
  { month: "Apr", purchases: 134000, budget: 120000, returns: 6700 },
  { month: "May", purchases: 121000, budget: 120000, returns: 5500 },
  { month: "Jun", purchases: 108000, budget: 120000, returns: 4900 },
  { month: "Jul", purchases: 145000, budget: 130000, returns: 7200 },
  { month: "Aug", purchases: 139000, budget: 130000, returns: 6100 },
  { month: "Sep", purchases: 156000, budget: 140000, returns: 8400 },
  { month: "Oct", purchases: 148000, budget: 140000, returns: 7800 },
  { month: "Nov", purchases: 172000, budget: 155000, returns: 9100 },
  { month: "Dec", purchases: 189000, budget: 165000, returns: 10200 },
];

const topVendors = [
  {
    name: "Alpha Supplies Co.",
    spend: 312000,
    orders: 48,
    onTime: 94,
    color: "#3B82F6",
  },
  {
    name: "Beta Manufacturing",
    spend: 267000,
    orders: 37,
    onTime: 88,
    color: "#10B981",
  },
  {
    name: "Gamma Distribution",
    spend: 198000,
    orders: 29,
    onTime: 97,
    color: "#8B5CF6",
  },
  {
    name: "Delta Trading LLC",
    spend: 154000,
    orders: 22,
    onTime: 79,
    color: "#F59E0B",
  },
  {
    name: "Epsilon Global",
    spend: 132000,
    orders: 19,
    onTime: 91,
    color: "#EC4899",
  },
  {
    name: "Zeta Industrial",
    spend: 98000,
    orders: 14,
    onTime: 85,
    color: "#06B6D4",
  },
];

const categorySpend = [
  { category: "Raw Materials", spend: 524000, pct: 38 },
  { category: "Packaging", spend: 207000, pct: 15 },
  { category: "Machinery Parts", spend: 276000, pct: 20 },
  { category: "Office Supplies", spend: 97000, pct: 7 },
  { category: "Services", spend: 138000, pct: 10 },
  { category: "Utilities", spend: 138000, pct: 10 },
];

interface PurchaseOrder {
  id: string;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  items: number;
  status: string;
  dueDate: string;
}

const orders: PurchaseOrder[] = [
  {
    id: "PO-2024-001",
    date: "2024-12-15",
    vendor: "Alpha Supplies Co.",
    category: "Raw Materials",
    amount: 42800,
    items: 12,
    status: PurchaseReportStatus.RECEIVED,
    dueDate: "2024-12-20",
  },
  {
    id: "PO-2024-002",
    date: "2024-12-14",
    vendor: "Beta Manufacturing",
    category: "Machinery Parts",
    amount: 31200,
    items: 5,
    status: PurchaseReportStatus.PENDING,
    dueDate: "2024-12-28",
  },
  {
    id: "PO-2024-003",
    date: "2024-12-13",
    vendor: "Gamma Distribution",
    category: "Packaging",
    amount: 18500,
    items: 8,
    status: PurchaseReportStatus.RECEIVED,
    dueDate: "2024-12-18",
  },
  {
    id: "PO-2024-004",
    date: "2024-12-12",
    vendor: "Delta Trading LLC",
    category: "Office Supplies",
    amount: 7400,
    items: 20,
    status: PurchaseReportStatus.OVERDUE,
    dueDate: "2024-12-10",
  },
  {
    id: "PO-2024-005",
    date: "2024-12-11",
    vendor: "Epsilon Global",
    category: "Services",
    amount: 24600,
    items: 3,
    status: PurchaseReportStatus.PENDING,
    dueDate: "2025-01-05",
  },
  {
    id: "PO-2024-006",
    date: "2024-12-10",
    vendor: "Alpha Supplies Co.",
    category: "Raw Materials",
    amount: 38900,
    items: 9,
    status: PurchaseReportStatus.RECEIVED,
    dueDate: "2024-12-15",
  },
  {
    id: "PO-2024-007",
    date: "2024-12-09",
    vendor: "Zeta Industrial",
    category: "Machinery Parts",
    amount: 56700,
    items: 4,
    status: PurchaseReportStatus.CANCELLED,
    dueDate: "2024-12-25",
  },
  {
    id: "PO-2024-008",
    date: "2024-12-08",
    vendor: "Beta Manufacturing",
    category: "Raw Materials",
    amount: 29100,
    items: 7,
    status: PurchaseReportStatus.RECEIVED,
    dueDate: "2024-12-12",
  },
];

const STATUS_COLOR: Record<string, string> = {
  received: "success",
  pending: "processing",
  overdue: "error",
  cancelled: "default",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ─── KPI strip ────────────────────────────────────────────────────────────────

function KpiStrip() {
  const { token } = antTheme.useToken();
  const kpis = [
    {
      label: "Total Spend",
      value: "$1.61M",
      change: +14.2,
      icon: <DollarOutlined />,
      color: token.colorPrimary,
    },
    {
      label: "Purchase Orders",
      value: "248",
      change: +8.7,
      icon: <FileTextOutlined />,
      color: "#10B981",
    },
    {
      label: "Active Vendors",
      value: "34",
      change: +2,
      icon: <CarOutlined />,
      color: "#8B5CF6",
    },
    {
      label: "Avg Lead Time",
      value: "6.2d",
      change: -1.4,
      icon: <ShoppingOutlined />,
      color: "#F59E0B",
    },
  ];

  return (
    <Row gutter={16}>
      {kpis.map(k => (
        <Col xs={24} sm={12} lg={6} key={k.label}>
          <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: `${k.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: k.color,
                }}
              >
                {k.icon}
              </div>
              <div style={{ flex: 1 }}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {k.label}
                </Text>
                <Title
                  level={4}
                  style={{ margin: "2px 0 0", fontWeight: 700, lineHeight: 1 }}
                >
                  {k.value}
                </Title>
              </div>
              <Tag
                icon={
                  k.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                }
                color={k.change >= 0 ? "success" : "error"}
                style={{ borderRadius: 20, fontWeight: 600, margin: 0 }}
              >
                {Math.abs(k.change)}%
              </Tag>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PurchaseReports() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let d = orders;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(
        o =>
          o.id.toLowerCase().includes(q) || o.vendor.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") d = d.filter(o => o.status === statusFilter);
    return d;
  }, [search, statusFilter]);

  function handleExport() {
    const csv = [
      [
        "PO #",
        "Date",
        "Vendor",
        "Category",
        "Amount",
        "Items",
        "Status",
        "Due Date",
      ],
      ...filtered.map(o => [
        o.id,
        o.date,
        o.vendor,
        o.category,
        o.amount,
        o.items,
        o.status,
        o.dueDate,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "purchase-report.csv";
    a.click();
  }

  const maxSpend = Math.max(...topVendors.map(v => v.spend));

  const columns: TableColumnsType<PurchaseOrder> = [
    {
      title: "PO #",
      dataIndex: "id",
      render: v => (
        <Text code style={{ fontSize: 12, color: "#8B5CF6" }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
      render: v => <Text strong>{v}</Text>,
    },
    { title: "Category", dataIndex: "category", render: v => <Tag>{v}</Tag> },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: v => <Text strong>{fmt(v)}</Text>,
    },
    { title: "Items", dataIndex: "items", align: "center" },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: ["received", "pending", "overdue", "cancelled"].map(s => ({
        text: s.charAt(0).toUpperCase() + s.slice(1),
        value: s,
      })),
      onFilter: (val, rec) => rec.status === val,
      render: v => (
        <Tag
          color={STATUS_COLOR[v]}
          style={{ borderRadius: 20, textTransform: "capitalize" }}
        >
          {v}
        </Tag>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="Purchase Reports"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Reports" },
        { label: "Purchase" },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        <KpiStrip />

        {/* ── Spend Trend + Category Breakdown ───────────────────────────── */}
        <Row gutter={16}>
          {/* Monthly spend line chart */}
          <Col xs={24} lg={16}>
            <Card
              title={<Text strong>Monthly Spend vs Budget</Text>}
              styles={{ body: { paddingTop: 8 } }}
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlySpend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border,#e2e8f0)"
                  />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={v => `$${v / 1000}K`}
                    tick={{ fontSize: 11 }}
                  />
                  <RTooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="purchases"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    dot={false}
                    name="Purchases"
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                    name="Budget"
                  />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    dot={false}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Category spend breakdown */}
          <Col xs={24} lg={8}>
            <Card
              title={<Text strong>Spend by Category</Text>}
              style={{ height: "100%" }}
              styles={{ body: { paddingTop: 12 } }}
            >
              <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                {categorySpend.map((c, i) => {
                  const colors = [
                    "#3B82F6",
                    "#10B981",
                    "#8B5CF6",
                    "#F59E0B",
                    "#EC4899",
                    "#06B6D4",
                  ];
                  return (
                    <div key={c.category}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{c.category}</Text>
                        <Space size={8}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {fmt(c.spend)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors[i],
                              fontWeight: 600,
                            }}
                          >
                            {c.pct}%
                          </Text>
                        </Space>
                      </div>
                      <Progress
                        percent={c.pct}
                        showInfo={false}
                        strokeColor={colors[i]}
                        trailColor="var(--border,#e2e8f0)"
                        size="small"
                      />
                    </div>
                  );
                })}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* ── Top Vendors horizontal bars ─────────────────────────────────── */}
        <Card
          title={
            <Space>
              <CarOutlined style={{ color: "#8B5CF6" }} />
              <Text strong>Top Vendors by Spend</Text>
            </Space>
          }
        >
          <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            {topVendors.map(v => (
              <div
                key={v.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 80px 80px 70px",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Text strong style={{ fontSize: 13 }}>
                  {v.name}
                </Text>
                <div
                  style={{
                    background: "var(--border,#e2e8f0)",
                    borderRadius: 99,
                    overflow: "hidden",
                    height: 8,
                  }}
                >
                  <div
                    style={{
                      width: `${(v.spend / maxSpend) * 100}%`,
                      height: "100%",
                      background: v.color,
                      borderRadius: 99,
                      transition: "width 0.5s",
                    }}
                  />
                </div>
                <Text
                  style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}
                >
                  {fmt(v.spend)}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, textAlign: "center" }}
                >
                  {v.orders} orders
                </Text>
                <Tag
                  color={
                    v.onTime >= 90
                      ? "success"
                      : v.onTime >= 80
                        ? "warning"
                        : "error"
                  }
                  style={{ borderRadius: 20, textAlign: "center" }}
                >
                  {v.onTime}%
                </Tag>
              </div>
            ))}
          </Space>
          <Text
            type="secondary"
            style={{ fontSize: 11, marginTop: 12, display: "block" }}
          >
            Last column = on-time delivery rate
          </Text>
        </Card>

        {/* ── Purchase Orders Table ───────────────────────────────────────── */}
        <Card
          title={<Text strong>Purchase Orders</Text>}
          styles={{ body: { padding: 0 } }}
          extra={
            <Space wrap>
              <RangePicker size="small" style={{ width: 220 }} />
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search PO / vendor…"
                size="small"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              <Select
                size="small"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 130 }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "received", label: "Received" },
                  { value: "pending", label: "Pending" },
                  { value: "overdue", label: "Overdue" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
              <Tooltip title="Reload">
                <Button size="small" icon={<ReloadOutlined />} />
              </Tooltip>
              <Tooltip title="Print">
                <Button
                  size="small"
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "csv",
                      label: "Export CSV",
                      icon: <ExportOutlined />,
                      onClick: handleExport,
                    },
                    {
                      key: "xlsx",
                      label: "Export Excel",
                      icon: <ExportOutlined />,
                    },
                    {
                      key: "pdf",
                      label: "Export PDF",
                      icon: <ExportOutlined />,
                    },
                  ],
                }}
              >
                <Button size="small" icon={<DownloadOutlined />}>
                  Export
                </Button>
              </Dropdown>
            </Space>
          }
        >
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 8,
              current: page,
              onChange: setPage,
              showTotal: (t, r) => `${r[0]}–${r[1]} of ${t}`,
              showSizeChanger: false,
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
