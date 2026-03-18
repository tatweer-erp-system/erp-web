import { useQuery } from "@tanstack/react-query";

import {
  getPartners,
  getPartner,
  getPartnersDropdown,
  getPartnerContacts,
} from "@/api/endpoints/partners.api";
import { queryKeys } from "@/shared/constants/query-keys";
import { useBranchStore } from "@/stores/branch.store";
import type { PartnerFilterParams } from "@/types/modules/partners";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the active branch ID from the store, used in every query key */
function useActiveBranchId(): string | null {
  return useBranchStore(s => s.activeBranch?.id ?? null);
}

// ─── Partner List ───────────────────────────────────────────────────────────

/** Paginated list of customers (partners where isCustomer = true) */
export function useCustomers(params?: PartnerFilterParams) {
  const branchId = useActiveBranchId();
  const customerParams: PartnerFilterParams = { ...params, isCustomer: true };

  return useQuery({
    queryKey: [
      ...queryKeys.partners.customerList({ ...customerParams, branchId }),
    ],
    queryFn: () => getPartners(customerParams),
    enabled: !!branchId,
  });
}

/** Single customer detail by ID (includes contacts) */
export function useCustomer(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.partners.customerDetail(id!), branchId],
    queryFn: () => getPartner(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

/** Paginated list of vendors (partners where isSupplier = true) */
export function useVendors(params?: PartnerFilterParams) {
  const branchId = useActiveBranchId();
  const vendorParams: PartnerFilterParams = { ...params, isSupplier: true };

  return useQuery({
    queryKey: [...queryKeys.partners.vendorList({ ...vendorParams, branchId })],
    queryFn: () => getPartners(vendorParams),
    enabled: !!branchId,
  });
}

/** Single vendor detail by ID (includes contacts) */
export function useVendor(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.partners.vendorDetail(id!), branchId],
    queryFn: () => getPartner(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

/** Full partners list (all types, no filter) */
export function usePartners(params?: PartnerFilterParams) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.partners.customerList({ ...params, branchId })],
    queryFn: () => getPartners(params),
    enabled: !!branchId,
  });
}

/** Single partner by ID (alias for backward compatibility) */
export function usePartner(id: string | undefined) {
  const branchId = useActiveBranchId();

  return useQuery({
    queryKey: [...queryKeys.partners.customerDetail(id!), branchId],
    queryFn: () => getPartner(id!),
    select: res => res.data,
    enabled: !!id && !!branchId,
  });
}

// ─── Dropdown ───────────────────────────────────────────────────────────────

/** Partners dropdown for select inputs (customers) */
export function useCustomersDropdown(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.partners.customers, "dropdown", search],
    queryFn: () =>
      getPartnersDropdown({ search, type: "customer", limit: 100 }),
    select: res => res.data,
  });
}

/** Partners dropdown for select inputs (vendors) */
export function useVendorsDropdown(search?: string) {
  return useQuery({
    queryKey: [...queryKeys.partners.vendors, "dropdown", search],
    queryFn: () =>
      getPartnersDropdown({ search, type: "supplier", limit: 100 }),
    select: res => res.data,
  });
}

/** Partners dropdown for select inputs (all types) */
export function usePartnersDropdown(search?: string, type?: string) {
  return useQuery({
    queryKey: [...queryKeys.partners.customers, "dropdown", search, type],
    queryFn: () => getPartnersDropdown({ search, type, limit: 100 }),
    select: res => res.data,
  });
}

// ─── Contacts ───────────────────────────────────────────────────────────────

/** Paginated contacts for a partner */
export function usePartnerContacts(
  partnerId: string | undefined,
  params?: { page?: number; limit?: number; search?: string }
) {
  return useQuery({
    queryKey: [
      ...queryKeys.partners.customerDetail(partnerId!),
      "contacts",
      params,
    ],
    queryFn: () => getPartnerContacts(partnerId!, params),
    enabled: !!partnerId,
  });
}
