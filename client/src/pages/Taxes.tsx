/**
 * Taxes & Tax Groups settings page.
 * Two tabs: Taxes (main) and Tax Groups.
 * Follows the CashAccounts.tsx / AllOrders.tsx pattern exactly.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Grid,
  Dropdown,
  Typography,
  Tag,
  Statistic,
  Input,
  Segmented,
  Tooltip,
  Modal,
  Form,
  Select,
  Switch,
  Drawer,
  Space,
  InputNumber,
  Tabs,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  ExportOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { taxesService, taxGroupsService } from "@/services/accounting.service";
import { TaxType, TaxScope } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Tax,
  CreateTaxDto,
  UpdateTaxDto,
  TaxGroup,
  CreateTaxGroupDto,
  UpdateTaxGroupDto,
} from "@/types/modules/accounting";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

// ─── Tag config maps ──────────────────────────────────────────────────────────

const TYPE_TAG: Record<string, { color: string; i18nKey: string }> = {
  [TaxType.PERCENTAGE]: {
    color: "blue",
    i18nKey: "accounting.tax.percentage",
  },
  [TaxType.FIXED]: { color: "orange", i18nKey: "accounting.tax.fixed" },
};

const SCOPE_TAG: Record<string, { color: string; i18nKey: string }> = {
  [TaxScope.SALE]: { color: "green", i18nKey: "accounting.tax.scopeSale" },
  [TaxScope.PURCHASE]: {
    color: "orange",
    i18nKey: "accounting.tax.scopePurchase",
  },
  [TaxScope.BOTH]: { color: "blue", i18nKey: "accounting.tax.scopeBoth" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Taxes() {
  const { t, lang } = useTranslation();
  const [activeTab, setActiveTab] = useState("taxes");

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("Settings", lang), href: "#" },
    { label: t("accounting.tax.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="Taxes" breadcrumbs={breadcrumbs}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "taxes",
            label: t("accounting.tax.title", lang),
            children: <TaxesTab />,
          },
          {
            key: "tax-groups",
            label: t("accounting.tg.title", lang),
            children: <TaxGroupsTab />,
          },
        ]}
      />
    </DashboardLayout>
  );
}

// ─── Taxes Tab ────────────────────────────────────────────────────────────────

function TaxesTab() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── State ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scopeFilter, setScopeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal / Drawer state
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
    queryFn: () => taxesService.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const allTaxes: Tax[] = useMemo(
    () =>
      ((taxesRaw as unknown as Record<string, unknown>)?.data as Tax[]) ?? [],
    [taxesRaw]
  );

  // Tax groups for the dropdown
  const { data: taxGroupsRaw } = useQuery({
    queryKey: [QUERY_KEYS.TAX_GROUPS_LIST],
    queryFn: () => taxGroupsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const taxGroupOptions = useMemo(() => {
    const list =
      ((taxGroupsRaw as unknown as Record<string, unknown>)
        ?.data as TaxGroup[]) ?? [];
    return list.map(g => ({ value: g.id, label: getName(g) }));
  }, [taxGroupsRaw]);

  // ── Filtered + paginated data ────────────────────────────────────────────
  const filteredTaxes = useMemo(() => {
    let filtered = [...allTaxes];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(tx => tx.isActive === isActive);
    }
    if (scopeFilter !== "all") {
      filtered = filtered.filter(tx => tx.scope === scopeFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        tx =>
          tx.nameEn.toLowerCase().includes(q) ||
          tx.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allTaxes, statusFilter, scopeFilter, search]);

  const totalRows = filteredTaxes.length;
  const paginatedTaxes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTaxes.slice(start, start + pageSize);
  }, [filteredTaxes, page, pageSize]);

  // ── KPI values (computed from ALL data, not filtered) ────────────────────
  const kpiTotal = allTaxes.length;
  const kpiActive = allTaxes.filter(tx => tx.isActive).length;
  const kpiInactive = allTaxes.filter(tx => !tx.isActive).length;

  // ── Mutations ────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAXES_LIST] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTaxDto) => taxesService.create(dto),
    onSuccess: () => {
      toast.success(t("accounting.tax.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxDto }) =>
      taxesService.update(id, dto),
    onSuccess: () => {
      toast.success(t("accounting.tax.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxesService.remove(id),
    onSuccess: () => {
      toast.success(t("accounting.tax.deleted", lang));
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
      amount: 15,
      isActive: true,
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
        taxGroupId: tax.taxGroupId ?? undefined,
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

  // ── Submit handler ───────────────────────────────────────────────────────
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
            taxGroupId: values.taxGroupId,
            isActive: values.isActive,
            version: editingTax.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          type: values.type ?? TaxType.PERCENTAGE,
          amount: values.amount ?? 15,
          scope: values.scope ?? TaxScope.BOTH,
          taxGroupId: values.taxGroupId,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => toast.error(t("accounting.tax.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useTaxColumns(
    t,
    lang,
    taxGroupOptions,
    openView,
    openEdit,
    setDeleteId
  );

  const rowSelection: TableProps<Tax>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  // ── KPI cards config ─────────────────────────────────────────────────────
  const statCards = [
    {
      title: t("accounting.tax.total", lang),
      value: kpiTotal,
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("accounting.tax.avgRate", lang),
      value:
        allTaxes.length > 0
          ? (
              allTaxes.reduce((s, tx) => s + Number(tx.amount ?? 0), 0) /
              allTaxes.length
            ).toFixed(1)
          : 0,
      suffix: "%",
      icon: <PercentageOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("accounting.tax.totalActive", lang),
      value: kpiActive,
      icon: <CheckCircleOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("accounting.tax.totalInactive", lang),
      value: kpiInactive,
      icon: <CloseCircleOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Stats Row ──────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {statCards.map(s => (
          <Col key={s.title} xs={24} sm={12} lg={6}>
            <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
              <div className="flex justify-between items-start">
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                  >
                    {s.title}
                  </Text>
                  <Statistic
                    value={s.value}
                    suffix={s.suffix}
                    valueStyle={{ fontSize: 24, lineHeight: 1 }}
                  />
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

      {/* ── 2. Toolbar Card ─────────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("accounting.tax.new", lang)}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder={t("accounting.tax.search", lang)}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Tooltip title={t("common.filter", lang)}>
              <Button
                icon={<FilterOutlined />}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                type={isFilterOpen ? "primary" : "default"}
              />
            </Tooltip>
            <Tooltip title={t("seq.reload", lang)}>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  { key: "csv", label: "CSV", icon: <ExportOutlined /> },
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

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={6}>
                <Text type="secondary" className="text-xs mb-1 block">
                  {t("accounting.tax.isActive", lang)}
                </Text>
                <Segmented
                  value={statusFilter}
                  onChange={v => {
                    setStatusFilter(v as string);
                    setPage(1);
                  }}
                  block
                  options={[
                    { value: "all", label: t("common.all", lang) },
                    {
                      value: "active",
                      label: t("accounting.tax.active", lang),
                    },
                    {
                      value: "inactive",
                      label: t("accounting.tax.inactive", lang),
                    },
                  ]}
                  size="small"
                />
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Text type="secondary" className="text-xs mb-1 block">
                  {t("accounting.tax.scope", lang)}
                </Text>
                <Segmented
                  value={scopeFilter}
                  onChange={v => {
                    setScopeFilter(v as string);
                    setPage(1);
                  }}
                  block
                  options={[
                    { value: "all", label: t("common.all", lang) },
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
                  size="small"
                />
              </Col>
            </Row>

            {/* Active filter tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {statusFilter !== "all" && (
                <Tag closable onClose={() => setStatusFilter("all")}>
                  {t("accounting.tax.isActive", lang)}:{" "}
                  {statusFilter === "active"
                    ? t("accounting.tax.active", lang)
                    : t("accounting.tax.inactive", lang)}
                </Tag>
              )}
              {scopeFilter !== "all" && (
                <Tag closable onClose={() => setScopeFilter("all")}>
                  {t("accounting.tax.scope", lang)}:{" "}
                  {t(SCOPE_TAG[scopeFilter]?.i18nKey ?? scopeFilter, lang)}
                </Tag>
              )}
            </div>
          </div>
        )}

        {/* Bulk Bar */}
        {selectedRows.length > 0 && (
          <div
            className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
            style={{
              background: "var(--ant-color-primary-bg)",
              border: "1px solid var(--ant-color-primary-border)",
            }}
          >
            <Text strong style={{ color: "var(--ant-color-primary)" }}>
              {selectedRows.length} {t("common.selected", lang)}
            </Text>
            <Button size="small" icon={<DownloadOutlined />}>
              {t("products.export", lang)}
            </Button>
            <Button size="small" danger icon={<DeleteOutlined />}>
              {t("common.delete", lang)}
            </Button>
            <Button
              size="small"
              type="text"
              onClick={() => setSelectedRows([])}
            >
              {t("common.clearSelection", lang)}
            </Button>
          </div>
        )}
      </Card>

      {/* ── 3. Table ────────────────────────────────────────────────────── */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedTaxes}
          rowSelection={rowSelection}
          loading={isLoading}
          size="middle"
          scroll={{ x: "max-content" }}
          onRow={rec => ({
            onClick: () => openView(rec),
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: page,
            pageSize,
            total: totalRows,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => `${range[0]}--${range[1]} of ${total}`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          locale={{ emptyText: <EmptyState /> }}
        />
      </Card>

      {/* ── 4. ConfirmDialog for delete ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("common.delete", lang)}
        description={t("accounting.tax.deleteConfirm", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Create / Edit Modal ──────────────────────────────────────── */}
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
        title={
          editingTax
            ? `${t("accounting.tax.edit", lang)} — ${getName(editingTax)}`
            : t("accounting.tax.new", lang)
        }
      >
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
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.amount", lang)}
                name="amount"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
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
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tg.title", lang)}
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
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.tax.isActive", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── 6. Detail Drawer ────────────────────────────────────────────── */}
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
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Rate highlight */}
            <Card
              size="small"
              styles={{
                body: { padding: "16px 20px", textAlign: "center" },
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.tax.amount", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color: "#3b82f6",
                }}
              >
                {Number(viewTax.amount ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                {viewTax.type === TaxType.PERCENTAGE
                  ? "%"
                  : t("accounting.tax.fixed", lang)}
              </Text>
            </Card>

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
                <Tag
                  color={TYPE_TAG[viewTax.type]?.color ?? "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t(TYPE_TAG[viewTax.type]?.i18nKey ?? viewTax.type, lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tax.scope", lang)}</Text>
                <br />
                <Tag
                  color={SCOPE_TAG[viewTax.scope]?.color ?? "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t(SCOPE_TAG[viewTax.scope]?.i18nKey ?? viewTax.scope, lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.tg.title", lang)}</Text>
                <br />
                <Text>
                  {viewTax.taxGroupId
                    ? (taxGroupOptions.find(o => o.value === viewTax.taxGroupId)
                        ?.label ?? "—")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.tax.isActive", lang)}
                </Text>
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
                  setDrawerOpen(false);
                  setDeleteId(viewTax.id);
                }}
              >
                {t("common.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
}

// ── Tax Columns hook ──────────────────────────────────────────────────────────

function useTaxColumns(
  t: (k: string, l: "ar" | "en") => string,
  lang: "ar" | "en",
  taxGroupOptions: { value: string; label: string }[],
  onView: (tax: Tax) => void,
  onEdit: (tax: Tax) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<Tax> {
  return useMemo(
    () => [
      {
        title: t("accounting.tax.nameEn", lang),
        dataIndex: "nameEn",
        width: 200,
        render: (_: unknown, rec: Tax) => <Text strong>{getName(rec)}</Text>,
      },
      {
        title: t("accounting.tax.type", lang),
        dataIndex: "type",
        width: 120,
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
        width: 120,
        align: "end" as const,
        render: (v: number | string, rec: Tax) => (
          <Text strong className="font-mono">
            {Number(v ?? 0).toLocaleString("en-SA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {rec.type === TaxType.PERCENTAGE ? "%" : ""}
          </Text>
        ),
      },
      {
        title: t("accounting.tax.scope", lang),
        dataIndex: "scope",
        width: 120,
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
        title: t("accounting.tg.title", lang),
        dataIndex: "taxGroupId",
        width: 160,
        responsive: ["lg"] as const,
        render: (v: string | null | undefined) => {
          if (!v) return <Text type="secondary">—</Text>;
          const opt = taxGroupOptions.find(o => o.value === v);
          return <Text>{opt ? opt.label : "—"}</Text>;
        },
      },
      {
        title: t("accounting.tax.isActive", lang),
        dataIndex: "isActive",
        width: 110,
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
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: Tax) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("accounting.tax.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
                },
                {
                  key: "edit",
                  label: t("accounting.tax.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => onEdit(rec),
                },
                { type: "divider" as const, key: "d1" },
                {
                  key: "delete",
                  label: t("common.delete", lang),
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => setDeleteId(rec.id),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        ),
      },
    ],
    [t, lang, taxGroupOptions, onView, onEdit, setDeleteId]
  );
}

// ─── Tax Groups Tab ───────────────────────────────────────────────────────────

function TaxGroupsTab() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── State ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal state
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
    queryFn: () => taxGroupsService.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const allGroups: TaxGroup[] = useMemo(
    () =>
      ((groupsRaw as unknown as Record<string, unknown>)?.data as TaxGroup[]) ??
      [],
    [groupsRaw]
  );

  // ── Filtered + paginated data ────────────────────────────────────────────
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return allGroups;
    const q = search.trim().toLowerCase();
    return allGroups.filter(
      g =>
        g.nameEn.toLowerCase().includes(q) || g.nameAr.toLowerCase().includes(q)
    );
  }, [allGroups, search]);

  const totalRows = filteredGroups.length;
  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, page, pageSize]);

  // ── KPI values ───────────────────────────────────────────────────────────
  const kpiTotal = allGroups.length;

  // ── Mutations ────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TAX_GROUPS_LIST] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTaxGroupDto) => taxGroupsService.create(dto),
    onSuccess: () => {
      toast.success(t("accounting.tg.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaxGroupDto }) =>
      taxGroupsService.update(id, dto),
    onSuccess: () => {
      toast.success(t("accounting.tg.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxGroupsService.remove(id),
    onSuccess: () => {
      toast.success(t("accounting.tg.deleted", lang));
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

  // ── Submit handler ───────────────────────────────────────────────────────
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

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
      onError: () => toast.error(t("accounting.tg.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = useTaxGroupColumns(t, lang, openEdit, setDeleteId);

  const rowSelection: TableProps<TaxGroup>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  // ── KPI cards config ─────────────────────────────────────────────────────
  const statCards = [
    {
      title: t("accounting.tg.total", lang),
      value: kpiTotal,
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── 1. Stats Row ──────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]}>
        {statCards.map(s => (
          <Col key={s.title} xs={24} sm={12} lg={6}>
            <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
              <div className="flex justify-between items-start">
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                  >
                    {s.title}
                  </Text>
                  <Statistic
                    value={s.value}
                    valueStyle={{ fontSize: 24, lineHeight: 1 }}
                  />
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

      {/* ── 2. Toolbar Card ─────────────────────────────────────────────── */}
      <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-2 items-center">
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              {t("accounting.tg.new", lang)}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder={t("accounting.tg.search", lang)}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
            <Tooltip title={t("seq.reload", lang)}>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
            </Tooltip>
          </div>
        </div>

        {/* Bulk Bar */}
        {selectedRows.length > 0 && (
          <div
            className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
            style={{
              background: "var(--ant-color-primary-bg)",
              border: "1px solid var(--ant-color-primary-border)",
            }}
          >
            <Text strong style={{ color: "var(--ant-color-primary)" }}>
              {selectedRows.length} {t("common.selected", lang)}
            </Text>
            <Button size="small" danger icon={<DeleteOutlined />}>
              {t("common.delete", lang)}
            </Button>
            <Button
              size="small"
              type="text"
              onClick={() => setSelectedRows([])}
            >
              {t("common.clearSelection", lang)}
            </Button>
          </div>
        )}
      </Card>

      {/* ── 3. Table ────────────────────────────────────────────────────── */}
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={paginatedGroups}
          rowSelection={rowSelection}
          loading={isLoading}
          size="middle"
          scroll={{ x: "max-content" }}
          pagination={{
            current: page,
            pageSize,
            total: totalRows,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) => `${range[0]}--${range[1]} of ${total}`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          locale={{ emptyText: <EmptyState /> }}
        />
      </Card>

      {/* ── 4. ConfirmDialog for delete ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("common.delete", lang)}
        description={t("accounting.tg.deleteConfirm", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Create / Edit Modal ──────────────────────────────────────── */}
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
        width={isMobile ? "95vw" : 520}
        destroyOnHidden
        title={
          editingGroup
            ? `${t("accounting.tg.edit", lang)} — ${getName(editingGroup)}`
            : t("accounting.tg.new", lang)
        }
      >
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
    </div>
  );
}

// ── Tax Group Columns hook ────────────────────────────────────────────────────

function useTaxGroupColumns(
  t: (k: string, l: "ar" | "en") => string,
  lang: "ar" | "en",
  onEdit: (group: TaxGroup) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<TaxGroup> {
  return useMemo(
    () => [
      {
        title: t("accounting.tg.nameEn", lang),
        dataIndex: "nameEn",
        width: 250,
        render: (_: unknown, rec: TaxGroup) => (
          <Text strong>{getName(rec)}</Text>
        ),
      },
      {
        title: t("accounting.tg.nameAr", lang),
        dataIndex: "nameAr",
        width: 250,
        render: (v: string) => <Text dir="rtl">{v}</Text>,
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: TaxGroup) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: t("accounting.tg.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => onEdit(rec),
                },
                { type: "divider" as const, key: "d1" },
                {
                  key: "delete",
                  label: t("common.delete", lang),
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => setDeleteId(rec.id),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        ),
      },
    ],
    [t, lang, onEdit, setDeleteId]
  );
}
