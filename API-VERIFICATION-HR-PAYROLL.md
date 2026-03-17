# API Verification Report: HR & Payroll Modules

> **Generated**: 2026-03-17
> **Verified against**: `erp-api/src/modules/hr/`, `erp-api/src/modules/hr-setup/`, `erp-api/src/modules/hr-extensions/`, `erp-api/src/modules/payroll-new/`

---

## HR -- Departments

### [GET] `/departments/dropdown`

- **Controller**: Found at `hr/controllers/departments.controller.ts:44`
- **Permission**: Spec says none. Actual: no `@Permissions()` decorator (only global guards). **Match**
- **Request DTO**: `DropdownQueryDto` -- Match
- **Response**: Match

### [GET] `/departments`

- **Controller**: Found at `hr/controllers/departments.controller.ts:51`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Request DTO**: `PaginationDto` -- Match
- **Response**: Match

### [GET] `/departments/:id`

- **Controller**: Found at `hr/controllers/departments.controller.ts:59`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Response**: Match

### [POST] `/departments`

- **Controller**: Found at `hr/controllers/departments.controller.ts:68`
- **Permission**: Spec=`hr:create`, Actual=`hr:create`. **Match**
- **Request DTO**: `CreateDepartmentDto` -- **Match**. Fields: `nameEn` (required), `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `managerId?`, `parentId?`
- **Note**: Spec does not document all fields. `descriptionEn`, `descriptionAr`, `managerId`, `parentId` exist in actual DTO but are not listed in the spec table (spec only shows CRUD endpoints, no DTO detail for departments).

### [PUT] `/departments/:id`

- **Controller**: Found at `hr/controllers/departments.controller.ts:83`
- **Permission**: Spec=`hr:update`, Actual=`hr:update`. **Match**
- **Request DTO**: `UpdateDepartmentDto` extends `PartialType(CreateDepartmentDto)`. **Missing `version` field** -- the UpdateDepartmentDto does NOT include an optimistic locking `version` field, which is inconsistent with the project's standard pattern.

### [DELETE] `/departments/:id`

- **Controller**: Found at `hr/controllers/departments.controller.ts:100`
- **Permission**: Spec=`hr:delete`, Actual=`hr:delete`. **Match**
- **Response**: 204 No Content. **Match**

---

## HR -- Employees

### [GET] `/employees/dropdown`

- **Controller**: Found at `hr/controllers/employees.controller.ts:45`
- **Permission**: Spec says none. Actual: no `@Permissions()`. **Match**
- **Response**: Match

### [GET] `/employees`

- **Controller**: Found at `hr/controllers/employees.controller.ts:52`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Response**: Match

### [GET] `/employees/:id`

- **Controller**: Found at `hr/controllers/employees.controller.ts:60`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Response**: Returns employee details with active contract summary. **Match**

### [POST] `/employees`

- **Controller**: Found at `hr/controllers/employees.controller.ts:69`
- **Permission**: Spec=`hr:create`, Actual=`hr:create`. **Match**
- **Request DTO**: `CreateEmployeeDto`
  - Spec says: `nameEn, nameAr, departmentId, hireDate` (required), `userId?, employeeCode?, jobPositionId?, branchId?, managerId?, employmentType?, nationalId?, birthDate?, gender?, maritalStatus?, nationality?, isSaudi?, emergencyContact?, emergencyPhone?, bankAccount?, bankName?`
  - Actual DTO matches spec exactly. **Match**
  - `employmentType` uses `EmploymentType` enum (`full-time`, `part-time`, `contract`, `intern`) -- **Match** with spec values
  - `gender` uses `Gender` enum (`male`, `female`) -- **Match**
  - `maritalStatus` uses `MaritalStatus` enum (`single`, `married`, `divorced`, `widowed`) -- **Match**

### [PUT] `/employees/:id`

- **Controller**: Found at `hr/controllers/employees.controller.ts:89`
- **Permission**: Spec=`hr:update`, Actual=`hr:update`. **Match**
- **Request DTO**: `UpdateEmployeeDto` extends `PartialType(OmitType(CreateEmployeeDto, ['userId']))` + `version: number` (required). **Match**

### [DELETE] `/employees/:id`

- **Controller**: Found at `hr/controllers/employees.controller.ts:106`
- **Permission**: Spec=`hr:delete`, Actual=`hr:delete`. **Match**
- **Response**: 204 No Content. **Match**

### [PATCH] `/employees/:id/restore`

- **Controller**: Found at `hr/controllers/employees.controller.ts:123`
- **Permission**: Spec=`hr:update`, Actual=`hr:update`. **Match**
- **Response**: Match

---

## HR -- Leaves

### [GET] `/leaves`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:52`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/leaves/:id`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:60`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/leaves/employee/:employeeId`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:30`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/leaves/balance/:employeeId`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:43`
- **Permission**: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [POST] `/leaves`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:69`
- **Permission**: Spec=`hr:create`, Actual=`hr:create`. **Match**
- **Request DTO**: `CreateLeaveRequestDto`
  - Fields: `employeeId` (required), `leaveTypeId` (required), `startDate` (required), `endDate` (required), `isHalfDay?`, `reason?`
  - Spec does not explicitly list DTO fields but mentions business validations (endDate >= startDate, balance check, overlap check). **Match**

### [PUT] `/leaves/:id`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:84`
- **Permission**: Spec=`hr:update`, Actual=`hr:update`. **Match**
- **Request DTO**: `UpdateLeaveRequestDto` -- has `startDate?`, `endDate?`, `isHalfDay?`, `reason?`, `version` (required). **Match**

### [PATCH] `/leaves/:id/approve`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:101`
- **Permission**: Spec=`hr:approve`, Actual=`hr:approve`. **Match**

### [PATCH] `/leaves/:id/reject`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:117`
- **Permission**: Spec=`hr:approve`, Actual=`hr:approve`. **Match**

### [PATCH] `/leaves/:id/cancel`

- **Controller**: Found at `hr/controllers/leaves.controller.ts:133`
- **Permission**: Spec=`hr:update`, Actual=`hr:update`. **Match**

---

## HR -- Definitions

All under `/hr/definitions/<type>`. Spec lists: Job Titles, Employment Types, Leave Types (Config), Public Holidays, Termination Reasons.

### Job Titles (CRUD at `/hr/definitions/job-titles`)

- **[GET] `/hr/definitions/job-titles`**: Found at `hr/controllers/hr-definitions.controller.ts:51`. Permission=`hr:view`. **Match**
- **[GET] `/hr/definitions/job-titles/:id`**: Found at line 59. Permission=`hr:view`. **Match**
- **[POST] `/hr/definitions/job-titles`**: Found at line 68. Permission=`hr:create`. **Match**
  - DTO: `CreateJobTitleDto` -- `nameEn` (required), `nameAr` (required), `departmentId?`, `grade?`, `isActive?`. **Match with spec**
- **[PUT] `/hr/definitions/job-titles/:id`**: Found at line 83. Permission=`hr:update`. **Match**
  - DTO: `UpdateJobTitleDto` -- all optional + `version` (required). **Match**
- **[DELETE] `/hr/definitions/job-titles/:id`**: Found at line 100. Permission=`hr:delete`. **Match**

### Employment Types (CRUD at `/hr/definitions/employment-types`)

- **[GET] `/hr/definitions/employment-types`**: Found at line 119. Permission=`hr:view`. **Match**
- **[GET] `/hr/definitions/employment-types/:id`**: Found at line 127. Permission=`hr:view`. **Match**
- **[POST] `/hr/definitions/employment-types`**: Found at line 136. Permission=`hr:create`. **Match**
  - DTO: `CreateEmploymentTypeConfigDto` -- `nameEn` (required), `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `isActive?`. **Match with spec**
- **[PUT] `/hr/definitions/employment-types/:id`**: Found at line 151. Permission=`hr:update`. **Match**
  - DTO: `UpdateEmploymentTypeConfigDto` -- all optional + `version` (required). **Match**
- **[DELETE] `/hr/definitions/employment-types/:id`**: Found at line 168. Permission=`hr:delete`. **Match**

### Leave Types Config (CRUD at `/hr/definitions/leave-types`)

- **[GET] `/hr/definitions/leave-types`**: Found at line 187. Permission=`hr:view`. **Match**
- **[GET] `/hr/definitions/leave-types/:id`**: Found at line 195. Permission=`hr:view`. **Match**
- **[POST] `/hr/definitions/leave-types`**: Found at line 204. Permission=`hr:create`. **Match**
  - DTO: `CreateLeaveTypeConfigDto` -- `nameEn` (required), `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `daysPerYear` (required, @IsInt), `isPaid?`, `requiresApproval?`, `isActive?`. **Match with spec**
- **[PUT] `/hr/definitions/leave-types/:id`**: Found at line 219. Permission=`hr:update`. **Match**
  - DTO: `UpdateLeaveTypeConfigDto` -- all optional + `version` (required). **Match**
- **[DELETE] `/hr/definitions/leave-types/:id`**: Found at line 236. Permission=`hr:delete`. **Match**

### Public Holidays (CRUD at `/hr/definitions/public-holidays`)

- **[GET] `/hr/definitions/public-holidays`**: Found at line 255. Permission=`hr:view`. **Match**
- **[GET] `/hr/definitions/public-holidays/:id`**: Found at line 263. Permission=`hr:view`. **Match**
- **[POST] `/hr/definitions/public-holidays`**: Found at line 272. Permission=`hr:create`. **Match**
  - DTO: `CreatePublicHolidayDto` -- `nameEn` (required), `nameAr` (required), `date` (required), `isRecurring?`, `isActive?`. **Match with spec**
- **[PUT] `/hr/definitions/public-holidays/:id`**: Found at line 287. Permission=`hr:update`. **Match**
  - DTO: `UpdatePublicHolidayDto` -- all optional + `version` (required). **Match**
- **[DELETE] `/hr/definitions/public-holidays/:id`**: Found at line 304. Permission=`hr:delete`. **Match**

### Termination Reasons (CRUD at `/hr/definitions/termination-reasons`)

- **[GET] `/hr/definitions/termination-reasons`**: Found at line 323. Permission=`hr:view`. **Match**
- **[GET] `/hr/definitions/termination-reasons/:id`**: Found at line 331. Permission=`hr:view`. **Match**
- **[POST] `/hr/definitions/termination-reasons`**: Found at line 340. Permission=`hr:create`. **Match**
  - DTO: `CreateTerminationReasonDto` -- `nameEn` (required), `nameAr` (required), `type` (required, `TerminationType` enum: `voluntary`, `involuntary`, `end_of_contract`, `retirement`), `isActive?`. **Match with spec**
- **[PUT] `/hr/definitions/termination-reasons/:id`**: Found at line 355. Permission=`hr:update`. **Match**
  - DTO: `UpdateTerminationReasonDto` -- all optional + `version` (required). **Match**
- **[DELETE] `/hr/definitions/termination-reasons/:id`**: Found at line 372. Permission=`hr:delete`. **Match**

---

## HR Setup -- Leave Types

### [GET] `/hr-setup/leave-types`

- **Controller**: Found at `hr-setup/controllers/leave-types.controller.ts:41`
- **Permission**: Spec not explicit, Actual=`hr:view`. **Match**

### [GET] `/hr-setup/leave-types/:id`

- **Controller**: Found at line 49. Permission=`hr:view`. **Match**

### [POST] `/hr-setup/leave-types`

- **Controller**: Found at line 58. Permission: Spec not explicit, Actual=`hr:manage`. **Match**
- **Request DTO**: `CreateLeaveTypeDto` -- `nameEn` (required), `nameAr` (required), `color?`, `requiresApproval?`, `allowNegative?`, `isActive?`. **Match with spec**

### [PUT] `/hr-setup/leave-types/:id`

- **Controller**: Found at line 73. Permission=`hr:manage`. **Match**
- **Request DTO**: `UpdateLeaveTypeDto` -- all optional + `version` (required). **Match**

### [DELETE] `/hr-setup/leave-types/:id`

- **Controller**: Found at line 90. Permission=`hr:manage`. **Match**

---

## HR Setup -- Leave Allocations

### [GET] `/hr-setup/leave-allocations`

- **Controller**: Found at `hr-setup/controllers/leave-allocations.controller.ts:41`
- **Permission**: Actual=`hr:view`. **Match**

### [GET] `/hr-setup/leave-allocations/:id`

- **Controller**: Found at line 49. Permission=`hr:view`. **Match**

### [POST] `/hr-setup/leave-allocations`

- **Controller**: Found at line 58. Permission=`hr:manage`. **Match**
- **Request DTO**: `CreateLeaveAllocationDto` -- `employeeId` (required), `leaveTypeId` (required), `year` (required), `numberOfDays` (required, @Min(0)), `mode?` (LeaveAllocationMode: `manual`/`accrual`), `branchId?`. **Match with spec**

### [PUT] `/hr-setup/leave-allocations/:id`

- **Controller**: Found at line 73. Permission=`hr:manage`. **Match**
- **Request DTO**: `UpdateLeaveAllocationDto` -- `year?`, `numberOfDays?`, `mode?`, `version` (required). **Match**

### [DELETE] `/hr-setup/leave-allocations/:id`

- **Controller**: Found at line 90. Permission=`hr:manage`. **Match**

### [POST] `/hr-setup/leave-allocations/:id/approve`

- **Controller**: Found at line 107. Permission=`hr:manage`. **Match**
- **Note**: Spec mentions approve/refuse endpoints exist. **Match**

### [POST] `/hr-setup/leave-allocations/:id/refuse`

- **Controller**: Found at line 123. Permission=`hr:manage`. **Match**

### Status Machine

- Spec says: `draft -> approved | refused`, `confirmed -> approved | refused`
- Actual enum `LeaveAllocationStatus` has: `draft`, `confirmed`, `approved`, `refused`. **Match**

---

## HR Setup -- Job Positions

### [GET] `/hr-setup/job-positions`

- **Controller**: Found at `hr-setup/controllers/job-positions.controller.ts:41`
- **Permission**: Actual=`hr:view`. **Match**

### [GET] `/hr-setup/job-positions/:id`

- **Controller**: Found at line 49. Permission=`hr:view`. **Match**

### [POST] `/hr-setup/job-positions`

- **Controller**: Found at line 58. Permission=`hr:manage`. **Match**
- **Request DTO**: `CreateJobPositionDto` -- `nameEn` (required), `nameAr` (required), `departmentId?`. **Match with spec**

### [PUT] `/hr-setup/job-positions/:id`

- **Controller**: Found at line 73. Permission=`hr:manage`. **Match**
- **Request DTO**: `UpdateJobPositionDto` -- all optional + `version` (required). **Match**

### [DELETE] `/hr-setup/job-positions/:id`

- **Controller**: Found at line 90. Permission=`hr:manage`. **Match**

---

## HR Extensions -- Shifts

### [POST] `/hr/shifts`

- **Controller**: Found at `hr-extensions/controllers/shifts.controller.ts:45`
- **Permission**: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `CreateShiftDto`
  - Actual: `nameEn` (required), `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `startTime` (required), `endTime` (required), `breakMinutes?` (@IsInt, @Min(0)), `isOvernight?`, `workingDays?` (number[], @IsInt each, @Min(0)/@Max(6)), `isActive?`
  - Spec: `nameEn, nameAr, startTime, endTime, breakMinutes?, isOvernight?, workingDays?, isActive?`
  - **Differences**: Actual DTO has `descriptionEn?` and `descriptionAr?` fields not listed in spec. Spec says `breakMinutes default 60` -- not validated at DTO level (default is likely in entity/service). Spec says `workingDays default [1,2,3,4,5] (Mon-Fri)` -- default is in service, not DTO.

### [GET] `/hr/shifts`

- **Controller**: Found at line 57. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/hr/shifts/:id`

- **Controller**: Found at line 65. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Response**: Returns shift with working days. **Match**

### [PATCH] `/hr/shifts/:id`

- **Controller**: Found at line 74. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `UpdateShiftDto` extends `PartialType(CreateShiftDto)`. **Missing `version` field** -- inconsistent with project pattern.

### [DELETE] `/hr/shifts/:id`

- **Controller**: Found at line 88. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

### [GET] `/hr/shifts/:id/working-days`

- **Controller**: Found at line 104. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [PUT] `/hr/shifts/:id/working-days`

- **Controller**: Found at line 113. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request Body**: `{ days: number[] }` via `@Body('days')`. **Match**

---

## HR Extensions -- Attendance

### [POST] `/hr/attendance`

- **Controller**: Found at `hr-extensions/controllers/attendance.controller.ts:70`
- **Permission**: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `CreateAttendanceDto` -- `employeeId` (required), `date` (required), `clockIn?`, `clockOut?`, `status?` (AttendanceStatus enum: `present`/`absent`/`late`/`half_day`), `source?` (AttendanceSource enum: `manual`/`device`/`import`), `notes?`
- **Note**: Spec does not detail CreateAttendanceDto fields. Actual has more fields than a basic list would suggest.

### [PATCH] `/hr/attendance/:id`

- **Controller**: Found at line 82. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `UpdateAttendanceDto` extends `PartialType(OmitType(CreateAttendanceDto, ['employeeId', 'date']))`. **Missing `version` field** -- inconsistent with project pattern.

### [GET] `/hr/attendance`

- **Controller**: Found at line 122. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/hr/attendance/:id`

- **Controller**: Found at line 130. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/hr/attendance/reports`

- **Controller**: Found at line 96. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Query DTO**: `AttendanceReportQueryDto` -- `employeeId?`, `fromDate?`, `toDate?`

### [POST] `/hr/attendance/import`

- **Controller**: Found at line 104. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `ImportAttendanceDto` -- `{ records: ImportAttendanceRowDto[] }` where each row has `employeeId`, `date`, `clockIn`, `clockOut`
- **Response**: Spec says `{ success, failed, errors[] }`. **Match** (service returns import results).

### [DELETE] `/hr/attendance/:id`

- **Controller**: Found at line 139. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

---

## HR Extensions -- Contracts

### [POST] `/hr/contracts`

- **Controller**: Found at `hr-extensions/controllers/contracts.controller.ts:43`
- **Permission**: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `CreateContractDto`
  - Actual: `employeeId` (required), `contractType` (required, `ContractType` enum: `full_time`/`part_time`/`temporary`/`seasonal`), `startDate` (required), `endDate?`, `basicSalary` (required, @Min(0)), `housingAllowance?` (@Min(0)), `transportationAllowance?` (@Min(0)), `wageType?` (WageType: `monthly`/`daily`/`hourly`), `wage?`, `salaryStructureId?`, `workingScheduleId?`, `status?` (ContractStatus: `draft`/`active`/`expired`/`cancelled`), `notes?`
  - Spec: **Match** -- all fields align. Spec lists same fields and types.

### [GET] `/hr/contracts`

- **Controller**: Found at line 55. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Query**: Supports `employeeId` and `status` filters. **Match with spec**

### [GET] `/hr/contracts/:id`

- **Controller**: Found at line 66. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [PATCH] `/hr/contracts/:id`

- **Controller**: Found at line 75. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `UpdateContractDto` extends `PartialType(OmitType(CreateContractDto, ['employeeId']))` + `version` (required). **Match**

### [DELETE] `/hr/contracts/:id`

- **Controller**: Found at line 89. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

### Status Machine

- Spec: `draft -> active | cancelled`, `active -> expired | cancelled`
- Actual enum: `draft`, `active`, `expired`, `cancelled`. **Match**

---

## HR Extensions -- Payroll (Old)

### [POST] `/hr/payroll/runs`

- **Controller**: Found at `hr-extensions/controllers/payroll.controller.ts:55`
- **Permission**: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `CreatePayrollRunDto` -- `periodStart` (required), `periodEnd` (required), `notes?`

### [GET] `/hr/payroll/runs`

- **Controller**: Found at line 67. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/hr/payroll/runs/:id`

- **Controller**: Found at line 146. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**

### [GET] `/hr/payroll/reports`

- **Controller**: Found at line 75. Permission: Spec=`hr:view`, Actual=`hr:view`. **Match**
- **Note**: Actual supports `format` query param (`pdf`/`xlsx`) for export. Spec says "Report (PDF/XLSX)". **Match**

### [POST] `/hr/payroll/runs/:id/confirm`

- **Controller**: Found at line 155. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

### [POST] `/hr/payroll/runs/:id/approve`

- **Controller**: Found at line 168. Permission: Spec=`hr:approve`, Actual=`hr:approve`. **Match**

### [POST] `/hr/payroll/runs/:id/mark-paid`

- **Controller**: Found at line 181. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

### [POST] `/hr/payroll/runs/:id/items`

- **Controller**: Found at line 196. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**
- **Request DTO**: `AddPayrollItemDto` -- `employeeId` (required), `itemType?` (PayrollItemType enum), `description?`, `absentDays?`, `bonusAmount?`, `pendingAdvance?`

### [DELETE] `/hr/payroll/runs/:id/items/:itemId`

- **Controller**: Found at line 210. Permission: Spec=`hr:manage`, Actual=`hr:manage`. **Match**

### Status Machine

- Spec: `draft -> confirmed -> approved -> paid`
- Actual enum `PayrollStatus`: `draft`, `confirmed`, `approved`, `paid`. **Match**

---

## HR Extensions -- Training

### [POST] `/hr/training`

- **Controller**: Found at `hr-extensions/controllers/training.controller.ts:43`
- **Permission**: Spec implies `hr:manage`. Actual=`hr:manage`. **Match**
- **Request DTO**: `CreateTrainingDto` -- `employeeId` (required), `courseName` (required), `provider?`, `trainingType?` (TrainingType: `internal`/`external`/`online`), `startDate` (required), `endDate?`, `durationHours?`, `status?` (TrainingStatus: `planned`/`in_progress`/`completed`/`cancelled`), `score?`, `certificateNumber?`, `certificateUrl?`, `certificateExpiry?`, `cost?`, `notes?`. **Match with spec**

### [GET] `/hr/training`

- **Controller**: Found at line 55. Permission=`hr:view`. **Match**

### [GET] `/hr/training/:id`

- **Controller**: Found at line 64. Permission=`hr:view`. **Match**

### [PATCH] `/hr/training/:id`

- **Controller**: Found at line 73. Permission=`hr:manage`. **Match**
- **Request DTO**: `UpdateTrainingDto` extends `PartialType(OmitType(CreateTrainingDto, ['employeeId']))`. **Missing `version` field** -- inconsistent with project pattern.

### [DELETE] `/hr/training/:id`

- **Controller**: Found at line 86. Permission=`hr:manage`. **Match**

---

## Payroll New -- Salary Structures

### [GET] `/salary-structures`

- **Controller**: Found at `payroll-new/controllers/salary-structures.controller.ts:45`
- **Permission**: Spec=`payroll:view`, Actual=`payroll:view`. **Match**

### [GET] `/salary-structures/:id`

- **Controller**: Found at line 53. Permission: Spec=`payroll:view`, Actual=`payroll:view`. **Match**

### [POST] `/salary-structures`

- **Controller**: Found at line 62. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**
- **Request DTO**: `CreateSalaryStructureDto` -- `nameEn` (required), `nameAr` (required), `type?` (SalaryStructureType: `employee`/`worker`/`hourly`), `parentId?`

### [PUT] `/salary-structures/:id`

- **Controller**: Found at line 77. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**
- **Request DTO**: `UpdateSalaryStructureDto` -- all optional + `version` (required). **Match**

### [DELETE] `/salary-structures/:id`

- **Controller**: Found at line 94. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**

### [GET] `/salary-structures/:id/rules`

- **Controller**: Found at line 113. Permission: Spec=`payroll:view`, Actual=`payroll:view`. **Match**

### [POST] `/salary-structures/:id/rules`

- **Controller**: Found at line 122. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**
- **Request DTO**: `CreateSalaryRuleDto` -- `sequence?`, `code` (required), `nameEn` (required), `nameAr` (required), `category` (required, SalaryRuleCategory), `conditionType?`, `conditionPython?`, `computationType?`, `amount?`, `percentBase?`, `percentValue?`, `codePython?`, `appearsOnPayslip?`

---

## Payroll New -- Salary Rules

### [PUT] `/salary-rules/:id`

- **Controller**: Found at `payroll-new/controllers/salary-structures.controller.ts:147` (SalaryRulesController)
- **Permission**: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**
- **Request DTO**: `UpdateSalaryRuleDto` -- all optional + `version` (required). **Match**

### [DELETE] `/salary-rules/:id`

- **Controller**: Found at line 164. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**

---

## Payroll New -- Payslips

### [GET] `/payslips`

- **Controller**: Found at `payroll-new/controllers/payslips.controller.ts:27`
- **Permission**: Spec=`payroll:view`, Actual=`payroll:view`. **Match**
- **Query DTO**: `PayslipFilterDto` extends PaginationDto + `status?` (PayslipStatus), `employeeId?`, `periodStart?`, `periodEnd?`

### [GET] `/payslips/:id`

- **Controller**: Found at line 35. Permission: Spec=`payroll:view`, Actual=`payroll:view`. **Match**
- **Response**: Returns payslip with lines. **Match**

### [POST] `/payslips/generate`

- **Controller**: Found at line 44. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**
- **Request DTO**: `GeneratePayslipsDto` -- `periodStart` (required), `periodEnd` (required), `structureId?`, `branchId?`

### [POST] `/payslips/:id/compute`

- **Controller**: Found at line 59. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**

### [POST] `/payslips/:id/confirm`

- **Controller**: Found at line 75. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**

### [POST] `/payslips/:id/cancel`

- **Controller**: Found at line 91. Permission: Spec=`payroll:manage`, Actual=`payroll:manage`. **Match**

### Status Machine

- Spec: `draft -> confirmed | cancelled`, `confirmed -> cancelled`
- Actual enum `PayslipStatus`: `draft`, `confirmed`, `cancelled`. **Match**

---

## Summary of Issues Found

### Mismatches Between Spec and Actual Code

| #   | Category            | Issue                                                                                                                                     | Severity |
| --- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | Missing `version`   | `UpdateDepartmentDto` does NOT include `version` field for optimistic locking                                                             | Medium   |
| 2   | Missing `version`   | `UpdateShiftDto` (extends PartialType of CreateShiftDto) does NOT include `version` field                                                 | Medium   |
| 3   | Missing `version`   | `UpdateAttendanceDto` does NOT include `version` field                                                                                    | Medium   |
| 4   | Missing `version`   | `UpdateTrainingDto` does NOT include `version` field                                                                                      | Medium   |
| 5   | Undocumented fields | `CreateShiftDto` has `descriptionEn` and `descriptionAr` not listed in spec                                                               | Low      |
| 6   | Undocumented fields | `CreateDepartmentDto` has `descriptionEn`, `descriptionAr`, `managerId`, `parentId` not detailed in spec (spec only shows endpoint table) | Low      |
| 7   | Undocumented fields | `CreateAttendanceDto` has `status`, `source`, `notes` fields not documented in spec                                                       | Low      |

### Missing Endpoints (in spec but not in code): NONE

All endpoints documented in the FRONTEND-SPEC.md exist in the actual backend code.

### Extra Endpoints (in code but not in spec): NONE

All endpoints in the actual code are documented in the FRONTEND-SPEC.md.

### Permissions: ALL MATCH

Every permission string in the spec matches the actual `@Permissions()` decorator in the controller.

### HTTP Methods: ALL MATCH

Every HTTP method (GET/POST/PUT/PATCH/DELETE) in the spec matches the actual decorator.

### Route Paths: ALL MATCH

Every route path in the spec matches the actual `@Controller()` + method decorator.

### Status Machines: ALL MATCH

All documented status machines match the actual enum values.

---

## Recommendations

1. **Add `version` field** to `UpdateDepartmentDto`, `UpdateShiftDto`, `UpdateAttendanceDto`, and `UpdateTrainingDto` to comply with the project's mandatory optimistic locking pattern.
2. **Update FRONTEND-SPEC.md** to document the additional optional fields on `CreateShiftDto` (`descriptionEn`, `descriptionAr`), `CreateDepartmentDto` (full field list), and `CreateAttendanceDto` (`status`, `source`, `notes`).
