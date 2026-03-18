/**
 * Pricelist detail page displaying pricelist info and items.
 * Supports inline edit mode — toggle between read-only and form inputs.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect } from "react";

import {
  Button,
  Tabs,
  Skeleton,
  Result,
  Card,
  Space,
  Tag,
  Table,
  Descriptions,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { usePricelist, usePricelistItems } from "@/hooks/queries/usePricelists";
import {
  useDeletePricelist,
  useUpdatePricelist,
  useDeletePricelistItem,
  useCreatePricelistItem,
} from "@/hooks/mutations/usePricelistMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ActionDropdown } from "@/components/common/ActionDropdown";
import {
  PricelistDiscountPolicy,
  PricelistApplyOn,
  PricelistComputation,
} from "@/constants/enums";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import type {
  Pricelist,
  PricelistItem,
  UpdatePricelistInput,
} from "@/types/modules/pricelists";

const { Text } = Typography;

// ── Edit form state ──────────────────────────────────────────────────────

type EditFormState = {
  nameEn: string;
  nameAr: string;
  discountPolicy: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

function buildFormState(pricelist: Pricelist): EditFormState {
  return {
    nameEn: pricelist.nameEn ?? "",
    nameAr: pricelist.nameAr ?? "",
    discountPolicy: pricelist.discountPolicy,
    startDate: pricelist.startDate ?? "",
    endDate: pricelist.endDate ?? "",
    isActive: pricelist.isActive,
  };
}

export default function PricelistDetailPage() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: pricelist, isLoading, isError } = usePricelist(id);
  const { data: items, isLoading: itemsLoading } = usePricelistItems(id);
  const deleteMutation = useDeletePricelist();
  const updateMutation = useUpdatePricelist();
  const deleteItemMutation = useDeletePricelistItem();
  const createItemMutation = useCreatePricelistItem();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState>(() =>
    pricelist ? buildFormState(pricelist) : ({} as EditFormState)
  );

  // Reset form when pricelist data loads or changes
  useEffect(() => {
    if (pricelist && !isEditing) {
      setForm(buildFormState(pricelist));
    }
  }, [pricelist, isEditing]);

  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("pricelists.message.deleted", lang));
        navigate(ROUTES.PRICE_LISTS);
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("pricelists.message.loadFailed", lang)),
    });
  }, [id, deleteMutation, t, lang, navigate]);

  const handleDeleteItem = useCallback(() => {
    if (!deleteItemId || !id) return;
    deleteItemMutation.mutate(
      { itemId: deleteItemId, pricelistId: id },
      {
        onSuccess: () => {
          toast.success(t("pricelists.message.itemDeleted", lang));
          setDeleteItemId(null);
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? t("pricelists.message.loadFailed", lang)),
      }
    );
  }, [deleteItemId, id, deleteItemMutation, t, lang]);

  const handleAddItem = useCallback(() => {
    if (!id) return;
    createItemMutation.mutate(
      {
        pricelistId: id,
        dto: {
          applyOn: PricelistApplyOn.ALL,
          minQty: 1,
          computation: PricelistComputation.FIXED,
          price: 0,
          sequence: 10,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("pricelists.message.itemCreated", lang));
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? t("pricelists.message.loadFailed", lang)),
      }
    );
  }, [id, createItemMutation, t, lang]);

  const handleEdit = useCallback(() => {
    if (!pricelist) return;
    setForm(buildFormState(pricelist));
    setIsEditing(true);
  }, [pricelist]);

  const handleCancelEdit = useCallback(() => {
    if (pricelist) setForm(buildFormState(pricelist));
    setIsEditing(false);
  }, [pricelist]);

  const handleSave = useCallback(() => {
    if (!id || !pricelist) return;

    if (!form.nameEn.trim() && !form.nameAr.trim()) {
      toast.error(t("common.fill_required_fields", lang));
      return;
    }

    const dto: UpdatePricelistInput = {
      version: pricelist.version,
      nameEn: form.nameEn.trim() || form.nameAr.trim(),
      nameAr: form.nameAr.trim() || form.nameEn.trim(),
      discountPolicy:
        form.discountPolicy as (typeof PricelistDiscountPolicy)[keyof typeof PricelistDiscountPolicy],
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      isActive: form.isActive,
    };

    updateMutation.mutate(
      { id, dto },
      {
        onSuccess: () => {
          toast.success(t("pricelists.message.updated", lang));
          setIsEditing(false);
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? t("pricelists.message.loadFailed", lang)),
      }
    );
  }, [id, pricelist, form, updateMutation, t, lang]);

  const updateField = useCallback(
    <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const breadcrumbs = useMemo(
    () => [
      { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
      { label: t("pricelists.title", lang), href: ROUTES.PRICE_LISTS },
      { label: pricelist ? getName(pricelist) : "..." },
    ],
    [t, lang, pricelist]
  );

  const itemColumns = useItemColumns(t, lang, setDeleteItemId);

  if (isLoading) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Input active block style={{ height: 48 }} />
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !pricelist) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <Result
          status="404"
          title="404"
          subTitle={t("pricelists.message.loadFailed", lang)}
          extra={
            <Button type="primary" onClick={() => navigate(ROUTES.PRICE_LISTS)}>
              {t("pricelists.backToList", lang)}
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage={getName(pricelist)} breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <PageHeader
          title={getName(pricelist)}
          subtitle={dayjs(pricelist.createdAt).format("DD MMM YYYY")}
          actions={
            <Space wrap>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.PRICE_LISTS)}
              >
                {t("pricelists.backToList", lang)}
              </Button>
              {isEditing ? (
                <>
                  <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                    {t("common.cancel", lang)}
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={updateMutation.isPending}
                    onClick={handleSave}
                  >
                    {t("common.save", lang)}
                  </Button>
                </>
              ) : (
                <>
                  <Button icon={<EditOutlined />} onClick={handleEdit}>
                    {t("pricelists.edit", lang)}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    {t("common.delete", lang)}
                  </Button>
                </>
              )}
            </Space>
          }
        />

        <Tabs
          type="line"
          defaultActiveKey="details"
          items={[
            {
              key: "details",
              label: t("pricelists.detail", lang),
              children: (
                <DetailsTab
                  pricelist={pricelist}
                  t={t}
                  lang={lang}
                  isEditing={isEditing}
                  form={form}
                  updateField={updateField}
                />
              ),
            },
            {
              key: "items",
              label: t("pricelists.items", lang),
              children: (
                <ItemsTab
                  items={items ?? []}
                  isLoading={itemsLoading}
                  columns={itemColumns}
                  onAddItem={handleAddItem}
                  isAdding={createItemMutation.isPending}
                  t={t}
                  lang={lang}
                />
              ),
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={v => !v && setIsDeleteOpen(false)}
        title={t("pricelists.message.deleteConfirm", lang)}
        description={t("common.action_cannot_be_undone", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteItemId}
        onOpenChange={v => !v && setDeleteItemId(null)}
        title={t("pricelists.message.deleteItemConfirm", lang)}
        description={t("common.action_cannot_be_undone", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDeleteItem}
        variant="danger"
      />
    </DashboardLayout>
  );
}

// ── Discount policy label helper ──────────────────────────────────────────────

function discountPolicyLabel(
  policy: string,
  t: (k: string, l: string) => string,
  lang: string
): string {
  switch (policy) {
    case PricelistDiscountPolicy.INCLUDE_IN_PRICE:
      return t("pricelists.discountPolicy.includeInPrice", lang);
    case PricelistDiscountPolicy.DISCOUNT_ON_SALE:
      return t("pricelists.discountPolicy.discountOnSale", lang);
    default:
      return policy;
  }
}

// ── Details Tab ──────────────────────────────────────────────────────────────

type DetailsTabProps = {
  pricelist: Pricelist;
  t: (k: string, l: string) => string;
  lang: string;
  isEditing: boolean;
  form: EditFormState;
  updateField: <K extends keyof EditFormState>(
    key: K,
    value: EditFormState[K]
  ) => void;
};

function DetailsTab({
  pricelist,
  t,
  lang,
  isEditing,
  form,
  updateField,
}: DetailsTabProps) {
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

  if (!isEditing) {
    return (
      <Card>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} bordered size="small">
          <Descriptions.Item label={t("pricelists.field.nameEn", lang)}>
            {pricelist.nameEn}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.nameAr", lang)}>
            {pricelist.nameAr}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.currency", lang)}>
            {pricelist.currencyCode
              ? `${pricelist.currencyCode}${pricelist.currencySymbol ? ` (${pricelist.currencySymbol})` : ""}`
              : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.discountPolicy", lang)}>
            {discountPolicyLabel(pricelist.discountPolicy, t, lang)}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.startDate", lang)}>
            {pricelist.startDate
              ? dayjs(pricelist.startDate).format("DD MMM YYYY")
              : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.endDate", lang)}>
            {pricelist.endDate
              ? dayjs(pricelist.endDate).format("DD MMM YYYY")
              : "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.field.isActive", lang)}>
            {pricelist.isActive ? (
              <Tag color="success">{t("pricelists.stats.active", lang)}</Tag>
            ) : (
              <Tag color="default">{t("pricelists.stats.inactive", lang)}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.column.createdBy", lang)}>
            {getName({
              nameEn: pricelist.createdByNameEn,
              nameAr: pricelist.createdByNameAr,
            }) || "--"}
          </Descriptions.Item>
          <Descriptions.Item label={t("pricelists.column.createdAt", lang)}>
            {dayjs(pricelist.createdAt).format("DD MMM YYYY HH:mm")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Form.Item
          label={t("pricelists.field.nameEn", lang)}
          layout="vertical"
          required
          className="mb-0"
        >
          <Input
            value={form.nameEn}
            onChange={e => updateField("nameEn", e.target.value)}
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
            value={form.nameAr}
            onChange={e => updateField("nameAr", e.target.value)}
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
            value={form.discountPolicy}
            onChange={v => updateField("discountPolicy", v)}
            options={discountPolicyOptions}
          />
        </Form.Item>
        <Form.Item
          label={t("pricelists.field.startDate", lang)}
          layout="vertical"
          className="mb-0"
        >
          <DatePicker
            value={form.startDate ? dayjs(form.startDate) : null}
            style={{ width: "100%" }}
            onChange={date =>
              updateField("startDate", date ? date.format("YYYY-MM-DD") : "")
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
            value={form.endDate ? dayjs(form.endDate) : null}
            style={{ width: "100%" }}
            onChange={date =>
              updateField("endDate", date ? date.format("YYYY-MM-DD") : "")
            }
            placeholder={t("pricelists.field.endDate", lang)}
          />
        </Form.Item>
        <Form.Item
          label={t("pricelists.field.isActive", lang)}
          layout="vertical"
          className="mb-0"
        >
          <Switch
            checked={form.isActive}
            onChange={v => updateField("isActive", v)}
          />
        </Form.Item>
      </div>
    </Card>
  );
}

// ── Apply On label helper ─────────────────────────────────────────────────────

function applyOnLabel(
  applyOn: string,
  t: (k: string, l: string) => string,
  lang: string
): string {
  switch (applyOn) {
    case PricelistApplyOn.ALL:
      return t("pricelists.applyOn.all", lang);
    case PricelistApplyOn.CATEGORY:
      return t("pricelists.applyOn.category", lang);
    case PricelistApplyOn.PRODUCT:
      return t("pricelists.applyOn.product", lang);
    default:
      return applyOn;
  }
}

function computationLabel(
  computation: string,
  t: (k: string, l: string) => string,
  lang: string
): string {
  switch (computation) {
    case PricelistComputation.FIXED:
      return t("pricelists.computation.fixed", lang);
    case PricelistComputation.PERCENTAGE:
      return t("pricelists.computation.percentage", lang);
    case PricelistComputation.FORMULA:
      return t("pricelists.computation.formula", lang);
    default:
      return computation;
  }
}

// ── Item columns hook ─────────────────────────────────────────────────────────

function useItemColumns(
  t: (k: string, l: string) => string,
  lang: string,
  setDeleteItemId: (id: string | null) => void
): TableColumnsType<PricelistItem> {
  return useMemo(
    () => [
      {
        title: "#",
        width: 48,
        align: "center" as const,
        render: (_: unknown, __: PricelistItem, i: number) => i + 1,
      },
      {
        title: t("pricelists.column.applyOn", lang),
        dataIndex: "applyOn",
        width: 140,
        sorter: false,
        render: (v: string) => applyOnLabel(v, t, lang),
      },
      {
        title: t("pricelists.column.product", lang),
        dataIndex: "productNameEn",
        width: 180,
        sorter: false,
        ellipsis: true,
        render: (_: unknown, r: PricelistItem) =>
          getName({
            nameEn: r.productNameEn,
            nameAr: r.productNameAr,
          }) || "--",
      },
      {
        title: t("pricelists.column.category", lang),
        dataIndex: "categoryNameEn",
        width: 160,
        sorter: false,
        ellipsis: true,
        render: (_: unknown, r: PricelistItem) =>
          getName({
            nameEn: r.categoryNameEn,
            nameAr: r.categoryNameAr,
          }) || "--",
      },
      {
        title: t("pricelists.column.minQty", lang),
        dataIndex: "minQty",
        width: 100,
        sorter: false,
        align: "end" as const,
        render: (v: number) => Number(v),
      },
      {
        title: t("pricelists.column.computation", lang),
        dataIndex: "computation",
        width: 160,
        sorter: false,
        render: (v: string) => computationLabel(v, t, lang),
      },
      {
        title: t("pricelists.column.price", lang),
        dataIndex: "price",
        width: 120,
        sorter: false,
        align: "end" as const,
        render: (v: number | null) =>
          v !== null
            ? Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })
            : "--",
      },
      {
        title: t("pricelists.column.discountPct", lang),
        dataIndex: "discountPct",
        width: 110,
        sorter: false,
        align: "end" as const,
        render: (v: number | null) => (v !== null ? `${Number(v)}%` : "--"),
      },
      {
        title: t("pricelists.column.sequence", lang),
        dataIndex: "sequence",
        width: 90,
        sorter: false,
        align: "center" as const,
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: PricelistItem) => (
          <ActionDropdown
            items={[
              {
                key: "delete",
                label: t("common.delete", lang),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => setDeleteItemId(rec.id),
              },
            ]}
          />
        ),
      },
    ],
    [t, lang, setDeleteItemId]
  );
}

// ── Items Tab ─────────────────────────────────────────────────────────────────

function ItemsTab({
  items,
  isLoading,
  columns,
  onAddItem,
  isAdding,
  t,
  lang,
}: {
  items: PricelistItem[];
  isLoading: boolean;
  columns: TableColumnsType<PricelistItem>;
  onAddItem: () => void;
  isAdding: boolean;
  t: (k: string, l: string) => string;
  lang: string;
}) {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Text strong>{t("pricelists.items", lang)}</Text>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={isAdding}
          onClick={onAddItem}
        >
          {t("pricelists.addItem", lang)}
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={isLoading}
        size="small"
        scroll={{ x: "max-content" }}
        pagination={false}
        locale={{ emptyText: t("pricelists.message.noItems", lang) }}
      />
    </Card>
  );
}
