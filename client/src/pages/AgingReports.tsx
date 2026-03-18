/**
 * Aging Reports page with real API data.
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
  DatePicker,
  Segmented,
  Tooltip,
  Table,
  Dropdown,
  Alert,
  notification,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;

// ── Types ────────────────────────────────────────────────────────────────────

type AgingMode = "receivable" | "payable";

type AgingRow = {
  partnerId: string;
  partnerNameEn: string;
  partnerNameAr: string;
  total: number;
  current: number;
  d31_60: number;
  d61_90: number;
  d90plus: number;
};

type AgingReportData = {
  rows: AgingRow[];
  totals: {
    total: number;
    current: number;
    d31_60: number;
    d61_90: number;
    d90plus: number;
  };
};

// ── API ──────────────────────────────────────────────────────────────────────

const agingReportApi = {
  get: (params?: Record<string, string>) =>
    apiClient
      .get("/reporting/aging", { params })
      .then(r => r.data.data as AgingReportData),
};

// ── Bucket colors ────────────────────────────────────────────────────────────

const BUCKET_COLORS = {
  current: "#10B981",
  d31_60: "#F59E0B",
  d61_90: "#F97316",
  d90plus: "#EF4444",
} as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSAR(n: number): string {
  return Number(n ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getRiskTag(
  row: AgingRow,
  t: (key: string, lang: "ar" | "en") => string,
  lang: "ar" | "en"
): React.ReactNode {
  const overdue = (row.d61_90 ?? 0) + (row.d90plus ?? 0);
  const pct = row.total ? overdue / row.total : 0;
  if (pct > 0.4)
    return (
      <Tag color="error" style={{ borderRadius: 20 }}>
        {t("agingReports.highRisk", lang)}
      </Tag>
    );
  if (pct > 0.15)
    return (
      <Tag color="warning" style={{ borderRadius: 20 }}>
        {t("agingReports.mediumRisk", lang)}
      </Tag>
    );
  return (
    <Tag color="success" style={{ borderRadius: 20 }}>
      {t("agingReports.lowRisk", lang)}
    </Tag>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AgingReports() {
  const { t, lang, direction } = useTranslation();
  const { token } = antTheme.useToken();
  const isRTL = direction === "rtl";

  // ── Filter State ──────────────────────────────────────────────────────
  const [mode, setMode] = useState<AgingMode>("receivable");
  const [asOfDate, setAsOfDate] = useState<Dayjs | null>(null);

  // ── Query params ──────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, string> = { type: mode };
    if (asOfDate) p.asOfDate = asOfDate.format("YYYY-MM-DD");
    return p;
  }, [mode, asOfDate]);

  // ── Query ─────────────────────────────────────────────────────────────
  const {
    data: reportRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.AGING_REPORT, queryParams],
    queryFn: async () => {
      try {
        return await agingReportApi.get(queryParams);
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });

  const report: AgingReportData = useMemo(() => {
    if (reportRaw) return reportRaw;
    return {
      rows: [],
      totals: { total: 0, current: 0, d31_60: 0, d61_90: 0, d90plus: 0 },
    };
  }, [reportRaw]);

  const totals = report.totals;
  const overdueTotal = (totals.d61_90 ?? 0) + (totals.d90plus ?? 0);
  const overdueRate = totals.total
    ? ((overdueTotal / totals.total) * 100).toFixed(1)
    : "0";

  // ── Export handler ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const csv = [
      [
        t("agingReports.partnerName", lang),
        t("agingReports.totalOutstanding", lang),
        t("agingReports.current", lang),
        t("agingReports.overdue31_60", lang),
        t("agingReports.overdue61_90", lang),
        t("agingReports.overdue90plus", lang),
      ],
      ...report.rows.map(r => [
        lang === "ar" ? r.partnerNameAr : r.partnerNameEn,
        r.total,
        r.current,
        r.d31_60,
        r.d61_90,
        r.d90plus,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `aging-${mode}-report.csv`;
    a.click();
    notification.success({ message: "CSV exported" });
  }, [report, mode, t, lang]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("REPORTS", lang), href: "#" },
    { label: t("agingReports.title", lang) },
  ];

  // ── Table columns ─────────────────────────────────────────────────────
  const columns: TableColumnsType<AgingRow> = useMemo(
    () => [
      {
        title: t("agingReports.partnerName", lang),
        key: "partnerName",
        width: 220,
        render: (_: unknown, row: AgingRow) => (
          <Text strong>
            {lang === "ar"
              ? row.partnerNameAr || row.partnerNameEn
              : row.partnerNameEn || row.partnerNameAr}
          </Text>
        ),
      },
      {
        title: t("agingReports.totalOutstanding", lang),
        dataIndex: "total",
        align: "end" as const,
        width: 150,
        sorter: (a: AgingRow, b: AgingRow) => (a.total ?? 0) - (b.total ?? 0),
        render: (v: number) => <Text strong>{fmtSAR(v)}</Text>,
      },
      {
        title: t("agingReports.current", lang),
        dataIndex: "current",
        align: "end" as const,
        width: 130,
        render: (v: number) => (
          <Text
            style={{
              color: BUCKET_COLORS.current,
              fontWeight: v ? 600 : 400,
            }}
          >
            {v ? fmtSAR(v) : "—"}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue31_60", lang),
        dataIndex: "d31_60",
        align: "end" as const,
        width: 130,
        render: (v: number) => (
          <Text
            style={{
              color: BUCKET_COLORS.d31_60,
              fontWeight: v ? 600 : 400,
            }}
          >
            {v ? fmtSAR(v) : "—"}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue61_90", lang),
        dataIndex: "d61_90",
        align: "end" as const,
        width: 130,
        render: (v: number) => (
          <Text
            style={{
              color: BUCKET_COLORS.d61_90,
              fontWeight: v ? 600 : 400,
            }}
          >
            {v ? fmtSAR(v) : "—"}
          </Text>
        ),
      },
      {
        title: t("agingReports.overdue90plus", lang),
        dataIndex: "d90plus",
        align: "end" as const,
        width: 130,
        render: (v: number) => (
          <Text
            style={{
              color: BUCKET_COLORS.d90plus,
              fontWeight: v ? 600 : 400,
            }}
          >
            {v ? fmtSAR(v) : "—"}
          </Text>
        ),
      },
      {
        title: t("agingReports.risk", lang),
        key: "risk",
        align: "center" as const,
        width: 110,
        render: (_: unknown, row: AgingRow) => getRiskTag(row, t, lang),
      },
    ],
    [t, lang]
  );

  // ── Bucket KPI definitions ────────────────────────────────────────────
  const bucketKpis = [
    {
      key: "total" as const,
      label: t("agingReports.totalOutstanding", lang),
      value: totals.total,
      color: token.colorPrimary,
      bg: token.colorPrimaryBg,
    },
    {
      key: "current" as const,
      label: t("agingReports.current", lang),
      value: totals.current,
      color: BUCKET_COLORS.current,
      bg: `${BUCKET_COLORS.current}08`,
    },
    {
      key: "d31_60" as const,
      label: t("agingReports.overdue31_60", lang),
      value: totals.d31_60,
      color: BUCKET_COLORS.d31_60,
      bg: `${BUCKET_COLORS.d31_60}08`,
    },
    {
      key: "d61_90" as const,
      label: t("agingReports.overdue61_90", lang),
      value: totals.d61_90,
      color: BUCKET_COLORS.d61_90,
      bg: `${BUCKET_COLORS.d61_90}08`,
    },
    {
      key: "d90plus" as const,
      label: t("agingReports.overdue90plus", lang),
      value: totals.d90plus,
      color: BUCKET_COLORS.d90plus,
      bg: `${BUCKET_COLORS.d90plus}08`,
    },
  ];

  return (
    <DashboardLayout currentPage="AgingReports" breadcrumbs={breadcrumbs}>
      <div
        className="flex flex-col gap-6"
        style={{ direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* ── 1. Toolbar ──────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Segmented
                value={mode}
                onChange={v => setMode(v as AgingMode)}
                options={[
                  {
                    value: "receivable",
                    label: t("agingReports.arAging", lang),
                  },
                  {
                    value: "payable",
                    label: t("agingReports.apAging", lang),
                  },
                ]}
              />
              <DatePicker
                value={asOfDate}
                onChange={setAsOfDate}
                placeholder={t("agingReports.asOfDate", lang)}
                allowClear
                style={{ borderRadius: 8, width: 160 }}
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

        {/* ── 2. Overdue warning ──────────────────────────────────────── */}
        {parseFloat(overdueRate) > 20 && (
          <Alert
            icon={<WarningOutlined />}
            showIcon
            type="warning"
            message={`${overdueRate}% of total ${mode === "receivable" ? t("agingReports.receivable", lang) : t("agingReports.payable", lang)} (${fmtSAR(overdueTotal)} SAR) are overdue by more than 60 days.`}
            style={{ borderRadius: 8 }}
          />
        )}

        {/* ── 3. Bucket KPI Cards ─────────────────────────────────────── */}
        <Row gutter={[12, 12]}>
          {bucketKpis.map(k => (
            <Col xs={12} sm={8} lg={4} key={k.key} style={{ flex: 1 }}>
              <Card
                size="small"
                styles={{ body: { padding: "14px 16px" } }}
                style={{
                  borderInlineStart: `4px solid ${k.color}`,
                  background: k.bg,
                }}
              >
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {k.label}
                </Text>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 20,
                    color: k.color,
                    marginTop: 4,
                  }}
                >
                  {fmtSAR(k.value)}
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {totals.total
                    ? ((k.value / totals.total) * 100).toFixed(1)
                    : 0}
                  % of total
                </Text>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── 4. Aging Detail Table ───────────────────────────────────── */}
        <Card
          size="small"
          title={t("agingReports.title", lang)}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="partnerId"
            columns={columns}
            dataSource={report.rows}
            loading={isLoading}
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <EmptyState description={t("agingReports.noData", lang)} />
              ),
            }}
            summary={() => {
              if (report.rows.length === 0) return null;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{
                      background: token.colorFillAlter,
                      fontWeight: 700,
                    }}
                  >
                    <Table.Summary.Cell index={0}>
                      <Text strong>{t("agingReports.total", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="end">
                      <Text strong style={{ color: token.colorPrimary }}>
                        {fmtSAR(totals.total)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="end">
                      <Text strong style={{ color: BUCKET_COLORS.current }}>
                        {fmtSAR(totals.current)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="end">
                      <Text strong style={{ color: BUCKET_COLORS.d31_60 }}>
                        {fmtSAR(totals.d31_60)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="end">
                      <Text strong style={{ color: BUCKET_COLORS.d61_90 }}>
                        {fmtSAR(totals.d61_90)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="end">
                      <Text strong style={{ color: BUCKET_COLORS.d90plus }}>
                        {fmtSAR(totals.d90plus)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} />
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
