import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import { purchaseOrdersService } from "@/services/purchasing.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import {
  PurchaseOrderStatusNew,
  PurchaseOrderBillStatus,
  PurchaseOrderReceiptStatus,
} from "@/constants/enums";
import type {
  PurchaseOrderRow,
  PurchaseOrderSummary,
} from "@/types/modules/purchasing";
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
  DeleteOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  AuditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Tag config maps ────────────────────────────────────────────────────────

const STATUS_TAG: Record<
  PurchaseOrderStatusNew,
  { color: string; i18nKey: string }
> = {
  [PurchaseOrderStatusNew.DRAFT]: {
    color: "orange",
    i18nKey: "purchasing.po.status.draft",
  },
  [PurchaseOrderStatusNew.CONFIRMED]: {
    color: "blue",
    i18nKey: "purchasing.po.status.confirmed",
  },
  [PurchaseOrderStatusNew.DONE]: {
    color: "green",
    i18nKey: "purchasing.po.status.done",
  },
  [PurchaseOrderStatusNew.CANCELLED]: {
    color: "red",
    i18nKey: "purchasing.po.status.cancelled",
  },
};

const BILL_STATUS_TAG: Record<
  PurchaseOrderBillStatus,
  { color: string; i18nKey: string }
> = {
  [PurchaseOrderBillStatus.NOTHING]: {
    color: "default",
    i18nKey: "purchasing.po.billStatus.nothing",
  },
  [PurchaseOrderBillStatus.TO_BILL]: {
    color: "orange",
    i18nKey: "purchasing.po.billStatus.to_bill",
  },
  [PurchaseOrderBillStatus.BILLED]: {
    color: "green",
    i18nKey: "purchasing.po.billStatus.billed",
  },
};

const RECEIPT_STATUS_TAG: Record<
  PurchaseOrderReceiptStatus,
  { color: string; i18nKey: string }
> = {
  [PurchaseOrderReceiptStatus.NOTHING]: {
    color: "default",
    i18nKey: "purchasing.po.receiptStatus.nothing",
  },
  [PurchaseOrderReceiptStatus.PARTIAL]: {
    color: "orange",
    i18nKey: "purchasing.po.receiptStatus.partial",
  },
  [PurchaseOrderReceiptStatus.RECEIVED]: {
    color: "green",
    i18nKey: "purchasing.po.receiptStatus.received",
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function PurchaseOrders() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<PurchaseOrderRow | null>(null);

  const [createForm] = Form.useForm();

  // ── Queries ─────────────────────────────────────────────────────────────

  const listParams = {
    page,
    limit: pageSize,
    ...(search ? { search } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    sortBy: "createdAt",
    sortOrder: "DESC" as const,
  };

  const {
    data: listRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS_LIST, listParams, branchId],
    queryFn: () => purchaseOrdersService.list(listParams),
    enabled: !!branchId,
  });

  const orders: PurchaseOrderRow[] = listRes?.data ?? [];
  const totalRecords = listRes?.meta?.total ?? 0;

  const { data: summaryRes } = useQuery({
    queryKey: [QUERY_KEYS.PURCHASE_ORDERS_SUMMARY, branchId],
    queryFn: () => purchaseOrdersService.summary(),
    enabled: !!branchId,
  });
  const summary = (summaryRes as Record<string, unknown>)?.data as
    | PurchaseOrderSummary
    | undefined;

  // Partners dropdown for create form
  const { data: partnersData } = useQuery({
    queryKey: ["partners-dropdown-po"],
    queryFn: () => getPartnersDropdown({ limit: 100, type: "supplier" }),
    staleTime: 60_000,
  });
  const partners = partnersData?.data ?? [];

  // ── Mutations ───────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PURCHASE_ORDERS_LIST],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PURCHASE_ORDERS_SUMMARY],
    });
  };

  const createMutation = useMutation({
    mutationFn: purchaseOrdersService.create,
    onSuccess: () => {
      notification.success({ message: t("purchasing.po.msg.created", lang) });
      invalidate();
      closeCreateModal();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersService.confirm(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.po.msg.confirmed", lang),
      });
      invalidate();
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersService.createReceipt(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.po.msg.receiptCreated", lang),
      });
      invalidate();
    },
  });

  const createBillMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersService.createBill(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.po.msg.billCreated", lang),
      });
      invalidate();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersService.cancel(id),
    onSuccess: () => {
      notification.success({
        message: t("purchasing.po.msg.cancelled", lang),
      });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => purchaseOrdersService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("purchasing.po.msg.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ─────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    createForm.resetFields();
    setCreateModalOpen(true);
  }, [createForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const openView = useCallback((rec: PurchaseOrderRow) => {
    setViewRecord(rec);
    setDrawerOpen(true);
  }, []);

  // ── Submit handlers ───────────────────────────────────────────────────

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate({
        partnerId: values.partnerId,
        branchId: branchId!,
        expectedDeliveryDate: values.expectedDeliveryDate
          ? values.expectedDeliveryDate.format("YYYY-MM-DD")
          : undefined,
        notes: values.notes || undefined,
        lines: (values.lines ?? []).map(
          (l: {
            productId?: string;
            description?: string;
            quantity: number;
            unitPrice: number;
            discountAmount?: number;
            taxRate?: number;
          }) => ({
            productId: l.productId || undefined,
            description: l.description || undefined,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountAmount: l.discountAmount ?? 0,
            taxRate: l.taxRate ?? 15,
          })
        ),
      });
    } catch {
      // form validation failed
    }
  };

  // ── Helper: vendor name ──────────────────────────────────────────────

  const getVendorName = (rec: PurchaseOrderRow) =>
    lang === "ar"
      ? rec.partnerNameAr || rec.partnerNameEn || "\u2014"
      : rec.partnerNameEn || rec.partnerNameAr || "\u2014";

  // ── Table columns ─────────────────────────────────────────────────────

  const columns: TableColumnsType<PurchaseOrderRow> = [
    {
      title: t("purchasing.po.col.orderNumber", lang),
      dataIndex: "orderNumber",
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
      title: t("purchasing.po.col.date", lang),
      dataIndex: "createdAt",
      sorter: true,
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("purchasing.po.col.vendor", lang),
      dataIndex: "partnerNameEn",
      render: (_: unknown, rec: PurchaseOrderRow) => (
        <Text strong>{getVendorName(rec)}</Text>
      ),
    },
    {
      title: t("purchasing.po.col.totalAmount", lang),
      dataIndex: "totalAmount",
      align: "right",
      sorter: true,
      render: (v: number | string, rec: PurchaseOrderRow) => (
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
      title: t("purchasing.po.col.status", lang),
      dataIndex: "status",
      render: (v: PurchaseOrderStatusNew) => {
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
      title: t("purchasing.po.col.billStatus", lang),
      dataIndex: "billStatus",
      render: (v: PurchaseOrderBillStatus) => {
        const cfg = BILL_STATUS_TAG[v];
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
      title: t("purchasing.po.col.receiptStatus", lang),
      dataIndex: "receiptStatus",
      render: (v: PurchaseOrderReceiptStatus) => {
        const cfg = RECEIPT_STATUS_TAG[v];
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
        const isDraft = rec.status === PurchaseOrderStatusNew.DRAFT;
        const isConfirmed = rec.status === PurchaseOrderStatusNew.CONFIRMED;

        const items = [
          {
            key: "view",
            label: t("purchasing.po.action.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isDraft
            ? [
                {
                  key: "confirm",
                  label: t("purchasing.po.action.confirm", lang),
                  icon: <CheckCircleOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.po.action.confirm", lang),
                      content: t("purchasing.po.confirm.confirm", lang),
                      onOk: () => confirmMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isConfirmed
            ? [
                {
                  key: "receipt",
                  label: t("purchasing.po.action.createReceipt", lang),
                  icon: <InboxOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.po.action.createReceipt", lang),
                      content: t("purchasing.po.confirm.createReceipt", lang),
                      onOk: () => createReceiptMutation.mutate(rec.id),
                    });
                  },
                },
                {
                  key: "bill",
                  label: t("purchasing.po.action.createBill", lang),
                  icon: <AuditOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.po.action.createBill", lang),
                      content: t("purchasing.po.confirm.createBill", lang),
                      onOk: () => createBillMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isDraft || isConfirmed
            ? [
                { type: "divider" as const, key: "d1" },
                {
                  key: "cancel",
                  label: t("purchasing.po.action.cancel", lang),
                  icon: <CloseCircleOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.po.action.cancel", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("purchasing.po.confirm.cancel", lang),
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
                  label: t("purchasing.po.action.delete", lang),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: t("purchasing.po.action.delete", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("purchasing.po.confirm.delete", lang),
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
      currentPage="Purchase Orders"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("PURCHASES", lang), href: "#" },
        { label: t("purchasing.po.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("purchasing.po.kpi.total", lang),
              value: summary?.totalRecords ?? 0,
              suffix: t("purchasing.po.title", lang),
              icon: <ShoppingCartOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("purchasing.po.kpi.draft", lang),
              value: summary?.totalDraft ?? 0,
              suffix: "",
              icon: <FileTextOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("purchasing.po.kpi.confirmed", lang),
              value: summary?.totalConfirmed ?? 0,
              suffix: "",
              icon: <CheckCircleOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
            },
            {
              title: t("purchasing.po.kpi.done", lang),
              value: summary?.totalDone ?? 0,
              suffix: "",
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("purchasing.po.kpi.totalAmount", lang),
              value: Number(summary?.totalAmount ?? 0),
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: "#6366f1",
              isCurrency: true,
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={12} lg={4}>
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
                placeholder={t("purchasing.po.search", lang)}
                allowClear
                onSearch={v => {
                  setSearch(v);
                  setPage(1);
                }}
                style={{ width: 220 }}
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
                    label: t("purchasing.po.allStatuses", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.DRAFT,
                    label: t("purchasing.po.status.draft", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.CONFIRMED,
                    label: t("purchasing.po.status.confirmed", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.DONE,
                    label: t("purchasing.po.status.done", lang),
                  },
                  {
                    value: PurchaseOrderStatusNew.CANCELLED,
                    label: t("purchasing.po.status.cancelled", lang),
                  },
                ]}
              />
              <DatePicker.RangePicker
                onChange={dates => {
                  setDateFrom(
                    dates?.[0] ? dates[0].format("YYYY-MM-DD") : undefined
                  );
                  setDateTo(
                    dates?.[1] ? dates[1].format("YYYY-MM-DD") : undefined
                  );
                  setPage(1);
                }}
                style={{ width: 260 }}
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
                {t("purchasing.po.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={orders}
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
                  <ShoppingCartOutlined
                    style={{
                      fontSize: 48,
                      color: "#d9d9d9",
                      marginBottom: 16,
                    }}
                  />
                  <div>
                    <Text type="secondary">
                      {t("purchasing.po.empty", lang)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t("purchasing.po.emptyHint", lang)}
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
        okText={t("purchasing.po.new", lang)}
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
              {t("purchasing.po.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("purchasing.po.form.vendor", lang)}
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
                  placeholder={t("purchasing.po.form.vendor", lang)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("purchasing.po.form.expectedDelivery", lang)}
                name="expectedDeliveryDate"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label={t("purchasing.po.form.notes", lang)}
                name="notes"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Order Lines ──────────────────────────────────────────── */}
          <Text strong style={{ display: "block", marginBottom: 8 }}>
            {t("purchasing.po.form.lines", lang)}
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
                            "purchasing.po.form.description",
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
                          placeholder={t("purchasing.po.form.quantity", lang)}
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
                          placeholder={t("purchasing.po.form.unitPrice", lang)}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={12} sm={3}>
                      <Form.Item
                        {...restField}
                        name={[name, "discountAmount"]}
                        initialValue={0}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: "100%" }}
                          placeholder={t("purchasing.po.form.discount", lang)}
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
                          placeholder={t("purchasing.po.form.taxRate", lang)}
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
                      discountAmount: 0,
                      taxRate: 15,
                    })
                  }
                  block
                  icon={<PlusOutlined />}
                >
                  {t("purchasing.po.form.addLine", lang)}
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewRecord(null);
        }}
        width={isMobile ? "100%" : 560}
        title={
          viewRecord
            ? `${t("purchasing.po.detail.title", lang)} \u2014 ${viewRecord.orderNumber}`
            : ""
        }
      >
        {viewRecord && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.orderNumber", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewRecord.orderNumber}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.vendor", lang)}
                </Text>
                <br />
                <Text strong>{getVendorName(viewRecord)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.date", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewRecord.createdAt).format("YYYY-MM-DD")}
                </Text>
              </Col>
              {viewRecord.expectedDeliveryDate && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.po.col.expectedDelivery", lang)}
                  </Text>
                  <br />
                  <Text strong>
                    {dayjs(viewRecord.expectedDeliveryDate).format(
                      "YYYY-MM-DD"
                    )}
                  </Text>
                </Col>
              )}
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.status", lang)}
                </Text>
                <br />
                {STATUS_TAG[viewRecord.status] && (
                  <Tag
                    color={STATUS_TAG[viewRecord.status].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(STATUS_TAG[viewRecord.status].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.billStatus", lang)}
                </Text>
                <br />
                {BILL_STATUS_TAG[viewRecord.billStatus] && (
                  <Tag
                    color={BILL_STATUS_TAG[viewRecord.billStatus].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(BILL_STATUS_TAG[viewRecord.billStatus].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("purchasing.po.col.receiptStatus", lang)}
                </Text>
                <br />
                {RECEIPT_STATUS_TAG[viewRecord.receiptStatus] && (
                  <Tag
                    color={RECEIPT_STATUS_TAG[viewRecord.receiptStatus].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(
                      RECEIPT_STATUS_TAG[viewRecord.receiptStatus].i18nKey,
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
                    {t("purchasing.po.detail.subtotal", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewRecord.subtotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.po.detail.taxAmount", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewRecord.taxAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.po.detail.discountAmount", lang)}
                  </Text>
                  <br />
                  <Text>
                    {Number(viewRecord.discountAmount).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2 }
                    )}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">
                    {t("purchasing.po.detail.totalAmount", lang)}
                  </Text>
                  <br />
                  <Text strong style={{ fontSize: 16 }}>
                    {Number(viewRecord.totalAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    {viewRecord.currencyCode || "SAR"}
                  </Text>
                </Col>
              </Row>
            </Card>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              {viewRecord.status === PurchaseOrderStatusNew.DRAFT && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("purchasing.po.action.confirm", lang),
                      content: t("purchasing.po.confirm.confirm", lang),
                      onOk: () => {
                        confirmMutation.mutate(viewRecord.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("purchasing.po.action.confirm", lang)}
                </Button>
              )}
              {viewRecord.status === PurchaseOrderStatusNew.CONFIRMED && (
                <>
                  <Button
                    icon={<InboxOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: t("purchasing.po.action.createReceipt", lang),
                        content: t("purchasing.po.confirm.createReceipt", lang),
                        onOk: () => {
                          createReceiptMutation.mutate(viewRecord.id);
                          setDrawerOpen(false);
                        },
                      });
                    }}
                  >
                    {t("purchasing.po.action.createReceipt", lang)}
                  </Button>
                  <Button
                    icon={<AuditOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: t("purchasing.po.action.createBill", lang),
                        content: t("purchasing.po.confirm.createBill", lang),
                        onOk: () => {
                          createBillMutation.mutate(viewRecord.id);
                          setDrawerOpen(false);
                        },
                      });
                    }}
                  >
                    {t("purchasing.po.action.createBill", lang)}
                  </Button>
                </>
              )}
              {viewRecord.status !== PurchaseOrderStatusNew.CANCELLED &&
                viewRecord.status !== PurchaseOrderStatusNew.DONE && (
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      Modal.confirm({
                        title: t("purchasing.po.action.cancel", lang),
                        icon: <ExclamationCircleOutlined />,
                        content: t("purchasing.po.confirm.cancel", lang),
                        okButtonProps: { danger: true },
                        onOk: () => {
                          cancelMutation.mutate(viewRecord.id);
                          setDrawerOpen(false);
                        },
                      });
                    }}
                  >
                    {t("purchasing.po.action.cancel", lang)}
                  </Button>
                )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
