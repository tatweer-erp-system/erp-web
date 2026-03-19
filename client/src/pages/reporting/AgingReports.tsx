/**
 * Aging Reports page.
 * Fetches AR/AP aging data from GET /reporting/aging and displays
 * KPI cards with separate receivables and payables aging tables.
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
  Tabs,
  Tag,
  Typography,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  DollarOutlined,
  WalletOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  WarningOutlined,
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
  getAgingReport,
  exportReport,
  type AgingBucket,
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

const BUCKET_COLORS = {
  current: "#10B981",
  days1to30: "#3B82F6",
  days31to60: "#F59E0B",
  days61to90: "#F97316",
  over90: "#EF4444",
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

// ─── Aging Table Builder ─────────────────────────────────────────────────────

function useAgingColumns(
  t: (key: string, lang: "en" | "ar") => string,
  lang: "en" | "ar"
): TableColumnsType<AgingBucket> {
  return useMemo(
    () => [
      {
        title: t("agingReports.partnerName", lang),
        dataIndex: "partnerName",
        key: "partnerName",
        width: 200,
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("agingReports.current", lang),
        dataIndex: "current",
        key: "current",
        width: 120,
        align: "end" as const,
        render: (v: number) => (
          <Text
            style={{ fontFamily: "monospace", color: BUCKET_COLORS.current }}
          >
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue31_60", lang),
        dataIndex: "days31to60",
        key: "days31to60",
        width: 120,
        align: "end" as const,
        render: (v: number) => (
          <Text
            style={{
              fontFamily: "monospace",
              color: Number(v) > 0 ? BUCKET_COLORS.days31to60 : undefined,
            }}
          >
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue61_90", lang),
        dataIndex: "days61to90",
        key: "days61to90",
        width: 120,
        align: "end" as const,
        render: (v: number) => (
          <Text
            style={{
              fontFamily: "monospace",
              color: Number(v) > 0 ? BUCKET_COLORS.days61to90 : undefined,
            }}
          >
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue90plus", lang),
        dataIndex: "over90",
        key: "over90",
        width: 120,
        align: "end" as const,
        render: (v: number) => (
          <Text
            style={{
              fontFamily: "monospace",
              color: Number(v) > 0 ? BUCKET_COLORS.over90 : undefined,
            }}
          >
            {fmtCurrency(v)}
          </Text>
        ),
      },
      {
        title: t("agingReports.total", lang),
        dataIndex: "total",
        key: "total",
        width: 140,
        align: "end" as const,
        sorter: (a: AgingBucket, b: AgingBucket) =>
          Number(a.total) - Number(b.total),
        render: (v: number) => (
          <Text strong style={{ fontFamily: "monospace" }}>
            {fmtCurrency(v)} SAR
          </Text>
        ),
      },
      {
        title: t("agingReports.risk", lang),
        key: "risk",
        width: 100,
        render: (_: unknown, record: AgingBucket) => {
          const over60 = Number(record.days61to90) + Number(record.over90);
          const total = Number(record.total);
          if (total === 0) return <Tag color="default">-</Tag>;
          const ratio = over60 / total;
          if (ratio > 0.5)
            return <Tag color="error">{t("agingReports.highRisk", lang)}</Tag>;
          if (ratio > 0.2)
            return (
              <Tag color="warning">{t("agingReports.mediumRisk", lang)}</Tag>
            );
          return <Tag color="success">{t("agingReports.lowRisk", lang)}</Tag>;
        },
      },
    ],
    [t, lang]
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AgingReports() {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [activeTab, setActiveTab] = useState<string>("receivables");

  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: response,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.AGING_REPORT, startDate, endDate, branchId],
    queryFn: () =>
      getAgingReport({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const report = (response as unknown as Record<string, unknown>)?.data as
    | {
        receivables: AgingBucket[];
        payables: AgingBucket[];
        summary: {
          totalReceivables: number;
          totalPayables: number;
          overdueReceivables: number;
          overduePayables: number;
        };
      }
    | undefined;

  const receivables = report?.receivables ?? [];
  const payables = report?.payables ?? [];
  const summary = report?.summary;
  const hasData = receivables.length > 0 || payables.length > 0;

  const columns = useAgingColumns(t, lang);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const buckets = [
      { label: t("agingReports.current", lang), key: "current" as const },
      {
        label: t("agingReports.overdue31_60", lang),
        key: "days31to60" as const,
      },
      {
        label: t("agingReports.overdue61_90", lang),
        key: "days61to90" as const,
      },
      { label: t("agingReports.overdue90plus", lang), key: "over90" as const },
    ];
    return buckets.map(b => ({
      label: b.label,
      receivables: receivables.reduce(
        (sum, r) => sum + Number(r[b.key] ?? 0),
        0
      ),
      payables: payables.reduce((sum, r) => sum + Number(r[b.key] ?? 0), 0),
    }));
  }, [receivables, payables, t, lang]);

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = async (format: "pdf" | "xlsx") => {
    await exportReport({
      reportType: "financial",
      format,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
  };

  return (
    <DashboardLayout
      currentPage="Aging Reports"
      breadcrumbs={[
        { label: t("REPORTS", lang), href: "/reporting" },
        { label: t("agingReports.title", lang) },
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
            {t("agingReports.title", lang)}
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
          <Col xs={24} sm={6}>
            <KPICard
              title={t("agingReports.receivable", lang)}
              value={fmtCurrency(summary?.totalReceivables)}
              suffix=" SAR"
              icon={<WalletOutlined />}
              iconColor="#3B82F6"
              iconBg="#3B82F615"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={t("agingReports.payable", lang)}
              value={fmtCurrency(summary?.totalPayables)}
              suffix=" SAR"
              icon={<CreditCardOutlined />}
              iconColor="#8B5CF6"
              iconBg="#8B5CF615"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={`${t("agingReports.receivable", lang)} — ${t("agingReports.overdue90plus", lang)}`}
              value={fmtCurrency(summary?.overdueReceivables)}
              suffix=" SAR"
              icon={<WarningOutlined />}
              iconColor="#EF4444"
              iconBg="#EF444415"
              loading={isLoading}
              valueColor="#EF4444"
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={`${t("agingReports.payable", lang)} — ${t("agingReports.overdue90plus", lang)}`}
              value={fmtCurrency(summary?.overduePayables)}
              suffix=" SAR"
              icon={<DollarOutlined />}
              iconColor="#F59E0B"
              iconBg="#F59E0B15"
              loading={isLoading}
              valueColor="#F59E0B"
            />
          </Col>
        </Row>

        {/* ── Chart: Aging Buckets ────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Text
            strong
            style={{ fontSize: 15, display: "block", marginBottom: 16 }}
          >
            {t("agingReports.arAging", lang)} vs{" "}
            {t("agingReports.apAging", lang)}
          </Text>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <ResponsiveContainer width="100%" height={300}>
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
                  formatter={(value: number) => [`${fmtCurrency(value)} SAR`]}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                />
                <Legend />
                <Bar
                  dataKey="receivables"
                  name={t("agingReports.receivable", lang)}
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="payables"
                  name={t("agingReports.payable", lang)}
                  fill="#8B5CF6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">{t("agingReports.noData", lang)}</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>

        {/* ── Tabs: Receivables / Payables ────────────────────────── */}
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            overflow: "hidden",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ padding: "0 20px" }}
            items={[
              {
                key: "receivables",
                label: t("agingReports.arAging", lang),
                children: isLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin />
                  </div>
                ) : receivables.length > 0 ? (
                  <Table
                    rowKey="partnerId"
                    size="small"
                    dataSource={receivables}
                    columns={columns}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary">
                        {t("agingReports.noData", lang)}
                      </Text>
                    }
                    style={{ padding: "40px 0" }}
                  />
                ),
              },
              {
                key: "payables",
                label: t("agingReports.apAging", lang),
                children: isLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <Spin />
                  </div>
                ) : payables.length > 0 ? (
                  <Table
                    rowKey="partnerId"
                    size="small"
                    dataSource={payables}
                    columns={columns}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Text type="secondary">
                        {t("agingReports.noData", lang)}
                      </Text>
                    }
                    style={{ padding: "40px 0" }}
                  />
                ),
              },
            ]}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
