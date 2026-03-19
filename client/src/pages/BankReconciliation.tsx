/**
 * Treasury Bank Reconciliation list page.
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
  Tag,
  Dropdown,
  Segmented,
  Statistic,
  Input,
  Tooltip,
  Typography,
  DatePicker,
  Modal,
  Form,
  Select,
  InputNumber,
  Drawer,
  Space,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { Dayjs } from "dayjs";
import {
  MoreOutlined,
  EyeOutlined,
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
  ClockCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  reconciliationService,
  treasuryAccountsService,
} from "@/services/treasury.service";
import { ReconciliationStatus } from "@/constants/enums";
import type {
  BankReconciliation,
  CreateReconciliationDto,
  TreasuryAccount,
} from "@/types/modules/treasury";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const STATUS_TAG: Record<
  ReconciliationStatus,
  { color: string; i18nKey: string }
> = {
  [ReconciliationStatus.DRAFT]: {
    color: "default",
    i18nKey: "treasury.recon.draft",
  },
  [ReconciliationStatus.IN_PROGRESS]: {
    color: "blue",
    i18nKey: "treasury.recon.inProgress",
  },
  [ReconciliationStatus.COMPLETED]: {
    color: "green",
    i18nKey: "treasury.recon.completed",
  },
};

export default function BankReconciliationPage() {
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

  // ── State ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState<BankReconciliation | null>(null);
  const [completeId, setCompleteId] = useState<string | null>(null);

  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────

  const {
    data: listRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.RECONCILIATIONS],
    queryFn: () => reconciliationService.list(),
    staleTime: 30_000,
  });

  const allItems: BankReconciliation[] = useMemo(() => {
    const raw = listRaw as unknown as Record<string, unknown> | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw.data && Array.isArray(raw.data))
      return raw.data as BankReconciliation[];
    return [];
  }, [listRaw]);

  const { data: accountsRaw } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    queryFn: () => treasuryAccountsService.list(),
    staleTime: 60_000,
  });

  const accounts: TreasuryAccount[] = useMemo(() => {
    const raw = accountsRaw as unknown as Record<string, unknown> | undefined;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw.data && Array.isArray(raw.data))
      return raw.data as TreasuryAccount[];
    return [];
  }, [accountsRaw]);

  const accountMap = useMemo(() => {
    const m = new Map<string, TreasuryAccount>();
    accounts.forEach(a => m.set(a.id, a));
    return m;
  }, [accounts]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const items = useMemo(() => {
    let filtered = [...allItems];
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(r => {
        const acct = accountMap.get(r.accountId);
        const name = acct ? getName(acct).toLowerCase() : "";
        return name.includes(q) || (r.notes ?? "").toLowerCase().includes(q);
      });
    }
    if (dateRange?.[0]) {
      const from = dateRange[0];
      filtered = filtered.filter(r => {
        const d = dayjs(r.statementDate);
        return d.isAfter(from) || d.isSame(from, "day");
      });
    }
    if (dateRange?.[1]) {
      const to = dateRange[1];
      filtered = filtered.filter(r => {
        const d = dayjs(r.statementDate);
        return d.isBefore(to) || d.isSame(to, "day");
      });
    }
    return filtered;
  }, [allItems, statusFilter, search, dateRange, accountMap]);

  const totalRows = items.length;

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allItems.length;
  const kpiCompleted = allItems.filter(
    r => r.status === ReconciliationStatus.COMPLETED
  ).length;
  const kpiInProgress = allItems.filter(
    r => r.status === ReconciliationStatus.IN_PROGRESS
  ).length;
  const kpiDraft = allItems.filter(
    r => r.status === ReconciliationStatus.DRAFT
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RECONCILIATIONS] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateReconciliationDto) =>
      reconciliationService.create(dto),
    onSuccess: () => {
      toast.success(t("treasury.recon.created", lang));
      invalidate();
      closeModal();
    },
    onError: () => toast.error(t("treasury.recon.createFailed", lang)),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => reconciliationService.complete(id),
    onSuccess: () => {
      toast.success(t("treasury.recon.completedSuccess", lang));
      invalidate();
      setDrawerOpen(false);
      setViewItem(null);
      setCompleteId(null);
    },
    onError: () => toast.error(t("treasury.recon.completeFailed", lang)),
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    setModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const openView = useCallback((rec: BankReconciliation) => {
    setViewItem(rec);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        accountId: values.accountId,
        statementDate: values.statementDate.format("YYYY-MM-DD"),
        openingBalance: values.openingBalance,
        closingBalance: values.closingBalance,
        notes: values.notes || undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Handle complete confirmation ───────────────────────────────────────

  const handleComplete = useCallback(() => {
    if (!completeId) return;
    completeMutation.mutate(completeId);
  }, [completeId, completeMutation]);

  // ── Helpers ────────────────────────────────────────────────────────────

  const getAccountName = (accountId: string) => {
    const acct = accountMap.get(accountId);
    if (!acct) return accountId;
    return getName(acct);
  };

  const formatAmount = (value: number | undefined | null) => {
    const num = Number(value ?? 0);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = useReconColumns(
    t,
    lang,
    getAccountName,
    formatAmount,
    openView,
    setCompleteId
  );

  const rowSelection: TableProps<BankReconciliation>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("treasury.title", lang), href: "#" },
    { label: t("treasury.recon.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="BankReconciliation" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── Stats Row (4 KPI cards) ──────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.recon.total", lang),
              value: kpiTotal,
              icon: <FileTextOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
              color: undefined as string | undefined,
            },
            {
              title: t("treasury.recon.totalCompleted", lang),
              value: kpiCompleted,
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("treasury.recon.totalInProgress", lang),
              value: kpiInProgress,
              icon: <ClockCircleOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
            },
            {
              title: t("treasury.recon.totalDraft", lang),
              value: kpiDraft,
              icon: <EditOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
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
                      styles={{ content: {
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      } }}
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

        {/* ── Toolbar Card ─────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("treasury.recon.new", lang)}
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
              <Tooltip title={t("sales.filter.allStatuses", lang)}>
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

          {/* ── Filter Panel ─────────────────────────────────────── */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("treasury.recon.status", lang)}
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
                        label: t("treasury.recon.allStatuses", lang),
                      },
                      {
                        value: ReconciliationStatus.DRAFT,
                        label: t("treasury.recon.draft", lang),
                      },
                      {
                        value: ReconciliationStatus.IN_PROGRESS,
                        label: t("treasury.recon.inProgress", lang),
                      },
                      {
                        value: ReconciliationStatus.COMPLETED,
                        label: t("treasury.recon.completed", lang),
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
                    {t("treasury.recon.status", lang)}:{" "}
                    {t(
                      STATUS_TAG[statusFilter as ReconciliationStatus]
                        ?.i18nKey ?? statusFilter,
                      lang
                    )}
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* ── Bulk Bar ─────────────────────────────────────────── */}
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
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("sales.filter.allStatuses", lang)}
              </Button>
            </div>
          )}
        </Card>

        {/* ── Table / Mobile Grid ──────────────────────────────────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={items}
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
            items={items}
            isLoading={isLoading}
            onClick={openView}
            getAccountName={getAccountName}
            formatAmount={formatAmount}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── Confirm Complete Dialog ─────────────────────────────────── */}
      <ConfirmDialog
        open={!!completeId}
        onOpenChange={v => !v && setCompleteId(null)}
        title={t("treasury.recon.complete", lang)}
        description={t("treasury.recon.completeConfirm", lang)}
        confirmLabel={t("treasury.recon.complete", lang)}
        onConfirm={handleComplete}
        variant="warning"
      />

      {/* ── Create Modal ───────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("treasury.recon.new", lang)}
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #3B82F6, #6366f1)",
            padding: "16px 24px",
            margin: "-20px -24px 16px -24px",
            borderRadius: "8px 8px 0 0",
            color: "#fff",
          }}
        >
          <Space>
            <PlusOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("treasury.recon.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label={t("treasury.recon.account", lang)}
                name="accountId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("treasury.recon.account", lang)}
                  options={accounts.map(a => ({
                    value: a.id,
                    label: getName(a),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.recon.statementDate", lang)}
                name="statementDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.recon.openingBalance", lang)}
                name="openingBalance"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} precision={2} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("treasury.recon.closingBalance", lang)}
                name="closingBalance"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} precision={2} min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label={t("treasury.recon.notes", lang)} name="notes">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewItem(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewItem
            ? `${t("treasury.recon.details", lang)} -- ${getAccountName(viewItem.accountId)}`
            : ""
        }
      >
        {viewItem && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.account", lang)}
                </Text>
                <br />
                <Text strong>{getAccountName(viewItem.accountId)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.statementDate", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewItem.statementDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.openingBalance", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {formatAmount(viewItem.openingBalance)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.closingBalance", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {formatAmount(viewItem.closingBalance)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.systemBalance", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {formatAmount(viewItem.systemBalance)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.recon.difference", lang)}
                </Text>
                <br />
                <Text
                  strong
                  style={{
                    fontFamily: "monospace",
                    color:
                      Number(viewItem.difference ?? 0) === 0
                        ? "#10b981"
                        : "#ef4444",
                  }}
                >
                  {formatAmount(viewItem.difference)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.recon.status", lang)}</Text>
                <br />
                {STATUS_TAG[viewItem.status] && (
                  <Tag
                    color={STATUS_TAG[viewItem.status].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(STATUS_TAG[viewItem.status].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              {viewItem.completedAt && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.recon.completedAt", lang)}
                  </Text>
                  <br />
                  <Text>
                    {dayjs(viewItem.completedAt).format("YYYY-MM-DD HH:mm")}
                  </Text>
                </Col>
              )}
              {viewItem.reconciledBy && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.recon.reconciledBy", lang)}
                  </Text>
                  <br />
                  <Text>{viewItem.reconciledBy}</Text>
                </Col>
              )}
              {viewItem.notes && (
                <Col span={24}>
                  <Text type="secondary">
                    {t("treasury.recon.notes", lang)}
                  </Text>
                  <br />
                  <Text>{viewItem.notes}</Text>
                </Col>
              )}
            </Row>

            {/* Action buttons */}
            {viewItem.status !== ReconciliationStatus.COMPLETED && (
              <Space style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  disabled={Number(viewItem.difference ?? 0) !== 0}
                  onClick={() => {
                    if (Number(viewItem.difference ?? 0) !== 0) {
                      toast.warning(t("treasury.recon.zeroRequired", lang));
                      return;
                    }
                    setCompleteId(viewItem.id);
                  }}
                >
                  {t("treasury.recon.complete", lang)}
                </Button>
              </Space>
            )}
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useReconColumns(
  t: (k: string, l: "ar" | "en") => string,
  lang: "ar" | "en",
  getAccountName: (id: string) => string,
  formatAmount: (v: number | undefined | null) => string,
  onView: (rec: BankReconciliation) => void,
  setCompleteId: (id: string | null) => void
): TableColumnsType<BankReconciliation> {
  return useMemo(
    () => [
      {
        title: t("treasury.recon.account", lang),
        dataIndex: "accountId",
        width: 200,
        render: (v: string) => <Text strong>{getAccountName(v)}</Text>,
      },
      {
        title: t("treasury.recon.statementDate", lang),
        dataIndex: "statementDate",
        width: 130,
        sorter: (a: BankReconciliation, b: BankReconciliation) =>
          (a.statementDate ?? "").localeCompare(b.statementDate ?? ""),
        render: (v: string) => (
          <Text type="secondary">{dayjs(v).format("DD MMM YYYY")}</Text>
        ),
      },
      {
        title: t("treasury.recon.openingBalance", lang),
        dataIndex: "openingBalance",
        width: 140,
        align: "end" as const,
        render: (v: number) => (
          <Text className="font-mono">{formatAmount(v)}</Text>
        ),
      },
      {
        title: t("treasury.recon.closingBalance", lang),
        dataIndex: "closingBalance",
        width: 140,
        align: "end" as const,
        render: (v: number) => (
          <Text className="font-mono">{formatAmount(v)}</Text>
        ),
      },
      {
        title: t("treasury.recon.systemBalance", lang),
        dataIndex: "systemBalance",
        width: 140,
        align: "end" as const,
        responsive: ["lg"] as const,
        render: (v: number) => (
          <Text className="font-mono">{formatAmount(v)}</Text>
        ),
      },
      {
        title: t("treasury.recon.difference", lang),
        dataIndex: "difference",
        width: 130,
        align: "end" as const,
        render: (v: number) => {
          const num = Number(v ?? 0);
          return (
            <Text
              strong
              className="font-mono"
              style={{ color: num === 0 ? "#10b981" : "#ef4444" }}
            >
              {formatAmount(num)}
            </Text>
          );
        },
      },
      {
        title: t("treasury.recon.status", lang),
        dataIndex: "status",
        width: 130,
        render: (v: ReconciliationStatus) => {
          const cfg = STATUS_TAG[v];
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
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: BankReconciliation) => {
          const isCompleted = rec.status === ReconciliationStatus.COMPLETED;
          const differenceIsZero = Number(rec.difference ?? 0) === 0;

          const menuItems: NonNullable<
            Parameters<typeof Dropdown>[0]["menu"]
          >["items"] = [
            {
              key: "view",
              label: t("treasury.recon.view", lang),
              icon: <EyeOutlined />,
              onClick: () => onView(rec),
            },
          ];

          if (!isCompleted) {
            menuItems.push({ type: "divider" as const, key: "d1" });
            menuItems.push({
              key: "complete",
              label: t("treasury.recon.complete", lang),
              icon: <CheckCircleOutlined />,
              disabled: !differenceIsZero,
              onClick: () => {
                if (!differenceIsZero) {
                  toast.warning(t("treasury.recon.zeroRequired", lang));
                  return;
                }
                setCompleteId(rec.id);
              },
            });
          }

          return (
            <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={e => e.stopPropagation()}
              />
            </Dropdown>
          );
        },
      },
    ],
    [t, lang, getAccountName, formatAmount, onView, setCompleteId]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  items,
  isLoading,
  onClick,
  getAccountName,
  formatAmount,
  t,
  lang,
}: {
  items: BankReconciliation[];
  isLoading: boolean;
  onClick: (rec: BankReconciliation) => void;
  getAccountName: (id: string) => string;
  formatAmount: (v: number | undefined | null) => string;
  t: (k: string, l: "ar" | "en") => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {items.map(rec => {
        const cfg = STATUS_TAG[rec.status];
        return (
          <Col key={rec.id} xs={24} sm={12} xl={8}>
            <Card
              size="small"
              hoverable
              onClick={() => onClick(rec)}
              styles={{ body: { padding: "12px 16px" } }}
            >
              <div className="flex justify-between items-start mb-2">
                <Text strong>{getAccountName(rec.accountId)}</Text>
                {cfg && (
                  <Tag
                    color={cfg.color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(cfg.i18nKey, lang)}
                  </Tag>
                )}
              </div>
              <Text type="secondary" className="text-xs block">
                {dayjs(rec.statementDate).format("DD MMM YYYY")}
              </Text>
              <div className="flex justify-between mt-1">
                <Text type="secondary" className="text-xs">
                  {t("treasury.recon.difference", lang)}
                </Text>
                <Text
                  strong
                  className="font-mono text-xs"
                  style={{
                    color:
                      Number(rec.difference ?? 0) === 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {formatAmount(rec.difference)}
                </Text>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
