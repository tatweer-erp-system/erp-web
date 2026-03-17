# Business Rules: Sales, Purchasing, and CRM

> Reference document for Tatweer ERP backoffice frontend implementation.
> All monetary values are in SAR unless multi-currency is active. VAT rate is 15%.

---

## Table of Contents

1. [Sales Orders](#1-sales-orders)
2. [Down Payments](#2-down-payments)
3. [Purchase Orders](#3-purchase-orders)
4. [CRM (Leads and Pipeline)](#4-crm-leads-and-pipeline)
5. [Combo Products](#5-combo-products)
6. [Pricelists](#6-pricelists)
7. [Partners](#7-partners)

---

## 1. Sales Orders

### 1.1 Line Calculation Formula

All calculations are per-line, then summed for order totals.

```
subtotal     = qty * unitPrice
discount     = subtotal * discountPct / 100
taxableBase  = subtotal - discount
tax          = ROUND(taxableBase * taxRate / 100, 2)
lineTotal    = taxableBase + tax
```

Order totals are the sum of all line values. Never recalculate totals from rounded line values -- sum the raw per-line amounts, then round the final totals.

### 1.2 Order-Level Discount

- Can be percentage or fixed amount.
- Applied **proportionally** across all lines before tax calculation.
- For percentage: each line gets `lineDiscount = lineSubtotal * orderDiscountPct / 100`.
- For fixed: distribute by weight of each line's subtotal relative to the order subtotal.
  - `lineShare = fixedDiscount * (lineSubtotal / orderSubtotal)`
- Tax is always calculated **after** discount: `tax = (subtotal - discount) * taxRate / 100`.

### 1.3 Credit Limit Check

Triggered when a customer (partner) is selected on the sales order form.

**Data needed from API:**

- `partner.creditLimit` -- 0 means unlimited (no check needed)
- `partner.outstandingAR` -- current accounts receivable balance
- `orderTotal` -- computed from current SO lines

**Display logic:**

| Condition                                                               | Banner                                                                                                 | Color            | Behavior                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------- |
| `creditLimit = 0`                                                       | No banner                                                                                              | --               | Unlimited credit, skip check    |
| `outstanding + orderTotal <= creditLimit`                               | "Outstanding: {outstanding} SAR + This order: {orderTotal} SAR = {sum} SAR (Limit: {creditLimit} SAR)" | Green/neutral    | Proceed normally                |
| `outstanding + orderTotal > creditLimit` AND `creditLimitBlock = false` | Same text + "Credit limit exceeded"                                                                    | Yellow (warning) | Allow confirmation with warning |
| `outstanding + orderTotal > creditLimit` AND `creditLimitBlock = true`  | Same text + "Credit limit exceeded -- order cannot be confirmed"                                       | Red (error)      | Block confirmation button       |

- Recalculate whenever lines change (qty, price, discount) or partner changes.
- Show the banner persistently above the order lines section.

### 1.4 Pricelist Auto-Apply

When a partner with a `pricelistId` is selected:

1. Auto-set the order's pricelist to the partner's pricelist.
2. For each line, fetch the pricelist price for that product and quantity.
3. Show per-line discount info: `"List price: {listPrice} SAR, Pricelist price: {pricelistPrice} SAR (-{discountPct}%)"`.
4. Auto-fill the unit price from the pricelist.

**Manual price override:**

- User can manually change the unit price on any line.
- If the manual price differs from the pricelist price, show a warning icon next to the price field.
- Tooltip on warning icon: "Price manually overridden. Pricelist price: {pricelistPrice} SAR".

**Pricelist change:**

- When pricelist changes on the order, prompt: "Recalculate all line prices from the new pricelist?" (Yes/No).
- If Yes: recalculate all lines. If No: keep current prices (all lines will show the override warning).

### 1.5 Invoice Policy

Determined per product (`invoicePolicy` field):

| Policy           | `ordered`                                        | `delivered`                                        |
| ---------------- | ------------------------------------------------ | -------------------------------------------------- |
| When invoiceable | Immediately after SO confirmation                | Only after delivery                                |
| Invoiceable qty  | Full ordered qty                                 | Delivered qty only                                 |
| UI column        | Show "Qty to Invoice" = orderedQty - invoicedQty | Show "Qty to Invoice" = deliveredQty - invoicedQty |

- If the order has mixed products (some `ordered`, some `delivered`), each line follows its own policy.
- "Create Invoice" button is enabled only when at least one line has invoiceable qty > 0.
- Show the invoiceable qty column on all SO detail views.

### 1.6 Confirmation Rules

The "Confirm" action transitions the SO from `draft` to `confirmed`.

**Pre-confirmation checks (all must pass):**

| Check                   | Condition                                                                   | Error message                                                                    |
| ----------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| At least one line       | `lines.length >= 1`                                                         | "Sales order must have at least one line"                                        |
| Storable product stock  | For each line where `product.type = storable`: `availableQty >= orderedQty` | "Insufficient stock for {productName}: available {available}, ordered {ordered}" |
| Credit limit (blocking) | See section 1.3 -- only blocks if `creditLimitBlock = true`                 | "Credit limit exceeded"                                                          |

- If stock check fails, show all insufficient products at once (not one at a time).
- If `allowNegativeStock = true` on the warehouse, skip the stock check for storable products.

### 1.7 Cancellation Rules

The "Cancel" action transitions the SO from `confirmed` (or `draft`) to `cancelled`.

**Blocking conditions:**

| Blocker           | Condition                                               | Message                                                                                    |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Linked invoices   | Any invoice exists (draft, posted, or paid)             | "Cannot cancel: linked invoices exist ({invoiceNumbers}). Cancel or delete them first."    |
| Linked deliveries | Any delivery order exists (draft, in progress, or done) | "Cannot cancel: linked deliveries exist ({deliveryNumbers}). Cancel or return them first." |

- Show the specific invoice/delivery numbers that block cancellation.
- If no blockers exist, show confirmation dialog: "Cancel this sales order? This will void all reservations."

### 1.8 Done Status

The SO automatically transitions to `done` when **both** conditions are met:

- Fully invoiced: total invoiced amount = order total (all lines invoiceable qty = 0)
- Fully delivered: all storable product lines have deliveredQty = orderedQty

This is a system-set status -- no manual "Mark as Done" button.

### 1.9 Status Transitions

```
draft -> confirmed -> done
draft -> cancelled
confirmed -> cancelled (if no linked invoices/deliveries)
```

No other transitions are allowed. `done` and `cancelled` are terminal states.

---

## 2. Down Payments

### 2.1 Types and Validation

| Type         | Field         | Validation             | Example                         |
| ------------ | ------------- | ---------------------- | ------------------------------- |
| Percentage   | `percentage`  | Min 0.01%, max 100%    | 30% of 10,000 SAR = 3,000 SAR   |
| Fixed amount | `fixedAmount` | > 0 AND <= order total | 2,500 SAR on a 10,000 SAR order |

- Down payment can only be created on a **confirmed** sales order.
- Multiple down payments allowed on the same SO.

### 2.2 Down Payment Invoice

When a down payment is created:

1. System generates a draft invoice for the down payment amount.
2. Invoice line: "Down Payment" product (service type), qty = 1, unit price = down payment amount.
3. Tax is applied on the down payment amount at the SO's tax rate.
4. Invoice must be validated (posted) and paid separately.

### 2.3 Final Invoice Deduction

When creating the final invoice for the SO:

1. System generates normal invoice lines for all products.
2. For each previous down payment: auto-generate a **deduction line** with negative amount.
   - Line description: "Down Payment deduction (Invoice #{dpInvoiceNumber})"
   - Amount: negative of the down payment amount
3. Net invoice total = order total - sum of all down payments.

If total down payments = order total, the final invoice total will be 0 SAR (fully prepaid).

### 2.4 Down Payment History Display

Show on the SO detail page, below the order lines:

| Date       | Type  | Amount    | Invoice            | Status |
| ---------- | ----- | --------- | ------------------ | ------ |
| 2026-03-01 | 30%   | 3,000 SAR | [INV-00045] (link) | Paid   |
| 2026-03-10 | Fixed | 2,000 SAR | [INV-00052] (link) | Draft  |

- Invoice column is a clickable link to the invoice detail.
- Status reflects the invoice status: Draft, Posted, Paid.

---

## 3. Purchase Orders

### 3.1 Vendor Selection

- Partner dropdown must be filtered to `isSupplier = true` only.
- If a partner with `isSupplier = false` is somehow selected, show validation error: "Selected partner is not a supplier."

### 3.2 Supplier Price Auto-Fill

When a vendor is selected and a product is added to a PO line:

1. Check if a `supplier_products` record exists for this (vendor, product) pair.
2. If found:
   - Auto-fill `unitPrice` from the supplier product record.
   - Show info text below the price field: "Supplier price: {price} SAR (lead time: {leadTimeDays} days)".
3. If not found:
   - Leave unit price empty for manual entry.
   - No info text shown.

The auto-filled price can be manually overridden.

### 3.3 Expected Delivery Date

- Set at the order header level.
- Displayed on each PO line for planning visibility.
- Used for scheduling and supplier performance tracking.
- If not set, show "Not specified" in the field.

### 3.4 Bill Control

Determined by PO setting (`billControl`):

| Setting              | `on_order`                        | `on_receipt` (default)             |
| -------------------- | --------------------------------- | ---------------------------------- |
| When billable        | Immediately after PO confirmation | Only after goods receipt           |
| Billable qty         | Full ordered qty                  | Received qty only                  |
| "Create Bill" button | Enabled after confirmation        | Enabled only when received qty > 0 |

### 3.5 Three-Way Match Display

Show a comparison table on the PO detail page:

| Product  | PO Qty | Received Qty | Billed Qty | Match Status                    |
| -------- | ------ | ------------ | ---------- | ------------------------------- |
| Widget A | 100    | 100          | 100        | Green checkmark                 |
| Widget B | 50     | 50           | 30         | Orange warning ("Partial bill") |
| Widget C | 200    | 150          | 200        | Red X ("Billed > Received")     |

**Match status logic:**

| Condition                         | Icon            | Label                 |
| --------------------------------- | --------------- | --------------------- |
| `poQty = receivedQty = billedQty` | Green checkmark | "Full match"          |
| All three differ or partial match | Orange warning  | "Partial" with detail |
| `billedQty > receivedQty`         | Red X           | "Over-billed"         |
| `receivedQty > poQty`             | Red X           | "Over-received"       |

### 3.6 Confirmation Rules

The "Confirm" action transitions the PO from `draft` to `confirmed`.

**Pre-confirmation checks:**

| Check               | Condition                   | Error message                                |
| ------------------- | --------------------------- | -------------------------------------------- |
| At least one line   | `lines.length >= 1`         | "Purchase order must have at least one line" |
| Valid vendor        | `partner.isSupplier = true` | "Partner must be a supplier"                 |
| Positive quantities | All lines have `qty > 0`    | "All lines must have positive quantities"    |

### 3.7 Cancellation Rules

The "Cancel" action is blocked if **any** of these conditions are true:

| Blocker        | Condition                    | Message                                                                 |
| -------------- | ---------------------------- | ----------------------------------------------------------------------- |
| Goods received | `receiptStatus != 'nothing'` | "Cannot cancel: goods have been received. Create a return instead."     |
| Bills created  | `billStatus != 'nothing'`    | "Cannot cancel: bills have been created. Cancel or delete bills first." |

If no blockers, show confirmation dialog: "Cancel this purchase order?"

### 3.8 Status Transitions

```
draft -> confirmed -> done
draft -> cancelled
confirmed -> cancelled (if no receipts and no bills)
```

`done` is auto-set when fully received AND fully billed. Terminal states: `done`, `cancelled`.

---

## 4. CRM (Leads and Pipeline)

### 4.1 Pipeline Kanban View

**Column (stage) header:**

- Stage name
- Count of opportunities in stage: "(12)"
- Total weighted revenue: sum of `revenue * probability / 100` for all opportunities in the stage

**Top-level summary bar:**

- Total weighted pipeline value: sum of all stages' weighted revenue
- Format: "Weighted Pipeline: {total} SAR"

**Card content (each opportunity):**

- Partner name
- Expected revenue
- Probability percentage
- Salesperson avatar/initials
- Expected close date
- Tags/labels if any

### 4.2 Drag and Drop Between Stages

When a card is dragged from one stage to another:

1. Update the opportunity's `stageId` to the target stage.
2. Auto-update `probability` to the target stage's `defaultProbability`.
3. Recalculate column headers (counts and weighted revenue) for both source and target stages.
4. Recalculate the top-level weighted pipeline total.
5. Save immediately (optimistic update with rollback on failure).

### 4.3 Won Opportunity

Triggered by "Mark as Won" button or dragging to the "Won" stage.

**Flow:**

1. Show confirmation dialog: "Mark as won and create Sales Order?"
2. If confirmed:
   - Set opportunity status to `won` (terminal state).
   - Set probability to 100%.
   - Auto-create a **draft** Sales Order:
     - Partner: opportunity's partner
     - Lines: single line with expected revenue as the amount (editable before confirmation)
   - Navigate to the new draft SO or show a link: "Sales Order {soNumber} created".
3. If declined: no action.

**Won is terminal** -- no further stage transitions allowed. The card should be visually distinct (e.g., green background or badge).

### 4.4 Lost Opportunity

Triggered by "Mark as Lost" button.

**Flow:**

1. Show modal with:
   - Required text field: "Loss reason" (minimum 10 characters)
   - Confirmation text: "Are you sure? This action cannot be undone."
   - Cancel / Confirm buttons
2. If confirmed:
   - Set opportunity status to `lost` (terminal state).
   - Set probability to 0%.
   - Store the loss reason.
3. If declined: no action.

**Lost is terminal** -- no further stage transitions allowed. The card should be visually distinct (e.g., greyed out or red badge).

### 4.5 Convert Lead to Opportunity

Only visible when the record has `type = 'lead'`.

**Flow:**

1. Button: "Convert to Opportunity" -- only shown if `type = 'lead'`.
2. If `type = 'opportunity'`, the button must be hidden (not just disabled).
3. On click:
   - Update `type` from `lead` to `opportunity`.
   - Set `probability` based on the current stage's `defaultProbability`.
   - Optionally assign to a salesperson if not already assigned.
4. After conversion, the record appears in the pipeline kanban view.

### 4.6 Lead/Opportunity Status Transitions

```
Leads:
  new -> qualified -> converted_to_opportunity
  new -> lost

Opportunities:
  [any stage] -> won (terminal)
  [any stage] -> lost (terminal)
  [any non-terminal stage] -> [any non-terminal stage] (via drag)
```

---

## 5. Combo Products

### 5.1 Adding a Combo Product to SO

When a combo product is added to a sales order line:

1. Immediately open the **choice modal** -- do not add the line until selections are made.
2. If the user closes the modal without completing selections, do not add the line.

### 5.2 Choice Modal Layout

**Header:** Combo product name + base price ("Meal Deal -- 50 SAR")

**Body:** Groups displayed vertically, one section per group:

```
[Group Name] [Required] or [Optional]
  ( ) Item A                          +0 SAR
  (*) Item B                          +5 SAR
  ( ) Item C                          +3 SAR
```

- Required groups: must have a selection before confirming.
- Optional groups: can be left empty.
- Use radio buttons for single-choice groups, checkboxes for multi-choice (if supported).

**Footer:**

- Live price calculation: "Base: 50 SAR + Extra cheese: 5 SAR + Large drink: 3 SAR = **58 SAR**"
- "Cancel" and "Confirm" buttons.
- "Confirm" disabled until all required groups have a selection.

### 5.3 Combo Line Display in SO

After selection, the combo product appears as a **parent line** with **indented component lines** below it:

```
| # | Product              | Qty | Unit Price | Subtotal |
|---|----------------------|-----|------------|----------|
| 1 | Meal Deal (Combo)    |   1 |    58.00   |   58.00  |
|   |   > Main: Burger     |   1 |     0.00   |    0.00  |
|   |   > Side: Fries      |   1 |     0.00   |    0.00  |
|   |   > Drink: Cola (L)  |   1 |     3.00   |    3.00  |
|   |   > Extra: Cheese    |   1 |     5.00   |    5.00  |
```

**Rules:**

- Component lines are read-only -- cannot individually edit qty, price, or delete.
- To change selections: click "Edit" on the parent line to re-open the choice modal.
- Deleting the parent line removes all component lines.
- Quantity change on the parent line multiplies all component quantities proportionally.

---

## 6. Pricelists

### 6.1 Computation Types

| Type                | Field                           | Calculation                             | Example                                               |
| ------------------- | ------------------------------- | --------------------------------------- | ----------------------------------------------------- |
| Fixed price         | `fixedPrice`                    | Set a specific price                    | Product list price 100 SAR -> fixed price 80 SAR      |
| Percentage discount | `percentDiscount`               | `listPrice * (1 - pct/100)`             | 15% off -> 100 \* 0.85 = 85 SAR                       |
| Formula             | `percentDiscount` + `surcharge` | `listPrice * (1 - pct/100) + surcharge` | 10% off + 5 SAR surcharge -> 100 \* 0.90 + 5 = 95 SAR |

### 6.2 Application Scope

| Apply On         | Field                                | Behavior                                          |
| ---------------- | ------------------------------------ | ------------------------------------------------- |
| All products     | `applyOn = 'all'`                    | Rule applies to every product                     |
| Product category | `applyOn = 'category'`, `categoryId` | Applies to all products in the specified category |
| Specific product | `applyOn = 'product'`, `productId`   | Applies to one specific product only              |

### 6.3 Conditions

| Condition        | Field                  | Rule                                                                            |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Minimum quantity | `minQty`               | Pricelist item applies only if `orderLineQty >= minQty`. Default: 1             |
| Date range       | `startDate`, `endDate` | Item valid only within this date range. Both optional. If omitted, always valid |

### 6.4 Priority (Sequence)

- Each pricelist item has a `sequence` number.
- Lower sequence = higher priority.
- When multiple rules match a product, the rule with the lowest sequence wins.
- If sequences are equal, the most specific rule wins (product > category > all).

### 6.5 Price Preview

When configuring a pricelist item in the form, show a "Compute Price" preview:

```
List price:      100.00 SAR
Discount:        -15.00 SAR (15%)
Surcharge:        +5.00 SAR
--------------------------
Pricelist price:  90.00 SAR
```

Update the preview live as the user changes computation type, percentage, surcharge, or fixed price.

---

## 7. Partners

### 7.1 Partner Types

| Type         | `isCustomer`       | `isSupplier` | Usage                                        |
| ------------ | ------------------ | ------------ | -------------------------------------------- |
| `customer`   | true               | false        | Appears in SO partner dropdown               |
| `supplier`   | true (for returns) | true         | Appears in PO partner dropdown               |
| `both`       | true               | true         | Appears in both dropdowns                    |
| `individual` | true               | false        | Person (not company), appears in SO dropdown |

- `isCustomer` and `isSupplier` are auto-resolved from the `type` field -- not set directly by the user.
- Dropdowns must filter by the appropriate flag (SO: `isCustomer = true`, PO: `isSupplier = true`).

### 7.2 Credit Limit

| `creditLimit` value | Behavior                                               |
| ------------------- | ------------------------------------------------------ |
| `0` (default)       | Unlimited credit -- no check performed                 |
| `> 0`               | Enforced on SO creation/confirmation (see section 1.3) |

- Configured on the partner detail page.
- Show current outstanding AR on the partner detail page for reference.

### 7.3 Payment Terms

- Each partner can have a default `paymentTermId`.
- When creating a new invoice or bill for this partner, auto-fill the payment terms.
- User can override per document.
- Payment terms define: due days, discount days, discount percentage.

### 7.4 Fiscal Position

- Each partner can have a `fiscalPositionId`.
- Fiscal positions define tax mapping rules (e.g., replace 15% VAT with 0% for exports).
- When a partner with a fiscal position is selected on any document (SO, PO, invoice):
  - Auto-apply the fiscal position.
  - All tax calculations use the mapped tax rates from the fiscal position.
- If no fiscal position on the partner, use the default tax rates.

### 7.5 Contacts (Child Partners)

Partners can have child contacts (sub-partners):

| Field | Required | Notes                                          |
| ----- | -------- | ---------------------------------------------- |
| Name  | Yes      | Contact person name                            |
| Phone | No       | Direct phone number                            |
| Email | No       | Direct email                                   |
| Role  | No       | e.g., "Purchasing Manager", "Accounts Payable" |

- Contacts inherit the parent partner's address unless overridden.
- When selecting a partner on a document, show a secondary dropdown for contact selection (optional).
- Contacts do not have their own credit limits or payment terms -- they use the parent's.
