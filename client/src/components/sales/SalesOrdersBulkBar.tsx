import { Button, Typography } from "antd";
import {
  DownloadOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type BulkActionBarProps = {
  count: number;
  onClear: () => void;
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * Bulk action bar displayed when rows are selected on the Sales Orders list.
 * Shows selected count and bulk action buttons.
 */
export function SalesOrdersBulkBar({
  count,
  onClear,
  t,
  lang,
}: BulkActionBarProps) {
  return (
    <div
      className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
      style={{
        background: "var(--ant-color-primary-bg)",
        border: "1px solid var(--ant-color-primary-border)",
      }}
    >
      <Text strong style={{ color: "var(--ant-color-primary)" }}>
        {count} {t("sales.column.status", lang)}
      </Text>
      <Button size="small" icon={<DownloadOutlined />}>
        {t("products.export", lang)}
      </Button>
      <Button size="small" icon={<CheckCircleOutlined />}>
        {t("sales.action.confirm", lang)}
      </Button>
      <Button size="small" danger icon={<DeleteOutlined />}>
        {t("sales.action.delete", lang)}
      </Button>
      <Button size="small" type="text" onClick={onClear}>
        {t("sales.filter.allStatuses", lang)}
      </Button>
    </div>
  );
}
