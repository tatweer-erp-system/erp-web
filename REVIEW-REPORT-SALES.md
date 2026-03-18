# Sales Module Code Review Report

**Reviewer:** Agent 15 (Code Review & Consistency)
**Date:** 2026-03-18
**Module:** Sales Orders (quotations, orders, detail pages, hooks, API layer)

---

## Section 1: Critical Issues Found and Fixed

### 1.1 Data Access Bug in Detail Pages — `useSalesOrder` / `useQuotation` hooks

**Files:** `client/src/hooks/queries/useSalesOrders.ts`
**Severity:** Critical (runtime crash)

The `getSalesOrder()` API function returns `ApiResponse<SalesOrder>` (shape: `{ data: SalesOrder, success: boolean }`). The hooks returned the full `ApiResponse` wrapper, but the detail pages destructured `data: order` and accessed `order.status`, `order.lines`, etc. directly --- which would fail at runtime because those properties live on `order.data`, not `order`.

**Fix:** Added `select: (res) => res.data` to both `useSalesOrder` and `useQuotation` hooks so the unwrapped `SalesOrder` object is returned to consumers.

### 1.2 Route Path Mismatch — Navigation Broken

**Files:** `client/src/shared/constants/routes.ts`, `client/src/pages/sales/SalesOrderDetailPage.tsx`, `client/src/pages/sales/QuotationDetailPage.tsx`
**Severity:** Critical (broken navigation)

`ROUTES.orderDetail(id)` generated `/all-orders/${id}` and `ROUTES.quotationDetail(id)` generated `/quotations/${id}`, but the actual route definitions in `lib/routes.tsx` use `/sales/orders/:id` and `/sales/quotations/:id`. Clicking a sales order row or confirming a quotation would navigate to a 404.

Additionally, `SalesOrderDetailPage` hardcoded `"/all-orders"` and `"/"` for back navigation, and `QuotationDetailPage` hardcoded `"/quotations"` and `"/sales/orders/${id}"`.

**Fix:**

- Updated `ROUTES.orderDetail` to generate `/sales/orders/${id}`
- Updated `ROUTES.quotationDetail` to generate `/sales/quotations/${id}`
- Replaced all hardcoded path strings in both detail pages with `ROUTES.*` constants

### 1.3 Inconsistent `getName` Import Path

**Files:** `client/src/components/sales/OrderLinesTable.tsx`, `client/src/components/sales/SalesOrderCard.tsx`
**Severity:** Medium (works but inconsistent)

Two components imported `getName` from `@/lib/utils` while `SalesOrderFastCreateFields` imported from `@/shared/utils/getName.util`. Both export the same function, but CLAUDE.md specifies `@/shared/utils/getName.util` as the canonical location.

**Fix:** Updated `OrderLinesTable` and `SalesOrderCard` to import from `@/shared/utils/getName.util`.

### 1.4 Hardcoded Enum String in `OrderTotals`

**File:** `client/src/components/sales/OrderTotals.tsx`
**Severity:** Medium (violates enum rule)

The comparison `discountType === "percentage"` used a hardcoded string instead of `SalesDiscountType.PERCENTAGE`.

**Fix:** Imported `SalesDiscountType` from `@/constants/enums` and replaced the hardcoded string comparison.

---

## Section 2: Non-Critical Issues (Next Iteration)

### 2.1 Hardcoded Color Values in Stats Components

**Files:** `SalesOrdersStats.tsx`, `QuotationStats.tsx`
Colors like `#8b5cf6`, `#f59e0b`, `#3b82f6`, `#10b981` are hardcoded inline. Per CLAUDE.md, colors should use CSS variables or Tailwind tokens. These are icon accent colors inside stat cards -- functional but should be moved to theme tokens.

### 2.2 Export Format Labels Not i18n'd

**Files:** `SalesOrdersToolbar.tsx`, `Quotations.tsx` (QuotationsToolbar)
Dropdown items for CSV, Excel, PDF use hardcoded English labels. These are universally recognized acronyms but should still use `t()` for consistency.

### 2.3 `SalesOrdersBulkBar` Uses Wrong i18n Key for "Selected" Count

**File:** `SalesOrdersBulkBar.tsx`
The bulk bar uses `t("sales.column.status", lang)` to label the selected count, which translates to "Status" / "الحالة" -- it should say something like "selected" / "محدد".

### 2.4 Duplicate "Edit" Label in Dropdown Actions

**Files:** `AllOrders.tsx`, `Quotations.tsx`
In the action dropdown, both "View" and "Edit" actions use the same label `t("sales.action.edit", lang)`. The "view" action should use a distinct label like "View" / "عرض".

### 2.5 `SalesOrdersBulkBar` "Clear" Button Uses Wrong Label

**File:** `SalesOrdersBulkBar.tsx`
The clear selection button uses `t("sales.filter.allStatuses", lang)` ("All Statuses") instead of a proper "Clear selection" label.

### 2.6 Backend FilterDTO Missing Fields

**Backend file:** `erp-api/src/modules/sales/dto/filter-sales-order.dto.ts`
The frontend sends `invoiceStatus`, `deliveryStatus`, and `salespersonId` filter params, but the backend DTO only defines `status`, `partnerId`, `branchId`, `dateFrom`, `dateTo`. These extra params will be silently stripped by `whitelist: true`. The frontend filtering for invoice/delivery status appears to work only client-side (via the segmented controls), which is misleading.

### 2.7 Magic Number `DEFAULT_VAT_RATE = 15`

**File:** `SalesOrderFastCreate.tsx`
The VAT rate is hardcoded as `15`. Per CLAUDE.md, constants should live in `shared/constants/magic-numbers.ts`.

### 2.8 `AllOrders.tsx` Over 285 Lines

**File:** `client/src/pages/AllOrders.tsx`
The file is 285 lines, which is under the 300-line file limit but close. The `buildActions` helper function is defined at module scope alongside the component, which is fine.

### 2.9 `Quotations.tsx` Has Inline Sub-Components

**File:** `client/src/pages/Quotations.tsx` (275 lines)
Contains `QuotationsToolbar`, `QuotationsBulkBar`, and `QuotationsMobileGrid` as file-local subcomponents. These are acceptable per CLAUDE.md since they're small and only used in this file, but `QuotationsToolbar` duplicates much of `SalesOrdersToolbar`.

### 2.10 `SalesOrderDetailPage` Passes `order.confirmedAt` as `cancelledAt`

**File:** `SalesOrderDetailPage.tsx` line 197
`<SalesOrderStatusBar status={order.status} cancelledAt={order.confirmedAt} />` -- this passes `confirmedAt` as the `cancelledAt` prop. The `SalesOrder` type has no `cancelledAt` field (the entity uses `updatedAt` for cancelled orders), but the prop name is misleading. The `confirmedAt` date would be shown for cancelled orders too.

### 2.11 Hardcoded `"SAR"` Currency in Multiple Components

**Files:** `SalesOrderCard.tsx`, `CreditLimitBanner.tsx`, `OrderTotals.tsx`
The currency code "SAR" is hardcoded as a default. Should use the tenant's base currency from settings/context.

---

## Section 3: Missing Pieces

### 3.1 No Sales Order Edit/Form Page

There is no dedicated form page for creating or editing a full sales order (with multiple lines, discount, pricelist, etc.). The fast-create drawer only handles single-line orders. The `ORDER_CREATE` route points to `/all-orders/create` which has no route definition in `routes.tsx`. Similarly `QUOTATION_CREATE` points to `/quotations/create` with no route.

### 3.2 No Customer Name Resolution

The list pages and detail pages display `partnerId` (a UUID) instead of the customer name. A partner lookup or include is needed so that the customer name (nameEn/nameAr) appears in tables and detail views.

### 3.3 No Salesperson Name Resolution

Same as above -- `salespersonId` is displayed as a raw UUID.

### 3.4 Missing Permission Checks in Components

`SalesOrderDetailActions` does not check permissions before rendering action buttons. The user might see buttons they cannot use. Should use `usePermission('sales:manage')`.

### 3.5 No Print/Duplicate/Export PDF Implementation

The "More" dropdown in detail pages and the export dropdown in toolbars have handlers that are not wired up. These are UI shells only.

### 3.6 No Invoice/Delivery Tab Data

The `InvoicesTabContent` and `DeliveriesTabContent` components show placeholder empty states. They need to fetch and display linked invoices and deliveries for a given sales order.

### 3.7 Missing `SalesOrderFastCreate` Integration in List Pages

The `AllOrders.tsx` page navigates to `ROUTES.ORDER_CREATE` (a non-existent route) on "Create" button click, instead of opening the `SalesOrderFastCreate` drawer.

---

## Section 4: Production Readiness Assessment

### Overall Score: 6/10 -- Not Production Ready

**What works well:**

- Types, schemas, and enums are well-defined and consistent with the backend
- The API layer and hooks follow the project patterns cleanly
- i18n coverage is comprehensive -- all sales keys exist in both en.ts and ar.ts
- Component structure follows the CLAUDE.md guidelines (named exports, hooks order, RTL support)
- Ant Design patterns are used consistently (Cards, Tables, Tags, Steps)
- Mutation hooks correctly invalidate related cache keys
- Status badge component handles all three status types cleanly

**Blockers for production:**

1. **Route mismatch was critical** (fixed) -- navigation would have been completely broken
2. **Data access bug in detail hooks** (fixed) -- pages would crash on load
3. **No create/edit form page** -- users cannot create full orders, only single-line quick orders
4. **Customer/salesperson names not resolved** -- UUIDs shown to users
5. **No linked invoices/deliveries display** -- tabs show empty states only
6. **Backend filter DTO incomplete** -- frontend sends filters the backend ignores

**Recommended next steps (priority order):**

1. Add the full sales order create/edit form page
2. Implement customer/salesperson name resolution (join or lookup)
3. Add `invoiceStatus`, `deliveryStatus`, `salespersonId` to backend `FilterSalesOrderDto`
4. Wire up the `SalesOrderFastCreate` drawer to the list page create button
5. Implement invoice and delivery tab content with real data
6. Add permission guards to action buttons
7. Extract hardcoded constants (VAT rate, currency) to settings/context
