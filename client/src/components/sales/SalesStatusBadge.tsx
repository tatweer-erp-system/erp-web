import { Tag } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  SalesOrderStatus,
  SalesOrderInvoiceStatus,
  SalesOrderDeliveryStatus,
} from "@/constants/enums";

type BadgeType = "order" | "invoice" | "delivery";

type SalesStatusBadgeProps = {
  status: string;
  type: BadgeType;
};

const ORDER_COLOR_MAP: Record<string, string> = {
  [SalesOrderStatus.DRAFT]: "default",
  [SalesOrderStatus.CONFIRMED]: "blue",
  [SalesOrderStatus.DONE]: "green",
  [SalesOrderStatus.CANCELLED]: "red",
};

const INVOICE_COLOR_MAP: Record<string, string> = {
  [SalesOrderInvoiceStatus.NOTHING]: "default",
  [SalesOrderInvoiceStatus.TO_INVOICE]: "orange",
  [SalesOrderInvoiceStatus.INVOICED]: "green",
};

const DELIVERY_COLOR_MAP: Record<string, string> = {
  [SalesOrderDeliveryStatus.PENDING]: "orange",
  [SalesOrderDeliveryStatus.PARTIAL]: "volcano",
  [SalesOrderDeliveryStatus.DONE]: "green",
};

const COLOR_MAPS: Record<BadgeType, Record<string, string>> = {
  order: ORDER_COLOR_MAP,
  invoice: INVOICE_COLOR_MAP,
  delivery: DELIVERY_COLOR_MAP,
};

const LABEL_PREFIX: Record<BadgeType, string> = {
  order: "sales.status",
  invoice: "sales.invoiceStatus",
  delivery: "sales.deliveryStatus",
};

/**
 * Status badge for sales order, invoice, and delivery statuses.
 * Uses Ant Design Tag with color maps matching the design spec.
 */
export function SalesStatusBadge({ status, type }: SalesStatusBadgeProps) {
  const { t, lang } = useTranslation();

  const colorMap = COLOR_MAPS[type];
  const color = colorMap[status] ?? "default";
  const label = t(`${LABEL_PREFIX[type]}.${status}`, lang);

  return (
    <Tag color={color} className="text-xs font-medium">
      {label}
    </Tag>
  );
}
