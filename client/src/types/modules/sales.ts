export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled" | "Refunded";
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  group?: string;
  balance: number;
  totalOrders: number;
  createdAt: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customer: Pick<Customer, "id" | "name">;
  date: string;
  dueDate?: string;
  status: OrderStatus;
  total: number;
  tax: number;
  discount: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customer: Pick<Customer, "id" | "name">;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
  paid: number;
  balance: number;
}
