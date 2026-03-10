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
  { path: "/pos/loyalty-report",     component: lz(() => import("@/modules/pos/pages/LoyaltyReport")),              breadcrumb: ["POS", "Loyalty Report"] },
  { path: "/pos/reports/vouchers",         component: lz(() => import("@/modules/pos/pages/reports/VouchersReport")),          breadcrumb: ["POS", "Vouchers Report"] },
  { path: "/pos/reports/gift-cards",       component: lz(() => import("@/modules/pos/pages/reports/GiftCardsReport")),        breadcrumb: ["POS", "Gift Cards Report"] },
  { path: "/pos/reports/hourly",           component: lz(() => import("@/modules/pos/pages/reports/HourlySalesReport")),      breadcrumb: ["POS", "Hourly Sales Report"] },
  { path: "/pos/reports/payments",         component: lz(() => import("@/modules/pos/pages/reports/PaymentBreakdownReport")), breadcrumb: ["POS", "Payment Breakdown"] },
  { path: "/pos/reports/cash-movements",   component: lz(() => import("@/modules/pos/pages/reports/CashMovementsReport")),    breadcrumb: ["POS", "Cash Movements"] },
  { path: "/pos/reports/table-turnover",   component: lz(() => import("@/modules/pos/pages/reports/TableTurnoverReport")),    breadcrumb: ["POS", "Table Turnover"] },
  { path: "/pos/settings",           component: lz(() => import("@/pages/POSSettings")),                            breadcrumb: ["POS", "Settings"] },

  // ── Main ────────────────────────────────────────────────────────────────────
  { path: "/",                component: lz(() => import("@/pages/Dashboard")),     breadcrumb: ["Dashboard"] },
  { path: "/notifications",   component: lz(() => import("@/pages/Notifications")), breadcrumb: ["Notifications"] },
  { path: "/chat",            component: lz(() => import("@/pages/Chat")),          breadcrumb: ["Chat"] },
  { path: "/documents",       component: lz(() => import("@/pages/Documents")),     breadcrumb: ["Documents"] },
  { path: "/inventory",  component: lz(() => import("@/pages/Inventory")),  permissions: ["inventory:read"], breadcrumb: ["Inventory"] },
  { path: "/analytics",  component: lz(() => import("@/pages/Analytics")),  breadcrumb: ["Analytics"] },
  { path: "/settings",   component: lz(() => import("@/pages/Settings")),   breadcrumb: ["Settings"] },
  { path: "/showcase",   component: lz(() => import("@/pages/Showcase")),   breadcrumb: ["Showcase"] },

  // ── Sales ───────────────────────────────────────────────────────────────────
  { path: "/all-customers",       component: lz(() => import("@/pages/AllCustomers")),      permissions: ["sales:read"], breadcrumb: ["Sales", "Customers"] },
  { path: "/customer-groups",     component: lz(() => import("@/pages/CustomerGroups")),    permissions: ["sales:read"], breadcrumb: ["Sales", "Customer Groups"] },
  { path: "/customer-details",    component: lz(() => import("@/pages/CustomerDetails")),   permissions: ["sales:read"], breadcrumb: ["Sales", "Customer Details"] },
  { path: "/all-orders",          component: lz(() => import("@/pages/AllOrders")),         permissions: ["sales:read"], breadcrumb: ["Sales", "All Orders"] },
  { path: "/pending-orders",      component: lz(() => import("@/pages/PendingOrders")),     permissions: ["sales:read"], breadcrumb: ["Sales", "Pending Orders"] },
  { path: "/completed-orders",    component: lz(() => import("@/pages/CompletedOrders")),   permissions: ["sales:read"], breadcrumb: ["Sales", "Completed Orders"] },
  { path: "/order-details",       component: lz(() => import("@/pages/OrderDetails")),      permissions: ["sales:read"], breadcrumb: ["Sales", "Order Details"] },
  { path: "/quotations",          component: lz(() => import("@/pages/Quotations")),        permissions: ["sales:read"], breadcrumb: ["Sales", "Quotations"] },
  { path: "/sales-invoices",      component: lz(() => import("@/pages/SalesInvoices")),     permissions: ["sales:read"], breadcrumb: ["Sales", "Invoices"] },
  { path: "/sales-returns",       component: lz(() => import("@/pages/SalesReturns")),      permissions: ["sales:read"], breadcrumb: ["Sales", "Returns"] },
  { path: "/customer-receipts",   component: lz(() => import("@/pages/CustomerReceipts")),  permissions: ["sales:read"], breadcrumb: ["Sales", "Receipts"] },
  { path: "/customer-statements", component: lz(() => import("@/pages/CustomerStatements")),permissions: ["sales:read"], breadcrumb: ["Sales", "Statements"] },
  { path: "/all-vendors",         component: lz(() => import("@/pages/AllVendors")),        permissions: ["sales:read"], breadcrumb: ["Sales", "Vendors"] },
  { path: "/vendor-groups",       component: lz(() => import("@/pages/VendorGroups")),      permissions: ["sales:read"], breadcrumb: ["Sales", "Vendor Groups"] },

  // ── Purchase ────────────────────────────────────────────────────────────────
  { path: "/vendors",             component: lz(() => import("@/pages/Vendors")),           permissions: ["purchases:read"], breadcrumb: ["Purchase", "Vendors"] },
  { path: "/purchase-orders",     component: lz(() => import("@/pages/PurchaseOrders")),    permissions: ["purchases:read"], breadcrumb: ["Purchase", "Orders"] },
  { path: "/purchase-invoices",   component: lz(() => import("@/pages/PurchaseInvoices")),  permissions: ["purchases:read"], breadcrumb: ["Purchase", "Invoices"] },
  { path: "/purchase-returns",    component: lz(() => import("@/pages/PurchaseReturns")),   permissions: ["purchases:read"], breadcrumb: ["Purchase", "Returns"] },
  { path: "/vendor-payments",     component: lz(() => import("@/pages/VendorPayments")),    permissions: ["purchases:read"], breadcrumb: ["Purchase", "Vendor Payments"] },
  { path: "/vendor-statements",   component: lz(() => import("@/pages/VendorStatements")),  permissions: ["purchases:read"], breadcrumb: ["Purchase", "Vendor Statements"] },

  // ── Inventory ───────────────────────────────────────────────────────────────
  { path: "/product-details",    component: lz(() => import("@/pages/ProductDetails")),    permissions: ["inventory:read"], breadcrumb: ["Inventory", "Products"] },
  { path: "/product-categories", component: lz(() => import("@/pages/ProductCategories")), permissions: ["inventory:read"], breadcrumb: ["Inventory", "Categories"] },
  { path: "/units-of-measure",   component: lz(() => import("@/pages/UnitsOfMeasure")),    permissions: ["inventory:read"], breadcrumb: ["Inventory", "Units"] },
  { path: "/warehouses",         component: lz(() => import("@/pages/Warehouses")),         permissions: ["inventory:read"], breadcrumb: ["Inventory", "Warehouses"] },
  { path: "/opening-stock",      component: lz(() => import("@/pages/OpeningStock")),       permissions: ["inventory:write"], breadcrumb: ["Inventory", "Opening Stock"] },
  { path: "/stock-adjustments",  component: lz(() => import("@/pages/StockAdjustments")),  permissions: ["inventory:write"], breadcrumb: ["Inventory", "Adjustments"] },
  { path: "/stock-transfers",    component: lz(() => import("@/pages/StockTransfers")),    permissions: ["inventory:write"], breadcrumb: ["Inventory", "Transfers"] },
  { path: "/stock-count",        component: lz(() => import("@/pages/StockCount")),         permissions: ["inventory:write"], breadcrumb: ["Inventory", "Stock Count"] },
  { path: "/inventory-valuation",component: lz(() => import("@/pages/InventoryValuation")),permissions: ["inventory:read"], breadcrumb: ["Inventory", "Valuation"] },
  { path: "/stock-movement",     component: lz(() => import("@/pages/StockMovement")),     permissions: ["inventory:read"], breadcrumb: ["Inventory", "Movement"] },

  // ── Accounting ──────────────────────────────────────────────────────────────
  { path: "/chart-of-accounts",  component: lz(() => import("@/pages/ChartOfAccounts")),   permissions: ["accounting:read"], breadcrumb: ["Accounting", "Chart of Accounts"] },
  { path: "/journal-entries",    component: lz(() => import("@/pages/JournalEntries")),    permissions: ["accounting:write"], breadcrumb: ["Accounting", "Journal Entries"] },
  { path: "/journal-types",      component: lz(() => import("@/pages/JournalTypes")),      permissions: ["accounting:write"], breadcrumb: ["Accounting", "Journal Types"] },
  { path: "/opening-balances",   component: lz(() => import("@/pages/OpeningBalances")),   permissions: ["accounting:write"], breadcrumb: ["Accounting", "Opening Balances"] },
  { path: "/fiscal-years",       component: lz(() => import("@/pages/FiscalYears")),        permissions: ["accounting:write"], breadcrumb: ["Accounting", "Fiscal Years"] },
  { path: "/period-closing",     component: lz(() => import("@/pages/PeriodClosing")),     permissions: ["accounting:write"], breadcrumb: ["Accounting", "Period Closing"] },
  { path: "/account-statements", component: lz(() => import("@/pages/AccountStatements")), permissions: ["accounting:read"], breadcrumb: ["Accounting", "Statements"] },
  { path: "/trial-balance",      component: lz(() => import("@/pages/TrialBalance")),      permissions: ["accounting:read"], breadcrumb: ["Accounting", "Trial Balance"] },
  { path: "/general-ledger",     component: lz(() => import("@/pages/GeneralLedger")),     permissions: ["accounting:read"], breadcrumb: ["Accounting", "General Ledger"] },
  { path: "/income-statement",   component: lz(() => import("@/pages/IncomeStatement")),   permissions: ["accounting:read"], breadcrumb: ["Accounting", "Income Statement"] },
  { path: "/balance-sheet",      component: lz(() => import("@/pages/BalanceSheet")),      permissions: ["accounting:read"], breadcrumb: ["Accounting", "Balance Sheet"] },
  { path: "/cash-flow",          component: lz(() => import("@/pages/CashFlow")),           permissions: ["accounting:read"], breadcrumb: ["Accounting", "Cash Flow"] },

  // ── Treasury ────────────────────────────────────────────────────────────────
  { path: "/cash-accounts",      component: lz(() => import("@/pages/CashAccounts")),      permissions: ["treasury:read"], breadcrumb: ["Treasury", "Cash Accounts"] },
  { path: "/bank-accounts",      component: lz(() => import("@/pages/BankAccounts")),      permissions: ["treasury:read"], breadcrumb: ["Treasury", "Bank Accounts"] },
  { path: "/receipts",           component: lz(() => import("@/pages/Receipts")),           permissions: ["treasury:read"], breadcrumb: ["Treasury", "Receipts"] },
  { path: "/payments",           component: lz(() => import("@/pages/Payments")),           permissions: ["treasury:write"], breadcrumb: ["Treasury", "Payments"] },
  { path: "/bank-transfers",     component: lz(() => import("@/pages/BankTransfers")),     permissions: ["treasury:write"], breadcrumb: ["Treasury", "Bank Transfers"] },
  { path: "/bank-reconciliation",component: lz(() => import("@/pages/BankReconciliation")),permissions: ["treasury:write"], breadcrumb: ["Treasury", "Reconciliation"] },

  // ── Reports ─────────────────────────────────────────────────────────────────
  { path: "/sales-reports",      component: lz(() => import("@/pages/SalesReports")),      permissions: ["reports:read"], breadcrumb: ["Reports", "Sales"] },
  { path: "/purchase-reports",   component: lz(() => import("@/pages/PurchaseReports")),   permissions: ["reports:read"], breadcrumb: ["Reports", "Purchase"] },
  { path: "/inventory-reports",  component: lz(() => import("@/pages/InventoryReports")),  permissions: ["reports:read"], breadcrumb: ["Reports", "Inventory"] },
  { path: "/financial-reports",  component: lz(() => import("@/pages/FinancialReports")),  permissions: ["reports:read"], breadcrumb: ["Reports", "Financial"] },
  { path: "/aging-reports",      component: lz(() => import("@/pages/AgingReports")),      permissions: ["reports:read"], breadcrumb: ["Reports", "Aging"] },
  { path: "/tax-reports",        component: lz(() => import("@/pages/TaxReports")),         permissions: ["reports:read"], breadcrumb: ["Reports", "Tax"] },

  // ── System Settings ─────────────────────────────────────────────────────────
  { path: "/branches",           component: lz(() => import("@/pages/Branches")),           permissions: ["settings:read"], breadcrumb: ["Settings", "Branches"] },
  { path: "/currencies",         component: lz(() => import("@/pages/Currencies")),         permissions: ["settings:read"], breadcrumb: ["Settings", "Currencies"] },
  { path: "/exchange-rates",     component: lz(() => import("@/pages/ExchangeRates")),     permissions: ["settings:read"], breadcrumb: ["Settings", "Exchange Rates"] },
  { path: "/taxes",              component: lz(() => import("@/pages/Taxes")),              permissions: ["settings:write"], breadcrumb: ["Settings", "Taxes"] },
  { path: "/numbering-series",   component: lz(() => import("@/pages/NumberingSeries")),   permissions: ["settings:write"], breadcrumb: ["Settings", "Numbering Series"] },
  { path: "/payment-methods",    component: lz(() => import("@/pages/PaymentMethods")),    permissions: ["settings:write"], breadcrumb: ["Settings", "Payment Methods"] },
  { path: "/price-lists",        component: lz(() => import("@/pages/PriceLists")),         permissions: ["settings:write"], breadcrumb: ["Settings", "Price Lists"] },
  { path: "/cost-centers",       component: lz(() => import("@/pages/CostCenters")),        permissions: ["settings:write"], breadcrumb: ["Settings", "Cost Centers"] },
  { path: "/users",              component: lz(() => import("@/pages/Users")),              permissions: ["users:read"],     breadcrumb: ["Settings", "Users"] },
  { path: "/roles-permissions",  component: lz(() => import("@/pages/RolesPermissions")),  permissions: ["users:write"],    breadcrumb: ["Settings", "Roles & Permissions"] },
  { path: "/audit-logs",         component: lz(() => import("@/pages/AuditLogs")),          permissions: ["settings:read"], breadcrumb: ["Settings", "Audit Logs"] },

  // ── HR ──────────────────────────────────────────────────────────────────────
  { path: "/employees",        component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "All Employees"] },
  { path: "/employee-details", component: lz(() => import("@/pages/EmployeeDetails")),    breadcrumb: ["HR", "Employee Details"] },
  { path: "/departments",      component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Departments"] },
  { path: "/job-positions",    component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Job Positions"] },
  { path: "/attendance",       component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Attendance"] },
  { path: "/leave-management", component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Leave Management"] },
  { path: "/payroll",          component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Payroll"] },
  { path: "/training",         component: lz(() => import("@/pages/EmployeeManagement")), breadcrumb: ["HR", "Training"] },

  // ── Settings pages ──────────────────────────────────────────────────────────
  { path: "/financial-settings", component: lz(() => import("@/pages/FinancialSettings")), permissions: ["settings:write"], breadcrumb: ["Settings", "Financial Settings"] },
  { path: "/app-settings",       component: lz(() => import("@/pages/AppSettings")),       permissions: ["settings:write"], breadcrumb: ["Settings", "App Settings"] },
  { path: "/system-settings",    component: lz(() => import("@/pages/SystemSettings")),    permissions: ["settings:write"], breadcrumb: ["Settings", "System Settings"] },

  // ── Company Profile settings ─────────────────────────────────────────────────
  { path: "/settings/company/:tab", component: lz(() => import("@/pages/settings/CompanyProfile")), permissions: ["settings:read"], breadcrumb: ["Settings", "Company Profile"] },
  { path: "/settings/company",      component: lz(() => import("@/pages/settings/CompanyProfile")), permissions: ["settings:read"], breadcrumb: ["Settings", "Company Profile"] },

  // ── Users & Permissions settings ─────────────────────────────────────────────
  { path: "/settings/users/:tab", component: lz(() => import("@/pages/settings/UsersPermissions")), permissions: ["settings:read"], breadcrumb: ["Settings", "Users & Permissions"] },
  { path: "/settings/users",      component: lz(() => import("@/pages/settings/UsersPermissions")), permissions: ["settings:read"], breadcrumb: ["Settings", "Users & Permissions"] },

  // ── Notifications settings ───────────────────────────────────────────────────
  { path: "/settings/notifications/:tab", component: lz(() => import("@/pages/settings/NotificationsConfig")), permissions: ["settings:read"], breadcrumb: ["Settings", "Notifications"] },
  { path: "/settings/notifications",      component: lz(() => import("@/pages/settings/NotificationsConfig")), permissions: ["settings:read"], breadcrumb: ["Settings", "Notifications"] },

  // ── Billing & Subscription settings ─────────────────────────────────────────
  { path: "/settings/billing/:tab", component: lz(() => import("@/pages/settings/BillingSubscription")), permissions: ["settings:read"], breadcrumb: ["Settings", "Billing & Subscription"] },
  { path: "/settings/billing",      component: lz(() => import("@/pages/settings/BillingSubscription")), permissions: ["settings:read"], breadcrumb: ["Settings", "Billing & Subscription"] },

  // ── Module Settings ──────────────────────────────────────────────────────────
  { path: "/settings/inventory/:tab", component: lz(() => import("@/pages/settings/InventorySettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Inventory Settings"] },
  { path: "/settings/inventory",      component: lz(() => import("@/pages/settings/InventorySettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Inventory Settings"] },

  { path: "/settings/sales/:tab", component: lz(() => import("@/pages/settings/SalesSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Sales Settings"] },
  { path: "/settings/sales",      component: lz(() => import("@/pages/settings/SalesSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Sales Settings"] },

  { path: "/settings/purchases/:tab", component: lz(() => import("@/pages/settings/PurchasesSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Purchases Settings"] },
  { path: "/settings/purchases",      component: lz(() => import("@/pages/settings/PurchasesSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Purchases Settings"] },

  { path: "/settings/accounting/:tab", component: lz(() => import("@/pages/settings/AccountingSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Accounting Settings"] },
  { path: "/settings/accounting",      component: lz(() => import("@/pages/settings/AccountingSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Accounting Settings"] },

  { path: "/settings/treasury/:tab", component: lz(() => import("@/pages/settings/TreasurySettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Treasury Settings"] },
  { path: "/settings/treasury",      component: lz(() => import("@/pages/settings/TreasurySettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Treasury Settings"] },

  { path: "/settings/hr/:tab", component: lz(() => import("@/pages/settings/HRSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "HR Settings"] },
  { path: "/settings/hr",      component: lz(() => import("@/pages/settings/HRSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "HR Settings"] },

  { path: "/settings/reports/:tab", component: lz(() => import("@/pages/settings/ReportsSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Reports Settings"] },
  { path: "/settings/reports",      component: lz(() => import("@/pages/settings/ReportsSettings")), permissions: ["settings:read"], breadcrumb: ["Settings", "Reports Settings"] },

  // ── Definitions ─────────────────────────────────────────────────────────────
  { path: "/pos-definitions",        component: lz(() => import("@/pages/definitions/POSDefinitions")),        breadcrumb: ["POS", "Definitions"] },
  { path: "/inventory-definitions",  component: lz(() => import("@/pages/definitions/InventoryDefinitions")),  permissions: ["inventory:read"],  breadcrumb: ["Inventory", "Definitions"] },
  { path: "/sales-definitions",      component: lz(() => import("@/pages/definitions/SalesDefinitions")),      permissions: ["sales:read"],      breadcrumb: ["Sales", "Definitions"] },
  { path: "/purchases-definitions",  component: lz(() => import("@/pages/definitions/PurchasesDefinitions")),  permissions: ["purchases:read"],  breadcrumb: ["Purchase", "Definitions"] },
  { path: "/accounting-definitions", component: lz(() => import("@/pages/definitions/AccountingDefinitions")), permissions: ["accounting:read"], breadcrumb: ["Accounting", "Definitions"] },
  { path: "/treasury-definitions",   component: lz(() => import("@/pages/definitions/TreasuryDefinitions")),   permissions: ["treasury:read"],   breadcrumb: ["Treasury", "Definitions"] },
  { path: "/hr-definitions",         component: lz(() => import("@/pages/definitions/HRDefinitions")),                                           breadcrumb: ["HR", "Definitions"] },
  { path: "/reports-definitions",    component: lz(() => import("@/pages/definitions/ReportsDefinitions")),    permissions: ["reports:read"],    breadcrumb: ["Reports", "Definitions"] },

  // ── Legacy ──────────────────────────────────────────────────────────────────
  { path: "/invoice",   component: lz(() => import("@/pages/Invoice")),            breadcrumb: ["Invoice"] },
  { path: "/financial", component: lz(() => import("@/pages/FinancialDashboard")), breadcrumb: ["Financial Dashboard"] },
  { path: "/reports",   component: lz(() => import("@/pages/ReportsGenerator")),   breadcrumb: ["Reports Generator"] },
];
