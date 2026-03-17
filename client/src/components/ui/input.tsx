import * as React from "react";
import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps, InputRef } from "antd";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  /** Allow Ant Design specific props to pass through */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
};

/**
 * Input — Ant Design Input wrapper preserving the shadcn/ui API.
 * Forwards ref to the underlying Ant Input.
 */
function Input({
  className,
  type,
  prefix,
  suffix,
  allowClear,
  ...props
}: InputProps) {
  if (type === "password") {
    return (
      <AntInput.Password
        className={cn(className)}
        prefix={prefix}
        suffix={suffix}
        {...(props as Record<string, unknown>)}
      />
    );
  }

  return (
    <AntInput
      type={type}
      className={cn(className)}
      prefix={prefix}
      suffix={suffix}
      allowClear={allowClear}
      {...(props as Record<string, unknown>)}
    />
  );
}

export { Input };
