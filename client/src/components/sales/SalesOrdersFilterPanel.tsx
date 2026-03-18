import { Row, Col, Segmented, Tag, Typography } from "antd";

import {
  SalesOrderInvoiceStatus,
  SalesOrderDeliveryStatus,
} from "@/constants/enums";

const { Text } = Typography;

type FilterPanelProps = {
  invoiceFilter: string;
  deliveryFilter: string;
  onInvoiceFilterChange: (v: string) => void;
  onDeliveryFilterChange: (v: string) => void;
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * Collapsible filter panel for the Sales Orders list page.
 * Shows invoice status and delivery status segmented controls
 * with active filter tags below.
 */
export function SalesOrdersFilterPanel({
  invoiceFilter,
  deliveryFilter,
  onInvoiceFilterChange,
  onDeliveryFilterChange,
  t,
  lang,
}: FilterPanelProps) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Text type="secondary" className="text-xs mb-1 block">
            {t("sales.column.invoiceStatus", lang)}
          </Text>
          <Segmented
            value={invoiceFilter}
            onChange={v => onInvoiceFilterChange(v as string)}
            block
            options={[
              { value: "all", label: t("sales.filter.allStatuses", lang) },
              {
                value: SalesOrderInvoiceStatus.NOTHING,
                label: t("sales.invoiceStatus.nothing", lang),
              },
              {
                value: SalesOrderInvoiceStatus.TO_INVOICE,
                label: t("sales.invoiceStatus.to_invoice", lang),
              },
              {
                value: SalesOrderInvoiceStatus.INVOICED,
                label: t("sales.invoiceStatus.invoiced", lang),
              },
            ]}
            size="small"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Text type="secondary" className="text-xs mb-1 block">
            {t("sales.column.deliveryStatus", lang)}
          </Text>
          <Segmented
            value={deliveryFilter}
            onChange={v => onDeliveryFilterChange(v as string)}
            block
            options={[
              { value: "all", label: t("sales.filter.allStatuses", lang) },
              {
                value: SalesOrderDeliveryStatus.PENDING,
                label: t("sales.deliveryStatus.pending", lang),
              },
              {
                value: SalesOrderDeliveryStatus.PARTIAL,
                label: t("sales.deliveryStatus.partial", lang),
              },
              {
                value: SalesOrderDeliveryStatus.DONE,
                label: t("sales.deliveryStatus.done", lang),
              },
            ]}
            size="small"
          />
        </Col>
      </Row>

      {/* Active filter tags */}
      <div className="flex flex-wrap gap-1 mt-2">
        {invoiceFilter !== "all" && (
          <Tag closable onClose={() => onInvoiceFilterChange("all")}>
            {t("sales.column.invoiceStatus", lang)}:{" "}
            {t(`sales.invoiceStatus.${invoiceFilter}`, lang)}
          </Tag>
        )}
        {deliveryFilter !== "all" && (
          <Tag closable onClose={() => onDeliveryFilterChange("all")}>
            {t("sales.column.deliveryStatus", lang)}:{" "}
            {t(`sales.deliveryStatus.${deliveryFilter}`, lang)}
          </Tag>
        )}
      </div>
    </div>
  );
}
