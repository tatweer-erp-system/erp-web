import { Tag } from "antd";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";

/**
 * Color mapping for status values.
 * Uses Ant Design Tag color tokens for consistent theming.
 */
const STATUS_COLORS: Record<string, string> = {
  // Success / positive
  active: "green",
  completed: "green",
  paid: "green",
  posted: "green",
  processed: "green",
  delivered: "green",
  "in-stock": "green",
  filed: "green",
  present: "green",
  available: "green",
  excellent: "green",

  // Warning / in-progress
  pending: "orange",
  processing: "gold",
  "in-transit": "gold",
  "low-stock": "orange",
  overdue: "orange",
  "on-leave": "orange",
  draft: "default",
  "half-day": "orange",
  reserved: "blue",

  // Info / neutral
  vip: "purple",
  good: "cyan",
  average: "blue",
  open: "blue",
  occupied: "blue",
  used: "default",
  archived: "default",
  locked: "geekblue",

  // Danger / negative
  cancelled: "red",
  rejected: "red",
  expired: "red",
  inactive: "default",
  discontinued: "red",
  suspended: "red",
  "out-of-stock": "red",
  depleted: "red",
  overstock: "volcano",
  absent: "red",
  closed: "default",
  reversed: "magenta",

  // Accepted
  accepted: "green",
};

type StatusBadgeProps = {
  status: string;
  type?: string;
};

/**
 * Colored badge for displaying status values.
 * Maps status to theme-consistent Ant Design Tag colors.
 * Translates the status label via t().
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { language: lang } = useAppSettings();
  const color = STATUS_COLORS[status] ?? "default";
  const label = t(`status.${status}`, lang);

  return (
    <Tag color={color} className="text-xs font-medium">
      {label}
    </Tag>
  );
}
