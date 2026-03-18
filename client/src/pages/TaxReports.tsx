/**
 * Tax Reports page with real API data.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback } from "react";

import {
  Card,
  Row,
  Col,
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
  notification,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  PercentageOutlined,
  BankOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { FilingStatus } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Types ────────────────────────────────────────────────────────────────────

type TaxPeriodRow = {
  key: string;
  period: string;
  outputVat: number;
  inputVat: number;
  netVat: number;
  status: string;
};

type TaxReportData = {
  totalOutputVat: number;
  totalInputVat: number;
  netTaxLiability: number;
  filingStatus: string;
  periods: TaxPeriodRow[];
};

// ── API ──────────────────────────────────────────────────────────────────────

const taxReportApi = {
  get: (params?: Record<string, string>) =>
    apiClient
      .get("/reporting/tax", { params })
      .then(r => r.data.data as TaxReportData),
};

// ── Status meta ──────────────────────────────────────────────────────────────

function getStatusMeta(
  status: string,
  t: (key: string, lang: "ar" | "en") => string,
  lang: "ar" | "en"
): { color: string; label: string; icon: React.ReactNode } {
  switch (status) {
    case FilingStatus.FILED:
      return {
        color: "success",
        label: t("taxReports.filed", lang),
        icon: <CheckCircleOutlined />,
      };
    case FilingStatus.PENDING:
      return {
        color: "processing",
        label: t("taxReports.pending", lang),
        icon: <ClockCircleOutlined />,
      };
    case FilingStatus.OVERDUE:
      return {
        color: "error",
        label: t("taxReports.overdue", lang),
        icon: <ExclamationCircleOutlined />,
      };
    default:
      return {
        color: "default",
        label: status,
        icon: <FileTextOutlined />,
      };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSAR(n: number): string {
  return Number(n ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TaxReports() {
  const { t, lang, direction } = useTranslation();
  const { token } = antTheme.useToken();
  const isRTL = direction === "rtl";

  // ── Filter State ──────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [quarter, setQuarter] = useState<string | undefined>(undefined);

  // ── Query params ──────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (dateRange?.[0]) p.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) p.dateTo = dateRange[1].format("YYYY-MM-DD");
    if (quarter) p.quarter = quarter;
    return p;
  }, [dateRange, quarter]);

  // ── Query ─────────────────────────────────────────────────────────────
  const {
    data: reportRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TAX_REPORT, queryParams],
    queryFn: async () => {
      try {
        return await taxReportApi.get(queryParams);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const report: TaxReportData = useMemo(() => {
    if (reportRaw) return reportRaw;
    return {
      totalOutputVat: 0,
      totalInputVat: 0,
      netTaxLiability: 0,
      filingStatus: FilingStatus.PENDING,
      periods: [],
    };
  }, [reportRaw]);

  // ── Export handler ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const csv = [
      [
        t("taxReports.period", lang),
        t("taxReports.outputVat", lang),
        t("taxReports.inputVat", lang),
        t("taxReports.netVat", lang),
        t("taxReports.status", lang),
      ],
      ...report.periods.map(p => [
        p.period,
        p.outputVat,
        p.inputVat,
        p.netVat,
        p.status,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "tax-report.csv";
    a.click();
    notification.success({ message: "CSV exported" });
  }, [report, t, lang]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("REPORTS", lang), href: "#" },
    { label: t("taxReports.title", lang) },
  ];

  const hasData =
    report.totalOutputVat > 0 ||
    report.totalInputVat > 0 ||
    report.periods.length > 0;

  // ── KPI cards ─────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: t("taxReports.totalOutputVat", lang),
      value: report.totalOutputVat,
      sub: t("taxReports.collectedFromSales", lang),
      icon: <PercentageOutlined />,
      color: "#EF4444",
    },
    {
      title: t("taxReports.totalInputVat", lang),
      value: report.totalInputVat,
      sub: t("taxReports.paidOnPurchases", lang),
      icon: <BankOutlined />,
      color: "#10B981",
    },
    {
      title: t("taxReports.netTaxLiability", lang),
      value: report.netTaxLiability,
      sub: t("taxReports.outputMinusInput", lang),
      icon: <FileTextOutlined />,
      color: token.colorPrimary,
    },
    {
      title: t("taxReports.filingStatus", lang),
      value: 0,
      displayValue: report.filingStatus,
      sub: "",
      icon: <CalendarOutlined />,
      color: "#F59E0B",
    },
  ];

  // ── Table columns ─────────────────────────────────────────────────────
  const columns: TableColumnsType<TaxPeriodRow> = useMemo(
    () => [
      {
        title: t("taxReports.period", lang),
        dataIndex: "period",
        width: 150,
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("taxReports.outputVat", lang),
        dataIndex: "outputVat",
        align: "end" as const,
        width: 150,
        render: (v: number) => (
          <Text style={{ color: "#EF4444" }}>{fmtSAR(v)}</Text>
        ),
      },
      {
        title: t("taxReports.inputVat", lang),
        dataIndex: "inputVat",
        align: "end" as const,
        width: 150,
        render: (v: number) => (
          <Text style={{ color: "#10B981" }}>{fmtSAR(v)}</Text>
        ),
      },
      {
        title: t("taxReports.netVat", lang),
        dataIndex: "netVat",
        align: "end" as const,
        width: 150,
        sorter: (a: TaxPeriodRow, b: TaxPeriodRow) =>
          (a.netVat ?? 0) - (b.netVat ?? 0),
        render: (v: number) => (
          <Text strong style={{ color: token.colorPrimary }}>
            {fmtSAR(v)}
          </Text>
        ),
      },
      {
        title: t("taxReports.status", lang),
        dataIndex: "status",
        align: "center" as const,
        width: 120,
        render: (v: string) => {
          const meta = getStatusMeta(v, t, lang);
          return (
            <Tag
              icon={meta.icon}
              color={meta.color}
              style={{ borderRadius: 20 }}
            >
              {meta.label}
            </Tag>
          );
        },
      },
    ],
    [t, lang, token]
  );

  return (
    <DashboardLayout currentPage="TaxReports" breadcrumbs={breadcrumbs}>
      <div
        className="flex flex-col gap-6"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* ── 1. KPI Stats Row ─────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {kpiCards.map(k => (
            <Col key={k.title} xs={24} sm={12} lg={6}>
              <Card
                size="small"
                styles={{ body: { padding: "20px" } }}
                style={{ borderTop: `4px solid ${k.color}` }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {k.title}
                    </Text>
                    {"displayValue" in k && k.displayValue ? (
                      <div style={{ marginTop: 6 }}>
                        {(() => {
                          const meta = getStatusMeta(
                            k.displayValue as string,
                            t,
                            lang
                          );
                          return (
                            <Tag
                              icon={meta.icon}
                              color={meta.color}
                              style={{
                                borderRadius: 20,
                                fontSize: 14,
                                padding: "4px 12px",
                              }}
                            >
                              {meta.label}
                            </Tag>
                          );
                        })()}
                      </div>
                    ) : (
                      <Statistic
                        value={k.value}
                        suffix=" SAR"
                        precision={2}
                        valueStyle={{
                          fontSize: 24,
                          fontWeight: 800,
                          color: k.color,
                          lineHeight: 1.2,
                          marginTop: 6,
                        }}
                      />
                    )}
                    {k.sub && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 11, marginTop: 2, display: "block" }}
                      >
                        {k.sub}
                      </Text>
                    )}
                  </div>
                  <div style={{ fontSize: 24, color: k.color, opacity: 0.25 }}>
                    {k.icon}
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
                placeholder={t("taxReports.quarter", lang)}
                value={quarter}
                onChange={setQuarter}
                allowClear
                style={{ width: 130 }}
                options={[
                  { value: "Q1", label: "Q1" },
                  { value: "Q2", label: "Q2" },
                  { value: "Q3", label: "Q3" },
                  { value: "Q4", label: "Q4" },
                ]}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Tooltip title={t("seq.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "csv",
                      label: "CSV",
                      icon: <ExportOutlined />,
                      onClick: handleExport,
                    },
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

        {/* ── 3. Summary Cards ────────────────────────────────────────── */}
        {hasData && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Text type="secondary">
                    {t("taxReports.outputVat", lang)}
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: 22, color: "#EF4444", display: "block" }}
                  >
                    {fmtSAR(report.totalOutputVat)} SAR
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Text type="secondary">{t("taxReports.inputVat", lang)}</Text>
                  <Text
                    strong
                    style={{ fontSize: 22, color: "#10B981", display: "block" }}
                  >
                    {fmtSAR(report.totalInputVat)} SAR
                  </Text>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  <Text type="secondary">
                    {t("taxReports.netTaxLiability", lang)}
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 22,
                      color: token.colorPrimary,
                      display: "block",
                    }}
                  >
                    {fmtSAR(report.netTaxLiability)} SAR
                  </Text>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* ── 4. Filing Details Table ─────────────────────────────────── */}
        <Card
          size="small"
          title={t("taxReports.filingDetails", lang)}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={columns}
            dataSource={report.periods}
            loading={isLoading}
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <EmptyState description={t("taxReports.noData", lang)} />
              ),
            }}
            summary={() => {
              if (report.periods.length === 0) return null;
              const totalOutput = report.periods.reduce(
                (sum, p) => sum + Number(p.outputVat ?? 0),
                0
              );
              const totalInput = report.periods.reduce(
                (sum, p) => sum + Number(p.inputVat ?? 0),
                0
              );
              const totalNet = report.periods.reduce(
                (sum, p) => sum + Number(p.netVat ?? 0),
                0
              );
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{ background: token.colorFillAlter }}
                  >
                    <Table.Summary.Cell index={0}>
                      <Text strong>{t("purchaseReports.total", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="end">
                      <Text strong style={{ color: "#EF4444" }}>
                        {fmtSAR(totalOutput)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="end">
                      <Text strong style={{ color: "#10B981" }}>
                        {fmtSAR(totalInput)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="end">
                      <Text strong style={{ color: token.colorPrimary }}>
                        {fmtSAR(totalNet)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} />
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>

        {/* ── 5. No data message ─────────────────────────────────────── */}
        {!hasData && !isLoading && (
          <Card
            size="small"
            styles={{ body: { padding: "24px", textAlign: "center" } }}
          >
            <Text type="secondary">{t("taxReports.noData", lang)}</Text>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
