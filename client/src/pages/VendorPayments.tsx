import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import { paymentsService } from "@/services/invoices.service";
import { treasuryAccountsService } from "@/services/treasury.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import { PaymentTypeNew, PaymentStatusNew } from "@/constants/enums";
import type { Payment, CreatePaymentDto } from "@/types/modules/invoices";
import type { TreasuryAccount } from "@/types/modules/treasury";
import type { PartnerDropdownItem } from "@/types/modules/partners";
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
  Select,
  Tooltip,
  Typography,
  Drawer,
  Input,
  InputNumber,
  DatePicker,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

/** Resolve partnerNameEn / partnerNameAr based on current lang */
function getPartnerName(p: Payment): string {
  const lang = useLangStore.getState().lang;
  if (lang === "ar") return p.partnerNameAr ?? p.partnerNameEn ?? "---";
  return p.partnerNameEn ?? p.partnerNameAr ?? "---";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VendorPayments() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();
  const branchId = useBranchStore(s => s.activeBranch?.id);

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";

  // ── State ────────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewPayment, setViewPayment] = useState<Payment | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: paymentsRaw,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
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
    queryFn: () => getPartnersDropdown({ limit: 200, type: "supplier" }),
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

  // ── Filtered data ──────────────────────────────────────────────────────
  const payments = useMemo(() => {
    if (!searchText.trim()) return allPayments;
    const q = searchText.trim().toLowerCase();
    return allPayments.filter(
      p =>
        (p.paymentNumber ?? "").toLowerCase().includes(q) ||
        (p.partnerNameEn ?? "").toLowerCase().includes(q) ||
        (p.partnerNameAr ?? "").toLowerCase().includes(q) ||
        (p.memo ?? "").toLowerCase().includes(q)
    );
  }, [allPayments, searchText]);

  // ── KPI values ─────────────────────────────────────────────────────────
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

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PAYMENTS_LIST],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreatePaymentDto) => paymentsService.create(dto),
    onSuccess: () => {
      notification.success({
        message: t("payments.vendor.created", lang),
      });
      invalidate();
      closeModal();
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => paymentsService.post(id),
    onSuccess: () => {
      notification.success({
        message: t("payments.vendor.posted", lang),
      });
      invalidate();
      setDrawerOpen(false);
      setViewPayment(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => paymentsService.cancel(id),
    onSuccess: () => {
      notification.success({
        message: t("payments.vendor.cancelled", lang),
      });
      invalidate();
      setDrawerOpen(false);
      setViewPayment(null);
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      paymentDate: dayjs(),
    });
    setModalOpen(true);
  }, [form]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    form.resetFields();
  }, [form]);

  const openView = useCallback((p: Payment) => {
    setViewPayment(p);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

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

  // ── Status tag helper ─────────────────────────────────────────────────

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

  // ── Table columns ────────────────────────────────────────────────────

  const columns: TableColumnsType<Payment> = [
    {
      title: t("payments.vendor.paymentNumber", lang),
      dataIndex: "paymentNumber",
      render: (v: string) => (
        <Text style={{ fontFamily: "monospace" }}>{v ?? "---"}</Text>
      ),
    },
    {
      title: t("payments.vendor.date", lang),
      dataIndex: "paymentDate",
      sorter: (a, b) =>
        (a.paymentDate ?? "").localeCompare(b.paymentDate ?? ""),
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "---"}</Text>
      ),
    },
    {
      title: t("payments.vendor.partner", lang),
      dataIndex: "partnerNameEn",
      render: (_: string, rec: Payment) => (
        <Text>{getPartnerName(rec) ?? "---"}</Text>
      ),
    },
    {
      title: t("payments.vendor.amount", lang),
      dataIndex: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (v: number) => {
        const num = Number(v ?? 0);
        return (
          <Text strong style={{ fontFamily: "monospace", color: "#ef4444" }}>
            -
            {num.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("payments.vendor.status", lang),
      dataIndex: "status",
      render: (v: string) => statusTag(v),
    },
    {
      title: "",
      align: "center" as const,
      width: 60,
      render: (_, rec) => (
        <Tooltip title={t("payments.vendor.view", lang)}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openView(rec)}
          />
        </Tooltip>
      ),
    },
  ];

  // ── Gradient header style for modal ────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="VendorPayments"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Purchases", href: "#" },
        { label: t("payments.vendor.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
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
                placeholder={t("payments.vendor.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
            </Space>
            <Space>
              <Tooltip title={t("payments.vendor.reload", lang)}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetchPayments()}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("payments.vendor.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("payments.vendor.total", lang),
              value: kpiTotal,
              suffix: "",
              icon: <FileTextOutlined />,
              iconColor: primary,
              iconBg: `${primary}15`,
              color: undefined,
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
            <Col key={s.title} xs={24} sm={12} md={6}>
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

        {/* ── Table ────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={payments}
            loading={paymentsLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}--${range[1]} of ${total}`,
              pageSizeOptions: ["10", "25", "50", "100"],
            }}
            locale={{
              emptyText: t("payments.vendor.noData", lang),
            }}
          />
        </Card>
      </Space>

      {/* ── Create Payment Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("payments.vendor.new", lang)}
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95vw" : 560}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            <PlusOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("payments.vendor.new", lang)}
            </span>
          </Space>
        </div>

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

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
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
                <Text strong>{getPartnerName(viewPayment)}</Text>
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
