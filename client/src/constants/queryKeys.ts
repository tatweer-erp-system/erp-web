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
} as const;
