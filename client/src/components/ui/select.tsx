import * as React from "react";
import { Select as AntSelect } from "antd";
import { cn } from "@/lib/utils";

/**
 * Select — Ant Design Select wrapper preserving the shadcn/ui compound
 * component API:
 *
 *   <Select value={v} onValueChange={setV}>
 *     <SelectTrigger className="...">
 *       <SelectValue placeholder="Pick" />
 *     </SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Alpha</SelectItem>
 *       <SelectItem value="b">Beta</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Implementation: Select reads children to find SelectContent items,
 * extracts their values/labels, and renders a single Ant <Select>.
 */

/* ─── Context ─────────────────────────────────────────────────────── */

type SelectCtx = {
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  triggerSize?: "sm" | "default";
};

const SelectContext = React.createContext<SelectCtx>({});

/* ─── Helpers to extract options from children ────────────────────── */

type OptionDef = { value: string; label: React.ReactNode; disabled?: boolean };

function extractOptions(children: React.ReactNode): OptionDef[] {
  const options: OptionDef[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "select-item") {
      options.push({
        value: p["data-value"] as string,
        label: p.children as React.ReactNode,
        disabled: !!p["data-disabled"],
      });
    } else if (slot === "select-group") {
      // Flatten group children
      options.push(...extractOptions(p.children as React.ReactNode));
    }
  });

  return options;
}

/* ─── Root ────────────────────────────────────────────────────────── */

function Select({
  value,
  onValueChange,
  children,
  ...props
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children?: React.ReactNode;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  // Read trigger and content from children
  let placeholder = "";
  let triggerClassName = "";
  let triggerSize: "sm" | "default" = "default";
  let options: OptionDef[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) return;
    const p = child.props as Record<string, unknown>;
    const slot = p["data-slot"] as string | undefined;

    if (slot === "select-trigger") {
      triggerClassName = (p.className as string) ?? "";
      triggerSize = (p["data-size"] as "sm" | "default") ?? "default";
      // Find placeholder from SelectValue child
      React.Children.forEach(p.children as React.ReactNode, triggerChild => {
        if (!React.isValidElement(triggerChild)) return;
        const tp = triggerChild.props as Record<string, unknown>;
        if (tp["data-slot"] === "select-value") {
          placeholder = (tp["data-placeholder"] as string) ?? "";
        }
      });
    } else if (slot === "select-content") {
      options = extractOptions(p.children as React.ReactNode);
    }
  });

  return (
    <AntSelect
      value={value || undefined}
      onChange={v => onValueChange?.(v)}
      placeholder={placeholder}
      size={(triggerSize as string) === "sm" ? "small" : "middle"}
      className={cn("w-full", triggerClassName)}
      disabled={props.disabled}
      options={options.map(o => ({
        value: o.value,
        label: o.label,
        disabled: o.disabled,
      }))}
    />
  );
}

/* ─── Trigger — rendered as hidden marker element ─────────────────── */

function SelectTrigger({
  children,
  className,
  size = "default",
  ...props
}: React.ComponentProps<"button"> & { size?: "sm" | "default" }) {
  return (
    <span
      data-slot="select-trigger"
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
}

/* ─── Value — rendered as hidden marker element ───────────────────── */

function SelectValue({
  placeholder,
  ...props
}: { placeholder?: string } & React.ComponentProps<"span">) {
  return (
    <span data-slot="select-value" data-placeholder={placeholder} {...props} />
  );
}

/* ─── Content — rendered as hidden marker element ─────────────────── */

function SelectContent({
  children,
  className,
  position: _position,
  align: _align,
  ...props
}: React.ComponentProps<"div"> & {
  position?: "popper" | "item-aligned";
  align?: "start" | "center" | "end";
}) {
  return (
    <div data-slot="select-content" className={className} {...props}>
      {children}
    </div>
  );
}

/* ─── Group ───────────────────────────────────────────────────────── */

function SelectGroup({ children, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="select-group" {...props}>
      {children}
    </div>
  );
}

/* ─── Item — rendered as hidden marker element ────────────────────── */

function SelectItem({
  children,
  className,
  value,
  disabled,
  ...props
}: React.ComponentProps<"div"> & { value: string; disabled?: boolean }) {
  return (
    <div
      data-slot="select-item"
      data-value={value}
      data-disabled={disabled || undefined}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─── Label ───────────────────────────────────────────────────────── */

function SelectLabel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-label" className={className} {...props} />;
}

/* ─── Separator ───────────────────────────────────────────────────── */

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-separator" className={className} {...props} />;
}

/* ─── Scroll buttons (no-op with Ant) ─────────────────────────────── */

function SelectScrollUpButton(props: React.ComponentProps<"div">) {
  return null;
}

function SelectScrollDownButton(props: React.ComponentProps<"div">) {
  return null;
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
