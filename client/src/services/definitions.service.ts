import apiClient from "@/lib/api";
import type { PaginatedResponse, TableParams } from "@/types/api";

// ─── Generic definition CRUD factory ──────────────────────────────────────────

function createDefinitionService<T extends { id: string }>(basePath: string) {
  return {
    list: (params?: Partial<TableParams>) =>
      apiClient
        .get<PaginatedResponse<T>>(basePath, { params })
        .then(r => r.data),

    get: (id: string) =>
      apiClient.get<T>(`${basePath}/${id}`).then(r => r.data),

    create: (data: Omit<T, "id">) =>
      apiClient.post<T>(basePath, data).then(r => r.data),

    update: (id: string, data: Partial<T>) =>
      apiClient.patch<T>(`${basePath}/${id}`, data).then(r => r.data),

    remove: (id: string) =>
      apiClient.delete(`${basePath}/${id}`).then(r => r.data),
  };
}

// ─── HR Definitions ───────────────────────────────────────────────────────────

export const jobTitlesService = createDefinitionService(
  "/hr/definitions/job-titles"
);

export const employmentTypesService = createDefinitionService(
  "/hr/definitions/employment-types"
);

export const leaveTypesService = createDefinitionService(
  "/hr/definitions/leave-types"
);

export const publicHolidaysService = createDefinitionService(
  "/hr/definitions/public-holidays"
);

export const terminationReasonsService = createDefinitionService(
  "/hr/definitions/termination-reasons"
);

// ─── Inventory Definitions ────────────────────────────────────────────────────

export const unitsOfMeasureService = createDefinitionService(
  "/inventory/definitions/units-of-measure"
);

export const adjustmentReasonsService = createDefinitionService(
  "/inventory/definitions/adjustment-reasons"
);

// ─── Sales & POS Definitions ─────────────────────────────────────────────────

export const voucherTypesService = createDefinitionService(
  "/sales/definitions/voucher-types"
);

export const receiptTemplatesService = createDefinitionService(
  "/sales/definitions/receipt-templates"
);

export const cancellationReasonsService = createDefinitionService(
  "/sales/definitions/cancellation-reasons"
);

export const voidRefundReasonsService = createDefinitionService(
  "/sales/definitions/void-refund-reasons"
);

export const discountReasonsService = createDefinitionService(
  "/sales/definitions/discount-reasons"
);

export const holdReasonsService = createDefinitionService(
  "/sales/definitions/hold-reasons"
);

// ─── Purchases Definitions ────────────────────────────────────────────────────

export const paymentTermsService = createDefinitionService(
  "/purchasing/definitions/payment-terms"
);

export const rejectionReasonsService = createDefinitionService(
  "/purchasing/definitions/rejection-reasons"
);

// ─── Treasury Definitions ─────────────────────────────────────────────────────

export const transferReasonsService = createDefinitionService(
  "/treasury/definitions/transfer-reasons"
);
