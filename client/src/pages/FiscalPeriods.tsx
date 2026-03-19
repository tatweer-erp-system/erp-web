import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { fiscalPeriodsService } from "@/services/accounting.service";
import { FiscalPeriodStatus, FiscalPeriodType } from "@/constants/enums";
import type {
  FiscalPeriod,
  CreateFiscalPeriodDto,
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
  EditOutlined,
  MoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
  StopOutlined,
  UnlockOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Tag config maps ─────────────────────────────────────────────────────────

const STATUS_TAG: Record<
  FiscalPeriodStatus,
  { color: string; i18nKey: string }
> = {
  [FiscalPeriodStatus.OPEN]: {
    color: "green",
    i18nKey: "accounting.fp.open",
  },
  [FiscalPeriodStatus.CLOSED]: {
    color: "orange",
    i18nKey: "accounting.fp.closed",
  },
  [FiscalPeriodStatus.LOCKED]: {
    color: "red",
    i18nKey: "accounting.fp.locked",
  },
};

const TYPE_TAG: Record<FiscalPeriodType, { color: string; i18nKey: string }> = {
  [FiscalPeriodType.MONTHLY]: {
    color: "blue",
    i18nKey: "accounting.fp.monthly",
  },
  [FiscalPeriodType.QUARTERLY]: {
    color: "purple",
    i18nKey: "accounting.fp.quarterly",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function FiscalPeriods() {
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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<FiscalPeriod | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewPeriod, setViewPeriod] = useState<FiscalPeriod | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: periodsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.FISCAL_PERIODS],
    queryFn: () => fiscalPeriodsService.list(),
    staleTime: 30_000,
  });

  const allPeriods: FiscalPeriod[] = periodsRaw ?? [];

  // ── Derived: available years for dropdown ────────────────────────────────
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(allPeriods.map(p => p.fiscalYear))).sort(
      (a, b) => b - a
    );
    return years;
  }, [allPeriods]);

  // ── Filtered data ────────────────────────────────────────────────────────
  const periods = useMemo(() => {
    let filtered = [...allPeriods];
    if (yearFilter !== "all") {
      filtered = filtered.filter(p => p.fiscalYear === Number(yearFilter));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    // Sort: fiscalYear DESC, periodNumber ASC
    filtered.sort((a, b) => {
      if (a.fiscalYear !== b.fiscalYear) return b.fiscalYear - a.fiscalYear;
      return a.periodNumber - b.periodNumber;
    });
    return filtered;
  }, [allPeriods, yearFilter, statusFilter]);

  // ── KPI values (computed from ALL data, not filtered) ───────────────────
  const kpiTotal = allPeriods.length;
  const kpiOpen = allPeriods.filter(
    p => p.status === FiscalPeriodStatus.OPEN
  ).length;
  const kpiClosed = allPeriods.filter(
    p => p.status === FiscalPeriodStatus.CLOSED
  ).length;
  const kpiLocked = allPeriods.filter(
    p => p.status === FiscalPeriodStatus.LOCKED
  ).length;

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FISCAL_PERIODS] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateFiscalPeriodDto) =>
      fiscalPeriodsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.fp.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Partial<CreateFiscalPeriodDto>;
    }) => fiscalPeriodsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("accounting.fp.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.close(id),
    onSuccess: () => {
      notification.success({
        message: t("accounting.fp.closedSuccess", lang),
      });
      invalidate();
    },
  });

  const reopenMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.reopen(id),
    onSuccess: () => {
      notification.success({
        message: t("accounting.fp.reopenedSuccess", lang),
      });
      invalidate();
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.lock(id),
    onSuccess: () => {
      notification.success({
        message: t("accounting.fp.lockedSuccess", lang),
      });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingPeriod(null);
    form.resetFields();
    form.setFieldsValue({ periodType: FiscalPeriodType.MONTHLY });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (period: FiscalPeriod) => {
      setEditingPeriod(period);
      form.setFieldsValue({
        fiscalYear: period.fiscalYear,
        periodNumber: period.periodNumber,
        periodType: period.periodType,
        nameEn: period.nameEn,
        nameAr: period.nameAr,
        startDate: dayjs(period.startDate),
        endDate: dayjs(period.endDate),
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingPeriod(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((period: FiscalPeriod) => {
    setViewPeriod(period);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingPeriod) {
        updateMutation.mutate({
          id: editingPeriod.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            startDate: values.startDate.format("YYYY-MM-DD"),
            endDate: values.endDate.format("YYYY-MM-DD"),
          },
        });
      } else {
        createMutation.mutate({
          fiscalYear: values.fiscalYear,
          periodNumber: values.periodNumber,
          periodType: values.periodType,
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          startDate: values.startDate.format("YYYY-MM-DD"),
          endDate: values.endDate.format("YYYY-MM-DD"),
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<FiscalPeriod> = [
    {
      title: t("accounting.fp.name", lang),
      dataIndex: "nameEn",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {getName(rec)}
        </Text>
      ),
    },
    {
      title: t("accounting.fp.fiscalYear", lang),
      dataIndex: "fiscalYear",
      sorter: (a, b) => a.fiscalYear - b.fiscalYear,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("accounting.fp.periodNumber", lang),
      dataIndex: "periodNumber",
      sorter: (a, b) => a.periodNumber - b.periodNumber,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("accounting.fp.periodType", lang),
      dataIndex: "periodType",
      render: (v: FiscalPeriodType) => {
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
      title: t("accounting.fp.startDate", lang),
      dataIndex: "startDate",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("accounting.fp.endDate", lang),
      dataIndex: "endDate",
      sorter: (a, b) => a.endDate.localeCompare(b.endDate),
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("accounting.fp.status", lang),
      dataIndex: "status",
      render: (v: FiscalPeriodStatus) => {
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
        const isOpen = rec.status === FiscalPeriodStatus.OPEN;
        const isClosed = rec.status === FiscalPeriodStatus.CLOSED;
        const isLocked = rec.status === FiscalPeriodStatus.LOCKED;

        const items = [
          {
            key: "view",
            label: t("accounting.fp.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isOpen
            ? [
                {
                  key: "edit",
                  label: t("accounting.fp.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => openEdit(rec),
                },
              ]
            : []),
          { type: "divider" as const, key: "d1" },
          ...(isOpen
            ? [
                {
                  key: "close",
                  label: t("accounting.fp.closeAction", lang),
                  icon: <StopOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.fp.closeAction", lang),
                      content: t("accounting.fp.closeConfirm", lang),
                      onOk: () => closeMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(isClosed
            ? [
                {
                  key: "reopen",
                  label: t("accounting.fp.reopenAction", lang),
                  icon: <UnlockOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.fp.reopenAction", lang),
                      content: t("accounting.fp.reopenConfirm", lang),
                      onOk: () => reopenMutation.mutate(rec.id),
                    });
                  },
                },
              ]
            : []),
          ...(!isLocked
            ? [
                { type: "divider" as const, key: "d2" },
                {
                  key: "lock",
                  label: t("accounting.fp.lockAction", lang),
                  danger: true,
                  icon: <LockOutlined />,
                  onClick: () => {
                    Modal.confirm({
                      title: t("accounting.fp.lockAction", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("accounting.fp.lockConfirm", lang),
                      okButtonProps: { danger: true },
                      onOk: () => lockMutation.mutate(rec.id),
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
      currentPage="FiscalPeriods"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.fp.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("accounting.fp.total", lang),
              value: kpiTotal,
              suffix: t("accounting.fp.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("accounting.fp.totalOpen", lang),
              value: kpiOpen,
              suffix: t("accounting.fp.open", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("accounting.fp.totalClosed", lang),
              value: kpiClosed,
              suffix: t("accounting.fp.closed", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("accounting.fp.totalLocked", lang),
              value: kpiLocked,
              suffix: t("accounting.fp.locked", lang),
              icon: <LockOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
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
              <Select
                value={yearFilter}
                onChange={v => setYearFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("accounting.fp.allYears", lang),
                  },
                  ...availableYears.map(y => ({
                    value: String(y),
                    label: String(y),
                  })),
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
                    label: t("accounting.fp.allStatuses", lang),
                  },
                  {
                    value: FiscalPeriodStatus.OPEN,
                    label: t("accounting.fp.open", lang),
                  },
                  {
                    value: FiscalPeriodStatus.CLOSED,
                    label: t("accounting.fp.closed", lang),
                  },
                  {
                    value: FiscalPeriodStatus.LOCKED,
                    label: t("accounting.fp.locked", lang),
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
                {t("accounting.fp.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={periods}
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
              emptyText: t("accounting.fp.title", lang) + " — 0",
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
          editingPeriod
            ? t("accounting.fp.edit", lang)
            : t("accounting.fp.new", lang)
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
            {editingPeriod ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingPeriod
                ? `${t("accounting.fp.edit", lang)} — ${getName(editingPeriod)}`
                : t("accounting.fp.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.fp.fiscalYear", lang)}
                name="fiscalYear"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={2000}
                  max={2100}
                  style={{ width: "100%" }}
                  disabled={!!editingPeriod}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.fp.periodNumber", lang)}
                name="periodNumber"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={12}
                  style={{ width: "100%" }}
                  disabled={!!editingPeriod}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("accounting.fp.periodType", lang)}
                name="periodType"
              >
                <Select
                  disabled={!!editingPeriod}
                  options={[
                    {
                      value: FiscalPeriodType.MONTHLY,
                      label: t("accounting.fp.monthly", lang),
                    },
                    {
                      value: FiscalPeriodType.QUARTERLY,
                      label: t("accounting.fp.quarterly", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.fp.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.fp.nameAr", lang)}
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
                label={t("accounting.fp.startDate", lang)}
                name="startDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("accounting.fp.endDate", lang)}
                name="endDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
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
          setViewPeriod(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewPeriod
            ? `${t("accounting.fp.view", lang)} — ${getName(viewPeriod)}`
            : ""
        }
      >
        {viewPeriod && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("accounting.fp.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewPeriod.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.fp.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewPeriod.nameAr}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.fp.fiscalYear", lang)}
                </Text>
                <br />
                <Text strong>{viewPeriod.fiscalYear}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.fp.periodNumber", lang)}
                </Text>
                <br />
                <Text strong>{viewPeriod.periodNumber}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.fp.periodType", lang)}
                </Text>
                <br />
                {TYPE_TAG[viewPeriod.periodType] && (
                  <Tag
                    color={TYPE_TAG[viewPeriod.periodType].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(TYPE_TAG[viewPeriod.periodType].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.fp.status", lang)}</Text>
                <br />
                {STATUS_TAG[viewPeriod.status] && (
                  <Tag
                    color={STATUS_TAG[viewPeriod.status].color}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t(STATUS_TAG[viewPeriod.status].i18nKey, lang)}
                  </Tag>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("accounting.fp.startDate", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewPeriod.startDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("accounting.fp.endDate", lang)}</Text>
                <br />
                <Text strong>
                  {dayjs(viewPeriod.endDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              {viewPeriod.closedAt && (
                <>
                  <Col span={12}>
                    <Text type="secondary">Closed At</Text>
                    <br />
                    <Text>
                      {dayjs(viewPeriod.closedAt).format("YYYY-MM-DD HH:mm")}
                    </Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">Closed By</Text>
                    <br />
                    <Text>{viewPeriod.closedBy ?? "—"}</Text>
                  </Col>
                </>
              )}
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              {viewPeriod.status === FiscalPeriodStatus.OPEN && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setDrawerOpen(false);
                    openEdit(viewPeriod);
                  }}
                >
                  {t("accounting.fp.edit", lang)}
                </Button>
              )}
              {viewPeriod.status === FiscalPeriodStatus.OPEN && (
                <Button
                  type="primary"
                  icon={<StopOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("accounting.fp.closeAction", lang),
                      content: t("accounting.fp.closeConfirm", lang),
                      onOk: () => {
                        closeMutation.mutate(viewPeriod.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("accounting.fp.closeAction", lang)}
                </Button>
              )}
              {viewPeriod.status === FiscalPeriodStatus.CLOSED && (
                <Button
                  icon={<UnlockOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("accounting.fp.reopenAction", lang),
                      content: t("accounting.fp.reopenConfirm", lang),
                      onOk: () => {
                        reopenMutation.mutate(viewPeriod.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("accounting.fp.reopenAction", lang)}
                </Button>
              )}
              {viewPeriod.status !== FiscalPeriodStatus.LOCKED && (
                <Button
                  danger
                  icon={<LockOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("accounting.fp.lockAction", lang),
                      icon: <ExclamationCircleOutlined />,
                      content: t("accounting.fp.lockConfirm", lang),
                      okButtonProps: { danger: true },
                      onOk: () => {
                        lockMutation.mutate(viewPeriod.id);
                        setDrawerOpen(false);
                      },
                    });
                  }}
                >
                  {t("accounting.fp.lockAction", lang)}
                </Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
