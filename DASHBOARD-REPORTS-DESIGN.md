# Dashboard & Reports — UI Design Specification

> **Stack:** React 19 + Ant Design 6 + recharts + Tailwind CSS v4
> **Target market:** Saudi Arabia (SAR currency, VAT 15%, ZATCA compliance)
> **Bilingual:** All labels use `t()` i18n keys, RTL-aware layout

---

## Table of Contents

1. [Dashboard Page](#1-dashboard-page)
2. [Report Pages](#2-report-pages)
3. [Filter Bar (Shared)](#3-filter-bar-shared)
4. [Print / Export Layout](#4-print--export-layout)

---

## 1. Dashboard Page

**Route:** `/dashboard`
**Permission:** `dashboard:read`
**Data fetching:** React Query, each widget has its own query key for independent loading/error states.

### 1.1 KPI Cards Row

**Layout:** Ant Design `Row` + `Col` — `xs={24}` (1/row mobile), `sm={12}` (2/row tablet), `xl={4.8}` (5/row desktop, use `flex` basis).
**Component:** `<KpiCard />` — reusable, accepts `title`, `value`, `suffix`, `trend`, `trendLabel`, `sparklineData`, `icon`, `color`, `loading`.

| #   | Card            | Value                                                    | Trend                                                          | Sparkline                                                                                        | Icon                        | Color Token                                               |
| --- | --------------- | -------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------- | --------------------------------------------------------- |
| 1   | Today's Revenue | SAR formatted (`toLocaleString('en-SA')`)                | `% change from yesterday` — green if positive, red if negative | 7-day mini area chart (recharts `<AreaChart>` 120x40px, no axes, fill with 10% opacity of color) | `DollarOutlined`            | `colorSuccess` (#52c41a)                                  |
| 2   | Open Invoices   | Count (bold) + total SAR (secondary text)                | Trend arrow up/down vs last week                               | None                                                                                             | `FileTextOutlined`          | `colorWarning` (#faad14)                                  |
| 3   | Overdue AR      | Total SAR (bold) + count of overdue invoices (secondary) | None — static urgency indicator                                | None                                                                                             | `ExclamationCircleOutlined` | `colorError` (#ff4d4f) if count > 10, else `colorWarning` |
| 4   | Cash Balance    | Total SAR across all treasury accounts                   | "Last updated: HH:mm" timestamp below                          | None                                                                                             | `BankOutlined`              | `colorPrimary`                                            |
| 5   | Stock Value     | Total SAR inventory valuation                            | `% change from last month` — green/red                         | None                                                                                             | `ShopOutlined`              | `geekblue` (#2f54eb)                                      |

**Card design:**

```
+-----------------------------------------------+
|  [Icon circle]   Today's Revenue     [Trend]  |
|                  SAR 45,230.00                 |
|                  +12.5% vs yesterday           |
|  [========= sparkline area =========]         |
+-----------------------------------------------+
```

- Icon rendered inside a 40x40 circle with 10% opacity background of the card color
- Value is `fontSize: 28`, `fontWeight: 700`
- Trend badge: Ant Design `<Tag>` with `<ArrowUpOutlined />` or `<ArrowDownOutlined />`
- Card: Ant Design `<Card>` with `hoverable`, `borderRadius: 12`, subtle `boxShadow`
- Loading state: Ant Design `<Skeleton.Input active />` matching the card dimensions

**API endpoints:**

- `GET /api/v1/reporting/dashboard/kpis` — returns all 5 KPI values in one call
- `GET /api/v1/reporting/dashboard/revenue-sparkline` — returns 7-day revenue array

---

### 1.2 Charts Row 1 (Revenue vs Expenses + Top Customers)

**Layout:** `Row gutter={[24, 24]}` — two `Col span={12}` on desktop (`xl`), `span={24}` stacked on mobile/tablet.

#### 1.2.1 Revenue vs Expenses Area Chart

**Component:** recharts `<AreaChart>` inside Ant Design `<Card>`
**Data:** Monthly aggregates, last 12 months.

```
Card Title: "Revenue vs Expenses"
Card Extra: Period selector (dropdown: "Last 12 Months" | "Last 6 Months" | "YTD")

+--------------------------------------------------+
|  Revenue ████████████████████████                 |
|  Expenses ░░░░░░░░░░░░░░░░                       |
|                                                    |
|     ^                                              |
|  SAR|    /\      /\                                |
|     |   /  \    /  \    /\                         |
|     |  /    \  /    \  /  \   <- Revenue (green)   |
|     | /      \/      \/    \                       |
|     |/                      \                      |
|     |  ___    ___    ___     <- Expenses (red)     |
|     +----+----+----+----+-----> Month              |
|     Mar  Apr  May  Jun  Jul                        |
+--------------------------------------------------+
```

**Recharts config:**

- `<AreaChart width="100%" height={320}>`
- Revenue area: `fill="#52c41a"`, `fillOpacity={0.15}`, `stroke="#52c41a"`, `strokeWidth={2}`
- Expenses area: `fill="#ff4d4f"`, `fillOpacity={0.1}`, `stroke="#ff4d4f"`, `strokeWidth={2}`
- `<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />`
- `<XAxis dataKey="month" />` — formatted as "Mar", "Apr", etc.
- `<YAxis tickFormatter={(v) => \`${(v/1000).toFixed(0)}K\`} />`
- `<Tooltip>` — custom: white card, shows month, Revenue SAR formatted, Expenses SAR formatted
- `<Legend>` — bottom, inline, with colored circles

**API:** `GET /api/v1/reporting/dashboard/revenue-expenses?months=12`
**Response shape:**

```ts
{
  data: Array<{ month: string; revenue: number; expenses: number }>;
}
```

#### 1.2.2 Top 5 Customers Bar Chart

**Component:** recharts `<BarChart layout="vertical">` inside Ant Design `<Card>`

```
Card Title: "Top 5 Customers"
Card Extra: Period selector (This Month | This Quarter | This Year)

+--------------------------------------------------+
|  Al Rajhi Corp     ████████████████  SAR 125,000  |
|  Saudi Telecom     ████████████      SAR 98,000   |
|  Aramco Services   ████████          SAR 72,000   |
|  SABIC Trading     ██████            SAR 55,000   |
|  Maaden Co.        ████              SAR 38,000   |
+--------------------------------------------------+
```

**Recharts config:**

- `<BarChart layout="vertical" height={320}>`
- `<Bar dataKey="amount" fill={token.colorPrimary} barSize={28} radius={[0, 6, 6, 0]} />`
- `<XAxis type="number" tickFormatter={sarFormatter} />`
- `<YAxis type="category" dataKey="customerName" width={140} />`
- RTL: flip `radius` to `[6, 0, 0, 6]`, swap axis positioning
- `<Tooltip>` — customer name + SAR formatted amount

**API:** `GET /api/v1/reporting/dashboard/top-customers?period=this_month&limit=5`

---

### 1.3 Charts Row 2 (Aged AR + Inventory by Category)

**Layout:** Same `Row`/`Col` 50/50 split as Row 1.

#### 1.3.1 Aged AR Buckets Stacked Bar

**Component:** recharts `<BarChart>` with stacked bars inside Ant Design `<Card>`

```
Card Title: "Aged Receivables"
Card Extra: None (always current snapshot)

+--------------------------------------------------+
|          |                                        |
|          |  ██ 90+                                |
|    SAR   |  ██ 61-90                              |
|          |  ██ 31-60                               |
|          |  ██ 1-30                                |
|          |  ██ Current                             |
|          +----+----+----+----+----->              |
|          Jan  Feb  Mar  Apr  May                  |
+--------------------------------------------------+
```

**Bucket colors (green to dark-red gradient):**

| Bucket     | Color    | Hex       |
| ---------- | -------- | --------- |
| Current    | Green    | `#52c41a` |
| 1-30 days  | Yellow   | `#fadb14` |
| 31-60 days | Orange   | `#fa8c16` |
| 61-90 days | Red      | `#ff4d4f` |
| 90+ days   | Dark Red | `#a8071a` |

**Recharts config:**

- `<BarChart height={320}>`
- 5 stacked `<Bar>` components, one per bucket, `stackId="ar"`
- `<Tooltip>` — shows all 5 buckets with amounts
- `<Legend>` — bottom, all 5 buckets with color dots

**API:** `GET /api/v1/reporting/dashboard/aged-receivables`

#### 1.3.2 Inventory by Category Donut

**Component:** recharts `<PieChart>` with inner radius (donut) inside Ant Design `<Card>`

```
Card Title: "Inventory by Category"
Card Extra: None

+--------------------------------------------------+
|                                                    |
|            ██████████                              |
|         ███    Total   ███                         |
|        ██   SAR 1.2M    ██                         |
|         ███           ███                          |
|            ██████████                              |
|                                                    |
|  ● Electronics 32%  ● Food 24%  ● Beverages 18%  |
|  ● Supplies 12%  ● Cleaning 8%  ● Other 6%       |
+--------------------------------------------------+
```

**Config:**

- `<PieChart height={320}>`
- `<Pie innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">`
- Colors: cycle through `['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#8c8c8c']`
- Center label: custom `<text>` element showing total SAR formatted
- `<Label>` on each slice: percentage (hide if < 5%)
- `<Legend>` — bottom, 2 rows, wrap

**API:** `GET /api/v1/reporting/dashboard/inventory-by-category?limit=6`
Response returns top 6 categories; API aggregates the rest into "Other".

---

### 1.4 Quick Access Panels

**Layout:** `Row gutter={[24, 24]}` — four `Col span={6}` on desktop, `span={12}` on tablet, `span={24}` on mobile.
**Component:** `<QuickAccessPanel />` — reusable, accepts `title`, `icon`, `items`, `viewAllLink`, `columns`, `emptyText`.

Each panel is an Ant Design `<Card>` with a compact `<Table>` (no pagination, max 5 rows, `size="small"`).

#### 1.4.1 Overdue Invoices

| Column       | Width | Render                                                                                      |
| ------------ | ----- | ------------------------------------------------------------------------------------------- |
| Partner Name | 40%   | Text, ellipsis                                                                              |
| Amount       | 30%   | SAR formatted, `fontWeight: 600`                                                            |
| Days Overdue | 30%   | `<Tag color="red">` if > 60, `<Tag color="orange">` if > 30, `<Tag color="gold">` otherwise |

- Footer: `<Button type="link">` "View All" linking to `/accounting/invoices?status=overdue`
- API: `GET /api/v1/invoices?status=overdue&sort=dueDate:asc&limit=5`

#### 1.4.2 Pending Deliveries

| Column         | Width | Render                                               |
| -------------- | ----- | ---------------------------------------------------- |
| SO Number      | 30%   | Monospace, clickable link to `/sales/orders/:id`     |
| Partner        | 40%   | Text, ellipsis                                       |
| Scheduled Date | 30%   | Relative ("in 2 days", "tomorrow") — red if past due |

- Footer: "View All" linking to `/inventory/deliveries?status=pending`
- API: `GET /api/v1/deliveries?status=pending&sort=scheduledDate:asc&limit=5`

#### 1.4.3 Pending Leave Requests

| Column   | Width | Render                        |
| -------- | ----- | ----------------------------- |
| Employee | 40%   | Name with small avatar        |
| Dates    | 35%   | "Mar 15-18" compact format    |
| Type     | 25%   | `<Tag>` with leave type color |

- Footer: "View All" linking to `/hr/leaves?status=pending`
- API: `GET /api/v1/hr/leaves?status=pending&sort=createdAt:desc&limit=5`

#### 1.4.4 Reorder Alerts

| Column        | Width | Render            |
| ------------- | ----- | ----------------- |
| Product       | 40%   | Name, ellipsis    |
| Current Qty   | 30%   | Bold, red if zero |
| Reorder Point | 30%   | Gray text         |

- Footer: "View All" linking to `/inventory/products?belowReorder=true`
- API: `GET /api/v1/inventory/stock-levels?belowReorder=true&sort=currentQty:asc&limit=5`

---

## 2. Report Pages

All report pages share a common layout:

1. **Page header** — title + breadcrumb (Ant Design `<PageHeader>` equivalent)
2. **Filter bar** — sticky top, collapsible on mobile (see Section 3)
3. **Report content** — table or visualization
4. **Export bar** — fixed bottom-right FAB or inline in filter bar

### 2.1 Profit & Loss (Income Statement)

**Route:** `/accounting/reports/profit-loss`
**Permission:** `accounting:reports:read`

**Layout:**

```
+----------------------------------------------------------+
| [Filter Bar: Date Range | Branch | Cost Center | Compare] |
+----------------------------------------------------------+
|                                                            |
| INCOME STATEMENT                                           |
| Period: Jan 1, 2026 - Mar 17, 2026                        |
| Branch: All Branches                                       |
|                                                            |
| Code   Account              Current    Compare   Var   %  |
| ─────────────────────────────────────────────────────────  |
| ▼ REVENUE                   450,000    380,000  +70K  +18 |
|   ▼ Sales Revenue           420,000    360,000  +60K  +17 |
|     4100  Product Sales      350,000    300,000  +50K  +17 |
|     4200  Service Revenue     70,000     60,000  +10K  +17 |
|   ▶ Other Revenue            30,000     20,000  +10K  +50 |
|                                                            |
| ▼ EXPENSES                  320,000    290,000  +30K  +10 |
|   ▼ Cost of Goods Sold      180,000    170,000  +10K   +6 |
|     5100  COGS               180,000    170,000  +10K   +6 |
|   ▶ Operating Expenses      120,000    100,000  +20K  +20 |
|   ▶ Admin Expenses           20,000     20,000     0    0 |
|                                                            |
| ═══════════════════════════════════════════════════════════ |
| NET INCOME                  130,000     90,000  +40K  +44 |
| ═══════════════════════════════════════════════════════════ |
+----------------------------------------------------------+
```

**Table component:** Ant Design `<Table>` with `expandable` rows.

| Column         | Key           | Width | Align | Style                                                                      |
| -------------- | ------------- | ----- | ----- | -------------------------------------------------------------------------- |
| Code           | `code`        | 80px  | Left  | Monospace, gray for leaf rows                                              |
| Account        | `name`        | flex  | Left  | Bold for group rows, indented by depth (paddingInlineStart: depth \* 24px) |
| Current Period | `current`     | 140px | Right | SAR formatted, bold for group totals                                       |
| Compare Period | `compare`     | 140px | Right | SAR formatted (hidden if compare toggle off)                               |
| Variance       | `variance`    | 120px | Right | Green if positive revenue/negative expense, red otherwise                  |
| Variance %     | `variancePct` | 80px  | Right | With `%` suffix, same color logic                                          |

**Behavior:**

- Group rows (REVENUE, EXPENSES, sub-groups) are expandable with `▼`/`▶` toggle
- Leaf rows (individual accounts) are not expandable
- Group rows have `fontWeight: 700` and light gray background `#fafafa`
- Net Income row: `fontSize: 18`, `fontWeight: 700`, double border top, background `#f0f5ff`
- Negative values shown in parentheses: `(45,000)` with `color: #ff4d4f`
- Compare columns hidden by default, shown when "Compare with previous period" is toggled

**API:** `GET /api/v1/accounting/reports/profit-loss?startDate=...&endDate=...&branchId=...&costCenterId=...&compareStartDate=...&compareEndDate=...`

---

### 2.2 Balance Sheet

**Route:** `/accounting/reports/balance-sheet`
**Permission:** `accounting:reports:read`

**Layout:** Two-column on desktop (`Row` with two `Col span={12}`), stacked on mobile.

```
+----------------------------+-----------------------------+
|       ASSETS               |  LIABILITIES & EQUITY       |
+----------------------------+-----------------------------+
| ▼ Current Assets   250,000 | ▼ Current Liabilities 80,000|
|   1100 Cash         50,000 |   2100 Accounts Pay.  60,000|
|   1200 AR          120,000 |   2200 VAT Payable    20,000|
|   1300 Inventory    80,000 |                             |
|                            | ▼ Long-term Liab.    40,000|
| ▼ Non-Current      200,000 |   2500 Long-term Loan 40,000|
|   1500 Fixed Assets 200,000|                             |
|                            | ▼ Equity             330,000|
| ────────────────────────── |   3100 Capital       200,000|
| TOTAL ASSETS       450,000 |   3200 Retained      130,000|
|                            | ────────────────────────────|
|                            | TOTAL L+E            450,000|
+----------------------------+-----------------------------+
|  Balance Check: BALANCED (Assets = Liabilities + Equity) |
+----------------------------------------------------------+
```

**Each side:** Same expandable table structure as P&L.

| Column  | Width | Notes                         |
| ------- | ----- | ----------------------------- |
| Code    | 80px  | Monospace                     |
| Account | flex  | Indented by depth             |
| Balance | 140px | Right-aligned, SAR formatted  |
| Compare | 140px | Hidden unless compare toggled |

**Balance check banner:**

- Bottom of page, full width
- If balanced: green `<Alert type="success">` "Assets = Liabilities + Equity"
- If imbalanced: red `<Alert type="error">` "OUT OF BALANCE: Difference SAR X,XXX" with the difference amount

**API:** `GET /api/v1/accounting/reports/balance-sheet?asOfDate=...&branchId=...`

---

### 2.3 Trial Balance

**Route:** `/accounting/reports/trial-balance`
**Permission:** `accounting:reports:read`

**Table:** Ant Design `<Table>` with fixed header, horizontal scroll on mobile.

| Column         | Key             | Width            | Align | Notes         |
| -------------- | --------------- | ---------------- | ----- | ------------- |
| Code           | `code`          | 90px             | Left  | Monospace     |
| Account Name   | `name`          | flex (min 200px) | Left  |               |
| Opening Debit  | `openingDebit`  | 120px            | Right | SAR formatted |
| Opening Credit | `openingCredit` | 120px            | Right | SAR formatted |
| Period Debit   | `periodDebit`   | 120px            | Right | SAR formatted |
| Period Credit  | `periodCredit`  | 120px            | Right | SAR formatted |
| Closing Debit  | `closingDebit`  | 120px            | Right | SAR formatted |
| Closing Credit | `closingCredit` | 120px            | Right | SAR formatted |

**Footer row (totals):**

- `fontWeight: 700`, background `#f0f0f0`
- Sums for each numeric column
- If Opening Debit != Opening Credit: both cells highlighted `backgroundColor: '#fff2f0'` (light red)
- If Closing Debit != Closing Credit: same red highlight
- Below totals row: `<Alert type="error">` "Trial balance is out of balance by SAR X,XXX" — only shown when imbalanced

**API:** `GET /api/v1/accounting/reports/trial-balance?startDate=...&endDate=...&branchId=...&journalId=...`

---

### 2.4 Aged Receivables / Payables

**Route:** `/accounting/reports/aged-receivables` and `/accounting/reports/aged-payables`
**Permission:** `accounting:reports:read`

**Same component with `type` prop** (`receivables` | `payables`).

**Summary cards row (above table):**

| Card              | Value                 |
| ----------------- | --------------------- |
| Total Outstanding | SAR total, large font |
| Current (not due) | SAR amount, green     |
| 1-30 Days         | SAR amount, yellow    |
| 31-60 Days        | SAR amount, orange    |
| 61-90 Days        | SAR amount, red       |
| 90+ Days          | SAR amount, dark red  |

**Table:**

| Column  | Width            | Cell Style                                                                         |
| ------- | ---------------- | ---------------------------------------------------------------------------------- |
| Partner | flex (min 180px) | Bold, clickable link to partner detail                                             |
| Current | 110px            | `backgroundColor` intensity based on amount relative to row total — lightest green |
| 1-30    | 110px            | Light yellow background                                                            |
| 31-60   | 110px            | Light orange background                                                            |
| 61-90   | 110px            | Light red background                                                               |
| 90+     | 110px            | Dark red background, white text if amount > 0                                      |
| Total   | 120px            | `fontWeight: 700`                                                                  |

**Cell coloring logic:**

- Base color per bucket (as defined above)
- Opacity scales with the cell amount relative to the row total: `opacity = 0.1 + (cellAmount / rowTotal) * 0.6`
- Zero amounts: no background, show dash `—`

**API:** `GET /api/v1/accounting/reports/aged-receivables?asOfDate=...&branchId=...`

---

### 2.5 Inventory Valuation

**Route:** `/inventory/reports/valuation`
**Permission:** `inventory:reports:read`

**Summary bar (above table):**

- Total Stock Value: SAR large bold
- Total Products: count
- Total Categories: count

**Table:**

| Column           | Key          | Width | Sortable           | Notes                                                             |
| ---------------- | ------------ | ----- | ------------------ | ----------------------------------------------------------------- |
| Product          | `name`       | flex  | Yes                | Product name (bilingual: `nameEn`/`nameAr` based on current lang) |
| SKU              | `sku`        | 100px | Yes                | Monospace                                                         |
| Category         | `category`   | 140px | Yes                | Filterable dropdown in column header                              |
| Warehouse        | `warehouse`  | 140px | Yes                | Filterable dropdown in column header                              |
| Qty On Hand      | `qty`        | 100px | Yes                | Right-aligned, bold if zero (red)                                 |
| Unit Cost (AVCO) | `unitCost`   | 120px | Yes                | SAR formatted                                                     |
| Total Value      | `totalValue` | 130px | Yes (default desc) | SAR formatted, `fontWeight: 600`                                  |
| % of Total       | `pctOfTotal` | 90px  | Yes                | Progress bar + percentage label                                   |

**Features:**

- Column filters for Category and Warehouse (Ant Design `<Table>` built-in `filters` prop)
- `% of Total` rendered as mini Ant Design `<Progress percent={pct} size="small" />` inline
- Sortable by any column; default sort: Total Value descending
- Footer row: totals for Qty, Total Value

**API:** `GET /api/v1/inventory/reports/valuation?branchId=...&categoryId=...&warehouseId=...`

---

### 2.6 General Ledger

**Route:** `/accounting/reports/general-ledger`
**Permission:** `accounting:reports:read`

**Layout:** Grouped by account — each account is a collapsible section.

```
+----------------------------------------------------------+
| ▼ 1100 — Cash                        Opening: SAR 50,000 |
+----------------------------------------------------------+
| Date       | Entry #   | Description      | Debit | Credit | Balance  |
|------------|-----------|------------------|-------|--------|----------|
| 2026-03-01 | JE-00042  | Sales payment    | 5,000 |        | 55,000   |
| 2026-03-03 | JE-00045  | Rent payment     |       | 3,000  | 52,000   |
| 2026-03-10 | JE-00051  | Customer receipt  | 8,000 |        | 60,000   |
+----------------------------------------------------------+
|                              Closing Balance: SAR 60,000  |
+----------------------------------------------------------+

▶ 1200 — Accounts Receivable             Opening: SAR 120,000
▶ 1300 — Inventory                       Opening: SAR 80,000
```

**Table per account:**

| Column          | Width | Notes                                             |
| --------------- | ----- | ------------------------------------------------- |
| Date            | 110px | Formatted per locale                              |
| Entry #         | 110px | Monospace, clickable link to journal entry detail |
| Description     | flex  | Bilingual based on current lang                   |
| Debit           | 120px | SAR formatted, blank if zero                      |
| Credit          | 120px | SAR formatted, blank if zero                      |
| Running Balance | 130px | SAR formatted, `fontWeight: 600`                  |

**Account section header:**

- Left: Account code + name (bold)
- Right: "Opening Balance: SAR X,XXX"
- Collapsible (Ant Design `<Collapse>` or custom accordion)
- Closing balance row at bottom of each section: right-aligned, bold, light blue background

**Account filter:** Dropdown to select specific account(s) — defaults to "All Accounts"

**API:** `GET /api/v1/accounting/reports/general-ledger?startDate=...&endDate=...&accountId=...&branchId=...`

---

## 3. Filter Bar (Shared)

**Component:** `<ReportFilterBar />` — used on all report pages.
**Position:** Sticky top below page header, `z-index: 10`.
**Style:** Ant Design `<Card>` with `bodyStyle={{ padding: '12px 16px' }}`, slight shadow.

**Layout:** `<Space wrap>` with all controls inline, wraps on smaller screens.

### 3.1 Date Range Picker

**Component:** Ant Design `<DatePicker.RangePicker>`
**Presets** (via `presets` prop):

| Label (en)   | Label (ar)    | Range                                               |
| ------------ | ------------- | --------------------------------------------------- |
| This Month   | هذا الشهر     | 1st of current month to today                       |
| Last Month   | الشهر الماضي  | 1st to last of previous month                       |
| This Quarter | هذا الربع     | 1st of current quarter to today                     |
| Last Quarter | الربع الماضي  | Full previous quarter                               |
| This Year    | هذه السنة     | Jan 1 to today (or fiscal year start if configured) |
| Last Year    | السنة الماضية | Full previous calendar/fiscal year                  |
| Custom Range | نطاق مخصص     | User selects start + end                            |

- Default: "This Month"
- Format: `YYYY-MM-DD` (API), displayed per locale setting

### 3.2 Branch Selector

**Component:** Ant Design `<Select>` with search

- Default: "All Branches" (sends no `branchId` param)
- Options fetched from `GET /api/v1/branches` (cached in React Query, `staleTime: 5min`)
- Shows branch name in current language

### 3.3 Compare Period Toggle

**Component:** Ant Design `<Checkbox>` — "Compare with previous period"

- When checked: adds compare columns to tables
- Compare period auto-calculated: same duration, immediately preceding
- Only shown on P&L and Balance Sheet

### 3.4 Cost Center Filter

**Component:** Ant Design `<Select>` with search

- Only shown on P&L report
- Default: "All Cost Centers"
- Options from `GET /api/v1/accounting/cost-centers`

### 3.5 Journal Filter

**Component:** Ant Design `<Select mode="multiple">` with search

- Only shown on Trial Balance and General Ledger
- Default: all journals selected
- Options from `GET /api/v1/accounting/journals`

### 3.6 Account Filter

**Component:** Ant Design `<TreeSelect>` showing account hierarchy

- Only shown on General Ledger
- Allows multi-select
- Options from `GET /api/v1/accounting/accounts?format=tree`

### 3.7 Export Button

**Component:** `<ExportButton />` (see Section 4.3)

- Always present on the right end of the filter bar
- `position: absolute; right: 16px` (or `left: 16px` in RTL)

---

## 4. Print / Export Layout

### 4.1 PDF Invoice Template (Tax Invoice)

**Page:** A4 portrait (210mm x 297mm)
**Margins:** 15mm all sides
**Font:** System font, 10pt body, 8pt fine print

```
+----------------------------------------------------------+
|  [Company Logo]                    Company Name           |
|  120x60px max                      CR: 1234567890         |
|                                    VAT: 300000000000003   |
|                                    Address Line 1         |
|                                    City, Postal Code      |
|                                    Phone: +966 XX XXX XXXX|
+----------------------------------------------------------+
|                                                            |
|          TAX INVOICE / فاتورة ضريبية                      |
|          (centered, fontSize: 18, bold)                    |
|                                                            |
+----------------------------------------------------------+
|  Invoice #: INV-2026-00142     Date: 2026-03-17           |
|  Due Date: 2026-04-16          Payment Terms: Net 30      |
+----------------------------------------------------------+
|  BILL TO:                                                  |
|  Customer Name                                             |
|  VAT: 300000000000004                                      |
|  Address                                                   |
|  City, Country                                             |
+----------------------------------------------------------+
|                                                            |
| # | Description        | Qty | Unit Price | Tax% | Total |
|---|--------------------|----|-----------|------|-------|
| 1 | Product A          |  5 | 100.00    | 15%  | 500.00|
| 2 | Service B          |  1 | 2,000.00  | 15%  |2000.00|
| 3 | Product C          | 10 | 50.00     | 15%  | 500.00|
+----------------------------------------------------------+
|                                    Subtotal:   3,000.00   |
|                                    Discount:    (150.00)  |
|                                    Taxable:     2,850.00  |
|                                    VAT (15%):     427.50  |
|                                    ─────────────────────  |
|                                    TOTAL:  SAR 3,277.50   |
|                                    (bold, fontSize: 14)   |
+----------------------------------------------------------+
|                                                            |
|  [QR Code]              Bank Details:                      |
|  ZATCA TLV              Bank: Al Rajhi Bank                |
|  150x150px              IBAN: SA0000000000000000000         |
|                         Account Name: Company Name         |
|                                                            |
+----------------------------------------------------------+
|  Payment Terms: Payment due within 30 days of invoice date |
|  شروط الدفع: الدفع مستحق خلال 30 يوما من تاريخ الفاتورة    |
+----------------------------------------------------------+
```

**QR Code content:** ZATCA Phase 2 TLV-encoded base64 (seller name, VAT number, timestamp, total, VAT amount).

**Bilingual layout:**

- All labels appear in both English and Arabic
- English left-aligned, Arabic right-aligned
- Table headers bilingual: "Description / الوصف", "Qty / الكمية", etc.

---

### 4.2 PDF Payslip Template

**Page:** A4 portrait
**Margins:** 15mm all sides

```
+----------------------------------------------------------+
|  [Company Logo]           PAYSLIP / كشف الراتب             |
|                           Period: March 2026               |
+----------------------------------------------------------+
|                                                            |
|  Employee: Ahmed Al-Rashid        ID: EMP-00142           |
|  Department: Engineering          Position: Senior Dev     |
|  Join Date: 2024-06-15           Nationality: Saudi       |
|  Bank: Al Rajhi                  IBAN: SA00000000000000   |
|                                                            |
+----------------------------------------------------------+
|                                                            |
|  EARNINGS                              DEDUCTIONS          |
|  ─────────────────────                 ─────────────────── |
|  Basic Salary      8,000.00           GOSI (10%)   800.00 |
|  Housing Allow.    2,500.00           Advance Ded. 500.00  |
|  Transport Allow.  1,000.00           Late Deduct.  150.00 |
|  Overtime (12h)      750.00           Leave Deduct.   0.00 |
|  Bonus               500.00                                |
|  ─────────────────────                 ─────────────────── |
|  TOTAL EARNINGS   12,750.00           TOTAL DED.  1,450.00 |
|                                                            |
+----------------------------------------------------------+
|                                                            |
|  GOSI Breakdown:                                           |
|  Employee (10%):  800.00   Employer (12%):  960.00        |
|                                                            |
+----------------------------------------------------------+
|                                                            |
|  ═══════════════════════════════════════════════════════   |
|          NET PAY:  SAR 11,300.00                           |
|          (fontSize: 20, bold, centered, green background)  |
|  ═══════════════════════════════════════════════════════   |
|                                                            |
+----------------------------------------------------------+
|  Working Days: 26/26    Leaves: 0    Absences: 0          |
|  Generated: 2026-03-28                                     |
+----------------------------------------------------------+
```

**GOSI logic:**

- Saudi employees: 10% employee + 12% employer
- Non-Saudi: no GOSI line (hidden entirely, not zero)
- Determined by `nationality` field on employee record

**Bilingual:** All labels in both languages, same left/right pattern as invoice.

---

### 4.3 Export Button Component

**Component:** `<ExportButton />`
**Props:**

```ts
interface ExportButtonProps {
  onExport: (format: "pdf" | "xlsx" | "csv") => Promise<void>;
  disabled?: boolean; // true when no data
  loading?: ExportFormat | null; // which format is currently loading
  formats?: ExportFormat[]; // default: ['pdf', 'xlsx', 'csv']
}
```

**Render:** Ant Design `<Dropdown>` wrapping a `<Button>`

```
+---------------------------+
| ↓ Export  ▾               |
+---------------------------+
| 📄 Export as PDF          |
| 📊 Export as Excel (XLSX) |
| 📋 Export as CSV          |
+---------------------------+
```

**Behavior:**

- Button text: `t('common.export')` with `<DownloadOutlined />`
- Each dropdown item shows a loading spinner when its format is being generated
- Other items are disabled while any export is in progress
- Disabled state (gray) when `disabled` prop is true (no data to export)
- On click: calls `onExport(format)` which triggers API download

**API pattern for exports:**

- PDF: `GET /api/v1/accounting/reports/profit-loss/export?format=pdf&...filters` — returns `application/pdf` blob
- XLSX: same endpoint, `format=xlsx` — returns `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- CSV: same endpoint, `format=csv` — returns `text/csv`
- Frontend uses `axios` with `responseType: 'blob'`, then creates a download link via `URL.createObjectURL()`

---

## Appendix: Responsive Breakpoints

| Breakpoint | Ant Design | Tailwind       | Behavior                                        |
| ---------- | ---------- | -------------- | ----------------------------------------------- |
| Mobile     | `xs`       | `< sm` (640px) | Single column, stacked charts, hamburger filter |
| Tablet     | `sm`/`md`  | `sm`-`lg`      | 2 columns for KPIs, stacked charts              |
| Desktop    | `lg`/`xl`  | `xl`+ (1280px) | Full layout — 5 KPIs, side-by-side charts       |

## Appendix: SAR Formatting

```ts
const formatSAR = (amount: number): string =>
  new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
```

For Arabic locale, use `'ar-SA'` — automatically places SAR symbol on the correct side and uses Arabic-Indic numerals if configured.

## Appendix: Chart Color Palette

| Use Case             | Colors                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Revenue              | `#52c41a` (Ant Design green)                                                               |
| Expenses             | `#ff4d4f` (Ant Design red)                                                                 |
| Primary accent       | `#1677ff` (Ant Design blue)                                                                |
| Categorical (charts) | `['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#8c8c8c']` |
| AR aging buckets     | `['#52c41a', '#fadb14', '#fa8c16', '#ff4d4f', '#a8071a']`                                  |
