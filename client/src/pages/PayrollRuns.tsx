import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { payrollRunsService, employeesService } from "@/services/hr.service";
import { PayrollStatus } from "@/constants/enums";
import type {
  PayrollRun,
  PayrollItem,
  CreatePayrollRunDto,
  AddPayrollItemDto,
} from "@/types/modules/hr";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import dayjs from "dayjs";
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
  InputNumber,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [PayrollStatus.DRAFT]: "blue",
  [PayrollStatus.CONFIRMED]: "gold",
  [PayrollStatus.APPROVED]: "green",
  [PayrollStatus.PAID]: "cyan",
};

function formatCurrency(value: number | string | undefined): string {
  const num = Number(value ?? 0);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPeriod(start: string, end: string): string {
  return `${dayjs(start).format("YYYY-MM-DD")} — ${dayjs(end).format("YYYY-MM-DD")}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PayrollRuns() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ──────────────────────────────────────────────────────────────
  const [searchText, setSearchText] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [createForm] = Form.useForm();
  const [addItemForm] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────

  const {
    data: runsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.PAYROLL_RUNS],
    queryFn: () => payrollRunsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allRuns: PayrollRun[] = useMemo(() => {
    return ((runsRaw as Record<string, unknown>)?.data as PayrollRun[]) ?? [];
  }, [runsRaw]);

  // ── Detail query for selected run ──────────────────────────────────────

  const { data: runDetail, isLoading: isDetailLoading } = useQuery({
    queryKey: [QUERY_KEYS.PAYROLL_RUNS, selectedRun?.id],
    queryFn: () => payrollRunsService.get(selectedRun!.id),
    enabled: !!selectedRun?.id && drawerOpen,
    staleTime: 15_000,
  });

  const detailRun: PayrollRun | null = useMemo(() => {
    if (!runDetail) return selectedRun;
    return runDetail as PayrollRun;
  }, [runDetail, selectedRun]);

  const detailItems: PayrollItem[] = useMemo(() => {
    return detailRun?.items ?? [];
  }, [detailRun]);

  // ── Employee dropdown for Add Item ─────────────────────────────────────

  const { data: employeeDropdown } = useQuery({
    queryKey: [QUERY_KEYS.PAYROLL_RUNS, "employee-dropdown"],
    queryFn: () => employeesService.dropdown({ limit: 100 }),
    staleTime: 60_000,
    enabled: addItemModalOpen,
  });

  const employeeOptions = useMemo(() => {
    const list =
      (employeeDropdown as { id: string; nameEn: string; nameAr: string }[]) ??
      [];
    return list.map(e => ({
      value: e.id,
      label: getName(e),
    }));
  }, [employeeDropdown]);

  // ── Filtered list ──────────────────────────────────────────────────────

  const filteredRuns = useMemo(() => {
    let filtered = [...allRuns];
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          r.periodStart.toLowerCase().includes(q) ||
          r.periodEnd.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          (r.notes ?? "").toLowerCase().includes(q)
      );
    }
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf("day");
      const end = dateRange[1].endOf("day");
      filtered = filtered.filter(r => {
        const ps = dayjs(r.periodStart);
        return (
          ps.isAfter(start.subtract(1, "day")) && ps.isBefore(end.add(1, "day"))
        );
      });
    }
    return filtered;
  }, [allRuns, searchText, dateRange]);

  // ── KPI values ─────────────────────────────────────────────────────────

  const kpiTotal = allRuns.length;
  const kpiDraft = allRuns.filter(r => r.status === PayrollStatus.DRAFT).length;
  const kpiApproved = allRuns.filter(
    r => r.status === PayrollStatus.APPROVED
  ).length;
  const kpiPaid = allRuns.filter(r => r.status === PayrollStatus.PAID).length;

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PAYROLL_RUNS],
      }),
    [queryClient]
  );

  const createMutation = useMutation({
    mutationFn: (dto: CreatePayrollRunDto) => payrollRunsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.created", lang) });
      invalidate();
      closeCreateModal();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => payrollRunsService.confirm(id),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.confirmed", lang) });
      invalidate();
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => payrollRunsService.approve(id),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.approved", lang) });
      invalidate();
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => payrollRunsService.markPaid(id),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.paid", lang) });
      invalidate();
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ runId, dto }: { runId: string; dto: AddPayrollItemDto }) =>
      payrollRunsService.addItem(runId, dto),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.itemAdded", lang) });
      invalidate();
      closeAddItemModal();
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ runId, itemId }: { runId: string; itemId: string }) =>
      payrollRunsService.removeItem(runId, itemId),
    onSuccess: () => {
      notification.success({ message: t("hr.payroll.itemRemoved", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    createForm.resetFields();
    setCreateModalOpen(true);
  }, [createForm]);

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false);
    createForm.resetFields();
  }, [createForm]);

  const openAddItemModal = useCallback(() => {
    addItemForm.resetFields();
    setAddItemModalOpen(true);
  }, [addItemForm]);

  const closeAddItemModal = useCallback(() => {
    setAddItemModalOpen(false);
    addItemForm.resetFields();
  }, [addItemForm]);

  const openDetail = useCallback((run: PayrollRun) => {
    setSelectedRun(run);
    setDrawerOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDrawerOpen(false);
    setSelectedRun(null);
  }, []);

  // ── Submit handlers ────────────────────────────────────────────────────

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      createMutation.mutate({
        periodStart: values.periodStart.format("YYYY-MM-DD"),
        periodEnd: values.periodEnd.format("YYYY-MM-DD"),
        notes: values.notes || undefined,
      });
    } catch {
      // form validation failed
    }
  };

  const handleAddItem = async () => {
    try {
      const values = await addItemForm.validateFields();
      if (!detailRun) return;
      addItemMutation.mutate({
        runId: detailRun.id,
        dto: {
          employeeId: values.employeeId,
          basicSalary: values.basicSalary,
          housingAllowance: values.housingAllowance || undefined,
          transportationAllowance: values.transportationAllowance || undefined,
          otherAllowances: values.otherAllowances || undefined,
          otherDeductions: values.otherDeductions || undefined,
        },
      });
    } catch {
      // form validation failed
    }
  };

  // ── Status workflow actions ────────────────────────────────────────────

  const handleConfirm = useCallback(
    (id: string) => {
      Modal.confirm({
        title: t("hr.payroll.confirmAction", lang),
        content: t("hr.payroll.confirmActionDesc", lang),
        icon: <ExclamationCircleOutlined />,
        onOk: () => confirmMutation.mutate(id),
      });
    },
    [confirmMutation, lang]
  );

  const handleApprove = useCallback(
    (id: string) => {
      Modal.confirm({
        title: t("hr.payroll.approveAction", lang),
        content: t("hr.payroll.approveActionDesc", lang),
        icon: <ExclamationCircleOutlined />,
        okType: "primary",
        onOk: () => approveMutation.mutate(id),
      });
    },
    [approveMutation, lang]
  );

  const handleMarkPaid = useCallback(
    (id: string) => {
      Modal.confirm({
        title: t("hr.payroll.markPaidAction", lang),
        content: t("hr.payroll.markPaidActionDesc", lang),
        icon: <ExclamationCircleOutlined />,
        okType: "primary",
        okButtonProps: { danger: false },
        onOk: () => markPaidMutation.mutate(id),
      });
    },
    [markPaidMutation, lang]
  );

  const handleDeleteRun = useCallback(
    (id: string) => {
      Modal.confirm({
        title: t("hr.payroll.deleteRun", lang),
        content: t("hr.payroll.deleteRunDesc", lang),
        okButtonProps: { danger: true },
        onOk: async () => {
          // Draft runs can be deleted — use the API if available
          // For now we just show a message; extend when API supports delete
          notification.info({
            message: t("hr.payroll.deleteNotSupported", lang),
          });
        },
      });
    },
    [lang]
  );

  // ── Table columns ──────────────────────────────────────────────────────

  const columns: TableColumnsType<PayrollRun> = [
    {
      title: t("hr.payroll.period", lang),
      key: "period",
      sorter: (a, b) =>
        dayjs(a.periodStart).unix() - dayjs(b.periodStart).unix(),
      render: (_, rec) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {formatPeriod(rec.periodStart, rec.periodEnd)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={STATUS_COLOR[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {t(`hr.payroll.status.${v}`, lang)}
        </Tag>
      ),
    },
    {
      title: t("hr.payroll.employees", lang),
      dataIndex: "totalEmployees",
      align: "center",
      sorter: (a, b) => a.totalEmployees - b.totalEmployees,
    },
    {
      title: t("hr.payroll.totalGross", lang),
      dataIndex: "totalGross",
      align: "right",
      sorter: (a, b) => Number(a.totalGross) - Number(b.totalGross),
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: t("hr.payroll.totalDeductions", lang),
      dataIndex: "totalDeductions",
      align: "right",
      sorter: (a, b) => Number(a.totalDeductions) - Number(b.totalDeductions),
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace", color: "#ef4444" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.totalNet", lang),
      dataIndex: "totalNet",
      align: "right",
      sorter: (a, b) => Number(a.totalNet) - Number(b.totalNet),
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace", color: "#10b981" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.gosiEmployer", lang),
      dataIndex: "totalGosiEmployer",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: "",
      align: "center",
      width: 60,
      render: (_, rec) => {
        const items = [];

        items.push({
          key: "view",
          label: t("hr.payroll.view", lang),
          icon: <EyeOutlined />,
          onClick: () => openDetail(rec),
        });

        if (rec.status === PayrollStatus.DRAFT) {
          items.push({
            key: "confirm",
            label: t("hr.payroll.confirm", lang),
            icon: <CheckCircleOutlined />,
            onClick: () => handleConfirm(rec.id),
          });
          items.push({ type: "divider" as const, key: "d1" });
          items.push({
            key: "delete",
            label: t("hr.payroll.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => handleDeleteRun(rec.id),
          });
        }

        if (rec.status === PayrollStatus.CONFIRMED) {
          items.push({
            key: "approve",
            label: t("hr.payroll.approve", lang),
            icon: <SafetyCertificateOutlined />,
            onClick: () => handleApprove(rec.id),
          });
        }

        if (rec.status === PayrollStatus.APPROVED) {
          items.push({
            key: "markPaid",
            label: t("hr.payroll.markPaid", lang),
            icon: <DollarOutlined />,
            onClick: () => handleMarkPaid(rec.id),
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  // ── Detail items table columns ─────────────────────────────────────────

  const itemColumns: TableColumnsType<PayrollItem> = [
    {
      title: t("hr.payroll.employeeName", lang),
      key: "employeeName",
      render: (_, rec) => (
        <Text strong>
          {getName({
            nameEn: rec.employeeNameEn ?? "",
            nameAr: rec.employeeNameAr ?? "",
          })}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.basicSalary", lang),
      dataIndex: "basicSalary",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: t("hr.payroll.housingAllowance", lang),
      dataIndex: "housingAllowance",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: t("hr.payroll.transportAllowance", lang),
      dataIndex: "transportationAllowance",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    {
      title: t("hr.payroll.grossSalary", lang),
      dataIndex: "grossSalary",
      align: "right",
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.gosiEmployee", lang),
      dataIndex: "gosiEmployee",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace", color: "#ef4444" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.otherDeductions", lang),
      dataIndex: "otherDeductions",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace", color: "#ef4444" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.totalDeductions", lang),
      dataIndex: "totalDeductions",
      align: "right",
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace", color: "#ef4444" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.netPay", lang),
      dataIndex: "netPay",
      align: "right",
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace", color: "#10b981" }}>
          {formatCurrency(v)}
        </Text>
      ),
    },
    {
      title: t("hr.payroll.gosiEmployer", lang),
      dataIndex: "gosiEmployer",
      align: "right",
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{formatCurrency(v)}</Text>
      ),
    },
    ...(detailRun?.status === PayrollStatus.DRAFT
      ? [
          {
            title: "",
            align: "center" as const,
            width: 60,
            render: (_: unknown, rec: PayrollItem) => (
              <Tooltip title={t("hr.payroll.removeItem", lang)}>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: t("hr.payroll.removeItem", lang),
                      content: t("hr.payroll.removeItemDesc", lang),
                      okButtonProps: { danger: true },
                      onOk: () =>
                        removeItemMutation.mutate({
                          runId: detailRun!.id,
                          itemId: rec.id,
                        }),
                    });
                  }}
                />
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  // ── Gradient header style for modals ───────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  // ── Detail summary values ──────────────────────────────────────────────

  const detailTotalEmployees = detailRun?.totalEmployees ?? 0;
  const detailTotalGross = Number(detailRun?.totalGross ?? 0);
  const detailTotalDeductions = Number(detailRun?.totalDeductions ?? 0);
  const detailTotalNet = Number(detailRun?.totalNet ?? 0);
  const detailTotalGosi = Number(detailRun?.totalGosiEmployer ?? 0);

  return (
    <DashboardLayout
      currentPage="PayrollRuns"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: t("hr.title", lang), href: "#" },
        { label: t("hr.payroll.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("hr.payroll.totalRuns", lang),
              value: kpiTotal,
              suffix: t("hr.payroll.runs", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("hr.payroll.status.draft", lang),
              value: kpiDraft,
              suffix: t("hr.payroll.runs", lang),
              icon: <FileTextOutlined />,
              iconColor: "#3B82F6",
              iconBg: "#3B82F615",
              color: "#3B82F6",
            },
            {
              title: t("hr.payroll.status.approved", lang),
              value: kpiApproved,
              suffix: t("hr.payroll.runs", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("hr.payroll.status.paid", lang),
              value: kpiPaid,
              suffix: t("hr.payroll.runs", lang),
              icon: <DollarOutlined />,
              iconColor: "#06b6d4",
              iconBg: "#06b6d415",
              color: "#06b6d4",
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

        {/* ── Toolbar Card ─────────────────────────────────────────── */}
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
                placeholder={t("hr.payroll.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <DatePicker.RangePicker
                value={dateRange}
                onChange={dates => setDateRange(dates)}
                style={{ width: 260 }}
              />
            </Space>

            <Space>
              <Tooltip title={t("hr.payroll.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
              >
                {t("hr.payroll.createRun", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredRuns}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            onRow={record => ({
              onClick: () => openDetail(record),
              style: { cursor: "pointer" },
            })}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} of ${total}`,
              pageSizeOptions: ["5", "10", "25", "50"],
            }}
            locale={{
              emptyText: t("hr.payroll.noRuns", lang),
            }}
          />
        </Card>
      </Space>

      {/* ── Create Run Modal ───────────────────────────────────────── */}
      <Modal
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={handleCreate}
        okText={t("hr.payroll.createRun", lang)}
        confirmLoading={createMutation.isPending}
        width={isMobile ? "95vw" : 520}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        <div style={gradientHeader}>
          <Space>
            <PlusOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("hr.payroll.createRun", lang)}
            </span>
          </Space>
        </div>

        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.periodStart", lang)}
                name="periodStart"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.periodEnd", lang)}
                name="periodEnd"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label={t("hr.payroll.notes", lang)} name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Detail Drawer ──────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDetail}
        width={isMobile ? "100%" : "85%"}
        title={
          detailRun
            ? `${t("hr.payroll.runDetail", lang)} — ${formatPeriod(detailRun.periodStart, detailRun.periodEnd)}`
            : ""
        }
        extra={
          detailRun && (
            <Space>
              <Tag
                color={STATUS_COLOR[detailRun.status] ?? "default"}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {t(`hr.payroll.status.${detailRun.status}`, lang)}
              </Tag>
              {detailRun.status === PayrollStatus.DRAFT && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleConfirm(detailRun.id)}
                  loading={confirmMutation.isPending}
                >
                  {t("hr.payroll.confirm", lang)}
                </Button>
              )}
              {detailRun.status === PayrollStatus.CONFIRMED && (
                <Button
                  type="primary"
                  icon={<SafetyCertificateOutlined />}
                  onClick={() => handleApprove(detailRun.id)}
                  loading={approveMutation.isPending}
                >
                  {t("hr.payroll.approve", lang)}
                </Button>
              )}
              {detailRun.status === PayrollStatus.APPROVED && (
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => handleMarkPaid(detailRun.id)}
                  loading={markPaidMutation.isPending}
                >
                  {t("hr.payroll.markPaid", lang)}
                </Button>
              )}
            </Space>
          )
        }
      >
        {detailRun && (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            {/* ── Summary Cards ───────────────────────────────────── */}
            <Row gutter={[16, 16]}>
              {[
                {
                  title: t("hr.payroll.employees", lang),
                  value: detailTotalEmployees,
                  precision: 0,
                  icon: <TeamOutlined />,
                  iconColor: token.colorPrimary,
                  iconBg: `${token.colorPrimary}15`,
                  color: undefined,
                },
                {
                  title: t("hr.payroll.totalGross", lang),
                  value: detailTotalGross,
                  precision: 2,
                  icon: <DollarOutlined />,
                  iconColor: "#6366f1",
                  iconBg: "#6366f115",
                  color: undefined,
                },
                {
                  title: t("hr.payroll.totalDeductions", lang),
                  value: detailTotalDeductions,
                  precision: 2,
                  icon: <DeleteOutlined />,
                  iconColor: "#ef4444",
                  iconBg: "#ef444415",
                  color: "#ef4444",
                },
                {
                  title: t("hr.payroll.totalNet", lang),
                  value: detailTotalNet,
                  precision: 2,
                  icon: <DollarOutlined />,
                  iconColor: "#10b981",
                  iconBg: "#10b98115",
                  color: "#10b981",
                },
                {
                  title: t("hr.payroll.gosiEmployer", lang),
                  value: detailTotalGosi,
                  precision: 2,
                  icon: <SafetyCertificateOutlined />,
                  iconColor: "#f59e0b",
                  iconBg: "#f59e0b15",
                  color: "#f59e0b",
                },
              ].map(s => (
                <Col key={s.title} xs={24} sm={12} lg={4}>
                  <Card
                    size="small"
                    styles={{ body: { padding: "12px 16px" } }}
                  >
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
                            fontSize: 11,
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {s.title}
                        </Text>
                        <Statistic
                          value={s.value}
                          precision={s.precision}
                          valueStyle={{
                            fontSize: 20,
                            lineHeight: 1,
                            color: s.color ?? "inherit",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: s.iconBg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
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

            {/* ── Notes ─────────────────────────────────────────── */}
            {detailRun.notes && (
              <Card size="small">
                <Text type="secondary">{t("hr.payroll.notes", lang)}: </Text>
                <Text>{detailRun.notes}</Text>
              </Card>
            )}

            {/* ── Items toolbar ────────────────────────────────── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                {t("hr.payroll.items", lang)}
              </Text>
              {detailRun.status === PayrollStatus.DRAFT && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={openAddItemModal}
                >
                  {t("hr.payroll.addItem", lang)}
                </Button>
              )}
            </div>

            {/* ── Items Table ──────────────────────────────────── */}
            <Card styles={{ body: { padding: 0 } }}>
              <Table
                rowKey="id"
                columns={itemColumns}
                dataSource={detailItems}
                loading={isDetailLoading}
                size="small"
                scroll={{ x: "max-content" }}
                pagination={false}
                locale={{
                  emptyText: t("hr.payroll.noItems", lang),
                }}
              />
            </Card>
          </Space>
        )}
      </Drawer>

      {/* ── Add Item Modal ─────────────────────────────────────────── */}
      <Modal
        open={addItemModalOpen}
        onCancel={closeAddItemModal}
        onOk={handleAddItem}
        okText={t("hr.payroll.addItem", lang)}
        confirmLoading={addItemMutation.isPending}
        width={isMobile ? "95vw" : 560}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        <div style={gradientHeader}>
          <Space>
            <UserAddOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {t("hr.payroll.addItem", lang)}
            </span>
          </Space>
        </div>

        <Form form={addItemForm} layout="vertical">
          <Form.Item
            label={t("hr.payroll.employeeName", lang)}
            name="employeeId"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("hr.payroll.selectEmployee", lang)}
              options={employeeOptions}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.basicSalary", lang)}
                name="basicSalary"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.housingAllowance", lang)}
                name="housingAllowance"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.transportAllowance", lang)}
                name="transportationAllowance"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.payroll.otherAllowances", lang)}
                name="otherAllowances"
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t("hr.payroll.otherDeductions", lang)}
            name="otherDeductions"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
