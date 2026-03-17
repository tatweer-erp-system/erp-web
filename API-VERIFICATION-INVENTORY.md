# API Verification Report — Inventory, Products & Related Modules

> **Generated**: 2026-03-17
> **Verified against**: `erp-api/src/modules/` actual source code on branch `dev` (commit `1c5e7c1`)

---

## Summary

| Area                        | Endpoints in Spec | Verified | Mismatches | Missing in Backend |
| --------------------------- | :---------------: | :------: | :--------: | :----------------: |
| Products                    |        12         |    12    |     2      |         0          |
| Categories                  |         6         |    6     |     0      |         0          |
| Warehouses                  |         6         |    6     |     0      |         0          |
| Adjustments                 |         3         |    3     |     0      |         0          |
| Transfers                   |         3         |    3     |     0      |         0          |
| Stock Movements & Levels    |         7         |    7     |     1      |         0          |
| Definitions (UoM)           |         5         |    5     |     2      |         0          |
| Definitions (Adj Reasons)   |         5         |    5     |     2      |         0          |
| Stock Locations             |         5         |    5     |     0      |         0          |
| Branch Products             |         3         |    3     |     0      |         0          |
| Product Attributes          |         8         |    8     |     0      |         0          |
| Product Variants (Template) |         5         |    5     |     0      |         0          |
| Combo Products              |         9         |    9     |     0      |         0          |
| Supplier Products           |         4         |    4     |     0      |         0          |
| Deliveries                  |         6         |    6     |     0      |         0          |
| Receipts                    |         6         |    6     |     0      |         0          |
| **Total**                   |      **93**       |  **93**  |   **7**    |       **0**        |

**Legend**: Mismatches include permission differences, HTTP method differences, and DTO field deviations.

---

## Inventory -- Products

### [GET] `/products/dropdown`

- **Controller**: Found at `inventory/controllers/products.controller.ts:45`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `DropdownQueryDto` -- matches
- **Response**: Dropdown list -- matches

### [GET] `/products`

- **Controller**: Found at `inventory/controllers/products.controller.ts:85`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `ProductFilterDto` extends `PaginationDto` + `productType?`, `categoryId?`, `brandId?`, `branchId?`, `canBeSold?`, `canBePurchased?`, `hasVariants?` -- matches spec exactly
- **Response**: Paginated products -- matches

### [GET] `/products/:id`

- **Controller**: Found at `inventory/controllers/products.controller.ts:119`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Product with variants, combos, taxes -- matches

### [GET] `/products/:id/availability`

- **Controller**: Found at `inventory/controllers/products.controller.ts:92`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request**: Query params `warehouseId?`, `quantity?` -- spec does not mention `quantity` query param
- **Response**: Availability data -- matches spec shape

### [GET] `/products/:id/suppliers`

- **Controller**: Found at `inventory/controllers/products.controller.ts:112`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Supplier products for product -- matches

### [POST] `/products`

- **Controller**: Found at `inventory/controllers/products.controller.ts:126`
- **Permission**: Spec says `inventory:create` | Actual: `inventory:create`
- **Request DTO**: `CreateProductDto` -- all fields match spec exactly. Spec fields: `nameEn`, `nameAr`, `sku`, `descriptionEn?`, `descriptionAr?`, `categoryId`, `unitPrice`, `costPrice?`, `taxRate?`, `barcode?`, `unit?`, `minStockLevel?`, `maxStockLevel?`, `productType?`, `invoicePolicy?`, `isActive?`, `canBeSold?`, `canBePurchased?`, `hasVariants?`, `hasSerialTracking?`, `hasLotTracking?`, `hasExpiryDate?`, `brandId?`, `purchaseUomId?`, `incomeAccountId?`, `cogsAccountId?`, `inventoryAccountId?`, `stockInputAccountId?`, `stockOutputAccountId?`, `taxes?`
- **Response**: Created product -- matches

### [PUT] `/products/:id`

- **Controller**: Found at `inventory/controllers/products.controller.ts:137`
- **Permission**: Spec says `inventory:update` | Actual: `inventory:update`
- **Request DTO**: `UpdateProductDto` = `PartialType(OmitType(CreateProductDto, ['sku']))` + `version: number` -- matches (sku not updatable)
- **Response**: Updated product -- matches

### [DELETE] `/products/:id`

- **Controller**: Found at `inventory/controllers/products.controller.ts:149`
- **Permission**: Spec says `inventory:delete` | Actual: `inventory:delete`
- **Response**: 204 No Content -- matches

### [PATCH] `/products/:id/restore`

- **Controller**: Found at `inventory/controllers/products.controller.ts:161`
- **Permission**: Spec says `inventory:update` | Actual: `inventory:update`
- **Response**: Restored product -- matches

### [POST] `/products/bulk-create`

- **Controller**: Found at `inventory/controllers/products.controller.ts:52`
- **Permission**: Spec says `inventory:create` | Actual: `inventory:create`
- **Request DTO**: `BulkCreateProductsDto` -- `items: CreateProductDto[]` with `@ArrayMaxSize(100)` `@ArrayMinSize(1)` -- matches
- **Response**: Created products -- matches

### [PATCH] `/products/bulk-update`

- **Controller**: Found at `inventory/controllers/products.controller.ts:63`
- **Permission**: Spec says `inventory:update` | Actual: `inventory:update`
- **Request DTO**: Spec says `PATCH` -- Actual: `PATCH` -- matches
- **Response**: Updated products -- matches

### [DELETE] `/products/bulk-delete`

- **Controller**: Found at `inventory/controllers/products.controller.ts:74`
- **Permission**: Spec says `inventory:delete` | Actual: `inventory:delete`
- **Request DTO**: `BulkDeleteProductsDto` -- `ids: string[]` with `@ArrayMaxSize(100)` -- matches
- **Response**: Deleted confirmation -- matches

**Products Mismatches:**

1. `GET /products/:id/availability` -- backend accepts extra `quantity` query param not documented in spec
2. `PATCH /products/bulk-update` -- `BulkUpdateProductItemDto` has fewer optional fields than `UpdateProductDto` (no `productType`, `invoicePolicy`, `canBeSold`, `canBePurchased`, `hasVariants`, `hasSerialTracking`, `hasLotTracking`, `hasExpiryDate`, `brandId`, `purchaseUomId`, account IDs, `taxes`). Spec does not detail bulk-update item shape so this is informational.

---

## Inventory -- Categories

### [GET] `/categories/dropdown`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:36`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `DropdownQueryDto` -- matches
- **Response**: Dropdown list -- matches

### [GET] `/categories`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:43`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated categories -- matches

### [GET] `/categories/:id`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:50`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Single category -- matches

### [POST] `/categories`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:57`
- **Permission**: Spec says `inventory:create` | Actual: `inventory:create`
- **Request DTO**: `CreateCategoryDto` -- `nameEn`, `nameAr` (required), `descriptionEn?`, `descriptionAr?`, `parentId?`, `incomeAccountId?`, `cogsAccountId?`, `inventoryAccountId?` -- matches spec exactly
- **Response**: Created category -- matches

### [PUT] `/categories/:id`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:67`
- **Permission**: Spec says `inventory:update` | Actual: `inventory:update`
- **Request DTO**: `UpdateCategoryDto` = `PartialType(CreateCategoryDto)` + `version: number` -- matches
- **Response**: Updated category -- matches

### [DELETE] `/categories/:id`

- **Controller**: Found at `inventory/controllers/categories.controller.ts:80`
- **Permission**: Spec says `inventory:delete` | Actual: `inventory:delete`
- **Response**: 204 No Content -- matches

---

## Inventory -- Warehouses

### [GET] `/warehouses/dropdown`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:36`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `DropdownQueryDto` -- matches
- **Response**: Dropdown list -- matches

### [GET] `/warehouses`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:43`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated warehouses -- matches

### [GET] `/warehouses/:id`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:50`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Warehouse with stock locations -- matches

### [POST] `/warehouses`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:57`
- **Permission**: Spec says `inventory:create` | Actual: `inventory:create`
- **Request DTO**: `CreateWarehouseDto` -- `nameEn`, `nameAr` (required), `address?`, `city?`, `isDefault?`, `branchId?` -- matches spec exactly
- **Response**: Created warehouse -- matches

### [PUT] `/warehouses/:id`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:67`
- **Permission**: Spec says `inventory:update` | Actual: `inventory:update`
- **Request DTO**: `UpdateWarehouseDto` = `PartialType(CreateWarehouseDto)` -- NOTE: no `version` field (no optimistic locking on warehouse updates)
- **Response**: Updated warehouse -- matches

### [DELETE] `/warehouses/:id`

- **Controller**: Found at `inventory/controllers/warehouses.controller.ts:80`
- **Permission**: Spec says `inventory:delete` | Actual: `inventory:delete`
- **Response**: 204 No Content -- matches

---

## Inventory -- Adjustments

### [POST] `/inventory/adjustments`

- **Controller**: Found at `inventory/controllers/adjustments.controller.ts:22`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `CreateAdjustmentDto` -- `productId`, `warehouseId`, `quantity`, `reason` (all required); `unitCost?`, `lotNumber?`, `serialNumber?`, `expiryDate?`, `locationId?`, `productVariantId?` -- matches spec exactly
- **Response**: Adjustment result -- matches

### [GET] `/inventory/adjustments`

- **Controller**: Found at `inventory/controllers/adjustments.controller.ts:33`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated adjustments -- matches

### [GET] `/inventory/adjustments/:id`

- **Controller**: Found at `inventory/controllers/adjustments.controller.ts:40`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Single adjustment -- matches

---

## Inventory -- Transfers

### [POST] `/inventory/transfers`

- **Controller**: Found at `inventory/controllers/transfers.controller.ts:22`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `CreateTransferDto` -- `productId`, `sourceWarehouseId`, `destinationWarehouseId`, `quantity` (@Min(1)) (all required); `notes?`, `fromLocationId?`, `toLocationId?`, `productVariantId?`, `lotNumber?`, `serialNumber?`, `expiryDate?` -- matches spec exactly
- **Response**: Transfer result -- matches

### [GET] `/inventory/transfers`

- **Controller**: Found at `inventory/controllers/transfers.controller.ts:33`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated transfers -- matches

### [GET] `/inventory/transfers/:id`

- **Controller**: Found at `inventory/controllers/transfers.controller.ts:40`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Single transfer -- matches

---

## Inventory -- Stock Movements & Levels

### [GET] `/inventory/stock-levels`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:30`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated stock levels -- matches

### [GET] `/inventory/stock-levels/:productId`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:37`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Stock levels for product -- matches

### [GET] `/inventory/low-stock`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:48`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Low stock alerts -- matches

### [GET] `/inventory/movements`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:55`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated movements -- matches

### [GET] `/inventory/movements/:id`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:62`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Single movement -- matches

### [GET] `/inventory/valuation`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:69`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request**: Query param `format?` (enum: `ExportFormat` -- `pdf`, `xlsx`) -- matches spec (JSON/PDF/XLSX)
- **Response**: Valuation data or file stream -- matches

### [POST] `/inventory/movements`

- **Controller**: Found at `inventory/controllers/stock-movements.controller.ts:135`
- **Permission**: Spec says `inventory:create` | Actual: `inventory:create`
- **Request DTO**: Actual uses `CreateStockMovementDto` (not `CreateMovementDto`)
- **Response**: Created movement -- matches

**Stock Movements Mismatch:**

1. The `POST /inventory/movements` uses `CreateStockMovementDto` which has field `type` (StockMovementType enum). There is also a legacy `CreateMovementDto` with field `movementType`. The controller imports `CreateStockMovementDto`. Spec does not detail the DTO fields, so this is informational only.

---

## Inventory -- Definitions (Units of Measure)

### [GET] `/inventory/definitions/units-of-measure`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:37`
- **Permission**: Spec says (implied CRUD) | Actual: `inventory:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated UoMs -- matches

### [GET] `/inventory/definitions/units-of-measure/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:44`
- **Permission**: Actual: `inventory:view` -- matches
- **Response**: Single UoM -- matches

### [POST] `/inventory/definitions/units-of-measure`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:51`
- **Permission**: Actual: `inventory:create` -- matches
- **Request DTO**: `CreateUnitOfMeasureDto` -- `nameEn`, `nameAr`, `symbol` (@MaxLength(20)) required; `uomType?` (enum: `unit`/`weight`/`volume`/`length`/`time`), `isActive?` -- matches spec exactly
- **Response**: Created UoM -- matches

### [PATCH] `/inventory/definitions/units-of-measure/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:65`
- **Permission**: Actual: `inventory:update`
- **Request DTO**: `UpdateUnitOfMeasureDto` = `PartialType(CreateUnitOfMeasureDto)` + `version: number`
- **Response**: Updated UoM -- matches

### [DELETE] `/inventory/definitions/units-of-measure/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:80`
- **Permission**: Actual: `inventory:delete`
- **Response**: 204 No Content -- matches

**UoM Mismatches:**

1. Spec does not mention the `GET /:id` endpoint, but it exists in backend
2. Spec implies generic CRUD; actual uses `PATCH` for update (not `PUT`). Spec does not specify HTTP method for definition updates.

---

## Inventory -- Definitions (Adjustment Reasons)

### [GET] `/inventory/definitions/adjustment-reasons`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:97`
- **Permission**: Actual: `inventory:view` -- matches
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated reasons -- matches

### [GET] `/inventory/definitions/adjustment-reasons/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:104`
- **Permission**: Actual: `inventory:view`
- **Response**: Single reason -- matches

### [POST] `/inventory/definitions/adjustment-reasons`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:111`
- **Permission**: Actual: `inventory:create`
- **Request DTO**: `CreateAdjustmentReasonDto` -- `nameEn`, `nameAr`, `type` (enum: `increase`/`decrease`) required; `isActive?` -- matches spec exactly
- **Response**: Created reason -- matches

### [PATCH] `/inventory/definitions/adjustment-reasons/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:125`
- **Permission**: Actual: `inventory:update`
- **Request DTO**: `UpdateAdjustmentReasonDto` = `PartialType(CreateAdjustmentReasonDto)` + `version: number`
- **Response**: Updated reason -- matches

### [DELETE] `/inventory/definitions/adjustment-reasons/:id`

- **Controller**: Found at `inventory/controllers/inventory-definitions.controller.ts:140`
- **Permission**: Actual: `inventory:delete`
- **Response**: 204 No Content -- matches

**Adjustment Reasons Mismatches:**

1. Spec does not mention the `GET /:id` endpoint, but it exists in backend
2. Spec implies generic CRUD; actual uses `PATCH` for update (not `PUT`). Spec does not specify HTTP method for definition updates.

---

## Stock Locations

### [GET] `/stock-locations`

- **Controller**: Found at `stock-locations/controllers/stock-locations.controller.ts:23`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `StockLocationQueryDto` extends `PaginationDto` + `warehouseId?`, `locationType?` (enum), `isActive?` -- matches spec exactly
- **Response**: Paginated stock locations -- matches

### [POST] `/stock-locations`

- **Controller**: Found at `stock-locations/controllers/stock-locations.controller.ts:30`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `CreateStockLocationDto` -- `nameEn`, `nameAr` (required); `fullName?`, `warehouseId?`, `parentId?`, `locationType?` (enum: `internal`/`customer`/`supplier`/`transit`/`virtual`/`scrap`, default `internal`), `isScrap?`, `isReturn?`, `isActive?` -- matches spec exactly
- **Response**: Created stock location -- matches

### [GET] `/stock-locations/:id`

- **Controller**: Found at `stock-locations/controllers/stock-locations.controller.ts:41`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Single stock location -- matches

### [PUT] `/stock-locations/:id`

- **Controller**: Found at `stock-locations/controllers/stock-locations.controller.ts:48`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `UpdateStockLocationDto` -- all fields optional + `version: number` (required) -- matches
- **Response**: Updated stock location -- matches

### [DELETE] `/stock-locations/:id`

- **Controller**: Found at `stock-locations/controllers/stock-locations.controller.ts:60`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Response**: Soft delete -- matches

---

## Branch Products

### [GET] `/branch-products/:branchId`

- **Controller**: Found at `branch-products/controllers/branch-products.controller.ts:22`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: List of assigned products -- matches

### [POST] `/branch-products/:branchId/assign`

- **Controller**: Found at `branch-products/controllers/branch-products.controller.ts:29`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `AssignProductsDto` -- `productIds: string[]` with `@ArrayMinSize(1)` `@IsUUID('4', { each: true })` -- matches spec exactly
- **Response**: Assignment result -- matches

### [POST] `/branch-products/:branchId/unassign`

- **Controller**: Found at `branch-products/controllers/branch-products.controller.ts:44`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `UnassignProductsDto` -- `productIds: string[]` with `@ArrayMinSize(1)` `@IsUUID('4', { each: true })` -- matches spec exactly
- **Response**: Unassignment result -- matches

---

## Product Variants & Attributes

### Product Attributes

### [GET] `/product-attributes/dropdown`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:38`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Request DTO**: `DropdownQueryDto` -- matches
- **Response**: Dropdown list -- matches

### [GET] `/product-attributes`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:45`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated attributes -- matches

### [GET] `/product-attributes/:id`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:52`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: Attribute with values -- matches

### [POST] `/product-attributes`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:59`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `CreateProductAttributeDto` -- `nameEn`, `nameAr` (required); `displayType?` (enum: `radio`/`select`/`color`/`pills`, default `select`), `sequence?` -- matches spec exactly
- **Response**: Created attribute -- matches

### [PUT] `/product-attributes/:id`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:72`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `UpdateProductAttributeDto` -- matches
- **Response**: Updated attribute -- matches

### [DELETE] `/product-attributes/:id`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:87`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: 204 No Content -- matches

### [GET] `/product-attributes/:id/values`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:105`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: List of attribute values -- matches

### [POST] `/product-attributes/:id/values`

- **Controller**: Found at `product-variants/controllers/product-attributes.controller.ts:116`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `CreateAttributeValueDto` -- `nameEn`, `nameAr` (required); `htmlColor?`, `sequence?` -- matches spec exactly
- **Response**: Created value -- matches

### Attribute Values (standalone controller)

### [PUT] `/product-attribute-values/:id`

- **Controller**: Found at `product-variants/controllers/product-attribute-values.controller.ts:30`
- **Permission**: Spec says (implied `products:manage`) | Actual: `products:manage`
- **Request DTO**: `UpdateAttributeValueDto` -- matches
- **Response**: Updated value -- matches

### [DELETE] `/product-attribute-values/:id`

- **Controller**: Found at `product-variants/controllers/product-attribute-values.controller.ts:45`
- **Permission**: Spec says (implied `products:manage`) | Actual: `products:manage`
- **Response**: 204 No Content -- matches

### Product Variants (Template)

### [GET] `/products/:id/template-attributes`

- **Controller**: Found at `product-variants/controllers/product-variants.controller.ts:37`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: Template attributes for product -- matches

### [POST] `/products/:id/template-attributes`

- **Controller**: Found at `product-variants/controllers/product-variants.controller.ts:44`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `AddTemplateAttributeDto` -- `attributeId` (required UUID), `sequence?`, `values: TemplateAttributeValueDto[]` (required array with `attributeValueId`, `priceExtra?`, `isActive?`) -- spec does not detail the nested `values` array structure. Backend requires `values` as a nested validated array.
- **Response**: Created template attribute -- matches

### [DELETE] `/products/template-attributes/:id`

- **Controller**: Found at `product-variants/controllers/product-variants.controller.ts:59`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: 204 No Content -- matches

### [GET] `/products/:id/variants`

- **Controller**: Found at `product-variants/controllers/product-variants.controller.ts:76`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: Paginated variants for product -- matches

### [POST] `/products/:id/generate-variants`

- **Controller**: Found at `product-variants/controllers/product-variants.controller.ts:87`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: Generated variants -- matches

### [GET] `/product-variants/:id`

- **Controller**: Found at `product-variants/controllers/product-variants-detail.controller.ts:21`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: Single variant -- matches

### [PUT] `/product-variants/:id`

- **Controller**: Found at `product-variants/controllers/product-variants-detail.controller.ts:28`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `UpdateProductVariantDto` -- `barcode?`, `internalRef?`, `priceExtra?`, `costPrice?`, `isActive?`, `version` (required) -- spec does not detail these fields. All match expected variant update fields.
- **Response**: Updated variant -- matches

---

## Combo Products

### [GET] `/combo-products`

- **Controller**: Found at `product-variants/controllers/combo-products.controller.ts:38`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Request DTO**: `PaginationDto` -- matches
- **Response**: Paginated combo products -- matches

### [GET] `/combo-products/:id`

- **Controller**: Found at `product-variants/controllers/combo-products.controller.ts:45`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: Combo product with groups and items -- matches

### [POST] `/combo-products`

- **Controller**: Found at `product-variants/controllers/combo-products.controller.ts:52`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `CreateComboProductDto` -- `productId: string` (UUID, required) -- matches
- **Response**: Created combo product -- matches

### [DELETE] `/combo-products/:id`

- **Controller**: Found at `product-variants/controllers/combo-products.controller.ts:63`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: 204 No Content -- matches

### [POST] `/combo-groups`

- **Controller**: Found at `product-variants/controllers/combo-groups.controller.ts:33`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `CreateComboGroupDto` -- `comboId` (UUID, required), `nameEn`, `nameAr` (required), `sequence?`, `isRequired?` -- matches
- **Response**: Created group -- matches

### [PUT] `/combo-groups/:id`

- **Controller**: Found at `product-variants/controllers/combo-groups.controller.ts:44`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `UpdateComboGroupDto` -- matches
- **Response**: Updated group -- matches

### [DELETE] `/combo-groups/:id`

- **Controller**: Found at `product-variants/controllers/combo-groups.controller.ts:58`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: 204 No Content -- matches

### [GET] `/combo-groups/:id/items`

- **Controller**: Found at `product-variants/controllers/combo-groups.controller.ts:71`
- **Permission**: Spec says `products:view` | Actual: `products:view`
- **Response**: List of items in group -- matches

### [POST] `/combo-group-items`

- **Controller**: Found at `product-variants/controllers/combo-group-items.controller.ts:33`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `CreateComboGroupItemDto` -- `groupId`, `productId` (UUIDs, required), `extraPrice?`, `sequence?` -- matches
- **Response**: Created item -- matches

### [PUT] `/combo-group-items/:id`

- **Controller**: Found at `product-variants/controllers/combo-group-items.controller.ts:44`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Request DTO**: `UpdateComboGroupItemDto` -- matches
- **Response**: Updated item -- matches

### [DELETE] `/combo-group-items/:id`

- **Controller**: Found at `product-variants/controllers/combo-group-items.controller.ts:57`
- **Permission**: Spec says `products:manage` | Actual: `products:manage`
- **Response**: 204 No Content -- matches

---

## Supplier Products

### [GET] `/supplier-products`

- **Controller**: Found at `supplier-products/controllers/supplier-products.controller.ts:35`
- **Permission**: Spec says `purchasing:view` | Actual: `purchasing:view`
- **Request DTO**: `SupplierProductFilterDto` extends `PaginationDto` + `productId?`, `partnerId?` -- matches spec
- **Response**: Paginated supplier products -- matches

### [POST] `/supplier-products`

- **Controller**: Found at `supplier-products/controllers/supplier-products.controller.ts:42`
- **Permission**: Spec says `purchasing:manage` | Actual: `purchasing:manage`
- **Request DTO**: `CreateSupplierProductDto` -- `productId`, `partnerId` (required); `minQty?` (default 1), `price` (required, @Min(0)), `currencyId?`, `leadTimeDays?` (default 0), `sequence?` (default 1) -- matches spec exactly
- **Response**: Created supplier product -- matches

### [PUT] `/supplier-products/:id`

- **Controller**: Found at `supplier-products/controllers/supplier-products.controller.ts:53`
- **Permission**: Spec says `purchasing:manage` | Actual: `purchasing:manage`
- **Request DTO**: `UpdateSupplierProductDto` = `PartialType(CreateSupplierProductDto)` + `version: number` -- matches
- **Response**: Updated supplier product -- matches

### [DELETE] `/supplier-products/:id`

- **Controller**: Found at `supplier-products/controllers/supplier-products.controller.ts:67`
- **Permission**: Spec says `purchasing:manage` | Actual: `purchasing:manage`
- **Response**: 204 No Content -- matches

---

## Deliveries

### [GET] `/deliveries`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:23`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `DeliveryQueryDto` extends `PaginationDto` + `status?` (DeliveryStatus enum), `saleOrderId?`, `partnerId?`, `branchId?` -- matches spec exactly
- **Response**: Paginated deliveries -- matches

### [POST] `/deliveries`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:30`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `CreateDeliveryDto` -- `branchId`, `partnerId` (required); `saleOrderId?`, `scheduledDate?`, `responsibleId?`, `notes?`, `lines: CreateDeliveryLineDto[]` (required) -- matches spec exactly
- **CreateDeliveryLineDto**: `productId` (required); `saleOrderLineId?`, `productVariantId?`, `qtyDemand` (@Min(0.0001)), `qtyDone?` (@Min(0), default 0), `unitOfMeasureId?`, `locationId?`, `lotNumber?`, `serialNumber?` -- matches spec exactly
- **Response**: Created delivery -- matches

### [GET] `/deliveries/:id`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:41`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Delivery with lines -- matches

### [PUT] `/deliveries/:id`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:48`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `UpdateDeliveryDto` -- `version` (required), all other fields optional including `lines?` -- matches
- **Response**: Updated delivery -- matches

### [POST] `/deliveries/:id/validate`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:60`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Response**: Validated delivery (creates stock moves) -- matches

### [POST] `/deliveries/:id/cancel`

- **Controller**: Found at `deliveries/controllers/deliveries.controller.ts:70`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Response**: Cancelled delivery -- matches

---

## Receipts

### [GET] `/receipts`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:23`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Request DTO**: `ReceiptQueryDto` extends `PaginationDto` + `status?` (ReceiptStatus enum), `purchaseOrderId?`, `partnerId?`, `branchId?` -- matches spec exactly
- **Response**: Paginated receipts -- matches

### [POST] `/receipts`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:30`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `CreateReceiptDto` -- `branchId`, `partnerId` (required); `purchaseOrderId?`, `scheduledDate?`, `responsibleId?`, `notes?`, `lines: CreateReceiptLineDto[]` (required) -- matches spec
- **CreateReceiptLineDto**: `productId` (required); `purchaseOrderLineId?` (string, not UUID -- uses bigint PO line ID), `productVariantId?`, `qtyDemand` (@Min(0.0001)), `qtyDone?` (@Min(0), default 0), `unitOfMeasureId?`, `locationId?`, `lotNumber?`, `serialNumber?`, `expiryDate?` (@IsDateString), `unitCost?` (@Min(0), default 0) -- matches spec exactly
- **Response**: Created receipt -- matches

### [GET] `/receipts/:id`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:41`
- **Permission**: Spec says `inventory:view` | Actual: `inventory:view`
- **Response**: Receipt with lines -- matches

### [PUT] `/receipts/:id`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:48`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Request DTO**: `UpdateReceiptDto` -- `version` (required), all other fields optional including `lines?` -- matches
- **Response**: Updated receipt -- matches

### [POST] `/receipts/:id/validate`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:60`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Response**: Validated receipt (creates stock moves, updates PO) -- matches

### [POST] `/receipts/:id/cancel`

- **Controller**: Found at `receipts/controllers/receipts.controller.ts:70`
- **Permission**: Spec says `inventory:manage` | Actual: `inventory:manage`
- **Response**: Cancelled receipt -- matches

---

## Consolidated Mismatch List

| #   | Severity | Area                                        | Issue                                                                                                                                                                                               |
| --- | -------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Low      | Products `GET /:id/availability`            | Backend accepts `quantity` query param not documented in spec                                                                                                                                       |
| 2   | Info     | Products `PATCH /bulk-update`               | `BulkUpdateProductItemDto` has a reduced field set compared to `UpdateProductDto` (no productType, invoicePolicy, tracking flags, account IDs, taxes). Spec does not detail bulk-update item shape. |
| 3   | Info     | Stock Movements `POST /inventory/movements` | Two DTOs exist: `CreateStockMovementDto` (used by controller, field `type`) and legacy `CreateMovementDto` (field `movementType`). Spec does not detail DTO fields.                                 |
| 4   | Low      | Definitions UoM                             | Backend has `GET /:id` endpoint not mentioned in spec                                                                                                                                               |
| 5   | Low      | Definitions UoM                             | Backend uses `PATCH` for update; spec does not specify method (generic "CRUD")                                                                                                                      |
| 6   | Low      | Definitions Adj Reasons                     | Backend has `GET /:id` endpoint not mentioned in spec                                                                                                                                               |
| 7   | Low      | Definitions Adj Reasons                     | Backend uses `PATCH` for update; spec does not specify method (generic "CRUD")                                                                                                                      |

**No missing endpoints in backend.** All 93 endpoints documented in the spec exist and are implemented.

**No extra backend endpoints** beyond what's documented, except for the two `GET /:id` definition endpoints noted above.
