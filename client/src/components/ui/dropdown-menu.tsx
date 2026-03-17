import * as React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DropdownMenu — Ant Design Dropdown wrapper that preserves the
 * compound component API used by consumers:
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild>
 *       <Button>Click me</Button>
 *     </DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuItem onClick={fn}>Item</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 *
 * Implementation: DropdownMenu reads its React element children,
 * finds the trigger and content by data-slot, converts content items
 * into Ant Design menu items, and wraps the trigger in <Dropdown>.
 * Content elements are never rendered to the DOM directly.
 */

/* ─── Counter for unique menu keys ───────────────────────────────── */

let itemKeyCounter = 0;

function resetKeyCounter() {
  itemKeyCounter = 0;
}

/* ─── Convert React element children into Ant Menu items ─────────── */

function childrenToMenuItems(
  children: React.ReactNode
): NonNullable<MenuProps["items"]> {
  const items: NonNullable<MenuProps["items"]> = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;

    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "dropdown-item") {
      items.push({
        key: `di-${++itemKeyCounter}`,
        label: (
          <span className="flex items-center gap-2">
            {p.children as React.ReactNode}
          </span>
        ),
        onClick: p.onClick as (() => void) | undefined,
        danger: p["data-variant"] === "destructive",
        disabled: !!p["data-disabled"],
      });
    } else if (slot === "dropdown-menu-checkbox-item") {
      const checked = p["data-checked"] as boolean;
      const onCheckedChange = p["data-on-change"] as
        | ((v: boolean) => void)
        | undefined;
      items.push({
        key: `dc-${++itemKeyCounter}`,
        label: (
          <span
            className={cn("flex items-center gap-2", p.className as string)}
          >
            <span className="flex size-4 items-center justify-center">
              {checked && <CheckIcon className="size-3" />}
            </span>
            {p.children as React.ReactNode}
          </span>
        ),
        onClick: () => onCheckedChange?.(!checked),
      });
    } else if (slot === "dropdown-menu-separator") {
      items.push({ type: "divider" });
    } else if (slot === "dropdown-menu-label") {
      items.push({
        key: `dl-${++itemKeyCounter}`,
        label: p.children as React.ReactNode,
        type: "group",
      });
    } else if (slot === "dropdown-menu-group") {
      const groupItems = childrenToMenuItems(p.children as React.ReactNode);
      items.push(...groupItems);
    } else {
      // Fallback: render as a plain label
      items.push({
        key: `du-${++itemKeyCounter}`,
        label: child,
      });
    }
  });

  return items;
}

/* ─── Root ───────────────────────────────────────────────────────────── */

function DropdownMenu({
  children,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  let triggerContent: React.ReactNode = null;
  let menuItems: NonNullable<MenuProps["items"]> = [];
  let placement: "bottomLeft" | "bottomRight" = "bottomRight";

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "dropdown-trigger") {
      triggerContent = p.children as React.ReactNode;
    } else if (slot === "dropdown-content") {
      const align = p["data-align"] as string | undefined;
      placement = align === "start" ? "bottomLeft" : "bottomRight";
      resetKeyCounter();
      menuItems = childrenToMenuItems(p.children as React.ReactNode);
    }
  });

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      placement={placement}
    >
      <span className="inline-flex">{triggerContent}</span>
    </Dropdown>
  );
}

/* ─── Trigger ────────────────────────────────────────────────────────── */

function DropdownMenuTrigger({
  children,
  asChild: _asChild,
  className,
  ...props
}: React.ComponentProps<"span"> & { asChild?: boolean }) {
  return (
    <span
      data-slot="dropdown-trigger"
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Content — never rendered to DOM; parent reads its React props ── */

function DropdownMenuContent({
  children,
  className,
  align = "end",
  sideOffset: _sideOffset,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  // This element is never mounted. The parent (DropdownMenu) reads
  // its props via React.Children.forEach to build Ant menu items.
  return (
    <div
      data-slot="dropdown-content"
      data-align={align}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Item ────────────────────────────────────────────────────────────── */

function DropdownMenuItem({
  children,
  className,
  onClick,
  inset,
  variant = "default",
  disabled,
  ...props
}: React.ComponentProps<"div"> & {
  inset?: boolean;
  variant?: "default" | "destructive";
  disabled?: boolean;
}) {
  return (
    <div
      data-slot="dropdown-item"
      data-variant={variant}
      data-inset={inset}
      data-disabled={disabled || undefined}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────────── */

function DropdownMenuGroup({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="dropdown-menu-group" {...props}>
      {children}
    </div>
  );
}

/* ─── Portal (no-op) ──────────────────────────────────────────────────── */

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

/* ─── Label ───────────────────────────────────────────────────────────── */

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div data-slot="dropdown-menu-label" className={className} {...props} />
  );
}

/* ─── Separator ───────────────────────────────────────────────────────── */

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div data-slot="dropdown-menu-separator" className={className} {...props} />
  );
}

/* ─── Shortcut ────────────────────────────────────────────────────────── */

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("ms-auto text-xs tracking-widest text-gray-400", className)}
      {...props}
    />
  );
}

/* ─── Checkbox item ───────────────────────────────────────────────────── */

function DropdownMenuCheckboxItem({
  children,
  className,
  checked,
  onCheckedChange,
  ...props
}: React.ComponentProps<"div"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div
      data-slot="dropdown-menu-checkbox-item"
      data-checked={checked}
      data-on-change={onCheckedChange as unknown as string}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Radio group / item ──────────────────────────────────────────────── */

function DropdownMenuRadioGroup({
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string;
  onValueChange?: (v: string) => void;
}) {
  return (
    <div data-slot="dropdown-menu-radio-group" {...props}>
      {children}
    </div>
  );
}

function DropdownMenuRadioItem({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { value?: string }) {
  return (
    <div data-slot="dropdown-menu-radio-item" className={className} {...props}>
      {children}
    </div>
  );
}

/* ─── Sub ─────────────────────────────────────────────────────────────── */

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div data-slot="dropdown-menu-sub-trigger" className={className} {...props}>
      {children}
      <ChevronRightIcon className="ms-auto size-4" />
    </div>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-sub-content"
      className={className}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
