import { useState, useCallback } from "react";

import {
  Button,
  Card,
  Space,
  Form,
  Select,
  Input,
  InputNumber,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { usePartners } from "@/hooks/queries/usePartners";
import { useProducts } from "@/hooks/queries/useProducts";
import { useCreateSalesOrder } from "@/hooks/mutations/useSalesOrderMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/shared/constants/routes";

const DEFAULT_VAT_RATE = 15;

type OrderLine = {
  key: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
};

function newLine(): OrderLine {
  return {
    key: crypto.randomUUID(),
    productId: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    discountPct: 0,
    taxRate: DEFAULT_VAT_RATE,
  };
}

function calcLineTotal(l: OrderLine): number {
  const base = l.quantity * l.unitPrice;
  const discounted = base * (1 - l.discountPct / 100);
  const tax = discounted * (l.taxRate / 100);
  return Math.round((discounted + tax) * 100) / 100;
}

export default function SalesOrderCreatePage() {
  const { t, lang, direction } = useTranslation();
  const navigate = useNavigate();
  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const { data: partnersData } = usePartners({ isCustomer: true } as Record<
    string,
    unknown
  >);
  const { data: productsData } = useProducts();
  const { mutate: createOrder, isPending } = useCreateSalesOrder();

  const [partnerId, setPartnerId] = useState<string>("");
  const [salespersonId, setSalespersonId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState<string>("");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [lines, setLines] = useState<OrderLine[]>([newLine()]);

  const customers = partnersData?.data ?? [];
  const products = productsData?.data ?? [];

  const customerOptions = customers.map(c => ({
    label: getName(c),
    value: c.id,
  }));

  const productOptions = products.map(p => ({
    label: getName(p),
    value: p.id,
  }));

  const updateLine = useCallback(
    (key: string, field: keyof OrderLine, value: unknown) => {
      setLines(prev =>
        prev.map(l => (l.key === key ? { ...l, [field]: value } : l))
      );
    },
    []
  );

  const handleProductSelect = useCallback(
    (key: string, productId: string) => {
      const product = products.find(p => p.id === productId);
      setLines(prev =>
        prev.map(l =>
          l.key === key
            ? {
                ...l,
                productId,
                description: getName(product) ?? "",
                unitPrice: Number(product?.salePrice ?? 0),
              }
            : l
        )
      );
    },
    [products]
  );

  const addLine = useCallback(() => setLines(prev => [...prev, newLine()]), []);

  const removeLine = useCallback(
    (key: string) =>
      setLines(prev =>
        prev.length > 1 ? prev.filter(l => l.key !== key) : prev
      ),
    []
  );

  const subtotal = lines.reduce((sum, l) => {
    const base = l.quantity * l.unitPrice;
    return sum + base * (1 - l.discountPct / 100);
  }, 0);

  const taxTotal = lines.reduce((sum, l) => {
    const base = l.quantity * l.unitPrice;
    const discounted = base * (1 - l.discountPct / 100);
    return sum + discounted * (l.taxRate / 100);
  }, 0);

  const grandTotal = Math.round((subtotal + taxTotal) * 100) / 100;

  const handleSubmit = useCallback(() => {
    if (!partnerId) {
      toast.error(t("sales.error.customerRequired", lang));
      return;
    }
    if (lines.every(l => !l.productId)) {
      toast.error(t("sales.error.atLeastOneLine", lang));
      return;
    }

    createOrder(
      {
        partnerId,
        salespersonId: salespersonId || undefined,
        notes: notes || undefined,
        discountType: discountType
          ? (discountType as "percentage" | "fixed")
          : undefined,
        discountValue: discountValue || undefined,
        lines: lines
          .filter(l => l.productId)
          .map(l => ({
            productId: l.productId,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            discountPct: l.discountPct,
            taxRate: l.taxRate,
            description: l.description || undefined,
          })),
      },
      {
        onSuccess: response => {
          const record = response?.data ?? response ?? {};
          const orderNumber = record.orderNumber ?? record.id ?? "";
          toast.success(t("sales.message.created", lang));
          navigate(ROUTES.orderDetail(orderNumber));
        },
        onError: () => toast.error(t("sales.message.loadFailed", lang)),
      }
    );
  }, [
    partnerId,
    salespersonId,
    notes,
    discountType,
    discountValue,
    lines,
    createOrder,
    navigate,
    t,
    lang,
  ]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("sales.orders.breadcrumb", lang), href: ROUTES.ALL_ORDERS },
    { label: t("sales.action.create", lang) },
  ];

  return (
    <DashboardLayout
      currentPage={t("sales.action.create", lang)}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-4">
        <PageHeader
          title={t("sales.action.create", lang)}
          actions={
            <Space>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.ALL_ORDERS)}
              >
                {t("sales.action.backToList", lang)}
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isPending}
                onClick={handleSubmit}
              >
                {t("common.save", lang)}
              </Button>
            </Space>
          }
        />

        {/* Order Info */}
        <Card size="small" title={t("sales.orders.title", lang)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label={t("sales.field.customer", lang)}
              layout="vertical"
              required
              className="mb-0"
            >
              <Select
                showSearch
                value={partnerId || undefined}
                onChange={setPartnerId}
                options={customerOptions}
                filterOption={(input, opt) =>
                  (opt?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                placeholder={t("sales.field.customer", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("sales.field.salesperson", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Select
                allowClear
                value={salespersonId || undefined}
                onChange={v => setSalespersonId(v ?? "")}
                placeholder={t("sales.field.salesperson", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("sales.field.notes", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Input.TextArea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={1}
                placeholder={t("sales.field.notes", lang)}
              />
            </Form.Item>
          </div>
        </Card>

        {/* Order Lines */}
        <Card size="small" title={t("sales.line.product", lang)}>
          <Table
            dataSource={lines}
            rowKey="key"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
            columns={[
              {
                title: "#",
                width: 48,
                align: "center",
                render: (_, __, i) => i + 1,
              },
              {
                title: t("sales.line.product", lang),
                dataIndex: "productId",
                width: 220,
                render: (val: string, rec: OrderLine) => (
                  <Select
                    showSearch
                    value={val || undefined}
                    onChange={v => handleProductSelect(rec.key, v)}
                    options={productOptions}
                    size="small"
                    style={{ width: "100%" }}
                    filterOption={(input, opt) =>
                      (opt?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder={t("sales.line.product", lang)}
                  />
                ),
              },
              {
                title: t("sales.line.description", lang),
                dataIndex: "description",
                render: (val: string, rec: OrderLine) => (
                  <Input
                    value={val}
                    onChange={e =>
                      updateLine(rec.key, "description", e.target.value)
                    }
                    size="small"
                  />
                ),
              },
              {
                title: t("sales.line.quantity", lang),
                dataIndex: "quantity",
                width: 90,
                render: (val: number, rec: OrderLine) => (
                  <InputNumber
                    value={val}
                    min={0.001}
                    onChange={v => updateLine(rec.key, "quantity", v ?? 1)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("sales.line.unitPrice", lang),
                dataIndex: "unitPrice",
                width: 110,
                render: (val: number, rec: OrderLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    precision={2}
                    onChange={v => updateLine(rec.key, "unitPrice", v ?? 0)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("sales.line.discount", lang),
                dataIndex: "discountPct",
                width: 80,
                render: (val: number, rec: OrderLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    max={100}
                    onChange={v => updateLine(rec.key, "discountPct", v ?? 0)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("sales.line.taxRate", lang),
                dataIndex: "taxRate",
                width: 80,
                render: (val: number, rec: OrderLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    max={100}
                    onChange={v =>
                      updateLine(rec.key, "taxRate", v ?? DEFAULT_VAT_RATE)
                    }
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("sales.line.subtotal", lang),
                width: 110,
                align: "end" as const,
                render: (_: unknown, rec: OrderLine) => (
                  <span className="font-mono font-semibold">
                    {calcLineTotal(rec).toLocaleString("en-SA", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                ),
              },
              {
                title: "",
                width: 48,
                render: (_: unknown, rec: OrderLine) => (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeLine(rec.key)}
                    disabled={lines.length <= 1}
                  />
                ),
              },
            ]}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={addLine}
            className="mt-2"
          >
            {t("sales.line.addLine", lang)}
          </Button>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-72 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {t("sales.totals.subtotal", lang)}
                </span>
                <span className="font-mono">
                  {subtotal.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {t("sales.totals.tax", lang)}
                </span>
                <span className="font-mono">
                  {taxTotal.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="border-t pt-1 flex justify-between text-lg font-bold">
                <span>{t("sales.totals.total", lang)}</span>
                <span className="font-mono">
                  {grandTotal.toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
