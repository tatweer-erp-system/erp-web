import { Card } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { SalesStatusBadge } from "@/components/sales/SalesStatusBadge";
import type { SalesOrderRow } from "@/types/modules/sales";

type SalesOrderCardProps = {
  order: SalesOrderRow;
  onClick: (id: string) => void;
};

/**
 * Mobile card layout for the sales orders list view.
 * Displays key order info with status badges.
 * Tap triggers navigation to detail page.
 */
export function SalesOrderCard({ order, onClick }: SalesOrderCardProps) {
  const { t, lang } = useTranslation();

  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    lang === "ar" ? "ar-SA" : "en-SA",
    { day: "2-digit", month: "short", year: "numeric" }
  );

  const formattedAmount = Number(order.totalAmount).toLocaleString("en-SA", {
    minimumFractionDigits: 2,
  });

  const customerName =
    getName({ nameEn: order.partnerNameEn, nameAr: order.partnerNameAr }) ||
    t("sales.column.customer", lang);

  return (
    <Card
      hoverable
      size="small"
      className="mb-3 cursor-pointer"
      onClick={() => onClick(order.orderNumber)}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="font-mono font-bold text-base text-primary">
          {order.orderNumber}
        </span>
        <SalesStatusBadge status={order.status} type="order" />
      </div>

      <p className="text-sm text-gray-500 mb-2">{customerName}</p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-semibold font-mono">
          {order.currencyCode ?? "SAR"} {formattedAmount}
        </span>
        <span className="text-sm text-gray-400">{formattedDate}</span>
      </div>

      <div className="flex items-center gap-2">
        <SalesStatusBadge status={order.invoiceStatus} type="invoice" />
        <SalesStatusBadge status={order.deliveryStatus} type="delivery" />
      </div>
    </Card>
  );
}
