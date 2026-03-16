# CLAUDE.md

> Claude reads this file automatically at the start of every session.
> Every rule here is enforced without exception unless the user explicitly overrides it.
> When in doubt: prioritize clarity, correctness, and maintainability over cleverness.

---

## 0. AI Assistant Persona

Every Claude Code session in this repo must act as a **senior software engineer with 15 years of experience** building enterprise ERP systems and SaaS platforms.

Rules for every session:

- Write production-ready code only — no shortcuts, no placeholders
- Anticipate edge cases before they are asked about
- Never deviate from the forbidden patterns list
- Treat every file as if it will be reviewed by a principal engineer
- Never write `// TODO` — every function must be complete
- Use multi-agent execution for large tasks — spawn parallel subagents per workstream
- Read this entire CLAUDE.md before writing a single line of code
- Run the Pre-Response Self-Check (Section 19) before showing any code

---

## 1. Project Overview

**Product:** Tatweer — ERP system for SMEs
**Repo:** `tatweer-app/web`
**Role:** Main ERP web application — used daily by company staff
**Users:** Managers, accountants, sales reps, warehouse staff, HR

---

## 2. Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Framework    | React 19 + Vite + TypeScript 5 (strict)       |
| UI Library   | Ant Design 6 — sole component library         |
| Styling      | Tailwind CSS 4 + CSS variables                |
| State        | Zustand 5                                     |
| Server state | React Query (@tanstack/react-query 5)         |
| Routing      | React Router v6                               |
| Forms        | react-hook-form 7 + zod 4                     |
| Realtime     | Firebase (FCM notifications + Firestore chat) |
| Icons        | @ant-design/icons 6 + lucide-react            |
| Animation    | framer-motion 12                              |
| Charts       | recharts 2                                    |
| Tables       | @tanstack/react-table 8                       |
| Toasts       | sonner 2                                      |
| Date         | dayjs 1 + date-fns 4                          |
| HTTP         | Axios                                         |

---

## 3. Architecture Decisions

### Language & Direction

- Default language: Arabic (RTL)
- Supports: Arabic + English
- Direction: RTL for Arabic, LTR for English
- Ant Design has built-in RTL support via ConfigProvider direction="rtl"
- All name fields returned as nameEn + nameAr from API
- Frontend resolves which to display via `getName()` utility
- `document.dir` set only in lang.store — never in a component

### Theme System

- Full theme customizer — floating panel accessible from all pages
- Powered by Zustand theme.store.ts
- Uses Ant Design token system
- Persisted to localStorage
- Features: color, dark/light mode, font, border radius, layout, direction, table density, nav style, presets

### Branch Scope

- Active branch stored in Zustand branch.store.ts
- Every API call sends `x-branch-id` header automatically via axios interceptor
- Branch switcher in header
- Never pass branchId manually — always comes from store

### API Layer

- All API calls in `api/endpoints/*.api.ts` — pure axios functions
- All React Query hooks in `hooks/queries/` and `hooks/mutations/`
- NEVER call API directly from components — always via hooks
- Query keys always from `shared/constants/query-keys.ts`

---

## 4. TypeScript Rules

### Strictness

- TypeScript strict mode is ON. Never disable it or any sub-flags.
- Never use `any`. Use `unknown` + type narrowing, or define a proper type.
- Never use `as SomeType` to silence a type error — fix the actual type.
- `as const` is fine for literal types and lookup objects.
- `as unknown as T` is a code smell — if you need it, something is wrong upstream.

### Types vs Interfaces

- Use `type` for object shapes, unions, intersections, and mapped types.
- Use `interface` only when intentional declaration merging is required.
- Keep types co-located with the code that uses them unless shared — then move to `shared/interfaces/`.

### Enums — NEVER use TypeScript enum

Use `as const` objects instead. They tree-shake, work as values AND types, and generate no extra runtime code.

```typescript
// ✅ Correct
export const InvoiceStatus = {
  DRAFT: "draft",
  POSTED: "posted",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

// ❌ Wrong
enum InvoiceStatus {
  DRAFT = "draft",
  POSTED = "posted",
}
```

### Null Handling

- Prefer `undefined` over `null` for optional values in application code.
- `null` is acceptable only when an API explicitly returns it.
- Use optional chaining `?.` and nullish coalescing `??`.
- Never use `||` for default values when `0` or `''` are valid.

```typescript
// ✅ Correct
const name = record.nameAr ?? record.nameEn ?? "";
const count = value ?? 0;

// ❌ Wrong — breaks when value is 0 or ''
const count = value || 0;
```

### Generics

- Name generics descriptively when they carry meaning: `TData`, `TError`, `TItem`.
- Single-letter generics (`T`, `K`, `V`) acceptable only in short utility types.

---

## 5. Naming Conventions

### Files and Folders

| Thing               | Convention                            | Example                     |
| ------------------- | ------------------------------------- | --------------------------- |
| Component file      | PascalCase                            | `InvoiceTable.tsx`          |
| Hook file           | camelCase, `use` prefix               | `useInvoices.ts`            |
| Utility file        | camelCase                             | `formatCurrency.ts`         |
| Store file          | camelCase, `Store` suffix             | `themeStore.ts`             |
| Type/interface file | camelCase                             | `invoice.types.ts`          |
| Test file           | same name + `.test`                   | `InvoiceTable.test.tsx`     |
| Page file           | PascalCase + `Page` suffix            | `InvoicesPage.tsx`          |
| Constants file      | camelCase                             | `invoiceConstants.ts`       |
| Folder              | kebab-case                            | `components/invoice-table/` |
| API endpoint file   | camelCase + `.api`                    | `invoices.api.ts`           |
| Query hook file     | camelCase, `use` prefix               | `useInvoices.ts`            |
| Mutation hook file  | camelCase, `use` prefix + `Mutations` | `useInvoiceMutations.ts`    |

### Variables and Functions

| Thing              | Convention                   | Example                                  |
| ------------------ | ---------------------------- | ---------------------------------------- |
| Variable           | camelCase                    | `invoiceTotal`                           |
| Boolean variable   | `is/has/can/should` prefix   | `isLoading`, `hasPermission`             |
| Function           | camelCase, verb prefix       | `fetchInvoices`, `handleSubmit`          |
| Event handler      | `handle` prefix              | `handleDelete`, `handleFormSubmit`       |
| Async function     | no `async` suffix            | `fetchInvoices` not `fetchInvoicesAsync` |
| Constants          | SCREAMING_SNAKE_CASE         | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`     |
| React component    | PascalCase                   | `InvoiceTable`                           |
| Custom hook        | `use` prefix                 | `useInvoiceForm`                         |
| Zustand store hook | `use` + PascalCase + `Store` | `useThemeStore`                          |
| Zod schema         | camelCase + `Schema` suffix  | `invoiceSchema`                          |
| Type / Interface   | PascalCase                   | `InvoiceRow`, `ApiResponse<T>`           |

### Avoid

- Abbreviations unless universally known (`id`, `url`, `api`, `dto`).
- Single-letter variables outside short array callbacks.
- Generic names: `data`, `info`, `item`, `obj`, `temp` in module scope.
- Redundant context: inside `InvoiceTable`, a prop named `invoiceData` should just be `data`.

---

## 6. Project Structure

```
src/
├── main.tsx
├── App.tsx
├── router.tsx
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/
│   ├── globals.css
│   ├── antd-overrides.css
│   └── rtl.css
│
├── theme/
│   ├── theme.config.ts         # Ant Design token overrides
│   ├── theme.presets.ts        # preset themes
│   ├── theme.types.ts          # ThemeConfig type
│   └── theme.utils.ts          # generateToken, applyTheme, persistTheme
│
├── stores/                     # Zustand stores — one per concern
│   ├── auth.store.ts           # user, token, permissions
│   ├── branch.store.ts         # activeBranch, allowedBranches
│   ├── theme.store.ts          # activeTheme, mode, customTokens
│   ├── lang.store.ts           # lang (ar/en), direction
│   ├── notification.store.ts   # unread count, notification list
│   └── chat.store.ts           # activeConversation, unread messages
│
├── api/
│   ├── client.ts               # axios instance + interceptors only
│   ├── query-client.ts         # React Query client config
│   └── endpoints/              # pure axios functions — one file per module
│       ├── auth.api.ts
│       ├── products.api.ts
│       ├── partners.api.ts
│       ├── invoices.api.ts
│       ├── sale-orders.api.ts
│       ├── purchase-orders.api.ts
│       ├── accounting.api.ts
│       ├── inventory.api.ts
│       ├── hr.api.ts
│       ├── payroll.api.ts
│       ├── reports.api.ts
│       ├── settings.api.ts
│       └── chat.api.ts
│
├── hooks/
│   ├── queries/                # useQuery wrappers — one per module
│   │   ├── useProducts.ts
│   │   ├── usePartners.ts
│   │   ├── useInvoices.ts
│   │   ├── useSaleOrders.ts
│   │   ├── usePurchaseOrders.ts
│   │   ├── useAccounting.ts
│   │   ├── useInventory.ts
│   │   ├── useHr.ts
│   │   ├── usePayroll.ts
│   │   └── useReports.ts
│   ├── mutations/              # useMutation wrappers — one per module
│   │   ├── useProductMutations.ts
│   │   ├── usePartnerMutations.ts
│   │   ├── useInvoiceMutations.ts
│   │   ├── useSaleOrderMutations.ts
│   │   └── ...
│   └── ui/                     # reusable UI behavior hooks
│       ├── useBreakpoint.ts
│       ├── useDirection.ts
│       ├── usePermission.ts
│       ├── useBranchScope.ts
│       ├── useTheme.ts
│       ├── useLang.ts
│       ├── useTranslation.ts
│       └── useModalWidth.ts
│
├── shared/
│   ├── constants/
│   │   ├── status.enum.ts      # as const objects — never TypeScript enum
│   │   ├── query-keys.ts
│   │   ├── magic-numbers.ts
│   │   └── routes.ts
│   ├── interfaces/             # shared TypeScript types
│   │   ├── api-response.types.ts
│   │   ├── paginated.types.ts
│   │   └── theme.types.ts
│   └── utils/
│       ├── getName.util.ts     # getName(record) → nameAr or nameEn by lang
│       ├── t.util.ts           # t(key, lang) → bilingual translation
│       ├── cn.util.ts          # cn() → clsx + tailwind-merge
│       ├── date.util.ts
│       ├── number.util.ts
│       ├── permission.util.ts
│       └── currency.util.ts
│
├── i18n/
│   ├── ar.ts                   # Arabic dictionary (flat keys)
│   └── en.ts                   # English dictionary (same flat keys)
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MobileDrawer.tsx
│   │   ├── BranchSwitcher.tsx
│   │   ├── PageHeader.tsx
│   │   └── ContentWrapper.tsx
│   │
│   ├── theme-customizer/
│   │   ├── ThemeCustomizer.tsx
│   │   ├── ThemeCustomizerTrigger.tsx
│   │   └── sections/
│   │       ├── ColorSection.tsx
│   │       ├── ModeSection.tsx
│   │       ├── LayoutSection.tsx
│   │       ├── FontSection.tsx
│   │       ├── BorderRadiusSection.tsx
│   │       ├── PresetsSection.tsx
│   │       ├── DirectionSection.tsx
│   │       ├── TableDensitySection.tsx
│   │       └── NavStyleSection.tsx
│   │
│   ├── notifications/
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationDrawer.tsx
│   │   ├── NotificationItem.tsx
│   │   └── NotificationToast.tsx
│   │
│   ├── chat/
│   │   ├── ChatWidget.tsx
│   │   ├── ChatPanel.tsx
│   │   ├── ConversationList.tsx
│   │   ├── ConversationWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── NewConversationModal.tsx
│   │   └── tabs/
│   │       ├── MembersTab.tsx
│   │       ├── CustomersTab.tsx
│   │       └── SupportTab.tsx
│   │
│   └── common/
│       ├── AppTable.tsx
│       ├── AppModal.tsx
│       ├── FastCreateModal.tsx
│       ├── PageTitle.tsx
│       ├── StatusBadge.tsx
│       ├── SearchInput.tsx
│       ├── FilterBar.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── ConfirmModal.tsx
│       ├── CurrencyInput.tsx
│       ├── DateRangePicker.tsx
│       ├── BranchTag.tsx
│       ├── ResponsiveCard.tsx
│       └── MobileTable.tsx
│
├── pages/                      # one file per route — default export — lazy loaded
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── products/
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   └── ProductFormPage.tsx
│   ├── partners/
│   ├── accounting/
│   ├── inventory/
│   ├── sales/
│   ├── purchasing/
│   ├── hr/
│   ├── payroll/
│   ├── crm/
│   ├── reports/
│   ├── settings/
│   └── chat/
│       └── ChatPage.tsx
│
└── firebase/
    ├── firebase.config.ts
    ├── firebase.app.ts
    ├── messaging/
    │   ├── fcm.service.ts
    │   └── fcm.hooks.ts
    └── firestore/
        ├── chat.service.ts
        ├── chat.hooks.ts
        └── presence.service.ts
```

### Structure Rules

- Never create a file outside this structure without a clear reason.
- Keep components small — split anything over 200 lines.
- Never create `index.ts` barrel files — import directly from the file path.
- Tests live next to the file they test: `InvoiceTable.tsx` + `InvoiceTable.test.tsx`.
- Co-locate small file-local subcomponents in the same file. Move to own file once over 80 lines or used elsewhere.

---

## 7. Component Rules

### File structure (in this exact order)

```typescript
// 1. React
import { useState, useMemo } from "react";

// 2. Third-party (alphabetical by package name)
import { Button, Table } from "antd";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

// 3. Internal — @/ alias only, never relative paths
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import type { InvoiceRow } from "@/shared/interfaces/invoice.types";

// 4. Local types
type Props = {
  data: InvoiceRow[];
  isLoading: boolean;
  onDelete: (id: number) => void;
};

// 5. Component — named export
export function InvoiceTable({ data, isLoading, onDelete }: Props) {
  // hooks in the order defined in Section 7 below
  // derived state and memos
  // handlers
  // early returns (no permission, empty state, error)
  // JSX
}

// 6. File-local subcomponents (small, not reused elsewhere)
function InvoiceActions({
  id,
  onDelete,
}: {
  id: number;
  onDelete: (id: number) => void;
}) {
  return null;
}
```

### Exports

- Named exports for all components: `export function InvoiceTable`
- Default exports only for page components (required by `React.lazy()`)
- Never `export default` a component reused across multiple pages

### Props

- Always destructure in the function signature
- Never use `React.FC` or `React.FunctionComponent` — type props directly
- Avoid prop drilling beyond 2 levels — lift to context or Zustand
- Boolean props: shorthand when true → `<Button disabled />` not `<Button disabled={true} />`
- Never pass raw setter functions (`setIsOpen`) — pass intent functions (`onOpen`, `onClose`)

### Hooks order inside a component

1. Translation / lang hooks (`useTranslation`, `useLang`)
2. Router hooks (`useNavigate`, `useParams`)
3. Store hooks (`useThemeStore`, `useBranchStore`)
4. Query hooks (`useInvoices`, `useProducts`)
5. Mutation hooks (`useCreateInvoice`, `useUpdateProduct`)
6. State hooks (`useState`)
7. Ref hooks (`useRef`)
8. Memos (`useMemo`, `useCallback`)
9. Effects (`useEffect`) — always last

### useEffect Rules

- Never use `useEffect` to fetch data — use React Query
- Never use `useEffect` to sync derived state — compute inline or with `useMemo`
- Dependency array must be complete and correct
- Every `useEffect` with a subscription, timer, or listener must return a cleanup function

---

## 8. State Management

### Decision tree

```
Is this data from the server?
  Yes  → React Query (hooks/queries/ or hooks/mutations/)
  No   → Is it shared across multiple components?
    Yes  → Zustand store
    No   → useState / useReducer
```

### React Query Rules

- All server data via hooks in `hooks/queries/` and `hooks/mutations/`
- Config: `staleTime: 5 * 60 * 1000`, `retry: 1`, `refetchOnWindowFocus: false`
- Use `queryClient.invalidateQueries` after mutations
- Use `isPending` (not `isLoading`) for mutations
- Query keys always from `shared/constants/query-keys.ts`

### Zustand Rules

- One store per concern — never mix unrelated state
- Keep stores flat — no nested objects deeper than 1 level
- `persist` middleware only for UI preferences, not server data
- Always use selectors — never subscribe to the full store:

```typescript
// ✅ Correct — re-renders only when preset changes
const preset = useThemeStore(s => s.preset);

// ❌ Wrong — re-renders on any store change
const store = useThemeStore();
```

---

## 9. Styling Rules

### Precedence

1. Tailwind utility classes for layout, spacing, sizing, flex, grid
2. CSS variables for colors, typography, radius, motion
3. Ant Design `ConfigProvider` tokens for component overrides
4. Inline `style={{}}` only for dynamic values computed in JavaScript

### Hard Rules

- Never hardcode color values — use `var(--color-*)` or Tailwind tokens
- Always use Tailwind logical properties for directional spacing:
  `ms-` `me-` `ps-` `pe-` instead of `ml-` `mr-` `pl-` `pr-`
  `text-start` / `text-end` instead of `text-left` / `text-right`
- Never use arbitrary Tailwind values (`w-[437px]`) — add to `tailwind.config`
- Never use `!important` — fix the specificity
- Never concatenate class strings with template literals — breaks Tailwind's static analysis
- For conditional classes use the `cn()` utility (clsx + tailwind-merge):

```typescript
import { cn } from '@/shared/utils/cn.util'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

---

## 10. Forms

Every form follows this exact pattern — no exceptions:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Schema defined FIRST — outside the component at module scope
const invoiceSchema = z.object({
  nameEn:  z.string().min(1, 'Required'),
  nameAr:  z.string().min(1, 'Required'),
  amount:  z.coerce.number().positive('Must be positive'),
  status:  z.enum(['draft', 'posted', 'paid']),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

export function InvoiceForm({ onSuccess }: { onSuccess: () => void }) {
  const { t, lang } = useTranslation()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { status: 'draft' },
  })

  const { mutate, isPending } = useCreateInvoiceMutation()

  function onSubmit(values: InvoiceFormValues) {
    mutate(values, {
      onSuccess: () => { reset(); onSuccess() },
      onError:   (err) => toast.error(err.message),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Form.Item
        label={t('invoice.nameEn', lang)}
        validateStatus={errors.nameEn ? 'error' : ''}
        help={errors.nameEn?.message}
      >
        <Input {...register('nameEn')} />
      </Form.Item>
      <Button htmlType="submit" type="primary" loading={isPending || isSubmitting}>
        {t('common.save', lang)}
      </Button>
    </form>
  )
}
```

### Form Rules

- Zod schema always at module scope, before the component
- `FormValues` type always `z.infer<typeof schema>`
- `z.coerce.number()` for numeric inputs (HTML inputs return strings)
- `noValidate` on `<form>` to disable native browser validation
- Multi-step forms: one schema per step, combined with `z.intersection` at the end
- Never use Ant Design Form validation — always zod + react-hook-form

---

## 11. i18n Rules

- Every user-visible string uses `t(key, lang)` — zero hardcoded strings in JSX
- Keys are flat dot-notation: `'invoice.form.title'` — never nested objects
- Both `en.ts` and `ar.ts` updated in the same commit with identical key sets
- Bilingual data from API: flat `nameEn` / `nameAr` fields — never `name: { en, ar }`
- Display via `getName(record)` utility — never access `record.nameEn` directly in JSX
- Dates, numbers, currencies: always locale-aware formatting via `Intl` APIs
- `document.dir` set only in `lang.store.ts` — never in a component

### t() utility pattern

```typescript
// shared/utils/t.util.ts
import ar from '@/i18n/ar'
import en from '@/i18n/en'

const dictionaries = { ar, en }

export const t = (key: string, lang: 'ar' | 'en'): string => {
  return dictionaries[lang][key] ?? dictionaries['en'][key] ?? key
}

// In components — ALWAYS via useTranslation hook:
const { t, lang } = useTranslation()
<span>{t('invoice.title', lang)}</span>

// NEVER:
<span>Invoice</span>
<span>{lang === 'ar' ? 'فاتورة' : 'Invoice'}</span>
```

### getName() pattern

```typescript
// shared/utils/getName.util.ts
import { useLangStore } from '@/stores/lang.store'

export const getName = (record: { nameEn?: string; nameAr?: string } | null | undefined): string => {
  if (!record) return ''
  const lang = useLangStore.getState().lang
  if (lang === 'ar') return record.nameAr || record.nameEn || ''
  return record.nameEn || record.nameAr || ''
}

// In JSX — ALWAYS:
<span>{getName(product)}</span>

// NEVER:
<span>{product.nameEn}</span>
<span>{lang === 'ar' ? product.nameAr : product.nameEn}</span>
```

---

## 12. FastCreateModal Pattern

```typescript
// When creating a record quickly, show only ONE name field (current language)
// On save: set BOTH nameEn and nameAr to the same value as fallback
// User completes the other language on the detailed page

// The field label changes with language:
label={lang === 'ar' ? 'الاسم' : 'Name'}

// On submit:
const buildPayload = (name: string) => ({
  nameEn: name,  // same value — user fixes on detail page
  nameAr: name,
})

// Show a note below the field:
t('common.fast_create_note', lang)
// ar: "يمكنك إضافة الاسم بالإنجليزية لاحقاً من صفحة التفاصيل"
// en: "You can add the Arabic name later from the details page"
```

---

## 13. AppModal Rule

```typescript
// NEVER use plain Ant Design Modal directly in pages
// ALWAYS use AppModal which enforces:
// - Gradient header (primary → accent color)
// - White title text
// - Consistent sizing
// - RTL support
// - Full screen on mobile

<AppModal
  title={t('product.create', lang)}
  open={isOpen}
  onClose={handleClose}
  width={600}
>
  {children}
</AppModal>
```

---

## 14. Error Handling

### Error boundary hierarchy

```
App.tsx
└── <ErrorBoundary fallback={<AppCrash />}>
    └── Router
        └── Each page
            └── <ErrorBoundary fallback={<PageError />}>
                └── PageComponent
```

### Rules

- Every page has its own `<ErrorBoundary>`
- Async errors in event handlers: always `try/catch`, never swallow silently
- Display errors via `sonner` toast — translated, never raw API messages
- `console.error(error)` in catch blocks only — remove all `console.log`
- Never show stack traces or raw error objects to users in production
- API errors: extract bilingual message from `error.response.data.error.message`

---

## 15. Performance Rules

### Code Splitting

- Every page: `const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'))`
- Heavy components (PDF viewer, rich text editor) lazy-loaded at component level too

### Memoization

- `useMemo` for expensive derivations on large data (filter, sort, format)
- `useCallback` for functions passed to memoized children
- `React.memo` for components with stable props that render frequently
- Never memoize everything — memoization has overhead, profile first

### Lists

- Any list potentially exceeding 50 items: use `@tanstack/react-virtual`
- Never render an unbounded list into the DOM

### Imports — Always Tree-shake

```typescript
// ✅ Correct
import { format } from "date-fns";
import { debounce } from "lodash";

// ❌ Wrong
import * as dateFns from "date-fns";
import _ from "lodash";
```

---

## 16. Responsiveness

All layouts must work at xs (360px), md (768px), and xl (1200px) minimum.

| Breakpoint | Width   | Target        |
| ---------- | ------- | ------------- |
| xs         | 360px+  | Phones        |
| sm         | 576px+  | Large phones  |
| md         | 768px+  | Tablets       |
| lg         | 992px+  | Small laptops |
| xl         | 1200px+ | Desktops      |
| 2xl        | 1600px+ | Wide monitors |

### Rules

- Use `useBreakpoint()` hook for breakpoint detection
- Tables below `md`: render `<MobileTable>` (card list) instead of `<AppTable>`
- Modals on xs/sm: full-screen via `useModalWidth()` hook
- All interactive elements: minimum 44×44px touch target
- Sidebar on mobile: hidden, opens as drawer via `<MobileDrawer>`
- Bottom tab bar on xs/sm for primary navigation
- Tailwind logical properties everywhere (RTL-safe by default)
- Ant Design `Row`/`Col` with responsive `span` props for all grids

---

## 17. Accessibility

- All interactive elements: visible focus state — never `outline: none` without replacement
- `<button>` for actions, `<a>` for navigation — never `<div onClick>`
- Icon-only buttons: always `aria-label`
- Images: meaningful `alt` or `alt=""` for decorative
- Form fields: `htmlFor` / `id` pair for every label
- Headings in correct hierarchy — never skip levels
- Color is never the only way to convey information
- Keyboard navigation works for all patterns
- Modals trap focus — drawers close on Escape

---

## 18. Code Quality Standards

### Size Limits

- Max function length: 40 lines
- Max component length: 200 lines
- Max file length: 300 lines
- Max parameters: 3 — beyond that, use an options object

### Design Principles

- Functions do one thing — if you need "and" in the description, split them
- Early returns over nested if/else:

```typescript
// ✅ Correct
function process(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;
  if (!user.hasPermission) return null;
  // logic at top level
}

// ❌ Wrong — logic buried 4 levels deep
function process(user: User | null) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // ...
      }
    }
  }
}
```

- Avoid boolean parameters that hide intent:

```typescript
// ✅ Correct
renderUser(user, { showAvatar: true });

// ❌ Wrong — what does `true` mean?
renderUser(user, true);
```

### Comments

- Comments explain WHY, not WHAT
- Delete commented-out code — use git history
- JSDoc for all exported functions and hooks
- `// TODO:` must include a ticket ref: `// TODO(Tatweer-412): remove after migration`

---

## 19. Forbidden Patterns — NEVER Violate These

| #   | Forbidden                                   | Correct                                    |
| --- | ------------------------------------------- | ------------------------------------------ |
| 1   | API calls directly in components            | hooks/queries/ or hooks/mutations/ only    |
| 2   | Hardcoded status strings `'active'`         | `as const` enum objects                    |
| 3   | TypeScript `enum` keyword                   | `as const` objects                         |
| 4   | `any` type                                  | `unknown` + narrowing or proper type       |
| 5   | `as SomeType` to silence errors             | Fix the actual type                        |
| 6   | Inline type shapes in components            | `shared/interfaces/` folder                |
| 7   | Business logic in components                | In hooks or utils                          |
| 8   | Magic numbers inline                        | `shared/constants/magic-numbers.ts`        |
| 9   | Relative imports `../../`                   | `@/` path alias only                       |
| 10  | `record.nameEn` directly in JSX             | `getName(record)`                          |
| 11  | Hardcoded strings in JSX                    | `t(key, lang)`                             |
| 12  | `lang === 'ar' ? x : y` in JSX              | `getName()` or `t()`                       |
| 13  | shadcn Dialog for modals                    | `AppModal` component                       |
| 14  | Hardcoded colors                            | Theme tokens or CSS variables              |
| 15  | `ml-` `mr-` `pl-` `pr-` in Tailwind         | `ms-` `me-` `ps-` `pe-`                    |
| 16  | `text-left` / `text-right`                  | `text-start` / `text-end`                  |
| 17  | Arbitrary Tailwind values `w-[437px]`       | Add to tailwind.config                     |
| 18  | Direct localStorage access                  | Zustand persisted stores                   |
| 19  | `\|\|` for defaults when `0`/`''` valid     | `??` nullish coalescing                    |
| 20  | `useEffect` for data fetching               | React Query                                |
| 21  | `useEffect` for derived state               | `useMemo`                                  |
| 22  | `React.FC` or `React.FunctionComponent`     | Type props directly                        |
| 23  | Default export for shared components        | Named export                               |
| 24  | Barrel `index.ts` files                     | Import directly from file                  |
| 25  | Unbounded list rendering                    | `@tanstack/react-virtual`                  |
| 26  | Page without `React.lazy()`                 | Always lazy in router                      |
| 27  | `console.log` anywhere                      | Remove — use `console.error` in catch only |
| 28  | Forms without react-hook-form + zod         | Always use both                            |
| 29  | i18n key in one language file only          | Always update both `en.ts` and `ar.ts`     |
| 30  | `document.dir` in a component               | `lang.store.ts` only                       |
| 31  | Array index as React `key` in dynamic lists | Stable unique id                           |
| 32  | `import * as X from 'lib'`                  | Named imports only                         |
| 33  | `moment.js`                                 | `dayjs` or `date-fns`                      |
| 34  | `interface` for regular type shapes         | `type`                                     |
| 35  | x-branch-id missing from API calls          | Always via axios interceptor in client.ts  |

---

## 20. Theme Customizer

The ThemeCustomizer panel supports ALL of these:

| Section       | Options                                                           |
| ------------- | ----------------------------------------------------------------- |
| Color         | Primary color picker, accent color picker                         |
| Mode          | Light / Dark / System                                             |
| Layout        | Sidebar expanded/collapsed, sidebar position (left/right)         |
| Font          | Font size (small/medium/large), font family                       |
| Border Radius | None / Small / Medium / Large                                     |
| Presets       | 6+ preset themes: default, dark, ocean, forest, sunset, corporate |
| Direction     | LTR / RTL                                                         |
| Table Density | Compact / Default / Comfortable                                   |
| Nav Style     | Filled / Outlined / Minimal                                       |

All settings:

- Applied immediately (live preview)
- Persisted to localStorage via theme.store
- Synced with Ant Design 6 ConfigProvider tokens

---

## 21. Firebase Setup

### Notifications (FCM)

- Request permission on login
- Store FCM token in backend (`users` table)
- Listen for foreground messages → show `sonner` toast
- Background messages → handled by service worker
- On notification click → navigate to relevant page

### Chat (Firestore)

```
conversations/{conversationId}
  type: 'member_member' | 'support_customer' | 'support_support'
  participants: userId[]
  lastMessage: string
  lastMessageAt: timestamp
  unreadCount: { [userId]: number }

messages/{conversationId}/messages/{messageId}
  senderId: string
  text: string
  createdAt: timestamp
  readBy: userId[]
  type: 'text' | 'image' | 'file'

presence/{userId}
  online: boolean
  lastSeen: timestamp
```

---

## 22. Git and Commit Rules

| Type       | When                            |
| ---------- | ------------------------------- |
| `feat`     | New feature                     |
| `fix`      | Bug fix                         |
| `refactor` | Code change, no behavior change |
| `perf`     | Performance improvement         |
| `test`     | Adding or fixing tests          |
| `docs`     | Documentation only              |
| `style`    | Formatting only                 |
| `chore`    | Build, deps, config             |
| `ci`       | CI/CD changes                   |
| `revert`   | Reverting a commit              |

### Rules

- Summary line: 72 chars max, imperative mood, no period
- Body explains WHY, not WHAT
- Never commit: commented-out code, `console.log`, `.env` files
- Branch naming: `feat/invoice-pdf`, `fix/table-pagination`

---

## 23. Pre-Response Self-Check

Before showing any code, verify every item:

**TypeScript**

- [ ] No `any`
- [ ] No `@ts-ignore` without explanation
- [ ] No TypeScript `enum` — using `as const`
- [ ] No `as Type` to silence errors
- [ ] No `||` for defaults when `0` or `''` are valid — using `??`

**Naming**

- [ ] File name correct casing for its type
- [ ] Booleans have `is`/`has`/`can`/`should` prefix
- [ ] Handlers have `handle` prefix
- [ ] No generic names (`data`, `item`, `info`) in module scope

**Components**

- [ ] Named export (except lazy pages)
- [ ] No `React.FC`
- [ ] Under 200 lines
- [ ] Hooks in correct order
- [ ] No `useEffect` for data fetching or derived state

**Styling**

- [ ] No hardcoded colors
- [ ] No arbitrary Tailwind values
- [ ] Logical properties only (`ms-`, `me-`, `ps-`, `pe-`)
- [ ] `cn()` for conditional classes

**Forms**

- [ ] Schema defined before component at module scope
- [ ] `z.infer<typeof schema>` for FormValues type
- [ ] `zodResolver` connected
- [ ] `noValidate` on `<form>`

**i18n**

- [ ] No hardcoded strings in JSX — using `t(key, lang)`
- [ ] `getName(record)` not `record.nameEn`
- [ ] New keys added to both `en.ts` and `ar.ts`

**Performance**

- [ ] Tree-shaken imports (named only)
- [ ] Lists over 50 items virtualized
- [ ] Page is lazy-loaded in router

**Responsiveness**

- [ ] Works at xs, md, xl
- [ ] Table has `MobileTable` fallback below md
- [ ] Logical properties used throughout

**Quality**

- [ ] No `console.log`
- [ ] No magic numbers inline
- [ ] No commented-out code
- [ ] Early returns used to flatten nesting
- [ ] Functions under 40 lines
- [ ] Files under 300 lines

**Tatweer-specific**

- [ ] `x-branch-id` always sent via axios interceptor
- [ ] Query keys from `shared/constants/query-keys.ts`
- [ ] `AppModal` used (not plain Ant Design Modal)
- [ ] Both `nameEn` and `nameAr` set on create

---

## 24. Current Build Status

```
Cycle 1 — IN PROGRESS
  ⏳ Project initialized
  ⏳ Folder structure created
  ⏳ Dependencies installed
  ⏳ Auth pages
  ⏳ App shell (layout, sidebar, header)
  ⏳ Theme customizer
  ⏳ Branch switcher
  ⏳ Users pages
  ⏳ Branches pages
```

Update this section as cycles are completed.
