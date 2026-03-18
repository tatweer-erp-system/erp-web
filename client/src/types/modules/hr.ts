// ─── Employee ───────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  nameEn: string;
  nameAr: string;
  employeeCode?: string;
  employeeNumber?: string;
  departmentId?: string;
  jobPositionId?: string;
  branchId?: string;
  managerId?: string;
  employmentType?: string;
  hireDate: string;
  terminationDate?: string;
  nationalId?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  isSaudi?: boolean;
  emergencyContact?: string;
  emergencyPhone?: string;
  bankAccount?: string;
  bankName?: string;
  isActive: boolean;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
  // JOINed fields
  departmentNameEn?: string;
  departmentNameAr?: string;
  jobPositionNameEn?: string;
  jobPositionNameAr?: string;
  branchNameEn?: string;
  branchNameAr?: string;
  managerNameEn?: string;
  managerNameAr?: string;
  userId?: string;
  // Contract summary (from GET /:id)
  activeContract?: EmployeeContract;
}

export interface CreateEmployeeDto {
  nameEn: string;
  nameAr: string;
  departmentId: string;
  hireDate: string;
  userId?: string;
  employeeCode?: string;
  jobPositionId?: string;
  branchId?: string;
  managerId?: string;
  employmentType?: string;
  nationalId?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  isSaudi?: boolean;
  emergencyContact?: string;
  emergencyPhone?: string;
  bankAccount?: string;
  bankName?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {
  version: number;
}

// ─── Contract ───────────────────────────────────────────────────────────────

export interface EmployeeContract {
  id: string;
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  basicSalary: number;
  housingAllowance?: number;
  transportationAllowance?: number;
  wageType?: string;
  wage?: number;
  salaryStructureId?: string;
  workingScheduleId?: string;
  status: string;
  notes?: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
}

export interface CreateContractDto {
  employeeId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  basicSalary: number;
  housingAllowance?: number;
  transportationAllowance?: number;
  wageType?: string;
  wage?: number;
  salaryStructureId?: string;
  workingScheduleId?: string;
  status?: string;
  notes?: string;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  version: number;
}

// ─── Leave ──────────────────────────────────────────────────────────────────

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  reason?: string;
  status: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
  leaveTypeNameEn?: string;
  leaveTypeNameAr?: string;
  approvedByNameEn?: string;
  approvedByNameAr?: string;
}

export interface CreateLeaveDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  reason?: string;
}

export interface UpdateLeaveDto extends Partial<CreateLeaveDto> {
  version: number;
}

export interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeNameEn: string;
  leaveTypeNameAr: string;
  allocated: number;
  used: number;
  pending: number;
  remaining: number;
}

// ─── Attendance ─────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  lateMinutes?: number;
  overtimeMinutes?: number;
  workingHours?: number;
  notes?: string;
  source?: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
}

export interface CreateAttendanceDto {
  employeeId: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status?: string;
  notes?: string;
  source?: string;
}

export interface UpdateAttendanceDto extends Partial<CreateAttendanceDto> {
  version: number;
}

// ─── Payroll Run ────────────────────────────────────────────────────────────

export interface PayrollRun {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalGosiEmployer: number;
  currency?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  journalEntryId?: string;
  createdAt?: string;
  items?: PayrollItem[];
}

export interface CreatePayrollRunDto {
  periodStart: string;
  periodEnd: string;
  notes?: string;
}

export interface PayrollItem {
  id: string;
  runId: string;
  employeeId: string;
  basicSalary: number;
  housingAllowance: number;
  transportationAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  lateDeductions: number;
  absenceDeductions: number;
  loanDeductions: number;
  gosiEmployee: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  gosiEmployer: number;
  paymentStatus?: string;
  paymentDate?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
}

export interface AddPayrollItemDto {
  employeeId: string;
  basicSalary: number;
  housingAllowance?: number;
  transportationAllowance?: number;
  otherAllowances?: number;
  otherDeductions?: number;
}

// ─── Shift ──────────────────────────────────────────────────────────────────

export interface Shift {
  id: string;
  nameEn: string;
  nameAr: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  isOvernight?: boolean;
  isActive: boolean;
  version?: number;
  createdAt?: string;
  workingDays?: number[];
}

export interface CreateShiftDto {
  nameEn: string;
  nameAr: string;
  startTime: string;
  endTime: string;
  breakMinutes?: number;
  isOvernight?: boolean;
  workingDays?: number[];
  isActive?: boolean;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {
  version: number;
}

// ─── Training ───────────────────────────────────────────────────────────────

export interface TrainingRecord {
  id: string;
  employeeId: string;
  courseName: string;
  provider?: string;
  trainingType?: string;
  startDate: string;
  endDate?: string;
  durationHours?: number;
  status?: string;
  score?: number;
  passed?: boolean;
  certificateNumber?: string;
  certificateUrl?: string;
  certificateExpiry?: string;
  cost?: number;
  notes?: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
}

export interface CreateTrainingDto {
  employeeId: string;
  courseName: string;
  startDate: string;
  provider?: string;
  trainingType?: string;
  endDate?: string;
  durationHours?: number;
  status?: string;
  score?: number;
  certificateNumber?: string;
  certificateUrl?: string;
  certificateExpiry?: string;
  cost?: number;
  notes?: string;
}

export interface UpdateTrainingDto extends Partial<CreateTrainingDto> {
  version: number;
}

// ─── Salary Structure ───────────────────────────────────────────────────────

export interface SalaryStructure {
  id: string;
  nameEn: string;
  nameAr: string;
  type?: string;
  parentId?: string;
  version?: number;
  createdAt?: string;
  rules?: SalaryRule[];
}

export interface CreateSalaryStructureDto {
  nameEn: string;
  nameAr: string;
  type?: string;
  parentId?: string;
}

export interface UpdateSalaryStructureDto extends Partial<CreateSalaryStructureDto> {
  version: number;
}

export interface SalaryRule {
  id: string;
  structureId: string;
  sequence: number;
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  conditionType?: string;
  computationType?: string;
  amount?: number;
  percentBase?: string;
  percentValue?: number;
  appearsOnPayslip?: boolean;
  version?: number;
}

export interface CreateSalaryRuleDto {
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  sequence?: number;
  conditionType?: string;
  computationType?: string;
  amount?: number;
  percentBase?: string;
  percentValue?: number;
  appearsOnPayslip?: boolean;
}

// ─── Payslip ────────────────────────────────────────────────────────────────

export interface Payslip {
  id: string;
  employeeId: string;
  contractId?: string;
  structureId?: string;
  reference?: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  gosiEmployee: number;
  gosiEmployer: number;
  incomeTax: number;
  journalEntryId?: string;
  branchId: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
  lines?: PayslipLine[];
}

export interface PayslipLine {
  id: string;
  payslipId: string;
  ruleId?: string;
  code: string;
  nameEn: string;
  nameAr: string;
  category: string;
  sequence: number;
  quantity: number;
  rate: number;
  amount: number;
  appearsOnPayslip: boolean;
}

export interface GeneratePayslipsDto {
  periodStart: string;
  periodEnd: string;
  branchId?: string;
  structureId?: string;
}

// ─── HR Definitions ─────────────────────────────────────────────────────────

export interface JobTitle {
  id: string;
  nameEn: string;
  nameAr: string;
  departmentId?: string;
  grade?: string;
  isActive: boolean;
  version?: number;
}

export interface LeaveTypeConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  daysPerYear?: number;
  isPaid?: boolean;
  requiresApproval?: boolean;
  allowNegative?: boolean;
  isActive: boolean;
  version?: number;
}

export interface PublicHoliday {
  id: string;
  nameEn: string;
  nameAr: string;
  date: string;
  isRecurring?: boolean;
  isActive: boolean;
  version?: number;
}

export interface TerminationReason {
  id: string;
  nameEn: string;
  nameAr: string;
  type: string;
  isActive: boolean;
  version?: number;
}

export interface EmploymentTypeConfig {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isActive: boolean;
  version?: number;
}

export interface Department {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  parentId?: string;
  managerId?: string;
  version?: number;
  createdAt?: string;
  managerNameEn?: string;
  managerNameAr?: string;
}

export interface CreateDepartmentDto {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  parentId?: string;
  managerId?: string;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {
  version: number;
}

// ─── Leave Allocation ───────────────────────────────────────────────────────

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  numberOfDays: number;
  mode: string;
  status: string;
  branchId: string;
  version?: number;
  createdAt?: string;
  employeeNameEn?: string;
  employeeNameAr?: string;
  leaveTypeNameEn?: string;
  leaveTypeNameAr?: string;
}

// ─── Dropdown ───────────────────────────────────────────────────────────────

export interface HrDropdownItem {
  id: string;
  nameEn: string;
  nameAr: string;
}
