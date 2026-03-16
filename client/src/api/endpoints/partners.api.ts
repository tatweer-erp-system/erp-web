import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";

type Partner = {
  id: string;
  nameEn: string;
  nameAr: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  partnerType: string;
  isActive: boolean;
  balance: number;
  createdAt?: string;
};

type CreatePartnerDto = {
  nameEn: string;
  nameAr: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  partnerType?: string;
  isCustomer?: boolean;
  isVendor?: boolean;
  isActive?: boolean;
};

type UpdatePartnerDto = Partial<CreatePartnerDto> & {
  version: number;
};

/** Fetch a paginated list of partners (customers + suppliers) */
export function getPartners(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<Partner>>("/partners", { params })
    .then(r => r.data);
}

/** Fetch a single partner by ID */
export function getPartner(id: string) {
  return apiClient
    .get<ApiResponse<Partner>>(`/partners/${id}`)
    .then(r => r.data);
}

/** Create a new partner */
export function createPartner(dto: CreatePartnerDto) {
  return apiClient
    .post<ApiResponse<Partner>>("/partners", dto)
    .then(r => r.data);
}

/** Update an existing partner */
export function updatePartner(id: string, dto: UpdatePartnerDto) {
  return apiClient
    .patch<ApiResponse<Partner>>(`/partners/${id}`, dto)
    .then(r => r.data);
}

/** Delete a partner by ID */
export function deletePartner(id: string) {
  return apiClient
    .delete<ApiResponse<void>>(`/partners/${id}`)
    .then(r => r.data);
}

/** Namespace for hooks that prefer object-style access */
export const partnersApi = {
  list: getPartners,
  get: getPartner,
  create: createPartner,
  update: updatePartner,
  remove: deletePartner,
};
