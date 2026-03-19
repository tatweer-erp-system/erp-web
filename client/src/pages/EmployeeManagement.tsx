import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import { employeesService, departmentsService } from "@/services/hr.service";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  HrDropdownItem,
} from "@/types/modules/hr";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  EmployeeStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
} from "@/constants/enums";
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
  EditOutlined,
  MoreOutlined,
  EyeOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEmployeeStatus(emp: Employee): EmployeeStatus {
  if (!emp.isActive) return EmployeeStatus.TERMINATED;
  return EmployeeStatus.ACTIVE;
}

function getStatusColor(status: EmployeeStatus): string {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return "green";
    case EmployeeStatus.PROBATION:
      return "gold";
    case EmployeeStatus.SUSPENDED:
      return "red";
    case EmployeeStatus.TERMINATED:
      return "default";
    default:
      return "default";
  }
}

function getStatusLabel(status: EmployeeStatus, lang: string): string {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return t("Active", lang);
    case EmployeeStatus.PROBATION:
      return t("Probation", lang);
    case EmployeeStatus.SUSPENDED:
      return t("Suspended", lang);
    case EmployeeStatus.TERMINATED:
      return t("Terminated", lang);
    default:
      return status;
  }
}

function getEmploymentTypeLabel(
  type: string | undefined,
  lang: string
): string {
  switch (type) {
    case EmploymentType.FULL_TIME:
      return t("Full Time", lang);
    case EmploymentType.PART_TIME:
      return t("Part Time", lang);
    case EmploymentType.CONTRACT:
      return t("Contract", lang);
    case EmploymentType.INTERN:
      return t("Intern", lang);
    default:
      return type ?? "—";
  }
}

function getEmploymentTypeColor(type: string | undefined): string {
  switch (type) {
    case EmploymentType.FULL_TIME:
      return "blue";
    case EmploymentType.PART_TIME:
      return "cyan";
    case EmploymentType.CONTRACT:
      return "purple";
    case EmploymentType.INTERN:
      return "orange";
    default:
      return "default";
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function EmployeeManagement() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string | undefined>(
    undefined
  );
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [form] = Form.useForm();

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);
      if (searchTimer) clearTimeout(searchTimer);
      const timer = setTimeout(() => {
        setDebouncedSearch(value);
      }, 400);
      setSearchTimer(timer);
    },
    [searchTimer]
  );

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: employeesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, branchId, debouncedSearch],
    queryFn: () =>
      employeesService.list({
        limit: 100,
        search: debouncedSearch || undefined,
      }),
    staleTime: 30_000,
    enabled: !!branchId,
  });

  const allEmployees: Employee[] = useMemo(() => {
    const raw = employeesRaw as Record<string, unknown> | undefined;
    return (raw?.data as Employee[]) ?? [];
  }, [employeesRaw]);

  const { data: departmentsDropdown } = useQuery({
    queryKey: [QUERY_KEYS.DEPARTMENTS_DROPDOWN],
    queryFn: () => departmentsService.dropdown(),
    staleTime: 60_000,
  });

  const departmentOptions = useMemo(() => {
    const list = (departmentsDropdown as HrDropdownItem[]) ?? [];
    return list.map(d => ({
      value: d.id,
      label: getName(d),
    }));
  }, [departmentsDropdown]);

  // ── Filtered data ─────────────────────────────────────────────────────────
  const employees = useMemo(() => {
    let filtered = [...allEmployees];

    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => {
        const empStatus = getEmployeeStatus(emp);
        return empStatus === statusFilter;
      });
    }

    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.departmentId === departmentFilter);
    }

    return filtered;
  }, [allEmployees, statusFilter, departmentFilter]);

  // ── KPI values (computed from ALL data, not filtered) ─────────────────────
  const kpiTotal = allEmployees.length;
  const kpiActive = allEmployees.filter(
    emp => getEmployeeStatus(emp) === EmployeeStatus.ACTIVE
  ).length;
  const kpiProbation = allEmployees.filter(
    emp => getEmployeeStatus(emp) === EmployeeStatus.PROBATION
  ).length;
  const kpiTerminated = allEmployees.filter(
    emp => getEmployeeStatus(emp) === EmployeeStatus.TERMINATED
  ).length;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.EMPLOYEES],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateEmployeeDto) => employeesService.create(dto),
    onSuccess: () => {
      notification.success({
        message: t("Employee created successfully", lang),
      });
      invalidate();
      closeDrawer();
    },
    onError: () => {
      notification.error({ message: t("Failed to create employee", lang) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEmployeeDto }) =>
      employeesService.update(id, dto),
    onSuccess: () => {
      notification.success({
        message: t("Employee updated successfully", lang),
      });
      invalidate();
      closeDrawer();
    },
    onError: () => {
      notification.error({ message: t("Failed to update employee", lang) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => employeesService.remove(id),
    onSuccess: () => {
      notification.success({
        message: t("Employee deleted successfully", lang),
      });
      invalidate();
    },
    onError: () => {
      notification.error({ message: t("Failed to delete employee", lang) });
    },
  });

  // ── Drawer helpers ────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingEmployee(null);
    form.resetFields();
    form.setFieldsValue({
      isSaudi: false,
      hireDate: dayjs(),
    });
    setDrawerOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (employee: Employee) => {
      setEditingEmployee(employee);
      form.setFieldsValue({
        nameEn: employee.nameEn,
        nameAr: employee.nameAr,
        departmentId: employee.departmentId ?? undefined,
        hireDate: employee.hireDate ? dayjs(employee.hireDate) : undefined,
        employmentType: employee.employmentType ?? undefined,
        nationality: employee.nationality ?? undefined,
        nationalId: employee.nationalId ?? undefined,
        gender: employee.gender ?? undefined,
        maritalStatus: employee.maritalStatus ?? undefined,
        isSaudi: employee.isSaudi ?? false,
        bankAccount: employee.bankAccount ?? undefined,
        bankName: employee.bankName ?? undefined,
        emergencyContact: employee.emergencyContact ?? undefined,
        emergencyPhone: employee.emergencyPhone ?? undefined,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingEmployee(null);
    form.resetFields();
  }, [form]);

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const hireDateStr = values.hireDate
        ? dayjs(values.hireDate).format("YYYY-MM-DD")
        : undefined;

      if (editingEmployee) {
        updateMutation.mutate({
          id: editingEmployee.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            departmentId: values.departmentId,
            hireDate: hireDateStr,
            employmentType: values.employmentType,
            nationality: values.nationality,
            nationalId: values.nationalId,
            gender: values.gender,
            maritalStatus: values.maritalStatus,
            isSaudi: values.isSaudi,
            bankAccount: values.bankAccount,
            bankName: values.bankName,
            emergencyContact: values.emergencyContact,
            emergencyPhone: values.emergencyPhone,
            version: editingEmployee.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          departmentId: values.departmentId,
          hireDate: hireDateStr ?? dayjs().format("YYYY-MM-DD"),
          employmentType: values.employmentType,
          nationality: values.nationality,
          nationalId: values.nationalId,
          gender: values.gender,
          maritalStatus: values.maritalStatus,
          isSaudi: values.isSaudi ?? false,
          bankAccount: values.bankAccount,
          bankName: values.bankName,
          emergencyContact: values.emergencyContact,
          emergencyPhone: values.emergencyPhone,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: TableColumnsType<Employee> = [
    {
      title: t("employeeNumber", lang),
      dataIndex: "employeeNumber",
      width: 160,
      sorter: (a, b) =>
        (a.employeeNumber ?? "").localeCompare(b.employeeNumber ?? ""),
      render: (v: string | undefined) => (
        <Text style={{ fontFamily: "monospace", color: token.colorPrimary }}>
          {v ?? "—"}
        </Text>
      ),
    },
    {
      title: t("Name", lang),
      key: "name",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text strong>{getName(rec)}</Text>,
    },
    {
      title: t("Department", lang),
      key: "department",
      render: (_, rec) => {
        const deptName =
          lang === "ar" ? rec.departmentNameAr : rec.departmentNameEn;
        return <Text>{deptName ?? "—"}</Text>;
      },
    },
    {
      title: t("Employment Type", lang),
      dataIndex: "employmentType",
      width: 140,
      render: (v: string | undefined) => (
        <Tag
          color={getEmploymentTypeColor(v)}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {getEmploymentTypeLabel(v, lang)}
        </Tag>
      ),
    },
    {
      title: t("Hire Date", lang),
      dataIndex: "hireDate",
      width: 130,
      sorter: (a, b) =>
        new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime(),
      render: (v: string) => (
        <Text>{v ? dayjs(v).format("YYYY-MM-DD") : "—"}</Text>
      ),
    },
    {
      title: t("Status", lang),
      key: "status",
      width: 120,
      render: (_, rec) => {
        const status = getEmployeeStatus(rec);
        return (
          <Tag
            color={getStatusColor(status)}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {getStatusLabel(status, lang)}
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
            label: t("View", lang),
            icon: <EyeOutlined />,
            onClick: () => navigate(`/employees/${rec.id}`),
          },
          {
            key: "edit",
            label: t("Edit", lang),
            icon: <EditOutlined />,
            onClick: () => openEdit(rec),
          },
          { type: "divider" as const, key: "d1" },
          {
            key: "delete",
            label: t("Delete", lang),
            danger: true,
            icon: <DeleteOutlined />,
            onClick: () => {
              Modal.confirm({
                title: t("Delete Employee", lang),
                content: t(
                  "Are you sure you want to delete this employee?",
                  lang
                ),
                okButtonProps: { danger: true },
                okText: t("Delete", lang),
                cancelText: t("Cancel", lang),
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

  // ── Status filter tabs ────────────────────────────────────────────────────

  const statusTabs = [
    { key: "all", label: t("All", lang) },
    { key: EmployeeStatus.ACTIVE, label: t("Active", lang) },
    { key: EmployeeStatus.PROBATION, label: t("Probation", lang) },
    { key: EmployeeStatus.SUSPENDED, label: t("Suspended", lang) },
    { key: EmployeeStatus.TERMINATED, label: t("Terminated", lang) },
  ];

  // ── Gradient header style for drawer ──────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="Employees"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("HR", lang), href: "#" },
        { label: t("Employees", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("Total Employees", lang),
              value: kpiTotal,
              suffix: t("Employees", lang),
              icon: <TeamOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: t("Active", lang),
              value: kpiActive,
              suffix: t("Employees", lang),
              icon: <UserOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("On Probation", lang),
              value: kpiProbation,
              suffix: t("Employees", lang),
              icon: <ClockCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("Terminated", lang),
              value: kpiTerminated,
              suffix: t("Employees", lang),
              icon: <StopOutlined />,
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
                placeholder={t("Search employees...", lang)}
                value={searchText}
                onChange={e => handleSearchChange(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Select
                value={departmentFilter}
                onChange={v => setDepartmentFilter(v)}
                allowClear
                placeholder={t("Department", lang)}
                style={{ width: 180 }}
                options={departmentOptions}
              />
              <div style={{ display: "flex", gap: 4 }}>
                {statusTabs.map(tab => (
                  <Button
                    key={tab.key}
                    type={statusFilter === tab.key ? "primary" : "default"}
                    size="small"
                    onClick={() => setStatusFilter(tab.key)}
                    style={{
                      borderRadius: 16,
                      fontSize: 12,
                      padding: "0 12px",
                    }}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>
            </Space>

            <Space>
              <Tooltip title={t("Reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("Add Employee", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={employees}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}–${range[1]} ${t("of", lang)} ${total}`,
              pageSizeOptions: ["10", "25", "50", "100"],
              defaultPageSize: 10,
            }}
            onRow={record => ({
              onClick: () => navigate(`/employees/${record.id}`),
              style: { cursor: "pointer" },
            })}
            locale={{
              emptyText: t("No employees found", lang),
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Drawer ──────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        size={isMobile ? "100%" : 640}
        title={null}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={closeDrawer}>{t("Cancel", lang)}</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingEmployee ? t("Update", lang) : t("Create", lang)}
            </Button>
          </div>
        }
        destroyOnClose
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingEmployee ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingEmployee
                ? `${t("Edit Employee", lang)} — ${getName(editingEmployee)}`
                : t("Add Employee", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          {/* ── Name fields ────────────────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Name (English)", lang)}
                name="nameEn"
                rules={[
                  {
                    required: true,
                    message: t("Name (English) is required", lang),
                  },
                ]}
              >
                <Input placeholder={t("Name (English)", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Name (Arabic)", lang)}
                name="nameAr"
                rules={[
                  {
                    required: true,
                    message: t("Name (Arabic) is required", lang),
                  },
                ]}
              >
                <Input dir="rtl" placeholder={t("Name (Arabic)", lang)} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Department & Hire Date ─────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Department", lang)}
                name="departmentId"
                rules={[
                  {
                    required: true,
                    message: t("Department is required", lang),
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("Select Department", lang)}
                  options={departmentOptions}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Hire Date", lang)}
                name="hireDate"
                rules={[
                  {
                    required: true,
                    message: t("Hire Date is required", lang),
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder={t("Select date", lang)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Employment Type & Nationality ─────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Employment Type", lang)}
                name="employmentType"
              >
                <Select
                  placeholder={t("Select type", lang)}
                  allowClear
                  options={[
                    {
                      value: EmploymentType.FULL_TIME,
                      label: t("Full Time", lang),
                    },
                    {
                      value: EmploymentType.PART_TIME,
                      label: t("Part Time", lang),
                    },
                    {
                      value: EmploymentType.CONTRACT,
                      label: t("Contract", lang),
                    },
                    {
                      value: EmploymentType.INTERN,
                      label: t("Intern", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Nationality", lang)} name="nationality">
                <Input placeholder={t("Nationality", lang)} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── National ID & Is Saudi ────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("National ID", lang)} name="nationalId">
                <Input placeholder={t("National ID", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Saudi National", lang)}
                name="isSaudi"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Gender & Marital Status ───────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Gender", lang)} name="gender">
                <Select
                  placeholder={t("Select gender", lang)}
                  allowClear
                  options={[
                    { value: Gender.MALE, label: t("Male", lang) },
                    { value: Gender.FEMALE, label: t("Female", lang) },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Marital Status", lang)} name="maritalStatus">
                <Select
                  placeholder={t("Select status", lang)}
                  allowClear
                  options={[
                    { value: MaritalStatus.SINGLE, label: t("Single", lang) },
                    {
                      value: MaritalStatus.MARRIED,
                      label: t("Married", lang),
                    },
                    {
                      value: MaritalStatus.DIVORCED,
                      label: t("Divorced", lang),
                    },
                    {
                      value: MaritalStatus.WIDOWED,
                      label: t("Widowed", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Bank Details ──────────────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Bank Name", lang)} name="bankName">
                <Input placeholder={t("Bank Name", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Bank Account", lang)} name="bankAccount">
                <Input placeholder={t("IBAN / Account Number", lang)} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Emergency Contact ─────────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Emergency Contact", lang)}
                name="emergencyContact"
              >
                <Input placeholder={t("Contact name", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("Emergency Phone", lang)}
                name="emergencyPhone"
              >
                <Input placeholder={t("Phone number", lang)} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </DashboardLayout>
  );
}
