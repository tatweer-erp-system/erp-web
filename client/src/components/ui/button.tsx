import * as React from "react";
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  htmlType?: AntButtonProps["htmlType"];
};

/**
 * Ant Design Button wrapper that preserves the original shadcn/ui API surface.
 * Consumers continue using variant="outline" / size="sm" etc.
 */
function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  loading,
  htmlType,
  type: _type,
  children,
  color: _color,
  ...props
}: ButtonProps) {
  const antType: AntButtonProps["type"] = (() => {
    switch (variant) {
      case "default":
        return "primary";
      case "destructive":
        return "primary";
      case "outline":
        return "default";
      case "secondary":
        return "default";
      case "ghost":
        return "text";
      case "link":
        return "link";
      default:
        return "primary";
    }
  })();

  const antSize: AntButtonProps["size"] = (() => {
    switch (size) {
      case "sm":
      case "icon-sm":
        return "small";
      case "lg":
      case "icon-lg":
        return "large";
      default:
        return "middle";
    }
  })();

  const isIcon = size === "icon" || size === "icon-sm" || size === "icon-lg";

  return (
    <AntButton
      type={antType}
      size={antSize}
      danger={variant === "destructive"}
      ghost={variant === "outline"}
      loading={loading}
      htmlType={htmlType}
      className={cn(
        isIcon && "!p-0 !flex items-center justify-center",
        className
      )}
      style={
        isIcon
          ? {
              width: size === "icon-sm" ? 32 : size === "icon-lg" ? 40 : 36,
              height: size === "icon-sm" ? 32 : size === "icon-lg" ? 40 : 36,
            }
          : undefined
      }
      {...(props as Omit<typeof props, "type">)}
    >
      {children}
    </AntButton>
  );
}

// Keep buttonVariants export for backward compat (used by alert-dialog)
const buttonVariants = (_opts?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) => "";

export { Button, buttonVariants };
export type { ButtonProps, ButtonVariant, ButtonSize };
