import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  journalEntriesService,
  accountsService,
  costCentersService,
} from "@/services/accounting.service";
import { JournalEntryStatus, JournalEntryType } from "@/constants/enums";
import type {
  JournalEntry,
  JournalLine,
  CreateJournalEntryDto,
  UpdateJournalEntryDto,
  Account,
  CostCenter,
} from "@/types/modules/accounting";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Input,
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
  Popconfirm,
  Typography,
  Dropdown,
  DatePicker,
  Drawer,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UndoOutlined,
  SendOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const STATUS_TAG: Record<
  JournalEntryStatus,
  { color: string; i18nKey: string }
> = {
  [JournalEntryStatus.DRAFT]: {
    color: "orange",
    i18nKey: "accounting.je.draft",
  },
  [JournalEntryStatus.POSTED]: {
    color: "green",
    i18nKey: "accounting.je.posted",
  },
  [JournalEntryStatus.REVERSED]: {
    color: "default",
    i18nKey: "accounting.je.reversed",
  },
};

const TYPE_TAG: Record<JournalEntryType, { color: string; i18nKey: string }> = {
  [JournalEntryType.MANUAL]: {
    color: "blue",
    i18nKey: "accounting.je.manual",
  },
  [JournalEntryType.AUTO]: { color: "cyan", i18nKey: "accounting.je.auto" },
  [JournalEntryType.OPENING]: {
    color: "purple",
    i18nKey: "accounting.je.opening",
  },
  [JournalEntryType.CLOSING]: {
    color: "orange",
    i18nKey: "accounting.je.closing",
  },
  [JournalEntryType.REVERSAL]: {
    color: "red",
    i18nKey: "accounting.je.reversal",
  },
};

// ─── Line form row type ──────────────────────────────────────────────────────

interface LineRow {
  key: string;
  accountId: string;
  costCenterId?: string;
  debit: number;
  credit: number;
  description?: string;
}

function emptyLine(): LineRow {
  return {
    key: crypto.randomUUID(),
    accountId: "",
    costCenterId: undefined,
    debit: 0,
    credit: 0,
    description: "",
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JournalEntries() {
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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState<JournalEntry | null>(null);

  const [form] = Form.useForm();
  const [lines, setLines] = useState<LineRow[]>([emptyLine(), emptyLine()]);

  // ── Queries ──────────────────────────────────────────────────────────────

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;
    if (statusFilter !== "all") params.status = statusFilter;
    if (typeFilter !== "all") params.entryType = typeFilter;
    if (dateRange?.[0]) params.fromDate = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) params.toDate = dateRange[1].format("YYYY-MM-DD");
    return params;
  }, [page, limit, search, statusFilter, typeFilter, dateRange]);

  const {
    data: entriesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.JOURNAL_ENTRIES,
      page,
      limit,
      search,
      statusFilter,
      typeFilter,
      dateRange?.[0]?.format("YYYY-MM-DD"),
      dateRange?.[1]?.format("YYYY-MM-DD"),
    ],
    queryFn: () => journalEntriesService.list(queryParams),
    staleTime: 30_000,
  });

  const entries = entriesData?.data ?? [];
  const totalRecords = entriesData?.meta?.total ?? 0;

  const { data: accountsList } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_FOR_JE],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });
  const accounts: Account[] = accountsList?.data ?? [];

  const { data: costCentersList } = useQuery({
    queryKey: [QUERY_KEYS.COST_CENTERS_FOR_JE],
    queryFn: () => costCentersService.list({ limit: 100 }),
    staleTime: 60_000,
  });
  const costCenters: CostCenter[] = costCentersList?.data ?? [];

  // ── KPI values ───────────────────────────────────────────────────────────

  const kpiTotal = totalRecords;
  const kpiDraft = entries.filter(
    e => e.status === JournalEntryStatus.DRAFT
  ).length;
  const kpiPosted = entries.filter(
    e => e.status === JournalEntryStatus.POSTED
  ).length;
  const now = dayjs();
  const kpiThisMonth = entries.filter(e =>
    dayjs(e.entryDate).isSame(now, "month")
  ).length;

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.JOURNAL_ENTRIES] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateJournalEntryDto) =>
      journalEntriesService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.je.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateJournalEntryDto }) =>
      journalEntriesService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.je.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => journalEntriesService.post(id),
    onSuccess: () => {
      notification.success({
        message: t("accounting.je.postedSuccess", lang),
      });
      invalidate();
    },
  });

  const reverseMutation = useMutation({
    mutationFn: (id: string) => journalEntriesService.reverse(id),
    onSuccess: () => {
      notification.success({
        message: t("accounting.je.reversedSuccess", lang),
      });
      invalidate();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => journalEntriesService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("accounting.je.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingEntry(null);
    form.resetFields();
    form.setFieldsValue({ entryType: JournalEntryType.MANUAL });
    setLines([emptyLine(), emptyLine()]);
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (entry: JournalEntry) => {
      setEditingEntry(entry);
      form.setFieldsValue({
        entryDate: dayjs(entry.entryDate),
        description: entry.description ?? "",
        entryType: entry.entryType,
      });
      setLines(
        (entry.lines ?? []).map(l => ({
          key: String(l.id ?? crypto.randomUUID()),
          accountId: l.accountId,
          costCenterId: l.costCenterId ?? undefined,
          debit: l.debit,
          credit: l.credit,
          description: l.description ?? "",
        }))
      );
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingEntry(null);
    form.resetFields();
    setLines([emptyLine(), emptyLine()]);
  }, [form]);

  const openView = useCallback((entry: JournalEntry) => {
    setViewEntry(entry);
    setDrawerOpen(true);
  }, []);

  // ── Line helpers ─────────────────────────────────────────────────────────

  const updateLine = (key: string, field: keyof LineRow, value: unknown) => {
    setLines(prev =>
      prev.map(l => (l.key === key ? { ...l, [field]: value } : l))
    );
  };

  const removeLine = (key: string) => {
    setLines(prev => prev.filter(l => l.key !== key));
  };

  const totalDebit = lines.reduce((s, l) => s + (l.debit ?? 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.credit ?? 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (lines.length < 2) {
        notification.error({ message: t("accounting.je.minTwoLines", lang) });
        return;
      }
      if (!isBalanced) {
        notification.error({
          message: t("accounting.je.lineMustBalance", lang),
        });
        return;
      }
      const hasEmptyAccount = lines.some(l => !l.accountId);
      if (hasEmptyAccount) {
        notification.error({ message: t("accounting.je.account", lang) });
        return;
      }

      const linesDtos = lines.map(l => ({
        accountId: l.accountId,
        costCenterId: l.costCenterId || null,
        debit: l.debit ?? 0,
        credit: l.credit ?? 0,
        description: l.description || null,
      }));

      if (editingEntry) {
        updateMutation.mutate({
          id: editingEntry.id,
          dto: {
            entryDate: values.entryDate.format("YYYY-MM-DD"),
            description: values.description || undefined,
            lines: linesDtos,
            version: editingEntry.version ?? 1,
          },
        });
      } else {
        createMutation.mutate({
          entryDate: values.entryDate.format("YYYY-MM-DD"),
          description: values.description || undefined,
          entryType: values.entryType,
          lines: linesDtos,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Account / Cost Center select options ───────────────────────────────

  const accountOptions = accounts
    .filter(a => a.allowDirectPosting)
    .map(a => ({
      value: a.id,
      label: `${a.code} - ${getName(a)}`,
    }));

  const costCenterOptions = costCenters.map(c => ({
    value: c.id,
    label: `${c.code} - ${getName(c)}`,
  }));

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<JournalEntry> = [
    {
      title: t("accounting.je.number", lang),
      dataIndex: "entryNumber",
      sorter: (a, b) => a.entryNumber.localeCompare(b.entryNumber),
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
      title: t("accounting.je.date", lang),
      dataIndex: "entryDate",
      sorter: (a, b) => a.entryDate.localeCompare(b.entryDate),
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("accounting.je.type", lang),
      dataIndex: "entryType",
      render: (v: JournalEntryType) => {
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
      title: t("accounting.je.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: (v: string | null) => <Text type="secondary">{v ?? "—"}</Text>,
    },
    {
      title: t("accounting.je.totalDebit", lang),
      dataIndex: "totalDebit",
      sorter: (a, b) => (a.totalDebit ?? 0) - (b.totalDebit ?? 0),
      render: (v: number) => (
        <Text strong>
          {(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: t("accounting.je.totalCredit", lang),
      dataIndex: "totalCredit",
      sorter: (a, b) => (a.totalCredit ?? 0) - (b.totalCredit ?? 0),
      render: (v: number) => (
        <Text strong>
          {(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: t("accounting.je.status", lang),
      dataIndex: "status",
      render: (v: JournalEntryStatus) => {
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
        const isDraft = rec.status === JournalEntryStatus.DRAFT;
        const isPosted = rec.status === JournalEntryStatus.POSTED;

        const items = [
          {
            key: "view",
            label: t("accounting.je.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isDraft
            ? [
                {
                  key: "edit",
                  label: t("accounting.je.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => openEdit(rec),
                },
              ]
            : []),
          { type: "divider" as const, key: "d1" },
          ...(isDraft
            ? [
                {
                  key: "post",
                  label: t("accounting.je.postAction", lang),
                  icon: <SendOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.je.postAction", lang),
                      content: t("accounting.je.postConfirm", lang),
                      onOk: () => postMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isPosted
            ? [
                {
                  key: "reverse",
                  label: t("accounting.je.reverseAction", lang),
                  icon: <UndoOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.je.reverseAction", lang),
                      content: t("accounting.je.reverseConfirm", lang),
                      onOk: () => reverseMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isDraft
            ? [
                { type: "divider" as const, key: "d2" },
                {
                  key: "delete",
                  label: t("accounting.je.delete", lang),
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.je.delete", lang),
                      content: t("accounting.je.delete", lang) + "?",
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

  // ── Lines table columns for modal ──────────────────────────────────────

  const lineColumns: TableColumnsType<LineRow> = [
    {
      title: t("accounting.je.account", lang),
      dataIndex: "accountId",
      width: 220,
      render: (_, rec) => (
        <Select
          showSearch
          optionFilterProp="label"
          placeholder={t("accounting.je.account", lang)}
          value={rec.accountId || undefined}
          onChange={v => updateLine(rec.key, "accountId", v)}
          options={accountOptions}
          style={{ width: "100%" }}
          size="small"
        />
      ),
    },
    {
      title: t("accounting.je.costCenter", lang),
      dataIndex: "costCenterId",
      width: 180,
      render: (_, rec) => (
        <Select
          showSearch
          allowClear
          optionFilterProp="label"
          placeholder={t("accounting.je.costCenter", lang)}
          value={rec.costCenterId || undefined}
          onChange={v => updateLine(rec.key, "costCenterId", v)}
          options={costCenterOptions}
          style={{ width: "100%" }}
          size="small"
        />
      ),
    },
    {
      title: t("accounting.je.debit", lang),
      dataIndex: "debit",
      width: 120,
      render: (_, rec) => (
        <InputNumber
          min={0}
          precision={2}
          value={rec.debit}
          onChange={v => updateLine(rec.key, "debit", v ?? 0)}
          style={{ width: "100%" }}
          size="small"
        />
      ),
    },
    {
      title: t("accounting.je.credit", lang),
      dataIndex: "credit",
      width: 120,
      render: (_, rec) => (
        <InputNumber
          min={0}
          precision={2}
          value={rec.credit}
          onChange={v => updateLine(rec.key, "credit", v ?? 0)}
          style={{ width: "100%" }}
          size="small"
        />
      ),
    },
    {
      title: t("accounting.je.description", lang),
      dataIndex: "description",
      render: (_, rec) => (
        <Input
          value={rec.description}
          onChange={e => updateLine(rec.key, "description", e.target.value)}
          size="small"
        />
      ),
    },
    {
      title: "",
      width: 40,
      render: (_, rec) =>
        lines.length > 2 ? (
          <Button
            type="text"
            danger
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => removeLine(rec.key)}
          />
        ) : null,
    },
  ];

  // ── Read-only lines for drawer ─────────────────────────────────────────

  const viewLineColumns: TableColumnsType<JournalLine> = [
    {
      title: t("accounting.je.account", lang),
      render: (_, rec) => (
        <Text>
          {rec.accountCode} -{" "}
          {lang === "ar" ? rec.accountNameAr : rec.accountNameEn}
        </Text>
      ),
    },
    {
      title: t("accounting.je.debit", lang),
      dataIndex: "debit",
      render: (v: number) =>
        (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    {
      title: t("accounting.je.credit", lang),
      dataIndex: "credit",
      render: (v: number) =>
        (v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    },
    {
      title: t("accounting.je.description", lang),
      dataIndex: "description",
      render: (v: string | null) => v ?? "—",
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
      currentPage="JournalEntries"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.je.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("accounting.je.totalEntries", lang),
              value: kpiTotal,
              suffix: t("accounting.je.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("accounting.je.draftEntries", lang),
              value: kpiDraft,
              suffix: t("accounting.je.draft", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("accounting.je.postedEntries", lang),
              value: kpiPosted,
              suffix: t("accounting.je.posted", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("accounting.je.thisMonth", lang),
              value: kpiThisMonth,
              suffix: now.format("MMMM YYYY"),
              icon: <CalendarOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
              color: undefined,
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
                      styles={{ content: {
                        fontSize: 24,
                        lineHeight: 1,
                        color: s.color ?? "inherit",
                      } }}
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
              <Input
                prefix={
                  <SearchOutlined
                    style={{ color: token.colorTextQuaternary }}
                  />
                }
                placeholder={t("accounting.je.number", lang) + "..."}
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                allowClear
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
                    label: t("accounting.je.allStatuses", lang),
                  },
                  {
                    value: JournalEntryStatus.DRAFT,
                    label: t("accounting.je.draft", lang),
                  },
                  {
                    value: JournalEntryStatus.POSTED,
                    label: t("accounting.je.posted", lang),
                  },
                  {
                    value: JournalEntryStatus.REVERSED,
                    label: t("accounting.je.reversed", lang),
                  },
                ]}
              />
              <Select
                value={typeFilter}
                onChange={v => {
                  setTypeFilter(v);
                  setPage(1);
                }}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("accounting.je.allTypes", lang),
                  },
                  {
                    value: JournalEntryType.MANUAL,
                    label: t("accounting.je.manual", lang),
                  },
                  {
                    value: JournalEntryType.OPENING,
                    label: t("accounting.je.opening", lang),
                  },
                  {
                    value: JournalEntryType.CLOSING,
                    label: t("accounting.je.closing", lang),
                  },
                  {
                    value: JournalEntryType.REVERSAL,
                    label: t("accounting.je.reversal", lang),
                  },
                ]}
              />
              <DatePicker.RangePicker
                value={dateRange}
                onChange={v => {
                  setDateRange(v);
                  setPage(1);
                }}
                style={{ width: isMobile ? "100%" : undefined }}
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
                {t("accounting.je.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={entries}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalRecords,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["5", "10", "25", "50"],
              onChange: (p, s) => {
                setPage(p);
                setLimit(s);
              },
            }}
            locale={{
              emptyText: t("accounting.je.title", lang) + " — 0",
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
          editingEntry
            ? t("accounting.je.updated", lang)
            : t("accounting.je.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 900}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingEntry ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingEntry
                ? `${t("accounting.je.edit", lang)} — ${editingEntry.entryNumber}`
                : t("accounting.je.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.je.date", lang)}
                name="entryDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={t("accounting.je.type", lang)} name="entryType">
                <Select
                  disabled={!!editingEntry}
                  options={[
                    {
                      value: JournalEntryType.MANUAL,
                      label: t("accounting.je.manual", lang),
                    },
                    {
                      value: JournalEntryType.OPENING,
                      label: t("accounting.je.opening", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.je.description", lang)}
                name="description"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Lines table */}
        <Text strong style={{ display: "block", marginBottom: 8 }}>
          {t("accounting.je.linesTitle", lang)}
        </Text>
        <Table
          rowKey="key"
          columns={lineColumns}
          dataSource={lines}
          pagination={false}
          size="small"
          scroll={{ x: "max-content" }}
        />
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setLines(prev => [...prev, emptyLine()])}
          style={{ width: "100%", marginTop: 8 }}
        >
          {t("accounting.je.addLine", lang)}
        </Button>

        {/* Balance check row */}
        <Row
          gutter={16}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: isBalanced ? "#f0fdf4" : "#fef2f2",
            borderRadius: 6,
            border: `1px solid ${isBalanced ? "#bbf7d0" : "#fecaca"}`,
          }}
        >
          <Col span={12}>
            <Text strong>
              {t("accounting.je.totalDebit", lang)}:{" "}
              {totalDebit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Col>
          <Col span={12} style={{ textAlign: "end" }}>
            <Text strong>
              {t("accounting.je.totalCredit", lang)}:{" "}
              {totalCredit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Col>
          {!isBalanced && (
            <Col span={24}>
              <Text type="danger" style={{ fontSize: 12 }}>
                {t("accounting.je.lineMustBalance", lang)}
              </Text>
            </Col>
          )}
        </Row>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewEntry(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewEntry
            ? `${t("accounting.je.view", lang)} — ${viewEntry.entryNumber}`
            : ""
        }
      >
        {viewEntry && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("accounting.je.number", lang)}</Text>
                <br />
                <Text strong>{viewEntry.entryNumber}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.je.date", lang)}</Text>
                <br />
                <Text strong>
                  {dayjs(viewEntry.entryDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.je.type", lang)}</Text>
                <br />
                {TYPE_TAG[viewEntry.entryType] && (
                  <Tag
                    color={TYPE_TAG[viewEntry.entryType].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(TYPE_TAG[viewEntry.entryType].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.je.status", lang)}</Text>
                <br />
                {viewEntry.status && STATUS_TAG[viewEntry.status] && (
                  <Tag
                    color={STATUS_TAG[viewEntry.status].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(STATUS_TAG[viewEntry.status].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={24}>
                <Text type="secondary">
                  {t("accounting.je.description", lang)}
                </Text>
                <br />
                <Text>{viewEntry.description ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.je.totalDebit", lang)}
                </Text>
                <br />
                <Text strong>
                  {(viewEntry.totalDebit ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.je.totalCredit", lang)}
                </Text>
                <br />
                <Text strong>
                  {(viewEntry.totalCredit ?? 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Col>
            </Row>

            <Text strong style={{ display: "block", marginTop: 8 }}>
              {t("accounting.je.linesTitle", lang)}
            </Text>
            <Table
              rowKey="id"
              columns={viewLineColumns}
              dataSource={viewEntry.lines ?? []}
              pagination={false}
              size="small"
              scroll={{ x: "max-content" }}
            />

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              {viewEntry.status === JournalEntryStatus.DRAFT && (
                <Popconfirm
                  title={t("accounting.je.postConfirm", lang)}
                  onConfirm={() => {
                    postMutation.mutate(viewEntry.id);
                    setDrawerOpen(false);
                  }}
                >
                  <Button type="primary" icon={<SendOutlined />}>
                    {t("accounting.je.postAction", lang)}
                  </Button>
                </Popconfirm>
              )}
              {viewEntry.status === JournalEntryStatus.POSTED && (
                <Popconfirm
                  title={t("accounting.je.reverseConfirm", lang)}
                  onConfirm={() => {
                    reverseMutation.mutate(viewEntry.id);
                    setDrawerOpen(false);
                  }}
                >
                  <Button danger icon={<UndoOutlined />}>
                    {t("accounting.je.reverseAction", lang)}
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
