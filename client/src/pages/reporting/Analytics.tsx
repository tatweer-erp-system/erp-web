/**
 * Analytics page — multi-module dashboard.
 * Fetches data from GET /reporting/{sales,inventory,hr,crm} and
 * displays tabbed analytics with KPI cards and charts per module.
 */

import { useState, useMemo } from "react";
import {
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import apiClient from "@/lib/api";

const { Text, Title } = Typography;

// ─── Types ───────────────────────────────────────────────────────────────────

interface SalesData {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  byStatus: { status: string; count: number; amount: number }[];
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

// ─── API ─────────────────────────────────────────────────────────────────────

const analyticsApi = {
  sales: () =>
    apiClient.get("/reporting/sales").then(r => r.data.data as SalesData),
  inventory: () =>
    apiClient
      .get("/reporting/inventory")
      .then(r => r.data.data as InventoryData),
  hr: () => apiClient.get("/reporting/hr").then(r => r.data.data as HRData),
  crm: () => apiClient.get("/reporting/crm").then(r => r.data.data as CRMData),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtCurrency(value: number | undefined): string {
  if (value == null) return "0.00";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtNumber(value: number | undefined): string | number {
  if (value == null) return 0;
  return Number(value).toLocaleString();
}

function fmtPercent(value: number | undefined): string {
  if (value == null) return "0%";
  return `${Number(value).toFixed(1)}%`;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#94A3B8",
  confirmed: "#3B82F6",
  invoiced: "#8B5CF6",
  delivered: "#10B981",
  completed: "#059669",
  cancelled: "#EF4444",
  paid: "#10B981",
  new: "#3B82F6",
  qualified: "#8B5CF6",
  proposition: "#F59E0B",
  won: "#10B981",
  lost: "#EF4444",
};

const PIE_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
  "#F97316",
];

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  suffix,
  loading,
  valueColor,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  loading?: boolean;
  valueColor?: string;
}) {
  const { token } = antTheme.useToken();
  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        padding: "14px 16px",
      }}
    >
      <Text type="secondary" style={{ fontSize: 12 }}>
        {title}
      </Text>
      <div style={{ marginTop: 4 }}>
        {loading ? (
          <Spin size="small" />
        ) : (
          <Statistic
            value={value}
            suffix={suffix}
            styles={{ content: { fontSize: 20, lineHeight: 1, color: valueColor } }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Sales Tab ───────────────────────────────────────────────────────────────

function SalesTab({ branchId }: { branchId: string | null }) {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "sales", branchId],
    queryFn: analyticsApi.sales,
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const chartData = useMemo(
    () =>
      (data?.byStatus ?? []).map(s => ({
        status: s.status,
        label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
        amount: Number(s.amount),
        count: Number(s.count),
      })),
    [data]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={8}>
          <KPICard
            title={t("salesReports.totalOrders", lang)}
            value={fmtNumber(data?.orderCount)}
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title={t("salesReports.totalRevenue", lang)}
            value={fmtCurrency(data?.totalRevenue)}
            suffix=" SAR"
            loading={isLoading}
          />
        </Col>
        <Col xs={24} sm={8}>
          <KPICard
            title={t("salesReports.avgOrderValue", lang)}
            value={fmtCurrency(data?.avgOrderValue)}
            suffix=" SAR"
            loading={isLoading}
          />
        </Col>
      </Row>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke={token.colorTextTertiary}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke={token.colorTextTertiary}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`${fmtCurrency(value)} SAR`]}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map(e => (
                <Cell
                  key={e.status}
                  fill={
                    STATUS_COLORS[e.status.toLowerCase()] ?? token.colorPrimary
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">{t("common.noData", lang)}</Text>}
        />
      )}
    </div>
  );
}

// ─── Inventory Tab ───────────────────────────────────────────────────────────

function InventoryTab({ branchId }: { branchId: string | null }) {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "inventory", branchId],
    queryFn: analyticsApi.inventory,
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const columns: TableColumnsType<InventoryData["stockHealth"][0]> = useMemo(
    () => [
      {
        title: t("common.category", lang),
        dataIndex: "category",
        key: "category",
        width: 180,
      },
      {
        title: t("inventoryReports.totalProducts", lang),
        dataIndex: "total",
        key: "total",
        width: 100,
        align: "end" as const,
        render: (v: number) => fmtNumber(v),
      },
      {
        title: t("inventoryReports.lowStock", lang),
        dataIndex: "lowStock",
        key: "lowStock",
        width: 100,
        align: "end" as const,
        render: (v: number) => (
          <Text style={{ color: Number(v) > 0 ? "#F59E0B" : undefined }}>
            {fmtNumber(v)}
          </Text>
        ),
      },
      {
        title: t("inventoryReports.outOfStock", lang),
        dataIndex: "outOfStock",
        key: "outOfStock",
        width: 100,
        align: "end" as const,
        render: (v: number) => (
          <Text style={{ color: Number(v) > 0 ? "#EF4444" : undefined }}>
            {fmtNumber(v)}
          </Text>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("inventoryReports.totalProducts", lang)}
            value={fmtNumber(data?.totalSKUs)}
            loading={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("inventoryReports.lowStock", lang)}
            value={fmtNumber(data?.lowStock)}
            loading={isLoading}
            valueColor="#F59E0B"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("inventoryReports.outOfStock", lang)}
            value={fmtNumber(data?.outOfStock)}
            loading={isLoading}
            valueColor="#EF4444"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.value", lang)}
            value={fmtCurrency(data?.inventoryValue)}
            suffix=" SAR"
            loading={isLoading}
          />
        </Col>
      </Row>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : (data?.stockHealth ?? []).length > 0 ? (
        <Table
          rowKey="category"
          size="small"
          dataSource={data?.stockHealth}
          columns={columns}
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">{t("common.noData", lang)}</Text>}
        />
      )}
    </div>
  );
}

// ─── HR Tab ──────────────────────────────────────────────────────────────────

function HRTab({ branchId }: { branchId: string | null }) {
  const { t, lang } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "hr", branchId],
    queryFn: analyticsApi.hr,
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const pieData = useMemo(
    () =>
      (data?.byDepartment ?? []).map(d => ({
        name: d.department,
        value: d.total,
      })),
    [data]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.totalEmployees", lang)}
            value={fmtNumber(data?.totalEmployees)}
            loading={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.active", lang)}
            value={fmtNumber(data?.activeEmployees)}
            loading={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.onLeave", lang)}
            value={fmtNumber(data?.onLeave)}
            loading={isLoading}
            valueColor="#F59E0B"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.attendanceRate", lang)}
            value={fmtPercent(data?.attendanceRate)}
            loading={isLoading}
          />
        </Col>
      </Row>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : pieData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, i) => (
                <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">{t("common.noData", lang)}</Text>}
        />
      )}
    </div>
  );
}

// ─── CRM Tab ─────────────────────────────────────────────────────────────────

function CRMTab({ branchId }: { branchId: string | null }) {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "crm", branchId],
    queryFn: analyticsApi.crm,
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const chartData = useMemo(
    () =>
      (data?.byStage ?? []).map(s => ({
        stage: s.stage,
        label: s.stage.charAt(0).toUpperCase() + s.stage.slice(1),
        value: Number(s.value),
        count: Number(s.count),
      })),
    [data]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Row gutter={[12, 12]}>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.totalLeads", lang)}
            value={fmtNumber(data?.totalLeads)}
            loading={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.winRate", lang)}
            value={fmtPercent(data?.winRate)}
            loading={isLoading}
            valueColor="#10B981"
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.pipelineValue", lang)}
            value={fmtCurrency(data?.pipelineValue)}
            suffix=" SAR"
            loading={isLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KPICard
            title={t("analytics.kpi.avgDealSize", lang)}
            value={fmtCurrency(data?.avgDealSize)}
            suffix=" SAR"
            loading={isLoading}
          />
        </Col>
      </Row>
      {isLoading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin />
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={token.colorBorderSecondary}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              stroke={token.colorTextTertiary}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke={token.colorTextTertiary}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`${fmtCurrency(value)} SAR`]}
              contentStyle={{ borderRadius: 8 }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {chartData.map(e => (
                <Cell
                  key={e.stage}
                  fill={
                    STATUS_COLORS[e.stage.toLowerCase()] ?? token.colorPrimary
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<Text type="secondary">{t("common.noData", lang)}</Text>}
        />
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Analytics() {
  const { t, lang } = useTranslation();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <DashboardLayout
      currentPage="Analytics"
      breadcrumbs={[
        { label: t("REPORTS", lang) },
        { label: t("Analytics", lang) },
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t("Analytics", lang)}
        </Title>

        <Card styles={{ body: { padding: "8px 16px 16px" } }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "sales",
                label: t("analytics.tabs.sales", lang),
                children: <SalesTab branchId={branchId} />,
              },
              {
                key: "inventory",
                label: t("analytics.tabs.inventory", lang),
                children: <InventoryTab branchId={branchId} />,
              },
              {
                key: "hr",
                label: t("analytics.tabs.hr", lang),
                children: <HRTab branchId={branchId} />,
              },
              {
                key: "crm",
                label: t("analytics.tabs.crm", lang),
                children: <CRMTab branchId={branchId} />,
              },
            ]}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
