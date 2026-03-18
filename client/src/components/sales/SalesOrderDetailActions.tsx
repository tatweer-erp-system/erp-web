import { useMemo } from "react";

import { Button, Dropdown, Space } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  EllipsisOutlined,
  PrinterOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { Truck } from "lucide-react";

type SalesOrderDetailActionsProps = {
  isDraft: boolean;
  isConfirmed: boolean;
  isDone: boolean;
  isCancelled: boolean;
  canInvoice: boolean;
  hasRemainingDelivery: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onCreateInvoice: () => void;
  onCreateDelivery: () => void;
  isDeliveryLoading: boolean;
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * Action buttons for the Sales Order detail page header.
 * Rendered conditionally based on the current order status.
 */
export function SalesOrderDetailActions({
  isDraft,
  isConfirmed,
  isDone,
  isCancelled,
  canInvoice,
  hasRemainingDelivery,
  onConfirm,
  onCancel,
  onDelete,
  onCreateInvoice,
  onCreateDelivery,
  isDeliveryLoading,
  t,
  lang,
}: SalesOrderDetailActionsProps) {
  const moreItems = useMemo(
    () => [
      {
        key: "print",
        label: t("sales.action.print", lang),
        icon: <PrinterOutlined />,
      },
      {
        key: "duplicate",
        label: t("sales.action.duplicate", lang),
        icon: <CopyOutlined />,
      },
      {
        key: "exportPdf",
        label: t("sales.action.exportPdf", lang),
        icon: <FileTextOutlined />,
      },
    ],
    [t, lang]
  );

  return (
    <Space wrap>
      {isDraft && (
        <>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={onConfirm}
          >
            {t("sales.action.confirm", lang)}
          </Button>
          <Button icon={<EditOutlined />}>
            {t("sales.action.edit", lang)}
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            {t("sales.action.delete", lang)}
          </Button>
        </>
      )}

      {isConfirmed && (
        <>
          {canInvoice && (
            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={onCreateInvoice}
            >
              {t("sales.action.createInvoice", lang)}
            </Button>
          )}
          {hasRemainingDelivery && (
            <Button
              icon={<Truck size={14} />}
              onClick={onCreateDelivery}
              loading={isDeliveryLoading}
            >
              {t("sales.action.createDelivery", lang)}
            </Button>
          )}
          <Button
            danger
            ghost
            icon={<CloseCircleOutlined />}
            onClick={onCancel}
          >
            {t("sales.action.cancel", lang)}
          </Button>
        </>
      )}

      {isDone && canInvoice && (
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          onClick={onCreateInvoice}
        >
          {t("sales.action.createInvoice", lang)}
        </Button>
      )}

      {!isCancelled && (
        <Dropdown menu={{ items: moreItems }} placement="bottomRight">
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>
      )}
    </Space>
  );
}
