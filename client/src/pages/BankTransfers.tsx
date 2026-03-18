/**
 * Treasury Bank Transfers list page.
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
  SwapOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  treasuryAccountsService,
  treasuryTransactionsService,
} from "@/services/treasury.service";
import { TreasuryTransactionType } from "@/constants/enums";
import type {
  TreasuryAccount,
  TreasuryTransaction,
  CreateTransferDto,
} from "@/types/modules/treasury";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

// ── Transfer-type transaction types ──────────────────────────────────────────
const TRANSFER_TYPES: string[] = [
  TreasuryTransactionType.TRANSFER_IN,
  TreasuryTransactionType.TRANSFER_OUT,
];

export default function BankTransfers() {
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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [typeFilter, setTypeFilter] = useState<string>("all");
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
  const [viewTransaction, setViewTransaction] =
    useState<TreasuryTransaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────

  const { data: accountsRaw, isLoading: accountsLoading } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    queryFn: () => treasuryAccountsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allAccounts: TreasuryAccount[] = useMemo(() => {
    return (
      ((accountsRaw as Record<string, unknown>)?.data as TreasuryAccount[]) ??
      []
    );
  }, [accountsRaw]);

  const accountOptions = useMemo(
    () =>
      allAccounts
        .filter(a => a.isActive)
        .map(a => ({
          value: a.id,
          label: `${getName(a)} (${a.currency})`,
        })),
    [allAccounts]
  );

  const selectedAccount = useMemo(
    () => allAccounts.find(a => a.id === selectedAccountId) ?? null,
    [allAccounts, selectedAccountId]
  );

  const {
    data: transactionsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.TREASURY_TRANSACTIONS,
      selectedAccountId,
      "transfers",
    ],
    queryFn: () =>
      treasuryTransactionsService.listByAccount(selectedAccountId!, {
        limit: 100,
      }),
    enabled: !!selectedAccountId,
    staleTime: 15_000,
  });

  const allTransactions: TreasuryTransaction[] = useMemo(() => {
    const list =
      ((transactionsRaw as Record<string, unknown>)
        ?.data as TreasuryTransaction[]) ?? [];
    return list.filter(tx => TRANSFER_TYPES.includes(tx.type));
  }, [transactionsRaw]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const transactions = useMemo(() => {
    let filtered = allTransactions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        tx =>
          (tx.reference ?? "").toLowerCase().includes(q) ||
          (tx.description ?? "").toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    if (dateRange?.[0]) {
      const from = dateRange[0];
      filtered = filtered.filter(tx => {
        const d = dayjs(tx.date);
        return d.isAfter(from) || d.isSame(from, "day");
      });
    }
    if (dateRange?.[1]) {
      const to = dateRange[1];
      filtered = filtered.filter(tx => {
        const d = dayjs(tx.date);
        return d.isBefore(to) || d.isSame(to, "day");
      });
    }
    return filtered;
  }, [allTransactions, search, typeFilter, dateRange]);

  const totalRows = transactions.length;

  // ── KPI values ─────────────────────────────────────────────────────────
  const kpiTotal = allTransactions.length;
  const kpiTotalAmount = allTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount ?? 0),
    0
  );
  const kpiTransferIn = allTransactions.filter(
    tx => tx.type === TreasuryTransactionType.TRANSFER_IN
  ).length;
  const kpiTransferOut = allTransactions.filter(
    tx => tx.type === TreasuryTransactionType.TRANSFER_OUT
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_TRANSACTIONS],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    });
  };

  const transferMutation = useMutation({
    mutationFn: (dto: CreateTransferDto) =>
      treasuryTransactionsService.transfer(dto),
    onSuccess: () => {
      toast.success(t("treasury.transfers.created", lang));
      invalidate();
      closeModal();
    },
    onError: () => toast.error(t("treasury.transfers.createFailed", lang)),
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      sourceAccountId: selectedAccountId ?? undefined,
      date: dayjs(),
    });
    setModalOpen(true);
  }, [form, selectedAccountId]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const openView = useCallback((tx: TreasuryTransaction) => {
    setViewTransaction(tx);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.sourceAccountId === values.destinationAccountId) {
        toast.error(t("treasury.transfers.sameAccountError", lang));
        return;
      }
      transferMutation.mutate({
        sourceAccountId: values.sourceAccountId,
        destinationAccountId: values.destinationAccountId,
        amount: values.amount,
        date: values.date.format("YYYY-MM-DD"),
        description: values.description || undefined,
        reference: values.reference || undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Type tag helper ────────────────────────────────────────────────────

  const typeTag = (type: string) => {
    const map: Record<string, { color: string; label: string }> = {
      [TreasuryTransactionType.TRANSFER_IN]: {
        color: "green",
        label: t("treasury.transfers.transferIn", lang),
      },
      [TreasuryTransactionType.TRANSFER_OUT]: {
        color: "red",
        label: t("treasury.transfers.transferOut", lang),
      },
    };
    const entry = map[type] ?? { color: "default", label: type };
    return (
      <Tag
        color={entry.color}
        style={{ borderRadius: 20, padding: "2px 10px" }}
      >
        {entry.label}
      </Tag>
    );
  };

  // ── Helper: find account name ──────────────────────────────────────────

  const getAccountName = (accountId: string) => {
    const acc = allAccounts.find(a => a.id === accountId);
    return acc ? getName(acc) : "--";
  };

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = useTransferColumns(t, lang, typeTag, openView);

  const rowSelection: TableProps<TreasuryTransaction>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("treasury.title", lang), href: "#" },
    { label: t("treasury.transfers.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="BankTransfers" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── Account Selector ──────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 items-center">
            <Text strong style={{ marginInlineEnd: 8 }}>
              {t("treasury.transfers.selectAccount", lang)}
            </Text>
            <Select
              value={selectedAccountId}
              onChange={v => setSelectedAccountId(v)}
              placeholder={t("treasury.transfers.selectAccount", lang)}
              style={{ minWidth: 280 }}
              allowClear
              showSearch
              optionFilterProp="label"
              loading={accountsLoading}
              options={accountOptions}
            />
          </div>
        </Card>

        {/* ── Stats Row (4 KPI cards) ──────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.transfers.total", lang),
              value: kpiTotal,
              icon: <SwapOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
              color: undefined as string | undefined,
              isCurrency: false,
            },
            {
              title: t("treasury.transfers.totalAmount", lang),
              value: kpiTotalAmount,
              icon: <DollarOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
              isCurrency: true,
            },
            {
              title: t("treasury.transfers.transferIn", lang),
              value: kpiTransferIn,
              icon: <ArrowDownOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
              isCurrency: false,
            },
            {
              title: t("treasury.transfers.transferOut", lang),
              value: kpiTransferOut,
              icon: <ArrowUpOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
              isCurrency: false,
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
                      precision={s.isCurrency ? 2 : 0}
                      suffix={
                        s.isCurrency
                          ? ` ${selectedAccount?.currency ?? "SAR"}`
                          : ""
                      }
                      valueStyle={{
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      }}
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
                {t("treasury.transfers.new", lang)}
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
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  disabled={!selectedAccountId}
                />
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
                    {t("treasury.transfers.type", lang)}
                  </Text>
                  <Segmented
                    value={typeFilter}
                    onChange={v => {
                      setTypeFilter(v as string);
                      setPage(1);
                    }}
                    block
                    options={[
                      {
                        value: "all",
                        label: t("sales.filter.allStatuses", lang),
                      },
                      {
                        value: TreasuryTransactionType.TRANSFER_IN,
                        label: t("treasury.transfers.transferIn", lang),
                      },
                      {
                        value: TreasuryTransactionType.TRANSFER_OUT,
                        label: t("treasury.transfers.transferOut", lang),
                      },
                    ]}
                    size="small"
                  />
                </Col>
              </Row>

              {/* Active filter tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {typeFilter !== "all" && (
                  <Tag closable onClose={() => setTypeFilter("all")}>
                    {t("treasury.transfers.type", lang)}: {typeFilter}
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
            {selectedAccountId ? (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={transactions}
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
            ) : (
              <div className="py-12">
                <EmptyState />
              </div>
            )}
          </Card>
        ) : (
          <MobileGrid
            transactions={transactions}
            isLoading={isLoading}
            onClick={openView}
            typeTag={typeTag}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── Confirm Delete Dialog ──────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("treasury.transfers.deleteConfirm", lang)}
        description={t("treasury.transfers.deleteConfirmNote", lang)}
        confirmLabel={t("sales.action.delete", lang)}
        onConfirm={() => setDeleteId(null)}
        variant="danger"
      />

      {/* ── Create Transfer Modal ──────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("treasury.transfers.new", lang)}
        confirmLoading={transferMutation.isPending}
        width={isMobile ? "95vw" : 560}
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
            <SwapOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("treasury.transfers.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("treasury.transfers.sourceAccount", lang)}
            name="sourceAccountId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("treasury.transfers.selectSource", lang)}
              options={accountOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("treasury.transfers.destinationAccount", lang)}
            name="destinationAccountId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("treasury.transfers.selectDestination", lang)}
              options={accountOptions}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.transfers.amount", lang)}
                name="amount"
                rules={[{ required: true }, { type: "number", min: 0.01 }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  precision={2}
                  min={0.01}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.transfers.date", lang)}
                name="date"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.transfers.reference", lang)}
                name="reference"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("treasury.transfers.description", lang)}
            name="description"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewTransaction(null);
        }}
        width={isMobile ? "100%" : 520}
        title={
          viewTransaction
            ? `${t("treasury.transfers.details", lang)} -- ${viewTransaction.reference ?? viewTransaction.id.slice(0, 8)}`
            : ""
        }
      >
        {viewTransaction && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Amount highlight */}
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
                {t("treasury.transfers.amount", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color:
                    viewTransaction.type === TreasuryTransactionType.TRANSFER_IN
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {Number(viewTransaction.amount ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                {viewTransaction.currency}
              </Text>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.date", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewTransaction.date).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.type", lang)}
                </Text>
                <br />
                {typeTag(viewTransaction.type)}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.account", lang)}
                </Text>
                <br />
                <Text strong>{getAccountName(viewTransaction.accountId)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.reference", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewTransaction.reference ?? "--"}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary">
                  {t("treasury.transfers.description", lang)}
                </Text>
                <br />
                <Text>{viewTransaction.description ?? "--"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.currency", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewTransaction.currency}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.transfers.exchangeRate", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {Number(viewTransaction.exchangeRate ?? 1).toFixed(4)}
                </Text>
              </Col>
              {viewTransaction.runningBalance != null && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.transfers.runningBalance", lang)}
                  </Text>
                  <br />
                  <Text strong style={{ fontFamily: "monospace" }}>
                    {Number(viewTransaction.runningBalance).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </Text>
                </Col>
              )}
              {viewTransaction.createdAt && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.transfers.createdAt", lang)}
                  </Text>
                  <br />
                  <Text>
                    {dayjs(viewTransaction.createdAt).format(
                      "YYYY-MM-DD HH:mm"
                    )}
                  </Text>
                </Col>
              )}
            </Row>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useTransferColumns(
  t: (k: string, l: "ar" | "en") => string,
  lang: "ar" | "en",
  typeTag: (type: string) => React.ReactNode,
  onView: (tx: TreasuryTransaction) => void
): TableColumnsType<TreasuryTransaction> {
  return useMemo(
    () => [
      {
        title: t("treasury.transfers.date", lang),
        dataIndex: "date",
        width: 130,
        sorter: (a: TreasuryTransaction, b: TreasuryTransaction) =>
          a.date.localeCompare(b.date),
        render: (v: string) => (
          <Text type="secondary">{dayjs(v).format("DD MMM YYYY")}</Text>
        ),
      },
      {
        title: t("treasury.transfers.reference", lang),
        dataIndex: "reference",
        width: 160,
        render: (v: string | null) =>
          v ? <CopyableCode value={v} /> : <Text type="secondary">--</Text>,
      },
      {
        title: t("treasury.transfers.description", lang),
        dataIndex: "description",
        width: 200,
        ellipsis: true,
        render: (v: string | null) =>
          v ? <Text>{v}</Text> : <Text type="secondary">--</Text>,
      },
      {
        title: t("treasury.transfers.amount", lang),
        dataIndex: "amount",
        width: 150,
        align: "end" as const,
        sorter: (a: TreasuryTransaction, b: TreasuryTransaction) =>
          Number(a.amount) - Number(b.amount),
        render: (v: number, rec: TreasuryTransaction) => {
          const color =
            rec.type === TreasuryTransactionType.TRANSFER_IN
              ? "#10b981"
              : "#ef4444";
          return (
            <Text strong className="font-mono" style={{ color }}>
              {Number(v ?? 0).toLocaleString("en-SA", {
                minimumFractionDigits: 2,
              })}
            </Text>
          );
        },
      },
      {
        title: t("treasury.transfers.type", lang),
        dataIndex: "type",
        width: 130,
        render: (v: string) => typeTag(v),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: TreasuryTransaction) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("common.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
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
    [t, lang, typeTag, onView]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  transactions,
  isLoading,
  onClick,
  typeTag,
  t,
  lang,
}: {
  transactions: TreasuryTransaction[];
  isLoading: boolean;
  onClick: (tx: TreasuryTransaction) => void;
  typeTag: (type: string) => React.ReactNode;
  t: (k: string, l: "ar" | "en") => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (transactions.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {transactions.map(tx => (
        <Col key={tx.id} xs={24} sm={12} xl={8}>
          <Card
            size="small"
            hoverable
            onClick={() => onClick(tx)}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div className="flex justify-between items-start mb-2">
              <Text
                strong
                style={{
                  fontFamily: "monospace",
                  color:
                    tx.type === TreasuryTransactionType.TRANSFER_IN
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {Number(tx.amount ?? 0).toLocaleString("en-SA", {
                  minimumFractionDigits: 2,
                })}
              </Text>
              {typeTag(tx.type)}
            </div>
            <Text type="secondary" className="text-xs block">
              {dayjs(tx.date).format("DD MMM YYYY")}
            </Text>
            {tx.reference && (
              <Text
                type="secondary"
                className="text-xs block"
                style={{ fontFamily: "monospace" }}
              >
                {tx.reference}
              </Text>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
