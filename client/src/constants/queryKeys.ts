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

  // Accounting — Reports
  TRIAL_BALANCE: "trial-balance",
  BALANCE_SHEET: "balance-sheet",
  INCOME_STATEMENT: "income-statement",
  GENERAL_LEDGER: "general-ledger",
  ACCOUNT_STATEMENT: "account-statement",

  // Accounting — Periods
  FISCAL_PERIODS: "fiscal-periods",

  // Accounting — Opening Balances (uses ACCOUNTS_TREE)

  // Settings
  PROFILE: "profile",
  SESSIONS: "sessions",
  GENERAL_SETTINGS: "generalSettings",
  NOTIFICATION_SETTINGS: "notificationSettings",

  // Branches
  BRANCHES: "branches",

  // Projects
  PROJECT_MEMBERS: "project-members",

  // POS Reports
  GIFT_CARDS_REPORT: "gift-cards-report",
  VOUCHERS_REPORT: "vouchers-report",
  LOYALTY_REPORT_CUSTOMERS: "loyalty-report-customers",
} as const;
