/**
 * Centralized route path constants.
 * Every <Link>, navigate(), and route definition should reference these.
 */

export const ROUTES = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  LOGIN: "/login",

  // ── Main ────────────────────────────────────────────────────────────────────
  DASHBOARD: "/",
  NOTIFICATIONS: "/notifications",
  CHAT: "/chat",
  DOCUMENTS: "/documents",
  ANALYTICS: "/analytics",
  SHOWCASE: "/showcase",

  // ── Sales ───────────────────────────────────────────────────────────────────
  ALL_CUSTOMERS: "/sales/customers",
  CUSTOMER_GROUPS: "/sales/customer-groups",
  CUSTOMER_DETAILS: "/sales/customers",
  CUSTOMER_CREATE: "/sales/customers/create",
  customerDetail: (id: string) => `/sales/customers/${id}` as const,
  VENDOR_DETAILS: "/sales/vendors",
  vendorDetail: (id: string) => `/sales/vendors/${id}` as const,
  ALL_ORDERS: "/sales/orders",
  PENDING_ORDERS: "/sales/orders/pending",
  COMPLETED_ORDERS: "/sales/orders/completed",
  ORDER_DETAILS: "/sales/orders",
  ORDER_CREATE: "/sales/orders/create",
  orderDetail: (id: string) => `/sales/orders/${id}` as const,
  QUOTATIONS: "/sales/quotations",
  QUOTATION_CREATE: "/sales/quotations/create",
  quotationDetail: (id: string) => `/sales/quotations/${id}` as const,
  SALES_INVOICES: "/sales/invoices",
  SALES_RETURNS: "/sales/returns",
  CUSTOMER_RECEIPTS: "/treasury/customer-receipts",
  CUSTOMER_STATEMENTS: "/sales/customer-statements",
  ALL_VENDORS: "/sales/vendors",
  VENDOR_GROUPS: "/sales/vendor-groups",

  // ── Purchases ───────────────────────────────────────────────────────────────
  VENDORS: "/purchases/vendors",
  PURCHASE_ORDERS: "/purchases/orders",
  PURCHASE_INVOICES: "/purchases/invoices",
  PURCHASE_RETURNS: "/purchases/returns",
  VENDOR_PAYMENTS: "/purchases/vendor-payments",
  VENDOR_STATEMENTS: "/purchases/vendor-statements",

  // ── Inventory ───────────────────────────────────────────────────────────────
  INVENTORY: "/inventory",
  PRODUCTS: "/inventory/products",
  PRODUCT_CATEGORIES: "/inventory/product-categories",
  UNITS_OF_MEASURE: "/inventory/units-of-measure",
  WAREHOUSES: "/inventory/warehouses",
  OPENING_STOCK: "/inventory/opening-stock",
  STOCK_ADJUSTMENTS: "/inventory/stock-adjustments",
  STOCK_TRANSFERS: "/inventory/stock-transfers",
  STOCK_COUNT: "/inventory/stock-count",
  INVENTORY_VALUATION: "/inventory/valuation",
  STOCK_MOVEMENT: "/inventory/stock-movement",
  DELIVERIES: "/inventory/deliveries",

  // ── Accounting ──────────────────────────────────────────────────────────────
  CHART_OF_ACCOUNTS: "/accounting/chart-of-accounts",
  JOURNAL_ENTRIES: "/accounting/journal-entries",
  COST_CENTERS: "/accounting/cost-centers",
  FISCAL_PERIODS: "/accounting/fiscal-periods",
  JOURNALS: "/accounting/journals",
  ACCOUNT_GROUPS: "/accounting/account-groups",
  TAXES_SETUP: "/accounting/taxes-setup",
  PAYMENT_TERMS: "/accounting/payment-terms",
  TRIAL_BALANCE: "/accounting/trial-balance",
  GENERAL_LEDGER: "/accounting/general-ledger",
  INCOME_STATEMENT: "/accounting/income-statement",
  BALANCE_SHEET: "/accounting/balance-sheet",
  ACCOUNT_STATEMENTS: "/accounting/account-statements",
  CASH_FLOW: "/accounting/cash-flow",
  OPENING_BALANCES: "/accounting/opening-balances",

  // ── Treasury ────────────────────────────────────────────────────────────────
  CASH_ACCOUNTS: "/treasury/cash-accounts",
  BANK_ACCOUNTS: "/treasury/bank-accounts",
  RECEIPTS: "/treasury/receipts",
  PAYMENTS: "/treasury/payments",
  BANK_TRANSFERS: "/treasury/bank-transfers",
  BANK_RECONCILIATION: "/treasury/bank-reconciliation",
  CUSTOMER_RECEIPTS_TREASURY: "/treasury/customer-receipts",
  VENDOR_PAYMENTS_TREASURY: "/treasury/vendor-payments",

  // ── Reports ─────────────────────────────────────────────────────────────────
  SALES_REPORTS: "/sales-reports",
  PURCHASE_REPORTS: "/purchase-reports",
  INVENTORY_REPORTS: "/inventory-reports",
  FINANCIAL_REPORTS: "/financial-reports",
  AGING_REPORTS: "/aging-reports",
  TAX_REPORTS: "/tax-reports",
  REPORTS_GENERATOR: "/reports",

  // ── HR ──────────────────────────────────────────────────────────────────────
  EMPLOYEES: "/hr/employees",
  EMPLOYEE_DETAILS: "/hr/employees",
  employeeDetail: (id: string) => `/hr/employees/${id}` as const,
  DEPARTMENTS: "/hr/departments",
  JOB_POSITIONS: "/hr/job-positions",
  ATTENDANCE: "/hr/attendance",
  LEAVE_MANAGEMENT: "/hr/leave-management",
  PAYROLL: "/hr/payroll",
  CONTRACTS: "/hr/contracts",
  TRAINING: "/hr/training",

  // ── System Settings ─────────────────────────────────────────────────────────
  SETTINGS: "/settings",
  APP_SETTINGS: "/app-settings",
  SYSTEM_SETTINGS: "/system-settings",
  BRANCHES: "/branches",
  TAXES: "/taxes",
  NUMBERING_SERIES: "/numbering-series",
  SEQUENCE_SETTINGS: "/settings/sequences",
  PRICE_LISTS: "/sales/pricelists",
  PRICELIST_CREATE: "/sales/pricelists/create",
  pricelistDetail: (id: string) => `/sales/pricelists/${id}` as const,
  USERS: "/users",
  ROLES_PERMISSIONS: "/roles-permissions",
  AUDIT_LOGS: "/audit-logs",

  // ── My Settings ─────────────────────────────────────────────────────────────
  MY_SETTINGS: "/my-settings",
  mySettingsTab: (tab: string) => `/my-settings/${tab}` as const,

  // ── Settings sub-pages ──────────────────────────────────────────────────────
  SETTINGS_COMPANY: "/settings/company",
  settingsCompanyTab: (tab: string) => `/settings/company/${tab}` as const,
  SETTINGS_USERS: "/settings/users",
  settingsUsersTab: (tab: string) => `/settings/users/${tab}` as const,
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  settingsNotificationsTab: (tab: string) =>
    `/settings/notifications/${tab}` as const,
  SETTINGS_BILLING: "/settings/billing",
  settingsBillingTab: (tab: string) => `/settings/billing/${tab}` as const,

  // ── Module Settings ─────────────────────────────────────────────────────────
  SETTINGS_INVENTORY: "/settings/inventory",
  settingsInventoryTab: (tab: string) => `/settings/inventory/${tab}` as const,
  SETTINGS_SALES: "/settings/sales",
  settingsSalesTab: (tab: string) => `/settings/sales/${tab}` as const,
  SETTINGS_PURCHASES: "/settings/purchases",
  settingsPurchasesTab: (tab: string) => `/settings/purchases/${tab}` as const,
  SETTINGS_ACCOUNTING: "/accounting/settings",
  settingsAccountingTab: (tab: string) =>
    `/accounting/settings/${tab}` as const,
  SETTINGS_HR: "/settings/hr",
  settingsHrTab: (tab: string) => `/settings/hr/${tab}` as const,
  SETTINGS_REPORTS: "/settings/reports",
  settingsReportsTab: (tab: string) => `/settings/reports/${tab}` as const,

  // ── Definitions ─────────────────────────────────────────────────────────────
  INVENTORY_DEFINITIONS: "/inventory-definitions",
  SALES_DEFINITIONS: "/sales-definitions",
  PURCHASES_DEFINITIONS: "/purchases-definitions",
  HR_DEFINITIONS: "/hr-definitions",
  REPORTS_DEFINITIONS: "/reports-definitions",

  // ── POS ─────────────────────────────────────────────────────────────────────
  POS_LOYALTY_REPORT: "/pos/loyalty-report",
  POS_VOUCHERS_REPORT: "/pos/reports/vouchers",
  POS_GIFT_CARDS_REPORT: "/pos/reports/gift-cards",
  POS_HOURLY_SALES_REPORT: "/pos/reports/hourly",
  POS_PAYMENT_BREAKDOWN: "/pos/reports/payments",
  POS_CASH_MOVEMENTS: "/pos/reports/cash-movements",
  POS_TABLE_TURNOVER: "/pos/reports/table-turnover",

  // ── Deliveries (alias — use ROUTES.DELIVERIES from Inventory section)
  SALES_DELIVERIES: "/inventory/deliveries",

  // ── CRM ────────────────────────────────────────────────────────────────────
  CRM_LEADS: "/crm/leads",
  CRM_PIPELINE: "/crm/pipeline",

  // ── Legacy ──────────────────────────────────────────────────────────────────
  INVOICE: "/invoice",

  // ── Error ───────────────────────────────────────────────────────────────────
  NOT_FOUND: "/404",
} as const;
