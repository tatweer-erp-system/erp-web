import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
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
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  MoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function BankReconciliationPage() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewItem, setViewItem] = useState<BankReconciliation | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

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

  // Build lookup map for account names
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
    return filtered;
  }, [allItems, statusFilter]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
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
      notification.success({ message: t("treasury.recon.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => reconciliationService.complete(id),
    onSuccess: () => {
      notification.success({
        message: t("treasury.recon.completedSuccess", lang),
      });
      invalidate();
      setDrawerOpen(false);
      setViewItem(null);
    },
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

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<BankReconciliation> = [
    {
      title: t("treasury.recon.account", lang),
      dataIndex: "accountId",
      render: (v: string) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {getAccountName(v)}
        </Text>
      ),
    },
    {
      title: t("treasury.recon.statementDate", lang),
      dataIndex: "statementDate",
      sorter: (a, b) =>
        (a.statementDate ?? "").localeCompare(b.statementDate ?? ""),
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("treasury.recon.openingBalance", lang),
      dataIndex: "openingBalance",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatAmount(v)}</Text>
      ),
    },
    {
      title: t("treasury.recon.closingBalance", lang),
      dataIndex: "closingBalance",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatAmount(v)}</Text>
      ),
    },
    {
      title: t("treasury.recon.systemBalance", lang),
      dataIndex: "systemBalance",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatAmount(v)}</Text>
      ),
    },
    {
      title: t("treasury.recon.difference", lang),
      dataIndex: "difference",
      align: "right",
      render: (v: number) => {
        const num = Number(v ?? 0);
        const isZero = num === 0;
        return (
          <Text
            strong
            style={{
              fontFamily: "monospace",
              color: isZero ? "#10b981" : "#ef4444",
            }}
          >
            {formatAmount(num)}
          </Text>
        );
      },
    },
    {
      title: t("treasury.recon.status", lang),
      dataIndex: "status",
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
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const isCompleted = rec.status === ReconciliationStatus.COMPLETED;
        const differenceIsZero = Number(rec.difference ?? 0) === 0;

        const menuItems = [
          {
            key: "view",
            label: t("treasury.recon.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(!isCompleted
            ? [
                { type: "divider" as const, key: "d1" },
                {
                  key: "complete",
                  label: t("treasury.recon.complete", lang),
                  icon: <CheckCircleOutlined />,
                  disabled: !differenceIsZero,
                  onClick: () => {
                    if (!differenceIsZero) {
                      notification.warning({
                        message: t("treasury.recon.zeroRequired", lang),
                      });
                      return;
                    }
                    Modal.confirm({
                      title: t("treasury.recon.complete", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("treasury.recon.completeConfirm", lang),
                      onOk: () => completeMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ── Gradient header style for modal ──────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="BankReconciliation"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Treasury", href: "#" },
        { label: t("treasury.recon.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.recon.total", lang),
              value: kpiTotal,
              suffix: t("treasury.recon.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("treasury.recon.totalCompleted", lang),
              value: kpiCompleted,
              suffix: t("treasury.recon.completed", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("treasury.recon.totalInProgress", lang),
              value: kpiInProgress,
              suffix: t("treasury.recon.inProgress", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
            },
            {
              title: t("treasury.recon.totalDraft", lang),
              value: kpiDraft,
              suffix: t("treasury.recon.draft", lang),
              icon: <EditOutlined />,
              iconColor: "#94a3b8",
              iconBg: "#94a3b815",
              color: "#94a3b8",
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

        {/* ── Toolbar Card ───────────────────────────────────────────────── */}
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
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 180 }}
                suffixIcon={<FilterOutlined />}
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
                {t("treasury.recon.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={items}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["5", "10", "25", "50"],
            }}
            locale={{
              emptyText: t("treasury.recon.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create Modal ─────────────────────────────────────────────── */}
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
        {/* Gradient header */}
        <div style={gradientHeader}>
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

      {/* ── Detail Drawer ────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewItem(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewItem
            ? `${t("treasury.recon.details", lang)} — ${getAccountName(viewItem.accountId)}`
            : ""
        }
      >
        {viewItem && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
                      notification.warning({
                        message: t("treasury.recon.zeroRequired", lang),
                      });
                      return;
                    }
                    Modal.confirm({
                      title: t("treasury.recon.complete", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("treasury.recon.completeConfirm", lang),
                      onOk: () => completeMutation.mutate(viewItem.id),
                    });
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
