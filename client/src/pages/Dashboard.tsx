import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme as antTheme,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  AppstoreOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  RightOutlined,
  ReloadOutlined,
  WarningOutlined,
  BankOutlined,
  BarChartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { Link } from "wouter";
import { OrderStatus } from "@/constants/enums";

const { Title, Text } = Typography;

// ─── Mock Data ────────────────────────────────────────────────────────────────

const revenueData = [
  { month: "Jul", revenue: 62000, expenses: 41000, profit: 21000 },
  { month: "Aug", revenue: 74000, expenses: 47000, profit: 27000 },
  { month: "Sep", revenue: 68000, expenses: 43000, profit: 25000 },
  { month: "Oct", revenue: 91000, expenses: 52000, profit: 39000 },
  { month: "Nov", revenue: 85000, expenses: 49000, profit: 36000 },
  { month: "Dec", revenue: 110000, expenses: 61000, profit: 49000 },
  { month: "Jan", revenue: 99000, expenses: 57000, profit: 42000 },
  { month: "Feb", revenue: 115000, expenses: 63000, profit: 52000 },
  { month: "Mar", revenue: 125430, expenses: 68000, profit: 57430 },
];

const salesByModuleData = [
  { name: "Electronics", value: 38400 },
  { name: "Furniture", value: 22100 },
  { name: "Clothing", value: 17800 },
  { name: "Accessories", value: 12300 },
  { name: "Software", value: 9800 },
];

const inventoryData = [
  { name: "In Stock", value: 65, color: "#10B981" },
  { name: "Low Stock", value: 20, color: "#F59E0B" },
  { name: "Out of Stock", value: 15, color: "#EF4444" },
];

const recentOrders = [
  {
    key: "1",
    order: "ORD-2024-091",
    customer: "Acme Corp",
    amount: "$4,200",
    status: OrderStatus.COMPLETED,
    date: "Today 10:24",
  },
  {
    key: "2",
    order: "ORD-2024-090",
    customer: "TechStart LLC",
    amount: "$1,800",
    status: OrderStatus.PENDING,
    date: "Today 09:11",
  },
  {
    key: "3",
    order: "ORD-2024-089",
    customer: "Global Trade Co",
    amount: "$9,560",
    status: OrderStatus.PROCESSING,
    date: "Yesterday",
  },
  {
    key: "4",
    order: "ORD-2024-088",
    customer: "Bright Retail",
    amount: "$640",
    status: OrderStatus.COMPLETED,
    date: "Yesterday",
  },
  {
    key: "5",
    order: "ORD-2024-087",
    customer: "Nova Systems",
    amount: "$3,100",
    status: OrderStatus.CANCELLED,
    date: "Mar 8",
  },
];

const pendingApprovals = [
  {
    id: "1",
    type: "Purchase Order",
    ref: "PO-2024-044",
    amount: "$12,400",
    from: "Omar Hassan",
    time: "2h ago",
  },
  {
    id: "2",
    type: "Leave Request",
    ref: "LV-2024-019",
    amount: "5 days",
    from: "Lisa Chen",
    time: "3h ago",
  },
  {
    id: "3",
    type: "Sales Return",
    ref: "RET-2024-007",
    amount: "$850",
    from: "Sarah Ahmed",
    time: "5h ago",
  },
  {
    id: "4",
    type: "Journal Entry",
    ref: "JE-2024-112",
    amount: "$5,200",
    from: "Finance Dept",
    time: "Yesterday",
  },
];

const alerts = [
  {
    id: "1",
    severity: "error",
    message: "14 products are out of stock",
    action: "/products",
  },
  {
    id: "2",
    severity: "warning",
    message: "Invoice INV-2024-031 is 7 days overdue",
    action: "/sales-invoices",
  },
  {
    id: "3",
    severity: "warning",
    message: "Bank reconciliation pending for February",
    action: "/bank-reconciliation",
  },
  {
    id: "4",
    severity: "info",
    message: "Payroll processing due in 3 days",
    action: "/payroll",
  },
];

const topTeamActivity = [
  {
    user: "Sarah Ahmed",
    avatar: "SA",
    action: "Created quotation QUO-2024-055",
    time: "5m ago",
    color: "#6366f1",
  },
  {
    user: "Omar Hassan",
    avatar: "OH",
    action: "Approved PO-2024-043 · $8,200",
    time: "18m ago",
    color: "#10b981",
  },
  {
    user: "Mark Johnson",
    avatar: "MJ",
    action: "Updated stock count — Warehouse 1",
    time: "34m ago",
    color: "#f97316",
  },
  {
    user: "Lisa Chen",
    avatar: "LC",
    action: "Submitted leave request (5 days)",
    time: "1h ago",
    color: "#8b5cf6",
  },
  {
    user: "John Doe",
    avatar: "JD",
    action: "Posted journal entry JE-2024-112",
    time: "2h ago",
    color: "#ef4444",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusTag = (s: string) => {
  const map: Record<string, string> = {
    completed: "success",
    pending: "warning",
    processing: "processing",
    cancelled: "error",
  };
  return (
    <Tag
      color={map[s] ?? "default"}
      style={{ fontSize: 11, textTransform: "capitalize" }}
    >
      {s}
    </Tag>
  );
};

const alertColor: Record<string, string> = {
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};
const alertIcon: Record<string, React.ReactNode> = {
  error: <AlertOutlined />,
  warning: <WarningOutlined />,
  info: <CheckCircleOutlined />,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  prefix,
  suffix,
  change,
  up,
  icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  change: string;
  up: boolean;
  icon: React.ReactNode;
  iconBg: string;
}) {
  const { token } = antTheme.useToken();
  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: "18px 20px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {title}
        </Text>
        <div style={{ marginTop: 6 }}>
          <Text strong style={{ fontSize: 22 }}>
            {prefix}
            {value}
            {suffix}
          </Text>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
          }}
        >
          {up ? (
            <ArrowUpOutlined style={{ color: "#10B981", fontSize: 11 }} />
          ) : (
            <ArrowDownOutlined style={{ color: "#EF4444", fontSize: 11 }} />
          )}
          <Text
            style={{
              fontSize: 11,
              color: up ? "#10B981" : "#EF4444",
              fontWeight: 600,
            }}
          >
            {change}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            vs last month
          </Text>
        </div>
      </div>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { language } = useAppSettings();
  const { token } = antTheme.useToken();
  const [period, setPeriod] = useState("9m");

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const orderCols = [
    {
      title: "Order",
      dataIndex: "order",
      render: (v: string) => (
        <Text strong style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      render: (v: string) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (v: string) => (
        <Text strong style={{ fontSize: 12 }}>
          {v}
        </Text>
      ),
    },
    { title: "Status", dataIndex: "status", render: statusTag },
    {
      title: "Date",
      dataIndex: "date",
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 11 }}>
          {v}
        </Text>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="Dashboard"
      breadcrumbs={[{ label: "Dashboard" }]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Greeting ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {greeting}, John 👋
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {today}
            </Text>
          </div>
          <Space>
            <Select
              size="small"
              value={period}
              onChange={setPeriod}
              style={{ width: 130 }}
              options={[
                { value: "1m", label: "Last Month" },
                { value: "3m", label: "Last 3 Months" },
                { value: "9m", label: "Last 9 Months" },
                { value: "1y", label: "This Year" },
              ]}
            />
            <Button size="small" icon={<ReloadOutlined />}>
              Refresh
            </Button>
          </Space>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: "Total Revenue",
              value: "125,430",
              prefix: "$",
              change: "+12.5%",
              up: true,
              icon: <DollarOutlined style={{ color: "#3B82F6" }} />,
              iconBg: "#3B82F610",
            },
            {
              title: "Total Orders",
              value: "1,234",
              prefix: "",
              change: "+8.2%",
              up: true,
              icon: <ShoppingCartOutlined style={{ color: "#10B981" }} />,
              iconBg: "#10B98110",
            },
            {
              title: "Total Expenses",
              value: "68,000",
              prefix: "$",
              change: "+4.1%",
              up: false,
              icon: <ShoppingOutlined style={{ color: "#F59E0B" }} />,
              iconBg: "#F59E0B10",
            },
            {
              title: "Net Profit",
              value: "57,430",
              prefix: "$",
              change: "+18.3%",
              up: true,
              icon: <BarChartOutlined style={{ color: "#8B5CF6" }} />,
              iconBg: "#8B5CF610",
            },
            {
              title: "Active Customers",
              value: "542",
              prefix: "",
              change: "+5.3%",
              up: true,
              icon: <TeamOutlined style={{ color: "#6366F1" }} />,
              iconBg: "#6366F110",
            },
            {
              title: "Products",
              value: "856",
              prefix: "",
              change: "-2.1%",
              up: false,
              icon: <AppstoreOutlined style={{ color: "#EF4444" }} />,
              iconBg: "#EF444410",
            },
            {
              title: "Pending Invoices",
              value: "23",
              prefix: "",
              change: "-3 new",
              up: false,
              icon: <FileTextOutlined style={{ color: "#F97316" }} />,
              iconBg: "#F9731610",
            },
            {
              title: "Bank Balance",
              value: "284,900",
              prefix: "$",
              change: "+6.7%",
              up: true,
              icon: <BankOutlined style={{ color: "#14B8A6" }} />,
              iconBg: "#14B8A610",
            },
          ].map(kpi => (
            <Col xs={24} sm={12} md={6} key={kpi.title}>
              <KPICard {...kpi} />
            </Col>
          ))}
        </Row>

        {/* ── Revenue Chart + Inventory Pie ────────────────────── */}
        <Row gutter={[16, 16]}>
          {/* Revenue Area Chart */}
          <Col xs={24} lg={16}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px 20px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 20,
                }}
              >
                <div>
                  <Text strong style={{ fontSize: 15 }}>
                    Revenue vs Expenses
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Monthly financial overview
                  </Text>
                </div>
                <Space>
                  <Tag color="blue">Revenue</Tag>
                  <Tag color="orange">Expenses</Tag>
                  <Tag color="green">Profit</Tag>
                </Space>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={revenueData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={token.colorPrimary}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={token.colorPrimary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorProfit"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={token.colorBorderSecondary}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: token.colorTextTertiary }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: token.colorTextTertiary }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RTooltip
                    formatter={(v: number) => [`$${v.toLocaleString()}`, ""]}
                    contentStyle={{
                      borderRadius: 8,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={token.colorPrimary}
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="4 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="url(#colorProfit)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Col>

          {/* Inventory Pie */}
          <Col xs={24} lg={8}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px 20px 12px",
                height: "100%",
              }}
            >
              <Text strong style={{ fontSize: 15 }}>
                Inventory Status
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Current stock distribution
              </Text>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inventoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: number) => [`${v}%`, ""]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {inventoryData.map(d => (
                  <div
                    key={d.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Space size={6}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: d.color,
                        }}
                      />
                      <Text style={{ fontSize: 12 }}>{d.name}</Text>
                    </Space>
                    <Text strong style={{ fontSize: 12 }}>
                      {d.value}%
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* ── Sales by Category + Alerts ───────────────────────── */}
        <Row gutter={[16, 16]}>
          {/* Bar Chart */}
          <Col xs={24} lg={14}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px 20px 12px",
              }}
            >
              <Text strong style={{ fontSize: 15 }}>
                Sales by Category
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Top performing product categories this month
              </Text>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={salesByModuleData}
                  margin={{ top: 16, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={token.colorBorderSecondary}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: token.colorTextTertiary }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: token.colorTextTertiary }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <RTooltip
                    formatter={(v: number) => [
                      `$${v.toLocaleString()}`,
                      "Revenue",
                    ]}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="value"
                    fill={token.colorPrimary}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>

          {/* Alerts */}
          <Col xs={24} lg={10}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Text strong style={{ fontSize: 15 }}>
                  Alerts
                </Text>
                <Badge count={alerts.length} color="#EF4444" size="small" />
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {alerts.map(a => (
                  <Link key={a.id} href={a.action}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 12px",
                        background: `${alertColor[a.severity]}08`,
                        border: `1px solid ${alertColor[a.severity]}30`,
                        borderLeft: `3px solid ${alertColor[a.severity]}`,
                        borderRadius: 8,
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                    >
                      <span
                        style={{
                          color: alertColor[a.severity],
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {alertIcon[a.severity]}
                      </span>
                      <Text style={{ fontSize: 12, flex: 1 }}>{a.message}</Text>
                      <RightOutlined
                        style={{ fontSize: 10, color: token.colorTextTertiary }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* ── Recent Orders + Pending Approvals ────────────────── */}
        <Row gutter={[16, 16]}>
          {/* Recent Orders */}
          <Col xs={24} lg={14}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ fontSize: 15 }}>
                  Recent Orders
                </Text>
                <Link href="/all-orders">
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, fontSize: 12 }}
                  >
                    View all <RightOutlined style={{ fontSize: 10 }} />
                  </Button>
                </Link>
              </div>
              <Table
                size="small"
                dataSource={recentOrders}
                columns={orderCols}
                pagination={false}
                style={{ fontSize: 12 }}
              />
            </div>
          </Col>

          {/* Pending Approvals */}
          <Col xs={24} lg={10}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ fontSize: 15 }}>
                  Pending Approvals
                </Text>
                <Badge
                  count={pendingApprovals.length}
                  color={token.colorPrimary}
                  size="small"
                />
              </div>
              <div style={{ padding: "8px 0" }}>
                {pendingApprovals.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: "10px 20px",
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        flexShrink: 0,
                        background: token.colorPrimaryBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ClockCircleOutlined
                        style={{ color: token.colorPrimary, fontSize: 14 }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text strong style={{ fontSize: 12 }}>
                          {item.type}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.time}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: 2,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {item.ref} · {item.from}
                        </Text>
                        <Text
                          strong
                          style={{ fontSize: 12, color: token.colorPrimary }}
                        >
                          {item.amount}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 20px" }}>
                  <Button block size="small" type="dashed">
                    View all approvals
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* ── Team Activity ─────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={10}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <Text strong style={{ fontSize: 15 }}>
                  Team Activity
                </Text>
                <Link href="/chat">
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, fontSize: 12 }}
                  >
                    Open chat <RightOutlined style={{ fontSize: 10 }} />
                  </Button>
                </Link>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {topTeamActivity.map((a, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar
                      size={32}
                      style={{
                        background: a.color,
                        fontWeight: 700,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {a.avatar}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ fontSize: 12 }}>
                        {a.user}
                      </Text>
                      <br />
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {a.action}
                      </Text>
                    </div>
                    <Text
                      type="secondary"
                      style={{ fontSize: 10, flexShrink: 0 }}
                    >
                      {a.time}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* Module Health */}
          <Col xs={24} lg={14}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "20px",
              }}
            >
              <Text strong style={{ fontSize: 15 }}>
                Module Health
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Performance score per module this month
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  marginTop: 16,
                }}
              >
                {[
                  {
                    name: "Sales",
                    pct: 87,
                    color: "#3B82F6",
                    detail: "1,234 orders · $125k revenue",
                  },
                  {
                    name: "Purchases",
                    pct: 72,
                    color: "#10B981",
                    detail: "89 POs · $68k expenses",
                  },
                  {
                    name: "Inventory",
                    pct: 65,
                    color: "#F59E0B",
                    detail: "856 products · 14 out of stock",
                  },
                  {
                    name: "Accounting",
                    pct: 91,
                    color: "#8B5CF6",
                    detail: "All journals posted · balanced",
                  },
                  {
                    name: "HR",
                    pct: 78,
                    color: "#6366F1",
                    detail: "48 employees · payroll on track",
                  },
                  {
                    name: "Treasury",
                    pct: 83,
                    color: "#14B8A6",
                    detail: "$284k balance · 2 accounts",
                  },
                ].map(m => (
                  <div key={m.name}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: 600 }}>
                        {m.name}
                      </Text>
                      <Space size={8}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {m.detail}
                        </Text>
                        <Text strong style={{ fontSize: 12, color: m.color }}>
                          {m.pct}%
                        </Text>
                      </Space>
                    </div>
                    <Progress
                      percent={m.pct}
                      showInfo={false}
                      strokeColor={m.color}
                      trailColor={token.colorFillSecondary}
                      size="small"
                      strokeLinecap="round"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
