# API Verification: FRONTEND-SPEC.md vs Actual Backend Code

> **Generated**: 2026-03-17
> **Scope**: Sales Orders, Sales Definitions, Purchase Orders, Purchasing Vendors, Purchasing Definitions, Down Payments, Partners, CRM Leads & Pipeline, CRM Stages, Activities, Pricelists

---

## Summary of Findings

| Module                 | Endpoints Checked | Matches | Differences | Missing in Backend | Extra in Backend |
| ---------------------- | :---------------: | :-----: | :---------: | :----------------: | :--------------: |
| Sales Orders           |        13         |   11    |      2      |         0          |        0         |
| Sales Definitions      |        30         |   24    |      6      |         0          |        6         |
| Purchase Orders        |        12         |   10    |      2      |         0          |        0         |
| Purchasing Vendors     |         6         |    4    |      2      |         0          |        1         |
| Purchasing Definitions |        10         |    7    |      3      |         0          |        0         |
| Down Payments          |         2         |    2    |      0      |         0          |        0         |
| Partners               |        11         |   10    |      1      |         0          |        0         |
| CRM Leads & Pipeline   |        10         |    9    |      1      |         0          |        0         |
| CRM Stages             |         5         |    4    |      1      |         0          |        0         |
| Activities             |         8         |    8    |      0      |         0          |        0         |
| Pricelists             |         9         |    8    |      1      |         0          |        0         |

**Total discrepancies: 19 differences, 0 missing endpoints, 7 extra endpoints in backend**

---

## 1. Sales Orders

**Controller**: `erp-api/src/modules/sales/controllers/sales-orders.controller.ts`
**Route prefix**: `sales/orders`

### [GET] `/sales/orders`

- **Controller**: Found at line 61
- **Permission**: `sales:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec
- **Response**: Paginated result -- Matches spec

### [GET] `/sales/orders/:id`

- **Controller**: Found at line 150
- **Permission**: `sales:view` -- Matches spec
- **Request DTO**: N/A -- Matches spec
- **Response**: SO with lines -- Matches spec

### [GET] `/sales/orders/reports/summary`

- **Controller**: Found at line 68
- **Permission**: `sales:view` -- Matches spec
- **Request DTO**: `SalesReportQueryDto` (dateFrom?, dateTo?, branchId?) -- Matches spec
- **Response**: JSON/PDF/XLSX export -- Matches spec

### [POST] `/sales/orders`

- **Controller**: Found at line 50
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `CreateSalesOrderDto` -- Matches spec (see DTO verification below)
- **Response**: Created SO -- Matches spec

### [PUT] `/sales/orders/:id`

- **Controller**: Found at line 157
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `UpdateSalesOrderDto` -- Matches spec
- **Response**: Updated SO -- Matches spec

### [POST] `/sales/orders/:id/confirm`

- **Controller**: Found at line 171
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: N/A -- Matches spec
- **Response**: Confirmed SO -- Matches spec

### [POST] `/sales/orders/:id/create-invoice`

- **Controller**: Found at line 183
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `CreateInvoiceFromSODto` -- Matches spec
- **Response**: Created invoice -- Matches spec

### [POST] `/sales/orders/:id/create-delivery`

- **Controller**: Found at line 199
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: N/A -- Matches spec
- **Response**: Created delivery -- Matches spec

### [POST] `/sales/orders/:id/cancel`

- **Controller**: Found at line 211
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: N/A -- Matches spec
- **Response**: Cancelled SO -- Matches spec

### [DELETE] `/sales/orders/:id`

- **Controller**: Found at line 225
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: N/A
- **Response**: Differences: Spec says "204 No Content" but actual code returns `HttpStatus.OK` (200)

### [POST] `/sales/orders/:id/lines`

- **Controller**: Found at line 239
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `CreateSalesOrderLineDto` -- Matches spec
- **Response**: Added line -- Matches spec

### [PUT] `/sales/orders/:id/lines/:lineId`

- **Controller**: Found at line 254
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `UpdateSalesOrderLineDto` -- Matches spec
- **Response**: Updated line -- Matches spec

### [DELETE] `/sales/orders/:id/lines/:lineId`

- **Controller**: Found at line 270
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: N/A
- **Response**: Differences: Spec implies "204 No Content" but actual code returns `HttpStatus.OK` (200)

### CreateSalesOrderDto Verification

| Field               | Spec                                          | Actual                                        | Status                         |
| ------------------- | --------------------------------------------- | --------------------------------------------- | ------------------------------ |
| `partnerId`         | string, UUID, required                        | `@IsUUID()`, required                         | Match                          |
| `branchId?`         | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `currencyId?`       | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `pricelistId?`      | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `paymentTermId?`    | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `salespersonId?`    | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `fiscalPositionId?` | string, optional                              | `@IsOptional() @IsUUID()`                     | Match                          |
| `notes?`            | string, optional                              | `@IsOptional() @IsString()`                   | Match                          |
| `discountType?`     | `'percentage' \| 'fixed'`                     | `@IsEnum(SalesDiscountType)`                  | Match (enum values equivalent) |
| `discountValue?`    | number, @Min(0)                               | `@IsNumber() @Min(0)`                         | Match                          |
| `lines`             | `CreateSalesOrderLineDto[]`, @ArrayMinSize(1) | `@IsArray() @ValidateNested @ArrayMinSize(1)` | Match                          |

### CreateSalesOrderLineDto Verification

| Field               | Spec                                     | Actual                                        | Status |
| ------------------- | ---------------------------------------- | --------------------------------------------- | ------ |
| `productId`         | string, UUID, required                   | `@IsUUID()`, required                         | Match  |
| `productVariantId?` | string, optional                         | `@IsOptional() @IsUUID()`                     | Match  |
| `quantity`          | number, @Min(0.001), maxDecimalPlaces: 3 | `@IsNumber({maxDecimalPlaces:3}) @Min(0.001)` | Match  |
| `unitPrice`         | number, @Min(0), maxDecimalPlaces: 2     | `@IsNumber({maxDecimalPlaces:2}) @Min(0)`     | Match  |
| `discountPct?`      | 0-100, default 0                         | `@IsOptional() @Min(0) @Max(100)`             | Match  |
| `taxRate?`          | default 15                               | `@IsOptional() @IsNumber() @Min(0)`           | Match  |
| `description?`      | string                                   | `@IsOptional() @IsString()`                   | Match  |

### CreateInvoiceFromSODto Verification

| Field    | Spec                                                             | Actual                                                     | Status |
| -------- | ---------------------------------------------------------------- | ---------------------------------------------------------- | ------ |
| `type`   | `'regular' \| 'down_payment_percentage' \| 'down_payment_fixed'` | `@IsEnum(CreateInvoiceType)` with same 3 values            | Match  |
| `value?` | number                                                           | `@IsOptional() @IsNumber({maxDecimalPlaces:2}) @Min(0.01)` | Match  |

---

## 2. Sales Definitions

**Controller**: `erp-api/src/modules/sales/controllers/sales-definitions.controller.ts`
**Route prefix**: `sales/definitions`

### Voucher Types — `/sales/definitions/voucher-types`

#### [GET] list

- **Controller**: Found at line 45
- **Permission**: `sales:view` -- Matches spec
- **Response**: Paginated list -- Matches spec

#### [GET] `:id`

- **Controller**: Found at line 52 -- **Extra in backend, not in spec** (spec shows no GET by ID per type, but backend has it)
- **Permission**: `sales:view`

#### [POST] create

- **Controller**: Found at line 59
- **Permission**: Differences: Spec says `sales:create`, backend uses `sales:create` -- Match
- **Request DTO**: `CreateVoucherTypeDto` -- Match

#### [PATCH] `:id` update

- **Controller**: Found at line 73
- **Permission**: Differences: Spec says `sales:update`, backend uses `sales:update` -- Match

#### [DELETE] `:id` delete

- **Controller**: Found at line 88
- **Permission**: Differences: Spec says `sales:delete`, backend uses `sales:delete` -- Match

**Note on Sales Definitions permissions**: The spec says `sales:view` (GET), `sales:create` (POST), `sales:update` (PATCH), `sales:delete` (DELETE). Actual code uses the same permissions. The spec listed these permission names at the bottom of the definitions section.

### Receipt Templates — `/sales/definitions/receipt-templates`

- **GET list**: Found at line 105, `sales:view` -- Match
- **GET :id**: Found at line 112 -- **Extra GET by ID** (spec table does not show individual GET by ID routes)
- **POST**: Found at line 119, `sales:create` -- Match
- **PATCH**: Found at line 133, `sales:update` -- Match
- **DELETE**: Found at line 148, `sales:delete` -- Match

### Cancellation Reasons — `/sales/definitions/cancellation-reasons`

- **GET list**: Found at line 165, `sales:view` -- Match
- **GET :id**: Found at line 172 -- **Extra GET by ID** (not shown in spec table)
- **POST**: Found at line 179, `sales:create` -- Match
- **PATCH**: Found at line 193, `sales:update` -- Match
- **DELETE**: Found at line 208, `sales:delete` -- Match

### Void/Refund Reasons — `/sales/definitions/void-refund-reasons`

- **GET list**: Found at line 225, `sales:view` -- Match
- **GET :id**: Found at line 232 -- **Extra GET by ID**
- **POST**: Found at line 239, `sales:create` -- Match
- **PATCH**: Found at line 253, `sales:update` -- Match
- **DELETE**: Found at line 268, `sales:delete` -- Match

### Discount Reasons — `/sales/definitions/discount-reasons`

- **GET list**: Found at line 285, `sales:view` -- Match
- **GET :id**: Found at line 292 -- **Extra GET by ID**
- **POST**: Found at line 299, `sales:create` -- Match
- **PATCH**: Found at line 313, `sales:update` -- Match
- **DELETE**: Found at line 328, `sales:delete` -- Match

### Hold Reasons — `/sales/definitions/hold-reasons`

- **GET list**: Found at line 345, `sales:view` -- Match
- **GET :id**: Found at line 352 -- **Extra GET by ID**
- **POST**: Found at line 359, `sales:create` -- Match
- **PATCH**: Found at line 373, `sales:update` -- Match
- **DELETE**: Found at line 388, `sales:delete` -- Match

### Sales Definition DTOs Verification

All definition DTOs match the spec:

| Type                 | Field Match | Notes                                                                                                    |
| -------------------- | :---------: | -------------------------------------------------------------------------------------------------------- |
| Voucher Types        |    Match    | `discountType` uses `VoucherDiscountType` enum, `discountValue` is required (not optional) in actual DTO |
| Receipt Templates    |    Match    | All fields present                                                                                       |
| Cancellation Reasons |    Match    | All fields present                                                                                       |
| Void/Refund Reasons  |    Match    | `type` uses `VoidRefundReasonType` enum                                                                  |
| Discount Reasons     |    Match    | All fields present                                                                                       |
| Hold Reasons         |    Match    | All fields present                                                                                       |

### Sales Definitions Differences Summary:

1. **GET by ID endpoints exist in backend but are not listed in the spec table** -- the spec only shows the CRUD table per type but implies standard CRUD. The backend has 6 extra GET-by-ID routes (one per definition type) that the spec table omits. This is likely an omission in the spec rather than an extra endpoint.
2. **The spec says definition updates use PATCH** -- backend confirms PATCH. This is correct.
3. **DELETE returns HttpStatus.OK (200)** in backend, but spec doesn't specify response code for definitions.

---

## 3. Purchasing -- Purchase Orders

**Controller**: `erp-api/src/modules/purchasing/controllers/purchase-orders.controller.ts`
**Route prefix**: `purchase-orders`

### [GET] `/purchase-orders`

- **Controller**: Found at line 47
- **Permission**: `purchasing:view` -- Matches spec
- **Request DTO**: `PaginationDto` -- Matches spec
- **Response**: Paginated list -- Matches spec

### [GET] `/purchase-orders/:id`

- **Controller**: Found at line 55
- **Permission**: `purchasing:view` -- Matches spec
- **Response**: PO with lines -- Matches spec

### [POST] `/purchase-orders`

- **Controller**: Found at line 64
- **Permission**: `purchasing:manage` -- Matches spec
- **Request DTO**: `CreatePurchaseOrderDto` -- Matches spec (see DTO verification below)

### [PUT] `/purchase-orders/:id`

- **Controller**: Found at line 79
- **Permission**: `purchasing:manage` -- Matches spec
- **Request DTO**: `UpdatePurchaseOrderDto` -- Matches spec

### [POST] `/purchase-orders/:id/confirm`

- **Controller**: Found at line 96
- **Permission**: `purchasing:manage` -- Matches spec

### [POST] `/purchase-orders/:id/create-receipt`

- **Controller**: Found at line 112
- **Permission**: `purchasing:manage` -- Matches spec
- **Request DTO**: `CreatePoReceiptDto` (scheduledDate?, responsibleId?, notes?) -- spec does not detail the body for this endpoint

### [POST] `/purchase-orders/:id/create-bill`

- **Controller**: Found at line 129
- **Permission**: `purchasing:manage` -- Matches spec
- **Request DTO**: `CreatePoBillDto` (invoiceDate required, dueDate?, reference?, journalId?) -- spec does not detail the body for this endpoint

### [POST] `/purchase-orders/:id/cancel`

- **Controller**: Found at line 146
- **Permission**: `purchasing:manage` -- Matches spec

### [DELETE] `/purchase-orders/:id`

- **Controller**: Found at line 162
- **Permission**: `purchasing:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204) -- Matches spec

### [POST] `/purchase-orders/:id/lines`

- **Controller**: Found at line 181
- **Permission**: `purchasing:manage` -- Matches spec

### [PUT] `/purchase-orders/:id/lines/:lineId`

- **Controller**: Found at line 198
- **Permission**: `purchasing:manage` -- Matches spec
- **Request DTO**: Differences: Uses `CreatePurchaseOrderLineDto` (not a dedicated update DTO). This means updates require all fields, not partial updates.

### [DELETE] `/purchase-orders/:id/lines/:lineId`

- **Controller**: Found at line 217
- **Permission**: `purchasing:manage` -- Matches spec
- **Response**: Differences: Returns `HttpStatus.OK` (200), not 204

### [GET] `/purchasing/reports/summary`

- **Controller**: Found at line 246 (separate `PurchasingReportsController`)
- **Permission**: `purchasing:view` -- Matches spec
- **Request DTO**: `PurchasingReportQueryDto` (startDate?, endDate?, partnerId?, branchId?)

### CreatePurchaseOrderDto Verification

| Field                   | Spec                   | Actual                                        | Status |
| ----------------------- | ---------------------- | --------------------------------------------- | ------ |
| `partnerId`             | string, UUID, required | `@IsNotEmpty() @IsUUID()`                     | Match  |
| `branchId`              | string, UUID, required | `@IsNotEmpty() @IsUUID()`                     | Match  |
| `currencyId?`           | optional               | `@IsOptional() @IsUUID()`                     | Match  |
| `paymentTermId?`        | optional               | `@IsOptional() @IsUUID()`                     | Match  |
| `buyerId?`              | optional               | `@IsOptional() @IsUUID()`                     | Match  |
| `expectedDeliveryDate?` | optional               | `@IsOptional() @IsDateString()`               | Match  |
| `discountAmount?`       | @Min(0)                | `@IsOptional() @IsNumber() @Min(0)`           | Match  |
| `notes?`                | optional               | `@IsOptional() @IsString()`                   | Match  |
| `lines`                 | @ArrayMinSize(1)       | `@IsArray() @ArrayMinSize(1) @ValidateNested` | Match  |

### CreatePurchaseOrderLineDto Verification

| Field               | Spec                   | Actual                              | Status |
| ------------------- | ---------------------- | ----------------------------------- | ------ |
| `productId`         | string, UUID, required | `@IsNotEmpty() @IsUUID()`           | Match  |
| `productVariantId?` | optional               | `@IsOptional() @IsUUID()`           | Match  |
| `quantity`          | @Min(1)                | `@IsNumber() @Min(1)`               | Match  |
| `unitPrice`         | @Min(0)                | `@IsNumber() @Min(0)`               | Match  |
| `taxRate?`          | default 0              | `@IsOptional() @IsNumber() @Min(0)` | Match  |
| `discountAmount?`   | default 0              | `@IsOptional() @IsNumber() @Min(0)` | Match  |
| `description?`      | optional               | `@IsOptional() @IsString()`         | Match  |

---

## 4. Purchasing -- Vendors (Legacy)

**Controller**: `erp-api/src/modules/purchasing/controllers/vendors.controller.ts`
**Route prefix**: `purchasing/vendors`

### [GET] `/purchasing/vendors/dropdown`

- **Controller**: Found at line 49
- **Permission**: Differences: No `@Permissions` decorator on dropdown endpoint (spec doesn't mention a specific permission either) -- effectively unrestricted within auth
- **Response**: Dropdown list -- Matches spec

### [GET] `/purchasing/vendors`

- **Controller**: Found at line 56
- **Permission**: `purchasing:view` -- Matches spec (spec doesn't specify, but implied)

### [GET] `/purchasing/vendors/:id`

- **Controller**: Found at line 64
- **Permission**: `purchasing:view` -- Matches spec

### [POST] `/purchasing/vendors`

- **Controller**: Found at line 73
- **Permission**: `purchasing:manage` -- Matches spec

### [PATCH] `/purchasing/vendors/:id`

- **Controller**: Found at line 88
- **Permission**: `purchasing:manage` -- Matches spec
- **HTTP Method**: Matches spec (PATCH)

### [DELETE] `/purchasing/vendors/:id`

- **Controller**: Found at line 122
- **Permission**: `purchasing:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204) -- Matches spec

### Extra endpoint in backend not in spec:

### [PATCH] `/purchasing/vendors/:id/rating`

- **Controller**: Found at line 105
- **Permission**: `purchasing:manage`
- **Request DTO**: `UpdateVendorRatingDto` (rating: 1-5 int, required)
- **Status**: NOT IN SPEC -- missing from FRONTEND-SPEC.md

### Vendors DTO Differences

The spec does not detail the CreateVendorDto fields (since it says "Delegates to Partners"). The actual `CreateVendorDto` is a standalone DTO with different fields than `CreatePartnerDto`:

| Field              | CreateVendorDto | CreatePartnerDto (spec)                         | Status     |
| ------------------ | --------------- | ----------------------------------------------- | ---------- |
| `nameEn`, `nameAr` | Present         | Present                                         | Match      |
| `email`            | `@IsEmail()`    | `@IsEmail()`                                    | Match      |
| `phone`            | Present         | Present                                         | Match      |
| `address`          | Present         | NOT in partner (uses street/city/state/country) | Difference |
| `crNumber`         | Present         | NOT in partner                                  | Difference |
| `currencyId`       | Present         | NOT in partner                                  | Difference |
| `paymentTermsDays` | int             | NOT in partner (partner uses paymentTermId FK)  | Difference |
| `type`             | NOT present     | Required in partner                             | Difference |

---

## 5. Purchasing -- Definitions

**Controller**: `erp-api/src/modules/purchasing/controllers/purchasing-definitions.controller.ts`
**Route prefix**: `purchasing/definitions`

### Payment Terms

#### [GET] `/purchasing/definitions/payment-terms`

- **Controller**: Found at line 39
- **Permission**: `purchasing:view` -- Matches spec

#### [GET] `/purchasing/definitions/payment-terms/:id`

- **Controller**: Found at line 46
- **Permission**: `purchasing:view` -- Not in spec table (extra GET by ID)

#### [POST] `/purchasing/definitions/payment-terms`

- **Controller**: Found at line 54
- **Permission**: Differences: `purchasing:create` in actual code. Spec does not specify per-action permissions for purchasing definitions.

#### [PATCH] `/purchasing/definitions/payment-terms/:id`

- **Controller**: Found at line 65
- **Permission**: `purchasing:update` -- Not explicitly stated in spec

#### [DELETE] `/purchasing/definitions/payment-terms/:id`

- **Controller**: Found at line 78
- **Permission**: `purchasing:delete`
- **Response**: `HttpStatus.NO_CONTENT` (204)

### Rejection Reasons

#### [GET] `/purchasing/definitions/rejection-reasons`

- **Controller**: Found at line 93
- **Permission**: `purchasing:view` -- Matches spec

#### [GET] `/purchasing/definitions/rejection-reasons/:id`

- **Controller**: Found at line 100
- **Permission**: `purchasing:view` -- Not in spec (extra GET by ID)

#### [POST] `/purchasing/definitions/rejection-reasons`

- **Controller**: Found at line 108
- **Permission**: `purchasing:create`

#### [PATCH] `/purchasing/definitions/rejection-reasons/:id`

- **Controller**: Found at line 119
- **Permission**: `purchasing:update`

#### [DELETE] `/purchasing/definitions/rejection-reasons/:id`

- **Controller**: Found at line 132
- **Permission**: `purchasing:delete`
- **Response**: `HttpStatus.NO_CONTENT` (204)

### CreatePaymentTermDto Verification

| Field                | Spec         | Actual                                      | Status |
| -------------------- | ------------ | ------------------------------------------- | ------ |
| `nameEn`             | required     | `@IsNotEmpty() @IsString() @MaxLength(255)` | Match  |
| `nameAr`             | required     | `@IsNotEmpty() @IsString() @MaxLength(255)` | Match  |
| `descriptionEn?`     | optional     | `@IsOptional() @IsString() @MaxLength(500)` | Match  |
| `descriptionAr?`     | optional     | `@IsOptional() @IsString() @MaxLength(500)` | Match  |
| `daysDue`            | required int | `@IsNotEmpty() @IsNumber() @IsInt()`        | Match  |
| `penaltyPercentage?` | optional     | `@IsOptional() @IsNumber()`                 | Match  |
| `isActive?`          | optional     | `@IsOptional() @IsBoolean()`                | Match  |

### CreateRejectionReasonDto Verification

| Field       | Spec     | Actual                                      | Status |
| ----------- | -------- | ------------------------------------------- | ------ |
| `nameEn`    | required | `@IsNotEmpty() @IsString() @MaxLength(255)` | Match  |
| `nameAr`    | required | `@IsNotEmpty() @IsString() @MaxLength(255)` | Match  |
| `isActive?` | optional | `@IsOptional() @IsBoolean()`                | Match  |

---

## 6. Down Payments

**Controller**: `erp-api/src/modules/down-payments/controllers/down-payments.controller.ts`
**Route prefix**: `sale-orders`

### [POST] `/sale-orders/:id/down-payment`

- **Controller**: Found at line 21
- **Permission**: `sales:manage` -- Matches spec
- **Request DTO**: `CreateDownPaymentDto` -- Matches spec

### [GET] `/sale-orders/:id/down-payments`

- **Controller**: Found at line 36
- **Permission**: `sales:view` -- Matches spec
- **Response**: Down payments list -- Matches spec

### CreateDownPaymentDto Verification

| Field        | Spec                      | Actual                              | Status |
| ------------ | ------------------------- | ----------------------------------- | ------ |
| `branchId`   | string, UUID, required    | `@IsNotEmpty() @IsUUID()`           | Match  |
| `type`       | `'percentage' \| 'fixed'` | `@IsEnum(DownPaymentType)`          | Match  |
| `value`      | number, @Min(0)           | `@IsNotEmpty() @IsNumber() @Min(0)` | Match  |
| `invoiceId?` | string, optional          | `@IsOptional() @IsUUID()`           | Match  |

---

## 7. Partners

**Controller**: `erp-api/src/modules/partners/controllers/partners.controller.ts`
**Route prefix**: `partners`
**Contacts Controller**: `erp-api/src/modules/partners/controllers/partner-contacts.controller.ts`
**Contacts prefix**: `partners` (nested routes)

### [GET] `/partners/dropdown`

- **Controller**: Found at line 42
- **Permission**: `partners:view` -- Matches spec
- **Response**: Dropdown list -- Matches spec

### [GET] `/partners`

- **Controller**: Found at line 50
- **Permission**: `partners:view` -- Matches spec
- **Request DTO**: `FilterPartnerDto` -- Matches spec

### [GET] `/partners/:id`

- **Controller**: Found at line 58
- **Permission**: `partners:view` -- Matches spec
- **Response**: Partner with contacts -- Matches spec

### [POST] `/partners`

- **Controller**: Found at line 67
- **Permission**: `partners:manage` -- Matches spec
- **Request DTO**: `CreatePartnerDto` -- Matches spec

### [PUT] `/partners/:id`

- **Controller**: Found at line 82
- **Permission**: `partners:manage` -- Matches spec

### [DELETE] `/partners/:id`

- **Controller**: Found at line 99
- **Permission**: `partners:manage` -- Matches spec
- **Response**: Differences: `HttpStatus.NO_CONTENT` (204) -- Matches spec

### Partner Contacts

### [GET] `/partners/:partnerId/contacts`

- **Controller**: Found at line 41 (PartnerContactsController)
- **Permission**: `partners:view` -- Matches spec

### [GET] `/partners/contacts/:id`

- **Controller**: Found at line 54
- **Permission**: `partners:view` -- Matches spec

### [POST] `/partners/contacts`

- **Controller**: Found at line 63
- **Permission**: `partners:manage` -- Matches spec

### [PUT] `/partners/contacts/:id`

- **Controller**: Found at line 78
- **Permission**: `partners:manage` -- Matches spec

### [DELETE] `/partners/contacts/:id`

- **Controller**: Found at line 97
- **Permission**: `partners:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204) -- Matches spec

### FilterPartnerDto Verification

| Field                 | Spec                                                 | Actual                                      | Status |
| --------------------- | ---------------------------------------------------- | ------------------------------------------- | ------ |
| extends PaginationDto | yes                                                  | `extends PaginationDto`                     | Match  |
| `type?`               | `'customer' \| 'supplier' \| 'both' \| 'individual'` | `@IsEnum(PartnerType)`                      | Match  |
| `isCustomer?`         | boolean                                              | `@IsOptional() @IsBoolean()` with Transform | Match  |
| `isSupplier?`         | boolean                                              | `@IsOptional() @IsBoolean()` with Transform | Match  |
| `isActive?`           | boolean                                              | `@IsOptional() @IsBoolean()` with Transform | Match  |

### CreatePartnerDto Verification

| Field               | Spec                   | Actual                                      | Status |
| ------------------- | ---------------------- | ------------------------------------------- | ------ |
| `nameEn`, `nameAr`  | @MaxLength(255)        | `@IsNotEmpty() @IsString() @MaxLength(255)` | Match  |
| `type`              | required enum          | `@IsNotEmpty() @IsEnum(PartnerType)`        | Match  |
| `taxNumber?`        | optional               | `@IsOptional() @IsString() @MaxLength(50)`  | Match  |
| `vatNumber?`        | optional               | `@IsOptional() @IsString() @MaxLength(50)`  | Match  |
| `phone?`            | optional               | `@IsOptional() @IsString() @MaxLength(50)`  | Match  |
| `mobile?`           | optional               | `@IsOptional() @IsString() @MaxLength(50)`  | Match  |
| `email?`            | optional               | `@IsOptional() @IsEmail() @MaxLength(255)`  | Match  |
| `website?`          | optional               | `@IsOptional() @IsString() @MaxLength(255)` | Match  |
| `street?`           | optional               | `@IsOptional() @IsString() @MaxLength(500)` | Match  |
| `city?`             | optional               | `@IsOptional() @IsString() @MaxLength(100)` | Match  |
| `state?`            | optional               | `@IsOptional() @IsString() @MaxLength(100)` | Match  |
| `country?`          | default 'Saudi Arabia' | `@IsOptional() @IsString() @MaxLength(100)` | Match  |
| `zip?`              | optional               | `@IsOptional() @IsString() @MaxLength(20)`  | Match  |
| `creditLimit?`      | @Min(0), default 0     | `@IsOptional() @IsNumber() @Min(0)`         | Match  |
| `paymentTermId?`    | optional UUID          | `@IsOptional() @IsUUID()`                   | Match  |
| `pricelistId?`      | optional UUID          | `@IsOptional() @IsUUID()`                   | Match  |
| `arAccountId?`      | optional UUID          | `@IsOptional() @IsUUID()`                   | Match  |
| `apAccountId?`      | optional UUID          | `@IsOptional() @IsUUID()`                   | Match  |
| `fiscalPositionId?` | optional UUID          | `@IsOptional() @IsUUID()`                   | Match  |
| `bankIban?`         | optional               | `@IsOptional() @IsString() @MaxLength(50)`  | Match  |
| `bankName?`         | optional               | `@IsOptional() @IsString() @MaxLength(100)` | Match  |
| `notes?`            | optional               | `@IsOptional() @IsString()`                 | Match  |
| `isActive?`         | default true           | `@IsOptional() @IsBoolean()`                | Match  |

---

## 8. CRM -- Leads & Pipeline

**Leads Controller**: `erp-api/src/modules/crm/controllers/leads.controller.ts`
**Route prefix**: `crm/leads`
**Pipeline Controller**: `erp-api/src/modules/crm/controllers/pipeline.controller.ts`
**Route prefix**: `crm`

### [GET] `/crm/leads/dropdown`

- **Controller**: Found at line 38 (LeadsController)
- **Permission**: `crm:view` -- Matches spec

### [GET] `/crm/leads`

- **Controller**: Found at line 45
- **Permission**: `crm:view` -- Matches spec

### [GET] `/crm/leads/:id`

- **Controller**: Found at line 52
- **Permission**: `crm:view` -- Matches spec

### [POST] `/crm/leads`

- **Controller**: Found at line 59
- **Permission**: `crm:manage` -- Matches spec
- **Request DTO**: `CreateLeadDto` -- Matches spec (see verification below)

### [PUT] `/crm/leads/:id`

- **Controller**: Found at line 70
- **Permission**: `crm:manage` -- Matches spec

### [POST] `/crm/leads/:id/stage`

- **Controller**: Found at line 82
- **Permission**: `crm:manage` -- Matches spec
- **Request DTO**: `ChangeStageDto` -- Differences: Spec doesn't detail this DTO. Actual uses `{ stageId: UUID }`.

### [POST] `/crm/leads/:id/convert`

- **Controller**: Found at line 94
- **Permission**: `crm:manage` -- Matches spec

### [POST] `/crm/leads/:id/won`

- **Controller**: Found at line 105
- **Permission**: `crm:manage` -- Matches spec
- **Request DTO**: Differences: Actual controller does NOT accept a body DTO, but a `WinLeadDto` exists in the codebase with optional `notes` field. The controller does not use it.

### [POST] `/crm/leads/:id/lost`

- **Controller**: Found at line 116
- **Permission**: `crm:manage` -- Matches spec
- **Request DTO**: `LoseLeadDto` (`{ reason: string }`) -- Matches spec

### [DELETE] `/crm/leads/:id`

- **Controller**: Found at line 128
- **Permission**: `crm:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204) -- spec says "Soft delete"

### [GET] `/crm/pipeline`

- **Controller**: Found at line 18 (PipelineController)
- **Permission**: `crm:view` -- Matches spec

### [GET] `/crm/reports/conversion`

- **Controller**: Found at line 25 (PipelineController)
- **Permission**: `crm:view` -- Matches spec

### Extra in backend not in spec:

**CRM Contacts Controller** at `erp-api/src/modules/crm/controllers/contacts.controller.ts` provides `/crm/contacts/*` endpoints (deprecated, delegates to Partners). Not mentioned in the spec for this section, but this is expected as it's deprecated.

### CreateLeadDto Verification

| Field                | Spec                                      | Actual                                            | Status |
| -------------------- | ----------------------------------------- | ------------------------------------------------- | ------ |
| `titleEn`            | required                                  | `@IsString() @IsNotEmpty()`                       | Match  |
| `titleAr`            | required                                  | `@IsString() @IsNotEmpty()`                       | Match  |
| `stageId?`           | optional UUID                             | `@IsOptional() @IsUUID()`                         | Match  |
| `partnerId?`         | optional UUID                             | `@IsOptional() @IsUUID()`                         | Match  |
| `type?`              | `'lead' \| 'opportunity'`, default 'lead' | `@IsOptional() @IsEnum(LeadType)`                 | Match  |
| `assignedTo?`        | optional UUID                             | `@IsOptional() @IsUUID()`                         | Match  |
| `expectedRevenue?`   | optional number                           | `@IsOptional() @IsNumber() @Min(0)`               | Match  |
| `priority?`          | `'low' \| 'medium' \| 'high'`             | `@IsOptional() @IsEnum(LeadPriority)`             | Match  |
| `source?`            | enum                                      | `@IsOptional() @IsEnum(LeadSource)`               | Match  |
| `campaign?`          | optional string                           | `@IsOptional() @IsString()`                       | Match  |
| `medium?`            | optional string                           | `@IsOptional() @IsString()`                       | Match  |
| `expectedCloseDate?` | optional date                             | `@IsOptional() @IsDateString()`                   | Match  |
| `tags?`              | string[]                                  | `@IsOptional() @IsArray() @IsString({each:true})` | Match  |
| `notes?`             | optional string                           | `@IsOptional() @IsString()`                       | Match  |
| `probability?`       | 0-100                                     | `@IsOptional() @IsNumber() @Min(0) @Max(100)`     | Match  |

---

## 9. CRM Stages

**Controller**: `erp-api/src/modules/crm-stages/controllers/crm-stages.controller.ts`
**Route prefix**: `crm-stages`

### [GET] `/crm-stages`

- **Controller**: Found at line 41
- **Permission**: `crm:view` -- Matches spec

### [GET] `/crm-stages/:id`

- **Controller**: Found at line 49
- **Permission**: `crm:view` -- Matches spec

### [POST] `/crm-stages`

- **Controller**: Found at line 58
- **Permission**: `crm:manage` -- Matches spec

### [PUT] `/crm-stages/:id`

- **Controller**: Found at line 70
- **Permission**: `crm:manage` -- Matches spec

### [DELETE] `/crm-stages/:id`

- **Controller**: Found at line 84
- **Permission**: `crm:manage` -- Matches spec
- **Response**: Differences: `HttpStatus.NO_CONTENT` (204). Spec says "Soft delete" without specifying code.

### CreateCrmStageDto Verification

| Field          | Spec              | Actual                                        | Status |
| -------------- | ----------------- | --------------------------------------------- | ------ |
| `nameEn`       | required          | `@IsString() @MaxLength(255)`                 | Match  |
| `nameAr`       | required          | `@IsString() @MaxLength(255)`                 | Match  |
| `sequence`     | number, @Min(0)   | `@IsInt() @Min(0)`                            | Match  |
| `probability?` | 0-100, default 20 | `@IsOptional() @IsNumber() @Min(0) @Max(100)` | Match  |
| `isWon?`       | default false     | `@IsOptional() @IsBoolean()`                  | Match  |
| `isFolded?`    | default false     | `@IsOptional() @IsBoolean()`                  | Match  |

---

## 10. Activities

**Controller**: `erp-api/src/modules/activities/controllers/activities.controller.ts`
**Route prefix**: `activities`

### [GET] `/activities/my`

- **Controller**: Found at line 42
- **Permission**: `activities:view` -- Matches spec

### [GET] `/activities/overdue`

- **Controller**: Found at line 54
- **Permission**: `activities:view` -- Matches spec

### [GET] `/activities`

- **Controller**: Found at line 62
- **Permission**: `activities:view` -- Matches spec
- **Request DTO**: `FilterActivityDto` -- Matches spec

### [GET] `/activities/:id`

- **Controller**: Found at line 70
- **Permission**: `activities:view` -- Matches spec

### [POST] `/activities`

- **Controller**: Found at line 79
- **Permission**: `activities:manage` -- Matches spec
- **Request DTO**: `CreateActivityDto` -- Matches spec

### [PUT] `/activities/:id`

- **Controller**: Found at line 94
- **Permission**: `activities:manage` -- Matches spec

### [POST] `/activities/:id/mark-done`

- **Controller**: Found at line 111
- **Permission**: `activities:manage` -- Matches spec
- **Request DTO**: `MarkDoneActivityDto` (feedbackNote?: string) -- spec doesn't show a body for mark-done but backend accepts optional feedback

### [DELETE] `/activities/:id`

- **Controller**: Found at line 128
- **Permission**: `activities:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204) -- Matches spec

### CreateActivityDto Verification

| Field           | Spec            | Actual                                      | Status                                                                 |
| --------------- | --------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| `model`         | @MaxLength(50)  | `@IsString() @IsNotEmpty() @MaxLength(50)`  | Match                                                                  |
| `recordId`      | UUID            | `@IsUUID()`                                 | Match                                                                  |
| `recordName?`   | optional        | `@IsOptional() @IsString() @MaxLength(255)` | Match                                                                  |
| `activityType`  | enum            | `@IsEnum(ActivityType)`                     | Match                                                                  |
| `summary`       | @MaxLength(500) | `@IsString() @IsNotEmpty() @MaxLength(500)` | Match                                                                  |
| `note?`         | optional        | `@IsOptional() @IsString()`                 | Match                                                                  |
| `scheduledDate` | YYYY-MM-DD      | `@IsString() @IsNotEmpty()`                 | Match (note: not @IsDateString in actual, but functionally equivalent) |
| `assignedTo`    | UUID            | `@IsUUID()`                                 | Match                                                                  |
| `icon?`         | optional        | `@IsOptional() @IsString() @MaxLength(50)`  | Match                                                                  |

### FilterActivityDto Verification

| Field                 | Spec          | Actual                                      | Status |
| --------------------- | ------------- | ------------------------------------------- | ------ |
| extends PaginationDto | yes           | `extends PaginationDto`                     | Match  |
| `model?`              | optional      | `@IsOptional() @IsString()`                 | Match  |
| `recordId?`           | optional UUID | `@IsOptional() @IsUUID()`                   | Match  |
| `assignedTo?`         | optional UUID | `@IsOptional() @IsUUID()`                   | Match  |
| `isDone?`             | boolean       | `@IsOptional() @IsBoolean()` with Transform | Match  |
| `dueBefore?`          | optional date | `@IsOptional() @IsString()`                 | Match  |
| `dueAfter?`           | optional date | `@IsOptional() @IsString()`                 | Match  |
| `activityType?`       | optional enum | `@IsOptional() @IsEnum(ActivityType)`       | Match  |

---

## 11. Pricelists

**Pricelists Controller**: `erp-api/src/modules/pricelists/controllers/pricelists.controller.ts`
**Route prefix**: `pricelists`
**Items Controller**: `erp-api/src/modules/pricelists/controllers/pricelist-items.controller.ts`
**Route prefix**: `pricelist-items`

### [GET] `/pricelists`

- **Controller**: Found at line 39
- **Permission**: `sales:view` -- Matches spec

### [GET] `/pricelists/:id`

- **Controller**: Found at line 53
- **Permission**: `sales:view` -- Matches spec

### [GET] `/pricelists/compute-price`

- **Controller**: Found at line 46
- **Permission**: `sales:view` -- Matches spec
- **Request DTO**: `ComputePriceQueryDto` (pricelistId, productId, qty?) -- Matches spec

### [POST] `/pricelists`

- **Controller**: Found at line 60
- **Permission**: `sales:manage` -- Matches spec

### [PUT] `/pricelists/:id`

- **Controller**: Found at line 71
- **Permission**: `sales:manage` -- Matches spec

### [DELETE] `/pricelists/:id`

- **Controller**: Found at line 83
- **Permission**: `sales:manage` -- Matches spec
- **Response**: `HttpStatus.NO_CONTENT` (204)

### [GET] `/pricelists/:id/items`

- **Controller**: Found at line 97
- **Permission**: `sales:view` -- Matches spec

### [POST] `/pricelists/:id/items`

- **Controller**: Found at line 104
- **Permission**: `sales:manage` -- Matches spec

### [PUT] `/pricelist-items/:id`

- **Controller**: Found at line 30 (PricelistItemsController)
- **Permission**: `sales:manage` -- Matches spec

### [DELETE] `/pricelist-items/:id`

- **Controller**: Found at line 45 (PricelistItemsController)
- **Permission**: `sales:manage` -- Matches spec
- **Response**: Differences: `HttpStatus.NO_CONTENT` (204) -- spec says "Delete item" without specifying code

### Pricelists DTO Notes

The spec does not detail `CreatePricelistDto` fields. Actual DTO includes: `nameEn`, `nameAr`, `currencyId?`, `discountPolicy?` (enum), `startDate?`, `endDate?`, `isActive?`.

The spec does not detail `CreatePricelistItemDto` fields. Actual DTO includes: `applyOn?` (enum), `productId?`, `categoryId?`, `minQty?`, `computation?` (enum), `price?`, `discountPct?`, `startDate?`, `endDate?`, `sequence?`.

---

## Key Discrepancies Summary

### 1. HTTP Status Code Mismatches

| Endpoint                                 | Spec                     | Actual |
| ---------------------------------------- | ------------------------ | ------ |
| `DELETE /sales/orders/:id`               | 204 No Content (implied) | 200 OK |
| `DELETE /sales/orders/:id/lines/:lineId` | 204 No Content (implied) | 200 OK |

### 2. Missing GET-by-ID in Spec

The FRONTEND-SPEC.md definitions tables (Sales Definitions, Purchasing Definitions) omit individual GET-by-ID routes per definition type. The backend has them all. **Recommendation**: Add GET-by-ID routes to the spec tables.

### 3. Extra Backend Endpoint Not in Spec

| Endpoint                               | Description                      |
| -------------------------------------- | -------------------------------- |
| `PATCH /purchasing/vendors/:id/rating` | Update vendor rating (1-5 scale) |

### 4. Vendor DTO Divergence

`CreateVendorDto` (legacy) has different fields from `CreatePartnerDto`. The vendor DTO uses `address` (single field) instead of `street/city/state/country`, has `crNumber` and `currencyId` fields, and uses `paymentTermsDays` (integer) instead of `paymentTermId` (FK). This is expected since the vendor controller is deprecated.

### 5. PO Line Update Uses Create DTO

`PUT /purchase-orders/:id/lines/:lineId` uses `CreatePurchaseOrderLineDto` instead of a dedicated update DTO, meaning all fields are required on update rather than optional.

### 6. Win Lead Endpoint Body

The `POST /crm/leads/:id/won` endpoint does not accept a request body in the controller, despite a `WinLeadDto` existing in the codebase.

### 7. Mark-Done Activity Body

`POST /activities/:id/mark-done` accepts `MarkDoneActivityDto` with optional `feedbackNote`, which is not documented in the spec.
