import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createPartner,
  updatePartner,
  deletePartner,
  createPartnerContact,
  updatePartnerContact,
  deletePartnerContact,
} from "@/api/endpoints/partners.api";
import { queryKeys } from "@/shared/constants/query-keys";
import type {
  CreatePartnerInput,
  UpdatePartnerInput,
  CreatePartnerContactInput,
  UpdatePartnerContactInput,
} from "@/types/modules/partners";

// ─── Partner Mutations ─────────────────────────────────────────────────────

/** Create a new partner (customer or supplier) */
export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePartnerInput) => createPartner(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customers,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.vendors });
    },
  });
}

/** Update an existing partner */
export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePartnerInput }) =>
      updatePartner(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customers,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.vendors });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customerDetail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.vendorDetail(id),
      });
    },
  });
}

/** Delete a partner */
export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customers,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.partners.vendors });
    },
  });
}

// ─── Partner Contact Mutations ─────────────────────────────────────────────

/** Create a new contact for a partner */
export function useCreatePartnerContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePartnerContactInput) => createPartnerContact(dto),
    onSuccess: (_data, dto) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customerDetail(dto.partnerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.vendorDetail(dto.partnerId),
      });
    },
  });
}

/** Update a partner contact */
export function useUpdatePartnerContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
      partnerId,
    }: {
      id: string;
      dto: UpdatePartnerContactInput;
      partnerId: string;
    }) => updatePartnerContact(id, dto),
    onSuccess: (_data, { partnerId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customerDetail(partnerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.vendorDetail(partnerId),
      });
    },
  });
}

/** Delete a partner contact */
export function useDeletePartnerContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; partnerId: string }) =>
      deletePartnerContact(id),
    onSuccess: (_data, { partnerId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.customerDetail(partnerId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.partners.vendorDetail(partnerId),
      });
    },
  });
}
