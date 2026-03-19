/**
 * Bank Accounts list page.
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
  Tooltip,
  Segmented,
  DatePicker,
  Modal,
  Form,
  Select,
  Switch,
  Drawer,
  Divider,
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
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { treasuryAccountsService } from "@/services/treasury.service";
import { accountsService } from "@/services/accounting.service";
import { TreasuryAccountType } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { getName } from "@/shared/utils/getName.util";
import { ROUTES } from "@/shared/constants/routes";
import type {
  TreasuryAccount,
  CreateTreasuryAccountDto,
  UpdateTreasuryAccountDto,
} from "@/types/modules/treasury";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

export default function BankAccounts() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── State ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TreasuryAccount | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<TreasuryAccount | null>(null);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const [form] = Form.useForm();

  // ── Queries ─────────────────────────────────────────────────────────────

  const {
    data: accountsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.TREASURY_ACCOUNTS,
      { type: TreasuryAccountType.BANK },
    ],
    queryFn: () =>
      treasuryAccountsService.list({
        limit: 100,
        type: TreasuryAccountType.BANK,
      } as Record<string, unknown>),
    staleTime: 30_000,
  });

  const allAccounts: TreasuryAccount[] = useMemo(
    () => (accountsRaw?.data ?? []).filter(a => a.type === TreasuryAccountType.BANK),
    [accountsRaw]
  );

  const { data: coaAccountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const coaAccountOptions = useMemo(() => {
    const list = (coaAccountsList?.data ?? []) as {
      id: string;
      code: string;
      nameEn: string;
      nameAr: string;
    }[];
    return list.map(a => ({
      value: a.id,
      label: `${a.code} — ${getName(a)}`,
    }));
  }, [coaAccountsList]);

  // ── Filtered data ───────────────────────────────────────────────────────
  const accounts = useMemo(() => {
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
          a.nameAr.toLowerCase().includes(q) ||
          (a.bankName && a.bankName.toLowerCase().includes(q)) ||
          (a.accountNumber && a.accountNumber.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [allAccounts, statusFilter, search]);

  const totalRows = accounts.length;

  // ── KPI values (computed from ALL data, not filtered) ───────────────────
  const kpiTotal = allAccounts.length;
  const kpiActive = allAccounts.filter(a => a.isActive).length;
  const kpiInactive = allAccounts.filter(a => !a.isActive).length;
  const kpiTotalBalance = allAccounts.reduce(
    (sum, a) => sum + Number(a.currentBalance ?? 0),
    0
  );

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTreasuryAccountDto) =>
      treasuryAccountsService.create(dto),
    onSuccess: () => {
      toast.success(t("treasury.bank.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTreasuryAccountDto }) =>
      treasuryAccountsService.update(id, dto),
    onSuccess: () => {
      toast.success(t("treasury.bank.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => treasuryAccountsService.remove(id),
    onSuccess: () => {
      toast.success(t("treasury.bank.deleted", lang));
      invalidate();
    },
  });

  // ── Modal helpers ─────────────────────────────────────────────────────

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
        currency: account.currency ?? "SAR",
        bankName: account.bankName ?? undefined,
        accountNumber: account.accountNumber ?? undefined,
        iban: account.iban ?? undefined,
        swiftCode: account.swiftCode ?? undefined,
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

  // ── Submit handler ────────────────────────────────────────────────────

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
            bankName: values.bankName,
            accountNumber: values.accountNumber,
            iban: values.iban,
            swiftCode: values.swiftCode,
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
          type: TreasuryAccountType.BANK,
          currency: values.currency ?? "SAR",
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          iban: values.iban,
          swiftCode: values.swiftCode,
          coaAccountId: values.coaAccountId,
          isDefault: values.isDefault ?? false,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("treasury.bank.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("treasury.bank.loadFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ─────────────────────────────────────────────────────────────

  const columns = useBankAccountColumns(
    t,
    lang,
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
    { label: t("treasury.bank.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="BankAccounts" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row ──────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.bank.total", lang),
              value: kpiTotal,
              suffix: "",
              icon: <BankOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
            },
            {
              title: t("treasury.bank.totalBalance", lang),
              value: kpiTotalBalance,
              suffix: " SAR",
              icon: <DollarOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              precision: 2,
            },
            {
              title: t("treasury.bank.totalActive", lang),
              value: kpiActive,
              suffix: "",
              icon: <CheckCircleOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
            },
            {
              title: t("treasury.bank.totalInactive", lang),
              value: kpiInactive,
              suffix: "",
              icon: <CloseCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
            },
          ].map(s => (
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
                      precision={s.precision ?? 0}
                      styles={{ content: { fontSize: 24, lineHeight: 1 } }}
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

        {/* ── 2. Toolbar + Filters Card ─────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("treasury.bank.new", lang)}
              </Button>
            </div>

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
                placeholder={t("common.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("treasury.bank.allStatuses", lang)}>
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

          {/* Filter panel (collapsible) */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("treasury.bank.status", lang)}
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
                        label: t("treasury.bank.allStatuses", lang),
                      },
                      {
                        value: "active",
                        label: t("treasury.bank.active", lang),
                      },
                      {
                        value: "inactive",
                        label: t("treasury.bank.inactive", lang),
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
                    {t("treasury.bank.status", lang)}:{" "}
                    {statusFilter === "active"
                      ? t("treasury.bank.active", lang)
                      : t("treasury.bank.inactive", lang)}
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* Bulk bar */}
          {selectedRows.length > 0 && (
            <div
              className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
              style={{
                background: "var(--ant-color-primary-bg)",
                border: "1px solid var(--ant-color-primary-border)",
              }}
            >
              <Text strong style={{ color: "var(--ant-color-primary)" }}>
                {selectedRows.length} {t("treasury.bank.selected", lang)}
              </Text>
              <Button size="small" icon={<DownloadOutlined />}>
                {t("products.export", lang)}
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("treasury.bank.delete", lang)}
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("treasury.bank.allStatuses", lang)}
              </Button>
            </div>
          )}
        </Card>

        {/* ── 3. Table (desktop) / Grid cards (mobile) ──────────────────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={accounts}
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
            accounts={accounts}
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
        title={t("treasury.bank.delete", lang)}
        description={t("treasury.bank.deleteConfirm", lang)}
        confirmLabel={t("treasury.bank.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Fast create / Edit Modal ──────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingAccount
            ? t("treasury.bank.edit", lang)
            : t("treasury.bank.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 720}
        destroyOnHidden
        title={
          editingAccount
            ? `${t("treasury.bank.edit", lang)} — ${getName(editingAccount)}`
            : t("treasury.bank.new", lang)
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.nameAr", lang)}
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
                label={t("treasury.bank.descriptionEn", lang)}
                name="descriptionEn"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.descriptionAr", lang)}
                name="descriptionAr"
              >
                <Input.TextArea rows={2} dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.bank.currency", lang)}
                name="currency"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.bank.bankName", lang)}
                name="bankName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.bank.accountNumber", lang)}
                name="accountNumber"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.iban", lang)}
                name="iban"
                rules={[
                  {
                    pattern: /^SA\d{22}$/,
                    message: "IBAN must follow Saudi format: SA + 22 digits",
                  },
                ]}
              >
                <Input
                  style={{ fontFamily: "monospace" }}
                  placeholder="SA0000000000000000000000"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.swiftCode", lang)}
                name="swiftCode"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.coaAccount", lang)}
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
                label={t("treasury.bank.isDefault", lang)}
                name="isDefault"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.bank.status", lang)}
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
          setViewAccount(null);
        }}
        size={isMobile ? "default" : "large"}
        title={
          viewAccount
            ? `${t("treasury.bank.details", lang)} — ${getName(viewAccount)}`
            : ""
        }
      >
        {viewAccount && (
          <div className="flex flex-col gap-4">
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("treasury.bank.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewAccount.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.bank.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewAccount.nameAr}
                </Text>
              </Col>
              {viewAccount.descriptionEn && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.bank.descriptionEn", lang)}
                  </Text>
                  <br />
                  <Text>{viewAccount.descriptionEn}</Text>
                </Col>
              )}
              {viewAccount.descriptionAr && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.bank.descriptionAr", lang)}
                  </Text>
                  <br />
                  <Text dir="rtl">{viewAccount.descriptionAr}</Text>
                </Col>
              )}
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.bank.currency", lang)}
                </Text>
                <br />
                <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>
                  {viewAccount.currency}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.bank.balance", lang)}</Text>
                <br />
                <Text strong style={{ fontSize: 18, fontFamily: "monospace" }}>
                  {Number(viewAccount.currentBalance ?? 0).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.bank.status", lang)}</Text>
                <br />
                <Tag
                  color={viewAccount.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewAccount.isActive
                    ? t("treasury.bank.active", lang)
                    : t("treasury.bank.inactive", lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.bank.isDefault", lang)}
                </Text>
                <br />
                <Tag
                  color={viewAccount.isDefault ? "blue" : "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewAccount.isDefault
                    ? t("treasury.bank.default", lang)
                    : "—"}
                </Tag>
              </Col>
            </Row>

            <Divider>{t("treasury.bank.bankDetails", lang)}</Divider>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.bank.bankName", lang)}
                </Text>
                <br />
                <Text strong>{viewAccount.bankName ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.bank.accountNumber", lang)}
                </Text>
                <br />
                {viewAccount.accountNumber ? (
                  <CopyableCode value={viewAccount.accountNumber} />
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.bank.iban", lang)}</Text>
                <br />
                {viewAccount.iban ? (
                  <CopyableCode value={viewAccount.iban} />
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.bank.swiftCode", lang)}
                </Text>
                <br />
                {viewAccount.swiftCode ? (
                  <CopyableCode value={viewAccount.swiftCode} />
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={24}>
                <Text type="secondary">
                  {t("treasury.bank.coaAccount", lang)}
                </Text>
                <br />
                <Text>
                  {viewAccount.coaAccountId
                    ? (coaAccountOptions.find(
                        o => o.value === viewAccount.coaAccountId
                      )?.label ?? viewAccount.coaAccountId)
                    : "—"}
                </Text>
              </Col>
            </Row>

            {/* Action buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewAccount);
                }}
              >
                {t("treasury.bank.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  setDeleteId(viewAccount.id);
                }}
              >
                {t("treasury.bank.delete", lang)}
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useBankAccountColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (account: TreasuryAccount) => void,
  onEdit: (account: TreasuryAccount) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<TreasuryAccount> {
  return useMemo(
    () => [
      {
        title: t("treasury.bank.nameEn", lang),
        dataIndex: "nameEn",
        width: 200,
        ellipsis: true,
        render: (_: unknown, rec: TreasuryAccount) => (
          <Text strong style={{ color: "var(--ant-color-primary)" }}>
            {getName(rec)}
          </Text>
        ),
      },
      {
        title: t("treasury.bank.bankName", lang),
        dataIndex: "bankName",
        width: 160,
        render: (v: string | null) => <Text>{v ?? "—"}</Text>,
      },
      {
        title: t("treasury.bank.accountNumber", lang),
        dataIndex: "accountNumber",
        width: 180,
        render: (v: string | null) =>
          v ? <CopyableCode value={v} /> : <Text type="secondary">—</Text>,
      },
      {
        title: t("treasury.bank.iban", lang),
        dataIndex: "iban",
        width: 220,
        render: (v: string | null) =>
          v ? <CopyableCode value={v} /> : <Text type="secondary">—</Text>,
      },
      {
        title: t("treasury.bank.currency", lang),
        dataIndex: "currency",
        width: 100,
        render: (v: string) => (
          <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>{v}</Tag>
        ),
      },
      {
        title: t("treasury.bank.balance", lang),
        dataIndex: "currentBalance",
        width: 150,
        align: "end" as const,
        render: (v: number | string) => (
          <Text strong className="font-mono">
            {Number(v ?? 0).toLocaleString("en-SA", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        ),
      },
      {
        title: t("treasury.bank.status", lang),
        dataIndex: "isActive",
        width: 110,
        render: (v: boolean) => (
          <Tag
            color={v ? "green" : "red"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v
              ? t("treasury.bank.active", lang)
              : t("treasury.bank.inactive", lang)}
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
                  label: t("treasury.bank.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
                },
                {
                  key: "edit",
                  label: t("treasury.bank.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => onEdit(rec),
                },
                { type: "divider" as const, key: "d1" },
                {
                  key: "delete",
                  label: t("treasury.bank.delete", lang),
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
    [t, lang, onView, onEdit, setDeleteId]
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
            className="cursor-pointer"
            onClick={() => onClick(a)}
          >
            <div className="flex items-start justify-between mb-1">
              <Text
                strong
                className="text-base"
                style={{ color: "var(--ant-color-primary)" }}
              >
                {getName(a)}
              </Text>
              <Tag
                color={a.isActive ? "green" : "red"}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {a.isActive
                  ? t("treasury.bank.active", lang)
                  : t("treasury.bank.inactive", lang)}
              </Tag>
            </div>
            <p className="text-sm text-gray-500 mb-2">{a.bankName ?? "—"}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold font-mono">
                {a.currency ?? "SAR"}{" "}
                {Number(a.currentBalance ?? 0).toLocaleString("en-SA", {
                  minimumFractionDigits: 2,
                })}
              </span>
              {a.iban && (
                <span className="text-xs text-gray-400 font-mono">
                  {a.iban.slice(0, 6)}...{a.iban.slice(-4)}
                </span>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
