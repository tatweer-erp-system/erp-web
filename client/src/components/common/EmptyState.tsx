import { type ReactNode } from "react";
import { Button } from "antd";
import { Inbox } from "lucide-react";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

type EmptyStateProps = {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * Empty state display with icon, title, description, and optional action.
 * Fully bilingual -- all default strings go through t().
 * Responsive layout that works across all breakpoints.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const lang = useLangStore(s => s.lang);

  const resolvedTitle = title ?? t("common.no_data_title", lang);
  const resolvedDescription =
    description ?? t("common.no_data_description", lang);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
        {icon ?? <Inbox size={24} className="text-muted-foreground" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {resolvedTitle}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {resolvedDescription}
      </p>
      {action && <div className="mt-4">{action}</div>}
      {!action && actionLabel && onAction && (
        <div className="mt-4">
          <Button type="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
