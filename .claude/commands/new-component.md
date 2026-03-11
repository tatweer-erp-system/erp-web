# Create a new component

Create a new reusable component named `$ARGUMENTS`.

## Steps

1. Read existing components in `client/src/components/` to understand the pattern
2. Determine the right location:
   - `client/src/components/ui/` for primitives (shadcn/Radix-based)
   - `client/src/components/common/` for shared business components
   - `client/src/components/layout/` for layout components
3. Create the component with:
   - TypeScript props interface
   - Proper forwarded refs if applicable
   - `cn()` utility for class merging (Tailwind)
   - All strings through `t(key, lang)` i18n system
   - RTL-aware styling using CSS logical properties
4. Add i18n keys to `en.ts` and `ar.ts` if needed
5. Run `pnpm lint` to verify
