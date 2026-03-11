# TypeScript type check

Run TypeScript type checking on the project.

## Steps

1. Run `pnpm check` (or `pnpm exec tsc --noEmit`) in the erp-web directory
2. If there are errors, list each error with its file path and line number
3. For each error, read the relevant code and suggest a fix
4. Apply fixes if they are straightforward and safe
5. Re-run to confirm all errors are resolved
