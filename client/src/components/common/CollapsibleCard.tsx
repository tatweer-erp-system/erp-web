import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className={cn("overflow-hidden border border-border shadow-sm bg-card", className)}>
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-primary flex-shrink-0">{icon}</span>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>{actions}</div>
          )}
          <ChevronDown
            size={14}
            className={cn(
              "text-muted-foreground transition-transform duration-300 flex-shrink-0",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      {/* CSS grid trick for smooth height animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border">{children}</div>
        </div>
      </div>
    </Card>
  );
}
