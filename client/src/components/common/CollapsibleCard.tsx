import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "antd";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  actions?: ReactNode;
  className?: string;
}

export function CollapsibleCard({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = true,
  actions,
  className,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card
      className={cn("overflow-hidden shadow-sm", className)}
      styles={{ body: { padding: 0 } }}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-blue-500 flex-shrink-0">{icon}</span>}
          <div className="text-start">
            <p className="text-sm font-semibold leading-tight">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
          <ChevronDown
            size={14}
            className={cn(
              "text-gray-400 transition-transform duration-300 flex-shrink-0",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* CSS grid trick for smooth height animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t">{children}</div>
        </div>
      </div>
    </Card>
  );
}
