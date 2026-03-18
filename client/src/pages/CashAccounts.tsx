import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { treasuryAccountsService } from "@/services/treasury.service";
import { accountsService } from "@/services/accounting.service";
import { TreasuryAccountType } from "@/constants/enums";
import type {
  TreasuryAccount,
  CreateTreasuryAccountDto,
  UpdateTreasuryAccountDto,
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
  Select,
  Tooltip,
  Typography,
  Dropdown,
  Drawer,
  Input,
  Switch,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function CashAccounts() {
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
  const [searchText, setSearchText] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TreasuryAccount | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewAccount, setViewAccount] = useState<TreasuryAccount | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: accountsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS, "cash"],
    queryFn: () => treasuryAccountsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allAccounts: TreasuryAccount[] = useMemo(() => {
    const list =
      ((accountsRaw as Record<string, unknown>)?.data as TreasuryAccount[]) ??
      [];
    return list.filter(a => a.type === TreasuryAccountType.CASH);
  }, [accountsRaw]);

  const { data: coaAccountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const coaAccountOptions = useMemo(() => {
    const list =
      ((coaAccountsList as Record<string, unknown>)?.data as {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
      }[]) ?? [];
    return list.map(a => ({
      value: a.id,
      label: `${a.code} — ${getName(a)}`,
    }));
  }, [coaAccountsList]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const accounts = useMemo(() => {
    let filtered = [...allAccounts];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(a => a.isActive === isActive);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        a =>
          a.nameEn.toLowerCase().includes(q) ||
          a.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allAccounts, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allAccounts.length;
  const kpiTotalBalance = allAccounts.reduce(
    (sum, a) => sum + Number(a.currentBalance ?? 0),
    0
  );
  const kpiActive = allAccounts.filter(a => a.isActive).length;
  const kpiInactive = allAccounts.filter(a => !a.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.TREASURY_ACCOUNTS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTreasuryAccountDto) =>
      treasuryAccountsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("treasury.cash.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTreasuryAccountDto }) =>
      treasuryAccountsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("treasury.cash.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => treasuryAccountsService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("treasury.cash.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingAccount(null);
    form.resetFields();
    form.setFieldsValue({
      currency: "SAR",
      isDefault: false,
      isActive: true,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (account: TreasuryAccount) => {
      setEditingAccount(account);
      form.setFieldsValue({
        nameEn: account.nameEn,
        nameAr: account.nameAr,
        descriptionEn: account.descriptionEn ?? undefined,
        descriptionAr: account.descriptionAr ?? undefined,
        currency: account.currency,
        coaAccountId: account.coaAccountId ?? undefined,
        isDefault: account.isDefault,
        isActive: account.isActive,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingAccount(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((account: TreasuryAccount) => {
    setViewAccount(account);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingAccount) {
        updateMutation.mutate({
          id: editingAccount.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            descriptionEn: values.descriptionEn,
            descriptionAr: values.descriptionAr,
            currency: values.currency,
            coaAccountId: values.coaAccountId,
            isDefault: values.isDefault,
            isActive: values.isActive,
            version: editingAccount.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          descriptionEn: values.descriptionEn,
          descriptionAr: values.descriptionAr,
          type: TreasuryAccountType.CASH,
          currency: values.currency ?? "SAR",
          coaAccountId: values.coaAccountId,
          isDefault: values.isDefault ?? false,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<TreasuryAccount> = [
    {
      title: t("treasury.cash.nameEn", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {getName(rec)}
        </Text>
      ),
    },
    {
      title: t("treasury.cash.currency", lang),
      dataIndex: "currency",
      render: (v: string) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("treasury.cash.balance", lang),
      dataIndex: "currentBalance",
      sorter: (a, b) => Number(a.currentBalance) - Number(b.currentBalance),
      render: (v: number) => {
        const num = Number(v ?? 0);
        return (
          <Text
            strong
            style={{
              fontFamily: "monospace",
              color: num >= 0 ? "#10b981" : "#ef4444",
            }}
          >
            {num.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        );
      },
    },
    {
      title: t("treasury.cash.coaAccount", lang),
      dataIndex: "coaAccountId",
      render: (v: string | null | undefined) => {
        if (!v) return <Text type="secondary">—</Text>;
        const opt = coaAccountOptions.find(o => o.value === v);
        return <Text>{opt ? opt.label : "—"}</Text>;
      },
    },
    {
      title: t("treasury.cash.isDefault", lang),
      dataIndex: "isDefault",
      render: (v: boolean) =>
        v ? (
          <Tag color="blue" style={{ borderRadius: 20, padding: "2px 10px" }}>
            {t("treasury.cash.default", lang)}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("treasury.cash.isActive", lang),
      dataIndex: "isActive",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "red"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v
            ? t("treasury.cash.active", lang)
            : t("treasury.cash.inactive", lang)}
        </Tag>
      ),
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const items = [
          {
            key: "view",
            label: t("treasury.cash.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("treasury.cash.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("treasury.cash.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("treasury.cash.delete", lang),
                content: t("treasury.cash.deleteConfirm", lang),
                okButtonProps: { danger: true },
                onOk: () => deleteMutation.mutate(rec.id),
              });
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
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
      currentPage="CashAccounts"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Treasury", href: "#" },
        { label: t("treasury.cash.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("treasury.cash.total", lang),
              value: kpiTotal,
              suffix: t("treasury.cash.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
              isCurrency: false,
            },
            {
              title: t("treasury.cash.totalBalance", lang),
              value: kpiTotalBalance,
              suffix: "SAR",
              icon: <DollarOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
              color: kpiTotalBalance >= 0 ? "#10b981" : "#ef4444",
              isCurrency: true,
            },
            {
              title: t("treasury.cash.totalActive", lang),
              value: kpiActive,
              suffix: t("treasury.cash.active", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
              isCurrency: false,
            },
            {
              title: t("treasury.cash.totalInactive", lang),
              value: kpiInactive,
              suffix: t("treasury.cash.inactive", lang),
              icon: <CloseCircleOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
              isCurrency: false,
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
              <Input.Search
                placeholder={t("treasury.cash.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("treasury.cash.allStatuses", lang),
                  },
                  {
                    value: "active",
                    label: t("treasury.cash.active", lang),
                  },
                  {
                    value: "inactive",
                    label: t("treasury.cash.inactive", lang),
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
                {t("treasury.cash.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={accounts}
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
              emptyText: t("treasury.cash.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingAccount
            ? t("treasury.cash.edit", lang)
            : t("treasury.cash.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingAccount ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingAccount
                ? `${t("treasury.cash.edit", lang)} — ${getName(editingAccount)}`
                : t("treasury.cash.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.descriptionEn", lang)}
                name="descriptionEn"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.descriptionAr", lang)}
                name="descriptionAr"
              >
                <Input.TextArea rows={2} dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.currency", lang)}
                name="currency"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.coaAccount", lang)}
                name="coaAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={coaAccountOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.isDefault", lang)}
                name="isDefault"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("treasury.cash.isActive", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewAccount(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewAccount
            ? `${t("treasury.cash.details", lang)} — ${getName(viewAccount)}`
            : ""
        }
      >
        {viewAccount && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Balance highlight */}
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
                {t("treasury.cash.balance", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color:
                    Number(viewAccount.currentBalance ?? 0) >= 0
                      ? "#10b981"
                      : "#ef4444",
                }}
              >
                {Number(viewAccount.currentBalance ?? 0).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                {viewAccount.currency}
              </Text>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("treasury.cash.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewAccount.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("treasury.cash.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewAccount.nameAr}
                </Text>
              </Col>
              {(viewAccount.descriptionEn || viewAccount.descriptionAr) && (
                <>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("treasury.cash.descriptionEn", lang)}
                    </Text>
                    <br />
                    <Text>{viewAccount.descriptionEn ?? "—"}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("treasury.cash.descriptionAr", lang)}
                    </Text>
                    <br />
                    <Text dir="rtl">{viewAccount.descriptionAr ?? "—"}</Text>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.currency", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewAccount.currency}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.coaAccount", lang)}
                </Text>
                <br />
                <Text>
                  {viewAccount.coaAccountId
                    ? (coaAccountOptions.find(
                        o => o.value === viewAccount.coaAccountId
                      )?.label ?? "—")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.isDefault", lang)}
                </Text>
                <br />
                {viewAccount.isDefault ? (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("treasury.cash.default", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("treasury.cash.isActive", lang)}
                </Text>
                <br />
                <Tag
                  color={viewAccount.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewAccount.isActive
                    ? t("treasury.cash.active", lang)
                    : t("treasury.cash.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewAccount);
                }}
              >
                {t("treasury.cash.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("treasury.cash.delete", lang),
                    content: t("treasury.cash.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewAccount.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("treasury.cash.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
