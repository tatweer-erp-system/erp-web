# Create a new page

Create a new page named `$ARGUMENTS` following the project's existing patterns.

## Steps

1. Read `client/src/lib/routes.tsx` and an existing page in `client/src/pages/` to understand the pattern
2. Create the page component in `client/src/pages/<module>/` or `client/src/pages/<PageName>.tsx`
   - Use functional component with TypeScript
   - Add loading skeleton state
   - Add empty state
   - Add error boundary handling
   - Use `t(key, lang)` for all user-facing strings
   - Lazy-loadable (default export)
3. Add the route entry in `client/src/lib/routes.tsx` with proper permissions and breadcrumb
4. Add sidebar navigation item in `client/src/components/layout/Sidebar.tsx`
5. If the page needs data fetching, create a service file in `client/src/services/`
6. Add i18n keys to both `client/src/i18n/en.ts` and `client/src/i18n/ar.ts`
7. Run `pnpm lint` to verify no issues
