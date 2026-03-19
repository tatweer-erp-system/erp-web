/**
 * Tax Reports page.
 * Fetches VAT filing data from GET /reporting/tax and displays
 * KPI cards, stacked bar chart, and a filing detail table.
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
  PercentageOutlined,
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
  Legend,
} from "recharts";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  getTaxReport,
  exportReport,
  type TaxPeriod,
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

const FILING_TAG_COLORS: Record<string, string> = {
  filed: "success",
  pending: "warning",
  overdue: "error",
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
  valueColor,
  description,
}: {
  title: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  loading?: boolean;
  valueColor?: string;
  description?: string;
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
        {description && (
          <Text
            type="secondary"
            style={{ fontSize: 11, marginTop: 4, display: "block" }}
          >
            {description}
          </Text>
        )}
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

export default function TaxReports() {
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
    queryKey: [QUERY_KEYS.TAX_REPORT, startDate, endDate, branchId],
    queryFn: () =>
      getTaxReport({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const report = response?.data as
    | {
        periods: TaxPeriod[];
        summary: {
          totalSalesTax: number;
          totalPurchaseTax: number;
          netPayable: number;
        };
      }
    | undefined;

  const periods = report?.periods ?? [];
  const summary = report?.summary;
  const hasData = periods.length > 0;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(
    () =>
      periods.map(p => ({
        period: p.period,
        outputVat: Number(p.salesTax),
        inputVat: Number(p.purchaseTax),
        netVat: Number(p.netTax),
      })),
    [periods]
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

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumnsType<TaxPeriod> = useMemo(
    () => [
      {
        title: t("taxReports.period", lang),
        dataIndex: "period",
        key: "period",
        width: 160,
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("taxReports.outputVat", lang),
        dataIndex: "salesTax",
        key: "salesTax",
        width: 150,
        align: "end" as const,
        render: (v: number) => (
          <Text style={{ fontFamily: "monospace", color: "#10B981" }}>
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("taxReports.inputVat", lang),
        dataIndex: "purchaseTax",
        key: "purchaseTax",
        width: 150,
        align: "end" as const,
        render: (v: number) => (
          <Text style={{ fontFamily: "monospace", color: "#EF4444" }}>
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("taxReports.netVat", lang),
        dataIndex: "netTax",
        key: "netTax",
        width: 150,
        align: "end" as const,
        sorter: (a: TaxPeriod, b: TaxPeriod) =>
          Number(a.netTax) - Number(b.netTax),
        render: (v: number) => (
          <Text strong style={{ fontFamily: "monospace" }}>
            {fmtCurrency(v)} SAR
          </Text>
        ),
      },
      {
        title: t("taxReports.status", lang),
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (v: string) => (
          <Tag
            color={FILING_TAG_COLORS[v?.toLowerCase()] ?? "default"}
            style={{ textTransform: "capitalize" }}
          >
            {t(`taxReports.${v?.toLowerCase()}`, lang)}
          </Tag>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <DashboardLayout
      currentPage="Tax Reports"
      breadcrumbs={[
        { label: t("REPORTS", lang) },
        { label: t("taxReports.title", lang) },
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
              {t("taxReports.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("taxReports.subtitle", lang)}
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
              title={t("taxReports.totalOutputVat", lang)}
              value={fmtCurrency(summary?.totalSalesTax)}
              suffix=" SAR"
              icon={<DollarOutlined />}
              iconColor="#10B981"
              iconBg="#10B98115"
              loading={isLoading}
              description={t("taxReports.collectedFromSales", lang)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("taxReports.totalInputVat", lang)}
              value={fmtCurrency(summary?.totalPurchaseTax)}
              suffix=" SAR"
              icon={<DollarOutlined />}
              iconColor="#EF4444"
              iconBg="#EF444415"
              loading={isLoading}
              valueColor="#EF4444"
              description={t("taxReports.paidOnPurchases", lang)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <KPICard
              title={t("taxReports.netTaxLiability", lang)}
              value={fmtCurrency(summary?.netPayable)}
              suffix=" SAR"
              icon={<PercentageOutlined />}
              iconColor="#3B82F6"
              iconBg="#3B82F615"
              loading={isLoading}
              description={t("taxReports.outputMinusInput", lang)}
            />
          </Col>
        </Row>

        {/* ── Chart: VAT by Period ────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Text
            strong
            style={{ fontSize: 15, display: "block", marginBottom: 16 }}
          >
            {t("taxReports.filingDetails", lang)}
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
                  dataKey="period"
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
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="outputVat"
                  name={t("taxReports.outputVat", lang)}
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="inputVat"
                  name={t("taxReports.inputVat", lang)}
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("taxReports.noData", lang)}</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>

        {/* ── Table: Filing Details ───────────────────────────────── */}
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
              {t("taxReports.filingDetails", lang)}
            </Text>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <Table
              rowKey="period"
              size="small"
              dataSource={periods}
              columns={columns}
              pagination={false}
              scroll={{ x: "max-content" }}
              summary={() => {
                if (!summary) return null;
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <Text strong>{t("agingReports.total", lang)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="end">
                        <Text
                          style={{ fontFamily: "monospace", color: "#10B981" }}
                        >
                          {fmtCurrency(summary.totalSalesTax)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2} align="end">
                        <Text
                          style={{ fontFamily: "monospace", color: "#EF4444" }}
                        >
                          {fmtCurrency(summary.totalPurchaseTax)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="end">
                        <Text strong style={{ fontFamily: "monospace" }}>
                          {fmtCurrency(summary.netPayable)} SAR
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("taxReports.noData", lang)}</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
