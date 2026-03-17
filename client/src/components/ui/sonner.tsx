import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster — sonner Toaster without next-themes dependency.
 * Theme is handled by Ant Design's ConfigProvider, so we default to light.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover, #fff)",
          "--normal-text": "var(--popover-foreground, #000)",
          "--normal-border": "var(--border, #e5e7eb)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
