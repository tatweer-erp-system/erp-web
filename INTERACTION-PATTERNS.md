# Tatweer ERP Backoffice -- Interaction Design Patterns

> **Stack**: React 19 + Ant Design 6 + react-hook-form + zod + Tailwind CSS v4
> **Bilingual**: English (LTR) + Arabic (RTL)
> **Optimistic Locking**: Every update payload includes `version: number`
> **Forms**: react-hook-form + zod for validation; Ant Design components as controlled inputs
> **Enums**: All status/type values from `client/src/constants/enums.ts` -- never hardcode strings

---

## Table of Contents

1. [Form Interaction Patterns](#1-form-interaction-patterns)
2. [Fast-Create Drawer Interaction](#2-fast-create-drawer-interaction)
3. [Detail Page Form Interaction](#3-detail-page-form-interaction)
4. [Status Transition Interactions](#4-status-transition-interactions)

---

## 1. Form Interaction Patterns

### 1.1 Field Validation Feedback

All validation uses zod schemas resolved via `zodResolver`. Errors render inline, never in a summary banner.

#### Error State (invalid)

- Red border on the input: `border-color: #EF4444` (Ant Design `status="error"`)
- Red text below the field: font-size 12px, `color: #EF4444`, margin-top 4px
- Error icon: `ExclamationCircleOutlined` in red, rendered inside the input suffix (for text inputs) or to the inline-end of the label (for selects/dates)
- Trigger: on blur for first interaction, then on change (re-validate as user types)
- Error text uses i18n keys: `t('validation.required', { field: t('fields.nameEn') })`

```tsx
{
  /* Error message below field */
}
{
  errors.nameEn && (
    <div
      style={{
        color: "#EF4444",
        fontSize: 12,
        marginTop: 4,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <ExclamationCircleOutlined style={{ fontSize: 12 }} />
      {errors.nameEn.message}
    </div>
  );
}
```

#### Success State (valid after correction)

- Green border on the input: `border-color: #10B981` for 2 seconds after clearing an error, then revert to default
- Green checkmark: `CheckCircleOutlined` in the input suffix, visible for 2 seconds
- Only shown when a field transitions from error to valid -- not on initial valid state

#### Warning State (advisory, non-blocking)

- Orange border: `border-color: #F59E0B` (Ant Design `status="warning"`)
- Orange text below field: font-size 12px, `color: #F59E0B`
- Orange icon: `WarningOutlined`
- Use cases: duplicate SKU suggestion, unusual amount (e.g., unit price > 10,000), date in the past

```tsx
{
  /* Warning example: unusual amount */
}
{
  watchedPrice > 10000 && !errors.unitPrice && (
    <div
      style={{
        color: "#F59E0B",
        fontSize: 12,
        marginTop: 4,
        display: "flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <WarningOutlined style={{ fontSize: 12 }} />
      {t("validation.unusualAmount")}
    </div>
  );
}
```

### 1.2 Required vs Optional Field Indicators

#### Required Fields

- Red asterisk `*` rendered after the label text, with `marginInlineStart: 4px`
- Color: `#EF4444`
- Custom `requiredMark` on `Form` component (matching the modal pattern from CLAUDE.md):

```tsx
requiredMark={(label, { required }) => (
  <>
    {label}
    {required && <span style={{ color: '#EF4444', marginInlineStart: 4 }}>*</span>}
  </>
)}
```

#### Optional Fields

- No asterisk, no extra label by default
- For fields where "optional" is non-obvious (e.g., in a mostly-required form), show `(${t('common.optional')})` in gray after the label:

```tsx
<span
  style={{
    color: token.colorTextTertiary,
    fontSize: 12,
    marginInlineStart: 6,
    fontWeight: 400,
  }}
>
  ({t("common.optional")})
</span>
```

### 1.3 Bilingual Field Pairs (nameEn + nameAr)

#### Detail / Edit Pages: Side-by-Side Layout

- Two fields in a single row, 50/50 split using Ant Design `Row` + `Col` with `span={12}`
- English field: `dir="ltr"`, `placeholder={t('fields.nameEnPlaceholder')}`
- Arabic field: `dir="rtl"`, `placeholder={t('fields.nameArPlaceholder')}`
- Labels: `t('common.nameEn')` and `t('common.nameAr')`
- Both required for required bilingual fields

```tsx
<Row gutter={16}>
  <Col span={12}>
    <Form.Item label={t("common.nameEn")} required>
      <Controller
        name="nameEn"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            dir="ltr"
            placeholder={t("fields.nameEnPlaceholder")}
            status={errors.nameEn ? "error" : ""}
          />
        )}
      />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item label={t("common.nameAr")} required>
      <Controller
        name="nameAr"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            dir="rtl"
            placeholder={t("fields.nameArPlaceholder")}
            status={errors.nameAr ? "error" : ""}
          />
        )}
      />
    </Form.Item>
  </Col>
</Row>
```

#### Fast-Create Drawer: Single Field

- Show one field based on the current UI language (`lang === 'ar'` shows Arabic input, otherwise English)
- Label: `t('common.name')` (not `nameEn` or `nameAr`)
- On save, the entered value is copied to both `nameEn` and `nameAr` as a placeholder
- The dir attribute matches the current language

```tsx
const { lang } = useAppSettings();
const nameField = lang === "ar" ? "nameAr" : "nameEn";

// In the zod transform or onSubmit handler:
const onSubmit = data => {
  const payload = {
    ...data,
    nameEn: data[nameField],
    nameAr: data[nameField],
  };
};
```

### 1.4 Money Inputs

- Input type: `InputNumber` from Ant Design
- Alignment: right-aligned text (`style={{ textAlign: 'right' }}` on the input, or use Ant Design's `controls={false}`)
- Currency prefix/suffix: determined by tenant base currency
  - SAR: suffix `SAR` (shown after the number)
  - If LTR: prefix position; if RTL: suffix position (currency always on the trailing side)
- Thousands separator: enabled via `formatter` -- displays `1,234.56`
- Decimal places: exactly 2, enforced via `precision={2}`
- Minimum: `0` (unless the field allows negatives, e.g., credit notes)
- Keyboard: arrow up/down increments by 1, Shift+arrow increments by 10

```tsx
<InputNumber
  style={{ width: "100%", textAlign: "right" }}
  precision={2}
  min={0}
  controls={false}
  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
  parser={value => value?.replace(/,/g, "") ?? ""}
  addonAfter={baseCurrency?.code ?? "SAR"}
  placeholder="0.00"
/>
```

### 1.5 Date Inputs

- Component: Ant Design `DatePicker` with locale from `antd/locale/ar_EG` or `antd/locale/en_US`
- Format: `YYYY-MM-DD` (stored), displayed as locale-appropriate format
- Presets: displayed as quick-select buttons above the calendar

| Preset                       | Value                        |
| ---------------------------- | ---------------------------- |
| `t('date.today')`            | `dayjs()`                    |
| `t('date.yesterday')`        | `dayjs().subtract(1, 'day')` |
| `t('date.thisWeekStart')`    | `dayjs().startOf('week')`    |
| `t('date.thisMonthStart')`   | `dayjs().startOf('month')`   |
| `t('date.thisQuarterStart')` | `dayjs().startOf('quarter')` |

- Relative labels: for display-only contexts (tables, cards), show relative time (`2 hours ago`, `Yesterday`) using `dayjs().fromNow()`, with full date on hover tooltip
- Date range picker: used for report filters, with the same presets plus `This Month`, `Last Month`, `This Quarter`, `This Year`

```tsx
<DatePicker
  style={{ width: "100%" }}
  format={lang === "ar" ? "YYYY/MM/DD" : "YYYY-MM-DD"}
  presets={[
    { label: t("date.today"), value: dayjs() },
    { label: t("date.yesterday"), value: dayjs().subtract(1, "day") },
    { label: t("date.thisWeekStart"), value: dayjs().startOf("week") },
    { label: t("date.thisMonthStart"), value: dayjs().startOf("month") },
  ]}
/>
```

### 1.6 Searchable Selects (Partner / Product / Account Dropdowns)

- Component: Ant Design `Select` with `showSearch`, `filterOption={false}`, server-side search
- Debounce: 300ms on search input before firing API call
- Loading: `Spin` indicator inside the dropdown while fetching
- Empty state: `t('common.noResults')` with optional "Create New" link
- Option rendering: custom `optionRender` with avatar/icon, primary text, and secondary text

#### Partner Select

```tsx
<Select
  showSearch
  filterOption={false}
  onSearch={debouncedSearch}
  loading={isSearching}
  optionRender={option => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar size={28} style={{ background: token.colorPrimary }}>
        {option.data.nameEn?.[0] ?? "?"}
      </Avatar>
      <div>
        <div style={{ fontWeight: 500 }}>{getName(option.data)}</div>
        <div style={{ fontSize: 11, color: token.colorTextTertiary }}>
          {option.data.phone}
        </div>
      </div>
    </div>
  )}
  notFoundContent={
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div>{t("common.noResults")}</div>
      <Button type="link" onClick={openPartnerFastCreate}>
        {t("partner.createNew")}
      </Button>
    </div>
  }
/>
```

#### Product Select

- Same pattern as partner, but option shows: product icon (by product type), name, SKU in gray, and unit price on the trailing side
- Product type icon: `ShoppingOutlined` for storable, `ToolOutlined` for service, `InboxOutlined` for consumable

#### Account Select (Chart of Accounts)

- Options show: account code (bold, monospaced), account name, account type badge
- Group options by account type: Asset, Liability, Equity, Revenue, Expense
- Account code uses `fontFamily: 'monospace'`

### 1.7 Multi-Select with Tags

- Component: Ant Design `Select` with `mode="multiple"`
- Tags: displayed inline within the select input, each with a remove `X` button
- Max visible: `maxTagCount={3}` with `maxTagPlaceholder` showing `+N more`
- Tag style: rounded pill shape, `borderRadius: 6`, background matches the entity type color
- Remove: click `X` on the tag, or Backspace key removes the last tag

```tsx
<Select
  mode="multiple"
  maxTagCount={3}
  maxTagPlaceholder={omittedValues => (
    <Tag style={{ borderRadius: 6 }}>
      +{omittedValues.length} {t("common.more")}
    </Tag>
  )}
  tagRender={({ label, closable, onClose }) => (
    <Tag
      closable={closable}
      onClose={onClose}
      style={{ borderRadius: 6, margin: "2px 4px 2px 0" }}
    >
      {label}
    </Tag>
  )}
/>
```

#### Use Cases

| Field       | Entity          | Max Visible |
| ----------- | --------------- | ----------- |
| Taxes       | Invoice line    | 2           |
| Permissions | Role edit       | 5           |
| Tags        | Product, Lead   | 3           |
| Branches    | User assignment | 3           |

### 1.8 Inline Editable Table Rows

Used in: Invoice lines, Sale Order lines, Purchase Order lines, Journal Entry lines.

#### Interaction Flow

1. **Add Row**: "Add Line" button at the bottom of the table. New row appears in edit mode with all cells active.
2. **Click Cell**: Single click on any cell in a saved row enters edit mode for that row.
3. **Tab Navigation**: Tab moves focus to the next editable cell in the row (left-to-right in LTR, right-to-left in RTL). At the last cell, Tab saves the row.
4. **Enter**: Saves the current row and exits edit mode.
5. **Escape**: Cancels edits on the current row, reverts to last saved state. If the row is new and empty, removes it.
6. **Delete Row**: Trash icon on the trailing side of each row. Shows a confirmation popover: `t('common.deleteLineConfirm')` with `[Cancel] [Delete]` buttons.
7. **Drag Reorder**: Drag handle on the leading side of each row. Uses `dnd-kit` or Ant Design's built-in drag support.
8. **Auto-calculate**: Changing quantity or unit price auto-recalculates line total. Changing tax recalculates tax amount.

#### Visual States

| State         | Row Background                                   | Border                                     |
| ------------- | ------------------------------------------------ | ------------------------------------------ |
| View (saved)  | `transparent`                                    | Bottom border `token.colorBorderSecondary` |
| Editing       | `token.colorPrimaryBg` (light blue/primary tint) | Bottom border `token.colorPrimary` 2px     |
| New (unsaved) | `token.colorWarningBg` (light yellow)            | Dashed bottom border `token.colorWarning`  |
| Error         | `token.colorErrorBg` (light red)                 | Bottom border `token.colorError`           |

#### Column Layout for Order Lines

| Column      | Width | Type              | Notes                                |
| ----------- | ----- | ----------------- | ------------------------------------ |
| Drag handle | 32px  | Icon              | `HolderOutlined`                     |
| #           | 40px  | Text              | Auto-numbered                        |
| Product     | 30%   | Searchable select | Uses product select pattern from 1.6 |
| Description | 20%   | Text input        | Auto-filled from product, editable   |
| Quantity    | 10%   | Number input      | `min: 0.01`, `precision: 2`          |
| Unit Price  | 12%   | Money input       | From product, editable               |
| Tax         | 10%   | Multi-select      | Tax tags                             |
| Subtotal    | 10%   | Calculated        | Read-only, `qty * unitPrice`         |
| Actions     | 48px  | Icons             | Delete button                        |

#### Column Layout for Journal Entry Lines

| Column  | Width | Type              | Notes                          |
| ------- | ----- | ----------------- | ------------------------------ |
| #       | 40px  | Text              | Auto-numbered                  |
| Account | 35%   | Searchable select | Account select from 1.6        |
| Label   | 20%   | Text input        | Description of the entry       |
| Partner | 15%   | Searchable select | Optional                       |
| Debit   | 12%   | Money input       | Mutually exclusive with Credit |
| Credit  | 12%   | Money input       | Mutually exclusive with Debit  |
| Actions | 48px  | Icons             | Delete button                  |

**Debit/Credit rule**: When the user enters a value in Debit, Credit is cleared to `0.00` and vice versa. The total row at the bottom shows sum of Debit, sum of Credit, and the difference. If difference is not 0, the totals row shows in red with an error message: `t('accounting.unbalancedEntry')`.

---

## 2. Fast-Create Drawer Interaction

### 2.0 Common Drawer Behavior

All fast-create drawers share these behaviors:

- **Component**: Ant Design `Drawer` with `placement={isRTL ? 'left' : 'right'}`, `width={520}`
- **Open animation**: Slide in from the trailing edge, 250ms ease-out
- **Auto-focus**: First input field receives focus 100ms after drawer open animation completes
- **Close on Escape**: `keyboard={true}` (Ant Design default)
- **Dirty form guard**: On close attempt (Escape, click mask, click X) while form is dirty, show confirmation modal:
  - Title: `t('common.unsavedChanges')`
  - Body: `t('common.unsavedChangesMessage')`
  - Buttons: `[${t('common.discard')}]` (danger ghost) + `[${t('common.keepEditing')}]` (primary)
  - "Discard" resets form and closes drawer; "Keep Editing" returns to form
- **Loading state during save**: Primary button shows `loading={true}` (spinner replaces icon), all inputs become `disabled`, secondary button remains enabled for cancel
- **Footer buttons**: Always two or three buttons:
  - `t('common.cancel')` -- closes drawer (with dirty guard)
  - `t('common.save')` -- saves and returns to list (closes drawer)
  - `t('common.saveAndOpen')` -- saves and navigates to the detail page of the new record
- **Footer layout**: Matches the gradient modal footer pattern: right-aligned, `gap: 10`, border-top separator
- **Success feedback**: Toast notification (top-right) on save: `t('common.createSuccess', { entity: t('module.entityName') })`

### 2.1 Product Fast-Create

**Drawer title**: `t('product.createNew')`

| Order | Field        | Component             | Required | Notes                                                                                                  |
| ----- | ------------ | --------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| 1     | Name         | `Input`               | Yes      | Single field per current lang (see 1.3). `dir` matches UI lang. Auto-focus.                            |
| 2     | SKU          | `Input`               | No       | Auto-suggest: generates `PRD-XXXXX` on focus if empty. Editable. Shows warning if duplicate.           |
| 3     | Product Type | `Select`              | Yes      | Options: `ProductType.STORABLE`, `ProductType.CONSUMABLE`, `ProductType.SERVICE`. Default: `STORABLE`. |
| 4     | Category     | `Select` (searchable) | Yes      | Loads from `/api/v1/inventory/categories`. Default: "General" if exists.                               |
| 5     | Unit Price   | `InputNumber`         | Yes      | Money input pattern (see 1.4). Default: `0.00`.                                                        |

**Zod schema**:

```typescript
const productFastCreateSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().max(50).optional(),
  productType: z.nativeEnum(ProductType),
  categoryId: z.string().uuid(),
  unitPrice: z.number().min(0).multipleOf(0.01),
});
```

### 2.2 Partner Fast-Create

**Drawer title**: `t('partner.createNew')`

| Order | Field | Component | Required | Notes                                                                                           |
| ----- | ----- | --------- | -------- | ----------------------------------------------------------------------------------------------- |
| 1     | Name  | `Input`   | Yes      | Single field per current lang. Auto-focus.                                                      |
| 2     | Type  | `Select`  | Yes      | Options: `ContactRole.CUSTOMER`, `ContactRole.VENDOR`, `ContactRole.BOTH`. Default: `CUSTOMER`. |
| 3     | Phone | `Input`   | No       | `type="tel"`, format hint placeholder `+966 5XX XXX XXXX`.                                      |
| 4     | Email | `Input`   | No       | `type="email"`, validates email format on blur.                                                 |

### 2.3 Invoice Fast-Create

**Drawer title**: `t('invoice.createNew')`
**Drawer width**: `720` (wider to accommodate line items table)

| Order | Field        | Component             | Required         | Notes                                                                                                                                                |
| ----- | ------------ | --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Partner      | Searchable `Select`   | Yes              | Partner select pattern (see 1.6). Auto-focus.                                                                                                        |
| 2     | Invoice Type | `Select`              | Yes              | Options: `InvoiceTypeNew.OUT_INVOICE`, `InvoiceTypeNew.OUT_REFUND`, `InvoiceTypeNew.IN_INVOICE`, `InvoiceTypeNew.IN_REFUND`. Default: `OUT_INVOICE`. |
| 3     | Invoice Date | `DatePicker`          | Yes              | Default: today. Presets from 1.5.                                                                                                                    |
| 4     | Lines        | Inline editable table | Yes (min 1 line) | Uses order line columns from 1.8. Starts with one empty row.                                                                                         |

**Line item summary row**: Shows below the table, right-aligned: Subtotal, Tax, Total. Updated live as lines change.

### 2.4 Sale Order Fast-Create

**Drawer title**: `t('salesOrder.createNew')`
**Drawer width**: `720`

| Order | Field    | Component             | Required         | Notes                                                       |
| ----- | -------- | --------------------- | ---------------- | ----------------------------------------------------------- |
| 1     | Customer | Searchable `Select`   | Yes              | Filtered to partners where `isCustomer = true`. Auto-focus. |
| 2     | Lines    | Inline editable table | Yes (min 1 line) | Product + Qty + Unit Price + Tax + Subtotal.                |

**Default status**: `SalesOrderStatus.DRAFT` (set automatically, not shown in form).

### 2.5 Purchase Order Fast-Create

**Drawer title**: `t('purchaseOrder.createNew')`
**Drawer width**: `720`

| Order | Field  | Component             | Required         | Notes                                                       |
| ----- | ------ | --------------------- | ---------------- | ----------------------------------------------------------- |
| 1     | Vendor | Searchable `Select`   | Yes              | Filtered to partners where `isSupplier = true`. Auto-focus. |
| 2     | Lines  | Inline editable table | Yes (min 1 line) | Product + Qty + Unit Price + Tax + Subtotal.                |

**Default status**: `PurchaseOrderStatus.DRAFT`.

### 2.6 Employee Fast-Create

**Drawer title**: `t('employee.createNew')`

| Order | Field           | Component           | Required | Notes                                                                                         |
| ----- | --------------- | ------------------- | -------- | --------------------------------------------------------------------------------------------- |
| 1     | Name            | `Input`             | Yes      | Single field per current lang. Auto-focus.                                                    |
| 2     | Department      | Searchable `Select` | Yes      | Loads from `/api/v1/hr/departments`.                                                          |
| 3     | Hire Date       | `DatePicker`        | Yes      | Default: today.                                                                               |
| 4     | Employment Type | `Select`            | Yes      | Options: `EmploymentType.FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`. Default: `FULL_TIME`. |

### 2.7 Lead Fast-Create

**Drawer title**: `t('lead.createNew')`

| Order | Field            | Component           | Required | Notes                                                                            |
| ----- | ---------------- | ------------------- | -------- | -------------------------------------------------------------------------------- |
| 1     | Title            | `Input`             | Yes      | Single field per current lang. Auto-focus.                                       |
| 2     | Partner          | Searchable `Select` | No       | Partner select pattern. Shows `(${t('common.optional')})` label.                 |
| 3     | Expected Revenue | `InputNumber`       | No       | Money input pattern.                                                             |
| 4     | Priority         | `Select`            | Yes      | Options: `LeadPriority.LOW`, `MEDIUM`, `HIGH`. Default: `MEDIUM`.                |
| 5     | Source           | `Select`            | No       | Options: `LeadSource.WEBSITE`, `REFERRAL`, `SOCIAL_MEDIA`, `COLD_CALL`, `OTHER`. |

### 2.8 Journal Entry Fast-Create

**Drawer title**: `t('journalEntry.createNew')`
**Drawer width**: `820` (widest, for debit/credit table)

| Order | Field      | Component             | Required          | Notes                                                                 |
| ----- | ---------- | --------------------- | ----------------- | --------------------------------------------------------------------- |
| 1     | Entry Date | `DatePicker`          | Yes               | Default: today. Auto-focus.                                           |
| 2     | Journal    | Searchable `Select`   | Yes               | Loads from `/api/v1/accounting/journals`.                             |
| 3     | Lines      | Inline editable table | Yes (min 2 lines) | Uses journal entry line columns from 1.8. Starts with two empty rows. |

**Validation**: The "Save" button is disabled (with tooltip `t('accounting.unbalancedEntry')`) when total debits do not equal total credits.

---

## 3. Detail Page Form Interaction

### 3.1 Edit Mode vs View Mode

Every detail page has two modes toggled by a single button in the page header.

#### View Mode (default on page load)

- Toggle button: `EditOutlined` icon + `t('common.edit')` text, outlined style
- All fields rendered as read-only:
  - Text fields: plain text (no input border), `color: token.colorText`
  - Select fields: displayed as text with the selected option's label
  - Date fields: formatted date string
  - Money fields: formatted number with currency
  - Bilingual fields: both shown side by side as text
- Background: fields have `background: token.colorFillQuaternary` (light gray) to indicate read-only
- No validation errors shown
- Status badge and action buttons are still interactive

#### Edit Mode

- Toggle button changes to: `CloseOutlined` icon + `t('common.cancel')` text, danger outlined style
- All editable fields become active inputs
- A "Save" button appears next to the cancel button: `SaveOutlined` icon + `t('common.save')`, primary style
- Switching to edit mode does NOT require a separate API call -- the current data is loaded into the form
- Fields animate from read-only to editable: `transition: all 200ms ease`

#### Toggling

- View -> Edit: Click "Edit" button. Form initializes with current record data including `version`.
- Edit -> View (cancel): Click "Cancel". If form is dirty, show unsaved changes dialog (see 3.3). If clean, revert immediately.
- Edit -> View (save): Click "Save". Submits form. On success, switches to view mode with updated data. On conflict, see 3.2.

```tsx
const [isEditing, setIsEditing] = useState(false);

// In page header actions:
{
  isEditing ? (
    <Space>
      <Button icon={<CloseOutlined />} danger onClick={handleCancelEdit}>
        {t("common.cancel")}
      </Button>
      <Button
        type="primary"
        icon={<SaveOutlined />}
        loading={updateMutation.isPending}
        onClick={handleSave}
      >
        {t("common.save")}
      </Button>
    </Space>
  ) : (
    <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
      {t("common.edit")}
    </Button>
  );
}
```

### 3.2 Optimistic Locking Conflict Resolution UI

When a `PUT`/`PATCH` request returns HTTP `409 Conflict`, the backend includes the current record version and modifier info.

#### Conflict Modal

- **Component**: Ant Design `Modal` with `type="warning"` icon
- **Title**: `t('common.conflictTitle')` -- "Record Modified"
- **Body**:
  ```
  t('common.conflictMessage', {
    user: conflictData.updatedBy,
    time: dayjs(conflictData.updatedAt).fromNow()
  })
  ```
  Rendered as: "This record was modified by **Ahmed** **5 minutes ago**."
- **Version comparison**: Displayed as a subtle info block:
  ```
  Your version: 3  |  Current version: 5
  ```
- **Buttons**:
  - `t('common.reload')` (primary) -- Fetches the latest version, reloads the form, user must re-apply their changes
  - `t('common.forceSave')` (danger, outlined) -- Sends the update with `force: true` header to bypass version check. Only shown to users with the `admin:override` permission.
  - `t('common.cancel')` (default) -- Closes the modal, user stays on the edit form with their changes intact

```tsx
<Modal
  open={showConflict}
  title={
    <Space>
      <WarningOutlined style={{ color: token.colorWarning }} />
      {t("common.conflictTitle")}
    </Space>
  }
  onCancel={() => setShowConflict(false)}
  footer={[
    <Button key="cancel" onClick={() => setShowConflict(false)}>
      {t("common.cancel")}
    </Button>,
    hasPermission("admin:override") && (
      <Button key="force" danger onClick={handleForceSave}>
        {t("common.forceSave")}
      </Button>
    ),
    <Button key="reload" type="primary" onClick={handleReload}>
      {t("common.reload")}
    </Button>,
  ]}
>
  <p>
    {t("common.conflictMessage", {
      user: conflict.updatedBy,
      time: dayjs(conflict.updatedAt).fromNow(),
    })}
  </p>
  <div
    style={{
      background: token.colorFillQuaternary,
      padding: "8px 12px",
      borderRadius: 6,
      fontSize: 12,
    }}
  >
    {t("common.yourVersion")}: <strong>{localVersion}</strong>
    {" | "}
    {t("common.currentVersion")}: <strong>{conflict.version}</strong>
  </div>
</Modal>
```

### 3.3 Unsaved Changes Warning

Two mechanisms work together to prevent accidental data loss:

#### Browser `beforeunload` Event

- Attached when the form becomes dirty (`formState.isDirty === true`)
- Removed when the form is clean or the page unmounts
- Shows the browser's native "Leave site?" dialog

```tsx
useEffect(() => {
  const handler = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}, [isDirty]);
```

#### In-App Route Change Interceptor

- Uses a custom `useUnsavedChangesGuard(isDirty)` hook that wraps the router's navigation
- When dirty and the user clicks a link or back button, intercepts and shows a modal:
  - **Title**: `t('common.unsavedChanges')`
  - **Body**: `t('common.unsavedChangesLeaveMessage')`
  - **Buttons**:
    - `t('common.discard')` -- danger ghost button. Discards changes, proceeds with navigation.
    - `t('common.saveAndContinue')` -- primary button. Saves the form, then navigates on success. If save fails, stays on page.
    - `t('common.stayOnPage')` -- default button. Cancels navigation, returns to form.

### 3.4 Auto-Save Draft

Applies only to records in `draft` status. Never auto-saves posted/confirmed/approved records.

#### Behavior

- **Debounce**: 3000ms after the last form field change
- **Trigger**: Any field value change (tracked via `watch()` from react-hook-form)
- **Indicator**: Small text in the page header: `t('common.saving')` with a subtle spinner while saving, then `t('common.savedAt', { time: '14:32' })` on success, fading to invisible after 5 seconds
- **API call**: `PATCH` with only the changed fields + `version`
- **Conflict handling**: Silent -- if 409, stop auto-save and show a subtle warning banner: `t('common.autoSaveConflict')`. The user must manually reload.
- **Disabled when**: Record is not in draft status, or the user has the form in view mode

```tsx
const AUTOSAVE_DEBOUNCE_MS = 3000;

useEffect(() => {
  if (record.status !== InvoiceStatusNew.DRAFT || !isEditing) return;

  const subscription = watch((formData, { name }) => {
    if (!name) return; // skip if no specific field changed
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleAutoSave(formData);
    }, AUTOSAVE_DEBOUNCE_MS);
  });

  return () => {
    subscription.unsubscribe();
    clearTimeout(autosaveTimer.current);
  };
}, [record.status, isEditing]);
```

---

## 4. Status Transition Interactions

### 4.0 Common Patterns

All status transitions share these patterns:

#### Action Button Placement

- Primary action buttons appear in the page header, after the status badge
- Destructive actions (Cancel, Void, Delete) are grouped in a "More" dropdown (`EllipsisOutlined` button)
- Maximum 3 visible buttons in the header; additional actions go in the dropdown

#### Confirmation Dialogs

All destructive or irreversible actions require confirmation:

- **Simple confirmation**: Ant Design `Modal.confirm()` with title, description, OK button (colored per severity), Cancel button
- **Confirmation with reason**: Same modal, but includes a `TextArea` for the reason. The OK button is disabled until the reason has at least 10 characters.
- **Reason field label**: `t('common.reasonRequired')`

#### Loading States

- The clicked action button shows `loading={true}` (spinner replaces the icon)
- All other action buttons become `disabled={true}` during the operation
- Form inputs remain visible but non-interactive
- Duration: until the API response is received

#### Toast Notifications

| Type    | Position  | Duration  | Icon                  | Background  |
| ------- | --------- | --------- | --------------------- | ----------- |
| Success | Top-right | 3 seconds | `CheckCircleOutlined` | Green tint  |
| Error   | Top-right | 5 seconds | `CloseCircleOutlined` | Red tint    |
| Warning | Top-right | 4 seconds | `WarningOutlined`     | Orange tint |
| Info    | Top-right | 3 seconds | `InfoCircleOutlined`  | Blue tint   |

- **Undo link**: Shown on success toasts for reversible actions (e.g., Cancel Order shows "Undo" which re-confirms)
- **Error detail**: Error toasts include the error message from the API. If the message is longer than 100 characters, it is truncated with a "Show more" link that expands it.

```tsx
notification.success({
  message: t("common.statusChanged"),
  description: t("invoice.posted"),
  placement: "topRight",
  duration: 3,
  btn: canUndo ? (
    <Button type="link" size="small" onClick={handleUndo}>
      {t("common.undo")}
    </Button>
  ) : undefined,
});
```

#### Status Badge Transition Animation

- Badge color transitions use `transition: background-color 300ms ease, border-color 300ms ease`
- On status change, the badge briefly scales up (`transform: scale(1.1)`) then returns to normal over 300ms

### 4.1 Invoice Status Transitions

**Statuses**: `InvoiceStatusNew.DRAFT`, `POSTED`, `CANCELLED`
**Payment statuses**: `InvoicePaymentStatus.NOT_PAID`, `PARTIAL`, `PAID`, `REVERSED`

| Current Status        | Available Actions  | Button Style                | Confirmation                               |
| --------------------- | ------------------ | --------------------------- | ------------------------------------------ |
| `DRAFT`               | Post               | Primary, `CheckOutlined`    | Simple: `t('invoice.confirmPost')`         |
| `DRAFT`               | Delete             | Danger link in dropdown     | Simple: `t('common.confirmDelete')`        |
| `POSTED` + `NOT_PAID` | Register Payment   | Primary, `DollarOutlined`   | Opens payment drawer                       |
| `POSTED` + `NOT_PAID` | Send to Customer   | Default, `SendOutlined`     | Simple: `t('invoice.confirmSend')`         |
| `POSTED` + `NOT_PAID` | Cancel             | Danger in dropdown          | With reason: `t('invoice.cancelReason')`   |
| `POSTED` + `PARTIAL`  | Register Payment   | Primary, `DollarOutlined`   | Opens payment drawer                       |
| `POSTED` + `PARTIAL`  | Cancel             | Danger in dropdown          | With reason (only if business rules allow) |
| `POSTED` + `PAID`     | Create Credit Note | Default, `RollbackOutlined` | Simple: `t('invoice.confirmCreditNote')`   |
| `CANCELLED`           | Reset to Draft     | Default, `UndoOutlined`     | Simple: `t('invoice.confirmResetDraft')`   |
| `CANCELLED`           | Delete             | Danger link in dropdown     | Simple: `t('common.confirmDelete')`        |

**Badge colors**:

| Status      | Color               | Text                    |
| ----------- | ------------------- | ----------------------- |
| `DRAFT`     | `default` (gray)    | `t('status.draft')`     |
| `POSTED`    | `processing` (blue) | `t('status.posted')`    |
| `CANCELLED` | `error` (red)       | `t('status.cancelled')` |
| `NOT_PAID`  | `warning` (orange)  | `t('status.notPaid')`   |
| `PARTIAL`   | `warning` (orange)  | `t('status.partial')`   |
| `PAID`      | `success` (green)   | `t('status.paid')`      |
| `REVERSED`  | `default` (gray)    | `t('status.reversed')`  |

### 4.2 Sales Order Status Transitions

**Statuses**: `SalesOrderStatus.DRAFT`, `CONFIRMED`, `DONE`, `CANCELLED`
**Invoice status**: `SalesOrderInvoiceStatus.NOTHING`, `TO_INVOICE`, `INVOICED`
**Delivery status**: `SalesOrderDeliveryStatus.PENDING`, `PARTIAL`, `DONE`

| Current Status | Available Actions  | Button Style                | Confirmation                                |
| -------------- | ------------------ | --------------------------- | ------------------------------------------- |
| `DRAFT`        | Confirm            | Primary, `CheckOutlined`    | Simple: `t('salesOrder.confirmOrder')`      |
| `DRAFT`        | Delete             | Danger link in dropdown     | Simple: `t('common.confirmDelete')`         |
| `CONFIRMED`    | Create Invoice     | Primary, `FileTextOutlined` | Opens invoice type selection drawer         |
| `CONFIRMED`    | Create Delivery    | Default, `SendOutlined`     | Simple: `t('salesOrder.confirmDelivery')`   |
| `CONFIRMED`    | Cancel             | Danger in dropdown          | With reason: `t('salesOrder.cancelReason')` |
| `DONE`         | Create Credit Note | Default, `RollbackOutlined` | Simple                                      |
| `CANCELLED`    | Reset to Draft     | Default, `UndoOutlined`     | Simple                                      |

**Badge colors**:

| Status      | Color               |
| ----------- | ------------------- |
| `DRAFT`     | `default` (gray)    |
| `CONFIRMED` | `processing` (blue) |
| `DONE`      | `success` (green)   |
| `CANCELLED` | `error` (red)       |

### 4.3 Purchase Order Status Transitions

**Statuses**: `PurchaseOrderStatus.DRAFT`, `CONFIRMED`, `DONE`, `CANCELLED`
**Bill status**: `PurchaseOrderBillStatus.NOTHING`, `TO_BILL`, `BILLED`
**Receipt status**: `PurchaseOrderReceiptStatus.NOTHING`, `PARTIAL`, `RECEIVED`

| Current Status | Available Actions | Button Style                | Confirmation        |
| -------------- | ----------------- | --------------------------- | ------------------- |
| `DRAFT`        | Confirm           | Primary, `CheckOutlined`    | Simple              |
| `DRAFT`        | Delete            | Danger link in dropdown     | Simple              |
| `CONFIRMED`    | Receive Products  | Primary, `InboxOutlined`    | Opens receipt form  |
| `CONFIRMED`    | Create Bill       | Default, `FileTextOutlined` | Opens bill creation |
| `CONFIRMED`    | Cancel            | Danger in dropdown          | With reason         |
| `DONE`         | --                | No actions (terminal state) | --                  |
| `CANCELLED`    | Reset to Draft    | Default, `UndoOutlined`     | Simple              |

### 4.4 Employee Status Transitions

**Statuses**: `EmploymentStatus.ACTIVE`, `PROBATION`, `SUSPENDED`, `TERMINATED`

| Current Status | Available Actions  | Button Style                | Confirmation                                 |
| -------------- | ------------------ | --------------------------- | -------------------------------------------- |
| `PROBATION`    | Confirm (Activate) | Primary, `CheckOutlined`    | Simple: `t('employee.confirmActivate')`      |
| `PROBATION`    | Terminate          | Danger in dropdown          | With reason: `t('employee.terminateReason')` |
| `ACTIVE`       | Suspend            | Warning in dropdown         | With reason: `t('employee.suspendReason')`   |
| `ACTIVE`       | Terminate          | Danger in dropdown          | With reason + effective date picker          |
| `SUSPENDED`    | Reactivate         | Primary, `UndoOutlined`     | Simple                                       |
| `SUSPENDED`    | Terminate          | Danger in dropdown          | With reason                                  |
| `TERMINATED`   | --                 | No actions (terminal state) | --                                           |

**Badge colors**:

| Status       | Color              |
| ------------ | ------------------ |
| `ACTIVE`     | `success` (green)  |
| `PROBATION`  | `warning` (orange) |
| `SUSPENDED`  | `warning` (orange) |
| `TERMINATED` | `error` (red)      |

### 4.5 Lead Status Transitions

Leads use a stage-based pipeline (Kanban), not a fixed status enum. Transitions are drag-and-drop on the Kanban board or dropdown on the detail page.

| Action                 | Button Style                                                  | Confirmation                                            |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------------------------- |
| Move to next stage     | Primary, `ArrowRightOutlined` (or `ArrowLeftOutlined` in RTL) | None (instant)                                          |
| Move to previous stage | Default, `ArrowLeftOutlined` (or `ArrowRightOutlined` in RTL) | None (instant)                                          |
| Mark as Won            | Success, `TrophyOutlined`                                     | Simple: `t('lead.confirmWon')` + optional revenue field |
| Mark as Lost           | Danger, `CloseCircleOutlined`                                 | With reason: `t('lead.lostReason')`                     |
| Reopen                 | Default, `UndoOutlined`                                       | Simple (only available on Won/Lost leads)               |
| Delete                 | Danger link in dropdown                                       | Simple                                                  |

### 4.6 Leave Request Status Transitions

**Statuses**: `LeaveStatus.PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`

| Current Status | Available Actions (Manager) | Button Style                      | Confirmation                           |
| -------------- | --------------------------- | --------------------------------- | -------------------------------------- |
| `PENDING`      | Approve                     | Success, `CheckOutlined`          | Simple: `t('leave.confirmApprove')`    |
| `PENDING`      | Reject                      | Danger, `CloseOutlined`           | With reason: `t('leave.rejectReason')` |
| `APPROVED`     | Cancel                      | Danger in dropdown                | With reason: `t('leave.cancelReason')` |
| `REJECTED`     | --                          | No actions (terminal for manager) | --                                     |

| Current Status | Available Actions (Employee) | Button Style            | Confirmation                       |
| -------------- | ---------------------------- | ----------------------- | ---------------------------------- |
| `PENDING`      | Cancel                       | Danger, `CloseOutlined` | Simple: `t('leave.confirmCancel')` |

### 4.7 Payroll Run Status Transitions

**Statuses**: `PayrollStatus.DRAFT`, `CONFIRMED`, `APPROVED`, `PAID`

| Current Status | Available Actions      | Button Style                  | Confirmation                                                |
| -------------- | ---------------------- | ----------------------------- | ----------------------------------------------------------- |
| `DRAFT`        | Calculate              | Default, `CalculatorOutlined` | None (instant, shows loading)                               |
| `DRAFT`        | Confirm                | Primary, `CheckOutlined`      | Simple: `t('payroll.confirmRun')`                           |
| `DRAFT`        | Delete                 | Danger link in dropdown       | Simple                                                      |
| `CONFIRMED`    | Approve                | Primary, `CheckOutlined`      | Simple: `t('payroll.confirmApprove')`                       |
| `CONFIRMED`    | Reject (back to draft) | Danger in dropdown            | With reason                                                 |
| `APPROVED`     | Mark as Paid           | Primary, `DollarOutlined`     | Simple: `t('payroll.confirmPaid')` with payment date picker |
| `PAID`         | --                     | No actions (terminal state)   | --                                                          |

**Badge colors**:

| Status      | Color               |
| ----------- | ------------------- |
| `DRAFT`     | `default` (gray)    |
| `CONFIRMED` | `processing` (blue) |
| `APPROVED`  | `warning` (orange)  |
| `PAID`      | `success` (green)   |

### 4.8 Project Status Transitions

**Statuses**: `ProjectStatus.PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `CANCELLED`

| Current Status | Available Actions | Button Style                   | Confirmation                           |
| -------------- | ----------------- | ------------------------------ | -------------------------------------- |
| `PLANNING`     | Start Project     | Primary, `PlayCircleOutlined`  | Simple                                 |
| `PLANNING`     | Cancel            | Danger in dropdown             | With reason                            |
| `ACTIVE`       | Put on Hold       | Warning in dropdown            | With reason: `t('project.holdReason')` |
| `ACTIVE`       | Complete          | Success, `CheckCircleOutlined` | Simple                                 |
| `ACTIVE`       | Cancel            | Danger in dropdown             | With reason                            |
| `ON_HOLD`      | Resume            | Primary, `PlayCircleOutlined`  | Simple                                 |
| `ON_HOLD`      | Cancel            | Danger in dropdown             | With reason                            |
| `COMPLETED`    | Reopen            | Default, `UndoOutlined`        | Simple                                 |
| `CANCELLED`    | --                | No actions (terminal state)    | --                                     |

### 4.9 Task Status Transitions

**Statuses**: `TaskStatus.TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`, `CANCELLED`

| Current Status | Available Actions | Button Style                  | Confirmation                               |
| -------------- | ----------------- | ----------------------------- | ------------------------------------------ |
| `TODO`         | Start             | Primary, `PlayCircleOutlined` | None (instant)                             |
| `TODO`         | Cancel            | Danger in dropdown            | Simple                                     |
| `IN_PROGRESS`  | Submit for Review | Primary, `EyeOutlined`        | None (instant)                             |
| `IN_PROGRESS`  | Block             | Warning in dropdown           | With reason: `t('task.blockReason')`       |
| `IN_PROGRESS`  | Cancel            | Danger in dropdown            | With reason                                |
| `IN_REVIEW`    | Approve (Done)    | Success, `CheckOutlined`      | None (instant)                             |
| `IN_REVIEW`    | Request Changes   | Default, `RollbackOutlined`   | With comment (moves back to `IN_PROGRESS`) |
| `BLOCKED`      | Unblock           | Primary, `UnlockOutlined`     | Simple (moves back to `IN_PROGRESS`)       |
| `DONE`         | Reopen            | Default, `UndoOutlined`       | Simple (moves back to `TODO`)              |
| `CANCELLED`    | --                | No actions (terminal state)   | --                                         |

### 4.10 Support Ticket Status Transitions

**Statuses**: `TicketStatus.OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

| Current Status | Available Actions | Button Style               | Confirmation         |
| -------------- | ----------------- | -------------------------- | -------------------- |
| `OPEN`         | Assign to Me      | Primary, `UserAddOutlined` | None (instant)       |
| `OPEN`         | Close             | Danger in dropdown         | With reason          |
| `IN_PROGRESS`  | Resolve           | Success, `CheckOutlined`   | With resolution note |
| `IN_PROGRESS`  | Close             | Danger in dropdown         | With reason          |
| `RESOLVED`     | Reopen            | Default, `UndoOutlined`    | Simple               |
| `RESOLVED`     | Close             | Primary, `LockOutlined`    | Simple               |
| `CLOSED`       | Reopen            | Default, `UndoOutlined`    | Simple               |

**Badge colors**:

| Status        | Color               |
| ------------- | ------------------- |
| `OPEN`        | `processing` (blue) |
| `IN_PROGRESS` | `warning` (orange)  |
| `RESOLVED`    | `success` (green)   |
| `CLOSED`      | `default` (gray)    |

### 4.11 POS Order Status Transitions

**Statuses**: `PosOrderStatus.OPEN`, `PAID`, `VOIDED`, `REFUNDED`

These transitions happen primarily in the POS interface (erp-web), but the backoffice can view them and perform limited actions.

| Current Status | Available Actions (Backoffice) | Button Style                | Confirmation                                       |
| -------------- | ------------------------------ | --------------------------- | -------------------------------------------------- |
| `PAID`         | Refund                         | Danger, `RollbackOutlined`  | With reason + refund type selection (full/partial) |
| `PAID`         | View Receipt                   | Default, `PrinterOutlined`  | None (opens receipt view)                          |
| `VOIDED`       | --                             | No actions (terminal state) | --                                                 |
| `REFUNDED`     | --                             | No actions (terminal state) | --                                                 |

### 4.12 POS Session Status Transitions

**Statuses**: `PosSessionStatus.OPEN`, `CLOSED`

| Current Status | Available Actions (Backoffice) | Button Style               | Confirmation                                                                       |
| -------------- | ------------------------------ | -------------------------- | ---------------------------------------------------------------------------------- |
| `OPEN`         | Force Close                    | Danger, `PoweroffOutlined` | With reason: `t('posSession.forceCloseReason')`. Requires `pos:manage` permission. |
| `CLOSED`       | --                             | View only                  | --                                                                                 |

### 4.13 Inventory Adjustment Status Transitions

Inventory adjustments follow the `ApprovalStatus` pattern.

| Current Status | Available Actions   | Button Style                  | Confirmation                     |
| -------------- | ------------------- | ----------------------------- | -------------------------------- |
| `DRAFT`        | Submit for Approval | Primary, `SendOutlined`       | Simple                           |
| `DRAFT`        | Delete              | Danger in dropdown            | Simple                           |
| `PENDING`      | Approve             | Success, `CheckOutlined`      | Simple: triggers stock movements |
| `PENDING`      | Reject              | Danger, `CloseOutlined`       | With reason                      |
| `APPROVED`     | --                  | No actions (applied to stock) | --                               |
| `REJECTED`     | Reset to Draft      | Default, `UndoOutlined`       | Simple                           |
| `CANCELLED`    | --                  | No actions (terminal state)   | --                               |

### 4.14 Contract Status Transitions

**Statuses**: `ContractStatus.DRAFT`, `ACTIVE`, `EXPIRED`, `CANCELLED`

| Current Status | Available Actions | Button Style                | Confirmation                                            |
| -------------- | ----------------- | --------------------------- | ------------------------------------------------------- |
| `DRAFT`        | Activate          | Primary, `CheckOutlined`    | Simple                                                  |
| `DRAFT`        | Delete            | Danger in dropdown          | Simple                                                  |
| `ACTIVE`       | Cancel            | Danger in dropdown          | With reason                                             |
| `EXPIRED`      | Renew             | Primary, `RedoOutlined`     | Opens renewal form (new contract with linked reference) |
| `CANCELLED`    | --                | No actions (terminal state) | --                                                      |

### 4.15 Payment Status Transitions

**Statuses**: `PaymentStatusNew.DRAFT`, `POSTED`, `CANCELLED`

| Current Status | Available Actions | Button Style             | Confirmation |
| -------------- | ----------------- | ------------------------ | ------------ |
| `DRAFT`        | Post              | Primary, `CheckOutlined` | Simple       |
| `DRAFT`        | Delete            | Danger in dropdown       | Simple       |
| `POSTED`       | Cancel            | Danger in dropdown       | With reason  |
| `CANCELLED`    | Reset to Draft    | Default, `UndoOutlined`  | Simple       |

---

## Appendix A: Status Color Map (Quick Reference)

All status badge colors in a single lookup. Use this to derive the `color` prop for Ant Design `Tag` or `Badge`.

```typescript
const STATUS_COLORS: Record<string, string> = {
  // Generic
  draft: "default",
  pending: "warning",
  confirmed: "processing",
  approved: "success",
  rejected: "error",
  cancelled: "error",
  active: "success",
  inactive: "default",

  // Invoice
  posted: "processing",
  not_paid: "warning",
  partial: "warning",
  paid: "success",
  reversed: "default",

  // Sales / Purchase
  done: "success",
  to_invoice: "warning",
  invoiced: "success",
  to_bill: "warning",
  billed: "success",

  // Employee
  probation: "warning",
  suspended: "warning",
  terminated: "error",

  // POS
  open: "processing",
  voided: "error",
  refunded: "error",

  // Project
  planning: "default",
  on_hold: "warning",
  completed: "success",

  // Task
  todo: "default",
  in_progress: "processing",
  in_review: "warning",
  blocked: "error",

  // Ticket
  resolved: "success",
  closed: "default",

  // Product
  discontinued: "error",
};
```

## Appendix B: Keyboard Shortcuts (Detail Pages)

| Shortcut           | Action                         | Context                  |
| ------------------ | ------------------------------ | ------------------------ |
| `Ctrl+E` / `Cmd+E` | Toggle edit mode               | Detail page, view mode   |
| `Ctrl+S` / `Cmd+S` | Save form                      | Detail page, edit mode   |
| `Escape`           | Cancel edit / Close drawer     | Edit mode / Open drawer  |
| `Ctrl+Enter`       | Save and close drawer          | Fast-create drawer       |
| `Tab`              | Next field / Next cell         | Form / Inline table edit |
| `Shift+Tab`        | Previous field / Previous cell | Form / Inline table edit |
| `Enter`            | Save row                       | Inline table row edit    |

## Appendix C: Animation Timing Reference

| Animation                         | Duration | Easing             | Property                                         |
| --------------------------------- | -------- | ------------------ | ------------------------------------------------ |
| Drawer slide in/out               | 250ms    | ease-out / ease-in | `transform`                                      |
| Status badge color change         | 300ms    | ease               | `background-color`, `border-color`               |
| Status badge scale pulse          | 300ms    | ease               | `transform: scale(1.0 -> 1.1 -> 1.0)`            |
| Field mode transition (view/edit) | 200ms    | ease               | `background-color`, `border-color`, `box-shadow` |
| Success checkmark appear          | 200ms    | ease-out           | `opacity`, `transform: scale(0.8 -> 1.0)`        |
| Toast enter                       | 300ms    | ease-out           | `transform: translateX(100% -> 0)`               |
| Toast exit                        | 200ms    | ease-in            | `opacity`, `transform: translateX(0 -> 100%)`    |
| Inline table row highlight        | 150ms    | ease               | `background-color`                               |
| Loading skeleton pulse            | 1500ms   | ease-in-out        | `opacity` (infinite)                             |

## Appendix D: Responsive Breakpoints

| Breakpoint | Width          | Form Layout                                                                    |
| ---------- | -------------- | ------------------------------------------------------------------------------ |
| Desktop    | >= 1200px      | 2-column fields, full inline tables                                            |
| Tablet     | 768px - 1199px | 1-column fields, inline tables with horizontal scroll                          |
| Mobile     | < 768px        | 1-column fields, drawer becomes full-screen, inline tables become card-per-row |

On mobile (< 768px):

- Fast-create drawer: `width="100%"` with `placement="bottom"` and `height="90vh"`
- Bilingual fields: stacked vertically instead of side-by-side
- Action buttons: collapse all into a single dropdown menu
- Inline table: each row becomes a stacked card with field labels
