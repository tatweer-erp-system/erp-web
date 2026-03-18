# Design Decisions: Sales Orders Module

> **Scope:** Sales Orders list + detail, Quotations list + detail, Fast-Create drawers, shared components
> **Stack:** React 19 + Ant Design 6 + Tailwind CSS v4 + react-hook-form + zod
> **API prefix:** `/api/v1/sales/orders`
> **Permissions:** `sales:view` (read), `sales:manage` (write)
> **Backend enums:** `SalesOrderStatus` (draft, confirmed, done, cancelled), `SalesOrderInvoiceStatus` (nothing, to_invoice, invoiced), `SalesOrderDeliveryStatus` (pending, partial, done)

---

## Table of Contents

1. [Frontend Enums to Add](#1-frontend-enums-to-add)
2. [Sales Orders List Page](#2-sales-orders-list-page)
3. [Quotations List Page](#3-quotations-list-page)
4. [Sales Order Detail Page](#4-sales-order-detail-page)
5. [Quotation Detail Page](#5-quotation-detail-page)
6. [Fast-Create Drawer -- Sales Order](#6-fast-create-drawer----sales-order)
7. [Fast-Create Drawer -- Quotation](#7-fast-create-drawer----quotation)
8. [Shared Components](#8-shared-components)
9. [Mobile Adaptations](#9-mobile-adaptations)
10. [i18n Keys](#10-i18n-keys)

---

## 1. Frontend Enums to Add

The existing `client/src/constants/enums.ts` has `OrderStatus` and `QuotationStatus` that do not match the backend. Add/replace with these `as const` objects:

```typescript
/** Sales order main status -- matches backend SalesOrderStatus */
export const SalesOrderStatus = {
  DRAFT: "draft",
  CONFIRMED: "confirmed",
  DONE: "done",
  CANCELLED: "cancelled",
} as const;
export type SalesOrderStatus =
  (typeof SalesOrderStatus)[keyof typeof SalesOrderStatus];

/** Sales order invoice sub-status -- matches backend SalesOrderInvoiceStatus */
export const SalesOrderInvoiceStatus = {
  NOTHING: "nothing",
  TO_INVOICE: "to_invoice",
  INVOICED: "invoiced",
} as const;
export type SalesOrderInvoiceStatus =
  (typeof SalesOrderInvoiceStatus)[keyof typeof SalesOrderInvoiceStatus];

/** Sales order delivery sub-status -- matches backend SalesOrderDeliveryStatus */
export const SalesOrderDeliveryStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  DONE: "done",
} as const;
export type SalesOrderDeliveryStatus =
  (typeof SalesOrderDeliveryStatus)[keyof typeof SalesOrderDeliveryStatus];

/** Quotation status (quotations reuse the same entity as SO but are filtered by isQuotation flag or status=draft with no orderNumber) */
export const QuotationStatus = {
  DRAFT: "draft",
  SENT: "sent",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;
export type QuotationStatus =
  (typeof QuotationStatus)[keyof typeof QuotationStatus];
```

The existing `OrderStatus` and `QuotationStatus` should be replaced by these. The old `OrderStatus` (completed, processing, pending, in-transit) does not match the backend and must be deprecated.

---

## 2. Sales Orders List Page

### Route

`/sales/orders` -- `SalesOrdersListPage` (lazy-loaded, default export)

### Breadcrumb

`Dashboard > Sales > Orders`

### Page Title

`t('salesOrders.title', lang)` -- "Sales Orders" / "اوامر البيع"

### KPI Stats Row

Four `StatCard` components in a `Row` with `gutter={[16, 16]}`:

| Card                 | Label                                    | Value Source                    | Icon                  | Icon Variant |
| -------------------- | ---------------------------------------- | ------------------------------- | --------------------- | ------------ |
| Total Orders         | Count of all SOs                         | `total` from paginated response | `FileTextOutlined`    | Purple       |
| Pending Confirmation | Count where `status = draft`             | Separate query or filter count  | `ClockCircleOutlined` | Orange       |
| To Invoice           | Count where `invoiceStatus = to_invoice` | Separate query or filter count  | `DollarOutlined`      | Blue         |
| Total Revenue        | Sum of `totalAmount` for confirmed+done  | Aggregated value                | `RiseOutlined`        | Green        |

Grid: `xs={24} sm={12} lg={6}` per card.

### Action Bar

Uses the standard `ActionBar` layout from DESIGN-SYSTEM.md section 9.2.

| Position | Element         | Component                            | Props                                                                                                                            |
| -------- | --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Start    | New Sales Order | `Button type="primary"`              | `icon={<PlusOutlined />}`, gradient bg, opens FastCreate drawer. Label: `t('salesOrders.create', lang)`                          |
| End      | Search          | `Input` with `SearchOutlined` prefix | `width: 280px`, `allowClear`, `placeholder: t('salesOrders.searchPlaceholder', lang)` -- "Search by order number or customer..." |
| End      | Filter          | `Button`                             | `icon={<FilterOutlined />}`, toggles FilterPanel. Badge with active filter count                                                 |
| End      | Reload          | `Tooltip` + `Button`                 | `icon={<ReloadOutlined />}`, invalidates query                                                                                   |
| End      | Export          | `Dropdown` + `Button`                | `icon={<DownloadOutlined />}`, menu: CSV, Excel, PDF                                                                             |
| End      | View Toggle     | `Segmented`                          | `table` (UnorderedListOutlined) / `grid` (AppstoreOutlined)                                                                      |

### Filter Panel

Collapsible panel below action bar. 4-column grid on desktop, 2 on tablet, 1 on mobile.

| Filter          | Component                | Options                                  |
| --------------- | ------------------------ | ---------------------------------------- |
| Status          | `Select`                 | All, Draft, Confirmed, Done, Cancelled   |
| Invoice Status  | `Select`                 | All, Nothing, To Invoice, Invoiced       |
| Delivery Status | `Select`                 | All, Pending, Partial, Done              |
| Date Range      | `DatePicker.RangePicker` | Free date range                          |
| Customer        | `Select` with search     | Partner dropdown API (`isCustomer=true`) |
| Salesperson     | `Select` with search     | Users dropdown API                       |

Active filters render as `Tag` chips with close buttons below the filter panel.

### Table Columns

Uses Ant Design `Table` component inside a zero-padding `Card`.

| #   | Column          | `dataIndex`      | Width | Sortable | Filterable | Priority | Render                                                                                                                       |
| --- | --------------- | ---------------- | ----- | -------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Checkbox        | --               | 48px  | No       | No         | P1       | Selection checkbox                                                                                                           |
| 2   | Number          | `orderNumber`    | 120px | Yes      | Yes        | P1       | Mono font (`var(--font-mono)`), `fontWeight: 500`, `color: colorPrimary`, clickable link style. Navigates to detail on click |
| 3   | Customer        | `partner`        | flex  | Yes      | Yes        | P1       | `getName(record.partner)`. If null: `t('salesOrders.noCustomer', lang)` in `colorTextTertiary`                               |
| 4   | Date            | `createdAt`      | 110px | Yes      | Yes        | P2       | `dayjs(value).format('DD MMM YYYY')`, `color: colorTextSecondary`                                                            |
| 5   | Amount          | `totalAmount`    | 120px | Yes      | No         | P1       | Right-aligned, mono font, `fontWeight: 600`. Format: `SAR {amount.toLocaleString('en-SA', {minimumFractionDigits: 2})}`      |
| 6   | Status          | `status`         | 110px | Yes      | Yes        | P1       | `StatusBadge` component (see color map below)                                                                                |
| 7   | Invoice Status  | `invoiceStatus`  | 120px | Yes      | Yes        | P2       | `StatusBadge` component (see color map below)                                                                                |
| 8   | Delivery Status | `deliveryStatus` | 120px | Yes      | Yes        | P2       | `StatusBadge` component (see color map below)                                                                                |
| 9   | Actions         | --               | 80px  | No       | No         | P1       | `Dropdown` with `MoreOutlined` trigger button                                                                                |

### Status Badge Color Map

#### SalesOrderStatus

| Status      | Maps to StatusBadge variant               | Label (en) | Label (ar) |
| ----------- | ----------------------------------------- | ---------- | ---------- |
| `draft`     | `draft` (gray)                            | Draft      | مسودة      |
| `confirmed` | `confirmed` (blue)                        | Confirmed  | مؤكد       |
| `done`      | `paid` (green -- reuse the green palette) | Done       | مكتمل      |
| `cancelled` | `cancelled` (red)                         | Cancelled  | ملغي       |

#### SalesOrderInvoiceStatus

| Status       | Maps to StatusBadge variant | Label (en)   | Label (ar)       |
| ------------ | --------------------------- | ------------ | ---------------- |
| `nothing`    | `draft` (gray)              | Not Invoiced | غير مفوتر        |
| `to_invoice` | `pending` (orange)          | To Invoice   | بانتظار الفاتورة |
| `invoiced`   | `paid` (green)              | Invoiced     | مفوتر            |

#### SalesOrderDeliveryStatus

| Status    | Maps to StatusBadge variant | Label (en) | Label (ar)      |
| --------- | --------------------------- | ---------- | --------------- |
| `pending` | `pending` (orange)          | Pending    | بانتظار التسليم |
| `partial` | `partial` (orange-deep)     | Partial    | تسليم جزئي      |
| `done`    | `delivered` (green)         | Delivered  | تم التسليم      |

### Row Actions Dropdown

| Action         | Icon                      | Visible When                                                                       | Behavior                                                                     |
| -------------- | ------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| View Details   | `EyeOutlined`             | Always                                                                             | `navigate('/sales/orders/{id}')`                                             |
| Edit           | `EditOutlined`            | `status === 'draft'`                                                               | `navigate('/sales/orders/{id}')` (opens in edit mode)                        |
| Confirm        | `CheckCircleOutlined`     | `status === 'draft'`                                                               | POST `/sales/orders/{id}/confirm`, optimistic update, `sonner` success toast |
| Create Invoice | `FileTextOutlined`        | `status === 'confirmed' \|\| status === 'done'` AND `invoiceStatus !== 'invoiced'` | Opens Create Invoice modal                                                   |
| Cancel         | `CloseCircleOutlined`     | `status === 'draft' \|\| status === 'confirmed'`                                   | Opens `ConfirmModal` with warning text                                       |
| Divider        | --                        | --                                                                                 | Visual separator                                                             |
| Delete         | `DeleteOutlined` (danger) | `status === 'draft'`                                                               | Opens `ConfirmModal` with danger styling                                     |

### Row Click Behavior

Click anywhere on the row (except checkbox and actions column) navigates to `/sales/orders/{id}`.

### Bulk Actions

Appears when one or more rows are selected. Uses the standard bulk action bar from DESIGN-SYSTEM.md section 9.2.

| Action           | Icon                      | Condition                              | Behavior                               |
| ---------------- | ------------------------- | -------------------------------------- | -------------------------------------- |
| Export Selected  | `DownloadOutlined`        | Always                                 | Export selected rows as CSV/Excel      |
| Confirm Selected | `CheckCircleOutlined`     | All selected have `status === 'draft'` | Batch confirm with confirmation dialog |
| Delete Selected  | `DeleteOutlined` (danger) | All selected have `status === 'draft'` | Batch delete with confirmation dialog  |

### Empty State

Uses `EmptyState` component (DESIGN-SYSTEM.md section 9.8):

- Icon: `FileTextOutlined` (48px)
- Title: `t('salesOrders.empty.title', lang)` -- "No sales orders yet"
- Description: `t('salesOrders.empty.description', lang)` -- "Create your first sales order to start tracking revenue"
- CTA: `t('salesOrders.create', lang)` -- "New Sales Order" button, opens FastCreate drawer

### Loading Skeleton

Ant Design `Table` with `loading={true}` prop (uses built-in skeleton rows). For the KPI row, render 4 `Card` components with Ant `Skeleton.Input` at full width.

### Pagination

Standard Ant Design `Table` pagination:

- `pageSize: 20` default
- `showSizeChanger: true`, options: `[10, 20, 50, 100]`
- `showTotal`: `{range[0]}--{range[1]} of {total} orders`

---

## 3. Quotations List Page

### Route

`/sales/quotations` -- `QuotationsListPage` (lazy-loaded, default export)

### Breadcrumb

`Dashboard > Sales > Quotations`

### Visual Differences from Sales Orders

Quotations in Tatweer are draft sales orders that have not yet been confirmed. The quotation list is a filtered view of sales orders where `status = 'draft'`. The key visual differentiators:

1. **Page title**: "Quotations" / "عروض الأسعار" instead of "Sales Orders"
2. **Primary CTA**: "New Quotation" instead of "New Sales Order"
3. **No Invoice Status or Delivery Status columns** -- quotations are pre-confirmation, these are always `nothing`/`pending`
4. **Added column**: "Valid Until" date (from `notes` or a future field if the backend adds it)
5. **Different action set**: "Send" (email), "Confirm" (converts to SO), "Duplicate", "Delete"

### KPI Stats Row

| Card             | Label                                              | Value Source                    | Icon                  | Icon Variant |
| ---------------- | -------------------------------------------------- | ------------------------------- | --------------------- | ------------ |
| Total Quotations | Count                                              | `total` from paginated response | `FileTextOutlined`    | Purple       |
| Pending          | Count of draft quotations awaiting response        | Filter count                    | `ClockCircleOutlined` | Orange       |
| Confirmed        | Count of quotations converted to orders this month | Filter count                    | `CheckCircleOutlined` | Green        |
| Pipeline Value   | Sum of `totalAmount` for all draft quotations      | Aggregated value                | `DollarOutlined`      | Blue         |

### Table Columns

| #   | Column      | `dataIndex`   | Width | Sortable | Priority | Render                                                 |
| --- | ----------- | ------------- | ----- | -------- | -------- | ------------------------------------------------------ |
| 1   | Checkbox    | --            | 48px  | No       | P1       | Selection checkbox                                     |
| 2   | Number      | `orderNumber` | 120px | Yes      | P1       | Mono font, primary color, link style                   |
| 3   | Customer    | `partner`     | flex  | Yes      | P1       | `getName(record.partner)`                              |
| 4   | Amount      | `totalAmount` | 120px | Yes      | P1       | Right-aligned, mono, `fontWeight: 600`, `SAR {amount}` |
| 5   | Date        | `createdAt`   | 110px | Yes      | P2       | `dayjs(value).format('DD MMM YYYY')`                   |
| 6   | Salesperson | `salesperson` | 130px | Yes      | P3       | `getName(record.salesperson)` with 24px Avatar         |
| 7   | Actions     | --            | 80px  | No       | P1       | `Dropdown` with `MoreOutlined`                         |

### Row Actions (Quotation-specific)

| Action           | Icon                      | Behavior                                                                                                                                            |
| ---------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| View             | `EyeOutlined`             | Navigate to `/sales/quotations/{id}`                                                                                                                |
| Edit             | `EditOutlined`            | Navigate to `/sales/quotations/{id}` in edit mode                                                                                                   |
| Confirm as Order | `SwapOutlined`            | POST `/sales/orders/{id}/confirm`. Shows confirmation dialog: "Convert this quotation to a sales order?" On success: navigate to the SO detail page |
| Duplicate        | `CopyOutlined`            | POST create with same data, navigate to new draft                                                                                                   |
| Delete           | `DeleteOutlined` (danger) | DELETE `/sales/orders/{id}`. Confirmation dialog                                                                                                    |

### Bulk Actions

| Action            | Condition              |
| ----------------- | ---------------------- |
| Export Selected   | Always                 |
| Confirm as Orders | All selected are draft |
| Delete Selected   | All selected are draft |

---

## 4. Sales Order Detail Page

### Route

`/sales/orders/:id` -- `SalesOrderDetailPage` (lazy-loaded, default export)

### Breadcrumb

`Dashboard > Sales > Orders > {orderNumber}`

### Page Header (DetailHeader component)

Uses the standard `DetailHeader` from DESIGN-SYSTEM.md section 9.4:

| Element                 | Value                                                       |
| ----------------------- | ----------------------------------------------------------- |
| Back button             | Navigate to `/sales/orders`                                 |
| Title                   | `{orderNumber}` (e.g., "SO-00042") -- mono font, 22px, bold |
| Status badge            | `StatusBadge` for current `status`                          |
| Meta row                | Customer name (dot) Date (dot) Salesperson name             |
| Actions (right-aligned) | Dynamic per status (see below)                              |

### Action Buttons by Status

#### Draft

| Button  | Type                          | Icon                  | Behavior                                                                                                                                         |
| ------- | ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Confirm | `type="primary"`              | `CheckCircleOutlined` | POST `/sales/orders/{id}/confirm`. Pre-checks: at least 1 line, stock check for storables, credit limit. On success: refresh, show success toast |
| Edit    | `type="default"` ghost        | `EditOutlined`        | Toggle form to edit mode                                                                                                                         |
| Delete  | `danger` ghost                | `DeleteOutlined`      | DELETE with `ConfirmModal`                                                                                                                       |
| More    | Dropdown (`EllipsisOutlined`) | --                    | Duplicate, Print, Export PDF                                                                                                                     |

#### Confirmed

| Button          | Type             | Icon                  | Behavior                                                                                                        |
| --------------- | ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| Create Invoice  | `type="primary"` | `FileTextOutlined`    | Opens `CreateInvoiceModal` (see below)                                                                          |
| Create Delivery | `type="default"` | `TruckOutlined`       | POST `/sales/orders/{id}/create-delivery`. Only enabled when lines have remaining delivery qty > 0              |
| Cancel          | `danger` ghost   | `CloseCircleOutlined` | POST `/sales/orders/{id}/cancel`. Blocked if linked invoices/deliveries exist -- show blocking reason in dialog |
| More            | Dropdown         | --                    | Print, Export PDF                                                                                               |

#### Done

| Button         | Type                                     | Icon               | Behavior                   |
| -------------- | ---------------------------------------- | ------------------ | -------------------------- |
| Create Invoice | `type="primary"` (if not fully invoiced) | `FileTextOutlined` | Opens `CreateInvoiceModal` |
| Print          | `type="default"`                         | `PrinterOutlined`  | Print/PDF                  |

#### Cancelled

No action buttons. Show info alert: "This order has been cancelled."

### Status Progress Bar

Uses Ant Design `Steps` with `type="default"` and `size="small"`, placed between the header card and the tabs.

| Step | Label (en) | Label (ar) | Status Mapping                                      |
| ---- | ---------- | ---------- | --------------------------------------------------- |
| 0    | Draft      | مسودة      | `status === 'draft'`: `process`; past: `finish`     |
| 1    | Confirmed  | مؤكد       | `status === 'confirmed'`: `process`; past: `finish` |
| 2    | Done       | مكتمل      | `status === 'done'`: `finish`                       |

If `status === 'cancelled'`, show a separate red banner instead of the steps bar:

- `Alert type="error"` with message: "This sales order was cancelled on {cancelledDate}."

Step colors: active = `colorPrimary`, completed = `colorSuccess`, pending = `colorBorder`.

### Tab Structure

Ant Design `Tabs` with `type="line"`, sticky below the header.

| Tab           | Label (en)    | Label (ar)      | Permission   |
| ------------- | ------------- | --------------- | ------------ |
| Lines         | Order Lines   | بنود الطلب      | `sales:view` |
| Invoices      | Invoices      | الفواتير        | `sales:view` |
| Deliveries    | Deliveries    | التسليمات       | `sales:view` |
| Down Payments | Down Payments | الدفعات المقدمة | `sales:view` |
| History       | Activity Log  | سجل النشاط      | `sales:view` |

### Tab: Order Lines

#### Credit Limit Banner

Positioned above the lines table. Rendered when `partner.creditLimit > 0`.

| Condition             | Banner Type            | Color         | Message                                                                                                |
| --------------------- | ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------ |
| Within limit          | `Alert type="info"`    | Green/neutral | "Outstanding: {outstanding} SAR + This order: {orderTotal} SAR = {sum} SAR (Limit: {creditLimit} SAR)" |
| Exceeds, non-blocking | `Alert type="warning"` | Yellow        | Same text + "Credit limit exceeded"                                                                    |
| Exceeds, blocking     | `Alert type="error"`   | Red           | Same text + "Credit limit exceeded -- order cannot be confirmed"                                       |

Recalculated on every line change (qty, price, discount) or partner change.

#### Inline Editable Table (InlineEditableTable)

Uses the standard `InlineEditableTable` from DESIGN-SYSTEM.md section 9.6. Editable only when `status === 'draft'`.

| #   | Column        | `dataIndex`    | Width     | Component                                                | Editable         | Notes                                                                                                                         |
| --- | ------------- | -------------- | --------- | -------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1   | Line #        | --             | 48px      | Non-editable                                             | No               | Auto-increment row number                                                                                                     |
| 2   | Product       | `productId`    | 200px min | `Select` with search, fetches from products dropdown API | Yes (draft only) | On selection: auto-fill `unitPrice` from product sale price, `taxRate` from product tax rate, `description` from product name |
| 3   | Description   | `description`  | flex      | `Input`                                                  | Yes (draft only) | Auto-filled from product name, user can override                                                                              |
| 4   | Qty Ordered   | `quantity`     | 80px      | `InputNumber` min=0.001, step=1                          | Yes (draft only) |                                                                                                                               |
| 5   | Qty Delivered | `deliveredQty` | 90px      | Non-editable                                             | No               | Read-only, shown as plain text. Only visible when `status !== 'draft'`                                                        |
| 6   | Qty Invoiced  | `invoicedQty`  | 90px      | Non-editable                                             | No               | Read-only. Only visible when `status !== 'draft'`                                                                             |
| 7   | Unit Price    | `unitPrice`    | 100px     | `InputNumber` min=0, precision=2                         | Yes (draft only) | If pricelist active: show warning icon when price differs from pricelist price                                                |
| 8   | Discount %    | `discountPct`  | 80px      | `InputNumber` min=0, max=100                             | Yes (draft only) | Default 0                                                                                                                     |
| 9   | Tax %         | `taxRate`      | 80px      | `Select` or `InputNumber`                                | Yes (draft only) | Default 15                                                                                                                    |
| 10  | Subtotal      | computed       | 110px     | Non-editable                                             | No               | `quantity * unitPrice - discount + tax`. Right-aligned, mono, `fontWeight: 600`                                               |
| 11  | Actions       | --             | 48px      | `DeleteOutlined` on hover                                | Yes (draft only) | Red delete icon. Hidden in view mode                                                                                          |

**Add line button**: Bottom-left of table, text button: "+ Add a line", `color: colorPrimary`, `fontSize: 13`, `fontWeight: 500`. Only visible when `status === 'draft'`.

**Drag to reorder**: `HolderOutlined` handle on the left, visible on hover, drag-drop via `dnd-kit`. Only in draft mode.

#### Totals Section (OrderTotals)

Right-aligned below the lines table, inside the same card.

| Row       | Label                             | Value                                            | Style                                                                                               |
| --------- | --------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Subtotal  | `t('salesOrders.subtotal', lang)` | Sum of `qty * unitPrice` for all lines           | `fontSize: 14`, label: `colorTextSecondary fontWeight: 500`, value: `colorText fontWeight: 600`     |
| Discount  | `t('salesOrders.discount', lang)` | Sum of all line discounts + order-level discount | Same style. Show as negative: `-{amount}` in `colorError`                                           |
| Tax (15%) | `t('salesOrders.tax', lang)`      | Sum of all line taxes                            | Same style                                                                                          |
| **Total** | `t('salesOrders.total', lang)`    | `totalAmount` from API                           | `fontSize: 18`, `fontWeight: 700`, top border separator `1px solid colorBorder`. Value in mono font |

If order-level discount is applied (from `discountType` + `discountValue`), show an additional line between Subtotal and line Discount:

- "Order Discount ({discountValue}%)" or "Order Discount (Fixed)" with the prorated amount

### Tab: Invoices

| Section                 | Content                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Header row              | "Invoices" title + "Create Invoice" primary button (visible when `status = confirmed/done` AND `invoiceStatus !== 'invoiced'`) |
| Invoices table          | Columns: Number (link), Date, Amount, Payment Status (StatusBadge), ZATCA Status (StatusBadge)                                 |
| Down payment deductions | Below invoices table, section showing applied down payment deductions with links                                               |
| Empty state             | "No invoices created yet. Create an invoice to bill the customer." with CTA                                                    |

**Create Invoice Modal** (`AppModal` with gradient header):

| Field        | Component                       | Notes                                                                                      |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------------------ |
| Invoice Type | `Radio.Group`                   | Options: "Regular Invoice", "Down Payment (Percentage)", "Down Payment (Fixed Amount)"     |
| Value        | `InputNumber`                   | Shown only for down payment types. For percentage: 0.01-100. For fixed: 0 to `totalAmount` |
| Footer       | Cancel + Create Invoice buttons | Primary button disabled if validation fails                                                |

### Tab: Deliveries

| Section          | Content                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Header row       | "Deliveries" title + "Create Delivery" button (visible when `status = confirmed/done` AND lines have remaining delivery qty) |
| Deliveries table | Columns: Number (link, mono), Scheduled Date, Done Date, Status (StatusBadge), Line Count                                    |
| Empty state      | "No deliveries created yet."                                                                                                 |

### Tab: Down Payments

| Section             | Content                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Header row          | "Down Payments" title + "Create Down Payment" button (visible when `status = confirmed/done`)                        |
| Down payments table | Columns: Date, Type (Percentage/Fixed), Amount (`SAR {amount}`), Invoice Number (link), Invoice Status (StatusBadge) |
| Empty state         | "No down payments recorded."                                                                                         |

### Tab: History (Chatter)

Uses the `ChatterPanel` component from DESIGN-SYSTEM.md section 9.7:

- Send Message, Log Note, Schedule Activity tabs
- Timeline of status changes, messages, notes
- Status changes: "[field] changed from [old] to [new]" with colored badges
- Max 10 visible items, "Load more" button

### Form Field Layout (Edit Mode -- Draft Only)

When the SO is in draft and the user clicks "Edit", the header section expands to show editable fields in a two-column form layout within a Card below the status bar and above the tabs.

| Position   | Field           | Component                                                     | Notes                                                                       |
| ---------- | --------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Left col   | Customer        | `Select` with search                                          | Partners dropdown, `isCustomer=true`. Required                              |
| Left col   | Salesperson     | `Select` with search                                          | Users dropdown. Optional                                                    |
| Left col   | Pricelist       | `Select` with search                                          | Pricelists dropdown. Optional. On change: prompt to recalculate line prices |
| Right col  | Payment Terms   | `Select` with search                                          | Payment terms dropdown. Optional                                            |
| Right col  | Fiscal Position | `Select` with search                                          | Fiscal positions dropdown. Optional                                         |
| Right col  | Currency        | `Select`                                                      | Currencies dropdown. Optional, defaults to SAR                              |
| Full width | Notes           | `Input.TextArea`                                              | `rows={3}`. Optional                                                        |
| Full width | Order Discount  | Row with: `Select` (percentage/fixed) + `InputNumber` (value) | Optional. Recalculates all line discounts proportionally                    |

---

## 5. Quotation Detail Page

### Route

`/sales/quotations/:id` -- `QuotationDetailPage` (lazy-loaded, default export)

### Differences from Sales Order Detail

The quotation detail is structurally identical to the sales order detail with these exceptions:

1. **Breadcrumb**: `Dashboard > Sales > Quotations > {orderNumber}`
2. **Back button**: Navigates to `/sales/quotations`
3. **Status Progress Bar**: Only 2 steps: Draft, Confirmed (since confirming converts the quotation to a sales order)
4. **Tabs**: Only "Lines" and "History" tabs are shown (no Invoices, Deliveries, or Down Payments -- these don't apply to drafts)
5. **Primary action**: "Confirm as Sales Order" instead of just "Confirm"
   - On success: show success toast with link to the new SO detail page, then navigate to it
6. **Additional action**: "Send by Email" button (`MailOutlined`) -- opens a compose modal (future feature)

### Action Buttons

| Button           | Type                   | Icon                  | Behavior                                                                                                     |
| ---------------- | ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------ |
| Confirm as Order | `type="primary"`       | `CheckCircleOutlined` | POST `/sales/orders/{id}/confirm`. Confirmation dialog: "Convert this quotation to a confirmed sales order?" |
| Edit             | `type="default"` ghost | `EditOutlined`        | Toggle to edit mode                                                                                          |
| Send             | `type="default"`       | `MailOutlined`        | Future: compose email                                                                                        |
| More             | Dropdown               | `EllipsisOutlined`    | Duplicate, Print, Export PDF, Delete                                                                         |

---

## 6. Fast-Create Drawer -- Sales Order

### Trigger

"New Sales Order" button on the Sales Orders list page.

### Component

Uses `FastCreateDrawer` pattern from DESIGN-SYSTEM.md section 8.4 and 9.5.

| Property                 | Value                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Width                    | 420px (100% on mobile)                                                                              |
| Placement                | Right (left in RTL)                                                                                 |
| Gradient header icon     | `ShoppingCartOutlined`                                                                              |
| Gradient header title    | `t('salesOrders.fastCreate.title', lang)` -- "New Sales Order" / "طلب بيع جديد"                     |
| Gradient header subtitle | `t('salesOrders.fastCreate.subtitle', lang)` -- "Create a quick sales order" / "إنشاء طلب بيع سريع" |

### Fields (in order)

| #   | Field       | Component            | Required | Default      | Notes                                                                                   |
| --- | ----------- | -------------------- | -------- | ------------ | --------------------------------------------------------------------------------------- |
| 1   | Customer    | `Select` with search | Yes      | --           | Partners dropdown, `isCustomer=true`. On select: auto-fill pricelist if partner has one |
| 2   | Product     | `Select` with search | Yes      | --           | Products dropdown. On select: auto-fill price from product sale price                   |
| 3   | Quantity    | `InputNumber`        | Yes      | 1            | `min=0.001`, `step=1`                                                                   |
| 4   | Unit Price  | `InputNumber`        | Yes      | Auto-filled  | `min=0`, `precision=2`. Pre-filled from product sale price                              |
| 5   | Salesperson | `Select` with search | No       | Current user | Users dropdown                                                                          |
| 6   | Notes       | `Input.TextArea`     | No       | --           | `rows={2}`                                                                              |

### Zod Schema

```typescript
const salesOrderFastCreateSchema = z.object({
  partnerId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().min(0.001),
  unitPrice: z.coerce.number().min(0),
  salespersonId: z.string().uuid().optional(),
  notes: z.string().optional(),
});
```

### Submit Behavior

On save, construct the `CreateSalesOrderDto` payload:

```typescript
{
  partnerId: values.partnerId,
  salespersonId: values.salespersonId,
  notes: values.notes,
  lines: [{
    productId: values.productId,
    quantity: values.quantity,
    unitPrice: values.unitPrice,
    taxRate: 15, // default VAT
  }],
}
```

### Footer Buttons

| Button      | Type               | Behavior                                                      |
| ----------- | ------------------ | ------------------------------------------------------------- |
| Cancel      | Default            | Close drawer, reset form                                      |
| Save        | Primary (gradient) | POST, close drawer, invalidate list query, show success toast |
| Save & Open | Primary ghost      | POST, close drawer, navigate to `/sales/orders/{newId}`       |

---

## 7. Fast-Create Drawer -- Quotation

### Trigger

"New Quotation" button on the Quotations list page.

### Differences from Sales Order Fast-Create

Structurally identical to the SO fast-create drawer with these changes:

1. **Header title**: "New Quotation" / "عرض سعر جديد"
2. **Header subtitle**: "Create a quick quotation" / "إنشاء عرض سعر سريع"
3. **Header icon**: `FileTextOutlined`
4. **Additional field**: "Valid Until" date picker (optional, positioned after Notes)
5. **Save & Open**: Navigates to `/sales/quotations/{newId}`

The backend endpoint is the same (`POST /sales/orders`); the created record starts as a draft SO which is displayed as a quotation until confirmed.

---

## 8. Shared Components

### 8.1 Components to Build

| Component                 | File Path                                                 | Purpose                                                                                                                       |
| ------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `SalesOrderStatusBadge`   | `client/src/components/sales/SalesOrderStatusBadge.tsx`   | Wrapper around `StatusBadge` with SO-specific status-to-variant mapping                                                       |
| `InvoiceStatusBadge`      | `client/src/components/sales/InvoiceStatusBadge.tsx`      | Maps `SalesOrderInvoiceStatus` values to `StatusBadge` variants                                                               |
| `DeliveryStatusBadge`     | `client/src/components/sales/DeliveryStatusBadge.tsx`     | Maps `SalesOrderDeliveryStatus` values to `StatusBadge` variants                                                              |
| `OrderLinesTable`         | `client/src/components/sales/OrderLinesTable.tsx`         | Reusable inline editable table for SO lines. Props: `lines`, `isEditable`, `onLineChange`, `onLineAdd`, `onLineRemove`        |
| `OrderTotals`             | `client/src/components/sales/OrderTotals.tsx`             | Reusable totals section. Props: `subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `discountType`, `discountValue`     |
| `CreditLimitBanner`       | `client/src/components/sales/CreditLimitBanner.tsx`       | Alert banner showing credit limit status. Props: `partner`, `orderTotal`                                                      |
| `CreateInvoiceModal`      | `client/src/components/sales/CreateInvoiceModal.tsx`      | `AppModal` for creating invoice from SO. Props: `salesOrderId`, `orderTotal`, `open`, `onClose`, `onSuccess`                  |
| `CreateDownPaymentModal`  | `client/src/components/sales/CreateDownPaymentModal.tsx`  | `AppModal` for creating down payment. Props: `salesOrderId`, `orderTotal`, `open`, `onClose`, `onSuccess`                     |
| `SalesOrderWorkflowSteps` | `client/src/components/sales/SalesOrderWorkflowSteps.tsx` | Status progress bar using Ant `Steps`. Props: `status`, `cancelledAt`                                                         |
| `SalesOrderFormFields`    | `client/src/components/sales/SalesOrderFormFields.tsx`    | Reusable form fields section for SO header (customer, salesperson, pricelist, etc.). Props: `isEditable`, `control`, `errors` |

### 8.2 Reuse of Existing Common Components

| Component         | From                                               | Usage in Sales Module                                       |
| ----------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `StatusBadge`     | `client/src/components/common/StatusBadge.tsx`     | Base component for all status badges                        |
| `AppModal`        | `client/src/components/common/AppModal.tsx`        | CreateInvoiceModal, CreateDownPaymentModal, Confirm dialogs |
| `FastCreateModal` | `client/src/components/common/FastCreateModal.tsx` | SO and Quotation fast-create drawers                        |
| `EmptyState`      | `client/src/components/common/EmptyState.tsx`      | List empty states, tab empty states                         |
| `PageTitle`       | `client/src/components/common/PageTitle.tsx`       | Page headers                                                |
| `SearchInput`     | `client/src/components/common/SearchInput.tsx`     | Action bar search                                           |
| `FilterBar`       | `client/src/components/common/FilterBar.tsx`       | Filter panel                                                |
| `MobileTable`     | `client/src/components/common/MobileTable.tsx`     | Mobile card list fallback                                   |
| `ConfirmModal`    | `client/src/components/common/ConfirmModal.tsx`    | Delete, Cancel confirmation dialogs                         |

### 8.3 API Endpoints File

File: `client/src/api/endpoints/sale-orders.api.ts`

```typescript
// List
getSalesOrders(params: PaginationParams & SalesOrderFilters): Promise<PaginatedResponse<SalesOrder>>
// Detail
getSalesOrder(id: string): Promise<SalesOrder>
// Create
createSalesOrder(data: CreateSalesOrderDto): Promise<SalesOrder>
// Update
updateSalesOrder(id: string, data: UpdateSalesOrderDto): Promise<SalesOrder>
// Confirm
confirmSalesOrder(id: string): Promise<SalesOrder>
// Cancel
cancelSalesOrder(id: string): Promise<void>
// Delete
deleteSalesOrder(id: string): Promise<void>
// Create invoice from SO
createInvoiceFromSO(id: string, data: CreateInvoiceFromSODto): Promise<Invoice>
// Create delivery from SO
createDeliveryFromSO(id: string): Promise<Delivery>
// Line operations
addSalesOrderLine(orderId: string, data: CreateSalesOrderLineDto): Promise<SalesOrderLine>
updateSalesOrderLine(orderId: string, lineId: string, data: UpdateSalesOrderLineDto): Promise<SalesOrderLine>
removeSalesOrderLine(orderId: string, lineId: string): Promise<void>
```

### 8.4 Query Hooks File

File: `client/src/hooks/queries/useSaleOrders.ts`

| Hook                     | Query Key                  | Stale Time |
| ------------------------ | -------------------------- | ---------- |
| `useSalesOrders(params)` | `['sales-orders', params]` | 5 min      |
| `useSalesOrder(id)`      | `['sales-orders', id]`     | 5 min      |

### 8.5 Mutation Hooks File

File: `client/src/hooks/mutations/useSaleOrderMutations.ts`

| Hook                        | Invalidates                                |
| --------------------------- | ------------------------------------------ |
| `useCreateSalesOrder()`     | `['sales-orders']`                         |
| `useUpdateSalesOrder()`     | `['sales-orders']`, `['sales-orders', id]` |
| `useConfirmSalesOrder()`    | `['sales-orders']`, `['sales-orders', id]` |
| `useCancelSalesOrder()`     | `['sales-orders']`, `['sales-orders', id]` |
| `useDeleteSalesOrder()`     | `['sales-orders']`                         |
| `useCreateInvoiceFromSO()`  | `['sales-orders', id]`, `['invoices']`     |
| `useCreateDeliveryFromSO()` | `['sales-orders', id]`, `['deliveries']`   |

---

## 9. Mobile Adaptations

### List Page (< md / 768px)

Switches from `Table` to `MobileTable` (card list) per MOBILE-DESIGN.md.

#### Sales Order Mobile Card Layout

```
+-----------------------------------------------+
| SO-00108                     [Confirmed] (blue)|
| Al-Rashid Trading Co.                          |
| SAR 8,750.00                     12 Mar 2026   |
| [Invoiced] (green)  [Partially Delivered] (orange) |
+-----------------------------------------------+
```

| Element              | Style                                                            |
| -------------------- | ---------------------------------------------------------------- |
| Order number         | Bold, `text-base`, primary color, mono font                      |
| Status badge         | Ant `Tag`, top-right                                             |
| Customer name        | `text-sm`, `colorTextSecondary`                                  |
| Amount               | `text-base`, `font-semibold`, start-aligned                      |
| Date                 | `text-sm`, `colorTextTertiary`, end-aligned, same line as amount |
| Invoice status pill  | Small `Tag`, bottom-start                                        |
| Delivery status pill | Small `Tag`, bottom-end                                          |

Tap navigates to detail page. Long press enters bulk selection mode.

#### Swipe Actions (Mobile)

| Direction    | Action             | Condition                                                            |
| ------------ | ------------------ | -------------------------------------------------------------------- |
| Start-to-end | Confirm (if draft) | `status === 'draft'`                                                 |
| End-to-start | Delete / Cancel    | `status === 'draft'` for delete, `status === 'confirmed'` for cancel |

### Detail Page (< md)

- Tabs convert to `Collapse` (accordion) panels per MOBILE-DESIGN.md
- First panel (Lines) auto-expanded
- Action buttons move to sticky bottom bar (56px height + safe area)
- Lines table renders as stacked cards with: product name, qty, price, total per card
- Totals section full-width below the line cards

### Fast-Create (< sm / 640px)

Converts to bottom sheet per MOBILE-DESIGN.md:

- Slides up from bottom
- Snap point: 90% height
- Drag handle at top (32px wide, 4px tall, centered)
- Dismissible by dragging below 25% or tapping backdrop

---

## 10. i18n Keys

All keys follow the flat dot-notation pattern. Must be added to both `client/src/i18n/en.ts` and `client/src/i18n/ar.ts`.

### Sales Orders Keys

| Key                                 | English                                                                                           | Arabic                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `salesOrders.title`                 | Sales Orders                                                                                      | اوامر البيع                                                                 |
| `salesOrders.create`                | New Sales Order                                                                                   | طلب بيع جديد                                                                |
| `salesOrders.searchPlaceholder`     | Search by order number or customer...                                                             | البحث برقم الطلب أو العميل...                                               |
| `salesOrders.empty.title`           | No sales orders yet                                                                               | لا توجد اوامر بيع بعد                                                       |
| `salesOrders.empty.description`     | Create your first sales order to start tracking revenue                                           | أنشئ أول طلب بيع لبدء تتبع الإيرادات                                        |
| `salesOrders.fastCreate.title`      | New Sales Order                                                                                   | طلب بيع جديد                                                                |
| `salesOrders.fastCreate.subtitle`   | Create a quick sales order                                                                        | إنشاء طلب بيع سريع                                                          |
| `salesOrders.subtotal`              | Subtotal                                                                                          | المجموع الفرعي                                                              |
| `salesOrders.discount`              | Discount                                                                                          | الخصم                                                                       |
| `salesOrders.tax`                   | Tax (15%)                                                                                         | ضريبة (15%)                                                                 |
| `salesOrders.total`                 | Total                                                                                             | الإجمالي                                                                    |
| `salesOrders.confirm`               | Confirm Order                                                                                     | تأكيد الطلب                                                                 |
| `salesOrders.cancel`                | Cancel Order                                                                                      | إلغاء الطلب                                                                 |
| `salesOrders.createInvoice`         | Create Invoice                                                                                    | إنشاء فاتورة                                                                |
| `salesOrders.createDelivery`        | Create Delivery                                                                                   | إنشاء تسليم                                                                 |
| `salesOrders.addLine`               | + Add a line                                                                                      | + إضافة بند                                                                 |
| `salesOrders.noCustomer`            | No customer                                                                                       | بدون عميل                                                                   |
| `salesOrders.confirmDialog.title`   | Confirm Sales Order                                                                               | تأكيد طلب البيع                                                             |
| `salesOrders.confirmDialog.message` | Are you sure you want to confirm this sales order? This will reserve stock for storable products. | هل أنت متأكد من تأكيد هذا الطلب؟ سيتم حجز المخزون للمنتجات القابلة للتخزين. |
| `salesOrders.cancelDialog.title`    | Cancel Sales Order                                                                                | إلغاء طلب البيع                                                             |
| `salesOrders.cancelDialog.message`  | Cancel this sales order? This will void all reservations.                                         | إلغاء هذا الطلب؟ سيتم إلغاء جميع الحجوزات.                                  |
| `salesOrders.creditLimitExceeded`   | Credit limit exceeded                                                                             | تم تجاوز حد الائتمان                                                        |
| `salesOrders.creditLimitBlocked`    | Credit limit exceeded -- order cannot be confirmed                                                | تم تجاوز حد الائتمان -- لا يمكن تأكيد الطلب                                 |

### Quotation Keys

| Key                                | English                                                  | Arabic                                |
| ---------------------------------- | -------------------------------------------------------- | ------------------------------------- |
| `quotations.title`                 | Quotations                                               | عروض الأسعار                          |
| `quotations.create`                | New Quotation                                            | عرض سعر جديد                          |
| `quotations.confirmAsOrder`        | Confirm as Sales Order                                   | تأكيد كطلب بيع                        |
| `quotations.confirmDialog.message` | Convert this quotation to a confirmed sales order?       | تحويل عرض السعر هذا إلى طلب بيع مؤكد؟ |
| `quotations.empty.title`           | No quotations yet                                        | لا توجد عروض أسعار بعد                |
| `quotations.empty.description`     | Create your first quotation to start your sales pipeline | أنشئ أول عرض سعر لبدء تتبع المبيعات   |

### Status Labels

| Key                           | English      | Arabic           |
| ----------------------------- | ------------ | ---------------- |
| `status.salesOrder.draft`     | Draft        | مسودة            |
| `status.salesOrder.confirmed` | Confirmed    | مؤكد             |
| `status.salesOrder.done`      | Done         | مكتمل            |
| `status.salesOrder.cancelled` | Cancelled    | ملغي             |
| `status.invoice.nothing`      | Not Invoiced | غير مفوتر        |
| `status.invoice.to_invoice`   | To Invoice   | بانتظار الفاتورة |
| `status.invoice.invoiced`     | Invoiced     | مفوتر            |
| `status.delivery.pending`     | Pending      | بانتظار التسليم  |
| `status.delivery.partial`     | Partial      | تسليم جزئي       |
| `status.delivery.done`        | Delivered    | تم التسليم       |

### Column Headers

| Key                      | English         | Arabic          |
| ------------------------ | --------------- | --------------- |
| `columns.orderNumber`    | Order No.       | رقم الطلب       |
| `columns.customer`       | Customer        | العميل          |
| `columns.date`           | Date            | التاريخ         |
| `columns.amount`         | Amount          | المبلغ          |
| `columns.status`         | Status          | الحالة          |
| `columns.invoiceStatus`  | Invoice Status  | حالة الفاتورة   |
| `columns.deliveryStatus` | Delivery Status | حالة التسليم    |
| `columns.salesperson`    | Salesperson     | مندوب المبيعات  |
| `columns.product`        | Product         | المنتج          |
| `columns.description`    | Description     | الوصف           |
| `columns.quantity`       | Qty             | الكمية          |
| `columns.unitPrice`      | Unit Price      | سعر الوحدة      |
| `columns.discountPct`    | Disc. %         | نسبة الخصم      |
| `columns.taxRate`        | Tax %           | الضريبة         |
| `columns.lineTotal`      | Total           | الإجمالي        |
| `columns.qtyDelivered`   | Qty Delivered   | الكمية المسلمة  |
| `columns.qtyInvoiced`    | Qty Invoiced    | الكمية المفوترة |
