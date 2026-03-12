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
  readonly orderNumber: string;
  customer: Pick<Customer, "id" | "name">;
  branchId: string;
  branchName?: string;
  date: string;
  dueDate?: string;
  status: OrderStatus;
  total: number;
  tax: number;
  discount: number;
  items: OrderItem[];
}

export interface PurchaseOrder {
  id: string;
  readonly orderNumber: string;
  vendor: { id: string; name: string };
  branchId: string;
  branchName?: string;
  date: string;
  dueDate?: string;
  status: OrderStatus;
  total: number;
  tax: number;
  discount: number;
  items: OrderItem[];
}

export interface Employee {
  id: string;
  readonly employeeNumber: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  branchId: string;
  branchName?: string;
  status: string;
  joinDate: string;
}

export interface ProjectMember {
  id: number;
  userId: string;
  role: "owner" | "member" | "viewer";
  user: {
    name: string;
    email: string;
  };
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
