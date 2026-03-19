import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { stockService, warehousesService } from "@/services/inventory.service";
import { StockMovementType, StockReferenceType } from "@/constants/enums";
import type {
  StockMovement as StockMovementRow,
  DropdownItem,
} from "@/types/modules/inventory";
import type { PaginatedResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
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
  DatePicker,
  Input,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ReloadOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Movement type → tag color ──────────────────────────────────────────────

const MOVEMENT_TYPE_COLOR: Record<string, string> = {
  [StockMovementType.PURCHASE_RECEIPT]: "green",
  [StockMovementType.SALE_DELIVERY]: "blue",
  [StockMovementType.POS_SALE]: "purple",
  [StockMovementType.INTERNAL]: "cyan",
  [StockMovementType.ADJUSTMENT]: "gold",
  [StockMovementType.OPENING]: "geekblue",
  [StockMovementType.RETURN]: "orange",
  [StockMovementType.SCRAP]: "red",
};

const MOVEMENT_TYPE_LABEL_KEY: Record<string, string> = {
  [StockMovementType.PURCHASE_RECEIPT]: "stockMovement.type.purchaseReceipt",
  [StockMovementType.SALE_DELIVERY]: "stockMovement.type.saleDelivery",
  [StockMovementType.POS_SALE]: "stockMovement.type.posSale",
  [StockMovementType.INTERNAL]: "stockMovement.type.internal",
  [StockMovementType.ADJUSTMENT]: "stockMovement.type.adjustment",
  [StockMovementType.OPENING]: "stockMovement.type.opening",
  [StockMovementType.RETURN]: "stockMovement.type.return",
  [StockMovementType.SCRAP]: "stockMovement.type.scrap",
};

const REFERENCE_TYPE_LABEL_KEY: Record<string, string> = {
  [StockReferenceType.PURCHASE_ORDER]: "stockMovement.ref.purchaseOrder",
  [StockReferenceType.SALES_ORDER]: "stockMovement.ref.salesOrder",
  [StockReferenceType.MANUAL]: "stockMovement.ref.manual",
  [StockReferenceType.TRANSFER]: "stockMovement.ref.transfer",
  [StockReferenceType.POS_ORDER]: "stockMovement.ref.posOrder",
  [StockReferenceType.ADJUSTMENT]: "stockMovement.ref.adjustment",
};

// Inbound types — positive movement
const INBOUND_TYPES: string[] = [
  StockMovementType.PURCHASE_RECEIPT,
  StockMovementType.RETURN,
  StockMovementType.OPENING,
  StockMovementType.ADJUSTMENT,
];

// Outbound types — negative movement
const OUTBOUND_TYPES: string[] = [
  StockMovementType.SALE_DELIVERY,
  StockMovementType.POS_SALE,
  StockMovementType.SCRAP,
];

// Transfer types
const TRANSFER_TYPES: string[] = [StockMovementType.INTERNAL];

// ─── Component ───────────────────────────────────────────────────────────────

export default function StockMovement() {
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
  const [searchText, setSearchText] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>(
    undefined
  );
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  // ── Queries ──────────────────────────────────────────────────────────────

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (searchText.trim()) params.search = searchText.trim();
    if (typeFilter.length > 0) params.movementType = typeFilter.join(",");
    if (warehouseFilter) params.warehouseId = warehouseFilter;
    if (dateRange?.[0]) params.startDate = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) params.endDate = dateRange[1].format("YYYY-MM-DD");
    return params;
  }, [searchText, typeFilter, warehouseFilter, dateRange, pagination]);

  const {
    data: movementsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.STOCK_MOVEMENTS, queryParams],
    queryFn: () => stockService.getMovements(queryParams as never),
    staleTime: 30_000,
  });

  const paginatedData = movementsRaw as
    | PaginatedResponse<StockMovementRow>
    | undefined;

  const movements: StockMovementRow[] = useMemo(() => {
    return paginatedData?.data ?? [];
  }, [paginatedData]);

  const totalRecords = useMemo(() => {
    return paginatedData?.meta?.total ?? movements.length;
  }, [paginatedData, movements]);

  const { data: warehousesList } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES_DROPDOWN],
    queryFn: () => warehousesService.dropdown(),
    staleTime: 60_000,
  });

  const warehouseOptions = useMemo(() => {
    const list = (warehousesList ?? []) as DropdownItem[];
    return list.map(w => ({
      value: w.id,
      label: getName(w),
    }));
  }, [warehousesList]);

  // ── KPI computation — from current dataset ──────────────────────────────

  const kpiTotal = totalRecords;

  const kpiInbound = useMemo(
    () =>
      movements.filter(
        m => INBOUND_TYPES.includes(m.movementType) && Number(m.quantity) > 0
      ).length,
    [movements]
  );

  const kpiOutbound = useMemo(
    () =>
      movements.filter(
        m =>
          OUTBOUND_TYPES.includes(m.movementType) ||
          (INBOUND_TYPES.includes(m.movementType) && Number(m.quantity) < 0)
      ).length,
    [movements]
  );

  const kpiTransfers = useMemo(
    () => movements.filter(m => TRANSFER_TYPES.includes(m.movementType)).length,
    [movements]
  );

  // ── Helpers ──────────────────────────────────────────────────────────────

  const isPositiveMovement = (record: StockMovementRow): boolean => {
    return Number(record.quantity) > 0;
  };

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "—";
    return dayjs(dateStr).format("YYYY-MM-DD HH:mm");
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<StockMovementRow> = [
    {
      title: t("stockMovement.date", lang),
      dataIndex: "createdAt",
      width: 170,
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (v: string) => (
        <Text style={{ fontSize: 13, whiteSpace: "nowrap" }}>
          {formatDate(v)}
        </Text>
      ),
    },
    {
      title: t("stockMovement.movementType", lang),
      dataIndex: "movementType",
      width: 160,
      filters: Object.entries(StockMovementType).map(([, value]) => ({
        text: t(MOVEMENT_TYPE_LABEL_KEY[value] ?? value, lang),
        value,
      })),
      onFilter: (value, record) => record.movementType === value,
      render: (v: string) => (
        <Tag
          color={MOVEMENT_TYPE_COLOR[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {t(MOVEMENT_TYPE_LABEL_KEY[v] ?? v, lang)}
        </Tag>
      ),
    },
    {
      title: t("stockMovement.product", lang),
      dataIndex: "productNameEn",
      width: 220,
      render: (_, rec) => {
        const name =
          lang === "ar"
            ? rec.productNameAr || rec.productNameEn
            : rec.productNameEn || rec.productNameAr;
        return (
          <div>
            <Text strong style={{ color: token.colorPrimary }}>
              {name ?? "—"}
            </Text>
            {rec.productSku && (
              <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                {rec.productSku}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: t("stockMovement.warehouse", lang),
      dataIndex: "warehouseNameEn",
      width: 160,
      render: (_, rec) => {
        const name =
          lang === "ar"
            ? rec.warehouseNameAr || rec.warehouseNameEn
            : rec.warehouseNameEn || rec.warehouseNameAr;
        return <Text>{name ?? "—"}</Text>;
      },
    },
    {
      title: t("stockMovement.qtyBefore", lang),
      dataIndex: "quantityBefore",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{Number(v ?? 0)}</Text>
      ),
    },
    {
      title: t("stockMovement.quantity", lang),
      dataIndex: "quantity",
      width: 120,
      align: "right" as const,
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      render: (_: number, rec: StockMovementRow) => {
        const qty = Number(rec.quantity ?? 0);
        const positive = isPositiveMovement(rec);
        return (
          <Text
            strong
            style={{
              fontFamily: "monospace",
              color: positive ? "#10b981" : "#ef4444",
            }}
          >
            {positive ? "+" : ""}
            {qty}
          </Text>
        );
      },
    },
    {
      title: t("stockMovement.qtyAfter", lang),
      dataIndex: "quantityAfter",
      width: 110,
      align: "right" as const,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{Number(v ?? 0)}</Text>
      ),
    },
    {
      title: t("stockMovement.unitCost", lang),
      dataIndex: "unitCost",
      width: 120,
      align: "right" as const,
      render: (v: number | undefined) =>
        v != null ? (
          <Text style={{ fontFamily: "monospace" }}>
            {Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("stockMovement.reference", lang),
      dataIndex: "referenceType",
      width: 180,
      render: (_, rec) => {
        if (!rec.referenceType && !rec.referenceId) {
          return <Text type="secondary">—</Text>;
        }
        return (
          <div>
            {rec.referenceType && (
              <Tag style={{ borderRadius: 4 }}>
                {t(REFERENCE_TYPE_LABEL_KEY[rec.referenceType] ?? rec.referenceType, lang)}
              </Tag>
            )}
            {rec.referenceId && (
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                {rec.referenceId}
              </Text>
            )}
          </div>
        );
      },
    },
  ];

  // ── Movement type options for filter ─────────────────────────────────────

  const movementTypeOptions = Object.entries(StockMovementType).map(
    ([, value]) => ({
      value,
      label: t(MOVEMENT_TYPE_LABEL_KEY[value] ?? value, lang),
    })
  );

  return (
    <DashboardLayout
      currentPage="StockMovement"
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        { label: t("inventory.title", lang), href: "#" },
        { label: t("stockMovement.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("stockMovement.totalMovements", lang),
              value: kpiTotal,
              suffix: t("stockMovement.movements", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("stockMovement.inbound", lang),
              value: kpiInbound,
              suffix: t("stockMovement.movements", lang),
              icon: <ArrowDownOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("stockMovement.outbound", lang),
              value: kpiOutbound,
              suffix: t("stockMovement.movements", lang),
              icon: <ArrowUpOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
            {
              title: t("stockMovement.transfers", lang),
              value: kpiTransfers,
              suffix: t("stockMovement.movements", lang),
              icon: <SwapOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
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
                      precision={0}
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

        {/* ── Toolbar Card ───────────────────────────────────────────────── */}
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
                placeholder={t("stockMovement.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onSearch={() => setPagination(p => ({ ...p, page: 1 }))}
                allowClear
                style={{ width: isMobile ? "100%" : 220 }}
              />
              <RangePicker
                value={
                  dateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
                }
                onChange={dates => {
                  setDateRange(dates);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                allowClear
                style={{ width: isMobile ? "100%" : 250 }}
              />
              <Select
                mode="multiple"
                value={typeFilter}
                onChange={v => {
                  setTypeFilter(v);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                placeholder={t("stockMovement.filterByType", lang)}
                options={movementTypeOptions}
                allowClear
                maxTagCount={2}
                style={{ minWidth: 200 }}
              />
              <Select
                value={warehouseFilter}
                onChange={v => {
                  setWarehouseFilter(v);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                placeholder={t("stockMovement.filterByWarehouse", lang)}
                options={warehouseOptions}
                allowClear
                style={{ minWidth: 180 }}
              />
            </Space>

            <Space>
              <Tooltip title={t("stockMovement.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={movements}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: totalRecords,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} ${t("stockMovement.of", lang)} ${total}`,
              pageSizeOptions: ["10", "20", "50", "100"],
              onChange: (page, pageSize) =>
                setPagination({ page, limit: pageSize }),
            }}
            locale={{
              emptyText:
                t("stockMovement.title", lang) +
                " — " +
                t("stockMovement.noData", lang),
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
