import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import type { Permission } from "@/types/auth";

export interface RouteConfig {
  path: string;
  component: LazyExoticComponent<ComponentType>;
  permissions?: Permission[];
  breadcrumb: string[];
}

const lz = (fn: () => Promise<{ default: ComponentType }>) =>
  lazy(fn) as LazyExoticComponent<ComponentType>;

export const routes: RouteConfig[] = [
  // ── POS ─────────────────────────────────────────────────────────────────────
  {
    path: "/pos/loyalty-report",
    component: lz(() => import("@/modules/pos/pages/LoyaltyReport")),
    breadcrumb: ["POS", "Loyalty Report"],
  },
  {
    path: "/pos/reports/vouchers",
    component: lz(() => import("@/modules/pos/pages/reports/VouchersReport")),
    breadcrumb: ["POS", "Vouchers Report"],
  },
  {
    path: "/pos/reports/gift-cards",
    component: lz(() => import("@/modules/pos/pages/reports/GiftCardsReport")),
    breadcrumb: ["POS", "Gift Cards Report"],
  },
  {
    path: "/pos/reports/hourly",
    component: lz(
      () => import("@/modules/pos/pages/reports/HourlySalesReport")
    ),
    breadcrumb: ["POS", "Hourly Sales Report"],
  },
  {
    path: "/pos/reports/payments",
    component: lz(
      () => import("@/modules/pos/pages/reports/PaymentBreakdownReport")
    ),
    breadcrumb: ["POS", "Payment Breakdown"],
  },
  {
    path: "/pos/reports/cash-movements",
    component: lz(
      () => import("@/modules/pos/pages/reports/CashMovementsReport")
    ),
    breadcrumb: ["POS", "Cash Movements"],
  },
  {
    path: "/pos/reports/table-turnover",
    component: lz(
      () => import("@/modules/pos/pages/reports/TableTurnoverReport")
    ),
    breadcrumb: ["POS", "Table Turnover"],
  },
  // ── Main ────────────────────────────────────────────────────────────────────
  {
    path: "/",
    component: lz(() => import("@/pages/Dashboard")),
    breadcrumb: ["Dashboard"],
  },
  {
    path: "/notifications",
    component: lz(() => import("@/pages/Notifications")),
    breadcrumb: ["Notifications"],
  },
  {
    path: "/chat",
    component: lz(() => import("@/pages/Chat")),
    breadcrumb: ["Chat"],
  },
  {
    path: "/documents",
    component: lz(() => import("@/pages/Documents")),
    breadcrumb: ["Documents"],
  },
  {
    path: "/inventory",
    component: lz(() => import("@/pages/Inventory")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory"],
  },
  {
    path: "/analytics",
    component: lz(() => import("@/pages/Analytics")),
    breadcrumb: ["Analytics"],
  },
  {
    path: "/settings",
    component: lz(() => import("@/pages/Settings")),
    breadcrumb: ["Settings"],
  },
  {
    path: "/showcase",
    component: lz(() => import("@/pages/Showcase")),
    breadcrumb: ["Showcase"],
  },

  // ── Sales ───────────────────────────────────────────────────────────────────
  {
    path: "/sales/customers",
    component: lz(() => import("@/pages/AllCustomers")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Customers"],
  },
  {
    path: "/sales/customers/create",
    component: lz(() => import("@/pages/CustomerCreatePage")),
    permissions: ["sales:manage"],
    breadcrumb: ["Sales", "Customers", "Create"],
  },
  {
    path: "/sales/customers/:id",
    component: lz(() => import("@/pages/CustomerDetails")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Customers", "Detail"],
  },
  {
    path: "/sales/orders",
    component: lz(() => import("@/pages/AllOrders")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Orders"],
  },
  {
    path: "/sales/orders/create",
    component: lz(() => import("@/pages/sales/SalesOrderCreatePage")),
    permissions: ["sales:manage"],
    breadcrumb: ["Sales", "Orders", "Create"],
  },
  {
    path: "/sales/orders/:id",
    component: lz(() => import("@/pages/sales/SalesOrderDetailPage")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Orders", "Detail"],
  },
  {
    path: "/sales/quotations",
    component: lz(() => import("@/pages/Quotations")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Quotations"],
  },
  {
    path: "/sales/quotations/create",
    component: lz(() => import("@/pages/sales/SalesOrderCreatePage")),
    permissions: ["sales:manage"],
    breadcrumb: ["Sales", "Quotations", "Create"],
  },
  {
    path: "/sales/quotations/:id",
    component: lz(() => import("@/pages/sales/QuotationDetailPage")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Quotations", "Detail"],
  },
  {
    path: "/sales/pricelists",
    component: lz(() => import("@/pages/pricelists/PricelistsPage")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Pricelists"],
  },
  {
    path: "/sales/pricelists/create",
    component: lz(() => import("@/pages/pricelists/PricelistCreatePage")),
    permissions: ["sales:manage"],
    breadcrumb: ["Sales", "Pricelists", "Create"],
  },
  {
    path: "/sales/pricelists/:id",
    component: lz(() => import("@/pages/pricelists/PricelistDetailPage")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Pricelists", "Detail"],
  },
  {
    path: "/sales/invoices",
    component: lz(() => import("@/pages/SalesInvoices")),
    permissions: ["sales:read"],
    breadcrumb: ["Sales", "Invoices"],
  },

  // ── CRM ─────────────────────────────────────────────────────────────────────
  {
    path: "/crm/pipeline",
    component: lz(() => import("@/pages/CrmPipeline")),
    permissions: ["crm:read"],
    breadcrumb: ["CRM", "Pipeline"],
  },
  {
    path: "/crm/leads",
    component: lz(() => import("@/pages/CrmLeads")),
    permissions: ["crm:read"],
    breadcrumb: ["CRM", "Leads"],
  },

  // ── Purchases ───────────────────────────────────────────────────────────────
  {
    path: "/purchases/orders",
    component: lz(() => import("@/pages/PurchaseOrders")),
    permissions: ["purchases:read"],
    breadcrumb: ["Purchases", "Orders"],
  },
  {
    path: "/purchases/invoices",
    component: lz(() => import("@/pages/PurchaseInvoices")),
    permissions: ["purchases:read"],
    breadcrumb: ["Purchases", "Invoices"],
  },
  {
    path: "/purchases/returns",
    component: lz(() => import("@/pages/PurchaseReturns")),
    permissions: ["purchases:read"],
    breadcrumb: ["Purchases", "Returns"],
  },
  {
    path: "/purchases/vendor-payments",
    component: lz(() => import("@/pages/VendorPayments")),
    permissions: ["purchases:read"],
    breadcrumb: ["Purchases", "Vendor Payments"],
  },

  // ── Inventory ───────────────────────────────────────────────────────────────
  {
    path: "/inventory/products",
    component: lz(() => import("@/pages/ProductDetails")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Products"],
  },
  {
    path: "/inventory/product-categories",
    component: lz(() => import("@/pages/ProductCategories")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Categories"],
  },
  {
    path: "/inventory/warehouses",
    component: lz(() => import("@/pages/Warehouses")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Warehouses"],
  },
  {
    path: "/inventory/opening-stock",
    component: lz(() => import("@/pages/OpeningStock")),
    permissions: ["inventory:write"],
    breadcrumb: ["Inventory", "Opening Stock"],
  },
  {
    path: "/inventory/stock-adjustments",
    component: lz(() => import("@/pages/StockAdjustments")),
    permissions: ["inventory:write"],
    breadcrumb: ["Inventory", "Adjustments"],
  },
  {
    path: "/inventory/stock-transfers",
    component: lz(() => import("@/pages/StockTransfers")),
    permissions: ["inventory:write"],
    breadcrumb: ["Inventory", "Transfers"],
  },
  {
    path: "/inventory/valuation",
    component: lz(() => import("@/pages/InventoryValuation")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Valuation"],
  },
  {
    path: "/inventory/stock-movement",
    component: lz(() => import("@/pages/StockMovement")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Movement"],
  },
  {
    path: "/inventory/deliveries",
    component: lz(() => import("@/pages/Deliveries")),
    permissions: ["inventory:read"],
    breadcrumb: ["Inventory", "Deliveries"],
  },

  // ── Accounting ──────────────────────────────────────────────────────────────
  {
    path: "/accounting/chart-of-accounts",
    component: lz(() => import("@/pages/ChartOfAccounts")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Chart of Accounts"],
  },
  {
    path: "/accounting/opening-balances",
    component: lz(() => import("@/pages/OpeningBalances")),
    permissions: ["accounting:write"],
    breadcrumb: ["Accounting", "Opening Balances"],
  },
  {
    path: "/accounting/journal-entries",
    component: lz(() => import("@/pages/JournalEntries")),
    permissions: ["accounting:write"],
    breadcrumb: ["Accounting", "Journal Entries"],
  },
  {
    path: "/accounting/cost-centers",
    component: lz(() => import("@/pages/CostCenters")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Cost Centers"],
  },
  {
    path: "/accounting/fiscal-periods",
    component: lz(() => import("@/pages/FiscalPeriods")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Fiscal Periods"],
  },
  {
    path: "/accounting/journals",
    component: lz(() => import("@/pages/Journals")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Journals"],
  },
  {
    path: "/accounting/account-groups",
    component: lz(() => import("@/pages/AccountGroups")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Account Groups"],
  },
  {
    path: "/accounting/taxes-setup",
    component: lz(() => import("@/pages/TaxesSetup")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Taxes"],
  },
  {
    path: "/accounting/payment-terms",
    component: lz(() => import("@/pages/PaymentTerms")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Payment Terms"],
  },
  {
    path: "/accounting/trial-balance",
    component: lz(() => import("@/pages/TrialBalance")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Trial Balance"],
  },
  {
    path: "/accounting/general-ledger",
    component: lz(() => import("@/pages/GeneralLedger")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "General Ledger"],
  },
  {
    path: "/accounting/income-statement",
    component: lz(() => import("@/pages/IncomeStatement")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Income Statement"],
  },
  {
    path: "/accounting/balance-sheet",
    component: lz(() => import("@/pages/BalanceSheet")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Balance Sheet"],
  },
  {
    path: "/accounting/account-statements",
    component: lz(() => import("@/pages/AccountStatements")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Account Statements"],
  },
  {
    path: "/accounting/cash-flow",
    component: lz(() => import("@/pages/CashFlow")),
    permissions: ["accounting:read"],
    breadcrumb: ["Accounting", "Cash Flow"],
  },

  // ── Treasury ────────────────────────────────────────────────────────────────
  {
    path: "/treasury/cash-accounts",
    component: lz(() => import("@/pages/CashAccounts")),
    permissions: ["treasury:read"],
    breadcrumb: ["Treasury", "Cash Accounts"],
  },
  {
    path: "/treasury/bank-accounts",
    component: lz(() => import("@/pages/BankAccounts")),
    permissions: ["treasury:read"],
    breadcrumb: ["Treasury", "Bank Accounts"],
  },
  {
    path: "/treasury/receipts",
    component: lz(() => import("@/pages/Receipts")),
    permissions: ["treasury:read"],
    breadcrumb: ["Treasury", "Receipts"],
  },
  {
    path: "/treasury/payments",
    component: lz(() => import("@/pages/Payments")),
    permissions: ["treasury:write"],
    breadcrumb: ["Treasury", "Payments"],
  },
  {
    path: "/treasury/bank-transfers",
    component: lz(() => import("@/pages/BankTransfers")),
    permissions: ["treasury:write"],
    breadcrumb: ["Treasury", "Bank Transfers"],
  },
  {
    path: "/treasury/bank-reconciliation",
    component: lz(() => import("@/pages/BankReconciliation")),
    permissions: ["treasury:write"],
    breadcrumb: ["Treasury", "Reconciliation"],
  },
  {
    path: "/treasury/customer-receipts",
    component: lz(() => import("@/pages/CustomerReceipts")),
    permissions: ["treasury:read"],
    breadcrumb: ["Treasury", "Customer Receipts"],
  },
  {
    path: "/treasury/vendor-payments",
    component: lz(() => import("@/pages/VendorPayments")),
    permissions: ["treasury:read"],
    breadcrumb: ["Treasury", "Vendor Payments"],
  },

  // ── Reports ─────────────────────────────────────────────────────────────────
  {
    path: "/sales-reports",
    component: lz(() => import("@/pages/SalesReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Sales"],
  },
  {
    path: "/purchase-reports",
    component: lz(() => import("@/pages/PurchaseReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Purchase"],
  },
  {
    path: "/inventory-reports",
    component: lz(() => import("@/pages/InventoryReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Inventory"],
  },
  {
    path: "/financial-reports",
    component: lz(() => import("@/pages/FinancialReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Financial"],
  },
  {
    path: "/aging-reports",
    component: lz(() => import("@/pages/AgingReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Aging"],
  },
  {
    path: "/tax-reports",
    component: lz(() => import("@/pages/TaxReports")),
    permissions: ["reports:read"],
    breadcrumb: ["Reports", "Tax"],
  },

  // ── System Settings ─────────────────────────────────────────────────────────
  {
    path: "/branches",
    component: lz(() => import("@/pages/Branches")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Branches"],
  },
  {
    path: "/taxes",
    component: lz(() => import("@/pages/Taxes")),
    permissions: ["settings:write"],
    breadcrumb: ["Settings", "Taxes"],
  },
  {
    path: "/settings/sequences",
    component: lz(() => import("@/pages/SequenceSettings")),
    permissions: ["settings:write"],
    breadcrumb: ["Settings", "Sequence Settings"],
  },
  {
    path: "/users",
    component: lz(() => import("@/pages/Users")),
    permissions: ["users:read"],
    breadcrumb: ["Settings", "Users"],
  },
  {
    path: "/roles-permissions",
    component: lz(() => import("@/pages/RolesPermissions")),
    permissions: ["users:write"],
    breadcrumb: ["Settings", "Roles & Permissions"],
  },
  {
    path: "/audit-logs",
    component: lz(() => import("@/pages/AuditLogs")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Audit Logs"],
  },

  // ── HR ──────────────────────────────────────────────────────────────────────
  {
    path: "/hr/employees",
    component: lz(() => import("@/pages/EmployeeManagement")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "All Employees"],
  },
  {
    path: "/hr/employees/:id",
    component: lz(() => import("@/pages/EmployeeDetails")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Employees", "Detail"],
  },
  {
    path: "/hr/departments",
    component: lz(() => import("@/pages/EmployeeManagement")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Departments"],
  },
  {
    path: "/hr/job-positions",
    component: lz(() => import("@/pages/EmployeeManagement")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Job Positions"],
  },
  {
    path: "/hr/leave-management",
    component: lz(() => import("@/pages/LeaveManagement")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Leave Management"],
  },
  {
    path: "/hr/attendance",
    component: lz(() => import("@/pages/Attendance")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Attendance"],
  },
  {
    path: "/hr/payroll",
    component: lz(() => import("@/pages/PayrollRuns")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Payroll"],
  },
  {
    path: "/hr/contracts",
    component: lz(() => import("@/pages/Contracts")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Contracts"],
  },
  {
    path: "/hr/training",
    component: lz(() => import("@/pages/Training")),
    permissions: ["hr:read"],
    breadcrumb: ["HR", "Training"],
  },

  // ── My Settings (user-level) ────────────────────────────────────────────────
  {
    path: "/my-settings/:tab",
    component: lz(() => import("@/pages/settings/my-settings/MySettings")),
    breadcrumb: ["Settings", "My Settings"],
  },
  {
    path: "/my-settings",
    component: lz(() => import("@/pages/settings/my-settings/MySettings")),
    breadcrumb: ["Settings", "My Settings"],
  },

  // ── Settings pages ──────────────────────────────────────────────────────────

  // ── Company Profile settings ─────────────────────────────────────────────────
  {
    path: "/settings/company/:tab",
    component: lz(() => import("@/pages/settings/CompanyProfile")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Company Profile"],
  },
  {
    path: "/settings/company",
    component: lz(() => import("@/pages/settings/CompanyProfile")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Company Profile"],
  },

  // ── Notifications settings ───────────────────────────────────────────────────
  {
    path: "/settings/notifications/:tab",
    component: lz(() => import("@/pages/settings/NotificationsConfig")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Notifications"],
  },
  {
    path: "/settings/notifications",
    component: lz(() => import("@/pages/settings/NotificationsConfig")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Notifications"],
  },

  // ── Billing & Subscription settings ─────────────────────────────────────────
  {
    path: "/settings/billing/:tab",
    component: lz(() => import("@/pages/settings/BillingSubscription")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Billing & Subscription"],
  },
  {
    path: "/settings/billing",
    component: lz(() => import("@/pages/settings/BillingSubscription")),
    permissions: ["settings:read"],
    breadcrumb: ["Settings", "Billing & Subscription"],
  },

  // ── Module Settings ──────────────────────────────────────────────────────────

  {
    path: "/accounting/settings/:tab",
    component: lz(() => import("@/pages/settings/AccountingSettings")),
    permissions: ["settings:read"],
    breadcrumb: ["Accounting", "Settings"],
  },
  {
    path: "/accounting/settings",
    component: lz(() => import("@/pages/settings/AccountingSettings")),
    permissions: ["settings:read"],
    breadcrumb: ["Accounting", "Settings"],
  },
];
