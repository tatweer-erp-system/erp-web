# Inventory & Warehouse Management -- Business Rules

> Reference document for frontend implementation of the Inventory module in Tatweer ERP Backoffice.
> All rules are derived from Odoo inventory behavior adapted to our stack.

---

## Table of Contents

1. [Delivery (Outbound Shipments)](#1-delivery-outbound-shipments)
2. [Receipt (Inbound Shipments)](#2-receipt-inbound-shipments)
3. [Inventory Adjustments](#3-inventory-adjustments)
4. [Internal Transfers](#4-internal-transfers)
5. [Stock Availability Display](#5-stock-availability-display)
6. [Product Rules](#6-product-rules)
7. [Reorder Rules](#7-reorder-rules)
8. [Lot, Serial & Expiry Tracking](#8-lot-serial--expiry-tracking)

---

## 1. Delivery (Outbound Shipments)

### 1.1 Status Flow

```
Draft --> Ready --> Done
                --> Cancelled
```

| Transition        | Trigger                     | Validations                                                            |
| ----------------- | --------------------------- | ---------------------------------------------------------------------- |
| Draft --> Ready   | User clicks "Mark as Ready" | Every line must have a product and qty_demand > 0                      |
| Ready --> Done    | User clicks "Validate"      | At least one line must have qty_done > 0; negative-stock check applies |
| Any --> Cancelled | User clicks "Cancel"        | Only allowed while status is Draft or Ready (not Done)                 |

### 1.2 Negative Stock Blocking

- The tenant setting `allowNegativeStock` controls whether deliveries can proceed when stock is insufficient.
- When `allowNegativeStock = false` (the default):
  - Block validation if `qty_demand > qty_available` for any storable product line.
  - Show an inline error on the blocked line: **"Insufficient stock. Available: {available}, Requested: {qtyDemand}."**
  - The Validate button must be disabled until all lines pass the check.
- When `allowNegativeStock = true`:
  - Show a warning banner (not a blocker): **"Warning: stock will go negative for {n} product(s)."**
  - Allow validation to proceed.

### 1.3 Stock Availability per Line

Display an **"Available"** column on every delivery line before and during validation.

| Condition                    | Color  | Meaning             |
| ---------------------------- | ------ | ------------------- |
| `qty_demand <= available`    | Green  | Fully available     |
| `0 < available < qty_demand` | Orange | Partially available |
| `available = 0`              | Red    | No stock            |

**Tooltip on the Available cell:**

```
On hand: {onHand}
Reserved: {reserved}
Available: {available}
```

- Available = On Hand - Reserved (reserved includes quantities committed to other confirmed deliveries).
- Refresh availability when the user changes the product or warehouse on a line.

### 1.4 Partial Delivery & Backorder

When the user clicks Validate and any line has `qty_done < qty_demand`:

1. Show a confirmation dialog:

   > **"Some items were partially delivered. Create backorder for remaining?"**
   >
   > | Product  | Demanded | Done | Remaining |
   > | -------- | -------- | ---- | --------- |
   > | Widget A | 10       | 7    | 3         |
   > | Widget B | 5        | 0    | 5         |
   >
   > **[Yes, create backorder]** -- **[No, close delivery]**

2. **Yes**: Validate current delivery with `qty_done` quantities. System creates a new delivery (status = Draft) with the remaining quantities and links it to the original via `backorderId`.
3. **No**: Validate current delivery with `qty_done` quantities. Remaining quantities are discarded -- no backorder created.

### 1.5 Validation Errors

| Condition                     | Error Message                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| All lines have `qty_done = 0` | "Cannot validate: no quantities were processed. Set done quantities on at least one line."        |
| Line missing product          | "Line {n}: product is required."                                                                  |
| Line missing quantity         | "Line {n}: demanded quantity must be greater than zero."                                          |
| Negative stock blocked        | "Line {n}: insufficient stock for {productName}. Available: {available}, Requested: {qtyDemand}." |

### 1.6 Side Effects on Validate (Done)

- Creates one stock movement per line: type = OUT, deducts from source location.
- Updates `stock_levels` for each product/warehouse combination.
- If linked to a sale order, updates the sale order delivery status.
- Triggers low-stock alert if resulting quantity falls at or below the product's `reorderPoint`.

---

## 2. Receipt (Inbound Shipments)

### 2.1 Status Flow

```
Draft --> Ready --> Done
                --> Cancelled
```

Same transition rules as Delivery (section 1.1), with the addition of cost-related validations.

### 2.2 AVCO Recalculation Preview

Before the user confirms validation, show a cost preview panel per storable product line:

```
Product: Widget A
Current avg cost:   50.00 SAR  (current qty on hand: 100)
Receiving:          10 units at 60.00 SAR
New avg cost:       50.91 SAR
Formula:            (100 x 50.00 + 10 x 60.00) / (100 + 10) = 50.91
```

**Formula:**

```
newAvgCost = (currentQty * currentAvgCost + receiptQty * receiptUnitCost)
           / (currentQty + receiptQty)
```

**Edge case -- first receipt (currentQty = 0):**

```
newAvgCost = receiptUnitCost
```

- The preview is read-only and informational -- the user cannot edit the calculated cost.
- Show the preview in a summary section above the Validate button or in a confirmation dialog.

### 2.3 Lot & Serial Number Input

**Lot-tracked products:**

- Show a "Lot Number" text field and an "Expiry Date" date picker on each receipt line.
- Multiple units on the same line can share the same lot number.
- Lot number is required before validation for lot-tracked products.
- If the lot already exists, auto-fill expiry date from the existing lot record.

**Serial-tracked products:**

- Show one serial number input field per unit. If `qty_done = 5`, render 5 serial input fields.
- Each serial number must be unique within the tenant for that product.
- Duplicate serial detection: validate on blur and on form submit. Show inline error: **"Serial number {sn} already exists."**
- Serial number is required before validation for serial-tracked products.

**Layout recommendation:**

- For qty <= 10: show inline serial fields in an expandable section on the line.
- For qty > 10: open a modal with a scrollable list of serial fields and a "Scan barcode" input at the top for rapid entry.

### 2.4 Purchase Order Link

When a receipt is created from a purchase order:

- Show a read-only "Source PO" reference field linking to the PO (clickable, navigates to PO detail).
- Lines are auto-populated from the PO lines (product, qty_demand, unit cost).
- The user can adjust `qty_done` (partial receipt) but cannot add products not on the PO.
- After validation, update the PO's receipt status (partially received / fully received).

### 2.5 Side Effects on Validate (Done)

- Creates one stock movement per line: type = IN, adds to destination location.
- Updates `stock_levels` for each product/warehouse combination.
- Recalculates AVCO for each storable product.
- Creates an accounting journal entry: DR Inventory, CR Goods Received / Accounts Payable.
- If linked to a PO, updates the PO delivery status.

---

## 3. Inventory Adjustments

### 3.1 Adjustment Types

| Type     | Direction | Description                                              |
| -------- | --------- | -------------------------------------------------------- |
| Increase | Positive  | Adds stock (found extra inventory, returns, corrections) |
| Decrease | Negative  | Removes stock (damaged, stolen, spoiled, corrections)    |

### 3.2 Required Fields

| Field     | Required | Notes                                      |
| --------- | -------- | ------------------------------------------ |
| Product   | Yes      | Only storable products can be adjusted     |
| Warehouse | Yes      | The warehouse where the adjustment applies |
| Quantity  | Yes      | Must be > 0 (direction determined by type) |
| Reason    | Yes      | Select from predefined list (see 3.3)      |
| Notes     | No       | Free text for additional context           |

### 3.3 Predefined Adjustment Reasons

**Increase reasons:**

- Physical count correction
- Found inventory
- Customer return (non-POS)
- Transfer correction
- Other (increase)

**Decrease reasons:**

- Physical count correction
- Damaged goods
- Theft / loss
- Expired goods
- Transfer correction
- Other (decrease)

> Reasons are bilingual (English + Arabic). The user selects from a dropdown filtered by the adjustment type (increase or decrease).

### 3.4 Before/After Preview

Show a preview panel before the user confirms:

**Increase example:**

```
Product:              Widget A
Warehouse:            Main Warehouse
Qty before:           50
Adjustment:           +10
Qty after:            60
Inventory value change: +5,000.00 SAR (10 units x 500.00 SAR avg cost)
New avg cost:         recalculated (see formula below)
```

**Decrease example:**

```
Product:              Widget A
Warehouse:            Main Warehouse
Qty before:           50
Adjustment:           -6
Qty after:            44
Inventory value change: -3,000.00 SAR (6 units x 500.00 SAR avg cost)
Avg cost:             unchanged (500.00 SAR)
```

### 3.5 AVCO Impact

- **Positive adjustment:** Recalculates weighted average cost. The cost used for the incoming units is the current average cost (since no purchase price is available).
  - `newAvgCost = (currentQty * currentAvgCost + adjustmentQty * currentAvgCost) / (currentQty + adjustmentQty)`
  - This simplifies to: `newAvgCost = currentAvgCost` (unchanged for same-cost adjustments).
  - If the user provides an override cost (optional field), use that instead:
    `newAvgCost = (currentQty * currentAvgCost + adjustmentQty * overrideCost) / (currentQty + adjustmentQty)`
- **Negative adjustment:** Always uses the current average cost. AVCO does not change.

### 3.6 Side Effects on Confirm

- Creates a stock movement: type = ADJUSTMENT (IN or OUT depending on direction).
- Updates `stock_levels` for the product/warehouse combination.
- Creates an accounting journal entry:
  - Increase: DR Inventory Asset, CR Inventory Adjustment (expense/income account).
  - Decrease: DR Inventory Adjustment, CR Inventory Asset.
- Triggers low-stock alert if `quantityAfter <= reorderPoint`.
- Records audit log entry with user, timestamp, reason, and before/after quantities.

### 3.7 Validation Errors

| Condition                                           | Error Message                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| No product selected                                 | "Product is required."                                               |
| Product is not storable                             | "Only storable products can be adjusted."                            |
| No warehouse selected                               | "Warehouse is required."                                             |
| Quantity is 0 or negative                           | "Adjustment quantity must be greater than zero."                     |
| No reason selected                                  | "Adjustment reason is required."                                     |
| Decrease > on-hand and `allowNegativeStock = false` | "Cannot decrease below zero. On hand: {onHand}, Adjustment: -{qty}." |

---

## 4. Internal Transfers

### 4.1 Transfer Flow

```
Draft --> Ready --> Done
                --> Cancelled
```

### 4.2 Core Validations

| Rule                                            | Error Message                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Source and destination warehouse must differ    | "Source and destination warehouse cannot be the same."                               |
| `qty > available` at source (storable products) | "Insufficient stock at {sourceWarehouse}. Available: {available}, Requested: {qty}." |
| Product is not storable                         | "Only storable products can be transferred."                                         |
| Qty must be > 0                                 | "Transfer quantity must be greater than zero."                                       |

### 4.3 Available Stock Display

- Show the available stock at the **source warehouse** for the selected product on each line.
- Update dynamically when the user changes the product or source warehouse.
- Format: **"Available at {warehouseName}: {available}"** displayed below or beside the quantity field.

### 4.4 Lot/Serial Tracking on Transfers

- **Lot-tracked products:** User must select which lot(s) to transfer. Show a lot picker with available lots and their quantities at the source.
- **Serial-tracked products:** User must select specific serial numbers to transfer. Show a serial picker listing available serials at the source warehouse.
- Validation: selected lots/serials must exist at the source warehouse and have sufficient quantity.

### 4.5 Side Effects on Validate (Done)

- Creates **two** stock movements:
  1. Type = OUT from source warehouse.
  2. Type = IN to destination warehouse.
- Updates `stock_levels` for both warehouses.
- AVCO is not affected (internal transfer does not change product cost).
- Triggers low-stock alert at source warehouse if resulting quantity falls at or below `reorderPoint`.
- Records audit log with source, destination, products, quantities, and user.

### 4.6 Partial Transfer

Same backorder logic as Delivery (section 1.4):

- If `qty_done < qty_demand` on any line, prompt for backorder creation.
- Backorder is a new transfer in Draft status with the remaining quantities.

---

## 5. Stock Availability Display

### 5.1 Sale Order Lines

On each sale order line, display stock availability next to the product field.

| Condition                  | Color  | Label                                |
| -------------------------- | ------ | ------------------------------------ |
| `available >= orderQty`    | Green  | "In stock"                           |
| `0 < available < orderQty` | Orange | "Partial: {available} of {orderQty}" |
| `available = 0`            | Red    | "Out of stock"                       |

**Tooltip on hover:**

```
On hand:    {onHand}
Reserved:   {reserved}
Available:  {available}
Incoming:   {incoming}
```

- **On hand:** Total physical quantity in the warehouse.
- **Reserved:** Quantity committed to confirmed deliveries/orders.
- **Available:** On Hand - Reserved.
- **Incoming:** Quantity expected from confirmed purchase orders not yet received.

### 5.2 Product Detail Page -- Stock Tab

Show a table with one row per warehouse:

| Column    | Description               |
| --------- | ------------------------- |
| Warehouse | Warehouse name            |
| On Hand   | Physical quantity         |
| Reserved  | Committed to orders       |
| Available | On Hand - Reserved        |
| Incoming  | From confirmed POs        |
| Outgoing  | From confirmed deliveries |

- Include a **total row** at the bottom summing all warehouses.
- Consumable and service products do not show the Stock tab.
- For products with variants, show stock per variant (each variant is a separate row grouped under the warehouse).

### 5.3 Stock Dashboard Widget

- Show total inventory value (sum of all storable products: qty \* avgCost).
- Show count of products below reorder point.
- Show count of products with zero stock.
- Clicking each metric navigates to a filtered product list.

---

## 6. Product Rules

### 6.1 Product Types

| Type       | Tracks Stock  | Delivery Line | Stock Tab     | Adjustment    | Notes                                              |
| ---------- | ------------- | ------------- | ------------- | ------------- | -------------------------------------------------- |
| Storable   | Yes           | Yes           | Yes           | Yes           | Full inventory management                          |
| Consumable | No            | Yes           | No            | No            | Always treated as available                        |
| Service    | No            | No            | No            | No            | Invoice only, no physical handling                 |
| Combo      | Components do | Yes           | Components do | Components do | Sold as one unit, components deducted individually |

### 6.2 Storable Product Rules

- Validates stock availability on delivery (see section 1).
- Stock updated on receipt, delivery, adjustment, and transfer.
- AVCO recalculated on receipt and positive adjustment.
- Low-stock alerts triggered when `qty <= reorderPoint`.

### 6.3 Consumable Product Rules

- No stock tracking -- the Stock tab is hidden.
- Never blocked on delivery regardless of `allowNegativeStock` setting.
- Does not appear in stock reports, adjustment forms, or transfer forms.

### 6.4 Service Product Rules

- No stock, no delivery line.
- Does not appear in the kitchen display (restaurant context).
- Cannot be added to receipts, adjustments, or transfers.
- Can only be invoiced (from sale order or manually).

### 6.5 Combo Product Rules

- Displayed and sold as a single line item on orders.
- On the product detail page, show a **"Components"** tab listing:
  | Component Product | Required Qty | UoM | Available Stock |
  |---|---|---|---|
  | Burger Patty | 1 | pc | 120 |
  | Bun | 1 | pc | 200 |
  | Cheese Slice | 2 | pc | 340 |
- On delivery validation, each component is deducted individually from stock.
- Stock availability for a combo = `min(available_of_component / required_qty_of_component)` for all components.
- If any component has insufficient stock (and `allowNegativeStock = false`), block the delivery.
- Show which component is blocking: **"Insufficient stock for combo component: {componentName}. Available: {available}, Required: {required}."**

### 6.6 Product Variants

- A product with variants (e.g., T-shirt with size/color) **cannot be sold directly** -- the user must select a specific variant.
- On sale order or POS, when the user selects a parent product with variants:
  - Show a variant selector (grid or dropdown depending on attribute count).
  - Each variant has its own: SKU, barcode, price, and independent stock level.
- On the product list, show the parent product with an indicator: **"{n} variants"**.
- Stock tab on the parent shows aggregated stock across all variants, with a breakdown per variant.

### 6.7 SKU & Barcode Uniqueness

| Field   | Required | Unique Scope             | Error Message                                               |
| ------- | -------- | ------------------------ | ----------------------------------------------------------- |
| SKU     | Yes      | Per tenant               | "SKU '{sku}' is already in use."                            |
| Barcode | No       | Per tenant (if provided) | "Barcode '{barcode}' is already assigned to {productName}." |

- SKU uniqueness applies across all product types, including variants.
- Barcode uniqueness includes variants (each variant can have its own barcode).
- Validation on blur + on form submit.

---

## 7. Reorder Rules

### 7.1 Low Stock Alert Panel

Display a "Low Stock" panel on the inventory dashboard showing all products where `currentQty <= reorderPoint`.

**Per product row:**

| Element       | Display                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| Product name  | Text link (navigates to product detail)                                     |
| Current qty   | Red text                                                                    |
| Reorder point | Gray text                                                                   |
| Visual bar    | Bar graph showing current qty relative to reorder point and max stock level |
| Warehouse     | Which warehouse is low                                                      |

**Bar graph segments:**

```
[===current(red)===|---reorder point(gray)---|          max stock level          ]
```

- Sort by urgency: products with the largest deficit (`reorderPoint - currentQty`) first.
- Show a badge count on the "Inventory" sidebar menu item: **"{n} low stock"**.

### 7.2 Suggested Reorder (Purchase Order)

When the user clicks **"Suggest reorder"** on a low-stock product:

1. Calculate suggested quantity: `suggestedQty = maxStockLevel - currentQty`.
2. If no `maxStockLevel` is set, default to: `suggestedQty = reorderPoint * 2 - currentQty`.
3. Pre-fill a draft Purchase Order:
   - Vendor: default supplier for the product (from `supplier_products` table). If no default, leave blank for user selection.
   - Product: the low-stock product.
   - Quantity: `suggestedQty`.
   - Unit cost: last purchase price from the most recent PO line for this product.
4. Navigate the user to the PO creation form with pre-filled data.

### 7.3 Bulk Reorder

- On the Low Stock panel, allow selecting multiple products.
- **"Create PO for selected"** button groups products by their default supplier and creates one draft PO per supplier.
- Products without a default supplier are grouped into a separate PO with no vendor (user must assign).

---

## 8. Lot, Serial & Expiry Tracking

### 8.1 Tracking Modes

| Mode            | Setting on Product      | Behavior                             |
| --------------- | ----------------------- | ------------------------------------ |
| No tracking     | Default                 | No lot/serial fields shown           |
| Lot tracking    | `trackingType = lot`    | Multiple units share a lot number    |
| Serial tracking | `trackingType = serial` | Each unit has a unique serial number |

### 8.2 Lot Tracking Rules

- A lot number is a free-text identifier (e.g., "LOT-2026-0001").
- Multiple units of the same product can share one lot number.
- Lots are scoped to a product within a tenant (same lot number can exist for different products).
- On receipt: user enters lot number + optional expiry date.
- On delivery/transfer: user selects from available lots at the source warehouse.
- Lot picker shows: lot number, expiry date, available qty.

### 8.3 Serial Tracking Rules

- Each serial number is unique per product within a tenant.
- One serial number = exactly one unit of a product.
- On receipt: user enters one serial number per unit received. If `qty_done = 5`, show 5 input fields.
- On delivery/transfer: user selects specific serial numbers from available serials at the source.
- Serial picker shows: serial number, lot (if applicable), warehouse location.
- Inline error on duplicate: **"Serial number '{sn}' already exists for this product."**

### 8.4 Expiry Date Rules

| Condition                | Visual               | Behavior              |
| ------------------------ | -------------------- | --------------------- |
| Expiry > 30 days away    | No indicator         | Normal                |
| Expiry <= 30 days away   | Orange warning badge | "Expires in {n} days" |
| Expired (expiry < today) | Red badge            | "Expired"             |

**Expired product sale blocking (default behavior):**

- When a user tries to deliver an expired product, block validation with: **"Product '{name}' (Lot: {lot}) has expired on {expiryDate}. Remove or replace the expired lot."**
- This applies to lot-tracked products with expiry dates. Non-tracked products do not have expiry enforcement.

**Expiry in receipts:**

- If the user enters an expiry date that is already in the past, show a warning (not a blocker): **"Warning: expiry date is in the past."**
- Allow receipt of already-expired goods (they may be intentionally received for disposal).

### 8.5 Traceability View

Clicking a serial number or lot number opens a **traceability timeline** showing the full lifecycle:

```
Purchase Order PO-00123 (2026-01-15)
  |
  v
Receipt REC-00456 (2026-01-17) -- Received at Main Warehouse
  |
  v
Transfer TRF-00012 (2026-02-01) -- Main Warehouse --> Branch A Warehouse
  |
  v
Delivery DEL-00089 (2026-03-10) -- Shipped to Customer (SO-00234)
```

**Each node shows:**

- Document type and reference number (clickable link).
- Date.
- Warehouse / location.
- Quantity (for lots with multiple units).
- User who performed the action.

**For serial-tracked products:** The timeline shows the complete chain for that single unit.

**For lot-tracked products:** The timeline shows all movements for the lot, with quantities at each step.

---

## Appendix A: Stock Calculation Reference

```
On Hand     = sum of all stock movements IN - sum of all stock movements OUT
Reserved    = sum of qty_demand on confirmed (Ready status) deliveries not yet validated
Available   = On Hand - Reserved
Incoming    = sum of qty_demand on confirmed purchase orders not yet received
Outgoing    = sum of qty_demand on confirmed deliveries not yet validated (same as Reserved)
```

## Appendix B: AVCO Formula Reference

```
Weighted Average Cost (on receipt):
  newAvgCost = (currentQty * currentAvgCost + receiptQty * unitCost) / (currentQty + receiptQty)

Weighted Average Cost (on positive adjustment with override cost):
  newAvgCost = (currentQty * currentAvgCost + adjustQty * overrideCost) / (currentQty + adjustQty)

Weighted Average Cost (on positive adjustment without override):
  newAvgCost = currentAvgCost  (unchanged)

Negative adjustment / delivery / transfer:
  avgCost = unchanged (uses current avg cost for valuation)

Edge case -- first receipt or qty was 0:
  newAvgCost = receiptUnitCost (or overrideCost for adjustments)
```

## Appendix C: Color Code Reference

| Context            | Green               | Orange              | Red                 |
| ------------------ | ------------------- | ------------------- | ------------------- |
| Stock availability | Fully available     | Partially available | No stock            |
| Expiry             | > 30 days           | <= 30 days          | Expired             |
| Low stock bar      | Above reorder point | At reorder point    | Below reorder point |
