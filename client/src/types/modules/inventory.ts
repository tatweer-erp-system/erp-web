export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
export type StockCategory = "Electronics" | "Clothing" | "Food" | "Furniture" | "Other";

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: StockCategory;
  quantity: number;
  minStock: number;
  price: number;
  costPrice: number;
  status: StockStatus;
  warehouse: string;
  lastUpdated: string;
}
