/**
 * Sales Reports page.
 * Fetches sales breakdown from GET /reporting/sales and displays
 * KPI cards, bar chart by status, and a detail table.
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
  BarChartOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
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
} from "recharts";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  getSalesReport,
  exportReport,
  type SalesReportRow,
} from "@/api/endpoints/reporting.api";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

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

const STATUS_COLORS: Record<string, string> = {
  draft: "#94A3B8",
  confirmed: "#3B82F6",
  invoiced: "#8B5CF6",
  delivered: "#10B981",
  completed: "#059669",
  cancelled: "#EF4444",
  paid: "#10B981",
};

const STATUS_TAG_COLORS: Record<string, string> = {
  draft: "default",
  confirmed: "processing",
  invoiced: "purple",
  delivered: "success",
  completed: "success",
  cancelled: "error",
  paid: "success",
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  suffix,
  icon,
  iconBg,
  iconColor,
  loading,
}: {
  title: string;
  value: string | number;
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
              suffix={suffix}
              styles={{ content: { fontSize: 22, lineHeight: 1 } }}
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SalesReports() {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.SALES_REPORT, startDate, endDate, branchId],
    queryFn: () =>
      getSalesReport({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const report = response?.data as
    | {
        data: SalesReportRow[];
        summary: {
          totalOrders: number;
          totalRevenue: number;
          avgOrderValue: number;
        };
      }
    | undefined;

  const rows = report?.data ?? [];
  const summary = report?.summary;
  const hasData = rows.length > 0;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(
    () =>
      rows.map(row => ({
        status: row.status,
        label: row.status.charAt(0).toUpperCase() + row.status.slice(1),
        revenue: Number(row.totalAmount),
        orders: Number(row.orderCount),
      })),
    [rows]
  );

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = async (format: "pdf" | "xlsx") => {
    await exportReport({
      reportType: "sales",
      format,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumnsType<SalesReportRow> = useMemo(
    () => [
      {
        title: t("common.status", lang),
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (v: string) => (
          <Tag
            color={STATUS_TAG_COLORS[v?.toLowerCase()] ?? "default"}
            style={{ textTransform: "capitalize" }}
          >
            {v}
          </Tag>
        ),
      },
      {
        title: t("salesReports.count", lang),
        dataIndex: "orderCount",
        key: "orderCount",
        width: 140,
        align: "end" as const,
        sorter: (a: SalesReportRow, b: SalesReportRow) =>
          Number(a.orderCount) - Number(b.orderCount),
        render: (v: number) => (
          <Text strong style={{ fontFamily: "monospace" }}>
            {fmtNumber(v)}
          </Text>
        ),
      },
      {
        title: t("salesReports.totalAmount", lang),
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 180,
        align: "end" as const,
        sorter: (a: SalesReportRow, b: SalesReportRow) =>
          Number(a.totalAmount) - Number(b.totalAmount),
        render: (v: number) => (
          <Text strong style={{ fontFamily: "monospace" }}>
            {fmtCurrency(v)} SAR
          </Text>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <DashboardLayout
      currentPage="Sales Reports"
      breadcrumbs={[
        { label: t("REPORTS", lang) },
        { label: t("salesReports.title", lang) },
      ]}
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
            {t("salesReports.title", lang)}
          </Title>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={val =>
                setDateRange(val as [Dayjs | null, Dayjs | null] | null)
              }
              placeholder={[
                t("common.dateFrom", lang),
                t("common.dateTo", lang),
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
              {t("common.reload", lang)}
            </Button>
            <Button
              icon={<FilePdfOutlined />}
              onClick={() => handleExport("pdf")}
              disabled={!hasData}
            >
              PDF
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              onClick={() => handleExport("xlsx")}
              disabled={!hasData}
            >
              Excel
            </Button>
          </Space>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("salesReports.totalOrders", lang)}
              value={fmtNumber(summary?.totalOrders)}
              icon={<ShoppingCartOutlined />}
              iconColor="#3B82F6"
              iconBg="#3B82F615"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("salesReports.totalRevenue", lang)}
              value={fmtCurrency(summary?.totalRevenue)}
              suffix=" SAR"
              icon={<DollarOutlined />}
              iconColor="#10B981"
              iconBg="#10B98115"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("salesReports.avgOrderValue", lang)}
              value={fmtCurrency(summary?.avgOrderValue)}
              suffix=" SAR"
              icon={<BarChartOutlined />}
              iconColor="#8B5CF6"
              iconBg="#8B5CF615"
              loading={isLoading}
            />
          </Col>
        </Row>

        {/* ── Chart: Revenue by Status ────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Text
            strong
            style={{ fontSize: 15, display: "block", marginBottom: 16 }}
          >
            {t("salesReports.ordersByStatus", lang)}
          </Text>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
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
                  formatter={(value: number) => [
                    `${fmtCurrency(value)} SAR`,
                    t("salesReports.totalAmount", lang),
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {chartData.map(entry => (
                    <Cell
                      key={entry.status}
                      fill={
                        STATUS_COLORS[entry.status.toLowerCase()] ??
                        token.colorPrimary
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("common.noData", lang)}</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>

        {/* ── Table: Breakdown by Status ──────────────────────────── */}
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
            }}
          >
            <Text strong style={{ fontSize: 15 }}>
              {t("salesReports.statusBreakdown", lang)}
            </Text>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <Table
              rowKey="status"
              size="small"
              dataSource={rows}
              columns={columns}
              pagination={false}
              scroll={{ x: "max-content" }}
              summary={() => {
                if (!summary) return null;
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <Text strong>{t("salesReports.total", lang)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="end">
                        <Text strong style={{ fontFamily: "monospace" }}>
                          {fmtNumber(summary.totalOrders)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="end">
                        <Text strong style={{ fontFamily: "monospace" }}>
                          {fmtCurrency(summary.totalRevenue)} SAR
                        </Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("common.noData", lang)}</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
