import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  Input,
  Tooltip,
  Dropdown,
  Progress,
  Segmented,
  DatePicker,
  Badge,
  theme as antTheme,
  Alert,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  ExportOutlined,
  ReloadOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  AlertOutlined,
  DollarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { StockReportStatus } from "@/constants/enums";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ─── Types & data ─────────────────────────────────────────────────────────────

interface StockRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  maxLevel: number;
  unitCost: number;
  totalValue: number;
  status: StockReportStatus;
  turnover: number;
  lastReceived: string;
}

const DATA: StockRow[] = [
  {
    id: 1,
    sku: "LAP-001",
    name: 'Laptop Pro 15"',
    category: "Electronics",
    quantity: 45,
    reorderLevel: 20,
    maxLevel: 80,
    unitCost: 1299,
    totalValue: 58455,
    status: StockReportStatus.IN_STOCK,
    turnover: 4.2,
    lastReceived: "2024-12-10",
  },
  {
    id: 2,
    sku: "MOU-002",
    name: "Wireless Mouse",
    category: "Peripherals",
    quantity: 8,
    reorderLevel: 15,
    maxLevel: 60,
    unitCost: 29,
    totalValue: 232,
    status: StockReportStatus.LOW_STOCK,
    turnover: 6.8,
    lastReceived: "2024-11-28",
  },
  {
    id: 3,
    sku: "USB-003",
    name: "USB-C Cable",
    category: "Accessories",
    quantity: 0,
    reorderLevel: 50,
    maxLevel: 200,
    unitCost: 12,
    totalValue: 0,
    status: StockReportStatus.OUT_OF_STOCK,
    turnover: 9.1,
    lastReceived: "2024-10-15",
  },
  {
    id: 4,
    sku: "MON-004",
    name: 'Monitor 4K 32"',
    category: "Electronics",
    quantity: 32,
    reorderLevel: 10,
    maxLevel: 40,
    unitCost: 599,
    totalValue: 19168,
    status: StockReportStatus.IN_STOCK,
    turnover: 2.9,
    lastReceived: "2024-12-05",
  },
  {
    id: 5,
    sku: "KEY-005",
    name: "Mechanical Keyboard",
    category: "Peripherals",
    quantity: 5,
    reorderLevel: 10,
    maxLevel: 40,
    unitCost: 149,
    totalValue: 745,
    status: StockReportStatus.LOW_STOCK,
    turnover: 5.4,
    lastReceived: "2024-11-20",
  },
  {
    id: 6,
    sku: "LAM-006",
    name: "Desk Lamp LED",
    category: "Accessories",
    quantity: 240,
    reorderLevel: 30,
    maxLevel: 150,
    unitCost: 45,
    totalValue: 10800,
    status: StockReportStatus.OVERSTOCK,
    turnover: 1.8,
    lastReceived: "2024-12-01",
  },
  {
    id: 7,
    sku: "WEB-007",
    name: "Webcam HD 1080p",
    category: "Electronics",
    quantity: 0,
    reorderLevel: 20,
    maxLevel: 60,
    unitCost: 89,
    totalValue: 0,
    status: StockReportStatus.OUT_OF_STOCK,
    turnover: 7.3,
    lastReceived: "2024-09-30",
  },
  {
    id: 8,
    sku: "HUB-008",
    name: "USB Hub 7-Port",
    category: "Accessories",
    quantity: 23,
    reorderLevel: 15,
    maxLevel: 60,
    unitCost: 35,
    totalValue: 805,
    status: StockReportStatus.IN_STOCK,
    turnover: 3.6,
    lastReceived: "2024-12-08",
  },
  {
    id: 9,
    sku: "STD-009",
    name: "Laptop Stand Adjustable",
    category: "Accessories",
    quantity: 15,
    reorderLevel: 10,
    maxLevel: 40,
    unitCost: 55,
    totalValue: 825,
    status: StockReportStatus.IN_STOCK,
    turnover: 4.0,
    lastReceived: "2024-11-15",
  },
  {
    id: 10,
    sku: "CHG-010",
    name: "Wireless Charger 15W",
    category: "Electronics",
    quantity: 42,
    reorderLevel: 20,
    maxLevel: 80,
    unitCost: 25,
    totalValue: 1050,
    status: StockReportStatus.IN_STOCK,
    turnover: 5.9,
    lastReceived: "2024-12-12",
  },
  {
    id: 11,
    sku: "CAB-011",
    name: "HDMI Cable 2m",
    category: "Accessories",
    quantity: 180,
    reorderLevel: 30,
    maxLevel: 120,
    unitCost: 18,
    totalValue: 3240,
    status: StockReportStatus.OVERSTOCK,
    turnover: 2.1,
    lastReceived: "2024-11-05",
  },
  {
    id: 12,
    sku: "SSD-012",
    name: "SSD 1TB NVMe",
    category: "Electronics",
    quantity: 12,
    reorderLevel: 15,
    maxLevel: 50,
    unitCost: 89,
    totalValue: 1068,
    status: StockReportStatus.LOW_STOCK,
    turnover: 8.2,
    lastReceived: "2024-12-03",
  },
  {
    id: 13,
    sku: "RAM-013",
    name: "RAM DDR5 16GB",
    category: "Electronics",
    quantity: 28,
    reorderLevel: 20,
    maxLevel: 80,
    unitCost: 68,
    totalValue: 1904,
    status: StockReportStatus.IN_STOCK,
    turnover: 5.1,
    lastReceived: "2024-12-09",
  },
  {
    id: 14,
    sku: "PAD-014",
    name: "Mouse Pad XL",
    category: "Accessories",
    quantity: 4,
    reorderLevel: 20,
    maxLevel: 80,
    unitCost: 22,
    totalValue: 88,
    status: StockReportStatus.LOW_STOCK,
    turnover: 3.3,
    lastReceived: "2024-10-28",
  },
  {
    id: 15,
    sku: "SPK-015",
    name: "Bluetooth Speaker",
    category: "Electronics",
    quantity: 19,
    reorderLevel: 10,
    maxLevel: 40,
    unitCost: 79,
    totalValue: 1501,
    status: StockReportStatus.IN_STOCK,
    turnover: 4.7,
    lastReceived: "2024-11-22",
  },
];

const STATUS_META: Record<
  StockReportStatus,
  { color: string; label: string; tagColor: string }
> = {
  "in-stock": { color: "#10B981", label: "In Stock", tagColor: "success" },
  "low-stock": { color: "#F59E0B", label: "Low Stock", tagColor: "warning" },
  "out-of-stock": {
    color: "#EF4444",
    label: "Out of Stock",
    tagColor: "error",
  },
  overstock: { color: "#8B5CF6", label: "Overstock", tagColor: "purple" },
};

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: "#3B82F6",
  Peripherals: "#10B981",
  Accessories: "#F59E0B",
};

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

// Gauge-style stock level bar
function StockGauge({ row }: { row: StockRow }) {
  const pct = Math.min((row.quantity / row.maxLevel) * 100, 130);
  const color =
    row.status === StockReportStatus.OUT_OF_STOCK
      ? "#EF4444"
      : row.status === StockReportStatus.LOW_STOCK
        ? "#F59E0B"
        : row.status === StockReportStatus.OVERSTOCK
          ? "#8B5CF6"
          : "#10B981";
  return (
    <Tooltip
      title={`${row.quantity} / ${row.maxLevel} max (reorder @ ${row.reorderLevel})`}
    >
      <div style={{ minWidth: 90 }}>
        <Progress
          percent={Math.min(pct, 100)}
          size="small"
          showInfo={false}
          strokeColor={color}
          railColor={pct > 100 ? `${color}30` : undefined}
        />
        <Text style={{ fontSize: 10, color }} type="secondary">
          {row.quantity} units
        </Text>
      </div>
    </Tooltip>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InventoryReports() {
  const { token } = antTheme.useToken();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let d = DATA;
    if (search)
      d = d.filter(
        r =>
          r.sku.toLowerCase().includes(search.toLowerCase()) ||
          r.name.toLowerCase().includes(search.toLowerCase())
      );
    if (statusFilter !== "all") d = d.filter(r => r.status === statusFilter);
    if (catFilter !== "all") d = d.filter(r => r.category === catFilter);
    return d;
  }, [search, statusFilter, catFilter]);

  // KPIs
  const totalValue = DATA.reduce((s, r) => s + r.totalValue, 0);
  const totalProducts = DATA.length;
  const lowStock = DATA.filter(
    r => r.status === StockReportStatus.LOW_STOCK
  ).length;
  const outOfStock = DATA.filter(
    r => r.status === StockReportStatus.OUT_OF_STOCK
  ).length;
  const overstock = DATA.filter(
    r => r.status === StockReportStatus.OVERSTOCK
  ).length;
  const avgTurnover = (
    DATA.reduce((s, r) => s + r.turnover, 0) / DATA.length
  ).toFixed(1);

  // Category breakdown for charts
  const categories = ["Electronics", "Peripherals", "Accessories"];
  const categoryData = categories.map(cat => {
    const items = DATA.filter(r => r.category === cat);
    return {
      name: cat,
      value: items.reduce((s, r) => s + r.totalValue, 0),
      items: items.length,
      color: CATEGORY_COLORS[cat],
    };
  });

  // Status distribution for bar
  const statusData = [
    {
      status: "In Stock",
      count: DATA.filter(r => r.status === StockReportStatus.IN_STOCK).length,
      color: "#10B981",
    },
    {
      status: "Low Stock",
      count: DATA.filter(r => r.status === StockReportStatus.LOW_STOCK).length,
      color: "#F59E0B",
    },
    {
      status: "Out of Stock",
      count: DATA.filter(r => r.status === StockReportStatus.OUT_OF_STOCK)
        .length,
      color: "#EF4444",
    },
    {
      status: "Overstock",
      count: DATA.filter(r => r.status === StockReportStatus.OVERSTOCK).length,
      color: "#8B5CF6",
    },
  ];

  // Treemap data for category value
  const treemapData = DATA.map(r => ({
    name: r.name,
    size: r.totalValue,
    category: r.category,
  }));

  function handleExport() {
    const csv = [
      [
        "SKU",
        "Product",
        "Category",
        "Qty",
        "Reorder",
        "Max",
        "Unit Cost",
        "Total Value",
        "Status",
        "Turnover",
      ],
      ...filtered.map(r => [
        r.sku,
        r.name,
        r.category,
        r.quantity,
        r.reorderLevel,
        r.maxLevel,
        r.unitCost,
        r.totalValue,
        r.status,
        r.turnover,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "inventory-report.csv";
    a.click();
  }

  const columns: TableColumnsType<StockRow> = [
    {
      title: "SKU",
      dataIndex: "sku",
      width: 100,
      render: v => (
        <Text
          style={{ fontFamily: "monospace", fontSize: 11 }}
          type="secondary"
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Product",
      dataIndex: "name",
      render: v => <Text strong>{v}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      width: 110,
      render: v => (
        <Tag
          style={{
            borderRadius: 20,
            background: `${CATEGORY_COLORS[v]}15`,
            color: CATEGORY_COLORS[v],
            border: `1px solid ${CATEGORY_COLORS[v]}40`,
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Stock Level",
      key: "level",
      width: 160,
      render: (_, row) => <StockGauge row={row} />,
      sorter: (a, b) => a.quantity - b.quantity,
    },
    {
      title: "Reorder At",
      dataIndex: "reorderLevel",
      align: "center",
      width: 90,
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Unit Cost",
      dataIndex: "unitCost",
      align: "right",
      width: 100,
      render: v => `$${v.toLocaleString()}`,
    },
    {
      title: "Total Value",
      dataIndex: "totalValue",
      align: "right",
      width: 110,
      sorter: (a, b) => a.totalValue - b.totalValue,
      render: v => <Text strong>{fmtCurrency(v)}</Text>,
    },
    {
      title: "Turnover",
      dataIndex: "turnover",
      align: "center",
      width: 90,
      sorter: (a, b) => a.turnover - b.turnover,
      render: v => (
        <Tag
          color={v >= 6 ? "success" : v >= 3 ? "processing" : "warning"}
          style={{ borderRadius: 20 }}
        >
          {v}x
        </Tag>
      ),
    },
    {
      title: "Last Received",
      dataIndex: "lastReceived",
      width: 120,
      render: v => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      filters: Object.entries(STATUS_META).map(([k, v]) => ({
        text: v.label,
        value: k,
      })),
      onFilter: (val, rec) => rec.status === val,
      render: (v: StockReportStatus) => (
        <Tag color={STATUS_META[v].tagColor} style={{ borderRadius: 20 }}>
          {STATUS_META[v].label}
        </Tag>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="Inventory Reports"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Reports" },
        { label: "Inventory" },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Alerts ──────────────────────────────────────────────────────── */}
        {(outOfStock > 0 || lowStock > 0) && (
          <Alert
            icon={<WarningOutlined />}
            showIcon
            type="warning"
            message={`${outOfStock} item${outOfStock !== 1 ? "s" : ""} out of stock · ${lowStock} item${lowStock !== 1 ? "s" : ""} running low. Reorder recommended.`}
            style={{ borderRadius: 8 }}
          />
        )}

        {/* ── KPI cards ───────────────────────────────────────────────────── */}
        <Row gutter={[12, 12]}>
          {[
            {
              label: "Total Products",
              value: totalProducts,
              sub: `${categories.length} categories`,
              color: token.colorPrimary,
              icon: <AppstoreOutlined />,
            },
            {
              label: "Total Value",
              value: fmtCurrency(totalValue),
              sub: "at cost",
              color: "#10B981",
              icon: <DollarOutlined />,
            },
            {
              label: "Low Stock",
              value: lowStock,
              sub: "need reorder",
              color: "#F59E0B",
              icon: <ArrowDownOutlined />,
            },
            {
              label: "Out of Stock",
              value: outOfStock,
              sub: "zero inventory",
              color: "#EF4444",
              icon: <AlertOutlined />,
            },
            {
              label: "Overstock",
              value: overstock,
              sub: "above max level",
              color: "#8B5CF6",
              icon: <ArrowUpOutlined />,
            },
            {
              label: "Avg Turnover",
              value: `${avgTurnover}x`,
              sub: "annual average",
              color: "#06B6D4",
              icon: <ShoppingOutlined />,
            },
          ].map(k => (
            <Col key={k.label} xs={12} sm={8} lg={4} style={{ flex: 1 }}>
              <Card size="small" styles={{ body: { padding: "14px 16px" } }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {k.label}
                    </Text>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: k.color,
                        marginTop: 4,
                        lineHeight: 1,
                      }}
                    >
                      {k.value}
                    </div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 11, marginTop: 4, display: "block" }}
                    >
                      {k.sub}
                    </Text>
                  </div>
                  <div style={{ fontSize: 22, color: k.color, opacity: 0.2 }}>
                    {k.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <Row gutter={16}>
          {/* Category value pie */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={<Text strong>Value by Category</Text>}
              styles={{ body: { paddingTop: 8 } }}
            >
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {categoryData.map(e => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v: number) => fmtCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <Space orientation="vertical" size={4} style={{ width: "100%" }}>
                {categoryData.map(c => (
                  <div
                    key={c.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space size={6}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: c.color,
                        }}
                      />
                      <Text style={{ fontSize: 12 }}>{c.name}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {fmtCurrency(c.value)}
                    </Text>
                  </div>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Status distribution */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              title={<Text strong>Stock Status Distribution</Text>}
              styles={{ body: { paddingTop: 8 } }}
            >
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border,#e2e8f0)"
                    horizontal={false}
                  />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fontSize: 10 }}
                    width={88}
                  />
                  <RTooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {statusData.map(e => (
                      <Cell key={e.status} fill={e.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Value by category bar */}
          <Col xs={24} lg={12}>
            <Card
              title={<Text strong>Top 10 Products by Value</Text>}
              styles={{ body: { paddingTop: 8 } }}
            >
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={[...DATA]
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 10)
                    .map(r => ({
                      name: r.sku,
                      value: r.totalValue,
                      color: CATEGORY_COLORS[r.category],
                    }))}
                  layout="vertical"
                  margin={{ left: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border,#e2e8f0)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={v => fmtCurrency(v)}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10 }}
                    width={60}
                  />
                  <RTooltip formatter={(v: number) => fmtCurrency(v)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[...DATA]
                      .sort((a, b) => b.totalValue - a.totalValue)
                      .slice(0, 10)
                      .map(r => (
                        <Cell key={r.sku} fill={CATEGORY_COLORS[r.category]} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ── Inventory table ─────────────────────────────────────────────── */}
        <Card
          title={
            <Space>
              <Text strong>Stock Details</Text>
              <Badge
                count={filtered.length}
                style={{ background: token.colorPrimary }}
              />
            </Space>
          }
          styles={{ body: { padding: 0 } }}
          extra={
            <Space wrap>
              <RangePicker size="small" style={{ width: 220 }} />
              <Input
                prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                placeholder="Search SKU or name…"
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
                style={{ width: 140 }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "in-stock", label: "In Stock" },
                  { value: "low-stock", label: "Low Stock" },
                  { value: "out-of-stock", label: "Out of Stock" },
                  { value: "overstock", label: "Overstock" },
                ]}
              />
              <Select
                size="small"
                value={catFilter}
                onChange={setCatFilter}
                style={{ width: 130 }}
                options={[
                  { value: "all", label: "All Categories" },
                  { value: "Electronics", label: "Electronics" },
                  { value: "Peripherals", label: "Peripherals" },
                  { value: "Accessories", label: "Accessories" },
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
              pageSize: 10,
              current: page,
              onChange: setPage,
              showTotal: (t, r) => `${r[0]}–${r[1]} of ${t} items`,
              showSizeChanger: false,
            }}
            summary={() => (
              <Table.Summary.Row style={{ background: token.colorFillAlter }}>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>Totals / Avg</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
                <Table.Summary.Cell index={6} align="right">
                  <Text strong>
                    {fmtCurrency(
                      filtered.reduce((s, r) => s + r.totalValue, 0)
                    )}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {filtered.length
                      ? (
                          filtered.reduce((s, r) => s + r.turnover, 0) /
                          filtered.length
                        ).toFixed(1)
                      : "—"}
                    x avg
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} colSpan={2} />
              </Table.Summary.Row>
            )}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
