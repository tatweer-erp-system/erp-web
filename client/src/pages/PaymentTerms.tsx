import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { paymentTermsService } from "@/services/accounting.service";
import { PaymentTermLineType } from "@/constants/enums";
import type {
  PaymentTerm,
  PaymentTermLine,
  CreatePaymentTermDto,
  UpdatePaymentTermDto,
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
  InputNumber,
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
  MinusCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const LINE_TYPE_TAG: Record<
  PaymentTermLineType,
  { color: string; i18nKey: string }
> = {
  [PaymentTermLineType.PERCENT]: {
    color: "blue",
    i18nKey: "accounting.pt.percent",
  },
  [PaymentTermLineType.FIXED]: {
    color: "orange",
    i18nKey: "accounting.pt.fixed",
  },
  [PaymentTermLineType.BALANCE]: {
    color: "green",
    i18nKey: "accounting.pt.balance",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PaymentTerms() {
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
  const [editingTerm, setEditingTerm] = useState<PaymentTerm | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewTerm, setViewTerm] = useState<PaymentTerm | null>(null);
  const [lines, setLines] = useState<Omit<PaymentTermLine, "id">[]>([]);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: termsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_TERMS_LIST],
    queryFn: () => paymentTermsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allTerms: PaymentTerm[] = useMemo(
    () => ((termsRaw as Record<string, unknown>)?.data as PaymentTerm[]) ?? [],
    [termsRaw]
  );

  // ── Filtered data ──────────────────────────────────────────────────────
  const terms = useMemo(() => {
    let filtered = [...allTerms];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(t => t.isActive === isActive);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        t =>
          t.nameEn.toLowerCase().includes(q) ||
          t.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allTerms, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allTerms.length;
  const kpiActive = allTerms.filter(t => t.isActive !== false).length;
  const kpiInactive = allTerms.filter(t => t.isActive === false).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.PAYMENT_TERMS_LIST],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreatePaymentTermDto) => paymentTermsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.pt.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePaymentTermDto }) =>
      paymentTermsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.pt.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paymentTermsService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("accounting.pt.deleted", lang) });
      invalidate();
    },
  });

  // ── Lines helpers ──────────────────────────────────────────────────────

  const addLine = useCallback(() => {
    setLines(prev => [
      ...prev,
      {
        sequence: prev.length + 1,
        type: PaymentTermLineType.PERCENT,
        value: 0,
        days: 0,
      },
    ]);
  }, []);

  const removeLine = useCallback((idx: number) => {
    setLines(prev =>
      prev
        .filter((_, i) => i !== idx)
        .map((l, i) => ({ ...l, sequence: i + 1 }))
    );
  }, []);

  const updateLine = useCallback(
    (idx: number, field: string, value: unknown) => {
      setLines(prev =>
        prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
      );
    },
    []
  );

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingTerm(null);
    form.resetFields();
    setLines([]);
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (term: PaymentTerm) => {
      setEditingTerm(term);
      form.setFieldsValue({
        nameEn: term.nameEn,
        nameAr: term.nameAr,
        note: term.note ?? undefined,
      });
      setLines(
        (term.lines ?? []).map(l => ({
          sequence: l.sequence,
          type: l.type,
          value: l.value,
          days: l.days,
          dayOfMonth: l.dayOfMonth,
        }))
      );
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTerm(null);
    form.resetFields();
    setLines([]);
  }, [form]);

  const openView = useCallback((term: PaymentTerm) => {
    setViewTerm(term);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTerm) {
        updateMutation.mutate({
          id: editingTerm.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            note: values.note,
            lines: lines.length > 0 ? lines : undefined,
            version: editingTerm.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          note: values.note,
          lines: lines.length > 0 ? lines : undefined,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<PaymentTerm> = [
    {
      title: t("accounting.pt.nameEn", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {getName(rec)}
        </Text>
      ),
    },
    {
      title: t("accounting.pt.note", lang),
      dataIndex: "note",
      render: (v: string | null | undefined) =>
        v ? (
          <Text
            type="secondary"
            ellipsis={{ tooltip: v }}
            style={{ maxWidth: 200, display: "inline-block" }}
          >
            {v}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("accounting.pt.lines", lang),
      dataIndex: "lines",
      render: (_: unknown, rec: PaymentTerm) => {
        const count = rec.lines?.length ?? 0;
        return (
          <Text>
            {count} {t("accounting.pt.installments", lang)}
          </Text>
        );
      },
    },
    {
      title: t("accounting.pt.isActive", lang),
      dataIndex: "isActive",
      render: (v: boolean | undefined) => {
        const active = v !== false;
        return (
          <Tag
            color={active ? "green" : "red"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {active
              ? t("accounting.pt.active", lang)
              : t("accounting.pt.inactive", lang)}
          </Tag>
        );
      },
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const items = [
          {
            key: "view",
            label: t("accounting.pt.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("accounting.pt.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("accounting.pt.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("accounting.pt.delete", lang),
                content: t("accounting.pt.deleteConfirm", lang),
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

  // ── Lines table columns (for modal) ───────────────────────────────────

  const lineColumns: TableColumnsType<Omit<PaymentTermLine, "id">> = [
    {
      title: t("accounting.pt.sequence", lang),
      dataIndex: "sequence",
      width: 60,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("accounting.pt.lineType", lang),
      dataIndex: "type",
      width: 130,
      render: (_: unknown, _rec: Omit<PaymentTermLine, "id">, idx: number) => (
        <Select
          value={lines[idx]?.type}
          onChange={v => updateLine(idx, "type", v)}
          size="small"
          style={{ width: "100%" }}
          options={[
            {
              value: PaymentTermLineType.PERCENT,
              label: t("accounting.pt.percent", lang),
            },
            {
              value: PaymentTermLineType.FIXED,
              label: t("accounting.pt.fixed", lang),
            },
            {
              value: PaymentTermLineType.BALANCE,
              label: t("accounting.pt.balance", lang),
            },
          ]}
        />
      ),
    },
    {
      title: t("accounting.pt.value", lang),
      dataIndex: "value",
      width: 100,
      render: (_: unknown, _rec: Omit<PaymentTermLine, "id">, idx: number) => (
        <InputNumber
          value={lines[idx]?.value}
          onChange={v => updateLine(idx, "value", v ?? 0)}
          size="small"
          min={0}
          style={{ width: "100%" }}
          disabled={lines[idx]?.type === PaymentTermLineType.BALANCE}
        />
      ),
    },
    {
      title: t("accounting.pt.days", lang),
      dataIndex: "days",
      width: 80,
      render: (_: unknown, _rec: Omit<PaymentTermLine, "id">, idx: number) => (
        <InputNumber
          value={lines[idx]?.days}
          onChange={v => updateLine(idx, "days", v ?? 0)}
          size="small"
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: t("accounting.pt.dayOfMonth", lang),
      dataIndex: "dayOfMonth",
      width: 100,
      render: (_: unknown, _rec: Omit<PaymentTermLine, "id">, idx: number) => (
        <InputNumber
          value={lines[idx]?.dayOfMonth}
          onChange={v => updateLine(idx, "dayOfMonth", v ?? undefined)}
          size="small"
          min={1}
          max={31}
          style={{ width: "100%" }}
          placeholder="—"
        />
      ),
    },
    {
      title: "",
      width: 40,
      render: (_: unknown, _rec: Omit<PaymentTermLine, "id">, idx: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<MinusCircleOutlined />}
          onClick={() => removeLine(idx)}
        />
      ),
    },
  ];

  // ── Detail drawer lines columns ───────────────────────────────────────

  const drawerLineColumns: TableColumnsType<PaymentTermLine> = [
    {
      title: t("accounting.pt.sequence", lang),
      dataIndex: "sequence",
      width: 60,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("accounting.pt.lineType", lang),
      dataIndex: "type",
      render: (v: PaymentTermLineType) => {
        const cfg = LINE_TYPE_TAG[v];
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
      title: t("accounting.pt.value", lang),
      dataIndex: "value",
      render: (v: number, rec) =>
        rec.type === PaymentTermLineType.BALANCE ? (
          <Text type="secondary">—</Text>
        ) : rec.type === PaymentTermLineType.PERCENT ? (
          <Text>{v}%</Text>
        ) : (
          <Text>{v}</Text>
        ),
    },
    {
      title: t("accounting.pt.days", lang),
      dataIndex: "days",
      render: (v: number) => <Text>{v}</Text>,
    },
    {
      title: t("accounting.pt.dayOfMonth", lang),
      dataIndex: "dayOfMonth",
      render: (v: number | undefined) => <Text>{v != null ? v : "—"}</Text>,
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
      currentPage="PaymentTerms"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.pt.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("accounting.pt.total", lang),
              value: kpiTotal,
              suffix: t("accounting.pt.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("accounting.pt.totalActive", lang),
              value: kpiActive,
              suffix: t("accounting.pt.active", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("accounting.pt.totalInactive", lang),
              value: kpiInactive,
              suffix: t("accounting.pt.inactive", lang),
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
                placeholder={t("accounting.pt.search", lang)}
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
                    label: t("accounting.pt.allStatuses", lang),
                  },
                  {
                    value: "active",
                    label: t("accounting.pt.active", lang),
                  },
                  {
                    value: "inactive",
                    label: t("accounting.pt.inactive", lang),
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
                {t("accounting.pt.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={terms}
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
              emptyText: t("accounting.pt.title", lang) + " — 0",
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
          editingTerm
            ? t("accounting.pt.edit", lang)
            : t("accounting.pt.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 720}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingTerm ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingTerm
                ? `${t("accounting.pt.edit", lang)} — ${getName(editingTerm)}`
                : t("accounting.pt.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.pt.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.pt.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                label={t("accounting.pt.note", lang)}
                name="note"
                rules={[{ max: 500 }]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* ── Lines section ──────────────────────────────────────────── */}
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text strong>{t("accounting.pt.lines", lang)}</Text>
            <Button
              type="dashed"
              size="small"
              icon={<PlusOutlined />}
              onClick={addLine}
            >
              {t("accounting.pt.addLine", lang)}
            </Button>
          </div>
          {lines.length > 0 && (
            <Table
              rowKey={(_, idx) => String(idx)}
              columns={lineColumns}
              dataSource={lines}
              size="small"
              pagination={false}
              scroll={{ x: "max-content" }}
            />
          )}
        </div>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewTerm(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewTerm
            ? `${t("accounting.pt.details", lang)} — ${getName(viewTerm)}`
            : ""
        }
      >
        {viewTerm && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("accounting.pt.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewTerm.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.pt.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewTerm.nameAr}
                </Text>
              </Col>
              <Col span={24}>
                <Text type="secondary">{t("accounting.pt.note", lang)}</Text>
                <br />
                <Text>{viewTerm.note ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.pt.isActive", lang)}
                </Text>
                <br />
                <Tag
                  color={viewTerm.isActive !== false ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewTerm.isActive !== false
                    ? t("accounting.pt.active", lang)
                    : t("accounting.pt.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* ── Lines table in drawer ───────────────────────────────── */}
            {viewTerm.lines && viewTerm.lines.length > 0 && (
              <div>
                <Text strong style={{ display: "block", marginBottom: 8 }}>
                  {t("accounting.pt.lines", lang)} ({viewTerm.lines.length}{" "}
                  {t("accounting.pt.installments", lang)})
                </Text>
                <Table
                  rowKey={(_, idx) => String(idx)}
                  columns={drawerLineColumns}
                  dataSource={viewTerm.lines}
                  size="small"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              </div>
            )}

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewTerm);
                }}
              >
                {t("accounting.pt.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("accounting.pt.delete", lang),
                    content: t("accounting.pt.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewTerm.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("accounting.pt.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
