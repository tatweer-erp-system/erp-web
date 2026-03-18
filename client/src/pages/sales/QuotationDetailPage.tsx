import { useState, useMemo, useCallback } from "react";

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
} from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useQuotation } from "@/hooks/queries/useSalesOrders";
import {
  useConfirmSalesOrder,
  useDeleteSalesOrder,
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

/**
 * Quotation detail page (structurally similar to SalesOrderDetailPage).
 * Quotations are draft sales orders, so tabs are limited to Lines + History.
 * Primary action is "Confirm as Sales Order".
 */
export default function QuotationDetailPage() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useQuotation(id);

  const confirmMutation = useConfirmSalesOrder();
  const deleteMutation = useDeleteSalesOrder();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

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
                  <Button icon={<EditOutlined />}>
                    {t("sales.action.edit", lang)}
                  </Button>
                  <Button icon={<MailOutlined />}>
                    {t("sales.quotation.send", lang)}
                  </Button>
                </>
              )}
              <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
                <Button icon={<EllipsisOutlined />} />
              </Dropdown>
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
              <Descriptions.Item label={t("sales.field.notes", lang)} span={3}>
                {order.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
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
