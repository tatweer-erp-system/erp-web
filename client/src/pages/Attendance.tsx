import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  attendanceService,
  employeesService,
  departmentsService,
} from "@/services/hr.service";
import { AttendanceStatus, AttendanceSource } from "@/constants/enums";
import type {
  AttendanceRecord,
  CreateAttendanceDto,
  UpdateAttendanceDto,
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
  DatePicker,
  TimePicker,
  Upload,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  ImportOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

const { Text } = Typography;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Attendance() {
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
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Dayjs>(dayjs());

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: attendanceRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.ATTENDANCE, dateFilter.format("YYYY-MM-DD")],
    queryFn: () =>
      attendanceService.list({
        limit: 200,
        search: dateFilter.format("YYYY-MM-DD"),
      }),
    staleTime: 30_000,
  });

  const allRecords: AttendanceRecord[] = useMemo(() => {
    const raw = attendanceRaw as Record<string, unknown> | undefined;
    return (raw?.data as AttendanceRecord[]) ?? [];
  }, [attendanceRaw]);

  const { data: employeesDropdown } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES_DROPDOWN],
    queryFn: () => employeesService.dropdown({ limit: 500 }),
    staleTime: 60_000,
  });

  const employeeOptions = useMemo(() => {
    const list = employeesDropdown ?? [];
    return list.map(e => ({
      value: e.id,
      label: getName(e),
    }));
  }, [employeesDropdown]);

  const { data: departmentsDropdown } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS_DROPDOWN],
    queryFn: () => departmentsService.dropdown({ limit: 200 }),
    staleTime: 60_000,
  });

  const departmentOptions = useMemo(() => {
    const list = departmentsDropdown ?? [];
    return [
      { value: "all", label: t("hr.attendance.allDepartments", lang) },
      ...list.map(d => ({
        value: d.id,
        label: getName(d),
      })),
    ];
  }, [departmentsDropdown, lang]);

  // ── Filtered data ──────────────────────────────────────────────────────
  const records = useMemo(() => {
    let filtered = [...allRecords];
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (departmentFilter !== "all") {
      // department filter not directly on attendance — skip if no field
      // (kept for future JOIN support)
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          (r.employeeNameEn ?? "").toLowerCase().includes(q) ||
          (r.employeeNameAr ?? "").toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allRecords, statusFilter, departmentFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────
  const kpiTotal = allRecords.length;
  const kpiPresent = allRecords.filter(
    r => r.status === AttendanceStatus.PRESENT
  ).length;
  const kpiAbsent = allRecords.filter(
    r => r.status === AttendanceStatus.ABSENT
  ).length;
  const kpiLate = allRecords.filter(
    r => r.status === AttendanceStatus.LATE
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.ATTENDANCE],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateAttendanceDto) => attendanceService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("hr.attendance.created", lang) });
      invalidate();
      closeDrawer();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAttendanceDto }) =>
      attendanceService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("hr.attendance.updated", lang) });
      invalidate();
      closeDrawer();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("hr.attendance.deleted", lang) });
      invalidate();
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => attendanceService.importRecords(file),
    onSuccess: result => {
      notification.success({
        message: t("hr.attendance.importSuccess", lang),
        description: `${result?.imported ?? 0} ${t("hr.attendance.imported", lang)}, ${result?.errors ?? 0} ${t("hr.attendance.errors", lang)}`,
      });
      invalidate();
      setImportModalOpen(false);
      setImportFile(null);
    },
  });

  // ── Drawer helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
      status: AttendanceStatus.PRESENT,
    });
    setDrawerOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (record: AttendanceRecord) => {
      setEditingRecord(record);
      form.setFieldsValue({
        employeeId: record.employeeId,
        date: record.date ? dayjs(record.date) : undefined,
        clockIn: record.clockIn ? dayjs(record.clockIn, "HH:mm") : undefined,
        clockOut: record.clockOut ? dayjs(record.clockOut, "HH:mm") : undefined,
        status: record.status,
        notes: record.notes,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const dto: CreateAttendanceDto = {
        employeeId: values.employeeId,
        date: values.date ? values.date.format("YYYY-MM-DD") : "",
        clockIn: values.clockIn ? values.clockIn.format("HH:mm") : undefined,
        clockOut: values.clockOut ? values.clockOut.format("HH:mm") : undefined,
        status: values.status,
        notes: values.notes,
        source: AttendanceSource.MANUAL,
      };

      if (editingRecord) {
        updateMutation.mutate({
          id: editingRecord.id,
          dto: {
            ...dto,
            version: editingRecord.version ?? 0,
          },
        });
      } else {
        createMutation.mutate(dto);
      }
    } catch {
      // form validation failed
    }
  };

  // ── Status helpers ───────────────────────────────────────────────────────

  const statusColorMap: Record<string, string> = {
    [AttendanceStatus.PRESENT]: "green",
    [AttendanceStatus.ABSENT]: "red",
    [AttendanceStatus.LATE]: "orange",
    [AttendanceStatus.HALF_DAY]: "blue",
  };

  const sourceColorMap: Record<string, string> = {
    [AttendanceSource.MANUAL]: "default",
    [AttendanceSource.DEVICE]: "cyan",
    [AttendanceSource.IMPORT]: "purple",
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<AttendanceRecord> = [
    {
      title: t("hr.attendance.employee", lang),
      dataIndex: "employeeNameEn",
      sorter: (a, b) => {
        const nameA =
          lang === "ar" ? (a.employeeNameAr ?? "") : (a.employeeNameEn ?? "");
        const nameB =
          lang === "ar" ? (b.employeeNameAr ?? "") : (b.employeeNameEn ?? "");
        return nameA.localeCompare(nameB);
      },
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {lang === "ar"
            ? (rec.employeeNameAr ?? rec.employeeNameEn ?? "—")
            : (rec.employeeNameEn ?? rec.employeeNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("hr.attendance.date", lang),
      dataIndex: "date",
      sorter: (a, b) => (a.date ?? "").localeCompare(b.date ?? ""),
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "—"}</Text>
      ),
    },
    {
      title: t("hr.attendance.clockIn", lang),
      dataIndex: "clockIn",
      render: (v: string | undefined) => (
        <Text style={{ fontFamily: "monospace" }}>
          {v ? dayjs(v, "HH:mm:ss").format("HH:mm") : "—"}
        </Text>
      ),
    },
    {
      title: t("hr.attendance.clockOut", lang),
      dataIndex: "clockOut",
      render: (v: string | undefined) => (
        <Text style={{ fontFamily: "monospace" }}>
          {v ? dayjs(v, "HH:mm:ss").format("HH:mm") : "—"}
        </Text>
      ),
    },
    {
      title: t("hr.attendance.workingHours", lang),
      dataIndex: "workingHours",
      sorter: (a, b) =>
        Number(a.workingHours ?? 0) - Number(b.workingHours ?? 0),
      render: (v: number | undefined) => (
        <Text style={{ fontFamily: "monospace" }}>
          {v != null ? Number(v).toFixed(1) : "—"}
        </Text>
      ),
    },
    {
      title: t("hr.attendance.lateMinutes", lang),
      dataIndex: "lateMinutes",
      sorter: (a, b) => Number(a.lateMinutes ?? 0) - Number(b.lateMinutes ?? 0),
      render: (v: number | undefined) => {
        const num = Number(v ?? 0);
        return (
          <Text
            style={{
              fontFamily: "monospace",
              color: num > 0 ? "#ef4444" : undefined,
            }}
          >
            {num > 0 ? num : "—"}
          </Text>
        );
      },
    },
    {
      title: t("hr.attendance.overtimeMinutes", lang),
      dataIndex: "overtimeMinutes",
      sorter: (a, b) =>
        Number(a.overtimeMinutes ?? 0) - Number(b.overtimeMinutes ?? 0),
      render: (v: number | undefined) => {
        const num = Number(v ?? 0);
        return (
          <Text
            style={{
              fontFamily: "monospace",
              color: num > 0 ? "#10b981" : undefined,
            }}
          >
            {num > 0 ? num : "—"}
          </Text>
        );
      },
    },
    {
      title: t("hr.attendance.status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={statusColorMap[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {t(`hr.attendance.status_${v}`, lang)}
        </Tag>
      ),
    },
    {
      title: t("hr.attendance.source", lang),
      dataIndex: "source",
      render: (v: string | undefined) =>
        v ? (
          <Tag
            color={sourceColorMap[v] ?? "default"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {t(`hr.attendance.source_${v}`, lang)}
          </Tag>
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
            key: "edit",
            label: t("hr.attendance.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("hr.attendance.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("hr.attendance.delete", lang),
                content: t("hr.attendance.deleteConfirm", lang),
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

  // ── Gradient header style for drawer ──────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="Attendance"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("hr.title", lang), href: "#" },
        { label: t("hr.attendance.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("hr.attendance.totalRecords", lang),
              value: kpiTotal,
              suffix: t("hr.attendance.records", lang),
              icon: <ClockCircleOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("hr.attendance.totalPresent", lang),
              value: kpiPresent,
              suffix: t("hr.attendance.status_present", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("hr.attendance.totalAbsent", lang),
              value: kpiAbsent,
              suffix: t("hr.attendance.status_absent", lang),
              icon: <CloseCircleOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
            {
              title: t("hr.attendance.totalLate", lang),
              value: kpiLate,
              suffix: t("hr.attendance.status_late", lang),
              icon: <WarningOutlined />,
              iconColor: "#f97316",
              iconBg: "#f9731615",
              color: "#f97316",
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
              <DatePicker
                value={dateFilter}
                onChange={v => setDateFilter(v ?? dayjs())}
                allowClear={false}
                style={{ width: 160 }}
              />
              <Input.Search
                placeholder={t("hr.attendance.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              <Select
                value={departmentFilter}
                onChange={v => setDepartmentFilter(v)}
                style={{ width: 180 }}
                suffixIcon={<FilterOutlined />}
                options={departmentOptions}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("hr.attendance.allStatuses", lang),
                  },
                  {
                    value: AttendanceStatus.PRESENT,
                    label: t("hr.attendance.status_present", lang),
                  },
                  {
                    value: AttendanceStatus.ABSENT,
                    label: t("hr.attendance.status_absent", lang),
                  },
                  {
                    value: AttendanceStatus.LATE,
                    label: t("hr.attendance.status_late", lang),
                  },
                  {
                    value: AttendanceStatus.HALF_DAY,
                    label: t("hr.attendance.status_half_day", lang),
                  },
                ]}
              />
            </Space>

            <Space>
              <Tooltip title={t("hr.attendance.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                icon={<ImportOutlined />}
                onClick={() => setImportModalOpen(true)}
              >
                {t("hr.attendance.import", lang)}
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("hr.attendance.new", lang)}
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
              pageSizeOptions: ["10", "25", "50", "100"],
            }}
            locale={{
              emptyText: t("hr.attendance.noRecords", lang),
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Drawer ──────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        width={isMobile ? "100%" : 520}
        destroyOnClose
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingRecord ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingRecord
                ? t("hr.attendance.edit", lang)
                : t("hr.attendance.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("hr.attendance.employee", lang)}
            name="employeeId"
            rules={[
              {
                required: true,
                message: t("hr.attendance.employeeRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("hr.attendance.selectEmployee", lang)}
              options={employeeOptions}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.attendance.date", lang)}
                name="date"
                rules={[
                  {
                    required: true,
                    message: t("hr.attendance.dateRequired", lang),
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.attendance.status", lang)}
                name="status"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    {
                      value: AttendanceStatus.PRESENT,
                      label: t("hr.attendance.status_present", lang),
                    },
                    {
                      value: AttendanceStatus.ABSENT,
                      label: t("hr.attendance.status_absent", lang),
                    },
                    {
                      value: AttendanceStatus.LATE,
                      label: t("hr.attendance.status_late", lang),
                    },
                    {
                      value: AttendanceStatus.HALF_DAY,
                      label: t("hr.attendance.status_half_day", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.attendance.clockIn", lang)}
                name="clockIn"
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.attendance.clockOut", lang)}
                name="clockOut"
              >
                <TimePicker format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t("hr.attendance.notes", lang)} name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Space style={{ marginTop: 16 }}>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRecord
                ? t("hr.attendance.save", lang)
                : t("hr.attendance.create", lang)}
            </Button>
            <Button onClick={closeDrawer}>
              {t("hr.attendance.cancel", lang)}
            </Button>
          </Space>
        </Form>
      </Drawer>

      {/* ── Import Modal ──────────────────────────────────────────────── */}
      <Modal
        open={importModalOpen}
        onCancel={() => {
          setImportModalOpen(false);
          setImportFile(null);
        }}
        onOk={() => {
          if (importFile) {
            importMutation.mutate(importFile);
          }
        }}
        okText={t("hr.attendance.importSubmit", lang)}
        okButtonProps={{
          disabled: !importFile,
          loading: importMutation.isPending,
        }}
        title={t("hr.attendance.importTitle", lang)}
        width={isMobile ? "95vw" : 480}
        destroyOnHidden
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Text type="secondary">
            {t("hr.attendance.importInstructions", lang)}
          </Text>
          <Upload.Dragger
            accept=".csv,.xlsx,.xls"
            maxCount={1}
            beforeUpload={file => {
              setImportFile(file);
              return false;
            }}
            onRemove={() => {
              setImportFile(null);
            }}
            fileList={
              importFile
                ? [
                    {
                      uid: "-1",
                      name: importFile.name,
                      status: "done",
                    },
                  ]
                : []
            }
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined
                style={{ fontSize: 32, color: token.colorPrimary }}
              />
            </p>
            <p className="ant-upload-text">
              {t("hr.attendance.importDragText", lang)}
            </p>
            <p className="ant-upload-hint">
              {t("hr.attendance.importHint", lang)}
            </p>
          </Upload.Dragger>
        </Space>
      </Modal>
    </DashboardLayout>
  );
}
