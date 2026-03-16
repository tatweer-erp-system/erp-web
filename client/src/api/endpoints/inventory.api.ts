import { apiClient } from "@/api/client";
import type { ApiResponse, PaginatedResponse, TableParams } from "@/types/api";
import type { Warehouse } from "@/types/modules/inventory";

type StockMove = {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  moveType: string;
  reference?: string;
  createdAt?: string;
};

type StockLevel = {
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
};

type CreateTransferDto = {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  lines: {
    productId: string;
    quantity: number;
  }[];
  notes?: string;
};

type Transfer = {
  id: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  status: string;
  createdAt?: string;
};

/** Fetch all warehouses */
export function getWarehouses(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<Warehouse>>("/inventory/warehouses", { params })
    .then(r => r.data);
}

/** Fetch paginated stock movements */
export function getStockMoves(params?: Partial<TableParams>) {
  return apiClient
    .get<PaginatedResponse<StockMove>>("/inventory/stock-moves", { params })
    .then(r => r.data);
}

/** Create an internal stock transfer between warehouses */
export function createTransfer(dto: CreateTransferDto) {
  return apiClient
    .post<ApiResponse<Transfer>>("/inventory/transfers", dto)
    .then(r => r.data);
}

/** Fetch stock levels, optionally filtered by warehouse or product */
export function getStockLevels(params?: {
  warehouseId?: string;
  productId?: string;
}) {
  return apiClient
    .get<ApiResponse<StockLevel[]>>("/inventory/stock-levels", { params })
    .then(r => r.data);
}

/** Namespace for hooks that prefer object-style access */
export const inventoryApi = {
  warehouses: getWarehouses,
  stockMoves: getStockMoves,
  createTransfer,
  stockLevels: (warehouseId: string) => getStockLevels({ warehouseId }),
};
