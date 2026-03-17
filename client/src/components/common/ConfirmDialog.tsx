import { Modal, Button } from "antd";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
  variant = "danger",
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";
  const Icon = isDanger ? Trash2 : AlertTriangle;

  return (
    <Modal
      open={open}
      onCancel={() => onOpenChange(false)}
      centered
      closable={false}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            type="primary"
            danger={isDanger}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              !isDanger
                ? "!bg-orange-500 hover:!bg-orange-600 !border-orange-500"
                : ""
            }
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 text-center sm:text-start">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
            isDanger
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-orange-100 dark:bg-orange-900/30"
          }`}
        >
          <Icon
            size={20}
            className={isDanger ? "text-red-500" : "text-orange-500"}
          />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </Modal>
  );
}
