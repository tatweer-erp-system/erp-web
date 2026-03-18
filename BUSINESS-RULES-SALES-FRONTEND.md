# Business Rules: Sales Orders — Frontend Reference

> Extracted from the backend `SalesOrdersService`, DTOs, entities, enums, and error messages.
> Every `throw`, `if` check, and validation in the backend is documented here for frontend implementation.

---

## Table of Contents

1. [Enums and Constants](#enums-and-constants)
2. [POST /sales/orders — Create Draft](#post-salesorders--create-draft)
3. [GET /sales/orders — List](#get-salesorders--list)
4. [GET /sales/orders/:id — Get Detail](#get-salesordersid--get-detail)
5. [GET /sales/orders/reports/summary — Report](#get-salesordersreportssummary--report)
6. [PUT /sales/orders/:id — Update Draft](#put-salesordersid--update-draft)
7. [POST /sales/orders/:id/confirm — Confirm](#post-salesordersidconfirm--confirm)
8. [POST /sales/orders/:id/create-invoice — Create Invoice](#post-salesordersidcreate-invoice--create-invoice)
9. [POST /sales/orders/:id/create-delivery — Create Delivery](#post-salesordersidcreate-delivery--create-delivery)
10. [POST /sales/orders/:id/cancel — Cancel](#post-salesordersidcancel--cancel)
11. [DELETE /sales/orders/:id — Soft Delete](#delete-salesordersid--soft-delete)
12. [POST /sales/orders/:id/lines — Add Line](#post-salesordersidlines--add-line)
13. [PUT /sales/orders/:id/lines/:lineId — Update Line](#put-salesordersidlineslineid--update-line)
14. [DELETE /sales/orders/:id/lines/:lineId — Remove Line](#delete-salesordersidlineslineid--remove-line)
15. [Status Transitions](#status-transitions)
16. [Calculation Formulas](#calculation-formulas)
17. [Settings That Affect Behavior](#settings-that-affect-behavior)
18. [Permissions Matrix](#permissions-matrix)
19. [Entity Fields Reference](#entity-fields-reference)

---

## Enums and Constants

### SalesOrderStatus

```typescript
enum SalesOrderStatus {
  DRAFT = "draft",
  CONFIRMED = "confirmed",
  DONE = "done",
  CANCELLED = "cancelled",
}
```

### SalesOrderInvoiceStatus

```typescript
enum SalesOrderInvoiceStatus {
  NOTHING = "nothing",
  TO_INVOICE = "to_invoice",
  INVOICED = "invoiced",
}
```

### SalesOrderDeliveryStatus

```typescript
enum SalesOrderDeliveryStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  DONE = "done",
}
```

### SalesDiscountType

```typescript
enum SalesDiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}
```

### CreateInvoiceType

```typescript
enum CreateInvoiceType {
  REGULAR = "regular",
  DOWN_PAYMENT_PERCENTAGE = "down_payment_percentage",
  DOWN_PAYMENT_FIXED = "down_payment_fixed",
}
```

### Constants

- **Default VAT rate**: `15` (hardcoded as `VAT_RATE` in the service)
- **Default exchange rate**: `1` (set on create, locked on confirm)

---

## POST /sales/orders -- Create Draft

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] `partnerId` is required (UUID) -- form must not submit without it
- [ ] `lines` array must have at least 1 item (`@ArrayMinSize(1)`)
- [ ] Each line must have `productId` (UUID, required)
- [ ] Each line must have `quantity >= 0.001` (up to 3 decimal places)
- [ ] Each line must have `unitPrice >= 0` (up to 2 decimal places)
- [ ] Each line `discountPct` must be between 0 and 100 (optional, defaults to 0)
- [ ] Each line `taxRate` must be >= 0 (optional, defaults to 15)
- [ ] If `discountType` is provided, it must be `'percentage'` or `'fixed'`
- [ ] If `discountValue` is provided, it must be >= 0

### Warnings (show but allow)

- [ ] No warnings defined -- all checks are hard blocks

### Blocks (show error, prevent submission)

- [ ] Partner not found: `"Partner {id} not found"` (404)
- [ ] Empty lines array: blocked by DTO validation before reaching service

### Side effects after success

- Order is created with `status = 'draft'`, `invoiceStatus = 'nothing'`, `deliveryStatus = 'pending'`
- An `orderNumber` is auto-generated via sequences (format: `SO-BRANCHCODE-PADDED`)
- Currency defaults to tenant base currency (SAR) if not provided
- Pricelist resolves from: DTO value -> partner's default pricelist -> null
- Payment term resolves from: DTO value -> partner's default payment term -> null
- Fiscal position resolves from: DTO value -> partner's default fiscal position -> null
- Pricelist prices are auto-applied to lines (unit price may change from what the user entered if pricelist is active)
- Outbox event `sales_order.created` is emitted
- Returns the full order with lines

### DTO shape

```typescript
{
  partnerId: string;           // required
  branchId?: string;           // optional, for sequence scoping
  currencyId?: string;         // defaults to base currency
  pricelistId?: string;        // overrides partner default
  paymentTermId?: string;      // overrides partner default
  salespersonId?: string;
  fiscalPositionId?: string;   // overrides partner default
  notes?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;      // >= 0
  lines: CreateSalesOrderLineDto[];
}
```

---

## GET /sales/orders -- List

**Permission required:** `sales:view`

### Query parameters

Standard `PaginationDto`:

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional, searches across fields)
- `sortOrder` (default: `'DESC'`)

### Response shape

```typescript
{
  data: SalesOrder[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}
```

---

## GET /sales/orders/:id -- Get Detail

**Permission required:** `sales:view`

### Blocks

- [ ] Order not found: `"Sales order {id} not found"` (404)

### Response

Returns the order object with all fields plus a `lines` array containing all active order lines.

---

## GET /sales/orders/reports/summary -- Report

**Permission required:** `sales:view`

### Query parameters

```typescript
{
  dateFrom?: string;  // ISO date
  dateTo?: string;    // ISO date
  branchId?: string;  // UUID
  format?: 'pdf' | 'xlsx';  // optional export format
}
```

### Response

- No `format` param: returns JSON with `{ totalOrders, totalAmount, avgOrderValue, byStatus[] }`
- `format=pdf`: returns PDF binary download (`sales-summary-YYYY-MM-DD.pdf`)
- `format=xlsx`: returns Excel binary download (`sales-summary-YYYY-MM-DD.xlsx`)

---

## PUT /sales/orders/:id -- Update Draft

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] `version` is required (integer >= 0) -- must send back the version read from GET
- [ ] Order must be in `draft` status -- disable edit UI for non-draft orders
- [ ] If `lines` provided, must have at least 1 item (`@ArrayMinSize(1)`)
- [ ] All line validations same as create (see above)
- [ ] If `discountType` provided, must be `'percentage'` or `'fixed'`
- [ ] If `discountValue` provided, must be >= 0

### Blocks (show error, prevent submission)

- [ ] Order not found: `"Sales order {id} not found"` (404)
- [ ] Not draft: `"Sales order "{id}" can only be edited in draft status"` (400)
- [ ] Version conflict: `"Version conflict: expected {sent}, but record is at version {actual}"` (409) -- **prompt user to refresh and retry**

### Side effects after success

- If `lines` is provided, **all existing lines are deleted and replaced** with the new set -- this is a full replace, not a merge
- Order totals (subtotal, discountAmount, taxAmount, totalAmount, totalAmountBase) are recalculated from new lines
- Pricelist and fiscal position are re-applied to lines
- `version` is incremented by 1
- Returns the full order with lines

### DTO shape

```typescript
{
  version: number;               // required, optimistic locking
  partnerId?: string;
  pricelistId?: string;
  paymentTermId?: string;
  salespersonId?: string;
  fiscalPositionId?: string;
  notes?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  lines?: CreateSalesOrderLineDto[];  // replaces ALL lines if provided
}
```

### Important UX note

When sending `lines`, the backend deletes all old lines and inserts new ones. The frontend should always send the complete lines array, not a partial diff. If the user only changes a header field (e.g., `notes`), omit `lines` to keep existing lines unchanged.

---

## POST /sales/orders/:id/confirm -- Confirm

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` status (status transition: draft -> confirmed)
- [ ] Order must have at least 1 line -- check locally before calling

### Blocks (show error, prevent submission)

- [ ] Invalid status transition: thrown by `StatusTransitionSharedService.validateOrThrow()` if current status is not `draft` -- message: transition not allowed
- [ ] No lines: `"Sales order "{id}" has no lines -- cannot confirm"` (400)
- [ ] Insufficient stock for storable products: `"Cannot reserve "{productName}" -- available: {available}, requested: {requested}"` (400) -- **show per-product, one error per insufficient product**

### Stock check logic (for understanding, done server-side)

For each line where the product has `productType = 'storable'`:

1. Looks up stock at the **default warehouse** for the tenant
2. `available = currentQuantity - reservedQuantity`
3. If `line.quantity > available` --> throw error with product name, available, and requested amounts
4. Check happens for ALL storable lines before any reservation -- if ANY fails, no stock is reserved

### Side effects after success

- Status changes to `confirmed`
- `invoiceStatus` changes to `to_invoice`
- `confirmedAt` is set to current timestamp
- Exchange rate is locked at confirmation time (if currency differs from base, rate is fetched and stored)
- `totalAmountBase` is recalculated using the locked exchange rate
- All line `lineTotalBase` values are recalculated
- Stock is reserved for all storable product lines
- Outbox event `sales_order.confirmed` is emitted
- `version` incremented
- Returns the full updated order

---

## POST /sales/orders/:id/create-invoice -- Create Invoice

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] `type` is required: `'regular'` | `'down_payment_percentage'` | `'down_payment_fixed'`
- [ ] Order must be in `confirmed` or `done` status
- [ ] For `down_payment_percentage`: `value` must be between 0.01 and 100
- [ ] For `down_payment_fixed`: `value` must be > 0 and <= order's `totalAmount`

### Blocks (show error, prevent submission)

- [ ] Not confirmed: `"Sales order "{id}" must be confirmed before creating invoices or deliveries"` (400)
- [ ] Down payment percentage out of range: `"Down payment percentage must be between 0.01 and 100"` (400)
- [ ] Down payment fixed out of range: `"Down payment amount must be between 0 and the order total"` (400)
- [ ] Unknown type: `"Unknown invoice creation type: {type}"` (400)

### Side effects after success

**Regular invoice:**

- Creates an `out_invoice` with all SO lines mapped to invoice lines
- Invoice inherits: branchId, partnerId, currencyId, exchangeRate, fiscalPositionId from SO
- SO's `invoiceStatus` is refreshed (becomes `invoiced` when at least 1 invoice exists)
- May trigger auto-transition to `done` status (if also fully delivered)

**Down payment invoice:**

- Creates an `out_invoice` with a single line: description = `"Down payment for SO {orderNumber}"`, qty = 1, unitPrice = computed amount
- Down payment amount for percentage: `ROUND(totalAmount * percentage) / 100`
- Down payment amount for fixed: the exact value provided
- A `down_payment` record is created linking the invoice to the SO
- SO's `invoiceStatus` is refreshed

### DTO shape

```typescript
{
  type: 'regular' | 'down_payment_percentage' | 'down_payment_fixed';
  value?: number;  // required for down payment types, @Min(0.01)
}
```

---

## POST /sales/orders/:id/create-delivery -- Create Delivery

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `confirmed` or `done` status
- [ ] Order must have at least one line with remaining quantity to deliver (`quantity - qtyDelivered > 0`)

### Blocks (show error, prevent submission)

- [ ] Not confirmed: `"Sales order "{id}" must be confirmed before creating invoices or deliveries"` (400)
- [ ] No lines remaining: `"No lines remaining to deliver"` (400)

### Side effects after success

- Creates a delivery order with lines for all SO lines that have remaining quantity
- Delivery line `qtyDemand = line.quantity - line.qtyDelivered`, `qtyDone = 0`
- SO's `deliveryStatus` is refreshed (becomes `partial` or `done`)
- May trigger auto-transition to `done` status (if also fully invoiced)
- Returns the created delivery

---

## POST /sales/orders/:id/cancel -- Cancel

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` or `confirmed` status (UI should hide/disable cancel for `done` or `cancelled`)

### Blocks (show error, prevent submission)

- [ ] Invalid status transition: thrown if current status is not `draft` or `confirmed`
- [ ] Linked invoices exist: `"Sales order "{id}" has linked invoices -- cannot cancel"` (400)
- [ ] Linked deliveries exist: `"Sales order "{id}" has linked deliveries -- cannot cancel"` (400)

### Side effects after success

- Status changes to `cancelled`
- If order was `confirmed`, all stock reservations for storable products are released
- Outbox event `sales_order.cancelled` is emitted
- `version` incremented
- Returns the full updated order

### UX recommendation

Show a confirmation dialog: "Cancel this sales order? Stock reservations will be released." before calling the API.

---

## DELETE /sales/orders/:id -- Soft Delete

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` status -- hide delete button for non-draft orders

### Blocks (show error, prevent submission)

- [ ] Order not found: `"Sales order {id} not found"` (404)
- [ ] Not draft: `"Sales order "{id}" can only be deleted in draft status"` (400)

### Side effects after success

- Soft-deletes the order (sets `deletedAt`)
- No return body expected (void)
- Navigate back to list after success

---

## POST /sales/orders/:id/lines -- Add Line

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` status
- [ ] `productId` is required (UUID)
- [ ] `quantity >= 0.001` (up to 3 decimal places)
- [ ] `unitPrice >= 0` (up to 2 decimal places)
- [ ] `discountPct` between 0 and 100 if provided
- [ ] `taxRate >= 0` if provided

### Blocks (show error, prevent submission)

- [ ] Order not found: (404)
- [ ] Not draft: `"Sales order "{id}" can only be edited in draft status"` (400)

### Side effects after success

- New line is inserted with calculated discountAmount, taxAmount, lineTotal
- If product has a `nameEn`, it is used as the line description when no description is provided
- Order totals are recalculated from all lines
- `version` on the order is incremented
- Returns the full order with all lines

---

## PUT /sales/orders/:id/lines/:lineId -- Update Line

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` status
- [ ] `version` is required (line version for optimistic locking)
- [ ] `quantity >= 0.001` if provided
- [ ] `unitPrice >= 0` if provided
- [ ] `discountPct` between 0 and 100 if provided
- [ ] `taxRate >= 0` if provided

### Blocks (show error, prevent submission)

- [ ] Order not found: (404)
- [ ] Not draft: `"Sales order "{id}" can only be edited in draft status"` (400)
- [ ] Line not found or does not belong to order: `"{entity} not found with ID "{id}""` (404)
- [ ] Version conflict: `"Version conflict: expected {sent}, but record is at version {actual}"` (409)

### Side effects after success

- Line is recalculated with merged values (missing fields keep existing values)
- Order totals are recalculated
- Line `version` and order `version` are both incremented
- Returns the full order with all lines

### DTO shape

```typescript
{
  version: number;          // required
  quantity?: number;        // >= 0.001
  unitPrice?: number;       // >= 0
  discountPct?: number;     // 0-100
  taxRate?: number;         // >= 0
  description?: string;
}
```

---

## DELETE /sales/orders/:id/lines/:lineId -- Remove Line

**Permission required:** `sales:manage`

### Pre-flight checks (validate before API call)

- [ ] Order must be in `draft` status

### Blocks (show error, prevent submission)

- [ ] Order not found: (404)
- [ ] Not draft: `"Sales order "{id}" can only be edited in draft status"` (400)
- [ ] Line not found or does not belong to order: (404)

### Side effects after success

- Line is soft-deleted (sets `deletedAt`)
- Order totals are recalculated
- Order `version` is incremented
- Returns the full order with remaining lines

---

## Status Transitions

```
draft -----> confirmed -----> done (auto)
  |              |
  v              v
cancelled    cancelled (only if no linked invoices/deliveries)
```

### Registered transitions in the backend

| From                   | To          | Trigger                                                       |
| ---------------------- | ----------- | ------------------------------------------------------------- |
| `draft`                | `confirmed` | `POST /:id/confirm`                                           |
| `confirmed`            | `done`      | Auto: when `invoiceStatus=invoiced` AND `deliveryStatus=done` |
| `draft` or `confirmed` | `cancelled` | `POST /:id/cancel`                                            |

### Terminal states

- `done` -- no further transitions possible
- `cancelled` -- no further transitions possible

### Sub-status transitions

**Invoice status** (`invoiceStatus`):

- `nothing` -- initial (draft order)
- `to_invoice` -- set when order is confirmed
- `invoiced` -- set when at least 1 linked invoice exists

**Delivery status** (`deliveryStatus`):

- `pending` -- initial
- `partial` -- set when some deliveries exist but not all are done
- `done` -- set when all linked deliveries are marked done

### Auto-done check

After every invoice creation or delivery creation/update, the backend checks:

```
if (invoiceStatus === 'invoiced' AND deliveryStatus === 'done') {
  status = 'done'
}
```

This only applies to orders in `confirmed` status.

---

## Calculation Formulas

### Per-line calculation

```
lineSubtotal   = quantity * unitPrice
discountAmount = ROUND(lineSubtotal * discountPct / 100, 2)
taxableAmount  = lineSubtotal - discountAmount
taxAmount      = ROUND(taxableAmount * taxRate / 100, 2)
lineTotal      = ROUND((taxableAmount + taxAmount) * 100) / 100
```

### Order-level discount (applied after line discounts, before tax)

```
if discountType === 'percentage':
  orderDiscountAmount = ROUND(subtotal * discountValue / 100, 2)
if discountType === 'fixed':
  orderDiscountAmount = discountValue
```

### Order totals

```
subtotal      = SUM(each line's quantity * unitPrice)
totalDiscount = SUM(each line's discountAmount) + orderDiscountAmount
totalTax      = SUM(each line's taxAmount)
grandTotal    = MAX(0, subtotal - totalDiscount + totalTax)
```

### Important rounding notes

- All rounding uses `Math.round(value * 100) / 100` (standard banker's rounding to 2 decimal places)
- Tax is **always** calculated after discount: `tax = (subtotal - discount) * taxRate / 100`
- `grandTotal` is floored at 0 -- never negative

### Multi-currency at confirmation

```
if currencyId !== baseCurrencyId:
  exchangeRate = getRate(currencyId, baseCurrencyId)
  totalAmountBase = convert(totalAmount, exchangeRate)
  each line: lineTotalBase = convert(lineTotal, exchangeRate)
```

---

## Settings That Affect Behavior

| Setting Key                                                | Where Used      | Effect                                                                  |
| ---------------------------------------------------------- | --------------- | ----------------------------------------------------------------------- |
| Base currency (via `CurrencyService`)                      | Create, Confirm | Defaults `currencyId` to base currency; determines exchange rate lookup |
| Default warehouse (via `WarehousesRepository.findDefault`) | Confirm, Cancel | Used for stock reservation/release -- **error if no default warehouse** |
| Partner `pricelistId`                                      | Create          | Fallback pricelist when not specified on order                          |
| Partner `paymentTermId`                                    | Create          | Fallback payment term when not specified on order                       |
| Partner `fiscalPositionId`                                 | Create          | Fallback fiscal position when not specified on order                    |

### No direct `tenant_settings` reads in the sales service

The sales service does not read `allowNegativeStock` or `creditLimitBlock` from settings. Stock checks are done via `InventorySharedService` which may internally check these. Credit limit checks are NOT implemented in the current backend service code (despite being documented in BUSINESS-RULES-SALES-PURCHASING.md as a business requirement).

---

## Permissions Matrix

| Action                 | Endpoint                                 | Permission     |
| ---------------------- | ---------------------------------------- | -------------- |
| List orders            | `GET /sales/orders`                      | `sales:view`   |
| View order detail      | `GET /sales/orders/:id`                  | `sales:view`   |
| View sales summary     | `GET /sales/orders/reports/summary`      | `sales:view`   |
| Create draft order     | `POST /sales/orders`                     | `sales:manage` |
| Update draft order     | `PUT /sales/orders/:id`                  | `sales:manage` |
| Confirm order          | `POST /sales/orders/:id/confirm`         | `sales:manage` |
| Create invoice         | `POST /sales/orders/:id/create-invoice`  | `sales:manage` |
| Create delivery        | `POST /sales/orders/:id/create-delivery` | `sales:manage` |
| Cancel order           | `POST /sales/orders/:id/cancel`          | `sales:manage` |
| Delete draft order     | `DELETE /sales/orders/:id`               | `sales:manage` |
| Add line to draft      | `POST /sales/orders/:id/lines`           | `sales:manage` |
| Update line on draft   | `PUT /sales/orders/:id/lines/:lineId`    | `sales:manage` |
| Remove line from draft | `DELETE /sales/orders/:id/lines/:lineId` | `sales:manage` |

### Feature gate

All endpoints are gated by `@ModuleFeature('sales')` -- the tenant must have the `sales` module enabled.

---

## Entity Fields Reference

### SalesOrder

| Field              | Type          | Default        | Notes                               |
| ------------------ | ------------- | -------------- | ----------------------------------- |
| `id`               | UUID          | auto (uuidv7)  |                                     |
| `orderNumber`      | string(50)    | auto-generated | Unique, via SequencesService        |
| `partnerId`        | UUID          | null           | FK to partners                      |
| `branchId`         | UUID          | null           | FK to branches                      |
| `pricelistId`      | UUID          | null           | FK to pricelists                    |
| `paymentTermId`    | UUID          | null           | FK to payment_terms                 |
| `salespersonId`    | UUID          | null           | FK to users                         |
| `fiscalPositionId` | UUID          | null           | FK to fiscal_positions              |
| `subtotal`         | decimal(14,2) | 0              | Sum of line subtotals               |
| `discountAmount`   | decimal(14,2) | 0              | Total discount (line + order level) |
| `taxAmount`        | decimal(14,2) | 0              | Total tax                           |
| `totalAmount`      | decimal(14,2) | 0              | Grand total                         |
| `currencyId`       | UUID          | null           | FK to currencies                    |
| `exchangeRate`     | decimal(15,6) | 1              | Locked at confirmation              |
| `totalAmountBase`  | decimal(15,2) | null           | In base currency (SAR)              |
| `discountType`     | string(20)    | null           | `'percentage'` or `'fixed'`         |
| `discountValue`    | decimal(15,2) | null           | Raw discount value                  |
| `status`           | string(20)    | `'draft'`      | SalesOrderStatus enum               |
| `invoiceStatus`    | string(20)    | `'nothing'`    | SalesOrderInvoiceStatus enum        |
| `deliveryStatus`   | string(20)    | `'pending'`    | SalesOrderDeliveryStatus enum       |
| `notes`            | text          | null           | User-facing notes                   |
| `internalNotes`    | text          | null           | Internal notes (not on DTO)         |
| `confirmedAt`      | timestamp     | null           | Set when confirmed                  |
| `createdAt`        | timestamp     | auto           |                                     |
| `updatedAt`        | timestamp     | auto           |                                     |
| `deletedAt`        | timestamp     | null           | Soft delete                         |
| `createdBy`        | UUID          | null           |                                     |
| `updatedBy`        | UUID          | null           |                                     |
| `version`          | integer       | 0              | Optimistic locking                  |
| `tenantId`         | UUID          | required       |                                     |

### SalesOrderLine

| Field               | Type          | Default       | Notes                                           |
| ------------------- | ------------- | ------------- | ----------------------------------------------- |
| `id`                | UUID          | auto (uuidv7) |                                                 |
| `orderId`           | UUID          | required      | FK to sales_orders                              |
| `productId`         | UUID          | null          | FK to products                                  |
| `productVariantId`  | UUID          | null          | FK to product_variants                          |
| `description`       | text          | required      | Auto-filled from product.nameEn if not provided |
| `quantity`          | decimal(12,3) | required      | Min 0.001                                       |
| `unitPrice`         | decimal(12,2) | required      | Min 0                                           |
| `discountPct`       | decimal(5,2)  | 0             | 0-100                                           |
| `discountAmount`    | decimal(14,2) | 0             | Calculated                                      |
| `taxRate`           | decimal(5,2)  | 15            | Default 15% VAT                                 |
| `taxAmount`         | decimal(14,2) | 0             | Calculated                                      |
| `lineTotal`         | decimal(14,2) | 0             | Calculated                                      |
| `currencyId`        | UUID          | null          | Inherited from order                            |
| `lineTotalBase`     | decimal(15,2) | null          | In base currency                                |
| `qtyDelivered`      | decimal(12,3) | 0             | Updated by delivery module                      |
| `qtyInvoiced`       | decimal(12,3) | 0             | Updated by invoice module                       |
| `isComboParent`     | boolean       | false         | For combo/bundle products                       |
| `comboParentLineId` | UUID          | null          | FK to parent combo line                         |
| `sequence`          | integer       | 0             | Display order                                   |
| `version`           | integer       | 0             | Optimistic locking                              |

---

## Error Messages Reference (bilingual)

| Error Key                       | English                                                                     | Arabic                                                              |
| ------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `SALES_ORDER_NOT_FOUND`         | Sales order {id} not found                                                  | امر البيع {id} غير موجود                                            |
| `SALES_ORDER_DRAFT_ONLY_EDIT`   | Sales order "{id}" can only be edited in draft status                       | امر البيع "{id}" يمكن تعديله فقط في حالة المسودة                    |
| `SALES_ORDER_DRAFT_ONLY_DELETE` | Sales order "{id}" can only be deleted in draft status                      | امر البيع "{id}" يمكن حذفه فقط في حالة المسودة                      |
| `SALES_ORDER_NO_LINES`          | Sales order "{id}" has no lines -- cannot confirm                           | امر البيع "{id}" لا يحتوي على بنود -- لا يمكن التاكيد               |
| `SALES_ORDER_HAS_INVOICES`      | Sales order "{id}" has linked invoices -- cannot cancel                     | امر البيع "{id}" مرتبط بفواتير -- لا يمكن الالغاء                   |
| `SALES_ORDER_HAS_DELIVERIES`    | Sales order "{id}" has linked deliveries -- cannot cancel                   | امر البيع "{id}" مرتبط بتسليمات -- لا يمكن الالغاء                  |
| `SALES_ORDER_NOT_CONFIRMED`     | Sales order "{id}" must be confirmed before creating invoices or deliveries | امر البيع "{id}" يجب تاكيده قبل انشاء فواتير او تسليمات             |
| `STOCK_RESERVATION_FAILED`      | Cannot reserve "{name}" -- available: {available}, requested: {requested}   | لا يمكن حجز "{name}" -- المتاح: {available}، المطلوب: {requested}   |
| `VERSION_CONFLICT`              | Version conflict: expected {expected}, but record is at version {actual}    | تعارض في الاصدار: المتوقع {expected}، لكن السجل في الاصدار {actual} |
| `PARTNER_NOT_FOUND`             | Partner {id} not found                                                      | الشريك {id} غير موجود                                               |
| `NOT_FOUND`                     | {entity} not found with ID "{id}"                                           | {entity} غير موجود بالمعرف "{id}"                                   |

---

## Frontend UX Guidelines (derived from backend behavior)

### Button visibility by status

| Status      | Edit | Confirm | Create Invoice | Create Delivery | Cancel | Delete |
| ----------- | ---- | ------- | -------------- | --------------- | ------ | ------ |
| `draft`     | Yes  | Yes     | No             | No              | Yes    | Yes    |
| `confirmed` | No   | No      | Yes            | Yes             | Yes\*  | No     |
| `done`      | No   | No      | Yes\*\*        | Yes\*\*         | No     | No     |
| `cancelled` | No   | No      | No             | No              | No     | No     |

\* Cancel is only available if no linked invoices or deliveries exist.
\*\* Create Invoice/Delivery on `done` status is allowed by the backend (for additional invoices or partial deliveries).

### Optimistic locking UX

When a 409 Conflict is returned:

1. Show a toast/alert: "This record was modified by another user. Please refresh to see the latest version."
2. Reload the order data
3. Let the user re-apply their changes

### Pricelist behavior

When creating an order with a pricelist (either from DTO or partner default):

- The backend will override `unitPrice` on each line with the pricelist-computed price
- If the pricelist computation fails for a specific line, the original price is kept
- The frontend should be aware that the returned order may have different prices than what was submitted
