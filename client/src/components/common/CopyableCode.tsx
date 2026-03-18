import { useCallback } from "react";

import { Typography, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { toast } from "sonner";

import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";

const { Text } = Typography;

type CopyableCodeProps = {
  value: string;
  /** "code" = monospace primary-colored (order numbers, codes).
   *  "plain" = normal text style (emails, phones). */
  variant?: "code" | "plain";
};

/**
 * Displays text with a copy icon on hover.
 * - variant="code": monospace, primary color (order numbers, codes)
 * - variant="plain": normal text style (emails, phones)
 */
export function CopyableCode({ value, variant = "code" }: CopyableCodeProps) {
  const lang = useLangStore(s => s.lang);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(value);
      toast.success(t("common.copied", lang));
    },
    [value, lang]
  );

  return (
    <span className="group inline-flex items-center gap-1">
      {variant === "code" ? (
        <Text
          strong
          className="font-mono"
          style={{ color: "var(--ant-color-primary)" }}
        >
          {value}
        </Text>
      ) : (
        <Text>{value}</Text>
      )}
      <Tooltip title={t("common.copy", lang)}>
        <CopyOutlined
          className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary"
          style={{ fontSize: 13 }}
          onClick={handleCopy}
        />
      </Tooltip>
    </span>
  );
}
