import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { stockService } from "@/services/inventory.service";
import type { StockLevel, LowStockAlert } from "@/types/modules/inventory";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  Input,
  Tooltip,
  Statistic,
  Alert,
  Grid,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ReloadOutlined,
  WarningOutlined,
  AppstoreOutlined,
  AlertOutlined,
  DollarOutlined,
  StopOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Status computation helpers ─────────────────────────────────────────────

type ComputedStatus = "in-stock" | "low-stock" | "out-of-stock";

function computeStatus(qty: number, reorderPoint?: number): ComputedStatus {
  if (qty <= 0) return "out-of-stock";
  if (reorderPoint != null && qty > 0 && qty <= reorderPoint)
    return "low-stock";
  return "in-stock";
}

const STATUS_CONFIG: Record<
  ComputedStatus,
  { labelKey: string; tagColor: string; color: string }
> = {
  "in-stock": {
    labelKey: "inventory.inStock",
    tagColor: "success",
    color: "#10B981",
  },
  "low-stock": {
    labelKey: "inventory.lowStockAlert",
    tagColor: "warning",
    color: "#F59E0B",
  },
  "out-of-stock": {
    labelKey: "inventory.outOfStock",
    tagColor: "error",
    color: "#EF4444",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function InventoryReports() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: stockRaw,
    isLoading: stockLoading,
    refetch: refetchStock,
  } = useQuery({
    queryKey: [QUERY_KEYS.STOCK_LEVELS, "reports"],
    queryFn: () => stockService.getStockLevels({ limit: 500 }),
    staleTime: 30_000,
  });

  const {
    data: alertsRaw,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: [QUERY_KEYS.LOW_STOCK_ALERTS],
    queryFn: () => stockService.getLowStockAlerts(),
    staleTime: 30_000,
  });

  const allStock: StockLevel[] = useMemo(() => {
    const res = stockRaw as Record<string, unknown> | undefined;
    return (res?.data as StockLevel[]) ?? [];
  }, [stockRaw]);

  const alerts: LowStockAlert[] = useMemo(() => {
    // getLowStockAlerts already returns r.data.data (unwrapped)
    return (alertsRaw as LowStockAlert[]) ?? [];
  }, [alertsRaw]);

  // ── Enriched stock data with computed status ──────────────────────────────

  type StockRow = StockLevel & { computedStatus: ComputedStatus };

  const enrichedStock: StockRow[] = useMemo(
    () =>
      allStock.map(s => ({
        ...s,
        computedStatus: computeStatus(Number(s.quantity), s.reorderPoint),
      })),
    [allStock]
  );

  // ── Filtered stock data ───────────────────────────────────────────────────

  const filteredStock = useMemo(() => {
    let data = [...enrichedStock];
    if (statusFilter !== "all") {
      data = data.filter(s => s.computedStatus === statusFilter);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter(
        s =>
          (s.productNameEn ?? "").toLowerCase().includes(q) ||
          (s.productNameAr ?? "").toLowerCase().includes(q) ||
          (s.productSku ?? "").toLowerCase().includes(q) ||
          (s.warehouseNameEn ?? "").toLowerCase().includes(q) ||
          (s.warehouseNameAr ?? "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [enrichedStock, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────────

  const kpiTotalTracked = allStock.length;
  const kpiLowStock = enrichedStock.filter(
    s => s.computedStatus === "low-stock"
  ).length;
  const kpiOutOfStock = enrichedStock.filter(
    s => s.computedStatus === "out-of-stock"
  ).length;
  const kpiTotalValue = allStock.reduce(
    (sum, s) => sum + Number(s.quantity) * Number(s.averageCost ?? 0),
    0
  );

  // ── Reload both queries ───────────────────────────────────────────────────

  const handleReload = () => {
    refetchStock();
    refetchAlerts();
  };

  const isLoading = stockLoading || alertsLoading;

  // ── Low Stock Alerts columns ──────────────────────────────────────────────

  const alertColumns: TableColumnsType<LowStockAlert> = [
    {
      title: t("common.product", lang),
      key: "product",
      render: (_, rec) => (
        <div>
          <Text strong style={{ color: token.colorPrimary }}>
            {lang === "ar" ? rec.productNameAr : rec.productNameEn}
          </Text>
          {rec.productSku && (
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              {rec.productSku}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t("common.warehouse", lang),
      key: "warehouse",
      render: (_, rec) => (
        <Text>{lang === "ar" ? rec.warehouseNameAr : rec.warehouseNameEn}</Text>
      ),
    },
    {
      title: t("inventory.currentQty", lang),
      dataIndex: "quantity",
      align: "center",
      width: 120,
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      render: (v: number) => (
        <Tag
          color="error"
          style={{ borderRadius: 20, fontFamily: "monospace", fontWeight: 700 }}
        >
          {Number(v)}
        </Tag>
      ),
    },
    {
      title: t("inventory.reorderPoint", lang),
      dataIndex: "reorderPoint",
      align: "center",
      width: 130,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{Number(v)}</Text>
      ),
    },
    {
      title: t("common.deficit", lang),
      key: "deficit",
      align: "center",
      width: 120,
      sorter: (a, b) =>
        Number(b.reorderPoint) -
        Number(b.quantity) -
        (Number(a.reorderPoint) - Number(a.quantity)),
      render: (_, rec) => {
        const deficit = Number(rec.reorderPoint) - Number(rec.quantity);
        return (
          <Text
            strong
            style={{
              color: "#EF4444",
              fontFamily: "monospace",
            }}
          >
            -{Math.max(deficit, 0)}
          </Text>
        );
      },
    },
  ];

  // ── Stock Summary columns ─────────────────────────────────────────────────

  const stockColumns: TableColumnsType<StockRow> = [
    {
      title: t("common.product", lang),
      key: "product",
      render: (_, rec) => (
        <div>
          <Text strong style={{ color: token.colorPrimary }}>
            {lang === "ar"
              ? (rec.productNameAr ?? rec.productNameEn)
              : (rec.productNameEn ?? rec.productNameAr)}
          </Text>
          {rec.productSku && (
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 11,
                fontFamily: "monospace",
              }}
            >
              {rec.productSku}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t("common.warehouse", lang),
      key: "warehouse",
      width: 160,
      render: (_, rec) => (
        <Text>
          {lang === "ar"
            ? (rec.warehouseNameAr ?? rec.warehouseNameEn)
            : (rec.warehouseNameEn ?? rec.warehouseNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("common.category", lang),
      key: "category",
      width: 140,
      render: (_, rec) => (
        <Text type="secondary">
          {lang === "ar"
            ? (rec.categoryNameAr ?? rec.categoryNameEn)
            : (rec.categoryNameEn ?? rec.categoryNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("inventory.currentQty", lang),
      dataIndex: "quantity",
      align: "center",
      width: 120,
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      render: (v: number, rec) => {
        const cfg = STATUS_CONFIG[rec.computedStatus];
        return (
          <Text strong style={{ fontFamily: "monospace", color: cfg.color }}>
            {Number(v)}
          </Text>
        );
      },
    },
    {
      title: t("inventory.reorderPoint", lang),
      key: "reorderPoint",
      dataIndex: "reorderPoint",
      align: "center",
      width: 130,
      render: (v: number | undefined) => (
        <Text style={{ fontFamily: "monospace" }} type="secondary">
          {v != null ? Number(v) : "—"}
        </Text>
      ),
    },
    {
      title: t("common.reserved", lang),
      dataIndex: "reservedQuantity",
      align: "center",
      width: 100,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }} type="secondary">
          {Number(v ?? 0)}
        </Text>
      ),
    },
    {
      title: t("common.avgCost", lang),
      dataIndex: "averageCost",
      align: "right",
      width: 120,
      sorter: (a, b) => Number(a.averageCost) - Number(b.averageCost),
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>
          {Number(v ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      ),
    },
    {
      title: t("common.totalValue", lang),
      key: "totalValue",
      align: "right",
      width: 130,
      sorter: (a, b) =>
        Number(a.quantity) * Number(a.averageCost) -
        Number(b.quantity) * Number(b.averageCost),
      render: (_, rec) => {
        const val = Number(rec.quantity) * Number(rec.averageCost ?? 0);
        return (
          <Text strong style={{ fontFamily: "monospace" }}>
            {val.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("inventory.stockStatus", lang),
      key: "status",
      width: 130,
      filters: [
        {
          text: t("inventory.inStock", lang),
          value: "in-stock",
        },
        {
          text: t("inventory.lowStockAlert", lang),
          value: "low-stock",
        },
        {
          text: t("inventory.outOfStock", lang),
          value: "out-of-stock",
        },
      ],
      onFilter: (val, rec) => rec.computedStatus === val,
      render: (_, rec) => {
        const cfg = STATUS_CONFIG[rec.computedStatus];
        return (
          <Tag color={cfg.tagColor} style={{ borderRadius: 20 }}>
            {t(cfg.labelKey, lang)}
          </Tag>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      currentPage="Inventory Reports"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("common.reports", lang) },
        { label: t("common.inventory", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Alert banner ─────────────────────────────────────────────────── */}
        {(kpiOutOfStock > 0 || kpiLowStock > 0) && (
          <Alert
            icon={<WarningOutlined />}
            showIcon
            type="warning"
            message={`${kpiOutOfStock} ${t("inventory.outOfStock", lang)} · ${kpiLowStock} ${t("inventory.lowStockAlert", lang)}`}
            style={{ borderRadius: 8 }}
          />
        )}

        {/* ── KPI Cards ────────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("common.totalProducts", lang),
              value: kpiTotalTracked,
              suffix: t("common.tracked", lang),
              icon: <AppstoreOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("inventory.lowStockAlert", lang),
              value: kpiLowStock,
              suffix: t("common.items", lang),
              icon: <AlertOutlined />,
              iconColor: "#F59E0B",
              iconBg: "#F59E0B15",
              color: kpiLowStock > 0 ? "#F59E0B" : undefined,
            },
            {
              title: t("inventory.outOfStock", lang),
              value: kpiOutOfStock,
              suffix: t("common.items", lang),
              icon: <StopOutlined />,
              iconColor: "#EF4444",
              iconBg: "#EF444415",
              color: kpiOutOfStock > 0 ? "#EF4444" : undefined,
            },
            {
              title: t("common.totalValue", lang),
              value: kpiTotalValue,
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#10B981",
              iconBg: "#10B98115",
              color: "#10B981",
              isCurrency: true,
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
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
                      precision={"isCurrency" in s && s.isCurrency ? 2 : 0}
                      valueStyle={{
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {s.suffix}
                    </Text>
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

        {/* ── Low Stock Alerts Table ────────────────────────────────────────── */}
        {alerts.length > 0 && (
          <Card
            title={
              <Space>
                <AlertOutlined style={{ color: "#F59E0B" }} />
                <Text strong>{t("inventory.lowStockAlert", lang)}</Text>
                <Tag color="warning" style={{ borderRadius: 20 }}>
                  {alerts.length}
                </Tag>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table
              rowKey={rec => `${rec.productId}-${rec.warehouseId}`}
              columns={alertColumns}
              dataSource={alerts}
              loading={alertsLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={
                alerts.length > 10
                  ? {
                      pageSize: 10,
                      showTotal: (total, range) =>
                        `${range[0]}–${range[1]} of ${total}`,
                    }
                  : false
              }
            />
          </Card>
        )}

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space wrap>
              <Input.Search
                placeholder={t("common.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: isMobile ? "100%" : 240 }}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 180 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("common.allStatuses", lang),
                  },
                  {
                    value: "in-stock",
                    label: t("inventory.inStock", lang),
                  },
                  {
                    value: "low-stock",
                    label: t("inventory.lowStockAlert", lang),
                  },
                  {
                    value: "out-of-stock",
                    label: t("inventory.outOfStock", lang),
                  },
                ]}
              />
            </Space>

            <Space>
              <Tooltip title={t("common.reload", lang)}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReload}
                  loading={isLoading}
                />
              </Tooltip>
            </Space>
          </div>
        </Card>

        {/* ── Stock Summary Table ──────────────────────────────────────────── */}
        <Card
          title={
            <Space>
              <Text strong>{t("common.stockSummary", lang)}</Text>
              <Tag
                color="blue"
                style={{ borderRadius: 20, fontFamily: "monospace" }}
              >
                {filteredStock.length}
              </Tag>
            </Space>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="id"
            columns={stockColumns}
            dataSource={filteredStock}
            loading={stockLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["10", "25", "50", "100"],
              defaultPageSize: 25,
            }}
            summary={pageData => {
              const totalQty = pageData.reduce(
                (s, r) => s + Number(r.quantity),
                0
              );
              const totalVal = pageData.reduce(
                (s, r) => s + Number(r.quantity) * Number(r.averageCost ?? 0),
                0
              );
              return (
                <Table.Summary.Row
                  style={{
                    background: theme === "dark" ? "#1a1a2e" : "#fafafa",
                  }}
                >
                  <Table.Summary.Cell index={0} colSpan={3}>
                    <Text strong>{t("common.pageTotal", lang)}</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Text strong style={{ fontFamily: "monospace" }}>
                      {totalQty.toLocaleString()}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} colSpan={3} />
                  <Table.Summary.Cell index={7} align="right">
                    <Text strong style={{ fontFamily: "monospace" }}>
                      {totalVal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} />
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
