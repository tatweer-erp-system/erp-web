import { useMemo, useCallback } from "react";

import { Card, Empty, Tag, Descriptions } from "antd";
import dayjs from "dayjs";

import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { SalesStatusBadge } from "@/components/sales/SalesStatusBadge";
import { OrderLinesTable } from "@/components/sales/OrderLinesTable";
import { OrderTotals } from "@/components/sales/OrderTotals";
import { SalesOrderStatus } from "@/constants/enums";
import type { SalesOrder } from "@/types/modules/sales";

// ── Detail Info Card ──────────────────────────────────────────────────────────

type InfoCardProps = { order: SalesOrder };

/** Header info card with order number, statuses, and field descriptions. */
export function SalesOrderInfoCard({ order }: InfoCardProps) {
  const { t, lang } = useTranslation();

  return (
    <Card size="small">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="font-mono text-xl font-bold text-primary">
          {order.orderNumber}
        </span>
        <SalesStatusBadge status={order.status} type="order" />
        <SalesStatusBadge status={order.invoiceStatus} type="invoice" />
        <SalesStatusBadge status={order.deliveryStatus} type="delivery" />
      </div>
      <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small" colon={false}>
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
        <Descriptions.Item label={t("sales.field.paymentTerms", lang)}>
          {getName({
            nameEn: order.paymentTermNameEn,
            nameAr: order.paymentTermNameAr,
          }) || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("sales.field.currency", lang)}>
          {order.currencyCode ?? "SAR"}
        </Descriptions.Item>
        <Descriptions.Item label={t("sales.field.pricelist", lang)}>
          {getName({
            nameEn: order.pricelistNameEn,
            nameAr: order.pricelistNameAr,
          }) || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("sales.field.branch", lang)}>
          {getName({
            nameEn: order.branchNameEn,
            nameAr: order.branchNameAr,
          }) || "-"}
        </Descriptions.Item>
        {order.notes && (
          <Descriptions.Item label={t("sales.field.notes", lang)} span={3}>
            {order.notes}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}

// ── Lines Tab ─────────────────────────────────────────────────────────────────

/** Order lines tab with totals section. */
export function LinesTabContent({ order }: InfoCardProps) {
  const noop = useCallback(() => {}, []);

  return (
    <Card>
      <OrderLinesTable
        lines={order.lines}
        status={order.status}
        onLineChange={noop}
        onLineAdd={noop}
        onLineRemove={noop}
      />
      <OrderTotals
        subtotal={order.subtotal}
        discountAmount={order.discountAmount}
        taxAmount={order.taxAmount}
        totalAmount={order.totalAmount}
        discountType={order.discountType}
        discountValue={order.discountValue}
      />
    </Card>
  );
}

// ── Invoices Tab ──────────────────────────────────────────────────────────────

/** Placeholder invoices tab (populated when invoices exist). */
export function InvoicesTabContent() {
  const { t, lang } = useTranslation();

  return (
    <Card>
      <Empty
        description={t("sales.invoiceStatus.nothing", lang)}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </Card>
  );
}

// ── Deliveries Tab ────────────────────────────────────────────────────────────

/** Placeholder deliveries tab. */
export function DeliveriesTabContent() {
  const { t, lang } = useTranslation();

  return (
    <Card>
      <Empty
        description={t("sales.deliveryStatus.pending", lang)}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </Card>
  );
}

// ── Down Payments Tab ─────────────────────────────────────────────────────────

/** Placeholder down payments tab. */
export function DownPaymentsTabContent() {
  const { t, lang } = useTranslation();

  return (
    <Card>
      <Empty
        description={t("sales.downPayment.noDownPayments", lang)}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </Card>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

/** Activity log showing key status changes. */
export function HistoryTabContent({ order }: InfoCardProps) {
  const { t, lang } = useTranslation();

  const events = useMemo(() => {
    const items = [
      {
        key: "created",
        date: order.createdAt,
        label: t("sales.message.created", lang),
        color: "blue" as const,
      },
    ];
    if (order.confirmedAt) {
      items.push({
        key: "confirmed",
        date: order.confirmedAt,
        label: t("sales.message.confirmed", lang),
        color: "green" as const,
      });
    }
    if (order.status === SalesOrderStatus.CANCELLED) {
      items.push({
        key: "cancelled",
        date: order.updatedAt,
        label: t("sales.message.cancelled", lang),
        color: "red" as const,
      });
    }
    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [order, t, lang]);

  if (events.length === 0) {
    return (
      <Card>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-3">
        {events.map(evt => (
          <div key={evt.key} className="flex items-center gap-3 py-2">
            <Tag color={evt.color}>
              {dayjs(evt.date).format("DD MMM YYYY HH:mm")}
            </Tag>
            <span className="text-sm">{evt.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
