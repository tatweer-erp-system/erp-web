/**
 * Financial Reports page.
 * Fetches financial data from GET /reporting/financial and displays
 * KPI cards, monthly trend line chart, and a detail table.
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
  BarChartOutlined,
  LineChartOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  getFinancialReport,
  exportReport,
  type FinancialReportRow,
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

function fmtMonth(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  suffix,
  icon,
  iconBg,
  iconColor,
  loading,
  valueColor,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
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
              styles={{ content: { fontSize: 22, lineHeight: 1, color: valueColor } }}
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

export default function FinancialReports() {
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
    queryKey: [QUERY_KEYS.FINANCIAL_REPORT, startDate, endDate, branchId],
    queryFn: () =>
      getFinancialReport({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const report = response?.data as
    | {
        data: FinancialReportRow[];
        summary: {
          totalRevenue: number;
          cancelledAmount: number;
          totalTransactions: number;
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
        month: fmtMonth(row.month),
        amount: Number(row.amount),
        orders: Number(row.orderCount),
      })),
    [rows]
  );

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = async (format: "pdf" | "xlsx") => {
    await exportReport({
      reportType: "financial",
      format,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
  };

  // Net revenue (total - cancelled)
  const netRevenue = summary
    ? Number(summary.totalRevenue) - Number(summary.cancelledAmount)
    : undefined;

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumnsType<FinancialReportRow> = useMemo(
    () => [
      {
        title: t("financialReports.month", lang),
        dataIndex: "month",
        key: "month",
        width: 160,
        render: (v: string) => <Text strong>{fmtMonth(v)}</Text>,
      },
      {
        title: t("financialReports.transactions", lang),
        dataIndex: "orderCount",
        key: "orderCount",
        width: 140,
        align: "end" as const,
        sorter: (a: FinancialReportRow, b: FinancialReportRow) =>
          Number(a.orderCount) - Number(b.orderCount),
        render: (v: number) => (
          <Text strong style={{ fontFamily: "monospace" }}>
            {fmtNumber(v)}
          </Text>
        ),
      },
      {
        title: t("financialReports.amount", lang),
        dataIndex: "amount",
        key: "amount",
        width: 180,
        align: "end" as const,
        sorter: (a: FinancialReportRow, b: FinancialReportRow) =>
          Number(a.amount) - Number(b.amount),
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
      currentPage="Financial Reports"
      breadcrumbs={[
        { label: t("REPORTS", lang) },
        { label: t("financialReports.title", lang) },
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
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {t("financialReports.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("financialReports.subtitle", lang)}
            </Text>
          </div>
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
              title={t("financialReports.totalRevenue", lang)}
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
              title={t("financialReports.cancelledAmount", lang)}
              value={fmtCurrency(summary?.cancelledAmount)}
              suffix=" SAR"
              icon={<CloseCircleOutlined />}
              iconColor="#EF4444"
              iconBg="#EF444415"
              loading={isLoading}
              valueColor="#EF4444"
            />
          </Col>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("financialReports.netRevenue", lang)}
              value={fmtCurrency(netRevenue)}
              suffix=" SAR"
              icon={<BarChartOutlined />}
              iconColor="#3B82F6"
              iconBg="#3B82F615"
              loading={isLoading}
            />
          </Col>
        </Row>

        {/* ── Chart: Monthly Revenue Trend ────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Text
            strong
            style={{ fontSize: 15, display: "block", marginBottom: 16 }}
          >
            {t("financialReports.monthlyTrend", lang)}
          </Text>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={token.colorBorderSecondary}
                />
                <XAxis
                  dataKey="month"
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
                    t("financialReports.amount", lang),
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={token.colorPrimary}
                  strokeWidth={2}
                  dot={{ r: 4, fill: token.colorPrimary }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
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

        {/* ── Table: Monthly Breakdown ────────────────────────────── */}
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
              {t("financialReports.monthlyBreakdown", lang)}
            </Text>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <Table
              rowKey="month"
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
                        <Text strong>{t("financialReports.total", lang)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="end">
                        <Text strong style={{ fontFamily: "monospace" }}>
                          {fmtNumber(summary.totalTransactions)}
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
