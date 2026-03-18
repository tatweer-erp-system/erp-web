/**
 * Pricelist create page with form and inline items table.
 * Default export for lazy loading via React.lazy().
 */

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
  DatePicker,
  Switch,
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
import { useProducts } from "@/hooks/queries/useProducts";
import {
  useCreatePricelist,
  useCreatePricelistItem,
} from "@/hooks/mutations/usePricelistMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ROUTES } from "@/shared/constants/routes";
import {
  PricelistDiscountPolicy,
  PricelistApplyOn,
  PricelistComputation,
} from "@/constants/enums";

type ItemLine = {
  key: string;
  applyOn: string;
  productId: string;
  categoryId: string;
  minQty: number;
  computation: string;
  price: number;
  discountPct: number;
  sequence: number;
};

function newItemLine(seq: number): ItemLine {
  return {
    key: crypto.randomUUID(),
    applyOn: PricelistApplyOn.ALL,
    productId: "",
    categoryId: "",
    minQty: 1,
    computation: PricelistComputation.FIXED,
    price: 0,
    discountPct: 0,
    sequence: seq,
  };
}

export default function PricelistCreatePage() {
  const { t, lang, direction } = useTranslation();
  const navigate = useNavigate();
  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const { data: productsData } = useProducts();
  const { mutate: createPricelist, isPending } = useCreatePricelist();
  const createItemMut = useCreatePricelistItem();

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [discountPolicy, setDiscountPolicy] = useState<string>(
    PricelistDiscountPolicy.INCLUDE_IN_PRICE
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<ItemLine[]>([newItemLine(10)]);

  const products = productsData?.data ?? [];

  const productOptions = products.map(p => ({
    label: getName(p),
    value: p.id,
  }));

  const discountPolicyOptions = [
    {
      label: t("pricelists.discountPolicy.includeInPrice", lang),
      value: PricelistDiscountPolicy.INCLUDE_IN_PRICE,
    },
    {
      label: t("pricelists.discountPolicy.discountOnSale", lang),
      value: PricelistDiscountPolicy.DISCOUNT_ON_SALE,
    },
  ];

  const applyOnOptions = [
    {
      label: t("pricelists.applyOn.all", lang),
      value: PricelistApplyOn.ALL,
    },
    {
      label: t("pricelists.applyOn.category", lang),
      value: PricelistApplyOn.CATEGORY,
    },
    {
      label: t("pricelists.applyOn.product", lang),
      value: PricelistApplyOn.PRODUCT,
    },
  ];

  const computationOptions = [
    {
      label: t("pricelists.computation.fixed", lang),
      value: PricelistComputation.FIXED,
    },
    {
      label: t("pricelists.computation.percentage", lang),
      value: PricelistComputation.PERCENTAGE,
    },
    {
      label: t("pricelists.computation.formula", lang),
      value: PricelistComputation.FORMULA,
    },
  ];

  const updateItem = useCallback(
    (key: string, field: keyof ItemLine, value: unknown) => {
      setItems(prev =>
        prev.map(item =>
          item.key === key ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  const addItem = useCallback(
    () => setItems(prev => [...prev, newItemLine((prev.length + 1) * 10)]),
    []
  );

  const removeItem = useCallback(
    (key: string) =>
      setItems(prev =>
        prev.length > 1 ? prev.filter(item => item.key !== key) : prev
      ),
    []
  );

  const handleSubmit = useCallback(() => {
    if (!nameEn && !nameAr) {
      toast.error(t("common.fill_required_fields", lang));
      return;
    }

    const resolvedNameEn = nameEn || nameAr;
    const resolvedNameAr = nameAr || nameEn;

    const validItems = items.filter(
      item =>
        item.applyOn === PricelistApplyOn.ALL ||
        (item.applyOn === PricelistApplyOn.PRODUCT && item.productId) ||
        (item.applyOn === PricelistApplyOn.CATEGORY && item.categoryId)
    );

    createPricelist(
      {
        nameEn: resolvedNameEn,
        nameAr: resolvedNameAr,
        discountPolicy:
          discountPolicy as (typeof PricelistDiscountPolicy)[keyof typeof PricelistDiscountPolicy],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive,
      },
      {
        onSuccess: async response => {
          const record = response?.data ?? response ?? {};
          const newId = (record as { id?: string }).id ?? "";
          toast.success(t("pricelists.message.created", lang));

          // Create items sequentially after pricelist creation
          if (newId && validItems.length > 0) {
            for (const item of validItems) {
              try {
                await createItemMut.mutateAsync({
                  pricelistId: newId,
                  dto: {
                    applyOn:
                      item.applyOn as (typeof PricelistApplyOn)[keyof typeof PricelistApplyOn],
                    productId: item.productId || undefined,
                    categoryId: item.categoryId || undefined,
                    minQty: item.minQty,
                    computation:
                      item.computation as (typeof PricelistComputation)[keyof typeof PricelistComputation],
                    price:
                      item.computation === PricelistComputation.FIXED
                        ? item.price
                        : undefined,
                    discountPct:
                      item.computation === PricelistComputation.PERCENTAGE
                        ? item.discountPct
                        : undefined,
                    sequence: item.sequence,
                  },
                });
              } catch {
                // Continue creating remaining items even if one fails
              }
            }
          }

          if (newId) {
            navigate(ROUTES.pricelistDetail(newId));
          } else {
            navigate(ROUTES.PRICE_LISTS);
          }
        },
        onError: () => toast.error(t("pricelists.message.loadFailed", lang)),
      }
    );
  }, [
    nameEn,
    nameAr,
    discountPolicy,
    startDate,
    endDate,
    isActive,
    items,
    createPricelist,
    createItemMut,
    navigate,
    t,
    lang,
  ]);

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("pricelists.title", lang), href: ROUTES.PRICE_LISTS },
    { label: t("pricelists.create", lang) },
  ];

  return (
    <DashboardLayout
      currentPage={t("pricelists.create", lang)}
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-4">
        <PageHeader
          title={t("pricelists.create", lang)}
          actions={
            <Space>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.PRICE_LISTS)}
              >
                {t("pricelists.backToList", lang)}
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

        {/* Pricelist Info */}
        <Card size="small" title={t("pricelists.detail", lang)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label={t("pricelists.field.nameEn", lang)}
              layout="vertical"
              required
              className="mb-0"
            >
              <Input
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder={t("pricelists.field.nameEn", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("pricelists.field.nameAr", lang)}
              layout="vertical"
              required
              className="mb-0"
            >
              <Input
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder={t("pricelists.field.nameAr", lang)}
                dir="rtl"
              />
            </Form.Item>
            <Form.Item
              label={t("pricelists.field.discountPolicy", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Select
                value={discountPolicy}
                onChange={setDiscountPolicy}
                options={discountPolicyOptions}
              />
            </Form.Item>
            <Form.Item
              label={t("pricelists.field.startDate", lang)}
              layout="vertical"
              className="mb-0"
            >
              <DatePicker
                style={{ width: "100%" }}
                onChange={(_, dateStr) =>
                  setStartDate(typeof dateStr === "string" ? dateStr : "")
                }
                placeholder={t("pricelists.field.startDate", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("pricelists.field.endDate", lang)}
              layout="vertical"
              className="mb-0"
            >
              <DatePicker
                style={{ width: "100%" }}
                onChange={(_, dateStr) =>
                  setEndDate(typeof dateStr === "string" ? dateStr : "")
                }
                placeholder={t("pricelists.field.endDate", lang)}
              />
            </Form.Item>
            <Form.Item
              label={t("pricelists.field.isActive", lang)}
              layout="vertical"
              className="mb-0"
            >
              <Switch checked={isActive} onChange={setIsActive} />
            </Form.Item>
          </div>
        </Card>

        {/* Pricelist Items */}
        <Card size="small" title={t("pricelists.items", lang)}>
          <Table
            dataSource={items}
            rowKey="key"
            pagination={false}
            size="small"
            scroll={{ x: 900 }}
            columns={[
              {
                title: "#",
                width: 48,
                align: "center",
                render: (_, __, i) => i + 1,
              },
              {
                title: t("pricelists.field.applyOn", lang),
                dataIndex: "applyOn",
                width: 160,
                render: (val: string, rec: ItemLine) => (
                  <Select
                    value={val}
                    onChange={v => updateItem(rec.key, "applyOn", v)}
                    options={applyOnOptions}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("pricelists.field.product", lang),
                dataIndex: "productId",
                width: 200,
                render: (val: string, rec: ItemLine) => (
                  <Select
                    showSearch
                    allowClear
                    value={val || undefined}
                    onChange={v => updateItem(rec.key, "productId", v ?? "")}
                    options={productOptions}
                    size="small"
                    style={{ width: "100%" }}
                    disabled={rec.applyOn !== PricelistApplyOn.PRODUCT}
                    filterOption={(input, opt) =>
                      (opt?.label ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    placeholder={t("pricelists.field.product", lang)}
                  />
                ),
              },
              {
                title: t("pricelists.field.minQty", lang),
                dataIndex: "minQty",
                width: 100,
                render: (val: number, rec: ItemLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    onChange={v => updateItem(rec.key, "minQty", v ?? 1)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("pricelists.field.computation", lang),
                dataIndex: "computation",
                width: 180,
                render: (val: string, rec: ItemLine) => (
                  <Select
                    value={val}
                    onChange={v => updateItem(rec.key, "computation", v)}
                    options={computationOptions}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: t("pricelists.field.price", lang),
                dataIndex: "price",
                width: 110,
                render: (val: number, rec: ItemLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    precision={2}
                    onChange={v => updateItem(rec.key, "price", v ?? 0)}
                    size="small"
                    style={{ width: "100%" }}
                    disabled={rec.computation !== PricelistComputation.FIXED}
                  />
                ),
              },
              {
                title: t("pricelists.field.discountPct", lang),
                dataIndex: "discountPct",
                width: 100,
                render: (val: number, rec: ItemLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    max={100}
                    onChange={v => updateItem(rec.key, "discountPct", v ?? 0)}
                    size="small"
                    style={{ width: "100%" }}
                    disabled={
                      rec.computation !== PricelistComputation.PERCENTAGE
                    }
                  />
                ),
              },
              {
                title: t("pricelists.field.sequence", lang),
                dataIndex: "sequence",
                width: 90,
                render: (val: number, rec: ItemLine) => (
                  <InputNumber
                    value={val}
                    min={0}
                    onChange={v => updateItem(rec.key, "sequence", v ?? 0)}
                    size="small"
                    style={{ width: "100%" }}
                  />
                ),
              },
              {
                title: "",
                width: 48,
                render: (_: unknown, rec: ItemLine) => (
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeItem(rec.key)}
                    disabled={items.length <= 1}
                  />
                ),
              },
            ]}
          />
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={addItem}
            className="mt-2"
          >
            {t("pricelists.addItem", lang)}
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
}
