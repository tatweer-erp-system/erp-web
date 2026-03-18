/**
 * Quotation detail page (structurally similar to SalesOrderDetailPage).
 * Supports inline edit mode for draft quotation header fields.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect } from "react";

import {
  Card,
  Button,
  Tabs,
  Skeleton,
  Result,
  Dropdown,
  Space,
  Descriptions,
  Steps,
  Form,
  Select,
  Input,
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EllipsisOutlined,
  PrinterOutlined,
  CopyOutlined,
  FileTextOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useQuotation } from "@/hooks/queries/useSalesOrders";
import { useCustomersDropdown } from "@/hooks/queries/usePartners";
import {
  useConfirmSalesOrder,
  useDeleteSalesOrder,
  useUpdateSalesOrder,
} from "@/hooks/mutations/useSalesOrderMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SalesStatusBadge } from "@/components/sales/SalesStatusBadge";
import { CopyableCode } from "@/components/common/CopyableCode";
import { getName } from "@/shared/utils/getName.util";
import {
  LinesTabContent,
  HistoryTabContent,
} from "@/components/sales/SalesOrderDetailTabs";
import { SalesOrderStatus } from "@/constants/enums";
import { ROUTES } from "@/shared/constants/routes";
import type { SalesOrder, UpdateSalesOrderInput } from "@/types/modules/sales";

// ── Edit form state ──────────────────────────────────────────────────────

type EditFormState = {
  partnerId: string;
  salespersonId: string;
  notes: string;
};

function buildFormState(order: SalesOrder): EditFormState {
  return {
    partnerId: order.partnerId ?? "",
    salespersonId: order.salespersonId ?? "",
    notes: order.notes ?? "",
  };
}

export default function QuotationDetailPage() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuotation(id);
  const { data: customersDropdown } = useCustomersDropdown();

  const confirmMutation = useConfirmSalesOrder();
  const deleteMutation = useDeleteSalesOrder();
  const updateMutation = useUpdateSalesOrder();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState>(() =>
    order ? buildFormState(order) : ({} as EditFormState)
  );

  // Reset form when order data loads or changes
  useEffect(() => {
    if (order && !isEditing) {
      setForm(buildFormState(order));
    }
  }, [order, isEditing]);

  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const customerOptions = useMemo(
    () =>
      (customersDropdown ?? []).map(
        (c: { id: string; nameEn: string; nameAr: string }) => ({
          label: getName(c),
          value: c.id,
        })
      ),
    [customersDropdown]
  );

  const handleConfirm = useCallback(() => {
    if (!id) return;
    confirmMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("sales.message.confirmed", lang));
        navigate(ROUTES.orderDetail(id));
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, confirmMutation, t, lang, navigate]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("sales.message.deleted", lang));
        navigate(ROUTES.QUOTATIONS);
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, deleteMutation, t, lang, navigate]);

  const handleEdit = useCallback(() => {
    if (!order) return;
    setForm(buildFormState(order));
    setIsEditing(true);
  }, [order]);

  const handleCancelEdit = useCallback(() => {
    if (order) setForm(buildFormState(order));
    setIsEditing(false);
  }, [order]);

  const handleSave = useCallback(() => {
    if (!id || !order) return;

    const dto: UpdateSalesOrderInput = {
      version: order.version,
      partnerId: form.partnerId || undefined,
      salespersonId: form.salespersonId || undefined,
      notes: form.notes || undefined,
    };

    updateMutation.mutate(
      { id, dto },
      {
        onSuccess: () => {
          toast.success(t("sales.message.updated", lang));
          setIsEditing(false);
        },
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
      }
    );
  }, [id, order, form, updateMutation, t, lang]);

  const updateField = useCallback(
    <K extends keyof EditFormState>(key: K, value: EditFormState[K]) => {
      setForm(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  const breadcrumbs = useMemo(
    () => [
      { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
      {
        label: t("sales.quotations.breadcrumb", lang),
        href: ROUTES.QUOTATIONS,
      },
      { label: order?.orderNumber ?? "..." },
    ],
    [t, lang, order?.orderNumber]
  );

  if (isLoading) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <div className="space-y-4">
          <Skeleton active paragraph={{ rows: 1 }} />
          <Skeleton.Input active block style={{ height: 48 }} />
          <Card>
            <Skeleton active paragraph={{ rows: 4 }} />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !order) {
    return (
      <DashboardLayout currentPage="" breadcrumbs={[]}>
        <Result
          status="404"
          title="404"
          subTitle={t("sales.message.loadFailed", lang)}
          extra={
            <Button type="primary" onClick={() => navigate(ROUTES.QUOTATIONS)}>
              {t("sales.action.backToList", lang)}
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  const isDraft = order.status === SalesOrderStatus.DRAFT;
  const stepIndex = isDraft ? 0 : 1;

  const moreMenuItems = [
    {
      key: "duplicate",
      label: t("sales.action.duplicate", lang),
      icon: <CopyOutlined />,
    },
    {
      key: "print",
      label: t("sales.action.print", lang),
      icon: <PrinterOutlined />,
    },
    {
      key: "exportPdf",
      label: t("sales.action.exportPdf", lang),
      icon: <FileTextOutlined />,
    },
    { type: "divider" as const },
    {
      key: "delete",
      label: t("sales.action.delete", lang),
      icon: <DeleteOutlined />,
      danger: true,
      disabled: !isDraft,
      onClick: () => setIsDeleteOpen(true),
    },
  ];

  return (
    <DashboardLayout currentPage={order.orderNumber} breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <PageHeader
          title={order.orderNumber}
          subtitle={`${t("sales.quotation.title", lang)} - ${dayjs(order.createdAt).format("DD MMM YYYY")}`}
          actions={
            <Space wrap>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.QUOTATIONS)}
              >
                {t("sales.action.backToList", lang)}
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
                  {isDraft && (
                    <>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => setIsConfirmOpen(true)}
                        loading={confirmMutation.isPending}
                      >
                        {t("sales.quotation.convertToOrder", lang)}
                      </Button>
                      <Button icon={<EditOutlined />} onClick={handleEdit}>
                        {t("sales.action.edit", lang)}
                      </Button>
                      <Button icon={<MailOutlined />}>
                        {t("sales.quotation.send", lang)}
                      </Button>
                    </>
                  )}
                  <Dropdown
                    menu={{ items: moreMenuItems }}
                    placement="bottomRight"
                  >
                    <Button icon={<EllipsisOutlined />} />
                  </Dropdown>
                </>
              )}
            </Space>
          }
        />

        <div className="mb-6">
          <Steps
            current={stepIndex}
            size="small"
            items={[
              { title: t("sales.status.draft", lang) },
              { title: t("sales.status.confirmed", lang) },
            ]}
          />
        </div>

        <Card size="small">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xl">
              <CopyableCode value={order.orderNumber} />
            </span>
            <SalesStatusBadge status={order.status} type="order" />
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Form.Item
                label={t("sales.field.customer", lang)}
                layout="vertical"
                required
                className="mb-0"
              >
                <Select
                  showSearch
                  value={form.partnerId || undefined}
                  onChange={v => updateField("partnerId", v ?? "")}
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
                  value={form.salespersonId || undefined}
                  onChange={v => updateField("salespersonId", v ?? "")}
                  placeholder={t("sales.field.salesperson", lang)}
                />
              </Form.Item>
              <Form.Item
                label={t("sales.field.pricelist", lang)}
                layout="vertical"
                className="mb-0"
              >
                <Select
                  disabled
                  value={order.pricelistId ?? undefined}
                  placeholder={t("sales.field.pricelist", lang)}
                />
              </Form.Item>
              <Form.Item
                label={t("sales.field.currency", lang)}
                layout="vertical"
                className="mb-0"
              >
                <Input disabled value={order.currencyCode ?? "SAR"} />
              </Form.Item>
              <Form.Item
                label={t("sales.field.notes", lang)}
                layout="vertical"
                className="mb-0"
              >
                <Input.TextArea
                  value={form.notes}
                  onChange={e => updateField("notes", e.target.value)}
                  rows={1}
                  placeholder={t("sales.field.notes", lang)}
                />
              </Form.Item>
            </div>
          ) : (
            <Descriptions
              column={{ xs: 1, sm: 2, md: 3 }}
              size="small"
              colon={false}
            >
              <Descriptions.Item label={t("sales.field.customer", lang)}>
                {getName({
                  nameEn: order.partnerNameEn,
                  nameAr: order.partnerNameAr,
                }) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={t("sales.field.orderDate", lang)}>
                {dayjs(order.createdAt).format("DD MMM YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label={t("sales.field.salesperson", lang)}>
                {getName({
                  nameEn: order.salespersonNameEn,
                  nameAr: order.salespersonNameAr,
                }) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={t("sales.field.pricelist", lang)}>
                {getName({
                  nameEn: order.pricelistNameEn,
                  nameAr: order.pricelistNameAr,
                }) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label={t("sales.field.currency", lang)}>
                {order.currencyCode ?? "SAR"}
              </Descriptions.Item>
              {order.notes && (
                <Descriptions.Item
                  label={t("sales.field.notes", lang)}
                  span={3}
                >
                  {order.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Card>

        <Tabs
          type="line"
          defaultActiveKey="lines"
          items={[
            {
              key: "lines",
              label: t("sales.line.product", lang),
              children: <LinesTabContent order={order} />,
            },
            {
              key: "history",
              label: t("common.history", lang),
              children: <HistoryTabContent order={order} />,
            },
          ]}
        />
      </div>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={v => !v && setIsConfirmOpen(false)}
        title={t("sales.quotation.convertToOrder", lang)}
        description={t("sales.quotation.convertConfirm", lang)}
        confirmLabel={t("sales.quotation.convertToOrder", lang)}
        onConfirm={handleConfirm}
        variant="warning"
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={v => !v && setIsDeleteOpen(false)}
        title={t("sales.message.deleteConfirm", lang)}
        description={t("sales.message.deleteConfirmNote", lang)}
        confirmLabel={t("sales.action.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />
    </DashboardLayout>
  );
}
