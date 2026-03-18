import { useMemo, useCallback } from "react";

import { Table, InputNumber, Button, Select } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import type { SalesOrderLine } from "@/types/modules/sales";
import { SalesOrderStatus } from "@/constants/enums";

type ProductOption = {
  id: string;
  nameEn?: string;
  nameAr?: string;
  salePrice?: number;
  taxRate?: number;
};

type OrderLinesTableProps = {
  lines: SalesOrderLine[];
  status: string;
  products?: ProductOption[];
  isProductsLoading?: boolean;
  onLineChange: (index: number, field: string, value: unknown) => void;
  onLineAdd: () => void;
  onLineRemove: (index: number) => void;
  onProductSelect?: (index: number, product: ProductOption) => void;
};

/** Safely parse a value that may be string or number to number. */
function num(v: unknown): number {
  return typeof v === "string" ? parseFloat(v) || 0 : Number(v) || 0;
}

/** Computes line subtotal: qty * price after discount, plus tax. */
function computeSubtotal(
  qty: unknown,
  price: unknown,
  discount: unknown,
  tax: unknown
): number {
  const base = num(qty) * num(price);
  const discounted = base * (1 - num(discount) / 100);
  return Math.round(discounted * (1 + num(tax) / 100) * 100) / 100;
}

/**
 * Inline editable table for sales order lines.
 * Editable only when the order is in draft status.
 * Delegates all data mutations to parent via callbacks.
 */
export function OrderLinesTable({
  lines,
  status,
  products = [],
  isProductsLoading = false,
  onLineChange,
  onLineAdd,
  onLineRemove,
  onProductSelect,
}: OrderLinesTableProps) {
  const { t, lang } = useTranslation();
  const isEditable = status === SalesOrderStatus.DRAFT;
  const showFulfillment = status !== SalesOrderStatus.DRAFT;

  const productOptions = useMemo(() => {
    const opts = products.map(p => ({ value: p.id, label: getName(p) }));
    // Include options for products already on lines but not in the dropdown list
    for (const line of lines) {
      if (line.productId && !opts.some(o => o.value === line.productId)) {
        const label =
          getName({ nameEn: line.productNameEn, nameAr: line.productNameAr }) ||
          line.productSku ||
          line.productId;
        opts.push({ value: line.productId, label });
      }
    }
    return opts;
  }, [products, lines]);

  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      onLineChange(index, "productId", productId);
      const product = products.find(p => p.id === productId);
      if (product && onProductSelect) onProductSelect(index, product);
    },
    [products, onLineChange, onProductSelect]
  );

  const columns = useMemo((): ColumnsType<SalesOrderLine> => {
    const numberCell =
      (field: string, min: number, max?: number, precision?: number) =>
      (value: number, _: SalesOrderLine, index: number) =>
        isEditable ? (
          <InputNumber
            value={value}
            min={min}
            max={max}
            precision={precision}
            size="small"
            style={{ width: "100%" }}
            onChange={val => onLineChange(index, field, val ?? 0)}
          />
        ) : (
          <span className={field === "unitPrice" ? "font-mono" : ""}>
            {field === "unitPrice" ? num(value).toFixed(2) : `${num(value)}%`}
          </span>
        );

    const cols: ColumnsType<SalesOrderLine> = [
      { title: "#", width: 48, align: "center", render: (_, __, i) => i + 1 },
      {
        title: t("sales.line.product", lang),
        dataIndex: "productId",
        width: 220,
        render: (
          value: string | null,
          record: SalesOrderLine,
          index: number
        ) =>
          isEditable ? (
            <Select
              value={value}
              options={productOptions}
              loading={isProductsLoading}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label ?? "")
                  .toString()
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(val: string) => handleProductChange(index, val)}
              placeholder={t("sales.line.product", lang)}
              style={{ width: "100%" }}
              size="small"
            />
          ) : (
            <span>
              {getName({
                nameEn: record.productNameEn,
                nameAr: record.productNameAr,
              }) ||
                record.productSku ||
                value}
              {record.variantName ? ` (${record.variantName})` : ""}
            </span>
          ),
      },
      {
        title: t("sales.line.description", lang),
        dataIndex: "description",
        ellipsis: true,
        render: (value: string, _: SalesOrderLine, index: number) =>
          isEditable ? (
            <input
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
              value={value ?? ""}
              onChange={e => onLineChange(index, "description", e.target.value)}
            />
          ) : (
            <span>{value}</span>
          ),
      },
      {
        title: t("sales.line.quantity", lang),
        dataIndex: "quantity",
        width: 90,
        render: numberCell("quantity", 0.001),
      },
    ];

    if (showFulfillment) {
      cols.push(
        {
          title: t("sales.line.qtyDelivered", lang),
          dataIndex: "qtyDelivered",
          width: 90,
        },
        {
          title: t("sales.line.qtyInvoiced", lang),
          dataIndex: "qtyInvoiced",
          width: 90,
        }
      );
    }

    cols.push(
      {
        title: t("sales.line.unitPrice", lang),
        dataIndex: "unitPrice",
        width: 110,
        render: numberCell("unitPrice", 0, undefined, 2),
      },
      {
        title: t("sales.line.discount", lang),
        dataIndex: "discountPct",
        width: 90,
        render: numberCell("discountPct", 0, 100),
      },
      {
        title: t("sales.line.taxRate", lang),
        dataIndex: "taxRate",
        width: 90,
        render: numberCell("taxRate", 0, 100),
      },
      {
        title: t("sales.line.subtotal", lang),
        key: "subtotal",
        width: 110,
        align: "end",
        render: (_: unknown, r: SalesOrderLine) => (
          <span className="font-mono font-semibold">
            {computeSubtotal(
              r.quantity,
              r.unitPrice,
              r.discountPct,
              r.taxRate
            ).toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </span>
        ),
      }
    );

    if (isEditable) {
      cols.push({
        title: "",
        key: "actions",
        width: 48,
        render: (_: unknown, __: SalesOrderLine, index: number) => (
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onLineRemove(index)}
            aria-label={t("sales.line.removeLine", lang)}
          />
        ),
      });
    }

    return cols;
  }, [
    t,
    lang,
    isEditable,
    showFulfillment,
    productOptions,
    isProductsLoading,
    handleProductChange,
    onLineChange,
    onLineRemove,
    products,
  ]);

  return (
    <div>
      <Table
        dataSource={lines}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
      />
      {isEditable && (
        <Button
          type="link"
          icon={<PlusOutlined />}
          onClick={onLineAdd}
          className="mt-2 font-medium text-sm"
        >
          {t("sales.line.addLine", lang)}
        </Button>
      )}
    </div>
  );
}
