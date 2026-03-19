import { Steps, Alert } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { SalesOrderStatus } from "@/constants/enums";

type SalesOrderStatusBarProps = {
  status: string;
  cancelledAt?: string | null;
  isCompact?: boolean;
};

const STEP_ORDER = [
  SalesOrderStatus.DRAFT,
  SalesOrderStatus.CONFIRMED,
  SalesOrderStatus.DONE,
] as const;

/**
 * Progress bar showing the sales order lifecycle: Draft -> Confirmed -> Done.
 * When cancelled, displays an error alert instead of steps.
 */
export function SalesOrderStatusBar({
  status,
  cancelledAt,
  isCompact = false,
}: SalesOrderStatusBarProps) {
  const { t, lang } = useTranslation();

  if (status === SalesOrderStatus.CANCELLED) {
    const message = cancelledAt
      ? `${t("sales.status.cancelled", lang)} - ${new Date(cancelledAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA")}`
      : t("sales.status.cancelled", lang);

    return <Alert type="error" showIcon title={message} className="mb-4" />;
  }

  const currentIndex = STEP_ORDER.indexOf(
    status as (typeof STEP_ORDER)[number]
  );

  const steps = STEP_ORDER.map(step => ({
    title: t(`sales.status.${step}`, lang),
  }));

  return (
    <Steps
      current={currentIndex}
      size={isCompact ? "small" : "default"}
      items={steps}
      className="mb-4"
    />
  );
}
