import { Divider } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { cn } from "@/lib/utils";
import { SalesDiscountType } from "@/constants/enums";

type OrderTotalsProps = {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  discountType?: SalesDiscountType | null;
  discountValue?: number | null;
  currencyCode?: string;
};

/**
 * Displays the order totals section: subtotal, discount, tax, and total.
 * Right-aligned layout matching the design spec.
 */
export function OrderTotals({
  subtotal,
  discountAmount,
  taxAmount,
  totalAmount,
  discountType,
  discountValue,
  currencyCode = "SAR",
}: OrderTotalsProps) {
  const { t, lang } = useTranslation();

  const formatAmount = (amount: number | string): string =>
    `${currencyCode} ${Number(amount).toLocaleString("en-SA", { minimumFractionDigits: 2 })}`;

  const hasOrderDiscount =
    discountType && discountValue !== null && discountValue !== undefined;
  const discountLabel = hasOrderDiscount
    ? discountType === SalesDiscountType.PERCENTAGE
      ? `${t("sales.totals.discount", lang)} (${discountValue}%)`
      : `${t("sales.totals.discount", lang)} (${t("sales.field.discountFixed", lang)})`
    : t("sales.totals.discount", lang);

  return (
    <div className="flex justify-end mt-4">
      <div className="w-72">
        <TotalRow
          label={t("sales.totals.subtotal", lang)}
          value={formatAmount(subtotal)}
        />
        {Number(discountAmount) > 0 && (
          <TotalRow
            label={discountLabel}
            value={`-${formatAmount(discountAmount)}`}
            isNegative
          />
        )}
        <TotalRow
          label={t("sales.totals.tax", lang)}
          value={formatAmount(taxAmount)}
        />
        <Divider className="my-2" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {t("sales.totals.total", lang)}
          </span>
          <span className="text-lg font-bold font-mono">
            {formatAmount(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TotalRow({
  label,
  value,
  isNegative = false,
}: {
  label: string;
  value: string;
  isNegative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold font-mono",
          isNegative && "text-red-500"
        )}
      >
        {value}
      </span>
    </div>
  );
}
