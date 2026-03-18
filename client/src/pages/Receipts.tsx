import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  treasuryAccountsService,
  treasuryTransactionsService,
} from "@/services/treasury.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import { TreasuryTransactionType } from "@/constants/enums";
import type {
  TreasuryAccount,
  TreasuryTransaction,
  CreateTreasuryTransactionDto,
} from "@/types/modules/treasury";
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
  Empty,
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
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ── Receipt-type transaction types (cash-in) ──────────────────────────────────
const RECEIPT_TYPES: string[] = [
  TreasuryTransactionType.RECEIPT,
  TreasuryTransactionType.TRANSFER_IN,
  TreasuryTransactionType.OPENING_BALANCE,
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Receipts() {
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

  const {
    data: transactionsRaw,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_TRANSACTIONS, selectedAccountId, "receipts"],
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
    // Filter to receipt-type transactions only
    return list.filter(tx => RECEIPT_TYPES.includes(tx.type));
  }, [transactionsRaw]);

  // ── Partners dropdown ─────────────────────────────────────────────────────
  const { data: partnersRaw } = useQuery({
    queryKey: [QUERY_KEYS.PARTNERS, "dropdown"],
    queryFn: () => getPartnersDropdown({ limit: 200 }),
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
  const kpiTotal = allTransactions.length;
  const kpiTotalAmount = allTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount ?? 0),
    0
  );
  const kpiReconciled = allTransactions.filter(tx => tx.isReconciled).length;

  // ── Selected account info ────────────────────────────────────────────────
  const selectedAccount = useMemo(
    () => allAccounts.find(a => a.id === selectedAccountId) ?? null,
    [allAccounts, selectedAccountId]
  );

  // ── Mutation ─────────────────────────────────────────────────────────────

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
      notification.success({ message: t("treasury.receipts.created", lang) });
      invalidate();
      closeModal();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      accountId: selectedAccountId ?? undefined,
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
        type: TreasuryTransactionType.RECEIPT,
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

  // ── Type tag helper ──────────────────────────────────────────────────────

  const typeTag = (type: string) => {
    const map: Record<string, { color: string; label: string }> = {
      [TreasuryTransactionType.RECEIPT]: {
        color: "green",
        label: t("treasury.receipts.receipt", lang),
      },
      [TreasuryTransactionType.TRANSFER_IN]: {
        color: "blue",
        label: t("treasury.receipts.transferIn", lang),
      },
      [TreasuryTransactionType.OPENING_BALANCE]: {
        color: "purple",
        label: t("treasury.receipts.openingBalance", lang),
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

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<TreasuryTransaction> = [
    {
      title: t("treasury.receipts.date", lang),
      dataIndex: "date",
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: (v: string) => <Text>{dayjs(v).format("YYYY-MM-DD")}</Text>,
    },
    {
      title: t("treasury.receipts.reference", lang),
      dataIndex: "reference",
      render: (v: string | null) => (
        <Text style={{ fontFamily: "monospace" }}>{v ?? "—"}</Text>
      ),
    },
    {
      title: t("treasury.receipts.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: (v: string | null) => <Text>{v ?? "—"}</Text>,
    },
    {
      title: t("treasury.receipts.amount", lang),
      dataIndex: "amount",
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
      render: (v: number) => {
        const num = Number(v ?? 0);
        return (
          <Text strong style={{ fontFamily: "monospace", color: "#10b981" }}>
            {num.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("treasury.receipts.type", lang),
      dataIndex: "type",
      render: (v: string) => typeTag(v),
    },
    {
      title: t("treasury.receipts.reconciled", lang),
      dataIndex: "isReconciled",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v
            ? t("treasury.receipts.reconciled", lang)
            : t("treasury.receipts.notReconciled", lang)}
        </Tag>
      ),
    },
    {
      title: "",
      align: "center" as const,
      width: 60,
      render: (_, rec) => (
        <Tooltip title={t("treasury.receipts.view", lang)}>
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

  // ── Helper: find account name ────────────────────────────────────────────

  const getAccountName = (accountId: string) => {
    const acc = allAccounts.find(a => a.id === accountId);
    return acc ? getName(acc) : "—";
  };

  return (
    <DashboardLayout
      currentPage="Receipts"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Treasury", href: "#" },
        { label: t("treasury.receipts.title", lang) },
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
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space wrap>
              <Select
                value={selectedAccountId}
                onChange={v => setSelectedAccountId(v)}
                placeholder={t("treasury.receipts.selectAccount", lang)}
                style={{ width: 280 }}
                allowClear
                showSearch
                optionFilterProp="label"
                loading={accountsLoading}
                options={accountOptions}
              />
              {selectedAccountId && (
                <Input.Search
                  placeholder={t("treasury.receipts.search", lang)}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              )}
            </Space>

            <Space>
              {selectedAccountId && (
                <Tooltip title="Reload">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refetchTransactions()}
                  />
                </Tooltip>
              )}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("treasury.receipts.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── KPI Cards (only when account is selected) ───────────────── */}
        {selectedAccountId && (
          <Row gutter={[16, 16]}>
            {[
              {
                title: t("treasury.receipts.total", lang),
                value: kpiTotal,
                suffix: t("treasury.receipts.title", lang),
                icon: <FileTextOutlined />,
                iconColor: token.colorPrimary,
                iconBg: `${token.colorPrimary}15`,
                color: undefined,
                isCurrency: false,
              },
              {
                title: t("treasury.receipts.totalAmount", lang),
                value: kpiTotalAmount,
                suffix: selectedAccount?.currency ?? "SAR",
                icon: <DollarOutlined />,
                iconColor: "#10b981",
                iconBg: "#10b98115",
                color: "#10b981",
                isCurrency: true,
              },
              {
                title: t("treasury.receipts.reconciled", lang),
                value: kpiReconciled,
                suffix: `/ ${kpiTotal}`,
                icon: <CheckCircleOutlined />,
                iconColor: "#6366f1",
                iconBg: "#6366f115",
                color: "#6366f1",
                isCurrency: false,
              },
            ].map(s => (
              <Col key={s.title} xs={24} sm={8}>
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
        )}

        {/* ── Table / Empty State ──────────────────────────────────────── */}
        {selectedAccountId ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={transactions}
              loading={transactionsLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total}`,
                pageSizeOptions: ["10", "25", "50", "100"],
              }}
              locale={{
                emptyText: t("treasury.receipts.title", lang) + " — 0",
              }}
            />
          </Card>
        ) : (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("treasury.receipts.noAccount", lang)}
            />
          </Card>
        )}
      </Space>

      {/* ── Create Receipt Modal ──────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("treasury.receipts.new", lang)}
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
              {t("treasury.receipts.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("treasury.receipts.account", lang)}
            name="accountId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("treasury.receipts.selectAccount", lang)}
              options={accountOptions}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.receipts.amount", lang)}
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
                label={t("treasury.receipts.date", lang)}
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
                label={t("treasury.receipts.reference", lang)}
                name="reference"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.receipts.partner", lang)}
                name="partnerId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={partnerOptions}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("treasury.receipts.description", lang)}
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
        width={isMobile ? "100%" : 520}
        title={
          viewTransaction
            ? `${t("treasury.receipts.details", lang)} — ${viewTransaction.reference ?? viewTransaction.id.slice(0, 8)}`
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
                {t("treasury.receipts.amount", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color: "#10b981",
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
                  {t("treasury.receipts.date", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewTransaction.date).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.type", lang)}
                </Text>
                <br />
                {typeTag(viewTransaction.type)}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.account", lang)}
                </Text>
                <br />
                <Text strong>{getAccountName(viewTransaction.accountId)}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.reference", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewTransaction.reference ?? "—"}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary">
                  {t("treasury.receipts.description", lang)}
                </Text>
                <br />
                <Text>{viewTransaction.description ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.currency", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewTransaction.currency}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.exchangeRate", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {Number(viewTransaction.exchangeRate ?? 1).toFixed(4)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.receipts.reconciled", lang)}
                </Text>
                <br />
                <Tag
                  color={viewTransaction.isReconciled ? "green" : "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewTransaction.isReconciled
                    ? t("treasury.receipts.reconciled", lang)
                    : t("treasury.receipts.notReconciled", lang)}
                </Tag>
              </Col>
              {viewTransaction.runningBalance != null && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("treasury.receipts.runningBalance", lang)}
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
                    {t("treasury.receipts.createdAt", lang)}
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
