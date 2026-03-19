import { useState, useMemo } from "react";

import { Radio, InputNumber, Button, Space } from "antd";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { AppModal } from "@/components/common/AppModal";
import { CreateInvoiceType } from "@/types/modules/sales";

type CreateInvoiceModalProps = {
  open: boolean;
  orderTotal: number;
  onClose: () => void;
  onSubmit: (type: string, value?: number) => void;
  isSubmitting?: boolean;
};

const INVOICE_TYPES = [
  CreateInvoiceType.REGULAR,
  CreateInvoiceType.DOWN_PAYMENT_PERCENTAGE,
  CreateInvoiceType.DOWN_PAYMENT_FIXED,
] as const;

/**
 * Modal for choosing how to create an invoice from a sales order.
 * Supports regular invoice, down payment by percentage, and down payment by fixed amount.
 */
export function CreateInvoiceModal({
  open,
  orderTotal,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreateInvoiceModalProps) {
  const { t, lang } = useTranslation();
  const [invoiceType, setInvoiceType] = useState<string>(
    CreateInvoiceType.REGULAR
  );
  const [value, setValue] = useState<number | null>(null);

  const isDownPayment = invoiceType !== CreateInvoiceType.REGULAR;
  const isPercentage =
    invoiceType === CreateInvoiceType.DOWN_PAYMENT_PERCENTAGE;

  const isValid = useMemo(() => {
    if (!isDownPayment) return true;
    if (value === null || value <= 0) return false;
    if (isPercentage && value > 100) return false;
    if (!isPercentage && value > orderTotal) return false;
    return true;
  }, [isDownPayment, value, isPercentage, orderTotal]);

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit(invoiceType, isDownPayment ? (value ?? undefined) : undefined);
  };

  const handleClose = () => {
    setInvoiceType(CreateInvoiceType.REGULAR);
    setValue(null);
    onClose();
  };

  const typeLabels: Record<string, string> = {
    [CreateInvoiceType.REGULAR]: t("sales.invoice.regular", lang),
    [CreateInvoiceType.DOWN_PAYMENT_PERCENTAGE]: t(
      "sales.invoice.downPaymentPercentage",
      lang
    ),
    [CreateInvoiceType.DOWN_PAYMENT_FIXED]: t(
      "sales.invoice.downPaymentFixed",
      lang
    ),
  };

  return (
    <AppModal
      title={t("sales.action.createInvoice", lang)}
      open={open}
      onClose={handleClose}
      width={480}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={handleClose}>{t("common.cancel", lang)}</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!isValid}
            loading={isSubmitting}
          >
            {t("sales.action.createInvoice", lang)}
          </Button>
        </div>
      }
    >
      <Space orientation="vertical" size="large" className="w-full">
        <div>
          <p className="text-sm font-medium mb-2">
            {t("sales.invoice.type", lang)}
          </p>
          <Radio.Group
            value={invoiceType}
            onChange={e => {
              setInvoiceType(e.target.value);
              setValue(null);
            }}
            className="flex flex-col gap-2"
          >
            {INVOICE_TYPES.map(type => (
              <Radio key={type} value={type}>
                {typeLabels[type]}
              </Radio>
            ))}
          </Radio.Group>
        </div>

        {isDownPayment && (
          <div>
            <p className="text-sm font-medium mb-2">
              {isPercentage
                ? t("sales.invoice.percentageLabel", lang)
                : t("sales.invoice.fixedAmountLabel", lang)}
            </p>
            <InputNumber
              value={value}
              onChange={setValue}
              min={0.01}
              max={isPercentage ? 100 : orderTotal}
              precision={2}
              style={{ width: "100%" }}
              placeholder={isPercentage ? "0 - 100" : `0 - ${orderTotal}`}
            />
          </div>
        )}
      </Space>
    </AppModal>
  );
}
