/**
 * Financial Reports page with real API data.
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
  Dropdown,
  Space,
  notification,
} from "antd";
import type { Dayjs } from "dayjs";
import {
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  DollarOutlined,
  FundOutlined,
  RiseOutlined,
  PercentageOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Types ────────────────────────────────────────────────────────────────────

type FinancialReportData = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
};

// ── API ──────────────────────────────────────────────────────────────────────

const financialReportApi = {
  get: (params?: Record<string, string>) =>
    apiClient
      .get("/reporting/financial", { params })
      .then(r => r.data.data as FinancialReportData),
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSAR(n: number): string {
  return Number(n ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function FinancialReports() {
  const { t, lang, direction } = useTranslation();
  const navigate = useNavigate();
  const isRTL = direction === "rtl";

  // ── Filter State ──────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [period, setPeriod] = useState<string | undefined>(undefined);

  // ── Query params ──────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (dateRange?.[0]) p.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) p.dateTo = dateRange[1].format("YYYY-MM-DD");
    if (period) p.period = period;
    return p;
  }, [dateRange, period]);

  // ── Query ─────────────────────────────────────────────────────────────
  const {
    data: reportRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.FINANCIAL_REPORT, queryParams],
    queryFn: async () => {
      try {
        return await financialReportApi.get(queryParams);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const report: FinancialReportData = useMemo(() => {
    if (reportRaw) return reportRaw;
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
    };
  }, [reportRaw]);

  // ── Export handler ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const csv = [
      ["Metric", "Amount (SAR)"],
      ["Total Revenue", report.totalRevenue],
      ["Total Expenses", report.totalExpenses],
      ["Net Profit", report.netProfit],
      ["Profit Margin %", report.profitMargin],
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "financial-report.csv";
    a.click();
    notification.success({ message: "CSV exported" });
  }, [report]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("REPORTS", lang), href: "#" },
    { label: t("financialReports.title", lang) },
  ];

  const hasData = report.totalRevenue > 0 || report.totalExpenses > 0;

  // ── KPI cards ─────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: t("financialReports.totalRevenue", lang),
      value: report.totalRevenue,
      icon: <DollarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("financialReports.totalExpenses", lang),
      value: report.totalExpenses,
      icon: <FundOutlined />,
      iconColor: "#ef4444",
      iconBg: "#ef444415",
    },
    {
      title: t("financialReports.netProfit", lang),
      value: report.netProfit,
      icon: <RiseOutlined />,
      iconColor: report.netProfit >= 0 ? "#10b981" : "#ef4444",
      iconBg: report.netProfit >= 0 ? "#10b98115" : "#ef444415",
    },
    {
      title: t("financialReports.profitMargin", lang),
      value: report.profitMargin,
      isPercent: true,
      icon: <PercentageOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
  ];

  // ── Detailed report links ─────────────────────────────────────────────
  const detailedReports = [
    {
      label: t("financialReports.trialBalance", lang),
      path: ROUTES.TRIAL_BALANCE ?? "/trial-balance",
      color: "#3b82f6",
    },
    {
      label: t("financialReports.incomeStatement", lang),
      path: ROUTES.INCOME_STATEMENT ?? "/income-statement",
      color: "#10b981",
    },
    {
      label: t("financialReports.balanceSheet", lang),
      path: ROUTES.BALANCE_SHEET ?? "/balance-sheet",
      color: "#8b5cf6",
    },
  ];

  return (
    <DashboardLayout currentPage="FinancialReports" breadcrumbs={breadcrumbs}>
      <div
        className="flex flex-col gap-6"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
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
                      suffix={s.isPercent ? "%" : " SAR"}
                      precision={2}
                      valueStyle={{
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.iconColor,
                      }}
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
                placeholder={t("financialReports.profitMargin", lang)}
                value={period}
                onChange={setPeriod}
                allowClear
                style={{ width: 160 }}
                options={[
                  { value: "ytd", label: "Year to Date" },
                  { value: "q1", label: "Q1" },
                  { value: "q2", label: "Q2" },
                  { value: "q3", label: "Q3" },
                  { value: "q4", label: "Q4" },
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

        {/* ── 3. Revenue vs Expenses Summary ─────────────────────────── */}
        {hasData && (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={t("financialReports.revenueVsExpenses", lang)}
                size="small"
                styles={{ body: { padding: "16px 20px" } }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <div className="flex justify-between items-center">
                    <Text>{t("financialReports.totalRevenue", lang)}</Text>
                    <Text strong style={{ color: "#10b981" }}>
                      {fmtSAR(report.totalRevenue)} SAR
                    </Text>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>{t("financialReports.totalExpenses", lang)}</Text>
                    <Text strong style={{ color: "#ef4444" }}>
                      {fmtSAR(report.totalExpenses)} SAR
                    </Text>
                  </div>
                  <div
                    className="flex justify-between items-center"
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: 12,
                    }}
                  >
                    <Text strong>{t("financialReports.netProfit", lang)}</Text>
                    <Text
                      strong
                      style={{
                        fontSize: 18,
                        color: report.netProfit >= 0 ? "#10b981" : "#ef4444",
                      }}
                    >
                      {fmtSAR(report.netProfit)} SAR
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={t("financialReports.keyRatios", lang)}
                size="small"
                styles={{ body: { padding: "16px 20px" } }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <div className="flex justify-between items-center">
                    <Text>{t("financialReports.profitMargin", lang)}</Text>
                    <Tag
                      color={report.profitMargin >= 0 ? "success" : "error"}
                      style={{ borderRadius: 20, fontWeight: 600 }}
                    >
                      {Number(report.profitMargin ?? 0).toFixed(1)}%
                    </Tag>
                  </div>
                  <div className="flex justify-between items-center">
                    <Text>{t("financialReports.netProfit", lang)}</Text>
                    <Text strong>{fmtSAR(report.netProfit)} SAR</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
        )}

        {/* ── 4. Detailed Report Links ───────────────────────────────── */}
        <Card
          title={t("financialReports.viewDetailedReports", lang)}
          size="small"
        >
          <Row gutter={[16, 16]}>
            {detailedReports.map(r => (
              <Col key={r.label} xs={24} sm={8}>
                <Button
                  type="default"
                  block
                  size="large"
                  onClick={() => navigate(r.path)}
                  style={{
                    borderColor: r.color,
                    color: r.color,
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text strong style={{ color: r.color }}>
                    {r.label}
                  </Text>
                  <RightOutlined
                    style={{
                      color: r.color,
                      transform: isRTL ? "rotate(180deg)" : undefined,
                    }}
                  />
                </Button>
              </Col>
            ))}
          </Row>
        </Card>

        {/* ── 5. No data message ─────────────────────────────────────── */}
        {!hasData && !isLoading && (
          <Card
            size="small"
            styles={{ body: { padding: "24px", textAlign: "center" } }}
          >
            <Text type="secondary">{t("financialReports.noData", lang)}</Text>
          </Card>
        )}

        {/* ── 6. Disclaimer ──────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t("financialReports.disclaimer", lang)}
          </Text>
        </Card>
      </div>
    </DashboardLayout>
  );
}
