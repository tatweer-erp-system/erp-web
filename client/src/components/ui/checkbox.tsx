import * as React from "react";
import { Checkbox as AntCheckbox } from "antd";
import { cn } from "@/lib/utils";

type CheckboxProps = React.ComponentProps<"input"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * Checkbox — Ant Design Checkbox wrapper preserving the shadcn/ui API.
 * Consumers use `checked` + `onCheckedChange` instead of native onChange.
 */
function Checkbox({
  className,
  checked,
  onCheckedChange,
  disabled,
  onClick,
  ...props
}: CheckboxProps) {
  return (
    <AntCheckbox
      checked={checked}
      disabled={disabled}
      className={cn(className)}
      onChange={e => onCheckedChange?.(e.target.checked)}
      onClick={onClick as React.MouseEventHandler<HTMLElement>}
    />
  );
}

export { Checkbox };
