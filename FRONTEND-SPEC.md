# Tatweer ERP — Frontend API Contract

> **Generated**: 2026-03-17
> **Source**: Exhaustive scan of `erp-api/src/modules/`, `erp-api/src/common/`, `erp-api/src/database/`
> **Stats**: 50 modules · 125 controllers · 316 DTOs · 186 entities · 120 services · 30 enum files

---

## Table of Contents

1. [Common Patterns](#common-patterns)
2. [Auth](#auth)
3. [Users](#users)
4. [Admins](#admins)
5. [Roles & Permissions](#roles--permissions)
6. [Tenants](#tenants)
7. [Subscriptions](#subscriptions)
8. [Accounting — Chart of Accounts](#accounting--chart-of-accounts)
9. [Accounting — Journal Entries](#accounting--journal-entries)
10. [Accounting — Cost Centers](#accounting--cost-centers)
11. [Accounting — Fiscal Periods](#accounting--fiscal-periods)
12. [Accounting — Reports](#accounting--reports)
13. [Accounting Setup — Account Groups, Tax Groups, Taxes, Journals, Payment Terms](#accounting-setup)
14. [Invoices](#invoices)
15. [Payments (Standalone)](#payments-standalone)
16. [Treasury](#treasury)
17. [Bank Statements](#bank-statements)
18. [Fiscal Positions](#fiscal-positions)
19. [Currency & Exchange Rates](#currency--exchange-rates)
20. [ZATCA](#zatca)
21. [Sales Orders](#sales-orders)
22. [Sales Definitions](#sales-definitions)
23. [Purchasing — Purchase Orders](#purchasing--purchase-orders)
24. [Purchasing — Vendors (Legacy)](#purchasing--vendors-legacy)
25. [Purchasing — Definitions](#purchasing--definitions)
26. [Deliveries](#deliveries)
27. [Receipts](#receipts)
28. [Down Payments](#down-payments)
29. [POS Orders](#pos-orders)
30. [POS Sessions & Terminals](#pos-sessions--terminals)
31. [POS Cashiers](#pos-cashiers)
32. [Restaurant](#restaurant)
33. [Inventory — Products](#inventory--products)
34. [Inventory — Categories](#inventory--categories)
35. [Inventory — Warehouses](#inventory--warehouses)
36. [Inventory — Adjustments](#inventory--adjustments)
37. [Inventory — Transfers](#inventory--transfers)
38. [Inventory — Stock Movements & Levels](#inventory--stock-movements--levels)
39. [Inventory — Definitions (UoM, Adjustment Reasons)](#inventory--definitions)
40. [Stock Locations](#stock-locations)
41. [Branch Products](#branch-products)
42. [Product Variants & Attributes](#product-variants--attributes)
43. [Combo Products](#combo-products)
44. [Supplier Products](#supplier-products)
45. [Partners](#partners)
46. [CRM — Leads & Pipeline](#crm--leads--pipeline)
47. [CRM Stages](#crm-stages)
48. [Activities](#activities)
49. [Projects](#projects)
50. [Tasks](#tasks)
51. [Loyalty Programs](#loyalty-programs)
52. [Vouchers & Gift Cards](#vouchers--gift-cards)
53. [Pricelists](#pricelists)
54. [HR — Departments](#hr--departments)
55. [HR — Employees](#hr--employees)
56. [HR — Leaves](#hr--leaves)
57. [HR — Definitions](#hr--definitions)
58. [HR Setup — Leave Types, Allocations, Job Positions](#hr-setup)
59. [HR Extensions — Shifts](#hr-extensions--shifts)
60. [HR Extensions — Attendance](#hr-extensions--attendance)
61. [HR Extensions — Contracts](#hr-extensions--contracts)
62. [HR Extensions — Payroll](#hr-extensions--payroll)
63. [HR Extensions — Training](#hr-extensions--training)
64. [Payroll New — Salary Structures & Rules](#payroll-new)
65. [Payroll New — Payslips](#payroll-new--payslips)
66. [Notifications](#notifications)
67. [Chat](#chat)
68. [Tickets](#tickets)
69. [Sequences](#sequences)
70. [Settings](#settings)
71. [Company Settings](#company-settings)
72. [Tenant Config](#tenant-config)
73. [Audit Logs](#audit-logs)
74. [Email Templates](#email-templates)
75. [Reporting](#reporting)
76. [Enums Reference](#enums-reference)
77. [Sidebar Menu Structure](#sidebar-menu-structure)
78. [Missing or Incomplete](#missing-or-incomplete)

---

## Common Patterns

### API Prefix

All endpoints are prefixed with `/api/v1/`.

### Authentication

- **JWT Bearer**: `Authorization: Bearer <token>` header on all non-public endpoints.
- **Public endpoints**: Decorated with `@Public()` — skip JWT and tenant guards.
- **Super Admin endpoints**: Require JWT + IP whitelist (`SuperAdminIpGuard`).

### Tenant Resolution

- `tenantSlug` and `tenantId` are extracted from the JWT payload.
- `TenantResolverMiddleware` runs on all routes.
- All tenant-scoped entities are filtered by `tenantId` automatically.

### Standard Request Headers

| Header                          | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `Authorization: Bearer <token>` | JWT authentication                    |
| `Accept-Language: en \| ar`     | Language for bilingual responses      |
| `Idempotency-Key: <uuid>`       | Required on `@Idempotent()` endpoints |

### Standard Pagination (Query Params)

All list endpoints accept `PaginationDto`:

| Param       | Type              | Default  | Max   | Description       |
| ----------- | ----------------- | -------- | ----- | ----------------- |
| `page`      | `number`          | `1`      | —     | Page number       |
| `limit`     | `number`          | `20`     | `100` | Items per page    |
| `search`    | `string`          | —        | —     | Full-text search  |
| `sortBy`    | `string`          | varies   | —     | Column to sort by |
| `sortOrder` | `'ASC' \| 'DESC'` | `'DESC'` | —     | Sort direction    |

### Standard Dropdown (Query Params)

Dropdown endpoints accept `DropdownQueryDto`:

| Param    | Type     | Default | Max   |
| -------- | -------- | ------- | ----- |
| `search` | `string` | —       | —     |
| `limit`  | `number` | `50`    | `100` |

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 },
  "timestamp": "2026-03-17T12:00:00.000Z",
  "lang": "en"
}
```

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed",
    "statusCode": 400
  },
  "timestamp": "2026-03-17T12:00:00.000Z"
}
```

Status code mapping: `400` BAD_REQUEST, `401` UNAUTHORIZED, `403` FORBIDDEN, `404` NOT_FOUND, `409` CONFLICT, `422` UNPROCESSABLE_ENTITY, `429` TOO_MANY_REQUESTS, `500` INTERNAL_SERVER_ERROR.

### Optimistic Locking

Update DTOs that include `version: number` (required) enforce optimistic locking. The `version` field must match the current record's version. On mismatch, a `409 Conflict` is returned.

### Soft Delete

All entities use `paranoid: true` (soft delete via `deletedAt`). DELETE endpoints return `204 No Content`.

### Bilingual Fields

Every bilingual entity has `nameEn` + `nameAr` (and optionally `descriptionEn` + `descriptionAr`). Both are always returned from the API.

### Audit Context

All write operations automatically set `createdBy` / `updatedBy` from the authenticated user. An `AuditInterceptor` logs all mutations.

### Rate Limiting

Global: 100 requests per 60 seconds.

### Base Entity Fields

All entities inherit from `BaseEntity` or `TenantAwareEntity`:

| Field       | Type           | Description                           |
| ----------- | -------------- | ------------------------------------- |
| `id`        | `UUID` (v7)    | Primary key                           |
| `tenantId`  | `UUID`         | Tenant scope (TenantAwareEntity only) |
| `createdAt` | `Date`         | Auto-set on create                    |
| `updatedAt` | `Date`         | Auto-set on update                    |
| `deletedAt` | `Date \| null` | Soft delete timestamp                 |
| `createdBy` | `UUID \| null` | User who created                      |
| `updatedBy` | `UUID \| null` | User who last updated                 |
| `version`   | `number`       | Optimistic locking counter            |

---

## Auth

### Sidebar menu item

N/A (login/session management)

### Routes

```
/login               → LoginPage
```

### API Endpoints

#### POST /auth/login

**Purpose:** Login without specifying tenant (auto-resolves from email)
**Auth:** Public
**Body:**

```typescript
{
  email: string; // @IsEmail, @IsNotEmpty
  password: string;
} // @IsString, @MinLength(8)
```

**Response:**

```typescript
{ accessToken: string
  refreshToken: string
  user: { id, email, firstName, lastName, avatarUrl, preferredLang, roles: {id, name}[], permissions: string[] }
  tenant: { slug, nameEn, nameAr, logo }
  branches: { id, name, code, isDefault }[] }
```

#### POST /auth/:tenantSlug/login

**Purpose:** Login to a specific tenant by slug
**Auth:** Public
**Body:** Same as `/auth/login`
**Response:** Same as `/auth/login`

#### POST /auth/refresh

**Purpose:** Refresh access token (rotates refresh token)
**Auth:** Public
**Body:**

```typescript
{
  refreshToken: string;
} // @IsString, @IsNotEmpty
```

**Response:** Same as `/auth/login`

#### POST /auth/logout

**Purpose:** Logout current session
**Auth:** JWT
**Response:** `200 OK`

#### GET /auth/sessions

**Purpose:** List active sessions for current user
**Auth:** JWT
**Response:** `SessionInfo[]` — `{ id, ipAddress, userAgent, lastSeenAt, createdAt, isCurrent }`

#### DELETE /auth/sessions/:id

**Purpose:** Revoke a specific session by ID
**Auth:** JWT

#### DELETE /auth/sessions

**Purpose:** Revoke all sessions (logout everywhere)
**Auth:** JWT

#### GET /auth/pin/status

**Purpose:** Check if the current user has a PIN set
**Auth:** JWT
**Response:** `{ hasPin: boolean }`

#### POST /auth/pin/set

**Purpose:** Set or update the current user PIN
**Auth:** JWT
**Body:** `{ pin: string }` // 4-6 digits

#### POST /auth/pin/verify

**Purpose:** Verify the current user PIN
**Auth:** JWT
**Body:** `{ pin: string }`

### Business Validations (Frontend)

- **Account lockout**: After 5 failed login attempts, account is locked for 15 minutes — show locked message
- **Password requirements**: Min 8 chars, must contain lowercase, uppercase, and digit
- **Token refresh**: If access token expires, call `/auth/refresh` with the stored refresh token
- **Token reuse detection**: If refresh fails with `TOKEN_REUSE_DETECTED`, force full re-login (all sessions compromised)

---

## Users

### Sidebar menu item

Settings > Users

### Routes

```
/settings/users          → UsersListPage
/settings/users/:id      → UserDetailPage
/settings/users/new       → UserDetailPage (new mode)
```

### API Endpoints

#### GET /users

**Purpose:** List all users (paginated)
**Permission:** `settings:view`
**Query:** `PaginationDto`

#### GET /users/dropdown

**Purpose:** Users dropdown list
**Auth:** JWT (no specific permission)
**Query:** `DropdownQueryDto`

#### GET /users/:id

**Purpose:** Get user by ID
**Permission:** `settings:view`

#### POST /users

**Purpose:** Create a new user
**Permission:** `settings:create`
**Body:**

```typescript
{ email: string           // @IsEmail
  password: string        // @MinLength(8)
  firstNameEn: string     // @MaxLength(100)
  firstNameAr: string     // @MaxLength(100)
  lastNameEn: string      // @MaxLength(100)
  lastNameAr: string      // @MaxLength(100)
  phone?: string          // @MaxLength(30)
  roleIds: string[] }     // @ArrayMinSize(1), UUID[]
```

#### PUT /users/:id

**Purpose:** Update a user
**Permission:** `settings:update`
**Body:** All fields from create are optional + `version?: number`

#### DELETE /users/:id

**Purpose:** Soft delete a user
**Permission:** `settings:delete`

#### PATCH /users/:id/restore

**Purpose:** Restore a soft-deleted user
**Permission:** `settings:update`

#### PATCH /users/:id/password

**Purpose:** Change user password
**Auth:** JWT
**Body:**

```typescript
{
  currentPassword: string;
  newPassword: string; // @MinLength(8)
  confirmPassword: string;
}
```

#### PATCH /users/:id/roles

**Purpose:** Assign roles to a user
**Permission:** `settings:update`
**Body:** `{ roleIds: string[] }`

#### GET /users/me

**Purpose:** Get current user profile
**Auth:** JWT

#### GET /users/me/appearance

**Purpose:** Get appearance settings
**Auth:** JWT
**Response:** `{ theme, primaryColor, language, density }`

#### PATCH /users/me/appearance

**Purpose:** Update appearance settings
**Auth:** JWT
**Body:**

```typescript
{ theme?: 'light' | 'dark' | 'system'
  primaryColor?: string
  language?: 'en' | 'ar'
  density?: 'compact' | 'default' | 'comfortable' }
```

#### POST /users/me/data-export

**Purpose:** PDPL: Export personal data
**Auth:** JWT

#### POST /users/me/erasure-request

**Purpose:** PDPL: Request personal data erasure
**Auth:** JWT

#### GET /users/me/consents

**Purpose:** PDPL: Get my consent records
**Auth:** JWT

#### POST /users/me/consents

**Purpose:** PDPL: Record a consent
**Auth:** JWT
**Body:** `{ consentType: 'marketing_email' | 'sms_notifications' | 'data_analytics' | 'third_party_sharing', granted: boolean }`

#### DELETE /users/me/consents/:type

**Purpose:** PDPL: Revoke a consent by type
**Auth:** JWT

### Business Validations

- Email must be unique within tenant — `409 Conflict` on duplicate
- At least 1 role is required when creating a user
- Password change requires matching `newPassword` and `confirmPassword`
- Current password must be verified before changing

---

## Admins

### Sidebar menu item

Backoffice > Admins (super-admin only)

### Routes

```
/backoffice/admins       → AdminsListPage
/backoffice/admins/:id   → AdminDetailPage
```

### API Endpoints

#### POST /admins/login

**Purpose:** Admin login
**Auth:** Public
**Body:** `{ email: string, password: string }`
**Response:** `{ accessToken, admin: { id, email, firstName, lastName } }`

#### POST /admins/logout

**Purpose:** Admin logout
**Auth:** JWT

#### GET /admins

**Purpose:** List all admins
**Auth:** JWT + SuperAdminIP
**Query:** `PaginationDto`

#### GET /admins/:id

**Purpose:** Get admin by ID
**Auth:** JWT + SuperAdminIP

#### POST /admins

**Purpose:** Create a new admin
**Auth:** JWT + SuperAdminIP
**Body:**

```typescript
{
  email: string; // @IsEmail
  password: string; // @MinLength(8)
  firstName: string; // @MaxLength(100)
  lastName: string; // @MaxLength(100)
  role: "super_admin" | "admin" | "support";
}
```

#### PUT /admins/:id

**Purpose:** Update an admin
**Auth:** JWT + SuperAdminIP
**Body:** `{ email?, firstName?, lastName?, role?, isActive? }`

#### DELETE /admins/:id

**Purpose:** Soft delete an admin
**Auth:** JWT + SuperAdminIP

#### Admin Notifications

| Method | Path                                 | Purpose             |
| ------ | ------------------------------------ | ------------------- |
| GET    | `/admins/notifications`              | List notifications  |
| GET    | `/admins/notifications/unread-count` | Unread count        |
| PATCH  | `/admins/notifications/read-all`     | Mark all as read    |
| PATCH  | `/admins/notifications/:id/read`     | Mark single as read |
| DELETE | `/admins/notifications/:id`          | Delete notification |

---

## Roles & Permissions

### Sidebar menu item

Settings > Roles & Permissions

### Routes

```
/settings/roles          → RolesListPage
/settings/roles/:id      → RoleDetailPage
/settings/roles/new       → RoleDetailPage (new mode)
```

### API Endpoints

#### GET /roles

**Purpose:** List all roles
**Permission:** `settings:manage_roles`
**Query:** `PaginationDto`

#### GET /roles/dropdown

**Purpose:** Roles dropdown
**Permission:** `settings:manage_roles`

#### GET /roles/permissions

**Purpose:** List all available permissions
**Permission:** `settings:manage_roles`
**Query:** `PaginationDto`

#### GET /roles/:id

**Purpose:** Get role by ID with assigned permissions
**Permission:** `settings:manage_roles`

#### POST /roles

**Purpose:** Create a new role
**Permission:** `settings:manage_roles`
**Body:**

```typescript
{ nameEn: string           // @MaxLength(100)
  nameAr: string           // @MaxLength(100)
  descriptionEn?: string
  descriptionAr?: string
  permissionIds?: string[] } // UUID[]
```

#### PUT /roles/:id

**Purpose:** Update a role
**Permission:** `settings:manage_roles`
**Body:** All fields optional

#### DELETE /roles/:id

**Purpose:** Soft delete a role
**Permission:** `settings:manage_roles`
**Status:** `204`

#### PUT /roles/:id/permissions

**Purpose:** Replace all permissions for a role
**Permission:** `settings:manage_roles`
**Body:** `{ permissionIds: string[] }` // UUID[]

#### GET /roles/:id/permissions

**Purpose:** Get permissions assigned to a role
**Permission:** `settings:manage_roles`

### Business Validations

- System roles (`isSystem=true`) cannot be deleted or have their names modified
- System role permissions cannot be modified
- Role name must be unique within tenant
- Changing role permissions invalidates permission cache for all affected users

### Permission Structure

176 total permissions across 23 modules. Format: `module:action`.

**Modules:** `accounting`, `activities`, `audit`, `crm`, `hr`, `inventory`, `invoices`, `loyalty`, `notifications`, `partners`, `payments`, `payroll`, `pos`, `products`, `projects`, `purchasing`, `reporting`, `restaurant`, `sales`, `settings`, `treasury`, `vouchers`, `zatca`

**Actions:** `view`, `create`, `update`, `delete`, `approve`, `export`, `manage`

**Special:** `settings:manage_roles`, `settings:manage_billing`, `settings:manage_sequences`, `hr:approve_leave`, `sales:approve_order`, `purchasing:approve_order`, `accounting:post`, `accounting:close`, `audit:read`, `pos:orders`, `pos:session`, `pos:admin`, `treasury:reconcile`, `zatca:read`

---

## Tenants

### Sidebar menu item

Backoffice > Tenants (super-admin only)

### Routes

```
/backoffice/tenants          → TenantsListPage
/backoffice/tenants/:id      → TenantDetailPage
/backoffice/tenants/new       → TenantCreatePage
```

### API Endpoints

All require JWT + SuperAdminIP.

#### Tenant CRUD

| Method | Path                    | Purpose                           |
| ------ | ----------------------- | --------------------------------- |
| GET    | `/tenants/dropdown`     | Tenants dropdown                  |
| GET    | `/tenants`              | List all tenants (paginated)      |
| GET    | `/tenants/:id`          | Get tenant by ID                  |
| POST   | `/tenants`              | Create and provision a new tenant |
| PUT    | `/tenants/:id`          | Update tenant details             |
| PATCH  | `/tenants/:id/suspend`  | Suspend a tenant                  |
| PATCH  | `/tenants/:id/activate` | Activate a tenant                 |
| DELETE | `/tenants/:id`          | Soft delete a tenant              |

**CreateTenantDto:**

```typescript
{ nameEn: string, nameAr: string
  slug: string              // @Matches(/^[a-z0-9-]+$/), @MaxLength(100)
  adminEmail: string        // @IsEmail
  adminPassword: string     // @MinLength(8)
  adminFirstNameEn: string, adminFirstNameAr: string
  adminLastNameEn: string, adminLastNameAr: string
  phone?: string, domain?: string, planId?: string }
```

#### Tenant Branches

| Method | Path                                     | Purpose                |
| ------ | ---------------------------------------- | ---------------------- |
| GET    | `/tenants/:tenantId/branches`            | List branches          |
| GET    | `/tenants/:tenantId/branches/:id`        | Get branch             |
| POST   | `/tenants/:tenantId/branches`            | Create branch          |
| PUT    | `/tenants/:tenantId/branches/:id`        | Update branch          |
| PATCH  | `/tenants/:tenantId/branches/:id/status` | Toggle active/inactive |
| DELETE | `/tenants/:tenantId/branches/:id`        | Soft delete branch     |

**CreateBranchDto:**

```typescript
{ nameEn: string, nameAr: string
  descriptionEn?: string, descriptionAr?: string
  code: string            // @MaxLength(50)
  isMain?: boolean        // default false
  isActive?: boolean      // default true
  address?: string, phone?: string }
```

#### Tenant Users

| Method | Path                                                                | Purpose          |
| ------ | ------------------------------------------------------------------- | ---------------- |
| GET    | `/tenants/:tenantId/users`                                          | List users       |
| GET    | `/tenants/:tenantId/users/:id`                                      | Get user         |
| POST   | `/tenants/:tenantId/users`                                          | Create user      |
| PUT    | `/tenants/:tenantId/users/:id`                                      | Update user      |
| DELETE | `/tenants/:tenantId/users/:id`                                      | Soft delete user |
| POST   | `/tenants/:tenantId/users/:userId/reset-password`                   | Reset password   |
| POST   | `/tenants/:tenantId/users/:userId/force-logout`                     | Force logout     |
| POST   | `/tenants/:tenantId/users/:userId/permission-overrides`             | Add override     |
| DELETE | `/tenants/:tenantId/users/:userId/permission-overrides/:overrideId` | Remove override  |

#### Tenant Roles

| Method | Path                                     | Purpose                     |
| ------ | ---------------------------------------- | --------------------------- |
| GET    | `/tenants/:tenantId/roles`               | List roles (with userCount) |
| GET    | `/tenants/:tenantId/roles/:id`           | Get role with permissions   |
| POST   | `/tenants/:tenantId/roles`               | Create role                 |
| PUT    | `/tenants/:tenantId/roles/:id`           | Update role                 |
| DELETE | `/tenants/:tenantId/roles/:id`           | Soft delete role            |
| POST   | `/tenants/:tenantId/roles/:id/duplicate` | Duplicate role              |

#### Tenant Notes

| Method | Path                           | Purpose     |
| ------ | ------------------------------ | ----------- |
| GET    | `/tenants/:tenantId/notes`     | List notes  |
| POST   | `/tenants/:tenantId/notes`     | Create note |
| PUT    | `/tenants/:tenantId/notes/:id` | Update note |
| DELETE | `/tenants/:tenantId/notes/:id` | Delete note |

#### Tenant Settings & API Keys

| Method | Path                                 | Purpose                |
| ------ | ------------------------------------ | ---------------------- |
| GET    | `/tenants/:tenantId/settings`        | Get settings           |
| PUT    | `/tenants/:tenantId/settings`        | Update settings        |
| POST   | `/tenants/:tenantId/settings/reset`  | Reset to defaults      |
| GET    | `/tenants/:tenantId/api-keys`        | List API keys (masked) |
| POST   | `/tenants/:tenantId/api-keys`        | Generate API key       |
| DELETE | `/tenants/:tenantId/api-keys/:keyId` | Revoke API key         |

### Status Machine

```
trial → active (payment or admin activation)
trial → suspended
trial → cancelled
active → suspended
suspended → active (clears suspendedAt/suspendReason)
```

### Provisioning (on tenant create)

Auto-creates: DB schema, permissions (176), 4 system roles (owner/admin/manager/cashier), admin user, HQ branch, SAR currency, 26 Saudi COA accounts, 15 COA settings, 12 fiscal periods, default warehouse, department, shift, treasury account, sequences, trial subscription, notification templates.

---

## Subscriptions

### Sidebar menu item

Backoffice > Subscriptions (super-admin)

### Routes

```
/backoffice/subscriptions          → SubscriptionsListPage
/backoffice/subscriptions/:id      → SubscriptionDetailPage
/backoffice/plans                  → PlansListPage
```

### API Endpoints

#### Plans

| Method | Path            | Auth       | Purpose                       |
| ------ | --------------- | ---------- | ----------------------------- |
| GET    | `/plans/public` | Public     | List active plans (marketing) |
| GET    | `/plans`        | SuperAdmin | List all plans                |
| GET    | `/plans/:id`    | SuperAdmin | Get plan by ID                |
| POST   | `/plans`        | SuperAdmin | Create plan                   |
| PATCH  | `/plans/:id`    | SuperAdmin | Update plan                   |
| DELETE | `/plans/:id`    | SuperAdmin | Hard delete plan              |

**CreatePlanDto:**

```typescript
{ slug: string              // @Matches(/^[a-z0-9-]+$/)
  nameEn: string, nameAr: string
  descriptionEn?: string, descriptionAr?: string
  monthlyPrice: number      // @Min(0)
  annualPrice: number       // @Min(0)
  currency?: string         // default 'SAR'
  modules: string[]         // feature module names
  maxUsers?: number         // @Min(1)
  features?: Record<string, boolean|string|number>
  sortOrder?: number
  isActive?: boolean }
```

#### Subscriptions

| Method | Path                                  | Auth       | Purpose                       |
| ------ | ------------------------------------- | ---------- | ----------------------------- |
| GET    | `/subscriptions`                      | SuperAdmin | List all subscriptions        |
| GET    | `/subscriptions/analytics`            | SuperAdmin | Analytics (MRR, trends)       |
| GET    | `/subscriptions/me`                   | JWT        | Current tenant's subscription |
| GET    | `/subscriptions/:id`                  | SuperAdmin | Get by ID                     |
| POST   | `/subscriptions/pay`                  | JWT        | Initiate payment (Moyasar)    |
| GET    | `/subscriptions/payment/callback`     | Public     | Payment callback              |
| PATCH  | `/subscriptions/upgrade`              | JWT        | Upgrade plan                  |
| DELETE | `/subscriptions/cancel`               | JWT        | Cancel subscription           |
| GET    | `/subscriptions/transactions`         | JWT        | Payment history               |
| POST   | `/subscriptions/admin/activate`       | SuperAdmin | Manual activate               |
| PATCH  | `/subscriptions/admin/extend-trial`   | SuperAdmin | Extend trial                  |
| DELETE | `/subscriptions/admin/cancel`         | SuperAdmin | Admin cancel                  |
| PATCH  | `/subscriptions/admin/auto-renewal`   | SuperAdmin | Toggle auto-renewal           |
| PATCH  | `/subscriptions/admin/change-plan`    | SuperAdmin | Change plan without payment   |
| POST   | `/subscriptions/admin/retry-payment`  | SuperAdmin | Retry failed payment          |
| PATCH  | `/subscriptions/admin/payment-method` | SuperAdmin | Update payment method         |

### Status Machine

```
trial → active | expired | cancelled
active → past_due | cancelled
past_due → active (retry) | trial (extend)
expired → active (retry) | trial (extend)
cancelled → trial (extend)
```

---

## Accounting — Chart of Accounts

### Sidebar menu item

Accounting > Chart of Accounts

### Routes

```
/accounting/accounts         → AccountsListPage (tree view)
/accounting/accounts/:id     → AccountDetailPage
/accounting/accounts/new      → AccountDetailPage (new mode)
```

### API Endpoints

| Method | Path                                | Permission          | Purpose                          |
| ------ | ----------------------------------- | ------------------- | -------------------------------- |
| GET    | `/accounting/accounts`              | `accounting:view`   | List (paginated, search by code) |
| GET    | `/accounting/accounts/tree`         | `accounting:view`   | Nested tree                      |
| GET    | `/accounting/accounts/grouped-tree` | `accounting:view`   | Grouped by account groups        |
| GET    | `/accounting/accounts/:id`          | `accounting:view`   | Single account                   |
| POST   | `/accounting/accounts`              | `accounting:manage` | Create account                   |
| PATCH  | `/accounting/accounts/:id`          | `accounting:manage` | Update account                   |
| DELETE | `/accounting/accounts/:id`          | `accounting:manage` | Soft delete (204)                |
| POST   | `/accounting/accounts/repair`       | `accounting:manage` | Repair missing COA               |

**CreateAccountDto:**

```typescript
{ code: string              // @MaxLength(20), unique per tenant
  nameEn: string            // @MaxLength(255)
  nameAr: string            // @MaxLength(255)
  descriptionEn?: string    // @MaxLength(500)
  descriptionAr?: string
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  subType?: string          // @MaxLength(50)
  parentId?: string         // UUID
  groupId?: string          // UUID
  currencyId?: string       // UUID
  normalBalance: 'debit' | 'credit'
  isActive?: boolean        // default true
  allowDirectPosting?: boolean // default true
  isReconcilable?: boolean  // default false
  isDeprecated?: boolean    // default false
  openingBalance?: number
  openingBalanceDate?: string
  currency?: string }       // default 'SAR'
```

### Business Validations

- **Code must be unique** within tenant — `409 Conflict`
- **Cannot deactivate** if account has unposted journal lines
- **Cannot delete** if account has posted journal lines

---

## Accounting — Journal Entries

### Sidebar menu item

Accounting > Journal Entries

### Routes

```
/accounting/journal-entries          → JournalEntriesListPage
/accounting/journal-entries/:id      → JournalEntryDetailPage
/accounting/journal-entries/new       → JournalEntryDetailPage (new mode)
```

### API Endpoints

| Method | Path                                      | Permission          | Purpose                                              |
| ------ | ----------------------------------------- | ------------------- | ---------------------------------------------------- |
| GET    | `/accounting/journal-entries`             | `accounting:view`   | List (search by entryNumber, sort by entryDate DESC) |
| GET    | `/accounting/journal-entries/:id`         | `accounting:view`   | Get with lines                                       |
| POST   | `/accounting/journal-entries`             | `accounting:manage` | Create draft entry                                   |
| PATCH  | `/accounting/journal-entries/:id`         | `accounting:manage` | Update draft entry                                   |
| POST   | `/accounting/journal-entries/:id/post`    | `accounting:post`   | Post entry                                           |
| POST   | `/accounting/journal-entries/:id/reverse` | `accounting:post`   | Reverse posted entry                                 |
| DELETE | `/accounting/journal-entries/:id`         | `accounting:manage` | Delete draft (204)                                   |

**CreateJournalEntryDto:**

```typescript
{ entryType?: 'manual' | 'auto' | 'opening' | 'closing' | 'reversal'  // default 'manual'
  entryTypeNew?: 'invoice' | 'payment' | 'stock' | 'payroll' | 'manual' | 'reversal'
  journalId?: string       // UUID
  entryDate: string        // @IsDateString, required
  description?: string
  referenceId?: string     // UUID
  referenceType?: string
  lines: CreateJournalLineDto[] }  // @ArrayMinSize(2)
```

**CreateJournalLineDto:**

```typescript
{ accountId: string        // UUID, required
  partnerId?: string       // UUID — required for reconcilable accounts
  costCenterId?: string    // UUID
  debit: number            // @Min(0)
  credit: number           // @Min(0)
  description?: string
  currencyCode?: string
  currencyId?: string      // UUID
  amountCurrency?: number  // @Min(0)
  exchangeRate?: number }  // @Min(0)
```

### Business Validations (Frontend)

- **Lines must balance**: `|totalDebit - totalCredit| <= 0.01`
- **Each line**: exactly one of debit or credit must be > 0 (not both)
- **Minimum 2 lines** required
- **Cannot update** a posted entry
- **Cannot delete** a posted entry
- **Post validation**: each account must be active, allow direct posting, not deprecated
- **Reconcilable accounts** (AR/AP type): `partnerId` is required on the line
- **Fiscal period**: entry date must fall within an `open` period
- **Fiscal lock date**: entry date must be after the tenant's fiscal lock date

### Status Machine

```
draft (isPosted=false) → posted (isPosted=true) → reversed (isReversed=true)
```

---

## Accounting — Cost Centers

### Sidebar menu item

Accounting > Cost Centers

### API Endpoints

| Method | Path                            | Permission          | Purpose                              |
| ------ | ------------------------------- | ------------------- | ------------------------------------ |
| GET    | `/accounting/cost-centers`      | `accounting:view`   | List (search by code, sort code ASC) |
| GET    | `/accounting/cost-centers/tree` | `accounting:view`   | Nested tree                          |
| GET    | `/accounting/cost-centers/:id`  | `accounting:view`   | Single                               |
| POST   | `/accounting/cost-centers`      | `accounting:manage` | Create                               |
| PATCH  | `/accounting/cost-centers/:id`  | `accounting:manage` | Update                               |
| DELETE | `/accounting/cost-centers/:id`  | `accounting:manage` | Soft delete (204)                    |

**CreateCostCenterDto:**

```typescript
{ code: string           // @MaxLength(20), unique per tenant
  nameEn: string, nameAr: string
  descriptionEn?: string, descriptionAr?: string
  parentId?: string      // UUID
  isActive?: boolean }   // default true
```

---

## Accounting — Fiscal Periods

### Sidebar menu item

Accounting > Fiscal Periods

### API Endpoints

| Method | Path                             | Permission          | Purpose              |
| ------ | -------------------------------- | ------------------- | -------------------- |
| GET    | `/accounting/periods`            | `accounting:view`   | List all periods     |
| GET    | `/accounting/periods/:id`        | `accounting:view`   | Single period        |
| GET    | `/accounting/periods/lock-date`  | `accounting:view`   | Get fiscal lock date |
| POST   | `/accounting/periods`            | `accounting:manage` | Create period        |
| PATCH  | `/accounting/periods/:id`        | `accounting:manage` | Update period        |
| POST   | `/accounting/periods/:id/close`  | `accounting:close`  | Close period         |
| POST   | `/accounting/periods/:id/reopen` | `accounting:close`  | Reopen period        |
| POST   | `/accounting/periods/:id/lock`   | `accounting:close`  | Lock permanently     |
| POST   | `/accounting/periods/lock-date`  | `accounting:close`  | Set fiscal lock date |
| DELETE | `/accounting/periods/lock-date`  | `accounting:close`  | Clear lock date      |

**CreateFiscalPeriodDto:**

```typescript
{ fiscalYear: number       // 2000-2100
  periodNumber: number     // 1-12
  periodType?: 'monthly' | 'quarterly'  // default 'monthly'
  nameEn: string           // @MaxLength(100)
  nameAr: string
  startDate: string, endDate: string }
```

### Status Machine

```
open → closed (no draft entries allowed)
closed → open (reopen)
open/closed → locked (permanent, cannot be undone)
```

---

## Accounting — Reports

### Sidebar menu item

Accounting > Reports (sub-menu: Trial Balance, General Ledger, Income Statement, Balance Sheet)

### API Endpoints

| Method | Path                                    | Permission        | Query Params                                                                              | Purpose                                |
| ------ | --------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| GET    | `/accounting/reports/trial-balance`     | `accounting:view` | `from`, `to` (required), `journalId?`, `groupByAccountGroup?`, `format?` (pdf/xlsx)       | Trial balance                          |
| GET    | `/accounting/reports/general-ledger`    | `accounting:view` | `accountId` (required), `from`, `to` (required)                                           | General ledger with running balance    |
| GET    | `/accounting/reports/income-statement`  | `accounting:view` | `from`, `to` (required), `costCenterId?`, `journalId?`, `costCenterBreakdown?`, `format?` | P&L                                    |
| GET    | `/accounting/reports/balance-sheet`     | `accounting:view` | `asOfDate` (required), `format?`                                                          | Balance sheet                          |
| GET    | `/accounting/reports/account-statement` | `accounting:view` | `accountId` (required), `from`, `to` (required)                                           | Account statement with opening/closing |

---

## Accounting Setup

### Sidebar menu item

Accounting > Setup (sub-menus: Account Groups, Tax Groups, Taxes, Journals, Payment Terms)

### Account Groups

| Method | Path                   | Permission          | Purpose     |
| ------ | ---------------------- | ------------------- | ----------- |
| GET    | `/account-groups`      | `accounting:view`   | List        |
| GET    | `/account-groups/tree` | `accounting:view`   | Nested tree |
| GET    | `/account-groups/:id`  | `accounting:view`   | Single      |
| POST   | `/account-groups`      | `accounting:manage` | Create      |
| PATCH  | `/account-groups/:id`  | `accounting:manage` | Update      |
| DELETE | `/account-groups/:id`  | `accounting:manage` | Soft delete |

**CreateAccountGroupDto:** `codePrefix` (required, max 10, unique), `nameEn`, `nameAr` (required), `parentId?` (UUID)
**UpdateAccountGroupDto:** All optional + `version` (required int)

### Tax Groups

| Method | Path              | Permission          | Purpose     |
| ------ | ----------------- | ------------------- | ----------- |
| GET    | `/tax-groups`     | `accounting:view`   | List        |
| GET    | `/tax-groups/:id` | `accounting:view`   | Single      |
| POST   | `/tax-groups`     | `accounting:manage` | Create      |
| PATCH  | `/tax-groups/:id` | `accounting:manage` | Update      |
| DELETE | `/tax-groups/:id` | `accounting:manage` | Soft delete |

**CreateTaxGroupDto:** `nameEn`, `nameAr` (required)
**UpdateTaxGroupDto:** All optional + `version` (required int)

### Taxes

| Method | Path         | Permission          | Purpose                              |
| ------ | ------------ | ------------------- | ------------------------------------ |
| GET    | `/taxes`     | `accounting:view`   | List (filterable by scope, isActive) |
| GET    | `/taxes/:id` | `accounting:view`   | Single                               |
| POST   | `/taxes`     | `accounting:manage` | Create                               |
| PATCH  | `/taxes/:id` | `accounting:manage` | Update                               |
| DELETE | `/taxes/:id` | `accounting:manage` | Soft delete                          |

**CreateTaxDto:**

```typescript
{ nameEn: string, nameAr: string
  type?: 'percentage' | 'fixed'        // default 'percentage'
  amount?: number                       // default 15.0
  scope?: 'sale' | 'purchase' | 'both' // default 'both'
  includeInPrice?: boolean              // default false
  taxGroupId?: string                   // UUID
  saleAccountId?: string                // UUID
  purchaseAccountId?: string            // UUID
  isActive?: boolean }                  // default true
```

**FilterTaxDto:** extends PaginationDto + `scope?`, `isActive?`

### Journals

| Method | Path            | Permission          | Purpose                             |
| ------ | --------------- | ------------------- | ----------------------------------- |
| GET    | `/journals`     | `accounting:view`   | List (filterable by type, isActive) |
| GET    | `/journals/:id` | `accounting:view`   | Single                              |
| POST   | `/journals`     | `accounting:manage` | Create                              |
| PATCH  | `/journals/:id` | `accounting:manage` | Update                              |
| DELETE | `/journals/:id` | `accounting:manage` | Soft delete                         |

**CreateJournalDto:**

```typescript
{ nameEn: string, nameAr: string
  type: 'sale' | 'purchase' | 'cash' | 'bank' | 'general'
  code: string              // @MaxLength(10), unique per tenant
  defaultAccountId?: string // UUID
  suspenseAccountId?: string
  currencyId?: string
  sequencePrefix?: string
  isActive?: boolean }
```

### Payment Terms

| Method | Path                 | Permission          | Purpose                 |
| ------ | -------------------- | ------------------- | ----------------------- |
| GET    | `/payment-terms`     | `accounting:view`   | List                    |
| GET    | `/payment-terms/:id` | `accounting:view`   | Single with lines       |
| POST   | `/payment-terms`     | `accounting:manage` | Create with lines       |
| PATCH  | `/payment-terms/:id` | `accounting:manage` | Update (lines replaced) |
| DELETE | `/payment-terms/:id` | `accounting:manage` | Soft delete             |

**CreatePaymentTermDto:**

```typescript
{ nameEn: string, nameAr: string
  note?: string              // @MaxLength(500)
  lines?: CreatePaymentTermLineDto[] }
```

**CreatePaymentTermLineDto:**

```typescript
{ sequence?: number          // default 0
  type: 'percent' | 'fixed' | 'balance'
  value?: number             // default 0
  days?: number              // default 0
  dayOfMonth?: number }
```

---

## Invoices

### Sidebar menu item

Accounting > Invoices

### Routes

```
/accounting/invoices          → InvoicesListPage
/accounting/invoices/:id      → InvoiceDetailPage
/accounting/invoices/new       → InvoiceDetailPage (new mode)
```

### API Endpoints

| Method | Path                             | Permission        | Purpose            |
| ------ | -------------------------------- | ----------------- | ------------------ |
| GET    | `/invoices`                      | `invoices:view`   | List with filters  |
| POST   | `/invoices`                      | `invoices:manage` | Create draft       |
| GET    | `/invoices/:id`                  | `invoices:view`   | Get with lines     |
| PUT    | `/invoices/:id`                  | `invoices:manage` | Update draft       |
| POST   | `/invoices/:id/post`             | `invoices:manage` | Post (creates JE)  |
| POST   | `/invoices/:id/cancel`           | `invoices:manage` | Cancel             |
| POST   | `/invoices/:id/register-payment` | `invoices:manage` | Register payment   |
| DELETE | `/invoices/:id`                  | `invoices:manage` | Delete draft (204) |

**FilterInvoiceDto:** extends PaginationDto + `invoiceType?`, `status?`, `paymentStatus?`, `partnerId?`, `branchId?`, `dateFrom?`, `dateTo?`

**CreateInvoiceDto:**

```typescript
{ branchId: string          // UUID, required
  partnerId: string         // UUID, required
  invoiceType: 'out_invoice' | 'out_refund' | 'in_invoice' | 'in_refund'
  invoiceDate: string       // required
  dueDate?: string
  paymentTermId?: string
  saleOrderId?: string
  purchaseOrderId?: string
  currencyId?: string
  exchangeRate?: number
  reference?: string
  narration?: string
  fiscalPositionId?: string
  journalId?: string
  originalInvoiceId?: string  // required for credit/debit notes
  lines: CreateInvoiceLineDto[] }  // @ArrayMinSize(1)
```

**CreateInvoiceLineDto:**

```typescript
{ productId?: string        // UUID
  productVariantId?: string
  description: string       // required
  quantity: number          // @Min(0.0001)
  unitPrice: number         // @Min(0)
  discountPct?: number      // 0-100, default 0
  taxIds?: string[]         // UUID[]
  accountId?: string        // UUID
  sequence?: number }
```

**RegisterPaymentDto:**

```typescript
{ paymentDate: string       // required
  amount: number            // @Min(0.01)
  memo?: string
  treasuryAccountId?: string // UUID
  currencyId?: string
  exchangeRate?: number }
```

### Business Validations

- **Partner must be active** when creating
- **Duplicate vendor bill detection**: same `partnerId + reference + invoiceDate` for `in_invoice`
- **Credit notes**: `originalInvoiceId` must exist; refund amount cannot exceed original total
- **Update**: Only allowed for `draft` status
- **Post**: Must have at least 1 line; creates journal entry
- **Cancel**: Cannot cancel if payments exist
- **Register payment**: Invoice must be `posted`; amount ≤ `amountResidual`
- **Tax formula**: `tax = (quantity × unitPrice - discount) × taxRate / 100`

### Status Machine

```
draft → posted → cancelled
draft → cancelled
```

### Payment Status

```
not_paid → partial (partial payment registered) → paid (fully paid)
posted → reversed (if reversal entry created)
```

---

## Payments (Standalone)

### Sidebar menu item

Accounting > Payments

### API Endpoints

| Method | Path                   | Permission        | Purpose                         |
| ------ | ---------------------- | ----------------- | ------------------------------- |
| GET    | `/payments`            | `payments:view`   | List                            |
| POST   | `/payments`            | `payments:manage` | Create draft                    |
| GET    | `/payments/:id`        | `payments:view`   | Single                          |
| POST   | `/payments/:id/post`   | `payments:manage` | Post (creates JE + treasury tx) |
| POST   | `/payments/:id/cancel` | `payments:manage` | Cancel                          |

**CreatePaymentDto:**

```typescript
{ branchId: string, partnerId: string
  paymentType: 'inbound' | 'outbound'
  paymentDate: string, amount: number  // @Min(0.01)
  currencyId?: string, exchangeRate?: number
  memo?: string, treasuryAccountId?: string, journalId?: string }
```

### Status Machine

```
draft → posted → cancelled
draft → cancelled
```

---

## Treasury

### Sidebar menu item

Accounting > Treasury

### Routes

```
/accounting/treasury/accounts          → TreasuryAccountsListPage
/accounting/treasury/accounts/:id      → TreasuryAccountDetailPage
/accounting/treasury/reconciliation     → ReconciliationPage
```

### Treasury Accounts

| Method | Path                     | Permission        | Purpose     |
| ------ | ------------------------ | ----------------- | ----------- |
| POST   | `/treasury/accounts`     | `treasury:manage` | Create      |
| GET    | `/treasury/accounts`     | `treasury:view`   | List        |
| GET    | `/treasury/accounts/:id` | `treasury:view`   | Single      |
| PATCH  | `/treasury/accounts/:id` | `treasury:manage` | Update      |
| DELETE | `/treasury/accounts/:id` | `treasury:manage` | Soft delete |

**CreateTreasuryAccountDto:**

```typescript
{ nameEn: string, nameAr: string
  type: 'cash' | 'bank'
  descriptionEn?: string, descriptionAr?: string
  currency?: string         // default base currency
  coaAccountId?: string     // UUID
  branchId?: string
  isDefault?: boolean       // default false
  isActive?: boolean        // default true
  bankName?: string, accountNumber?: string
  iban?: string             // @Matches(/^SA\d{22}$/) for Saudi
  swiftCode?: string }
```

### Treasury Transactions

| Method | Path                                  | Permission        | Purpose                               |
| ------ | ------------------------------------- | ----------------- | ------------------------------------- |
| POST   | `/treasury/transactions`              | `treasury:manage` | Create receipt/payment/openingBalance |
| POST   | `/treasury/transfers`                 | `treasury:manage` | Transfer between accounts             |
| GET    | `/treasury/accounts/:id/transactions` | `treasury:view`   | List by account                       |
| GET    | `/treasury/accounts/:id/statement`    | `treasury:view`   | Statement with running balance        |
| GET    | `/treasury/transactions/:id`          | `treasury:view`   | Single                                |

**CreateTreasuryTransactionDto:**

```typescript
{ accountId: string         // UUID
  type: 'receipt' | 'payment' | 'openingBalance'
  amount: number            // @Min(0.01)
  date: string, description?: string, reference?: string
  partnerId?: string, paymentId?: string }
```

**CreateTransferDto:**

```typescript
{ sourceAccountId: string, destinationAccountId: string  // UUID
  amount: number            // @Min(0.01)
  date: string, description?: string, reference?: string }
```

### Treasury Definitions

| Method | Path                                         | Permission        | Purpose     |
| ------ | -------------------------------------------- | ----------------- | ----------- |
| GET    | `/treasury/definitions/transfer-reasons`     | `treasury:view`   | List        |
| GET    | `/treasury/definitions/transfer-reasons/:id` | `treasury:view`   | Single      |
| POST   | `/treasury/definitions/transfer-reasons`     | `treasury:manage` | Create      |
| PATCH  | `/treasury/definitions/transfer-reasons/:id` | `treasury:manage` | Update      |
| DELETE | `/treasury/definitions/transfer-reasons/:id` | `treasury:manage` | Soft delete |

### Reconciliation

| Method | Path                                                    | Permission           | Purpose                        |
| ------ | ------------------------------------------------------- | -------------------- | ------------------------------ |
| POST   | `/treasury/reconciliations`                             | `treasury:reconcile` | Create session                 |
| GET    | `/treasury/reconciliations`                             | `treasury:view`      | List                           |
| GET    | `/treasury/reconciliations/:id`                         | `treasury:view`      | Single                         |
| GET    | `/treasury/reconciliations/:id/unmatched`               | `treasury:reconcile` | Unmatched transactions         |
| POST   | `/treasury/reconciliations/:id/match`                   | `treasury:reconcile` | Match transactions             |
| POST   | `/treasury/reconciliations/:id/unmatch`                 | `treasury:reconcile` | Unmatch transactions           |
| POST   | `/treasury/reconciliations/:id/complete`                | `treasury:reconcile` | Complete (difference must = 0) |
| POST   | `/treasury/reconciliations/:id/import`                  | `treasury:reconcile` | Import CSV (multipart)         |
| POST   | `/treasury/reconciliations/:id/auto-match/:statementId` | `treasury:reconcile` | Auto-match lines               |

### Reconciliation Status Machine

```
draft → in_progress → completed
```

- **Complete**: difference must be exactly 0
- Cannot modify completed reconciliations

---

## Bank Statements

### Sidebar menu item

Accounting > Bank Statements

### API Endpoints

| Method | Path                                     | Permission          | Purpose                         |
| ------ | ---------------------------------------- | ------------------- | ------------------------------- |
| GET    | `/bank-statements`                       | `accounting:view`   | List (filter: branchId, status) |
| POST   | `/bank-statements`                       | `accounting:manage` | Create                          |
| GET    | `/bank-statements/:id`                   | `accounting:view`   | Single                          |
| POST   | `/bank-statements/:id/import`            | `accounting:manage` | Import CSV (multipart)          |
| POST   | `/bank-statements/:id/auto-match`        | `accounting:manage` | Auto-match                      |
| POST   | `/bank-statements/:id/validate`          | `accounting:manage` | Validate and post               |
| DELETE | `/bank-statements/:id`                   | `accounting:manage` | Delete open statement           |
| GET    | `/bank-statements/:id/lines`             | `accounting:view`   | Paginated lines                 |
| POST   | `/bank-statements/:id/lines`             | `accounting:manage` | Add line                        |
| DELETE | `/bank-statements/lines/:lineId`         | `accounting:manage` | Delete unreconciled line        |
| POST   | `/bank-statements/lines/:lineId/match`   | `accounting:manage` | Manual match                    |
| POST   | `/bank-statements/lines/:lineId/unmatch` | `accounting:manage` | Remove match                    |

### Status Machine

```
open → posted (via validate)
```

Only `open` statements can be modified/deleted.

---

## Fiscal Positions

### Sidebar menu item

Accounting > Fiscal Positions

### API Endpoints

| Method | Path                        | Permission          | Purpose                     |
| ------ | --------------------------- | ------------------- | --------------------------- |
| GET    | `/fiscal-positions`         | `accounting:view`   | List                        |
| GET    | `/fiscal-positions/resolve` | `accounting:view`   | Resolve taxes for a partner |
| GET    | `/fiscal-positions/:id`     | `accounting:view`   | Single with mappings        |
| POST   | `/fiscal-positions`         | `accounting:manage` | Create with mappings        |
| PUT    | `/fiscal-positions/:id`     | `accounting:manage` | Update (replaces mappings)  |
| DELETE | `/fiscal-positions/:id`     | `accounting:manage` | Soft delete                 |

**CreateFiscalPositionDto:**

```typescript
{ nameEn: string, nameAr: string
  autoDetect?: boolean      // default false
  country?: string, note?: string
  taxMappings?: { taxSrcId: string, taxDestId?: string }[]      // null taxDestId = remove tax
  accountMappings?: { accountSrcId: string, accountDestId: string }[] }
```

**ResolveFiscalPositionDto:** `{ partnerId: string, taxIds: string[] }`
**Response:** `{ taxIds: string[], fiscalPositionId: string }`

---

## Currency & Exchange Rates

### Sidebar menu item

Accounting > Currencies

### API Endpoints

| Method | Path                       | Permission          | Purpose                   |
| ------ | -------------------------- | ------------------- | ------------------------- |
| POST   | `/currencies`              | `accounting:manage` | Create currency           |
| GET    | `/currencies`              | `accounting:view`   | List (sorted by code ASC) |
| PATCH  | `/currencies/:id`          | `accounting:manage` | Update                    |
| POST   | `/currencies/:id/set-base` | `accounting:manage` | Set as base currency      |
| POST   | `/exchange-rates`          | `accounting:manage` | Create rate entry         |
| GET    | `/exchange-rates`          | `accounting:view`   | Get rate for pair/date    |
| GET    | `/exchange-rates/history`  | `accounting:view`   | Rate history              |

**CreateCurrencyDto:**

```typescript
{ code: string              // exactly 3 chars
  nameEn: string, nameAr: string, symbol: string
  isBase?: boolean          // default false
  isActive?: boolean        // default true
  decimalPlaces?: number }  // default 2
```

**CreateExchangeRateDto:**

```typescript
{ fromCurrencyId: string, toCurrencyId: string  // UUID
  rate: number              // @Min(0.000001)
  rateDate: string          // required
  source?: 'manual' | 'auto' }  // default 'manual'
```

---

## ZATCA

### Sidebar menu item

Accounting > ZATCA

### API Endpoints

| Method | Path                                   | Permission     | Purpose                        |
| ------ | -------------------------------------- | -------------- | ------------------------------ |
| POST   | `/zatca/invoices/:orderId/issue`       | `zatca:manage` | Issue ZATCA invoice            |
| POST   | `/zatca/invoices/:orderId/credit-note` | `zatca:manage` | Issue credit note              |
| GET    | `/zatca/invoices/:orderId/xml`         | `zatca:read`   | Download signed XML            |
| GET    | `/zatca/invoices/:orderId/qr`          | `zatca:read`   | Get QR code                    |
| POST   | `/zatca/config`                        | `zatca:manage` | Save ZATCA config              |
| GET    | `/zatca/config`                        | `zatca:read`   | Get config (sensitive masked)  |
| POST   | `/zatca/onboarding/csr`                | `zatca:manage` | Generate CSR (placeholder)     |
| POST   | `/zatca/onboarding/compliance-check`   | `zatca:manage` | Compliance check (placeholder) |

---

## Sales Orders

### Sidebar menu item

Sales > Orders

### Routes

```
/sales/orders          → SalesOrdersListPage
/sales/orders/:id      → SalesOrderDetailPage
/sales/orders/new       → SalesOrderDetailPage (new mode)
```

### API Endpoints

| Method | Path                                | Permission     | Purpose                                   |
| ------ | ----------------------------------- | -------------- | ----------------------------------------- |
| GET    | `/sales/orders`                     | `sales:view`   | List with pagination                      |
| GET    | `/sales/orders/:id`                 | `sales:view`   | Get with lines                            |
| GET    | `/sales/orders/reports/summary`     | `sales:view`   | Sales summary (JSON/PDF/XLSX)             |
| POST   | `/sales/orders`                     | `sales:manage` | Create draft SO                           |
| PUT    | `/sales/orders/:id`                 | `sales:manage` | Update draft (replaces lines if provided) |
| POST   | `/sales/orders/:id/confirm`         | `sales:manage` | Confirm (reserves stock)                  |
| POST   | `/sales/orders/:id/create-invoice`  | `sales:manage` | Create invoice from SO                    |
| POST   | `/sales/orders/:id/create-delivery` | `sales:manage` | Create delivery from SO                   |
| POST   | `/sales/orders/:id/cancel`          | `sales:manage` | Cancel                                    |
| DELETE | `/sales/orders/:id`                 | `sales:manage` | Delete draft                              |
| POST   | `/sales/orders/:id/lines`           | `sales:manage` | Add line (draft only)                     |
| PUT    | `/sales/orders/:id/lines/:lineId`   | `sales:manage` | Update line (draft only)                  |
| DELETE | `/sales/orders/:id/lines/:lineId`   | `sales:manage` | Remove line (draft only)                  |

**CreateSalesOrderDto:**

```typescript
{ partnerId: string         // UUID, required
  branchId?: string, currencyId?: string, pricelistId?: string
  paymentTermId?: string, salespersonId?: string, fiscalPositionId?: string
  notes?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number    // @Min(0)
  lines: CreateSalesOrderLineDto[] }  // @ArrayMinSize(1)
```

**CreateSalesOrderLineDto:**

```typescript
{ productId: string         // UUID, required
  productVariantId?: string
  quantity: number          // @Min(0.001), maxDecimalPlaces: 3
  unitPrice: number         // @Min(0), maxDecimalPlaces: 2
  discountPct?: number      // 0-100, default 0
  taxRate?: number          // default 15
  description?: string }
```

**CreateInvoiceFromSODto:**

```typescript
{ type: 'regular' | 'down_payment_percentage' | 'down_payment_fixed'
  value?: number }          // used for down payment amount/percentage
```

### Business Validations

- **Confirm**: Must have at least 1 line; for storable products, checks available stock (quantity - reserved) — blocks if insufficient
- **Create Invoice**: SO must be `confirmed` or `done`; for down_payment_percentage: 0.01-100; for down_payment_fixed: 0 < value <= orderTotal
- **Create Delivery**: SO must be `confirmed` or `done`; filters lines with remaining qty > 0
- **Cancel**: Blocks if linked invoices or deliveries exist; if confirmed, releases stock reservations
- **Tax formula**: `tax = ROUND((lineSubtotal - lineDiscount) × taxRate / 100, 2)`
- Default VAT rate: 15%

### Status Machine

```
draft → confirmed → done (auto when invoiced + delivered)
draft → cancelled
confirmed → cancelled (no linked invoices/deliveries)
```

Sub-statuses:

- `invoiceStatus`: `nothing` → `to_invoice` → `invoiced`
- `deliveryStatus`: `pending` → `partial` → `done`

---

## Sales Definitions

### Sidebar menu item

Sales > Definitions

All definition entities follow CRUD pattern at `/sales/definitions/<type>`:

| Type                 | Path                                      | Fields                                                                                                                                                                       |
| -------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Voucher Types        | `/sales/definitions/voucher-types`        | `nameEn`, `nameAr`, `descriptionEn?`, `descriptionAr?`, `discountType`, `discountValue`, `minOrderAmount?`, `validDays?`, `maxUses?`, `isActive?`                            |
| Receipt Templates    | `/sales/definitions/receipt-templates`    | `nameEn`, `nameAr`, `headerTextEn?`, `headerTextAr?`, `footerTextEn?`, `footerTextAr?`, `showLogo?`, `showTaxDetails?`, `showBarcode?`, `copies?`, `isDefault?`, `isActive?` |
| Cancellation Reasons | `/sales/definitions/cancellation-reasons` | `nameEn`, `nameAr`, `requiresApproval?`, `isActive?`                                                                                                                         |
| Void/Refund Reasons  | `/sales/definitions/void-refund-reasons`  | `nameEn`, `nameAr`, `type?` (`void`/`refund`/`both`), `requiresManager?`, `isActive?`                                                                                        |
| Discount Reasons     | `/sales/definitions/discount-reasons`     | `nameEn`, `nameAr`, `maxPercent?`, `requiresApproval?`, `isActive?`                                                                                                          |
| Hold Reasons         | `/sales/definitions/hold-reasons`         | `nameEn`, `nameAr`, `maxHoldMinutes?`, `isActive?`                                                                                                                           |

Permissions: `sales:view` (GET), `sales:create` (POST), `sales:update` (PATCH), `sales:delete` (DELETE)

---

## Purchasing — Purchase Orders

### Sidebar menu item

Purchasing > Purchase Orders

### Routes

```
/purchasing/orders          → PurchaseOrdersListPage
/purchasing/orders/:id      → PurchaseOrderDetailPage
/purchasing/orders/new       → PurchaseOrderDetailPage (new mode)
```

### API Endpoints

| Method | Path                                  | Permission          | Purpose                   |
| ------ | ------------------------------------- | ------------------- | ------------------------- |
| GET    | `/purchase-orders`                    | `purchasing:view`   | List all POs              |
| GET    | `/purchase-orders/:id`                | `purchasing:view`   | Get with lines            |
| POST   | `/purchase-orders`                    | `purchasing:manage` | Create draft PO           |
| PUT    | `/purchase-orders/:id`                | `purchasing:manage` | Update draft              |
| POST   | `/purchase-orders/:id/confirm`        | `purchasing:manage` | Confirm PO                |
| POST   | `/purchase-orders/:id/create-receipt` | `purchasing:manage` | Create goods receipt      |
| POST   | `/purchase-orders/:id/create-bill`    | `purchasing:manage` | Create vendor bill        |
| POST   | `/purchase-orders/:id/cancel`         | `purchasing:manage` | Cancel PO                 |
| DELETE | `/purchase-orders/:id`                | `purchasing:manage` | Delete draft (204)        |
| POST   | `/purchase-orders/:id/lines`          | `purchasing:manage` | Add line (draft only)     |
| PUT    | `/purchase-orders/:id/lines/:lineId`  | `purchasing:manage` | Update line               |
| DELETE | `/purchase-orders/:id/lines/:lineId`  | `purchasing:manage` | Remove line               |
| GET    | `/purchasing/reports/summary`         | `purchasing:view`   | Purchasing summary report |

**CreatePurchaseOrderDto:**

```typescript
{ partnerId: string         // UUID, required — must be a supplier
  branchId: string          // UUID, required
  currencyId?: string, paymentTermId?: string, buyerId?: string
  expectedDeliveryDate?: string
  discountAmount?: number   // @Min(0)
  notes?: string
  lines: CreatePurchaseOrderLineDto[] }  // @ArrayMinSize(1)
```

**CreatePurchaseOrderLineDto:**

```typescript
{ productId: string         // UUID, required
  productVariantId?: string
  quantity: number          // @Min(1)
  unitPrice: number         // @Min(0)
  taxRate?: number, discountAmount?: number  // default 0
  description?: string }
```

### Business Validations

- Partner must have `isSupplier = true`
- **Cancel**: Blocks if `receiptStatus != nothing` or `billStatus != nothing`
- **Tax formula**: `tax = (qty × unitPrice - lineDiscount) × taxRate / 100`

### Status Machine

```
draft → confirmed → done (auto when received + billed)
draft → cancelled
confirmed → cancelled (no receipts/bills)
```

Sub-statuses:

- `billStatus`: `nothing` → `to_bill` → `billed`
- `receiptStatus`: `nothing` → `partial` → `received`

---

## Purchasing — Vendors (Legacy)

Delegates to Partners with `isSupplier=true`. Path: `/purchasing/vendors`

| Method | Path                           | Purpose     |
| ------ | ------------------------------ | ----------- |
| GET    | `/purchasing/vendors/dropdown` | Dropdown    |
| GET    | `/purchasing/vendors`          | List        |
| GET    | `/purchasing/vendors/:id`      | Single      |
| POST   | `/purchasing/vendors`          | Create      |
| PATCH  | `/purchasing/vendors/:id`      | Update      |
| DELETE | `/purchasing/vendors/:id`      | Soft delete |

---

## Purchasing — Definitions

Path: `/purchasing/definitions`

| Type              | Fields                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| Payment Terms     | `nameEn`, `nameAr`, `descriptionEn?`, `descriptionAr?`, `daysDue` (required int), `penaltyPercentage?`, `isActive?` |
| Rejection Reasons | `nameEn`, `nameAr`, `isActive?`                                                                                     |

---

## Deliveries

### Sidebar menu item

Inventory > Deliveries

### API Endpoints

| Method | Path                       | Permission         | Purpose                                                 |
| ------ | -------------------------- | ------------------ | ------------------------------------------------------- |
| GET    | `/deliveries`              | `inventory:view`   | List (filter: status, saleOrderId, partnerId, branchId) |
| POST   | `/deliveries`              | `inventory:manage` | Create delivery                                         |
| GET    | `/deliveries/:id`          | `inventory:view`   | Get with lines                                          |
| PUT    | `/deliveries/:id`          | `inventory:manage` | Update draft                                            |
| POST   | `/deliveries/:id/validate` | `inventory:manage` | Validate (creates stock moves)                          |
| POST   | `/deliveries/:id/cancel`   | `inventory:manage` | Cancel                                                  |

**CreateDeliveryDto:**

```typescript
{ branchId: string, partnerId: string  // required
  saleOrderId?: string, scheduledDate?: string
  responsibleId?: string, notes?: string
  lines: CreateDeliveryLineDto[] }
```

**CreateDeliveryLineDto:**

```typescript
{ productId: string         // required
  saleOrderLineId?: string, productVariantId?: string
  qtyDemand: number         // @Min(0.0001)
  qtyDone?: number          // @Min(0), default 0
  unitOfMeasureId?: string, locationId?: string
  lotNumber?: string, serialNumber?: string }
```

### Status Machine

```
draft → ready → done (via validate)
draft → cancelled
ready → cancelled
```

---

## Receipts

### Sidebar menu item

Inventory > Receipts

### API Endpoints

| Method | Path                     | Permission         | Purpose                                                     |
| ------ | ------------------------ | ------------------ | ----------------------------------------------------------- |
| GET    | `/receipts`              | `inventory:view`   | List (filter: status, purchaseOrderId, partnerId, branchId) |
| POST   | `/receipts`              | `inventory:manage` | Create                                                      |
| GET    | `/receipts/:id`          | `inventory:view`   | Get with lines                                              |
| PUT    | `/receipts/:id`          | `inventory:manage` | Update draft                                                |
| POST   | `/receipts/:id/validate` | `inventory:manage` | Validate (creates stock moves, updates PO)                  |
| POST   | `/receipts/:id/cancel`   | `inventory:manage` | Cancel                                                      |

**CreateReceiptLineDto** (extends delivery line with):

```typescript
{ expiryDate?: string       // @IsDateString
  unitCost?: number }       // @Min(0), default 0
```

### Status Machine

Same as Deliveries: `draft → ready → done`, `draft/ready → cancelled`

---

## Down Payments

### API Endpoints

| Method | Path                             | Permission     | Purpose                   |
| ------ | -------------------------------- | -------------- | ------------------------- |
| POST   | `/sale-orders/:id/down-payment`  | `sales:manage` | Create down payment       |
| GET    | `/sale-orders/:id/down-payments` | `sales:view`   | List down payments for SO |

**CreateDownPaymentDto:**

```typescript
{ branchId: string          // UUID, required
  type: 'percentage' | 'fixed'
  value: number             // @Min(0)
  invoiceId?: string }
```

---

## POS Orders

### Sidebar menu item

POS (standalone app)

### API Endpoints

| Method | Path                            | Permission    | Purpose                          |
| ------ | ------------------------------- | ------------- | -------------------------------- |
| POST   | `/pos/orders`                   | `pos:orders`  | Create order                     |
| GET    | `/pos/orders`                   | `pos:orders`  | List orders                      |
| POST   | `/pos/orders/sync`              | `pos:session` | Sync offline orders (batch ≤ 50) |
| GET    | `/pos/orders/held`              | `pos:orders`  | List held orders for session     |
| GET    | `/pos/orders/:id`               | `pos:orders`  | Get with items + payments        |
| PATCH  | `/pos/orders/:id`               | `pos:orders`  | Update order metadata            |
| DELETE | `/pos/orders/:id`               | `pos:orders`  | Void order (204)                 |
| POST   | `/pos/orders/:id/items`         | `pos:orders`  | Add item                         |
| PATCH  | `/pos/orders/:id/items/:itemId` | `pos:orders`  | Update item                      |
| DELETE | `/pos/orders/:id/items/:itemId` | `pos:orders`  | Remove item (204)                |
| POST   | `/pos/orders/:id/checkout`      | `pos:orders`  | Checkout/pay                     |
| POST   | `/pos/orders/:id/refund`        | `pos:orders`  | Refund                           |
| POST   | `/pos/orders/:id/hold`          | `pos:orders`  | Hold order                       |
| POST   | `/pos/orders/held/:id/resume`   | `pos:orders`  | Resume held order                |

**CreateOrderDto:**

```typescript
{ orderType?: 'takeaway' | 'dine_in' | 'delivery'  // default 'takeaway'
  partnerId?: string, tableId?: string
  deliveryAddress?: string   // @MaxLength(1000)
  pricelistId?: string }
```

**AddOrderItemDto:**

```typescript
{ productId: string         // UUID, required
  productVariantId?: string
  quantity: number          // @Min(0.001)
  discountAmount?: number   // @Min(0), default 0
  course?: string           // @MaxLength(30)
  notes?: string }          // @MaxLength(500)
```

**CheckoutDto:**

```typescript
{ payments: PaymentEntryDto[]  // @ArrayMinSize(1)
  discount?: { type: 'percent' | 'fixed', value: number }
  tipAmount?: number        // @Min(0), default 0
  voucherCode?: string      // @MaxLength(100)
  warehouseId?: string, currencyId?: string }
```

**PaymentEntryDto:**

```typescript
{ method: string            // 'cash' | 'card' | 'gift_card' | 'loyalty_points' | 'credit'
  amount: number            // @Min(0.01)
  amountGiven?: number      // for cash
  reference?: string        // card auth ref
  giftCardId?: string, giftCardCode?: string
  pointsToRedeem?: number } // @Min(1)
```

**RefundOrderDto:**

```typescript
{ refundType: 'full' | 'partial'
  approvedBy: string        // UUID, required (manager)
  reason?: string, refundMethod?: string, warehouseId?: string
  items?: { orderItemId: string, quantity: number }[] }  // required for partial
```

### Business Validations (Frontend)

- **Checkout**: Payment sum must exactly equal `totalAmount`
- **Cash**: `amountGiven` must be >= `amount`
- **Voucher**: Customer required if using voucher or loyalty points
- **Hold**: Max 10 held orders per session
- **Variant**: If product `hasVariants`, must provide `productVariantId`
- **Tax formula**: `tax = ROUND((subtotal - discount) × 15 / 100, 2)` — always 15% VAT
- **Tip**: Does not count toward loyalty points

### Status Machine

```
open → paid (checkout)
open → voided (void or hold)
paid → refunded (refund)
```

---

## POS Sessions & Terminals

### API Endpoints — Sessions

| Method | Path                      | Permission    | Purpose                        |
| ------ | ------------------------- | ------------- | ------------------------------ |
| POST   | `/pos/sessions/open`      | `pos:session` | Open session                   |
| POST   | `/pos/sessions/:id/close` | `pos:session` | Close session                  |
| GET    | `/pos/sessions/current`   | `pos:session` | Current session + cash summary |
| GET    | `/pos/sessions`           | `pos:view`    | List all sessions              |
| GET    | `/pos/sessions/:id`       | `pos:view`    | Single session                 |

**OpenSessionDto:** `{ terminalId: string, openingFloat: number, notes?: string }`
**CloseSessionDto:** `{ closingFloat: number, notes?: string }`

### Business Validations

- **One open session per cashier** — `409 Conflict` if already open
- Terminal must be active
- On close: `expectedFloat = openingFloat + cashIn - cashOut`, `difference = closingFloat - expectedFloat`

### Session Status Machine

```
open → closed (no reopening)
```

### API Endpoints — Terminals

| Method | Path                      | Permission   | Purpose           |
| ------ | ------------------------- | ------------ | ----------------- |
| POST   | `/pos/terminals`          | `pos:manage` | Create            |
| GET    | `/pos/terminals`          | `pos:view`   | List              |
| GET    | `/pos/terminals/:id`      | `pos:view`   | Single            |
| PATCH  | `/pos/terminals/:id`      | `pos:manage` | Update            |
| DELETE | `/pos/terminals/:id`      | `pos:manage` | Soft delete       |
| POST   | `/pos/terminals/:id/ping` | **Public**   | Update lastSeenAt |

### Cash Movements

| Method | Path                      | Permission    | Purpose                  |
| ------ | ------------------------- | ------------- | ------------------------ |
| GET    | `/pos/cash-movements`     | `pos:session` | List for current session |
| POST   | `/pos/cash-movements`     | `pos:session` | Create cash in/out       |
| DELETE | `/pos/cash-movements/:id` | `pos:manage`  | Void movement            |

**CreateCashMovementDto:** `{ type: 'cash_in' | 'cash_out', amount: number, reason: string, notes?: string }`

---

## POS Cashiers

### API Endpoints — Cashiers

| Method | Path                         | Permission    | Purpose             |
| ------ | ---------------------------- | ------------- | ------------------- |
| POST   | `/pos/cashiers`              | `pos:admin`   | Create cashier      |
| GET    | `/pos/cashiers`              | `pos:admin`   | List                |
| GET    | `/pos/cashiers/:id`          | `pos:admin`   | Single              |
| PATCH  | `/pos/cashiers/:id`          | `pos:admin`   | Update              |
| DELETE | `/pos/cashiers/:id`          | `pos:admin`   | Soft delete         |
| POST   | `/pos/cashiers/authenticate` | `pos:session` | Authenticate by PIN |
| POST   | `/pos/cashiers/:id/set-pin`  | `pos:admin`   | Set/change PIN      |

**CreateCashierDto:**

```typescript
{ userId: string, pin: string  // 4-6 digits, @Matches(/^\d{4,6}$/)
  displayName: string
  isActive?: boolean            // default true
  maxDiscountPct?: number       // 0-100, default 10
  canRefund?: boolean           // default false
  canVoid?: boolean             // default false
  canOpenDrawer?: boolean }     // default true
```

### PIN Lockout

- **5 failed attempts** → locked for **15 minutes**
- Successful auth resets counter

### API Endpoints — Manager Overrides

| Method | Path                         | Permission   | Purpose                  |
| ------ | ---------------------------- | ------------ | ------------------------ |
| POST   | `/pos/overrides`             | `pos:orders` | Request override         |
| POST   | `/pos/overrides/:id/approve` | `pos:orders` | Approve with manager PIN |
| GET    | `/pos/overrides`             | `pos:view`   | List                     |
| GET    | `/pos/overrides/:id`         | `pos:view`   | Single                   |

**ManagerOverrideAction values:** `high_discount`, `refund`, `void`, `unlock`, `price_override`, `reopen_session`

---

## Restaurant

### Sidebar menu item

POS > Restaurant (sub-menus: Floor Plan, Kitchen Display)

### Sections

| Method | Path                       | Permission          | Purpose     |
| ------ | -------------------------- | ------------------- | ----------- |
| POST   | `/restaurant/sections`     | `restaurant:manage` | Create      |
| GET    | `/restaurant/sections`     | `restaurant:view`   | List        |
| GET    | `/restaurant/sections/:id` | `restaurant:view`   | Single      |
| PATCH  | `/restaurant/sections/:id` | `restaurant:manage` | Update      |
| DELETE | `/restaurant/sections/:id` | `restaurant:manage` | Soft delete |

### Tables

| Method | Path                              | Permission          | Purpose                           |
| ------ | --------------------------------- | ------------------- | --------------------------------- |
| POST   | `/restaurant/tables`              | `restaurant:manage` | Create                            |
| GET    | `/restaurant/tables`              | `restaurant:view`   | List                              |
| GET    | `/restaurant/tables/:id`          | `restaurant:view`   | Single                            |
| PATCH  | `/restaurant/tables/:id`          | `restaurant:manage` | Update                            |
| DELETE | `/restaurant/tables/:id`          | `restaurant:manage` | Soft delete                       |
| POST   | `/restaurant/tables/:id/transfer` | `restaurant:manage` | Transfer session to another table |

**Table number must be unique within section.**

### Table Sessions

| Method | Path                                     | Permission          | Purpose       |
| ------ | ---------------------------------------- | ------------------- | ------------- |
| POST   | `/restaurant/table-sessions`             | `restaurant:manage` | Seat guests   |
| POST   | `/restaurant/table-sessions/:id/release` | `restaurant:manage` | Release table |
| GET    | `/restaurant/table-sessions`             | `restaurant:view`   | List          |
| GET    | `/restaurant/table-sessions/:id`         | `restaurant:view`   | Single        |

### Table Status Machine

```
available → occupied (seat/transfer)
occupied → available (transfer source)
occupied → cleaning (release)
cleaning → available (manual)
reserved → occupied (seat)
```

### Kitchen Tickets

| Method | Path                                     | Permission          | Purpose       |
| ------ | ---------------------------------------- | ------------------- | ------------- |
| POST   | `/restaurant/kitchen-tickets`            | `restaurant:manage` | Fire course   |
| GET    | `/restaurant/kitchen-tickets`            | `restaurant:view`   | List          |
| GET    | `/restaurant/kitchen-tickets/:id`        | `restaurant:view`   | Single        |
| PATCH  | `/restaurant/kitchen-tickets/:id/status` | `restaurant:manage` | Update status |
| DELETE | `/restaurant/kitchen-tickets/:id`        | `restaurant:manage` | Cancel ticket |

**FireCourseDto:**

```typescript
{ orderId: string           // UUID, required
  sessionId?: string, tableNumber?: string
  course: 'appetizer' | 'entree' | 'dessert' | 'beverages' | 'all'
  orderItemIds: string[]    // @ArrayMinSize(1)
  estimatedMinutes?: number }
```

**SERVICE type products are excluded from kitchen tickets.**

### Kitchen Ticket Status Machine

```
pending → preparing (startedAt set)
preparing → ready (completedAt set)
ready → served
any → cancelled
```

---

## Inventory — Products

### Sidebar menu item

Inventory > Products

### Routes

```
/inventory/products          → ProductsListPage
/inventory/products/:id      → ProductDetailPage
/inventory/products/new       → ProductDetailPage (new mode)
```

### API Endpoints

| Method | Path                         | Permission         | Purpose                          |
| ------ | ---------------------------- | ------------------ | -------------------------------- |
| GET    | `/products/dropdown`         | `inventory:view`   | Dropdown                         |
| GET    | `/products`                  | `inventory:view`   | List with filters                |
| GET    | `/products/:id`              | `inventory:view`   | Get with variants, combos, taxes |
| GET    | `/products/:id/availability` | `inventory:view`   | Stock availability               |
| GET    | `/products/:id/suppliers`    | `inventory:view`   | Supplier products                |
| POST   | `/products`                  | `inventory:create` | Create                           |
| PUT    | `/products/:id`              | `inventory:update` | Update                           |
| DELETE | `/products/:id`              | `inventory:delete` | Soft delete (204)                |
| PATCH  | `/products/:id/restore`      | `inventory:update` | Restore                          |
| POST   | `/products/bulk-create`      | `inventory:create` | Bulk create (≤100)               |
| PATCH  | `/products/bulk-update`      | `inventory:update` | Bulk update (≤100)               |
| DELETE | `/products/bulk-delete`      | `inventory:delete` | Bulk delete (≤100)               |

**ProductFilterDto:** extends PaginationDto + `productType?`, `categoryId?`, `brandId?`, `branchId?`, `canBeSold?`, `canBePurchased?`, `hasVariants?`

**CreateProductDto:**

```typescript
{ nameEn: string, nameAr: string, sku: string  // required, unique
  descriptionEn?: string, descriptionAr?: string
  categoryId: string        // UUID, required
  unitPrice: number         // @Min(0)
  costPrice?: number, taxRate?: number  // default 15, 0-100
  barcode?: string, unit?: string  // default 'pcs'
  minStockLevel?: number    // maps to reorderPoint, default 0
  maxStockLevel?: number
  productType?: 'storable' | 'consumable' | 'service' | 'combo'  // default 'storable'
  invoicePolicy?: 'ordered' | 'delivered'  // default 'ordered'
  isActive?: boolean, canBeSold?: boolean, canBePurchased?: boolean  // defaults true
  hasVariants?: boolean, hasSerialTracking?: boolean, hasLotTracking?: boolean, hasExpiryDate?: boolean  // defaults false
  brandId?: string, purchaseUomId?: string
  incomeAccountId?: string, cogsAccountId?: string, inventoryAccountId?: string
  stockInputAccountId?: string, stockOutputAccountId?: string
  taxes?: { taxId: string, scope?: string }[] }
```

**Availability response:** `{ available, availableQty, reservedQty, totalQty, warehouseId, productId }`

---

## Inventory — Categories

### API Endpoints

| Method | Path                   | Permission         | Purpose     |
| ------ | ---------------------- | ------------------ | ----------- |
| GET    | `/categories/dropdown` | `inventory:view`   | Dropdown    |
| GET    | `/categories`          | `inventory:view`   | List        |
| GET    | `/categories/:id`      | `inventory:view`   | Single      |
| POST   | `/categories`          | `inventory:create` | Create      |
| PUT    | `/categories/:id`      | `inventory:update` | Update      |
| DELETE | `/categories/:id`      | `inventory:delete` | Soft delete |

**CreateCategoryDto:** `nameEn`, `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `parentId?`, `incomeAccountId?`, `cogsAccountId?`, `inventoryAccountId?`

---

## Inventory — Warehouses

### API Endpoints

| Method | Path                   | Permission         | Purpose                                   |
| ------ | ---------------------- | ------------------ | ----------------------------------------- |
| GET    | `/warehouses/dropdown` | `inventory:view`   | Dropdown                                  |
| GET    | `/warehouses`          | `inventory:view`   | List                                      |
| GET    | `/warehouses/:id`      | `inventory:view`   | Get with stock locations                  |
| POST   | `/warehouses`          | `inventory:create` | Create (auto-creates 3 default locations) |
| PUT    | `/warehouses/:id`      | `inventory:update` | Update                                    |
| DELETE | `/warehouses/:id`      | `inventory:delete` | Soft delete                               |

**CreateWarehouseDto:** `nameEn`, `nameAr` (required), `address?`, `city?`, `isDefault?`, `branchId?`

---

## Inventory — Adjustments

### API Endpoints

| Method | Path                         | Permission         | Purpose                 |
| ------ | ---------------------------- | ------------------ | ----------------------- |
| POST   | `/inventory/adjustments`     | `inventory:manage` | Create stock adjustment |
| GET    | `/inventory/adjustments`     | `inventory:view`   | List                    |
| GET    | `/inventory/adjustments/:id` | `inventory:view`   | Single                  |

**CreateAdjustmentDto:**

```typescript
{ productId: string, warehouseId: string  // UUID
  quantity: number          // positive = increase, negative = decrease
  reason: string
  unitCost?: number, lotNumber?: string, serialNumber?: string
  expiryDate?: string, locationId?: string, productVariantId?: string }
```

**Response:** `{ id, quantityBefore, quantityAfter, adjustmentQty, unitCost, totalCost, averageCost, locationId, productVariantId }`

### Business Logic

- Positive: recalculates weighted average cost
- Negative: uses current average cost
- Posts accounting journal entry (DR/CR Inventory vs Adjustment accounts)
- Triggers low stock alert if `quantityAfter <= reorderPoint`

---

## Inventory — Transfers

### API Endpoints

| Method | Path                       | Permission         | Purpose         |
| ------ | -------------------------- | ------------------ | --------------- |
| POST   | `/inventory/transfers`     | `inventory:manage` | Create transfer |
| GET    | `/inventory/transfers`     | `inventory:view`   | List            |
| GET    | `/inventory/transfers/:id` | `inventory:view`   | Single          |

**CreateTransferDto:**

```typescript
{ productId: string, sourceWarehouseId: string, destinationWarehouseId: string
  quantity: number          // @Min(1)
  notes?: string
  fromLocationId?: string, toLocationId?: string
  productVariantId?: string, lotNumber?: string, serialNumber?: string, expiryDate?: string }
```

**Validation:** Blocks if `quantity > available stock` at source.

---

## Inventory — Stock Movements & Levels

### API Endpoints

| Method | Path                                 | Permission         | Purpose                          |
| ------ | ------------------------------------ | ------------------ | -------------------------------- |
| GET    | `/inventory/stock-levels`            | `inventory:view`   | All stock levels                 |
| GET    | `/inventory/stock-levels/:productId` | `inventory:view`   | By product                       |
| GET    | `/inventory/low-stock`               | `inventory:view`   | Low stock alerts                 |
| GET    | `/inventory/movements`               | `inventory:view`   | All movements                    |
| GET    | `/inventory/movements/:id`           | `inventory:view`   | Single                           |
| GET    | `/inventory/valuation`               | `inventory:view`   | Valuation report (JSON/PDF/XLSX) |
| POST   | `/inventory/movements`               | `inventory:create` | Create movement                  |

---

## Inventory — Definitions

### API Endpoints

**Units of Measure** at `/inventory/definitions/units-of-measure`:
CRUD with `nameEn`, `nameAr`, `symbol` (@MaxLength(20)), `uomType?` (`unit`/`weight`/`volume`/`length`/`time`), `isActive?`

**Adjustment Reasons** at `/inventory/definitions/adjustment-reasons`:
CRUD with `nameEn`, `nameAr`, `type` (`increase`/`decrease`), `isActive?`

---

## Stock Locations

### API Endpoints

| Method | Path                   | Permission         | Purpose                                            |
| ------ | ---------------------- | ------------------ | -------------------------------------------------- |
| GET    | `/stock-locations`     | `inventory:view`   | List (filter: warehouseId, locationType, isActive) |
| POST   | `/stock-locations`     | `inventory:manage` | Create                                             |
| GET    | `/stock-locations/:id` | `inventory:view`   | Single                                             |
| PUT    | `/stock-locations/:id` | `inventory:manage` | Update                                             |
| DELETE | `/stock-locations/:id` | `inventory:manage` | Soft delete                                        |

**CreateStockLocationDto:**

```typescript
{ nameEn: string, nameAr: string
  fullName?: string, warehouseId?: string, parentId?: string
  locationType?: 'internal' | 'customer' | 'supplier' | 'transit' | 'virtual' | 'scrap'  // default 'internal'
  isScrap?: boolean, isReturn?: boolean, isActive?: boolean }
```

---

## Branch Products

### API Endpoints

| Method | Path                                  | Permission         | Purpose                |
| ------ | ------------------------------------- | ------------------ | ---------------------- |
| GET    | `/branch-products/:branchId`          | `inventory:view`   | List assigned products |
| POST   | `/branch-products/:branchId/assign`   | `inventory:manage` | Assign products        |
| POST   | `/branch-products/:branchId/unassign` | `inventory:manage` | Unassign products      |

**Body:** `{ productIds: string[] }` // @ArrayMinSize(1), UUID[]

---

## Product Variants & Attributes

### Product Attributes

| Method | Path                             | Permission        | Purpose         |
| ------ | -------------------------------- | ----------------- | --------------- |
| GET    | `/product-attributes/dropdown`   | `products:view`   | Dropdown        |
| GET    | `/product-attributes`            | `products:view`   | List            |
| GET    | `/product-attributes/:id`        | `products:view`   | Get with values |
| POST   | `/product-attributes`            | `products:manage` | Create          |
| PUT    | `/product-attributes/:id`        | `products:manage` | Update          |
| DELETE | `/product-attributes/:id`        | `products:manage` | Delete          |
| GET    | `/product-attributes/:id/values` | `products:view`   | List values     |
| POST   | `/product-attributes/:id/values` | `products:manage` | Create value    |

**Attribute Values** at `/product-attribute-values`:
| PUT | `/product-attribute-values/:id` | Update value |
| DELETE | `/product-attribute-values/:id` | Delete value |

**CreateProductAttributeDto:** `nameEn`, `nameAr`, `displayType?` (`radio`/`select`/`color`/`pills`, default `select`), `sequence?`
**CreateAttributeValueDto:** `nameEn`, `nameAr`, `htmlColor?`, `sequence?`

### Product Variants (Template)

| Method | Path                                | Permission        | Purpose                   |
| ------ | ----------------------------------- | ----------------- | ------------------------- |
| GET    | `/products/:id/template-attributes` | `products:view`   | Get template attributes   |
| POST   | `/products/:id/template-attributes` | `products:manage` | Add attribute to template |
| DELETE | `/products/template-attributes/:id` | `products:manage` | Remove template attribute |
| GET    | `/products/:id/variants`            | `products:view`   | List variants             |
| POST   | `/products/:id/generate-variants`   | `products:manage` | Generate all combinations |
| GET    | `/product-variants/:id`             | `products:view`   | Get variant               |
| PUT    | `/product-variants/:id`             | `products:manage` | Update variant            |

**Generate variants**: Computes cartesian product of all attribute values, creates variant per combination with `priceExtra = SUM(template value prices)`.

---

## Combo Products

### API Endpoints

| Method | Path                      | Permission        | Purpose                 |
| ------ | ------------------------- | ----------------- | ----------------------- |
| GET    | `/combo-products`         | `products:view`   | List                    |
| GET    | `/combo-products/:id`     | `products:view`   | Get with groups + items |
| POST   | `/combo-products`         | `products:manage` | Create                  |
| DELETE | `/combo-products/:id`     | `products:manage` | Delete                  |
| POST   | `/combo-groups`           | `products:manage` | Create group            |
| PUT    | `/combo-groups/:id`       | `products:manage` | Update group            |
| DELETE | `/combo-groups/:id`       | `products:manage` | Delete group            |
| GET    | `/combo-groups/:id/items` | `products:view`   | List items              |
| POST   | `/combo-group-items`      | `products:manage` | Add item                |
| PUT    | `/combo-group-items/:id`  | `products:manage` | Update item             |
| DELETE | `/combo-group-items/:id`  | `products:manage` | Delete item             |

---

## Supplier Products

### API Endpoints

| Method | Path                     | Permission          | Purpose                             |
| ------ | ------------------------ | ------------------- | ----------------------------------- |
| GET    | `/supplier-products`     | `purchasing:view`   | List (filter: productId, partnerId) |
| POST   | `/supplier-products`     | `purchasing:manage` | Create                              |
| PUT    | `/supplier-products/:id` | `purchasing:manage` | Update                              |
| DELETE | `/supplier-products/:id` | `purchasing:manage` | Soft delete                         |

**CreateSupplierProductDto:**

```typescript
{ productId: string, partnerId: string  // UUID, required — unique combination
  minQty?: number           // default 1
  price: number             // @Min(0)
  currencyId?: string
  leadTimeDays?: number     // default 0
  sequence?: number }       // default 1
```

---

## Partners

### Sidebar menu item

Partners (shared across Sales, Purchasing, CRM)

### Routes

```
/partners          → PartnersListPage
/partners/:id      → PartnerDetailPage
/partners/new       → PartnerDetailPage (new mode)
```

### API Endpoints

| Method | Path                 | Permission        | Purpose           |
| ------ | -------------------- | ----------------- | ----------------- |
| GET    | `/partners/dropdown` | `partners:view`   | Dropdown          |
| GET    | `/partners`          | `partners:view`   | List with filters |
| GET    | `/partners/:id`      | `partners:view`   | Get with contacts |
| POST   | `/partners`          | `partners:manage` | Create            |
| PUT    | `/partners/:id`      | `partners:manage` | Update            |
| DELETE | `/partners/:id`      | `partners:manage` | Soft delete       |

**FilterPartnerDto:** extends PaginationDto + `type?` (`customer`/`supplier`/`both`/`individual`), `isCustomer?`, `isSupplier?`, `isActive?`

**CreatePartnerDto:**

```typescript
{ nameEn: string, nameAr: string    // @MaxLength(255)
  type: 'customer' | 'supplier' | 'both' | 'individual'
  taxNumber?: string, vatNumber?: string
  phone?: string, mobile?: string, email?: string, website?: string
  street?: string, city?: string, state?: string
  country?: string          // default 'Saudi Arabia'
  zip?: string
  creditLimit?: number      // @Min(0), default 0
  paymentTermId?: string, pricelistId?: string
  arAccountId?: string, apAccountId?: string, fiscalPositionId?: string
  bankIban?: string, bankName?: string, notes?: string
  isActive?: boolean }      // default true
```

### Partner Contacts

| Method | Path                            | Permission        | Purpose        |
| ------ | ------------------------------- | ----------------- | -------------- |
| GET    | `/partners/:partnerId/contacts` | `partners:view`   | List contacts  |
| GET    | `/partners/contacts/:id`        | `partners:view`   | Single contact |
| POST   | `/partners/contacts`            | `partners:manage` | Create contact |
| PUT    | `/partners/contacts/:id`        | `partners:manage` | Update contact |
| DELETE | `/partners/contacts/:id`        | `partners:manage` | Soft delete    |

### Business Validations

- Email must be unique within tenant
- `isCustomer`/`isSupplier` flags auto-resolved from `type`: CUSTOMER→{true,false}, SUPPLIER→{false,true}, BOTH→{true,true}, INDIVIDUAL→{true,false}

---

## CRM — Leads & Pipeline

### Sidebar menu item

CRM > Pipeline (kanban), CRM > Leads (list)

### Routes

```
/crm/pipeline        → PipelineKanbanPage
/crm/leads           → LeadsListPage
/crm/leads/:id       → LeadDetailPage
/crm/leads/new        → LeadDetailPage (new mode)
```

### API Endpoints

| Method | Path                      | Permission   | Purpose                    |
| ------ | ------------------------- | ------------ | -------------------------- |
| GET    | `/crm/leads/dropdown`     | `crm:view`   | Dropdown                   |
| GET    | `/crm/leads`              | `crm:view`   | List with stage info       |
| GET    | `/crm/leads/:id`          | `crm:view`   | Get with activities        |
| POST   | `/crm/leads`              | `crm:manage` | Create                     |
| PUT    | `/crm/leads/:id`          | `crm:manage` | Update                     |
| POST   | `/crm/leads/:id/stage`    | `crm:manage` | Change stage (kanban drag) |
| POST   | `/crm/leads/:id/convert`  | `crm:manage` | Convert to opportunity     |
| POST   | `/crm/leads/:id/won`      | `crm:manage` | Mark as won (creates SO)   |
| POST   | `/crm/leads/:id/lost`     | `crm:manage` | Mark as lost               |
| DELETE | `/crm/leads/:id`          | `crm:manage` | Soft delete                |
| GET    | `/crm/pipeline`           | `crm:view`   | Pipeline (kanban data)     |
| GET    | `/crm/reports/conversion` | `crm:view`   | Conversion report          |

**CreateLeadDto:**

```typescript
{ titleEn: string, titleAr: string
  stageId?: string, partnerId?: string
  type?: 'lead' | 'opportunity'  // default 'lead'
  assignedTo?: string, expectedRevenue?: number
  priority?: 'low' | 'medium' | 'high'
  source?: 'website' | 'referral' | 'social_media' | 'cold_call' | 'other'
  campaign?: string, medium?: string
  expectedCloseDate?: string
  tags?: string[], notes?: string
  probability?: number }    // 0-100
```

### Business Validations

- **Terminal state guard**: Once `isWon=true` or `isLost=true`, no updates/transitions allowed
- **Convert**: Only from `lead` to `opportunity` (cannot convert if already opportunity)
- **Win**: Creates a draft sales order from lead data (non-blocking)
- **Lose**: Requires `reason` string

### Lead State Machine (Stage-based)

```
Leads move through CRM stages (kanban columns)
Terminal flags: isWon, isLost (boolean, irreversible)
Type transition: lead → opportunity (via convert)
```

---

## CRM Stages

### API Endpoints

| Method | Path              | Permission   | Purpose                   |
| ------ | ----------------- | ------------ | ------------------------- |
| GET    | `/crm-stages`     | `crm:view`   | List (sorted by sequence) |
| GET    | `/crm-stages/:id` | `crm:view`   | Single                    |
| POST   | `/crm-stages`     | `crm:manage` | Create                    |
| PUT    | `/crm-stages/:id` | `crm:manage` | Update                    |
| DELETE | `/crm-stages/:id` | `crm:manage` | Soft delete               |

**CreateCrmStageDto:**

```typescript
{ nameEn: string, nameAr: string
  sequence: number          // @Min(0)
  probability?: number      // 0-100, default 20
  isWon?: boolean           // default false
  isFolded?: boolean }      // default false
```

---

## Activities

### Sidebar menu item

Cross-module (appears on leads, projects, partners, etc.)

### API Endpoints

| Method | Path                        | Permission          | Purpose                   |
| ------ | --------------------------- | ------------------- | ------------------------- |
| GET    | `/activities/my`            | `activities:view`   | Current user's activities |
| GET    | `/activities/overdue`       | `activities:view`   | Overdue activities        |
| GET    | `/activities`               | `activities:view`   | List with filters         |
| GET    | `/activities/:id`           | `activities:view`   | Single                    |
| POST   | `/activities`               | `activities:manage` | Create                    |
| PUT    | `/activities/:id`           | `activities:manage` | Update (only if not done) |
| POST   | `/activities/:id/mark-done` | `activities:manage` | Mark as done              |
| DELETE | `/activities/:id`           | `activities:manage` | Soft delete               |

**FilterActivityDto:** extends PaginationDto + `model?`, `recordId?`, `assignedTo?`, `isDone?`, `dueBefore?`, `dueAfter?`, `activityType?`

**CreateActivityDto:**

```typescript
{ model: string             // @MaxLength(50), e.g. 'lead', 'partner'
  recordId: string          // UUID — polymorphic FK
  recordName?: string       // display snapshot
  activityType: 'call' | 'email' | 'meeting' | 'todo' | 'deadline' | 'upload_document'
  summary: string           // @MaxLength(500)
  note?: string
  scheduledDate: string     // YYYY-MM-DD
  assignedTo: string        // UUID
  icon?: string }
```

### Business Validations

- **Cannot update** a done activity
- **Cannot mark done** twice

### Status Machine

```
pending (isDone=false) → done (isDone=true)
```

No reverse transition.

---

## Projects

### Sidebar menu item

Projects > Projects

### Routes

```
/projects          → ProjectsListPage
/projects/:id      → ProjectDetailPage
/projects/new       → ProjectDetailPage (new mode)
```

### API Endpoints

| Method | Path                             | Permission        | Purpose            |
| ------ | -------------------------------- | ----------------- | ------------------ |
| GET    | `/projects/dropdown`             | —                 | Dropdown           |
| GET    | `/projects`                      | `projects:view`   | List               |
| GET    | `/projects/:id`                  | `projects:view`   | Single             |
| GET    | `/projects/:id/members`          | `projects:view`   | Members            |
| GET    | `/projects/:id/assignable-users` | `projects:view`   | Assignable users   |
| GET    | `/projects/:id/report`           | `projects:view`   | Summary report     |
| GET    | `/projects/:id/progress`         | `projects:view`   | Progress %         |
| POST   | `/projects`                      | `projects:create` | Create             |
| PUT    | `/projects/:id`                  | `projects:update` | Update             |
| PATCH  | `/projects/:id/activate`         | `projects:update` | planning → active  |
| PATCH  | `/projects/:id/hold`             | `projects:update` | active → on_hold   |
| PATCH  | `/projects/:id/resume`           | `projects:update` | on_hold → active   |
| POST   | `/projects/:id/complete`         | `projects:update` | active → completed |
| PATCH  | `/projects/:id/cancel`           | `projects:update` | → cancelled        |
| DELETE | `/projects/:id`                  | `projects:delete` | Soft delete        |
| POST   | `/projects/:id/members`          | `projects:update` | Add member         |
| PUT    | `/projects/:id/members/:userId`  | `projects:update` | Update member role |
| DELETE | `/projects/:id/members/:userId`  | `projects:update` | Remove member      |

### Business Validations

- **Cannot delete** project with active tasks
- **Cannot complete** unless all tasks are DONE or CANCELLED
- **Cannot remove last manager** from project

### Status Machine

```
planning → active → completed | on_hold | cancelled
on_hold → active | cancelled
planning → cancelled
```

---

## Tasks

### API Endpoints

| Method | Path                                 | Permission        | Purpose           |
| ------ | ------------------------------------ | ----------------- | ----------------- |
| GET    | `/tasks`                             | `projects:view`   | List all tasks    |
| GET    | `/tasks/:id`                         | `projects:view`   | Single            |
| POST   | `/tasks`                             | `projects:create` | Create            |
| PUT    | `/tasks/:id`                         | `projects:update` | Update            |
| PATCH  | `/tasks/:id/transition`              | `projects:update` | Transition status |
| DELETE | `/tasks/:id`                         | `projects:delete` | Soft delete       |
| GET    | `/tasks/by-project/:projectId`       | `projects:view`   | Tasks by project  |
| GET    | `/projects/:projectId/tasks/overdue` | `projects:view`   | Overdue tasks     |
| POST   | `/projects/:projectId/tasks/:id/log` | `projects:update` | Log time          |

**CreateTaskDto:**

```typescript
{ projectId: string, titleEn: string, titleAr: string
  descriptionEn?: string, descriptionAr?: string
  assigneeId?: string, priority?: 'low' | 'medium' | 'high' | 'critical'
  dueDate?: string, estimatedHours?: number, parentTaskId?: string }
```

**TransitionTaskDto:** `{ status: TaskStatus }`
**LogTimeDto:** `{ hours: number, description?: string, date: string }`

### Task Status Machine

```
todo → in_progress → in_review → done
in_progress → blocked → in_progress
in_progress → cancelled
in_review → in_progress (sent back)
blocked → cancelled
todo → cancelled
```

---

## Loyalty Programs

### Sidebar menu item

POS > Loyalty

### API Endpoints — Programs

| Method | Path                                  | Permission       | Purpose            |
| ------ | ------------------------------------- | ---------------- | ------------------ |
| GET    | `/loyalty/programs`                   | `loyalty:view`   | List               |
| GET    | `/loyalty/programs/:id`               | `loyalty:view`   | Get with tiers     |
| POST   | `/loyalty/programs`                   | `loyalty:manage` | Create             |
| PATCH  | `/loyalty/programs/:id`               | `loyalty:manage` | Update             |
| DELETE | `/loyalty/programs/:id`               | `loyalty:manage` | Soft delete        |
| POST   | `/loyalty/programs/:id/tiers`         | `loyalty:manage` | Create tier        |
| PATCH  | `/loyalty/programs/:id/tiers/:tierId` | `loyalty:manage` | Update tier        |
| DELETE | `/loyalty/programs/:id/tiers/:tierId` | `loyalty:manage` | Delete tier (hard) |

### API Endpoints — Accounts

| Method | Path                                     | Permission       | Purpose                 |
| ------ | ---------------------------------------- | ---------------- | ----------------------- |
| GET    | `/loyalty/accounts/customer/:customerId` | `loyalty:view`   | Get by customer         |
| GET    | `/loyalty/accounts/:id/history`          | `loyalty:view`   | Transaction history     |
| POST   | `/loyalty/accounts/:id/adjust`           | `loyalty:manage` | Manual point adjustment |

**AdjustPointsDto:** `{ actionType: 'grant' | 'deduct' | 'correction', points: number, notes: string }`

### Business Logic

- **Earn**: `points = floor(orderTotal × pointsPerCurrency × tierMultiplier)`
- **Redeem**: `maxPoints = floor((orderTotal × maxRedeemPct / 100) / currencyPerPoint)`, `sarValue = round(pointsUsed × currencyPerPoint, 2)`
- **Points expiry**: Daily cron at 03:00 UTC expires EARN transactions past `expiryDays`
- **Tip excluded** from points calculation

---

## Vouchers & Gift Cards

### Sidebar menu item

POS > Vouchers, POS > Gift Cards

### Vouchers

| Method | Path                 | Permission        | Purpose               |
| ------ | -------------------- | ----------------- | --------------------- |
| GET    | `/vouchers`          | `vouchers:manage` | List                  |
| GET    | `/vouchers/:id`      | `vouchers:manage` | Single                |
| POST   | `/vouchers`          | `vouchers:manage` | Create                |
| PATCH  | `/vouchers/:id`      | `vouchers:manage` | Update                |
| DELETE | `/vouchers/:id`      | `vouchers:manage` | Soft delete           |
| POST   | `/vouchers/validate` | `pos:orders`      | Validate voucher code |

**Validation pipeline**: active → date range → max uses → customer restriction → per-customer limit → min order → calculate discount

### Gift Cards

| Method | Path                        | Permission   | Purpose         |
| ------ | --------------------------- | ------------ | --------------- |
| POST   | `/gift-cards`               | `pos:orders` | Issue gift card |
| POST   | `/gift-cards/check-balance` | **Public**   | Check balance   |
| POST   | `/gift-cards/redeem`        | `pos:orders` | Redeem          |

**Redeem logic**: `amountToDeduct = min(requestedAmount, currentBalance)`. If insufficient, deducts available and returns `remainingToPay`.

---

## Pricelists

### Sidebar menu item

Sales > Pricelists

### API Endpoints

| Method | Path                        | Permission     | Purpose                   |
| ------ | --------------------------- | -------------- | ------------------------- |
| GET    | `/pricelists`               | `sales:view`   | List                      |
| GET    | `/pricelists/:id`           | `sales:view`   | Single                    |
| GET    | `/pricelists/compute-price` | `sales:view`   | Compute price for product |
| POST   | `/pricelists`               | `sales:manage` | Create                    |
| PUT    | `/pricelists/:id`           | `sales:manage` | Update                    |
| DELETE | `/pricelists/:id`           | `sales:manage` | Soft delete               |
| GET    | `/pricelists/:id/items`     | `sales:view`   | List items                |
| POST   | `/pricelists/:id/items`     | `sales:manage` | Add item                  |
| PUT    | `/pricelist-items/:id`      | `sales:manage` | Update item               |
| DELETE | `/pricelist-items/:id`      | `sales:manage` | Delete item               |

**ComputePriceQueryDto:** `pricelistId`, `productId` (UUID), `qty?` (number)
**Response:** `{ originalPrice, computedPrice, discount, pricelistItemId }`

**Computation types**: `fixed` (set price), `percentage` (% off), `formula` (% off + surcharge)

---

## HR — Departments

### Sidebar menu item

HR > Departments

### API Endpoints

| Method | Path                    | Permission  | Purpose           |
| ------ | ----------------------- | ----------- | ----------------- |
| GET    | `/departments/dropdown` | —           | Dropdown          |
| GET    | `/departments`          | `hr:view`   | List              |
| GET    | `/departments/:id`      | `hr:view`   | Single            |
| POST   | `/departments`          | `hr:create` | Create            |
| PUT    | `/departments/:id`      | `hr:update` | Update            |
| DELETE | `/departments/:id`      | `hr:delete` | Soft delete (204) |

---

## HR — Employees

### Sidebar menu item

HR > Employees

### API Endpoints

| Method | Path                     | Permission  | Purpose                                |
| ------ | ------------------------ | ----------- | -------------------------------------- |
| GET    | `/employees/dropdown`    | —           | Dropdown                               |
| GET    | `/employees`             | `hr:view`   | List                                   |
| GET    | `/employees/:id`         | `hr:view`   | Get + active contract summary          |
| POST   | `/employees`             | `hr:create` | Create (employeeNumber auto-generated) |
| PUT    | `/employees/:id`         | `hr:update` | Update                                 |
| DELETE | `/employees/:id`         | `hr:delete` | Soft delete (204)                      |
| PATCH  | `/employees/:id/restore` | `hr:update` | Restore                                |

**CreateEmployeeDto:**

```typescript
{ nameEn: string, nameAr: string, departmentId: string, hireDate: string  // required
  userId?: string, employeeCode?: string, jobPositionId?: string, branchId?: string
  managerId?: string
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'intern'  // default 'full-time'
  nationalId?: string, birthDate?: string
  gender?: 'male' | 'female'
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed'
  nationality?: string, isSaudi?: boolean  // default true
  emergencyContact?: string, emergencyPhone?: string
  bankAccount?: string, bankName?: string }
```

### Business Logic

- `employeeNumber` auto-generated via sequences
- GOSI rates: Saudi employee 9.75% + employer 11.75%, Non-Saudi: employee 0% + employer 11.75%

---

## HR — Leaves

### API Endpoints

| Method | Path                           | Permission   | Purpose               |
| ------ | ------------------------------ | ------------ | --------------------- |
| GET    | `/leaves`                      | `hr:view`    | All leave requests    |
| GET    | `/leaves/:id`                  | `hr:view`    | Single                |
| GET    | `/leaves/employee/:employeeId` | `hr:view`    | By employee           |
| GET    | `/leaves/balance/:employeeId`  | `hr:view`    | Leave balance         |
| POST   | `/leaves`                      | `hr:create`  | Create request        |
| PUT    | `/leaves/:id`                  | `hr:update`  | Update (pending only) |
| PATCH  | `/leaves/:id/approve`          | `hr:approve` | Approve               |
| PATCH  | `/leaves/:id/reject`           | `hr:approve` | Reject                |
| PATCH  | `/leaves/:id/cancel`           | `hr:update`  | Cancel                |

### Business Validations

- `endDate >= startDate`
- Checks allocation balance (blocks if insufficient and `allowNegative=false`)
- Checks for overlapping leaves
- Only pending leaves can be updated

### Status Machine

```
pending → approved | rejected | cancelled
approved → cancelled
```

---

## HR — Definitions

Path: `/hr/definitions/<type>`

| Type                 | Endpoints | Key Fields                                                                                         |
| -------------------- | --------- | -------------------------------------------------------------------------------------------------- |
| Job Titles           | CRUD      | `nameEn`, `nameAr`, `departmentId?`, `grade?`, `isActive?`                                         |
| Employment Types     | CRUD      | `nameEn`, `nameAr`, `descriptionEn?`, `descriptionAr?`, `isActive?`                                |
| Leave Types (Config) | CRUD      | `nameEn`, `nameAr`, `daysPerYear`, `isPaid?`, `requiresApproval?`, `isActive?`                     |
| Public Holidays      | CRUD      | `nameEn`, `nameAr`, `date`, `isRecurring?`, `isActive?`                                            |
| Termination Reasons  | CRUD      | `nameEn`, `nameAr`, `type` (`voluntary`/`involuntary`/`end_of_contract`/`retirement`), `isActive?` |

---

## HR Setup

### Leave Types (Setup)

CRUD at `/hr-setup/leave-types` with `nameEn`, `nameAr`, `color?`, `requiresApproval?`, `allowNegative?`, `isActive?`

### Leave Allocations

CRUD at `/hr-setup/leave-allocations` with approve/refuse endpoints.
**CreateLeaveAllocationDto:** `employeeId`, `leaveTypeId`, `year`, `numberOfDays`, `mode?` (`manual`/`accrual`), `branchId?`

**Status Machine:**

```
draft → approved | refused
confirmed → approved | refused
```

Cannot update/delete approved or refused allocations.

### Job Positions

CRUD at `/hr-setup/job-positions` with `nameEn`, `nameAr`, `departmentId?`

---

## HR Extensions — Shifts

### API Endpoints

| Method | Path                          | Permission  | Purpose                 |
| ------ | ----------------------------- | ----------- | ----------------------- |
| POST   | `/hr/shifts`                  | `hr:manage` | Create                  |
| GET    | `/hr/shifts`                  | `hr:view`   | List                    |
| GET    | `/hr/shifts/:id`              | `hr:view`   | Get + working days      |
| PATCH  | `/hr/shifts/:id`              | `hr:manage` | Update                  |
| DELETE | `/hr/shifts/:id`              | `hr:manage` | Soft delete             |
| GET    | `/hr/shifts/:id/working-days` | `hr:view`   | Get working day numbers |
| PUT    | `/hr/shifts/:id/working-days` | `hr:manage` | Replace working days    |

**CreateShiftDto:**

```typescript
{ nameEn: string, nameAr: string
  startTime: string, endTime: string  // e.g. "08:00", "16:00"
  breakMinutes?: number     // default 60
  isOvernight?: boolean     // default false
  workingDays?: number[]    // 0=Sun..6=Sat, default [1,2,3,4,5] (Mon-Fri)
  isActive?: boolean }
```

---

## HR Extensions — Attendance

### API Endpoints

| Method | Path                     | Permission  | Purpose                   |
| ------ | ------------------------ | ----------- | ------------------------- |
| POST   | `/hr/attendance`         | `hr:manage` | Create record             |
| PATCH  | `/hr/attendance/:id`     | `hr:manage` | Update                    |
| GET    | `/hr/attendance`         | `hr:view`   | List (filter: employeeId) |
| GET    | `/hr/attendance/:id`     | `hr:view`   | Single                    |
| GET    | `/hr/attendance/reports` | `hr:view`   | Attendance report         |
| POST   | `/hr/attendance/import`  | `hr:manage` | Bulk import               |
| DELETE | `/hr/attendance/:id`     | `hr:manage` | Soft delete               |

**Import response:** `{ success, failed, errors[] }`

---

## HR Extensions — Contracts

### API Endpoints

| Method | Path                | Permission  | Purpose                           |
| ------ | ------------------- | ----------- | --------------------------------- |
| POST   | `/hr/contracts`     | `hr:manage` | Create                            |
| GET    | `/hr/contracts`     | `hr:view`   | List (filter: employeeId, status) |
| GET    | `/hr/contracts/:id` | `hr:view`   | Single                            |
| PATCH  | `/hr/contracts/:id` | `hr:manage` | Update                            |
| DELETE | `/hr/contracts/:id` | `hr:manage` | Soft delete                       |

**CreateContractDto:**

```typescript
{ employeeId: string, contractType: 'full_time' | 'part_time' | 'temporary' | 'seasonal'
  startDate: string, endDate?: string
  basicSalary: number       // @Min(0)
  housingAllowance?: number, transportationAllowance?: number  // default 0
  wageType?: 'monthly' | 'daily' | 'hourly'  // default 'monthly'
  wage?: number             // default = basicSalary
  salaryStructureId?: string, workingScheduleId?: string
  status?: 'draft' | 'active' | 'expired' | 'cancelled'  // default 'draft'
  notes?: string }
```

### Business Validations

- **One active contract per employee** — blocks if trying to activate when another is active
- Contract expiry alerts at 30 and 7 days (cron job at 22:00 UTC)
- Auto-expire contracts past `endDate` (daily cron)

### Status Machine

```
draft → active | cancelled
active → expired | cancelled
```

---

## HR Extensions — Payroll

### API Endpoints

| Method | Path                                 | Permission   | Purpose            |
| ------ | ------------------------------------ | ------------ | ------------------ |
| POST   | `/hr/payroll/runs`                   | `hr:manage`  | Create run         |
| GET    | `/hr/payroll/runs`                   | `hr:view`    | List               |
| GET    | `/hr/payroll/runs/:id`               | `hr:view`    | Get with items     |
| GET    | `/hr/payroll/reports`                | `hr:view`    | Report (PDF/XLSX)  |
| POST   | `/hr/payroll/runs/:id/confirm`       | `hr:manage`  | Confirm            |
| POST   | `/hr/payroll/runs/:id/approve`       | `hr:approve` | Approve (posts JE) |
| POST   | `/hr/payroll/runs/:id/mark-paid`     | `hr:manage`  | Mark paid          |
| POST   | `/hr/payroll/runs/:id/items`         | `hr:manage`  | Add/upsert item    |
| DELETE | `/hr/payroll/runs/:id/items/:itemId` | `hr:manage`  | Remove item        |

**GOSI Rates:** Saudi: employee 9.75%, employer 11.75%. Non-Saudi: employee 0%, employer 11.75%.
**Advance deduction**: Capped at 25% of net salary.

### Status Machine

```
draft → confirmed → approved → paid
```

---

## HR Extensions — Training

### API Endpoints

CRUD at `/hr/training` with `employeeId`, `courseName`, `provider?`, `trainingType?`, `startDate`, `endDate?`, `durationHours?`, `status?`, `score?`, `certificateNumber?`, `certificateUrl?`, `certificateExpiry?`, `cost?`, `notes?`

---

## Payroll New

### Salary Structures

| Method | Path                           | Permission       | Purpose     |
| ------ | ------------------------------ | ---------------- | ----------- |
| GET    | `/salary-structures`           | `payroll:view`   | List        |
| GET    | `/salary-structures/:id`       | `payroll:view`   | Single      |
| POST   | `/salary-structures`           | `payroll:manage` | Create      |
| PUT    | `/salary-structures/:id`       | `payroll:manage` | Update      |
| DELETE | `/salary-structures/:id`       | `payroll:manage` | Soft delete |
| GET    | `/salary-structures/:id/rules` | `payroll:view`   | List rules  |
| POST   | `/salary-structures/:id/rules` | `payroll:manage` | Add rule    |

### Salary Rules

| Method | Path                | Permission       | Purpose     |
| ------ | ------------------- | ---------------- | ----------- |
| PUT    | `/salary-rules/:id` | `payroll:manage` | Update      |
| DELETE | `/salary-rules/:id` | `payroll:manage` | Soft delete |

---

## Payroll New — Payslips

### API Endpoints

| Method | Path                    | Permission       | Purpose           |
| ------ | ----------------------- | ---------------- | ----------------- |
| GET    | `/payslips`             | `payroll:view`   | List with filters |
| GET    | `/payslips/:id`         | `payroll:view`   | Get with lines    |
| POST   | `/payslips/generate`    | `payroll:manage` | Batch generate    |
| POST   | `/payslips/:id/compute` | `payroll:manage` | Recompute lines   |
| POST   | `/payslips/:id/confirm` | `payroll:manage` | Confirm           |
| POST   | `/payslips/:id/cancel`  | `payroll:manage` | Cancel            |

### Status Machine

```
draft → confirmed | cancelled
confirmed → cancelled
```

---

## Notifications

### API Endpoints

| Method | Path                            | Permission             | Purpose                          |
| ------ | ------------------------------- | ---------------------- | -------------------------------- |
| GET    | `/notifications`                | —                      | List (filter: unread, eventType) |
| GET    | `/notifications/:id`            | —                      | Single                           |
| GET    | `/notifications/unread-count`   | —                      | Unread count                     |
| PATCH  | `/notifications/:id/read`       | —                      | Mark as read                     |
| PATCH  | `/notifications/read-all`       | —                      | Mark all as read                 |
| DELETE | `/notifications/:id`            | —                      | Soft delete                      |
| POST   | `/notifications/send`           | `notifications:create` | Send notification                |
| GET    | `/notifications/preferences`    | —                      | Get preferences                  |
| PATCH  | `/notifications/preferences`    | —                      | Update preferences               |
| GET    | `/notifications/templates`      | `notifications:view`   | List templates                   |
| POST   | `/notifications/templates`      | `notifications:create` | Create template                  |
| GET    | `/notifications/templates/:id`  | `notifications:view`   | Single template                  |
| PUT    | `/notifications/templates/:id`  | `notifications:update` | Update template                  |
| DELETE | `/notifications/templates/:id`  | `notifications:delete` | Delete template                  |
| POST   | `/notifications/templates/seed` | `notifications:manage` | Seed defaults                    |
| POST   | `/notifications/fcm-tokens`     | —                      | Register FCM token               |
| DELETE | `/notifications/fcm-tokens/:id` | —                      | Unregister token                 |

---

## Chat

### Sidebar menu item

Chat (real-time messaging)

### API Endpoints

| Method | Path                                  | Purpose                     |
| ------ | ------------------------------------- | --------------------------- |
| GET    | `/chat/conversations`                 | List conversations          |
| POST   | `/chat/conversations`                 | Create conversation         |
| GET    | `/chat/conversations/:id`             | Get conversation            |
| GET    | `/chat/conversations/:id/messages`    | Get messages (cursor-based) |
| POST   | `/chat/conversations/:id/messages`    | Send message                |
| POST   | `/chat/messages/:id/reactions`        | Add reaction                |
| DELETE | `/chat/messages/:id/reactions/:emoji` | Remove reaction             |
| PATCH  | `/chat/conversations/:id/read`        | Mark as read                |

**WebSocket events:** `joinConversation`, `leaveConversation`, `typing`, `message` → emits `chat:message`, `chat:typing`

**Storage:** Firestore (not PostgreSQL)

---

## Tickets

### Sidebar menu item

Backoffice > Tickets (admin), Support (tenant)

### API Endpoints — Admin

| Method | Path                       | Auth       | Purpose          |
| ------ | -------------------------- | ---------- | ---------------- |
| GET    | `/admin/tickets`           | SuperAdmin | List all         |
| GET    | `/admin/tickets/stats`     | SuperAdmin | Statistics       |
| GET    | `/admin/tickets/:id`       | SuperAdmin | Get with replies |
| POST   | `/admin/tickets`           | SuperAdmin | Create           |
| PATCH  | `/admin/tickets/:id`       | SuperAdmin | Update           |
| POST   | `/admin/tickets/:id/reply` | SuperAdmin | Reply as agent   |

### API Endpoints — Tenant Support

| Method | Path                         | Permission | Purpose          |
| ------ | ---------------------------- | ---------- | ---------------- |
| POST   | `/support/tickets`           | —          | Create           |
| GET    | `/support/tickets`           | —          | List my tickets  |
| GET    | `/support/tickets/:id`       | —          | Get with replies |
| POST   | `/support/tickets/:id/reply` | —          | Reply as client  |

### Status Machine

```
open → in_progress → resolved → closed (auto after 7 days)
resolved → open (auto-reopen when client replies)
```

Closed tickets block all replies. Auto-close cron runs daily at 02:00 UTC.

---

## Sequences

### Sidebar menu item

Settings > Sequences

### API Endpoints

| Method | Path                   | Permission                  | Purpose       |
| ------ | ---------------------- | --------------------------- | ------------- |
| GET    | `/sequences`           | `settings:view`             | List all      |
| POST   | `/sequences`           | `settings:manage_sequences` | Create        |
| PUT    | `/sequences/:id`       | `settings:manage_sequences` | Update        |
| POST   | `/sequences/:id/reset` | `settings:manage_sequences` | Reset counter |

**ZATCA sequences cannot be manually reset** (ForbiddenException).

**SequenceEntity values:** `sales_order`, `purchase_order`, `employee`, `lead`, `project`, `zatca_invoice`, `pos_order`, `journal_entry`, `invoice`, `payment`, `delivery`, `receipt`, `payslip`
**ResetCycle values:** `never`, `yearly`, `monthly`

---

## Settings

### Sidebar menu item

Backoffice > System Settings (super-admin)

### API Endpoints

| Method | Path               | Auth       | Purpose             |
| ------ | ------------------ | ---------- | ------------------- |
| GET    | `/settings?group=` | SuperAdmin | Get system settings |
| PATCH  | `/settings`        | SuperAdmin | Bulk upsert         |

---

## Company Settings

### Sidebar menu item

Settings > Company Settings

### API Endpoints

| Method | Path                         | Permission        | Purpose                        |
| ------ | ---------------------------- | ----------------- | ------------------------------ |
| GET    | `/company-settings`          | `settings:view`   | Get (creates defaults if none) |
| PUT    | `/company-settings`          | `settings:manage` | Update                         |
| GET    | `/branch-settings/:branchId` | `settings:view`   | Get branch settings            |
| PUT    | `/branch-settings/:branchId` | `settings:manage` | Update branch settings         |

---

## Tenant Config

### Sidebar menu item

Settings > Configuration

### API Endpoints

| Method | Path                 | Permission        | Purpose                         |
| ------ | -------------------- | ----------------- | ------------------------------- |
| GET    | `/config`            | —                 | Get all config groups           |
| GET    | `/config/general`    | —                 | General config                  |
| PATCH  | `/config/general`    | `settings:manage` | Update general                  |
| GET    | `/config/accounting` | —                 | Accounting config               |
| PATCH  | `/config/accounting` | `settings:manage` | Update accounting               |
| GET    | `/config/hr`         | —                 | HR config                       |
| PATCH  | `/config/hr`         | `settings:manage` | Update HR                       |
| GET    | `/config/pos`        | —                 | POS config                      |
| PATCH  | `/config/pos`        | `settings:manage` | Update POS                      |
| GET    | `/config/zatca`      | —                 | ZATCA config (sensitive masked) |
| PATCH  | `/config/zatca`      | `settings:manage` | Update ZATCA                    |

---

## Audit Logs

### Sidebar menu item

Settings > Audit Logs

### API Endpoints

| Method | Path                                   | Permission   | Purpose                   |
| ------ | -------------------------------------- | ------------ | ------------------------- |
| GET    | `/audit-logs`                          | `audit:read` | List with filters         |
| GET    | `/audit-logs/:id`                      | `audit:read` | Single entry              |
| GET    | `/audit-logs/entity/:entity/:entityId` | `audit:read` | Change history for record |

**Filters:** `entity?`, `entityId?`, `userId?`, `action?`, `from?`, `to?`

---

## Email Templates

### Sidebar menu item

Settings > Email Templates

### API Endpoints

| Method | Path                           | Permission        | Purpose                  |
| ------ | ------------------------------ | ----------------- | ------------------------ |
| GET    | `/email-templates`             | `settings:view`   | List (filter: model)     |
| POST   | `/email-templates`             | `settings:manage` | Create                   |
| GET    | `/email-templates/:id`         | `settings:view`   | Single                   |
| PUT    | `/email-templates/:id`         | `settings:manage` | Update                   |
| DELETE | `/email-templates/:id`         | `settings:manage` | Soft delete              |
| POST   | `/email-templates/:id/preview` | `settings:view`   | Preview with record data |
| POST   | `/email-templates/send`        | `settings:manage` | Send email               |

---

## Reporting

### Sidebar menu item

Reports (sub-menus: Dashboard, Sales, Inventory, HR, Financial, CRM)

### Tenant Reports

| Method | Path                   | Permission         | Purpose                        |
| ------ | ---------------------- | ------------------ | ------------------------------ |
| GET    | `/reporting/dashboard` | `reporting:view`   | Dashboard KPIs (JSON/PDF/XLSX) |
| GET    | `/reporting/sales`     | `reporting:view`   | Sales report                   |
| GET    | `/reporting/inventory` | `reporting:view`   | Inventory report               |
| GET    | `/reporting/hr`        | `reporting:view`   | HR report                      |
| GET    | `/reporting/financial` | `reporting:view`   | Financial report               |
| GET    | `/reporting/crm`       | `reporting:view`   | CRM report                     |
| POST   | `/reporting/export`    | `reporting:export` | Export (async, queued)         |

### Backoffice Revenue (SuperAdmin)

| Method | Path                             | Purpose                 |
| ------ | -------------------------------- | ----------------------- |
| GET    | `/reporting/revenue/dashboard`   | Backoffice stats        |
| GET    | `/reporting/revenue/summary`     | MRR, ARR, growth, churn |
| GET    | `/reporting/revenue/monthly`     | Monthly over time       |
| GET    | `/reporting/revenue/by-plan`     | By plan breakdown       |
| GET    | `/reporting/revenue/top-tenants` | Top tenants by revenue  |

---

## Enums Reference

### POS

| Enum                    | Values                                                                          |
| ----------------------- | ------------------------------------------------------------------------------- |
| `PosOrderStatus`        | `open`, `paid`, `voided`, `refunded`                                            |
| `PosSessionStatus`      | `open`, `closed`                                                                |
| `PaymentMethod`         | `cash`, `card`, `gift_card`, `loyalty_points`, `credit`                         |
| `OrderType`             | `takeaway`, `dine_in`, `delivery`                                               |
| `CashMovementType`      | `cash_in`, `cash_out`                                                           |
| `OverrideStatus`        | `pending`, `approved`                                                           |
| `ManagerOverrideAction` | `high_discount`, `refund`, `void`, `unlock`, `price_override`, `reopen_session` |
| `ProductType`           | `storable`, `consumable`, `service`, `combo`                                    |
| `InvoicePolicy`         | `ordered`, `delivered`                                                          |
| `DiscountType`          | `percent`, `fixed`                                                              |
| `RefundType`            | `full`, `partial`                                                               |
| `KitchenTicketStatus`   | `pending`, `preparing`, `ready`, `served`, `cancelled`                          |
| `CourseType`            | `appetizer`, `entree`, `dessert`, `beverages`, `all`                            |
| `TableStatus`           | `available`, `occupied`, `reserved`, `cleaning`                                 |

### Sales & Purchasing

| Enum                         | Values                                    |
| ---------------------------- | ----------------------------------------- |
| `SalesOrderStatus`           | `draft`, `confirmed`, `done`, `cancelled` |
| `SalesOrderInvoiceStatus`    | `nothing`, `to_invoice`, `invoiced`       |
| `SalesOrderDeliveryStatus`   | `pending`, `partial`, `done`              |
| `SalesDiscountType`          | `percentage`, `fixed`                     |
| `PurchaseOrderStatus`        | `draft`, `confirmed`, `done`, `cancelled` |
| `PurchaseOrderBillStatus`    | `nothing`, `to_bill`, `billed`            |
| `PurchaseOrderReceiptStatus` | `nothing`, `partial`, `received`          |
| `DeliveryStatus`             | `draft`, `ready`, `done`, `cancelled`     |
| `ReceiptStatus`              | `draft`, `ready`, `done`, `cancelled`     |
| `DownPaymentType`            | `percentage`, `fixed`                     |

### Accounting

| Enum                      | Values                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| `AccountType`             | `asset`, `liability`, `equity`, `revenue`, `expense`                |
| `NormalBalance`           | `debit`, `credit`                                                   |
| `JournalEntryType`        | `manual`, `auto`, `opening`, `closing`, `reversal`                  |
| `JournalType`             | `sale`, `purchase`, `cash`, `bank`, `general`                       |
| `FiscalPeriodStatus`      | `open`, `closed`, `locked`                                          |
| `TaxType`                 | `percentage`, `fixed`                                               |
| `TaxScope`                | `sale`, `purchase`, `both`                                          |
| `InvoiceTypeNew`          | `out_invoice`, `out_refund`, `in_invoice`, `in_refund`              |
| `InvoiceStatusNew`        | `draft`, `posted`, `cancelled`                                      |
| `InvoicePaymentStatus`    | `not_paid`, `partial`, `paid`, `reversed`                           |
| `PaymentTypeNew`          | `inbound`, `outbound`                                               |
| `PaymentStatusNew`        | `draft`, `posted`, `cancelled`                                      |
| `TreasuryAccountType`     | `cash`, `bank`                                                      |
| `TreasuryTransactionType` | `receipt`, `payment`, `transferIn`, `transferOut`, `openingBalance` |
| `ReconciliationStatus`    | `draft`, `in_progress`, `completed`                                 |
| `BankStatementStatus`     | `open`, `posted`                                                    |

### Inventory

| Enum                   | Values                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `StockMovementType`    | `purchase_receipt`, `sale_delivery`, `pos_sale`, `internal`, `adjustment`, `opening`, `return`, `scrap` |
| `StockReferenceType`   | `purchase_order`, `sales_order`, `manual`, `transfer`, `pos_order`, `adjustment`                        |
| `LocationType`         | `internal`, `customer`, `supplier`, `transit`, `virtual`, `scrap`                                       |
| `UomType`              | `unit`, `weight`, `volume`, `length`, `time`                                                            |
| `AdjustmentReasonType` | `increase`, `decrease`                                                                                  |
| `AttributeDisplayType` | `radio`, `select`, `color`, `pills`                                                                     |

### HR

| Enum                    | Values                                             |
| ----------------------- | -------------------------------------------------- |
| `EmploymentType`        | `full-time`, `part-time`, `contract`, `intern`     |
| `Gender`                | `male`, `female`                                   |
| `MaritalStatus`         | `single`, `married`, `divorced`, `widowed`         |
| `LeaveStatus`           | `pending`, `approved`, `rejected`, `cancelled`     |
| `AttendanceStatus`      | `present`, `absent`, `late`, `half_day`            |
| `PayrollStatus`         | `draft`, `confirmed`, `approved`, `paid`           |
| `ContractStatus`        | `draft`, `active`, `expired`, `cancelled`          |
| `ContractType`          | `full_time`, `part_time`, `temporary`, `seasonal`  |
| `WageType`              | `monthly`, `daily`, `hourly`                       |
| `TrainingStatus`        | `planned`, `in_progress`, `completed`, `cancelled` |
| `PayslipStatus`         | `draft`, `confirmed`, `cancelled`                  |
| `LeaveAllocationStatus` | `draft`, `confirmed`, `approved`, `refused`        |

### CRM & Projects

| Enum               | Values                                                                         |
| ------------------ | ------------------------------------------------------------------------------ |
| `LeadType`         | `lead`, `opportunity`                                                          |
| `LeadPriority`     | `low`, `medium`, `high`                                                        |
| `LeadSource`       | `website`, `referral`, `social_media`, `cold_call`, `other`                    |
| `LeadActivityType` | `stage_change`, `note`, `call`, `email`, `meeting`, `converted`, `won`, `lost` |
| `PartnerType`      | `customer`, `supplier`, `both`, `individual`                                   |
| `ProjectStatus`    | `planning`, `active`, `on_hold`, `completed`, `cancelled`                      |
| `TaskStatus`       | `todo`, `in_progress`, `in_review`, `done`, `blocked`, `cancelled`             |
| `TaskPriority`     | `low`, `medium`, `high`, `critical`                                            |
| `ActivityType`     | `call`, `email`, `meeting`, `todo`, `deadline`, `upload_document`              |

### Other

| Enum                      | Values                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TenantStatus`            | `trial`, `active`, `suspended`, `cancelled`                                                                                                                           |
| `SubscriptionStatus`      | `trial`, `active`, `past_due`, `suspended`, `cancelled`, `expired`                                                                                                    |
| `BillingCycle`            | `monthly`, `quarterly`, `yearly`                                                                                                                                      |
| `TicketStatus`            | `open`, `in_progress`, `resolved`, `closed`                                                                                                                           |
| `TicketPriority`          | `low`, `medium`, `high`, `critical`                                                                                                                                   |
| `NotificationChannel`     | `push`, `email`, `sms`, `in_app`                                                                                                                                      |
| `SequenceEntity`          | `sales_order`, `purchase_order`, `employee`, `lead`, `project`, `zatca_invoice`, `pos_order`, `journal_entry`, `invoice`, `payment`, `delivery`, `receipt`, `payslip` |
| `ResetCycle`              | `never`, `yearly`, `monthly`                                                                                                                                          |
| `ExportFormat`            | `pdf`, `csv`, `xlsx`                                                                                                                                                  |
| `LoyaltyTransactionType`  | `earn`, `redeem`, `refund`, `manual`, `expire`                                                                                                                        |
| `LoyaltyAdjustAction`     | `grant`, `deduct`, `correction`                                                                                                                                       |
| `VoucherType`             | `discount`, `free_item`, `free_delivery`                                                                                                                              |
| `GiftCardTransactionType` | `issue`, `redeem`, `topup`, `expire`                                                                                                                                  |
| `PricelistDiscountPolicy` | `include_in_price`, `discount_on_sale`                                                                                                                                |
| `PricelistApplyOn`        | `all`, `category`, `product`                                                                                                                                          |
| `PricelistComputation`    | `fixed`, `percentage`, `formula`                                                                                                                                      |

---

## Sidebar Menu Structure

```
├── Dashboard
│   └── /reporting/dashboard
│
├── Sales
│   ├── Orders          → /sales/orders
│   ├── Pricelists      → /pricelists
│   └── Definitions     → /sales/definitions
│       ├── Voucher Types
│       ├── Receipt Templates
│       ├── Cancellation Reasons
│       ├── Void/Refund Reasons
│       ├── Discount Reasons
│       └── Hold Reasons
│
├── Purchasing
│   ├── Purchase Orders → /purchase-orders
│   ├── Vendors         → /purchasing/vendors
│   └── Definitions     → /purchasing/definitions
│       ├── Payment Terms
│       └── Rejection Reasons
│
├── Inventory
│   ├── Products        → /products
│   ├── Categories      → /categories
│   ├── Warehouses      → /warehouses
│   ├── Stock Locations → /stock-locations
│   ├── Adjustments     → /inventory/adjustments
│   ├── Transfers       → /inventory/transfers
│   ├── Deliveries      → /deliveries
│   ├── Receipts        → /receipts
│   ├── Branch Products → /branch-products
│   ├── Product Variants → /product-variants
│   ├── Combo Products  → /combo-products
│   ├── Supplier Products → /supplier-products
│   └── Definitions
│       ├── Units of Measure
│       └── Adjustment Reasons
│
├── Accounting
│   ├── Chart of Accounts → /accounting/accounts
│   ├── Journal Entries   → /accounting/journal-entries
│   ├── Cost Centers      → /accounting/cost-centers
│   ├── Fiscal Periods    → /accounting/periods
│   ├── Invoices          → /invoices
│   ├── Payments          → /payments
│   ├── Treasury          → /treasury
│   │   ├── Accounts
│   │   ├── Transactions
│   │   └── Reconciliation
│   ├── Bank Statements   → /bank-statements
│   ├── Fiscal Positions  → /fiscal-positions
│   ├── Currencies        → /currencies
│   ├── ZATCA             → /zatca
│   ├── Reports
│   │   ├── Trial Balance
│   │   ├── General Ledger
│   │   ├── Income Statement
│   │   └── Balance Sheet
│   └── Setup
│       ├── Account Groups
│       ├── Tax Groups
│       ├── Taxes
│       ├── Journals
│       └── Payment Terms
│
├── POS
│   ├── Orders          → /pos/orders
│   ├── Sessions        → /pos/sessions
│   ├── Terminals       → /pos/terminals
│   ├── Cashiers        → /pos/cashiers
│   ├── Cash Movements  → /pos/cash-movements
│   ├── Restaurant
│   │   ├── Sections
│   │   ├── Tables (Floor Plan)
│   │   ├── Table Sessions
│   │   └── Kitchen Display
│   ├── Loyalty         → /loyalty
│   ├── Vouchers        → /vouchers
│   └── Gift Cards      → /gift-cards
│
├── CRM
│   ├── Pipeline (Kanban) → /crm/pipeline
│   ├── Leads            → /crm/leads
│   ├── Stages           → /crm-stages
│   └── Conversion Report
│
├── Partners             → /partners
│
├── HR
│   ├── Employees        → /employees
│   ├── Departments      → /departments
│   ├── Leaves           → /leaves
│   ├── Shifts           → /hr/shifts
│   ├── Attendance       → /hr/attendance
│   ├── Contracts        → /hr/contracts
│   ├── Training         → /hr/training
│   ├── Payroll
│   │   ├── Payroll Runs → /hr/payroll/runs
│   │   ├── Salary Structures → /salary-structures
│   │   ├── Salary Rules → /salary-rules
│   │   └── Payslips     → /payslips
│   ├── Setup
│   │   ├── Leave Types
│   │   ├── Leave Allocations
│   │   └── Job Positions
│   └── Definitions
│       ├── Job Titles
│       ├── Employment Types
│       ├── Public Holidays
│       └── Termination Reasons
│
├── Projects
│   ├── Projects         → /projects
│   └── Tasks            → /tasks
│
├── Activities           → /activities
│
├── Reports
│   ├── Dashboard
│   ├── Sales Report
│   ├── Inventory Report
│   ├── HR Report
│   ├── Financial Report
│   └── CRM Report
│
├── Chat                 → /chat
│
├── Notifications        → /notifications
│
├── Settings
│   ├── Users            → /settings/users
│   ├── Roles & Permissions → /settings/roles
│   ├── Sequences        → /sequences
│   ├── Company Settings → /company-settings
│   ├── Configuration    → /config
│   ├── Email Templates  → /email-templates
│   ├── Audit Logs       → /audit-logs
│   └── Support Tickets  → /support/tickets
│
└── Backoffice (Super Admin)
    ├── Tenants          → /tenants
    ├── Admins           → /admins
    ├── Plans            → /plans
    ├── Subscriptions    → /subscriptions
    ├── System Settings  → /settings
    ├── Admin Tickets    → /admin/tickets
    └── Revenue Reports  → /reporting/revenue
```

---

## Missing or Incomplete

### Endpoints with Placeholder/TODO Implementations

1. **ZATCA CSR Generation** (`POST /zatca/onboarding/csr`) — returns placeholder response
2. **ZATCA Compliance Check** (`POST /zatca/onboarding/compliance-check`) — returns placeholder response
3. **Subscription auto-renewal** — `toggleAutoRenewal` saves flag but no recurring billing processor exists
4. **Payment method update** (`PATCH /subscriptions/admin/payment-method`) — logs only, no actual card update
5. **Low stock notification dispatch** — `LowStockProcessor` logs warning but does not actively send notifications

### Missing Validations

1. **Vendor rating** (`PATCH /purchasing/vendors/:id/rating`) — endpoint exists but is a no-op
2. **Credit limit checks** — `creditLimit` field exists on Partner but no enforcement during sales order or invoice creation
3. **Three-way matching** — `threeWayMatch` company setting exists but no actual PO-Receipt-Bill matching logic
4. **Inventory valuation method** — `stockCostingMethod` setting exists but only AVCO (weighted average) is implemented

### DTOs Missing Validation

1. Several `Update*Dto` types use manual partial patterns instead of `PartialType()` — field omission is implicit
2. Some entity fields (e.g., `InvoiceLine.taxes` many-to-many) are managed through separate `taxIds` array but not validated against tax existence at DTO level

### Features Referenced but Not Fully Implemented

1. **Bill of Materials / Recipe Management** — referenced in CLAUDE.md business logic but no BOM module exists
2. **Fixed Assets** — referenced but no module exists
3. **Budget vs Actual** — referenced but no budget module exists
4. **Automatic Reordering** — `autoReorder` setting exists but no reorder rule processor
5. **Mobile App API** — referenced but no dedicated mobile endpoints
6. **Webhooks** — config namespace exists (`webhook`) but no webhook dispatch system

### Potential Inconsistencies

1. **Dual CRM contacts system** — `CRM ContactsController` is deprecated adapter over `PartnersService`, but both exist
2. **Dual voucher type systems** — `VoucherTypeConfig` in sales definitions vs `Voucher.type` enum in vouchers module
3. **Dual payroll systems** — `hr-extensions/payroll` (simple) and `payroll-new` (rule-based) coexist
4. **`customerId` vs `partnerId`** on POS orders — `customerId` deprecated but still populated for backward compat
