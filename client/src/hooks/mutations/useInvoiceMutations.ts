import { useMutation, useQueryClient } from "@tanstack/react-query";

import { invoicesApi } from "@/api/endpoints/invoices.api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

type CreateInvoiceDto = {
  partnerId: string;
  invoiceDate: string;
  dueDate: string;
  lines: { productId: string; quantity: number; unitPrice: number }[];
};

type UpdateInvoiceDto = Partial<CreateInvoiceDto> & { version: number };

/** Create a new invoice */
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateInvoiceDto) => invoicesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

/** Update an existing draft invoice */
export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateInvoiceDto }) =>
      invoicesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

/** Post (confirm) an invoice */
export function usePostInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}

/** Cancel an invoice */
export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    },
  });
}
