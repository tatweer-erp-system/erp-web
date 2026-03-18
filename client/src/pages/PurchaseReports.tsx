/**
 * Purchase Reports page with real API data.
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
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import {
  ReloadOutlined,
  DownloadOutlined,
  ExportOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  TeamOutlined,
} from "@ant-design/icons";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { PurchaseOrderStatusNew } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import apiClient from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── Types ────────────────────────────────────────────────────────────────────

type StatusBreakdown = {
  status: string;
  count: number;
  totalAmount: number;
};

type PurchaseReportData = {
  totalOrders: number;
  totalAmount: number;
  avgOrderValue: number;
  topVendor: string;
  byStatus: StatusBreakdown[];
};

// ── API ──────────────────────────────────────────────────────────────────────

const purchaseReportApi = {
  get: (params?: Record<string, string>) =>
    apiClient
      .get("/reporting/purchases", { params })
      .then(r => r.data.data as PurchaseReportData),
  getSummary: (params?: Record<string, string>) =>
    apiClient
      .get("/purchase-orders/summary", { params })
      .then(r => r.data.data),
};

// ── Status color map ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [PurchaseOrderStatusNew.DRAFT]: "blue",
  [PurchaseOrderStatusNew.CONFIRMED]: "gold",
  [PurchaseOrderStatusNew.DONE]: "green",
  [PurchaseOrderStatusNew.CANCELLED]: "default",
};

const STATUS_ICON_COLOR: Record<string, string> = {
  [PurchaseOrderStatusNew.DRAFT]: "#3b82f6",
  [PurchaseOrderStatusNew.CONFIRMED]: "#f59e0b",
  [PurchaseOrderStatusNew.DONE]: "#10b981",
  [PurchaseOrderStatusNew.CANCELLED]: "#6b7280",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtSAR(n: number): string {
  return Number(n ?? 0).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PurchaseReports() {
  const { t, lang } = useTranslation();
  // ── Filter State ──────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );

  // ── Query params ──────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (dateRange?.[0]) p.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) p.dateTo = dateRange[1].format("YYYY-MM-DD");
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [dateRange, statusFilter]);

  // ── Query: try reporting endpoint first, fallback to summary ──────────
  const {
    data: reportRaw,
    isLoading: reportLoading,
    refetch: refetchReport,
  } = useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_REPORT, queryParams],
    queryFn: async () => {
      try {
        return await purchaseReportApi.get(queryParams);
      } catch {
        // Reporting endpoint not available yet — fall back to summary
        return null;
      }
    },
    staleTime: 60_000,
  });

  const {
    data: summaryRaw,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS_SUMMARY, queryParams],
    queryFn: () => purchaseReportApi.getSummary(queryParams),
    enabled: !reportRaw,
    staleTime: 60_000,
  });

  const isLoading = reportLoading || summaryLoading;

  const report: PurchaseReportData = useMemo(() => {
    if (reportRaw) return reportRaw;

    // Build from summary fallback
    const s = summaryRaw as Record<string, unknown> | undefined;
    const totalOrders = Number(s?.totalRecords ?? 0);
    const totalDraft = Number(s?.totalDraft ?? 0);
    const totalConfirmed = Number(s?.totalConfirmed ?? 0);
    const totalDone = Number(s?.totalDone ?? 0);
    const totalCancelled = Number(s?.totalCancelled ?? 0);
    const totalAmount = Number(s?.totalAmount ?? 0);

    const byStatus: StatusBreakdown[] = [];
    if (totalDraft > 0)
      byStatus.push({
        status: PurchaseOrderStatusNew.DRAFT,
        count: totalDraft,
        totalAmount: 0,
      });
    if (totalConfirmed > 0)
      byStatus.push({
        status: PurchaseOrderStatusNew.CONFIRMED,
        count: totalConfirmed,
        totalAmount: 0,
      });
    if (totalDone > 0)
      byStatus.push({
        status: PurchaseOrderStatusNew.DONE,
        count: totalDone,
        totalAmount: 0,
      });
    if (totalCancelled > 0)
      byStatus.push({
        status: PurchaseOrderStatusNew.CANCELLED,
        count: totalCancelled,
        totalAmount: 0,
      });

    return {
      totalOrders,
      totalAmount,
      avgOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
      topVendor: "—",
      byStatus,
    };
  }, [reportRaw, summaryRaw]);

  // ── Reset filters ─────────────────────────────────────────────────────
  const resetFilters = useCallback(() => {
    setDateRange(null);
    setStatusFilter(undefined);
  }, []);

  const hasFilters = !!(dateRange || statusFilter);

  const handleRefetch = useCallback(() => {
    refetchReport();
    refetchSummary();
  }, [refetchReport, refetchSummary]);

  // ── Export handler ────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rows = report.byStatus.map(s => [s.status, s.count, s.totalAmount]);
    const csv = [
      [
        t("common.status", lang),
        t("purchaseReports.count", lang),
        t("purchaseReports.amount", lang),
      ],
      ...rows,
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "purchase-report.csv";
    a.click();
    notification.success({ message: "CSV exported" });
  }, [report, t, lang]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("REPORTS", lang), href: "#" },
    { label: t("purchaseReports.title", lang) },
  ];

  // ── KPI cards ─────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: t("purchaseReports.totalPOs", lang),
      value: report.totalOrders,
      suffix: "",
      isSAR: false,
      icon: <ShoppingCartOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("purchaseReports.totalAmount", lang),
      value: report.totalAmount,
      suffix: " SAR",
      isSAR: true,
      icon: <DollarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("purchaseReports.avgPOValue", lang),
      value: report.avgOrderValue,
      suffix: " SAR",
      isSAR: true,
      icon: <BarChartOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("purchaseReports.topVendor", lang),
      value: 0,
      suffix: "",
      isSAR: false,
      displayValue: report.topVendor || "—",
      icon: <TeamOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  // ── Status breakdown columns ───────────────────────────────────────────
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
        title: t("purchaseReports.count", lang),
        dataIndex: "count",
        width: 120,
        align: "end" as const,
        render: (v: number) => Number(v ?? 0).toLocaleString(),
      },
      {
        title: t("purchaseReports.amount", lang),
        dataIndex: "totalAmount",
        width: 180,
        align: "end" as const,
        render: (v: number) => (
          <Text strong className="font-mono">
            {fmtSAR(v)} SAR
          </Text>
        ),
      },
    ],
    [t, lang]
  );

  return (
    <DashboardLayout currentPage="PurchaseReports" breadcrumbs={breadcrumbs}>
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
                    {"displayValue" in s && s.displayValue ? (
                      <Text
                        strong
                        style={{
                          fontSize: 24,
                          lineHeight: 1,
                          display: "block",
                        }}
                      >
                        {s.displayValue}
                      </Text>
                    ) : (
                      <Statistic
                        value={s.value}
                        suffix={s.suffix || undefined}
                        precision={s.isSAR ? 2 : 0}
                        valueStyle={{ fontSize: 24, lineHeight: 1 }}
                      />
                    )}
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
                    value: PurchaseOrderStatusNew.DRAFT,
                    label: t("purchaseReports.draft", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.CONFIRMED,
                    label: t("purchaseReports.confirmed", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.DONE,
                    label: t("purchaseReports.done", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.CANCELLED,
                    label: t("purchaseReports.cancelledLabel", lang),
                  },
                ]}
              />
              {hasFilters && (
                <Button type="link" size="small" onClick={resetFilters}>
                  {t("purchaseReports.clearFilters", lang)}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Tooltip title={t("seq.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={handleRefetch} />
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

        {/* ── 3. Status Breakdown Cards ──────────────────────────────── */}
        {report.byStatus.length > 0 && (
          <Row gutter={[16, 16]}>
            {report.byStatus.map(s => (
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
                          {t("purchaseReports.count", lang)}
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
                          {t("purchaseReports.amount", lang)}
                        </Text>
                        <Text
                          strong
                          className="font-mono"
                          style={{
                            fontSize: 16,
                            color: STATUS_ICON_COLOR[s.status] ?? "#6b7280",
                          }}
                        >
                          {fmtSAR(s.totalAmount)} SAR
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
          title={t("purchaseReports.statusBreakdown", lang)}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="status"
            columns={breakdownColumns}
            dataSource={report.byStatus}
            loading={isLoading}
            size="middle"
            pagination={false}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <EmptyState description={t("purchaseReports.noData", lang)} />
              ),
            }}
            summary={() => {
              if (report.byStatus.length === 0) return null;
              const totalCount = report.byStatus.reduce(
                (sum, s) => sum + Number(s.count ?? 0),
                0
              );
              const totalAmt = report.byStatus.reduce(
                (sum, s) => sum + Number(s.totalAmount ?? 0),
                0
              );
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>{t("purchaseReports.total", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="end">
                      <Text strong>{totalCount.toLocaleString()}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="end">
                      <Text strong className="font-mono">
                        {fmtSAR(totalAmt)} SAR
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
