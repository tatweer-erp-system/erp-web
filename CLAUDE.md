# erp-web — Tatweer ERP System (Web Client)

## Quick Reference

- **Package manager:** pnpm
- **Dev server:** `pnpm dev` (Vite, port 4200)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- **Type check:** `pnpm check` or `npx tsc --noEmit`

## Git Branching

- **Main branch:** `prod` (protected — never push directly)
- **Branch prefixes:** `feat/`, `fix/`, `hotfix/`, `chore/`, `refactor/`
- Branch names: lowercase, kebab-case (e.g., `feat/invoice-export`)
- Always branch from `dev`, PR into `dev`
- Hotfixes branch from `prod`, merge into both `prod` and `dev`
- Delete branches after merge

## Tech Stack

- React 19 + TypeScript 5.6 + Vite 7
- UI: Ant Design 6 + Radix UI + Tailwind CSS 4
- State: React Context + Zustand + TanStack React Query 5
- Router: Wouter 3
- Forms: React Hook Form + Zod
- HTTP: Axios (Bearer auth, 30s timeout)
- i18n: Custom `t(key, lang)` — English + Arabic (RTL)

## Project Structure

```
client/src/
├── components/ui/        # Radix-based component library (30+)
├── components/layout/    # DashboardLayout, Sidebar, Navbar
├── components/common/    # LoadingSkeleton, ErrorBoundary
├── pages/                # 50+ page components by module
├── contexts/             # AuthContext, AppSettingsContext, PinLockContext
├── lib/                  # routes.tsx, api.ts, utils.ts, antd-provider.tsx
├── hooks/                # usePermissions, usePagination, useMobile, useDebounce
├── services/             # auth, inventory, users, pin
├── store/                # Zustand (notifications)
├── types/                # auth.ts, api.ts, modules/
├── i18n/                 # index.ts, en.ts, ar.ts
└── modules/pos/          # POS feature module
server/                   # Express static server
```

## Key Conventions

- **Naming:** Components → PascalCase, constants → SCREAMING_SNAKE_CASE, hooks → use\*
- **Routes:** Centralized in `client/src/lib/routes.tsx` with permissions + breadcrumbs
- **API calls:** Always through service layer (`client/src/services/`), never directly in components
- **Styling:** Tailwind utilities + CSS variables; Ant Design themed via AntProvider bridge
- **Code splitting:** All route components are lazy-loaded
- **State:** Server state in React Query, client state in Context/Zustand, persisted in localStorage

## Enums — No Magic Strings (MANDATORY)

All status, type, and action values must use constants from `client/src/constants/enums.ts`.
Never hardcode string literals like `'active'`, `'paid'`, `'pending'` in components or services.

```typescript
// ✅ CORRECT
import { LeadStatus } from '@/constants/enums';
if (lead.status === LeadStatus.WON) { ... }

// ❌ WRONG — never do this
if (lead.status === 'won') { ... }
```

**What to replace:** status comparisons, color/badge maps, case statements, filter option values, inline arrays of statuses.
**What NOT to replace:** i18n keys (`t('...')`), CSS classes, route paths, API endpoints, localStorage keys, object property names in configs.

## Auth & Roles

- 6 roles: SuperAdmin (`*`), Admin, Manager, Accountant, Viewer, Cashier (POS-only)
- Route protection in App.tsx; permission checking via `usePermissions` hook
- Mock auth with localStorage persistence (backend-ready service layer)

## Theme

- 5 presets (Ocean, Forest, Sunset, Amethyst, Slate) × light/dark modes
- CSS variables on `:root` drive Tailwind + Ant Design theming
- Customizable accent color + border radius

## i18n

- `t(key, lang)` with `en.ts` / `ar.ts` dictionaries
- RTL support: `document.dir` set automatically for Arabic
- Language stored in localStorage (`app-language`)
