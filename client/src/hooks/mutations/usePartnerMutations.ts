import { useMutation, useQueryClient } from "@tanstack/react-query";

import { partnersApi } from "@/api/endpoints/partners.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

type CreatePartnerDto = {
  nameEn: string;
  nameAr: string;
  email?: string;
  phone?: string;
  isCustomer?: boolean;
  isVendor?: boolean;
};

type UpdatePartnerDto = Partial<CreatePartnerDto> & { version: number };

/** Create a new partner (customer or vendor) */
export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePartnerDto) => partnersApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTNERS] });
    },
  });
}

/** Update an existing partner */
export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePartnerDto }) =>
      partnersApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTNERS] });
    },
  });
}

/** Delete a partner */
export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => partnersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTNERS] });
    },
  });
}
