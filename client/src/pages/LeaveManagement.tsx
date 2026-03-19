import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { leavesService, employeesService } from "@/services/hr.service";
import { leaveTypesService } from "@/services/definitions.service";
import { LeaveStatus } from "@/constants/enums";
import type {
  LeaveRequest,
  CreateLeaveDto,
  LeaveTypeConfig,
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
  Switch,
  DatePicker,
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
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_COLOR_MAP: Record<string, string> = {
  [LeaveStatus.PENDING]: "gold",
  [LeaveStatus.APPROVED]: "green",
  [LeaveStatus.REJECTED]: "red",
  [LeaveStatus.CANCELLED]: "default",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function LeaveManagement() {
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

  // ── State ──────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchText, setSearchText] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState<LeaveRequest | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: leavesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.LEAVES],
    queryFn: () => leavesService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allLeaves: LeaveRequest[] = useMemo(() => {
    const raw = leavesRaw as Record<string, unknown> | undefined;
    return (raw?.data as LeaveRequest[]) ?? [];
  }, [leavesRaw]);

  const { data: employeesDropdown } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES_DROPDOWN],
    queryFn: () => employeesService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  const employeeOptions = useMemo(
    () =>
      (employeesDropdown ?? []).map(e => ({
        value: e.id,
        label: getName(e),
      })),
    [employeesDropdown]
  );

  const { data: leaveTypesRaw } = useQuery({
    queryKey: [QUERY_KEYS.LEAVE_TYPES],
    queryFn: () => leaveTypesService.list({ limit: 100 }),
    staleTime: 60_000,
  });

  const leaveTypesList: LeaveTypeConfig[] = useMemo(() => {
    const raw = leaveTypesRaw as Record<string, unknown> | undefined;
    return (raw?.data as LeaveTypeConfig[]) ?? [];
  }, [leaveTypesRaw]);

  const leaveTypeOptions = useMemo(
    () =>
      leaveTypesList.map(lt => ({
        value: lt.id,
        label: getName(lt),
      })),
    [leaveTypesList]
  );

  // ── Filtered data ────────────────────────────────────────────────────────
  const leaves = useMemo(() => {
    let filtered = [...allLeaves];

    if (statusFilter !== "all") {
      filtered = filtered.filter(l => l.status === statusFilter);
    }

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        l =>
          (l.employeeNameEn ?? "").toLowerCase().includes(q) ||
          (l.employeeNameAr ?? "").toLowerCase().includes(q) ||
          (l.leaveTypeNameEn ?? "").toLowerCase().includes(q) ||
          (l.leaveTypeNameAr ?? "").toLowerCase().includes(q)
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf("day");
      const end = dateRange[1].endOf("day");
      filtered = filtered.filter(l => {
        const lStart = dayjs(l.startDate);
        return (
          lStart.isAfter(start.subtract(1, "day")) &&
          lStart.isBefore(end.add(1, "day"))
        );
      });
    }

    return filtered;
  }, [allLeaves, statusFilter, searchText, dateRange]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allLeaves.length;
  const kpiPending = allLeaves.filter(
    l => l.status === LeaveStatus.PENDING
  ).length;
  const kpiApproved = allLeaves.filter(
    l => l.status === LeaveStatus.APPROVED
  ).length;
  const kpiRejected = allLeaves.filter(
    l => l.status === LeaveStatus.REJECTED
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LEAVES] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateLeaveDto) => leavesService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("hr.leaves.created", lang) });
      invalidate();
      closeDrawer();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => leavesService.approve(id),
    onSuccess: () => {
      notification.success({ message: t("hr.leaves.approved", lang) });
      invalidate();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      leavesService.reject(id, reason),
    onSuccess: () => {
      notification.success({ message: t("hr.leaves.rejected", lang) });
      invalidate();
      closeRejectModal();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => leavesService.cancel(id),
    onSuccess: () => {
      notification.success({ message: t("hr.leaves.cancelled", lang) });
      invalidate();
    },
  });

  // ── Drawer helpers ─────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({ isHalfDay: false });
    setDrawerOpen(true);
  }, [form]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    form.resetFields();
  }, [form]);

  const openView = useCallback((leave: LeaveRequest) => {
    setViewLeave(leave);
    setViewDrawerOpen(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModalOpen(false);
    setRejectingId(null);
    setRejectionReason("");
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const dto: CreateLeaveDto = {
        employeeId: values.employeeId,
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        isHalfDay: values.isHalfDay ?? false,
        reason: values.reason,
      };
      createMutation.mutate(dto);
    } catch {
      // form validation failed
    }
  };

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleApprove = (id: string) => {
    Modal.confirm({
      title: t("hr.leaves.approveConfirmTitle", lang),
      content: t("hr.leaves.approveConfirmContent", lang),
      okText: t("hr.leaves.approve", lang),
      onOk: () => approveMutation.mutate(id),
    });
  };

  const handleRejectOpen = (id: string) => {
    setRejectingId(id);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectingId) return;
    rejectMutation.mutate({
      id: rejectingId,
      reason: rejectionReason.trim() || undefined,
    });
  };

  const handleCancel = (id: string) => {
    Modal.confirm({
      title: t("hr.leaves.cancelConfirmTitle", lang),
      content: t("hr.leaves.cancelConfirmContent", lang),
      okButtonProps: { danger: true },
      onOk: () => cancelMutation.mutate(id),
    });
  };

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: TableColumnsType<LeaveRequest> = [
    {
      title: t("hr.leaves.employee", lang),
      dataIndex: "employeeNameEn",
      sorter: (a, b) => {
        const aName =
          lang === "ar" ? (a.employeeNameAr ?? "") : (a.employeeNameEn ?? "");
        const bName =
          lang === "ar" ? (b.employeeNameAr ?? "") : (b.employeeNameEn ?? "");
        return aName.localeCompare(bName);
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
      title: t("hr.leaves.leaveType", lang),
      dataIndex: "leaveTypeNameEn",
      render: (_, rec) => (
        <Text>
          {lang === "ar"
            ? (rec.leaveTypeNameAr ?? rec.leaveTypeNameEn ?? "—")
            : (rec.leaveTypeNameEn ?? rec.leaveTypeNameAr ?? "—")}
        </Text>
      ),
    },
    {
      title: t("hr.leaves.startDate", lang),
      dataIndex: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "—"}</Text>
      ),
    },
    {
      title: t("hr.leaves.endDate", lang),
      dataIndex: "endDate",
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "—"}</Text>
      ),
    },
    {
      title: t("hr.leaves.daysRequested", lang),
      dataIndex: "daysRequested",
      sorter: (a, b) => Number(a.daysRequested) - Number(b.daysRequested),
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {Number(v ?? 0)}
        </Text>
      ),
    },
    {
      title: t("hr.leaves.halfDay", lang),
      dataIndex: "isHalfDay",
      render: (v: boolean) =>
        v ? (
          <Tag color="blue" style={{ borderRadius: 20, padding: "2px 10px" }}>
            {t("hr.leaves.yes", lang)}
          </Tag>
        ) : (
          <Text type="secondary">{t("hr.leaves.no", lang)}</Text>
        ),
    },
    {
      title: t("hr.leaves.status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={STATUS_COLOR_MAP[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {t(`hr.leaves.status_${v}`, lang)}
        </Tag>
      ),
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const isPending = rec.status === LeaveStatus.PENDING;
        const isApproved = rec.status === LeaveStatus.APPROVED;

        const items = [
          {
            key: "view",
            label: t("hr.leaves.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          ...(isPending
            ? [
                {
                  key: "approve",
                  label: t("hr.leaves.approve", lang),
                  icon: <CheckCircleOutlined />,
                  onClick: () => handleApprove(rec.id),
                },
                {
                  key: "reject",
                  label: t("hr.leaves.reject", lang),
                  icon: <CloseCircleOutlined />,
                  danger: true,
                  onClick: () => handleRejectOpen(rec.id),
                },
              ]
            : []),
          ...(isPending || isApproved
            ? [
                { type: "divider" as const, key: "d1" },
                {
                  key: "cancel",
                  label: t("hr.leaves.cancel", lang),
                  icon: <StopOutlined />,
                  danger: true,
                  onClick: () => handleCancel(rec.id),
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

  // ── Gradient header style for drawer ───────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="LeaveManagement"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("hr.title", lang), href: "#" },
        { label: t("hr.leaves.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("hr.leaves.totalRequests", lang),
              value: kpiTotal,
              suffix: t("hr.leaves.requests", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("hr.leaves.pendingRequests", lang),
              value: kpiPending,
              suffix: t("hr.leaves.status_pending", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#d97706",
              iconBg: "#d9770615",
              color: "#d97706",
            },
            {
              title: t("hr.leaves.approvedRequests", lang),
              value: kpiApproved,
              suffix: t("hr.leaves.status_approved", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("hr.leaves.rejectedRequests", lang),
              value: kpiRejected,
              suffix: t("hr.leaves.status_rejected", lang),
              icon: <CloseCircleOutlined />,
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
              <Input.Search
                placeholder={t("hr.leaves.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <RangePicker
                value={dateRange}
                onChange={val => setDateRange(val)}
                style={{ width: isMobile ? "100%" : 240 }}
              />
              <Select
                value={statusFilter}
                onChange={v => setStatusFilter(v)}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  {
                    value: "all",
                    label: t("hr.leaves.allStatuses", lang),
                  },
                  {
                    value: LeaveStatus.PENDING,
                    label: t("hr.leaves.status_pending", lang),
                  },
                  {
                    value: LeaveStatus.APPROVED,
                    label: t("hr.leaves.status_approved", lang),
                  },
                  {
                    value: LeaveStatus.REJECTED,
                    label: t("hr.leaves.status_rejected", lang),
                  },
                  {
                    value: LeaveStatus.CANCELLED,
                    label: t("hr.leaves.status_cancelled", lang),
                  },
                ]}
              />
            </Space>

            <Space>
              <Tooltip title={t("hr.leaves.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("hr.leaves.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={leaves}
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
              emptyText: t("hr.leaves.title", lang) + " — 0",
            }}
          />
        </Card>
      </Space>

      {/* ── Create Drawer ──────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        width={isMobile ? "100%" : 520}
        title={null}
        footer={
          <div style={{ textAlign: "end" }}>
            <Space>
              <Button onClick={closeDrawer}>
                {t("hr.leaves.cancelBtn", lang)}
              </Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={createMutation.isPending}
              >
                {t("hr.leaves.submit", lang)}
              </Button>
            </Space>
          </div>
        }
        destroyOnClose
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            <PlusOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("hr.leaves.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label={t("hr.leaves.employee", lang)}
            name="employeeId"
            rules={[
              {
                required: true,
                message: t("hr.leaves.employeeRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("hr.leaves.selectEmployee", lang)}
              options={employeeOptions}
            />
          </Form.Item>

          <Form.Item
            label={t("hr.leaves.leaveType", lang)}
            name="leaveTypeId"
            rules={[
              {
                required: true,
                message: t("hr.leaves.leaveTypeRequired", lang),
              },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("hr.leaves.selectLeaveType", lang)}
              options={leaveTypeOptions}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.leaves.startDate", lang)}
                name="startDate"
                rules={[
                  {
                    required: true,
                    message: t("hr.leaves.startDateRequired", lang),
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.leaves.endDate", lang)}
                name="endDate"
                rules={[
                  {
                    required: true,
                    message: t("hr.leaves.endDateRequired", lang),
                  },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("hr.leaves.halfDay", lang)}
            name="isHalfDay"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item label={t("hr.leaves.reason", lang)} name="reason">
            <Input.TextArea
              rows={3}
              placeholder={t("hr.leaves.reasonPlaceholder", lang)}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ── View Detail Drawer ─────────────────────────────────────────── */}
      <Drawer
        open={viewDrawerOpen}
        onClose={() => {
          setViewDrawerOpen(false);
          setViewLeave(null);
        }}
        width={isMobile ? "100%" : 520}
        title={
          viewLeave
            ? `${t("hr.leaves.details", lang)} — ${lang === "ar" ? (viewLeave.employeeNameAr ?? viewLeave.employeeNameEn ?? "") : (viewLeave.employeeNameEn ?? viewLeave.employeeNameAr ?? "")}`
            : ""
        }
      >
        {viewLeave && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Status highlight */}
            <Card
              size="small"
              styles={{
                body: { padding: "16px 20px", textAlign: "center" },
              }}
            >
              <Tag
                color={STATUS_COLOR_MAP[viewLeave.status] ?? "default"}
                style={{ borderRadius: 20, padding: "4px 16px", fontSize: 14 }}
              >
                {t(`hr.leaves.status_${viewLeave.status}`, lang)}
              </Tag>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("hr.leaves.employee", lang)}</Text>
                <br />
                <Text strong>
                  {lang === "ar"
                    ? (viewLeave.employeeNameAr ??
                      viewLeave.employeeNameEn ??
                      "—")
                    : (viewLeave.employeeNameEn ??
                      viewLeave.employeeNameAr ??
                      "—")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.leaves.leaveType", lang)}</Text>
                <br />
                <Text strong>
                  {lang === "ar"
                    ? (viewLeave.leaveTypeNameAr ??
                      viewLeave.leaveTypeNameEn ??
                      "—")
                    : (viewLeave.leaveTypeNameEn ??
                      viewLeave.leaveTypeNameAr ??
                      "—")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.leaves.startDate", lang)}</Text>
                <br />
                <Text strong>
                  {viewLeave.startDate
                    ? dayjs(viewLeave.startDate).format("YYYY-MM-DD")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.leaves.endDate", lang)}</Text>
                <br />
                <Text strong>
                  {viewLeave.endDate
                    ? dayjs(viewLeave.endDate).format("YYYY-MM-DD")
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.leaves.daysRequested", lang)}
                </Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {Number(viewLeave.daysRequested ?? 0)}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.leaves.halfDay", lang)}</Text>
                <br />
                {viewLeave.isHalfDay ? (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("hr.leaves.yes", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">{t("hr.leaves.no", lang)}</Text>
                )}
              </Col>
              {viewLeave.reason && (
                <Col span={24}>
                  <Text type="secondary">{t("hr.leaves.reason", lang)}</Text>
                  <br />
                  <Text>{viewLeave.reason}</Text>
                </Col>
              )}
              {viewLeave.rejectionReason && (
                <Col span={24}>
                  <Text type="secondary">
                    {t("hr.leaves.rejectionReason", lang)}
                  </Text>
                  <br />
                  <Text type="danger">{viewLeave.rejectionReason}</Text>
                </Col>
              )}
              {viewLeave.approvedByNameEn && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("hr.leaves.approvedBy", lang)}
                  </Text>
                  <br />
                  <Text>
                    {lang === "ar"
                      ? (viewLeave.approvedByNameAr ??
                        viewLeave.approvedByNameEn)
                      : (viewLeave.approvedByNameEn ??
                        viewLeave.approvedByNameAr)}
                  </Text>
                </Col>
              )}
              {viewLeave.approvedAt && (
                <Col span={12}>
                  <Text type="secondary">
                    {t("hr.leaves.approvedAt", lang)}
                  </Text>
                  <br />
                  <Text>
                    {dayjs(viewLeave.approvedAt).format("YYYY-MM-DD HH:mm")}
                  </Text>
                </Col>
              )}
              {viewLeave.createdAt && (
                <Col span={12}>
                  <Text type="secondary">{t("hr.leaves.createdAt", lang)}</Text>
                  <br />
                  <Text>
                    {dayjs(viewLeave.createdAt).format("YYYY-MM-DD HH:mm")}
                  </Text>
                </Col>
              )}
            </Row>

            {/* Action buttons */}
            {(viewLeave.status === LeaveStatus.PENDING ||
              viewLeave.status === LeaveStatus.APPROVED) && (
              <Space style={{ marginTop: 16 }}>
                {viewLeave.status === LeaveStatus.PENDING && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setViewDrawerOpen(false);
                        handleApprove(viewLeave.id);
                      }}
                    >
                      {t("hr.leaves.approve", lang)}
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => {
                        setViewDrawerOpen(false);
                        handleRejectOpen(viewLeave.id);
                      }}
                    >
                      {t("hr.leaves.reject", lang)}
                    </Button>
                  </>
                )}
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => {
                    setViewDrawerOpen(false);
                    handleCancel(viewLeave.id);
                  }}
                >
                  {t("hr.leaves.cancel", lang)}
                </Button>
              </Space>
            )}
          </Space>
        )}
      </Drawer>

      {/* ── Reject Modal ───────────────────────────────────────────────── */}
      <Modal
        open={rejectModalOpen}
        onCancel={closeRejectModal}
        onOk={handleRejectConfirm}
        okText={t("hr.leaves.reject", lang)}
        okButtonProps={{ danger: true }}
        confirmLoading={rejectMutation.isPending}
        title={t("hr.leaves.rejectConfirmTitle", lang)}
        destroyOnHidden
      >
        <div style={{ marginBottom: 12 }}>
          <Text>{t("hr.leaves.rejectConfirmContent", lang)}</Text>
        </div>
        <Input.TextArea
          rows={3}
          value={rejectionReason}
          onChange={e => setRejectionReason(e.target.value)}
          placeholder={t("hr.leaves.rejectionReasonPlaceholder", lang)}
        />
      </Modal>
    </DashboardLayout>
  );
}
