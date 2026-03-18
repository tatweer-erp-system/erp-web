import { useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  employeesService,
  contractsService,
  leavesService,
  attendanceService,
  trainingService,
  departmentsService,
} from "@/services/hr.service";
import type {
  Employee,
  UpdateEmployeeDto,
  EmployeeContract,
  LeaveRequest,
  LeaveBalance,
  AttendanceRecord,
  TrainingRecord,
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
  ContractStatus,
  LeaveStatus,
  AttendanceStatus,
  TrainingStatus,
} from "@/constants/enums";
import {
  Tabs,
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  notification,
  Statistic,
  Typography,
  Grid,
  Space,
  Divider,
  Table,
  Modal,
  Spin,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getEmployeeStatus(emp: Employee): EmployeeStatus {
  if (!emp.isActive) return EmployeeStatus.TERMINATED;
  return EmployeeStatus.ACTIVE;
}

function getStatusColor(status: string): string {
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

function getStatusLabel(status: string, lang: string): string {
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

function getContractStatusColor(status: string): string {
  switch (status) {
    case ContractStatus.DRAFT:
      return "blue";
    case ContractStatus.ACTIVE:
      return "green";
    case ContractStatus.EXPIRED:
      return "default";
    case ContractStatus.CANCELLED:
      return "red";
    default:
      return "default";
  }
}

function getLeaveStatusColor(status: string): string {
  switch (status) {
    case LeaveStatus.PENDING:
      return "gold";
    case LeaveStatus.APPROVED:
      return "green";
    case LeaveStatus.REJECTED:
      return "red";
    case LeaveStatus.CANCELLED:
      return "default";
    default:
      return "default";
  }
}

function getAttendanceStatusColor(status: string): string {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "green";
    case AttendanceStatus.ABSENT:
      return "red";
    case AttendanceStatus.LATE:
      return "gold";
    case AttendanceStatus.HALF_DAY:
      return "cyan";
    default:
      return "default";
  }
}

function getTrainingStatusColor(status: string): string {
  switch (status) {
    case TrainingStatus.PLANNED:
      return "blue";
    case TrainingStatus.IN_PROGRESS:
      return "gold";
    case TrainingStatus.COMPLETED:
      return "green";
    case TrainingStatus.CANCELLED:
      return "red";
    default:
      return "default";
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
      return type ?? "\u2014";
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function EmployeeDetails() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";

  // ── State ─────────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm();

  // ── Queries ───────────────────────────────────────────────────────────────

  const { data: employee, isLoading: employeeLoading } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES, id],
    queryFn: () => employeesService.get(id!),
    enabled: !!id,
  });

  const { data: contractsRaw } = useQuery({
    queryKey: [QUERY_KEYS.CONTRACTS, id],
    queryFn: () =>
      contractsService.list({ employeeId: id } as Record<string, unknown>),
    enabled: !!id,
  });

  const contracts: EmployeeContract[] = useMemo(() => {
    const raw = contractsRaw as Record<string, unknown> | undefined;
    return (raw?.data as EmployeeContract[]) ?? [];
  }, [contractsRaw]);

  const { data: leavesRaw } = useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEE_LEAVES, id],
    queryFn: () => leavesService.getByEmployee(id!),
    enabled: !!id,
  });

  const leaves: LeaveRequest[] = useMemo(() => {
    const raw = leavesRaw as Record<string, unknown> | undefined;
    return (raw?.data as LeaveRequest[]) ?? [];
  }, [leavesRaw]);

  const { data: leaveBalances } = useQuery({
    queryKey: [QUERY_KEYS.LEAVE_BALANCE, id],
    queryFn: () => leavesService.getBalance(id!),
    enabled: !!id,
  });

  const balances: LeaveBalance[] = useMemo(() => {
    return (leaveBalances as LeaveBalance[]) ?? [];
  }, [leaveBalances]);

  const { data: attendanceRaw } = useQuery({
    queryKey: [QUERY_KEYS.ATTENDANCE, id],
    queryFn: () =>
      attendanceService.list({ employeeId: id } as Record<string, unknown>),
    enabled: !!id,
  });

  const attendanceRecords: AttendanceRecord[] = useMemo(() => {
    const raw = attendanceRaw as Record<string, unknown> | undefined;
    return (raw?.data as AttendanceRecord[]) ?? [];
  }, [attendanceRaw]);

  const { data: trainingRaw } = useQuery({
    queryKey: [QUERY_KEYS.TRAINING, id],
    queryFn: () =>
      trainingService.list({ employeeId: id } as Record<string, unknown>),
    enabled: !!id,
  });

  const trainingRecords: TrainingRecord[] = useMemo(() => {
    const raw = trainingRaw as Record<string, unknown> | undefined;
    return (raw?.data as TrainingRecord[]) ?? [];
  }, [trainingRaw]);

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

  // ── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES, id] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.EMPLOYEES] });
  };

  const updateMutation = useMutation({
    mutationFn: ({ empId, dto }: { empId: string; dto: UpdateEmployeeDto }) =>
      employeesService.update(empId, dto),
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
    mutationFn: (empId: string) => employeesService.remove(empId),
    onSuccess: () => {
      notification.success({
        message: t("Employee deleted successfully", lang),
      });
      navigate("/employees");
    },
    onError: () => {
      notification.error({ message: t("Failed to delete employee", lang) });
    },
  });

  // ── Drawer helpers ────────────────────────────────────────────────────────

  const openEdit = useCallback(() => {
    if (!employee) return;
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
      birthDate: employee.birthDate ? dayjs(employee.birthDate) : undefined,
      isSaudi: employee.isSaudi ?? false,
      bankAccount: employee.bankAccount ?? undefined,
      bankName: employee.bankName ?? undefined,
      emergencyContact: employee.emergencyContact ?? undefined,
      emergencyPhone: employee.emergencyPhone ?? undefined,
    });
    setDrawerOpen(true);
  }, [employee, form]);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    form.resetFields();
  }, [form]);

  const handleSubmit = async () => {
    if (!employee) return;
    try {
      const values = await form.validateFields();
      const hireDateStr = values.hireDate
        ? dayjs(values.hireDate).format("YYYY-MM-DD")
        : undefined;
      const birthDateStr = values.birthDate
        ? dayjs(values.birthDate).format("YYYY-MM-DD")
        : undefined;

      updateMutation.mutate({
        empId: employee.id,
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
          birthDate: birthDateStr,
          isSaudi: values.isSaudi,
          bankAccount: values.bankAccount,
          bankName: values.bankName,
          emergencyContact: values.emergencyContact,
          emergencyPhone: values.emergencyPhone,
          version: employee.version ?? 0,
        },
      });
    } catch {
      // form validation failed
    }
  };

  const handleDelete = () => {
    if (!employee) return;
    Modal.confirm({
      title: t("Delete Employee", lang),
      content: t("Are you sure you want to delete this employee?", lang),
      okButtonProps: { danger: true },
      okText: t("Delete", lang),
      cancelText: t("Cancel", lang),
      onOk: () => deleteMutation.mutate(employee.id),
    });
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const empStatus = employee
    ? getEmployeeStatus(employee)
    : EmployeeStatus.ACTIVE;
  const initials = employee
    ? (employee.nameEn?.charAt(0) ?? "").toUpperCase()
    : "";

  const deptName = employee
    ? lang === "ar"
      ? employee.departmentNameAr
      : employee.departmentNameEn
    : undefined;

  const jobName = employee
    ? lang === "ar"
      ? employee.jobPositionNameAr
      : employee.jobPositionNameEn
    : undefined;

  const branchName = employee
    ? lang === "ar"
      ? employee.branchNameAr
      : employee.branchNameEn
    : undefined;

  const managerName = employee
    ? lang === "ar"
      ? employee.managerNameAr
      : employee.managerNameEn
    : undefined;

  // ── Contract stats ────────────────────────────────────────────────────────

  const contractsTotal = contracts.length;
  const contractsActive = contracts.filter(
    c => c.status === ContractStatus.ACTIVE
  ).length;
  const contractsExpired = contracts.filter(
    c => c.status === ContractStatus.EXPIRED
  ).length;

  // ── Attendance stats ──────────────────────────────────────────────────────

  const attendanceTotal = attendanceRecords.length;
  const attendancePresent = attendanceRecords.filter(
    a => a.status === AttendanceStatus.PRESENT
  ).length;
  const attendanceAbsent = attendanceRecords.filter(
    a => a.status === AttendanceStatus.ABSENT
  ).length;
  const attendanceLate = attendanceRecords.filter(
    a => a.status === AttendanceStatus.LATE
  ).length;

  // ── Training stats ────────────────────────────────────────────────────────

  const trainingTotal = trainingRecords.length;
  const trainingCompleted = trainingRecords.filter(
    tr => tr.status === TrainingStatus.COMPLETED
  ).length;
  const trainingInProgress = trainingRecords.filter(
    tr => tr.status === TrainingStatus.IN_PROGRESS
  ).length;

  // ── Contract table columns ────────────────────────────────────────────────

  const contractColumns: TableColumnsType<EmployeeContract> = [
    {
      title: t("Contract Type", lang),
      dataIndex: "contractType",
      render: (v: string) => (
        <Tag color="blue" style={{ borderRadius: 20, padding: "2px 10px" }}>
          {v ?? "\u2014"}
        </Tag>
      ),
    },
    {
      title: t("Start Date", lang),
      dataIndex: "startDate",
      render: (v: string) => (v ? dayjs(v).format("YYYY-MM-DD") : "\u2014"),
    },
    {
      title: t("End Date", lang),
      dataIndex: "endDate",
      render: (v: string | undefined) =>
        v ? dayjs(v).format("YYYY-MM-DD") : "\u2014",
    },
    {
      title: t("Basic Salary", lang),
      dataIndex: "basicSalary",
      render: (v: number) =>
        v != null
          ? Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "\u2014",
    },
    {
      title: t("Housing", lang),
      dataIndex: "housingAllowance",
      render: (v: number | undefined) =>
        v != null
          ? Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "\u2014",
    },
    {
      title: t("Transport", lang),
      dataIndex: "transportationAllowance",
      render: (v: number | undefined) =>
        v != null
          ? Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "\u2014",
    },
    {
      title: t("Status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={getContractStatusColor(v)}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v ?? "\u2014"}
        </Tag>
      ),
    },
    {
      title: t("Wage Type", lang),
      dataIndex: "wageType",
      render: (v: string | undefined) => v ?? "\u2014",
    },
  ];

  // ── Leave table columns ───────────────────────────────────────────────────

  const leaveColumns: TableColumnsType<LeaveRequest> = [
    {
      title: t("Leave Type", lang),
      key: "leaveType",
      render: (_, rec) => {
        const name = lang === "ar" ? rec.leaveTypeNameAr : rec.leaveTypeNameEn;
        return name ?? "\u2014";
      },
    },
    {
      title: t("Period", lang),
      key: "period",
      render: (_, rec) =>
        `${dayjs(rec.startDate).format("YYYY-MM-DD")} \u2192 ${dayjs(rec.endDate).format("YYYY-MM-DD")}`,
    },
    {
      title: t("Days", lang),
      dataIndex: "daysRequested",
      width: 80,
    },
    {
      title: t("Half Day", lang),
      dataIndex: "isHalfDay",
      width: 90,
      render: (v: boolean | undefined) =>
        v ? (
          <Tag color="cyan">{t("Yes", lang)}</Tag>
        ) : (
          <Text type="secondary">{t("No", lang)}</Text>
        ),
    },
    {
      title: t("Status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={getLeaveStatusColor(v)}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v ?? "\u2014"}
        </Tag>
      ),
    },
    {
      title: t("Reason", lang),
      dataIndex: "reason",
      ellipsis: true,
      render: (v: string | undefined) => v ?? "\u2014",
    },
  ];

  // ── Attendance table columns ──────────────────────────────────────────────

  const attendanceColumns: TableColumnsType<AttendanceRecord> = [
    {
      title: t("Date", lang),
      dataIndex: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: t("Clock In", lang),
      dataIndex: "clockIn",
      render: (v: string | undefined) =>
        v ? dayjs(v).format("HH:mm") : "\u2014",
    },
    {
      title: t("Clock Out", lang),
      dataIndex: "clockOut",
      render: (v: string | undefined) =>
        v ? dayjs(v).format("HH:mm") : "\u2014",
    },
    {
      title: t("Hours", lang),
      dataIndex: "workingHours",
      render: (v: number | undefined) =>
        v != null ? Number(v).toFixed(1) : "\u2014",
    },
    {
      title: t("Late (min)", lang),
      dataIndex: "lateMinutes",
      render: (v: number | undefined) => (v != null && v > 0 ? v : "\u2014"),
    },
    {
      title: t("Overtime (min)", lang),
      dataIndex: "overtimeMinutes",
      render: (v: number | undefined) => (v != null && v > 0 ? v : "\u2014"),
    },
    {
      title: t("Status", lang),
      dataIndex: "status",
      render: (v: string) => (
        <Tag
          color={getAttendanceStatusColor(v)}
          style={{ borderRadius: 20, padding: "2px 10px" }}
        >
          {v ?? "\u2014"}
        </Tag>
      ),
    },
    {
      title: t("Source", lang),
      dataIndex: "source",
      render: (v: string | undefined) =>
        v ? (
          <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>{v}</Tag>
        ) : (
          "\u2014"
        ),
    },
  ];

  // ── Training table columns ────────────────────────────────────────────────

  const trainingColumns: TableColumnsType<TrainingRecord> = [
    {
      title: t("Course", lang),
      dataIndex: "courseName",
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: t("Provider", lang),
      dataIndex: "provider",
      render: (v: string | undefined) => v ?? "\u2014",
    },
    {
      title: t("Type", lang),
      dataIndex: "trainingType",
      render: (v: string | undefined) =>
        v ? (
          <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>{v}</Tag>
        ) : (
          "\u2014"
        ),
    },
    {
      title: t("Dates", lang),
      key: "dates",
      render: (_, rec) => {
        const start = dayjs(rec.startDate).format("YYYY-MM-DD");
        const end = rec.endDate
          ? dayjs(rec.endDate).format("YYYY-MM-DD")
          : "\u2014";
        return `${start} \u2192 ${end}`;
      },
    },
    {
      title: t("Status", lang),
      dataIndex: "status",
      render: (v: string | undefined) =>
        v ? (
          <Tag
            color={getTrainingStatusColor(v)}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v}
          </Tag>
        ) : (
          "\u2014"
        ),
    },
    {
      title: t("Score", lang),
      dataIndex: "score",
      width: 80,
      render: (v: number | undefined) => (v != null ? v : "\u2014"),
    },
    {
      title: t("Cost", lang),
      dataIndex: "cost",
      render: (v: number | undefined) =>
        v != null
          ? Number(v).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "\u2014",
    },
  ];

  // ── Gradient header style for drawer ──────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  // ── Mini stat card builder ────────────────────────────────────────────────

  const renderStatCard = (
    title: string,
    value: number,
    color?: string,
    iconNode?: React.ReactNode,
    iconColor?: string
  ) => (
    <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
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
            style={{ fontSize: 12, display: "block", marginBottom: 4 }}
          >
            {title}
          </Text>
          <Statistic
            value={value}
            precision={0}
            valueStyle={{
              fontSize: 22,
              lineHeight: 1,
              color: color ?? "inherit",
            }}
          />
        </div>
        {iconNode && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${iconColor ?? primary}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              color: iconColor ?? primary,
            }}
          >
            {iconNode}
          </div>
        )}
      </div>
    </Card>
  );

  // ── Loading state ─────────────────────────────────────────────────────────

  if (employeeLoading || !employee) {
    return (
      <DashboardLayout
        currentPage="EmployeeDetails"
        breadcrumbs={[
          { label: t("Dashboard", lang), href: "/" },
          { label: t("HR", lang), href: "#" },
          { label: t("Employees", lang), href: "/employees" },
          { label: t("Details", lang) },
        ]}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────

  const tabItems = [
    {
      key: "personal",
      label: (
        <span>
          <UserOutlined style={{ marginInlineEnd: 6 }} />
          {t("Personal Info", lang)}
        </span>
      ),
      children: (
        <Card>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            labelStyle={{ fontWeight: 600, width: "30%" }}
          >
            <Descriptions.Item label={t("Name (English)", lang)}>
              {employee.nameEn}
            </Descriptions.Item>
            <Descriptions.Item label={t("Name (Arabic)", lang)}>
              <span dir="rtl">{employee.nameAr}</span>
            </Descriptions.Item>
            <Descriptions.Item label={t("Employee Code", lang)}>
              {employee.employeeCode ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("employeeNumber", lang)}>
              <Text style={{ fontFamily: "monospace" }}>
                {employee.employeeNumber ?? "\u2014"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t("Department", lang)}>
              {deptName ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Job Position", lang)}>
              {jobName ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Branch", lang)}>
              {branchName ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Manager", lang)}>
              {managerName ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Employment Type", lang)}>
              {getEmploymentTypeLabel(employee.employmentType, lang)}
            </Descriptions.Item>
            <Descriptions.Item label={t("Hire Date", lang)}>
              {employee.hireDate
                ? dayjs(employee.hireDate).format("YYYY-MM-DD")
                : "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Termination Date", lang)}>
              {employee.terminationDate
                ? dayjs(employee.terminationDate).format("YYYY-MM-DD")
                : "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Gender", lang)}>
              {employee.gender
                ? employee.gender === Gender.MALE
                  ? t("Male", lang)
                  : t("Female", lang)
                : "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Birth Date", lang)}>
              {employee.birthDate
                ? dayjs(employee.birthDate).format("YYYY-MM-DD")
                : "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Nationality", lang)}>
              {employee.nationality ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Saudi National", lang)}>
              {employee.isSaudi ? (
                <Tag color="green">{t("Yes", lang)}</Tag>
              ) : (
                <Tag>{t("No", lang)}</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t("National ID", lang)}>
              {employee.nationalId ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Marital Status", lang)}>
              {employee.maritalStatus
                ? employee.maritalStatus.charAt(0).toUpperCase() +
                  employee.maritalStatus.slice(1)
                : "\u2014"}
            </Descriptions.Item>

            <Descriptions.Item label="" span={2}>
              <Divider style={{ margin: "4px 0" }} />
            </Descriptions.Item>

            <Descriptions.Item label={t("Emergency Contact", lang)}>
              {employee.emergencyContact ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Emergency Phone", lang)}>
              {employee.emergencyPhone ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Bank Name", lang)}>
              {employee.bankName ?? "\u2014"}
            </Descriptions.Item>
            <Descriptions.Item label={t("Bank Account", lang)}>
              {employee.bankAccount ?? "\u2014"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: "contracts",
      label: (
        <span>
          <FileTextOutlined style={{ marginInlineEnd: 6 }} />
          {t("Contracts", lang)}
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("Total Contracts", lang),
                contractsTotal,
                undefined,
                <FileTextOutlined />,
                primary
              )}
            </Col>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("Active", lang),
                contractsActive,
                "#10b981",
                <CheckCircleOutlined />,
                "#10b981"
              )}
            </Col>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("Expired", lang),
                contractsExpired,
                undefined,
                <ClockCircleOutlined />,
                "#94a3b8"
              )}
            </Col>
          </Row>
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={contractColumns}
              dataSource={contracts}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: t("No contracts found", lang) }}
            />
          </Card>
        </Space>
      ),
    },
    {
      key: "leaves",
      label: (
        <span>
          <CalendarOutlined style={{ marginInlineEnd: 6 }} />
          {t("Leave Requests", lang)}
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {balances.length > 0 && (
            <Row gutter={[16, 16]}>
              {balances.map(b => {
                const typeName =
                  lang === "ar" ? b.leaveTypeNameAr : b.leaveTypeNameEn;
                return (
                  <Col key={b.leaveTypeId} xs={24} sm={12} md={6}>
                    <Card
                      size="small"
                      styles={{ body: { padding: "12px 16px" } }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: 13,
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        {typeName}
                      </Text>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, display: "block" }}
                          >
                            {t("Allocated", lang)}
                          </Text>
                          <Text strong>{b.allocated}</Text>
                        </Col>
                        <Col span={12}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, display: "block" }}
                          >
                            {t("Used", lang)}
                          </Text>
                          <Text strong>{b.used}</Text>
                        </Col>
                        <Col span={12}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, display: "block" }}
                          >
                            {t("Pending", lang)}
                          </Text>
                          <Text strong style={{ color: "#f59e0b" }}>
                            {b.pending}
                          </Text>
                        </Col>
                        <Col span={12}>
                          <Text
                            type="secondary"
                            style={{ fontSize: 11, display: "block" }}
                          >
                            {t("Remaining", lang)}
                          </Text>
                          <Text
                            strong
                            style={{
                              color: b.remaining > 0 ? "#10b981" : "#ef4444",
                            }}
                          >
                            {b.remaining}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={leaveColumns}
              dataSource={leaves}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: t("No leave requests found", lang) }}
            />
          </Card>
        </Space>
      ),
    },
    {
      key: "attendance",
      label: (
        <span>
          <ClockCircleOutlined style={{ marginInlineEnd: 6 }} />
          {t("Attendance", lang)}
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                t("Total Records", lang),
                attendanceTotal,
                undefined,
                <ClockCircleOutlined />,
                primary
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                t("Present", lang),
                attendancePresent,
                "#10b981",
                <CheckCircleOutlined />,
                "#10b981"
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                t("Absent", lang),
                attendanceAbsent,
                "#ef4444",
                <CloseCircleOutlined />,
                "#ef4444"
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderStatCard(
                t("Late", lang),
                attendanceLate,
                "#f59e0b",
                <ClockCircleOutlined />,
                "#f59e0b"
              )}
            </Col>
          </Row>
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={attendanceColumns}
              dataSource={attendanceRecords}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "25", "50"],
              }}
              locale={{ emptyText: t("No attendance records found", lang) }}
            />
          </Card>
        </Space>
      ),
    },
    {
      key: "training",
      label: (
        <span>
          <BookOutlined style={{ marginInlineEnd: 6 }} />
          {t("Training", lang)}
        </span>
      ),
      children: (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("Total", lang),
                trainingTotal,
                undefined,
                <BookOutlined />,
                primary
              )}
            </Col>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("Completed", lang),
                trainingCompleted,
                "#10b981",
                <CheckCircleOutlined />,
                "#10b981"
              )}
            </Col>
            <Col xs={24} sm={8}>
              {renderStatCard(
                t("In Progress", lang),
                trainingInProgress,
                "#f59e0b",
                <ClockCircleOutlined />,
                "#f59e0b"
              )}
            </Col>
          </Row>
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={trainingColumns}
              dataSource={trainingRecords}
              size="small"
              scroll={{ x: "max-content" }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              locale={{ emptyText: t("No training records found", lang) }}
            />
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="EmployeeDetails"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("HR", lang), href: "#" },
        { label: t("Employees", lang), href: "/employees" },
        { label: getName(employee) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Header Section ─────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: isMobile ? "16px" : "24px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/employees")}
              />

              {/* Avatar */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 26,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    {getName(employee)}
                  </Title>
                  {employee.employeeNumber && (
                    <Tag
                      style={{
                        fontFamily: "monospace",
                        borderRadius: 20,
                        padding: "2px 10px",
                      }}
                    >
                      {employee.employeeNumber}
                    </Tag>
                  )}
                  <Tag
                    color={getStatusColor(empStatus)}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {getStatusLabel(empStatus, lang)}
                  </Tag>
                </div>
                {employee.nameAr && lang !== "ar" && (
                  <Text
                    type="secondary"
                    dir="rtl"
                    style={{ display: "block", marginTop: 2 }}
                  >
                    {employee.nameAr}
                  </Text>
                )}
                {employee.nameEn && lang === "ar" && (
                  <Text
                    type="secondary"
                    style={{ display: "block", marginTop: 2 }}
                  >
                    {employee.nameEn}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 13, marginTop: 4 }}>
                  {[deptName, jobName].filter(Boolean).join(" \u2022 ") ||
                    "\u2014"}
                </Text>
              </div>
            </div>

            <Space>
              <Button icon={<EditOutlined />} onClick={openEdit}>
                {t("Edit", lang)}
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                {t("Delete", lang)}
              </Button>
            </Space>
          </div>
        </Card>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <Tabs defaultActiveKey="personal" items={tabItems} size="large" />
      </Space>

      {/* ── Edit Drawer ────────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        width={isMobile ? "100%" : 640}
        title={null}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={closeDrawer}>{t("Cancel", lang)}</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={updateMutation.isPending}
            >
              {t("Update", lang)}
            </Button>
          </div>
        }
        destroyOnClose
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            <EditOutlined />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {`${t("Edit Employee", lang)} \u2014 ${getName(employee)}`}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          {/* Name fields */}
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

          {/* Department & Hire Date */}
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

          {/* Employment Type & Nationality */}
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

          {/* National ID & Is Saudi */}
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

          {/* Gender & Marital Status */}
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
                    {
                      value: MaritalStatus.SINGLE,
                      label: t("Single", lang),
                    },
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

          {/* Birth Date */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("Birth Date", lang)} name="birthDate">
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder={t("Select date", lang)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Bank Details */}
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

          {/* Emergency Contact */}
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
