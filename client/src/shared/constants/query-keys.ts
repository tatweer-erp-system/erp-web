/**
 * Centralized React Query keys.
 * Every useQuery / useInfiniteQuery call MUST reference a key from here.
 * Grouped by domain module as nested `as const` objects.
 */

export const queryKeys = {
  auth: {
    session: ["auth", "session"],
    profile: ["auth", "profile"],
    sessions: ["auth", "sessions"],
  },

  products: {
    all: ["products"],
    list: (params?: Record<string, unknown>) => ["products", "list", params],
    detail: (id: string) => ["products", "detail", id],
    categories: ["products", "categories"],
    categoriesDropdown: ["products", "categories-dropdown"],
    brands: ["products", "brands"],
    variants: (productId: string) => ["products", "variants", productId],
  },

  partners: {
    customers: ["partners", "customers"],
    customerList: (params?: Record<string, unknown>) => [
      "partners",
      "customers",
      "list",
      params,
    ],
    customerDetail: (id: string) => ["partners", "customers", id],
    customerGroups: ["partners", "customer-groups"],
    vendors: ["partners", "vendors"],
    vendorList: (params?: Record<string, unknown>) => [
      "partners",
      "vendors",
      "list",
      params,
    ],
    vendorDetail: (id: string) => ["partners", "vendors", id],
    vendorGroups: ["partners", "vendor-groups"],
  },

  invoices: {
    sales: ["invoices", "sales"],
    salesList: (params?: Record<string, unknown>) => [
      "invoices",
      "sales",
      "list",
      params,
    ],
    purchase: ["invoices", "purchase"],
    purchaseList: (params?: Record<string, unknown>) => [
      "invoices",
      "purchase",
      "list",
      params,
    ],
    detail: (id: string) => ["invoices", "detail", id],
  },

  saleOrders: {
    all: ["sale-orders"],
    list: (params?: Record<string, unknown>) => ["sale-orders", "list", params],
    detail: (id: string) => ["sale-orders", "detail", id],
    dropdown: ["sale-orders", "dropdown"],
    pending: ["sale-orders", "pending"],
    completed: ["sale-orders", "completed"],
    quotations: ["sale-orders", "quotations"],
    quotationList: (params?: Record<string, unknown>) => [
      "sale-orders",
      "quotations",
      "list",
      params,
    ],
    quotationDetail: (id: string) => ["sale-orders", "quotations", id],
    quotationDropdown: ["sale-orders", "quotations", "dropdown"],
  },

  purchaseOrders: {
    all: ["purchase-orders"],
    list: (params?: Record<string, unknown>) => [
      "purchase-orders",
      "list",
      params,
    ],
    detail: (id: string) => ["purchase-orders", "detail", id],
  },

  accounting: {
    accountsTree: ["accounting", "accounts-tree"],
    accountsList: ["accounting", "accounts-list"],
    accountsForJe: ["accounting", "accounts-for-je"],
    journalEntries: ["accounting", "journal-entries"],
    journalEntryList: (params?: Record<string, unknown>) => [
      "accounting",
      "journal-entries",
      "list",
      params,
    ],
    journalEntryDetail: (id: string) => ["accounting", "journal-entries", id],
    costCenters: ["accounting", "cost-centers"],
    costCentersForJe: ["accounting", "cost-centers-for-je"],
    fiscalPeriods: ["accounting", "fiscal-periods"],
    openingBalances: ["accounting", "opening-balances"],
    trialBalance: (params?: Record<string, unknown>) => [
      "accounting",
      "trial-balance",
      params,
    ],
    balanceSheet: (params?: Record<string, unknown>) => [
      "accounting",
      "balance-sheet",
      params,
    ],
    incomeStatement: (params?: Record<string, unknown>) => [
      "accounting",
      "income-statement",
      params,
    ],
    generalLedger: (params?: Record<string, unknown>) => [
      "accounting",
      "general-ledger",
      params,
    ],
    accountStatement: (params?: Record<string, unknown>) => [
      "accounting",
      "account-statement",
      params,
    ],
    cashFlow: (params?: Record<string, unknown>) => [
      "accounting",
      "cash-flow",
      params,
    ],
    config: ["accounting", "config"],
  },

  inventory: {
    warehouses: ["inventory", "warehouses"],
    unitsOfMeasure: ["inventory", "units-of-measure"],
    stockAdjustments: ["inventory", "stock-adjustments"],
    stockTransfers: ["inventory", "stock-transfers"],
    stockCount: ["inventory", "stock-count"],
    openingStock: ["inventory", "opening-stock"],
    valuation: ["inventory", "valuation"],
    movement: (params?: Record<string, unknown>) => [
      "inventory",
      "movement",
      params,
    ],
  },

  hr: {
    employees: ["hr", "employees"],
    employeeList: (params?: Record<string, unknown>) => [
      "hr",
      "employees",
      "list",
      params,
    ],
    employeeDetail: (id: string) => ["hr", "employees", id],
    departments: ["hr", "departments"],
    jobPositions: ["hr", "job-positions"],
    attendance: ["hr", "attendance"],
    leaves: ["hr", "leaves"],
    training: ["hr", "training"],
  },

  payroll: {
    runs: ["payroll", "runs"],
    runDetail: (id: string) => ["payroll", "runs", id],
    slips: (runId: string) => ["payroll", "slips", runId],
  },

  reports: {
    sales: ["reports", "sales"],
    purchase: ["reports", "purchase"],
    inventory: ["reports", "inventory"],
    financial: ["reports", "financial"],
    aging: ["reports", "aging"],
    tax: ["reports", "tax"],
    giftCards: ["reports", "gift-cards"],
    vouchers: ["reports", "vouchers"],
    loyaltyCustomers: ["reports", "loyalty-customers"],
    hourlySales: ["reports", "hourly-sales"],
    paymentBreakdown: ["reports", "payment-breakdown"],
    cashMovements: ["reports", "cash-movements"],
    tableTurnover: ["reports", "table-turnover"],
  },

  settings: {
    general: ["settings", "general"],
    notifications: ["settings", "notifications"],
    sequences: ["settings", "sequences"],
    taxes: ["settings", "taxes"],
    priceLists: ["settings", "price-lists"],
    numberingSeries: ["settings", "numbering-series"],
    company: ["settings", "company"],
    moduleConfig: (module: string) => ["settings", "module", module],
  },

  branches: {
    all: ["branches"],
    list: (params?: Record<string, unknown>) => ["branches", "list", params],
    detail: (id: string) => ["branches", id],
  },

  users: {
    all: ["users"],
    list: (params?: Record<string, unknown>) => ["users", "list", params],
    detail: (id: string) => ["users", id],
    roles: ["users", "roles"],
    permissions: ["users", "permissions"],
    auditLogs: ["users", "audit-logs"],
    projectMembers: ["users", "project-members"],
  },

  chat: {
    conversations: ["chat", "conversations"],
    messages: (conversationId: string) => ["chat", "messages", conversationId],
    unreadCount: ["chat", "unread-count"],
  },

  treasury: {
    cashAccounts: ["treasury", "cash-accounts"],
    bankAccounts: ["treasury", "bank-accounts"],
    receipts: ["treasury", "receipts"],
    payments: ["treasury", "payments"],
    bankTransfers: ["treasury", "bank-transfers"],
    reconciliation: ["treasury", "reconciliation"],
  },
} as const;

/** @deprecated Use `queryKeys` instead — re-exported for backward compatibility */
export { QUERY_KEYS } from "@/constants/queryKeys";
