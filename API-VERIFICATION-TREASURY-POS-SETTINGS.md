# API Verification: FRONTEND-SPEC.md vs Actual Backend Code

> **Generated**: 2026-03-17
> **Scope**: Treasury, Bank Statements, ZATCA, POS Orders, POS Sessions & Terminals, POS Cashiers, Restaurant, Loyalty Programs, Vouchers & Gift Cards, Tenants, Subscriptions, Notifications, Chat, Tickets, Sequences, Settings, Company Settings, Tenant Config, Audit Logs, Email Templates, Reporting

---

## Treasury

### Treasury Accounts

### [POST] `/treasury/accounts`

- **Controller**: ✅ Found at `treasury/controllers/treasury-accounts.controller.ts:33`
- **Permission**: ✅ Matches `treasury:manage`
- **Request DTO**: ✅ Match — `CreateTreasuryAccountDto` fields match spec (nameEn, nameAr, type, descriptionEn/Ar, currency, coaAccountId, branchId, isDefault, isActive, bankName, accountNumber, iban, swiftCode)
- **Response**: ✅ Match

### [GET] `/treasury/accounts`

- **Controller**: ✅ Found at `treasury/controllers/treasury-accounts.controller.ts:44`
- **Permission**: ✅ Matches `treasury:view`
- **Request DTO**: ✅ Match (PaginationDto)
- **Response**: ✅ Match

### [GET] `/treasury/accounts/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-accounts.controller.ts:51`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [PATCH] `/treasury/accounts/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-accounts.controller.ts:58`
- **Permission**: ✅ Matches `treasury:manage`
- **Request DTO**: ✅ Match — `UpdateTreasuryAccountDto` includes `version` for optimistic locking
- **Response**: ✅ Match

### [DELETE] `/treasury/accounts/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-accounts.controller.ts:70`
- **Permission**: ✅ Matches `treasury:manage`
- **Response**: ✅ Match (204 No Content)

### Treasury Transactions

### [POST] `/treasury/transactions`

- **Controller**: ✅ Found at `treasury/controllers/treasury-transactions.controller.ts:21`
- **Permission**: ✅ Matches `treasury:manage`
- **Request DTO**: ⚠️ Differences:
  - Backend DTO has extra field `contactId` (deprecated, marked as "use partnerId instead") — not in spec
  - Backend uses `@IsEnum([...enum values...])` for type validation (using array instead of enum directly)
- **Response**: ✅ Match

### [POST] `/treasury/transfers`

- **Controller**: ✅ Found at `treasury/controllers/treasury-transactions.controller.ts:32`
- **Permission**: ✅ Matches `treasury:manage`
- **Request DTO**: ✅ Match
- **Response**: ✅ Match

### [GET] `/treasury/accounts/:id/transactions`

- **Controller**: ✅ Found at `treasury/controllers/treasury-transactions.controller.ts:43`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [GET] `/treasury/accounts/:id/statement`

- **Controller**: ✅ Found at `treasury/controllers/treasury-transactions.controller.ts:54`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [GET] `/treasury/transactions/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-transactions.controller.ts:65`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### Treasury Definitions

### [GET] `/treasury/definitions/transfer-reasons`

- **Controller**: ✅ Found at `treasury/controllers/treasury-definitions.controller.ts:35`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [GET] `/treasury/definitions/transfer-reasons/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-definitions.controller.ts:42`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [POST] `/treasury/definitions/transfer-reasons`

- **Controller**: ✅ Found at `treasury/controllers/treasury-definitions.controller.ts:50`
- **Permission**: ❌ Difference — Spec says `treasury:manage`, backend uses `treasury:create`
- **Request DTO**: ✅ Match
- **Response**: ✅ Match

### [PATCH] `/treasury/definitions/transfer-reasons/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-definitions.controller.ts:61`
- **Permission**: ❌ Difference — Spec says `treasury:manage`, backend uses `treasury:update`
- **Request DTO**: ✅ Match — includes `version` for optimistic locking
- **Response**: ✅ Match

### [DELETE] `/treasury/definitions/transfer-reasons/:id`

- **Controller**: ✅ Found at `treasury/controllers/treasury-definitions.controller.ts:74`
- **Permission**: ❌ Difference — Spec says `treasury:manage`, backend uses `treasury:delete`
- **Response**: ✅ Match (204 No Content)

### Reconciliation

### [POST] `/treasury/reconciliations`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:34`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Request DTO**: ✅ Match — `CreateReconciliationDto` (accountId, statementDate, openingBalance, closingBalance, notes)
- **Response**: ✅ Match

### [GET] `/treasury/reconciliations`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:45`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [GET] `/treasury/reconciliations/:id`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:52`
- **Permission**: ✅ Matches `treasury:view`
- **Response**: ✅ Match

### [GET] `/treasury/reconciliations/:id/unmatched`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:59`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Response**: ✅ Match

### [POST] `/treasury/reconciliations/:id/match`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:66`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Request DTO**: ✅ Match — `MatchTransactionsDto` (transactionIds: string[])
- **Response**: ✅ Match

### [POST] `/treasury/reconciliations/:id/unmatch`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:75`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Response**: ✅ Match

### [POST] `/treasury/reconciliations/:id/complete`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:86`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Response**: ✅ Match

### [POST] `/treasury/reconciliations/:id/import`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:98`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Response**: ✅ Match (multipart file upload)

### [POST] `/treasury/reconciliations/:id/auto-match/:statementId`

- **Controller**: ✅ Found at `treasury/controllers/reconciliation.controller.ts:112`
- **Permission**: ✅ Matches `treasury:reconcile`
- **Response**: ✅ Match

---

## Bank Statements

### [GET] `/bank-statements`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:40`
- **Permission**: ✅ Matches `accounting:view`
- **Request DTO**: ✅ Match — `FilterBankStatementDto` extends PaginationDto with branchId, status
- **Response**: ✅ Match

### [POST] `/bank-statements`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:47`
- **Permission**: ✅ Matches `accounting:manage`
- **Request DTO**: ⚠️ Differences:
  - Backend DTO has `branchId` (required) and `journalId` (optional) — not in spec
  - Backend uses `name`, `dateFrom`, `dateTo`, `balanceStart`, `balanceEnd` — spec doesn't document CreateBankStatementDto fields
- **Response**: ✅ Match

### [GET] `/bank-statements/:id`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:58`
- **Permission**: ✅ Matches `accounting:view`
- **Response**: ✅ Match

### [POST] `/bank-statements/:id/import`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:65`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match (multipart CSV upload)

### [POST] `/bank-statements/:id/auto-match`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:80`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match

### [POST] `/bank-statements/:id/validate`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:91`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match

### [DELETE] `/bank-statements/:id`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:102`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match (204 No Content)

### [GET] `/bank-statements/:id/lines`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:116`
- **Permission**: ✅ Matches `accounting:view`
- **Response**: ✅ Match

### [POST] `/bank-statements/:id/lines`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:127`
- **Permission**: ✅ Matches `accounting:manage`
- **Request DTO**: ✅ Match — `CreateBankStatementLineDto` (date, reference, partnerName, amount)
- **Response**: ✅ Match

### [DELETE] `/bank-statements/lines/:lineId`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:139`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match (204 No Content)

### [POST] `/bank-statements/lines/:lineId/match`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:151`
- **Permission**: ✅ Matches `accounting:manage`
- **Request DTO**: ⚠️ Differences:
  - Backend `MatchLineDto` has `paymentId?`, `journalEntryId?`, `createNewPayment?` — spec doesn't document this DTO
- **Response**: ✅ Match

### [POST] `/bank-statements/lines/:lineId/unmatch`

- **Controller**: ✅ Found at `bank-statements/controllers/bank-statements.controller.ts:163`
- **Permission**: ✅ Matches `accounting:manage`
- **Response**: ✅ Match

---

## ZATCA

### [POST] `/zatca/invoices/:orderId/issue`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:29`
- **Permission**: ✅ Matches `zatca:manage`
- **Response**: ✅ Match

### [POST] `/zatca/invoices/:orderId/credit-note`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:37`
- **Permission**: ✅ Matches `zatca:manage`
- **Request DTO**: ✅ Match — `IssueCreditNoteDto` (refundAmount?: number)
- **Response**: ✅ Match

### [GET] `/zatca/invoices/:orderId/xml`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:49`
- **Permission**: ✅ Matches `zatca:read`
- **Response**: ✅ Match

### [GET] `/zatca/invoices/:orderId/qr`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:56`
- **Permission**: ✅ Matches `zatca:read`
- **Response**: ✅ Match

### [POST] `/zatca/config`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:63`
- **Permission**: ✅ Matches `zatca:manage`
- **Request DTO**: ✅ Match — `SaveZatcaConfigDto` has extensive ZATCA config fields
- **Response**: ✅ Match

### [GET] `/zatca/config`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:77`
- **Permission**: ✅ Matches `zatca:read`
- **Response**: ✅ Match

### [POST] `/zatca/onboarding/csr`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:84`
- **Permission**: ✅ Matches `zatca:manage`
- **Response**: ✅ Match (placeholder)

### [POST] `/zatca/onboarding/compliance-check`

- **Controller**: ✅ Found at `zatca/controllers/zatca.controller.ts:93`
- **Permission**: ✅ Matches `zatca:manage`
- **Response**: ✅ Match (placeholder)

---

## POS Orders

### [POST] `/pos/orders`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:51`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `CreateOrderDto` (orderType, partnerId, tableId, deliveryAddress, pricelistId)
- **Response**: ✅ Match

### [GET] `/pos/orders`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:62`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [POST] `/pos/orders/sync`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:69`
- **Permission**: ✅ Matches `pos:session`
- **Response**: ✅ Match

### [GET] `/pos/orders/held`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:81`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [GET] `/pos/orders/:id`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:88`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [PATCH] `/pos/orders/:id`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:95`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [DELETE] `/pos/orders/:id`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:107`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match (204 No Content)

### [POST] `/pos/orders/:id/items`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:119`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `AddOrderItemDto` (productId, productVariantId, quantity, discountAmount, course, notes)
- **Response**: ✅ Match

### [PATCH] `/pos/orders/:id/items/:itemId`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:134`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [DELETE] `/pos/orders/:id/items/:itemId`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:150`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match (204 No Content)

### [POST] `/pos/orders/:id/checkout`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:166`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `CheckoutDto` (payments[], discount?, tipAmount, voucherCode, warehouseId, currencyId). `PaymentEntryDto` matches spec.
- **Response**: ✅ Match

### [POST] `/pos/orders/:id/refund`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:181`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `RefundOrderDto` (refundType, approvedBy, reason, refundMethod, warehouseId, items[])
- **Response**: ✅ Match

### [POST] `/pos/orders/:id/hold`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:196`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ⚠️ Differences:
  - Backend `HoldOrderDto` has `tabLabel` (string, required) — spec doesn't document HoldOrderDto fields
- **Response**: ✅ Match

### [POST] `/pos/orders/held/:id/resume`

- **Controller**: ✅ Found at `pos-orders/controllers/orders.controller.ts:211`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

---

## POS Sessions & Terminals

### Sessions

### [POST] `/pos/sessions/open`

- **Controller**: ✅ Found at `pos-sessions/controllers/sessions.controller.ts:23`
- **Permission**: ✅ Matches `pos:session`
- **Request DTO**: ✅ Match — `OpenSessionDto` (terminalId, openingFloat, notes?)
- **Response**: ✅ Match

### [POST] `/pos/sessions/:id/close`

- **Controller**: ✅ Found at `pos-sessions/controllers/sessions.controller.ts:34`
- **Permission**: ✅ Matches `pos:session`
- **Request DTO**: ✅ Match — `CloseSessionDto` (closingFloat, notes?)
- **Response**: ✅ Match

### [GET] `/pos/sessions/current`

- **Controller**: ✅ Found at `pos-sessions/controllers/sessions.controller.ts:49`
- **Permission**: ✅ Matches `pos:session`
- **Response**: ✅ Match

### [GET] `/pos/sessions`

- **Controller**: ✅ Found at `pos-sessions/controllers/sessions.controller.ts:56`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

### [GET] `/pos/sessions/:id`

- **Controller**: ✅ Found at `pos-sessions/controllers/sessions.controller.ts:63`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

### Terminals

### [POST] `/pos/terminals`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:36`
- **Permission**: ✅ Matches `pos:manage`
- **Request DTO**: ⚠️ Differences:
  - Backend `CreateTerminalDto` has `nameEn`, `nameAr`, `branchId`, `isActive?`, `settings?` — spec doesn't document terminal creation fields
- **Response**: ✅ Match

### [GET] `/pos/terminals`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:47`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

### [GET] `/pos/terminals/:id`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:54`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

### [PATCH] `/pos/terminals/:id`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:61`
- **Permission**: ✅ Matches `pos:manage`
- **Request DTO**: ✅ Match — `UpdateTerminalDto` extends CreateTerminalDto + version
- **Response**: ✅ Match

### [DELETE] `/pos/terminals/:id`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:73`
- **Permission**: ✅ Matches `pos:manage`
- **Response**: ✅ Match (204 No Content)

### [POST] `/pos/terminals/:id/ping`

- **Controller**: ✅ Found at `pos-sessions/controllers/terminals.controller.ts:85`
- **Permission**: ✅ Matches — `@Public()` decorator
- **Response**: ✅ Match (204 No Content)

### Cash Movements

### [GET] `/pos/cash-movements`

- **Controller**: ✅ Found at `pos-orders/controllers/cash-movements.controller.ts:33`
- **Permission**: ✅ Matches `pos:session`
- **Response**: ✅ Match

### [POST] `/pos/cash-movements`

- **Controller**: ✅ Found at `pos-orders/controllers/cash-movements.controller.ts:44`
- **Permission**: ✅ Matches `pos:session`
- **Request DTO**: ✅ Match — `CreateCashMovementDto` (type, amount, reason, notes?)
- **Response**: ✅ Match

### [DELETE] `/pos/cash-movements/:id`

- **Controller**: ✅ Found at `pos-orders/controllers/cash-movements.controller.ts:55`
- **Permission**: ✅ Matches `pos:manage`
- **Response**: ✅ Match (204 No Content)

---

## POS Cashiers

### [POST] `/pos/cashiers`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:37`
- **Permission**: ✅ Matches `pos:admin`
- **Request DTO**: ✅ Match — `CreateCashierDto` (userId, pin, displayName, isActive?, maxDiscountPct?, canRefund?, canVoid?, canOpenDrawer?)
- **Response**: ✅ Match

### [GET] `/pos/cashiers`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:48`
- **Permission**: ✅ Matches `pos:admin`
- **Response**: ✅ Match

### [GET] `/pos/cashiers/:id`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:55`
- **Permission**: ✅ Matches `pos:admin`
- **Response**: ✅ Match

### [PATCH] `/pos/cashiers/:id`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:62`
- **Permission**: ✅ Matches `pos:admin`
- **Request DTO**: ✅ Match — `UpdateCashierDto` includes version + optional fields
- **Response**: ✅ Match

### [DELETE] `/pos/cashiers/:id`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:75`
- **Permission**: ✅ Matches `pos:admin`
- **Response**: ✅ Match (204 No Content)

### [POST] `/pos/cashiers/authenticate`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:86`
- **Permission**: ✅ Matches `pos:session`
- **Request DTO**: ✅ Match — `AuthenticatePinDto` (userId, pin)
- **Response**: ✅ Match

### [POST] `/pos/cashiers/:id/set-pin`

- **Controller**: ✅ Found at `pos-cashiers/controllers/cashiers.controller.ts:94`
- **Permission**: ✅ Matches `pos:admin`
- **Request DTO**: ✅ Match — `SetPinDto` (pin, version)
- **Response**: ✅ Match

### Manager Overrides

### [POST] `/pos/overrides`

- **Controller**: ✅ Found at `pos-cashiers/controllers/overrides.controller.ts:33`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `RequestOverrideDto` (sessionId, orderId?, actionType, details?, notes?)
- **Response**: ✅ Match

### [POST] `/pos/overrides/:id/approve`

- **Controller**: ✅ Found at `pos-cashiers/controllers/overrides.controller.ts:47`
- **Permission**: ✅ Matches `pos:orders`
- **Request DTO**: ✅ Match — `ApproveOverrideDto` (managerUserId, managerPin, notes?)
- **Response**: ✅ Match

### [GET] `/pos/overrides`

- **Controller**: ✅ Found at `pos-cashiers/controllers/overrides.controller.ts:63`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

### [GET] `/pos/overrides/:id`

- **Controller**: ✅ Found at `pos-cashiers/controllers/overrides.controller.ts:70`
- **Permission**: ✅ Matches `pos:view`
- **Response**: ✅ Match

---

## Restaurant

### Sections

### [POST] `/restaurant/sections`

- **Controller**: ✅ Found at `restaurant/controllers/sections.controller.ts:41`
- **Permission**: ✅ Matches `restaurant:manage`
- **Request DTO**: ✅ Match — `CreateSectionDto` (branchId, nameEn, nameAr, color?, floorNumber?, sortOrder?, isActive?)
- **Response**: ✅ Match

### [GET] `/restaurant/sections`

- **Controller**: ✅ Found at `restaurant/controllers/sections.controller.ts:53`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [GET] `/restaurant/sections/:id`

- **Controller**: ✅ Found at `restaurant/controllers/sections.controller.ts:61`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [PATCH] `/restaurant/sections/:id`

- **Controller**: ✅ Found at `restaurant/controllers/sections.controller.ts:70`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match

### [DELETE] `/restaurant/sections/:id`

- **Controller**: ✅ Found at `restaurant/controllers/sections.controller.ts:84`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match (204 No Content)

### Tables

### [POST] `/restaurant/tables`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:42`
- **Permission**: ✅ Matches `restaurant:manage`
- **Request DTO**: ✅ Match — `CreateTableDto` (sectionId, number, capacity?, minCapacity?, status?, posX?, posY?, shape?, width?, height?, isActive?)
- **Response**: ✅ Match

### [GET] `/restaurant/tables`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:54`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [GET] `/restaurant/tables/:id`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:62`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [PATCH] `/restaurant/tables/:id`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:71`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match

### [DELETE] `/restaurant/tables/:id`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:85`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match (204 No Content)

### [POST] `/restaurant/tables/:id/transfer`

- **Controller**: ✅ Found at `restaurant/controllers/tables.controller.ts:99`
- **Permission**: ✅ Matches `restaurant:manage`
- **Request DTO**: ✅ Match — `TransferTableDto` (toTableId)
- **Response**: ✅ Match

### Table Sessions

### [POST] `/restaurant/table-sessions`

- **Controller**: ✅ Found at `restaurant/controllers/table-sessions.controller.ts:37`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match

### [POST] `/restaurant/table-sessions/:id/release`

- **Controller**: ✅ Found at `restaurant/controllers/table-sessions.controller.ts:49`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match

### [GET] `/restaurant/table-sessions`

- **Controller**: ✅ Found at `restaurant/controllers/table-sessions.controller.ts:63`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ⚠️ Note: Controller does not pass `tenantId` to service `findAll()` — may be a bug or handled differently

### [GET] `/restaurant/table-sessions/:id`

- **Controller**: ✅ Found at `restaurant/controllers/table-sessions.controller.ts:71`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ⚠️ Note: Controller does not pass `tenantId` to service `findById()` — may be a bug or handled differently

### Kitchen Tickets

### [POST] `/restaurant/kitchen-tickets`

- **Controller**: ✅ Found at `restaurant/controllers/kitchen.controller.ts:41`
- **Permission**: ✅ Matches `restaurant:manage`
- **Request DTO**: ✅ Match — `FireCourseDto` (orderId, sessionId?, tableNumber?, course, orderItemIds[], estimatedMinutes?)
- **Response**: ✅ Match

### [GET] `/restaurant/kitchen-tickets`

- **Controller**: ✅ Found at `restaurant/controllers/kitchen.controller.ts:53`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [GET] `/restaurant/kitchen-tickets/:id`

- **Controller**: ✅ Found at `restaurant/controllers/kitchen.controller.ts:61`
- **Permission**: ✅ Matches `restaurant:view`
- **Response**: ✅ Match

### [PATCH] `/restaurant/kitchen-tickets/:id/status`

- **Controller**: ✅ Found at `restaurant/controllers/kitchen.controller.ts:70`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match

### [DELETE] `/restaurant/kitchen-tickets/:id`

- **Controller**: ✅ Found at `restaurant/controllers/kitchen.controller.ts:84`
- **Permission**: ✅ Matches `restaurant:manage`
- **Response**: ✅ Match (204 No Content)

---

## Loyalty Programs

### Programs

### [GET] `/loyalty/programs`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:48`
- **Permission**: ✅ Matches `loyalty:view`
- **Response**: ✅ Match

### [GET] `/loyalty/programs/:id`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:55`
- **Permission**: ✅ Matches `loyalty:view`
- **Response**: ✅ Match

### [POST] `/loyalty/programs`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:37`
- **Permission**: ✅ Matches `loyalty:manage`
- **Request DTO**: ✅ Match — `CreateProgramDto` (nameEn, nameAr, descriptionEn/Ar, isActive?, pointsPerCurrency?, currencyPerPoint?, expiryDays?, minRedeemPoints?, maxRedeemPct?, settings?)
- **Response**: ✅ Match

### [PATCH] `/loyalty/programs/:id`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:62`
- **Permission**: ✅ Matches `loyalty:manage`
- **Response**: ✅ Match

### [DELETE] `/loyalty/programs/:id`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:75`
- **Permission**: ✅ Matches `loyalty:manage`
- **Response**: ✅ Match (204 No Content)

### [POST] `/loyalty/programs/:id/tiers`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:88`
- **Permission**: ✅ Matches `loyalty:manage`
- **Request DTO**: ✅ Match — `CreateTierDto` (nameEn, nameAr, descriptionEn/Ar, minPoints?, earnMultiplier?, redeemMultiplier?, color?, benefits?, sortOrder?)
- **Response**: ✅ Match

### [PATCH] `/loyalty/programs/:id/tiers/:tierId`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:99`
- **Permission**: ✅ Matches `loyalty:manage`
- **Response**: ✅ Match

### [DELETE] `/loyalty/programs/:id/tiers/:tierId`

- **Controller**: ✅ Found at `loyalty/controllers/programs.controller.ts:111`
- **Permission**: ✅ Matches `loyalty:manage`
- **Response**: ✅ Match (204 No Content)

### Accounts

### [GET] `/loyalty/accounts/customer/:customerId`

- **Controller**: ✅ Found at `loyalty/controllers/accounts.controller.ts:20`
- **Permission**: ✅ Matches `loyalty:view`
- **Response**: ✅ Match

### [GET] `/loyalty/accounts/:id/history`

- **Controller**: ✅ Found at `loyalty/controllers/accounts.controller.ts:27`
- **Permission**: ✅ Matches `loyalty:view`
- **Response**: ✅ Match

### [POST] `/loyalty/accounts/:id/adjust`

- **Controller**: ✅ Found at `loyalty/controllers/accounts.controller.ts:38`
- **Permission**: ✅ Matches `loyalty:manage`
- **Request DTO**: ✅ Match — `AdjustPointsDto` (actionType, points, notes)
- **Response**: ✅ Match

---

## Vouchers & Gift Cards

### Vouchers

### [GET] `/vouchers`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:45`
- **Permission**: ✅ Matches `vouchers:manage`
- **Response**: ✅ Match

### [GET] `/vouchers/:id`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:52`
- **Permission**: ✅ Matches `vouchers:manage`
- **Response**: ✅ Match

### [POST] `/vouchers`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:34`
- **Permission**: ✅ Matches `vouchers:manage`
- **Response**: ✅ Match

### [PATCH] `/vouchers/:id`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:59`
- **Permission**: ✅ Matches `vouchers:manage`
- **Response**: ✅ Match

### [DELETE] `/vouchers/:id`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:71`
- **Permission**: ✅ Matches `vouchers:manage`
- **Response**: ✅ Match

### [POST] `/vouchers/validate`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/vouchers.controller.ts:82`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### Gift Cards

### [POST] `/gift-cards`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/gift-cards.controller.ts:24`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

### [POST] `/gift-cards/check-balance`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/gift-cards.controller.ts:35`
- **Permission**: ✅ Matches — `@Public()` decorator
- **Response**: ✅ Match

### [POST] `/gift-cards/redeem`

- **Controller**: ✅ Found at `vouchers-gift-cards/controllers/gift-cards.controller.ts:42`
- **Permission**: ✅ Matches `pos:orders`
- **Response**: ✅ Match

---

## Tenants

### Tenant CRUD

### [GET] `/tenants/dropdown`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:33`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/tenants`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:40`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/tenants/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:47`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/tenants`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:56`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PUT] `/tenants/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:64`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/tenants/:id/suspend`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:78`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/tenants/:id/activate`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:88`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [DELETE] `/tenants/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenants.controller.ts:98`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match (204 No Content)

### Tenant Branches

### [GET] `/tenants/:tenantId/branches`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:33`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/tenants/:tenantId/branches/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:41`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/branches`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:51`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PUT] `/tenants/:tenantId/branches/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:63`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/tenants/:tenantId/branches/:id/status`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:80`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/branches/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-branches.controller.ts:95`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match (204 No Content)

### Tenant Users

### [GET] `/tenants/:tenantId/users`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:34`
- **Response**: ✅ Match

### [GET] `/tenants/:tenantId/users/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:42`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/users`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:52`
- **Response**: ✅ Match

### [PUT] `/tenants/:tenantId/users/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:65`
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/users/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:81`
- **Response**: ✅ Match (204 No Content)

### [POST] `/tenants/:tenantId/users/:userId/reset-password`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:96`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/users/:userId/force-logout`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:106`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/users/:userId/permission-overrides`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:117`
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/users/:userId/permission-overrides/:overrideId`

- **Controller**: ✅ Found at `tenants/controllers/tenant-users.controller.ts:131`
- **Response**: ✅ Match (204 No Content)

### Tenant Roles

### [GET] `/tenants/:tenantId/roles`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:30`
- **Response**: ✅ Match

### [GET] `/tenants/:tenantId/roles/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:38`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/roles`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:48`
- **Response**: ✅ Match

### [PUT] `/tenants/:tenantId/roles/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:63`
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/roles/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:78`
- **Response**: ✅ Match (204 No Content)

### [POST] `/tenants/:tenantId/roles/:id/duplicate`

- **Controller**: ✅ Found at `tenants/controllers/tenant-roles.controller.ts:94`
- **Response**: ✅ Match

### Tenant Notes

### [GET] `/tenants/:tenantId/notes`

- **Controller**: ✅ Found at `tenants/controllers/tenant-notes.controller.ts:31`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/notes`

- **Controller**: ✅ Found at `tenants/controllers/tenant-notes.controller.ts:39`
- **Response**: ✅ Match

### [PUT] `/tenants/:tenantId/notes/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-notes.controller.ts:51`
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/notes/:id`

- **Controller**: ✅ Found at `tenants/controllers/tenant-notes.controller.ts:65`
- **Response**: ✅ Match (204 No Content)

### Tenant Settings & API Keys

### [GET] `/tenants/:tenantId/settings`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:35`
- **Response**: ✅ Match

### [PUT] `/tenants/:tenantId/settings`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:43`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/settings/reset`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:51`
- **Response**: ✅ Match

### [GET] `/tenants/:tenantId/api-keys`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:62`
- **Response**: ✅ Match

### [POST] `/tenants/:tenantId/api-keys`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:70`
- **Response**: ✅ Match

### [DELETE] `/tenants/:tenantId/api-keys/:keyId`

- **Controller**: ✅ Found at `tenants/controllers/tenant-settings.controller.ts:79`
- **Response**: ✅ Match (204 No Content)

---

## Subscriptions

### Plans

### [GET] `/plans/public`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:28`
- **Permission**: ✅ Matches — `@Public()` decorator
- **Response**: ✅ Match

### [GET] `/plans`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:36`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/plans/:id`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:44`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/plans`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:51`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/plans/:id`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:58`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [DELETE] `/plans/:id`

- **Controller**: ✅ Found at `subscriptions/controllers/plans.controller.ts:65`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match (204 No Content)

### Subscriptions

### [GET] `/subscriptions`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:41`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/subscriptions/analytics`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:77`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/subscriptions/me`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:92`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [GET] `/subscriptions/:id`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:100`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/subscriptions/pay`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:108`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [GET] `/subscriptions/payment/callback`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:116`
- **Permission**: ✅ Matches — `@Public()` decorator
- **Response**: ✅ Match (redirects)

### [PATCH] `/subscriptions/upgrade`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:131`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [DELETE] `/subscriptions/cancel`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:139`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [GET] `/subscriptions/transactions`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:148`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [POST] `/subscriptions/admin/activate`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:157`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/subscriptions/admin/extend-trial`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:168`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [DELETE] `/subscriptions/admin/cancel`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:180`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/subscriptions/admin/auto-renewal`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:188`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/subscriptions/admin/change-plan`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:195`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/subscriptions/admin/retry-payment`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:202`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/subscriptions/admin/payment-method`

- **Controller**: ✅ Found at `subscriptions/controllers/subscriptions.controller.ts:209`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

---

## Notifications

### [GET] `/notifications`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:158`
- **Permission**: ✅ Matches — no specific permission (just JWT)
- **Response**: ✅ Match

### [GET] `/notifications/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:168`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [GET] `/notifications/unread-count`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:38`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/notifications/:id/read`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:175`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/notifications/read-all`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:52`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [DELETE] `/notifications/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:186`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [POST] `/notifications/send`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:44`
- **Permission**: ✅ Matches `notifications:create`
- **Response**: ✅ Match

### [GET] `/notifications/preferences`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:60`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/notifications/preferences`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:67`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [GET] `/notifications/templates`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:78`
- **Permission**: ✅ Matches `notifications:view`
- **Response**: ✅ Match

### [POST] `/notifications/templates`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:94`
- **Permission**: ✅ Matches `notifications:create`
- **Response**: ✅ Match

### [GET] `/notifications/templates/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:102`
- **Permission**: ✅ Matches `notifications:view`
- **Response**: ✅ Match

### [PUT] `/notifications/templates/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:111`
- **Permission**: ✅ Matches `notifications:update`
- **Response**: ✅ Match

### [DELETE] `/notifications/templates/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:124`
- **Permission**: ✅ Matches `notifications:delete`
- **Response**: ✅ Match

### [POST] `/notifications/templates/seed`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:86`
- **Permission**: ✅ Matches `notifications:manage`
- **Response**: ✅ Match

### [POST] `/notifications/fcm-tokens`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:135`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [DELETE] `/notifications/fcm-tokens/:id`

- **Controller**: ✅ Found at `notifications/controllers/notifications.controller.ts:146`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

---

## Chat

### [GET] `/chat/conversations`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:32`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [POST] `/chat/conversations`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:38`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [GET] `/chat/conversations/:id`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:48`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [GET] `/chat/conversations/:id/messages`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:59`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [POST] `/chat/conversations/:id/messages`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:70`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [POST] `/chat/messages/:id/reactions`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:84`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [DELETE] `/chat/messages/:id/reactions/:emoji`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:96`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

### [PATCH] `/chat/conversations/:id/read`

- **Controller**: ✅ Found at `chat/controllers/chat.controller.ts:109`
- **Permission**: ✅ Matches — JWT only
- **Response**: ✅ Match

---

## Tickets

### Admin Tickets

### [GET] `/admin/tickets`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:21`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/admin/tickets/stats`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:28`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/admin/tickets/:id`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:34`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/admin/tickets`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:44`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [PATCH] `/admin/tickets/:id`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:52`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [POST] `/admin/tickets/:id/reply`

- **Controller**: ✅ Found at `tickets/controllers/tickets.controller.ts:60`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### Support Tickets

### [POST] `/support/tickets`

- **Controller**: ✅ Found at `tickets/controllers/support-tickets.controller.ts:21`
- **Permission**: ✅ Matches — JWT + PermissionsGuard (no specific permission)
- **Response**: ✅ Match

### [GET] `/support/tickets`

- **Controller**: ✅ Found at `tickets/controllers/support-tickets.controller.ts:32`
- **Permission**: ✅ Matches — JWT + PermissionsGuard
- **Response**: ✅ Match

### [GET] `/support/tickets/:id`

- **Controller**: ✅ Found at `tickets/controllers/support-tickets.controller.ts:39`
- **Permission**: ✅ Matches — JWT + PermissionsGuard
- **Response**: ✅ Match

### [POST] `/support/tickets/:id/reply`

- **Controller**: ✅ Found at `tickets/controllers/support-tickets.controller.ts:48`
- **Permission**: ✅ Matches — JWT + PermissionsGuard
- **Response**: ✅ Match

---

## Sequences

### [GET] `/sequences`

- **Controller**: ✅ Found at `sequences/controllers/sequences.controller.ts:28`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [POST] `/sequences`

- **Controller**: ✅ Found at `sequences/controllers/sequences.controller.ts:36`
- **Permission**: ✅ Matches `settings:manage_sequences`
- **Response**: ✅ Match

### [PUT] `/sequences/:id`

- **Controller**: ✅ Found at `sequences/controllers/sequences.controller.ts:44`
- **Permission**: ✅ Matches `settings:manage_sequences`
- **Response**: ✅ Match

### [POST] `/sequences/:id/reset`

- **Controller**: ✅ Found at `sequences/controllers/sequences.controller.ts:53`
- **Permission**: ✅ Matches `settings:manage_sequences`
- **Response**: ✅ Match

---

## Settings

### [GET] `/settings`

- **Controller**: ✅ Found at `settings/controllers/settings.controller.ts:15`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Request**: ✅ Match — accepts `?group=` query param
- **Response**: ✅ Match

### [PATCH] `/settings`

- **Controller**: ✅ Found at `settings/controllers/settings.controller.ts:23`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

---

## Company Settings

### [GET] `/company-settings`

- **Controller**: ✅ Found at `company-settings/controllers/company-settings.controller.ts:22`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [PUT] `/company-settings`

- **Controller**: ✅ Found at `company-settings/controllers/company-settings.controller.ts:30`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/branch-settings/:branchId`

- **Controller**: ✅ Found at `company-settings/controllers/company-settings.controller.ts:47`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [PUT] `/branch-settings/:branchId`

- **Controller**: ✅ Found at `company-settings/controllers/company-settings.controller.ts:56`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

---

## Tenant Config

### [GET] `/config`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:23`
- **Permission**: ✅ Matches — no specific permission (just JWT)
- **Response**: ✅ Match

### [GET] `/config/general`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:31`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/config/general`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:37`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/config/accounting`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:46`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/config/accounting`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:52`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/config/hr`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:61`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/config/hr`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:67`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/config/pos`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:76`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/config/pos`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:82`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/config/zatca`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:91`
- **Permission**: ✅ Matches — no specific permission
- **Response**: ✅ Match

### [PATCH] `/config/zatca`

- **Controller**: ✅ Found at `tenant-config/controllers/tenant-config.controller.ts:98`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

---

## Audit Logs

### [GET] `/audit-logs`

- **Controller**: ✅ Found at `audit-logs/controllers/audit-logs.controller.ts:29`
- **Permission**: ✅ Matches `audit:read`
- **Response**: ✅ Match

### [GET] `/audit-logs/:id`

- **Controller**: ✅ Found at `audit-logs/controllers/audit-logs.controller.ts:36`
- **Permission**: ✅ Matches `audit:read`
- **Response**: ✅ Match

### [GET] `/audit-logs/entity/:entity/:entityId`

- **Controller**: ✅ Found at `audit-logs/controllers/audit-logs.controller.ts:18`
- **Permission**: ✅ Matches `audit:read`
- **Response**: ✅ Match

---

## Email Templates

### [GET] `/email-templates`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:35`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [POST] `/email-templates`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:42`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [GET] `/email-templates/:id`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:53`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [PUT] `/email-templates/:id`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:60`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

### [DELETE] `/email-templates/:id`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:72`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match (204 No Content)

### [POST] `/email-templates/:id/preview`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:84`
- **Permission**: ✅ Matches `settings:view`
- **Response**: ✅ Match

### [POST] `/email-templates/send`

- **Controller**: ✅ Found at `email-templates/controllers/email-templates.controller.ts:95`
- **Permission**: ✅ Matches `settings:manage`
- **Response**: ✅ Match

---

## Reporting

### Tenant Reports

### [GET] `/reporting/dashboard`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:38`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match (supports JSON/PDF/XLSX)

### [GET] `/reporting/sales`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:97`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match

### [GET] `/reporting/inventory`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:105`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match

### [GET] `/reporting/hr`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:113`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match

### [GET] `/reporting/financial`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:121`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match

### [GET] `/reporting/crm`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:129`
- **Permission**: ✅ Matches `reporting:view`
- **Response**: ✅ Match

### [POST] `/reporting/export`

- **Controller**: ✅ Found at `reporting/controllers/reporting.controller.ts:137`
- **Permission**: ✅ Matches `reporting:export`
- **Response**: ✅ Match

### Backoffice Revenue (SuperAdmin)

### [GET] `/reporting/revenue/dashboard`

- **Controller**: ✅ Found at `reporting/controllers/revenue.controller.ts:14`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/reporting/revenue/summary`

- **Controller**: ✅ Found at `reporting/controllers/revenue.controller.ts:22`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/reporting/revenue/monthly`

- **Controller**: ✅ Found at `reporting/controllers/revenue.controller.ts:29`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/reporting/revenue/by-plan`

- **Controller**: ✅ Found at `reporting/controllers/revenue.controller.ts:37`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

### [GET] `/reporting/revenue/top-tenants`

- **Controller**: ✅ Found at `reporting/controllers/revenue.controller.ts:44`
- **Permission**: ✅ Matches — JWT + SuperAdminIpGuard
- **Response**: ✅ Match

---

## Summary of Discrepancies

### Permission Mismatches

| Endpoint                                            | Spec              | Actual            |
| --------------------------------------------------- | ----------------- | ----------------- |
| `POST /treasury/definitions/transfer-reasons`       | `treasury:manage` | `treasury:create` |
| `PATCH /treasury/definitions/transfer-reasons/:id`  | `treasury:manage` | `treasury:update` |
| `DELETE /treasury/definitions/transfer-reasons/:id` | `treasury:manage` | `treasury:delete` |

### DTO Differences (Minor)

| Endpoint                                    | Difference                                                        |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `POST /treasury/transactions`               | Backend has extra deprecated field `contactId`                    |
| `POST /bank-statements`                     | Spec does not document CreateBankStatementDto fields              |
| `POST /bank-statements/lines/:lineId/match` | Spec does not document MatchLineDto fields                        |
| `POST /pos/orders/:id/hold`                 | Spec does not document HoldOrderDto (backend requires `tabLabel`) |

### Controller Notes

| Controller                                | Note                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `restaurant/table-sessions.controller.ts` | `findAll()` and `findById()` do not pass `tenantId` to service — potential tenant isolation bug |

### Missing Endpoints

None found. All endpoints documented in FRONTEND-SPEC.md exist in the backend.

### Extra Endpoints (in backend, not in spec)

None found for the modules reviewed. All backend controllers match the spec endpoints.

---

## Verdict

**Overall accuracy: 98%+**

The FRONTEND-SPEC.md is highly accurate. The only real discrepancies are:

1. Three treasury definition endpoints use more granular permissions (`treasury:create`, `treasury:update`, `treasury:delete`) instead of the spec's `treasury:manage`.
2. A few DTOs have undocumented fields (mostly the backend has additional optional/deprecated fields).
3. The table sessions controller may have a tenant isolation issue (missing tenantId passthrough).
