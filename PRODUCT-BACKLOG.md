# Tatweer ERP — erp-web Product Backlog

> **Last updated:** 2026-03-17
> **Owner:** Product Team
> **Target:** Saudi SME market
> **Stack:** React 19 + Ant Design 6 + Tailwind CSS v4 + React Query + Zustand

---

## Table of Contents

1. [Integration Priority Order (Phased Roadmap)](#1-integration-priority-order)
2. [Parallel Development Tracks](#2-parallel-development-tracks)
3. [User Stories — Top 20 Pages](#3-user-stories--top-20-pages)

---

## 1. Integration Priority Order

### Phase 1 — Foundation (Week 1-2)

Establish frontend infrastructure, auth flow, and the simplest CRUD modules to set reusable patterns (table, form, detail page, dropdown, i18n).

| #   | Page                                       | Route                                   | API Module                          | Depends On | Rationale                                              |
| --- | ------------------------------------------ | --------------------------------------- | ----------------------------------- | ---------- | ------------------------------------------------------ |
| 1.1 | **Login (two-step with branch selection)** | `/login`                                | `auth`                              | None       | Gate to everything; sets JWT + tenant context          |
| 1.2 | **Dashboard (main)**                       | `/`                                     | `reporting`, `notifications`        | 1.1        | Landing page after login; KPI cards + charts           |
| 1.3 | **Company Profile / Settings**             | `/settings/company`                     | `company-settings`, `tenant-config` | 1.1        | Tenant must configure company info before transacting  |
| 1.4 | **Branches**                               | `/branches`                             | `tenants/branches`                  | 1.3        | Multi-branch is foundational; dropdowns everywhere     |
| 1.5 | **Users & Roles**                          | `/settings/users`, `/roles-permissions` | `users`, `roles`                    | 1.1        | Access control for all subsequent modules              |
| 1.6 | **Sequences (Numbering Series)**           | `/settings/sequences`                   | `sequences`                         | 1.1        | Auto-numbering for SO, PO, INV, JE, etc.               |
| 1.7 | **Notifications Center**                   | `/notifications`                        | `notifications`                     | 1.1        | Cross-cutting; toast + bell icon from day one          |
| 1.8 | **Audit Logs**                             | `/audit-logs`                           | `audit-logs`                        | 1.1        | Simple read-only list; establishes table pattern       |
| 1.9 | **Currencies & Exchange Rates**            | (within Settings)                       | `currency`                          | 1.3        | Multi-currency needed by sales, purchasing, accounting |

**Phase 1 deliverables:** Auth flow, protected routes, sidebar, i18n toggle, base table component, base form component, base detail page layout, dropdown service pattern, error boundary.

---

### Phase 2 — Core Business (Week 3-5)

The modules that generate revenue and are used daily. Partners and Products are the two master-data pillars that everything else depends on.

| #    | Page                   | Route                            | API Module                                                  | Depends On    | Rationale                                                   |
| ---- | ---------------------- | -------------------------------- | ----------------------------------------------------------- | ------------- | ----------------------------------------------------------- |
| 2.1  | **Partners List**      | `/all-customers`, `/all-vendors` | `partners`                                                  | 1.1           | Customers + vendors = every transaction's counterparty      |
| 2.2  | **Partner Detail**     | `/customer-details/:id`          | `partners`, `partner-contacts`                              | 2.1           | Full profile, contacts, addresses, credit terms             |
| 2.3  | **Product Categories** | `/product-categories`            | `inventory/categories`                                      | 1.1           | Must exist before products                                  |
| 2.4  | **Units of Measure**   | `/units-of-measure`              | `inventory/definitions`                                     | 1.1           | Must exist before products                                  |
| 2.5  | **Warehouses**         | `/warehouses`                    | `inventory/warehouses`                                      | 1.4           | Must exist before stock operations                          |
| 2.6  | **Products List**      | `/products`                      | `inventory/products`                                        | 2.3, 2.4, 2.5 | Core master data; storable/consumable/service               |
| 2.7  | **Product Detail**     | `/products/:id`                  | `inventory/products`, `product-variants`, `branch-products` | 2.6           | Full product card with variants, pricing, stock levels      |
| 2.8  | **Sales Orders List**  | `/all-orders`                    | `sales/sales-orders`                                        | 2.1, 2.6      | Primary revenue driver                                      |
| 2.9  | **Sales Order Detail** | `/order-details/:id`             | `sales/sales-orders`                                        | 2.8           | Create/edit SO with lines, confirm, create invoice/delivery |
| 2.10 | **Invoices List**      | `/sales-invoices`                | `invoices`                                                  | 2.8           | Cash flow depends on invoicing                              |
| 2.11 | **Invoice Detail**     | `/sales-invoices/:id`            | `invoices`                                                  | 2.10          | Post, cancel, register payment, print/PDF                   |

**Phase 2 deliverables:** Partner CRUD, product CRUD with variants, sales order workflow (draft -> confirmed -> invoiced -> delivered), invoice posting, partner dropdowns, product search.

---

### Phase 3 — Operations (Week 6-8)

Supply chain: purchasing, receiving goods, delivering goods, stock management.

| #    | Page                                 | Route                  | API Module                   | Depends On | Rationale                                               |
| ---- | ------------------------------------ | ---------------------- | ---------------------------- | ---------- | ------------------------------------------------------- |
| 3.1  | **Vendors List**                     | `/vendors`             | `purchasing/vendors`         | 2.1        | Vendor master (extends partner)                         |
| 3.2  | **Purchase Orders List**             | `/purchase-orders`     | `purchasing/purchase-orders` | 3.1, 2.6   | Replenish stock                                         |
| 3.3  | **Purchase Order Detail**            | `/purchase-orders/:id` | `purchasing/purchase-orders` | 3.2        | Create/edit PO with lines, confirm, create receipt/bill |
| 3.4  | **Receipts List (Goods Receipt)**    | `/receipts`            | `receipts`                   | 3.2        | Goods inbound from PO                                   |
| 3.5  | **Receipt Detail**                   | `/receipts/:id`        | `receipts`                   | 3.4        | Validate receipt, update stock                          |
| 3.6  | **Deliveries List**                  | `/deliveries`          | `deliveries`                 | 2.8        | Goods outbound from SO                                  |
| 3.7  | **Delivery Detail**                  | `/deliveries/:id`      | `deliveries`                 | 3.6        | Validate delivery, deduct stock                         |
| 3.8  | **Purchase Invoices (Vendor Bills)** | `/purchase-invoices`   | `invoices`                   | 3.2        | Three-way matching: PO + receipt + bill                 |
| 3.9  | **Stock Adjustments**                | `/stock-adjustments`   | `inventory/adjustments`      | 2.5, 2.6   | Manual stock corrections                                |
| 3.10 | **Stock Transfers**                  | `/stock-transfers`     | `inventory/transfers`        | 2.5, 2.6   | Inter-branch / inter-warehouse                          |
| 3.11 | **Stock Movements**                  | `/stock-movement`      | `inventory/stock-movements`  | 2.6        | Read-only audit trail                                   |
| 3.12 | **Inventory Valuation**              | `/inventory-valuation` | `inventory/stock-movements`  | 2.6        | Cost reports                                            |

**Phase 3 deliverables:** Full purchase-to-pay cycle, full order-to-deliver cycle, stock adjustment and transfer workflows, inventory reports.

---

### Phase 4 — Finance (Week 9-11)

Accounting, treasury, payments, bank reconciliation. Depends on invoicing being live.

| #    | Page                              | Route                              | API Module                                   | Depends On | Rationale                                   |
| ---- | --------------------------------- | ---------------------------------- | -------------------------------------------- | ---------- | ------------------------------------------- |
| 4.1  | **Chart of Accounts (tree view)** | `/chart-of-accounts`               | `accounting/accounts`                        | 1.3        | Foundation of double-entry bookkeeping      |
| 4.2  | **Account Groups**                | (within accounting definitions)    | `accounting-setup/account-groups`            | 4.1        | Grouping for reports                        |
| 4.3  | **Journals Setup**                | (within accounting definitions)    | `accounting-setup/journals`                  | 4.1        | Sales journal, purchase journal, etc.       |
| 4.4  | **Fiscal Periods**                | `/period-closing`                  | `accounting/fiscal-periods`                  | 1.3        | Open/close/lock periods                     |
| 4.5  | **Journal Entries List**          | `/journal-entries`                 | `accounting/journal-entries`                 | 4.1, 4.4   | All financial postings                      |
| 4.6  | **Journal Entry Detail**          | `/journal-entries/:id`             | `accounting/journal-entries`                 | 4.5        | Create/post/reverse with debit/credit lines |
| 4.7  | **Treasury Accounts**             | `/cash-accounts`, `/bank-accounts` | `treasury/treasury-accounts`                 | 4.1        | Cash + bank accounts linked to COA          |
| 4.8  | **Treasury Transactions**         | (within treasury account detail)   | `treasury/treasury-transactions`             | 4.7        | Deposits, withdrawals, transfers            |
| 4.9  | **Payments List**                 | `/payments`                        | `invoices/payments`                          | 2.10, 4.7  | Outbound payments (vendor bills)            |
| 4.10 | **Payment Detail**                | `/payments/:id`                    | `invoices/payments`                          | 4.9        | Register, post, link to invoice             |
| 4.11 | **Customer Receipts**             | `/customer-receipts`               | `invoices/payments`                          | 2.10, 4.7  | Inbound payments (customer invoices)        |
| 4.12 | **Bank Reconciliation**           | `/bank-reconciliation`             | `treasury/reconciliation`, `bank-statements` | 4.7        | Match bank statements to transactions       |
| 4.13 | **Cost Centers**                  | (within accounting definitions)    | `accounting/cost-centers`                    | 4.1        | Optional per journal line                   |
| 4.14 | **Trial Balance**                 | `/trial-balance`                   | `accounting/reports`                         | 4.5        | Core financial report                       |
| 4.15 | **General Ledger**                | `/general-ledger`                  | `accounting/reports`                         | 4.5        | Detailed account history                    |
| 4.16 | **Income Statement**              | `/income-statement`                | `accounting/reports`                         | 4.5        | P&L report                                  |
| 4.17 | **Balance Sheet**                 | `/balance-sheet`                   | `accounting/reports`                         | 4.5        | Financial position                          |
| 4.18 | **Account Statements**            | `/account-statements`              | `accounting/reports`                         | 4.5        | Per-account detailed report                 |

**Phase 4 deliverables:** Full double-entry accounting, treasury management, payment registration, bank reconciliation, all core financial reports.

---

### Phase 5 — People (Week 12-13)

HR, payroll, attendance, contracts. Lower urgency but critical for Saudi compliance (GOSI, labor law).

| #    | Page                  | Route                       | API Module                      | Depends On     | Rationale                                                                |
| ---- | --------------------- | --------------------------- | ------------------------------- | -------------- | ------------------------------------------------------------------------ |
| 5.1  | **Departments**       | `/departments`              | `hr/departments`                | 1.4            | Org structure                                                            |
| 5.2  | **Job Positions**     | `/job-positions`            | `hr-setup/job-positions`        | 5.1            | Before employees                                                         |
| 5.3  | **Employees List**    | `/employees`                | `hr/employees`                  | 5.1, 5.2       | Employee master data                                                     |
| 5.4  | **Employee Detail**   | `/employee-details/:id`     | `hr/employees`                  | 5.3            | Full profile with tabs: personal, contract, leaves, attendance, payslips |
| 5.5  | **Contracts List**    | (within HR)                 | `hr-extensions/contracts`       | 5.3            | Employment contracts with expiry alerts                                  |
| 5.6  | **Contract Detail**   | (within HR)                 | `hr-extensions/contracts`       | 5.5            | Create/edit contract, auto-expire                                        |
| 5.7  | **Shifts**            | (within HR definitions)     | `hr-extensions/shifts`          | 5.1            | Working hours definitions                                                |
| 5.8  | **Attendance**        | `/attendance`               | `hr-extensions/attendance`      | 5.3, 5.7       | Manual entry + fingerprint import                                        |
| 5.9  | **Leaves List**       | `/leave-management`         | `hr/leaves`                     | 5.3            | Leave requests                                                           |
| 5.10 | **Leave Approval**    | (within leaves)             | `hr/leaves`                     | 5.9            | Approve/reject workflow                                                  |
| 5.11 | **Leave Allocations** | (within HR setup)           | `hr-setup/leave-allocations`    | 5.9            | Annual leave balance setup                                               |
| 5.12 | **Salary Structures** | (within payroll setup)      | `payroll-new/salary-structures` | 5.3            | Base salary + allowances + deductions                                    |
| 5.13 | **Payroll Runs**      | `/payroll`                  | `hr-extensions/payroll`         | 5.3, 5.12, 5.8 | Monthly payroll processing                                               |
| 5.14 | **Payslips**          | (within payroll run detail) | `payroll-new/payslips`          | 5.13           | Individual payslip per employee                                          |

**Phase 5 deliverables:** Full HR lifecycle, contract management, attendance tracking, leave workflow, payroll processing with GOSI calculations.

---

### Phase 6 — Extras (Week 14-15)

CRM, projects, POS backoffice views, loyalty, chat. Nice-to-have modules that expand ERP value.

| #    | Page                       | Route                 | API Module                            | Depends On | Rationale                             |
| ---- | -------------------------- | --------------------- | ------------------------------------- | ---------- | ------------------------------------- |
| 6.1  | **CRM Stages Setup**       | (within CRM settings) | `crm-stages`                          | 1.1        | Pipeline stages before leads          |
| 6.2  | **CRM Pipeline (Kanban)**  | (new route)           | `crm/pipeline`                        | 6.1, 2.1   | Visual deal tracking                  |
| 6.3  | **Leads List**             | (new route)           | `crm/leads`                           | 6.1        | Lead management                       |
| 6.4  | **Lead Detail**            | (new route)           | `crm/leads`                           | 6.3        | Qualify, convert to SO                |
| 6.5  | **CRM Contacts**           | (new route)           | `crm/contacts`                        | 2.1        | Contact people within partners        |
| 6.6  | **Projects List**          | (new route)           | `projects/projects`                   | 1.1        | Project management                    |
| 6.7  | **Project Detail + Tasks** | (new route)           | `projects/projects`, `projects/tasks` | 6.6        | Task tracking within project          |
| 6.8  | **POS Sessions Report**    | (new route)           | `pos-sessions`                        | 1.1        | Backoffice view of POS sessions       |
| 6.9  | **POS Orders Report**      | (new route)           | `pos-orders`                          | 1.1        | Backoffice view of POS orders         |
| 6.10 | **Loyalty Programs**       | (new route)           | `loyalty/programs`                    | 2.1        | Configure loyalty programs            |
| 6.11 | **Loyalty Accounts**       | (new route)           | `loyalty/accounts`                    | 6.10       | View customer point balances          |
| 6.12 | **Vouchers & Gift Cards**  | (new route)           | `vouchers-gift-cards`                 | 2.1        | Issue and track vouchers/gift cards   |
| 6.13 | **Chat**                   | `/chat`               | `chat`                                | 1.1        | Internal team messaging               |
| 6.14 | **Pricelists**             | `/price-lists`        | `pricelists`                          | 2.6        | Time-based and customer-based pricing |
| 6.15 | **Down Payments**          | (new route)           | `down-payments`                       | 2.8        | Advance payments on SOs               |
| 6.16 | **ZATCA Integration**      | (within settings)     | `zatca`                               | 2.10       | E-invoicing compliance                |

**Phase 6 deliverables:** CRM pipeline, project management, POS reporting, loyalty/voucher management, chat, ZATCA compliance.

---

## 2. Parallel Development Tracks

Three developers can work simultaneously with minimal merge conflicts.

### Track A — Core Transactions (Developer 1)

Focus: Sales, purchasing, invoicing, deliveries, receipts. The money-making flow.

| Week  | Pages                                                        |
| ----- | ------------------------------------------------------------ |
| W1    | Login (1.1), Dashboard shell (1.2)                           |
| W2    | Partners List + Detail (2.1, 2.2)                            |
| W3    | Sales Orders List + Detail (2.8, 2.9)                        |
| W4    | Invoices List + Detail (2.10, 2.11)                          |
| W5    | Purchase Orders List + Detail (3.2, 3.3), Vendors (3.1)      |
| W6    | Deliveries List + Detail (3.6, 3.7)                          |
| W7    | Receipts List + Detail (3.4, 3.5), Purchase Invoices (3.8)   |
| W8    | Payments List + Detail (4.9, 4.10), Customer Receipts (4.11) |
| W9-10 | CRM Pipeline + Lead Detail (6.2, 6.3, 6.4)                   |

**Dependencies provided to other tracks:** Partner dropdown, product dropdown, invoice references.

### Track B — Inventory & Finance (Developer 2)

Focus: Products, stock, accounting, treasury, reports.

| Week | Pages                                                     |
| ---- | --------------------------------------------------------- |
| W1   | Base table/form components, i18n setup                    |
| W2   | Categories (2.3), UoM (2.4), Warehouses (2.5)             |
| W3   | Products List + Detail (2.6, 2.7)                         |
| W4   | Stock Adjustments (3.9), Stock Transfers (3.10)           |
| W5   | Stock Movements (3.11), Inventory Valuation (3.12)        |
| W6   | Chart of Accounts tree (4.1), Account Groups (4.2)        |
| W7   | Journal Entries List + Detail (4.5, 4.6)                  |
| W8   | Treasury Accounts + Transactions (4.7, 4.8)               |
| W9   | Bank Reconciliation (4.12), Financial Reports (4.14-4.18) |
| W10  | Pricelists (6.14), Down Payments (6.15)                   |

**Dependencies provided to other tracks:** Product dropdown, COA dropdown, treasury account dropdown.

### Track C — Settings, HR & Extras (Developer 3)

Focus: System configuration, people management, peripheral modules.

| Week | Pages                                                          |
| ---- | -------------------------------------------------------------- |
| W1   | Company Profile (1.3), Branches (1.4)                          |
| W2   | Users & Roles (1.5), Sequences (1.6)                           |
| W3   | Currencies (1.9), Audit Logs (1.8), Notifications (1.7)        |
| W4   | Departments (5.1), Job Positions (5.2)                         |
| W5   | Employees List + Detail (5.3, 5.4)                             |
| W6   | Contracts (5.5, 5.6), Shifts (5.7)                             |
| W7   | Attendance (5.8), Leaves + Approval (5.9, 5.10, 5.11)          |
| W8   | Salary Structures (5.12), Payroll Runs + Payslips (5.13, 5.14) |
| W9   | Loyalty + Vouchers (6.10, 6.11, 6.12)                          |
| W10  | Chat (6.13), ZATCA (6.16), POS Reports (6.8, 6.9)              |

**Dependencies provided to other tracks:** Branch dropdown, user dropdown, currency dropdown, department/employee dropdowns.

### Cross-Track Dependency Map

```
Track C (Settings)  ──→  Track A (Transactions)
     │                        │
     │                        ↓
     └──→  Track B (Inventory & Finance)
```

- **Week 1 blocker:** Track A needs Login done before anything else. Track C delivers branch/company setup that Track A and B consume as dropdowns.
- **Week 3 sync point:** Track B delivers product dropdown; Track A needs it for Sales Orders.
- **Week 5 sync point:** Track A delivers invoice references; Track B needs them for accounting journal auto-posts.
- All tracks share: base table component, base form component, dropdown service pattern, i18n utilities. These must be built in Week 1 (split between Track A and Track B).

---

## 3. User Stories — Top 20 Pages

---

### US-001: Login Page (Two-Step with Branch Selection)

**As a** tenant user,
**I want to** log in with my email and password, then select my branch,
**So that** I can access the ERP scoped to my assigned branch.

**Route:** `/login`
**API Endpoints:**

- `POST /api/v1/auth/login` — email + password, returns temporary token + branches list
- `POST /api/v1/auth/select-branch` — branch ID + temp token, returns full JWT + refresh token
- `POST /api/v1/auth/refresh` — rotate refresh token

**Permission:** Public (no auth required)

**Acceptance Criteria:**

1. [ ] Email and password fields with validation (required, email format)
2. [ ] Step 1: on valid credentials, API returns list of branches the user has access to
3. [ ] Step 2: branch selection screen shows branch names (bilingual); single-select
4. [ ] If user has only one branch, auto-select it and skip step 2
5. [ ] On successful branch selection, store access token + refresh token securely (httpOnly preferred, fallback to memory + localStorage for refresh)
6. [ ] Redirect to Dashboard (`/`) on success
7. [ ] Show inline error messages for invalid credentials (do not reveal whether email exists)
8. [ ] Show error for locked accounts (423 status)
9. [ ] "Remember me" checkbox persists email only (never password)
10. [ ] Language toggle (EN/AR) on login page; switches form direction (LTR/RTL)
11. [ ] Auto-redirect to Dashboard if valid token already exists
12. [ ] Responsive: works on mobile (min 360px width)

**Dependencies:** None
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-002: Partners List

**As a** sales/purchasing user,
**I want to** view, search, and filter all partners (customers and vendors),
**So that** I can find the right counterparty for transactions.

**Route:** `/all-customers` (filtered to customers), `/all-vendors` (filtered to vendors)
**API Endpoints:**

- `GET /api/v1/partners` — paginated list with search, sort, filter
- `POST /api/v1/partners` — quick-create
- `DELETE /api/v1/partners/:id` — soft delete
- `GET /api/v1/partners/dropdown` — for select fields

**Permission:** `partners:view` (read), `partners:manage` (create/delete)

**Acceptance Criteria:**

1. [ ] Table with columns: code, name (bilingual), phone, email, type (customer/vendor/both), city, status, balance
2. [ ] Search by name (both EN and AR), code, phone, email
3. [ ] Filter by: type (customer/vendor/both), city, status (active/inactive)
4. [ ] Sort by: name, code, createdAt, balance
5. [ ] Pagination: 20 per page default, max 100
6. [ ] Quick-create drawer: name (current language), phone, email, type — saves to both nameEn/nameAr
7. [ ] Click row to navigate to partner detail page
8. [ ] Bulk actions: export to Excel
9. [ ] Empty state with illustration when no partners exist
10. [ ] Loading skeleton while data fetches

**Dependencies:** US-001 (Login)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-003: Partner Detail

**As a** sales/purchasing user,
**I want to** view and edit a partner's full profile including contacts, addresses, and financial info,
**So that** I can maintain accurate counterparty records.

**Route:** `/customer-details/:id`, `/vendor-details/:id`
**API Endpoints:**

- `GET /api/v1/partners/:id` — full partner with relations
- `PUT /api/v1/partners/:id` — update (with `version` for optimistic locking)
- `GET /api/v1/partners/:partnerId/contacts` — partner contacts
- `POST /api/v1/partners/contacts` — add contact
- `PUT /api/v1/partners/contacts/:id` — update contact
- `DELETE /api/v1/partners/contacts/:id` — delete contact

**Permission:** `partners:view` (read), `partners:manage` (edit)

**Acceptance Criteria:**

1. [ ] Header: partner name (bilingual), code, type badge, status badge, action buttons
2. [ ] Tabs: General Info, Contacts, Addresses, Accounting, Sales History, Purchase History
3. [ ] General Info tab: nameEn, nameAr, phone, mobile, email, website, taxId (VAT number), notes
4. [ ] Contacts tab: list of contact persons with inline add/edit/delete
5. [ ] Accounting tab: payment terms, credit limit, receivable/payable balance (read-only, from API)
6. [ ] Both nameEn and nameAr fields visible and editable on detail page
7. [ ] Optimistic locking: send `version` on update, handle 409 Conflict gracefully (show "record updated by another user" message)
8. [ ] Breadcrumb: Sales > Customers > [Partner Name]
9. [ ] Delete confirmation modal with partner name displayed
10. [ ] Activity log section showing recent changes (via audit logs)

**Dependencies:** US-002 (Partners List)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-004: Products List

**As an** inventory manager,
**I want to** view, search, and manage all products,
**So that** I can maintain the product catalog used across sales, purchasing, and POS.

**Route:** `/products`
**API Endpoints:**

- `GET /api/v1/products` — paginated list with search, sort, filter
- `POST /api/v1/products` — create product
- `DELETE /api/v1/products/:id` — soft delete
- `PATCH /api/v1/products/:id/restore` — restore deleted
- `GET /api/v1/categories` — category dropdown
- `GET /api/v1/warehouses/dropdown` — warehouse dropdown

**Permission:** `inventory:view` (read), `inventory:create` (create), `inventory:delete` (delete)

**Acceptance Criteria:**

1. [ ] Table with columns: image thumbnail, SKU, name (bilingual), category, type (storable/consumable/service), unit price, cost price, stock on hand, status
2. [ ] Search by name (EN/AR), SKU, barcode
3. [ ] Filter by: category, type (storable/consumable/service), status (active/inactive), low stock
4. [ ] Sort by: name, SKU, price, stock level, createdAt
5. [ ] Quick-create drawer: name (current language), SKU, type, category, unit price, cost price
6. [ ] Stock level shown with color coding: green (sufficient), yellow (low), red (out of stock)
7. [ ] Type badge: storable (blue), consumable (green), service (purple)
8. [ ] Click row to navigate to product detail page
9. [ ] Bulk actions: export to Excel, bulk status change
10. [ ] Grid view toggle (card layout with product images) as alternative to table

**Dependencies:** US-001 (Login), Categories + UoM + Warehouses (Phase 2 setup)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-005: Product Detail

**As an** inventory manager,
**I want to** view and edit a product's full information including variants, pricing, and stock levels,
**So that** I can manage the complete product lifecycle.

**Route:** `/products/:id`
**API Endpoints:**

- `GET /api/v1/products/:id` — full product with relations
- `GET /api/v1/products/:id/availability` — stock per warehouse
- `GET /api/v1/products/:id/suppliers` — supplier products
- `PUT /api/v1/products/:id` — update (with `version`)
- `GET /api/v1/product-variants?productId=:id` — variants list
- `POST /api/v1/product-variants` — create variant
- `GET /api/v1/product-attributes` — attribute definitions
- `GET /api/v1/stock-movements/movements?productId=:id` — movement history

**Permission:** `inventory:view` (read), `inventory:update` (edit)

**Acceptance Criteria:**

1. [ ] Header: product image, name (bilingual), SKU, type badge, status, action buttons
2. [ ] Tabs: General, Variants, Stock, Pricing, Suppliers, Movement History
3. [ ] General tab: nameEn, nameAr, descriptionEn, descriptionAr, SKU, barcode, category, UoM, type, tax rate, invoice policy, weight, dimensions
4. [ ] Variants tab: attribute matrix (e.g., color x size), each variant with own SKU, price, stock
5. [ ] Stock tab: stock level per warehouse in a table, total on hand, total reserved, total available
6. [ ] Pricing tab: base price, cost price, pricelist assignments
7. [ ] Suppliers tab: linked vendors with vendor SKU, vendor price, lead time
8. [ ] Movement History tab: paginated list of all stock movements for this product
9. [ ] Image upload (drag-and-drop or click), stored via S3
10. [ ] Optimistic locking on updates

**Dependencies:** US-004 (Products List)
**Priority:** P0 (must-have)
**Complexity:** L (5-10 days)

---

### US-006: Sales Orders List

**As a** sales user,
**I want to** view, search, and create sales orders,
**So that** I can process customer purchases.

**Route:** `/all-orders`
**API Endpoints:**

- `GET /api/v1/sales-orders` — paginated list with filters
- `POST /api/v1/sales-orders` — create new SO
- `DELETE /api/v1/sales-orders/:id` — delete draft SO
- `GET /api/v1/sales-orders/reports/summary` — totals summary

**Permission:** `sales:view` (read), `sales:create` (create), `sales:delete` (delete)

**Acceptance Criteria:**

1. [ ] Table with columns: SO number (auto-generated), customer name, date, status, total amount, currency, salesperson, branch
2. [ ] Status badges with colors: Draft (gray), Confirmed (blue), Invoiced (green), Delivered (teal), Cancelled (red)
3. [ ] Search by SO number, customer name
4. [ ] Filter by: status, date range, customer, salesperson, branch
5. [ ] Sort by: date, SO number, total amount, customer name
6. [ ] Summary cards at top: total orders, total value, orders by status (from summary endpoint)
7. [ ] "Create Order" button opens new SO detail page
8. [ ] Quick filter tabs: All, Draft, Confirmed, To Invoice, To Deliver
9. [ ] Click row to navigate to SO detail page
10. [ ] Bulk actions: confirm selected drafts, export to Excel

**Dependencies:** US-002 (Partners), US-004 (Products)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-007: Sales Order Detail

**As a** sales user,
**I want to** create, edit, and process a sales order through its lifecycle,
**So that** I can fulfill customer purchases end-to-end.

**Route:** `/order-details/:id` (existing), `/all-orders/new` (create)
**API Endpoints:**

- `GET /api/v1/sales-orders/:id` — full SO with lines
- `POST /api/v1/sales-orders` — create SO
- `PUT /api/v1/sales-orders/:id` — update SO (draft only, with `version`)
- `POST /api/v1/sales-orders/:id/confirm` — confirm SO
- `POST /api/v1/sales-orders/:id/create-invoice` — generate invoice
- `POST /api/v1/sales-orders/:id/create-delivery` — generate delivery order
- `POST /api/v1/sales-orders/:id/cancel` — cancel SO
- `POST /api/v1/sales-orders/:id/lines` — add line
- `PUT /api/v1/sales-orders/:id/lines/:lineId` — update line
- `DELETE /api/v1/sales-orders/:id/lines/:lineId` — remove line
- `GET /api/v1/partners/dropdown` — customer dropdown
- `GET /api/v1/products` — product search

**Permission:** `sales:create` (create/edit), `sales:manage` (confirm/cancel)

**Acceptance Criteria:**

1. [ ] Header: SO number (auto-generated on create), status badge, action buttons (Confirm, Create Invoice, Create Delivery, Cancel)
2. [ ] Customer selection: searchable dropdown with quick-create option
3. [ ] Order date, expected delivery date, salesperson, payment terms, currency
4. [ ] Order lines table: product (searchable), description, quantity, unit price, discount %, tax rate, line total
5. [ ] Add line: product search opens dropdown or modal; selecting product auto-fills price, tax, description
6. [ ] Running totals: subtotal, total discount, total tax, grand total (updated live as lines change)
7. [ ] Tax calculated after discount per line: `tax = (qty * price - discount) * taxRate / 100`
8. [ ] Notes/terms section (free text)
9. [ ] Status flow: Draft -> Confirmed -> (Create Invoice / Create Delivery) -> Cancelled
10. [ ] Action buttons shown/hidden based on current status (e.g., "Confirm" only on Draft)
11. [ ] Confirm action shows confirmation dialog with summary
12. [ ] Create Invoice action: on success, navigate to new invoice or show link
13. [ ] Create Delivery action: on success, navigate to new delivery or show link
14. [ ] Related documents section: linked invoices, linked deliveries (with navigation links)
15. [ ] Cannot edit confirmed SO (except cancel)
16. [ ] Print/export SO to PDF

**Dependencies:** US-006 (Sales Orders List), US-003 (Partner Detail), US-005 (Product Detail)
**Priority:** P0 (must-have)
**Complexity:** XL (10+ days)

---

### US-008: Invoices List

**As an** accountant,
**I want to** view and manage all sales invoices,
**So that** I can track revenue and receivables.

**Route:** `/sales-invoices`
**API Endpoints:**

- `GET /api/v1/invoices` — paginated list with filters
- `POST /api/v1/invoices` — create standalone invoice
- `DELETE /api/v1/invoices/:id` — delete draft invoice

**Permission:** `invoices:view` (read), `invoices:manage` (create/delete)

**Acceptance Criteria:**

1. [ ] Table columns: invoice number, customer, date, due date, status, total, amount due, payment status
2. [ ] Status badges: Draft (gray), Posted (blue), Paid (green), Partially Paid (yellow), Cancelled (red), Overdue (orange)
3. [ ] Search by invoice number, customer name
4. [ ] Filter by: status, date range, due date range, customer, payment status
5. [ ] Sort by: date, due date, invoice number, total, amount due
6. [ ] Summary cards: total invoiced, total paid, total outstanding, overdue amount
7. [ ] Quick filter tabs: All, Draft, Posted, Overdue, Paid
8. [ ] Overdue invoices highlighted with warning color
9. [ ] Click row to navigate to invoice detail
10. [ ] Bulk actions: export to Excel, print multiple

**Dependencies:** US-006 (Sales Orders)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-009: Invoice Detail

**As an** accountant,
**I want to** view, post, and process payments on an invoice,
**So that** I can record revenue and track collections.

**Route:** `/sales-invoices/:id`
**API Endpoints:**

- `GET /api/v1/invoices/:id` — full invoice with lines and payments
- `POST /api/v1/invoices/:id/post` — post invoice (creates journal entry)
- `POST /api/v1/invoices/:id/cancel` — cancel posted invoice
- `POST /api/v1/invoices/:id/register-payment` — register payment against invoice
- `PUT /api/v1/invoices/:id` — update draft invoice (with `version`)

**Permission:** `invoices:view` (read), `invoices:manage` (post/cancel/edit)

**Acceptance Criteria:**

1. [ ] Header: invoice number, customer name, status badge, amount due, action buttons
2. [ ] Invoice info: date, due date, payment terms, currency, source SO reference
3. [ ] Lines table (read-only after posting): product, description, quantity, unit price, discount, tax, line total
4. [ ] Totals section: subtotal, discount, tax, grand total, amount paid, amount due
5. [ ] "Post" action: confirmation dialog, creates accounting journal entry, changes status to Posted
6. [ ] "Register Payment" action: modal with amount, payment date, payment method (cash/bank/check), treasury account dropdown
7. [ ] Partial payments supported: amount due updates after each payment
8. [ ] Payment history table: date, amount, method, reference
9. [ ] "Cancel" action: only on posted invoices, creates reversal journal entry
10. [ ] Print/PDF: formatted invoice with company logo, ZATCA QR code (if configured)
11. [ ] Related documents: source SO link, journal entry link, payment links
12. [ ] Read-only mode after posting (except register payment and cancel)

**Dependencies:** US-008 (Invoices List)
**Priority:** P0 (must-have)
**Complexity:** L (5-10 days)

---

### US-010: Purchase Orders List

**As a** purchasing user,
**I want to** view, search, and create purchase orders,
**So that** I can procure products from vendors.

**Route:** `/purchase-orders`
**API Endpoints:**

- `GET /api/v1/purchase-orders` — paginated list with filters
- `POST /api/v1/purchase-orders` — create PO
- `DELETE /api/v1/purchase-orders/:id` — delete draft PO
- `GET /api/v1/purchase-orders/summary` — totals summary

**Permission:** `purchasing:view` (read), `purchasing:create` (create), `purchasing:delete` (delete)

**Acceptance Criteria:**

1. [ ] Table columns: PO number, vendor, date, expected date, status, total amount, receipt status, bill status
2. [ ] Status badges: Draft (gray), Confirmed (blue), Received (teal), Billed (green), Cancelled (red)
3. [ ] Search by PO number, vendor name
4. [ ] Filter by: status, date range, vendor, branch
5. [ ] Sort by: date, PO number, total, vendor name
6. [ ] Summary cards: total POs, total value, pending receipts, pending bills
7. [ ] "Create PO" button opens new PO detail page
8. [ ] Quick filter tabs: All, Draft, Confirmed, To Receive, To Bill
9. [ ] Click row to navigate to PO detail page
10. [ ] Bulk actions: export to Excel

**Dependencies:** US-002 (Partners/Vendors), US-004 (Products)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-011: Purchase Order Detail

**As a** purchasing user,
**I want to** create, edit, and process a purchase order through its lifecycle,
**So that** I can manage vendor procurement end-to-end.

**Route:** `/purchase-orders/:id`, `/purchase-orders/new`
**API Endpoints:**

- `GET /api/v1/purchase-orders/:id` — full PO with lines
- `POST /api/v1/purchase-orders` — create
- `PUT /api/v1/purchase-orders/:id` — update (draft only, with `version`)
- `POST /api/v1/purchase-orders/:id/confirm` — confirm
- `POST /api/v1/purchase-orders/:id/create-receipt` — generate goods receipt
- `POST /api/v1/purchase-orders/:id/create-bill` — generate vendor bill
- `POST /api/v1/purchase-orders/:id/cancel` — cancel
- `POST /api/v1/purchase-orders/:id/lines` — add line
- `PUT /api/v1/purchase-orders/:id/lines/:lineId` — update line
- `DELETE /api/v1/purchase-orders/:id/lines/:lineId` — remove line

**Permission:** `purchasing:create` (create/edit), `purchasing:manage` (confirm/cancel)

**Acceptance Criteria:**

1. [ ] Header: PO number (auto-generated), status badge, action buttons (Confirm, Create Receipt, Create Bill, Cancel)
2. [ ] Vendor selection: searchable dropdown with vendor details preview
3. [ ] PO date, expected delivery date, payment terms, currency
4. [ ] Order lines table: product (searchable), description, quantity, unit price, discount %, tax rate, line total
5. [ ] Running totals: subtotal, discount, tax, grand total
6. [ ] Status flow: Draft -> Confirmed -> (Create Receipt / Create Bill) -> Cancelled
7. [ ] Create Receipt: on success, navigate to new receipt
8. [ ] Create Bill: on success, navigate to new vendor bill
9. [ ] Related documents: linked receipts, linked bills
10. [ ] Three-way matching indicator: PO qty vs received qty vs billed qty per line
11. [ ] Cannot edit confirmed PO
12. [ ] Print/export PO to PDF

**Dependencies:** US-010 (PO List)
**Priority:** P0 (must-have)
**Complexity:** XL (10+ days)

---

### US-012: Chart of Accounts (Tree View)

**As an** accountant,
**I want to** view and manage the chart of accounts in a hierarchical tree,
**So that** I can organize the company's financial structure.

**Route:** `/chart-of-accounts`
**API Endpoints:**

- `GET /api/v1/accounts/tree` — full tree structure
- `GET /api/v1/accounts/grouped-tree` — grouped by type (assets, liabilities, equity, income, expense)
- `GET /api/v1/accounts` — flat list with search
- `GET /api/v1/accounts/:id` — single account detail
- `POST /api/v1/accounts` — create account
- `PATCH /api/v1/accounts/:id` — update account
- `DELETE /api/v1/accounts/:id` — delete (if no transactions)
- `POST /api/v1/accounts/repair` — repair missing default accounts

**Permission:** `accounting:view` (read), `accounting:manage` (create/edit/delete)

**Acceptance Criteria:**

1. [ ] Tree view with expandable/collapsible nodes (Ant Design Tree component)
2. [ ] Group headers: Assets, Liabilities, Equity, Revenue, Expenses
3. [ ] Each node shows: account code, name (bilingual), type, balance
4. [ ] Search field filters tree nodes in real-time (both EN and AR names)
5. [ ] Click node to show account detail in side panel or drawer
6. [ ] "Add Account" with parent selection (creates child under selected node)
7. [ ] Drag-and-drop to reorder (if supported by API)
8. [ ] Color coding by account type: blue (assets), red (liabilities), green (equity), orange (revenue), purple (expenses)
9. [ ] Account code format validation (numeric, hierarchical)
10. [ ] Cannot delete accounts with existing journal entries (API returns error, show clear message)
11. [ ] Toggle between tree view and flat table view
12. [ ] Export full COA to Excel/PDF

**Dependencies:** US-001 (Login), Company Settings (Phase 1)
**Priority:** P0 (must-have)
**Complexity:** L (5-10 days)

---

### US-013: Journal Entries List

**As an** accountant,
**I want to** view, search, and create journal entries,
**So that** I can record all financial transactions.

**Route:** `/journal-entries`
**API Endpoints:**

- `GET /api/v1/journal-entries` — paginated list with filters
- `POST /api/v1/journal-entries` — create manual JE
- `DELETE /api/v1/journal-entries/:id` — delete draft JE

**Permission:** `accounting:view` (read), `accounting:manage` (create/delete)

**Acceptance Criteria:**

1. [ ] Table columns: JE number, date, journal type, reference, status, total debit, total credit, memo
2. [ ] Status badges: Draft (gray), Posted (blue), Reversed (red)
3. [ ] Search by JE number, reference, memo
4. [ ] Filter by: status, date range, journal type, fiscal period
5. [ ] Sort by: date, JE number, total amount
6. [ ] Quick filter tabs: All, Draft, Posted, Reversed
7. [ ] "Create Journal Entry" button opens new JE form
8. [ ] Auto-generated entries (from invoices, payments, payroll) marked with source badge
9. [ ] Click row to navigate to JE detail
10. [ ] Bulk actions: export to Excel

**Dependencies:** US-012 (Chart of Accounts)
**Priority:** P0 (must-have)
**Complexity:** M (3-5 days)

---

### US-014: Journal Entry Detail

**As an** accountant,
**I want to** create, review, post, and reverse journal entries,
**So that** I can maintain accurate double-entry books.

**Route:** `/journal-entries/:id`, `/journal-entries/new`
**API Endpoints:**

- `GET /api/v1/journal-entries/:id` — full JE with lines
- `POST /api/v1/journal-entries` — create
- `PATCH /api/v1/journal-entries/:id` — update draft (with `version`)
- `POST /api/v1/journal-entries/:id/post` — post JE
- `POST /api/v1/journal-entries/:id/reverse` — create reversal JE

**Permission:** `accounting:manage` (create/edit), `accounting:post` (post/reverse)

**Acceptance Criteria:**

1. [ ] Header: JE number, date, status badge, journal type, action buttons (Post, Reverse)
2. [ ] Date, journal selection (from journals setup), reference, memo
3. [ ] Lines table: account (searchable COA dropdown), description, debit, credit, cost center (optional), currency, exchange rate
4. [ ] Running totals row: total debit, total credit, difference (must be zero to post)
5. [ ] Validation: total debits must equal total credits before posting (highlight imbalance in red)
6. [ ] At least 2 lines required (one debit, one credit)
7. [ ] "Post" action: confirmation dialog, locks the entry, updates account balances
8. [ ] "Reverse" action: creates a new JE with swapped debit/credit, links to original
9. [ ] Fiscal period validation: cannot post to a closed/locked period
10. [ ] Auto-generated entries are read-only with source reference link
11. [ ] Print/PDF export

**Dependencies:** US-013 (JE List), US-012 (COA)
**Priority:** P0 (must-have)
**Complexity:** L (5-10 days)

---

### US-015: Employees List

**As an** HR manager,
**I want to** view and manage all employees,
**So that** I can oversee the workforce.

**Route:** `/employees`
**API Endpoints:**

- `GET /api/v1/employees` — paginated list with filters
- `POST /api/v1/employees` — create employee
- `DELETE /api/v1/employees/:id` — soft delete
- `PATCH /api/v1/employees/:id/restore` — restore
- `GET /api/v1/employees/dropdown` — for select fields
- `GET /api/v1/departments/dropdown` — department dropdown

**Permission:** `hr:view` (read), `hr:create` (create), `hr:delete` (delete)

**Acceptance Criteria:**

1. [ ] Table columns: photo, employee ID, name (bilingual), department, job title, employment type, phone, status, hire date
2. [ ] Search by name (EN/AR), employee ID, phone, national ID
3. [ ] Filter by: department, job title, employment type, employment status (active/resigned/terminated), nationality (Saudi/non-Saudi)
4. [ ] Sort by: name, employee ID, hire date, department
5. [ ] Saudi/non-Saudi filter (GOSI implications)
6. [ ] Quick-create drawer: name, department, job title, phone, hire date
7. [ ] Status badges: Active (green), On Leave (yellow), Resigned (gray), Terminated (red)
8. [ ] Click row to navigate to employee detail
9. [ ] Summary cards: total employees, active, Saudi vs non-Saudi ratio
10. [ ] Bulk actions: export to Excel

**Dependencies:** US-001 (Login), Departments + Job Positions (Phase 5 setup)
**Priority:** P1 (should-have)
**Complexity:** M (3-5 days)

---

### US-016: Employee Detail

**As an** HR manager,
**I want to** view and edit an employee's full profile including contracts, leaves, attendance, and payslips,
**So that** I can manage the complete employee lifecycle.

**Route:** `/employee-details/:id`
**API Endpoints:**

- `GET /api/v1/employees/:id` — full employee with relations
- `PUT /api/v1/employees/:id` — update (with `version`)
- `GET /api/v1/contracts?employeeId=:id` — employee contracts
- `GET /api/v1/leaves/employee/:employeeId` — employee leaves
- `GET /api/v1/leaves/balance/:employeeId` — leave balance
- `GET /api/v1/attendance?employeeId=:id` — attendance records

**Permission:** `hr:view` (read), `hr:update` (edit)

**Acceptance Criteria:**

1. [ ] Header: photo, name (bilingual), employee ID, department, job title, status, action buttons
2. [ ] Tabs: Personal Info, Employment, Contracts, Leaves, Attendance, Payslips, Documents
3. [ ] Personal Info tab: nameEn, nameAr, national ID, nationality, date of birth, gender, phone, email, address, emergency contact
4. [ ] Employment tab: hire date, department, job title, employment type, manager, branch, salary info
5. [ ] Contracts tab: list of contracts with status, dates, salary; contract expiry alert (30 days)
6. [ ] Leaves tab: leave balance summary, leave requests list, approve/reject actions (if manager)
7. [ ] Attendance tab: monthly calendar view with present/absent/late markers
8. [ ] Payslips tab: list of payslips with month, gross, deductions, net
9. [ ] GOSI calculation display: Saudi (10% employee + 12% employer) vs non-Saudi (none) — auto-detected from nationality
10. [ ] Optimistic locking on updates
11. [ ] Photo upload for employee picture

**Dependencies:** US-015 (Employees List)
**Priority:** P1 (should-have)
**Complexity:** XL (10+ days)

---

### US-017: Dashboard (Main)

**As a** user,
**I want to** see key business metrics at a glance when I log in,
**So that** I can make informed decisions quickly.

**Route:** `/`
**API Endpoints:**

- `GET /api/v1/reporting/dashboard` — KPI data (or multiple endpoints per widget)
- `GET /api/v1/sales-orders/reports/summary` — sales summary
- `GET /api/v1/purchase-orders/summary` — purchase summary
- `GET /api/v1/notifications` — recent notifications

**Permission:** Authenticated (any user sees widgets based on their permissions)

**Acceptance Criteria:**

1. [ ] KPI cards row: total revenue (MTD), total expenses (MTD), net profit, cash balance, outstanding receivables, outstanding payables
2. [ ] Sales chart: line/bar chart of daily/weekly/monthly sales (configurable)
3. [ ] Top products widget: top 5 selling products by revenue
4. [ ] Top customers widget: top 5 customers by revenue
5. [ ] Recent orders table: last 10 sales orders with status
6. [ ] Overdue invoices alert: count + total amount of overdue invoices
7. [ ] Low stock alerts: products below reorder point
8. [ ] Quick actions: Create Sales Order, Create Invoice, Create PO, Add Product
9. [ ] Date range selector for dashboard period (today, this week, this month, this year, custom)
10. [ ] Widgets respect user permissions: HR widgets only visible to HR users, financial widgets only to accounting users
11. [ ] Dashboard data cached with 60-second TTL
12. [ ] Responsive grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile
13. [ ] Greeting message with user name and current date (Hijri + Gregorian)

**Dependencies:** US-001 (Login), US-006 (Sales Orders), US-004 (Products)
**Priority:** P0 (must-have)
**Complexity:** L (5-10 days)

---

### US-018: Deliveries List + Detail

**As a** warehouse user,
**I want to** view, process, and validate delivery orders,
**So that** I can fulfill customer orders by shipping goods.

**Route:** `/deliveries` (list), `/deliveries/:id` (detail)
**API Endpoints:**

- `GET /api/v1/deliveries` — paginated list
- `POST /api/v1/deliveries` — create delivery (usually from SO)
- `GET /api/v1/deliveries/:id` — full delivery with lines
- `PUT /api/v1/deliveries/:id` — update (with `version`)
- `POST /api/v1/deliveries/:id/validate` — validate (deducts stock)
- `POST /api/v1/deliveries/:id/cancel` — cancel delivery

**Permission:** `inventory:view` (read), `inventory:manage` (create/validate/cancel)

**Acceptance Criteria:**

1. [ ] **List:** Table columns: delivery number, SO reference, customer, scheduled date, status, branch/warehouse
2. [ ] Status badges: Draft (gray), Ready (blue), Done (green), Cancelled (red)
3. [ ] Filter by: status, date range, customer, warehouse
4. [ ] **Detail:** Header with delivery number, status, source SO link
5. [ ] Lines table: product, ordered qty, delivered qty (editable on draft), UoM
6. [ ] "Validate" action: deducts stock from warehouse, changes status to Done
7. [ ] Validation blocked if storable product has insufficient stock (unless `allow_negative_stock` is enabled)
8. [ ] Back-order handling: if partial delivery, option to create back-order for remaining qty
9. [ ] Related documents: source SO link
10. [ ] Print packing slip / delivery note PDF

**Dependencies:** US-007 (Sales Order Detail)
**Priority:** P1 (should-have)
**Complexity:** L (5-10 days)

---

### US-019: Receipts List + Detail

**As a** warehouse user,
**I want to** view, process, and validate goods receipts,
**So that** I can receive purchased goods into inventory.

**Route:** `/receipts` (list), `/receipts/:id` (detail)
**API Endpoints:**

- `GET /api/v1/receipts` — paginated list
- `POST /api/v1/receipts` — create receipt (usually from PO)
- `GET /api/v1/receipts/:id` — full receipt with lines
- `PUT /api/v1/receipts/:id` — update (with `version`)
- `POST /api/v1/receipts/:id/validate` — validate (adds stock)
- `POST /api/v1/receipts/:id/cancel` — cancel receipt

**Permission:** `inventory:view` (read), `inventory:manage` (create/validate/cancel)

**Acceptance Criteria:**

1. [ ] **List:** Table columns: receipt number, PO reference, vendor, scheduled date, status, warehouse
2. [ ] Status badges: Draft (gray), Ready (blue), Done (green), Cancelled (red)
3. [ ] Filter by: status, date range, vendor, warehouse
4. [ ] **Detail:** Header with receipt number, status, source PO link
5. [ ] Lines table: product, ordered qty, received qty (editable on draft), UoM
6. [ ] "Validate" action: adds stock to warehouse, changes status to Done
7. [ ] Partial receipt: option to receive less than ordered, creates back-order
8. [ ] Quality check notes field per line
9. [ ] Related documents: source PO link
10. [ ] Print goods receipt note PDF

**Dependencies:** US-011 (Purchase Order Detail)
**Priority:** P1 (should-have)
**Complexity:** L (5-10 days)

---

### US-020: Treasury Accounts + Transactions

**As a** financial controller,
**I want to** manage cash and bank accounts and their transactions,
**So that** I can track the company's cash position.

**Route:** `/cash-accounts` (cash), `/bank-accounts` (bank)
**API Endpoints:**

- `GET /api/v1/treasury-accounts` — list all treasury accounts
- `POST /api/v1/treasury-accounts` — create account
- `GET /api/v1/treasury-accounts/:id` — account detail
- `PATCH /api/v1/treasury-accounts/:id` — update account
- `DELETE /api/v1/treasury-accounts/:id` — delete (if no transactions)
- `POST /api/v1/treasury/transactions` — create transaction (deposit/withdrawal)
- `POST /api/v1/treasury/transfers` — create inter-account transfer
- `GET /api/v1/treasury/accounts/:id/transactions` — account transactions
- `GET /api/v1/treasury/accounts/:id/statement` — account statement
- `GET /api/v1/treasury/transactions/:id` — transaction detail

**Permission:** `treasury:view` (read), `treasury:create` (create), `treasury:manage` (manage)

**Acceptance Criteria:**

1. [ ] **Accounts List:** Cards or table showing: account name, type (cash/bank), bank name, account number, current balance, currency, branch, linked COA account
2. [ ] Separate views for cash accounts and bank accounts (or tabbed)
3. [ ] "Add Account" form: name (bilingual), type, bank name, account number, opening balance, currency, linked COA account, branch
4. [ ] Click account to see transaction history
5. [ ] **Transaction History:** Paginated table with: date, reference, type (deposit/withdrawal/transfer), amount, running balance, memo
6. [ ] "New Transaction" form: type, amount, date, reference, memo, counterpart account (for transfers)
7. [ ] "Transfer" action: select source + destination treasury accounts + amount
8. [ ] Account statement: date range filter, export to PDF/Excel
9. [ ] Balance summary cards: total cash, total bank, grand total (in base currency)
10. [ ] Each transaction creates corresponding journal entry automatically
11. [ ] Cannot delete account with existing transactions

**Dependencies:** US-012 (Chart of Accounts)
**Priority:** P1 (should-have)
**Complexity:** L (5-10 days)

---

### US-021: Payments List + Detail

**As an** accountant,
**I want to** view and manage outbound payments to vendors,
**So that** I can track payables and vendor settlements.

**Route:** `/payments` (list), `/payments/:id` (detail)
**API Endpoints:**

- `GET /api/v1/payments` — paginated list (outbound type)
- `POST /api/v1/payments` — create payment
- `GET /api/v1/payments/:id` — payment detail
- `PUT /api/v1/payments/:id` — update draft payment
- `POST /api/v1/payments/:id/post` — post payment

**Permission:** `payments:view` (read), `payments:manage` (create/post)

**Acceptance Criteria:**

1. [ ] **List:** Table columns: payment number, vendor, date, amount, method, status, linked invoice
2. [ ] Status badges: Draft (gray), Posted (green), Cancelled (red)
3. [ ] Filter by: status, date range, vendor, payment method
4. [ ] **Detail:** Payment date, vendor, amount, method (cash/bank transfer/check), treasury account, linked invoice(s), memo
5. [ ] "Post" action: creates journal entry (DR Payable, CR Treasury account)
6. [ ] Payment can be linked to one or multiple vendor bills
7. [ ] Partial payment: allocate amount across multiple invoices
8. [ ] Print payment voucher PDF
9. [ ] Optimistic locking on updates

**Dependencies:** US-008 (Invoices), US-020 (Treasury)
**Priority:** P1 (should-have)
**Complexity:** M (3-5 days)

---

### US-022: Leaves List + Approval

**As an** HR manager/employee,
**I want to** submit, view, and approve/reject leave requests,
**So that** I can manage employee time-off according to policy.

**Route:** `/leave-management`
**API Endpoints:**

- `GET /api/v1/leaves` — paginated list (all or my leaves based on role)
- `POST /api/v1/leaves` — submit leave request
- `GET /api/v1/leaves/:id` — leave detail
- `PUT /api/v1/leaves/:id` — update (pending only)
- `PATCH /api/v1/leaves/:id/approve` — approve
- `PATCH /api/v1/leaves/:id/reject` — reject
- `PATCH /api/v1/leaves/:id/cancel` — cancel
- `GET /api/v1/leaves/balance/:employeeId` — leave balance
- `GET /api/v1/leaves/employee/:employeeId` — employee leave history

**Permission:** `hr:view` (own leaves), `hr:approve` (approve/reject)

**Acceptance Criteria:**

1. [ ] Table columns: employee name, leave type, start date, end date, days count, status, submitted date
2. [ ] Status badges: Pending (yellow), Approved (green), Rejected (red), Cancelled (gray)
3. [ ] Filter by: status, leave type, employee, department, date range
4. [ ] "Request Leave" form: leave type dropdown, start date, end date, auto-calculate days (exclude weekends/holidays), reason
5. [ ] Leave balance display: allocated, used, remaining — per leave type
6. [ ] Approval actions: Approve / Reject buttons with optional comment (only for managers)
7. [ ] Calendar view option: visual overview of team leaves on a calendar
8. [ ] Validation: cannot request more days than remaining balance
9. [ ] Notification on approval/rejection
10. [ ] Approved leaves automatically deducted from salary during payroll processing

**Dependencies:** US-015 (Employees), Leave Types + Allocations (Phase 5 setup)
**Priority:** P1 (should-have)
**Complexity:** L (5-10 days)

---

### US-023: Contracts List + Detail

**As an** HR manager,
**I want to** manage employee contracts with start/end dates and salary details,
**So that** I can track contract status and get alerted before expiry.

**Route:** (within HR module, `/contracts` or tab in employee detail)
**API Endpoints:**

- `GET /api/v1/contracts` — paginated list
- `POST /api/v1/contracts` — create contract
- `GET /api/v1/contracts/:id` — contract detail
- `PATCH /api/v1/contracts/:id` — update (with `version`)
- `DELETE /api/v1/contracts/:id` — delete draft

**Permission:** `hr:view` (read), `hr:manage` (create/edit/delete)

**Acceptance Criteria:**

1. [ ] **List:** Table columns: employee name, contract type, start date, end date, status, basic salary, department
2. [ ] Status badges: Active (green), Expired (red), Pending (yellow), Terminated (gray)
3. [ ] Filter by: status, department, contract type, expiry within 30 days
4. [ ] **Expiry alert:** highlight contracts expiring within 30 days with warning badge
5. [ ] **Detail:** Employee, contract type (fixed-term/open-ended), start date, end date, basic salary, housing allowance, transportation allowance, other allowances, total package
6. [ ] GOSI auto-calculation display based on nationality
7. [ ] Contract history per employee
8. [ ] Salary revision tracking (if salary changes, new contract record)
9. [ ] Print contract PDF
10. [ ] Optimistic locking on updates

**Dependencies:** US-016 (Employee Detail)
**Priority:** P1 (should-have)
**Complexity:** M (3-5 days)

---

### US-024: Payroll Runs + Payslips

**As an** HR/payroll manager,
**I want to** process monthly payroll runs and generate payslips,
**So that** I can pay employees accurately and on time.

**Route:** `/payroll`
**API Endpoints:**

- `POST /api/v1/payroll/runs` — create payroll run
- `GET /api/v1/payroll/runs` — list runs
- `GET /api/v1/payroll/runs/:id` — run detail with items
- `POST /api/v1/payroll/runs/:id/confirm` — confirm run
- `POST /api/v1/payroll/runs/:id/approve` — approve run
- `POST /api/v1/payroll/runs/:id/mark-paid` — mark as paid
- `POST /api/v1/payroll/runs/:id/items` — add employee to run
- `DELETE /api/v1/payroll/runs/:id/items/:itemId` — remove employee
- `GET /api/v1/payroll/reports` — payroll reports

**Permission:** `payroll:view` (read), `payroll:manage` (create/confirm/approve/pay)

**Acceptance Criteria:**

1. [ ] **Runs List:** Table columns: run name (e.g., "March 2026"), period, status, employee count, gross total, net total
2. [ ] Status flow: Draft -> Confirmed -> Approved -> Paid
3. [ ] "Create Run" form: month/year, department filter (optional), auto-populate employees
4. [ ] **Run Detail:** Summary cards (gross, deductions, net, GOSI employer, GOSI employee)
5. [ ] Payslip items table: employee name, basic salary, allowances, overtime, deductions (GOSI, leaves, advances), net pay
6. [ ] Each row expandable to show payslip breakdown
7. [ ] "Confirm" locks calculations, "Approve" authorizes payment, "Mark Paid" records payment
8. [ ] Approve action creates journal entry (DR Salary Expense, CR Salary Payable / Bank)
9. [ ] Leave deductions auto-calculated from approved leaves in the period
10. [ ] GOSI: Saudi employees 10% employee + 12% employer; non-Saudi: 0%
11. [ ] Salary basis: configurable (actual days in month or fixed 30 days)
12. [ ] Individual payslip print/PDF with breakdown
13. [ ] Payroll run report: summary export to Excel

**Dependencies:** US-016 (Employee Detail), US-023 (Contracts), US-012 (COA)
**Priority:** P1 (should-have)
**Complexity:** XL (10+ days)

---

### US-025: CRM Pipeline (Kanban) + Lead Detail

**As a** sales manager,
**I want to** visualize the sales pipeline as a Kanban board and manage leads through stages,
**So that** I can track deal progress and improve conversion rates.

**Route:** `/crm/pipeline` (kanban), `/crm/leads` (list), `/crm/leads/:id` (detail)
**API Endpoints:**

- `GET /api/v1/crm/pipeline` — leads grouped by stage
- `GET /api/v1/crm/leads` — paginated list
- `POST /api/v1/crm/leads` — create lead
- `GET /api/v1/crm/leads/:id` — lead detail
- `PUT /api/v1/crm/leads/:id` — update lead
- `POST /api/v1/crm/leads/:id/stage` — move to stage
- `POST /api/v1/crm/leads/:id/convert` — convert to sales order
- `POST /api/v1/crm/leads/:id/won` — mark as won
- `POST /api/v1/crm/leads/:id/lost` — mark as lost
- `GET /api/v1/crm/reports/conversion` — conversion report
- `GET /api/v1/crm-stages` — pipeline stages

**Permission:** `crm:view` (read), `crm:manage` (create/edit/move/convert)

**Acceptance Criteria:**

1. [ ] **Kanban Board:** Columns per stage (e.g., New, Qualified, Proposal, Negotiation, Won, Lost)
2. [ ] Drag-and-drop cards between columns to change stage
3. [ ] Card shows: lead name, company, expected revenue, probability %, assigned salesperson, days in stage
4. [ ] Column totals: count of leads, total expected revenue
5. [ ] Filter by: salesperson, date range, source, expected revenue range
6. [ ] **Lead Detail:** Company, contact person, email, phone, source (web/referral/call/etc.), expected revenue, probability, notes
7. [ ] Stage history timeline: shows when the lead moved through each stage
8. [ ] "Convert to SO" action: creates a sales order from the lead, links partner
9. [ ] "Won" / "Lost" actions with reason (lost reason required on Lost)
10. [ ] Activity log: calls, emails, meetings logged against the lead
11. [ ] Toggle between Kanban and list view
12. [ ] Conversion report: funnel chart showing conversion rates between stages

**Dependencies:** US-002 (Partners), US-006 (Sales Orders for conversion)
**Priority:** P2 (nice-to-have)
**Complexity:** XL (10+ days)

---

### US-026: Inventory Adjustments + Transfers

**As a** warehouse manager,
**I want to** adjust stock levels and transfer stock between warehouses,
**So that** I can maintain accurate inventory records.

**Route:** `/stock-adjustments` (adjustments), `/stock-transfers` (transfers)
**API Endpoints:**

- `GET /api/v1/adjustments` — list adjustments
- `POST /api/v1/adjustments` — create adjustment
- `GET /api/v1/adjustments/:id` — adjustment detail
- `GET /api/v1/transfers` — list transfers
- `POST /api/v1/transfers` — create transfer
- `GET /api/v1/transfers/:id` — transfer detail

**Permission:** `inventory:view` (read), `inventory:manage` (create/validate)

**Acceptance Criteria:**

1. [ ] **Adjustments List:** Table columns: adjustment number, date, warehouse, reason, status, line count
2. [ ] "Create Adjustment" form: warehouse, reason (from adjustment reasons dropdown), lines (product, counted qty, current qty, difference)
3. [ ] Difference calculated automatically: counted - system qty
4. [ ] On validate: stock updated, journal entry created (DR/CR Inventory Adjustment account)
5. [ ] **Transfers List:** Table columns: transfer number, source warehouse, destination warehouse, date, status
6. [ ] "Create Transfer" form: source warehouse, destination warehouse, lines (product, quantity)
7. [ ] On validate: deducts from source, adds to destination
8. [ ] Transfer blocked if source warehouse has insufficient stock (unless `allow_negative_stock` enabled)
9. [ ] Both adjustments and transfers support Draft -> Validated status flow
10. [ ] Print adjustment/transfer report PDF

**Dependencies:** US-004 (Products), Warehouses (Phase 2 setup)
**Priority:** P1 (should-have)
**Complexity:** L (5-10 days)

---

### US-027: Settings (Users, Roles, Sequences, Company Settings)

**As an** admin,
**I want to** configure system-wide settings including users, roles, sequences, and company info,
**So that** I can control access and customize the ERP for our business.

**Route:** `/settings/users`, `/roles-permissions`, `/settings/sequences`, `/settings/company`
**API Endpoints:**

- `GET /api/v1/users` — list users
- `POST /api/v1/users` — create user
- `PUT /api/v1/users/:id` — update user
- `DELETE /api/v1/users/:id` — deactivate user
- `GET /api/v1/roles` — list roles
- `POST /api/v1/roles` — create role
- `PUT /api/v1/roles/:id` — update role with permissions
- `DELETE /api/v1/roles/:id` — delete role
- `GET /api/v1/sequences` — list sequences
- `PATCH /api/v1/sequences/:id` — update sequence settings
- `GET /api/v1/config/general` — general settings
- `GET /api/v1/config/accounting` — accounting settings
- `GET /api/v1/config/hr` — HR settings
- `GET /api/v1/config/pos` — POS settings
- `GET /api/v1/company-settings` — company profile
- `PATCH /api/v1/company-settings` — update company

**Permission:** `settings:view` (read), `settings:manage` (edit), `settings:manage_roles` (roles), `settings:manage_sequences` (sequences)

**Acceptance Criteria:**

1. [ ] **Users page:** Table with name, email, role, branch, status, last login; create/edit form with role + branch assignment
2. [ ] **Roles page:** List of roles with permission count; role detail with permission matrix (grouped by module: partners, sales, purchasing, inventory, accounting, treasury, HR, payroll, POS, settings)
3. [ ] Permission matrix: checkboxes for each action per module (view, create, update, delete, manage, approve, post, etc.)
4. [ ] Role changes take effect on next request (permission cache TTL 5 min)
5. [ ] **Sequences page:** Table showing all sequence entities (SO, PO, INV, JE, etc.) with prefix, padding, next number, reset cycle
6. [ ] Edit sequence: prefix, padding length, reset cycle (never/yearly/monthly)
7. [ ] **Company Settings page:** Tabs for General (name, logo, address, phone, CR number, VAT number), Accounting (fiscal year start, base currency, COA settings), HR (salary calculation basis, GOSI settings), POS (default settings)
8. [ ] Company logo upload
9. [ ] Cannot delete the last admin user
10. [ ] Cannot delete a role that is assigned to active users (API error, clear message)
11. [ ] Settings changes take effect immediately (cache invalidated on save)
12. [ ] Bilingual fields for company name

**Dependencies:** US-001 (Login)
**Priority:** P0 (must-have)
**Complexity:** XL (10+ days)

---

## Appendix A: Page Count Summary

| Phase                   | Pages        | Estimated Dev Days |
| ----------------------- | ------------ | ------------------ |
| Phase 1 — Foundation    | 9 pages      | 15-20 days         |
| Phase 2 — Core Business | 11 pages     | 30-40 days         |
| Phase 3 — Operations    | 12 pages     | 35-45 days         |
| Phase 4 — Finance       | 18 pages     | 45-55 days         |
| Phase 5 — People        | 14 pages     | 35-45 days         |
| Phase 6 — Extras        | 16 pages     | 40-50 days         |
| **Total**               | **80 pages** | **200-255 days**   |

With 3 parallel developers: **10-12 weeks** (aligns with 15-week phased plan).

---

## Appendix B: API Module to Frontend Page Mapping

| API Module                   | Frontend Pages                                                 |
| ---------------------------- | -------------------------------------------------------------- |
| `auth`                       | Login                                                          |
| `partners`                   | Partners List, Partner Detail, Customer/Vendor dropdowns       |
| `inventory/products`         | Products List, Product Detail                                  |
| `inventory/categories`       | Product Categories                                             |
| `inventory/warehouses`       | Warehouses                                                     |
| `inventory/adjustments`      | Stock Adjustments                                              |
| `inventory/transfers`        | Stock Transfers                                                |
| `inventory/stock-movements`  | Stock Movements, Inventory Valuation                           |
| `sales/sales-orders`         | Sales Orders List, Sales Order Detail                          |
| `invoices`                   | Invoices List, Invoice Detail, Purchase Invoices               |
| `invoices/payments`          | Payments, Customer Receipts                                    |
| `purchasing`                 | PO List, PO Detail, Vendors                                    |
| `deliveries`                 | Deliveries List, Delivery Detail                               |
| `receipts`                   | Receipts List, Receipt Detail                                  |
| `accounting/accounts`        | Chart of Accounts                                              |
| `accounting/journal-entries` | Journal Entries List, JE Detail                                |
| `accounting/fiscal-periods`  | Period Closing                                                 |
| `accounting/reports`         | Trial Balance, General Ledger, Income Statement, Balance Sheet |
| `accounting-setup`           | Account Groups, Journals, Payment Terms, Taxes                 |
| `treasury`                   | Treasury Accounts, Transactions, Bank Reconciliation           |
| `hr`                         | Employees, Departments, Leaves                                 |
| `hr-extensions`              | Contracts, Attendance, Payroll, Shifts                         |
| `hr-setup`                   | Job Positions, Leave Types, Leave Allocations                  |
| `payroll-new`                | Salary Structures, Payslips                                    |
| `crm`                        | CRM Pipeline, Leads, Contacts                                  |
| `crm-stages`                 | CRM Stage Setup                                                |
| `projects`                   | Projects, Tasks                                                |
| `currency`                   | Currencies, Exchange Rates                                     |
| `sequences`                  | Numbering Series                                               |
| `users`                      | Users List                                                     |
| `roles`                      | Roles & Permissions                                            |
| `company-settings`           | Company Profile                                                |
| `tenant-config`              | System Settings (per domain)                                   |
| `notifications`              | Notifications Center                                           |
| `audit-logs`                 | Audit Logs                                                     |
| `reporting`                  | Reports, Dashboard widgets                                     |
| `chat`                       | Chat                                                           |
| `loyalty`                    | Loyalty Programs, Loyalty Accounts                             |
| `vouchers-gift-cards`        | Vouchers, Gift Cards                                           |
| `pricelists`                 | Price Lists                                                    |
| `pos-sessions`               | POS Sessions Report                                            |
| `pos-orders`                 | POS Orders Report                                              |
| `zatca`                      | ZATCA Settings                                                 |

---

## Appendix C: Shared UI Components Required

These reusable components should be built in Phase 1 (Week 1) before any module pages:

| Component            | Used By                      | Notes                                                          |
| -------------------- | ---------------------------- | -------------------------------------------------------------- |
| `DataTable`          | Every list page              | Server-side pagination, sorting, search, column config, export |
| `DetailPageLayout`   | Every detail page            | Header + tabs + actions pattern                                |
| `QuickCreateDrawer`  | List pages                   | Fast-create form in a drawer                                   |
| `SearchableDropdown` | SO/PO/JE line items          | Async search with debounce, supports quick-create              |
| `StatusBadge`        | Every list/detail            | Color-coded status tags from enum map                          |
| `BilingualInput`     | Every form                   | Paired EN/AR text fields                                       |
| `MoneyInput`         | Financial forms              | Formatted number input with currency symbol                    |
| `DateRangeFilter`    | List pages, reports          | Preset ranges (today, week, month, year, custom)               |
| `ConfirmDialog`      | Action buttons               | Confirmation modal for destructive/status-change actions       |
| `EmptyState`         | List pages                   | Illustration + message + action button when no data            |
| `PageSkeleton`       | Every page                   | Loading skeleton matching page layout                          |
| `TreeView`           | COA, categories              | Hierarchical expandable tree with search                       |
| `KanbanBoard`        | CRM pipeline                 | Drag-and-drop columns                                          |
| `PrintableDocument`  | Invoices, POs, payslips      | PDF-ready document template                                    |
| `FileUpload`         | Products, employees, company | Drag-and-drop with S3 integration                              |
