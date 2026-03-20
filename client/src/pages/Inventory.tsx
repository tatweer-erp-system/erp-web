import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { stockService, warehousesService } from "@/services/inventory.service";
import { StockStatus } from "@/constants/enums";
import type {
  StockLevel,
  LowStockAlert,
  DropdownItem,
} from "@/types/modules/inventory";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Select,
  Tooltip,
  Typography,
  Alert,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  AlertOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Status configuration ─────────────────────────────────────────────────────

const STATUS_CFG: Record<
  StockStatus,
  {
    color: string;
    icon: React.ReactNode;
    labelKey: string;
    hex: string;
  }
> = {
  [StockStatus.IN_STOCK]: {
    color: "success",
    icon: <CheckCircleOutlined />,
    labelKey: "inventory.inStock",
    hex: "#10b981",
  },
  [StockStatus.LOW_STOCK]: {
    color: "warning",
    icon: <WarningOutlined />,
    labelKey: "inventory.lowStockAlert",
    hex: "#f59e0b",
  },
  [StockStatus.OUT_OF_STOCK]: {
    color: "error",
    icon: <CloseCircleOutlined />,
    labelKey: "inventory.outOfStock",
    hex: "#ef4444",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStatus(quantity: number, reorderPoint?: number): StockStatus {
  if (quantity <= 0) return StockStatus.OUT_OF_STOCK;
  if (reorderPoint && quantity <= reorderPoint) return StockStatus.LOW_STOCK;
  return StockStatus.IN_STOCK;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Inventory() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: stockRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.STOCK_LEVELS,
      pagination.page,
      pagination.limit,
      debouncedSearch,
      warehouseFilter,
    ],
    queryFn: () =>
      stockService.getStockLevels({
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
        ...(warehouseFilter !== "all" ? { warehouseId: warehouseFilter } : {}),
      }),
    staleTime: 30_000,
  });

  const { data: lowStockRaw } = useQuery({
    queryKey: [QUERY_KEYS.LOW_STOCK_ALERTS],
    queryFn: () => stockService.getLowStockAlerts(),
    staleTime: 60_000,
  });

  const { data: warehouseDropdownRaw } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES_DROPDOWN],
    queryFn: () => warehousesService.dropdown(),
    staleTime: 120_000,
  });

  // ── Derived data ──────────────────────────────────────────────────────────

  const allItems: StockLevel[] = useMemo(() => {
    return stockRaw?.data ?? [];
  }, [stockRaw]);

  const meta = useMemo(() => {
    return stockRaw?.meta;
  }, [stockRaw]);

  const lowStockAlerts: LowStockAlert[] = useMemo(() => {
    return (lowStockRaw as LowStockAlert[]) ?? [];
  }, [lowStockRaw]);

  const warehouseOptions: DropdownItem[] = useMemo(() => {
    return (warehouseDropdownRaw as DropdownItem[]) ?? [];
  }, [warehouseDropdownRaw]);

  // Apply client-side status filter (status is computed, not from API)
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return allItems;
    return allItems.filter(item => {
      const status = computeStatus(
        Number(item.quantity),
        item.reorderPoint ? Number(item.reorderPoint) : undefined
      );
      return status === statusFilter;
    });
  }, [allItems, statusFilter]);

  // ── KPI values (computed from fetched data) ────────────────────────────────

  const kpiTotal = meta?.total ?? allItems.length;
  const kpiOutOfStock = allItems.filter(i => Number(i.quantity) <= 0).length;
  const kpiLowStock = allItems.filter(i => {
    const qty = Number(i.quantity);
    const rp = i.reorderPoint ? Number(i.reorderPoint) : 0;
    return qty > 0 && rp > 0 && qty <= rp;
  }).length;
  const kpiInStock = allItems.filter(i => {
    const qty = Number(i.quantity);
    const rp = i.reorderPoint ? Number(i.reorderPoint) : 0;
    return qty > 0 && (rp <= 0 || qty > rp);
  }).length;

  const alertCount = lowStockAlerts.length;

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: TableColumnsType<StockLevel> = [
    {
      title: t("inventory.product", lang),
      key: "product",
      render: (_, rec) => {
        const productName = getName({
          nameEn: rec.productNameEn,
          nameAr: rec.productNameAr,
        });
        return (
          <div>
            <Text strong>{productName}</Text>
            {rec.productSku && (
              <div>
                <Tag
                  style={{
                    fontSize: 11,
                    borderRadius: 4,
                    marginTop: 2,
                    fontFamily: "monospace",
                  }}
                >
                  {rec.productSku}
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: t("inventory.category", lang),
      key: "category",
      render: (_, rec) => {
        const catName = getName({
          nameEn: rec.categoryNameEn,
          nameAr: rec.categoryNameAr,
        });
        return catName ? (
          <Tag style={{ borderRadius: 4 }}>{catName}</Tag>
        ) : (
          <Text type="secondary">--</Text>
        );
      },
    },
    {
      title: t("inventory.warehouse", lang),
      key: "warehouse",
      render: (_, rec) => {
        const whName = getName({
          nameEn: rec.warehouseNameEn,
          nameAr: rec.warehouseNameAr,
        });
        return whName ? (
          <Text>{whName}</Text>
        ) : (
          <Text type="secondary">--</Text>
        );
      },
    },
    {
      title: t("inventory.quantity", lang),
      dataIndex: "quantity",
      width: 120,
      render: (v: number, rec) => {
        const qty = Number(v ?? 0);
        const status = computeStatus(
          qty,
          rec.reorderPoint ? Number(rec.reorderPoint) : undefined
        );
        const cfg = STATUS_CFG[status];
        return (
          <Text strong style={{ color: cfg.hex, fontFamily: "monospace" }}>
            {qty.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: t("inventory.reserved", lang),
      dataIndex: "reservedQuantity",
      width: 110,
      render: (v: number) => {
        const reserved = Number(v ?? 0);
        return (
          <Text style={{ fontFamily: "monospace" }}>
            {reserved.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: t("inventory.available", lang),
      key: "available",
      width: 110,
      render: (_, rec) => {
        const available = Number(rec.quantity) - Number(rec.reservedQuantity);
        return (
          <Text
            strong
            style={{
              fontFamily: "monospace",
              color:
                available > 0
                  ? "#10b981"
                  : available < 0
                    ? "#ef4444"
                    : undefined,
            }}
          >
            {available.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: t("inventory.averageCost", lang),
      dataIndex: "averageCost",
      width: 130,
      render: (v: number) => {
        const cost = Number(v ?? 0);
        return (
          <Text style={{ fontFamily: "monospace" }}>
            {cost.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("inventory.status", lang),
      key: "status",
      width: 140,
      render: (_, rec) => {
        const qty = Number(rec.quantity);
        const rp = rec.reorderPoint ? Number(rec.reorderPoint) : undefined;
        const status = computeStatus(qty, rp);
        const cfg = STATUS_CFG[status];
        return (
          <Tag
            icon={cfg.icon}
            color={cfg.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {t(cfg.labelKey, lang)}
          </Tag>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      currentPage="Inventory"
      breadcrumbs={[
        { label: t("inventory.title", lang), href: "/" },
        { label: t("inventory.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Low Stock Alert Banner ──────────────────────────────────── */}
        {alertCount > 0 && (
          <Alert
            type="warning"
            showIcon
            icon={<AlertOutlined />}
            title={t("inventory.lowStockBanner", lang).replace(
              "{count}",
              String(alertCount)
            )}
            closable
          />
        )}

        {/* ── KPI Cards ──────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("inventory.totalSKUs", lang),
              value: kpiTotal,
              suffix: t("inventory.skusTracked", lang),
              icon: <ShopOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("inventory.lowStockAlerts", lang),
              value: kpiLowStock,
              suffix: t("inventory.needReordering", lang),
              icon: <AlertOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("inventory.outOfStockCount", lang),
              value: kpiOutOfStock,
              suffix: t("inventory.urgentAction", lang),
              icon: <StopOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
            {
              title: t("inventory.inStockCount", lang),
              value: kpiInStock,
              suffix: t("inventory.healthyItems", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
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
                      styles={{ content: {
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      } }}
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

        {/* ── Toolbar Card ──────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div />

            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("inventory.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("inventory.filter", lang)}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFilterOpen(!filterOpen)}
                  type={filterOpen ? "primary" : "default"}
                />
              </Tooltip>
              <Tooltip title={t("inventory.reload", lang)}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    refetch();
                    queryClient.invalidateQueries({
                      queryKey: [QUERY_KEYS.LOW_STOCK_ALERTS],
                    });
                  }}
                />
              </Tooltip>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <Select
                    value={warehouseFilter}
                    onChange={v => {
                      setWarehouseFilter(v);
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    style={{ width: "100%" }}
                    options={[
                      {
                        value: "all",
                        label: t("inventory.allWarehouses", lang),
                      },
                      ...warehouseOptions.map(w => ({
                        value: w.id,
                        label: getName(w),
                      })),
                    ]}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Select
                    value={statusFilter}
                    onChange={v => setStatusFilter(v)}
                    style={{ width: "100%" }}
                    options={[
                      {
                        value: "all",
                        label: t("inventory.allStatuses", lang),
                      },
                      {
                        value: StockStatus.IN_STOCK,
                        label: t("inventory.inStock", lang),
                      },
                      {
                        value: StockStatus.LOW_STOCK,
                        label: t("inventory.lowStockAlert", lang),
                      },
                      {
                        value: StockStatus.OUT_OF_STOCK,
                        label: t("inventory.outOfStock", lang),
                      },
                    ]}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* ── Table ─────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: meta?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}--${range[1]} ${t("common.of", lang)} ${total}`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) =>
                setPagination({ page, limit: pageSize }),
            }}
            locale={{
              emptyText: t("inventory.noData", lang),
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
