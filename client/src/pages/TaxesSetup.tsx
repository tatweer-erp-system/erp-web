import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  taxesService,
  taxGroupsService,
  accountsService,
} from "@/services/accounting.service";
import { TaxType, TaxScope } from "@/constants/enums";
import type {
  Tax,
  CreateTaxDto,
  UpdateTaxDto,
  TaxGroup,
  CreateTaxGroupDto,
  UpdateTaxGroupDto,
} from "@/types/modules/accounting";
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
  InputNumber,
  Switch,
  Tabs,
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
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const TYPE_TAG: Record<TaxType, { color: string; i18nKey: string }> = {
  [TaxType.PERCENTAGE]: {
    color: "blue",
    i18nKey: "accounting.tax.percentage",
  },
  [TaxType.FIXED]: {
    color: "orange",
    i18nKey: "accounting.tax.fixed",
  },
};

const SCOPE_TAG: Record<TaxScope, { color: string; i18nKey: string }> = {
  [TaxScope.SALE]: {
    color: "green",
    i18nKey: "accounting.tax.scopeSale",
  },
  [TaxScope.PURCHASE]: {
    color: "orange",
    i18nKey: "accounting.tax.scopePurchase",
  },
  [TaxScope.BOTH]: {
    color: "blue",
    i18nKey: "accounting.tax.scopeBoth",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TaxesSetup() {
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

  const [activeTab, setActiveTab] = useState("taxes");

  // ── Gradient header style for modal ────────────────────────────────────
  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="TaxesSetup"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.tax.title", lang) },
      ]}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "taxes",
            label: t("accounting.tax.title", lang),
            children: (
              <TaxesTab
                lang={lang}
                token={token}
                isMobile={isMobile}
                gradientHeader={gradientHeader}
                queryClient={queryClient}
              />
            ),
          },
          {
            key: "tax-groups",
            label: t("accounting.tg.title", lang),
            children: (
              <TaxGroupsTab
                lang={lang}
                token={token}
                isMobile={isMobile}
                gradientHeader={gradientHeader}
                queryClient={queryClient}
              />
            ),
          },
        ]}
      />
    </DashboardLayout>
  );
}

// ─── Taxes Tab ───────────────────────────────────────────────────────────────

interface TabProps {
  lang: string;
  token: { colorPrimary: string; colorTextQuaternary: string };
  isMobile: boolean;
  gradientHeader: React.CSSProperties;
  queryClient: ReturnType<typeof useQueryClient>;
}

function TaxesTab({
  lang,
  token,
  isMobile,
  gradientHeader,
  queryClient,
}: TabProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<Tax | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewTax, setViewTax] = useState<Tax | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: taxesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TAXES_LIST],
    queryFn: () => taxesService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allTaxes: Tax[] = useMemo(
    () => taxesRaw?.data ?? [],
    [taxesRaw]
  );

  // Tax groups for the dropdown in the form
  const { data: taxGroupsRaw } = useQuery({
    queryKey: [QUERY_KEYS.TAX_GROUPS_LIST],
    queryFn: () => taxGroupsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const taxGroupOptions = useMemo(() => {
    const list: TaxGroup[] = taxGroupsRaw?.data ?? [];
    return list.map(g => ({
      value: g.id,
      label: getName(g),
    }));
  }, [taxGroupsRaw]);

  // Accounts for sale/purchase account dropdowns
  const { data: accountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const accountOptions = useMemo(() => {
    const list = (accountsList?.data ?? []) as {
      id: string;
      code: string;
      nameEn: string;
      nameAr: string;
    }[];
    return list.map(a => ({
      value: a.id,
      label: `${a.code} — ${getName(a)}`,
    }));
  }, [accountsList]);

  // ── Filtered data ────────────────────────────────────────────────────────
  const taxes = useMemo(() => {
    let filtered = [...allTaxes];
    if (scopeFilter !== "all") {
      filtered = filtered.filter(tx => tx.scope === scopeFilter);
    }
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(tx => tx.isActive === isActive);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.nameEn.toLowerCase().includes(q) ||
          tx.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allTaxes, scopeFilter, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allTaxes.length;
  const kpiActive = allTaxes.filter(tx => tx.isActive).length;
  const kpiInactive = allTaxes.filter(tx => !tx.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAXES_LIST] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTaxDto) => taxesService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.tax.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxDto }) =>
      taxesService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.tax.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxesService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("accounting.tax.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingTax(null);
    form.resetFields();
    form.setFieldsValue({
      type: TaxType.PERCENTAGE,
      scope: TaxScope.BOTH,
      isActive: true,
      includeInPrice: false,
      amount: 15,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (tax: Tax) => {
      setEditingTax(tax);
      form.setFieldsValue({
        nameEn: tax.nameEn,
        nameAr: tax.nameAr,
        type: tax.type,
        amount: Number(tax.amount),
        scope: tax.scope,
        includeInPrice: tax.includeInPrice,
        taxGroupId: tax.taxGroupId ?? undefined,
        saleAccountId: tax.saleAccountId ?? undefined,
        purchaseAccountId: tax.purchaseAccountId ?? undefined,
        isActive: tax.isActive,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTax(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((tax: Tax) => {
    setViewTax(tax);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTax) {
        updateMutation.mutate({
          id: editingTax.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            type: values.type,
            amount: values.amount,
            scope: values.scope,
            includeInPrice: values.includeInPrice,
            taxGroupId: values.taxGroupId,
            saleAccountId: values.saleAccountId,
            purchaseAccountId: values.purchaseAccountId,
            isActive: values.isActive,
            version: editingTax.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          type: values.type,
          amount: values.amount,
          scope: values.scope,
          includeInPrice: values.includeInPrice ?? false,
          taxGroupId: values.taxGroupId,
          saleAccountId: values.saleAccountId,
          purchaseAccountId: values.purchaseAccountId,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<Tax> = [
    {
      title: t("accounting.tax.name", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text strong>{getName(rec)}</Text>,
    },
    {
      title: t("accounting.tax.type", lang),
      dataIndex: "type",
      render: (v: TaxType) => {
        const cfg = TYPE_TAG[v];
        return cfg ? (
          <Tag
            color={cfg.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {t(cfg.i18nKey, lang)}
          </Tag>
        ) : (
          v
        );
      },
    },
    {
      title: t("accounting.tax.amount", lang),
      dataIndex: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (v: number, rec) => (
        <Text style={{ fontFamily: "monospace" }}>
          {Number(v).toFixed(2)}
          {rec.type === TaxType.PERCENTAGE ? "%" : ""}
        </Text>
      ),
    },
    {
      title: t("accounting.tax.scope", lang),
      dataIndex: "scope",
      render: (v: TaxScope) => {
        const cfg = SCOPE_TAG[v];
        return cfg ? (
          <Tag
            color={cfg.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {t(cfg.i18nKey, lang)}
          </Tag>
        ) : (
          v
        );
      },
    },
    {
      title: t("accounting.tax.includeInPrice", lang),
      dataIndex: "includeInPrice",
      render: (v: boolean) => (
        <Text type="secondary">
          {v ? t("accounting.tax.yes", lang) : t("accounting.tax.no", lang)}
        </Text>
      ),
    },
    {
      title: t("accounting.tax.taxGroup", lang),
      dataIndex: "taxGroupNameEn",
      render: (_: string | undefined, rec) => {
        if (!rec.taxGroupNameEn && !rec.taxGroupNameAr) {
          return <Text type="secondary">—</Text>;
        }
        const name = lang === "ar" ? rec.taxGroupNameAr : rec.taxGroupNameEn;
        return <Text>{name || "—"}</Text>;
      },
    },
    {
      title: t("accounting.tax.status", lang),
      dataIndex: "isActive",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "red"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v
            ? t("accounting.tax.active", lang)
            : t("accounting.tax.inactive", lang)}
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
            label: t("accounting.tax.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("accounting.tax.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("accounting.tax.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("accounting.tax.delete", lang),
                content: t("accounting.tax.deleteConfirm", lang),
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

  return (
    <Space orientation="vertical" size={20} style={{ width: "100%" }}>
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: t("accounting.tax.total", lang),
            value: kpiTotal,
            suffix: t("accounting.tax.title", lang),
            icon: <FileTextOutlined />,
            iconColor: token.colorPrimary,
            iconBg: `${token.colorPrimary}15`,
            color: undefined,
          },
          {
            title: t("accounting.tax.totalActive", lang),
            value: kpiActive,
            suffix: t("accounting.tax.active", lang),
            icon: <CheckCircleOutlined />,
            iconColor: "#10b981",
            iconBg: "#10b98115",
            color: "#10b981",
          },
          {
            title: t("accounting.tax.totalInactive", lang),
            value: kpiInactive,
            suffix: t("accounting.tax.inactive", lang),
            icon: <CloseCircleOutlined />,
            iconColor: "#ef4444",
            iconBg: "#ef444415",
            color: "#ef4444",
          },
        ].map(s => (
          <Col key={s.title} xs={24} sm={12} lg={8}>
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
              placeholder={t("accounting.tax.search", lang)}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              value={scopeFilter}
              onChange={v => setScopeFilter(v)}
              style={{ width: 160 }}
              suffixIcon={<FilterOutlined />}
              options={[
                {
                  value: "all",
                  label: t("accounting.tax.allScopes", lang),
                },
                {
                  value: TaxScope.SALE,
                  label: t("accounting.tax.scopeSale", lang),
                },
                {
                  value: TaxScope.PURCHASE,
                  label: t("accounting.tax.scopePurchase", lang),
                },
                {
                  value: TaxScope.BOTH,
                  label: t("accounting.tax.scopeBoth", lang),
                },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={v => setStatusFilter(v)}
              style={{ width: 160 }}
              suffixIcon={<FilterOutlined />}
              options={[
                {
                  value: "all",
                  label: t("accounting.tax.allStatuses", lang),
                },
                {
                  value: "active",
                  label: t("accounting.tax.active", lang),
                },
                {
                  value: "inactive",
                  label: t("accounting.tax.inactive", lang),
                },
              ]}
            />
          </Space>

          <Space>
            <Tooltip title="Reload">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("accounting.tax.new", lang)}
            </Button>
          </Space>
        </div>
      </Card>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={taxes}
          loading={isLoading}
          size="middle"
          scroll={{ x: "max-content" }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
            pageSizeOptions: ["5", "10", "25", "50"],
          }}
          locale={{
            emptyText: t("accounting.tax.title", lang) + " — 0",
          }}
        />
      </Card>

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingTax
            ? t("accounting.tax.edit", lang)
            : t("accounting.tax.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingTax ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingTax
                ? `${t("accounting.tax.edit", lang)} — ${getName(editingTax)}`
                : t("accounting.tax.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.tax.type", lang)}
                name="type"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: TaxType.PERCENTAGE,
                      label: t("accounting.tax.percentage", lang),
                    },
                    {
                      value: TaxType.FIXED,
                      label: t("accounting.tax.fixed", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.tax.amount", lang)}
                name="amount"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.tax.scope", lang)}
                name="scope"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: TaxScope.SALE,
                      label: t("accounting.tax.scopeSale", lang),
                    },
                    {
                      value: TaxScope.PURCHASE,
                      label: t("accounting.tax.scopePurchase", lang),
                    },
                    {
                      value: TaxScope.BOTH,
                      label: t("accounting.tax.scopeBoth", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.taxGroup", lang)}
                name="taxGroupId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={taxGroupOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.includeInPrice", lang)}
                name="includeInPrice"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.saleAccount", lang)}
                name="saleAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={accountOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.purchaseAccount", lang)}
                name="purchaseAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={accountOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.status", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewTax(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewTax
            ? `${t("accounting.tax.details", lang)} — ${getName(viewTax)}`
            : ""
        }
      >
        {viewTax && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewTax.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewTax.nameAr}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.type", lang)}</Text>
                <br />
                {TYPE_TAG[viewTax.type] && (
                  <Tag
                    color={TYPE_TAG[viewTax.type].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(TYPE_TAG[viewTax.type].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.amount", lang)}</Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {Number(viewTax.amount).toFixed(2)}
                  {viewTax.type === TaxType.PERCENTAGE ? "%" : ""}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.scope", lang)}</Text>
                <br />
                {SCOPE_TAG[viewTax.scope] && (
                  <Tag
                    color={SCOPE_TAG[viewTax.scope].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(SCOPE_TAG[viewTax.scope].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.tax.includeInPrice", lang)}
                </Text>
                <br />
                <Text strong>
                  {viewTax.includeInPrice
                    ? t("accounting.tax.yes", lang)
                    : t("accounting.tax.no", lang)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.tax.taxGroup", lang)}
                </Text>
                <br />
                <Text>
                  {viewTax.taxGroupNameEn || viewTax.taxGroupNameAr
                    ? lang === "ar"
                      ? viewTax.taxGroupNameAr
                      : viewTax.taxGroupNameEn
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.status", lang)}</Text>
                <br />
                <Tag
                  color={viewTax.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewTax.isActive
                    ? t("accounting.tax.active", lang)
                    : t("accounting.tax.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewTax);
                }}
              >
                {t("accounting.tax.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("accounting.tax.delete", lang),
                    content: t("accounting.tax.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewTax.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("accounting.tax.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </Space>
  );
}

// ─── Tax Groups Tab ──────────────────────────────────────────────────────────

function TaxGroupsTab({
  lang,
  token,
  isMobile,
  gradientHeader,
  queryClient,
}: TabProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaxGroup | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: groupsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TAX_GROUPS_LIST],
    queryFn: () => taxGroupsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allGroups: TaxGroup[] = useMemo(
    () => groupsRaw?.data ?? [],
    [groupsRaw]
  );

  // ── Filtered data ────────────────────────────────────────────────────────
  const groups = useMemo(() => {
    let filtered = [...allGroups];
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        g =>
          g.nameEn.toLowerCase().includes(q) ||
          g.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allGroups, searchText]);

  // ── KPI values ─────────────────────────────────────────────────────────
  const kpiTotal = allGroups.length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAX_GROUPS_LIST] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTaxGroupDto) => taxGroupsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.tg.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxGroupDto }) =>
      taxGroupsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.tg.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxGroupsService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("accounting.tg.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingGroup(null);
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (group: TaxGroup) => {
      setEditingGroup(group);
      form.setFieldsValue({
        nameEn: group.nameEn,
        nameAr: group.nameAr,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingGroup(null);
    form.resetFields();
  }, [form]);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingGroup) {
        updateMutation.mutate({
          id: editingGroup.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            version: editingGroup.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<TaxGroup> = [
    {
      title: t("accounting.tg.nameEn", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {getName(rec)}
        </Text>
      ),
    },
    {
      title: t("accounting.tg.nameAr", lang),
      dataIndex: "nameAr",
      render: (v: string) => <Text dir="rtl">{v}</Text>,
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const items = [
          {
            key: "edit",
            label: t("accounting.tg.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("accounting.tg.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("accounting.tg.delete", lang),
                content: t("accounting.tg.deleteConfirm", lang),
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

  return (
    <Space orientation="vertical" size={20} style={{ width: "100%" }}>
      {/* ── KPI Card ───────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
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
                  {t("accounting.tg.total", lang)}
                </Text>
                <Statistic
                  value={kpiTotal}
                  styles={{ content: {
                    fontSize: 24,
                    lineHeight: 1,
                  } }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("accounting.tg.title", lang)}
                </Text>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${token.colorPrimary}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: token.colorPrimary,
                }}
              >
                <FileTextOutlined />
              </div>
            </div>
          </Card>
        </Col>
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
              placeholder={t("accounting.tg.search", lang)}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
          </Space>

          <Space>
            <Tooltip title="Reload">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("accounting.tg.new", lang)}
            </Button>
          </Space>
        </div>
      </Card>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={groups}
          loading={isLoading}
          size="middle"
          scroll={{ x: "max-content" }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
            pageSizeOptions: ["5", "10", "25", "50"],
          }}
          locale={{
            emptyText: t("accounting.tg.title", lang) + " — 0",
          }}
        />
      </Card>

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingGroup
            ? t("accounting.tg.edit", lang)
            : t("accounting.tg.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 480}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingGroup ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingGroup
                ? `${t("accounting.tg.edit", lang)} — ${getName(editingGroup)}`
                : t("accounting.tg.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tg.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tg.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Space>
  );
}
