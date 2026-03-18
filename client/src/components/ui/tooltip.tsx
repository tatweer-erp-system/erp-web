import * as React from "react";
import { Tooltip as AntTooltip } from "antd";
import { cn } from "@/lib/utils";

/**
 * Tooltip — Ant Design Tooltip wrapper preserving the shadcn/ui compound API.
 *
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tip text</TooltipContent>
 *   </Tooltip>
 *
 * TooltipProvider wraps at the app level (no-op with Ant Design since
 * Ant Design handles tooltip provider internally).
 */

/* ─── Provider (no-op) ────────────────────────────────────────────── */

function TooltipProvider({
  children,
  delayDuration: _delayDuration,
  ...props
}: {
  children?: React.ReactNode;
  delayDuration?: number;
}) {
  return <>{children}</>;
}

/* ─── Root ────────────────────────────────────────────────────────── */

function Tooltip({
  children,
}: {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}) {
  let triggerContent: React.ReactNode = null;
  let tooltipContent: React.ReactNode = null;

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "tooltip-trigger") {
      triggerContent = p.children as React.ReactNode;
    } else if (slot === "tooltip-content") {
      tooltipContent = p.children as React.ReactNode;
    }
  });

  return (
    <AntTooltip title={tooltipContent}>
      <span className="inline-flex">{triggerContent}</span>
    </AntTooltip>
  );
}

/* ─── Trigger ─────────────────────────────────────────────────────── */

function TooltipTrigger({
  children,
  className,
  asChild: _asChild,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  return (
    <span data-slot="tooltip-trigger" className={cn(className)} {...props}>
      {children}
    </span>
  );
}

/* ─── Content ─────────────────────────────────────────────────────── */

function TooltipContent({
  children,
  className,
  sideOffset: _sideOffset,
  side: _side,
  align: _align,
  ...props
}: React.ComponentProps<"div"> & {
  sideOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  return (
    <div data-slot="tooltip-content" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
