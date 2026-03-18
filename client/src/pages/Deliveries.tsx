/**
 * Deliveries list page.
 * Follows the CashAccounts.tsx design pattern exactly.
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
  Form,
  Select,
  Drawer,
  Space,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
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
  CloseCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  CheckOutlined,
  StopOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { DeliveryStatus } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { apiClient } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

// ── Types ────────────────────────────────────────────────────────────────────

type DeliveryLine = {
  id: string;
  productId: string;
  productNameEn?: string | null;
  productNameAr?: string | null;
  productSku?: string | null;
  qtyDemand: number;
  qtyDone: number;
};

type Delivery = {
  id: string;
  deliveryNumber?: string;
  partnerId: string | null;
  partnerNameEn?: string | null;
  partnerNameAr?: string | null;
  saleOrderId: string | null;
  orderNumber?: string | null;
  scheduledDate: string | null;
  responsibleId: string | null;
  responsibleNameEn?: string | null;
  responsibleNameAr?: string | null;
  status: string;
  notes: string | null;
  lines?: DeliveryLine[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

type CreateDeliveryDto = {
  partnerId: string;
  saleOrderId?: string;
  scheduledDate?: string;
  responsibleId?: string;
  notes?: string;
  lines: { productId: string; qtyDemand: number; qtyDone: number }[];
};

type DeliverySummary = {
  totalRecords: number;
  totalDraft: number;
  totalReady: number;
  totalDone: number;
  totalCancelled: number;
};

// ── API helpers ──────────────────────────────────────────────────────────────

const deliveriesApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<PaginatedResponse<Delivery>>("/sales/deliveries", { params })
      .then(r => r.data),
  get: (id: string) =>
    apiClient
      .get<ApiResponse<Delivery>>(`/sales/deliveries/${id}`)
      .then(r => r.data),
  create: (dto: CreateDeliveryDto) =>
    apiClient
      .post<ApiResponse<Delivery>>("/sales/deliveries", dto)
      .then(r => r.data),
  summary: () =>
    apiClient
      .get<ApiResponse<DeliverySummary>>("/sales/deliveries/summary")
      .then(r => r.data),
  validate: (id: string) =>
    apiClient
      .post<ApiResponse<Delivery>>(`/sales/deliveries/${id}/validate`)
      .then(r => r.data),
  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<Delivery>>(`/sales/deliveries/${id}/cancel`)
      .then(r => r.data),
};

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [DeliveryStatus.DRAFT]: "blue",
  [DeliveryStatus.READY]: "gold",
  [DeliveryStatus.DONE]: "green",
  [DeliveryStatus.CANCELLED]: "default",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function Deliveries() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ──────────────────────────────────────────
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

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDelivery, setViewDelivery] = useState<Delivery | null>(null);

  // Create drawer
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();
  const [lineRows, setLineRows] = useState<
    { productId: string; qtyDemand: number; qtyDone: number }[]
  >([{ productId: "", qtyDemand: 1, qtyDone: 0 }]);

  // ── Queries ────────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const p: Record<string, unknown> = { page, limit: pageSize };
    if (search.trim()) p.search = search.trim();
    if (statusFilter !== "all") p.status = statusFilter;
    if (dateRange?.[0]) p.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) p.dateTo = dateRange[1].format("YYYY-MM-DD");
    return p;
  }, [page, pageSize, search, statusFilter, dateRange]);

  const {
    data: deliveriesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.DELIVERIES, queryParams],
    queryFn: () => deliveriesApi.list(queryParams),
    staleTime: 30_000,
  });

  const allDeliveries: Delivery[] = useMemo(
    () => (deliveriesRaw as PaginatedResponse<Delivery>)?.data ?? [],
    [deliveriesRaw]
  );
  const totalRows =
    (deliveriesRaw as PaginatedResponse<Delivery>)?.meta?.total ?? 0;

  // ── Summary (KPIs from backend) ────────────────────────────────────────
  const { data: summaryRaw } = useQuery({
    queryKey: [QUERY_KEYS.DELIVERIES_SUMMARY],
    queryFn: () => deliveriesApi.summary(),
    staleTime: 60_000,
  });

  const summary: DeliverySummary = useMemo(() => {
    const d = (summaryRaw as unknown as Record<string, unknown>)?.data as
      | DeliverySummary
      | undefined;
    return {
      totalRecords: d?.totalRecords ?? 0,
      totalDraft: d?.totalDraft ?? 0,
      totalReady: d?.totalReady ?? 0,
      totalDone: d?.totalDone ?? 0,
      totalCancelled: d?.totalCancelled ?? 0,
    };
  }, [summaryRaw]);

  // ── Detail fetch ──────────────────────────────────────────────────────
  const { data: detailRaw } = useQuery({
    queryKey: [QUERY_KEYS.DELIVERIES, "detail", viewDelivery?.id],
    queryFn: () => deliveriesApi.get(viewDelivery!.id),
    enabled: !!viewDelivery?.id && drawerOpen,
    staleTime: 15_000,
  });

  const detailDelivery: Delivery | null = useMemo(() => {
    const d = (detailRaw as unknown as Record<string, unknown>)?.data as
      | Delivery
      | undefined;
    return d ?? viewDelivery;
  }, [detailRaw, viewDelivery]);

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DELIVERIES] });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.DELIVERIES_SUMMARY],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateDeliveryDto) => deliveriesApi.create(dto),
    onSuccess: () => {
      toast.success(t("deliveries.created", lang));
      invalidate();
      closeCreate();
    },
    onError: () => toast.error(t("deliveries.createFailed", lang)),
  });

  const validateMutation = useMutation({
    mutationFn: (id: string) => deliveriesApi.validate(id),
    onSuccess: () => {
      toast.success(t("deliveries.validated", lang));
      invalidate();
    },
    onError: () => toast.error(t("deliveries.validateFailed", lang)),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => deliveriesApi.cancel(id),
    onSuccess: () => {
      toast.success(t("deliveries.cancelled", lang));
      invalidate();
    },
    onError: () => toast.error(t("deliveries.cancelFailed", lang)),
  });

  // ── Helpers ────────────────────────────────────────────────────────────
  const openView = useCallback((delivery: Delivery) => {
    setViewDelivery(delivery);
    setDrawerOpen(true);
  }, []);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    form.resetFields();
    setLineRows([{ productId: "", qtyDemand: 1, qtyDone: 0 }]);
  }, [form]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const validLines = lineRows.filter(l => l.productId.trim());
      if (validLines.length === 0) {
        toast.error(t("deliveries.noLines", lang));
        return;
      }
      createMutation.mutate({
        partnerId: values.partnerId,
        saleOrderId: values.saleOrderId || undefined,
        scheduledDate: values.scheduledDate
          ? dayjs(values.scheduledDate).format("YYYY-MM-DD")
          : undefined,
        responsibleId: values.responsibleId || undefined,
        notes: values.notes || undefined,
        lines: validLines,
      });
    } catch {
      // form validation failed
    }
  };

  const handleAction = useCallback(
    (action: "validate" | "cancel", id: string) => {
      if (action === "validate") validateMutation.mutate(id);
      else cancelMutation.mutate(id);
    },
    [validateMutation, cancelMutation]
  );

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useDeliveryColumns(t, lang, openView, handleAction);

  const rowSelection: TableProps<Delivery>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("SALES", lang), href: "#" },
    { label: t("deliveries.title", lang) },
  ];

  // ── KPI cards ─────────────────────────────────────────────────────────
  const statCards = [
    {
      title: t("deliveries.totalDeliveries", lang),
      value: summary.totalRecords,
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("deliveries.draft", lang),
      value: summary.totalDraft,
      icon: <ClockCircleOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("deliveries.ready", lang),
      value: summary.totalReady,
      icon: <InboxOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
    {
      title: t("deliveries.done", lang),
      value: summary.totalDone,
      icon: <CheckCircleOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("deliveries.cancelledLabel", lang),
      value: summary.totalCancelled,
      icon: <CloseCircleOutlined />,
      iconColor: "#6b7280",
      iconBg: "#6b728015",
    },
  ];

  return (
    <DashboardLayout currentPage="Deliveries" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row ────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={4}>
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

        {/* ── 2. Toolbar Card ────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateOpen(true)}
              >
                {t("deliveries.new", lang)}
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
                placeholder={t("deliveries.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("deliveries.allStatuses", lang)}>
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

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("common.status", lang)}
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
                        label: t("deliveries.allStatuses", lang),
                      },
                      {
                        value: DeliveryStatus.DRAFT,
                        label: t("deliveries.draft", lang),
                      },
                      {
                        value: DeliveryStatus.READY,
                        label: t("deliveries.ready", lang),
                      },
                      {
                        value: DeliveryStatus.DONE,
                        label: t("deliveries.done", lang),
                      },
                      {
                        value: DeliveryStatus.CANCELLED,
                        label: t("deliveries.cancelledLabel", lang),
                      },
                    ]}
                    size="small"
                  />
                </Col>
              </Row>

              {statusFilter !== "all" && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <Tag closable onClose={() => setStatusFilter("all")}>
                    {t("common.status", lang)}: {statusFilter}
                  </Tag>
                </div>
              )}
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

        {/* ── 3. Table / Grid ────────────────────────────────────────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={allDeliveries}
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
            deliveries={allDeliveries}
            isLoading={isLoading}
            onClick={openView}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── 4. Detail Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewDelivery(null);
        }}
        width={isMobile ? "100%" : 720}
        title={
          detailDelivery
            ? `${t("deliveries.detail", lang)} — ${detailDelivery.deliveryNumber ?? detailDelivery.id.slice(0, 8)}`
            : ""
        }
      >
        {detailDelivery && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Status badge + actions */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Tag
                color={STATUS_COLOR[detailDelivery.status] ?? "default"}
                style={{ borderRadius: 20, padding: "2px 12px", fontSize: 14 }}
              >
                {detailDelivery.status}
              </Tag>
              <Space>
                {(detailDelivery.status === DeliveryStatus.DRAFT ||
                  detailDelivery.status === DeliveryStatus.READY) && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={validateMutation.isPending}
                    onClick={() => handleAction("validate", detailDelivery.id)}
                  >
                    {t("deliveries.validate", lang)}
                  </Button>
                )}
                {(detailDelivery.status === DeliveryStatus.DRAFT ||
                  detailDelivery.status === DeliveryStatus.READY) && (
                  <Button
                    danger
                    icon={<StopOutlined />}
                    loading={cancelMutation.isPending}
                    onClick={() => handleAction("cancel", detailDelivery.id)}
                  >
                    {t("common.cancel", lang)}
                  </Button>
                )}
              </Space>
            </div>

            {/* Info grid */}
            <Card size="small">
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text type="secondary">{t("deliveries.partner", lang)}</Text>
                  <br />
                  <Text strong>
                    {getName({
                      nameEn: detailDelivery.partnerNameEn,
                      nameAr: detailDelivery.partnerNameAr,
                    }) || "--"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("deliveries.saleOrder", lang)}
                  </Text>
                  <br />
                  <Text strong>{detailDelivery.orderNumber ?? "--"}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("deliveries.scheduledDate", lang)}
                  </Text>
                  <br />
                  <Text strong>
                    {detailDelivery.scheduledDate
                      ? dayjs(detailDelivery.scheduledDate).format("YYYY-MM-DD")
                      : "--"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("deliveries.responsible", lang)}
                  </Text>
                  <br />
                  <Text strong>
                    {getName({
                      nameEn: detailDelivery.responsibleNameEn,
                      nameAr: detailDelivery.responsibleNameAr,
                    }) || "--"}
                  </Text>
                </Col>
                {detailDelivery.notes && (
                  <Col span={24}>
                    <Text type="secondary">{t("common.notes", lang)}</Text>
                    <br />
                    <Text>{detailDelivery.notes}</Text>
                  </Col>
                )}
              </Row>
            </Card>

            {/* Lines table */}
            <Card size="small" title={t("deliveries.lines", lang)}>
              <Table
                rowKey="id"
                dataSource={detailDelivery.lines ?? []}
                pagination={false}
                size="small"
                scroll={{ x: "max-content" }}
                columns={[
                  {
                    title: t("deliveries.product", lang),
                    dataIndex: "productNameEn",
                    width: 220,
                    render: (_: unknown, rec: DeliveryLine) => (
                      <div>
                        <Text strong>
                          {getName({
                            nameEn: rec.productNameEn,
                            nameAr: rec.productNameAr,
                          })}
                        </Text>
                        {rec.productSku && (
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, display: "block" }}
                          >
                            {rec.productSku}
                          </Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: t("deliveries.qtyDemand", lang),
                    dataIndex: "qtyDemand",
                    width: 120,
                    align: "end" as const,
                    render: (v: number) => Number(v ?? 0).toLocaleString(),
                  },
                  {
                    title: t("deliveries.qtyDone", lang),
                    dataIndex: "qtyDone",
                    width: 120,
                    align: "end" as const,
                    render: (v: number) => Number(v ?? 0).toLocaleString(),
                  },
                  {
                    title: t("deliveries.remaining", lang),
                    width: 120,
                    align: "end" as const,
                    render: (_: unknown, rec: DeliveryLine) => {
                      const remaining =
                        Number(rec.qtyDemand ?? 0) - Number(rec.qtyDone ?? 0);
                      return (
                        <Text
                          style={{
                            color: remaining > 0 ? "#f59e0b" : "#10b981",
                          }}
                        >
                          {remaining.toLocaleString()}
                        </Text>
                      );
                    },
                  },
                ]}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      {/* ── 5. Create Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={createOpen}
        onClose={closeCreate}
        width={isMobile ? "100%" : 640}
        title={t("deliveries.new", lang)}
        extra={
          <Button
            type="primary"
            onClick={handleCreate}
            loading={createMutation.isPending}
          >
            {t("common.save", lang)}
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("deliveries.partner", lang)}
                name="partnerId"
                rules={[{ required: true }]}
              >
                <Input placeholder={t("deliveries.partnerPlaceholder", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("deliveries.saleOrder", lang)}
                name="saleOrderId"
              >
                <Input
                  placeholder={t("deliveries.saleOrderPlaceholder", lang)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("deliveries.scheduledDate", lang)}
                name="scheduledDate"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("deliveries.responsible", lang)}
                name="responsibleId"
              >
                <Input
                  placeholder={t("deliveries.responsiblePlaceholder", lang)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t("common.notes", lang)} name="notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>

        {/* Editable lines */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <Text strong>{t("deliveries.lines", lang)}</Text>
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() =>
                setLineRows(prev => [
                  ...prev,
                  { productId: "", qtyDemand: 1, qtyDone: 0 },
                ])
              }
            >
              {t("deliveries.addLine", lang)}
            </Button>
          </div>

          <Table
            rowKey={(_, idx) => String(idx)}
            dataSource={lineRows}
            pagination={false}
            size="small"
            columns={[
              {
                title: t("deliveries.product", lang),
                dataIndex: "productId",
                width: 200,
                render: (_: unknown, __: unknown, idx: number) => (
                  <Input
                    value={lineRows[idx].productId}
                    onChange={e => {
                      const next = [...lineRows];
                      next[idx] = { ...next[idx], productId: e.target.value };
                      setLineRows(next);
                    }}
                    placeholder={t("deliveries.productPlaceholder", lang)}
                    size="small"
                  />
                ),
              },
              {
                title: t("deliveries.qtyDemand", lang),
                dataIndex: "qtyDemand",
                width: 120,
                render: (_: unknown, __: unknown, idx: number) => (
                  <Input
                    type="number"
                    min={0}
                    value={lineRows[idx].qtyDemand}
                    onChange={e => {
                      const next = [...lineRows];
                      next[idx] = {
                        ...next[idx],
                        qtyDemand: Number(e.target.value),
                      };
                      setLineRows(next);
                    }}
                    size="small"
                  />
                ),
              },
              {
                title: t("deliveries.qtyDone", lang),
                dataIndex: "qtyDone",
                width: 120,
                render: (_: unknown, __: unknown, idx: number) => (
                  <Input
                    type="number"
                    min={0}
                    value={lineRows[idx].qtyDone}
                    onChange={e => {
                      const next = [...lineRows];
                      next[idx] = {
                        ...next[idx],
                        qtyDone: Number(e.target.value),
                      };
                      setLineRows(next);
                    }}
                    size="small"
                  />
                ),
              },
              {
                title: "",
                width: 50,
                render: (_: unknown, __: unknown, idx: number) => (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    disabled={lineRows.length <= 1}
                    onClick={() =>
                      setLineRows(prev => prev.filter((_, i) => i !== idx))
                    }
                  />
                ),
              },
            ]}
          />
        </div>
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useDeliveryColumns(
  t: (k: string, l: "ar" | "en") => string,
  lang: "ar" | "en",
  onView: (d: Delivery) => void,
  onAction: (action: "validate" | "cancel", id: string) => void
): TableColumnsType<Delivery> {
  return useMemo(
    () => [
      {
        title: t("deliveries.date", lang),
        dataIndex: "createdAt",
        width: 120,
        render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD") : "--"),
      },
      {
        title: t("deliveries.partner", lang),
        dataIndex: "partnerNameEn",
        width: 180,
        render: (_: unknown, rec: Delivery) => (
          <Text>
            {getName({
              nameEn: rec.partnerNameEn,
              nameAr: rec.partnerNameAr,
            }) || "--"}
          </Text>
        ),
      },
      {
        title: t("deliveries.saleOrder", lang),
        dataIndex: "orderNumber",
        width: 150,
        render: (v: string | null) => (
          <Text className="font-mono">{v ?? "--"}</Text>
        ),
      },
      {
        title: t("deliveries.scheduledDate", lang),
        dataIndex: "scheduledDate",
        width: 130,
        render: (v: string | null) =>
          v ? dayjs(v).format("YYYY-MM-DD") : "--",
      },
      {
        title: t("deliveries.responsible", lang),
        dataIndex: "responsibleNameEn",
        width: 160,
        responsive: ["lg"] as const,
        render: (_: unknown, rec: Delivery) => (
          <Text>
            {getName({
              nameEn: rec.responsibleNameEn,
              nameAr: rec.responsibleNameAr,
            }) || "--"}
          </Text>
        ),
      },
      {
        title: t("common.status", lang),
        dataIndex: "status",
        width: 120,
        render: (v: string) => (
          <Tag
            color={STATUS_COLOR[v] ?? "default"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v}
          </Tag>
        ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: Delivery) => {
          const items = [
            {
              key: "view",
              label: t("common.view", lang),
              icon: <EyeOutlined />,
              onClick: () => onView(rec),
            },
          ];

          if (
            rec.status === DeliveryStatus.DRAFT ||
            rec.status === DeliveryStatus.READY
          ) {
            items.push({
              key: "validate",
              label: t("deliveries.validate", lang),
              icon: <CheckOutlined />,
              onClick: () => onAction("validate", rec.id),
            });
            items.push({
              key: "cancel",
              label: t("common.cancel", lang),
              icon: <StopOutlined />,
              onClick: () => onAction("cancel", rec.id),
            });
          }

          return (
            <Dropdown menu={{ items }} trigger={["click"]}>
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
    [t, lang, onView, onAction]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  deliveries,
  isLoading,
  onClick,
  t,
  lang,
}: {
  deliveries: Delivery[];
  isLoading: boolean;
  onClick: (d: Delivery) => void;
  t: (k: string, l: "ar" | "en") => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (deliveries.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {deliveries.map(d => (
        <Col key={d.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => onClick(d)}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="font-mono font-bold text-base text-primary">
                {d.deliveryNumber ?? d.id.slice(0, 8)}
              </span>
              <Tag
                color={STATUS_COLOR[d.status] ?? "default"}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {d.status}
              </Tag>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              {getName({
                nameEn: d.partnerNameEn,
                nameAr: d.partnerNameAr,
              }) || "--"}
            </p>
            <p className="text-xs text-gray-400">
              {d.scheduledDate
                ? dayjs(d.scheduledDate).format("YYYY-MM-DD")
                : "--"}
            </p>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
