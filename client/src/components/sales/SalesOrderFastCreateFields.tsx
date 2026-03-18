import { useState } from "react";

import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import { Form, Input, InputNumber, Select, DatePicker } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type BilingualRecord = {
  id: string;
  nameEn?: string | null;
  nameAr?: string | null;
  salePrice?: number | null;
};

type SalesOrderFastCreateFieldsProps = {
  control: Control<{
    partnerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    salespersonId?: string;
    notes?: string;
    validUntil?: string;
  }>;
  errors: FieldErrors<{
    partnerId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    salespersonId?: string;
    notes?: string;
    validUntil?: string;
  }>;
  customers: BilingualRecord[];
  products: BilingualRecord[];
  isQuotation: boolean;
  onProductSelect: (productId: string) => void;
};

/** Form fields for the sales order / quotation fast-create drawer. */
export function SalesOrderFastCreateFields({
  control,
  errors,
  customers,
  products,
  isQuotation,
  onProductSelect,
}: SalesOrderFastCreateFieldsProps) {
  const { t, lang } = useTranslation();

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true;
    return getName(c).toLowerCase().includes(customerSearch.toLowerCase());
  });

  const filteredProducts = products.filter(p => {
    if (!productSearch) return true;
    return getName(p).toLowerCase().includes(productSearch.toLowerCase());
  });

  return (
    <>
      {/* Customer */}
      <Form.Item
        label={t("sales.field.customer", lang)}
        validateStatus={errors.partnerId ? "error" : ""}
        help={errors.partnerId?.message}
        required
        layout="vertical"
      >
        <Controller
          name="partnerId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              showSearch
              placeholder={t("sales.field.customer", lang)}
              filterOption={false}
              onSearch={setCustomerSearch}
              autoFocus
              options={filteredCustomers.map(c => ({
                label: getName(c),
                value: c.id,
              }))}
            />
          )}
        />
      </Form.Item>

      {/* Product */}
      <Form.Item
        label={t("sales.line.product", lang)}
        validateStatus={errors.productId ? "error" : ""}
        help={errors.productId?.message}
        required
        layout="vertical"
      >
        <Controller
          name="productId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              showSearch
              placeholder={t("sales.line.product", lang)}
              filterOption={false}
              onSearch={setProductSearch}
              onChange={value => {
                field.onChange(value);
                onProductSelect(value);
              }}
              options={filteredProducts.map(p => ({
                label: getName(p),
                value: p.id,
              }))}
            />
          )}
        />
      </Form.Item>

      {/* Quantity + Unit Price side by side */}
      <div className="flex gap-3">
        <Form.Item
          label={t("sales.line.quantity", lang)}
          validateStatus={errors.quantity ? "error" : ""}
          help={errors.quantity?.message}
          required
          layout="vertical"
          className="flex-1"
        >
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <InputNumber {...field} min={0.001} step={1} className="w-full" />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t("sales.line.unitPrice", lang)}
          validateStatus={errors.unitPrice ? "error" : ""}
          help={errors.unitPrice?.message}
          required
          layout="vertical"
          className="flex-1"
        >
          <Controller
            name="unitPrice"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                min={0}
                precision={2}
                className="w-full"
              />
            )}
          />
        </Form.Item>
      </div>

      {/* Salesperson (optional) */}
      <Form.Item label={t("sales.field.salesperson", lang)} layout="vertical">
        <Controller
          name="salespersonId"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              allowClear
              placeholder={t("sales.field.salesperson", lang)}
            />
          )}
        />
      </Form.Item>

      {/* Notes (optional) */}
      <Form.Item label={t("sales.field.notes", lang)} layout="vertical">
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <Input.TextArea
              {...field}
              rows={2}
              placeholder={t("sales.field.notes", lang)}
            />
          )}
        />
      </Form.Item>

      {/* Valid Until — quotation mode only */}
      {isQuotation && (
        <Form.Item
          label={t("sales.quotation.validUntil", lang)}
          layout="vertical"
        >
          <Controller
            name="validUntil"
            control={control}
            render={({ field }) => (
              <DatePicker
                className="w-full"
                onChange={(_date, dateStr) => field.onChange(dateStr as string)}
              />
            )}
          />
        </Form.Item>
      )}

      {/* Info note */}
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg bg-blue-50 p-3",
          "dark:bg-blue-950/30"
        )}
      >
        <InfoCircleOutlined className="mt-0.5 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-600 dark:text-blue-400">
          {t("sales.fastCreate.note", lang)}
        </p>
      </div>
    </>
  );
}
