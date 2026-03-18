export const QUERY_KEYS = {
  // Products & Inventory
  PRODUCTS: "products",
  CATEGORIES_DROPDOWN: "categories-dropdown",

  // Users & Roles
  USERS: "users",
  USERS_LIST: "users-list",
  ROLES: "roles",

  // Accounting — Chart of Accounts
  ACCOUNTS_TREE: "accounts-tree",
  ACCOUNTS_LIST_AS: "accounts-list-as",
  ACCOUNTS_LIST_GL: "accounts-list-gl",
  ACCOUNTS_FOR_JE: "accounts-for-je",

  // Accounting — Journal Entries
  JOURNAL_ENTRIES: "journal-entries",
  COST_CENTERS_FOR_JE: "cost-centers-for-je",
  COST_CENTERS_LIST: "cost-centers-list",
  COST_CENTERS_TREE: "cost-centers-tree",

  // Accounting — Account Groups
  ACCOUNT_GROUPS_TREE: "account-groups-tree",

  // Accounting — Reports
  TRIAL_BALANCE: "trial-balance",
  BALANCE_SHEET: "balance-sheet",
  INCOME_STATEMENT: "income-statement",
  GENERAL_LEDGER: "general-ledger",
  ACCOUNT_STATEMENT: "account-statement",

  // Accounting — Periods
  FISCAL_PERIODS: "fiscal-periods",

  // Accounting — Journals
  JOURNALS_LIST: "journals-list",

  // Accounting — Taxes
  TAX_GROUPS_LIST: "tax-groups-list",
  TAXES_LIST: "taxes-list",

  // Accounting — Payment Terms
  PAYMENT_TERMS_LIST: "payment-terms-list",

  // Accounting — Opening Balances (uses ACCOUNTS_TREE)

  // Accounting — Config
  ACCOUNTING_CONFIG: "accounting-config",

  // Settings
  PROFILE: "profile",
  SESSIONS: "sessions",
  GENERAL_SETTINGS: "generalSettings",
  NOTIFICATION_SETTINGS: "notificationSettings",

  // Branches
  BRANCHES: "branches",

  // Partners
  PARTNERS: "partners",
  CUSTOMERS: "partners-customers",
  VENDORS: "partners-vendors",

  // Projects
  PROJECT_MEMBERS: "project-members",

  // POS Reports
  GIFT_CARDS_REPORT: "gift-cards-report",
  VOUCHERS_REPORT: "vouchers-report",
  LOYALTY_REPORT_CUSTOMERS: "loyalty-report-customers",

  // Treasury
  TREASURY_ACCOUNTS: "treasury-accounts",
  TREASURY_TRANSACTIONS: "treasury-transactions",
  TREASURY_STATEMENT: "treasury-statement",
  TRANSFER_REASONS: "transfer-reasons",
  RECONCILIATIONS: "reconciliations",
  BANK_STATEMENTS: "bank-statements",
  BANK_STATEMENT_LINES: "bank-statement-lines",

  // Invoices
  INVOICES_LIST: "invoices-list",
  INVOICES_SUMMARY: "invoices-summary",
  INVOICE_DETAIL: "invoice-detail",
  PAYMENTS_LIST: "payments-list",

  // Purchase Orders
  PURCHASE_ORDERS_LIST: "purchase-orders-list",
  PURCHASE_ORDERS_SUMMARY: "purchase-orders-summary",
  PURCHASE_ORDER_DETAIL: "purchase-order-detail",

  // HR — Employees
  EMPLOYEES: "employees",
  EMPLOYEES_DROPDOWN: "employees-dropdown",
  DEPARTMENTS: "departments",
  DEPARTMENTS_DROPDOWN: "departments-dropdown",

  // HR — Leaves
  LEAVES: "leaves",
  EMPLOYEE_LEAVES: "employee-leaves",
  LEAVE_BALANCE: "leave-balance",

  // HR — Attendance
  ATTENDANCE: "attendance",
  ATTENDANCE_REPORT: "attendance-report",

  // HR — Contracts
  CONTRACTS: "contracts",

  // HR — Payroll
  PAYROLL_RUNS: "payroll-runs",
  PAYROLL_REPORT: "payroll-report",

  // HR — Training
  TRAINING: "training",

  // HR — Shifts
  SHIFTS: "shifts",

  // HR — Salary Structures
  SALARY_STRUCTURES: "salary-structures",

  // HR — Payslips
  PAYSLIPS: "payslips",

  // HR — Definitions
  JOB_TITLES: "job-titles",
  EMPLOYMENT_TYPES: "employment-types",
  LEAVE_TYPES: "leave-types",
  PUBLIC_HOLIDAYS: "public-holidays",
  TERMINATION_REASONS: "termination-reasons",

  // Inventory — extended
  WAREHOUSES: "warehouses",
  WAREHOUSES_DROPDOWN: "warehouses-dropdown",
  STOCK_LEVELS: "stock-levels",
  LOW_STOCK_ALERTS: "low-stock-alerts",
  STOCK_MOVEMENTS: "stock-movements",
  STOCK_ADJUSTMENTS: "stock-adjustments",
  STOCK_TRANSFERS: "stock-transfers",
  INVENTORY_VALUATION: "inventory-valuation",
  UNITS_OF_MEASURE: "units-of-measure",
  ADJUSTMENT_REASONS: "adjustment-reasons",
} as const;
