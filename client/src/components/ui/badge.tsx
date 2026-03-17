import * as React from "react";
import { Tag } from "antd";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
  asChild?: boolean;
};

const variantColorMap: Record<BadgeVariant, string> = {
  default: "blue",
  secondary: "default",
  destructive: "red",
  outline: "default",
};

/**
 * Badge — Ant Design Tag wrapper preserving the shadcn/ui Badge API.
 */
function Badge({
  className,
  variant = "default",
  asChild: _asChild,
  children,
  ...props
}: BadgeProps) {
  return (
    <Tag
      color={variantColorMap[variant]}
      bordered={variant === "outline"}
      className={cn("inline-flex items-center gap-1", className)}
      {...(props as Record<string, unknown>)}
    >
      {children}
    </Tag>
  );
}

// Keep for backward compat
const badgeVariants = (_opts?: { variant?: BadgeVariant }) => "";

export { Badge, badgeVariants };
