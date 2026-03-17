# HR & Payroll Business Rules -- Tatweer ERP Backoffice

> Reference document for frontend implementation. All rules reflect Saudi labor law, GOSI regulations, and Odoo-aligned business logic.

---

## Table of Contents

1. [Leave Management](#1-leave-management)
2. [Contracts](#2-contracts)
3. [Attendance](#3-attendance)
4. [Saudi Payroll Calculation](#4-saudi-payroll-calculation)
5. [Payslip Batch Generation](#5-payslip-batch-generation)
6. [Payroll Run Workflow](#6-payroll-run-workflow)
7. [Employee Lifecycle](#7-employee-lifecycle)
8. [Reference Tables](#8-reference-tables)

---

## 1. Leave Management

### 1.1 Leave Request -- Balance Display

When an employee selects leave dates, show a **live balance summary** that updates as dates change:

```
Annual Leave
  Allocated:    21 days
  Used:         14 days
  Remaining:     7 days
  --------------------------------
  This request:  3 days (Jan 15-17)
  After approval: 4 days remaining
```

**Rules:**

- Balance = allocated - used (approved + pending leaves)
- If `allowNegative = false` for the leave type and balance would go below zero, **block submission** with:
  - "Insufficient leave balance. You have 2 days remaining but this request requires 5 days."
- If `allowNegative = true`, allow submission but show a **warning**: "This request will result in a negative balance of -3 days."
- Pending (not yet approved) leaves count toward "used" in the balance preview to prevent double-booking

### 1.2 Day Count Calculation

The number of leave days is **not** simply end_date minus start_date. The following are excluded:

| Excluded from count | Source                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Public holidays** | `public_holidays` table for the tenant                                                                           |
| **Weekend days**    | Determined by the employee's assigned shift `workingDays` (e.g., if shift is Sun-Thu, then Fri+Sat are weekends) |

**Calculation steps:**

1. Enumerate every calendar day from `startDate` to `endDate` (inclusive)
2. Remove any day that falls on a public holiday
3. Remove any day that is not in the employee's shift `workingDays`
4. Remaining count = leave days consumed

Display the breakdown: "5 calendar days - 1 public holiday - 1 weekend = 3 leave days"

### 1.3 Overlap Detection

Before submission, check for **existing approved or pending leaves** in the same date range for the same employee.

- If overlap found, **block submission** with:
  - "Employee has approved Annual Leave from Jan 15-17. Cannot submit overlapping leave."
- Check must cover partial overlaps (new leave starts or ends within an existing leave period)

### 1.4 Leave Calendar View

Monthly calendar showing all team leaves:

- Each leave type has a **distinct color** (Annual = blue, Sick = red, Emergency = orange, etc.)
- Rows = team members, Columns = days of the month
- Click on a leave block to see details (type, status, dates)
- Filter by: department, leave type, status
- Current day highlighted

### 1.5 Approval Workflow

```
                      +----------+
                      |  Pending |
                      +----+-----+
                           |
              +------------+------------+
              |                         |
        +-----v-----+           +------v------+
        |  Approved  |           |  Rejected   |
        +-----+------+           | (with reason)|
              |                  +-------------+
        +-----v------+
        |  Cancelled  |
        | (returns    |
        |  balance)   |
        +-------------+
```

**Rules:**

- Only **pending** leaves can be approved or rejected
- Rejection **requires a reason** (free-text, minimum 10 characters)
- **Approved** leaves can be cancelled by the employee or HR -- balance is returned immediately
- **Rejected** and **cancelled** leaves are final -- no further transitions
- When a leave is cancelled after approval, the balance recalculation must be reflected immediately in the UI
- Cancelled leaves show the cancellation reason and who cancelled

---

## 2. Contracts

### 2.1 One Active Contract Rule

An employee can have **at most one active contract** at any time.

- When activating a contract, check if the employee has another active contract
- If found, **block activation** with:
  - "Employee already has an active contract (Contract #C-001, expires Mar 30, 2026). Deactivate or expire the existing contract first."
- Draft contracts are allowed to coexist -- the constraint applies only to `active` status

### 2.2 Date Overlap Validation

No two contracts (regardless of status) can have overlapping date ranges for the same employee.

- Check: `new.startDate <= existing.endDate AND new.endDate >= existing.startDate`
- If overlap, **block** with: "Contract dates overlap with existing Contract #C-002 (Jan 1 - Dec 31, 2026)."
- Expired contracts are included in the overlap check to maintain historical integrity

### 2.3 Expiry Alerts

Display expiry warnings on the **employee detail page** and in the **contracts list**:

| Days until expiry | Severity    | Display                                                     |
| ----------------- | ----------- | ----------------------------------------------------------- |
| 30 days           | **Warning** | Orange banner: "Contract expires in 28 days (Apr 15, 2026)" |
| 7 days            | **Urgent**  | Red banner: "Contract expires in 5 days (Mar 22, 2026)"     |
| 0 or past         | **Expired** | Red badge: "EXPIRED" on contract status                     |

- The daily cron job (`ContractExpiryJob` at 01:00 AST) auto-sets contracts to `EXPIRED` when `endDate` passes
- On the **employee list page**, show an icon/indicator next to employees with expiring contracts (within 30 days)

### 2.4 Salary Breakdown Preview

The contract form shows a **live calculation preview** that updates as the user types:

```
Basic Salary:               [________] SAR
Housing Allowance:          [________] SAR   (default: 25% of basic)
Transportation Allowance:   [________] SAR   (default: 10% of basic)
----------------------------------------------------------
Total Gross:                X,XXX.XX SAR     (auto-calculated)

GOSI Employee Deduction:    X,XXX.XX SAR     (Basic x 9.75% if Saudi, 0% if Non-Saudi)
----------------------------------------------------------
Estimated Net:              X,XXX.XX SAR     (Gross - GOSI Employee)
```

**Rules:**

- Housing and transportation fields auto-fill with defaults but are **editable**
- Changing the basic salary recalculates defaults only if the user has not manually edited them
- GOSI rate is auto-detected from the employee's `nationality` field:
  - Saudi nationality: employee pays 9.75% of basic
  - Non-Saudi nationality: employee pays 0%
- Show the GOSI rate percentage next to the amount: "GOSI Employee (9.75%): 975.00 SAR"
- "Estimated Net" is a preview only -- actual net depends on attendance, deductions, bonuses at payroll time

---

## 3. Attendance

### 3.1 Check-in / Check-out

- **Manual entry**: HR or employee enters date, check-in time, check-out time
- **Import from device**: Upload file from fingerprint/biometric device (see section 3.6)
- Each attendance record belongs to one employee + one date
- Multiple records per day are allowed (multiple shifts)

### 3.2 Worked Hours Calculation

```
worked_hours = (check_out - check_in) - break_duration
```

- `break_duration` comes from the employee's assigned shift definition
- If no break is defined on the shift, break_duration = 0
- Display in `HH:MM` format (e.g., "7:30" for 7 hours 30 minutes)

### 3.3 Late Arrival

```
IF check_in > shift.startTime THEN
  late_minutes = check_in - shift.startTime
  status = "Late"
```

- Show late minutes in the attendance row: "Late (23 min)"
- Color the check-in time in **red** when late
- Grace period (if configured in tenant settings) is subtracted before marking late

### 3.4 Early Departure

```
IF check_out < shift.endTime THEN
  early_minutes = shift.endTime - check_out
  status = "Early Departure"
```

- Show early minutes: "Left early (45 min)"
- Color the check-out time in **orange** when early

### 3.5 Overtime Calculation

```
standard_hours = shift.endTime - shift.startTime - shift.breakDuration
IF worked_hours > standard_hours THEN
  overtime_hours = worked_hours - standard_hours
```

**Multiple shifts in the same day:**

- Sum all worked hours across all attendance records for that day
- Total overtime = total_worked - standard_hours (from primary shift)
- Overtime is highlighted in **orange/bold** in the attendance table

**Overtime pay rates (used in payroll):**

| Day type       | Rate multiplier |
| -------------- | --------------- |
| Weekday        | 1.5x            |
| Weekend        | 2.0x            |
| Public holiday | 2.0x            |

### 3.6 Import from File

**Accepted formats:** CSV, Excel (.xlsx)

**Required columns:**

| Column                         | Description                        | Required |
| ------------------------------ | ---------------------------------- | -------- |
| `employeeCode` or `employeeId` | Employee identifier                | Yes      |
| `date`                         | Attendance date (YYYY-MM-DD)       | Yes      |
| `checkIn`                      | Check-in time (HH:MM or HH:MM:SS)  | Yes      |
| `checkOut`                     | Check-out time (HH:MM or HH:MM:SS) | Yes      |

**Import flow:**

1. Upload file
2. Show column mapping preview (auto-detect if column names match)
3. Validate all rows
4. Show results summary:
   - Total rows: 150
   - Successful: 142
   - Failed: 8
5. Failed rows table with error details:
   - Row 23: "Employee code EMP-999 not found"
   - Row 45: "Check-out time is before check-in time"
   - Row 67: "Duplicate attendance record for this employee on this date"
6. Option to download failed rows as CSV for correction and re-import

### 3.7 Monthly Attendance Report

Summary per employee per month:

| Metric               | Description                                           |
| -------------------- | ----------------------------------------------------- |
| Present days         | Days with attendance records                          |
| Absent days          | Working days with no attendance and no approved leave |
| Late arrivals        | Count of days marked late                             |
| Early departures     | Count of days with early departure                    |
| Total overtime hours | Sum of overtime across the month                      |
| Total worked hours   | Sum of all worked hours                               |

- Export to Excel/PDF
- Filter by department, branch, date range

---

## 4. Saudi Payroll Calculation

### 4.1 Payslip Display Structure

Each payslip shows the full breakdown in three sections:

#### Earnings

| Line item                | Calculation                              | Amount (SAR) |
| ------------------------ | ---------------------------------------- | ------------ |
| Basic Salary             | From contract (adjusted for worked days) | X,XXX.XX     |
| Housing Allowance        | From contract                            | X,XXX.XX     |
| Transportation Allowance | From contract                            | X,XXX.XX     |
| Other Allowances         | Sum of additional allowances             | X,XXX.XX     |
| Overtime Pay             | See formula below                        | X,XXX.XX     |
| Bonuses                  | One-time or recurring                    | X,XXX.XX     |
| **Total Gross**          | **Sum of all earnings**                  | **X,XXX.XX** |

#### Deductions

| Line item             | Calculation                | Amount (SAR) |
| --------------------- | -------------------------- | ------------ |
| GOSI Employee (9.75%) | Basic x 9.75% (Saudi only) | X,XXX.XX     |
| Salary Advance        | Capped at 25% of net pay   | X,XXX.XX     |
| Absence Deductions    | (Basic / 30) x absent_days | X,XXX.XX     |
| Late Deductions       | Per policy (configurable)  | X,XXX.XX     |
| Loan Installments     | Monthly installment amount | X,XXX.XX     |
| **Total Deductions**  | **Sum of all deductions**  | **X,XXX.XX** |

#### Summary

|                                              | Amount (SAR) |
| -------------------------------------------- | ------------ |
| **Net Pay = Total Gross - Total Deductions** | **X,XXX.XX** |

#### Employer Costs (shown separately, not deducted from employee)

| Line item              | Calculation    | Amount (SAR) |
| ---------------------- | -------------- | ------------ |
| GOSI Employer (11.75%) | Basic x 11.75% | X,XXX.XX     |

### 4.2 GOSI Calculation Rules

| Employee nationality | Employee share | Employer share |
| -------------------- | -------------- | -------------- |
| **Saudi**            | Basic x 9.75%  | Basic x 11.75% |
| **Non-Saudi**        | 0%             | Basic x 11.75% |

- GOSI is calculated on **basic salary only** -- not on allowances or bonuses
- Nationality is auto-detected from the `nationality` field on the employee record
- Display the rate percentage next to each GOSI line for transparency
- GOSI has a maximum cap based on a salary ceiling (currently 45,000 SAR basic) -- if basic exceeds this, GOSI is calculated on the cap amount

### 4.3 Overtime Pay Formula

```
hourly_rate = basic_salary / 30 / 8

weekday_overtime_pay  = hourly_rate x overtime_hours x 1.5
weekend_overtime_pay  = hourly_rate x overtime_hours x 2.0
holiday_overtime_pay  = hourly_rate x overtime_hours x 2.0
```

- Overtime hours come from attendance records for the payroll period
- Each overtime entry should indicate the day type (weekday/weekend/holiday) for correct rate application

### 4.4 Salary Basis Configuration

Configurable per tenant via settings (`salaryCalculationBasis`):

**Actual days in month:**

```
daily_rate = monthly_salary / actual_days_in_month
salary = daily_rate x worked_days
```

- February = 28 or 29, months vary between 28-31 days

**Fixed 30-day basis:**

```
daily_rate = monthly_salary / 30
salary = daily_rate x worked_days
```

- Every month treated as 30 days regardless of actual calendar days

Display the active basis on the payslip: "Calculated on [actual days / 30-day fixed] basis"

### 4.5 Salary Advance Deduction Cap

- Salary advance deduction in any single month **cannot exceed 25% of net pay**
- If the advance amount exceeds 25%, split into installments automatically
- Show remaining advance balance on the payslip: "Advance balance: 3,000 SAR (2 installments remaining)"

### 4.6 Absence Deduction Formula

```
absence_deduction = (basic_salary / 30) x absent_days
```

- Absent days = working days with no attendance record and no approved leave
- Approved leaves (annual, sick, etc.) are **not** counted as absences
- Show the absent days count on the payslip for transparency

---

## 5. Payslip Batch Generation

### 5.1 Selection Criteria

| Field              | Type                  | Required                   |
| ------------------ | --------------------- | -------------------------- |
| Month              | Dropdown (Jan-Dec)    | Yes                        |
| Year               | Dropdown              | Yes                        |
| Branch             | Multi-select          | No (default: all)          |
| Department         | Multi-select          | No (default: all)          |
| Specific employees | Search + multi-select | No (default: all matching) |

### 5.2 Pre-Generation Preview

Before generating, show a summary:

```
Payslip Generation Preview
----------------------------------------------------------
Period:            March 2026
Employees found:   45
Est. gross payroll: 675,000.00 SAR

Warnings (3):
  - Ahmed Ali (EMP-012): No active contract
  - Sara Hassan (EMP-034): No salary structure assigned
  - Omar Khalid (EMP-056): No attendance records for March 2026
----------------------------------------------------------
[Cancel]                              [Generate Payslips]
```

**Warning categories:**

| Warning                        | Severity         | Effect                                       |
| ------------------------------ | ---------------- | -------------------------------------------- |
| No active contract             | Error (red)      | Employee will be **skipped**                 |
| No salary structure            | Error (red)      | Employee will be **skipped**                 |
| No attendance records          | Warning (orange) | Employee will be included with 0 worked days |
| Contract expires during period | Info (blue)      | Pro-rated salary calculated                  |

### 5.3 Generation Progress

Show a progress bar during batch generation:

```
Generating payslips...
[====================----------] 67%
Processing employee 30 of 45: Mohammed Ahmed
```

- Non-blocking -- user can navigate away and return
- Generation continues in background (Bull queue job)

### 5.4 Results Summary

After generation completes:

```
Payslip Generation Complete
----------------------------------------------------------
Successfully generated:  42 payslips
Total gross amount:      630,000.00 SAR
Total net amount:        548,250.00 SAR

Errors (3):
  - Ahmed Ali (EMP-012): No active contract found
  - Sara Hassan (EMP-034): Salary structure missing
  - Omar Khalid (EMP-056): Contract expired before period start

[View Payslips]  [Export Summary]  [Retry Failed]
----------------------------------------------------------
```

---

## 6. Payroll Run Workflow

### 6.1 Status Flow

```
  +-------+      +-----------+      +----------+      +------+
  | Draft | ---> | Confirmed | ---> | Approved | ---> | Paid |
  +-------+      +-----------+      +----------+      +------+
```

### 6.2 Status Rules

| Status        | Editable                              | Actions available               | Display          |
| ------------- | ------------------------------------- | ------------------------------- | ---------------- |
| **Draft**     | Yes -- add/remove items, edit amounts | Confirm, Delete                 | Gray badge       |
| **Confirmed** | No -- locked for review               | Approve, Reject (back to Draft) | Blue badge       |
| **Approved**  | No                                    | Mark as Paid                    | Green badge      |
| **Paid**      | No -- fully locked                    | None (final state)              | Dark green badge |

### 6.3 Actions at Each Stage

**Draft:**

- Add/remove payslips from the run
- Edit individual payslip amounts (adjustments, corrections)
- Delete the entire run
- Show total payroll amount prominently at the top

**Confirmed:**

- Review-only mode -- all fields disabled
- Summary dashboard:
  - Total gross, total deductions, total net
  - Employee count
  - Department breakdown (pie chart)
  - Comparison with previous month (% change)
- Approve or reject (with reason, returns to Draft)

**Approved:**

- Posts journal entry to accounting automatically:
  - **DR** Salary Expense (total gross)
  - **CR** Salary Payable (total net)
  - **CR** GOSI Payable -- Employee Share (total employee GOSI)
  - **CR** GOSI Payable -- Employer Share (total employer GOSI)
  - **CR** Other Deductions Payable (advances, loans, etc.)
- Show the journal entry reference number
- "Mark as Paid" button

**Paid:**

- Final state -- no further actions
- Show payment date and method
- Individual payslips can be printed/exported

### 6.4 Payroll Run Summary Card

Always visible at the top of the payroll run detail page:

```
+------------------------------------------------------------------+
| Payroll Run: March 2026                        Status: [DRAFT]   |
|------------------------------------------------------------------|
| Employees: 45    |  Gross: 675,000  |  Net: 548,250  |  SAR     |
+------------------------------------------------------------------+
```

---

## 7. Employee Lifecycle

### 7.1 Hiring Flow

```
1. Create Employee
   - Personal info, nationality, ID numbers
   - Assign department + job position

2. Create Contract
   - Start date, end date, probation period
   - Salary structure (basic + allowances)
   - Auto-fill GOSI rates from nationality

3. Activate Contract
   - Validates no other active contract exists
   - Sets employment status to "Active"
   - Employee appears in payroll runs
```

### 7.2 Probation Period

- Contract has a `probationEndDate` field
- If current date is before `probationEndDate`, show on employee detail:

```
+--------------------------------------------------+
| PROBATION PERIOD                                  |
| Started: Jan 1, 2026                              |
| Ends: Mar 31, 2026                                |
| Remaining: 14 days                                |
| [================================------] 84%      |
+--------------------------------------------------+
```

- During probation:
  - Either party can terminate with shorter notice (per Saudi labor law)
  - Annual leave accrual may be different (configurable per leave type)
  - Show "On Probation" badge next to employee name

### 7.3 Termination

When terminating an employee:

1. Set employment status to `terminated`
2. End the active contract (set end date to termination date)
3. Calculate End of Service Compensation (EOSC)
4. Process final payslip with EOSC included

### 7.4 End of Service Compensation (EOSC) Calculator

Based on Saudi Labor Law Article 84:

| Service duration               | Rate                               |
| ------------------------------ | ---------------------------------- |
| Less than 2 years              | 0 (no entitlement)                 |
| 2 to 5 years                   | 15 days salary per year of service |
| First 5 years (when total > 5) | 15 days salary per year            |
| Years after 5th year           | 30 days salary per year            |

**"Salary" for EOSC** = last basic salary + housing allowance + transportation allowance (total gross, not just basic)

**Calculation formula:**

```
IF service_years < 2:
  EOSC = 0

ELSE IF service_years <= 5:
  EOSC = (daily_salary x 15) x service_years

ELSE:
  first_five = (daily_salary x 15) x 5
  remaining  = (daily_salary x 30) x (service_years - 5)
  EOSC = first_five + remaining

WHERE daily_salary = monthly_gross_salary / 30
```

**Partial years** are calculated proportionally (e.g., 3 years 6 months = 3.5 years).

**EOSC Calculator UI:**

```
End of Service Compensation Calculator
----------------------------------------------------------
Employee:          Mohammed Ahmed
Start Date:        Jan 15, 2020
Termination Date:  Mar 17, 2026
Service Duration:  6 years, 2 months (6.17 years)

Monthly Gross:     15,000.00 SAR
Daily Salary:      500.00 SAR (15,000 / 30)

Calculation:
  First 5 years:   500 x 15 x 5 = 37,500.00 SAR
  Remaining 1.17y: 500 x 30 x 1.17 = 17,500.00 SAR
----------------------------------------------------------
  Total EOSC:      55,000.00 SAR
----------------------------------------------------------
```

- Show this calculator on the **termination form** before confirming
- Also available as a standalone tool under HR > Tools > EOSC Calculator (for estimation without actual termination)

### 7.5 Resignation vs Termination EOSC Modifier

Per Saudi Labor Law Article 85, if the **employee resigns** (rather than being terminated), the EOSC is reduced:

| Service duration (resignation) | EOSC entitlement     |
| ------------------------------ | -------------------- |
| Less than 2 years              | 0                    |
| 2 to 5 years                   | 1/3 of the full EOSC |
| 5 to 10 years                  | 2/3 of the full EOSC |
| More than 10 years             | Full EOSC            |

- The termination form should have a **reason dropdown**: Termination by employer, Resignation by employee, End of contract, Mutual agreement
- EOSC calculator adjusts automatically based on the selected reason

---

## 8. Reference Tables

### 8.1 GOSI Rates Summary

| Component                     | Saudi      | Non-Saudi |
| ----------------------------- | ---------- | --------- |
| Employee Annuities            | 9.75%      | 0%        |
| Employer Annuities            | 9.75%      | 0%        |
| Employer SANED (unemployment) | 0.75%      | 0.75%     |
| Employer Occupational Hazards | 1.25%      | 1.25%     |
| **Total Employee**            | **9.75%**  | **0%**    |
| **Total Employer**            | **11.75%** | **2.0%**  |

> Note: The combined employer rate of 11.75% for Saudis includes annuities (9.75%) + SANED (0.75%) + occupational hazards (1.25%). For Non-Saudis, the employer pays only SANED + occupational hazards = 2.0%. The simplified model in section 4.2 uses 11.75% for both to cover worst-case employer cost projection. The actual GOSI calculation should use the correct rates based on nationality.

### 8.2 Leave Types (Default)

| Leave type  | Default allocation (days/year)         | Paid           | Allow negative | Color code |
| ----------- | -------------------------------------- | -------------- | -------------- | ---------- |
| Annual      | 21 (first 5 years), 30 (after 5 years) | Yes            | No             | Blue       |
| Sick        | 30 full pay + 60 at 75%                | Yes (variable) | No             | Red        |
| Emergency   | 5                                      | Yes            | No             | Orange     |
| Maternity   | 70                                     | Yes            | No             | Pink       |
| Paternity   | 3                                      | Yes            | No             | Teal       |
| Hajj        | 10-15 (once during employment)         | Yes            | No             | Green      |
| Marriage    | 5                                      | Yes            | No             | Purple     |
| Bereavement | 5                                      | Yes            | No             | Gray       |
| Unpaid      | Unlimited                              | No             | N/A            | Light gray |

### 8.3 Employment Status Transitions

```
  +--------+      +----------+      +--------+
  | Active | ---> | On Leave | ---> | Active |
  +--------+      +----------+      +--------+
       |
       +----> Suspended ---> Active
       |
       +----> Terminated (final)
       |
       +----> Resigned (final)
```

### 8.4 Overtime Rate Reference

| Scenario                | Multiplier | Formula                   |
| ----------------------- | ---------- | ------------------------- |
| Weekday overtime        | 1.5x       | hourly_rate x hours x 1.5 |
| Weekend overtime        | 2.0x       | hourly_rate x hours x 2.0 |
| Public holiday overtime | 2.0x       | hourly_rate x hours x 2.0 |

Where `hourly_rate = basic_salary / 30 / 8`

### 8.5 Payroll Calendar

| Step                     | Typical timing         | Description                            |
| ------------------------ | ---------------------- | -------------------------------------- |
| Attendance closing       | 1st of following month | Lock attendance for the payroll period |
| Payslip generation       | 2nd-3rd                | Batch generate payslips                |
| Review period            | 3rd-5th                | HR reviews, handles exceptions         |
| Payroll run confirmation | 5th-7th                | Lock for approval                      |
| Approval                 | 7th-10th               | Management approves                    |
| Payment                  | 10th-15th              | Bank transfer / payment processing     |

---

## Appendix: Calculation Examples

### Example A: Saudi Employee Payslip

```
Employee: Ahmed Mohammed (Saudi)
Basic Salary: 10,000 SAR | Housing: 2,500 SAR | Transport: 1,000 SAR
Overtime: 12 hours weekday, 4 hours weekend
Absent: 1 day | Salary Advance: 2,000 SAR

EARNINGS:
  Basic Salary                     10,000.00
  Housing Allowance                 2,500.00
  Transportation Allowance          1,000.00
  Overtime (weekday): 41.67 x 12 x 1.5    750.00
  Overtime (weekend): 41.67 x 4 x 2.0     333.36
  ------------------------------------------------
  Total Gross                      14,583.36

DEDUCTIONS:
  GOSI Employee (9.75% of 10,000)    975.00
  Absence (10,000/30 x 1)            333.33
  Salary Advance                    2,000.00
  ------------------------------------------------
  Total Deductions                  3,308.33

NET PAY:                           11,275.03

EMPLOYER COSTS:
  GOSI Employer (11.75% of 10,000)  1,175.00
```

### Example B: Non-Saudi Employee Payslip

```
Employee: John Smith (Non-Saudi)
Basic Salary: 8,000 SAR | Housing: 2,000 SAR | Transport: 800 SAR
No overtime | No absences | No advances

EARNINGS:
  Basic Salary                      8,000.00
  Housing Allowance                 2,000.00
  Transportation Allowance            800.00
  ------------------------------------------------
  Total Gross                      10,800.00

DEDUCTIONS:
  GOSI Employee (0%)                    0.00
  ------------------------------------------------
  Total Deductions                      0.00

NET PAY:                           10,800.00

EMPLOYER COSTS:
  GOSI Employer (11.75% of 8,000)    940.00
```

### Example C: EOSC -- Resignation after 7 years

```
Monthly Gross: 15,000 SAR
Daily Salary: 500 SAR
Service: 7 years

Full EOSC:
  First 5 years: 500 x 15 x 5 = 37,500
  Next 2 years:  500 x 30 x 2 = 30,000
  Full total:    67,500 SAR

Resignation modifier (5-10 years): 2/3
  Actual EOSC: 67,500 x 2/3 = 45,000 SAR
```
