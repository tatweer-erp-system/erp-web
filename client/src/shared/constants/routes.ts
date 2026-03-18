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
  CUSTOMER_RECEIPTS: "/sales/customer-receipts",
  CUSTOMER_STATEMENTS: "/sales/customer-statements",
  ALL_VENDORS: "/sales/vendors",
  VENDOR_GROUPS: "/sales/vendor-groups",

  // ── Purchase ────────────────────────────────────────────────────────────────
  VENDORS: "/vendors",
  PURCHASE_ORDERS: "/purchase-orders",
  PURCHASE_INVOICES: "/purchase-invoices",
  PURCHASE_RETURNS: "/purchase-returns",
  VENDOR_PAYMENTS: "/vendor-payments",
  VENDOR_STATEMENTS: "/vendor-statements",

  // ── Inventory ───────────────────────────────────────────────────────────────
  INVENTORY: "/inventory",
  PRODUCTS: "/products",
  PRODUCT_CATEGORIES: "/product-categories",
  UNITS_OF_MEASURE: "/units-of-measure",
  WAREHOUSES: "/warehouses",
  OPENING_STOCK: "/opening-stock",
  STOCK_ADJUSTMENTS: "/stock-adjustments",
  STOCK_TRANSFERS: "/stock-transfers",
  STOCK_COUNT: "/stock-count",
  INVENTORY_VALUATION: "/inventory-valuation",
  STOCK_MOVEMENT: "/stock-movement",

  // ── Accounting ──────────────────────────────────────────────────────────────
  CHART_OF_ACCOUNTS: "/chart-of-accounts",
  JOURNAL_ENTRIES: "/journal-entries",
  OPENING_BALANCES: "/opening-balances",
  PERIOD_CLOSING: "/period-closing",
  ACCOUNT_STATEMENTS: "/account-statements",
  TRIAL_BALANCE: "/trial-balance",
  GENERAL_LEDGER: "/general-ledger",
  INCOME_STATEMENT: "/income-statement",
  BALANCE_SHEET: "/balance-sheet",
  CASH_FLOW: "/cash-flow",

  // ── Treasury ────────────────────────────────────────────────────────────────
  CASH_ACCOUNTS: "/cash-accounts",
  BANK_ACCOUNTS: "/bank-accounts",
  RECEIPTS: "/receipts",
  PAYMENTS: "/payments",
  BANK_TRANSFERS: "/bank-transfers",
  BANK_RECONCILIATION: "/bank-reconciliation",

  // ── Reports ─────────────────────────────────────────────────────────────────
  SALES_REPORTS: "/sales-reports",
  PURCHASE_REPORTS: "/purchase-reports",
  INVENTORY_REPORTS: "/inventory-reports",
  FINANCIAL_REPORTS: "/financial-reports",
  AGING_REPORTS: "/aging-reports",
  TAX_REPORTS: "/tax-reports",
  REPORTS_GENERATOR: "/reports",

  // ── HR ──────────────────────────────────────────────────────────────────────
  EMPLOYEES: "/employees",
  EMPLOYEE_DETAILS: "/employee-details",
  DEPARTMENTS: "/departments",
  JOB_POSITIONS: "/job-positions",
  ATTENDANCE: "/attendance",
  LEAVE_MANAGEMENT: "/leave-management",
  PAYROLL: "/payroll",
  TRAINING: "/training",

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
  SETTINGS_ACCOUNTING: "/settings/accounting",
  settingsAccountingTab: (tab: string) =>
    `/settings/accounting/${tab}` as const,
  SETTINGS_TREASURY: "/settings/treasury",
  settingsTreasuryTab: (tab: string) => `/settings/treasury/${tab}` as const,
  SETTINGS_HR: "/settings/hr",
  settingsHrTab: (tab: string) => `/settings/hr/${tab}` as const,
  SETTINGS_REPORTS: "/settings/reports",
  settingsReportsTab: (tab: string) => `/settings/reports/${tab}` as const,

  // ── Definitions ─────────────────────────────────────────────────────────────
  INVENTORY_DEFINITIONS: "/inventory-definitions",
  SALES_DEFINITIONS: "/sales-definitions",
  PURCHASES_DEFINITIONS: "/purchases-definitions",
  ACCOUNTING_DEFINITIONS: "/accounting-definitions",
  TREASURY_DEFINITIONS: "/treasury-definitions",
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

  // ── Legacy ──────────────────────────────────────────────────────────────────
  INVOICE: "/invoice",

  // ── Error ───────────────────────────────────────────────────────────────────
  NOT_FOUND: "/404",
} as const;
