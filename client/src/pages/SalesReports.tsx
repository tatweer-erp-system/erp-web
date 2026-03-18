/**
 * Sales Reports page with real API data.
 * Follows the CashAccounts.tsx design pattern exactly.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback } from "react";

import {
  Card,
  Row,
  Col,
  Grid,
  Button,
  Typography,
  Tag,
  Statistic,
  DatePicker,
  Select,
  Tooltip,
  Table,
  Dropdown,
  Space,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  FileTextOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { SalesOrderStatus } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { getSalesSummary } from "@/api/endpoints/sales-orders.api";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Types ────────────────────────────────────────────────────────────────────

type StatusBreakdown = {
  status: string;
  count: number;
  totalAmount: number;
};

type SalesSummaryData = {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  byStatus: StatusBreakdown[];
};

// ── Status color map ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [SalesOrderStatus.DRAFT]: "blue",
  [SalesOrderStatus.CONFIRMED]: "gold",
  [SalesOrderStatus.DONE]: "green",
  [SalesOrderStatus.CANCELLED]: "default",
};

const STATUS_ICON_COLOR: Record<string, string> = {
  [SalesOrderStatus.DRAFT]: "#3b82f6",
  [SalesOrderStatus.CONFIRMED]: "#f59e0b",
  [SalesOrderStatus.DONE]: "#10b981",
  [SalesOrderStatus.CANCELLED]: "#6b7280",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function SalesReports() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // ── Filter State ──────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [branchFilter, setBranchFilter] = useState<string | undefined>(
    undefined
  );

  // ── Query params ──────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (dateRange?.[0]) p.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) p.dateTo = dateRange[1].format("YYYY-MM-DD");
    if (statusFilter) p.status = statusFilter;
    if (branchFilter) p.branchId = branchFilter;
    return p;
  }, [dateRange, statusFilter, branchFilter]);

  // ── Query ─────────────────────────────────────────────────────────────
  const {
    data: summaryRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.SALES_SUMMARY, queryParams],
    queryFn: () => getSalesSummary(queryParams),
    staleTime: 60_000,
  });

  const summary: SalesSummaryData = useMemo(() => {
    const d = (summaryRaw as unknown as Record<string, unknown>)?.data as
      | SalesSummaryData
      | undefined;
    return {
      totalOrders: d?.totalOrders ?? 0,
      totalRevenue: Number(d?.totalRevenue ?? 0),
      avgOrderValue: Number(d?.avgOrderValue ?? 0),
      byStatus: d?.byStatus ?? [],
    };
  }, [summaryRaw]);

  // ── Reset filters ─────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setDateRange(null);
    setStatusFilter(undefined);
    setBranchFilter(undefined);
  }, []);

  const hasFilters = !!(dateRange || statusFilter || branchFilter);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("REPORTS", lang), href: "#" },
    { label: t("salesReports.title", lang) },
  ];

  // ── KPI cards ─────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: t("salesReports.totalOrders", lang),
      value: summary.totalOrders,
      prefix: "",
      suffix: "",
      icon: <ShoppingCartOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("salesReports.totalRevenue", lang),
      value: summary.totalRevenue,
      prefix: "",
      suffix: " SAR",
      icon: <DollarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("salesReports.avgOrderValue", lang),
      value: summary.avgOrderValue,
      prefix: "",
      suffix: " SAR",
      icon: <BarChartOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("salesReports.ordersByStatus", lang),
      value: summary.byStatus.length,
      prefix: "",
      suffix: ` ${t("salesReports.statuses", lang)}`,
      icon: <FileTextOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  // ── Status breakdown columns ─────────────────────────────────────────
  const breakdownColumns: TableColumnsType<StatusBreakdown> = useMemo(
    () => [
      {
        title: t("common.status", lang),
        dataIndex: "status",
        width: 150,
        render: (v: string) => (
          <Tag
            color={STATUS_COLOR[v] ?? "default"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v}
          </Tag>
        ),
      },
      {
        title: t("salesReports.count", lang),
        dataIndex: "count",
        width: 120,
        align: "end" as const,
        render: (v: number) => Number(v ?? 0).toLocaleString(),
      },
      {
        title: t("salesReports.totalAmount", lang),
        dataIndex: "totalAmount",
        width: 180,
        align: "end" as const,
        render: (v: number) => (
          <Text strong className="font-mono">
            {Number(v ?? 0).toLocaleString("en-SA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            SAR
          </Text>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <DashboardLayout currentPage="SalesReports" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. KPI Stats Row ─────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {kpiCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <div className="flex justify-between items-start">
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {s.title}
                    </Text>
                    <Statistic
                      value={s.value}
                      prefix={s.prefix || undefined}
                      suffix={s.suffix || undefined}
                      precision={s.suffix === " SAR" ? 2 : 0}
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

        {/* ── 2. Toolbar ──────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={[
                  t("common.dateFrom", lang),
                  t("common.dateTo", lang),
                ]}
                allowClear
                style={{ borderRadius: 8 }}
              />
              <Select
                placeholder={t("common.status", lang)}
                value={statusFilter}
                onChange={setStatusFilter}
                allowClear
                style={{ width: 150 }}
                options={[
                  {
                    value: SalesOrderStatus.DRAFT,
                    label: t("salesReports.draft", lang),
                  },
                  {
                    value: SalesOrderStatus.CONFIRMED,
                    label: t("salesReports.confirmed", lang),
                  },
                  {
                    value: SalesOrderStatus.DONE,
                    label: t("salesReports.done", lang),
                  },
                  {
                    value: SalesOrderStatus.CANCELLED,
                    label: t("salesReports.cancelledLabel", lang),
                  },
                ]}
              />
              {hasFilters && (
                <Button type="link" size="small" onClick={resetFilters}>
                  {t("salesReports.clearFilters", lang)}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Tooltip title={t("seq.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    { key: "csv", label: "CSV", icon: <ExportOutlined /> },
                    { key: "excel", label: "Excel", icon: <ExportOutlined /> },
                    { key: "pdf", label: "PDF", icon: <ExportOutlined /> },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  {t("products.export", lang)}
                </Button>
              </Dropdown>
            </div>
          </div>
        </Card>

        {/* ── 3. Status Breakdown Cards ──────────────────────────────── */}
        {summary.byStatus.length > 0 && (
          <Row gutter={[16, 16]}>
            {summary.byStatus.map(s => (
              <Col key={s.status} xs={24} sm={12} lg={6}>
                <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <Tag
                        color={STATUS_COLOR[s.status] ?? "default"}
                        style={{
                          borderRadius: 20,
                          padding: "2px 10px",
                          marginBottom: 8,
                        }}
                      >
                        {s.status}
                      </Tag>
                      <div className="mt-1">
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, display: "block" }}
                        >
                          {t("salesReports.count", lang)}
                        </Text>
                        <Text strong style={{ fontSize: 20 }}>
                          {Number(s.count ?? 0).toLocaleString()}
                        </Text>
                      </div>
                      <div className="mt-2">
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, display: "block" }}
                        >
                          {t("salesReports.totalAmount", lang)}
                        </Text>
                        <Text
                          strong
                          className="font-mono"
                          style={{
                            fontSize: 16,
                            color: STATUS_ICON_COLOR[s.status] ?? "#6b7280",
                          }}
                        >
                          {Number(s.totalAmount ?? 0).toLocaleString("en-SA", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          SAR
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* ── 4. Status Breakdown Table ──────────────────────────────── */}
        <Card
          size="small"
          title={t("salesReports.statusBreakdown", lang)}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="status"
            columns={breakdownColumns}
            dataSource={summary.byStatus}
            loading={isLoading}
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{ emptyText: <EmptyState /> }}
            summary={() => {
              if (summary.byStatus.length === 0) return null;
              const totalCount = summary.byStatus.reduce(
                (sum, s) => sum + Number(s.count ?? 0),
                0
              );
              const totalAmt = summary.byStatus.reduce(
                (sum, s) => sum + Number(s.totalAmount ?? 0),
                0
              );
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>{t("salesReports.total", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="end">
                      <Text strong>{totalCount.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="end">
                      <Text strong className="font-mono">
                        {totalAmt.toLocaleString("en-SA", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        SAR
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
