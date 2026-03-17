import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label — plain HTML label styled to match the design system.
 * Replaces @radix-ui/react-label.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        className
      )}
      {...props}
    />
  );
}

export { Label };
