import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table, Button, Input, Tag, Space, Card, Row, Col, Statistic,
  Select, Tooltip, Typography, Dropdown, Segmented, DatePicker, Radio,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  SearchOutlined, ReloadOutlined, PrinterOutlined, DownloadOutlined,
  ExportOutlined, ArrowUpOutlined, ArrowDownOutlined, TrophyOutlined,
  DollarOutlined, ShoppingCartOutlined, UserOutlined, BarChartOutlined,
} from "@ant-design/icons";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer,
} from "recharts";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ─── Mock data ─────────────────────────────────────────────────────────────────

const monthlySales = [
  { month: "Jan", revenue: 142000, orders: 234, returns: 8200,  target: 150000 },
  { month: "Feb", revenue: 168000, orders: 278, returns: 6100,  target: 160000 },
  { month: "Mar", revenue: 195000, orders: 312, returns: 9400,  target: 180000 },
  { month: "Apr", revenue: 183000, orders: 298, returns: 7300,  target: 185000 },
  { month: "May", revenue: 221000, orders: 365, returns: 11200, target: 200000 },
  { month: "Jun", revenue: 247000, orders: 401, returns: 12800, target: 220000 },
  { month: "Jul", revenue: 238000, orders: 388, returns: 10500, target: 230000 },
  { month: "Aug", revenue: 264000, orders: 432, returns: 13100, target: 245000 },
  { month: "Sep", revenue: 289000, orders: 468, returns: 14200, target: 260000 },
  { month: "Oct", revenue: 271000, orders: 445, returns: 12900, target: 270000 },
  { month: "Nov", revenue: 318000, orders: 521, returns: 16400, target: 300000 },
  { month: "Dec", revenue: 356000, orders: 589, returns: 18700, target: 340000 },
];

const categoryData = [
  { name: "Electronics",   value: 34, revenue: 892000, color: "#3B82F6" },
  { name: "Apparel",       value: 22, revenue: 578000, color: "#10B981" },
  { name: "Home & Garden", value: 18, revenue: 473000, color: "#F59E0B" },
  { name: "Sports",        value: 14, revenue: 368000, color: "#8B5CF6" },
  { name: "Other",         value: 12, revenue: 316000, color: "#6B7280" },
];

const topCustomers = [
  { name: "Tech Corp",         revenue: 284000, orders: 47, growth: 12.4 },
  { name: "Global Industries", revenue: 231000, orders: 38, growth: 8.7  },
  { name: "Enterprise Ltd",    revenue: 198000, orders: 32, growth: -3.2 },
  { name: "Startup Inc",       revenue: 167000, orders: 28, growth: 22.1 },
  { name: "Local Business",    revenue: 142000, orders: 24, growth: 5.6  },
];

const topProducts = [
  { name: "Premium Widget Pro",    category: "Electronics", sold: 1842, revenue: 184200, margin: 38 },
  { name: "Sport Gear Bundle",     category: "Sports",      sold: 1234, revenue: 123400, margin: 42 },
  { name: "Home Essentials Kit",   category: "Home & Garden", sold: 987, revenue: 98700, margin: 35 },
  { name: "Classic Apparel Set",   category: "Apparel",     sold: 876,  revenue: 87600,  margin: 51 },
  { name: "Tech Accessories Pack", category: "Electronics", sold: 654,  revenue: 65400,  margin: 44 },
];

interface Transaction {
  id: string; date: string; customer: string; product: string;
  qty: number; amount: number; status: string; salesperson: string;
}

const transactions: Transaction[] = [
  { id: "SI-2024-001", date: "2024-12-15", customer: "Tech Corp",         product: "Premium Widget Pro",    qty: 12, amount: 14400, status: "paid",      salesperson: "Alice Johnson" },
  { id: "SI-2024-002", date: "2024-12-14", customer: "Global Industries", product: "Sport Gear Bundle",     qty: 8,  amount: 8000,  status: "paid",      salesperson: "Bob Smith" },
  { id: "SI-2024-003", date: "2024-12-14", customer: "Enterprise Ltd",    product: "Home Essentials Kit",   qty: 15, amount: 12750, status: "pending",   salesperson: "Carol White" },
  { id: "SI-2024-004", date: "2024-12-13", customer: "Startup Inc",       product: "Classic Apparel Set",   qty: 20, amount: 9800,  status: "paid",      salesperson: "Alice Johnson" },
  { id: "SI-2024-005", date: "2024-12-13", customer: "Local Business",    product: "Tech Accessories Pack", qty: 6,  amount: 4200,  status: "overdue",   salesperson: "David Brown" },
  { id: "SI-2024-006", date: "2024-12-12", customer: "Tech Corp",         product: "Premium Widget Pro",    qty: 9,  amount: 10800, status: "paid",      salesperson: "Bob Smith" },
  { id: "SI-2024-007", date: "2024-12-12", customer: "Global Industries", product: "Home Essentials Kit",   qty: 11, amount: 9350,  status: "pending",   salesperson: "Carol White" },
  { id: "SI-2024-008", date: "2024-12-11", customer: "Enterprise Ltd",    product: "Sport Gear Bundle",     qty: 5,  amount: 5000,  status: "paid",      salesperson: "David Brown" },
  { id: "SI-2024-009", date: "2024-12-11", customer: "Startup Inc",       product: "Premium Widget Pro",    qty: 18, amount: 21600, status: "paid",      salesperson: "Alice Johnson" },
  { id: "SI-2024-010", date: "2024-12-10", customer: "Local Business",    product: "Classic Apparel Set",   qty: 7,  amount: 3430,  status: "cancelled", salesperson: "Bob Smith" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const STATUS_TAG: Record<string, string> = {
  paid: "success", pending: "warning", overdue: "error", cancelled: "default",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, change, icon }: {
  title: string; value: string; sub: string; change: number; icon: React.ReactNode;
}) {
  const positive = change >= 0;
  return (
    <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</Text>
          <Title level={3} style={{ margin: "4px 0 2px", fontWeight: 700, lineHeight: 1 }}>{value}</Title>
          <Text type="secondary" style={{ fontSize: 12 }}>{sub}</Text>
        </div>
        <div>
          <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
          <Tag
            icon={positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            color={positive ? "success" : "error"}
            style={{ borderRadius: 20, fontWeight: 600 }}
          >
            {Math.abs(change)}%
          </Tag>
        </div>
      </div>
    </Card>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SalesReports() {
  const [chartType,    setChartType]    = useState<"area" | "bar">("area");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let d = transactions;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((t) => t.id.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.product.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") d = d.filter((t) => t.status === statusFilter);
    return d;
  }, [search, statusFilter]);

  function handleExport() {
    const csv = [
      ["Invoice #", "Date", "Customer", "Product", "Qty", "Amount", "Status", "Salesperson"],
      ...filtered.map((t) => [t.id, t.date, t.customer, t.product, t.qty, t.amount, t.status, t.salesperson]),
    ].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "sales-report.csv";
    a.click();
  }

  const txColumns: TableColumnsType<Transaction> = [
    {
      title: "Invoice #", dataIndex: "id",
      render: (v) => <Text code style={{ fontSize: 12, color: "#3b82f6" }}>{v}</Text>,
    },
    { title: "Date",     dataIndex: "date",     render: (v) => <Text type="secondary">{v}</Text> },
    { title: "Customer", dataIndex: "customer", render: (v) => <Text strong>{v}</Text> },
    {
      title: "Product",  dataIndex: "product",
      render: (v) => <Text style={{ maxWidth: 160, display: "block" }} ellipsis={{ tooltip: v }}>{v}</Text>,
    },
    { title: "Qty",    dataIndex: "qty",    align: "center" },
    { title: "Amount", dataIndex: "amount", sorter: (a, b) => a.amount - b.amount, render: (v) => <Text strong>${v.toLocaleString()}</Text> },
    {
      title: "Status", dataIndex: "status",
      filters: ["paid", "pending", "overdue", "cancelled"].map((s) => ({ text: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
      onFilter: (val, rec) => rec.status === val,
      render: (v) => <Tag color={STATUS_TAG[v] ?? "default"} style={{ borderRadius: 20, textTransform: "capitalize" }}>{v}</Tag>,
    },
    { title: "Salesperson", dataIndex: "salesperson", render: (v) => <Text type="secondary">{v}</Text> },
  ];

  return (
    <DashboardLayout currentPage="Sales Reports" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Sales" }]}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>

          {/* ── KPI Row ────────────────────────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={6}><KpiCard title="Total Revenue"  value="$2.96M" sub="vs last year"   change={18.2}  icon={<DollarOutlined style={{ color: "#3b82f6" }} />} /></Col>
            <Col xs={24} sm={12} lg={6}><KpiCard title="Total Orders"   value="4,691"  sub="vs last year"   change={12.8}  icon={<ShoppingCartOutlined style={{ color: "#10b981" }} />} /></Col>
            <Col xs={24} sm={12} lg={6}><KpiCard title="New Customers"  value="248"    sub="vs last year"   change={9.4}   icon={<UserOutlined style={{ color: "#8b5cf6" }} />} /></Col>
            <Col xs={24} sm={12} lg={6}><KpiCard title="Avg Order Value" value="$631"  sub="vs last year"   change={-2.1}  icon={<BarChartOutlined style={{ color: "#f59e0b" }} />} /></Col>
          </Row>

          {/* ── Chart + Pie ────────────────────────────────────────────────── */}
          <Row gutter={16}>
            {/* Revenue chart */}
            <Col xs={24} lg={16}>
              <Card
                title={<Text strong>Revenue vs Target</Text>}
                extra={
                  <Radio.Group value={chartType} onChange={(e) => setChartType(e.target.value)} size="small" buttonStyle="solid">
                    <Radio.Button value="area">Area</Radio.Button>
                    <Radio.Button value="bar">Bar</Radio.Button>
                  </Radio.Group>
                }
                styles={{ body: { paddingTop: 8 } }}
              >
                <ResponsiveContainer width="100%" height={240}>
                  {chartType === "area" ? (
                    <AreaChart data={monthlySales}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={{ fontSize: 11 }} />
                      <RTooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                      <Area type="monotone" dataKey="target"  stroke="#94a3b8" strokeDasharray="4 4" fill="none" strokeWidth={1.5} name="Target" />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={{ fontSize: 11 }} />
                      <RTooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="target"  fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Target" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Category pie */}
            <Col xs={24} lg={8}>
              <Card title={<Text strong>Revenue by Category</Text>} style={{ height: "100%" }} styles={{ body: { paddingTop: 8 } }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                      {categoryData.map((e) => <Cell key={e.name} fill={e.color} />)}
                    </Pie>
                    <RTooltip formatter={(v: number, name) => [`${v}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <Space direction="vertical" size={4} style={{ width: "100%", marginTop: 8 }}>
                  {categoryData.map((c) => (
                    <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Space size={6}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                        <Text style={{ fontSize: 12 }}>{c.name}</Text>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>{fmt(c.revenue)}</Text>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>

          {/* ── Top Customers + Top Products ──────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card title={<Space><TrophyOutlined style={{ color: "#f59e0b" }} /><Text strong>Top Customers</Text></Space>} styles={{ body: { padding: 0 } }}>
                <Table
                  rowKey="name"
                  size="small"
                  pagination={false}
                  dataSource={topCustomers}
                  columns={[
                    { title: "Customer", dataIndex: "name",    render: (v) => <Text strong>{v}</Text> },
                    { title: "Revenue",  dataIndex: "revenue", render: (v) => fmt(v) },
                    { title: "Orders",   dataIndex: "orders",  align: "center" },
                    {
                      title: "Growth", dataIndex: "growth",
                      render: (v) => (
                        <Tag
                          icon={v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                          color={v >= 0 ? "success" : "error"}
                          style={{ borderRadius: 20 }}
                        >
                          {Math.abs(v)}%
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<Text strong>Top Products</Text>} styles={{ body: { padding: 0 } }}>
                <Table
                  rowKey="name"
                  size="small"
                  pagination={false}
                  dataSource={topProducts}
                  columns={[
                    { title: "Product",  dataIndex: "name",     render: (v) => <Text strong ellipsis style={{ maxWidth: 140 }}>{v}</Text> },
                    { title: "Category", dataIndex: "category", render: (v) => <Tag>{v}</Tag> },
                    { title: "Sold",     dataIndex: "sold",     align: "center" },
                    { title: "Revenue",  dataIndex: "revenue",  render: (v) => fmt(v) },
                    { title: "Margin",   dataIndex: "margin",   render: (v) => <Tag color="blue">{v}%</Tag> },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          {/* ── Transactions Table ─────────────────────────────────────────── */}
          <Card
            title={<Text strong>Transaction Details</Text>}
            styles={{ body: { padding: 0 } }}
            extra={
              /* Toolbar */
              <Space wrap>
                <RangePicker size="small" style={{ width: 220 }} />
                <Input
                  prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                  placeholder="Search…"
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 130 }}
                  options={[
                    { value: "all",       label: "All Status" },
                    { value: "paid",      label: "Paid" },
                    { value: "pending",   label: "Pending" },
                    { value: "overdue",   label: "Overdue" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                />
                <Tooltip title="Reload">
                  <Button size="small" icon={<ReloadOutlined />} />
                </Tooltip>
                <Tooltip title="Print">
                  <Button size="small" icon={<PrinterOutlined />} onClick={() => window.print()} />
                </Tooltip>
                <Dropdown menu={{ items: [
                  { key: "csv", label: "Export CSV", icon: <ExportOutlined />, onClick: handleExport },
                  { key: "xlsx", label: "Export Excel", icon: <ExportOutlined /> },
                  { key: "pdf",  label: "Export PDF",   icon: <ExportOutlined /> },
                ]}}>
                  <Button size="small" icon={<DownloadOutlined />}>Export</Button>
                </Dropdown>
              </Space>
            }
          >
            <Table
              rowKey="id"
              size="small"
              columns={txColumns}
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
