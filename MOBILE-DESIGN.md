# Mobile-First Responsive Design Specification

> Tech stack: React 19 + Ant Design 6 + Tailwind CSS v4
> RTL support: Arabic (right-to-left) is a first-class layout direction

---

## 1. Breakpoint Behavior

Tailwind defaults: `sm=640px`, `md=768px`, `lg=1024px`, `xl=1280px`, `2xl=1536px`

### List Pages

| Breakpoint           | Layout                   | Details                                                                                                                      |
| -------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| **xl+** (>=1280px)   | Full table               | All columns visible, pagination bar, bulk action toolbar                                                                     |
| **lg** (1024-1279px) | Reduced table            | Priority columns only. Hide: description, created date, secondary IDs. Keep: name/number, status, amount, primary relation   |
| **md** (768-1023px)  | Card list (`MobileCard`) | Each entity renders as a card. 1 column grid. Sort/filter bar collapses to icon buttons opening a bottom sheet               |
| **sm** (<768px)      | Simplified card list     | Cards show fewer fields (3-4 max). Pagination replaced by infinite scroll. Filter/sort accessible via floating action button |

**Column priority system** (lg breakpoint table trimming):

| Priority | Always visible        | Examples                                      |
| -------- | --------------------- | --------------------------------------------- |
| P1       | Yes (all breakpoints) | Document number, name, status, primary amount |
| P2       | lg+ only              | Partner/customer name, date, secondary status |
| P3       | xl+ only              | Description, created by, updated date, notes  |

### Detail Pages

| Breakpoint          | Layout                          | Details                                                                                                                                              |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **lg+** (>=1024px)  | Horizontal tab bar              | Tabs render as standard Ant Design Tabs. Header section with key info + action buttons inline                                                        |
| **md** (768-1023px) | Accordion (Ant Design Collapse) | Each tab becomes a collapsible panel. First panel auto-expanded. Header section stacks vertically                                                    |
| **sm** (<768px)     | Simplified accordion            | Header shows only: title, status badge, primary amount. Action buttons move to a sticky bottom bar. Accordion panels with single-column field layout |

### Fast-Create Drawers

| Breakpoint          | Layout                   | Details                                                                                                                                                                |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **lg+** (>=1024px)  | Right drawer, 400px wide | Standard Ant Design Drawer. Push mode (content shifts)                                                                                                                 |
| **md** (768-1023px) | Right drawer, 100% width | Full-width overlay drawer. Close button top-left (top-right in RTL)                                                                                                    |
| **sm** (<768px)     | Bottom sheet             | Slides up from bottom. Drag handle at top. Snap points: 90% height (default), dismissible by drag down. Full-screen feel with rounded top corners (border-radius 12px) |

### Dashboard

| Breakpoint           | KPI Cards                                                                    | Charts                                                                        |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **xl+** (>=1280px)   | 5 cards in 1 row (`grid-cols-5`)                                             | 2 charts per row (`grid-cols-2`)                                              |
| **lg** (1024-1279px) | 3 + 2 cards in 2 rows (`grid-cols-3` then `grid-cols-2`)                     | 2 charts per row                                                              |
| **md** (768-1023px)  | 2 cards per row (`grid-cols-2`)                                              | 1 chart per row, full width                                                   |
| **sm** (<768px)      | 1 card per row (`grid-cols-1`), horizontal swipeable carousel as alternative | 1 chart per row, simplified (hide legend, reduce data points, smaller labels) |

---

## 2. MobileCard Components

All cards share a base structure:

```
+-----------------------------------------------+
| [Top-left: Primary identifier]  [Top-right: Status badge] |
| [Secondary line]                                |
| [Tertiary line / metadata]                      |
| [Bottom row: pills, tags, indicators]           |
+-----------------------------------------------+
```

- Cards have `border-radius: 8px`, `padding: 16px`, `shadow-sm`
- Tap anywhere on the card navigates to the detail page
- Active state: slight scale down (`scale-[0.98]`) on press

### Invoice Card

```
+-----------------------------------------------+
| INV-00042                    [Posted] (green)  |
| Acme Corp LLC                                  |
|                              SAR 12,500.00     |
| Due: 15 Mar 2026            [OVERDUE] (red)    |
+-----------------------------------------------+
```

| Element        | Style                                                                                 |
| -------------- | ------------------------------------------------------------------------------------- |
| Invoice number | Bold, text-base, primary color (`text-blue-600`)                                      |
| Status badge   | Ant Design Tag, top-right corner                                                      |
| Partner name   | text-sm, `text-gray-600`                                                              |
| Amount         | text-lg, font-semibold, end-aligned (`text-end`)                                      |
| Due date       | text-xs, `text-gray-500`. If overdue: `text-red-600` + bold. Show "Overdue by X days" |

### Sale Order Card

```
+-----------------------------------------------+
| SO-00108                     [Confirmed] (blue)|
| Al-Rashid Trading Co.                          |
| SAR 8,750.00                     12 Mar 2026   |
| [Invoiced] (green)  [Partially Delivered] (orange) |
+-----------------------------------------------+
```

| Element              | Style                                                      |
| -------------------- | ---------------------------------------------------------- |
| SO number            | Bold, text-base, primary color                             |
| Status badge         | Ant Design Tag, top-right                                  |
| Customer name        | text-sm, `text-gray-600`                                   |
| Amount               | text-base, font-semibold, start-aligned                    |
| Date                 | text-sm, `text-gray-500`, end-aligned, same line as amount |
| Invoice status pill  | Small Ant Design Tag, bottom-left                          |
| Delivery status pill | Small Ant Design Tag, bottom-right                         |

### Employee Card

```
+-----------------------------------------------+
| [MH]  Mohammed Hassan              [Active] *  |
|       Finance Dept. - Senior Accountant        |
|       [Full-time] (blue tag)                   |
+-----------------------------------------------+
```

| Element               | Style                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| Avatar                | 40x40px circle. Photo if available, otherwise initials with background color derived from name hash |
| Name                  | Bold, text-base, beside avatar                                                                      |
| Status indicator      | 8px colored dot: green=active, gray=inactive, red=terminated. Top-right                             |
| Department + Position | text-sm, `text-gray-600`, below name                                                                |
| Employment type badge | Small Ant Design Tag (`Full-time`=blue, `Part-time`=cyan, `Contract`=orange)                        |

### Product Card

```
+-----------------------------------------------+
| [IMG]  Espresso Machine                        |
|        SKU: PRD-00412                          |
|        SAR 2,499.00          Stock: 45         |
|        [Storable] (purple)   Electronics       |
+-----------------------------------------------+
```

| Element      | Style                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| Image        | 48x48px rounded square thumbnail. If no image: category icon on light gray background |
| Name         | Bold, text-base, beside image                                                         |
| SKU          | text-xs, `text-gray-400`, monospace                                                   |
| Price        | text-base, font-semibold, start-aligned                                               |
| Stock qty    | text-sm, end-aligned. Red if zero, orange if below reorder point                      |
| Type badge   | Tag: `storable`=purple, `consumable`=cyan, `service`=gray                             |
| Category tag | text-xs, `text-gray-500`, end-aligned                                                 |

### Lead Card

```
+-----------------------------------------------+
| Website Redesign Project         * (red dot)   |
| Nasser Al-Qahtani                              |
| Expected: SAR 45,000                           |
| [Qualification] (blue)  75%         [AH]      |
+-----------------------------------------------+
```

| Element          | Style                                                           |
| ---------------- | --------------------------------------------------------------- |
| Title            | Bold, text-base, max 1 line with ellipsis                       |
| Priority dot     | 10px colored dot: red=high, orange=medium, green=low. Top-right |
| Partner name     | text-sm, `text-gray-600`                                        |
| Expected revenue | text-sm, `text-gray-700`. Show "SAR" prefix                     |
| Stage pill       | Ant Design Tag, colored by stage                                |
| Probability      | text-xs, `text-gray-500`, beside stage pill                     |
| Assigned to      | 24px avatar circle, bottom-right                                |

### Purchase Order Card

```
+-----------------------------------------------+
| PO-00067                     [Confirmed] (blue)|
| Saudi Paper Supplies Co.                       |
| SAR 22,100.00            Expected: 20 Mar 2026 |
| [Billed] (green)        [Received] (green)     |
+-----------------------------------------------+
```

| Element             | Style                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| PO number           | Bold, text-base, primary color                                                 |
| Status badge        | Ant Design Tag, top-right                                                      |
| Vendor name         | text-sm, `text-gray-600`                                                       |
| Amount              | text-base, font-semibold                                                       |
| Expected delivery   | text-sm, `text-gray-500`, end-aligned. Orange if within 3 days, red if overdue |
| Bill status pill    | Small Tag, bottom-left                                                         |
| Receipt status pill | Small Tag, bottom-right                                                        |

### Journal Entry Card

```
+-----------------------------------------------+
| JE-00234                     [Posted] (green)  |
| 14 Mar 2026 - Monthly payroll accrual         |
| Total Debit: SAR 185,000.00                   |
| [Manual Entry] (gray tag)                      |
+-----------------------------------------------+
```

| Element            | Style                                                     |
| ------------------ | --------------------------------------------------------- |
| Entry number       | Bold, text-base, primary color                            |
| Status             | Tag: `draft`=default, `posted`=green                      |
| Date + Description | text-sm, `text-gray-600`. Description truncated to 1 line |
| Total debit        | text-base, font-semibold                                  |
| Entry type badge   | Small Tag, bottom-left                                    |

### Delivery Card

```
+-----------------------------------------------+
| DEL-00089                    [Ready] (orange)  |
| Ref: SO-00108                                  |
| Al-Rashid Trading Co.                          |
| Scheduled: 18 Mar 2026          3 lines        |
+-----------------------------------------------+
```

| Element         | Style                                    |
| --------------- | ---------------------------------------- |
| Delivery number | Bold, text-base, primary color           |
| Status badge    | Tag, top-right                           |
| SO reference    | text-xs, `text-gray-400`, monospace      |
| Partner name    | text-sm, `text-gray-600`                 |
| Scheduled date  | text-sm, `text-gray-500`. Red if overdue |
| Line count      | text-xs, `text-gray-400`, end-aligned    |

### Payslip Card

```
+-----------------------------------------------+
| Mohammed Hassan              [Draft] (default) |
| March 2026                                     |
| SAR 12,000  ->  SAR 10,200                    |
| Finance Dept.                                  |
+-----------------------------------------------+
```

| Element        | Style                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| Employee name  | Bold, text-base                                                                                                  |
| Status badge   | Tag, top-right                                                                                                   |
| Period         | text-sm, `text-gray-600` (format: "Month Year")                                                                  |
| Gross to Net   | text-base. Gross in `text-gray-500`, arrow icon (`->`) in `text-gray-400`, Net in font-semibold `text-green-700` |
| Department tag | text-xs, Tag style, bottom-left                                                                                  |

---

## 3. Mobile Navigation

### Bottom Tab Bar

Visible only on screens < `md` (768px). Fixed at the bottom of the viewport. Height: 56px + safe area inset bottom.

```
+----------+----------+----------+----------+----------+
| Dashboard|  Sales   | Inventory|    HR    |   More   |
| [chart]  | [cart]   | [package]| [users]  | [menu]   |
+----------+----------+----------+----------+----------+
```

| Tab       | Icon                   | Action                                                                     |
| --------- | ---------------------- | -------------------------------------------------------------------------- |
| Dashboard | `BarChartOutlined`     | Navigate to `/dashboard`                                                   |
| Sales     | `ShoppingCartOutlined` | Opens sub-menu bottom sheet: Invoices, Sale Orders, Customers, Leads       |
| Inventory | `InboxOutlined`        | Opens sub-menu bottom sheet: Products, Deliveries, Stock Moves, Warehouses |
| HR        | `TeamOutlined`         | Opens sub-menu bottom sheet: Employees, Payslips, Attendance, Leaves       |
| More      | `MenuOutlined`         | Opens full sidebar as overlay                                              |

**Sub-menu bottom sheet**: Grid of 4-6 items, each with icon + label. Appears at 50% viewport height. Dismissible by tapping outside or dragging down.

**Active state**: Active tab icon + label in primary color. Inactive tabs in `text-gray-500`.

### Hamburger Menu (Sidebar Overlay)

- Triggered by: "More" tab, or swipe from left edge (right edge in RTL)
- Opens as full-screen overlay from the start edge (left in LTR, right in RTL)
- Width: 85% of viewport, max 360px
- Background overlay: `bg-black/50` with tap-to-dismiss
- Contains: User avatar + name header, full navigation tree (collapsible groups), settings link, logout at bottom
- Transition: slide in from start edge, 250ms ease-out

### Back Button

- Always visible in the mobile header (< `md`) when not on a root route
- Position: start side of the header (left in LTR, right in RTL)
- Icon: `ArrowLeftOutlined` (auto-mirrors in RTL via Ant Design)
- Behavior: navigate to parent route. If no parent, go to the module list page

### Search

- Default state: search icon button in the header, end side
- Tap to expand: search input slides in from the end, covering the page title
- Full width input with auto-focus
- "Cancel" text button on the end side to collapse
- Debounced input (300ms) triggers search
- On list pages: filters the current list. On other pages: global search with results dropdown

---

## 4. Touch Targets and Gestures

### Touch Targets

- **Minimum size**: 44x44px for all interactive elements (buttons, links, icons, checkboxes)
- **Spacing between targets**: minimum 8px gap to prevent mis-taps
- **Form inputs**: minimum height 44px, full width on mobile
- **Table/list rows**: minimum height 48px
- **Icon buttons**: 44x44px touch area even if the icon is 24px (use padding)

### Swipe Actions on Cards

Cards in list views support horizontal swipe gestures:

| Direction                                 | Action                           | Visual                                     | Threshold |
| ----------------------------------------- | -------------------------------- | ------------------------------------------ | --------- |
| Swipe start-to-end (left-to-right in LTR) | Quick action (context-dependent) | Green background with action icon revealed | 80px      |
| Swipe end-to-start (right-to-left in LTR) | Delete / Archive                 | Red background with trash icon revealed    | 80px      |

**Quick action per entity**:

| Entity         | Swipe Quick Action     |
| -------------- | ---------------------- |
| Invoice        | Post (if draft)        |
| Sale Order     | Confirm (if draft)     |
| Employee       | View attendance        |
| Product        | Adjust stock           |
| Lead           | Convert to opportunity |
| Purchase Order | Confirm (if draft)     |
| Journal Entry  | Post (if draft)        |
| Delivery       | Validate (if ready)    |
| Payslip        | Approve (if draft)     |

**Implementation notes**:

- Swipe reveals the action background; releasing past the threshold triggers the action
- Releasing before the threshold snaps back to original position
- Haptic feedback on threshold crossing (where supported)
- Swipe actions are disabled during bulk selection mode

### Pull to Refresh

- Available on all list pages and dashboard
- Standard pull-down gesture from the top of the scrollable area
- Visual indicator: circular spinner that appears above the list, follows finger position
- Threshold: 60px pull distance to trigger refresh
- Triggers: re-fetch of the current list query (invalidates React Query cache for the active query)

### Long Press

- **Trigger**: 500ms press-and-hold on any list card
- **Effect**: Enters bulk selection mode
  - Checkboxes appear on all cards (start side)
  - Sticky bottom toolbar appears with: count selected, "Select All", bulk actions (delete, export, status change)
  - Tap additional cards to toggle selection
  - "X" button or back gesture exits bulk selection mode
- **Haptic feedback**: Light vibration on entering selection mode (where supported)

### Pinch to Zoom

| Context                              | Behavior                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| Forms                                | Disabled (`touch-action: pan-x pan-y` on form containers) |
| Charts                               | Enabled, with reset button appearing after zoom           |
| Reports / Tables (horizontal scroll) | Enabled                                                   |
| Images / Attachments                 | Enabled with double-tap to zoom to fit                    |

### Bottom Sheet

Used for: filters, sub-menus, fast-create on mobile, action menus.

| Property      | Value                                                                  |
| ------------- | ---------------------------------------------------------------------- |
| Drag handle   | 32px wide, 4px tall, centered, `bg-gray-300`, `border-radius: 2px`     |
| Snap points   | 50% height (default for menus), 90% height (default for forms/filters) |
| Dismiss       | Drag below 25% height, or tap overlay backdrop                         |
| Border radius | 12px top-left and top-right                                            |
| Backdrop      | `bg-black/40`                                                          |
| Animation     | Spring-based, 300ms                                                    |
| Max height    | 90% of viewport (never covers status bar)                              |

---

## 5. RTL Considerations

All responsive layouts must work correctly in RTL mode:

- **Flex/Grid direction**: Use logical properties (`start`/`end`) instead of `left`/`right`
- **Swipe directions**: Reversed in RTL (quick action = right-to-left, delete = left-to-right)
- **Navigation**: Sidebar opens from right in RTL, back arrow points right
- **Text alignment**: Numbers remain LTR, text follows document direction
- **Icons**: Directional icons (arrows, chevrons) auto-mirror via Ant Design's RTL config
- **Tailwind classes**: Use `ms-*`/`me-*` (margin-inline-start/end) instead of `ml-*`/`mr-*`. Use `ps-*`/`pe-*` for padding.
- **Card layout**: Amount and date positions swap to maintain end-alignment

---

## 6. Responsive Utility Classes

Standard Tailwind responsive prefixes to use throughout the codebase:

```
Default (no prefix) = mobile-first base styles (< 640px)
sm:   = >= 640px
md:   = >= 768px  (tablet portrait, cards -> table transition)
lg:   = >= 1024px (tablet landscape / small desktop)
xl:   = >= 1280px (desktop, full layout)
2xl:  = >= 1536px (large desktop)
```

**Key responsive patterns**:

```
// Hide on mobile, show on desktop
className="hidden lg:block"

// Show on mobile, hide on desktop
className="block lg:hidden"

// Grid columns by breakpoint
className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5"

// Stack on mobile, row on desktop
className="flex flex-col lg:flex-row"
```

---

## 7. Performance on Mobile

- **Lazy load**: All route components and heavy chart libraries
- **Virtual scrolling**: Lists with > 50 items use virtualized rendering (react-window or similar)
- **Image optimization**: Product images served at 2x card thumbnail size (96x96 for 48px display), WebP format
- **Debounce**: All search inputs debounced at 300ms
- **Skeleton loading**: Card-shaped skeletons shown during data fetch (match card dimensions exactly)
- **Offline indicator**: Banner at top when network is unavailable, auto-dismiss on reconnect
