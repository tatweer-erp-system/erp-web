// ─── Sales ────────────────────────────────────────────────────────────────────

/** Sales / Purchase invoice payment status */
export const InvoiceStatus = {
  PAID: "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

/** Sales order status (page-level, lowercase variant) */
export const OrderStatus = {
  COMPLETED: "completed",
  PROCESSING: "processing",
  PENDING: "pending",
  CANCELLED: "cancelled",
  IN_TRANSIT: "in-transit",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** Quotation status */
export const QuotationStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  EXPIRED: "expired",
} as const;
export type QuotationStatus =
  (typeof QuotationStatus)[keyof typeof QuotationStatus];

/** Return (sales / purchase) status */
export const ReturnStatus = {
  PROCESSED: "processed",
  PENDING: "pending",
  REJECTED: "rejected",
} as const;
export type ReturnStatus = (typeof ReturnStatus)[keyof typeof ReturnStatus];

// ─── Purchase ─────────────────────────────────────────────────────────────────

/** Purchase order fulfillment status */
export const PurchaseOrderStatus = {
  DELIVERED: "delivered",
  IN_TRANSIT: "in-transit",
  PROCESSING: "processing",
  CANCELLED: "cancelled",
} as const;
export type PurchaseOrderStatus =
  (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];

/** Purchase order payment status */
export const PaymentStatus = {
  PAID: "paid",
  PENDING: "pending",
  OVERDUE: "overdue",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/** Purchase report order status */
export const PurchaseReportStatus = {
  RECEIVED: "received",
  PENDING: "pending",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;
export type PurchaseReportStatus =
  (typeof PurchaseReportStatus)[keyof typeof PurchaseReportStatus];

// ─── Inventory ────────────────────────────────────────────────────────────────

/** Product / inventory stock status */
export const StockStatus = {
  IN_STOCK: "in-stock",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
} as const;
export type StockStatus = (typeof StockStatus)[keyof typeof StockStatus];

/** Product type (storable, consumable, service) */
export const ProductType = {
  STORABLE: "storable",
  CONSUMABLE: "consumable",
  SERVICE: "service",
} as const;
export type ProductType = (typeof ProductType)[keyof typeof ProductType];

/** Product invoice policy */
export const InvoicePolicy = {
  ORDERED: "ordered",
  DELIVERED: "delivered",
} as const;
export type InvoicePolicy = (typeof InvoicePolicy)[keyof typeof InvoicePolicy];

/** Product status */
export const ProductStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DISCONTINUED: "discontinued",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

/** Extended stock status used in inventory reports */
export const StockReportStatus = {
  IN_STOCK: "in-stock",
  LOW_STOCK: "low-stock",
  OUT_OF_STOCK: "out-of-stock",
  OVERSTOCK: "overstock",
} as const;
export type StockReportStatus =
  (typeof StockReportStatus)[keyof typeof StockReportStatus];

// ─── HR / Employees ──────────────────────────────────────────────────────────

/** Employee status */
export const EmployeeStatus = {
  ACTIVE: "active",
  ON_LEAVE: "on-leave",
  INACTIVE: "inactive",
} as const;
export type EmployeeStatus =
  (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

/** KPI performance rating */
export const KpiStatus = {
  EXCELLENT: "excellent",
  GOOD: "good",
} as const;
export type KpiStatus = (typeof KpiStatus)[keyof typeof KpiStatus];

// ─── Customers ────────────────────────────────────────────────────────────────

/** Customer status */
export const CustomerStatus = {
  ACTIVE: "active",
  VIP: "vip",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
} as const;
export type CustomerStatus =
  (typeof CustomerStatus)[keyof typeof CustomerStatus];

/** Customer group / segment */
export const CustomerGroup = {
  ENTERPRISE: "enterprise",
  SMB: "smb",
  STARTUP: "startup",
  INDIVIDUAL: "individual",
} as const;
export type CustomerGroup = (typeof CustomerGroup)[keyof typeof CustomerGroup];

/** Customer activity type */
export const CustomerActivityType = {
  ORDER: "order",
  PAYMENT: "payment",
  SUPPORT: "support",
  SIGNUP: "signup",
  NOTE: "note",
} as const;
export type CustomerActivityType =
  (typeof CustomerActivityType)[keyof typeof CustomerActivityType];

// ─── Documents ────────────────────────────────────────────────────────────────

/** Document lifecycle status */
export const DocumentStatus = {
  ACTIVE: "active",
  ARCHIVED: "archived",
} as const;
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

/** File upload status */
export const UploadStatus = {
  PENDING: "pending",
  UPLOADING: "uploading",
  DONE: "done",
  ERROR: "error",
} as const;
export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

/** Document module filter */
export const DocModule = {
  ALL: "all",
  SALES: "sales",
  PURCHASES: "purchases",
  INVENTORY: "inventory",
  ACCOUNTING: "accounting",
  TREASURY: "treasury",
  HR: "hr",
  GENERAL: "general",
} as const;
export type DocModule = (typeof DocModule)[keyof typeof DocModule];

// ─── Tax ──────────────────────────────────────────────────────────────────────

/** Tax filing status */
export const FilingStatus = {
  FILED: "filed",
  PENDING: "pending",
  OVERDUE: "overdue",
  DRAFT: "draft",
} as const;
export type FilingStatus = (typeof FilingStatus)[keyof typeof FilingStatus];

// ─── Notifications ────────────────────────────────────────────────────────────

/** Notification type */
export const NotifType = {
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
  ERROR: "error",
} as const;
export type NotifType = (typeof NotifType)[keyof typeof NotifType];

/** Notification module */
export const NotifModule = {
  ORDERS: "Orders",
  INVENTORY: "Inventory",
  FINANCE: "Finance",
  HR: "HR",
  POS: "POS",
  SYSTEM: "System",
} as const;
export type NotifModule = (typeof NotifModule)[keyof typeof NotifModule];

// ─── Users / Roles ────────────────────────────────────────────────────────────

/** User status */
export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** Project member role */
export const MemberRole = {
  OWNER: "owner",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

// ─── POS ──────────────────────────────────────────────────────────────────────

/** POS payment method */
export const POSPaymentMethod = {
  CASH: "cash",
  CARD: "card",
  SPLIT: "split",
} as const;
export type POSPaymentMethod =
  (typeof POSPaymentMethod)[keyof typeof POSPaymentMethod];

/** POS discount type */
export const DiscountType = {
  PERCENT: "percent",
  FIXED: "fixed",
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

/** Cash movement direction */
export const CashMovementType = {
  IN: "in",
  OUT: "out",
} as const;
export type CashMovementType =
  (typeof CashMovementType)[keyof typeof CashMovementType];

/** Voucher status */
export const VoucherStatus = {
  ACTIVE: "active",
  USED: "used",
  EXPIRED: "expired",
} as const;
export type VoucherStatus = (typeof VoucherStatus)[keyof typeof VoucherStatus];

/** Voucher type status */
export const VoucherTypeStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type VoucherTypeStatus =
  (typeof VoucherTypeStatus)[keyof typeof VoucherTypeStatus];

/** Gift card status */
export const GiftCardStatus = {
  ACTIVE: "active",
  DEPLETED: "depleted",
  EXPIRED: "expired",
} as const;
export type GiftCardStatus =
  (typeof GiftCardStatus)[keyof typeof GiftCardStatus];

/** Gift card denomination status */
export const GiftCardDenominationStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type GiftCardDenominationStatus =
  (typeof GiftCardDenominationStatus)[keyof typeof GiftCardDenominationStatus];

/** Offline transaction queue status */
export const OfflineTxStatus = {
  PENDING: "pending",
  SYNCING: "syncing",
  SYNCED: "synced",
  FAILED: "failed",
} as const;
export type OfflineTxStatus =
  (typeof OfflineTxStatus)[keyof typeof OfflineTxStatus];

/** Restaurant table status */
export const TableStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
} as const;
export type TableStatus = (typeof TableStatus)[keyof typeof TableStatus];

/** Restaurant course status */
export const CourseStatus = {
  PENDING: "pending",
  SENT: "sent",
  READY: "ready",
  SERVED: "served",
} as const;
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus];

/** Kitchen printer type */
export const PrinterType = {
  RECEIPT: "receipt",
  KITCHEN: "kitchen",
} as const;
export type PrinterType = (typeof PrinterType)[keyof typeof PrinterType];

/** Printer connection type */
export const PrinterConnection = {
  USB: "usb",
  NETWORK: "network",
} as const;
export type PrinterConnection =
  (typeof PrinterConnection)[keyof typeof PrinterConnection];

/** Kitchen printer status */
export const PrinterStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type PrinterStatus = (typeof PrinterStatus)[keyof typeof PrinterStatus];

/** Table shape */
export const TableShape = {
  SQUARE: "square",
  ROUND: "round",
} as const;
export type TableShape = (typeof TableShape)[keyof typeof TableShape];

// ─── View mode ────────────────────────────────────────────────────────────────

/** Common table/grid view toggle */
export const ViewMode = {
  TABLE: "table",
  GRID: "grid",
} as const;
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

// ─── Authentication ───────────────────────────────────────────────────────────

/** Login / audit log result status */
export const LoginResult = {
  SUCCESS: "success",
  FAILED: "failed",
} as const;
export type LoginResult = (typeof LoginResult)[keyof typeof LoginResult];

// ─── Attendance ───────────────────────────────────────────────────────────────

/** Employee attendance status */
export const AttendanceStatus = {
  PRESENT: "present",
  ABSENT: "absent",
  HALF_DAY: "half-day",
} as const;
export type AttendanceStatus =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

/** KPI performance status (extended with average) */
export const PerformanceStatus = {
  EXCELLENT: "excellent",
  GOOD: "good",
  AVERAGE: "average",
} as const;
export type PerformanceStatus =
  (typeof PerformanceStatus)[keyof typeof PerformanceStatus];

// ─── Accounting ───────────────────────────────────────────────────────────────

export const AccountType = {
  ASSET: "asset",
  LIABILITY: "liability",
  EQUITY: "equity",
  REVENUE: "revenue",
  EXPENSE: "expense",
} as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const NormalBalance = {
  DEBIT: "debit",
  CREDIT: "credit",
} as const;
export type NormalBalance = (typeof NormalBalance)[keyof typeof NormalBalance];

export const JournalEntryType = {
  MANUAL: "manual",
  AUTO: "auto",
  OPENING: "opening",
  CLOSING: "closing",
  REVERSAL: "reversal",
} as const;
export type JournalEntryType =
  (typeof JournalEntryType)[keyof typeof JournalEntryType];

/** Derived from isPosted + reversedBy on the frontend */
export const JournalEntryStatus = {
  DRAFT: "draft",
  POSTED: "posted",
  REVERSED: "reversed",
} as const;
export type JournalEntryStatus =
  (typeof JournalEntryStatus)[keyof typeof JournalEntryStatus];

export const FiscalPeriodStatus = {
  OPEN: "open",
  CLOSED: "closed",
  LOCKED: "locked",
} as const;
export type FiscalPeriodStatus =
  (typeof FiscalPeriodStatus)[keyof typeof FiscalPeriodStatus];

export const FiscalPeriodType = {
  MONTHLY: "monthly",
  QUARTERLY: "quarterly",
} as const;
export type FiscalPeriodType =
  (typeof FiscalPeriodType)[keyof typeof FiscalPeriodType];

// ─── Definitions ──────────────────────────────────────────────────────────────

/** Termination reason type */
export const TerminationType = {
  VOLUNTARY: "voluntary",
  INVOLUNTARY: "involuntary",
  END_OF_CONTRACT: "end_of_contract",
  RETIREMENT: "retirement",
} as const;
export type TerminationType =
  (typeof TerminationType)[keyof typeof TerminationType];

/** Unit of measure type */
export const UomType = {
  UNIT: "unit",
  WEIGHT: "weight",
  VOLUME: "volume",
  LENGTH: "length",
  TIME: "time",
} as const;
export type UomType = (typeof UomType)[keyof typeof UomType];

/** Inventory adjustment reason type */
export const AdjustmentReasonType = {
  INCREASE: "increase",
  DECREASE: "decrease",
} as const;
export type AdjustmentReasonType =
  (typeof AdjustmentReasonType)[keyof typeof AdjustmentReasonType];

/** Voucher discount type */
export const VoucherDiscountType = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
} as const;
export type VoucherDiscountType =
  (typeof VoucherDiscountType)[keyof typeof VoucherDiscountType];

/** Void/refund reason type */
export const VoidRefundReasonType = {
  VOID: "void",
  REFUND: "refund",
  BOTH: "both",
} as const;
export type VoidRefundReasonType =
  (typeof VoidRefundReasonType)[keyof typeof VoidRefundReasonType];
