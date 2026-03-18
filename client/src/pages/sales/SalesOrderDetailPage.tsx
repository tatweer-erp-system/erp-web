import { useState, useMemo, useCallback } from "react";

import { Button, Tabs, Skeleton, Result, Card, Space } from "antd";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { useSalesOrder } from "@/hooks/queries/useSalesOrders";
import {
  useConfirmSalesOrder,
  useCancelSalesOrder,
  useDeleteSalesOrder,
  useCreateInvoiceFromSO,
  useCreateDeliveryFromSO,
} from "@/hooks/mutations/useSalesOrderMutations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SalesOrderStatusBar } from "@/components/sales/SalesOrderStatusBar";
import { SalesOrderDetailActions } from "@/components/sales/SalesOrderDetailActions";
import {
  SalesOrderInfoCard,
  LinesTabContent,
  InvoicesTabContent,
  DeliveriesTabContent,
  DownPaymentsTabContent,
  HistoryTabContent,
} from "@/components/sales/SalesOrderDetailTabs";
import { CreateInvoiceModal } from "@/components/sales/CreateInvoiceModal";
import { SalesOrderStatus, SalesOrderInvoiceStatus } from "@/constants/enums";
import { ROUTES } from "@/shared/constants/routes";

/**
 * Sales Order detail page displaying order info, lines, invoices,
 * deliveries, down payments, and activity history.
 * Actions are conditionally rendered based on the order status.
 */
export default function SalesOrderDetailPage() {
  const { t, lang, direction } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, isError } = useSalesOrder(id);

  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();
  const deleteMutation = useDeleteSalesOrder();
  const invoiceMutation = useCreateInvoiceFromSO();
  const deliveryMutation = useCreateDeliveryFromSO();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const BackIcon = direction === "rtl" ? ArrowRightOutlined : ArrowLeftOutlined;

  const handleConfirm = useCallback(() => {
    if (!id) return;
    confirmMutation.mutate(id, {
      onSuccess: () => toast.success(t("sales.message.confirmed", lang)),
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, confirmMutation, t, lang]);

  const handleCancel = useCallback(() => {
    if (!id) return;
    cancelMutation.mutate(id, {
      onSuccess: () => toast.success(t("sales.message.cancelled", lang)),
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, cancelMutation, t, lang]);

  const handleDelete = useCallback(() => {
    if (!id) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("sales.message.deleted", lang));
        navigate(ROUTES.ALL_ORDERS);
      },
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, deleteMutation, t, lang, navigate]);

  const handleCreateInvoice = useCallback(
    (type: string, value?: number) => {
      if (!id) return;
      invoiceMutation.mutate(
        { id, dto: { type: type as "regular", value } },
        {
          onSuccess: () => {
            toast.success(t("sales.message.invoiceCreated", lang));
            setIsInvoiceModalOpen(false);
          },
          onError: (err: { message?: string }) =>
            toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
        }
      );
    },
    [id, invoiceMutation, t, lang]
  );

  const handleCreateDelivery = useCallback(() => {
    if (!id) return;
    deliveryMutation.mutate(id, {
      onSuccess: () => toast.success(t("sales.message.deliveryCreated", lang)),
      onError: (err: { message?: string }) =>
        toast.error(err?.message ?? t("sales.message.loadFailed", lang)),
    });
  }, [id, deliveryMutation, t, lang]);

  const breadcrumbs = useMemo(
    () => [
      { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
      { label: t("sales.orders.breadcrumb", lang), href: ROUTES.ALL_ORDERS },
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
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
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
            <Button type="primary" onClick={() => navigate(ROUTES.ALL_ORDERS)}>
              {t("sales.action.backToList", lang)}
            </Button>
          }
        />
      </DashboardLayout>
    );
  }

  const isDraft = order.status === SalesOrderStatus.DRAFT;
  const isConfirmed = order.status === SalesOrderStatus.CONFIRMED;
  const isDone = order.status === SalesOrderStatus.DONE;
  const isCancelled = order.status === SalesOrderStatus.CANCELLED;
  const canInvoice =
    (isConfirmed || isDone) &&
    order.invoiceStatus !== SalesOrderInvoiceStatus.INVOICED;
  const hasRemainingDelivery = order.lines.some(
    l => Number(l.quantity) - Number(l.qtyDelivered) > 0
  );

  return (
    <DashboardLayout currentPage={order.orderNumber} breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <PageHeader
          title={order.orderNumber}
          subtitle={dayjs(order.createdAt).format("DD MMM YYYY")}
          actions={
            <Space wrap>
              <Button
                icon={<BackIcon />}
                onClick={() => navigate(ROUTES.ALL_ORDERS)}
              >
                {t("sales.action.backToList", lang)}
              </Button>
              <SalesOrderDetailActions
                isDraft={isDraft}
                isConfirmed={isConfirmed}
                isDone={isDone}
                isCancelled={isCancelled}
                canInvoice={canInvoice}
                hasRemainingDelivery={hasRemainingDelivery}
                onConfirm={() => setIsConfirmOpen(true)}
                onCancel={() => setIsCancelOpen(true)}
                onDelete={() => setIsDeleteOpen(true)}
                onCreateInvoice={() => setIsInvoiceModalOpen(true)}
                onCreateDelivery={handleCreateDelivery}
                isDeliveryLoading={deliveryMutation.isPending}
                t={t}
                lang={lang}
              />
            </Space>
          }
        />

        <div className="mb-4">
          <SalesOrderStatusBar
            status={order.status}
            cancelledAt={order.confirmedAt}
          />
        </div>
        <SalesOrderInfoCard order={order} />

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
              key: "invoices",
              label: t("sales.action.createInvoice", lang),
              children: <InvoicesTabContent />,
            },
            {
              key: "deliveries",
              label: t("sales.action.createDelivery", lang),
              children: <DeliveriesTabContent />,
            },
            {
              key: "downPayments",
              label: t("sales.downPayment.title", lang),
              children: <DownPaymentsTabContent />,
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
        title={t("sales.message.confirmOrder", lang)}
        description={t("sales.message.confirmOrderNote", lang)}
        confirmLabel={t("sales.action.confirm", lang)}
        onConfirm={handleConfirm}
        variant="warning"
      />

      <ConfirmDialog
        open={isCancelOpen}
        onOpenChange={v => !v && setIsCancelOpen(false)}
        title={t("sales.message.cancelWarning", lang)}
        description={t("sales.message.cancelWarningNote", lang)}
        confirmLabel={t("sales.action.cancel", lang)}
        onConfirm={handleCancel}
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

      <CreateInvoiceModal
        open={isInvoiceModalOpen}
        orderTotal={order.totalAmount}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleCreateInvoice}
        isSubmitting={invoiceMutation.isPending}
      />
    </DashboardLayout>
  );
}
