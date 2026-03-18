/**
 * Analytics dashboard page.
 * Fetches real data from /reporting/* endpoints.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo } from "react";

import {
  Tabs,
  Card,
  Row,
  Col,
  Grid,
  Table,
  Statistic,
  Typography,
  DatePicker,
  Spin,
  Empty,
  Tag,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  TrophyOutlined,
  InboxOutlined,
  WarningOutlined,
  StopOutlined,
  DatabaseOutlined,
  TeamOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FunnelPlotOutlined,
  RiseOutlined,
  BarChartOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { ROUTES } from "@/shared/constants/routes";
import apiClient from "@/lib/api";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Query keys ──────────────────────────────────────────────────────────────

const ANALYTICS_KEYS = {
  SALES: "analytics-sales",
  INVENTORY: "analytics-inventory",
  HR: "analytics-hr",
  CRM: "analytics-crm",
} as const;

// ── API layer ───────────────────────────────────────────────────────────────

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

const analyticsApi = {
  sales: (params?: DateRangeParams) =>
    apiClient.get("/reporting/sales", { params }).then(r => r.data.data),
  inventory: (params?: DateRangeParams) =>
    apiClient.get("/reporting/inventory", { params }).then(r => r.data.data),
  hr: (params?: DateRangeParams) =>
    apiClient.get("/reporting/hr", { params }).then(r => r.data.data),
  crm: (params?: DateRangeParams) =>
    apiClient.get("/reporting/crm", { params }).then(r => r.data.data),
};

// ── Types ───────────────────────────────────────────────────────────────────

interface SalesData {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  topProduct: string;
  byStatus: {
    status: string;
    count: number;
    amount: number;
  }[];
}

interface InventoryData {
  totalSKUs: number;
  lowStock: number;
  outOfStock: number;
  inventoryValue: number;
  stockHealth: {
    category: string;
    total: number;
    lowStock: number;
    outOfStock: number;
    value: number;
  }[];
}

interface HRData {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  attendanceRate: number;
  byDepartment: {
    department: string;
    total: number;
    active: number;
    onLeave: number;
    attendanceRate: number;
  }[];
}

interface CRMData {
  totalLeads: number;
  winRate: number;
  pipelineValue: number;
  avgDealSize: number;
  byStage: {
    stage: string;
    count: number;
    value: number;
    conversionRate: number;
  }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return Number(value ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value: number): string {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function Analytics() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [activeTab, setActiveTab] = useState("sales");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const dateParams: DateRangeParams | undefined = useMemo(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) return undefined;
    return {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
    };
  }, [dateRange]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("analytics.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="Analytics" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── Header: Title + Date Range ──────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text strong style={{ fontSize: 20 }}>
            {t("analytics.title", lang)}
          </Text>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={[t("common.dateFrom", lang), t("common.dateTo", lang)]}
            allowClear
            style={{ borderRadius: 8 }}
          />
        </div>

        {/* ── Module Tabs ─────────────────────────────────────────────── */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size={isMobile ? "small" : "middle"}
          items={[
            {
              key: "sales",
              label: t("analytics.tabs.sales", lang),
              children: <SalesTab dateParams={dateParams} />,
            },
            {
              key: "inventory",
              label: t("analytics.tabs.inventory", lang),
              children: <InventoryTab dateParams={dateParams} />,
            },
            {
              key: "hr",
              label: t("analytics.tabs.hr", lang),
              children: <HRTab dateParams={dateParams} />,
            },
            {
              key: "crm",
              label: t("analytics.tabs.crm", lang),
              children: <CRMTab dateParams={dateParams} />,
            },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

// ── Shared KPI Card Renderer ────────────────────────────────────────────────

interface KPICardConfig {
  title: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  precision?: number;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

function KPICards({ cards }: { cards: KPICardConfig[] }) {
  return (
    <Row gutter={[16, 16]}>
      {cards.map(s => (
        <Col key={s.title} xs={24} sm={12} lg={6}>
          <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex justify-between items-start">
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                >
                  {s.title}
                </Text>
                <Statistic
                  value={s.value}
                  suffix={s.suffix}
                  prefix={s.prefix}
                  precision={s.precision}
                  valueStyle={{ fontSize: 24, lineHeight: 1 }}
                />
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: s.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: s.iconColor,
                }}
              >
                {s.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// ── Loading / Empty wrappers ────────────────────────────────────────────────

function TabLoading() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 300 }}
    >
      <Spin size="large" />
    </div>
  );
}

function TabEmpty({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 300 }}
    >
      <Empty description={message} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SALES TAB
// ═══════════════════════════════════════════════════════════════════════════════

function SalesTab({ dateParams }: { dateParams?: DateRangeParams }) {
  const { t, lang } = useTranslation();

  const { data, isLoading } = useQuery<SalesData>({
    queryKey: [ANALYTICS_KEYS.SALES, dateParams],
    queryFn: () => analyticsApi.sales(dateParams),
    staleTime: 60_000,
  });

  if (isLoading) return <TabLoading />;
  if (!data) return <TabEmpty message={t("analytics.noData", lang)} />;

  const kpiCards: KPICardConfig[] = [
    {
      title: t("analytics.sales.totalRevenue", lang),
      value: formatCurrency(data.totalRevenue),
      suffix: " SAR",
      icon: <DollarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("analytics.sales.orderCount", lang),
      value: Number(data.orderCount ?? 0),
      icon: <ShoppingCartOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("analytics.sales.avgOrderValue", lang),
      value: formatCurrency(data.avgOrderValue),
      suffix: " SAR",
      icon: <LineChartOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("analytics.sales.topProduct", lang),
      value: data.topProduct || "—",
      icon: <TrophyOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  const statusColumns: TableColumnsType<SalesData["byStatus"][number]> = [
    {
      title: t("analytics.sales.status", lang),
      dataIndex: "status",
      key: "status",
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          draft: "default",
          confirmed: "blue",
          done: "green",
          cancelled: "red",
        };
        return (
          <Tag color={colorMap[v?.toLowerCase()] ?? "default"}>
            {t(`analytics.sales.status_${v?.toLowerCase()}`, lang)}
          </Tag>
        );
      },
    },
    {
      title: t("analytics.sales.count", lang),
      dataIndex: "count",
      key: "count",
      align: "end",
      render: (v: number) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: t("analytics.sales.amount", lang),
      dataIndex: "amount",
      key: "amount",
      align: "end",
      render: (v: number) => (
        <Text className="font-mono">{formatCurrency(v)} SAR</Text>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <KPICards cards={kpiCards} />
      <Card
        title={t("analytics.sales.statusBreakdown", lang)}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="status"
          columns={statusColumns}
          dataSource={data.byStatus ?? []}
          pagination={false}
          size="middle"
          locale={{
            emptyText: <Empty description={t("analytics.noData", lang)} />,
          }}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY TAB
// ═══════════════════════════════════════════════════════════════════════════════

function InventoryTab({ dateParams }: { dateParams?: DateRangeParams }) {
  const { t, lang } = useTranslation();

  const { data, isLoading } = useQuery<InventoryData>({
    queryKey: [ANALYTICS_KEYS.INVENTORY, dateParams],
    queryFn: () => analyticsApi.inventory(dateParams),
    staleTime: 60_000,
  });

  if (isLoading) return <TabLoading />;
  if (!data) return <TabEmpty message={t("analytics.noData", lang)} />;

  const kpiCards: KPICardConfig[] = [
    {
      title: t("analytics.inventory.totalSKUs", lang),
      value: Number(data.totalSKUs ?? 0),
      icon: <InboxOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("analytics.inventory.lowStock", lang),
      value: Number(data.lowStock ?? 0),
      icon: <WarningOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
    {
      title: t("analytics.inventory.outOfStock", lang),
      value: Number(data.outOfStock ?? 0),
      icon: <StopOutlined />,
      iconColor: "#ef4444",
      iconBg: "#ef444415",
    },
    {
      title: t("analytics.inventory.inventoryValue", lang),
      value: formatCurrency(data.inventoryValue),
      suffix: " SAR",
      icon: <DatabaseOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
  ];

  const healthColumns: TableColumnsType<InventoryData["stockHealth"][number]> =
    [
      {
        title: t("analytics.inventory.category", lang),
        dataIndex: "category",
        key: "category",
      },
      {
        title: t("analytics.inventory.totalItems", lang),
        dataIndex: "total",
        key: "total",
        align: "end",
        render: (v: number) => Number(v ?? 0).toLocaleString(),
      },
      {
        title: t("analytics.inventory.lowStock", lang),
        dataIndex: "lowStock",
        key: "lowStock",
        align: "end",
        render: (v: number) => (
          <Text style={{ color: v > 0 ? "#f59e0b" : undefined }}>
            {Number(v ?? 0).toLocaleString()}
          </Text>
        ),
      },
      {
        title: t("analytics.inventory.outOfStock", lang),
        dataIndex: "outOfStock",
        key: "outOfStock",
        align: "end",
        render: (v: number) => (
          <Text style={{ color: v > 0 ? "#ef4444" : undefined }}>
            {Number(v ?? 0).toLocaleString()}
          </Text>
        ),
      },
      {
        title: t("analytics.inventory.value", lang),
        dataIndex: "value",
        key: "value",
        align: "end",
        render: (v: number) => (
          <Text className="font-mono">{formatCurrency(v)} SAR</Text>
        ),
      },
    ];

  return (
    <div className="flex flex-col gap-6">
      <KPICards cards={kpiCards} />
      <Card
        title={t("analytics.inventory.stockHealth", lang)}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="category"
          columns={healthColumns}
          dataSource={data.stockHealth ?? []}
          pagination={false}
          size="middle"
          locale={{
            emptyText: <Empty description={t("analytics.noData", lang)} />,
          }}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HR TAB
// ═══════════════════════════════════════════════════════════════════════════════

function HRTab({ dateParams }: { dateParams?: DateRangeParams }) {
  const { t, lang } = useTranslation();

  const { data, isLoading } = useQuery<HRData>({
    queryKey: [ANALYTICS_KEYS.HR, dateParams],
    queryFn: () => analyticsApi.hr(dateParams),
    staleTime: 60_000,
  });

  if (isLoading) return <TabLoading />;
  if (!data) return <TabEmpty message={t("analytics.noData", lang)} />;

  const kpiCards: KPICardConfig[] = [
    {
      title: t("analytics.hr.totalEmployees", lang),
      value: Number(data.totalEmployees ?? 0),
      icon: <TeamOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("analytics.hr.activeEmployees", lang),
      value: Number(data.activeEmployees ?? 0),
      icon: <UserOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("analytics.hr.onLeave", lang),
      value: Number(data.onLeave ?? 0),
      icon: <CalendarOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
    {
      title: t("analytics.hr.attendanceRate", lang),
      value: formatPercent(data.attendanceRate),
      icon: <CheckCircleOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
  ];

  const deptColumns: TableColumnsType<HRData["byDepartment"][number]> = [
    {
      title: t("analytics.hr.department", lang),
      dataIndex: "department",
      key: "department",
    },
    {
      title: t("analytics.hr.totalEmployees", lang),
      dataIndex: "total",
      key: "total",
      align: "end",
      render: (v: number) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: t("analytics.hr.activeEmployees", lang),
      dataIndex: "active",
      key: "active",
      align: "end",
      render: (v: number) => (
        <Text style={{ color: "#10b981" }}>
          {Number(v ?? 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: t("analytics.hr.onLeave", lang),
      dataIndex: "onLeave",
      key: "onLeave",
      align: "end",
      render: (v: number) => (
        <Text style={{ color: v > 0 ? "#f59e0b" : undefined }}>
          {Number(v ?? 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: t("analytics.hr.attendanceRate", lang),
      dataIndex: "attendanceRate",
      key: "attendanceRate",
      align: "end",
      render: (v: number) => {
        const pct = Number(v ?? 0);
        const color = pct >= 90 ? "#10b981" : pct >= 75 ? "#f59e0b" : "#ef4444";
        return <Text style={{ color }}>{formatPercent(pct)}</Text>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <KPICards cards={kpiCards} />
      <Card
        title={t("analytics.hr.departmentBreakdown", lang)}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="department"
          columns={deptColumns}
          dataSource={data.byDepartment ?? []}
          pagination={false}
          size="middle"
          locale={{
            emptyText: <Empty description={t("analytics.noData", lang)} />,
          }}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRM TAB
// ═══════════════════════════════════════════════════════════════════════════════

function CRMTab({ dateParams }: { dateParams?: DateRangeParams }) {
  const { t, lang } = useTranslation();

  const { data, isLoading } = useQuery<CRMData>({
    queryKey: [ANALYTICS_KEYS.CRM, dateParams],
    queryFn: () => analyticsApi.crm(dateParams),
    staleTime: 60_000,
  });

  if (isLoading) return <TabLoading />;
  if (!data) return <TabEmpty message={t("analytics.noData", lang)} />;

  const kpiCards: KPICardConfig[] = [
    {
      title: t("analytics.crm.totalLeads", lang),
      value: Number(data.totalLeads ?? 0),
      icon: <FunnelPlotOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("analytics.crm.winRate", lang),
      value: formatPercent(data.winRate),
      icon: <RiseOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("analytics.crm.pipelineValue", lang),
      value: formatCurrency(data.pipelineValue),
      suffix: " SAR",
      icon: <BarChartOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("analytics.crm.avgDealSize", lang),
      value: formatCurrency(data.avgDealSize),
      suffix: " SAR",
      icon: <AimOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  const stageColumns: TableColumnsType<CRMData["byStage"][number]> = [
    {
      title: t("analytics.crm.stage", lang),
      dataIndex: "stage",
      key: "stage",
    },
    {
      title: t("analytics.crm.leadCount", lang),
      dataIndex: "count",
      key: "count",
      align: "end",
      render: (v: number) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: t("analytics.crm.stageValue", lang),
      dataIndex: "value",
      key: "value",
      align: "end",
      render: (v: number) => (
        <Text className="font-mono">{formatCurrency(v)} SAR</Text>
      ),
    },
    {
      title: t("analytics.crm.conversionRate", lang),
      dataIndex: "conversionRate",
      key: "conversionRate",
      align: "end",
      render: (v: number) => {
        const pct = Number(v ?? 0);
        const color = pct >= 50 ? "#10b981" : pct >= 25 ? "#f59e0b" : "#ef4444";
        return <Text style={{ color }}>{formatPercent(pct)}</Text>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <KPICards cards={kpiCards} />
      <Card
        title={t("analytics.crm.stageBreakdown", lang)}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="stage"
          columns={stageColumns}
          dataSource={data.byStage ?? []}
          pagination={false}
          size="middle"
          locale={{
            emptyText: <Empty description={t("analytics.noData", lang)} />,
          }}
        />
      </Card>
    </div>
  );
}
