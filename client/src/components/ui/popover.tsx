import * as React from "react";
import { Popover as AntPopover } from "antd";
import { cn } from "@/lib/utils";

/**
 * Popover — Ant Design Popover wrapper preserving the compound component API:
 *
 *   <Popover open={open} onOpenChange={setOpen}>
 *     <PopoverTrigger asChild>
 *       <Button>Open</Button>
 *     </PopoverTrigger>
 *     <PopoverContent align="end" className="w-80">
 *       {content}
 *     </PopoverContent>
 *   </Popover>
 */

/* ─── Root ────────────────────────────────────────────────────────── */

function Popover({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  let triggerContent: React.ReactNode = null;
  let popoverContent: React.ReactNode = null;
  let placement: "bottomLeft" | "bottomRight" | "bottom" = "bottom";
  let contentClassName = "";

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "popover-trigger") {
      triggerContent = p.children as React.ReactNode;
    } else if (slot === "popover-content") {
      popoverContent = p.children as React.ReactNode;
      contentClassName = (p.className as string) ?? "";
      const align = p["data-align"] as string | undefined;
      placement =
        align === "start"
          ? "bottomLeft"
          : align === "end"
            ? "bottomRight"
            : "bottom";
    }
  });

  return (
    <AntPopover
      open={open}
      onOpenChange={onOpenChange}
      trigger="click"
      placement={placement}
      overlayClassName={contentClassName}
      content={popoverContent}
      arrow={false}
    >
      <span className="inline-flex">{triggerContent}</span>
    </AntPopover>
  );
}

/* ─── Trigger ─────────────────────────────────────────────────────── */

function PopoverTrigger({
  children,
  asChild: _asChild,
  className,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  return (
    <span
      data-slot="popover-trigger"
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Content — marker element, never rendered directly ───────────── */

function PopoverContent({
  children,
  className,
  align = "center",
  sideOffset: _sideOffset,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  return (
    <div
      data-slot="popover-content"
      data-align={align}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Anchor (no-op) ──────────────────────────────────────────────── */

function PopoverAnchor(props: React.ComponentProps<"div">) {
  return <div {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
