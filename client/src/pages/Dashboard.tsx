/**
 * Executive Dashboard page.
 * Fetches KPIs from GET /reporting/dashboard and displays stat cards,
 * module quick stats, and recent activity.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BankOutlined,
  ReloadOutlined,
  RightOutlined,
  WalletOutlined,
  CreditCardOutlined,
  UserOutlined,
  InboxOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { QUERY_KEYS } from "@/constants/queryKeys";
import apiClient from "@/lib/api";
import { Link } from "react-router-dom";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ─── API ──────────────────────────────────────────────────────────────────────

interface DashboardData {
  // Primary KPIs
  totalRevenue?: number;
  totalOrders?: number;
  totalCustomers?: number;
  totalProducts?: number;

  // Financial summary
  accountsReceivable?: number;
  accountsPayable?: number;
  cashBalance?: number;
  netProfit?: number;

  // Sales module stats
  draftOrders?: number;
  confirmedOrders?: number;
  completedOrders?: number;
  pendingInvoices?: number;

  // Inventory module stats
  lowStockAlerts?: number;
  totalStockValue?: number;

  // HR module stats
  activeEmployees?: number;
  pendingLeaves?: number;

  // Recent activity
  recentActivity?: RecentActivityItem[];

  // Currency
  currency?: string;
}

interface RecentActivityItem {
  id: string;
  date: string;
  type: string;
  reference: string;
  amount: number;
  status: string;
}

const dashboardApi = {
  get: (params?: { dateFrom?: string; dateTo?: string; branchId?: string }) =>
    apiClient
      .get("/reporting/dashboard", { params })
      .then(r => r.data.data as DashboardData),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  prefix,
  suffix,
  icon,
  iconBg,
  iconColor,
  loading,
}: {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
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
      <div style={{ minWidth: 0, flex: 1 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {title}
        </Text>
        <div style={{ marginTop: 6 }}>
          {loading ? (
            <Spin size="small" />
          ) : (
            <Statistic
              value={value}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{ fontSize: 22, lineHeight: 1 }}
            />
          )}
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
          color: iconColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function ModuleStatCard({
  title,
  icon,
  iconColor,
  items,
  loading,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  items: { label: string; value: string | number }[];
  loading?: boolean;
}) {
  return (
    <Card
      size="small"
      styles={{ body: { padding: "16px 20px" } }}
      style={{ height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ color: iconColor, fontSize: 16 }}>{icon}</span>
        <Text strong style={{ fontSize: 14 }}>
          {title}
        </Text>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin size="small" />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map(item => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                {item.label}
              </Text>
              <Text strong style={{ fontSize: 14, fontFamily: "monospace" }}>
                {item.value}
              </Text>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number | undefined, _currency = "SAR"): string {
  if (value == null) return "0.00";
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatNumber(value: number | undefined): string | number {
  if (value == null) return 0;
  return Number(value).toLocaleString();
}

const statusTagColor: Record<string, string> = {
  completed: "success",
  done: "success",
  confirmed: "processing",
  pending: "warning",
  draft: "default",
  cancelled: "error",
  paid: "success",
  overdue: "error",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const dateFrom = dateRange?.[0]?.format("YYYY-MM-DD");
  const dateTo = dateRange?.[1]?.format("YYYY-MM-DD");

  // ── Query ────────────────────────────────────────────────────────────────
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD, dateFrom, dateTo, branchId],
    queryFn: () =>
      dashboardApi.get({
        dateFrom: dateFrom ?? undefined,
        dateTo: dateTo ?? undefined,
        branchId: branchId ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const currency = data?.currency ?? "SAR";
  const hasData = !!data && !isError;

  // ── Primary KPI card configs ─────────────────────────────────────────────
  const primaryKpis = useMemo(
    () => [
      {
        title: t("dashboard.totalRevenue", lang),
        value: formatCurrency(data?.totalRevenue, currency),
        suffix: ` ${currency}`,
        icon: <DollarOutlined />,
        iconColor: "#10B981",
        iconBg: "#10B98115",
      },
      {
        title: t("dashboard.totalOrders", lang),
        value: formatNumber(data?.totalOrders),
        icon: <ShoppingCartOutlined />,
        iconColor: "#3B82F6",
        iconBg: "#3B82F615",
      },
      {
        title: t("dashboard.totalCustomers", lang),
        value: formatNumber(data?.totalCustomers),
        icon: <TeamOutlined />,
        iconColor: "#8B5CF6",
        iconBg: "#8B5CF615",
      },
      {
        title: t("dashboard.totalProducts", lang),
        value: formatNumber(data?.totalProducts),
        icon: <AppstoreOutlined />,
        iconColor: "#14B8A6",
        iconBg: "#14B8A615",
      },
    ],
    [data, currency, t, lang]
  );

  // ── Financial Summary card configs ───────────────────────────────────────
  const financialKpis = useMemo(
    () => [
      {
        title: t("dashboard.accountsReceivable", lang),
        value: formatCurrency(data?.accountsReceivable, currency),
        suffix: ` ${currency}`,
        icon: <WalletOutlined />,
        iconColor: "#F97316",
        iconBg: "#F9731615",
      },
      {
        title: t("dashboard.accountsPayable", lang),
        value: formatCurrency(data?.accountsPayable, currency),
        suffix: ` ${currency}`,
        icon: <CreditCardOutlined />,
        iconColor: "#EF4444",
        iconBg: "#EF444415",
      },
      {
        title: t("dashboard.cashBalance", lang),
        value: formatCurrency(data?.cashBalance, currency),
        suffix: ` ${currency}`,
        icon: <BankOutlined />,
        iconColor: "#10B981",
        iconBg: "#10B98115",
      },
      {
        title: t("dashboard.netProfit", lang),
        value: formatCurrency(data?.netProfit, currency),
        suffix: ` ${currency}`,
        icon: <BarChartOutlined />,
        iconColor: "#3B82F6",
        iconBg: "#3B82F615",
      },
    ],
    [data, currency, t, lang]
  );

  // ── Recent Activity columns ──────────────────────────────────────────────
  const activityColumns: TableColumnsType<RecentActivityItem> = useMemo(
    () => [
      {
        title: t("dashboard.date", lang),
        dataIndex: "date",
        width: 140,
        render: (v: string) => (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {v}
          </Text>
        ),
      },
      {
        title: t("dashboard.type", lang),
        dataIndex: "type",
        width: 100,
        render: (v: string) => {
          const typeKey = `dashboard.${v}` as string;
          return (
            <Tag style={{ fontSize: 11, textTransform: "capitalize" }}>
              {t(typeKey, lang) !== typeKey ? t(typeKey, lang) : v}
            </Tag>
          );
        },
      },
      {
        title: t("dashboard.reference", lang),
        dataIndex: "reference",
        width: 160,
        render: (v: string) => (
          <Text strong style={{ fontSize: 12 }}>
            {v}
          </Text>
        ),
      },
      {
        title: t("dashboard.amount", lang),
        dataIndex: "amount",
        width: 140,
        align: "end" as const,
        render: (v: number) => (
          <Text strong style={{ fontSize: 12, fontFamily: "monospace" }}>
            {formatCurrency(v, currency)} {currency}
          </Text>
        ),
      },
      {
        title: t("dashboard.status", lang),
        dataIndex: "status",
        width: 120,
        render: (v: string) => (
          <Tag
            color={statusTagColor[v?.toLowerCase()] ?? "default"}
            style={{ fontSize: 11, textTransform: "capitalize" }}
          >
            {v}
          </Tag>
        ),
      },
    ],
    [t, lang, currency]
  );

  const recentActivity = data?.recentActivity ?? [];

  // ── Empty state component ────────────────────────────────────────────────
  const NoDataState = () => (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Text type="secondary">{t("dashboard.noData", lang)}</Text>
        }
      />
    </div>
  );

  return (
    <DashboardLayout
      currentPage="Dashboard"
      breadcrumbs={[{ label: t("dashboard.title", lang) }]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {t("dashboard.title", lang)}
          </Title>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={val =>
                setDateRange(val as [Dayjs | null, Dayjs | null] | null)
              }
              placeholder={[
                t("dashboard.dateFrom", lang),
                t("dashboard.dateTo", lang),
              ]}
              allowClear
              size="middle"
              style={{ borderRadius: 8 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              {t("dashboard.reload", lang)}
            </Button>
          </Space>
        </div>

        {/* ── Row 1: Primary KPI Cards ───────────────────────────── */}
        <Row gutter={[16, 16]}>
          {primaryKpis.map(kpi => (
            <Col xs={24} sm={12} md={6} key={kpi.title}>
              <KPICard {...kpi} loading={isLoading} />
            </Col>
          ))}
        </Row>

        {/* ── Row 2: Financial Summary Cards ─────────────────────── */}
        <Row gutter={[16, 16]}>
          {financialKpis.map(kpi => (
            <Col xs={24} sm={12} md={6} key={kpi.title}>
              <KPICard {...kpi} loading={isLoading} />
            </Col>
          ))}
        </Row>

        {/* ── Row 3: Module Quick Stats ──────────────────────────── */}
        <Row gutter={[16, 16]}>
          {/* Sales */}
          <Col xs={24} md={8}>
            <ModuleStatCard
              title={t("dashboard.salesOverview", lang)}
              icon={<ShoppingCartOutlined />}
              iconColor="#3B82F6"
              loading={isLoading}
              items={
                hasData
                  ? [
                      {
                        label: t("dashboard.draftOrders", lang),
                        value: formatNumber(data?.draftOrders),
                      },
                      {
                        label: t("dashboard.confirmedOrders", lang),
                        value: formatNumber(data?.confirmedOrders),
                      },
                      {
                        label: t("dashboard.completedOrders", lang),
                        value: formatNumber(data?.completedOrders),
                      },
                      {
                        label: t("dashboard.pendingInvoices", lang),
                        value: formatNumber(data?.pendingInvoices),
                      },
                    ]
                  : []
              }
            />
          </Col>

          {/* Inventory */}
          <Col xs={24} md={8}>
            <ModuleStatCard
              title={t("dashboard.inventoryOverview", lang)}
              icon={<InboxOutlined />}
              iconColor="#F59E0B"
              loading={isLoading}
              items={
                hasData
                  ? [
                      {
                        label: t("dashboard.lowStockAlerts", lang),
                        value: formatNumber(data?.lowStockAlerts),
                      },
                      {
                        label: t("dashboard.totalStockValue", lang),
                        value: `${formatCurrency(data?.totalStockValue, currency)} ${currency}`,
                      },
                    ]
                  : []
              }
            />
          </Col>

          {/* HR */}
          <Col xs={24} md={8}>
            <ModuleStatCard
              title={t("dashboard.hrOverview", lang)}
              icon={<UserOutlined />}
              iconColor="#8B5CF6"
              loading={isLoading}
              items={
                hasData
                  ? [
                      {
                        label: t("dashboard.activeEmployees", lang),
                        value: formatNumber(data?.activeEmployees),
                      },
                      {
                        label: t("dashboard.pendingLeaves", lang),
                        value: formatNumber(data?.pendingLeaves),
                      },
                    ]
                  : []
              }
            />
          </Col>
        </Row>

        {/* ── Row 4: Recent Activity ─────────────────────────────── */}
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
              {t("dashboard.recentActivity", lang)}
            </Text>
            <Link to="/sales/orders">
              <Button
                type="link"
                size="small"
                style={{ padding: 0, fontSize: 12 }}
              >
                {t("dashboard.viewAll", lang)}{" "}
                <RightOutlined style={{ fontSize: 10 }} />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : recentActivity.length > 0 ? (
            <Table
              rowKey="id"
              size="small"
              dataSource={recentActivity}
              columns={activityColumns}
              pagination={false}
              scroll={{ x: "max-content" }}
              style={{ fontSize: 12 }}
            />
          ) : (
            <NoDataState />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
