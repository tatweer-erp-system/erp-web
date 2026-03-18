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
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Truck } from "lucide-react";

type SalesOrderDetailActionsProps = {
  isDraft: boolean;
  isConfirmed: boolean;
  isDone: boolean;
  isCancelled: boolean;
  canInvoice: boolean;
  hasRemainingDelivery: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
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
  isEditing,
  isSaving,
  onConfirm,
  onCancel,
  onDelete,
  onEdit,
  onCancelEdit,
  onSave,
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

  if (isEditing) {
    return (
      <Space wrap>
        <Button icon={<CloseOutlined />} onClick={onCancelEdit}>
          {t("common.cancel", lang)}
        </Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={onSave}
        >
          {t("common.save", lang)}
        </Button>
      </Space>
    );
  }

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
          <Button icon={<EditOutlined />} onClick={onEdit}>
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
