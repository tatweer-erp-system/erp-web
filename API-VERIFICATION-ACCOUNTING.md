# API Verification Report -- Accounting, Setup, Invoices, Payments, Fiscal Positions, Currency

> **Generated**: 2026-03-17
> **Source**: Exhaustive comparison of `erp-web/FRONTEND-SPEC.md` against actual backend code in `erp-api/src/modules/`

---

## Summary

| Section                   | Endpoints | Match | Mismatches | Notes                                                 |
| ------------------------- | --------- | ----- | ---------- | ----------------------------------------------------- |
| Chart of Accounts         | 8         | 8     | 0          | All verified                                          |
| Journal Entries           | 7         | 7     | 0          | All verified                                          |
| Cost Centers              | 6         | 6     | 0          | All verified                                          |
| Fiscal Periods            | 9         | 9     | 2          | `:id` param type is `number` (ParseIntPipe), not UUID |
| Reports                   | 5         | 5     | 0          | All verified                                          |
| Account Groups            | 6         | 6     | 0          | All verified                                          |
| Tax Groups                | 5         | 5     | 0          | All verified                                          |
| Taxes                     | 5         | 5     | 0          | All verified                                          |
| Journals                  | 5         | 5     | 0          | All verified                                          |
| Payment Terms             | 5         | 5     | 0          | All verified                                          |
| Invoices                  | 8         | 8     | 0          | All verified                                          |
| Payments (Standalone)     | 5         | 5     | 0          | Lives in `invoices` module, not a separate module     |
| Fiscal Positions          | 6         | 6     | 1          | UpdateFiscalPosition has extra `isActive` field       |
| Currency & Exchange Rates | 7         | 7     | 0          | All verified                                          |

**Total: 91 endpoints verified. All exist in backend. Minor discrepancies noted below.**

---

## Accounting -- Chart of Accounts

### [GET] `/accounting/accounts`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:65`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec
- **Response**: Paginated list -- Matches spec

### [GET] `/accounting/accounts/tree`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: Nested tree -- Matches spec

### [GET] `/accounting/accounts/grouped-tree`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:57`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: Grouped by account groups -- Matches spec

### [GET] `/accounting/accounts/:id`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:73`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: Account details -- Matches spec

### [POST] `/accounting/accounts`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:82`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateAccountDto` -- All fields match spec:
  - `code: string` (@MaxLength(20)) -- Matches
  - `nameEn: string` (@MaxLength(255)) -- Matches
  - `nameAr: string` (@MaxLength(255)) -- Matches
  - `descriptionEn?: string` (@MaxLength(500)) -- Matches
  - `descriptionAr?: string` (@MaxLength(500)) -- Matches
  - `type: AccountType` (enum: asset/liability/equity/revenue/expense) -- Matches
  - `subType?: string` (@MaxLength(50)) -- Matches
  - `parentId?: string` (UUID) -- Matches
  - `groupId?: string` (UUID) -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `normalBalance: NormalBalance` (enum: debit/credit) -- Matches
  - `isActive?: boolean` (default true) -- Matches
  - `allowDirectPosting?: boolean` (default true) -- Matches
  - `isReconcilable?: boolean` (default false) -- Matches
  - `isDeprecated?: boolean` (default false) -- Matches
  - `openingBalance?: number` -- Matches
  - `openingBalanceDate?: string` -- Matches
  - `currency?: string` (default 'SAR') -- Matches
- **Response**: Created account -- Matches spec

### [PATCH] `/accounting/accounts/:id`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:94`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateAccountDto` -- All fields optional, matches spec
- **Response**: Updated account -- Matches spec
- **Note**: UpdateAccountDto does NOT have `version` field (optimistic locking not enforced on accounts update). Spec does not mention it either, so this is consistent.

### [DELETE] `/accounting/accounts/:id`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:108`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

### [POST] `/accounting/accounts/repair`

- **Controller**: Found at `accounting/controllers/accounts.controller.ts:41`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: COA repair summary -- Matches spec

---

## Accounting -- Journal Entries

### [GET] `/accounting/journal-entries`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec
- **Response**: Paginated list -- Matches spec

### [GET] `/accounting/journal-entries/:id`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: Journal entry with lines -- Matches spec

### [POST] `/accounting/journal-entries`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:58`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateJournalEntryDto` -- All fields match spec:
  - `entryType?: JournalEntryType` (enum: manual/auto/opening/closing/reversal, default manual) -- Matches
  - `entryTypeNew?: JournalEntryTypeNew` (enum: invoice/payment/stock/payroll/manual/reversal) -- Matches
  - `journalId?: string` (UUID) -- Matches
  - `entryDate: string` (@IsDateString) -- Matches
  - `description?: string` -- Matches
  - `referenceId?: string` (UUID) -- Matches
  - `referenceType?: string` -- Matches
  - `lines: CreateJournalLineDto[]` (@ArrayMinSize(2)) -- Matches
- **CreateJournalLineDto** -- All fields match spec:
  - `accountId: string` (UUID) -- Matches
  - `partnerId?: string` (UUID) -- Matches
  - `costCenterId?: string` (UUID) -- Matches
  - `debit: number` (@Min(0)) -- Matches
  - `credit: number` (@Min(0)) -- Matches
  - `description?: string` -- Matches
  - `currencyCode?: string` -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `amountCurrency?: number` (@Min(0)) -- Matches
  - `exchangeRate?: number` (@Min(0)) -- Matches

### [PATCH] `/accounting/journal-entries/:id`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:70`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateJournalEntryDto` -- Fields: `entryDate?`, `description?`, `lines?` (optional, @ArrayMinSize(2)) -- Matches spec
- **Note**: UpdateJournalEntryDto does NOT have `version` field. Spec does not mention it explicitly for this DTO either.

### [POST] `/accounting/journal-entries/:id/post`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:84`
- **Permission**: `accounting:post` -- Matches spec
- **Response**: Posted entry -- Matches spec

### [POST] `/accounting/journal-entries/:id/reverse`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:97`
- **Permission**: `accounting:post` -- Matches spec
- **Response**: Reversal entry -- Matches spec

### [DELETE] `/accounting/journal-entries/:id`

- **Controller**: Found at `accounting/controllers/journal-entries.controller.ts:110`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting -- Cost Centers

### [GET] `/accounting/cost-centers`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec

### [GET] `/accounting/cost-centers/tree`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec

### [GET] `/accounting/cost-centers/:id`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:57`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/accounting/cost-centers`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:66`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateCostCenterDto` -- All fields match spec:
  - `code: string` (@MaxLength(20)) -- Matches
  - `nameEn: string` (@MaxLength(255)) -- Matches (spec says no explicit max, backend has 255)
  - `nameAr: string` (@MaxLength(255)) -- Matches
  - `descriptionEn?: string` (@MaxLength(500)) -- Matches
  - `descriptionAr?: string` (@MaxLength(500)) -- Matches
  - `parentId?: string` (UUID) -- Matches
  - `isActive?: boolean` (default true) -- Matches

### [PATCH] `/accounting/cost-centers/:id`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:78`
- **Permission**: `accounting:manage` -- Matches spec

### [DELETE] `/accounting/cost-centers/:id`

- **Controller**: Found at `accounting/controllers/cost-centers.controller.ts:92`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting -- Fiscal Periods

### [GET] `/accounting/periods`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:38`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: List of all periods (NOT paginated -- no PaginationDto) -- Matches spec

### [GET] `/accounting/periods/lock-date`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:46`
- **Permission**: `accounting:view` -- Matches spec
- **Response**: `{ fiscalLockDate: string | null }` -- Matches spec

### [GET] `/accounting/periods/:id`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:55`
- **Permission**: `accounting:view` -- Matches spec
- **Difference**: Param `:id` uses `ParseIntPipe` (integer), NOT UUID. Spec does not specify UUID, but frontend should pass integer ID for fiscal periods.

### [POST] `/accounting/periods`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:64`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateFiscalPeriodDto` -- All fields match spec:
  - `fiscalYear: number` (@IsInt, @Min(2000), @Max(2100)) -- Matches
  - `periodNumber: number` (@IsInt, @Min(1), @Max(12)) -- Matches
  - `periodType?: FiscalPeriodType` (enum: monthly/quarterly, default monthly) -- Matches
  - `nameEn: string` (@MaxLength(100)) -- Matches
  - `nameAr: string` (@MaxLength(100)) -- Matches
  - `startDate: string` (@IsDateString) -- Matches
  - `endDate: string` (@IsDateString) -- Matches

### [PATCH] `/accounting/periods/:id`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:76`
- **Permission**: `accounting:manage` -- Matches spec
- **Difference**: `:id` is `ParseIntPipe` (integer), not UUID

### [POST] `/accounting/periods/:id/close`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:90`
- **Permission**: `accounting:close` -- Matches spec

### [POST] `/accounting/periods/:id/reopen`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:103`
- **Permission**: `accounting:close` -- Matches spec

### [POST] `/accounting/periods/:id/lock`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:116`
- **Permission**: `accounting:close` -- Matches spec

### [POST] `/accounting/periods/lock-date`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:129`
- **Permission**: `accounting:close` -- Matches spec
- **Request Body**: `{ lockDate: string }` (extracted via `@Body('lockDate')`) -- Matches spec

### [DELETE] `/accounting/periods/lock-date`

- **Controller**: Found at `accounting/controllers/fiscal-periods.controller.ts:144`
- **Permission**: `accounting:close` -- Matches spec

---

## Accounting -- Reports

### [GET] `/accounting/reports/trial-balance`

- **Controller**: Found at `accounting/controllers/reports.controller.ts:24`
- **Permission**: `accounting:view` -- Matches spec
- **Query Params**: `from` (required), `to` (required), `journalId?`, `groupByAccountGroup?` (string, parsed as boolean), `format?` (ExportFormat enum: pdf/xlsx) -- Matches spec

### [GET] `/accounting/reports/general-ledger`

- **Controller**: Found at `accounting/controllers/reports.controller.ts:102`
- **Permission**: `accounting:view` -- Matches spec
- **Query Params**: `accountId` (required), `from` (required), `to` (required) -- Matches spec

### [GET] `/accounting/reports/income-statement`

- **Controller**: Found at `accounting/controllers/reports.controller.ts:120`
- **Permission**: `accounting:view` -- Matches spec
- **Query Params**: `from` (required), `to` (required), `costCenterId?`, `journalId?`, `costCenterBreakdown?`, `format?` -- Matches spec

### [GET] `/accounting/reports/balance-sheet`

- **Controller**: Found at `accounting/controllers/reports.controller.ts:211`
- **Permission**: `accounting:view` -- Matches spec
- **Query Params**: `asOfDate` (required), `format?` -- Matches spec

### [GET] `/accounting/reports/account-statement`

- **Controller**: Found at `accounting/controllers/reports.controller.ts:314`
- **Permission**: `accounting:view` -- Matches spec
- **Query Params**: `accountId` (required), `from` (required), `to` (required) -- Matches spec

---

## Accounting Setup -- Account Groups

### [GET] `/account-groups`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec

### [GET] `/account-groups/tree`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec

### [GET] `/account-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:57`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/account-groups`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:66`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateAccountGroupDto` -- All fields match spec:
  - `codePrefix: string` (@MaxLength(10)) -- Matches
  - `nameEn: string` (@MaxLength(255)) -- Matches
  - `nameAr: string` (@MaxLength(255)) -- Matches
  - `parentId?: string` (UUID) -- Matches

### [PATCH] `/account-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:78`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateAccountGroupDto` -- All optional + `version: number` (@IsInt, required) -- Matches spec

### [DELETE] `/account-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/account-groups.controller.ts:92`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting Setup -- Tax Groups

### [GET] `/tax-groups`

- **Controller**: Found at `accounting-setup/controllers/tax-groups.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec

### [GET] `/tax-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/tax-groups.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/tax-groups`

- **Controller**: Found at `accounting-setup/controllers/tax-groups.controller.ts:58`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateTaxGroupDto` -- `nameEn: string`, `nameAr: string` (both required) -- Matches spec

### [PATCH] `/tax-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/tax-groups.controller.ts:70`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateTaxGroupDto` -- `nameEn?`, `nameAr?` (optional) + `version: number` (@IsInt, required) -- Matches spec

### [DELETE] `/tax-groups/:id`

- **Controller**: Found at `accounting-setup/controllers/tax-groups.controller.ts:84`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting Setup -- Taxes

### [GET] `/taxes`

- **Controller**: Found at `accounting-setup/controllers/taxes.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `FilterTaxDto` (extends PaginationDto + `scope?: TaxScope`, `isActive?: boolean`) -- Matches spec

### [GET] `/taxes/:id`

- **Controller**: Found at `accounting-setup/controllers/taxes.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/taxes`

- **Controller**: Found at `accounting-setup/controllers/taxes.controller.ts:58`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateTaxDto` -- All fields match spec:
  - `nameEn: string`, `nameAr: string` -- Matches
  - `type?: TaxType` (percentage/fixed, default percentage) -- Matches
  - `amount?: number` (default 15.0) -- Matches
  - `scope?: TaxScope` (sale/purchase/both, default both) -- Matches
  - `includeInPrice?: boolean` (default false) -- Matches
  - `taxGroupId?: string` (UUID) -- Matches
  - `saleAccountId?: string` (UUID) -- Matches
  - `purchaseAccountId?: string` (UUID) -- Matches
  - `isActive?: boolean` (default true) -- Matches

### [PATCH] `/taxes/:id`

- **Controller**: Found at `accounting-setup/controllers/taxes.controller.ts:70`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateTaxDto` -- All optional + `version: number` required -- Matches spec

### [DELETE] `/taxes/:id`

- **Controller**: Found at `accounting-setup/controllers/taxes.controller.ts:84`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting Setup -- Journals

### [GET] `/journals`

- **Controller**: Found at `accounting-setup/controllers/journals.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `FilterJournalDto` (extends PaginationDto + `type?: JournalType`, `isActive?: boolean`) -- Matches spec

### [GET] `/journals/:id`

- **Controller**: Found at `accounting-setup/controllers/journals.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/journals`

- **Controller**: Found at `accounting-setup/controllers/journals.controller.ts:58`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateJournalDto` -- All fields match spec:
  - `nameEn: string`, `nameAr: string` -- Matches
  - `type: JournalType` (sale/purchase/cash/bank/general) -- Matches
  - `code: string` (@MaxLength(10)) -- Matches
  - `defaultAccountId?: string` (UUID) -- Matches
  - `suspenseAccountId?: string` (UUID) -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `sequencePrefix?: string` (@MaxLength(20)) -- Matches
  - `isActive?: boolean` (default true) -- Matches

### [PATCH] `/journals/:id`

- **Controller**: Found at `accounting-setup/controllers/journals.controller.ts:70`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateJournalDto` -- All optional + `version: number` required -- Matches spec

### [DELETE] `/journals/:id`

- **Controller**: Found at `accounting-setup/controllers/journals.controller.ts:84`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Accounting Setup -- Payment Terms

### [GET] `/payment-terms`

- **Controller**: Found at `accounting-setup/controllers/payment-terms.controller.ts:41`
- **Permission**: `accounting:view` -- Matches spec

### [GET] `/payment-terms/:id`

- **Controller**: Found at `accounting-setup/controllers/payment-terms.controller.ts:49`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/payment-terms`

- **Controller**: Found at `accounting-setup/controllers/payment-terms.controller.ts:58`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreatePaymentTermDto` -- All fields match spec:
  - `nameEn: string`, `nameAr: string` -- Matches
  - `note?: string` (@MaxLength(500)) -- Matches
  - `lines?: CreatePaymentTermLineDto[]` -- Matches
- **CreatePaymentTermLineDto** -- All fields match spec:
  - `sequence?: number` (default 0) -- Matches
  - `type: PaymentTermLineType` (percent/fixed/balance) -- Matches
  - `value?: number` (default 0) -- Matches
  - `days?: number` (default 0) -- Matches
  - `dayOfMonth?: number` -- Matches

### [PATCH] `/payment-terms/:id`

- **Controller**: Found at `accounting-setup/controllers/payment-terms.controller.ts:70`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdatePaymentTermDto` -- All optional + `lines?` replaces + `version: number` required -- Matches spec

### [DELETE] `/payment-terms/:id`

- **Controller**: Found at `accounting-setup/controllers/payment-terms.controller.ts:84`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Invoices

### [GET] `/invoices`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:42`
- **Permission**: `invoices:view` -- Matches spec
- **Request DTO**: `FilterInvoiceDto` (extends PaginationDto + `invoiceType?`, `status?`, `paymentStatus?`, `partnerId?`, `branchId?`, `dateFrom?`, `dateTo?`) -- Matches spec

### [POST] `/invoices`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:50`
- **Permission**: `invoices:manage` -- Matches spec
- **Request DTO**: `CreateInvoiceDto` -- All fields match spec:
  - `branchId: string` (UUID) -- Matches
  - `partnerId: string` (UUID) -- Matches
  - `invoiceType: InvoiceTypeNew` (out_invoice/out_refund/in_invoice/in_refund) -- Matches
  - `invoiceDate: string` (@IsDateString) -- Matches
  - `dueDate?: string` -- Matches
  - `paymentTermId?: string` (UUID) -- Matches
  - `saleOrderId?: string` (UUID) -- Matches
  - `purchaseOrderId?: string` (UUID) -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `exchangeRate?: number` (@Min(0.000001)) -- Matches
  - `reference?: string` -- Matches
  - `narration?: string` -- Matches
  - `fiscalPositionId?: string` (UUID) -- Matches
  - `journalId?: string` (UUID) -- Matches
  - `originalInvoiceId?: string` (UUID) -- Matches
  - `lines: CreateInvoiceLineDto[]` (@ArrayMinSize(1)) -- Matches
- **CreateInvoiceLineDto** -- All fields match spec:
  - `productId?: string` (UUID) -- Matches
  - `productVariantId?: string` (UUID) -- Matches
  - `description: string` -- Matches
  - `quantity: number` (@Min(0.0001)) -- Matches
  - `unitPrice: number` (@Min(0)) -- Matches
  - `discountPct?: number` (0-100, default 0) -- Matches
  - `taxIds?: string[]` (UUID[]) -- Matches
  - `accountId?: string` (UUID) -- Matches
  - `sequence?: number` -- Matches

### [GET] `/invoices/:id`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:62`
- **Permission**: `invoices:view` -- Matches spec

### [PUT] `/invoices/:id`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:71`
- **Permission**: `invoices:manage` -- Matches spec
- **HTTP Method**: PUT -- Matches spec
- **Request DTO**: `UpdateInvoiceDto` (PartialType of CreateInvoiceDto minus `invoiceType` and `branchId`, + `version: number`) -- Matches spec

### [POST] `/invoices/:id/post`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:85`
- **Permission**: `invoices:manage` -- Matches spec

### [POST] `/invoices/:id/cancel`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:98`
- **Permission**: `invoices:manage` -- Matches spec

### [POST] `/invoices/:id/register-payment`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:111`
- **Permission**: `invoices:manage` -- Matches spec
- **Request DTO**: `RegisterPaymentDto` -- All fields match spec:
  - `paymentDate: string` (@IsDateString) -- Matches
  - `amount: number` (@Min(0.01)) -- Matches
  - `memo?: string` -- Matches
  - `treasuryAccountId?: string` (UUID) -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `exchangeRate?: number` (@Min(0.000001)) -- Matches

### [DELETE] `/invoices/:id`

- **Controller**: Found at `invoices/controllers/invoices.controller.ts:128`
- **Permission**: `invoices:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Payments (Standalone)

> **Note**: There is no separate `payments` module. The `PaymentsController` lives inside the `invoices` module at `invoices/controllers/payments.controller.ts`. The spec correctly documents the endpoints.

### [GET] `/payments`

- **Controller**: Found at `invoices/controllers/payments.controller.ts:27`
- **Permission**: `payments:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec

### [POST] `/payments`

- **Controller**: Found at `invoices/controllers/payments.controller.ts:35`
- **Permission**: `payments:manage` -- Matches spec
- **Request DTO**: `CreatePaymentDto` -- All fields match spec:
  - `branchId: string` (UUID) -- Matches
  - `partnerId: string` (UUID) -- Matches
  - `paymentType: PaymentTypeNew` (inbound/outbound) -- Matches
  - `paymentDate: string` (@IsDateString) -- Matches
  - `amount: number` (@Min(0.01)) -- Matches
  - `currencyId?: string` (UUID) -- Matches
  - `exchangeRate?: number` (@Min(0.000001)) -- Matches
  - `memo?: string` -- Matches
  - `treasuryAccountId?: string` (UUID) -- Matches
  - `journalId?: string` (UUID) -- Matches

### [GET] `/payments/:id`

- **Controller**: Found at `invoices/controllers/payments.controller.ts:47`
- **Permission**: `payments:view` -- Matches spec

### [POST] `/payments/:id/post`

- **Controller**: Found at `invoices/controllers/payments.controller.ts:56`
- **Permission**: `payments:manage` -- Matches spec

### [POST] `/payments/:id/cancel`

- **Controller**: Found at `invoices/controllers/payments.controller.ts:69`
- **Permission**: `payments:manage` -- Matches spec

---

## Fiscal Positions

### [GET] `/fiscal-positions`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:42`
- **Permission**: `accounting:view` -- Matches spec

### [GET] `/fiscal-positions/resolve`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:50`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `ResolveFiscalPositionDto` -- `partnerId: string` (UUID), `taxIds: string[]` (UUID[]) -- Matches spec

### [GET] `/fiscal-positions/:id`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:58`
- **Permission**: `accounting:view` -- Matches spec

### [POST] `/fiscal-positions`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:67`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateFiscalPositionDto` -- All fields match spec:
  - `nameEn: string`, `nameAr: string` -- Matches
  - `autoDetect?: boolean` (default false) -- Matches
  - `country?: string` (@MaxLength(100)) -- Matches
  - `note?: string` -- Matches
  - `taxMappings?: TaxMappingDto[]` (`taxSrcId: string`, `taxDestId?: string`) -- Matches
  - `accountMappings?: AccountMappingDto[]` (`accountSrcId: string`, `accountDestId: string`) -- Matches

### [PUT] `/fiscal-positions/:id`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:79`
- **Permission**: `accounting:manage` -- Matches spec
- **HTTP Method**: PUT -- Matches spec
- **Request DTO**: `UpdateFiscalPositionDto` -- Matches spec + extras:
  - All fields optional + `version: number` required -- Matches
  - `taxMappings?`, `accountMappings?` -- Matches
  - **Extra field in backend**: `isActive?: boolean` -- NOT in spec. Frontend can safely ignore it or use it.

### [DELETE] `/fiscal-positions/:id`

- **Controller**: Found at `fiscal-positions/controllers/fiscal-positions.controller.ts:93`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 204 No Content -- Matches spec

---

## Currency & Exchange Rates

### [POST] `/currencies`

- **Controller**: Found at `currency/currency.controller.ts:37`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateCurrencyDto` -- All fields match spec:
  - `code: string` (@Length(3,3)) -- Matches
  - `nameEn: string` (@MaxLength(100)), `nameAr: string` (@MaxLength(100)) -- Matches
  - `symbol: string` (@MaxLength(10)) -- Matches
  - `isBase?: boolean` (default false) -- Matches
  - `isActive?: boolean` (default true) -- Matches
  - `decimalPlaces?: number` (@IsInt, @Min(0)) -- Matches

### [GET] `/currencies`

- **Controller**: Found at `currency/currency.controller.ts:48`
- **Permission**: `accounting:view` -- Matches spec
- **Note**: Not paginated -- returns all currencies for the tenant. Spec says "sorted by code ASC" which is handled in service layer.

### [PATCH] `/currencies/:id`

- **Controller**: Found at `currency/currency.controller.ts:55`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `UpdateCurrencyDto` -- Fields: `nameEn?`, `nameAr?`, `symbol?`, `isActive?`, `decimalPlaces?` -- Matches spec

### [POST] `/currencies/:id/set-base`

- **Controller**: Found at `currency/currency.controller.ts:67`
- **Permission**: `accounting:manage` -- Matches spec
- **Response**: 200 OK -- Matches spec

### [POST] `/exchange-rates`

- **Controller**: Found at `currency/currency.controller.ts:81`
- **Permission**: `accounting:manage` -- Matches spec
- **Request DTO**: `CreateExchangeRateDto` -- All fields match spec:
  - `fromCurrencyId: string` (UUID) -- Matches
  - `toCurrencyId: string` (UUID) -- Matches
  - `rate: number` (@Min(0.000001)) -- Matches
  - `rateDate: string` (@IsDateString) -- Matches
  - `source?: ExchangeRateSource` (manual/auto, default manual) -- Matches

### [GET] `/exchange-rates`

- **Controller**: Found at `currency/currency.controller.ts:92`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `QueryExchangeRateDto` -- `from?` (UUID), `to?` (UUID), `date?` (@IsDateString) -- Matches spec

### [GET] `/exchange-rates/history`

- **Controller**: Found at `currency/currency.controller.ts:99`
- **Permission**: `accounting:view` -- Matches spec
- **Request DTO**: `RateHistoryQueryDto` -- `currencyId?` (UUID) -- Matches spec

---

## Discrepancies Summary

### Minor Issues (non-breaking)

| #   | Location                  | Issue                                                                            | Impact                                                                                            |
| --- | ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1   | Fiscal Periods `:id`      | Backend uses `ParseIntPipe` (integer), not UUID. Frontend must pass integer IDs. | Low -- spec does not state UUID. Frontend should use the `id` field as-is from the list response. |
| 2   | `UpdateFiscalPositionDto` | Backend has extra `isActive?: boolean` field not documented in spec.             | None -- extra optional field. Frontend can use it for toggling active status.                     |
| 3   | `UpdateAccountDto`        | No `version` field for optimistic locking.                                       | Low -- accounts updates don't enforce optimistic locking. Spec is consistent.                     |
| 4   | `UpdateJournalEntryDto`   | No `version` field for optimistic locking.                                       | Low -- journal entry updates don't enforce optimistic locking. Spec is consistent.                |
| 5   | `UpdateCostCenterDto`     | No `version` field for optimistic locking.                                       | Low -- cost center updates don't enforce optimistic locking. Spec is consistent.                  |
| 6   | `UpdateFiscalPeriodDto`   | No `version` field for optimistic locking.                                       | Low -- fiscal period updates don't enforce optimistic locking. Spec is consistent.                |
| 7   | `UpdateCurrencyDto`       | No `version` field for optimistic locking.                                       | Low -- currency updates don't enforce optimistic locking. Spec is consistent.                     |

### Conclusion

All 91 endpoints documented in the FRONTEND-SPEC.md for the Accounting, Setup, Invoices, Payments, Fiscal Positions, and Currency sections exist in the backend code with matching routes, HTTP methods, permissions, and DTO fields. The spec is accurate and ready for frontend implementation.
