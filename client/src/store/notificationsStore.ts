import { create } from "zustand";

export type NotifType   = "success" | "warning" | "info" | "error";
export type NotifModule = "Orders" | "Inventory" | "Finance" | "HR" | "POS" | "System";

export interface Notification {
  id: string;
  type: NotifType;
  module: NotifModule;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  href?: string;
}

const now = Date.now();

const INITIAL: Notification[] = [
  {
    id: "1",
    type: "success",
    module: "Orders",
    title: "Order Completed",
    message: "Order #POS-123456 has been successfully processed and closed.",
    timestamp: new Date(now - 4 * 60000),
    read: false,
    href: "/orders",
  },
  {
    id: "2",
    type: "warning",
    module: "Inventory",
    title: "Low Stock Alert",
    message: "Wireless Headphones (SKU-001) has only 3 units remaining.",
    timestamp: new Date(now - 18 * 60000),
    read: false,
    href: "/products",
  },
  {
    id: "3",
    type: "error",
    module: "Finance",
    title: "Payment Failed",
    message: "Invoice #INV-4821 payment of $1,240 failed — card declined.",
    timestamp: new Date(now - 45 * 60000),
    read: false,
    href: "/invoices",
  },
  {
    id: "4",
    type: "info",
    module: "HR",
    title: "Leave Request",
    message: "Ahmed Al-Rashid submitted a leave request for 3 days (Mar 15–17).",
    timestamp: new Date(now - 2 * 3600000),
    read: false,
    href: "/leave",
  },
  {
    id: "5",
    type: "success",
    module: "POS",
    title: "Daily Report Ready",
    message: "Today's POS session closed with $8,420 in total sales across 47 transactions.",
    timestamp: new Date(now - 3 * 3600000),
    read: true,
    href: "/pos/loyalty-report",
  },
  {
    id: "6",
    type: "warning",
    module: "Finance",
    title: "Invoice Overdue",
    message: "Invoice #INV-4810 from Acme Supplies is 5 days overdue ($3,500).",
    timestamp: new Date(now - 5 * 3600000),
    read: true,
    href: "/invoices",
  },
  {
    id: "7",
    type: "info",
    module: "System",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight at 02:00–04:00 UTC. Services may be briefly unavailable.",
    timestamp: new Date(now - 26 * 3600000),
    read: true,
  },
  {
    id: "8",
    type: "success",
    module: "Inventory",
    title: "Stock Replenished",
    message: "Purchase order PO-2091 received — 200 units of USB-C Hub added to warehouse.",
    timestamp: new Date(now - 28 * 3600000),
    read: true,
    href: "/products",
  },
  {
    id: "9",
    type: "error",
    module: "System",
    title: "Backup Failed",
    message: "Nightly database backup failed at 02:00. Manual backup recommended.",
    timestamp: new Date(now - 2 * 86400000),
    read: true,
  },
  {
    id: "10",
    type: "info",
    module: "HR",
    title: "New Employee Onboarded",
    message: "Sara Ali has been added to the Finance department and is ready for system access.",
    timestamp: new Date(now - 3 * 86400000),
    read: true,
    href: "/employees",
  },
];

interface NotificationsState {
  items: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: INITIAL,

  markRead(id) {
    set((s) => ({ items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  },

  markAllRead() {
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) }));
  },

  remove(id) {
    set((s) => ({ items: s.items.filter((n) => n.id !== id) }));
  },

  clearAll() {
    set({ items: [] });
  },

  unreadCount() {
    return get().items.filter((n) => !n.read).length;
  },
}));
