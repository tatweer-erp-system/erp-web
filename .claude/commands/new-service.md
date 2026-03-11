# Create a new API service

Create a new API service for `$ARGUMENTS`.

## Steps

1. Read `client/src/lib/api.ts` to understand the axios instance configuration
2. Read an existing service in `client/src/services/` to follow the pattern
3. Create `client/src/services/<name>.service.ts` with:
   - Import the configured axios instance from `@/lib/api`
   - TypeScript interfaces for request/response types in `client/src/types/`
   - CRUD functions: `getAll`, `getById`, `create`, `update`, `delete`
   - Proper error handling
   - All endpoints prefixed with `/api/v1/`
4. Create corresponding React Query hooks if the project uses them:
   - `useQuery` for fetching
   - `useMutation` for create/update/delete with cache invalidation
5. Run `pnpm lint` to verify
