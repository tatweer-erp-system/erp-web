import { type ReactNode } from "react";
import { Modal, Button } from "antd";

type AnimatedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  size?: "sm" | "md" | "lg";
};

const sizeWidthMap = {
  sm: 400,
  md: 520,
  lg: 640,
};

export function AnimatedModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Submit",
  size = "md",
}: AnimatedModalProps) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={title}
      width={sizeWidthMap[size]}
      destroyOnClose
      centered
      footer={
        <div className="flex gap-3 justify-end">
          <Button onClick={onClose}>Cancel</Button>
          {onSubmit && (
            <Button type="primary" onClick={onSubmit}>
              {submitLabel}
            </Button>
          )}
        </div>
      }
    >
      {children}
    </Modal>
  );
}
