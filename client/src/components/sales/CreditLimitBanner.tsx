import { useMemo } from "react";

import { Alert } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";

type CreditLimitBannerProps = {
  outstanding: number;
  creditLimit: number;
  orderTotal: number;
  isBlocking?: boolean;
  onClose?: () => void;
};

/**
 * Warning/error banner displayed when a customer's credit limit is relevant.
 * Shows outstanding balance, order total, and credit limit.
 * Dismissable but non-blocking by default.
 */
export function CreditLimitBanner({
  outstanding,
  creditLimit,
  orderTotal,
  isBlocking = false,
  onClose,
}: CreditLimitBannerProps) {
  const { t, lang } = useTranslation();

  const totalExposure = outstanding + orderTotal;
  const isExceeded = totalExposure > creditLimit;

  const alertType = useMemo(() => {
    if (!isExceeded) return "info" as const;
    if (isBlocking) return "error" as const;
    return "warning" as const;
  }, [isExceeded, isBlocking]);

  if (creditLimit <= 0) return null;

  const formatAmount = (amount: number | string): string =>
    Number(amount).toLocaleString("en-SA", { minimumFractionDigits: 2 });

  const details = `${t("sales.credit.outstanding", lang)}: ${formatAmount(outstanding)} SAR + ${t("sales.credit.thisOrder", lang)}: ${formatAmount(orderTotal)} SAR = ${formatAmount(totalExposure)} SAR (${t("sales.credit.limit", lang)}: ${formatAmount(creditLimit)} SAR)`;

  const statusMessage = isExceeded
    ? isBlocking
      ? t("sales.message.creditLimitBlocked", lang)
      : t("sales.message.creditLimitExceeded", lang)
    : t("sales.credit.withinLimit", lang);

  return (
    <Alert
      type={alertType}
      showIcon
      closable={!isBlocking}
      onClose={onClose}
      message={statusMessage}
      description={details}
      className="mb-4"
    />
  );
}
