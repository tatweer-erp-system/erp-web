import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import { invoicesService } from "@/services/invoices.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import {
  InvoiceTypeNew,
  InvoiceStatusNew,
  InvoicePaymentStatus,
} from "@/constants/enums";
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
  CreditCardOutlined,
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

const PAYMENT_STATUS_TAG: Record<
  InvoicePaymentStatus,
  { color: string; i18nKey: string }
> = {
  [InvoicePaymentStatus.NOT_PAID]: {
    color: "orange",
    i18nKey: "invoices.paymentStatus.not_paid",
  },
  [InvoicePaymentStatus.PARTIAL]: {
    color: "gold",
    i18nKey: "invoices.paymentStatus.partial",
  },
  [InvoicePaymentStatus.PAID]: {
    color: "green",
    i18nKey: "invoices.paymentStatus.paid",
  },
  [InvoicePaymentStatus.REVERSED]: {
    color: "purple",
    i18nKey: "invoices.paymentStatus.reversed",
  },
};

const TYPE_TAG: Record<InvoiceTypeNew, { color: string; i18nKey: string }> = {
  [InvoiceTypeNew.OUT_INVOICE]: {
    color: "blue",
    i18nKey: "invoices.type.out_invoice",
  },
  [InvoiceTypeNew.OUT_REFUND]: {
    color: "cyan",
    i18nKey: "invoices.type.out_refund",
  },
  [InvoiceTypeNew.IN_INVOICE]: {
    color: "purple",
    i18nKey: "invoices.type.in_invoice",
  },
  [InvoiceTypeNew.IN_REFUND]: {
    color: "magenta",
    i18nKey: "invoices.type.in_refund",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function SalesInvoices() {
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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);

  const [createForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // ── Queries ─────────────────────────────────────────────────────────────

  const listParams = {
    page,
    limit: pageSize,
    ...(search ? { search } : {}),
    ...(typeFilter !== "all" ? { invoiceType: typeFilter } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(paymentStatusFilter !== "all"
      ? { paymentStatus: paymentStatusFilter }
      : {}),
    sortBy: "createdAt",
    sortOrder: "DESC" as const,
  };

  const {
    data: invoicesRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES_LIST, listParams, branchId],
    queryFn: () => invoicesService.list(listParams),
    enabled: !!branchId,
  });

  const invoices: InvoiceRow[] = invoicesRes?.data ?? [];
  const totalRecords = invoicesRes?.meta?.total ?? 0;

  const { data: summaryRes } = useQuery({
    queryKey: [QUERY_KEYS.INVOICES_SUMMARY, branchId],
    queryFn: () => invoicesService.summary(),
    enabled: !!branchId,
  });
  const summary = (summaryRes as Record<string, unknown>)?.data as
    | InvoiceSummary
    | undefined;

  // Partners dropdown for create form
  const { data: partnersData } = useQuery({
    queryKey: ["partners-dropdown-invoices"],
    queryFn: () => getPartnersDropdown({ limit: 200 }),
    staleTime: 60_000,
  });
  const partners = partnersData?.data ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INVOICES_LIST],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.INVOICES_SUMMARY],
    });
  };

  const createMutation = useMutation({
    mutationFn: invoicesService.create,
    onSuccess: () => {
      notification.success({ message: t("invoices.msg.created", lang) });
      invalidate();
      closeCreateModal();
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => invoicesService.post(id),
    onSuccess: () => {
      notification.success({ message: t("invoices.msg.posted", lang) });
      invalidate();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invoicesService.cancel(id),
    onSuccess: () => {
      notification.success({ message: t("invoices.msg.cancelled", lang) });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("invoices.msg.deleted", lang) });
      invalidate();
    },
  });

  const registerPaymentMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: { paymentDate: string; amount: number; memo?: string };
    }) => invoicesService.registerPayment(id, dto),
    onSuccess: () => {
      notification.success({
        message: t("invoices.msg.paymentRegistered", lang),
      });
      invalidate();
      closePaymentModal();
    },
  });

  // ── Modal helpers ─────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    createForm.resetFields();
    createForm.setFieldsValue({
      invoiceType: InvoiceTypeNew.OUT_INVOICE,
      invoiceDate: dayjs(),
    });
    setCreateModalOpen(true);
  }, [createForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const openPayment = useCallback(
    (rec: InvoiceRow) => {
      setPaymentInvoice(rec);
      paymentForm.resetFields();
      paymentForm.setFieldsValue({
        paymentDate: dayjs(),
        amount: Number(rec.amountResidual),
      });
      setPaymentModalOpen(true);
    },
    [paymentForm]
  );

  const closePaymentModal = useCallback(() => {
    setPaymentModalOpen(false);
    setPaymentInvoice(null);
    paymentForm.resetFields();
  }, [paymentForm]);

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
        invoiceType: values.invoiceType,
        invoiceDate: values.invoiceDate.format("YYYY-MM-DD"),
        dueDate: values.dueDate
          ? values.dueDate.format("YYYY-MM-DD")
          : undefined,
        reference: values.reference || undefined,
        narration: values.narration || undefined,
        lines: (values.lines ?? []).map(
          (l: {
            productId?: string;
            description?: string;
            quantity: number;
            unitPrice: number;
            discountPct?: number;
            taxRate?: number;
          }) => ({
            productId: l.productId || undefined,
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

  const handlePaymentSubmit = async () => {
    if (!paymentInvoice) return;
    try {
      const values = await paymentForm.validateFields();
      registerPaymentMutation.mutate({
        id: paymentInvoice.id,
        dto: {
          paymentDate: values.paymentDate.format("YYYY-MM-DD"),
          amount: values.amount,
          memo: values.memo || undefined,
        },
      });
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────

  const getPartnerName = (rec: InvoiceRow) =>
    lang === "ar"
      ? rec.partnerNameAr || rec.partnerNameEn || "—"
      : rec.partnerNameEn || rec.partnerNameAr || "—";

  const columns: TableColumnsType<InvoiceRow> = [
    {
      title: t("invoices.col.invoiceNumber", lang),
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
      title: t("invoices.col.invoiceDate", lang),
      dataIndex: "invoiceDate",
      sorter: true,
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("invoices.col.partner", lang),
      dataIndex: "partnerNameEn",
      render: (_: unknown, rec: InvoiceRow) => (
        <Text strong>{getPartnerName(rec)}</Text>
      ),
    },
    {
      title: t("invoices.col.type", lang),
      dataIndex: "invoiceType",
      render: (v: InvoiceTypeNew) => {
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
      title: t("invoices.col.amountTotal", lang),
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
      title: t("invoices.col.amountResidual", lang),
      dataIndex: "amountResidual",
      align: "right",
      render: (v: number | string, rec: InvoiceRow) => (
        <Text type={Number(v) > 0 ? "danger" : "secondary"}>
          {Number(v).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {rec.currencyCode || "SAR"}
        </Text>
      ),
    },
    {
      title: t("invoices.col.status", lang),
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
      title: t("invoices.col.paymentStatus", lang),
      dataIndex: "paymentStatus",
      render: (v: InvoicePaymentStatus) => {
        const cfg = PAYMENT_STATUS_TAG[v];
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
        const isUnpaid =
          rec.paymentStatus === InvoicePaymentStatus.NOT_PAID ||
          rec.paymentStatus === InvoicePaymentStatus.PARTIAL;

        const items = [
          {
            key: "view",
            label: t("invoices.action.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isDraft
            ? [
                {
                  key: "post",
                  label: t("invoices.action.post", lang),
                  icon: <SendOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("invoices.action.post", lang),
                      content: t("invoices.confirm.post", lang),
                      onOk: () => postMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isPosted && isUnpaid
            ? [
                {
                  key: "payment",
                  label: t("invoices.action.registerPayment", lang),
                  icon: <CreditCardOutlined />,
                  onClick: () => openPayment(rec),
                },
              ]
            : []),
          ...(isDraft || isPosted
            ? [
                { type: "divider" as const, key: "d1" },
                {
                  key: "cancel",
                  label: t("invoices.action.cancel", lang),
                  icon: <CloseCircleOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("invoices.action.cancel", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("invoices.confirm.cancel", lang),
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
                  label: t("invoices.action.delete", lang),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("invoices.action.delete", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("invoices.confirm.delete", lang),
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

  // ── Gradient header style for modals ──────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="Sales Invoices"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("SALES", lang), href: "#" },
        { label: t("invoices.salesInvoices", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("invoices.kpi.total", lang),
              value: summary?.totalRecords ?? 0,
              suffix: t("invoices.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("invoices.kpi.totalAmount", lang),
              value: Number(summary?.totalAmount ?? 0),
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: "#6366f1",
              isCurrency: true,
            },
            {
              title: t("invoices.kpi.paid", lang),
              value: Number(summary?.totalPaid ?? 0),
              suffix: "SAR",
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
              isCurrency: true,
            },
            {
              title: t("invoices.kpi.unpaid", lang),
              value: Number(summary?.totalUnpaid ?? 0),
              suffix: "SAR",
              icon: <CloseCircleOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
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
                placeholder={t("invoices.search", lang)}
                allowClear
                onSearch={v => {
                  setSearch(v);
                  setPage(1);
                }}
                style={{ width: 220 }}
              />
              <Select
                value={typeFilter}
                onChange={v => {
                  setTypeFilter(v);
                  setPage(1);
                }}
                style={{ width: 180 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("invoices.allTypes", lang),
                  },
                  {
                    value: InvoiceTypeNew.OUT_INVOICE,
                    label: t("invoices.type.out_invoice", lang),
                  },
                  {
                    value: InvoiceTypeNew.OUT_REFUND,
                    label: t("invoices.type.out_refund", lang),
                  },
                  {
                    value: InvoiceTypeNew.IN_INVOICE,
                    label: t("invoices.type.in_invoice", lang),
                  },
                  {
                    value: InvoiceTypeNew.IN_REFUND,
                    label: t("invoices.type.in_refund", lang),
                  },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={v => {
                  setStatusFilter(v);
                  setPage(1);
                }}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
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
              />
              <Select
                value={paymentStatusFilter}
                onChange={v => {
                  setPaymentStatusFilter(v);
                  setPage(1);
                }}
                style={{ width: 180 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("invoices.allPaymentStatuses", lang),
                  },
                  {
                    value: InvoicePaymentStatus.NOT_PAID,
                    label: t("invoices.paymentStatus.not_paid", lang),
                  },
                  {
                    value: InvoicePaymentStatus.PARTIAL,
                    label: t("invoices.paymentStatus.partial", lang),
                  },
                  {
                    value: InvoicePaymentStatus.PAID,
                    label: t("invoices.paymentStatus.paid", lang),
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
                {t("invoices.new", lang)}
              </Button>
            </Space>
          </div>
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
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            locale={{
              emptyText: (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <FileTextOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <div>
                    <Text type="secondary">{t("invoices.empty", lang)}</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t("invoices.emptyHint", lang)}
                    </Text>
                  </div>
                </div>
              ),
            }}
          />
        </Card>
      </Space>

      {/* ── Create Modal ──────────────────────────────────────────────── */}
      <Modal
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreateSubmit}
        okText={t("invoices.new", lang)}
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95vw" : 720}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        <div style={gradientHeader}>
          <Space>
            <PlusOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("invoices.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.invoiceType", lang)}
                name="invoiceType"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: InvoiceTypeNew.OUT_INVOICE,
                      label: t("invoices.type.out_invoice", lang),
                    },
                    {
                      value: InvoiceTypeNew.OUT_REFUND,
                      label: t("invoices.type.out_refund", lang),
                    },
                    {
                      value: InvoiceTypeNew.IN_INVOICE,
                      label: t("invoices.type.in_invoice", lang),
                    },
                    {
                      value: InvoiceTypeNew.IN_REFUND,
                      label: t("invoices.type.in_refund", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.partnerId", lang)}
                name="partnerId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={partners.map(p => ({
                    value: p.id,
                    label: getName(p),
                  }))}
                  placeholder={t("invoices.form.partnerId", lang)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.invoiceDate", lang)}
                name="invoiceDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.dueDate", lang)}
                name="dueDate"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.reference", lang)}
                name="reference"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("invoices.form.narration", lang)}
                name="narration"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Invoice Lines ──────────────────────────────────────────── */}
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("invoices.form.lines", lang)}
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
                          placeholder={t("invoices.form.description", lang)}
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
                          placeholder={t("invoices.form.quantity", lang)}
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
                          placeholder={t("invoices.form.unitPrice", lang)}
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
                          placeholder={t("invoices.form.discount", lang)}
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
                          placeholder={t("invoices.form.taxRate", lang)}
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
                  {t("invoices.form.addLine", lang)}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ── Register Payment Modal ────────────────────────────────────── */}
      <Modal
        open={paymentModalOpen}
        onCancel={closePaymentModal}
        onOk={handlePaymentSubmit}
        okText={t("invoices.action.registerPayment", lang)}
        confirmLoading={registerPaymentMutation.isPending}
        width={isMobile ? "95vw" : 480}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        <div style={gradientHeader}>
          <Space>
            <CreditCardOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("invoices.payment.title", lang)}
            </span>
          </Space>
        </div>

        {paymentInvoice && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              {paymentInvoice.invoiceNumber} — {getPartnerName(paymentInvoice)}
            </Text>
            <br />
            <Text strong>
              {t("invoices.detail.amountResidual", lang)}:{" "}
              {Number(paymentInvoice.amountResidual).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}{" "}
              {paymentInvoice.currencyCode || "SAR"}
            </Text>
          </div>
        )}

        <Form form={paymentForm} layout="vertical">
          <Form.Item
            label={t("invoices.payment.date", lang)}
            name="paymentDate"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label={t("invoices.payment.amount", lang)}
            name="amount"
            rules={[{ required: true }]}
          >
            <InputNumber min={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label={t("invoices.payment.memo", lang)} name="memo">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

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
            ? `${t("invoices.view", lang)} — ${viewInvoice.invoiceNumber}`
            : ""
        }
      >
        {viewInvoice && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("invoices.col.invoiceNumber", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewInvoice.invoiceNumber}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("invoices.col.type", lang)}</Text>
                <br />
                {TYPE_TAG[viewInvoice.invoiceType] && (
                  <Tag
                    color={TYPE_TAG[viewInvoice.invoiceType].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(TYPE_TAG[viewInvoice.invoiceType].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("invoices.col.partner", lang)}</Text>
                <br />
                <Text strong>{getPartnerName(viewInvoice)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("invoices.col.invoiceDate", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewInvoice.invoiceDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              {viewInvoice.dueDate && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("invoices.col.dueDate", lang)}
                  </Text>
                  <br />
                  <Text strong>
                    {dayjs(viewInvoice.dueDate).format("YYYY-MM-DD")}
                  </Text>
                </Col>
              )}
              <Col span={12}>
                <Text type="secondary">{t("invoices.col.status", lang)}</Text>
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
              <Col span={12}>
                <Text type="secondary">
                  {t("invoices.col.paymentStatus", lang)}
                </Text>
                <br />
                {PAYMENT_STATUS_TAG[viewInvoice.paymentStatus] && (
                  <Tag
                    color={PAYMENT_STATUS_TAG[viewInvoice.paymentStatus].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(
                      PAYMENT_STATUS_TAG[viewInvoice.paymentStatus].i18nKey,
                      lang
                    )}
                  </Tag>
                )}
              </Col>
            </Row>

            {/* Amounts */}
            <Card size="small">
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <Text type="secondary">
                    {t("invoices.detail.amountUntaxed", lang)}
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
                    {t("invoices.detail.amountTax", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewInvoice.amountTax).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("invoices.detail.amountTotal", lang)}
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 16 }}>
                    {Number(viewInvoice.amountTotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {viewInvoice.currencyCode || "SAR"}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("invoices.detail.amountResidual", lang)}
                  </Text>
                  <br />
                  <Text
                    strong
                    type={
                      Number(viewInvoice.amountResidual) > 0
                        ? "danger"
                        : undefined
                    }
                    style={{ fontSize: 16 }}
                  >
                    {Number(viewInvoice.amountResidual).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}{" "}
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
                      title: t("invoices.action.post", lang),
                      content: t("invoices.confirm.post", lang),
                      onOk: () => {
                        postMutation.mutate(viewInvoice.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("invoices.action.post", lang)}
                </Button>
              )}
              {viewInvoice.status === InvoiceStatusNew.POSTED &&
                (viewInvoice.paymentStatus === InvoicePaymentStatus.NOT_PAID ||
                  viewInvoice.paymentStatus ===
                    InvoicePaymentStatus.PARTIAL) && (
                  <Button
                    icon={<CreditCardOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openPayment(viewInvoice);
                    }}
                  >
                    {t("invoices.action.registerPayment", lang)}
                  </Button>
                )}
              {viewInvoice.status !== InvoiceStatusNew.CANCELLED && (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("invoices.action.cancel", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("invoices.confirm.cancel", lang),
                      okButtonProps: { danger: true },
                      onOk: () => {
                        cancelMutation.mutate(viewInvoice.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("invoices.action.cancel", lang)}
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
