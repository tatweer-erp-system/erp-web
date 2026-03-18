import apiClient from "@/lib/api";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type {
  Employee,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  LeaveRequest,
  CreateLeaveDto,
  UpdateLeaveDto,
  LeaveBalance,
  AttendanceRecord,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  EmployeeContract,
  CreateContractDto,
  UpdateContractDto,
  PayrollRun,
  CreatePayrollRunDto,
  PayrollItem,
  AddPayrollItemDto,
  Shift,
  CreateShiftDto,
  UpdateShiftDto,
  TrainingRecord,
  CreateTrainingDto,
  UpdateTrainingDto,
  SalaryStructure,
  CreateSalaryStructureDto,
  UpdateSalaryStructureDto,
  SalaryRule,
  CreateSalaryRuleDto,
  Payslip,
  GeneratePayslipsDto,
  HrDropdownItem,
} from "@/types/modules/hr";

// ─── Employees ──────────────────────────────────────────────────────────────

export const employeesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Employee>>("/employees", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Employee>>(`/employees/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateEmployeeDto) =>
    apiClient
      .post<ApiResponse<Employee>>("/employees", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateEmployeeDto) =>
    apiClient
      .put<ApiResponse<Employee>>(`/employees/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/employees/${id}`).then(r => r.data),

  restore: (id: string) =>
    apiClient
      .patch<ApiResponse<Employee>>(`/employees/${id}/restore`)
      .then(r => r.data.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<HrDropdownItem[]>>("/employees/dropdown", { params })
      .then(r => r.data.data),
};

// ─── Departments ────────────────────────────────────────────────────────────

export const departmentsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Department>>("/departments", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Department>>(`/departments/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateDepartmentDto) =>
    apiClient
      .post<ApiResponse<Department>>("/departments", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateDepartmentDto) =>
    apiClient
      .put<ApiResponse<Department>>(`/departments/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/departments/${id}`).then(r => r.data),

  dropdown: (params?: { search?: string; limit?: number }) =>
    apiClient
      .get<ApiResponse<HrDropdownItem[]>>("/departments/dropdown", { params })
      .then(r => r.data.data),
};

// ─── Leaves ─────────────────────────────────────────────────────────────────

export const leavesService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<LeaveRequest>>("/leaves", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<LeaveRequest>>(`/leaves/${id}`)
      .then(r => r.data.data),

  getByEmployee: (employeeId: string, params?: Partial<TableParams>) =>
    apiClient
      .get<
        PaginatedResponse<LeaveRequest>
      >(`/leaves/employee/${employeeId}`, { params })
      .then(r => r.data),

  getBalance: (employeeId: string) =>
    apiClient
      .get<ApiResponse<LeaveBalance[]>>(`/leaves/balance/${employeeId}`)
      .then(r => r.data.data),

  create: (dto: CreateLeaveDto) =>
    apiClient
      .post<ApiResponse<LeaveRequest>>("/leaves", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateLeaveDto) =>
    apiClient
      .put<ApiResponse<LeaveRequest>>(`/leaves/${id}`, dto)
      .then(r => r.data.data),

  approve: (id: string) =>
    apiClient
      .patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`)
      .then(r => r.data.data),

  reject: (id: string, rejectionReason?: string) =>
    apiClient
      .patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`, {
        rejectionReason,
      })
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .patch<ApiResponse<LeaveRequest>>(`/leaves/${id}/cancel`)
      .then(r => r.data.data),
};

// ─── Attendance ─────────────────────────────────────────────────────────────

export const attendanceService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<AttendanceRecord>>("/hr/attendance", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<AttendanceRecord>>(`/hr/attendance/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateAttendanceDto) =>
    apiClient
      .post<ApiResponse<AttendanceRecord>>("/hr/attendance", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateAttendanceDto) =>
    apiClient
      .put<ApiResponse<AttendanceRecord>>(`/hr/attendance/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/hr/attendance/${id}`)
      .then(r => r.data),

  getReport: (params?: {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
  }) =>
    apiClient
      .get<ApiResponse<AttendanceRecord[]>>("/hr/attendance/report", {
        params,
      })
      .then(r => r.data.data),

  importRecords: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post<
        ApiResponse<{ imported: number; errors: number }>
      >("/hr/attendance/import", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then(r => r.data.data);
  },
};

// ─── Contracts ──────────────────────────────────────────────────────────────

export const contractsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<EmployeeContract>>("/hr/contracts", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<EmployeeContract>>(`/hr/contracts/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateContractDto) =>
    apiClient
      .post<ApiResponse<EmployeeContract>>("/hr/contracts", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateContractDto) =>
    apiClient
      .put<ApiResponse<EmployeeContract>>(`/hr/contracts/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/hr/contracts/${id}`)
      .then(r => r.data),
};

// ─── Payroll Runs ───────────────────────────────────────────────────────────

export const payrollRunsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<PayrollRun>>("/hr/payroll/runs", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<PayrollRun>>(`/hr/payroll/runs/${id}`)
      .then(r => r.data.data),

  create: (dto: CreatePayrollRunDto) =>
    apiClient
      .post<ApiResponse<PayrollRun>>("/hr/payroll/runs", dto)
      .then(r => r.data.data),

  confirm: (id: string) =>
    apiClient
      .post<ApiResponse<PayrollRun>>(`/hr/payroll/runs/${id}/confirm`)
      .then(r => r.data.data),

  approve: (id: string) =>
    apiClient
      .post<ApiResponse<PayrollRun>>(`/hr/payroll/runs/${id}/approve`)
      .then(r => r.data.data),

  markPaid: (id: string) =>
    apiClient
      .post<ApiResponse<PayrollRun>>(`/hr/payroll/runs/${id}/mark-paid`)
      .then(r => r.data.data),

  addItem: (runId: string, dto: AddPayrollItemDto) =>
    apiClient
      .post<ApiResponse<PayrollItem>>(`/hr/payroll/runs/${runId}/items`, dto)
      .then(r => r.data.data),

  removeItem: (runId: string, itemId: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/hr/payroll/runs/${runId}/items/${itemId}`)
      .then(r => r.data),

  getReport: (params?: { periodStart?: string; periodEnd?: string }) =>
    apiClient
      .get<ApiResponse<PayrollRun[]>>("/hr/payroll/reports", { params })
      .then(r => r.data.data),
};

// ─── Shifts ─────────────────────────────────────────────────────────────────

export const shiftsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Shift>>("/hr/shifts", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Shift>>(`/hr/shifts/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateShiftDto) =>
    apiClient
      .post<ApiResponse<Shift>>("/hr/shifts", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateShiftDto) =>
    apiClient
      .put<ApiResponse<Shift>>(`/hr/shifts/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/hr/shifts/${id}`).then(r => r.data),

  getWorkingDays: (id: string) =>
    apiClient
      .get<ApiResponse<number[]>>(`/hr/shifts/${id}/working-days`)
      .then(r => r.data.data),

  updateWorkingDays: (id: string, workingDays: number[]) =>
    apiClient
      .put<ApiResponse<number[]>>(`/hr/shifts/${id}/working-days`, {
        workingDays,
      })
      .then(r => r.data.data),
};

// ─── Training ───────────────────────────────────────────────────────────────

export const trainingService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<TrainingRecord>>("/hr/training", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<TrainingRecord>>(`/hr/training/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateTrainingDto) =>
    apiClient
      .post<ApiResponse<TrainingRecord>>("/hr/training", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateTrainingDto) =>
    apiClient
      .put<ApiResponse<TrainingRecord>>(`/hr/training/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/hr/training/${id}`).then(r => r.data),
};

// ─── Salary Structures ──────────────────────────────────────────────────────

export const salaryStructuresService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<SalaryStructure>>("/salary-structures", {
        params,
      })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`)
      .then(r => r.data.data),

  create: (dto: CreateSalaryStructureDto) =>
    apiClient
      .post<ApiResponse<SalaryStructure>>("/salary-structures", dto)
      .then(r => r.data.data),

  update: (id: string, dto: UpdateSalaryStructureDto) =>
    apiClient
      .put<ApiResponse<SalaryStructure>>(`/salary-structures/${id}`, dto)
      .then(r => r.data.data),

  remove: (id: string) =>
    apiClient
      .delete<ApiResponse<void>>(`/salary-structures/${id}`)
      .then(r => r.data),

  getRules: (structureId: string) =>
    apiClient
      .get<ApiResponse<SalaryRule[]>>(`/salary-structures/${structureId}/rules`)
      .then(r => r.data.data),

  addRule: (structureId: string, dto: CreateSalaryRuleDto) =>
    apiClient
      .post<
        ApiResponse<SalaryRule>
      >(`/salary-structures/${structureId}/rules`, dto)
      .then(r => r.data.data),

  updateRule: (
    structureId: string,
    ruleId: string,
    dto: Partial<CreateSalaryRuleDto> & { version: number }
  ) =>
    apiClient
      .put<
        ApiResponse<SalaryRule>
      >(`/salary-structures/${structureId}/rules/${ruleId}`, dto)
      .then(r => r.data.data),

  deleteRule: (structureId: string, ruleId: string) =>
    apiClient
      .delete<
        ApiResponse<void>
      >(`/salary-structures/${structureId}/rules/${ruleId}`)
      .then(r => r.data),
};

// ─── Payslips ───────────────────────────────────────────────────────────────

export const payslipsService = {
  list: (params?: Partial<TableParams>) =>
    apiClient
      .get<PaginatedResponse<Payslip>>("/payslips", { params })
      .then(r => r.data),

  get: (id: string) =>
    apiClient
      .get<ApiResponse<Payslip>>(`/payslips/${id}`)
      .then(r => r.data.data),

  generate: (dto: GeneratePayslipsDto) =>
    apiClient
      .post<ApiResponse<Payslip[]>>("/payslips/generate", dto)
      .then(r => r.data.data),

  compute: (id: string) =>
    apiClient
      .post<ApiResponse<Payslip>>(`/payslips/${id}/compute`)
      .then(r => r.data.data),

  confirm: (id: string) =>
    apiClient
      .post<ApiResponse<Payslip>>(`/payslips/${id}/confirm`)
      .then(r => r.data.data),

  cancel: (id: string) =>
    apiClient
      .patch<ApiResponse<Payslip>>(`/payslips/${id}/cancel`)
      .then(r => r.data.data),
};
