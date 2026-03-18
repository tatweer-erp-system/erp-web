import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { contractsService, employeesService } from "@/services/hr.service";
import { ContractStatus, ContractType, WageType } from "@/constants/enums";
import type {
  EmployeeContract,
  CreateContractDto,
  UpdateContractDto,
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
  WarningOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  [ContractStatus.DRAFT]: "blue",
  [ContractStatus.ACTIVE]: "green",
  [ContractStatus.EXPIRED]: "default",
  [ContractStatus.CANCELLED]: "red",
};

const CONTRACT_TYPE_COLOR: Record<string, string> = {
  [ContractType.FULL_TIME]: "blue",
  [ContractType.PART_TIME]: "cyan",
  [ContractType.TEMPORARY]: "orange",
  [ContractType.SEASONAL]: "purple",
};

const EXPIRY_DAYS_THRESHOLD = 30;

function isExpiringSoon(endDate?: string): boolean {
  if (!endDate) return false;
  const end = dayjs(endDate);
  const now = dayjs();
  return end.isAfter(now) && end.diff(now, "day") <= EXPIRY_DAYS_THRESHOLD;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Contracts() {
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
  const [editingContract, setEditingContract] =
    useState<EmployeeContract | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewContract, setViewContract] = useState<EmployeeContract | null>(
    null
  );

  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: contractsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.CONTRACTS],
    queryFn: () => contractsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allContracts: EmployeeContract[] = useMemo(() => {
    const raw = contractsRaw as Record<string, unknown> | undefined;
    return (raw?.data as EmployeeContract[]) ?? [];
  }, [contractsRaw]);

  const { data: employeesDropdown } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES_DROPDOWN],
    queryFn: () => employeesService.dropdown({ limit: 200 }),
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
  const contracts = useMemo(() => {
    let filtered = [...allContracts];
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      filtered = filtered.filter(
        c =>
          (c.employeeNameEn ?? "").toLowerCase().includes(q) ||
          (c.employeeNameAr ?? "").toLowerCase().includes(q) ||
          c.contractType.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allContracts, statusFilter, searchText]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────────
  const kpiTotal = allContracts.length;
  const kpiActive = allContracts.filter(
    c => c.status === ContractStatus.ACTIVE
  ).length;
  const kpiExpiringSoon = allContracts.filter(
    c => c.status === ContractStatus.ACTIVE && isExpiringSoon(c.endDate)
  ).length;
  const kpiDraft = allContracts.filter(
    c => c.status === ContractStatus.DRAFT
  ).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONTRACTS] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateContractDto) => contractsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("hr.contracts.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateContractDto }) =>
      contractsService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("hr.contracts.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractsService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("hr.contracts.deleted", lang) });
      invalidate();
    },
  });

  // ── Modal helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingContract(null);
    form.resetFields();
    form.setFieldsValue({
      status: ContractStatus.DRAFT,
      wageType: WageType.MONTHLY,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (contract: EmployeeContract) => {
      setEditingContract(contract);
      form.setFieldsValue({
        employeeId: contract.employeeId,
        contractType: contract.contractType,
        startDate: contract.startDate ? dayjs(contract.startDate) : undefined,
        endDate: contract.endDate ? dayjs(contract.endDate) : undefined,
        basicSalary: Number(contract.basicSalary ?? 0),
        housingAllowance: contract.housingAllowance
          ? Number(contract.housingAllowance)
          : undefined,
        transportationAllowance: contract.transportationAllowance
          ? Number(contract.transportationAllowance)
          : undefined,
        wageType: contract.wageType ?? WageType.MONTHLY,
        status: contract.status,
        notes: contract.notes ?? undefined,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingContract(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((contract: EmployeeContract) => {
    setViewContract(contract);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        employeeId: values.employeeId,
        contractType: values.contractType,
        startDate: values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : undefined,
        endDate: values.endDate
          ? dayjs(values.endDate).format("YYYY-MM-DD")
          : undefined,
        basicSalary: values.basicSalary,
        housingAllowance: values.housingAllowance,
        transportationAllowance: values.transportationAllowance,
        wageType: values.wageType,
        status: values.status,
        notes: values.notes,
      };

      if (editingContract) {
        updateMutation.mutate({
          id: editingContract.id,
          dto: { ...payload, version: editingContract.version ?? 0 },
        });
      } else {
        createMutation.mutate(payload as CreateContractDto);
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<EmployeeContract> = [
    {
      title: t("hr.contracts.employee", lang),
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
      title: t("hr.contracts.contractType", lang),
      dataIndex: "contractType",
      render: (v: string) => (
        <Tag
          color={CONTRACT_TYPE_COLOR[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v.replace(/_/g, " ")}
        </Tag>
      ),
    },
    {
      title: t("hr.contracts.startDate", lang),
      dataIndex: "startDate",
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "—"}</Text>
      ),
    },
    {
      title: t("hr.contracts.endDate", lang),
      dataIndex: "endDate",
      sorter: (a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""),
      render: (v: string | undefined) => {
        if (!v) return <Text type="secondary">—</Text>;
        const expiring = isExpiringSoon(v);
        return (
          <Text style={expiring ? { color: "#f97316", fontWeight: 600 } : {}}>
            {dayjs(v).format("YYYY-MM-DD")}
            {expiring && (
              <WarningOutlined style={{ marginInlineStart: 6, fontSize: 12 }} />
            )}
          </Text>
        );
      },
    },
    {
      title: t("hr.contracts.basicSalary", lang),
      dataIndex: "basicSalary",
      sorter: (a, b) => Number(a.basicSalary) - Number(b.basicSalary),
      render: (v: number) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {Number(v ?? 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      ),
    },
    {
      title: t("hr.contracts.status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={STATUS_COLOR[v] ?? "default"}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v}
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
            label: t("hr.contracts.view", lang),
            icon: <EyeOutlined />,
            onClick: () => openView(rec),
          },
          {
            key: "edit",
            label: t("hr.contracts.edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("hr.contracts.delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("hr.contracts.delete", lang),
                content: t("hr.contracts.deleteConfirm", lang),
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
      currentPage="Contracts"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "#" },
        { label: t("hr.contracts.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("hr.contracts.total", lang),
              value: kpiTotal,
              suffix: t("hr.contracts.title", lang),
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("hr.contracts.totalActive", lang),
              value: kpiActive,
              suffix: t("hr.contracts.active", lang),
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("hr.contracts.expiringSoon", lang),
              value: kpiExpiringSoon,
              suffix: t("hr.contracts.expiringSoonSuffix", lang),
              icon: <WarningOutlined />,
              iconColor: "#f97316",
              iconBg: "#f9731615",
              color: "#f97316",
            },
            {
              title: t("hr.contracts.totalDraft", lang),
              value: kpiDraft,
              suffix: t("hr.contracts.draft", lang),
              icon: <FileAddOutlined />,
              iconColor: "#3b82f6",
              iconBg: "#3b82f615",
              color: "#3b82f6",
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
                placeholder={t("hr.contracts.search", lang)}
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
                    label: t("hr.contracts.allStatuses", lang),
                  },
                  {
                    value: ContractStatus.DRAFT,
                    label: t("hr.contracts.draft", lang),
                  },
                  {
                    value: ContractStatus.ACTIVE,
                    label: t("hr.contracts.active", lang),
                  },
                  {
                    value: ContractStatus.EXPIRED,
                    label: t("hr.contracts.expired", lang),
                  },
                  {
                    value: ContractStatus.CANCELLED,
                    label: t("hr.contracts.cancelled", lang),
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
                {t("hr.contracts.new", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={contracts}
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
              emptyText: t("hr.contracts.title", lang) + " — 0",
            }}
            rowClassName={rec =>
              rec.status === ContractStatus.ACTIVE &&
              isExpiringSoon(rec.endDate)
                ? "contract-expiring-row"
                : ""
            }
          />
        </Card>
      </Space>

      {/* ── Expiring-row highlight style ─────────────────────────────────── */}
      <style>{`
        .contract-expiring-row td:first-child {
          border-inline-start: 3px solid #f97316 !important;
        }
      `}</style>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingContract
            ? t("hr.contracts.edit", lang)
            : t("hr.contracts.new", lang)
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
            {editingContract ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingContract
                ? `${t("hr.contracts.edit", lang)} — ${lang === "ar" ? (editingContract.employeeNameAr ?? editingContract.employeeNameEn) : (editingContract.employeeNameEn ?? editingContract.employeeNameAr)}`
                : t("hr.contracts.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("hr.contracts.employee", lang)}
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
                label={t("hr.contracts.contractType", lang)}
                name="contractType"
                rules={[{ required: true }]}
              >
                <Select
                  options={Object.values(ContractType).map(v => ({
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
                label={t("hr.contracts.startDate", lang)}
                name="startDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("hr.contracts.endDate", lang)} name="endDate">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.contracts.basicSalary", lang)}
                name="basicSalary"
                rules={[{ required: true }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.contracts.housingAllowance", lang)}
                name="housingAllowance"
              >
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.contracts.transportationAllowance", lang)}
                name="transportationAllowance"
              >
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label={t("hr.contracts.wageType", lang)}
                name="wageType"
              >
                <Select
                  options={Object.values(WageType).map(v => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label={t("hr.contracts.status", lang)} name="status">
                <Select
                  options={Object.values(ContractStatus).map(v => ({
                    value: v,
                    label: v,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label={t("hr.contracts.notes", lang)} name="notes">
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
          setViewContract(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewContract
            ? `${t("hr.contracts.details", lang)} — ${lang === "ar" ? (viewContract.employeeNameAr ?? viewContract.employeeNameEn) : (viewContract.employeeNameEn ?? viewContract.employeeNameAr)}`
            : ""
        }
      >
        {viewContract && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Salary highlight */}
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
                {t("hr.contracts.basicSalary", lang)}
              </Text>
              <Text
                strong
                style={{
                  fontSize: 28,
                  fontFamily: "monospace",
                  color: "#10b981",
                }}
              >
                {Number(viewContract.basicSalary ?? 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginTop: 2 }}
              >
                SAR
              </Text>
            </Card>

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("hr.contracts.employee", lang)}</Text>
                <br />
                <Text strong>
                  {lang === "ar"
                    ? (viewContract.employeeNameAr ??
                      viewContract.employeeNameEn ??
                      "—")
                    : (viewContract.employeeNameEn ??
                      viewContract.employeeNameAr ??
                      "—")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.contracts.contractType", lang)}
                </Text>
                <br />
                <Tag
                  color={
                    CONTRACT_TYPE_COLOR[viewContract.contractType] ?? "default"
                  }
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewContract.contractType.replace(/_/g, " ")}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.contracts.startDate", lang)}
                </Text>
                <br />
                <Text strong>
                  {dayjs(viewContract.startDate).format("YYYY-MM-DD")}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.contracts.endDate", lang)}</Text>
                <br />
                <Text
                  strong
                  style={
                    isExpiringSoon(viewContract.endDate)
                      ? { color: "#f97316" }
                      : {}
                  }
                >
                  {viewContract.endDate
                    ? dayjs(viewContract.endDate).format("YYYY-MM-DD")
                    : "—"}
                  {isExpiringSoon(viewContract.endDate) && (
                    <WarningOutlined
                      style={{ marginInlineStart: 6, fontSize: 12 }}
                    />
                  )}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.contracts.housingAllowance", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewContract.housingAllowance
                    ? Number(viewContract.housingAllowance).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("hr.contracts.transportationAllowance", lang)}
                </Text>
                <br />
                <Text style={{ fontFamily: "monospace" }}>
                  {viewContract.transportationAllowance
                    ? Number(
                        viewContract.transportationAllowance
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.contracts.wageType", lang)}</Text>
                <br />
                <Text>{viewContract.wageType ?? "—"}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("hr.contracts.status", lang)}</Text>
                <br />
                <Tag
                  color={STATUS_COLOR[viewContract.status] ?? "default"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewContract.status}
                </Tag>
              </Col>
              {viewContract.notes && (
                <Col span={24}>
                  <Text type="secondary">{t("hr.contracts.notes", lang)}</Text>
                  <br />
                  <Text>{viewContract.notes}</Text>
                </Col>
              )}
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewContract);
                }}
              >
                {t("hr.contracts.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: t("hr.contracts.delete", lang),
                    content: t("hr.contracts.deleteConfirm", lang),
                    okButtonProps: { danger: true },
                    onOk: () => {
                      deleteMutation.mutate(viewContract.id);
                      setDrawerOpen(false);
                    },
                  });
                }}
              >
                {t("hr.contracts.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}
