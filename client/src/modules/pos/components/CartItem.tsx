import { useState } from "react";
import { InputNumber, Button, theme as antTheme, Tooltip } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import type { CartItem as CartItemType } from "../store/posStore";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { usePOSTranslations } from "../i18n/translations";

interface CartItemProps {
  item: CartItemType;
  onQuantityChange: (productId: string, qty: number) => void;
  onRemove: (productId: string) => void;
  isMobile: boolean;
}

export function CartItem({ item, onQuantityChange, onRemove, isMobile }: CartItemProps) {
  const { token } = antTheme.useToken();
  const { language } = useAppSettings();
  const t = usePOSTranslations(language);
  const [hovered, setHovered] = useState(false);
  const lineTotal = item.product.price * item.quantity;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 10,
        background: hovered ? token.colorFillAlter : "transparent",
        border: `1px solid ${hovered ? token.colorBorderSecondary : "transparent"}`,
        transition: "all 0.15s",
      }}
    >
      {/* Product color dot */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: `linear-gradient(135deg, ${item.product.color}, ${item.product.color}bb)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 12,
        fontWeight: 800,
        flexShrink: 0,
      }}>
        {item.product.name.charAt(0)}
      </div>

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12,
          fontWeight: 600,
          color: token.colorText,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.3,
        }}>
          {item.product.name}
        </div>
        <div style={{ fontSize: 11, color: token.colorTextSecondary, marginTop: 2 }}>
          ${item.product.price.toFixed(2)} / {item.product.unit}
        </div>
      </div>

      {/* Quantity controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <Button
          size="small"
          icon={<MinusOutlined />}
          onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        />
        <InputNumber
          min={1}
          max={item.product.stock}
          value={item.quantity}
          onChange={(v) => v !== null && onQuantityChange(item.product.id, v)}
          controls={false}
          style={{
            width: isMobile ? 40 : 48,
            textAlign: "center",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
          }}
        />
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
          style={{
            width: 30,
            height: 30,
            minWidth: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        />
      </div>

      {/* Line total */}
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: token.colorText,
        minWidth: isMobile ? 52 : 60,
        textAlign: "right",
        flexShrink: 0,
      }}>
        ${lineTotal.toFixed(2)}
      </div>

      {/* Remove */}
      <Tooltip title={t.removeItem}>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(item.product.id)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
            opacity: hovered ? 1 : 0.4,
            transition: "opacity 0.15s",
          }}
        />
      </Tooltip>
    </div>
  );
}
