import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  journalsService,
  accountsService,
} from "@/services/accounting.service";
import { JournalType } from "@/constants/enums";
import type {
  Journal,
  CreateJournalDto,
  UpdateJournalDto,
} from "@/types/modules/accounting";
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
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const TYPE_TAG: Record<JournalType, { color: string; i18nKey: string }> = {
  [JournalType.SALE]: {
    color: "blue",
    i18nKey: "accounting.jn.sale",
  },
  [JournalType.PURCHASE]: {
    color: "orange",
    i18nKey: "accounting.jn.purchase",
  },
  [JournalType.CASH]: {
    color: "green",
    i18nKey: "accounting.jn.cash",
  },
  [JournalType.BANK]: {
    color: "purple",
    i18nKey: "accounting.jn.bank",
  },
  [JournalType.GENERAL]: {
    color: "default",
    i18nKey: "accounting.jn.general",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Journals() {
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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewJournal, setViewJournal] = useState<Journal | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: journalsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.JOURNALS_LIST],
    queryFn: () => journalsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allJournals: Journal[] = useMemo(
    () => ((journalsRaw as Record<string, unknown>)?.data as Journal[]) ?? [],
    [journalsRaw]
  );

  const { data: accountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const accountOptions = useMemo(() => {
    const list =
      ((accountsList as Record<string, unknown>)?.data as {
        id: string;
        code: string;
        nameEn: string;
        nameAr: string;
      }[]) ?? [];
    return list.map(a => ({
      value: a.id,
      label: `${a.code} — ${getName(a)}`,
    }));
  }, [accountsList]);

  // ── Filtered data ────────────────────────────────────────────────────────
  const journals = useMemo(() => {
    let filtered = [...allJournals];
    if (typeFilter !== "all") {
      filtered = filtered.filter(j => j.type === typeFilter);
    }
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(j => j.isActive === isActive);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        j =>
          j.code.toLowerCase().includes(q) ||
          j.nameEn.toLowerCase().includes(q) ||
          j.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allJournals, typeFilter, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allJournals.length;
  const kpiActive = allJournals.filter(j => j.isActive).length;
  const kpiInactive = allJournals.filter(j => !j.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNALS_LIST] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateJournalDto) => journalsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.jn.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateJournalDto }) =>
      journalsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.jn.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalsService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("accounting.jn.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingJournal(null);
    form.resetFields();
    form.setFieldsValue({ type: JournalType.GENERAL, isActive: true });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (journal: Journal) => {
      setEditingJournal(journal);
      form.setFieldsValue({
        nameEn: journal.nameEn,
        nameAr: journal.nameAr,
        type: journal.type,
        code: journal.code,
        defaultAccountId: journal.defaultAccountId ?? undefined,
        suspenseAccountId: journal.suspenseAccountId ?? undefined,
        currencyId: journal.currencyId ?? undefined,
        sequencePrefix: journal.sequencePrefix ?? undefined,
        isActive: journal.isActive,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingJournal(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((journal: Journal) => {
    setViewJournal(journal);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingJournal) {
        updateMutation.mutate({
          id: editingJournal.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            type: values.type,
            code: values.code,
            defaultAccountId: values.defaultAccountId,
            suspenseAccountId: values.suspenseAccountId,
            currencyId: values.currencyId,
            sequencePrefix: values.sequencePrefix,
            isActive: values.isActive,
            version: editingJournal.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          type: values.type,
          code: values.code,
          defaultAccountId: values.defaultAccountId,
          suspenseAccountId: values.suspenseAccountId,
          currencyId: values.currencyId,
          sequencePrefix: values.sequencePrefix,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<Journal> = [
    {
      title: t("accounting.jn.code", lang),
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (v: string) => (
        <Text style={{ fontFamily: "monospace", color: token.colorPrimary }}>
          {v}
        </Text>
      ),
    },
    {
      title: t("accounting.jn.nameEn", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text strong>{getName(rec)}</Text>,
    },
    {
      title: t("accounting.jn.type", lang),
      dataIndex: "type",
      render: (v: JournalType) => {
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
      title: t("accounting.jn.defaultAccount", lang),
      dataIndex: "defaultAccountCode",
      render: (v: string | null | undefined, rec) => {
        if (!v && !rec.defaultAccountNameEn)
          return <Text type="secondary">—</Text>;
        return <Text style={{ fontFamily: "monospace" }}>{v ?? "—"}</Text>;
      },
    },
    {
      title: t("accounting.jn.isActive", lang),
      dataIndex: "isActive",
      render: (v: boolean) => (
        <Tag
          color={v ? "green" : "red"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v
            ? t("accounting.jn.active", lang)
            : t("accounting.jn.inactive", lang)}
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
            label: t("accounting.jn.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("accounting.jn.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("accounting.jn.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("accounting.jn.delete", lang),
                content: t("accounting.jn.deleteConfirm", lang),
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
      currentPage="Journals"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.jn.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("accounting.jn.total", lang),
              value: kpiTotal,
              suffix: t("accounting.jn.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("accounting.jn.totalActive", lang),
              value: kpiActive,
              suffix: t("accounting.jn.active", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("accounting.jn.totalInactive", lang),
              value: kpiInactive,
              suffix: t("accounting.jn.inactive", lang),
              icon: <CloseCircleOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={12} lg={8}>
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
              <Input.Search
                placeholder={t("accounting.jn.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                value={typeFilter}
                onChange={v => setTypeFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("accounting.jn.allTypes", lang),
                  },
                  {
                    value: JournalType.SALE,
                    label: t("accounting.jn.sale", lang),
                  },
                  {
                    value: JournalType.PURCHASE,
                    label: t("accounting.jn.purchase", lang),
                  },
                  {
                    value: JournalType.CASH,
                    label: t("accounting.jn.cash", lang),
                  },
                  {
                    value: JournalType.BANK,
                    label: t("accounting.jn.bank", lang),
                  },
                  {
                    value: JournalType.GENERAL,
                    label: t("accounting.jn.general", lang),
                  },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("accounting.jn.allStatuses", lang),
                  },
                  {
                    value: "active",
                    label: t("accounting.jn.active", lang),
                  },
                  {
                    value: "inactive",
                    label: t("accounting.jn.inactive", lang),
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
                {t("accounting.jn.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={journals}
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
              emptyText: t("accounting.jn.title", lang) + " — 0",
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
          editingJournal
            ? t("accounting.jn.edit", lang)
            : t("accounting.jn.new", lang)
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
            {editingJournal ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingJournal
                ? `${t("accounting.jn.edit", lang)} — ${getName(editingJournal)}`
                : t("accounting.jn.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.jn.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.jn.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.jn.code", lang)}
                name="code"
                rules={[{ required: true }, { max: 10 }]}
              >
                <Input
                  style={{ fontFamily: "monospace" }}
                  disabled={!!editingJournal}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.jn.type", lang)}
                name="type"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: JournalType.SALE,
                      label: t("accounting.jn.sale", lang),
                    },
                    {
                      value: JournalType.PURCHASE,
                      label: t("accounting.jn.purchase", lang),
                    },
                    {
                      value: JournalType.CASH,
                      label: t("accounting.jn.cash", lang),
                    },
                    {
                      value: JournalType.BANK,
                      label: t("accounting.jn.bank", lang),
                    },
                    {
                      value: JournalType.GENERAL,
                      label: t("accounting.jn.general", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.jn.sequencePrefix", lang)}
                name="sequencePrefix"
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.jn.defaultAccount", lang)}
                name="defaultAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={accountOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.jn.suspenseAccount", lang)}
                name="suspenseAccountId"
              >
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={accountOptions}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.jn.isActive", lang)}
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
          setViewJournal(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewJournal
            ? `${t("accounting.jn.details", lang)} — ${getName(viewJournal)}`
            : ""
        }
      >
        {viewJournal && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("accounting.jn.code", lang)}</Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewJournal.code}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.jn.type", lang)}</Text>
                <br />
                {TYPE_TAG[viewJournal.type] && (
                  <Tag
                    color={TYPE_TAG[viewJournal.type].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(TYPE_TAG[viewJournal.type].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.jn.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewJournal.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.jn.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewJournal.nameAr}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.jn.defaultAccount", lang)}
                </Text>
                <br />
                <Text>
                  {viewJournal.defaultAccountCode
                    ? `${viewJournal.defaultAccountCode} — ${lang === "ar" ? viewJournal.defaultAccountNameAr : viewJournal.defaultAccountNameEn}`
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.jn.suspenseAccount", lang)}
                </Text>
                <br />
                <Text>
                  {viewJournal.suspenseAccountCode
                    ? `${viewJournal.suspenseAccountCode} — ${lang === "ar" ? viewJournal.suspenseAccountNameAr : viewJournal.suspenseAccountNameEn}`
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.jn.currency", lang)}
                </Text>
                <br />
                <Text>{viewJournal.currencyCode ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.jn.sequencePrefix", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewJournal.sequencePrefix ?? "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.jn.isActive", lang)}
                </Text>
                <br />
                <Tag
                  color={viewJournal.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewJournal.isActive
                    ? t("accounting.jn.active", lang)
                    : t("accounting.jn.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewJournal);
                }}
              >
                {t("accounting.jn.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("accounting.jn.delete", lang),
                    content: t("accounting.jn.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewJournal.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("accounting.jn.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
