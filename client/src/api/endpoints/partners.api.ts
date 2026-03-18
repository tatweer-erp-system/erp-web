import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Partner,
  PartnerRow,
  PartnerContact,
  PartnerDropdownItem,
  PartnerFilterParams,
  CreatePartnerInput,
  UpdatePartnerInput,
  CreatePartnerContactInput,
  UpdatePartnerContactInput,
} from "@/types/modules/partners";

// ─── Partners CRUD ─────────────────────────────────────────────────────────

/** Fetch a paginated list of partners with optional filters */
export function getPartners(params?: PartnerFilterParams) {
  return apiClient
    .get<PaginatedResponse<PartnerRow>>("/partners", { params })
    .then(r => r.data);
}

/** Fetch a single partner by ID (includes contacts) */
export function getPartner(id: string) {
  return apiClient
    .get<ApiResponse<Partner>>(`/partners/${id}`)
    .then(r => r.data);
}

/** Create a new partner */
export function createPartner(dto: CreatePartnerInput) {
  return apiClient
    .post<ApiResponse<Partner>>("/partners", dto)
    .then(r => r.data);
}

/** Update an existing partner */
export function updatePartner(id: string, dto: UpdatePartnerInput) {
  return apiClient
    .put<ApiResponse<Partner>>(`/partners/${id}`, dto)
    .then(r => r.data);
}

/** Delete a partner by ID */
export function deletePartner(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/partners/${id}`)
    .then(r => r.data);
}

// ─── Partners Dropdown ─────────────────────────────────────────────────────

/** Fetch a dropdown list of partners (lightweight, for select inputs) */
export function getPartnersDropdown(params?: {
  search?: string;
  limit?: number;
  type?: string;
}) {
  return apiClient
    .get<ApiResponse<PartnerDropdownItem[]>>("/partners/dropdown", { params })
    .then(r => r.data);
}

// ─── Partner Contacts ──────────────────────────────────────────────────────

/** Fetch paginated contacts for a partner */
export function getPartnerContacts(
  partnerId: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortOrder?: string;
  }
) {
  return apiClient
    .get<PaginatedResponse<PartnerContact>>(`/partners/${partnerId}/contacts`, {
      params,
    })
    .then(r => r.data);
}

/** Fetch a single partner contact by ID */
export function getPartnerContact(id: string) {
  return apiClient
    .get<ApiResponse<PartnerContact>>(`/partners/contacts/${id}`)
    .then(r => r.data);
}

/** Create a new partner contact */
export function createPartnerContact(dto: CreatePartnerContactInput) {
  return apiClient
    .post<ApiResponse<PartnerContact>>("/partners/contacts", dto)
    .then(r => r.data);
}

/** Update a partner contact */
export function updatePartnerContact(
  id: string,
  dto: UpdatePartnerContactInput
) {
  return apiClient
    .put<ApiResponse<PartnerContact>>(`/partners/contacts/${id}`, dto)
    .then(r => r.data);
}

/** Delete a partner contact */
export function deletePartnerContact(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/partners/contacts/${id}`)
    .then(r => r.data);
}

// ─── Namespace for object-style access ─────────────────────────────────────

export const partnersApi = {
  list: getPartners,
  get: getPartner,
  create: createPartner,
  update: updatePartner,
  remove: deletePartner,
  dropdown: getPartnersDropdown,
  contacts: {
    list: getPartnerContacts,
    get: getPartnerContact,
    create: createPartnerContact,
    update: updatePartnerContact,
    remove: deletePartnerContact,
  },
};
