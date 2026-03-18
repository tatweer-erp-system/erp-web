import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { warehousesService } from "@/services/inventory.service";
import type {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
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
  Modal,
  Form,
  Select,
  Tooltip,
  Typography,
  Dropdown,
  Drawer,
  Input,
  Switch,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Warehouses() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewWarehouse, setViewWarehouse] = useState<Warehouse | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: warehousesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES],
    queryFn: () => warehousesService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allWarehouses: Warehouse[] = useMemo(() => {
    return warehousesRaw?.data ?? [];
  }, [warehousesRaw]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const warehouses = useMemo(() => {
    let filtered = [...allWarehouses];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(w => w.isActive === isActive);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        w =>
          w.nameEn.toLowerCase().includes(q) ||
          w.nameAr.toLowerCase().includes(q) ||
          (w.address ?? "").toLowerCase().includes(q) ||
          (w.city ?? "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allWarehouses, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allWarehouses.length;
  const kpiActive = allWarehouses.filter(w => w.isActive).length;
  const kpiInactive = allWarehouses.filter(w => !w.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.WAREHOUSES],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateWarehouseDto) => warehousesService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("warehouses.created", lang) });
      invalidate();
      closeDrawer();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateWarehouseDto }) =>
      warehousesService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("warehouses.updated", lang) });
      invalidate();
      closeDrawer();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => warehousesService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("warehouses.deleted", lang) });
      invalidate();
    },
  });

  // ── Drawer helpers ────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingWarehouse(null);
    form.resetFields();
    form.setFieldsValue({
      isDefault: false,
      allowNegativeStock: false,
      isActive: true,
    });
    setDrawerOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (warehouse: Warehouse) => {
      setEditingWarehouse(warehouse);
      form.setFieldsValue({
        nameEn: warehouse.nameEn,
        nameAr: warehouse.nameAr,
        address: warehouse.address ?? undefined,
        city: warehouse.city ?? undefined,
        branchId: warehouse.branchId ?? undefined,
        isDefault: warehouse.isDefault ?? false,
        allowNegativeStock: warehouse.allowNegativeStock ?? false,
        isActive: warehouse.isActive,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingWarehouse(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((warehouse: Warehouse) => {
    setViewWarehouse(warehouse);
    setViewDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingWarehouse) {
        updateMutation.mutate({
          id: editingWarehouse.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            address: values.address,
            city: values.city,
            branchId: values.branchId,
            isDefault: values.isDefault,
            allowNegativeStock: values.allowNegativeStock,
            isActive: values.isActive,
            version: editingWarehouse.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          address: values.address,
          city: values.city,
          branchId: values.branchId,
          isDefault: values.isDefault ?? false,
          allowNegativeStock: values.allowNegativeStock ?? false,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<Warehouse> = [
    {
      title: t("warehouses.nameEn", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => (
        <Space>
          <Text strong style={{ color: token.colorPrimary }}>
            {getName(rec)}
          </Text>
          {rec.isDefault && (
            <StarOutlined style={{ color: "#f59e0b", fontSize: 14 }} />
          )}
        </Space>
      ),
    },
    {
      title: t("warehouses.address", lang),
      dataIndex: "address",
      render: (v: string | undefined) =>
        v ? <Text>{v}</Text> : <Text type="secondary">{"\u2014"}</Text>,
    },
    {
      title: t("warehouses.city", lang),
      dataIndex: "city",
      render: (v: string | undefined) =>
        v ? <Text>{v}</Text> : <Text type="secondary">{"\u2014"}</Text>,
    },
    {
      title: t("warehouses.branch", lang),
      dataIndex: "branchNameEn",
      render: (_: unknown, rec: Warehouse) => {
        const branchName = lang === "ar" ? rec.branchNameAr : rec.branchNameEn;
        return branchName ? (
          <Text>{branchName}</Text>
        ) : (
          <Text type="secondary">{"\u2014"}</Text>
        );
      },
    },
    {
      title: t("warehouses.allowNegativeStock", lang),
      dataIndex: "allowNegativeStock",
      align: "center",
      render: (v: boolean | undefined) => (
        <Tag
          color={v ? "orange" : "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v ? t("warehouses.yes", lang) : t("warehouses.no", lang)}
        </Tag>
      ),
    },
    {
      title: t("warehouses.isActive", lang),
      dataIndex: "isActive",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "red"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v ? t("warehouses.active", lang) : t("warehouses.inactive", lang)}
        </Tag>
      ),
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const items = [
          {
            key: "view",
            label: t("warehouses.edit", lang).replace(
              t("warehouses.edit", lang),
              t("warehouses.title", lang)
            ),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("warehouses.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("warehouses.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("warehouses.delete", lang),
                content: t("warehouses.deleteConfirm", lang),
                okButtonProps: { danger: true },
                onOk: () => deleteMutation.mutate(rec.id),
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ── Gradient header style for drawer ────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="Warehouses"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Inventory", href: "#" },
        { label: t("warehouses.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("warehouses.total", lang),
              value: kpiTotal,
              suffix: t("warehouses.title", lang),
              icon: <HomeOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("warehouses.totalActive", lang),
              value: kpiActive,
              suffix: t("warehouses.active", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("warehouses.totalInactive", lang),
              value: kpiInactive,
              suffix: t("warehouses.inactive", lang),
              icon: <CloseCircleOutlined />,
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
                placeholder={t("warehouses.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("warehouses.allStatuses", lang),
                  },
                  {
                    value: "active",
                    label: t("warehouses.active", lang),
                  },
                  {
                    value: "inactive",
                    label: t("warehouses.inactive", lang),
                  },
                ]}
              />
            </Space>

            <Space>
              <Tooltip title="Reload">
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("warehouses.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={warehouses}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["5", "10", "25", "50"],
            }}
            locale={{
              emptyText: t("warehouses.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Drawer ──────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        width={isMobile ? "100%" : 560}
        destroyOnClose
        title={null}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={closeDrawer}>
              {t("warehouses.delete", lang).replace(
                t("warehouses.delete", lang),
                "Cancel"
              )}
            </Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingWarehouse
                ? t("warehouses.edit", lang)
                : t("warehouses.new", lang)}
            </Button>
          </div>
        }
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingWarehouse ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingWarehouse
                ? `${t("warehouses.edit", lang)} — ${getName(editingWarehouse)}`
                : t("warehouses.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("warehouses.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("warehouses.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("warehouses.address", lang)} name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("warehouses.city", lang)} name="city">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("warehouses.branchId", lang)} name="branchId">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("warehouses.isDefault", lang)}
                name="isDefault"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("warehouses.allowNegativeStock", lang)}
                name="allowNegativeStock"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("warehouses.isActive", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* ── View Detail Drawer ────────────────────────────────────────── */}
      <Drawer
        open={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setViewWarehouse(null);
        }}
        width={isMobile ? "100%" : 560}
        title={
          viewWarehouse
            ? `${t("warehouses.title", lang)} — ${getName(viewWarehouse)}`
            : ""
        }
      >
        {viewWarehouse && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewWarehouse.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewWarehouse.nameAr}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.address", lang)}</Text>
                <br />
                <Text>{viewWarehouse.address ?? "\u2014"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.city", lang)}</Text>
                <br />
                <Text>{viewWarehouse.city ?? "\u2014"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.branch", lang)}</Text>
                <br />
                <Text>
                  {(lang === "ar"
                    ? viewWarehouse.branchNameAr
                    : viewWarehouse.branchNameEn) ?? "\u2014"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.isDefault", lang)}</Text>
                <br />
                {viewWarehouse.isDefault ? (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    <StarOutlined style={{ marginInlineEnd: 4 }} />
                    {t("warehouses.default", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">{"\u2014"}</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("warehouses.allowNegativeStock", lang)}
                </Text>
                <br />
                <Tag
                  color={
                    viewWarehouse.allowNegativeStock ? "orange" : "default"
                  }
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewWarehouse.allowNegativeStock
                    ? t("warehouses.yes", lang)
                    : t("warehouses.no", lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("warehouses.isActive", lang)}</Text>
                <br />
                <Tag
                  color={viewWarehouse.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewWarehouse.isActive
                    ? t("warehouses.active", lang)
                    : t("warehouses.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setViewDrawerOpen(false);
                  openEdit(viewWarehouse);
                }}
              >
                {t("warehouses.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("warehouses.delete", lang),
                    content: t("warehouses.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewWarehouse.id);
                      setViewDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("warehouses.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
