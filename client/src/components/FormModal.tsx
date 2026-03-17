import { type ReactNode } from "react";
import { Modal, Button } from "antd";

type FormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
};

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  isLoading = false,
}: FormModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div>
          <div className="text-lg font-semibold">{title}</div>
          {description && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
        </div>
      }
      width={448}
      destroyOnClose
      centered
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={onSubmit} loading={isLoading}>
            {submitLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">{children}</div>
    </Modal>
  );
}
