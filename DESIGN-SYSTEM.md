# Tatweer ERP Backoffice -- Design System

> **Version:** 2.0.0
> **Last updated:** 2026-03-17
> **Stack:** React 19 + Vite 7 + Ant Design 6 + Tailwind CSS v4 + shadcn/ui
> **Design references:** Odoo 17, SAP Fiori, admin.saasable.io, Linear, Notion

This document is the **single source of truth** for all visual and interaction design decisions in the Tatweer ERP Backoffice application. Every component, page, and layout must conform to these specifications.

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Typography](#2-typography)
3. [Spacing](#3-spacing)
4. [Shadows](#4-shadows)
5. [Border Radius](#5-border-radius)
6. [Animation](#6-animation)
7. [Iconography](#7-iconography)
8. [Page Layout System](#8-page-layout-system)
9. [Component Specifications](#9-component-specifications)
10. [Entity-Specific Designs](#10-entity-specific-designs)
11. [RTL Support](#11-rtl-support)
12. [Dark Mode](#12-dark-mode)
13. [Responsive Breakpoints](#13-responsive-breakpoints)
14. [Accessibility](#14-accessibility)
15. [Theme Customizer](#15-theme-customizer)

---

## 1. Color System

### 1.1 Primary Palette

The primary color is a violet/purple that conveys professionalism and modern SaaS identity.

| Token (Ant Design)      | Light Mode | Dark Mode | Usage                           |
| ----------------------- | ---------- | --------- | ------------------------------- |
| `colorPrimary`          | `#7C3AED`  | `#C4B5FD` | Buttons, links, active states   |
| `colorPrimaryHover`     | `#6D28D9`  | `#DDD6FE` | Hover on primary elements       |
| `colorPrimaryActive`    | `#5B21B6`  | `#A78BFA` | Pressed/active primary elements |
| `colorPrimaryBg`        | `#F5F3FF`  | `#2F2A3F` | Light background tint           |
| `colorPrimaryBgHover`   | `#EDE9FE`  | `#3A3050` | Hover on light primary bg       |
| `colorPrimaryBorder`    | `#DDD6FE`  | `#4C1D95` | Primary-tinted borders          |
| `colorPrimaryText`      | `#7C3AED`  | `#C4B5FD` | Primary-colored text            |
| `colorPrimaryTextHover` | `#6D28D9`  | `#DDD6FE` | Hover on primary text           |

### 1.2 Semantic Colors

| Purpose | Token          | Light Mode | Dark Mode | Usage                                    |
| ------- | -------------- | ---------- | --------- | ---------------------------------------- |
| Success | `colorSuccess` | `#10B981`  | `#34D399` | Paid, approved, active, completed        |
| Warning | `colorWarning` | `#F59E0B`  | `#FBBF24` | Pending, expiring soon, attention needed |
| Error   | `colorError`   | `#EF4444`  | `#F87171` | Cancelled, rejected, failed, overdue     |
| Info    | `colorInfo`    | `#7C3AED`  | `#C4B5FD` | Informational messages (matches primary) |

#### Semantic Background Tints (for badges, alerts, stat cards)

| Purpose | Background | Text/Icon | Border    |
| ------- | ---------- | --------- | --------- |
| Success | `#ECFDF5`  | `#059669` | `#A7F3D0` |
| Warning | `#FFFBEB`  | `#D97706` | `#FDE68A` |
| Error   | `#FEF2F2`  | `#DC2626` | `#FECACA` |
| Info    | `#F5F3FF`  | `#7C3AED` | `#DDD6FE` |
| Neutral | `#F8FAFC`  | `#64748B` | `#E2E8F0` |

Dark mode semantic tints:

| Purpose | Background | Text/Icon | Border    |
| ------- | ---------- | --------- | --------- |
| Success | `#064E3B`  | `#34D399` | `#065F46` |
| Warning | `#451A03`  | `#FBBF24` | `#78350F` |
| Error   | `#450A0A`  | `#F87171` | `#7F1D1D` |
| Info    | `#2E1065`  | `#C4B5FD` | `#4C1D95` |
| Neutral | `#1E1A2E`  | `#8A84A0` | `#2D2440` |

### 1.3 Neutral Palette

| Token                  | Light Mode | Dark Mode | Usage                         |
| ---------------------- | ---------- | --------- | ----------------------------- |
| `colorBgBase`          | `#F8FAFC`  | `#0F0B1A` | Page background               |
| `colorBgContainer`     | `#FFFFFF`  | `#1E1A2E` | Cards, panels, modals         |
| `colorBgLayout`        | `#F8FAFC`  | `#0F0B1A` | Layout background             |
| `colorBgElevated`      | `#FFFFFF`  | `#1E1A2E` | Dropdowns, popovers           |
| `colorFill`            | `#F1F5F9`  | `#2F2A3F` | Muted fills, skeleton bg      |
| `colorFillAlter`       | `#F8FAFC`  | `#1E1828` | Alternate row, subtle bg      |
| `colorBorder`          | `#E2E8F0`  | `#2D2440` | Primary borders               |
| `colorBorderSecondary` | `#EFF3F7`  | `#3A3050` | Lighter/secondary borders     |
| `colorText`            | `#1E293B`  | `#E8E4F0` | Primary text                  |
| `colorTextSecondary`   | `#64748B`  | `#8A84A0` | Labels, captions, helper text |
| `colorTextTertiary`    | `#94A3B8`  | `#6B6580` | Disabled text, placeholders   |

### 1.4 Chart Colors (Recharts)

| Variable     | Light Mode | Dark Mode |
| ------------ | ---------- | --------- |
| `--chart-1`  | `#7C3AED`  | `#C4B5FD` |
| `--chart-2`  | `#A78BFA`  | `#A78BFA` |
| `--chart-3`  | `#C4B5FD`  | `#7C3AED` |
| `--chart-4`  | `#D8B4FE`  | `#6D28D9` |
| `--chart-5`  | `#E9D5FF`  | `#4C1D95` |
| Supplemental | `#06B6D4`  | `#22D3EE` |
| Supplemental | `#F59E0B`  | `#FBBF24` |
| Supplemental | `#10B981`  | `#34D399` |

### 1.5 Sidebar Colors

| Token                   | Light Mode              | Dark Mode                |
| ----------------------- | ----------------------- | ------------------------ |
| `sidebarBg`             | `#FFFFFF`               | `#160D2B`                |
| `sidebarAccent`         | `#F5F3FF`               | `#2F2A3F`                |
| `sidebarAccentFg`       | `#7C3AED`               | `#C4B5FD`                |
| `sidebarFg`             | `#1E293B`               | `#E8E4F0`                |
| Menu item inactive text | `rgba(30,41,59,0.6)`    | `rgba(232,228,240,0.6)`  |
| Menu group title        | `rgba(100,116,139,0.5)` | `rgba(138,132,160,0.45)` |

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans: "Poppins", "Noto Sans Arabic", "Segoe UI", sans-serif;
--font-display: "Poppins", "Noto Sans Arabic", "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", monospace;
```

- **Poppins** -- Primary Latin font (geometric sans-serif, clean for data-heavy UIs)
- **Noto Sans Arabic** -- Arabic support (pairs well with Poppins in bilingual layouts)
- **JetBrains Mono** -- Code snippets, reference numbers, UUIDs

Ant Design `fontFamily` is set to `"inherit"` so it picks up the CSS custom property.

### 2.2 Type Scale

| Level          | Size | Weight | Line Height | Letter Spacing | Usage                               |
| -------------- | ---- | ------ | ----------- | -------------- | ----------------------------------- |
| **Display**    | 28px | 800    | 1.2         | -0.02em        | Dashboard hero numbers              |
| **H1**         | 22px | 700    | 1.3         | -0.01em        | Page titles                         |
| **H2**         | 18px | 700    | 1.35        | -0.01em        | Section headers, modal titles       |
| **H3**         | 16px | 600    | 1.4         | 0              | Card titles, tab labels             |
| **H4**         | 14px | 600    | 1.4         | 0              | Subsection headers                  |
| **H5**         | 13px | 600    | 1.4         | 0              | Form section headers                |
| **H6**         | 12px | 600    | 1.4         | 0.01em         | Overline labels, group titles       |
| **Body**       | 14px | 400    | 1.5         | 0              | Default text, table cells           |
| **Body Small** | 13px | 400    | 1.5         | 0              | Secondary descriptions, breadcrumbs |
| **Caption**    | 12px | 400    | 1.4         | 0.01em         | Timestamps, helper text, tooltips   |
| **Label**      | 13px | 500    | 1.4         | 0              | Form labels, table headers          |
| **Overline**   | 10px | 600    | 1.4         | 0.08em         | Menu group titles, tiny labels      |
| **Mono**       | 13px | 400    | 1.5         | 0              | IDs, codes, reference numbers       |

### 2.3 Ant Design Token Mapping

```typescript
token: {
  fontSize: 14,          // Body
  fontSizeSM: 12,        // Caption
  fontSizeLG: 16,        // H3
  fontSizeXL: 20,        // H1 (Ant uses for page headers)
  fontSizeHeading1: 28,  // Display
  fontSizeHeading2: 22,  // H1
  fontSizeHeading3: 18,  // H2
  fontSizeHeading4: 16,  // H3
  fontSizeHeading5: 14,  // H4
  lineHeight: 1.5,
  lineHeightLG: 1.4,
  lineHeightSM: 1.4,
  fontWeightStrong: 600,
}
```

### 2.4 Text Truncation Rules

- **Table cells:** Single-line truncation with `text-overflow: ellipsis` on columns wider than 200px
- **Card titles:** Max 2 lines with `-webkit-line-clamp: 2`
- **Breadcrumb items:** Truncate at 160px max-width per segment
- **Sidebar menu items:** Single-line truncation

---

## 3. Spacing

### 3.1 Base Grid

All spacing values are multiples of **4px**. This is non-negotiable.

| Token  | Value | Usage                                                       |
| ------ | ----- | ----------------------------------------------------------- |
| `xs`   | 4px   | Icon-to-text gap in compact elements, tag internal padding  |
| `sm`   | 8px   | Tight padding (badges, small tags), inner gaps              |
| `md`   | 12px  | Form field internal padding, table cell inline padding      |
| `base` | 16px  | Standard padding (cards, sections), form item margin-bottom |
| `lg`   | 20px  | Gap between card sections, group spacing                    |
| `xl`   | 24px  | Page section spacing, modal body padding, drawer padding    |
| `2xl`  | 32px  | Major section dividers, page top/bottom padding             |
| `3xl`  | 40px  | Empty state vertical spacing, hero section padding          |
| `4xl`  | 48px  | Page-level vertical rhythm between major sections           |
| `5xl`  | 64px  | Maximum spacing (rarely used, e.g., login page centering)   |

### 3.2 Component-Specific Spacing

| Component           | Padding/Margin                        | Notes                                      |
| ------------------- | ------------------------------------- | ------------------------------------------ |
| Page container      | `24px` horizontal, `24px` top         | Main content area padding                  |
| Card body           | `16px` all sides                      | Ant Card `paddingLG: 16`                   |
| Card header         | `16px` horizontal, `12px` vertical    | Slightly tighter than body                 |
| Table cell          | `10px` block, `14px` inline           | Ant Table tokens                           |
| Modal body          | `24px 32px`                           | Generous horizontal for readability        |
| Modal footer        | `16px 32px 20px`                      | Matches body horizontal, tighter vertical  |
| Gradient header     | `28px 32px 24px`                      | Extra top padding for visual weight        |
| Drawer body         | `24px`                                | Consistent with modal                      |
| Form item gap       | `16px` margin-bottom                  | Between form fields                        |
| Form label          | `0 0 5px` padding-bottom              | Tight coupling to input                    |
| Action bar          | `0 0 16px`                            | Below action bar, above table              |
| Filter row          | `12px` gap between filters            | Horizontal spacing between filter controls |
| Breadcrumb to title | `8px`                                 | Tight coupling                             |
| Title to content    | `20px`                                | Breathing room after page header           |
| Tab bar to content  | `16px`                                | Below tab underline to tab content         |
| Sidebar item        | `6px` marginInline, `1px` marginBlock | Dense but scannable                        |

### 3.3 Grid Gutters

| Context          | Gutter | Notes                                       |
| ---------------- | ------ | ------------------------------------------- |
| Dashboard KPIs   | `16px` | Between stat cards in a row                 |
| Form columns     | `24px` | Two-column form layout gap                  |
| Card grid        | `16px` | Between cards in a grid                     |
| Detail page tabs | `0px`  | Tabs are flush, content has its own padding |

---

## 4. Shadows

### 4.1 Shadow Scale

| Level     | CSS Value                                                             | Usage                            |
| --------- | --------------------------------------------------------------------- | -------------------------------- |
| `none`    | `none`                                                                | Flat elements, disabled states   |
| `xs`      | `0 1px 2px 0 rgba(0,0,0,0.04)`                                        | Subtle lift (tags, badges)       |
| `sm`      | `0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.05)`       | Cards, default elevation         |
| `md`      | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)`    | Hovered cards, popovers          |
| `lg`      | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)`  | Modals, drawers                  |
| `xl`      | `0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)` | Elevated modals, command palette |
| `primary` | `0 4px 14px color-mix(in srgb, #7C3AED 35%, transparent)`             | Primary CTA buttons              |

### 4.2 Dark Mode Shadows

Dark mode uses stronger shadows for depth perception:

| Level | CSS Value                           |
| ----- | ----------------------------------- |
| `sm`  | `0 4.4px 12px -1px rgba(0,0,0,0.3)` |
| `md`  | `0 8px 16px -2px rgba(0,0,0,0.35)`  |
| `lg`  | `0 16px 32px -4px rgba(0,0,0,0.4)`  |

### 4.3 Ant Design Shadow Tokens

```typescript
token: {
  boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)",         // sm
  boxShadowSecondary: "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)", // md
}
```

Button shadows are explicitly set to `"none"` to avoid the default Ant Design button shadow.

---

## 5. Border Radius

### 5.1 Radius Scale

| Token  | Value  | Usage                                                 |
| ------ | ------ | ----------------------------------------------------- |
| `none` | 0px    | Square elements when needed                           |
| `xs`   | 2px    | Small inline elements                                 |
| `sm`   | 4px    | Tags, small badges, compact buttons                   |
| `md`   | 6px    | Default radius -- inputs, selects, standard buttons   |
| `lg`   | 8px    | Cards, menu items, sidebar items                      |
| `xl`   | 10px   | Modal footer buttons, gradient header icon containers |
| `2xl`  | 14px   | Modal gradient header icon box                        |
| `3xl`  | 16px   | Modal content wrapper                                 |
| `full` | 9999px | Avatars, circular buttons, pills, status dots         |

### 5.2 Ant Design Radius Tokens

The base `borderRadius` is configurable via the ThemeCustomizer. The following relationships are maintained:

```typescript
token: {
  borderRadius: themeRadius,                           // md (default 6)
  borderRadiusLG: Math.min(themeRadius + 2, 20),       // lg
  borderRadiusSM: Math.max(themeRadius - 2, 0),        // sm
  borderRadiusXS: Math.max(themeRadius - 4, 0),        // xs
}
```

### 5.3 Fixed Radius Values (Not Theme-Dependent)

| Element                  | Radius | Notes                              |
| ------------------------ | ------ | ---------------------------------- |
| Modal content            | 16px   | Always 16px via CSS override       |
| Modal close button       | 10px   | Fixed for visual consistency       |
| Gradient header icon box | 14px   | Fixed decorative element           |
| Avatar / status dot      | 9999px | Always circular                    |
| Sidebar menu item        | 8px    | Fixed via Ant Menu component token |

---

## 6. Animation

### 6.1 Duration Scale

| Token      | Duration | Usage                                          |
| ---------- | -------- | ---------------------------------------------- |
| `instant`  | 0ms      | State changes with no visible transition       |
| `fast`     | 120ms    | Micro-interactions (checkbox, toggle)          |
| `normal`   | 200ms    | Button hover, dropdown open, tooltip           |
| `moderate` | 350ms    | Drawer slide, direction flip, sidebar collapse |
| `slow`     | 500ms    | Theme transition, page cross-fade              |

### 6.2 Easing Curves

| Name          | CSS Value                           | Usage                                    |
| ------------- | ----------------------------------- | ---------------------------------------- |
| `ease-out`    | `cubic-bezier(0.0, 0, 0.2, 1)`      | Elements entering (dropdowns, modals)    |
| `ease-in`     | `cubic-bezier(0.4, 0, 1, 1)`        | Elements leaving                         |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)`      | Layout shifts, direction changes         |
| `spring`      | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful emphasis (notifications, badges) |

### 6.3 Specific Animations

| Animation             | Duration | Easing      | Properties                                |
| --------------------- | -------- | ----------- | ----------------------------------------- |
| Button hover          | 200ms    | ease-in-out | `background-color, box-shadow, transform` |
| Button press          | 120ms    | ease-out    | `transform: scale(0.97)`                  |
| Card hover lift       | 200ms    | ease-out    | `box-shadow, transform: translateY(-1px)` |
| Modal enter           | 300ms    | ease-out    | `opacity, transform: scale(0.95->1)`      |
| Modal backdrop        | 300ms    | ease-out    | `opacity, backdrop-filter: blur(4px)`     |
| Drawer slide-in       | 350ms    | ease-in-out | `transform: translateX(100%->0)`          |
| Direction flip        | 380ms    | ease-in-out | `opacity, transform: scaleX(0.97)`        |
| Theme transition      | 500ms    | ease-in-out | `all` (background, colors, borders)       |
| Skeleton pulse        | 1500ms   | ease-in-out | `opacity: 0.4 -> 1` infinite              |
| Notification slide-in | 300ms    | spring      | `transform: translateX, opacity`          |
| Tooltip fade          | 150ms    | ease-out    | `opacity`                                 |
| Table row hover       | 150ms    | ease-out    | `background-color`                        |
| Sidebar collapse      | 350ms    | ease-in-out | `width, padding, opacity`                 |

### 6.4 Direction Change Animation

```css
@keyframes dir-flip-in {
  0% {
    opacity: 0;
    transform: scaleX(0.97) translateX(12px);
  }
  100% {
    opacity: 1;
    transform: scaleX(1) translateX(0);
  }
}
.dir-animating {
  animation: dir-flip-in 0.38s cubic-bezier(0.4, 0, 0.2, 1) both;
}
```

### 6.5 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`. When active:

- All transition durations are set to `0.01ms`
- Skeleton animations are paused
- Modal/drawer transitions are instant
- Ant Design motion token set to `false`

---

## 7. Iconography

### 7.1 Icon Libraries

- **Primary:** `@ant-design/icons` v6 -- used inside Ant Design components
- **Secondary:** `lucide-react` -- used in shadcn/ui components and standalone icons

### 7.2 Icon Sizes

| Context             | Size | Notes                            |
| ------------------- | ---- | -------------------------------- |
| Sidebar menu item   | 15px | Ant Menu `iconSize: 15`          |
| Table action button | 14px | Compact, does not overpower text |
| Button with icon    | 16px | Standard button icon size        |
| Stat card icon      | 20px | Inside 40x40 container           |
| Modal header icon   | 22px | Inside 48x48 gradient container  |
| Empty state         | 48px | Central illustration icon        |
| Page header icon    | 24px | Beside page title                |

### 7.3 Icon Colors

- **Default:** `colorTextSecondary` (`#64748B` light / `#8A84A0` dark)
- **Active/Selected:** `colorPrimary`
- **Danger action:** `colorError`
- **Inside primary button:** `#FFFFFF`
- **Inside gradient header:** `#FFFFFF`

---

## 8. Page Layout System

### 8.1 Shell Layout

```
+-----------------------------------------------------------+
| Navbar (56px height)                                       |
+----------+------------------------------------------------+
| Sidebar  | Main Content Area                              |
| 230px    | padding: 24px                                  |
| (coll:   |                                                |
|  64px)   |                                                |
|          |                                                |
|          |                                                |
+----------+------------------------------------------------+
```

| Element           | Dimension      | Notes                     |
| ----------------- | -------------- | ------------------------- |
| Navbar height     | 56px           | `Layout.headerHeight: 56` |
| Sidebar width     | 230px expanded | Configurable, collapsible |
| Sidebar collapsed | 64px           | Icon-only mode            |
| Content padding   | 24px all sides | Consistent breathing room |
| Content max-width | None (fluid)   | Fills available space     |
| Content min-width | 320px          | Prevents layout breakage  |

### 8.2 List Page Layout

The standard list page structure for all entity lists:

```
+----------------------------------------------------------------+
| Breadcrumb (13px, secondary text)                               |
| 8px gap                                                         |
| Page Title (H1, 22px, bold)                                     |
| 20px gap                                                        |
+----------------------------------------------------------------+
| Action Bar                                                      |
| +------------------------------------------------------------+ |
| | [+ New] (primary btn)  [Filters v] [Search...]  [...] Menu | |
| +------------------------------------------------------------+ |
| 16px gap                                                        |
+----------------------------------------------------------------+
| Filter Chips Row (if active filters)                            |
| [Status: Active x] [Type: Storable x]  [Clear All]            |
| 12px gap                                                        |
+----------------------------------------------------------------+
| Bulk Action Bar (if rows selected, slides down)                 |
| [3 selected]  [Delete] [Export] [Change Status]                |
| 12px gap                                                        |
+----------------------------------------------------------------+
| Table                                                           |
| +------------------------------------------------------------+ |
| | Checkbox | Col 1 | Col 2 | Col 3 | Col 4 | Actions        | |
| |----------|-------|-------|-------|-------|----------------|  |
| |    []    | ...   | ...   | ...   | ...   | [eye] [edit]   | |
| |    []    | ...   | ...   | ...   | ...   | [eye] [edit]   | |
| +------------------------------------------------------------+ |
| 16px gap                                                        |
+----------------------------------------------------------------+
| Pagination Bar                                                  |
| Showing 1-20 of 156      [<] [1] [2] [3] ... [8] [>]  [20 v] |
+----------------------------------------------------------------+
```

#### Action Bar Specifications

| Element          | Spec                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container        | `display: flex`, `align-items: center`, `gap: 12px`                                                                                                                                                        |
| New Button       | `type="primary"`, `size="middle"`, icon: `PlusOutlined`                                                                                                                                                    |
| New Button style | Gradient bg: `linear-gradient(135deg, colorPrimary, colorPrimaryActive)`, `border: none`, `boxShadow: 0 4px 14px color-mix(in srgb, colorPrimary 35%, transparent)`, `borderRadius: 10`, `fontWeight: 600` |
| Search Input     | `width: 280px`, `size="middle"`, `allowClear`                                                                                                                                                              |
| Filter Button    | `size="middle"`, icon: `FilterOutlined`                                                                                                                                                                    |
| More Menu        | `Dropdown` with `...` trigger                                                                                                                                                                              |
| Export           | Inside More menu or as standalone button                                                                                                                                                                   |
| Alignment        | New button left, search + filters right                                                                                                                                                                    |

#### Table Specifications

| Property              | Value                                              |
| --------------------- | -------------------------------------------------- |
| Header background     | `colorBgLayout` (`#F8FAFC` light / `#0F0B1A` dark) |
| Header text           | `colorTextSecondary`, 13px, weight 500             |
| Header split color    | `transparent` (no vertical dividers)               |
| Row height            | ~44px (10px block padding + content)               |
| Row hover bg          | `#F1F5F9` light / `#2A2040` dark                   |
| Row selected bg       | `#FAF5FF` light / `#2A1F40` dark                   |
| Row selected hover bg | `#F3E8FF` light / `#322548` dark                   |
| Cell padding          | `10px` vertical, `14px` horizontal                 |
| Border between rows   | `1px solid colorBorder`                            |
| Actions column width  | `100px` fixed                                      |
| Checkbox column width | `48px` fixed                                       |
| Row click behavior    | Navigate to detail page (full row clickable)       |
| Sticky header         | Yes, sticky on scroll                              |

#### Pagination Specifications

| Property          | Value                              |
| ----------------- | ---------------------------------- |
| Position          | Below table, right-aligned         |
| Size              | `size="default"`                   |
| Show size changer | Yes, options: `[10, 20, 50, 100]`  |
| Show total        | `Showing {start}-{end} of {total}` |
| Default page size | 20                                 |

### 8.3 Detail Page Layout

The standard detail page structure for viewing/editing a single entity:

```
+----------------------------------------------------------------+
| Breadcrumb: Module > List > Record Name                         |
| 8px gap                                                         |
+----------------------------------------------------------------+
| Detail Header                                                   |
| +------------------------------------------------------------+ |
| | [back arrow]  Title / Record Name    [StatusBadge]          | |
| |                                                             | |
| | Subtitle / meta info (ID, dates)                            | |
| |                                                  [Actions]  | |
| +------------------------------------------------------------+ |
| 20px gap                                                        |
+----------------------------------------------------------------+
| Status Progress Bar (for documents with workflow)               |
| [Draft] -----> [Confirmed] -----> [Shipped] -----> [Done]      |
| 20px gap                                                        |
+----------------------------------------------------------------+
| Tab Navigation                                                  |
| [ General ] [ Lines ] [ Payments ] [ History ]                  |
+----------------------------------------------------------------+
| Tab Content Area                                                |
| (content depends on active tab, see entity specs below)         |
|                                                                 |
|                                                                 |
+----------------------------------------------------------------+
| Chatter Panel (at bottom of page)                               |
| +------------------------------------------------------------+ |
| | [Send Message] [Log Note] [Schedule Activity]               | |
| | ---------------------------------------------------------- | |
| | Timeline of messages, notes, status changes                 | |
| +------------------------------------------------------------+ |
+----------------------------------------------------------------+
```

#### Detail Header Specifications

| Element            | Spec                                                                |
| ------------------ | ------------------------------------------------------------------- |
| Container          | Card component, `padding: 20px 24px`                                |
| Back button        | 36x36, circle, `background: colorFill`, `color: colorTextSecondary` |
| Back button hover  | `background: colorPrimaryBg`, `color: colorPrimary`                 |
| Title              | H1 (22px, bold), inline with back button, `gap: 12px`               |
| Status badge       | Positioned right of title, vertically centered                      |
| Meta row           | Below title, 4px gap, caption size (12px), secondary text           |
| Meta separator dot | 3x3 circle, `colorBorderSecondary`                                  |
| Actions            | Right-aligned group: Edit, Print, More (dropdown)                   |
| Edit button        | `type="primary"`, `ghost`, icon: `EditOutlined`                     |
| Print button       | `type="default"`, icon: `PrinterOutlined`                           |
| More dropdown      | `EllipsisOutlined` trigger                                          |

#### Status Progress Bar (Workflow Steps)

| Property             | Value                                                 |
| -------------------- | ----------------------------------------------------- |
| Component            | Ant Design `Steps` with `type="navigation"` or custom |
| Step height          | 40px                                                  |
| Active step color    | `colorPrimary`                                        |
| Completed step color | `colorSuccess`                                        |
| Pending step color   | `colorBorder`                                         |
| Clickable steps      | Only if transition is allowed from current status     |

#### Tab Navigation

| Property            | Value                              |
| ------------------- | ---------------------------------- |
| Style               | Ant `Tabs` with `type="line"`      |
| Tab font size       | 14px, weight 500                   |
| Active tab color    | `colorPrimary`                     |
| Underline thickness | 2px                                |
| Tab gap             | `24px`                             |
| Sticky              | Yes, sticks below header on scroll |

### 8.4 Fast-Create Drawer

Right-side drawer for quick record creation with minimal fields:

```
+------------------------------------------+
| Gradient Header                           |
| +--------------------------------------+ |
| | [icon]  Create New {Entity}          | |
| |         Brief description            | |
| +--------------------------------------+ |
|                                           |
| Form Body (24px padding)                  |
|                                           |
| Name (En) *                               |
| [________________________]                |
|                                           |
| Name (Ar) *                               |
| [________________________]                |
|                                           |
| Category                                  |
| [dropdown________________]                |
|                                           |
| Type                                      |
| [dropdown________________]                |
|                                           |
|                                           |
|                                           |
+------------------------------------------+
| Footer                                    |
| [Cancel]  [Save]  [Save & Open]          |
+------------------------------------------+
```

| Property            | Value                                                                  |
| ------------------- | ---------------------------------------------------------------------- |
| Width               | 420px                                                                  |
| Placement           | Right (flips to left in RTL)                                           |
| Mask                | Yes, `backdrop-filter: blur(4px)`                                      |
| Header              | Gradient header pattern (same as modal, see section 9.10)              |
| Body padding        | `24px`                                                                 |
| Footer              | Sticky bottom, `borderTop: 1px solid colorBorderSecondary`             |
| Footer padding      | `16px 24px`                                                            |
| Footer bg           | `colorBgLayout`                                                        |
| Cancel button       | Default, `borderRadius: 10`, `minWidth: 100`, weight 600               |
| Save button         | Primary with gradient, `borderRadius: 10`, `minWidth: 140`, weight 600 |
| Save & Open button  | Primary ghost, `borderRadius: 10`, weight 600                          |
| Close on mask click | Yes                                                                    |
| Destroy on close    | Yes                                                                    |
| Form layout         | `vertical`                                                             |
| Max fields shown    | 6-8 (only essential fields for fast creation)                          |
| Required field mark | Red asterisk `*` via custom `requiredMark` render                      |
| Bilingual fields    | Show current language field only (copy to both on save)                |

### 8.5 Dashboard Layout

```
+----------------------------------------------------------------+
| Page Title: Dashboard                                           |
| 20px gap                                                        |
+----------------------------------------------------------------+
| KPI Cards Row (4 columns)                                       |
| +----------+ +----------+ +----------+ +----------+            |
| | Stat 1   | | Stat 2   | | Stat 3   | | Stat 4   |            |
| +----------+ +----------+ +----------+ +----------+            |
| 16px gap                                                        |
+----------------------------------------------------------------+
| Charts Row (2 columns, equal width)                             |
| +-------------------------+ +-------------------------+        |
| | Chart 1                 | | Chart 2                 |        |
| | (Line/Bar chart)        | | (Pie/Donut chart)       |        |
| |                         | |                         |        |
| | Height: 320px           | | Height: 320px           |        |
| +-------------------------+ +-------------------------+        |
| 16px gap                                                        |
+----------------------------------------------------------------+
| Secondary Row (2 columns: 60%/40% split)                        |
| +-------------------------------+ +-------------------+        |
| | Recent Activity / Table       | | Quick Access       |        |
| |                               | | Panel              |        |
| | Height: auto (max 400px)      | | Height: match      |        |
| +-------------------------------+ +-------------------+        |
+----------------------------------------------------------------+
```

#### KPI Card Row

| Property        | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| Grid            | 4 columns (`span={6}`) on desktop, 2 on tablet, 1 on mobile |
| Gutter          | `[16, 16]`                                                  |
| Card min-height | 120px                                                       |

---

## 9. Component Specifications

### 9.1 StatusBadge

A consistent badge component mapping statuses to colors. Every status in the system must use this component.

#### Status-to-Color Map (Light Mode)

| Status        | Background | Text Color | Border    | Dot Color |
| ------------- | ---------- | ---------- | --------- | --------- |
| `draft`       | `#F8FAFC`  | `#64748B`  | `#E2E8F0` | `#94A3B8` |
| `confirmed`   | `#EFF6FF`  | `#2563EB`  | `#BFDBFE` | `#3B82F6` |
| `posted`      | `#F5F3FF`  | `#7C3AED`  | `#DDD6FE` | `#7C3AED` |
| `paid`        | `#ECFDF5`  | `#059669`  | `#A7F3D0` | `#10B981` |
| `cancelled`   | `#FEF2F2`  | `#DC2626`  | `#FECACA` | `#EF4444` |
| `open`        | `#ECFEFF`  | `#0891B2`  | `#A5F3FC` | `#06B6D4` |
| `pending`     | `#FFFBEB`  | `#D97706`  | `#FDE68A` | `#F59E0B` |
| `approved`    | `#F0FDF4`  | `#15803D`  | `#BBF7D0` | `#22C55E` |
| `rejected`    | `#FEF2F2`  | `#DC2626`  | `#FECACA` | `#EF4444` |
| `active`      | `#ECFDF5`  | `#059669`  | `#A7F3D0` | `#10B981` |
| `inactive`    | `#F8FAFC`  | `#64748B`  | `#E2E8F0` | `#94A3B8` |
| `expired`     | `#FEF2F2`  | `#DC2626`  | `#FECACA` | `#EF4444` |
| `processing`  | `#EFF6FF`  | `#2563EB`  | `#BFDBFE` | `#3B82F6` |
| `partial`     | `#FFF7ED`  | `#C2410C`  | `#FED7AA` | `#F97316` |
| `overdue`     | `#FEF2F2`  | `#DC2626`  | `#FECACA` | `#EF4444` |
| `closed`      | `#F8FAFC`  | `#64748B`  | `#E2E8F0` | `#94A3B8` |
| `in_progress` | `#EFF6FF`  | `#2563EB`  | `#BFDBFE` | `#3B82F6` |
| `shipped`     | `#F0FDF4`  | `#15803D`  | `#BBF7D0` | `#22C55E` |
| `delivered`   | `#ECFDF5`  | `#059669`  | `#A7F3D0` | `#10B981` |
| `returned`    | `#FFF7ED`  | `#C2410C`  | `#FED7AA` | `#F97316` |

#### Dark Mode Status Colors

In dark mode, backgrounds darken significantly and text/dot colors lighten:

| Status        | Background | Text Color | Border    |
| ------------- | ---------- | ---------- | --------- |
| `draft`       | `#1E1A2E`  | `#8A84A0`  | `#2D2440` |
| `confirmed`   | `#172554`  | `#60A5FA`  | `#1E3A5F` |
| `posted`      | `#2E1065`  | `#C4B5FD`  | `#4C1D95` |
| `paid`        | `#064E3B`  | `#34D399`  | `#065F46` |
| `cancelled`   | `#450A0A`  | `#F87171`  | `#7F1D1D` |
| `open`        | `#164E63`  | `#22D3EE`  | `#155E75` |
| `pending`     | `#451A03`  | `#FBBF24`  | `#78350F` |
| `approved`    | `#14532D`  | `#4ADE80`  | `#166534` |
| `rejected`    | `#450A0A`  | `#F87171`  | `#7F1D1D` |
| `active`      | `#064E3B`  | `#34D399`  | `#065F46` |
| `inactive`    | `#1E1A2E`  | `#8A84A0`  | `#2D2440` |
| `expired`     | `#450A0A`  | `#F87171`  | `#7F1D1D` |
| `processing`  | `#172554`  | `#60A5FA`  | `#1E3A5F` |
| `partial`     | `#431407`  | `#FB923C`  | `#7C2D12` |
| `overdue`     | `#450A0A`  | `#F87171`  | `#7F1D1D` |
| `closed`      | `#1E1A2E`  | `#8A84A0`  | `#2D2440` |
| `in_progress` | `#172554`  | `#60A5FA`  | `#1E3A5F` |
| `shipped`     | `#14532D`  | `#4ADE80`  | `#166534` |
| `delivered`   | `#064E3B`  | `#34D399`  | `#065F46` |
| `returned`    | `#431407`  | `#FB923C`  | `#7C2D12` |

#### Badge Styling

```typescript
// Container
{
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "2px 10px 2px 8px",
  borderRadius: 9999,       // pill shape
  fontSize: 12,
  fontWeight: 500,
  lineHeight: "20px",
  border: "1px solid",
  whiteSpace: "nowrap",
}

// Dot indicator
{
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
}
```

### 9.2 ActionBar

Positioned above every list table. Provides primary action, search, filtering, and bulk operations.

```typescript
// Container
{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 16,
}

// Left group (primary action)
{
  display: "flex",
  alignItems: "center",
  gap: 8,
}

// Right group (search, filters, more)
{
  display: "flex",
  alignItems: "center",
  gap: 8,
}
```

| Element       | Component                     | Props/Style                                             |
| ------------- | ----------------------------- | ------------------------------------------------------- |
| New button    | `Button type="primary"`       | `icon={<PlusOutlined />}`, gradient bg, `size="middle"` |
| Search        | `Input.Search`                | `width: 280px`, `allowClear`, `placeholder` i18n        |
| Filter toggle | `Button`                      | `icon={<FilterOutlined />}`, badge with active count    |
| Sort dropdown | `Select`                      | `width: 160px`, sort field options                      |
| Export        | `Dropdown.Button` or `Button` | `icon={<ExportOutlined />}`                             |

#### Bulk Action Bar (appears when rows are selected)

```typescript
{
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "8px 16px",
  background: "colorPrimaryBg",  // #F5F3FF light, #2F2A3F dark
  borderRadius: 8,
  marginBottom: 12,
  border: "1px solid colorPrimaryBorder",
}
```

Content: `"{n} items selected"` label + action buttons (Delete, Export, Change Status).

### 9.3 StatCard (KPI Card)

Dashboard KPI cards showing key metrics with trend indicators.

```
+--------------------------------------------------+
|  [icon container]                                 |
|                                                   |
|  Label (13px, secondary, weight 500)              |
|  Value (28px, bold, primary text)                 |
|                                                   |
|  [trend arrow] +12.5% vs last month              |
|  [optional sparkline, 60px height]                |
+--------------------------------------------------+
```

#### Specifications

```typescript
// Card container
{
  padding: 20,
  borderRadius: 12,
  border: "1px solid colorBorder",
  background: "colorBgContainer",
  minHeight: 120,
  position: "relative",
  overflow: "hidden",
}

// Icon container (top-left)
{
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 20,
  marginBottom: 12,
  // Background uses semantic tint based on card type
}

// Label
{
  fontSize: 13,
  fontWeight: 500,
  color: "colorTextSecondary",
  marginBottom: 4,
}

// Value
{
  fontSize: 28,
  fontWeight: 800,
  color: "colorText",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  marginBottom: 8,
}

// Trend indicator
{
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  fontWeight: 500,
  // Green for positive: color #059669, bg #ECFDF5
  // Red for negative: color #DC2626, bg #FEF2F2
  padding: "2px 8px",
  borderRadius: 9999,
}
```

#### Icon Color Variants

| Variant | Icon bg (light) | Icon color | Icon bg (dark) |
| ------- | --------------- | ---------- | -------------- |
| Purple  | `#F5F3FF`       | `#7C3AED`  | `#2E1065`      |
| Blue    | `#EFF6FF`       | `#3B82F6`  | `#172554`      |
| Green   | `#ECFDF5`       | `#10B981`  | `#064E3B`      |
| Orange  | `#FFF7ED`       | `#F97316`  | `#431407`      |
| Cyan    | `#ECFEFF`       | `#06B6D4`  | `#164E63`      |
| Rose    | `#FFF1F2`       | `#F43F5E`  | `#4C0519`      |

### 9.4 DetailHeader

The header section at the top of every detail/edit page.

```typescript
// Container (inside a Card)
{
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  padding: "20px 24px",
}

// Left section
{
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
}

// Back button
{
  width: 36,
  height: 36,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "colorFill",
  color: "colorTextSecondary",
  cursor: "pointer",
  flexShrink: 0,
  marginTop: 2,
  transition: "all 200ms ease-in-out",
  // Hover: background colorPrimaryBg, color colorPrimary
}

// Title row
{
  display: "flex",
  alignItems: "center",
  gap: 10,
}

// Title text
{
  fontSize: 22,
  fontWeight: 700,
  color: "colorText",
  lineHeight: 1.3,
  margin: 0,
}

// Meta row (below title)
{
  display: "flex",
  alignItems: "center",
  gap: 16,
  marginTop: 4,
  fontSize: 12,
  color: "colorTextSecondary",
}

// Meta separator dot
{
  width: 3,
  height: 3,
  borderRadius: "50%",
  background: "colorBorderSecondary",
}

// Right section (actions)
{
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
}
```

### 9.5 FastCreateDrawer

Uses the standard Ant Design `Drawer` with the project's gradient header pattern applied. See section 8.4 for layout dimensions.

| Property           | Value                                                   |
| ------------------ | ------------------------------------------------------- |
| Component          | Ant `Drawer` with custom header/footer                  |
| Width              | 420px                                                   |
| Gradient header    | Same pattern as modal (see section 9.10)                |
| Form layout        | `vertical`                                              |
| Save button        | Primary with gradient, `icon={<CheckOutlined />}`       |
| Save & Open button | Primary ghost, `icon={<ExternalLinkOutlined />}`        |
| Cancel button      | Default                                                 |
| Required mark      | Custom render with red `*`                              |
| Field count        | Max 6-8 fields (fast creation = minimal)                |
| Bilingual fields   | Show current language field only (copy to both on save) |

### 9.6 InlineEditableTable

For order lines (sale order lines, invoice lines, purchase order lines, etc.).

```
+----------------------------------------------------------------+
| # | Product         | Description   | Qty | Price  | Tax | Total|
|----|-----------------|---------------|-----|--------|-----|------|
| 1 | [Product Select]| [text input]  | [3] | [50.00]| 15% | 150  |
| 2 | [Product Select]| [text input]  | [1] | [200]  | 15% | 200  |
|----|-----------------|---------------|-----|--------|-----|------|
| [+ Add a line]                               Subtotal: 350.00  |
|                                              Discount:  -35.00  |
|                                              Tax (15%):  47.25  |
|                                              Total:     362.25  |
+----------------------------------------------------------------+
```

#### Specifications

| Property               | Value                                                    |
| ---------------------- | -------------------------------------------------------- |
| Row height (view mode) | 44px                                                     |
| Row height (edit mode) | 48px (slightly taller for input padding)                 |
| Click to edit          | Single click on cell activates edit mode                 |
| Tab navigation         | Tab moves to next editable cell, Shift+Tab moves back    |
| Enter key              | Confirms cell edit and moves to next row same column     |
| Escape key             | Cancels current cell edit, reverts value                 |
| Add line button        | Text button at bottom-left: `+ Add a line`               |
| Add line style         | `color: colorPrimary`, `fontSize: 13`, `fontWeight: 500` |
| Delete row             | `DeleteOutlined` icon on hover, `color: colorError`      |
| Drag to reorder        | `HolderOutlined` handle on the left, visible on hover    |
| Summary section        | Right-aligned below table, `fontSize: 14`                |
| Summary label          | `color: colorTextSecondary`, `fontWeight: 500`           |
| Summary value          | `color: colorText`, `fontWeight: 600`                    |
| Summary total          | `fontSize: 18`, `fontWeight: 700`, top border separator  |

#### Cell Types

| Column Type | Edit Component       | Width     |
| ----------- | -------------------- | --------- |
| Line number | Non-editable         | 48px      |
| Product     | `Select` with search | 200px min |
| Description | `Input`              | flex      |
| Quantity    | `InputNumber`        | 80px      |
| Unit Price  | `InputNumber`        | 100px     |
| Tax         | `Select` (dropdown)  | 80px      |
| Line Total  | Non-editable (calc)  | 100px     |
| Actions     | Delete icon          | 48px      |

### 9.7 ChatterPanel

Messages, log notes, and activity timeline at the bottom of detail pages. Inspired by Odoo's chatter.

```
+----------------------------------------------------------------+
| Chatter                                                         |
| [Send Message] [Log Note] [Schedule Activity]                   |
+----------------------------------------------------------------+
| Compose Area (when active)                                      |
| +------------------------------------------------------------+ |
| | [Rich text editor toolbar]                                  | |
| | [Message content area, min 80px height]                     | |
| | [Attach file] [Mention @]              [Send] [Discard]    | |
| +------------------------------------------------------------+ |
+----------------------------------------------------------------+
| Timeline                                                        |
| +------------------------------------------------------------+ |
| | [Avatar] User Name -- 2 hours ago                           | |
| | Status changed from Draft to Confirmed                      | |
| |                                                             | |
| | [Avatar] User Name -- Yesterday at 3:15 PM                  | |
| | Sent invoice to customer via email                          | |
| |                                                             | |
| | [System] -- Mar 15, 2026                                     | |
| | Record created                                              | |
| +------------------------------------------------------------+ |
+----------------------------------------------------------------+
```

#### Specifications

| Property               | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| Container              | Card with no padding top (flush tabs)                     |
| Tab buttons            | `Segmented` or `Button.Group` with 3 options              |
| Tab button active bg   | `colorPrimaryBg`                                          |
| Tab button active text | `colorPrimary`                                            |
| Compose area bg        | `colorFillAlter`                                          |
| Compose area border    | `1px solid colorBorder`, `borderRadius: 8px`              |
| Compose area padding   | `12px`                                                    |
| Compose min-height     | 80px                                                      |
| Timeline line          | `2px solid colorBorderSecondary`, left-aligned            |
| Timeline dot           | 8px circle on the timeline line                           |
| Timeline item padding  | `12px 0 12px 24px` (left of line)                         |
| Avatar size            | 32px                                                      |
| Author name            | `fontSize: 13`, `fontWeight: 600`, `color: colorText`     |
| Timestamp              | `fontSize: 12`, `color: colorTextSecondary`               |
| Message body           | `fontSize: 14`, `color: colorText`, `lineHeight: 1.6`     |
| System messages        | `fontSize: 12`, `color: colorTextTertiary`, italic        |
| Status change format   | "[field] changed from [old] to [new]" with colored badges |
| Max visible items      | 10, then "Load more" button                               |

### 9.8 EmptyState

Shown when a list has no data, or a section has no content.

```
+--------------------------------------------------+
|                                                   |
|              [Illustration / Icon]                |
|              (48px icon or SVG)                   |
|                                                   |
|           No {entities} found                     |
|     Create your first {entity} to get started    |
|                                                   |
|            [+ Create {Entity}]                    |
|                                                   |
+--------------------------------------------------+
```

#### Specifications

```typescript
// Container
{
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "48px 24px",
  textAlign: "center",
}

// Icon container
{
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "colorFill",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 20,
  fontSize: 36,
  color: "colorTextTertiary",
}

// Title
{
  fontSize: 16,
  fontWeight: 600,
  color: "colorText",
  marginBottom: 6,
}

// Description
{
  fontSize: 14,
  color: "colorTextSecondary",
  marginBottom: 20,
  maxWidth: 360,
  lineHeight: 1.5,
}

// CTA button: standard primary button with gradient
```

### 9.9 FilterPanel

Expandable filter panel below the action bar.

```
+----------------------------------------------------------------+
| Filters                                              [Collapse] |
| +------------------------------------------------------------+ |
| | Status        | Type          | Category     | Date Range   | |
| | [Select v]    | [Select v]    | [Select v]   | [DatePicker] | |
| +------------------------------------------------------------+ |
| [Apply Filters]  [Clear All]                                   |
+----------------------------------------------------------------+
```

| Property          | Value                                          |
| ----------------- | ---------------------------------------------- |
| Container bg      | `colorFillAlter`                               |
| Container border  | `1px solid colorBorderSecondary`               |
| Container radius  | 8px                                            |
| Container padding | `16px`                                         |
| Grid              | 4 columns on desktop, 2 on tablet, 1 on mobile |
| Column gap        | `12px`                                         |
| Row gap           | `12px`                                         |
| Label font size   | 12px, weight 500, `colorTextSecondary`         |
| Animation         | Collapse/expand with 200ms ease-out            |

### 9.10 Modal (Standard Gradient Header Pattern)

All modals use the gradient header pattern documented in `CLAUDE.md`. This is **mandatory** for every modal in the application.

| Property         | Value                                           |
| ---------------- | ----------------------------------------------- |
| Width            | 580px (default), 480px (small), 720px (large)   |
| Border radius    | 16px (via CSS override on `.ant-modal-content`) |
| Mask             | `backdrop-filter: blur(4px)`                    |
| `rootClassName`  | `"modal-gradient-header"` -- **required**       |
| `title`          | `{null}` -- custom header rendered in body      |
| `footer`         | `{null}` -- custom footer rendered in body      |
| `destroyOnClose` | `true`                                          |
| `styles.body`    | `{ padding: 0 }`                                |
| `styles.header`  | `{ display: "none" }`                           |
| `styles.mask`    | `{ backdropFilter: "blur(4px)" }`               |

#### Gradient Header

```typescript
{
  background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 50%, ${token.colorPrimaryActive} 100%)`,
  padding: "28px 32px 24px",
  position: "relative",
  overflow: "hidden",
}
```

Decorative circles:

- Circle 1: 120x120, `top: -20`, `right: -20` (RTL: `left: -20`), `rgba(255,255,255,0.08)`
- Circle 2: 80x80, `bottom: -30`, `left: 60` (RTL: `right: 60`), `rgba(255,255,255,0.05)`

Icon + title container:

- Icon box: 48x48, `borderRadius: 14`, `rgba(255,255,255,0.15)` bg, `backdrop-filter: blur(10px)`, `fontSize: 22`, `color: #fff`
- Title: 20px, weight 700, `color: #fff`
- Subtitle: 13px, `color: rgba(255,255,255,0.7)`

#### Form Body

```typescript
{
  padding: "24px 32px 8px";
}
```

Form uses `Form.useForm()`, `layout="vertical"`, custom `requiredMark` with red `*`.

#### Footer

```typescript
{
  padding: "16px 32px 20px",
  borderTop: `1px solid ${token.colorBorderSecondary}`,
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  background: token.colorBgLayout,
}
```

- Cancel button: `borderRadius: 10`, `minWidth: 100`, `fontWeight: 600`
- Primary button: gradient bg matching header, `borderRadius: 10`, `minWidth: 140`, `fontWeight: 600`, `boxShadow: 0 4px 14px color-mix(in srgb, colorPrimary 35%, transparent)`

#### Close Button

White icon over gradient, styled via `.modal-gradient-header .ant-modal-close`:

```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(10px);
color: #fff;
/* Hover */
background: rgba(255, 255, 255, 0.3);
```

---

## 10. Entity-Specific Designs

### 10.1 Products

#### List Page Columns

| Column     | Width | Sortable | Filterable | Render                                                            |
| ---------- | ----- | -------- | ---------- | ----------------------------------------------------------------- |
| Checkbox   | 48px  | No       | No         | Selection checkbox                                                |
| Image      | 48px  | No       | No         | 36x36 thumbnail, radius 6, fallback package icon                  |
| SKU        | 120px | Yes      | Yes        | Mono font (`fontFamily: var(--font-mono)`), `fontSize: 13`        |
| Name       | flex  | Yes      | Yes        | Bilingual (current lang), `fontWeight: 500`                       |
| Type       | 100px | Yes      | Yes        | StatusBadge: `storable`=blue, `consumable`=cyan, `service`=purple |
| Category   | 140px | Yes      | Yes        | Plain text                                                        |
| Sale Price | 100px | Yes      | No         | Right-aligned, mono, `SAR {amount}`                               |
| Stock      | 80px  | Yes      | No         | Right-aligned, red text if `<= reorderPoint`                      |
| Status     | 100px | Yes      | Yes        | StatusBadge: `active`=green, `inactive`=gray, `archived`=gray     |
| Actions    | 80px  | No       | No         | View (`EyeOutlined`), Edit (`EditOutlined`)                       |

#### Detail Page Tabs

| Tab            | Content                                                                                                                                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**    | Two-column form. Left: nameEn, nameAr, type select, category select, brand select, barcode input, internal reference. Right: sale price, cost price, UoM select, tax rate, invoice policy select, image upload area. Full-width: descriptionEn (textarea), descriptionAr (textarea, dir="rtl") |
| **Variants**   | Variant attributes table (color, size, etc.) with add/remove. Below: variant grid cards showing SKU, price, stock per variant. Each variant card: 200px wide, thumbnail + SKU + price + stock badge                                                                                            |
| **Stock**      | Stock by warehouse table: warehouse name, available qty, reserved qty, forecasted qty. Below: stock movements timeline table: date, type, reference, qty, source, destination. Reorder rules card: min qty, max qty, reorder point inputs                                                      |
| **Suppliers**  | Table: supplier name (link), supplier SKU, lead time (days), min qty, price. Add Supplier Product button opens modal. Each row editable inline                                                                                                                                                 |
| **Accounting** | Three select fields in a card: income account, expense account, asset account. Tax configuration section below                                                                                                                                                                                 |

#### Fast-Create Drawer Fields

1. Name (En) -- required
2. Name (Ar) -- required (auto-copied from En if empty)
3. Type -- select (storable/consumable/service), default: storable
4. Category -- select with search
5. Sale Price -- number input
6. Cost Price -- number input

### 10.2 Partners

#### List Page Columns

| Column       | Width | Sortable | Filterable | Render                                                                              |
| ------------ | ----- | -------- | ---------- | ----------------------------------------------------------------------------------- |
| Checkbox     | 48px  | No       | No         | Selection checkbox                                                                  |
| Avatar       | 48px  | No       | No         | 36px `Avatar` with initials fallback, `colorPrimaryBg` bg                           |
| Name         | flex  | Yes      | Yes        | `fontWeight: 500`, company name as subtitle in `colorTextSecondary`, `fontSize: 12` |
| Type         | 100px | Yes      | Yes        | Tag: `customer`=blue, `vendor`=orange, `both`=purple                                |
| Phone        | 130px | No       | No         | Mono font, `fontSize: 13`                                                           |
| Email        | 180px | No       | No         | `color: colorPrimary`, truncate with ellipsis                                       |
| Credit Limit | 100px | Yes      | No         | Right-aligned, mono, `SAR {amount}`                                                 |
| Status       | 100px | Yes      | Yes        | StatusBadge                                                                         |
| Actions      | 80px  | No       | No         | View, Edit icons                                                                    |

#### Detail Page Tabs

| Tab            | Content                                                                                                                                                                                                                            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**    | Two-column form. Left: nameEn, nameAr, type (customer/vendor/both), company name, tax ID (VAT number), payment terms select. Right: phone, mobile, email, website. Full-width: address section (street, city, state, country, zip) |
| **Contacts**   | Contact persons table: name, role (select), phone, email, is primary (checkbox). Add Contact button. Inline editable                                                                                                               |
| **Sales**      | KPI cards row: total sales amount, total orders, average order value. Below: sale orders table filtered to this partner (number, date, amount, status). Link to each SO detail                                                     |
| **Purchases**  | KPI cards row: total purchases amount, total POs, average PO value. Below: purchase orders table filtered to this partner                                                                                                          |
| **Accounting** | Two stat cards: receivable balance (green if zero, red if overdue), payable balance. Payment history table: date, reference, amount, method. Aging summary: current, 1-30, 31-60, 61-90, 90+ days                                  |
| **Activities** | Activity list with type icon, due date, assigned user, summary, status. Schedule Activity button opens modal with: type select, due date picker, assigned user select, summary textarea                                            |

#### Fast-Create Drawer Fields

1. Name (En) -- required
2. Name (Ar) -- required
3. Type -- select (customer/vendor/both), default: customer
4. Phone -- input
5. Email -- input
6. Tax ID -- input

### 10.3 Invoices

#### List Page Columns

| Column         | Width | Sortable | Filterable | Render                                                                            |
| -------------- | ----- | -------- | ---------- | --------------------------------------------------------------------------------- |
| Checkbox       | 48px  | No       | No         | Selection checkbox                                                                |
| Number         | 130px | Yes      | Yes        | Mono font, `fontWeight: 500`, `color: colorPrimary` link style                    |
| Partner        | flex  | Yes      | Yes        | Partner name, company as subtitle                                                 |
| Type           | 100px | Yes      | Yes        | Tag: `standard`=blue, `credit_note`=orange, `debit_note`=purple                   |
| Date           | 110px | Yes      | Yes        | Formatted date (`DD MMM YYYY`)                                                    |
| Due Date       | 110px | Yes      | No         | Formatted date, `color: colorError` if past due                                   |
| Amount         | 110px | Yes      | No         | Right-aligned, mono, `SAR {amount}`, `fontWeight: 600`                            |
| Payment Status | 110px | Yes      | Yes        | StatusBadge: `not_paid`=orange, `partial`=yellow, `paid`=green, `reversed`=red    |
| ZATCA Status   | 100px | Yes      | Yes        | StatusBadge: `pending`=orange, `submitted`=blue, `accepted`=green, `rejected`=red |
| Actions        | 80px  | No       | No         | View, Print (`PrinterOutlined`), More dropdown                                    |

#### Detail Page Tabs

| Tab               | Content                                                                                                                                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lines**         | InlineEditableTable: product select, description input, account select, qty, unit price, discount %, tax select, subtotal (calculated). Summary section: subtotal, total discount, tax amount, total. "Add a line" button at bottom-left |
| **Payments**      | Payments table: date, method (tag), reference (mono), amount, status badge. "Register Payment" button (primary) opens modal with: amount, payment method, reference, date, memo                                                          |
| **Journal Entry** | Read-only table: account name, partner, label, debit amount, credit amount. Each row shows the GL account. Total debit = total credit validation indicator. Link to journal entry detail                                                 |

#### Status Workflow Bar

`Draft` --> `Posted` --> `Paid`

With side branches: Draft --> `Cancelled`; Posted --> `Cancelled` (with reversal entry)

### 10.4 Sale Orders

#### List Page Columns

| Column          | Width | Sortable | Filterable | Render                                                                     |
| --------------- | ----- | -------- | ---------- | -------------------------------------------------------------------------- |
| Checkbox        | 48px  | No       | No         | Selection checkbox                                                         |
| Number          | 120px | Yes      | Yes        | Mono font, `fontWeight: 500`, link style                                   |
| Customer        | flex  | Yes      | Yes        | Partner name                                                               |
| Date            | 110px | Yes      | Yes        | Formatted date                                                             |
| Amount          | 110px | Yes      | No         | Right-aligned, mono, `SAR {amount}`, `fontWeight: 600`                     |
| Status          | 110px | Yes      | Yes        | StatusBadge: `draft`=gray, `confirmed`=blue, `done`=green, `cancelled`=red |
| Invoice Status  | 110px | Yes      | Yes        | StatusBadge: `nothing`=gray, `to_invoice`=orange, `invoiced`=green         |
| Delivery Status | 110px | Yes      | Yes        | StatusBadge: `pending`=orange, `partial`=yellow, `delivered`=green         |
| Actions         | 80px  | No       | No         | View, Edit                                                                 |

#### Detail Page Tabs

| Tab               | Content                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lines**         | InlineEditableTable: product, description, qty ordered, qty delivered (read-only), qty invoiced (read-only), unit price, discount %, tax, subtotal. Summary: subtotal, discount, tax, total |
| **Invoices**      | Related invoices table: number (link), date, amount, payment status, ZATCA status. "Create Invoice" primary button. Down payments section showing applied amounts                           |
| **Deliveries**    | Related delivery orders table: number (link), scheduled date, done date, status. "Create Delivery" button. Transfer log showing movements                                                   |
| **Down Payments** | Down payment lines table: date, amount, percentage, status. Create Down Payment button opens modal with: type (percentage/fixed), amount input, account select                              |

#### Status Workflow Bar

`Draft` --> `Confirmed` --> `Done`

Action buttons by state:

- Draft: `Confirm` (primary), `Cancel` (danger ghost)
- Confirmed: `Create Invoice`, `Create Delivery`, `Mark Done`, `Cancel`
- Done: `Create Invoice` (if not fully invoiced)

### 10.5 Purchase Orders

#### List Page Columns

| Column         | Width | Sortable | Filterable | Render                                                                     |
| -------------- | ----- | -------- | ---------- | -------------------------------------------------------------------------- |
| Checkbox       | 48px  | No       | No         | Selection checkbox                                                         |
| Number         | 120px | Yes      | Yes        | Mono font, `fontWeight: 500`, link style                                   |
| Vendor         | flex  | Yes      | Yes        | Partner name                                                               |
| Date           | 110px | Yes      | Yes        | Formatted date                                                             |
| Amount         | 110px | Yes      | No         | Right-aligned, mono, `SAR {amount}`, `fontWeight: 600`                     |
| Status         | 110px | Yes      | Yes        | StatusBadge: `draft`=gray, `confirmed`=blue, `done`=green, `cancelled`=red |
| Bill Status    | 100px | Yes      | Yes        | StatusBadge: `nothing`=gray, `to_bill`=orange, `billed`=green              |
| Receipt Status | 100px | Yes      | Yes        | StatusBadge: `pending`=orange, `partial`=yellow, `received`=green          |
| Actions        | 80px  | No       | No         | View, Edit                                                                 |

#### Detail Page Tabs

| Tab          | Content                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Lines**    | InlineEditableTable: product, description, qty ordered, qty received (read-only), qty billed (read-only), unit price, tax, subtotal. Summary section         |
| **Receipts** | Related receipt orders table: number (link), date, status. "Receive Products" button (primary) opens receipt form                                            |
| **Bills**    | Related vendor bills table: number (link), date, amount, payment status. "Create Bill" button (primary). Three-way matching indicator (PO, Receipt, Invoice) |

#### Status Workflow Bar

`Draft` --> `Confirmed` --> `Done`

### 10.6 Employees

#### List Page Columns

| Column     | Width | Sortable | Filterable | Render                                                         |
| ---------- | ----- | -------- | ---------- | -------------------------------------------------------------- |
| Checkbox   | 48px  | No       | No         | Selection checkbox                                             |
| Avatar     | 48px  | No       | No         | 36px `Avatar` with photo or initials                           |
| Number     | 100px | Yes      | Yes        | Employee ID, mono font, `fontSize: 13`                         |
| Name       | flex  | Yes      | Yes        | `fontWeight: 500`, bilingual (current lang)                    |
| Department | 130px | Yes      | Yes        | Plain text, bilingual                                          |
| Position   | 130px | Yes      | Yes        | Plain text, bilingual                                          |
| Type       | 100px | Yes      | Yes        | Tag: `full_time`=blue, `part_time`=cyan, `contract`=orange     |
| Status     | 100px | Yes      | Yes        | StatusBadge: `active`=green, `inactive`=gray, `terminated`=red |
| Actions    | 80px  | No       | No         | View, Edit                                                     |

#### Detail Page Tabs

| Tab            | Content                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**    | Two-section layout. **Personal Info** (left column): nameEn, nameAr, national ID, nationality select, gender select, date of birth, marital status, phone, email, emergency contact name + phone. **Work Info** (right column): department select, position select, manager select, branch select, shift select, hire date, badge/employee number |
| **Contract**   | Current contract card: type, start date, end date (with countdown badge if < 30 days), monthly wage, housing allowance, transportation allowance, other allowances table. Below: contract history table: period, type, wage, status. "New Contract" button                                                                                        |
| **Leaves**     | Leave balance cards row (one per leave type): type name, balance, used, remaining with progress bar. Below: leave requests table: type, start date, end date, days, status, approved by. "Request Leave" button opens modal                                                                                                                       |
| **Attendance** | Monthly summary card: total days, present, absent, late, overtime hours. Below: attendance log table: date, check-in time, check-out time, worked hours, overtime, status. Date range filter. Import from device button                                                                                                                           |
| **Payroll**    | Current salary structure breakdown card: basic salary, allowances list, total gross. Below: payslip history table: period, gross, total deductions, net, status (link to payslip detail)                                                                                                                                                          |

#### Fast-Create Drawer Fields

1. Name (En) -- required
2. Name (Ar) -- required
3. Department -- select
4. Position -- select
5. Employment Type -- select (full_time/part_time/contract)
6. Hire Date -- date picker

### 10.7 Payslips

#### List Page Columns

| Column      | Width | Sortable | Filterable | Render                                                                     |
| ----------- | ----- | -------- | ---------- | -------------------------------------------------------------------------- |
| Checkbox    | 48px  | No       | No         | Selection checkbox                                                         |
| Employee    | flex  | Yes      | Yes        | Avatar (24px) + employee name, `fontWeight: 500`                           |
| Employee ID | 100px | Yes      | No         | Mono font, `fontSize: 13`                                                  |
| Period      | 130px | Yes      | Yes        | Format: `Mar 2026`                                                         |
| Gross       | 110px | Yes      | No         | Right-aligned, mono, `SAR {amount}`                                        |
| Deductions  | 110px | Yes      | No         | Right-aligned, mono, `color: colorError`                                   |
| Net         | 110px | Yes      | No         | Right-aligned, mono, `fontWeight: 600`                                     |
| Status      | 100px | Yes      | Yes        | StatusBadge: `draft`=gray, `confirmed`=blue, `paid`=green, `cancelled`=red |
| Actions     | 80px  | No       | No         | View, Print (`PrinterOutlined`)                                            |

#### Detail Page Tabs

| Tab            | Content                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lines**      | Grouped table by category. **Basic Salary** section: basic wage line. **Allowances** section: housing, transport, other allowances. **Deductions** section: GOSI, tax, loans, absences. **Company Contributions** section: employer GOSI. Each line: rule name, calculation basis, amount. Category subtotals in bold. Grand totals: gross, total deductions, net pay (highlighted, `fontSize: 18`, `fontWeight: 700`) |
| **Deductions** | Itemized deductions with calculation breakdown. Each card: deduction name, formula/description, calculated amount. Cards for: GOSI employee share (10% Saudi, 0% non-Saudi), income tax (if applicable), loan installment (with remaining balance), salary advance deduction, absence deduction (days x daily rate). Total deductions summary at bottom                                                                |

### 10.8 Leads (CRM)

#### List Page Columns

| Column      | Width | Sortable | Filterable | Render                                                                |
| ----------- | ----- | -------- | ---------- | --------------------------------------------------------------------- |
| Checkbox    | 48px  | No       | No         | Selection checkbox                                                    |
| Priority    | 48px  | Yes      | Yes        | Star icons (1-3), `color: #F59E0B` filled, `color: colorBorder` empty |
| Title       | flex  | Yes      | Yes        | `fontWeight: 500`                                                     |
| Partner     | 150px | Yes      | Yes        | Partner name or `colorTextTertiary` "No partner"                      |
| Stage       | 120px | Yes      | Yes        | Colored tag matching pipeline stage color                             |
| Revenue     | 110px | Yes      | No         | Right-aligned, mono, `SAR {amount}`                                   |
| Probability | 80px  | Yes      | No         | Mini progress bar (Ant `Progress` size="small") + percentage text     |
| Assigned To | 120px | Yes      | Yes        | Avatar (24px) + name                                                  |
| Actions     | 80px  | No       | No         | View, Edit                                                            |

#### Detail Page Tabs

| Tab            | Content                                                                                                                                                                                                                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **General**    | Two-column form. Left: title, partner select, contact name, phone, email, source select, medium, campaign. Right: expected revenue (number), probability slider (0-100%), expected close date picker, assigned user select, sales team select, tags multi-select. Stage pipeline progress bar at top |
| **Activities** | Activity list with type icon color-coded (call=blue, meeting=purple, email=green, todo=orange), due date (red if overdue), assigned user avatar, summary text, done checkbox. "Schedule Activity" button opens modal: type select, due date, assigned user, summary textarea, note textarea          |
| **Notes**      | Rich text notes with timeline. Each note: author avatar, timestamp, content (supports basic formatting). "Add Note" inline compose area at top. Notes are internal only                                                                                                                              |

#### Kanban View (Alternative to List)

Toggle between List and Kanban views via segmented control in the action bar.

Kanban specifications:

- Columns: one per pipeline stage, ordered by stage sequence
- Column header: stage name (bilingual), lead count badge, total revenue
- Column width: 280px
- Column gap: 12px
- Card: `borderRadius: 8px`, `padding: 12px`, `border: 1px solid colorBorder`
- Card content: title (`fontWeight: 500`), partner name (secondary), revenue (mono), probability bar, assigned avatar (bottom-right, 24px)
- Drag and drop between columns to change stage
- Click card to open detail page

### 10.9 Inventory Adjustments

#### List Page Columns

| Column     | Width | Sortable | Filterable | Render                                                                      |
| ---------- | ----- | -------- | ---------- | --------------------------------------------------------------------------- |
| Checkbox   | 48px  | No       | No         | Selection checkbox                                                          |
| Reference  | 120px | Yes      | Yes        | Mono font, `fontSize: 13`                                                   |
| Date       | 130px | Yes      | Yes        | Formatted datetime (`DD MMM YYYY, HH:mm`)                                   |
| Product    | flex  | Yes      | Yes        | Product name (bilingual)                                                    |
| Warehouse  | 130px | Yes      | Yes        | Warehouse name (bilingual)                                                  |
| Qty Before | 80px  | Yes      | No         | Right-aligned, mono                                                         |
| Qty After  | 80px  | Yes      | No         | Right-aligned, mono                                                         |
| Difference | 80px  | Yes      | No         | Right-aligned, mono, `+N` green (`colorSuccess`) or `-N` red (`colorError`) |
| Reason     | 150px | No       | Yes        | Adjustment reason text (bilingual)                                          |
| User       | 120px | No       | No         | Avatar (24px) + name                                                        |
| Actions    | 60px  | No       | No         | View (`EyeOutlined`)                                                        |

Inventory adjustments are typically view-only after creation. No detail page tabs -- clicking opens a read-only detail view showing all fields plus the journal entry created.

### 10.10 Deliveries

#### List Page Columns

| Column         | Width | Sortable | Filterable | Render                                                                                   |
| -------------- | ----- | -------- | ---------- | ---------------------------------------------------------------------------------------- |
| Checkbox       | 48px  | No       | No         | Selection checkbox                                                                       |
| Number         | 120px | Yes      | Yes        | Mono font, `fontWeight: 500`, link style                                                 |
| SO Reference   | 120px | Yes      | Yes        | Linked sale order number (link to SO detail)                                             |
| Partner        | flex  | Yes      | Yes        | Customer name                                                                            |
| Scheduled Date | 120px | Yes      | Yes        | Formatted date, `color: colorError` if past due and not done                             |
| Status         | 110px | Yes      | Yes        | StatusBadge: `draft`=gray, `waiting`=orange, `ready`=blue, `done`=green, `cancelled`=red |
| Actions        | 80px  | No       | No         | View, Validate (`CheckOutlined`, shown only when status=ready)                           |

#### Detail Page Tabs

| Tab             | Content                                                                                                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lines**       | Table: product name, demand qty (ordered), done qty (editable `InputNumber` when status is `ready`), UoM. "Validate" button at top confirms delivery and updates done quantities. Backorder prompt if done < demand |
| **Stock Moves** | Read-only table: product, source location, destination location, qty, UoM, state badge. Shows the underlying stock.move records. Grouped by product if multiple lines                                               |

#### Status Workflow Bar

`Draft` --> `Waiting` --> `Ready` --> `Done`

---

## 11. RTL Support

### 11.1 General Rules

- Direction is set globally via `ConfigProvider direction` and `dir` attribute on `.antd-scope` wrapper
- All logical CSS properties must be used (`margin-inline-start` not `margin-left`)
- Ant Design 6 handles RTL automatically for all its components
- Tailwind CSS v4 logical utilities: `ms-4` not `ml-4`, `ps-4` not `pl-4`

### 11.2 Specific RTL Adjustments

| Element                  | LTR                            | RTL                           |
| ------------------------ | ------------------------------ | ----------------------------- |
| Sidebar position         | Left                           | Right                         |
| Breadcrumb separator     | `/`                            | `\`                           |
| Back arrow icon          | `ArrowLeftOutlined`            | `ArrowRightOutlined`          |
| Drawer placement         | Right                          | Left                          |
| Table sort arrows        | Default position               | Mirrored position             |
| Modal decorative circles | `right: -20`                   | `left: -20`                   |
| Progress direction       | Left to right                  | Right to left                 |
| Number alignment         | Right-aligned                  | Left-aligned                  |
| Currency display         | `SAR 1,234.56`                 | `1,234.56 SAR` or same        |
| Form field direction     | `dir="ltr"` for English fields | `dir="rtl"` for Arabic fields |
| Timeline line            | Left side                      | Right side                    |
| ChatterPanel timeline    | Left-aligned                   | Right-aligned                 |

### 11.3 Bilingual Form Fields

English input fields always have `dir="ltr"`. Arabic input fields always have `dir="rtl"`. This is independent of the page direction.

---

## 12. Dark Mode

### 12.1 Strategy

Dark mode uses Ant Design's `darkAlgorithm` combined with custom token overrides defined in `antd-provider.tsx`. The theme is stored in `AppSettingsContext` and persisted to `localStorage` key `bo-theme`.

### 12.2 Key Differences

| Element            | Light                                | Dark                 |
| ------------------ | ------------------------------------ | -------------------- |
| Page background    | `#F8FAFC`                            | `#0F0B1A`            |
| Card background    | `#FFFFFF`                            | `#1E1A2E`            |
| Card shadow        | Subtle (0.08 opacity)                | Strong (0.3 opacity) |
| Sidebar background | `#FFFFFF`                            | `#160D2B`            |
| Table header       | `#F8FAFC`                            | `#0F0B1A`            |
| Primary color      | `#7C3AED`                            | `#C4B5FD` (lighter)  |
| Text primary       | `#1E293B`                            | `#E8E4F0`            |
| Text secondary     | `#64748B`                            | `#8A84A0`            |
| Borders            | `#E2E8F0`                            | `#2D2440`            |
| Status badge bg    | Pastel tints                         | Deep saturated tints |
| Gradient headers   | Same gradient (works in both themes) |

### 12.3 Theme Transition

All theme changes animate with `transition: all 0.5s ease-in-out` on the body element.

---

## 13. Responsive Breakpoints

| Breakpoint | Width     | Layout Adjustments                                            |
| ---------- | --------- | ------------------------------------------------------------- |
| `xs`       | < 576px   | Single column, sidebar hidden (overlay drawer), stacked cards |
| `sm`       | >= 576px  | Minor padding increases                                       |
| `md`       | >= 768px  | Two-column forms, sidebar auto-collapses to 64px              |
| `lg`       | >= 992px  | Dashboard 2-column charts, filter panel 3 columns             |
| `xl`       | >= 1200px | Full layout, sidebar expanded by default (230px)              |
| `2xl`      | >= 1600px | Dashboard 4-column KPIs, wider tables                         |

### 13.1 Mobile Adaptations

- **Sidebar:** Converts to a drawer overlay (not inline)
- **Tables:** Horizontal scroll with sticky first column (name/number)
- **Action bar:** Stacks vertically (search full-width on top, actions row below)
- **Modals:** Full-screen on xs/sm breakpoints (width: 100vw, height: 100vh)
- **Drawers:** Full-width on xs/sm breakpoints
- **KPI cards:** 2 columns on tablet, 1 column on mobile
- **Detail header:** Actions collapse into a single `...` dropdown menu
- **Tabs:** Horizontal scroll with scroll indicator arrows if overflow
- **Forms:** Single column on mobile, two columns on tablet+

---

## 14. Accessibility

### 14.1 Color Contrast

All text-background combinations meet WCAG 2.1 AA standards:

- **Normal text (< 18px, or < 14px bold):** Minimum contrast ratio 4.5:1
- **Large text (>= 18px, or >= 14px bold):** Minimum contrast ratio 3:1
- **UI components (borders, icons):** Minimum contrast ratio 3:1

### 14.2 Focus Indicators

```css
/* Default focus ring */
*:focus-visible {
  outline: 2px solid var(--ant-color-primary);
  outline-offset: 2px;
}

/* Dark mode inner ring for contrast */
.dark *:focus-visible {
  box-shadow: 0 0 0 1px #ffffff inset;
}

/* Input focus */
border-color: colorPrimary;
box-shadow: 0 0 0 3px color-mix(in srgb, colorPrimary 20%, transparent);
```

Never use `outline: none` without providing an alternative visible focus indicator.

### 14.3 Keyboard Navigation

**General:**

- Tab order follows visual order (top-to-bottom, start-to-end in current direction)
- `tabindex` must never use values > 0

**Forms:**

- `Tab` / `Shift+Tab`: move between form fields
- `Enter`: submit form when focus is on submit button
- `Escape`: close parent drawer/modal without saving

**Tables:**

- Arrow keys navigate cells when table has `role="grid"`
- `Enter`: activate edit mode on focused cell (editable tables)
- `Space`: toggle row selection checkbox

**Modals/Drawers:**

- Focus is trapped inside while open
- `Escape` closes the modal/drawer
- On open: focus moves to first focusable element
- On close: focus returns to trigger element

### 14.4 ARIA Labels

Every icon-only button must have `aria-label`. Values must go through the i18n system.

| Example             | `aria-label` Value                 |
| ------------------- | ---------------------------------- |
| Delete icon button  | `t("aria.delete", { entity })`     |
| Edit icon button    | `t("aria.edit", { entity })`       |
| Close drawer button | `t("aria.closeDrawer")`            |
| Color swatch        | `t("aria.selectColor", { color })` |

### 14.5 Screen Reader Announcements

| Event                 | Technique                                                 | Politeness |
| --------------------- | --------------------------------------------------------- | ---------- |
| Status change         | `aria-live="polite"` region                               | Polite     |
| Error toast           | `aria-live="assertive"` on toast container                | Assertive  |
| Success/info toast    | `aria-live="polite"` on toast container                   | Polite     |
| Loading state         | `aria-busy="true"` on container                           | --         |
| Form validation error | `aria-describedby="{fieldId}-error"`, `role="alert"`      | Assertive  |
| Table sort change     | Announce via `aria-live="polite"` region                  | Polite     |
| Page navigation       | Update `document.title` on route change                   | Polite     |
| Modal/drawer open     | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` | --         |

### 14.6 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Additionally set Ant Design `theme.token.motion = false` when reduced motion is detected.

### 14.7 High Contrast Mode

When `forced-colors: active`:

- All borders must be visible: minimum `1px solid`
- Never use color as sole state indicator -- always include text/icon
- Disabled elements: reduced opacity AND text/icon change
- Focus rings: increase to `3px solid Highlight`

---

## 15. Theme Customizer

The Theme Customizer is a settings drawer (`ThemeCustomizer.tsx`) that allows users to personalize the interface.

### 15.1 Color Mode

Three options: **Light**, **Dark**, **System** (auto-detect via `prefers-color-scheme`).

| Mode   | Ant Design `algorithm`   | Behavior                           |
| ------ | ------------------------ | ---------------------------------- |
| Light  | `theme.defaultAlgorithm` | Static light theme                 |
| Dark   | `theme.darkAlgorithm`    | Static dark theme                  |
| System | Detect at runtime        | Subscribes to `matchMedia` changes |

Persisted to `localStorage` key `bo-theme`.

### 15.2 Primary Color Picker

12 preset swatches in a 6x2 grid, plus custom hex input:

| Label  | Hex       |
| ------ | --------- |
| Blue   | `#1677FF` |
| Indigo | `#4F46E5` |
| Purple | `#7C3AED` |
| Pink   | `#EC4899` |
| Rose   | `#F43F5E` |
| Red    | `#EF4444` |
| Orange | `#F97316` |
| Amber  | `#F59E0B` |
| Green  | `#22C55E` |
| Teal   | `#14B8A6` |
| Cyan   | `#06B6D4` |
| Slate  | `#64748B` |

Persisted to `localStorage` key `bo-accent-color`.

### 15.3 Border Radius Scale

| Label       | Value | `borderRadius` | `borderRadiusSM` | `borderRadiusLG` | `borderRadiusXS` |
| ----------- | ----- | -------------- | ---------------- | ---------------- | ---------------- |
| None        | 0px   | 0              | 0                | 0                | 0                |
| Small       | 4px   | 4              | 2                | 6                | 0                |
| Medium      | 8px   | 8              | 6                | 10               | 4                |
| Large       | 12px  | 12             | 10               | 14               | 8                |
| Extra Large | 16px  | 16             | 14               | 18               | 12               |

Persisted to `localStorage` key `bo-theme-radius`.

### 15.4 Font Size

| Label       | Base `fontSize` | `fontSizeSM` | `fontSizeLG` |
| ----------- | --------------- | ------------ | ------------ |
| Compact     | 12px            | 10px         | 14px         |
| Default     | 14px            | 12px         | 16px         |
| Comfortable | 16px            | 14px         | 18px         |

Persisted to `localStorage` key `bo-font-size`.

### 15.5 Table Density

| Label       | `cellPaddingBlock` | `cellPaddingInline` | Row Height |
| ----------- | ------------------ | ------------------- | ---------- |
| Compact     | 4px                | 8px                 | ~36px      |
| Default     | 8px                | 16px                | ~48px      |
| Comfortable | 12px               | 16px                | ~56px      |

Persisted to `localStorage` key `bo-table-density`.

### 15.6 Preset Themes

| #   | Name      | Primary   | Mode  | Radius | Description        |
| --- | --------- | --------- | ----- | ------ | ------------------ |
| 1   | Default   | `#1677FF` | Light | 8px    | Ant Design blue    |
| 2   | Ocean     | `#0891B2` | Light | 12px   | Calm cyan          |
| 3   | Forest    | `#16A34A` | Light | 8px    | Natural green      |
| 4   | Sunset    | `#EA580C` | Light | 12px   | Warm orange        |
| 5   | Corporate | `#475569` | Light | 4px    | Professional slate |
| 6   | Dark Pro  | `#6366F1` | Dark  | 8px    | Indigo on dark     |

Persisted to `localStorage` key `bo-preset`.

### 15.7 All localStorage Keys

| Key                | Type   | Default     | Values                                    |
| ------------------ | ------ | ----------- | ----------------------------------------- |
| `bo-theme`         | string | `"light"`   | `"light"`, `"dark"`, `"system"`           |
| `bo-accent-color`  | string | `""`        | Any valid hex                             |
| `bo-theme-radius`  | string | `"8"`       | `"0"`, `"4"`, `"8"`, `"12"`, `"16"`       |
| `bo-font-size`     | string | `"default"` | `"compact"`, `"default"`, `"comfortable"` |
| `bo-table-density` | string | `"default"` | `"compact"`, `"default"`, `"comfortable"` |
| `bo-direction`     | string | `"auto"`    | `"ltr"`, `"rtl"`, `"auto"`                |
| `bo-preset`        | string | `null`      | Preset ID or `null`                       |
| `bo-language`      | string | `"en"`      | `"en"`, `"ar"`                            |

---

## Appendix A: Ant Design Component Token Reference

Complete token overrides applied via `AntProvider` (`client/src/lib/antd-provider.tsx`):

```typescript
components: {
  Menu: {
    itemBg: "transparent",
    subMenuItemBg: "transparent",
    itemSelectedBg: sidebarAccent,
    itemHoverBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    itemSelectedColor: primary,
    activeBarBorderSize: 0,
    activeBarWidth: 0,
    itemBorderRadius: 8,
    itemMarginInline: 6,
    itemMarginBlock: 1,
    itemPaddingInline: 12,
    iconSize: 15,
    iconMarginInlineEnd: 10,
    groupTitleFontSize: 10,
  },
  Table: {
    headerBg: headerBg,
    rowHoverBg: rowHover,
    borderColor: border,
    headerSplitColor: "transparent",
    headerColor: textSub,
    rowSelectedBg: isDark ? "#2A1F40" : "#FAF5FF",
    rowSelectedHoverBg: isDark ? "#322548" : "#F3E8FF",
    cellPaddingBlock: 10,
    cellPaddingInline: 14,
  },
  Card: {
    paddingLG: 16,
    headerBg: "transparent",
  },
  Modal: {
    titleFontSize: 15,
    paddingMD: 24,
    headerBg: bgCard,
  },
  Form: {
    labelFontSize: 13,
    verticalLabelPadding: "0 0 5px",
    itemMarginBottom: 16,
  },
  Button: {
    primaryShadow: "none",
    defaultShadow: "none",
    dangerShadow: "none",
  },
  Input: {
    paddingInline: 12,
    colorBgContainer: bgCard,
    activeBorderColor: primary,
    hoverBorderColor: borderSub,
  },
  InputNumber: {
    paddingInline: 12,
    colorBgContainer: bgCard,
  },
  Select: {
    optionPadding: "6px 12px",
    colorBgContainer: bgCard,
    selectorBg: bgCard,
  },
  DatePicker: {
    colorBgContainer: bgCard,
    colorBgElevated: bgCard,
  },
  Segmented: {
    trackBg: muted,
    itemSelectedBg: bgCard,
    itemSelectedColor: text,
  },
  Statistic: {
    titleFontSize: 13,
    contentFontSize: 24,
  },
  Tag: {
    defaultBg: muted,
  },
  Progress: {
    defaultColor: primary,
  },
  Breadcrumb: {
    linkColor: textSub,
    linkHoverColor: primary,
    lastItemColor: text,
    separatorColor: borderSub,
    fontSize: 13,
  },
  Layout: {
    headerBg: bgCard,
    headerHeight: 56,
    siderBg: sidebarBg,
  },
  Dropdown: {
    colorBgElevated: bgCard,
  },
  Popover: {
    colorBgElevated: bgCard,
  },
}
```

---

## Appendix B: CSS Custom Properties Reference

All CSS custom properties defined in `client/src/index.css`:

```css
:root {
  --primary: #7c3aed;
  --primary-foreground: #ffffff;
  --background: #f8fafc;
  --foreground: #1e293b;
  --card: #ffffff;
  --card-foreground: #1e293b;
  --popover: #ffffff;
  --popover-foreground: #1e293b;
  --secondary: #f1f5f9;
  --secondary-foreground: #1e293b;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #7c3aed;
  --accent-foreground: #ffffff;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #ffffff;
  --ring: #7c3aed;
  --chart-1: #7c3aed;
  --chart-2: #a78bfa;
  --chart-3: #c4b5fd;
  --chart-4: #d8b4fe;
  --chart-5: #e9d5ff;
  --sidebar: #ffffff;
  --sidebar-foreground: #1e293b;
  --sidebar-primary: #7c3aed;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f5f3ff;
  --sidebar-accent-foreground: #7c3aed;
  --sidebar-border: #e2e8f0;
  --sidebar-ring: #7c3aed;
  --form-border: #e2e8f0;
  --form-text: #1e293b;
  --form-bg: #ffffff;
  --radius: 6px;
}
```

Dark mode overrides all of the above in `.dark { ... }` -- see `client/src/index.css` for complete values.

---

## Appendix C: Z-Index Scale

| Level      | Value | Usage                                          |
| ---------- | ----- | ---------------------------------------------- |
| `base`     | 0     | Default stacking context                       |
| `sticky`   | 100   | Sticky table headers, sticky tab bars          |
| `fixed`    | 1000  | Navbar, sidebar                                |
| `modal`    | 1000  | Modal backdrop and content (Ant default)       |
| `popover`  | 1030  | Popovers, tooltips (Ant default)               |
| `dropdown` | 1050  | Dropdowns, selects, date pickers (Ant default) |
| `toast`    | 2000  | Toast notifications (sonner)                   |
| `overlay`  | 9999  | Full-screen overlays, loading screens          |

---

## Appendix D: File Naming Conventions

| Type                  | Pattern                 | Example                           |
| --------------------- | ----------------------- | --------------------------------- |
| Page component        | `PascalCase.tsx`        | `ProductsList.tsx`                |
| Layout component      | `PascalCase.tsx`        | `DashboardLayout.tsx`             |
| UI primitive (shadcn) | `kebab-case.tsx`        | `button.tsx`, `dropdown-menu.tsx` |
| Common component      | `PascalCase.tsx`        | `StatusBadge.tsx`                 |
| Hook                  | `useCamelCase.ts`       | `useProducts.ts`                  |
| Context               | `PascalCaseContext.tsx` | `AuthContext.tsx`                 |
| Store (Zustand)       | `camelCaseStore.ts`     | `notificationsStore.ts`           |
| Type definition       | `kebab-case.ts`         | `product.ts`                      |
| Constants/Enums       | `kebab-case.ts`         | `enums.ts`                        |
| Config                | `kebab-case.config.ts`  | `releases.config.ts`              |

---

## Appendix E: Monetary Value Formatting

All monetary values displayed in the UI follow these rules:

| Rule                | Format                    | Example            |
| ------------------- | ------------------------- | ------------------ |
| Currency symbol     | Before amount, with space | `SAR 1,234.56`     |
| Thousands separator | Comma                     | `1,234,567`        |
| Decimal separator   | Period                    | `.56`              |
| Decimal places      | 2 (always shown)          | `SAR 1,234.00`     |
| Negative amounts    | Minus prefix              | `-SAR 1,234.56`    |
| Zero amounts        | Show with 2 decimals      | `SAR 0.00`         |
| Font                | Mono font stack           | `var(--font-mono)` |
| Alignment in tables | Right-aligned             | --                 |
| Color for negative  | `colorError`              | Red text           |
