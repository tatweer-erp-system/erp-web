import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Pricelist,
  PricelistRow,
  PricelistItem,
  PricelistFilterParams,
  CreatePricelistInput,
  UpdatePricelistInput,
  CreatePricelistItemInput,
  UpdatePricelistItemInput,
  ComputedPrice,
  ComputePriceParams,
} from "@/types/modules/pricelists";

// ─── Pricelists CRUD ─────────────────────────────────────────────────────────

/** Fetch a paginated list of pricelists with optional filters */
export function getPricelists(params?: PricelistFilterParams) {
  return apiClient
    .get<PaginatedResponse<PricelistRow>>("/pricelists", { params })
    .then(r => r.data);
}

/** Fetch a single pricelist by ID */
export function getPricelist(id: string) {
  return apiClient
    .get<ApiResponse<Pricelist>>(`/pricelists/${id}`)
    .then(r => r.data);
}

/** Create a new pricelist */
export function createPricelist(data: CreatePricelistInput) {
  return apiClient
    .post<ApiResponse<Pricelist>>("/pricelists", data)
    .then(r => r.data);
}

/** Update a pricelist */
export function updatePricelist(id: string, data: UpdatePricelistInput) {
  return apiClient
    .put<ApiResponse<Pricelist>>(`/pricelists/${id}`, data)
    .then(r => r.data);
}

/** Soft-delete a pricelist */
export function deletePricelist(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/pricelists/${id}`)
    .then(r => r.data);
}

// ─── Pricelist Items ─────────────────────────────────────────────────────────

/** Fetch all items for a pricelist */
export function getPricelistItems(pricelistId: string) {
  return apiClient
    .get<ApiResponse<PricelistItem[]>>(`/pricelists/${pricelistId}/items`)
    .then(r => r.data);
}

/** Add an item to a pricelist */
export function createPricelistItem(
  pricelistId: string,
  data: CreatePricelistItemInput
) {
  return apiClient
    .post<ApiResponse<PricelistItem>>(`/pricelists/${pricelistId}/items`, data)
    .then(r => r.data);
}

/** Update a pricelist item */
export function updatePricelistItem(
  itemId: string,
  data: UpdatePricelistItemInput
) {
  return apiClient
    .put<ApiResponse<PricelistItem>>(`/pricelist-items/${itemId}`, data)
    .then(r => r.data);
}

/** Delete a pricelist item */
export function deletePricelistItem(itemId: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/pricelist-items/${itemId}`)
    .then(r => r.data);
}

// ─── Compute Price ───────────────────────────────────────────────────────────

/** Compute the price of a product using a pricelist */
export function computePrice(params: ComputePriceParams) {
  return apiClient
    .get<ApiResponse<ComputedPrice>>("/pricelists/compute-price", { params })
    .then(r => r.data);
}

// ─── Namespace for object-style access ───────────────────────────────────────

export const pricelistsApi = {
  list: getPricelists,
  get: getPricelist,
  create: createPricelist,
  update: updatePricelist,
  remove: deletePricelist,
  getItems: getPricelistItems,
  createItem: createPricelistItem,
  updateItem: updatePricelistItem,
  removeItem: deletePricelistItem,
  computePrice,
};
