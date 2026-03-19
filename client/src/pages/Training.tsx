import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { trainingService, employeesService } from "@/services/hr.service";
import { TrainingStatus, TrainingType } from "@/constants/enums";
import type {
  TrainingRecord,
  CreateTrainingDto,
  UpdateTrainingDto,
  HrDropdownItem,
} from "@/types/modules/hr";
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
  DatePicker,
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
  ClockCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [TrainingStatus.PLANNED]: "blue",
  [TrainingStatus.IN_PROGRESS]: "gold",
  [TrainingStatus.COMPLETED]: "green",
  [TrainingStatus.CANCELLED]: "red",
};

const TYPE_COLOR: Record<string, string> = {
  [TrainingType.INTERNAL]: "cyan",
  [TrainingType.EXTERNAL]: "purple",
  [TrainingType.ONLINE]: "geekblue",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Training() {
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
  const [editingRecord, setEditingRecord] = useState<TrainingRecord | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<TrainingRecord | null>(null);

  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: trainingRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.TRAINING],
    queryFn: () => trainingService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allRecords: TrainingRecord[] = useMemo(() => {
    const raw = trainingRaw as Record<string, unknown> | undefined;
    return (raw?.data as TrainingRecord[]) ?? [];
  }, [trainingRaw]);

  const { data: employeesDropdown } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES_DROPDOWN],
    queryFn: () => employeesService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  const employeeOptions = useMemo(() => {
    const list = (employeesDropdown as HrDropdownItem[] | undefined) ?? [];
    return list.map(e => ({
      value: e.id,
      label: getName(e),
    }));
  }, [employeesDropdown]);

  // ── Filtered data ────────────────────────────────────────────────────────
  const records = useMemo(() => {
    let filtered = [...allRecords];
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          r.courseName.toLowerCase().includes(q) ||
          (r.provider ?? "").toLowerCase().includes(q) ||
          (r.employeeNameEn ?? "").toLowerCase().includes(q) ||
          (r.employeeNameAr ?? "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allRecords, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allRecords.length;
  const kpiPlanned = allRecords.filter(
    r => r.status === TrainingStatus.PLANNED
  ).length;
  const kpiInProgress = allRecords.filter(
    r => r.status === TrainingStatus.IN_PROGRESS
  ).length;
  const kpiCompleted = allRecords.filter(
    r => r.status === TrainingStatus.COMPLETED
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRAINING] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateTrainingDto) => trainingService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("hr.training.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTrainingDto }) =>
      trainingService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("hr.training.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainingService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("hr.training.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: TrainingStatus.PLANNED,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (record: TrainingRecord) => {
      setEditingRecord(record);
      form.setFieldsValue({
        employeeId: record.employeeId,
        courseName: record.courseName,
        provider: record.provider ?? undefined,
        trainingType: record.trainingType ?? undefined,
        startDate: record.startDate ? dayjs(record.startDate) : undefined,
        endDate: record.endDate ? dayjs(record.endDate) : undefined,
        durationHours: record.durationHours ?? undefined,
        status: record.status ?? TrainingStatus.PLANNED,
        score: record.score ?? undefined,
        cost: record.cost ? Number(record.cost) : undefined,
        certificateNumber: record.certificateNumber ?? undefined,
        notes: record.notes ?? undefined,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((record: TrainingRecord) => {
    setViewRecord(record);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        employeeId: values.employeeId,
        courseName: values.courseName,
        provider: values.provider,
        trainingType: values.trainingType,
        startDate: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: values.endDate
          ? dayjs(values.endDate).format("YYYY-MM-DD")
          : undefined,
        durationHours: values.durationHours,
        status: values.status,
        score: values.score,
        cost: values.cost,
        certificateNumber: values.certificateNumber,
        notes: values.notes,
      };

      if (editingRecord) {
        updateMutation.mutate({
          id: editingRecord.id,
          dto: { ...payload, version: editingRecord.version ?? 0 },
        });
      } else {
        createMutation.mutate(payload as CreateTrainingDto);
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<TrainingRecord> = [
    {
      title: t("hr.training.employee", lang),
      dataIndex: "employeeNameEn",
      sorter: (a, b) =>
        (a.employeeNameEn ?? "").localeCompare(b.employeeNameEn ?? ""),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {lang === "ar"
            ? (rec.employeeNameAr ?? rec.employeeNameEn ?? "—")
            : (rec.employeeNameEn ?? rec.employeeNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("hr.training.courseName", lang),
      dataIndex: "courseName",
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: t("hr.training.provider", lang),
      dataIndex: "provider",
      render: (v: string | undefined) => (
        <Text>{v ?? <Text type="secondary">—</Text>}</Text>
      ),
    },
    {
      title: t("hr.training.trainingType", lang),
      dataIndex: "trainingType",
      render: (v: string | undefined) =>
        v ? (
          <Tag
            color={TYPE_COLOR[v] ?? "default"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v.replace(/_/g, " ")}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("hr.training.dates", lang),
      key: "dates",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      render: (_, rec) => (
        <Text>
          {dayjs(rec.startDate).format("YYYY-MM-DD")}
          {rec.endDate ? ` — ${dayjs(rec.endDate).format("YYYY-MM-DD")}` : ""}
        </Text>
      ),
    },
    {
      title: t("hr.training.status", lang),
      dataIndex: "status",
      render: (v: string | undefined) =>
        v ? (
          <Tag
            color={STATUS_COLOR[v] ?? "default"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v.replace(/_/g, " ")}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("hr.training.score", lang),
      dataIndex: "score",
      sorter: (a, b) => (a.score ?? 0) - (b.score ?? 0),
      render: (v: number | undefined) =>
        v != null ? (
          <Text style={{ fontFamily: "monospace" }}>{v}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: t("hr.training.cost", lang),
      dataIndex: "cost",
      sorter: (a, b) => Number(a.cost ?? 0) - Number(b.cost ?? 0),
      render: (v: number | undefined) =>
        v != null ? (
          <Text style={{ fontFamily: "monospace" }}>
            {Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
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
            label: t("hr.training.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("hr.training.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("hr.training.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("hr.training.delete", lang),
                content: t("hr.training.deleteConfirm", lang),
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
      currentPage="Training"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "#" },
        { label: t("hr.training.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("hr.training.total", lang),
              value: kpiTotal,
              suffix: t("hr.training.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("hr.training.totalPlanned", lang),
              value: kpiPlanned,
              suffix: t("hr.training.planned", lang),
              icon: <CalendarOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
            },
            {
              title: t("hr.training.totalInProgress", lang),
              value: kpiInProgress,
              suffix: t("hr.training.inProgress", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("hr.training.totalCompleted", lang),
              value: kpiCompleted,
              suffix: t("hr.training.completed", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
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
                      precision={0}
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
              <Input.Search
                placeholder={t("hr.training.search", lang)}
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
                    label: t("hr.training.allStatuses", lang),
                  },
                  {
                    value: TrainingStatus.PLANNED,
                    label: t("hr.training.planned", lang),
                  },
                  {
                    value: TrainingStatus.IN_PROGRESS,
                    label: t("hr.training.inProgress", lang),
                  },
                  {
                    value: TrainingStatus.COMPLETED,
                    label: t("hr.training.completed", lang),
                  },
                  {
                    value: TrainingStatus.CANCELLED,
                    label: t("hr.training.cancelled", lang),
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
                {t("hr.training.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={records}
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
              emptyText: t("hr.training.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingRecord
            ? t("hr.training.edit", lang)
            : t("hr.training.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 700}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingRecord ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingRecord
                ? `${t("hr.training.edit", lang)} — ${editingRecord.courseName}`
                : t("hr.training.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.training.employee", lang)}
                name="employeeId"
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="—"
                  options={employeeOptions}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.training.courseName", lang)}
                name="courseName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.training.provider", lang)}
                name="provider"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.training.trainingType", lang)}
                name="trainingType"
              >
                <Select
                  allowClear
                  options={Object.values(TrainingType).map(v => ({
                    value: v,
                    label: v.replace(/_/g, " "),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.training.startDate", lang)}
                name="startDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("hr.training.endDate", lang)} name="endDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.training.durationHours", lang)}
                name="durationHours"
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={t("hr.training.status", lang)} name="status">
                <Select
                  options={Object.values(TrainingStatus).map(v => ({
                    value: v,
                    label: v.replace(/_/g, " "),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={t("hr.training.score", lang)} name="score">
                <InputNumber style={{ width: "100%" }} min={0} max={100} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item label={t("hr.training.cost", lang)} name="cost">
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.training.certificateNumber", lang)}
                name="certificateNumber"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label={t("hr.training.notes", lang)} name="notes">
                <Input.TextArea rows={3} />
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
          setViewRecord(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewRecord
            ? `${t("hr.training.details", lang)} — ${viewRecord.courseName}`
            : ""
        }
      >
        {viewRecord && (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            {/* Status highlight */}
            <Card
              size="small"
              styles={{
                body: { padding: "16px 20px", textAlign: "center" },
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("hr.training.status", lang)}
              </Text>
              <Tag
                color={STATUS_COLOR[viewRecord.status ?? ""] ?? "default"}
                style={{
                  borderRadius: 20,
                  padding: "4px 16px",
                  fontSize: 16,
                }}
              >
                {(viewRecord.status ?? "—").replace(/_/g, " ")}
              </Tag>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.employee", lang)}</Text>
                <br />
                <Text strong>
                  {lang === "ar"
                    ? (viewRecord.employeeNameAr ??
                      viewRecord.employeeNameEn ??
                      "—")
                    : (viewRecord.employeeNameEn ??
                      viewRecord.employeeNameAr ??
                      "—")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.training.courseName", lang)}
                </Text>
                <br />
                <Text strong>{viewRecord.courseName}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.provider", lang)}</Text>
                <br />
                <Text>{viewRecord.provider ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.training.trainingType", lang)}
                </Text>
                <br />
                {viewRecord.trainingType ? (
                  <Tag
                    color={TYPE_COLOR[viewRecord.trainingType] ?? "default"}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {viewRecord.trainingType.replace(/_/g, " ")}
                  </Tag>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.startDate", lang)}</Text>
                <br />
                <Text strong>
                  {dayjs(viewRecord.startDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.endDate", lang)}</Text>
                <br />
                <Text>
                  {viewRecord.endDate
                    ? dayjs(viewRecord.endDate).format("YYYY-MM-DD")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.training.durationHours", lang)}
                </Text>
                <br />
                <Text>{viewRecord.durationHours ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.score", lang)}</Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewRecord.score ?? "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.training.cost", lang)}</Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewRecord.cost
                    ? Number(viewRecord.cost).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.training.certificateNumber", lang)}
                </Text>
                <br />
                <Text>{viewRecord.certificateNumber ?? "—"}</Text>
              </Col>
              {viewRecord.notes && (
                <Col span={24}>
                  <Text type="secondary">{t("hr.training.notes", lang)}</Text>
                  <br />
                  <Text>{viewRecord.notes}</Text>
                </Col>
              )}
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewRecord);
                }}
              >
                {t("hr.training.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("hr.training.delete", lang),
                    content: t("hr.training.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewRecord.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("hr.training.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
