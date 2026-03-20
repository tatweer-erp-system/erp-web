import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { stockService, warehousesService } from "@/services/inventory.service";
import type { ValuationRow, DropdownItem } from "@/types/modules/inventory";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Select,
  Tooltip,
  Typography,
  Dropdown,
  Space,
  Input,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ReloadOutlined,
  FilterOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Currency formatter ──────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function InventoryValuation() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [warehouseFilter, setWarehouseFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: valuationRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.INVENTORY_VALUATION,
      warehouseFilter !== "all" ? warehouseFilter : undefined,
    ],
    queryFn: () =>
      stockService.getValuation(
        warehouseFilter !== "all" ? { warehouseId: warehouseFilter } : undefined
      ),
    staleTime: 30_000,
  });

  const allRows: ValuationRow[] = useMemo(() => {
    return valuationRaw?.data ?? [];
  }, [valuationRaw]);

  const { data: warehousesList } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES_DROPDOWN],
    queryFn: () => warehousesService.dropdown(),
    staleTime: 60_000,
  });

  const warehouseOptions = useMemo(() => {
    const list = (warehousesList as DropdownItem[] | undefined) ?? [];
    return [
      { value: "all", label: t("valuation.allWarehouses", lang) },
      ...list.map(w => ({
        value: w.id,
        label: getName(w),
      })),
    ];
  }, [warehousesList, lang]);

  // ── Filtered data ──────────────────────────────────────────────────────

  const rows = useMemo(() => {
    let filtered = [...allRows];
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          r.productNameEn?.toLowerCase().includes(q) ||
          r.productNameAr?.toLowerCase().includes(q) ||
          r.productSku?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allRows, searchText]);

  // ── KPI values ──────────────────────────────────────────────────────────

  const kpiTotalValue = useMemo(
    () => allRows.reduce((sum, r) => sum + Number(r.totalValue ?? 0), 0),
    [allRows]
  );

  const kpiTotalSKUs = allRows.length;

  const kpiAvgCost = useMemo(
    () => (kpiTotalSKUs > 0 ? kpiTotalValue / kpiTotalSKUs : 0),
    [kpiTotalValue, kpiTotalSKUs]
  );

  const kpiHighestItem = useMemo(() => {
    if (allRows.length === 0) return "—";
    const max = allRows.reduce((prev, curr) =>
      Number(curr.totalValue ?? 0) > Number(prev.totalValue ?? 0) ? curr : prev
    );
    return getName({
      nameEn: max.productNameEn,
      nameAr: max.productNameAr,
    });
  }, [allRows]);

  // ── Grand total for footer ──────────────────────────────────────────────

  const grandTotal = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.totalValue ?? 0), 0),
    [rows]
  );

  // ── Export handlers ────────────────────────────────────────────────────

  const handleExportPdf = () => {
    const params = new URLSearchParams();
    params.set("format", "pdf");
    if (warehouseFilter !== "all") params.set("warehouseId", warehouseFilter);
    try {
      window.open(`/api/v1/inventory/valuation?${params.toString()}`, "_blank");
    } catch {
      notification.error({ message: t("valuation.exportFailed", lang) });
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    params.set("format", "xlsx");
    if (warehouseFilter !== "all") params.set("warehouseId", warehouseFilter);
    try {
      window.open(`/api/v1/inventory/valuation?${params.toString()}`, "_blank");
    } catch {
      notification.error({ message: t("valuation.exportFailed", lang) });
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<ValuationRow> = [
    {
      title: t("valuation.productName", lang),
      dataIndex: "productNameEn",
      sorter: (a, b) => {
        const aName = getName({
          nameEn: a.productNameEn,
          nameAr: a.productNameAr,
        });
        const bName = getName({
          nameEn: b.productNameEn,
          nameAr: b.productNameAr,
        });
        return aName.localeCompare(bName);
      },
      render: (_, rec) => (
        <div>
          <Text strong style={{ color: token.colorPrimary }}>
            {getName({ nameEn: rec.productNameEn, nameAr: rec.productNameAr })}
          </Text>
          {rec.productSku && (
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: 12,
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
      title: t("valuation.category", lang),
      dataIndex: "categoryNameEn",
      render: (_, rec) => {
        const name = getName({
          nameEn: rec.categoryNameEn,
          nameAr: rec.categoryNameAr,
        });
        return name || <Text type="secondary">—</Text>;
      },
    },
    {
      title: t("valuation.warehouse", lang),
      dataIndex: "warehouseNameEn",
      render: (_, rec) => {
        const name = getName({
          nameEn: rec.warehouseNameEn,
          nameAr: rec.warehouseNameAr,
        });
        return name || <Text type="secondary">—</Text>;
      },
    },
    {
      title: t("valuation.quantity", lang),
      dataIndex: "quantity",
      align: "right" as const,
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>
          {Number(v ?? 0).toLocaleString()}
        </Text>
      ),
    },
    {
      title: t("valuation.averageCost", lang),
      dataIndex: "averageCost",
      align: "right" as const,
      sorter: (a, b) => Number(a.averageCost) - Number(b.averageCost),
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>
          {formatCurrency(Number(v ?? 0))}
        </Text>
      ),
    },
    {
      title: t("valuation.totalValue2", lang),
      dataIndex: "totalValue",
      align: "right" as const,
      sorter: (a, b) => Number(a.totalValue) - Number(b.totalValue),
      defaultSortOrder: "descend",
      render: (v: number) => {
        const num = Number(v ?? 0);
        return (
          <Text
            strong
            style={{
              fontFamily: "monospace",
              color: num > 0 ? "#10b981" : "inherit",
            }}
          >
            {formatCurrency(num)}
          </Text>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      currentPage="InventoryValuation"
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        { label: t("inventory.title", lang), href: "#" },
        { label: t("valuation.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("valuation.totalValue", lang),
              value: kpiTotalValue,
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: kpiTotalValue > 0 ? "#10b981" : undefined,
              isCurrency: true,
            },
            {
              title: t("valuation.totalSKUs", lang),
              value: kpiTotalSKUs,
              suffix: "",
              icon: <ShoppingOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: undefined,
              isCurrency: false,
            },
            {
              title: t("valuation.avgCostPerSKU", lang),
              value: kpiAvgCost,
              suffix: "SAR",
              icon: <BarChartOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: undefined,
              isCurrency: true,
            },
            {
              title: t("valuation.highestValueItem", lang),
              value: 0,
              suffix: "",
              icon: <TrophyOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: undefined,
              isCurrency: false,
              customValue: kpiHighestItem,
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
                    {"customValue" in s && s.customValue ? (
                      <Text
                        strong
                        style={{
                          fontSize: 18,
                          lineHeight: 1.2,
                          display: "block",
                        }}
                      >
                        {s.customValue}
                      </Text>
                    ) : (
                      <Statistic
                        value={s.value}
                        precision={s.isCurrency ? 2 : 0}
                        styles={{ content: {
                          fontSize: 24,
                          lineHeight: 1,
                          color: s.color ?? "inherit",
                        } }}
                      />
                    )}
                    {s.suffix && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.suffix}
                      </Text>
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

        {/* ── Toolbar Card ───────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div />

            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("valuation.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("valuation.filter", lang)}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFilterOpen(!filterOpen)}
                  type={filterOpen ? "primary" : "default"}
                />
              </Tooltip>
              <Tooltip title={t("valuation.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "pdf",
                      label: "PDF",
                      icon: <FilePdfOutlined />,
                      onClick: handleExportPdf,
                    },
                    {
                      key: "excel",
                      label: "Excel",
                      icon: <FileExcelOutlined />,
                      onClick: handleExportExcel,
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  {t("products.export", lang)}
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* Filter Panel */}
          {filterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <Select
                    value={warehouseFilter}
                    onChange={v => setWarehouseFilter(v)}
                    style={{ width: "100%" }}
                    options={warehouseOptions}
                  />
                </Col>
              </Row>
            </div>
          )}
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="productId"
            columns={columns}
            dataSource={rows}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} ${t("common.of", lang)} ${total}`,
              pageSizeOptions: ["10", "25", "50", "100"],
            }}
            locale={{
              emptyText: t("valuation.noData", lang),
            }}
            summary={() => {
              if (rows.length === 0) return null;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <Text strong style={{ fontSize: 14 }}>
                        {t("valuation.grandTotal", lang)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text
                        strong
                        style={{
                          fontFamily: "monospace",
                          fontSize: 14,
                          color: "#10b981",
                        }}
                      >
                        {formatCurrency(grandTotal)} SAR
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
