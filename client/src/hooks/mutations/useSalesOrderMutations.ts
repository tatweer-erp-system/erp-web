import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder,
  confirmSalesOrder as confirmSalesOrderApi,
  cancelSalesOrder as cancelSalesOrderApi,
  createInvoiceFromSO,
  createDeliveryFromSO,
  addSalesOrderLine,
  updateSalesOrderLine,
  deleteSalesOrderLine,
} from "@/api/endpoints/sales-orders.api";
import { queryKeys } from "@/shared/constants/query-keys";
import type {
  CreateSalesOrderInput,
  UpdateSalesOrderInput,
  CreateSalesOrderLineInput,
  UpdateSalesOrderLineInput,
  CreateInvoiceFromSOInput,
} from "@/types/modules/sales";

/** Create a new draft sales order */
export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSalesOrderInput) => createSalesOrder(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.quotations,
      });
    },
  });
}

/** Update a draft sales order */
export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSalesOrderInput }) =>
      updateSalesOrder(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.quotations,
      });
    },
  });
}

/** Soft-delete a draft sales order */
export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSalesOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.quotations,
      });
    },
  });
}

/** Confirm a draft sales order (quotation -> confirmed SO) */
export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmSalesOrderApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.quotations,
      });
    },
  });
}

/** Cancel a sales order */
export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelSalesOrderApi(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saleOrders.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(id),
      });
    },
  });
}

/** Create an invoice from a confirmed sales order */
export function useCreateInvoiceFromSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateInvoiceFromSOInput }) =>
      createInvoiceFromSO(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.sales });
    },
  });
}

/** Create a delivery from a confirmed sales order */
export function useCreateDeliveryFromSO() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => createDeliveryFromSO(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.warehouses,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.inventory.stockTransfers,
      });
    },
  });
}

/** Add a line to a draft sales order */
export function useAddSalesOrderLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      dto,
    }: {
      orderId: string;
      dto: CreateSalesOrderLineInput;
    }) => addSalesOrderLine(orderId, dto),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(orderId),
      });
    },
  });
}

/** Update a line on a draft sales order */
export function useUpdateSalesOrderLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      lineId,
      dto,
    }: {
      orderId: string;
      lineId: string;
      dto: UpdateSalesOrderLineInput;
    }) => updateSalesOrderLine(orderId, lineId, dto),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(orderId),
      });
    },
  });
}

/** Remove a line from a draft sales order */
export function useDeleteSalesOrderLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, lineId }: { orderId: string; lineId: string }) =>
      deleteSalesOrderLine(orderId, lineId),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.saleOrders.detail(orderId),
      });
    },
  });
}
