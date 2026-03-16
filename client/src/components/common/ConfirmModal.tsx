import { Button } from "antd";
import { AlertTriangle, Trash2 } from "lucide-react";
import { AppModal } from "@/components/common/AppModal";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";

type ConfirmModalVariant = "danger" | "warning";

type ConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
};

/**
 * Confirmation dialog built on AppModal.
 * Supports danger (delete) and warning variants with appropriate
 * icon, color, and button styling.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const { language: lang } = useAppSettings();
  const isDanger = variant === "danger";

  const Icon = isDanger ? Trash2 : AlertTriangle;
  const resolvedTitle = title ?? t("common.are_you_sure", lang);
  const resolvedDescription =
    description ?? t("common.action_cannot_be_undone", lang);
  const resolvedConfirmLabel =
    confirmLabel ??
    (isDanger ? t("common.delete", lang) : t("common.confirm", lang));

  return (
    <AppModal title={resolvedTitle} open={open} onClose={onClose} width={420}>
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full mb-4",
            isDanger
              ? "bg-red-100 dark:bg-red-900/30"
              : "bg-orange-100 dark:bg-orange-900/30"
          )}
        >
          <Icon
            size={24}
            className={cn(isDanger ? "text-red-500" : "text-orange-500")}
          />
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {resolvedDescription}
        </p>
        <div className="flex items-center justify-center gap-3 w-full">
          <Button onClick={onClose} disabled={isLoading} className="min-w-24">
            {t("common.cancel", lang)}
          </Button>
          <Button
            type="primary"
            danger={isDanger}
            onClick={onConfirm}
            loading={isLoading}
            className={cn(
              "min-w-24",
              !isDanger &&
                "!bg-orange-500 hover:!bg-orange-600 !border-orange-500"
            )}
          >
            {resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </AppModal>
  );
}
