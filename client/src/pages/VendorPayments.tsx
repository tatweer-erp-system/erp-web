/**
 * Vendor Payments (outbound payments) list page.
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
  Tag,
  Segmented,
  Statistic,
  Typography,
  Input,
  Tooltip,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
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
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useBranchStore } from "@/stores/branch.store";
import { paymentsService } from "@/services/invoices.service";
import { treasuryAccountsService } from "@/services/treasury.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import { PaymentTypeNew, PaymentStatusNew } from "@/constants/enums";
import type { Payment, CreatePaymentDto } from "@/types/modules/invoices";
import type { TreasuryAccount } from "@/types/modules/treasury";
import type { PartnerDropdownItem } from "@/types/modules/partners";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/shared/utils/getName.util";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

export default function VendorPayments() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();
  const branchId = useBranchStore(s => s.activeBranch?.id);

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

  // ── State ───────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [fastCreateOpen, setFastCreateOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [form] = Form.useForm();

  // ── Queries ─────────────────────────────────────────────────────────────
  const {
    data: paymentsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.PAYMENTS_LIST, "outbound", branchId],
    queryFn: () =>
      paymentsService.list({
        paymentType: PaymentTypeNew.OUTBOUND,
        limit: 100,
      }),
    enabled: !!branchId,
    staleTime: 15_000,
  });

  const allPayments: Payment[] = useMemo(() => {
    const raw = paymentsRaw as Record<string, unknown> | undefined;
    return (raw?.data as Payment[]) ?? [];
  }, [paymentsRaw]);

  // ── Partners dropdown (vendors) ─────────────────────────────────────────
  const { data: partnersRaw } = useQuery({
    queryKey: [QUERY_KEYS.PARTNERS, "dropdown", "supplier"],
    queryFn: () => getPartnersDropdown({ limit: 100, type: "supplier" }),
    staleTime: 60_000,
  });

  const partnerOptions = useMemo(() => {
    const list =
      ((partnersRaw as Record<string, unknown>)
        ?.data as PartnerDropdownItem[]) ?? [];
    return list.map(p => ({
      value: p.id,
      label: getName(p),
    }));
  }, [partnersRaw]);

  // ── Treasury accounts dropdown ──────────────────────────────────────────
  const { data: accountsRaw } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    queryFn: () => treasuryAccountsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const treasuryOptions = useMemo(() => {
    const list =
      ((accountsRaw as Record<string, unknown>)?.data as TreasuryAccount[]) ??
      [];
    return list
      .filter(a => a.isActive)
      .map(a => ({
        value: a.id,
        label: `${getName(a)} (${a.currency})`,
      }));
  }, [accountsRaw]);

  // ── Filtered data ───────────────────────────────────────────────────────
  const payments = useMemo(() => {
    let filtered = allPayments;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.paymentNumber ?? "").toLowerCase().includes(q) ||
          (p.partnerNameEn ?? "").toLowerCase().includes(q) ||
          (p.partnerNameAr ?? "").toLowerCase().includes(q) ||
          (p.memo ?? "").toLowerCase().includes(q)
      );
    }

    // Date range filter
    if (dateRange?.[0] && dateRange?.[1]) {
      const from = dateRange[0].startOf("day");
      const to = dateRange[1].endOf("day");
      filtered = filtered.filter(p => {
        const d = dayjs(p.paymentDate);
        return d.isAfter(from) || d.isSame(from, "day");
      });
      filtered = filtered.filter(p => {
        const d = dayjs(p.paymentDate);
        return d.isBefore(to) || d.isSame(to, "day");
      });
    }

    return filtered;
  }, [allPayments, statusFilter, search, dateRange]);

  // ── KPI values ──────────────────────────────────────────────────────────
  const kpiTotal = allPayments.length;
  const kpiPosted = allPayments.filter(
    p => p.status === PaymentStatusNew.POSTED
  ).length;
  const kpiDraft = allPayments.filter(
    p => p.status === PaymentStatusNew.DRAFT
  ).length;
  const kpiTotalAmount = allPayments.reduce(
    (sum, p) => sum + Number(p.amount ?? 0),
    0
  );

  // ── Mutations ───────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PAYMENTS_LIST],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreatePaymentDto) => paymentsService.create(dto),
    onSuccess: () => {
      toast.success(t("payments.vendor.created", lang));
      invalidate();
      closeModal();
    },
    onError: () => toast.error(t("payments.vendor.loadFailed", lang)),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => paymentsService.post(id),
    onSuccess: () => {
      toast.success(t("payments.vendor.posted", lang));
      invalidate();
      setPostId(null);
      setDrawerOpen(false);
      setViewPayment(null);
    },
    onError: () => toast.error(t("payments.vendor.loadFailed", lang)),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => paymentsService.cancel(id),
    onSuccess: () => {
      toast.success(t("payments.vendor.cancelled", lang));
      invalidate();
      setCancelId(null);
      setDrawerOpen(false);
      setViewPayment(null);
    },
    onError: () => toast.error(t("payments.vendor.loadFailed", lang)),
  });

  // ── Modal helpers ───────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({ paymentDate: dayjs() });
    setFastCreateOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setFastCreateOpen(false);
    form.resetFields();
  }, [form]);

  const openView = useCallback((p: Payment) => {
    setViewPayment(p);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        partnerId: values.partnerId,
        paymentType: PaymentTypeNew.OUTBOUND,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        amount: values.amount,
        memo: values.memo || undefined,
        treasuryAccountId: values.treasuryAccountId || undefined,
        currencyId: values.currencyId || undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Confirm actions ─────────────────────────────────────────────────────
  const handlePost = useCallback(() => {
    if (!postId) return;
    postMutation.mutate(postId);
  }, [postId, postMutation]);

  const handleCancel = useCallback(() => {
    if (!cancelId) return;
    cancelMutation.mutate(cancelId);
  }, [cancelId, cancelMutation]);

  // ── Status tag helper ───────────────────────────────────────────────────
  const statusTag = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      [PaymentStatusNew.DRAFT]: {
        color: "orange",
        label: t("payments.vendor.statusDraft", lang),
      },
      [PaymentStatusNew.POSTED]: {
        color: "green",
        label: t("payments.vendor.statusPosted", lang),
      },
      [PaymentStatusNew.CANCELLED]: {
        color: "red",
        label: t("payments.vendor.statusCancelled", lang),
      },
    };
    const entry = map[status] ?? { color: "default", label: status };
    return (
      <Tag
        color={entry.color}
        style={{ borderRadius: 20, padding: "2px 10px" }}
      >
        {entry.label}
      </Tag>
    );
  };

  // ── Table columns ───────────────────────────────────────────────────────
  const columns = usePaymentColumns(
    t,
    lang,
    openView,
    statusTag,
    setPostId,
    setCancelId
  );

  const rowSelection: TableProps<Payment>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  // ── Breadcrumbs ─────────────────────────────────────────────────────────
  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("treasury.title", lang), href: "#" },
    { label: t("payments.vendor.title", lang) },
  ];

  return (
    <DashboardLayout currentPage="VendorPayments" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row ────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("payments.vendor.total", lang),
              value: kpiTotal,
              suffix: "",
              icon: <FileTextOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
              color: undefined as string | undefined,
              isCurrency: false,
            },
            {
              title: t("payments.vendor.statusPosted", lang),
              value: kpiPosted,
              suffix: "",
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
              isCurrency: false,
            },
            {
              title: t("payments.vendor.statusDraft", lang),
              value: kpiDraft,
              suffix: "",
              icon: <FileTextOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
              isCurrency: false,
            },
            {
              title: t("payments.vendor.totalAmount", lang),
              value: kpiTotalAmount,
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
              isCurrency: true,
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
                      valueStyle={{
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      }}
                    />
                    {s.suffix && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {s.suffix}
                      </Text>
                    )}
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

        {/* ── 2. Toolbar + Filters Card ───────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("payments.vendor.new", lang)}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <RangePicker
                value={dateRange}
                onChange={dates => {
                  setDateRange(dates);
                  setPage(1);
                }}
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

          {/* Filter Panel (collapsible) */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("payments.vendor.status", lang)}
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
                        label: t("sales.filter.allStatuses", lang),
                      },
                      {
                        value: PaymentStatusNew.DRAFT,
                        label: t("payments.vendor.statusDraft", lang),
                      },
                      {
                        value: PaymentStatusNew.POSTED,
                        label: t("payments.vendor.statusPosted", lang),
                      },
                      {
                        value: PaymentStatusNew.CANCELLED,
                        label: t("payments.vendor.statusCancelled", lang),
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
                    {t("payments.vendor.status", lang)}: {statusFilter}
                  </Tag>
                )}
                {dateRange?.[0] && dateRange?.[1] && (
                  <Tag closable onClose={() => setDateRange(null)}>
                    {dateRange[0].format("YYYY-MM-DD")} ~{" "}
                    {dateRange[1].format("YYYY-MM-DD")}
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
                {selectedRows.length} {t("payments.vendor.selected", lang)}
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

        {/* ── 3. Table / Grid ─────────────────────────────────────────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={payments}
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
                total: payments.length,
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
            payments={payments}
            isLoading={isLoading}
            onClick={openView}
            statusTag={statusTag}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── 4. Confirm Dialogs ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!postId}
        onOpenChange={v => !v && setPostId(null)}
        title={t("payments.vendor.confirmPost", lang)}
        description={t("payments.vendor.confirmPostNote", lang)}
        confirmLabel={t("payments.vendor.post", lang)}
        onConfirm={handlePost}
        variant="warning"
      />
      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={v => !v && setCancelId(null)}
        title={t("payments.vendor.confirmCancel", lang)}
        description={t("payments.vendor.confirmCancelNote", lang)}
        confirmLabel={t("payments.vendor.cancel", lang)}
        onConfirm={handleCancel}
        variant="warning"
      />

      {/* ── 5. Fast Create Modal ────────────────────────────────────────── */}
      <Modal
        open={fastCreateOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("payments.vendor.new", lang)}
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95vw" : 560}
        destroyOnHidden
        title={t("payments.vendor.new", lang)}
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("payments.vendor.partner", lang)}
            name="partnerId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("payments.vendor.selectPartner", lang)}
              options={partnerOptions}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("payments.vendor.amount", lang)}
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
                label={t("payments.vendor.date", lang)}
                name="paymentDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("payments.vendor.treasuryAccount", lang)}
            name="treasuryAccountId"
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="---"
              options={treasuryOptions}
            />
          </Form.Item>

          <Form.Item label={t("payments.vendor.memo", lang)} name="memo">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Drawer ───────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewPayment(null);
        }}
        width={isMobile ? "100%" : 520}
        title={
          viewPayment
            ? `${t("payments.vendor.details", lang)} -- ${viewPayment.paymentNumber ?? viewPayment.id.slice(0, 8)}`
            : ""
        }
      >
        {viewPayment && (
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
                {t("payments.vendor.amount", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color: "#ef4444",
                }}
              >
                -
                {Number(viewPayment.amount ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("payments.vendor.paymentNumber", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewPayment.paymentNumber ?? "---"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("payments.vendor.date", lang)}</Text>
                <br />
                <Text strong>
                  {dayjs(viewPayment.paymentDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("payments.vendor.partner", lang)}
                </Text>
                <br />
                <Text strong>
                  {getName({
                    nameEn: viewPayment.partnerNameEn,
                    nameAr: viewPayment.partnerNameAr,
                  }) || "---"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("payments.vendor.status", lang)}
                </Text>
                <br />
                {statusTag(viewPayment.status)}
              </Col>
              {viewPayment.memo && (
                <Col span={24}>
                  <Text type="secondary">
                    {t("payments.vendor.memo", lang)}
                  </Text>
                  <br />
                  <Text>{viewPayment.memo}</Text>
                </Col>
              )}
              {viewPayment.createdAt && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("payments.vendor.createdAt", lang)}
                  </Text>
                  <br />
                  <Text>
                    {dayjs(viewPayment.createdAt).format("YYYY-MM-DD HH:mm")}
                  </Text>
                </Col>
              )}
            </Row>

            {/* Actions */}
            <Space style={{ marginTop: 8 }}>
              {viewPayment.status === PaymentStatusNew.DRAFT && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={postMutation.isPending}
                  onClick={() => postMutation.mutate(viewPayment.id)}
                >
                  {t("payments.vendor.post", lang)}
                </Button>
              )}
              {viewPayment.status === PaymentStatusNew.DRAFT && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate(viewPayment.id)}
                >
                  {t("payments.vendor.cancel", lang)}
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function usePaymentColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (p: Payment) => void,
  statusTag: (status: string) => React.ReactNode,
  setPostId: (id: string | null) => void,
  setCancelId: (id: string | null) => void
): TableColumnsType<Payment> {
  return useMemo(
    () => [
      {
        title: t("payments.vendor.paymentNumber", lang),
        dataIndex: "paymentNumber",
        width: 160,
        sorter: false,
        render: (v: string) => <CopyableCode value={v ?? "---"} />,
      },
      {
        title: t("payments.vendor.date", lang),
        dataIndex: "paymentDate",
        width: 130,
        sorter: false,
        render: (v: string) => (
          <Text type="secondary">
            {v ? dayjs(v).format("DD MMM YYYY") : "---"}
          </Text>
        ),
      },
      {
        title: t("payments.vendor.partner", lang),
        dataIndex: "partnerNameEn",
        width: 200,
        ellipsis: true,
        render: (_: unknown, r: Payment) => (
          <Text>
            {getName({
              nameEn: r.partnerNameEn,
              nameAr: r.partnerNameAr,
            }) || "---"}
          </Text>
        ),
      },
      {
        title: t("payments.vendor.amount", lang),
        dataIndex: "amount",
        width: 140,
        sorter: false,
        align: "end" as const,
        render: (v: number | string) => (
          <Text strong className="font-mono" style={{ color: "#ef4444" }}>
            -SAR{" "}
            {Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </Text>
        ),
      },
      {
        title: t("payments.vendor.status", lang),
        dataIndex: "status",
        width: 120,
        sorter: false,
        render: (v: string) => statusTag(v),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: Payment) => (
          <Dropdown
            menu={{
              items: buildPaymentActions(
                rec,
                t,
                lang,
                onView,
                setPostId,
                setCancelId
              ),
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
    [t, lang, onView, statusTag, setPostId, setCancelId]
  );
}

function buildPaymentActions(
  rec: Payment,
  t: (k: string, l: string) => string,
  lang: string,
  onView: (p: Payment) => void,
  setPostId: (id: string | null) => void,
  setCancelId: (id: string | null) => void
) {
  const items: NonNullable<Parameters<typeof Dropdown>[0]["menu"]>["items"] = [
    {
      key: "view",
      label: t("common.view", lang),
      icon: <EyeOutlined />,
      onClick: () => onView(rec),
    },
  ];
  if (rec.status === PaymentStatusNew.DRAFT) {
    items.push({
      key: "post",
      label: t("payments.vendor.post", lang),
      icon: <CheckCircleOutlined />,
      onClick: () => setPostId(rec.id),
    });
    items.push({ type: "divider" as const, key: "d" });
    items.push({
      key: "cancel",
      label: t("payments.vendor.cancel", lang),
      icon: <CloseCircleOutlined />,
      danger: true,
      onClick: () => setCancelId(rec.id),
    });
  }
  return items;
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  payments,
  isLoading,
  onClick,
  statusTag,
  t,
  lang,
}: {
  payments: Payment[];
  isLoading: boolean;
  onClick: (p: Payment) => void;
  statusTag: (status: string) => React.ReactNode;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (payments.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          {t("payments.vendor.noData", lang)}
        </div>
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {payments.map(p => (
        <Col key={p.id} xs={24} sm={12} xl={8}>
          <Card
            size="small"
            hoverable
            onClick={() => onClick(p)}
            styles={{ body: { padding: "16px" } }}
          >
            <div className="flex justify-between items-start mb-2">
              <Text strong className="font-mono">
                {p.paymentNumber ?? "---"}
              </Text>
              {statusTag(p.status)}
            </div>
            <div className="flex justify-between items-center">
              <Text type="secondary">
                {getName({
                  nameEn: p.partnerNameEn,
                  nameAr: p.partnerNameAr,
                }) || "---"}
              </Text>
              <Text strong className="font-mono" style={{ color: "#ef4444" }}>
                -SAR{" "}
                {Number(p.amount ?? 0).toLocaleString("en-SA", {
                  minimumFractionDigits: 2,
                })}
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {p.paymentDate
                ? dayjs(p.paymentDate).format("DD MMM YYYY")
                : "---"}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
