import DashboardLayout from "@/components/DashboardLayout";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Grid,
  Input,
  InputNumber,
  Modal,
  Progress,
  Rate,
  Row,
  Select,
  Segmented,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  Upload,
  Alert,
  message,
  notification,
  DatePicker,
  theme as antTheme,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  DollarOutlined,
  ShoppingOutlined,
  StarOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  BankOutlined,
  InboxOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  MessageOutlined,
  BellOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import React, { useState, useMemo } from "react";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CustomerActivityType, CustomerStatus } from "@/constants/enums";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph, Link } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  group: "enterprise" | "smb" | "startup" | "individual";
  status: CustomerStatus;
  revenue: number;
  orders: number;
  balance: number;
  creditLimit: number;
  rating: number;
  lastOrder: string;
  joinDate: string;
  country: string;
  city: string;
  tags: string[];
  onboardingStep: number;
  paymentTerms: string;
  taxId: string;
  currency: string;
  notes: string;
}

interface ActivityItem {
  time: string;
  action: string;
  detail: string;
  type: CustomerActivityType;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CUSTOMERS: Customer[] = [
  {
    id: "C-001",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@nexacorp.io",
    phone: "+1 (415) 234-5678",
    company: "NexaCorp",
    group: "enterprise",
    status: CustomerStatus.VIP,
    revenue: 248500,
    orders: 142,
    balance: 12400,
    creditLimit: 50000,
    rating: 5,
    lastOrder: "2026-03-01",
    joinDate: "2022-04-15",
    country: "United States",
    city: "San Francisco",
    tags: ["Key Account", "Net-30", "Referral"],
    onboardingStep: 5,
    paymentTerms: "Net 30",
    taxId: "US-83472910",
    currency: "USD",
    notes: "Preferred contact via email. Annual contract renewal in June.",
  },
  {
    id: "C-002",
    name: "James Okafor",
    email: "james.okafor@bluelabs.ng",
    phone: "+234 802 345 6789",
    company: "BlueLabs NG",
    group: "smb",
    status: CustomerStatus.ACTIVE,
    revenue: 67200,
    orders: 58,
    balance: 3200,
    creditLimit: 15000,
    rating: 4,
    lastOrder: "2026-02-22",
    joinDate: "2023-08-10",
    country: "Nigeria",
    city: "Lagos",
    tags: ["SMB", "Net-15"],
    onboardingStep: 4,
    paymentTerms: "Net 15",
    taxId: "NG-20193847",
    currency: "USD",
    notes: "Expanding operations to Abuja Q3.",
  },
  {
    id: "C-003",
    name: "Li Wei",
    email: "liwei@quantumventures.cn",
    phone: "+86 138 0013 8000",
    company: "Quantum Ventures",
    group: "enterprise",
    status: CustomerStatus.ACTIVE,
    revenue: 193000,
    orders: 107,
    balance: -4500,
    creditLimit: 40000,
    rating: 4,
    lastOrder: "2026-02-28",
    joinDate: "2022-11-03",
    country: "China",
    city: "Shanghai",
    tags: ["Enterprise", "Net-60", "High Volume"],
    onboardingStep: 5,
    paymentTerms: "Net 60",
    taxId: "CN-7284910023",
    currency: "USD",
    notes: "Bulk orders every quarter. Requires bilingual support.",
  },
  {
    id: "C-004",
    name: "Amelia Russo",
    email: "amelia@pixelforge.eu",
    phone: "+39 02 1234 5678",
    company: "PixelForge",
    group: "startup",
    status: CustomerStatus.ACTIVE,
    revenue: 28900,
    orders: 31,
    balance: 1100,
    creditLimit: 10000,
    rating: 4,
    lastOrder: "2026-02-18",
    joinDate: "2024-01-22",
    country: "Italy",
    city: "Milan",
    tags: ["Startup", "Prepaid"],
    onboardingStep: 3,
    paymentTerms: "Prepaid",
    taxId: "IT-84729100",
    currency: "EUR",
    notes: "Design agency. Seasonal orders around product launches.",
  },
  {
    id: "C-005",
    name: "Carlos Mendez",
    email: "carlos@fabricasol.mx",
    phone: "+52 55 1234 5678",
    company: "FabricaSol",
    group: "smb",
    status: CustomerStatus.INACTIVE,
    revenue: 41500,
    orders: 44,
    balance: 0,
    creditLimit: 12000,
    rating: 3,
    lastOrder: "2025-11-14",
    joinDate: "2023-03-07",
    country: "Mexico",
    city: "Mexico City",
    tags: ["SMB", "Net-30"],
    onboardingStep: 4,
    paymentTerms: "Net 30",
    taxId: "MX-RFC-29837",
    currency: "USD",
    notes: "No orders since November. Follow-up scheduled.",
  },
  {
    id: "C-006",
    name: "Priya Sharma",
    email: "priya@techbridgein.com",
    phone: "+91 98765 43210",
    company: "TechBridge India",
    group: "enterprise",
    status: CustomerStatus.VIP,
    revenue: 312000,
    orders: 189,
    balance: 28000,
    creditLimit: 75000,
    rating: 5,
    lastOrder: "2026-03-04",
    joinDate: "2021-09-20",
    country: "India",
    city: "Bengaluru",
    tags: ["Key Account", "Net-45", "Priority"],
    onboardingStep: 5,
    paymentTerms: "Net 45",
    taxId: "IN-GSTIN2938471",
    currency: "USD",
    notes:
      "Longest running enterprise client. Dedicated account manager assigned.",
  },
  {
    id: "C-007",
    name: "Noah Eriksson",
    email: "noah@nordicbuild.se",
    phone: "+46 8 123 456 78",
    company: "Nordic Build",
    group: "smb",
    status: CustomerStatus.ACTIVE,
    revenue: 53400,
    orders: 62,
    balance: 2700,
    creditLimit: 20000,
    rating: 4,
    lastOrder: "2026-02-25",
    joinDate: "2023-06-14",
    country: "Sweden",
    city: "Stockholm",
    tags: ["SMB", "Net-30", "EU"],
    onboardingStep: 4,
    paymentTerms: "Net 30",
    taxId: "SE-5592834729",
    currency: "EUR",
    notes: "Building materials supplier. Q2 spike expected.",
  },
  {
    id: "C-008",
    name: "Fatima Al-Rashid",
    email: "fatima@goldlinekw.com",
    phone: "+965 2222 3333",
    company: "Goldline KW",
    group: "individual",
    status: CustomerStatus.SUSPENDED,
    revenue: 8900,
    orders: 12,
    balance: -2100,
    creditLimit: 5000,
    rating: 2,
    lastOrder: "2025-09-03",
    joinDate: "2024-05-11",
    country: "Kuwait",
    city: "Kuwait City",
    tags: ["Overdue", "Credit Hold"],
    onboardingStep: 2,
    paymentTerms: "Prepaid",
    taxId: "",
    currency: "USD",
    notes:
      "Account suspended due to overdue balance. Legal review in progress.",
  },
  {
    id: "C-009",
    name: "David Kim",
    email: "david.kim@seoultech.kr",
    phone: "+82 2 1234 5678",
    company: "SeoulTech",
    group: "startup",
    status: CustomerStatus.ACTIVE,
    revenue: 19600,
    orders: 22,
    balance: 800,
    creditLimit: 8000,
    rating: 4,
    lastOrder: "2026-02-12",
    joinDate: "2024-09-01",
    country: "South Korea",
    city: "Seoul",
    tags: ["Startup", "Net-15", "APAC"],
    onboardingStep: 3,
    paymentTerms: "Net 15",
    taxId: "KR-2019384756",
    currency: "USD",
    notes: "IoT hardware startup. Rapid growth trajectory.",
  },
  {
    id: "C-010",
    name: "Isabella Turner",
    email: "isabella@luminousau.com",
    phone: "+61 2 8765 4321",
    company: "Luminous AU",
    group: "smb",
    status: CustomerStatus.ACTIVE,
    revenue: 79800,
    orders: 88,
    balance: 5600,
    creditLimit: 25000,
    rating: 5,
    lastOrder: "2026-03-02",
    joinDate: "2022-07-19",
    country: "Australia",
    city: "Sydney",
    tags: ["SMB", "Net-30", "Referral Partner"],
    onboardingStep: 5,
    paymentTerms: "Net 30",
    taxId: "AU-ABN-83729100",
    currency: "AUD",
    notes: "Active referral partner. Brings 2–3 leads per quarter.",
  },
];

const ACTIVITY_MAP: Record<string, ActivityItem[]> = {
  "C-001": [
    {
      time: "2026-03-01 14:22",
      action: "Order Placed",
      detail: "Order #QT-2310 — $18,400",
      type: CustomerActivityType.ORDER,
    },
    {
      time: "2026-02-15 09:10",
      action: "Payment Received",
      detail: "$24,500 via wire transfer",
      type: CustomerActivityType.PAYMENT,
    },
    {
      time: "2026-01-28 11:45",
      action: "Support Ticket Resolved",
      detail: "Ticket #4872 — Shipping delay",
      type: CustomerActivityType.SUPPORT,
    },
    {
      time: "2026-01-10 16:00",
      action: "Note Added",
      detail: "Annual contract renewal discussion",
      type: CustomerActivityType.NOTE,
    },
    {
      time: "2022-04-15 08:00",
      action: "Account Created",
      detail: "Enterprise onboarding started",
      type: CustomerActivityType.SIGNUP,
    },
  ],
  default: [
    {
      time: "2026-02-20 10:00",
      action: "Order Placed",
      detail: "New order submitted",
      type: CustomerActivityType.ORDER,
    },
    {
      time: "2026-02-10 14:30",
      action: "Payment Received",
      detail: "Invoice cleared",
      type: CustomerActivityType.PAYMENT,
    },
    {
      time: "2026-01-15 09:00",
      action: "Note Added",
      detail: "Follow-up scheduled",
      type: CustomerActivityType.NOTE,
    },
  ],
};

const MOCK_ORDERS = [
  {
    key: "1",
    id: "ORD-2310",
    date: "2026-03-01",
    items: 8,
    total: 18400,
    status: "Delivered",
  },
  {
    key: "2",
    id: "ORD-2289",
    date: "2026-02-14",
    items: 5,
    total: 9200,
    status: "Delivered",
  },
  {
    key: "3",
    id: "ORD-2241",
    date: "2026-01-27",
    items: 12,
    total: 22800,
    status: "Delivered",
  },
  {
    key: "4",
    id: "ORD-2198",
    date: "2026-01-09",
    items: 3,
    total: 5400,
    status: "Cancelled",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `$${n}`;

const STATUS_CFG = {
  vip: {
    color: "#F59E0B",
    bg: "#FEF3C7",
    label: "VIP",
    icon: <CrownOutlined />,
  },
  active: {
    color: "#10B981",
    bg: "#D1FAE5",
    label: "Active",
    icon: <CheckCircleOutlined />,
  },
  inactive: {
    color: "#94A3B8",
    bg: "#F1F5F9",
    label: "Inactive",
    icon: <ClockCircleOutlined />,
  },
  suspended: {
    color: "#EF4444",
    bg: "#FEE2E2",
    label: "Suspended",
    icon: <CloseCircleOutlined />,
  },
};

const GROUP_CFG = {
  enterprise: { color: "blue", label: "Enterprise" },
  smb: { color: "green", label: "SMB" },
  startup: { color: "orange", label: "Startup" },
  individual: { color: "purple", label: "Individual" },
};

const ACTIVITY_ICONS: Record<CustomerActivityType, React.ReactNode> = {
  [CustomerActivityType.ORDER]: (
    <ShoppingOutlined style={{ color: "#3B82F6" }} />
  ),
  [CustomerActivityType.PAYMENT]: (
    <DollarOutlined style={{ color: "#10B981" }} />
  ),
  [CustomerActivityType.SUPPORT]: (
    <MessageOutlined style={{ color: "#F59E0B" }} />
  ),
  [CustomerActivityType.SIGNUP]: <UserOutlined style={{ color: "#8B5CF6" }} />,
  [CustomerActivityType.NOTE]: (
    <FileTextOutlined style={{ color: "#94A3B8" }} />
  ),
};

// ─── Customer Drawer ──────────────────────────────────────────────────────────

function CustomerDrawer({
  customer,
  open,
  onClose,
  onEdit,
}: {
  customer: Customer | null;
  open: boolean;
  onClose: () => void;
  onEdit: (c: Customer) => void;
}) {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [noteText, setNoteText] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  if (!customer) return null;

  const sc = STATUS_CFG[customer.status];
  const gc = GROUP_CFG[customer.group];
  const activity = ACTIVITY_MAP[customer.id] ?? ACTIVITY_MAP["default"];
  const creditUsed = ((customer.balance / customer.creditLimit) * 100).toFixed(
    0
  );
  const creditPct = Math.min(
    100,
    Math.max(0, (customer.balance / customer.creditLimit) * 100)
  );

  function saveNote() {
    if (!noteText.trim()) return;
    setSavedNotes(prev => [
      `${dayjs().format("MMM D, YYYY HH:mm")} — ${noteText}`,
      ...prev,
    ]);
    setNoteText("");
    message.success("Note saved");
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 620}
      destroyOnClose
      title={
        <Space size={12}>
          <Avatar
            size={40}
            style={{
              background: avatarColor(customer.name),
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            {initials(customer.name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.3 }}>
              {customer.name}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {customer.company} · {customer.id}
            </Text>
          </div>
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="Send Email">
            <Button icon={<MailOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Edit Customer">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => onEdit(customer)}
            />
          </Tooltip>
        </Space>
      }
    >
      {/* Status + tags row */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Tag
          icon={sc.icon}
          style={{
            color: sc.color,
            background: sc.bg,
            border: "none",
            fontWeight: 600,
          }}
        >
          {sc.label}
        </Tag>
        <Tag color={gc.color}>{gc.label}</Tag>
        {customer.tags.map(t => (
          <Tag key={t}>{t}</Tag>
        ))}
      </Space>

      {/* KPI row */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {[
          {
            label: "Total Revenue",
            value: `$${customer.revenue.toLocaleString()}`,
            icon: <DollarOutlined />,
            color: "#10B981",
          },
          {
            label: "Orders",
            value: customer.orders,
            icon: <ShoppingOutlined />,
            color: "#3B82F6",
          },
          {
            label: "Balance",
            value: `$${customer.balance.toLocaleString()}`,
            icon: <BankOutlined />,
            color: customer.balance >= 0 ? "#10B981" : "#EF4444",
          },
          {
            label: "Rating",
            value: (
              <Rate
                disabled
                defaultValue={customer.rating}
                style={{ fontSize: 12 }}
              />
            ),
            icon: <StarOutlined />,
            color: "#F59E0B",
          },
        ].map(k => (
          <Col xs={12} sm={6} key={k.label}>
            <Card
              size="small"
              style={{
                textAlign: "center",
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div style={{ color: k.color, fontSize: 18, marginBottom: 4 }}>
                {k.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{k.value}</div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {k.label}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Tabs
        size="small"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <Descriptions
                  size="small"
                  bordered
                  column={2}
                  labelStyle={{ fontWeight: 500, fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                >
                  <Descriptions.Item
                    label={
                      <>
                        <MailOutlined /> Email
                      </>
                    }
                    span={2}
                  >
                    <Link href={`mailto:${customer.email}`}>
                      {customer.email}
                    </Link>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <PhoneOutlined /> Phone
                      </>
                    }
                  >
                    {customer.phone}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <>
                        <GlobalOutlined /> Country
                      </>
                    }
                  >
                    {customer.country}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">
                    {customer.city}
                  </Descriptions.Item>
                  <Descriptions.Item label="Currency">
                    {customer.currency}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Terms">
                    {customer.paymentTerms}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tax ID">
                    {customer.taxId || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Member Since">
                    {dayjs(customer.joinDate).format("MMM D, YYYY")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Order">
                    {dayjs(customer.lastOrder).format("MMM D, YYYY")}
                  </Descriptions.Item>
                </Descriptions>

                {/* Credit utilization */}
                <Card
                  size="small"
                  title="Credit Utilization"
                  style={{ border: `1px solid ${token.colorBorderSecondary}` }}
                >
                  <Space
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Used: ${customer.balance.toLocaleString()}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Limit: ${customer.creditLimit.toLocaleString()}
                    </Text>
                  </Space>
                  <Progress
                    percent={+creditPct.toFixed(1)}
                    status={
                      creditPct > 90
                        ? "exception"
                        : creditPct > 70
                          ? "normal"
                          : "success"
                    }
                    strokeColor={
                      creditPct > 90
                        ? "#EF4444"
                        : creditPct > 70
                          ? "#F59E0B"
                          : "#10B981"
                    }
                    size="small"
                    format={() => `${creditUsed}%`}
                  />
                </Card>

                {/* Onboarding steps */}
                <Card
                  size="small"
                  title="Onboarding Progress"
                  style={{ border: `1px solid ${token.colorBorderSecondary}` }}
                >
                  <Steps
                    size="small"
                    current={customer.onboardingStep}
                    items={[
                      { title: "Sign Up" },
                      { title: "Verified" },
                      { title: "First Order" },
                      { title: "Credit Set" },
                      { title: "Key Account" },
                    ]}
                  />
                </Card>

                {customer.notes && (
                  <Alert
                    type="info"
                    showIcon
                    icon={<FileTextOutlined />}
                    message="Account Notes"
                    description={customer.notes}
                    style={{ fontSize: 12 }}
                  />
                )}
              </div>
            ),
          },
          {
            key: "orders",
            label: "Orders",
            children: (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Statistic
                      title="Total Orders"
                      value={customer.orders}
                      prefix={<ShoppingOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Statistic
                      title="Total Revenue"
                      value={customer.revenue}
                      precision={0}
                      prefix="$"
                      valueStyle={{ color: "#10B981" }}
                    />
                  </Col>
                </Row>
                <Table
                  size="small"
                  dataSource={MOCK_ORDERS}
                  pagination={false}
                  columns={[
                    {
                      title: "Order ID",
                      dataIndex: "id",
                      key: "id",
                      render: v => (
                        <Text code style={{ fontSize: 11 }}>
                          {v}
                        </Text>
                      ),
                    },
                    {
                      title: "Date",
                      dataIndex: "date",
                      key: "date",
                      render: v => dayjs(v).format("MMM D, YYYY"),
                    },
                    {
                      title: "Items",
                      dataIndex: "items",
                      key: "items",
                      align: "center",
                    },
                    {
                      title: "Total",
                      dataIndex: "total",
                      key: "total",
                      render: v => `$${v.toLocaleString()}`,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: v => (
                        <Tag
                          color={v === "Delivered" ? "green" : "red"}
                          style={{ fontSize: 11 }}
                        >
                          {v}
                        </Tag>
                      ),
                    },
                  ]}
                />
              </div>
            ),
          },
          {
            key: "activity",
            label: "Activity",
            children: (
              <Timeline
                items={activity.map(a => ({
                  dot: ACTIVITY_ICONS[a.type],
                  children: (
                    <div>
                      <Text strong style={{ fontSize: 13 }}>
                        {a.action}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {a.detail}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(a.time).fromNow()}
                      </Text>
                    </div>
                  ),
                }))}
              />
            ),
          },
          {
            key: "notes",
            label: "Notes",
            children: (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <TextArea
                  rows={3}
                  placeholder="Add a note about this customer..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  maxLength={300}
                  showCount
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={saveNote}
                  icon={<PlusOutlined />}
                >
                  Save Note
                </Button>
                <Divider style={{ margin: "8px 0" }} />
                {savedNotes.length === 0 && !customer.notes ? (
                  <Empty
                    description="No notes yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {savedNotes.map((n, i) => (
                      <Card
                        key={i}
                        size="small"
                        style={{
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <Text style={{ fontSize: 12 }}>{n}</Text>
                      </Card>
                    ))}
                    {customer.notes && (
                      <Card
                        size="small"
                        style={{
                          border: `1px solid ${token.colorBorderSecondary}`,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          System note
                        </Text>
                        <br />
                        <Text style={{ fontSize: 12 }}>{customer.notes}</Text>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}

// ─── Customer Form Modal ──────────────────────────────────────────────────────

function CustomerFormModal({
  open,
  customer,
  onClose,
}: {
  open: boolean;
  customer: Customer | null;
  onClose: () => void;
}) {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [form] = Form.useForm();
  const isEdit = !!customer;

  React.useEffect(() => {
    if (open && customer) {
      form.setFieldsValue({
        ...customer,
        joinDate: customer.joinDate ? dayjs(customer.joinDate) : null,
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, customer, form]);

  function handleSave() {
    form.validateFields().then(() => {
      notification.success({
        message: isEdit ? "Customer Updated" : "Customer Created",
        description: isEdit
          ? `${customer!.name}'s profile has been updated.`
          : "New customer has been added to your database.",
        icon: <CheckCircleOutlined style={{ color: "#10B981" }} />,
        placement: "topRight",
      });
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      title={
        <Space>
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
          {isEdit ? `Edit: ${customer!.name}` : "Add New Customer"}
        </Space>
      }
      okText={isEdit ? "Save Changes" : "Create Customer"}
      width={isMobile ? "95vw" : 680}
      destroyOnClose
      okButtonProps={{ size: "large" }}
      cancelButtonProps={{ size: "large" }}
    >
      <Divider style={{ margin: "12px 0" }} />
      <Form form={form} layout="vertical" requiredMark="optional">
        <Tabs
          size="small"
          items={[
            {
              key: "basic",
              label: "Basic Info",
              children: (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[{ required: true, message: "Required" }]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Customer name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="company" label="Company">
                      <Input
                        prefix={<BankOutlined />}
                        placeholder="Company name"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { type: "email", message: "Invalid email" },
                        { required: true },
                      ]}
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="email@example.com"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="phone" label="Phone">
                      <Space.Compact style={{ width: "100%" }}>
                        <Select
                          style={{ width: 90 }}
                          defaultValue="+1"
                          options={[
                            { value: "+1", label: "🇺🇸 +1" },
                            { value: "+44", label: "🇬🇧 +44" },
                            { value: "+91", label: "🇮🇳 +91" },
                            { value: "+86", label: "🇨🇳 +86" },
                            { value: "+81", label: "🇯🇵 +81" },
                            { value: "+234", label: "🇳🇬 +234" },
                          ]}
                        />
                        <Input placeholder="Phone number" />
                      </Space.Compact>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="group"
                      label="Customer Group"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select group"
                        options={Object.entries(GROUP_CFG).map(([v, cfg]) => ({
                          value: v,
                          label: cfg.label,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="status"
                      label="Status"
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Select status"
                        options={Object.entries(STATUS_CFG).map(([v, cfg]) => ({
                          value: v,
                          label: cfg.label,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="tags" label="Tags">
                      <Select
                        mode="tags"
                        placeholder="Add tags (press Enter)"
                        options={[
                          "Key Account",
                          "Net-30",
                          "Net-15",
                          "Net-45",
                          "Net-60",
                          "Prepaid",
                          "Priority",
                          "Referral",
                          "High Volume",
                          "EU",
                          "APAC",
                        ].map(t => ({ value: t, label: t }))}
                        maxCount={6}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Avatar / Logo">
                      <Dragger
                        maxCount={1}
                        beforeUpload={() => false}
                        style={{
                          background: token.colorFillAlter,
                          borderColor: token.colorBorderSecondary,
                        }}
                      >
                        <p>
                          <InboxOutlined
                            style={{ fontSize: 24, color: token.colorPrimary }}
                          />
                        </p>
                        <p style={{ fontSize: 12, margin: 0 }}>
                          Click or drag a logo image
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: token.colorTextSecondary,
                          }}
                        >
                          PNG, JPG up to 2 MB
                        </p>
                      </Dragger>
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: "address",
              label: "Address",
              children: (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="country" label="Country">
                      <Select
                        showSearch
                        placeholder="Select country"
                        options={[
                          "United States",
                          "United Kingdom",
                          "India",
                          "China",
                          "Nigeria",
                          "Mexico",
                          "Italy",
                          "Sweden",
                          "Kuwait",
                          "South Korea",
                          "Australia",
                          "Germany",
                          "France",
                          "Brazil",
                          "Canada",
                        ].map(c => ({ value: c, label: c }))}
                        filterOption={(input, option) =>
                          (option?.label as string)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="city" label="City">
                      <Input
                        prefix={<EnvironmentOutlined />}
                        placeholder="City"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="billingAddress" label="Billing Address">
                      <TextArea
                        rows={2}
                        placeholder="Street, district, postal code..."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="shippingAddress" label="Shipping Address">
                      <TextArea
                        rows={2}
                        placeholder="Leave blank if same as billing"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
            {
              key: "financial",
              label: "Financial",
              children: (
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="creditLimit" label="Credit Limit">
                      <InputNumber
                        prefix="$"
                        style={{ width: "100%" }}
                        min={0}
                        step={1000}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="paymentTerms" label="Payment Terms">
                      <Select
                        options={[
                          "Prepaid",
                          "Net 15",
                          "Net 30",
                          "Net 45",
                          "Net 60",
                        ].map(t => ({ value: t, label: t }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="currency" label="Currency">
                      <Select
                        options={[
                          "USD",
                          "EUR",
                          "GBP",
                          "AUD",
                          "INR",
                          "JPY",
                          "CNY",
                          "NGN",
                          "MXN",
                          "KWD",
                          "KRW",
                        ].map(c => ({ value: c, label: c }))}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="taxId" label="Tax ID / VAT">
                      <Input placeholder="e.g. US-83472910" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="joinDate" label="Member Since">
                      <DatePicker
                        style={{ width: "100%" }}
                        format="MMM DD, YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="notes" label="Internal Notes">
                      <TextArea
                        rows={3}
                        placeholder="Internal notes (not visible to customer)"
                        maxLength={500}
                        showCount
                      />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function CustomersContent() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [statusFilter, setStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [modalCustomer, setModalCustomer] = useState<Customer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CUSTOMERS.filter(c => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);
      const matchGroup = groupFilter === "all" || c.group === groupFilter;
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchQ && matchGroup && matchStatus;
    });
  }, [search, groupFilter, statusFilter]);

  const totalRevenue = CUSTOMERS.reduce((s, c) => s + c.revenue, 0);
  const totalOrders = CUSTOMERS.reduce((s, c) => s + c.orders, 0);
  const activeCount = CUSTOMERS.filter(
    c => c.status === CustomerStatus.ACTIVE || c.status === CustomerStatus.VIP
  ).length;
  const avgRating = (
    CUSTOMERS.reduce((s, c) => s + c.rating, 0) / CUSTOMERS.length
  ).toFixed(1);

  function openEdit(c: Customer) {
    setModalCustomer(c);
    setModalOpen(true);
  }

  function confirmDelete(id: string) {
    setDeleteId(id);
  }

  function handleDelete() {
    message.success(`Customer ${deleteId} removed`);
    setDeleteId(null);
  }

  function exportCsv() {
    message.loading({
      content: "Preparing export...",
      key: "export",
      duration: 1.5,
    });
    setTimeout(
      () => message.success({ content: "CSV downloaded", key: "export" }),
      1500
    );
  }

  const rowMenu = (c: Customer) => ({
    items: [
      { key: "view", label: "View Details", icon: <EyeOutlined /> },
      { key: "edit", label: "Edit", icon: <EditOutlined /> },
      { key: "email", label: "Send Email", icon: <MailOutlined /> },
      { type: "divider" as const },
      {
        key: "delete",
        label: <Text type="danger">Delete</Text>,
        icon: <DeleteOutlined style={{ color: "#EF4444" }} />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      if (key === "view") {
        setDrawerCustomer(c);
      }
      if (key === "edit") {
        openEdit(c);
      }
      if (key === "email") {
        message.info(`Opening email to ${c.email}`);
      }
      if (key === "delete") {
        confirmDelete(c.id);
      }
    },
  });

  const columns: ColumnsType<Customer> = [
    {
      title: "Customer",
      key: "name",
      fixed: "left",
      width: 220,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, c) => (
        <Space size={10}>
          <Badge
            dot
            status={
              c.status === CustomerStatus.ACTIVE ||
              c.status === CustomerStatus.VIP
                ? "success"
                : c.status === CustomerStatus.SUSPENDED
                  ? "error"
                  : "default"
            }
          >
            <Avatar
              size={36}
              style={{
                background: avatarColor(c.name),
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {initials(c.name)}
            </Avatar>
          </Badge>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
              {c.name}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {c.company}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      filters: Object.entries(STATUS_CFG).map(([v, cfg]) => ({
        text: cfg.label,
        value: v,
      })),
      onFilter: (v, r) => r.status === v,
      render: (v: Customer["status"]) => {
        const sc = STATUS_CFG[v];
        return (
          <Tag
            icon={sc.icon}
            style={{
              color: sc.color,
              background: sc.bg,
              border: "none",
              fontWeight: 500,
              fontSize: 11,
            }}
          >
            {sc.label}
          </Tag>
        );
      },
    },
    {
      title: "Group",
      dataIndex: "group",
      key: "group",
      width: 110,
      render: (v: Customer["group"]) => (
        <Tag color={GROUP_CFG[v].color}>{GROUP_CFG[v].label}</Tag>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      width: 120,
      sorter: (a, b) => a.revenue - b.revenue,
      defaultSortOrder: "descend",
      render: v => (
        <Text strong style={{ color: "#10B981" }}>
          ${v.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Orders",
      dataIndex: "orders",
      key: "orders",
      width: 80,
      align: "center",
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      width: 120,
      sorter: (a, b) => a.balance - b.balance,
      render: v => (
        <Space size={4}>
          {v > 0 ? (
            <RiseOutlined style={{ color: "#10B981" }} />
          ) : v < 0 ? (
            <FallOutlined style={{ color: "#EF4444" }} />
          ) : null}
          <Text
            style={{ color: v >= 0 ? "#10B981" : "#EF4444", fontWeight: 500 }}
          >
            ${Math.abs(v).toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 130,
      sorter: (a, b) => a.rating - b.rating,
      render: v => <Rate disabled value={v} style={{ fontSize: 13 }} />,
    },
    {
      title: "Last Order",
      dataIndex: "lastOrder",
      key: "lastOrder",
      width: 130,
      sorter: (a, b) => dayjs(a.lastOrder).unix() - dayjs(b.lastOrder).unix(),
      render: v => (
        <Tooltip title={dayjs(v).format("MMMM D, YYYY")}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(v).fromNow()}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 200,
      render: (tags: string[]) => (
        <Space wrap size={4}>
          {tags.slice(0, 2).map(t => (
            <Tag key={t} style={{ fontSize: 11 }}>
              {t}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag style={{ fontSize: 11 }}>+{tags.length - 2}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      fixed: "right",
      render: (_, c) => (
        <Dropdown menu={rowMenu(c)} trigger={["click"]} placement="bottomRight">
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const cardBorder = `1px solid ${token.colorBorderSecondary}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Page header */}
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
            Customers
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {CUSTOMERS.length} total · {activeCount} active
          </Text>
        </div>
        <Space>
          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => message.info("Refreshed")}
            />
          </Tooltip>
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>
            Export CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setModalCustomer(null);
              setModalOpen(true);
            }}
          >
            Add Customer
          </Button>
        </Space>
      </div>

      {/* KPI cards */}
      <Row gutter={16}>
        {[
          {
            label: "Total Revenue",
            value: `$${(totalRevenue / 1000).toFixed(0)}k`,
            suffix: "",
            icon: <DollarOutlined />,
            color: "#10B981",
            bg: "#D1FAE5",
          },
          {
            label: "Total Orders",
            value: totalOrders,
            suffix: "",
            icon: <ShoppingOutlined />,
            color: "#3B82F6",
            bg: "#DBEAFE",
          },
          {
            label: "Active Clients",
            value: activeCount,
            suffix: `/${CUSTOMERS.length}`,
            icon: <TeamOutlined />,
            color: "#8B5CF6",
            bg: "#EDE9FE",
          },
          {
            label: "Avg. Rating",
            value: avgRating,
            suffix: "/5",
            icon: <StarOutlined />,
            color: "#F59E0B",
            bg: "#FEF3C7",
          },
        ].map(k => (
          <Col xs={12} sm={12} md={6} key={k.label}>
            <Card
              style={{ border: cardBorder }}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <Space size={14} align="start">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: k.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: k.color,
                    flexShrink: 0,
                  }}
                >
                  {k.icon}
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {k.label}
                  </Text>
                  <div>
                    <Text strong style={{ fontSize: 22 }}>
                      {k.value}
                    </Text>
                    {k.suffix && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, marginLeft: 2 }}
                      >
                        {k.suffix}
                      </Text>
                    )}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Toolbar */}
      <Card style={{ border: cardBorder }} bodyStyle={{ padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Input
            prefix={
              <SearchOutlined style={{ color: token.colorTextQuaternary }} />
            }
            placeholder="Search by name, company, email, ID..."
            style={{ flex: 1, minWidth: 220 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
          <Select
            prefix={<FilterOutlined />}
            style={{ width: 140 }}
            value={groupFilter}
            onChange={setGroupFilter}
            options={[
              { value: "all", label: "All Groups" },
              ...Object.entries(GROUP_CFG).map(([v, c]) => ({
                value: v,
                label: c.label,
              })),
            ]}
          />
          <Select
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatus}
            options={[
              { value: "all", label: "All Statuses" },
              ...Object.entries(STATUS_CFG).map(([v, c]) => ({
                value: v,
                label: c.label,
              })),
            ]}
          />
          <Segmented
            value={viewMode}
            onChange={v => setViewMode(v as "table" | "grid")}
            options={[
              { value: "table", label: "Table" },
              { value: "grid", label: "Grid" },
            ]}
          />
        </div>
      </Card>

      {/* Bulk action bar */}
      {selectedKeys.length > 0 && (
        <Alert
          type="info"
          message={
            <Space>
              <Text strong>
                {selectedKeys.length} customer
                {selectedKeys.length > 1 ? "s" : ""} selected
              </Text>
              <Button
                size="small"
                icon={<MailOutlined />}
                onClick={() => message.info("Sending bulk email...")}
              >
                Email All
              </Button>
              <Button
                size="small"
                icon={<ExportOutlined />}
                onClick={() => message.info("Exporting selection...")}
              >
                Export
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  message.success(`${selectedKeys.length} customers removed`);
                  setSelectedKeys([]);
                }}
              >
                Delete
              </Button>
              <Button
                size="small"
                type="link"
                onClick={() => setSelectedKeys([])}
              >
                Clear
              </Button>
            </Space>
          }
          style={{ borderRadius: 8 }}
        />
      )}

      {/* Table or Grid */}
      {viewMode === "table" ? (
        <Card style={{ border: cardBorder }} bodyStyle={{ padding: 0 }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1200 }}
            rowSelection={{
              selectedRowKeys: selectedKeys,
              onChange: setSelectedKeys,
            }}
            onRow={c => ({
              onDoubleClick: () => setDrawerCustomer(c),
              style: { cursor: "pointer" },
            })}
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["8", "15", "25"],
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No customers match your filters"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
          />
        </Card>
      ) : (
        <div>
          {filtered.length === 0 ? (
            <Card style={{ border: cardBorder }}>
              <Empty
                description="No customers match your filters"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filtered.map(c => {
                const sc = STATUS_CFG[c.status];
                return (
                  <Col key={c.id} xs={24} sm={12} lg={8} xl={6}>
                    <Card
                      hoverable
                      style={{ border: cardBorder, cursor: "pointer" }}
                      bodyStyle={{ padding: 16 }}
                      onClick={() => setDrawerCustomer(c)}
                      actions={[
                        <Tooltip title="View Details" key="view">
                          <EyeOutlined
                            onClick={e => {
                              e.stopPropagation();
                              setDrawerCustomer(c);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="Edit" key="edit">
                          <EditOutlined
                            onClick={e => {
                              e.stopPropagation();
                              openEdit(c);
                            }}
                          />
                        </Tooltip>,
                        <Tooltip title="Email" key="email">
                          <MailOutlined
                            onClick={e => {
                              e.stopPropagation();
                              message.info(`Email: ${c.email}`);
                            }}
                          />
                        </Tooltip>,
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <Space size={10}>
                          <Avatar
                            size={42}
                            style={{
                              background: avatarColor(c.name),
                              fontWeight: 700,
                              fontSize: 15,
                              flexShrink: 0,
                            }}
                          >
                            {initials(c.name)}
                          </Avatar>
                          <div>
                            <Text strong style={{ fontSize: 13 }}>
                              {c.name}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {c.company}
                            </Text>
                          </div>
                        </Space>
                        <Tag
                          icon={sc.icon}
                          style={{
                            color: sc.color,
                            background: sc.bg,
                            border: "none",
                            fontSize: 11,
                          }}
                        >
                          {sc.label}
                        </Tag>
                      </div>

                      <Divider style={{ margin: "10px 0" }} />

                      <Row gutter={8}>
                        <Col xs={24} sm={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Revenue
                          </Text>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "#10B981",
                              fontSize: 14,
                            }}
                          >
                            {fmt(c.revenue)}
                          </div>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Orders
                          </Text>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>
                            {c.orders}
                          </div>
                        </Col>
                      </Row>

                      <div style={{ marginTop: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Credit
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {Math.min(
                              100,
                              Math.round((c.balance / c.creditLimit) * 100)
                            )}
                            %
                          </Text>
                        </div>
                        <Progress
                          percent={Math.min(
                            100,
                            Math.max(0, (c.balance / c.creditLimit) * 100)
                          )}
                          showInfo={false}
                          size="small"
                          strokeColor={c.balance < 0 ? "#EF4444" : "#10B981"}
                        />
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Rate
                          disabled
                          value={c.rating}
                          style={{ fontSize: 11 }}
                        />
                        <Tag
                          color={GROUP_CFG[c.group].color}
                          style={{ fontSize: 11 }}
                        >
                          {GROUP_CFG[c.group].label}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      )}

      {/* Drawer */}
      <CustomerDrawer
        customer={drawerCustomer}
        open={!!drawerCustomer}
        onClose={() => setDrawerCustomer(null)}
        onEdit={c => {
          setDrawerCustomer(null);
          openEdit(c);
        }}
      />

      {/* Form Modal */}
      <CustomerFormModal
        open={modalOpen}
        customer={modalCustomer}
        onClose={() => {
          setModalOpen(false);
          setModalCustomer(null);
        }}
      />

      {/* Delete Confirm */}
      <Modal
        open={!!deleteId}
        title={
          <Space>
            <DeleteOutlined style={{ color: "#EF4444" }} /> Delete Customer
          </Space>
        }
        onOk={handleDelete}
        onCancel={() => setDeleteId(null)}
        okText="Delete"
        okButtonProps={{ danger: true, size: "large" }}
        cancelButtonProps={{ size: "large" }}
        width={isMobile ? "95vw" : 420}
      >
        <Paragraph>
          Are you sure you want to delete customer{" "}
          <Text strong>{deleteId}</Text>? This action cannot be undone.
        </Paragraph>
        <Alert
          type="warning"
          showIcon
          message="All associated orders and history will be archived."
          style={{ marginTop: 12 }}
        />
      </Modal>
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function AllCustomers() {
  return (
    <DashboardLayout currentPage="All Customers">
      <CustomersContent />
    </DashboardLayout>
  );
}
