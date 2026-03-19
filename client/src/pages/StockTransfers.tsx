import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  transfersService,
  productsService,
  warehousesService,
} from "@/services/inventory.service";
import type {
  StockTransfer,
  CreateTransferDto,
  DropdownItem,
} from "@/types/modules/inventory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
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
  SwapOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function StockTransfers() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: transfersRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.STOCK_TRANSFERS],
    queryFn: () => transfersService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allTransfers: StockTransfer[] = useMemo(() => {
    return transfersRaw?.data ?? [];
  }, [transfersRaw]);

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
  const transfers = useMemo(() => {
    if (!searchText.trim()) return allTransfers;
    const q = searchText.trim().toLowerCase();
    return allTransfers.filter(
      tr =>
        (tr.productNameEn ?? "").toLowerCase().includes(q) ||
        (tr.productNameAr ?? "").toLowerCase().includes(q) ||
        (tr.productSku ?? "").toLowerCase().includes(q) ||
        (tr.sourceWarehouseNameEn ?? "").toLowerCase().includes(q) ||
        (tr.sourceWarehouseNameAr ?? "").toLowerCase().includes(q) ||
        (tr.destinationWarehouseNameEn ?? "").toLowerCase().includes(q) ||
        (tr.destinationWarehouseNameAr ?? "").toLowerCase().includes(q) ||
        (tr.notes ?? "").toLowerCase().includes(q)
    );
  }, [allTransfers, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allTransfers.length;

  const kpiThisMonth = useMemo(() => {
    const startOfMonth = dayjs().startOf("month");
    return allTransfers.filter(tr =>
      tr.createdAt ? dayjs(tr.createdAt).isAfter(startOfMonth) : false
    ).length;
  }, [allTransfers]);

  const kpiTotalUnits = useMemo(() => {
    return allTransfers.reduce((sum, tr) => sum + Number(tr.quantity ?? 0), 0);
  }, [allTransfers]);

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.STOCK_TRANSFERS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTransferDto) => transfersService.create(dto),
    onSuccess: () => {
      notification.success({
        message: t("inventory.transfers.created", lang),
      });
      invalidate();
      closeDrawer();
    },
    onError: () => {
      notification.error({
        message: t("inventory.transfers.createError", lang),
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
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        quantity: values.quantity,
        notes: values.notes ?? undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Helper: warehouse name ────────────────────────────────────────────

  const getWarehouseName = (
    nameEn: string | undefined,
    nameAr: string | undefined
  ) => {
    if (lang === "ar") return nameAr ?? nameEn ?? "—";
    return nameEn ?? nameAr ?? "—";
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<StockTransfer> = [
    {
      title: t("inventory.transfers.date", lang),
      dataIndex: "createdAt",
      width: 140,
      sorter: (a, b) =>
        new Date(a.createdAt ?? "").getTime() -
        new Date(b.createdAt ?? "").getTime(),
      defaultSortOrder: "descend",
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
      title: t("inventory.transfers.product", lang),
      dataIndex: "productNameEn",
      sorter: (a, b) => {
        const nameA =
          lang === "ar" ? (a.productNameAr ?? "") : (a.productNameEn ?? "");
        const nameB =
          lang === "ar" ? (b.productNameAr ?? "") : (b.productNameEn ?? "");
        return nameA.localeCompare(nameB);
      },
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
      title: t("inventory.transfers.route", lang),
      dataIndex: "sourceWarehouseNameEn",
      render: (_, rec) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Text>
            {getWarehouseName(
              rec.sourceWarehouseNameEn,
              rec.sourceWarehouseNameAr
            )}
          </Text>
          <ArrowRightOutlined
            style={{
              color: token.colorPrimary,
              fontSize: 14,
              flexShrink: 0,
            }}
          />
          <Text>
            {getWarehouseName(
              rec.destinationWarehouseNameEn,
              rec.destinationWarehouseNameAr
            )}
          </Text>
        </div>
      ),
    },
    {
      title: t("inventory.transfers.quantity", lang),
      dataIndex: "quantity",
      align: "center",
      width: 100,
      sorter: (a, b) => Number(a.quantity) - Number(b.quantity),
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {Number(v ?? 0)}
        </Text>
      ),
    },
    {
      title: t("inventory.transfers.notes", lang),
      dataIndex: "notes",
      ellipsis: true,
      render: (v: string | null | undefined) =>
        v ? <Text>{v}</Text> : <Text type="secondary">—</Text>,
    },
  ];

  // ── Gradient header style for drawer ──────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="StockTransfers"
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        { label: t("inventory.title", lang), href: "#" },
        { label: t("inventory.transfers.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("inventory.transfers.totalTransfers", lang),
              value: kpiTotal,
              suffix: t("inventory.transfers.title", lang),
              icon: <SwapOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("inventory.transfers.thisMonth", lang),
              value: kpiThisMonth,
              suffix: t("inventory.transfers.transfers", lang),
              icon: <CalendarOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: "#6366f1",
            },
            {
              title: t("inventory.transfers.totalUnits", lang),
              value: kpiTotalUnits,
              suffix: t("inventory.transfers.units", lang),
              icon: <InboxOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
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
                placeholder={t("inventory.transfers.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
            </Space>

            <Space>
              <Tooltip title={t("common.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("inventory.transfers.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={transfers}
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
              emptyText: t("inventory.transfers.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create Drawer ───────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        size={isMobile ? "100%" : 520}
        title={null}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={closeDrawer}>
              {t("inventory.transfers.cancel", lang)}
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending}
            >
              {t("inventory.transfers.create", lang)}
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            <SwapOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("inventory.transfers.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("inventory.transfers.product", lang)}
            name="productId"
            rules={[
              {
                required: true,
                message: t("inventory.transfers.productRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("inventory.transfers.selectProduct", lang)}
              options={productOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.transfers.sourceWarehouse", lang)}
            name="sourceWarehouseId"
            rules={[
              {
                required: true,
                message: t("inventory.transfers.sourceRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("inventory.transfers.selectSource", lang)}
              options={warehouseOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.transfers.destinationWarehouse", lang)}
            name="destinationWarehouseId"
            dependencies={["sourceWarehouseId"]}
            rules={[
              {
                required: true,
                message: t("inventory.transfers.destinationRequired", lang),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("sourceWarehouseId") !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("inventory.transfers.sameWarehouseError", lang))
                  );
                },
              }),
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("inventory.transfers.selectDestination", lang)}
              options={warehouseOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("inventory.transfers.quantity", lang)}
            name="quantity"
            rules={[
              {
                required: true,
                message: t("inventory.transfers.quantityRequired", lang),
              },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={1} precision={0} />
          </Form.Item>

          <Form.Item label={t("inventory.transfers.notes", lang)} name="notes">
            <Input.TextArea
              rows={3}
              placeholder={t("inventory.transfers.notesPlaceholder", lang)}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </DashboardLayout>
  );
}
