# API Verification Report — Auth, Users, Admins, Roles & Permissions

> **Generated**: 2026-03-17
> **Method**: Exhaustive line-by-line comparison of FRONTEND-SPEC.md against actual backend source code
> **Verified files**: Controllers, DTOs, Services, Interfaces, Enums

---

## Legend

- ✅ Matches spec
- ⚠️ Difference found (details provided)
- ❌ Missing or incorrect

---

## 1. Auth Module

Source: `erp-api/src/modules/auth/`

---

### POST /auth/login

- **Controller**: ✅ Found at `controllers/auth.controller.ts:34` — `@Public() @Post('login')`
- **Permission**: ✅ Public (no auth required)
- **Request DTO**: ✅ `LoginDto` matches spec — `email: @IsEmail @IsNotEmpty`, `password: @IsString @IsNotEmpty @MinLength(8)`
- **Response**: ⚠️ Differences:
  - Spec says `user.firstName, user.lastName` — code returns `firstName, lastName` (non-bilingual, single field). Actual interface (`auth.interface.ts:6-15`) confirms `firstName: string, lastName: string` (not `firstNameEn/firstNameAr`).
  - Spec says `branches: { id, name, code, isDefault }[]` — actual interface (`auth.interface.ts:24-33`) returns `{ id, nameEn, nameAr, code, address, isMain, isActive, isDefault }`. **Spec is missing `nameEn/nameAr` (has `name` instead), missing `address`, `isMain`, `isActive`**.
  - Spec says `tenant: { slug, nameEn, nameAr, logo }` — actual interface confirms this. ✅
- **Notes**: Branch response shape in spec is incomplete.

---

### POST /auth/:tenantSlug/login

- **Controller**: ✅ Found at `controllers/auth.controller.ts:46` — `@Public() @Post(':tenantSlug/login')`
- **Permission**: ✅ Public
- **Request DTO**: ✅ Same `LoginDto`
- **Response**: ✅ Same as `/auth/login` (same differences apply)
- **Notes**: None additional.

---

### POST /auth/refresh

- **Controller**: ✅ Found at `controllers/auth.controller.ts:62` — `@Public() @Post('refresh')`
- **Permission**: ✅ Public
- **Request DTO**: ✅ `RefreshTokenDto` matches — `refreshToken: @IsString @IsNotEmpty`
- **Response**: ✅ Same `LoginResponse` shape (same branch differences apply)
- **Notes**: Controller verifies refresh token via `jwtSharedService.verifyRefreshToken` before calling service. Spec correctly notes same response as login.

---

### POST /auth/logout

- **Controller**: ✅ Found at `controllers/auth.controller.ts:109` — `@UseGuards(JwtAuthGuard) @Post('logout')`
- **Permission**: ✅ JWT required (no specific permission)
- **Request DTO**: ✅ No body required
- **Response**: ⚠️ Spec says `200 OK` — code uses `@HttpCode(HttpStatus.OK)` and service returns `void`. The response interceptor will wrap it. Functionally matches.
- **Notes**: None.

---

### GET /auth/sessions

- **Controller**: ✅ Found at `controllers/auth.controller.ts:120` — `@UseGuards(JwtAuthGuard) @Get('sessions')`
- **Permission**: ✅ JWT required
- **Response**: ✅ Matches — `SessionInfo[]` with `{ id, ipAddress, userAgent, lastSeenAt, createdAt, isCurrent }` (confirmed in `auth.interface.ts:55-62`)
- **Notes**: `isCurrent` is always `false` in current implementation (hardcoded at `auth.service.ts:328`). Frontend should be aware this field is not yet functional.

---

### DELETE /auth/sessions/:id

- **Controller**: ✅ Found at `controllers/auth.controller.ts:130` — `@UseGuards(JwtAuthGuard) @Delete('sessions/:id')`
- **Permission**: ✅ JWT required
- **Response**: ✅ Returns void (200 OK via `@HttpCode`)
- **Notes**: None.

---

### DELETE /auth/sessions

- **Controller**: ✅ Found at `controllers/auth.controller.ts:142` — `@UseGuards(JwtAuthGuard) @Delete('sessions')`
- **Permission**: ✅ JWT required
- **Response**: ✅ Returns void (200 OK)
- **Notes**: None.

---

### GET /auth/pin/status

- **Controller**: ✅ Found at `controllers/auth.controller.ts:153` — `@UseGuards(JwtAuthGuard) @Get('pin/status')`
- **Permission**: ✅ JWT required
- **Response**: ✅ `{ hasPin: boolean }` (confirmed `auth.service.ts:345-348`)
- **Notes**: None.

---

### POST /auth/pin/set

- **Controller**: ✅ Found at `controllers/auth.controller.ts:162` — `@UseGuards(JwtAuthGuard) @Post('pin/set')`
- **Permission**: ✅ JWT required
- **Request DTO**: ⚠️ Spec says `{ pin: string } // 4-6 digits` — code uses inline `body: { pin: string }` with **no validation** (no DTO class, no `@Matches` for digit pattern, no `@MinLength(4)/@MaxLength(6)`). PIN validation is missing.
- **Response**: ✅ Returns void
- **Notes**: No formal DTO exists for pin/set or pin/verify. The controller uses inline `{ pin: string }` without class-validator decorators. This means any string will be accepted as a PIN.

---

### POST /auth/pin/verify

- **Controller**: ✅ Found at `controllers/auth.controller.ts:170` — `@UseGuards(JwtAuthGuard) @Post('pin/verify')`
- **Permission**: ✅ JWT required
- **Request DTO**: ⚠️ Same issue as pin/set — inline body, no formal DTO or validation
- **Response**: ✅ Returns void (or throws BadRequestException)
- **Notes**: Same PIN validation gap.

---

### POST /auth/select-branch (NOT IN SPEC)

- **Controller**: ✅ Found at `controllers/auth.controller.ts:85` — `@UseGuards(JwtAuthGuard) @Post('select-branch')`
- **Permission**: JWT required
- **Request DTO**: `SelectBranchDto` — `{ branchId: @IsUUID }`
- **Response**: `{ accessToken: string, refreshToken: string }`
- **Notes**: ❌ **This endpoint is MISSING from the spec.** It is a critical part of the two-step login flow (login -> select branch -> get new tokens with branchId). The spec does not document this endpoint at all.

---

## 2. Users Module

Source: `erp-api/src/modules/users/`

---

### GET /users

- **Controller**: ✅ Found at `controllers/users.controller.ts:136` — `@Get() @Permissions('settings:view')`
- **Permission**: ✅ `settings:view` matches spec
- **Query**: ✅ `PaginationDto`
- **Notes**: None.

---

### GET /users/dropdown

- **Controller**: ✅ Found at `controllers/users.controller.ts:42` — `@Get('dropdown')`
- **Permission**: ✅ JWT only (no specific permission) — matches spec "no specific permission"
- **Query**: ✅ `DropdownQueryDto`
- **Notes**: None.

---

### GET /users/:id

- **Controller**: ✅ Found at `controllers/users.controller.ts:145` — `@Get(':id') @Permissions('settings:view')`
- **Permission**: ✅ `settings:view`
- **Notes**: None.

---

### POST /users

- **Controller**: ✅ Found at `controllers/users.controller.ts:156` — `@Post() @Permissions('settings:create')`
- **Permission**: ✅ `settings:create`
- **Request DTO**: ⚠️ Differences in `CreateUserDto`:
  - Spec says `roleIds: string[] // @ArrayMinSize(1), UUID[]` — code has `@IsNotEmpty @IsArray @ArrayMinSize(1) @IsString({ each: true })`. **Code uses `@IsString` not `@IsUUID` for role ID validation.** UUIDs will pass `@IsString` but non-UUID strings will also be accepted.
  - All other fields match: `email: @IsEmail`, `password: @MinLength(8)`, `firstNameEn/firstNameAr/lastNameEn/lastNameAr: @MaxLength(100)`, `phone?: @MaxLength(30)`
- **Response**: ✅ Returns created user via `findById`
- **Notes**: Service maps `firstNameEn` -> `firstName` and `lastNameEn` -> `lastName` in DB. Arabic names (`firstNameAr`, `lastNameAr`) are accepted in DTO but **not stored** — `users.service.ts:63-64` only saves `firstName: dto.firstNameEn, lastName: dto.lastNameEn`. Arabic name fields are silently ignored.

---

### PUT /users/:id

- **Controller**: ✅ Found at `controllers/users.controller.ts:170` — `@Put(':id') @Permissions('settings:update')`
- **Permission**: ✅ `settings:update`
- **Request DTO**: ⚠️ `UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password']))` + `version?: number @IsOptional @IsInt @Min(0)`.
  - Spec says `version?: number` — code has `version?: number` (optional). **Spec says "All fields from create are optional + version" which is correct, but `password` is explicitly omitted.** Spec doesn't mention password is excluded from update — this is correct behavior but spec should clarify.
  - Same Arabic name issue: `firstNameAr`, `lastNameAr` accepted but not persisted on update (`users.service.ts:99-103` only maps `firstName: dto.firstNameEn, lastName: dto.lastNameEn`).
- **Notes**: Arabic name fields are accepted in DTO but silently dropped during persistence.

---

### DELETE /users/:id

- **Controller**: ✅ Found at `controllers/users.controller.ts:186` — `@Delete(':id') @Permissions('settings:delete') @HttpCode(204)`
- **Permission**: ✅ `settings:delete`
- **Response**: ✅ 204 No Content
- **Notes**: None.

---

### PATCH /users/:id/restore

- **Controller**: ✅ Found at `controllers/users.controller.ts:202` — `@Patch(':id/restore') @Permissions('settings:update')`
- **Permission**: ✅ `settings:update`
- **Notes**: None.

---

### PATCH /users/:id/password

- **Controller**: ✅ Found at `controllers/users.controller.ts:217` — `@Patch(':id/password')`
- **Permission**: ⚠️ Spec says "Auth: JWT" — code has **no `@Permissions` guard** on this endpoint but controller-level `@UseGuards(JwtAuthGuard)` applies. **Any authenticated user can change any user's password** (no ownership check in controller or service). This may be intentional (admin can change user passwords) but spec says "Auth: JWT" implying self-service only.
- **Request DTO**: ✅ `ChangePasswordDto` matches: `currentPassword: @IsNotEmpty @IsString`, `newPassword: @IsNotEmpty @IsString @MinLength(8)`, `confirmPassword: @IsNotEmpty @IsString`
- **Response**: ✅ `{ message: 'Password changed successfully' }`
- **Notes**: Service validates `currentPassword` against hash and checks `newPassword === confirmPassword`.

---

### PATCH /users/:id/roles

- **Controller**: ✅ Found at `controllers/users.controller.ts:230` — `@Patch(':id/roles') @Permissions('settings:update')`
- **Permission**: ✅ `settings:update`
- **Request DTO**: ⚠️ Uses inline `body: { roleIds: string[] }` — **no formal DTO class, no validation decorators**. The `roleIds` field has no `@IsArray`, `@IsUUID`, or `@ArrayMinSize` validation.
- **Response**: ✅ Returns updated user via `findById`
- **Notes**: Missing DTO validation.

---

### GET /users/me

- **Controller**: ✅ Found at `controllers/users.controller.ts:51` — `@Get('me')`
- **Permission**: ✅ JWT only
- **Response**: ✅ Returns user profile via `findById`
- **Notes**: None.

---

### GET /users/me/appearance

- **Controller**: ✅ Found at `controllers/users.controller.ts:116` — `@Get('me/appearance')`
- **Permission**: ✅ JWT only
- **Response**: ✅ Returns appearance settings. Spec says `{ theme, primaryColor, language, density }` which matches the `UpdateAppearanceDto` fields.
- **Notes**: None.

---

### PATCH /users/me/appearance

- **Controller**: ✅ Found at `controllers/users.controller.ts:123` — `@Patch('me/appearance')`
- **Permission**: ✅ JWT only
- **Request DTO**: ✅ `UpdateAppearanceDto` matches:
  - `theme?: @IsEnum(AppearanceTheme)` — values: `'light' | 'dark' | 'system'` ✅
  - `primaryColor?: @IsString` ✅
  - `language?: @IsEnum(AppearanceLanguage)` — values: `'en' | 'ar'` ✅
  - `density?: @IsEnum(AppearanceDensity)` — values: `'compact' | 'default' | 'comfortable'` ✅
- **Notes**: None.

---

### POST /users/me/data-export

- **Controller**: ✅ Found at `controllers/users.controller.ts:58` — `@Post('me/data-export')`
- **Permission**: ✅ JWT only
- **Notes**: None.

---

### POST /users/me/erasure-request

- **Controller**: ✅ Found at `controllers/users.controller.ts:65` — `@Post('me/erasure-request')`
- **Permission**: ✅ JWT only
- **Request DTO**: ⚠️ Controller accepts inline `body: { reason?: string }` — not documented in spec. The spec says no body.
- **Notes**: Minor — optional `reason` field is accepted but not in spec.

---

### GET /users/me/consents

- **Controller**: ✅ Found at `controllers/users.controller.ts:77` — `@Get('me/consents')`
- **Permission**: ✅ JWT only
- **Notes**: None.

---

### POST /users/me/consents

- **Controller**: ✅ Found at `controllers/users.controller.ts:84` — `@Post('me/consents')`
- **Permission**: ✅ JWT only
- **Request DTO**: ✅ `CreateConsentDto` matches:
  - `consentType: @IsEnum(ConsentType)` — values: `'marketing_email' | 'sms_notifications' | 'data_analytics' | 'third_party_sharing'` ✅
  - `granted: @IsBoolean @IsNotEmpty` ✅
- **Notes**: None.

---

### DELETE /users/me/consents/:type

- **Controller**: ✅ Found at `controllers/users.controller.ts:101` — `@Delete('me/consents/:type')`
- **Permission**: ✅ JWT only
- **Response**: ⚠️ Code returns `{ message: 'Consent revoked successfully' }` with `@HttpCode(200)`. Spec doesn't specify response shape.
- **Notes**: None.

---

## 3. Admins Module

Source: `erp-api/src/modules/admins/`

---

### POST /admins/login

- **Controller**: ✅ Found at `controllers/admins.controller.ts:34` — `@Public() @Post('login')`
- **Permission**: ✅ Public
- **Request DTO**: ✅ `AdminLoginDto` matches: `email: @IsEmail @IsNotEmpty`, `password: @IsString @IsNotEmpty @MinLength(8)`
- **Response**: ✅ Matches spec — `{ accessToken, admin: { id, email, firstName, lastName } }` (confirmed `admins.service.ts:29-32,64-72`)
- **Notes**: None.

---

### POST /admins/logout

- **Controller**: ✅ Found at `controllers/admins.controller.ts:45` — `@UseGuards(JwtAuthGuard) @Post('logout')`
- **Permission**: ✅ JWT required
- **Response**: ✅ Returns void (200 OK)
- **Notes**: None.

---

### GET /admins

- **Controller**: ✅ Found at `controllers/admins.controller.ts:55` — `@UseGuards(JwtAuthGuard, SuperAdminIpGuard) @Get()`
- **Permission**: ✅ JWT + SuperAdminIP
- **Query**: ✅ `PaginationDto`
- **Notes**: None.

---

### GET /admins/:id

- **Controller**: ✅ Found at `controllers/admins.controller.ts:66` — `@UseGuards(JwtAuthGuard, SuperAdminIpGuard) @Get(':id')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Notes**: None.

---

### POST /admins

- **Controller**: ✅ Found at `controllers/admins.controller.ts:78` — `@UseGuards(JwtAuthGuard, SuperAdminIpGuard) @Post()`
- **Permission**: ✅ JWT + SuperAdminIP
- **Request DTO**: ✅ `CreateAdminDto` matches:
  - `email: @IsEmail @IsNotEmpty` ✅
  - `password: @IsString @IsNotEmpty @MinLength(8)` ✅
  - `firstName: @IsString @IsNotEmpty @MaxLength(100)` ✅
  - `lastName: @IsString @IsNotEmpty @MaxLength(100)` ✅
  - `role: @IsEnum(AdminRole)` — values: `'super_admin' | 'admin' | 'support'` ✅
- **Notes**: None.

---

### PUT /admins/:id

- **Controller**: ✅ Found at `controllers/admins.controller.ts:89` — `@UseGuards(JwtAuthGuard, SuperAdminIpGuard) @Put(':id')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Request DTO**: ✅ `UpdateAdminDto` matches spec `{ email?, firstName?, lastName?, role?, isActive? }`:
  - All fields optional with correct validators ✅
  - `isActive?: @IsBoolean` ✅
- **Notes**: None.

---

### DELETE /admins/:id

- **Controller**: ✅ Found at `controllers/admins.controller.ts:106` — `@UseGuards(JwtAuthGuard, SuperAdminIpGuard) @Delete(':id')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Response**: ⚠️ Code uses `@HttpCode(HttpStatus.OK)` (200), not 204. Spec says "Soft delete" but doesn't specify status code. Minor difference.
- **Notes**: None.

---

### Admin Notifications

#### GET /admins/notifications

- **Controller**: ✅ Found at `controllers/admin-notifications.controller.ts:27` — `@Get()`
- **Permission**: ✅ JWT + SuperAdminIP (class-level guards)
- **Query**: ⚠️ Uses inline `@Query('page')`, `@Query('limit')`, `@Query('unreadOnly')` as strings — **not `PaginationDto`**. Manually parses integers. Also has extra `unreadOnly` filter not in spec.
- **Notes**: Spec doesn't mention `unreadOnly` query param.

#### GET /admins/notifications/unread-count

- **Controller**: ✅ Found at `controllers/admin-notifications.controller.ts:41` — `@Get('unread-count')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Response**: Returns `{ count: number }`
- **Notes**: None.

#### PATCH /admins/notifications/read-all

- **Controller**: ✅ Found at `controllers/admin-notifications.controller.ts:47` — `@Patch('read-all')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Response**: Returns `{ count: number }` (number of notifications marked as read)
- **Notes**: None.

#### PATCH /admins/notifications/:id/read

- **Controller**: ✅ Found at `controllers/admin-notifications.controller.ts:53` — `@Patch(':id/read')`
- **Permission**: ✅ JWT + SuperAdminIP
- **Response**: Returns `{ success: boolean }`
- **Notes**: None.

#### DELETE /admins/notifications/:id

- **Controller**: ✅ Found at `controllers/admin-notifications.controller.ts:59` — `@Delete(':id') @HttpCode(200)`
- **Permission**: ✅ JWT + SuperAdminIP
- **Response**: Returns `{ success: boolean }`
- **Notes**: None.

---

## 4. Roles & Permissions Module

Source: `erp-api/src/modules/roles/`

---

### GET /roles

- **Controller**: ✅ Found at `controllers/roles.controller.ts:61` — `@Get() @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Query**: ✅ `PaginationDto`
- **Notes**: None.

---

### GET /roles/dropdown

- **Controller**: ✅ Found at `controllers/roles.controller.ts:41` — `@Get('dropdown') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Query**: ✅ `DropdownQueryDto`
- **Notes**: Spec doesn't mention the query params for dropdown, but code uses `DropdownQueryDto`.

---

### GET /roles/permissions

- **Controller**: ✅ Found at `controllers/roles.controller.ts:51` — `@Get('permissions') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Query**: ✅ `PaginationDto`
- **Notes**: None.

---

### GET /roles/:id

- **Controller**: ✅ Found at `controllers/roles.controller.ts:69` — `@Get(':id') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Notes**: Service returns role with permissions (`findByIdWithPermissions`).

---

### POST /roles

- **Controller**: ✅ Found at `controllers/roles.controller.ts:79` — `@Post() @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Request DTO**: ⚠️ `CreateRoleDto` — minor difference:
  - `permissionIds?: @IsOptional @IsArray @IsUUID('4', { each: true })` — code validates UUIDs ✅
  - Spec says `permissionIds?: string[] // UUID[]` — matches ✅
  - All name/description fields match ✅
- **Notes**: None.

---

### PUT /roles/:id

- **Controller**: ✅ Found at `controllers/roles.controller.ts:92` — `@Put(':id') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Request DTO**: ✅ `UpdateRoleDto extends PartialType(CreateRoleDto)` — all fields optional. Matches spec "All fields optional".
- **Notes**: ⚠️ No `version` field for optimistic locking in `UpdateRoleDto`. This differs from the general convention described in the spec's common patterns section.

---

### DELETE /roles/:id

- **Controller**: ✅ Found at `controllers/roles.controller.ts:109` — `@Delete(':id') @Permissions('settings:manage_roles') @HttpCode(204)`
- **Permission**: ✅ `settings:manage_roles`
- **Response**: ✅ 204 No Content
- **Notes**: None.

---

### PUT /roles/:id/permissions

- **Controller**: ✅ Found at `controllers/roles.controller.ts:127` — `@Put(':id/permissions') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Request DTO**: ✅ `AssignPermissionDto` — `permissionIds: @IsNotEmpty @IsArray @IsUUID('4', { each: true })`. Matches spec `{ permissionIds: string[] }`.
- **Notes**: None.

---

### GET /roles/:id/permissions

- **Controller**: ✅ Found at `controllers/roles.controller.ts:142` — `@Get(':id/permissions') @Permissions('settings:manage_roles')`
- **Permission**: ✅ `settings:manage_roles`
- **Notes**: None.

---

## Summary of Discrepancies

### Critical (must fix before frontend development)

| #   | Issue                                                         | Location                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`POST /auth/select-branch` missing from spec**              | `auth.controller.ts:85` — This is a critical endpoint for the two-step login flow. Spec must document it: `POST /auth/select-branch`, JWT auth, body: `{ branchId: string (UUID) }`, response: `{ accessToken, refreshToken }`     |
| 2   | **Login response `branches` shape wrong in spec**             | Spec says `{ id, name, code, isDefault }` — actual is `{ id, nameEn, nameAr, code, address, isMain, isActive, isDefault }`. The `name` field does not exist; it's `nameEn`/`nameAr`. Also missing `address`, `isMain`, `isActive`. |
| 3   | **Arabic name fields silently dropped on user create/update** | `users.service.ts:63-64,99-103` — `firstNameAr` and `lastNameAr` are in the DTO but only `firstNameEn`/`lastNameEn` are persisted. This is a backend bug, not a spec issue.                                                        |

### Moderate (validation gaps)

| #   | Issue                                                        | Location                                                                                                                                          |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | **PIN endpoints have no formal DTO or validation**           | `auth.controller.ts:166,177` — inline `{ pin: string }` with no `@Matches`, `@MinLength`, `@MaxLength` validators. Any string is accepted as PIN. |
| 5   | **`PATCH /users/:id/roles` has no DTO validation**           | `users.controller.ts:240-242` — inline `body: { roleIds: string[] }` with no class-validator decorators. No array or UUID validation.             |
| 6   | **`CreateUserDto.roleIds` uses `@IsString` not `@IsUUID`**   | `create-user.dto.ts:60` — accepts any string, not just UUIDs.                                                                                     |
| 7   | **`UpdateRoleDto` missing `version` for optimistic locking** | `update-role.dto.ts` — extends `PartialType(CreateRoleDto)` with no `version` field.                                                              |

### Minor (spec improvements)

| #   | Issue                                                                | Location                                                            |
| --- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 8   | **Spec doesn't mention `password` is excluded from `UpdateUserDto`** | `update-user.dto.ts:6` uses `OmitType(CreateUserDto, ['password'])` |
| 9   | **`POST /users/me/erasure-request` accepts optional `reason` body**  | `users.controller.ts:72-74` — not documented in spec                |
| 10  | **Admin notifications `GET` has extra `unreadOnly` query param**     | `admin-notifications.controller.ts:36` — not in spec                |
| 11  | **`DELETE /admins/:id` returns 200 not 204**                         | `admins.controller.ts:109` — `@HttpCode(HttpStatus.OK)`             |
| 12  | **`auth/sessions` `isCurrent` is always `false`**                    | `auth.service.ts:328` — hardcoded, not functional                   |

### Missing from Spec (endpoints that exist in code but not in spec)

| Endpoint                   | Location                | Notes                                     |
| -------------------------- | ----------------------- | ----------------------------------------- |
| `POST /auth/select-branch` | `auth.controller.ts:85` | Two-step login: select branch after login |

### Missing from Code (endpoints in spec but not in code)

None found — all spec endpoints have corresponding controller methods.
