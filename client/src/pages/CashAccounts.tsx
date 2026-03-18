/**
 * Cash Accounts list page.
 * Follows the AllOrders.tsx design pattern exactly.
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
  DatePicker,
  Modal,
  Form,
  Select,
  Switch,
  Drawer,
  Space,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { Dayjs } from "dayjs";
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
  AppstoreOutlined,
  UnorderedListOutlined,
  ExportOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { treasuryAccountsService } from "@/services/treasury.service";
import { accountsService } from "@/services/accounting.service";
import { TreasuryAccountType } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TreasuryAccount,
  CreateTreasuryAccountDto,
  UpdateTreasuryAccountDto,
} from "@/types/modules/treasury";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

export default function CashAccounts() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── State ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fastCreateOpen, setFastCreateOpen] = useState(false);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TreasuryAccount | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<TreasuryAccount | null>(null);
  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: accountsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS, "cash"],
    queryFn: () => treasuryAccountsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allAccounts: TreasuryAccount[] = useMemo(() => {
    const list =
      ((accountsRaw as Record<string, unknown>)?.data as TreasuryAccount[]) ??
      [];
    return list.filter(a => a.type === TreasuryAccountType.CASH);
  }, [accountsRaw]);

  const { data: coaAccountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const coaAccountOptions = useMemo(() => {
    const list =
      ((coaAccountsList as Record<string, unknown>)?.data as {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
      }[]) ?? [];
    return list.map(a => ({
      value: a.id,
      label: `${a.code} — ${getName(a)}`,
    }));
  }, [coaAccountsList]);

  // ── Filtered + paginated data ────────────────────────────────────────
  const filteredAccounts = useMemo(() => {
    let filtered = [...allAccounts];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(a => a.isActive === isActive);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        a =>
          a.nameEn.toLowerCase().includes(q) ||
          a.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allAccounts, statusFilter, search]);

  const totalRows = filteredAccounts.length;
  const paginatedAccounts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, page, pageSize]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────
  const kpiTotal = allAccounts.length;
  const kpiTotalBalance = allAccounts.reduce(
    (sum, a) => sum + Number(a.currentBalance ?? 0),
    0
  );
  const kpiActive = allAccounts.filter(a => a.isActive).length;
  const kpiInactive = allAccounts.filter(a => !a.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTreasuryAccountDto) =>
      treasuryAccountsService.create(dto),
    onSuccess: () => {
      toast.success(t("treasury.cash.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTreasuryAccountDto }) =>
      treasuryAccountsService.update(id, dto),
    onSuccess: () => {
      toast.success(t("treasury.cash.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => treasuryAccountsService.remove(id),
    onSuccess: () => {
      toast.success(t("treasury.cash.deleted", lang));
      invalidate();
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingAccount(null);
    form.resetFields();
    form.setFieldsValue({
      currency: "SAR",
      isDefault: false,
      isActive: true,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (account: TreasuryAccount) => {
      setEditingAccount(account);
      form.setFieldsValue({
        nameEn: account.nameEn,
        nameAr: account.nameAr,
        descriptionEn: account.descriptionEn ?? undefined,
        descriptionAr: account.descriptionAr ?? undefined,
        currency: account.currency,
        coaAccountId: account.coaAccountId ?? undefined,
        isDefault: account.isDefault,
        isActive: account.isActive,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingAccount(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((account: TreasuryAccount) => {
    setViewAccount(account);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingAccount) {
        updateMutation.mutate({
          id: editingAccount.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            descriptionEn: values.descriptionEn,
            descriptionAr: values.descriptionAr,
            currency: values.currency,
            coaAccountId: values.coaAccountId,
            isDefault: values.isDefault,
            isActive: values.isActive,
            version: editingAccount.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          descriptionEn: values.descriptionEn,
          descriptionAr: values.descriptionAr,
          type: TreasuryAccountType.CASH,
          currency: values.currency ?? "SAR",
          coaAccountId: values.coaAccountId,
          isDefault: values.isDefault ?? false,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("treasury.cash.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("treasury.cash.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useCashAccountColumns(
    t,
    lang,
    coaAccountOptions,
    openView,
    openEdit,
    setDeleteId
  );

  const rowSelection: TableProps<TreasuryAccount>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("treasury.title", lang), href: "#" },
    { label: t("treasury.cash.title", lang) },
  ];

  // ── KPI cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      title: t("treasury.cash.total", lang),
      value: kpiTotal,
      suffix: "",
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("treasury.cash.totalBalance", lang),
      value: kpiTotalBalance,
      suffix: " SAR",
      icon: <DollarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("treasury.cash.totalActive", lang),
      value: kpiActive,
      suffix: "",
      icon: <CheckCircleOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("treasury.cash.totalInactive", lang),
      value: kpiInactive,
      suffix: "",
      icon: <CloseCircleOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  return (
    <DashboardLayout currentPage="CashAccounts" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row (4 KPI cards) ──────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <div className="flex justify-between items-start">
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
            {/* Left: Create button */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("treasury.cash.new", lang)}
              </Button>
            </div>

            {/* Right: DateRange + Search + Filter + Reload + Export + ViewMode */}
            <div className="flex flex-wrap gap-2 items-center">
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={[
                  t("common.dateFrom", lang),
                  t("common.dateTo", lang),
                ]}
                allowClear
                style={{ borderRadius: 8 }}
              />
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("treasury.cash.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("treasury.cash.allStatuses", lang)}>
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
              <Segmented
                value={viewMode}
                onChange={v => setViewMode(v as "table" | "grid")}
                options={[
                  { value: "table", icon: <UnorderedListOutlined /> },
                  { value: "grid", icon: <AppstoreOutlined /> },
                ]}
              />
            </div>
          </div>

          {/* Filter Panel (collapsible) */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("treasury.cash.isActive", lang)}
                  </Text>
                  <Segmented
                    value={statusFilter}
                    onChange={v => {
                      setStatusFilter(v as string);
                      setPage(1);
                    }}
                    block
                    options={[
                      {
                        value: "all",
                        label: t("treasury.cash.allStatuses", lang),
                      },
                      {
                        value: "active",
                        label: t("treasury.cash.active", lang),
                      },
                      {
                        value: "inactive",
                        label: t("treasury.cash.inactive", lang),
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
                    {t("treasury.cash.isActive", lang)}:{" "}
                    {statusFilter === "active"
                      ? t("treasury.cash.active", lang)
                      : t("treasury.cash.inactive", lang)}
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
                {selectedRows.length} {t("treasury.cash.selected", lang)}
              </Text>
              <Button size="small" icon={<DownloadOutlined />}>
                {t("products.export", lang)}
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("treasury.cash.delete", lang)}
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("treasury.cash.allStatuses", lang)}
              </Button>
            </div>
          )}
        </Card>

        {/* ── 3. Table view (desktop) OR Grid card view (mobile) ──────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={paginatedAccounts}
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
                showTotal: (total, range) =>
                  `${range[0]}--${range[1]} of ${total}`,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
              locale={{ emptyText: <EmptyState /> }}
            />
          </Card>
        ) : (
          <MobileGrid
            accounts={paginatedAccounts}
            isLoading={isLoading}
            onClick={openView}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── 4. ConfirmDialog for delete ──────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("treasury.cash.delete", lang)}
        description={t("treasury.cash.deleteConfirm", lang)}
        confirmLabel={t("treasury.cash.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingAccount
            ? t("treasury.cash.edit", lang)
            : t("treasury.cash.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={
          editingAccount
            ? `${t("treasury.cash.edit", lang)} — ${getName(editingAccount)}`
            : t("treasury.cash.new", lang)
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.nameAr", lang)}
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
                label={t("treasury.cash.descriptionEn", lang)}
                name="descriptionEn"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.descriptionAr", lang)}
                name="descriptionAr"
              >
                <Input.TextArea rows={2} dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.currency", lang)}
                name="currency"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.coaAccount", lang)}
                name="coaAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={coaAccountOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.isDefault", lang)}
                name="isDefault"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.isActive", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── 6. Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewAccount(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewAccount
            ? `${t("treasury.cash.details", lang)} — ${getName(viewAccount)}`
            : ""
        }
      >
        {viewAccount && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Balance highlight */}
            <Card
              size="small"
              styles={{
                body: {
                  padding: "16px 20px",
                  textAlign: "center",
                },
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("treasury.cash.balance", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color:
                    Number(viewAccount.currentBalance ?? 0) >= 0
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {Number(viewAccount.currentBalance ?? 0).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                {viewAccount.currency}
              </Text>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("treasury.cash.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewAccount.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.cash.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewAccount.nameAr}
                </Text>
              </Col>
              {(viewAccount.descriptionEn || viewAccount.descriptionAr) && (
                <>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("treasury.cash.descriptionEn", lang)}
                    </Text>
                    <br />
                    <Text>{viewAccount.descriptionEn ?? "—"}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("treasury.cash.descriptionAr", lang)}
                    </Text>
                    <br />
                    <Text dir="rtl">{viewAccount.descriptionAr ?? "—"}</Text>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.currency", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewAccount.currency}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.coaAccount", lang)}
                </Text>
                <br />
                <Text>
                  {viewAccount.coaAccountId
                    ? (coaAccountOptions.find(
                        o => o.value === viewAccount.coaAccountId
                      )?.label ?? "—")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.isDefault", lang)}
                </Text>
                <br />
                {viewAccount.isDefault ? (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("treasury.cash.default", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.isActive", lang)}
                </Text>
                <br />
                <Tag
                  color={viewAccount.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewAccount.isActive
                    ? t("treasury.cash.active", lang)
                    : t("treasury.cash.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewAccount);
                }}
              >
                {t("treasury.cash.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  setDeleteId(viewAccount.id);
                }}
              >
                {t("treasury.cash.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useCashAccountColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  coaAccountOptions: { value: string; label: string }[],
  onView: (account: TreasuryAccount) => void,
  onEdit: (account: TreasuryAccount) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<TreasuryAccount> {
  return useMemo(
    () => [
      {
        title: t("treasury.cash.nameEn", lang),
        dataIndex: "nameEn",
        width: 200,
        sorter: false,
        render: (_: unknown, rec: TreasuryAccount) => (
          <CopyableCode value={getName(rec)} />
        ),
      },
      {
        title: t("treasury.cash.currency", lang),
        dataIndex: "currency",
        width: 100,
        sorter: false,
        render: (v: string) => <Text className="font-mono">{v}</Text>,
      },
      {
        title: t("treasury.cash.balance", lang),
        dataIndex: "currentBalance",
        width: 160,
        sorter: false,
        align: "end" as const,
        render: (v: number | string) => {
          const num = Number(v ?? 0);
          return (
            <Text
              strong
              className="font-mono"
              style={{ color: num >= 0 ? "#10b981" : "#ef4444" }}
            >
              {num.toLocaleString("en-SA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          );
        },
      },
      {
        title: t("treasury.cash.coaAccount", lang),
        dataIndex: "coaAccountId",
        width: 200,
        responsive: ["lg"] as const,
        render: (v: string | null | undefined) => {
          if (!v) return <Text type="secondary">—</Text>;
          const opt = coaAccountOptions.find(o => o.value === v);
          return <Text>{opt ? opt.label : "—"}</Text>;
        },
      },
      {
        title: t("treasury.cash.isDefault", lang),
        dataIndex: "isDefault",
        width: 110,
        responsive: ["lg"] as const,
        render: (v: boolean) =>
          v ? (
            <Tag color="blue" style={{ borderRadius: 20, padding: "2px 10px" }}>
              {t("treasury.cash.default", lang)}
            </Tag>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: t("treasury.cash.isActive", lang),
        dataIndex: "isActive",
        width: 110,
        sorter: false,
        render: (v: boolean) => (
          <Tag
            color={v ? "green" : "red"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v
              ? t("treasury.cash.active", lang)
              : t("treasury.cash.inactive", lang)}
          </Tag>
        ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: TreasuryAccount) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("treasury.cash.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
                },
                {
                  key: "edit",
                  label: t("treasury.cash.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => onEdit(rec),
                },
                { type: "divider" as const, key: "d1" },
                {
                  key: "delete",
                  label: t("treasury.cash.delete", lang),
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
    [t, lang, coaAccountOptions, onView, onEdit, setDeleteId]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  accounts,
  isLoading,
  onClick,
  t,
  lang,
}: {
  accounts: TreasuryAccount[];
  isLoading: boolean;
  onClick: (account: TreasuryAccount) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (accounts.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {accounts.map(a => (
        <Col key={a.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => onClick(a)}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="font-mono font-bold text-base text-primary">
                {getName(a)}
              </span>
              <Tag
                color={a.isActive ? "green" : "red"}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {a.isActive
                  ? t("treasury.cash.active", lang)
                  : t("treasury.cash.inactive", lang)}
              </Tag>
            </div>

            <p className="text-sm text-gray-500 mb-2">{a.currency}</p>

            <div className="flex items-center justify-between">
              <Text
                strong
                className="font-mono text-base"
                style={{
                  color:
                    Number(a.currentBalance ?? 0) >= 0 ? "#10b981" : "#ef4444",
                }}
              >
                {Number(a.currentBalance ?? 0).toLocaleString("en-SA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              {a.isDefault && (
                <Tag
                  color="blue"
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t("treasury.cash.default", lang)}
                </Tag>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
