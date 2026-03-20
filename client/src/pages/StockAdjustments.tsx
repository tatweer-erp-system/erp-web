import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  adjustmentsService,
  productsService,
  warehousesService,
} from "@/services/inventory.service";
import type {
  StockAdjustment,
  CreateAdjustmentDto,
  DropdownItem,
} from "@/types/modules/inventory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Drawer,
  Form,
  Select,
  Tooltip,
  Typography,
  InputNumber,
  Input,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function StockAdjustments() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const isRTL = lang === "ar";
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const debouncedSearch = useDebounce(searchText, 400);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: adjustmentsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.STOCK_ADJUSTMENTS],
    queryFn: () => adjustmentsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allAdjustments: StockAdjustment[] = useMemo(() => {
    return adjustmentsRaw?.data ?? [];
  }, [adjustmentsRaw]);

  const { data: productsDropdown } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "dropdown"],
    queryFn: () => productsService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  const productOptions = useMemo(() => {
    const list = (productsDropdown as DropdownItem[] | undefined) ?? [];
    return list.map(p => ({
      value: p.id,
      label: getName(p),
    }));
  }, [productsDropdown]);

  const { data: warehousesDropdown } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES_DROPDOWN],
    queryFn: () => warehousesService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  const warehouseOptions = useMemo(() => {
    const list = (warehousesDropdown as DropdownItem[] | undefined) ?? [];
    return list.map(w => ({
      value: w.id,
      label: getName(w),
    }));
  }, [warehousesDropdown]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const adjustments = useMemo(() => {
    if (!debouncedSearch.trim()) return allAdjustments;
    const q = debouncedSearch.trim().toLowerCase();
    return allAdjustments.filter(
      a =>
        (a.productNameEn ?? "").toLowerCase().includes(q) ||
        (a.productNameAr ?? "").toLowerCase().includes(q) ||
        (a.productSku ?? "").toLowerCase().includes(q) ||
        (a.warehouseNameEn ?? "").toLowerCase().includes(q) ||
        (a.warehouseNameAr ?? "").toLowerCase().includes(q) ||
        (a.reason ?? "").toLowerCase().includes(q)
    );
  }, [allAdjustments, debouncedSearch]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allAdjustments.length;
  const kpiIncreases = allAdjustments.filter(
    a => Number(a.quantity) > 0
  ).length;
  const kpiDecreases = allAdjustments.filter(
    a => Number(a.quantity) < 0
  ).length;

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STOCK_ADJUSTMENTS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateAdjustmentDto) => adjustmentsService.create(dto),
    onSuccess: () => {
      notification.success({
        message: t("inventory.adjustments.created", lang),
      });
      invalidate();
      closeDrawer();
    },
    onError: () => {
      notification.error({
        message: t("inventory.adjustments.createError", lang),
      });
    },
  });

  // ── Drawer helpers ─────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    form.resetFields();
  }, [form]);

  // ── Submit handler ────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        productId: values.productId,
        warehouseId: values.warehouseId,
        quantity: values.quantity,
        reason: values.reason,
        unitCost: values.unitCost ?? undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<StockAdjustment> = [
    {
      title: t("inventory.adjustments.date", lang),
      dataIndex: "createdAt",
      width: 140,
      render: (v: string) =>
        v ? (
          <Text style={{ fontSize: 13 }}>
            {dayjs(v).format("YYYY-MM-DD HH:mm")}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("inventory.adjustments.product", lang),
      dataIndex: "productNameEn",
      render: (_, rec) => (
        <div>
          <Text strong style={{ color: token.colorPrimary }}>
            {lang === "ar"
              ? (rec.productNameAr ?? rec.productNameEn ?? "—")
              : (rec.productNameEn ?? rec.productNameAr ?? "—")}
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
      title: t("inventory.adjustments.warehouse", lang),
      dataIndex: "warehouseNameEn",
      render: (_, rec) => (
        <Text>
          {lang === "ar"
            ? (rec.warehouseNameAr ?? rec.warehouseNameEn ?? "—")
            : (rec.warehouseNameEn ?? rec.warehouseNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("inventory.adjustments.quantity", lang),
      dataIndex: "quantity",
      align: "center",
      width: 130,
      render: (v: number) => {
        const num = Number(v ?? 0);
        const isPositive = num > 0;
        const isNegative = num < 0;
        const icon = isPositive ? (
          <ArrowUpOutlined style={{ fontSize: 12, marginInlineEnd: 4 }} />
        ) : isNegative ? (
          <ArrowDownOutlined style={{ fontSize: 12, marginInlineEnd: 4 }} />
        ) : null;

        return (
          <Tag
            color={isPositive ? "green" : isNegative ? "red" : "default"}
            style={{ borderRadius: 20, padding: "2px 12px", fontWeight: 600 }}
          >
            {icon}
            {isPositive ? `+${num}` : num}
          </Tag>
        );
      },
    },
    {
      title: t("inventory.adjustments.reason", lang),
      dataIndex: "reason",
      ellipsis: true,
      render: (v: string) =>
        v ? <Text>{v}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: t("inventory.adjustments.unitCost", lang),
      dataIndex: "unitCost",
      align: "end",
      width: 120,
      render: (v: number | null | undefined) => {
        if (v == null) return <Text type="secondary">—</Text>;
        return (
          <Text style={{ fontFamily: "monospace" }}>
            {Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("inventory.adjustments.beforeAfter", lang),
      dataIndex: "quantityBefore",
      align: "center",
      width: 140,
      render: (_, rec) => (
        <Text style={{ fontFamily: "monospace", fontSize: 13 }}>
          <span style={{ color: token.colorTextQuaternary }}>
            {Number(rec.quantityBefore ?? 0)}
          </span>
          <span style={{ margin: "0 6px", color: token.colorTextQuaternary }}>
            {"\u2192"}
          </span>
          <span style={{ fontWeight: 600 }}>
            {Number(rec.quantityAfter ?? 0)}
          </span>
        </Text>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="StockAdjustments"
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        { label: t("inventory.title", lang), href: "#" },
        { label: t("inventory.adjustments.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("inventory.adjustments.totalAdjustments", lang),
              value: kpiTotal,
              suffix: t("inventory.adjustments.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("inventory.adjustments.increases", lang),
              value: kpiIncreases,
              suffix: t("inventory.adjustments.increases", lang),
              icon: <RiseOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("inventory.adjustments.decreases", lang),
              value: kpiDecreases,
              suffix: t("inventory.adjustments.decreases", lang),
              icon: <FallOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={8}>
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
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("inventory.adjustments.new", lang)}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("inventory.adjustments.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("common.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={adjustments}
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
              emptyText: t("inventory.adjustments.title", lang) + " — 0",
            }}
            onRow={rec => {
              const num = Number(rec.quantity ?? 0);
              return {
                style: {
                  borderInlineStart: `3px solid ${num > 0 ? "#10b981" : num < 0 ? "#ef4444" : "transparent"}`,
                },
              };
            }}
          />
        </Card>
      </Space>

      {/* ── Create Drawer ───────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        destroyOnClose
        keyboard
        placement={isMobile ? "bottom" : isRTL ? "left" : "right"}
        width={isMobile ? "100%" : 520}
        height={isMobile ? "90%" : undefined}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <PlusOutlined />
            <span style={{ fontWeight: 600 }}>
              {t("inventory.adjustments.new", lang)}
            </span>
          </div>
        }
        styles={{
          header: {
            background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
          },
          body: { direction: isRTL ? "rtl" : "ltr" },
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button onClick={closeDrawer} disabled={createMutation.isPending}>
              {t("inventory.adjustments.cancel", lang)}
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending}
            >
              {t("inventory.adjustments.create", lang)}
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("inventory.adjustments.product", lang)}
            name="productId"
            rules={[
              {
                required: true,
                message: t("inventory.adjustments.productRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("inventory.adjustments.selectProduct", lang)}
              options={productOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.adjustments.warehouse", lang)}
            name="warehouseId"
            rules={[
              {
                required: true,
                message: t("inventory.adjustments.warehouseRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("inventory.adjustments.selectWarehouse", lang)}
              options={warehouseOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.adjustments.quantity", lang)}
            name="quantity"
            rules={[
              {
                required: true,
                message: t("inventory.adjustments.quantityRequired", lang),
              },
              {
                validator: (_, value) =>
                  value !== 0
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          t("inventory.adjustments.quantityNonZero", lang)
                        )
                      ),
              },
            ]}
            extra={t("inventory.adjustments.quantityHint", lang)}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label={t("inventory.adjustments.reason", lang)}
            name="reason"
            rules={[
              {
                required: true,
                message: t("inventory.adjustments.reasonRequired", lang),
              },
            ]}
          >
            <Input
              placeholder={t("inventory.adjustments.reasonPlaceholder", lang)}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.adjustments.unitCost", lang)}
            name="unitCost"
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder={t("inventory.adjustments.unitCostPlaceholder", lang)}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </DashboardLayout>
  );
}
