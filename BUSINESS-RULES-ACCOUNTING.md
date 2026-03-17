# Accounting Module -- Business Rules for Frontend

> Reference document for the `erp-backoffice` frontend team.
> Every rule here is backed by actual backend validation. The frontend must enforce these rules
> proactively (before sending to the server) to provide a good user experience.

---

## Table of Contents

1. [Journal Entries](#1-journal-entries)
2. [Invoices](#2-invoices)
3. [ZATCA E-Invoicing](#3-zatca-e-invoicing)
4. [Fiscal Positions](#4-fiscal-positions)
5. [Payment Terms](#5-payment-terms)
6. [Reconciliation](#6-reconciliation)
7. [Treasury](#7-treasury)

---

## 1. Journal Entries

### 1.1 Enums

| Enum                  | Values                                                         | Source                    |
| --------------------- | -------------------------------------------------------------- | ------------------------- |
| `JournalEntryType`    | `manual`, `auto`, `opening`, `closing`, `reversal`             | `accounting.enums.ts`     |
| `JournalEntryTypeNew` | `invoice`, `payment`, `stock`, `payroll`, `manual`, `reversal` | `accounting-new.enums.ts` |
| `JournalType`         | `sale`, `purchase`, `cash`, `bank`, `general`                  | `accounting-new.enums.ts` |
| `FiscalPeriodStatus`  | `open`, `closed`, `locked`                                     | `accounting.enums.ts`     |

### 1.2 Balance Validation (DR = CR)

- Total debits must equal total credits before an entry can be created or posted.
- Backend tolerance: `Math.abs(totalDebit - totalCredit) <= 0.01`.
- **Frontend UX:**
  - Show a running difference indicator at the bottom of the lines table: `Difference: DR - CR`.
  - Display in **red** when unbalanced (`difference !== 0`), **green** when balanced (`difference === 0`).
  - Disable the Save / Post button while unbalanced.
  - Format: `"Difference: 1,250.00 SAR (DR > CR)"` or `"Balanced"`.

### 1.3 Line-Level Rules

- Each line must have exactly one of debit or credit greater than zero -- never both, never both zero.
- **Frontend UX:**
  - When the user enters a value in the Debit field, auto-set Credit to `0.00` (and vice versa).
  - If the user clears both fields, show inline validation: "Either debit or credit is required".
- Minimum **2 lines** required per entry. Disable Save if `lines.length < 2`.

### 1.4 Account Validation on Lines

Each account referenced in a journal line must satisfy all three conditions:

| Check                  | Backend field                 | Error if violated                              |
| ---------------------- | ----------------------------- | ---------------------------------------------- |
| Account is active      | `isActive === true`           | "Account [code] is inactive"                   |
| Direct posting allowed | `allowDirectPosting === true` | "Account [code] does not allow direct posting" |
| Not deprecated         | `isDeprecated === false`      | "Account [code] is deprecated"                 |

- **Frontend:** Filter the account dropdown to only show accounts where `isActive = true`, `allowDirectPosting = true`, and `isDeprecated = false`.
- If the user pastes or selects an invalid account, show the specific error inline on that line.

### 1.5 Partner Requirement for Reconcilable Accounts (AR/AP)

- When a line uses a reconcilable account (`isReconcilable === true`), the `partnerId` field is **required**.
- **Frontend UX:**
  - When the user selects a reconcilable account, show the Partner field with a **red asterisk**.
  - If Partner is empty on a reconcilable line, show inline error: "Partner is required for reconcilable accounts".
  - Non-reconcilable accounts: Partner field is optional (no asterisk).

### 1.6 Fiscal Period Validation

- The entry date must fall within an **open** fiscal period (`status = 'open'`).
- If the period is `closed` or `locked`, the backend rejects with the period name.
- **Frontend UX:**
  - On date change, validate against known fiscal periods (fetch from `/api/v1/accounting/fiscal-periods`).
  - If the date falls in a closed/locked period, show: "Cannot post to [Period Name] -- period is [closed/locked]".
  - Optionally disable dates in closed periods on the date picker.

### 1.7 Fiscal Lock Date Validation

- The entry date must be **after** the fiscal lock date (setting key: `fiscalLockDate`).
- Backend check: `entryDate <= lockDate` rejects.
- **Frontend UX:**
  - Fetch the lock date from tenant config (`GET /api/v1/config/accounting`).
  - If `entryDate <= fiscalLockDate`, show: "Entry date [date] is on or before the fiscal lock date [lockDate]".
  - Disable dates on or before the lock date on the date picker.

### 1.8 Posted Entry Immutability

- A posted entry (`isPosted === true`) cannot be edited or deleted.
- **Frontend UX:**
  - On the detail page, if `isPosted === true`:
    - Disable all form fields.
    - Disable the Edit button; show tooltip: "Posted entries cannot be modified".
    - Disable the Delete button; show tooltip: "Posted entries cannot be deleted".
    - Show a "Reverse" button instead (creates a new reversal entry).

### 1.9 Reversal Entry

- Only posted entries can be reversed (`isPosted === true`).
- An entry already reversed (`isReversed === true` or `reversedBy !== null`) cannot be reversed again.
- The reversal creates a **new** journal entry with DR and CR swapped, linked via `reversalOf`.
- The reversal is auto-posted immediately (no draft state).
- **Frontend UX:**
  - "Reverse" button visible only on posted, non-reversed entries.
  - After reversal, show a link to the new reversal entry.
  - On the original entry, show badge: "Reversed" with a link to the reversal.
  - Reversal entry shows badge: "Reversal of [original entry number]".

### 1.10 Delete Rules

- Only **draft** entries (`isPosted === false`) can be soft-deleted.
- Posted entries must be reversed, not deleted.
- **Frontend:** Hide the Delete action on posted entries entirely or disable with tooltip.

---

## 2. Invoices

### 2.1 Enums

| Enum                   | Values                                                 | Source             |
| ---------------------- | ------------------------------------------------------ | ------------------ |
| `InvoiceTypeNew`       | `out_invoice`, `out_refund`, `in_invoice`, `in_refund` | `invoice.enums.ts` |
| `InvoiceStatusNew`     | `draft`, `posted`, `cancelled`                         | `invoice.enums.ts` |
| `InvoicePaymentStatus` | `not_paid`, `partial`, `paid`, `reversed`              | `invoice.enums.ts` |
| `PaymentTypeNew`       | `inbound`, `outbound`                                  | `invoice.enums.ts` |
| `PaymentStatusNew`     | `draft`, `posted`, `cancelled`                         | `invoice.enums.ts` |
| `EtaStatus`            | `not_submitted`, `submitted`, `accepted`, `rejected`   | `invoice.enums.ts` |

### 2.2 Status Transitions

Only these transitions are allowed:

```
draft --> posted
draft --> cancelled
posted --> cancelled  (only if no payments exist)
```

Any other transition is rejected by the backend.

### 2.3 Fiscal Period and Lock Date

Same rules as journal entries (sections 1.6 and 1.7 above):

- Cannot post an invoice if the invoice date falls in a closed/locked fiscal period.
- Cannot post an invoice if the invoice date is on or before the fiscal lock date.
- **Frontend:** Validate before sending the post request. Show the same error messages.

### 2.4 Edit / Delete Restrictions

- Only **draft** invoices can be edited or deleted.
- If `status !== 'draft'`, disable all form fields and the Edit/Delete buttons.
- Tooltip on disabled Edit button: "Only draft invoices can be edited".

### 2.5 Partner Validation

- The selected partner must be **active** (`isActive === true`).
- **Frontend:** Filter partner dropdown to active partners only. If an inactive partner is somehow selected, show: "Partner is inactive".

### 2.6 Line Totals -- Live Calculation

For each invoice line, compute and display in real-time:

```
subtotal    = quantity * unitPrice
discount    = subtotal * (discountPct / 100)
taxAmount   = ROUND((subtotal - discount) * taxRate / 100, 2)
lineTotal   = subtotal - discount + taxAmount
```

Invoice totals:

```
amountUntaxed = SUM(subtotal - discount)  across all lines
amountTax     = SUM(taxAmount)            across all lines
amountTotal   = amountUntaxed + amountTax
```

- Default VAT rate: **15%** (from tenant setting `vatRate`).
- If a line has specific `taxIds`, use those tax rates instead of the default.
- Show each component (subtotal, discount, tax, total) per line and as invoice summary.

### 2.7 Payment Registration

- Payments can only be registered on **posted** invoices (`status === 'posted'`).
- Payment amount **cannot exceed** `amountResidual` (the remaining unpaid balance).
- **Frontend UX:**
  - Show remaining balance prominently: "Amount due: [amountResidual] SAR".
  - Set the default payment amount to `amountResidual` (full payment).
  - If the user enters an amount greater than residual, show: "Payment amount [X] exceeds remaining balance [Y]".
  - Disable the Register Payment button if the invoice is fully paid (`amountResidual <= 0`).
  - After payment, update the payment status badge:
    - `not_paid` (gray) --> `partial` (orange) --> `paid` (green).

### 2.8 Credit Notes / Refunds

- Credit notes (`out_refund` / `in_refund`) must reference the original invoice via `originalInvoiceId`.
- **Frontend UX:**
  - When creating a credit note, show an "Original Invoice" selector (required field).
  - Filter to only show posted invoices of the matching type (e.g., `out_invoice` for `out_refund`).
  - The refund total **cannot exceed** the original invoice's `amountTotal`.
  - Show: "Original invoice total: [X] SAR" next to the selector.
  - If the credit note total exceeds the original, show: "Credit note amount [X] exceeds original invoice total [Y]".

### 2.9 Duplicate Vendor Bill Detection

- For `in_invoice` type, the backend checks for duplicates matching `partnerId + reference + invoiceDate`.
- **Frontend UX:**
  - When creating a vendor bill, if the user fills all three fields (partner, reference, date), optionally check for duplicates before saving.
  - If a duplicate is detected, show a **warning banner**: "A vendor bill with the same partner, reference, and date already exists. Continue anyway?"
  - The backend will reject with a `409 Conflict` if a duplicate exists.

### 2.10 Invoice Cancellation

- Cannot cancel an invoice that has linked payments.
- **Frontend UX:**
  - Before showing the Cancel confirmation dialog, check if payments exist.
  - If payments exist, show: "This invoice has [N] payment(s) totaling [X] SAR. Remove payments before cancelling."
  - Disable the Cancel button if payments exist.

### 2.11 Journal Entry Link

- Posting an invoice auto-creates a journal entry in the background.
- **Frontend UX:**
  - After posting, show a link/button: "View Journal Entry" that navigates to the associated JE.
  - The JE reference can be found via `referenceId = invoiceId` and `referenceType = 'invoice'`.

### 2.12 Journal Entry Accounting Lines (Reference)

For developer reference -- these are the journal entries created on post:

**Customer Invoice (`out_invoice`):**

```
DR  Accounts Receivable   [amountTotal]
CR  Sales Revenue          [amountUntaxed]
CR  VAT Payable            [amountTax]
```

**Customer Refund (`out_refund`):**

```
DR  Sales Revenue          [amountUntaxed]
DR  VAT Payable            [amountTax]
CR  Accounts Receivable    [amountTotal]
```

**Vendor Bill (`in_invoice`):**

```
DR  Purchases Expense      [amountUntaxed]
DR  VAT Payable            [amountTax]
CR  Accounts Payable       [amountTotal]
```

**Vendor Refund (`in_refund`):**

```
DR  Accounts Payable       [amountTotal]
CR  Purchases Expense      [amountUntaxed]
CR  VAT Payable            [amountTax]
```

---

## 3. ZATCA E-Invoicing

### 3.1 Invoice Types

| Type                         | ZATCA Category | Generated From                         |
| ---------------------------- | -------------- | -------------------------------------- |
| B2C (Simplified Tax Invoice) | Standard 15%   | POS checkout                           |
| B2B (Standard Tax Invoice)   | Standard 15%   | Sales orders / manual invoice creation |

### 3.2 Required Fields for ZATCA Submission

**Always required:**

- Seller info: name, VAT registration number, address (street, city, district, postal code, country)
- Line items: description, quantity, unit price, discount, tax category (`S` for standard), tax amount, line total
- Invoice totals: subtotal, tax total, grand total
- QR code (generated by backend after posting)

**Required for B2B only (in addition to the above):**

- Buyer info: name, VAT registration number, address

### 3.3 Submission Status Badges

| Status          | Badge Color | Description                                        |
| --------------- | ----------- | -------------------------------------------------- |
| `not_submitted` | Gray        | Invoice posted but not yet sent to ZATCA           |
| `submitted`     | Blue        | Sent to ZATCA, awaiting response                   |
| `accepted`      | Green       | ZATCA accepted the invoice                         |
| `rejected`      | Red         | ZATCA rejected -- action required                  |
| `warning`       | Orange      | ZATCA accepted with warnings -- review recommended |

- **Frontend UX:**
  - Show the ZATCA status badge on the invoice list and detail views.
  - On `rejected` status, show the rejection reason from the backend and a "Resubmit" action.
  - On `warning` status, show the warning details in a collapsible section.

### 3.4 QR Code Display

- QR code is generated by the backend after an invoice is posted and submitted to ZATCA.
- **Frontend UX:**
  - On the invoice detail page and PDF preview, display the QR code in the bottom-left area.
  - QR code is read-only -- the frontend never generates it.
  - If the QR code is not yet available (pre-submission), show: "QR code will be generated after ZATCA submission".

### 3.5 ZATCA Configuration Page

Located at: Settings > ZATCA Configuration

**Display fields (read-only after configuration):**

- Organization name
- VAT registration number
- Organization address
- CSR generation status
- Compliance check status
- Production readiness status

**Sensitive fields (write-only):**

- CSID (Cryptographic Stamp Identifier)
- Private key
- Certificate

For sensitive fields:

- On GET, the backend returns `csidConfigured: true/false` -- **never** the actual value.
- **Frontend UX:**
  - Show "Configured" with a green checkmark if `true`.
  - Show "Not configured" with a red warning if `false`.
  - Provide an "Update" button that opens a form to enter new values.
  - Never display, cache, or log the actual sensitive values.

---

## 4. Fiscal Positions

### 4.1 Auto-Apply Logic

- When a partner has a `fiscalPositionId` set, that fiscal position is automatically applied when creating a sales order or invoice for that partner.
- The fiscal position contains **tax mappings** and **account mappings**.

### 4.2 Tax Mapping

- Original tax --> Mapped tax (or removed if no destination tax).
- Example: Standard 15% VAT --> Zero-rated (0%) for export partners.
- **Frontend UX:**
  - When a fiscal position is applied on an invoice form, recalculate all line taxes using the mapped rates.
  - Show a banner at the top of the form: "Fiscal position applied: [Position Name] -- taxes have been remapped".
  - The banner should be informational (blue/info color), not a warning.

### 4.3 Account Mapping

- Original GL account --> Mapped GL account (for revenue/expense lines).
- Example: Domestic Sales Revenue --> Export Sales Revenue.
- **Frontend UX:**
  - When a fiscal position is applied, auto-update the account on each invoice line per the mapping.
  - Show the mapped account name in the line, with a tooltip: "Mapped from [Original Account] by fiscal position".

### 4.4 Manual Override

- The user can manually select or change a fiscal position on the invoice form, overriding the partner default.
- After manual change, recalculate all taxes and accounts using the new fiscal position mappings.

---

## 5. Payment Terms

### 5.1 Payment Schedule Preview

When a payment term is selected on an invoice, show a preview of the payment schedule:

**Example: "50/50 Net 30"**

```
Installment 1:  50%  =  5,700.00 SAR  -- Due: Jan 15, 2026 (invoice date)
Installment 2:  50%  =  5,700.00 SAR  -- Due: Feb 14, 2026 (30 days)
                        -----------
Total:                 11,400.00 SAR
```

### 5.2 Payment Term Line Types

| Type      | Meaning                                 |
| --------- | --------------------------------------- |
| `percent` | Percentage of the invoice total         |
| `fixed`   | Fixed SAR amount                        |
| `balance` | Remaining balance after all other lines |

### 5.3 Display Format

- Show the schedule as a timeline or table below the payment term selector.
- Each row: installment number, type (%), amount, due date.
- Calculate due dates based on the invoice date + the term's day offset.
- **Overdue highlighting:** If `dueDate < today` and the installment is unpaid, highlight the row in **red**.

### 5.4 Interaction with amountResidual

- The payment term schedule is informational only -- it does not create separate receivable records.
- The actual payment tracking is via `amountResidual` on the invoice.
- Payment term helps the user know _when_ payments are expected, not enforce them.

---

## 6. Reconciliation

### 6.1 Invoice-Level Reconciliation Icons

Show reconciliation status on invoice list and AR/AP aging reports:

| Status               | Icon               | Color  | Tooltip                                                |
| -------------------- | ------------------ | ------ | ------------------------------------------------------ |
| Fully reconciled     | Checkmark circle   | Green  | "Fully reconciled"                                     |
| Partially reconciled | Half-filled circle | Orange | "Reconciled: [X] SAR of [Y] SAR -- Remaining: [Z] SAR" |
| Unreconciled         | Empty circle       | Gray   | "Not reconciled -- click to start"                     |

- Clicking an unreconciled icon opens the reconciliation workflow.

### 6.2 Bank Reconciliation Workflow

#### Step 1: Create Reconciliation Session

- Select treasury account (bank type).
- Enter statement date, opening balance, closing balance.
- System calculates `systemBalance` (sum of all treasury transactions up to statement date).
- `difference = closingBalance - systemBalance` is displayed.

#### Step 2: Import Bank Statement (Optional)

- Upload bank statement file (CSV format supported).
- Parsed rows are displayed in a table for review.

#### Step 3: Match Transactions

- **Two-panel layout:**
  - Left panel: Bank statement lines (from imported file or manual entry).
  - Right panel: System transactions (unreconciled treasury transactions for this account).
- **Drag-and-drop matching:** Drag a bank statement line onto a system transaction to match them.
- **Click-to-select matching:** Select one or more items from each panel, then click "Match Selected".

#### Step 4: Auto-Match

- "Auto-Match" button runs the backend algorithm.
- Algorithm: exact amount match + date proximity within 3 days.
- After auto-match, display results: "Matched [X] of [Y] lines ([Z] remaining)".
- Unmatched lines remain in their respective panels for manual matching.

#### Step 5: Complete Reconciliation

- The difference must be **exactly 0** to complete.
- **Frontend UX:**
  - Show difference prominently: `"Difference: [X] SAR"`.
  - If non-zero, display in **red** and disable the "Complete" button.
  - If zero, display in **green** and enable the "Complete" button.
- A completed reconciliation cannot be re-opened or modified.

### 6.3 Reconciliation Statuses

| Status        | Badge Color | Actions Available                    |
| ------------- | ----------- | ------------------------------------ |
| `draft`       | Gray        | Edit, match, auto-match              |
| `in_progress` | Blue        | Match, unmatch, auto-match, complete |
| `completed`   | Green       | View only -- no modifications        |

---

## 7. Treasury

### 7.1 Enums

| Enum                      | Values                                                              | Source                |
| ------------------------- | ------------------------------------------------------------------- | --------------------- |
| `TreasuryAccountType`     | `cash`, `bank`                                                      | `accounting.enums.ts` |
| `TreasuryTransactionType` | `receipt`, `payment`, `transferIn`, `transferOut`, `openingBalance` | `accounting.enums.ts` |
| `ReconciliationStatus`    | `draft`, `in_progress`, `completed`                                 | `accounting.enums.ts` |

### 7.2 Transfer Between Accounts

- Source and destination **cannot be the same account**.
- **Frontend UX:**
  - When the user selects a source account, filter the destination dropdown to exclude the source.
  - If somehow the same account is selected for both, show: "Source and destination accounts must be different".
- Source account must have **sufficient balance** for the transfer amount.
  - Show current balance next to the source account: "Balance: [X] SAR".
  - If amount exceeds balance, show: "Insufficient balance. Available: [X] SAR, Requested: [Y] SAR".
- Cross-currency transfers are supported: the system converts via base currency (SAR) automatically.
  - Show the converted amount in the destination currency: "Destination receives: [Y] [currency]".

### 7.3 Opening Balance

- Only **one** opening balance transaction is allowed per treasury account.
- **Frontend UX:**
  - If the account already has an opening balance, hide or disable the "Set Opening Balance" action.
  - Show the existing opening balance on the account detail page.

### 7.4 Account Statement with Running Balance

The statement view shows a chronological list of transactions with a running balance:

```
Date        | Description          | Debit    | Credit   | Balance
------------|----------------------|----------|----------|----------
Jan 01      | Opening Balance      |          | 50,000   | 50,000
Jan 05      | Receipt - INV-001    |          | 12,000   | 62,000
Jan 10      | Payment - PO-003     | 8,500    |          | 53,500
Jan 15      | Transfer Out         | 5,000    |          | 48,500
```

- **Credit types** (increase balance): `receipt`, `transferIn`, `openingBalance`.
- **Debit types** (decrease balance): `payment`, `transferOut`.
- Running balance is computed server-side using a window function.
- Show opening balance as the first row, closing balance as the last row.

### 7.5 Cash Float Management (for Cash Accounts)

For POS-linked cash treasury accounts, the cash float workflow:

1. **Opening float:** Set the starting cash amount at the beginning of a session.
2. **Transactions:** Receipts and payments during the session.
3. **Expected closing:** `opening float + receipts - payments`.
4. **Actual closing:** The cashier counts and enters the actual cash amount.
5. **Difference:** `actual closing - expected closing`.
   - Positive difference: cash over (show in blue).
   - Negative difference: cash short (show in red).
   - Zero: exact match (show in green).

### 7.6 Payment-Treasury Integration

- When a payment is posted and has a `treasuryAccountId`, a treasury transaction is automatically created.
- The treasury account balance is updated atomically.
- For outbound payments, the system checks sufficient balance before proceeding.
- **Frontend UX:**
  - On the payment form, the Treasury Account field is optional.
  - If selected, show the current balance of the chosen treasury account.
  - After posting, a link to the treasury transaction appears on the payment detail page.

### 7.7 Journal Entry Auto-Posting

- Treasury receipts and payments (except opening balance) auto-post a journal entry.
- Transfers create a journal entry for the debit side.
- This is fire-and-forget on the backend -- if the JE posting fails, the treasury transaction still succeeds.
- **Frontend:** Show a "View Journal Entry" link on the transaction detail if `journalEntryId` is populated.

---

## Appendix A: Shared Validation Rules

These rules apply across all accounting sub-modules:

| Rule                           | Applies To            | Frontend Action                                         |
| ------------------------------ | --------------------- | ------------------------------------------------------- |
| Fiscal period must be open     | JE post, Invoice post | Validate date before submit                             |
| Fiscal lock date respected     | JE post, JE reverse   | Disable dates on/before lock date                       |
| Amounts rounded to 2 decimals  | All monetary fields   | `Math.round(value * 100) / 100`                         |
| Base currency is SAR           | All conversions       | Display base amount alongside foreign                   |
| Optimistic locking (`version`) | All updates           | Send `version` from last fetch, handle 409 Conflict     |
| Soft delete (paranoid)         | All entities          | Deleted items disappear from lists, restorable by admin |

## Appendix B: Settings Keys Reference

These tenant settings are used by the accounting module:

| Key                     | Type            | Default            | Used By                         |
| ----------------------- | --------------- | ------------------ | ------------------------------- |
| `fiscalLockDate`        | `string (date)` | `null`             | JE post, JE reverse             |
| `fiscalYearStartMonth`  | `number`        | `1` (January)      | Fiscal period generation        |
| `vatRate`               | `number`        | `15`               | Invoice line tax calculation    |
| `coaCash`               | `UUID`          | Set by provisioner | Payment JE posting              |
| `coaSalesRevenue`       | `UUID`          | Set by provisioner | Customer invoice JE             |
| `coaPurchasesExpense`   | `UUID`          | Set by provisioner | Vendor bill JE                  |
| `coaAccountsReceivable` | `UUID`          | Set by provisioner | Customer invoice/payment JE     |
| `coaAccountsPayable`    | `UUID`          | Set by provisioner | Vendor bill/payment JE          |
| `coaVatPayable`         | `UUID`          | Set by provisioner | Tax line in invoice JE          |
| `defaultCurrency`       | `string`        | `SAR`              | Default currency on new records |

## Appendix C: API Endpoints Reference

| Endpoint                                          | Method | Description                         |
| ------------------------------------------------- | ------ | ----------------------------------- |
| `/api/v1/accounting/journal-entries`              | GET    | List journal entries (paginated)    |
| `/api/v1/accounting/journal-entries`              | POST   | Create draft journal entry          |
| `/api/v1/accounting/journal-entries/:id`          | GET    | Get journal entry with lines        |
| `/api/v1/accounting/journal-entries/:id`          | PUT    | Update draft journal entry          |
| `/api/v1/accounting/journal-entries/:id/post`     | POST   | Post a draft entry                  |
| `/api/v1/accounting/journal-entries/:id/reverse`  | POST   | Reverse a posted entry              |
| `/api/v1/accounting/journal-entries/:id`          | DELETE | Soft-delete a draft entry           |
| `/api/v1/accounting/fiscal-periods`               | GET    | List fiscal periods                 |
| `/api/v1/accounting/accounts`                     | GET    | List chart of accounts              |
| `/api/v1/invoices`                                | GET    | List invoices (filterable)          |
| `/api/v1/invoices`                                | POST   | Create draft invoice                |
| `/api/v1/invoices/:id`                            | GET    | Get invoice with lines              |
| `/api/v1/invoices/:id`                            | PUT    | Update draft invoice                |
| `/api/v1/invoices/:id/post`                       | POST   | Post a draft invoice                |
| `/api/v1/invoices/:id/cancel`                     | POST   | Cancel an invoice                   |
| `/api/v1/invoices/:id/register-payment`           | POST   | Register payment on invoice         |
| `/api/v1/treasury/accounts`                       | GET    | List treasury accounts              |
| `/api/v1/treasury/accounts/:id/transactions`      | GET    | List transactions for account       |
| `/api/v1/treasury/accounts/:id/statement`         | GET    | Statement with running balance      |
| `/api/v1/treasury/transactions`                   | POST   | Create treasury transaction         |
| `/api/v1/treasury/transfers`                      | POST   | Transfer between accounts           |
| `/api/v1/treasury/reconciliations`                | GET    | List reconciliation sessions        |
| `/api/v1/treasury/reconciliations`                | POST   | Create reconciliation session       |
| `/api/v1/treasury/reconciliations/:id/match`      | POST   | Match transactions                  |
| `/api/v1/treasury/reconciliations/:id/unmatch`    | POST   | Unmatch transactions                |
| `/api/v1/treasury/reconciliations/:id/auto-match` | POST   | Auto-match bank statement           |
| `/api/v1/treasury/reconciliations/:id/complete`   | POST   | Complete reconciliation             |
| `/api/v1/config/accounting`                       | GET    | Get accounting settings             |
| `/api/v1/config/zatca`                            | GET    | Get ZATCA config (sensitive masked) |
| `/api/v1/config/zatca`                            | PUT    | Update ZATCA config                 |
