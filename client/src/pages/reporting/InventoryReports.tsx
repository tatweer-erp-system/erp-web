/**
 * Inventory Reports page.
 * Fetches low-stock data from GET /reporting/inventory and displays
 * KPI cards and a detail table of items at/below reorder point.
 */

import { useState, useMemo } from "react";
import {
  Button,
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
  AppstoreOutlined,
  HomeOutlined,
  InboxOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  getInventoryReport,
  exportReport,
  type InventoryReportRow,
} from "@/api/endpoints/reporting.api";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNumber(value: number | undefined): string | number {
  if (value == null) return 0;
  return Number(value).toLocaleString();
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KPICard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  loading,
  valueColor,
}: {
  title: string;
  value: string | number;
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
              valueStyle={{ fontSize: 22, lineHeight: 1, color: valueColor }}
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

export default function InventoryReports() {
  const { t, lang } = useTranslation();
  const { token } = antTheme.useToken();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);

  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const startDate = dateRange?.[0]?.format("YYYY-MM-DD");
  const endDate = dateRange?.[1]?.format("YYYY-MM-DD");

  // ── Query ──────────────────────────────────────────────────────────────────
  const { data: response, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.INVENTORY_REPORT, startDate, endDate, branchId],
    queryFn: () =>
      getInventoryReport({
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    staleTime: 60_000,
    enabled: !!branchId,
  });

  const report = (response as unknown as Record<string, unknown>)?.data as
    | { data: InventoryReportRow[]; summary: { totalProductsInStock: number; totalWarehouses: number; totalQuantity: number } }
    | undefined;

  const rows = report?.data ?? [];
  const summary = report?.summary;
  const hasData = rows.length > 0;

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = async (format: "pdf" | "xlsx") => {
    await exportReport({
      reportType: "inventory",
      format,
      startDate: startDate ?? undefined,
      endDate: endDate ?? undefined,
    });
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumnsType<InventoryReportRow> = useMemo(
    () => [
      {
        title: t("common.product", lang),
        dataIndex: "name",
        key: "name",
        width: 240,
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("common.warehouse", lang),
        dataIndex: "warehouse",
        key: "warehouse",
        width: 180,
        render: (v: string) => <Text>{v}</Text>,
      },
      {
        title: t("inventoryReports.quantity", lang),
        dataIndex: "quantity",
        key: "quantity",
        width: 120,
        align: "end" as const,
        sorter: (a: InventoryReportRow, b: InventoryReportRow) =>
          Number(a.quantity) - Number(b.quantity),
        render: (v: number, record: InventoryReportRow) => {
          const isLow = Number(v) <= Number(record.reorderPoint) && Number(v) > 0;
          const isOut = Number(v) === 0;
          return (
            <Text
              strong
              style={{
                fontFamily: "monospace",
                color: isOut ? "#EF4444" : isLow ? "#F59E0B" : undefined,
              }}
            >
              {fmtNumber(v)}
            </Text>
          );
        },
      },
      {
        title: t("inventoryReports.reorderPoint", lang),
        dataIndex: "reorderPoint",
        key: "reorderPoint",
        width: 140,
        align: "end" as const,
        render: (v: number) => (
          <Text type="secondary" style={{ fontFamily: "monospace" }}>
            {fmtNumber(v)}
          </Text>
        ),
      },
      {
        title: t("common.status", lang),
        key: "stockStatus",
        width: 120,
        render: (_: unknown, record: InventoryReportRow) => {
          const qty = Number(record.quantity);
          const reorder = Number(record.reorderPoint);
          if (qty === 0) {
            return <Tag color="error">{t("inventoryReports.outOfStock", lang)}</Tag>;
          }
          if (qty <= reorder) {
            return <Tag color="warning">{t("inventoryReports.lowStock", lang)}</Tag>;
          }
          return <Tag color="success">{t("inventoryReports.inStock", lang)}</Tag>;
        },
      },
    ],
    [t, lang],
  );

  // Count low stock and out of stock
  const lowStockCount = rows.filter(
    r => Number(r.quantity) <= Number(r.reorderPoint) && Number(r.quantity) > 0,
  ).length;
  const outOfStockCount = rows.filter(r => Number(r.quantity) === 0).length;

  return (
    <DashboardLayout
      currentPage="Inventory Reports"
      breadcrumbs={[
        { label: t("REPORTS", lang) },
        { label: t("inventoryReports.title", lang) },
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
              {t("inventoryReports.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("inventoryReports.subtitle", lang)}
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
          <Col xs={24} sm={6}>
            <KPICard
              title={t("inventoryReports.totalProducts", lang)}
              value={fmtNumber(summary?.totalProductsInStock)}
              icon={<AppstoreOutlined />}
              iconColor="#3B82F6"
              iconBg="#3B82F615"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={t("inventoryReports.totalWarehouses", lang)}
              value={fmtNumber(summary?.totalWarehouses)}
              icon={<HomeOutlined />}
              iconColor="#8B5CF6"
              iconBg="#8B5CF615"
              loading={isLoading}
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={t("inventoryReports.lowStock", lang)}
              value={fmtNumber(lowStockCount)}
              icon={<WarningOutlined />}
              iconColor="#F59E0B"
              iconBg="#F59E0B15"
              loading={isLoading}
              valueColor="#F59E0B"
            />
          </Col>
          <Col xs={24} sm={6}>
            <KPICard
              title={t("inventoryReports.outOfStock", lang)}
              value={fmtNumber(outOfStockCount)}
              icon={<InboxOutlined />}
              iconColor="#EF4444"
              iconBg="#EF444415"
              loading={isLoading}
              valueColor="#EF4444"
            />
          </Col>
        </Row>

        {/* ── Table: Low Stock Items ──────────────────────────────── */}
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
              {t("inventoryReports.lowStockItems", lang)}
            </Text>
          </div>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin />
            </div>
          ) : hasData ? (
            <Table
              rowKey={(r) => `${r.name}-${r.warehouse}`}
              size="small"
              dataSource={rows}
              columns={columns}
              pagination={{ pageSize: 20, showSizeChanger: true }}
              scroll={{ x: "max-content" }}
              summary={() => {
                if (!summary) return null;
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <Text strong>{t("inventoryReports.total", lang)}</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} />
                      <Table.Summary.Cell index={2} align="end">
                        <Text strong style={{ fontFamily: "monospace" }}>
                          {fmtNumber(summary.totalQuantity)}
                        </Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} />
                      <Table.Summary.Cell index={4} />
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text type="secondary">{t("common.noData", lang)}</Text>}
              style={{ padding: "40px 0" }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
