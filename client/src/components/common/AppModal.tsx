import { type ReactNode } from "react";
import { Modal } from "antd";
import { useLangStore } from "@/stores/lang.store";
import { useModalWidth } from "@/hooks/ui/useModalWidth";
import { cn } from "@/lib/utils";

type AppModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  width?: number;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Standard modal wrapper that enforces the Tatweer design system:
 * - Gradient header (primary -> accent via CSS variables)
 * - White title text
 * - RTL support via ConfigProvider direction
 * - Full-screen on mobile via useModalWidth
 */
export function AppModal({
  title,
  open,
  onClose,
  width,
  children,
  footer,
}: AppModalProps) {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";
  const responsiveWidth = useModalWidth(width);
  const isFullScreen =
    typeof responsiveWidth === "string" && responsiveWidth === "100%";

  return (
    <Modal
      title={
        <span className="text-white font-semibold text-base">{title}</span>
      }
      open={open}
      onCancel={onClose}
      width={responsiveWidth}
      footer={footer ?? null}
      destroyOnClose
      centered={!isFullScreen}
      className={cn("app-modal", isFullScreen && "app-modal--fullscreen")}
      styles={{
        header: {
          background: "linear-gradient(135deg, var(--primary), var(--accent))",
          borderRadius: isFullScreen
            ? "0"
            : "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "16px 24px",
          marginBottom: 0,
        },
        body: {
          padding: "24px",
          direction: isRTL ? "rtl" : "ltr",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
        wrapper: {
          overflow: "hidden",
        },
      }}
      closeIcon={
        <span className="text-white/80 hover:text-white transition-colors">
          &#x2715;
        </span>
      }
    >
      {children}
    </Modal>
  );
}
