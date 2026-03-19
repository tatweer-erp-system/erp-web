import { create } from "zustand";
import { NotifModule, NotifType } from "@/constants/enums";

export type { NotifType, NotifModule };

export interface NotificationMeta {
  notifKind?: string;
  productName?: string;
  currentQty?: number;
  reorderPoint?: number;
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: NotifType;
  module: NotifModule;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  href?: string;
  meta?: NotificationMeta;
}

const now = Date.now();

const INITIAL: Notification[] = [
  {
    id: "1",
    type: NotifType.SUCCESS,
    module: NotifModule.ORDERS,
    title: "Order Completed",
    message: "Order #POS-123456 has been successfully processed and closed.",
    timestamp: new Date(now - 4 * 60000),
    read: false,
    href: "/orders",
  },
  {
    id: "2",
    type: NotifType.WARNING,
    module: NotifModule.INVENTORY,
    title: "Low Stock Alert",
    message:
      "Wireless Headphones (SKU-001) has only 3 units remaining (reorder point: 15).",
    timestamp: new Date(now - 18 * 60000),
    read: false,
    href: "/inventory/products?id=2",
    meta: {
      notifKind: "inventory.low_stock",
      productName: "Wireless Headphones",
      currentQty: 3,
      reorderPoint: 15,
    },
  },
  {
    id: "3",
    type: NotifType.ERROR,
    module: NotifModule.FINANCE,
    title: "Payment Failed",
    message: "Invoice #INV-4821 payment of $1,240 failed — card declined.",
    timestamp: new Date(now - 45 * 60000),
    read: false,
    href: "/invoices",
  },
  {
    id: "4",
    type: NotifType.INFO,
    module: NotifModule.HR,
    title: "Leave Request",
    message:
      "Ahmed Al-Rashid submitted a leave request for 3 days (Mar 15–17).",
    timestamp: new Date(now - 2 * 3600000),
    read: false,
    href: "/hr/leave-management",
  },
  {
    id: "5",
    type: NotifType.SUCCESS,
    module: NotifModule.POS,
    title: "Daily Report Ready",
    message:
      "Today's POS session closed with $8,420 in total sales across 47 transactions.",
    timestamp: new Date(now - 3 * 3600000),
    read: true,
    href: "/pos/loyalty-report",
  },
  {
    id: "6",
    type: NotifType.WARNING,
    module: NotifModule.FINANCE,
    title: "Invoice Overdue",
    message: "Invoice #INV-4810 from Acme Supplies is 5 days overdue ($3,500).",
    timestamp: new Date(now - 5 * 3600000),
    read: true,
    href: "/invoices",
  },
  {
    id: "7",
    type: NotifType.INFO,
    module: NotifModule.SYSTEM,
    title: "System Maintenance",
    message:
      "Scheduled maintenance tonight at 02:00–04:00 UTC. Services may be briefly unavailable.",
    timestamp: new Date(now - 26 * 3600000),
    read: true,
  },
  {
    id: "8",
    type: NotifType.SUCCESS,
    module: NotifModule.INVENTORY,
    title: "Stock Replenished",
    message:
      "Purchase order PO-2091 received — 200 units of USB-C Hub added to warehouse.",
    timestamp: new Date(now - 28 * 3600000),
    read: true,
    href: "/inventory/products",
  },
  {
    id: "9",
    type: NotifType.ERROR,
    module: NotifModule.SYSTEM,
    title: "Backup Failed",
    message:
      "Nightly database backup failed at 02:00. Manual backup recommended.",
    timestamp: new Date(now - 2 * 86400000),
    read: true,
  },
  {
    id: "10",
    type: NotifType.INFO,
    module: NotifModule.HR,
    title: "New Employee Onboarded",
    message:
      "Sara Ali has been added to the Finance department and is ready for system access.",
    timestamp: new Date(now - 3 * 86400000),
    read: true,
    href: "/hr/employees",
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

export const useNotificationsStore = create<NotificationsState>()(
  (set, get) => ({
    items: INITIAL,

    markRead(id) {
      set(s => ({
        items: s.items.map(n => (n.id === id ? { ...n, read: true } : n)),
      }));
    },

    markAllRead() {
      set(s => ({ items: s.items.map(n => ({ ...n, read: true })) }));
    },

    remove(id) {
      set(s => ({ items: s.items.filter(n => n.id !== id) }));
    },

    clearAll() {
      set({ items: [] });
    },

    unreadCount() {
      return get().items.filter(n => !n.read).length;
    },
  })
);
