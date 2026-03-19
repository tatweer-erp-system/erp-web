import { useState, useCallback, useEffect, useRef } from "react";
import type { Dayjs } from "dayjs";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import { invoicesService } from "@/services/invoices.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import { InvoiceTypeNew, InvoiceStatusNew } from "@/constants/enums";
import type { InvoiceRow, InvoiceSummary } from "@/types/modules/invoices";
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
  InputNumber,
  Select,
  Tooltip,
  Typography,
  Dropdown,
  DatePicker,
  Drawer,
  Input,
  notification,
  Segmented,
} from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  DeleteOutlined,
  RollbackOutlined,
  SearchOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Tag config maps ────────────────────────────────────────────────────────

const STATUS_TAG: Record<InvoiceStatusNew, { color: string; i18nKey: string }> =
  {
    [InvoiceStatusNew.DRAFT]: {
      color: "default",
      i18nKey: "invoices.status.draft",
    },
    [InvoiceStatusNew.POSTED]: {
      color: "blue",
      i18nKey: "invoices.status.posted",
    },
    [InvoiceStatusNew.CANCELLED]: {
      color: "red",
      i18nKey: "invoices.status.cancelled",
    },
  };

// ─── Component ──────────────────────────────────────────────────────────────

export default function PurchaseReturns() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ───────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);

  const [createForm] = Form.useForm();

  // ── Search debounce ──────────────────────────────────────────────────────
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── Queries ─────────────────────────────────────────────────────────────

  const listParams = {
    page,
    limit: pageSize,
    invoiceType: InvoiceTypeNew.IN_REFUND,
    ...(search ? { search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(dateRange?.[0]
      ? { dateFrom: dateRange[0].format("YYYY-MM-DD") }
      : {}),
    ...(dateRange?.[1] ? { dateTo: dateRange[1].format("YYYY-MM-DD") } : {}),
    sortBy: "createdAt",
    sortOrder: "DESC" as const,
  };

  const {
    data: invoicesRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES_LIST, "in_refund", listParams, branchId],
    queryFn: () => invoicesService.list(listParams),
    enabled: !!branchId,
  });

  const invoices: InvoiceRow[] = invoicesRes?.data ?? [];
  const totalRecords = invoicesRes?.meta?.total ?? 0;

  const { data: summaryRes } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES_SUMMARY, "in_refund", branchId],
    queryFn: () =>
      invoicesService.summary({ invoiceType: InvoiceTypeNew.IN_REFUND }),
    enabled: !!branchId,
  });
  const summary = (summaryRes as Record<string, unknown>)?.data as
    | InvoiceSummary
    | undefined;

  // Vendor dropdown
  const { data: vendorsData } = useQuery({
    queryKey: ["partners-dropdown-vendors"],
    queryFn: () => getPartnersDropdown({ limit: 100, type: "supplier" }),
    staleTime: 60_000,
  });
  const vendors = vendorsData?.data ?? [];

  // Posted vendor bills for "Original Invoice" select
  const { data: vendorBillsData } = useQuery({
    queryKey: [
      QUERY_KEYS.INVOICES_LIST,
      "in_invoice_posted_dropdown",
      branchId,
    ],
    queryFn: () =>
      invoicesService.list({
        invoiceType: InvoiceTypeNew.IN_INVOICE,
        status: InvoiceStatusNew.POSTED,
        limit: 100,
      }),
    enabled: !!branchId,
    staleTime: 60_000,
  });
  const vendorBills: InvoiceRow[] = vendorBillsData?.data ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INVOICES_LIST, "in_refund"],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INVOICES_SUMMARY, "in_refund"],
    });
  };

  const createMutation = useMutation({
    mutationFn: invoicesService.create,
    onSuccess: () => {
      notification.success({
        message: t("purchasing.returns.msg.created", lang),
      });
      invalidate();
      closeCreateModal();
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => invoicesService.post(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.returns.msg.posted", lang),
      });
      invalidate();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invoicesService.cancel(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.returns.msg.cancelled", lang),
      });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesService.remove(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.returns.msg.deleted", lang),
      });
      invalidate();
    },
  });

  // ── Modal helpers ─────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    createForm.resetFields();
    createForm.setFieldsValue({
      invoiceDate: dayjs(),
    });
    setCreateDrawerOpen(true);
  }, [createForm]);

  const closeCreateModal = useCallback(() => {
    setCreateDrawerOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const openView = useCallback((rec: InvoiceRow) => {
    setViewInvoice(rec);
    setDrawerOpen(true);
  }, []);

  // ── Submit handlers ───────────────────────────────────────────────────

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate({
        partnerId: values.partnerId,
        invoiceType: InvoiceTypeNew.IN_REFUND,
        invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
        reference: values.originalInvoiceId || undefined,
        lines: (values.lines ?? []).map(
          (l: {
            description?: string;
            quantity: number;
            unitPrice: number;
            discountPct?: number;
            taxRate?: number;
          }) => ({
            description: l.description || undefined,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountPct: l.discountPct ?? 0,
            taxRate: l.taxRate ?? 15,
          })
        ),
      });
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────

  const getVendorName = (rec: InvoiceRow) =>
    lang === "ar"
      ? rec.partnerNameAr || rec.partnerNameEn || "\u2014"
      : rec.partnerNameEn || rec.partnerNameAr || "\u2014";

  const columns: TableColumnsType<InvoiceRow> = [
    {
      title: t("purchasing.returns.col.invoiceNumber", lang),
      dataIndex: "invoiceNumber",
      render: (v: string) => (
        <Text
          strong
          style={{ color: token.colorPrimary, fontFamily: "monospace" }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: t("purchasing.returns.col.invoiceDate", lang),
      dataIndex: "invoiceDate",
      sorter: true,
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("purchasing.returns.col.vendor", lang),
      dataIndex: "partnerNameEn",
      render: (_: unknown, rec: InvoiceRow) => (
        <Text strong>{getVendorName(rec)}</Text>
      ),
    },
    {
      title: t("purchasing.returns.col.originalInvoice", lang),
      dataIndex: "reference" as keyof InvoiceRow,
      render: (v: string | null) => (
        <Text type="secondary" style={{ fontFamily: "monospace" }}>
          {v || "\u2014"}
        </Text>
      ),
    },
    {
      title: t("purchasing.returns.col.amountTotal", lang),
      dataIndex: "amountTotal",
      align: "right",
      sorter: true,
      render: (v: number | string, rec: InvoiceRow) => (
        <Text strong>
          {Number(v).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {rec.currencyCode || "SAR"}
        </Text>
      ),
    },
    {
      title: t("purchasing.returns.col.status", lang),
      dataIndex: "status",
      render: (v: InvoiceStatusNew) => {
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
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const isDraft = rec.status === InvoiceStatusNew.DRAFT;
        const isPosted = rec.status === InvoiceStatusNew.POSTED;

        const items = [
          {
            key: "view",
            label: t("purchasing.returns.action.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isDraft
            ? [
                {
                  key: "post",
                  label: t("purchasing.returns.action.post", lang),
                  icon: <SendOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.returns.action.post", lang),
                      content: t("purchasing.returns.confirm.post", lang),
                      onOk: () => postMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isDraft || isPosted
            ? [
                { type: "divider" as const, key: "d1" },
                {
                  key: "cancel",
                  label: t("purchasing.returns.action.cancel", lang),
                  icon: <CloseCircleOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.returns.action.cancel", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("purchasing.returns.confirm.cancel", lang),
                      okButtonProps: { danger: true },
                      onOk: () => cancelMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isDraft
            ? [
                {
                  key: "delete",
                  label: t("purchasing.returns.action.delete", lang),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.returns.action.delete", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("purchasing.returns.confirm.delete", lang),
                      okButtonProps: { danger: true },
                      onOk: () => deleteMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ── Pagination handler ────────────────────────────────────────────────

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 20);
  };

  return (
    <DashboardLayout
      currentPage={t("purchasing.returns.title", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("PURCHASES", lang), href: "#" },
        { label: t("purchasing.returns.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("purchasing.returns.kpi.total", lang),
              value: summary?.totalRecords ?? 0,
              suffix: t("purchasing.returns.title", lang),
              icon: <RollbackOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("purchasing.returns.kpi.draft", lang),
              value: summary?.byStatus?.draft ?? 0,
              suffix: t("invoices.status.draft", lang),
              icon: <FileTextOutlined />,
              iconColor: "#8b8b8b",
              iconBg: "#8b8b8b15",
              color: "#8b8b8b",
            },
            {
              title: t("purchasing.returns.kpi.posted", lang),
              value: summary?.byStatus?.posted ?? 0,
              suffix: t("invoices.status.posted", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
            },
            {
              title: t("purchasing.returns.kpi.totalAmount", lang),
              value: Number(summary?.totalAmount ?? 0),
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: "#6366f1",
              isCurrency: true,
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
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
                      precision={"isCurrency" in s && s.isCurrency ? 2 : 0}
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

        {/* ── Toolbar Card ─────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("purchasing.returns.new", lang)}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <DatePicker.RangePicker
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
                    {
                      key: "csv",
                      label: "CSV",
                      icon: <DownloadOutlined />,
                    },
                    {
                      key: "excel",
                      label: "Excel",
                      icon: <DownloadOutlined />,
                    },
                    { key: "pdf", label: "PDF", icon: <DownloadOutlined /> },
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
                <Col xs={24} sm={12} lg={8}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("purchasing.returns.col.status", lang)}
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
                        label: t("invoices.allStatuses", lang),
                      },
                      {
                        value: InvoiceStatusNew.DRAFT,
                        label: t("invoices.status.draft", lang),
                      },
                      {
                        value: InvoiceStatusNew.POSTED,
                        label: t("invoices.status.posted", lang),
                      },
                      {
                        value: InvoiceStatusNew.CANCELLED,
                        label: t("invoices.status.cancelled", lang),
                      },
                    ]}
                    size="small"
                  />
                </Col>
              </Row>
              <div className="flex flex-wrap gap-1 mt-2">
                {statusFilter !== "all" && (
                  <Tag closable onClose={() => setStatusFilter("all")}>
                    {t("purchasing.returns.col.status", lang)}: {statusFilter}
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
        </Card>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={invoices}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize,
              total: totalRecords,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}\u2013${range[1]} of ${total}`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            locale={{
              emptyText: (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <RollbackOutlined
                    style={{
                      fontSize: 48,
                      color: "#d9d9d9",
                      marginBottom: 16,
                    }}
                  />
                  <div>
                    <Text type="secondary">
                      {t("purchasing.returns.empty", lang)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t("purchasing.returns.emptyHint", lang)}
                    </Text>
                  </div>
                </div>
              ),
            }}
          />
        </Card>
      </Space>

      {/* ── Create Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={createDrawerOpen}
        onClose={closeCreateModal}
        width={isMobile ? "100%" : 680}
        title={t("purchasing.returns.new", lang)}
        destroyOnClose
        footer={
          <Space style={{ justifyContent: "flex-end", display: "flex" }}>
            <Button onClick={closeCreateModal}>
              {t("common.cancel", lang)}
            </Button>
            <Button
              type="primary"
              loading={createMutation.isPending}
              onClick={handleCreateSubmit}
            >
              {t("purchasing.returns.new", lang)}
            </Button>
          </Space>
        }
      >
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("purchasing.returns.form.vendor", lang)}
                name="partnerId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={vendors.map(p => ({
                    value: p.id,
                    label: getName(p),
                  }))}
                  placeholder={t("purchasing.returns.form.vendor", lang)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("purchasing.returns.form.invoiceDate", lang)}
                name="invoiceDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label={t("purchasing.returns.form.originalInvoice", lang)}
                name="originalInvoiceId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={vendorBills.map(inv => ({
                    value: inv.invoiceNumber,
                    label: `${inv.invoiceNumber} — ${lang === "ar" ? inv.partnerNameAr || inv.partnerNameEn || "" : inv.partnerNameEn || inv.partnerNameAr || ""} — ${Number(inv.amountTotal).toLocaleString(undefined, { minimumFractionDigits: 2 })} SAR`,
                  }))}
                  placeholder={t(
                    "purchasing.returns.form.originalInvoice",
                    lang
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Credit Note Lines ──────────────────────────────────────── */}
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("purchasing.returns.form.lines", lang)}
          </Text>
          <Form.List name="lines">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={8} align="middle">
                    <Col xs={24} sm={6}>
                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        rules={[{ required: true }]}
                      >
                        <Input
                          placeholder={t(
                            "purchasing.returns.form.description",
                            lang
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: "100%" }}
                          placeholder={t(
                            "purchasing.returns.form.quantity",
                            lang
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Item
                        {...restField}
                        name={[name, "unitPrice"]}
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: "100%" }}
                          placeholder={t(
                            "purchasing.returns.form.unitPrice",
                            lang
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item
                        {...restField}
                        name={[name, "discountPct"]}
                        initialValue={0}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                          placeholder={t(
                            "purchasing.returns.form.discount",
                            lang
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item
                        {...restField}
                        name={[name, "taxRate"]}
                        initialValue={15}
                      >
                        <InputNumber
                          min={0}
                          max={100}
                          style={{ width: "100%" }}
                          placeholder={t(
                            "purchasing.returns.form.taxRate",
                            lang
                          )}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={2}>
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                        icon={<DeleteOutlined />}
                        style={{ marginBottom: 24 }}
                      />
                    </Col>
                  </Row>
                ))}
                <Button
                  type="dashed"
                  onClick={() =>
                    add({
                      quantity: 1,
                      unitPrice: 0,
                      discountPct: 0,
                      taxRate: 15,
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  {t("purchasing.returns.form.addLine", lang)}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Drawer>

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewInvoice(null);
        }}
        width={isMobile ? "100%" : 560}
        title={
          viewInvoice
            ? `${t("purchasing.returns.view", lang)} \u2014 ${viewInvoice.invoiceNumber}`
            : ""
        }
      >
        {viewInvoice && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.returns.col.invoiceNumber", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewInvoice.invoiceNumber}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.returns.col.vendor", lang)}
                </Text>
                <br />
                <Text strong>{getVendorName(viewInvoice)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.returns.col.invoiceDate", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewInvoice.invoiceDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.returns.col.status", lang)}
                </Text>
                <br />
                {STATUS_TAG[viewInvoice.status] && (
                  <Tag
                    color={STATUS_TAG[viewInvoice.status].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(STATUS_TAG[viewInvoice.status].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
            </Row>

            {/* Amounts */}
            <Card size="small">
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.returns.detail.amountUntaxed", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewInvoice.amountUntaxed).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.returns.detail.amountTax", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewInvoice.amountTax).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Col>
                <Col span={24}>
                  <Text type="secondary">
                    {t("purchasing.returns.detail.amountTotal", lang)}
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 16 }}>
                    {Number(viewInvoice.amountTotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {viewInvoice.currencyCode || "SAR"}
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              {viewInvoice.status === InvoiceStatusNew.DRAFT && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("purchasing.returns.action.post", lang),
                      content: t("purchasing.returns.confirm.post", lang),
                      onOk: () => {
                        postMutation.mutate(viewInvoice.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("purchasing.returns.action.post", lang)}
                </Button>
              )}
              {viewInvoice.status !== InvoiceStatusNew.CANCELLED && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("purchasing.returns.action.cancel", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("purchasing.returns.confirm.cancel", lang),
                      okButtonProps: { danger: true },
                      onOk: () => {
                        cancelMutation.mutate(viewInvoice.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("purchasing.returns.action.cancel", lang)}
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
