import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  treasuryAccountsService,
  treasuryTransactionsService,
} from "@/services/treasury.service";
import { TreasuryTransactionType } from "@/constants/enums";
import type {
  TreasuryAccount,
  TreasuryTransaction,
  CreateTreasuryTransactionDto,
} from "@/types/modules/treasury";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { useVendorsDropdown } from "@/hooks/queries/usePartners";
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
  Empty,
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
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Payments() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );
  const [searchText, setSearchText] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewTransaction, setViewTransaction] =
    useState<TreasuryTransaction | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: accountsRaw } = useQuery({
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
          label: getName(a),
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
    queryKey: [QUERY_KEYS.TREASURY_TRANSACTIONS, "payments", selectedAccountId],
    queryFn: () =>
      treasuryTransactionsService.listByAccount(selectedAccountId!, {
        limit: 200,
      }),
    enabled: !!selectedAccountId,
    staleTime: 15_000,
  });

  const allTransactions: TreasuryTransaction[] = useMemo(() => {
    const list =
      ((transactionsRaw as Record<string, unknown>)
        ?.data as TreasuryTransaction[]) ?? [];
    return list.filter(
      tx =>
        tx.type === TreasuryTransactionType.PAYMENT ||
        tx.type === TreasuryTransactionType.TRANSFER_OUT
    );
  }, [transactionsRaw]);

  // ── Vendors dropdown for partner select ──────────────────────────────────
  const { data: vendorsDropdown } = useVendorsDropdown();
  const vendorOptions = useMemo(
    () =>
      (vendorsDropdown ?? []).map(v => ({
        value: v.id,
        label: getName(v),
      })),
    [vendorsDropdown]
  );

  // ── Filtered data ────────────────────────────────────────────────────────
  const transactions = useMemo(() => {
    if (!searchText.trim()) return allTransactions;
    const q = searchText.trim().toLowerCase();
    return allTransactions.filter(
      tx =>
        (tx.reference ?? "").toLowerCase().includes(q) ||
        (tx.description ?? "").toLowerCase().includes(q)
    );
  }, [allTransactions, searchText]);

  // ── KPI values ───────────────────────────────────────────────────────────
  const kpiTotalCount = allTransactions.length;
  const kpiTotalAmount = allTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount ?? 0),
    0
  );

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_TRANSACTIONS],
    });
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    });
  };

  const createMutation = useMutation({
    mutationFn: (dto: CreateTreasuryTransactionDto) =>
      treasuryTransactionsService.create(dto),
    onSuccess: () => {
      notification.success({
        message: t("treasury.payments.created", lang),
      });
      invalidate();
      closeModal();
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      accountId: selectedAccountId,
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

  // ── Submit handler ───────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate({
        accountId: values.accountId,
        type: TreasuryTransactionType.PAYMENT,
        amount: values.amount,
        date: values.date.format("YYYY-MM-DD"),
        description: values.description || undefined,
        reference: values.reference || undefined,
        partnerId: values.partnerId || undefined,
      });
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<TreasuryTransaction> = [
    {
      title: t("treasury.payments.date", lang),
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => <Text>{dayjs(v).format("YYYY-MM-DD")}</Text>,
    },
    {
      title: t("treasury.payments.reference", lang),
      dataIndex: "reference",
      render: (v: string | null) =>
        v ? (
          <Text style={{ fontFamily: "monospace" }}>{v}</Text>
        ) : (
          <Text type="secondary">--</Text>
        ),
    },
    {
      title: t("treasury.payments.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: (v: string | null) =>
        v ? <Text>{v}</Text> : <Text type="secondary">--</Text>,
    },
    {
      title: t("treasury.payments.amount", lang),
      dataIndex: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (v: number) => (
        <Text
          strong
          style={{
            fontFamily: "monospace",
            color: "#ef4444",
          }}
        >
          {Number(v ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      ),
    },
    {
      title: t("treasury.payments.type", lang),
      dataIndex: "type",
      render: (v: string) => {
        if (v === TreasuryTransactionType.PAYMENT) {
          return (
            <Tag color="red" style={{ borderRadius: 20, padding: "2px 10px" }}>
              {t("treasury.payments.payment", lang)}
            </Tag>
          );
        }
        if (v === TreasuryTransactionType.TRANSFER_OUT) {
          return (
            <Tag
              color="orange"
              style={{ borderRadius: 20, padding: "2px 10px" }}
            >
              {t("treasury.payments.transferOut", lang)}
            </Tag>
          );
        }
        return <Text type="secondary">{v}</Text>;
      },
    },
    {
      title: t("treasury.payments.reconciled", lang),
      dataIndex: "isReconciled",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v
            ? t("treasury.payments.reconciled", lang)
            : t("treasury.payments.notReconciled", lang)}
        </Tag>
      ),
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => (
        <Tooltip title={t("treasury.payments.view", lang)}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openView(rec)}
          />
        </Tooltip>
      ),
    },
  ];

  // ── Gradient header style for modal ──────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  // ── Helper: find vendor name ─────────────────────────────────────────────
  const getVendorName = (partnerId: string | null | undefined) => {
    if (!partnerId) return "--";
    const vendor = vendorOptions.find(v => v.value === partnerId);
    return vendor ? vendor.label : "--";
  };

  return (
    <DashboardLayout
      currentPage="Payments"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Treasury", href: "#" },
        { label: t("treasury.payments.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Account Selector ──────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <Text strong style={{ marginInlineEnd: 8 }}>
              {t("treasury.payments.selectAccount", lang)}
            </Text>
            <Select
              value={selectedAccountId}
              onChange={v => setSelectedAccountId(v)}
              placeholder={t("treasury.payments.selectAccount", lang)}
              style={{ minWidth: 260 }}
              allowClear
              showSearch
              optionFilterProp="label"
              options={accountOptions}
            />
          </div>
        </Card>

        {/* ── KPI Cards ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.payments.total", lang),
              value: kpiTotalCount,
              suffix: t("treasury.payments.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined as string | undefined,
              isCurrency: false,
            },
            {
              title: t("treasury.payments.totalAmount", lang),
              value: kpiTotalAmount,
              suffix: selectedAccount?.currency ?? "SAR",
              icon: <DollarOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
              isCurrency: true,
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={12}>
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
                placeholder={t("treasury.payments.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
            </Space>

            <Space>
              <Tooltip title="Reload">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => refetch()}
                  disabled={!selectedAccountId}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("treasury.payments.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          {selectedAccountId ? (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={transactions}
              loading={isLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}--${range[1]} of ${total}`,
                pageSizeOptions: ["5", "10", "25", "50"],
              }}
              locale={{
                emptyText: t("treasury.payments.title", lang) + " -- 0",
              }}
            />
          ) : (
            <div style={{ padding: 48 }}>
              <Empty description={t("treasury.payments.selectAccount", lang)} />
            </div>
          )}
        </Card>
      </Space>

      {/* ── Create Payment Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("treasury.payments.new", lang)}
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
              {t("treasury.payments.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("treasury.payments.selectAccount", lang)}
            name="accountId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("treasury.payments.selectAccount", lang)}
              options={accountOptions}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.payments.amount", lang)}
                name="amount"
                rules={[
                  { required: true },
                  {
                    type: "number",
                    min: 0.01,
                    message: t("treasury.payments.amount", lang),
                  },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0.01}
                  precision={2}
                  prefix={selectedAccount?.currency ?? "SAR"}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.payments.date", lang)}
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
                label={t("treasury.payments.reference", lang)}
                name="reference"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.payments.partner", lang)}
                name="partnerId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="--"
                  options={vendorOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t("treasury.payments.description", lang)}
            name="description"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewTransaction(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewTransaction
            ? `${t("treasury.payments.details", lang)} -- ${viewTransaction.reference ?? viewTransaction.id.slice(0, 8)}`
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
                {t("treasury.payments.amount", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color: "#ef4444",
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
                  {t("treasury.payments.date", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewTransaction.date).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.payments.type", lang)}
                </Text>
                <br />
                {viewTransaction.type === TreasuryTransactionType.PAYMENT ? (
                  <Tag
                    color="red"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("treasury.payments.payment", lang)}
                  </Tag>
                ) : (
                  <Tag
                    color="orange"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("treasury.payments.transferOut", lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.payments.reference", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewTransaction.reference ?? "--"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.payments.reconciled", lang)}
                </Text>
                <br />
                <Tag
                  color={viewTransaction.isReconciled ? "green" : "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewTransaction.isReconciled
                    ? t("treasury.payments.reconciled", lang)
                    : t("treasury.payments.notReconciled", lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.payments.partner", lang)}
                </Text>
                <br />
                <Text>{getVendorName(viewTransaction.partnerId)}</Text>
              </Col>
              {viewTransaction.description && (
                <Col span={24}>
                  <Text type="secondary">
                    {t("treasury.payments.description", lang)}
                  </Text>
                  <br />
                  <Text>{viewTransaction.description}</Text>
                </Col>
              )}
              {viewTransaction.runningBalance !== undefined && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.payments.runningBalance", lang)}
                  </Text>
                  <br />
                  <Text
                    strong
                    style={{
                      fontFamily: "monospace",
                      color:
                        Number(viewTransaction.runningBalance) >= 0
                          ? "#10b981"
                          : "#ef4444",
                    }}
                  >
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
            </Row>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
