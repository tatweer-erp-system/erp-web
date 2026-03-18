import { memo, ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number; // percentage, positive = up, negative = down
  period?: string; // e.g. "vs last month"
  icon?: ReactNode;
  iconBg?: string; // Tailwind class for icon container background
}

function StatCardInner({
  title,
  value,
  change,
  period = "vs last month",
  icon,
  iconBg,
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="card-component px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${iconBg ?? "bg-primary/10"}`}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {isPositive && <TrendingUp size={12} className="text-green-500" />}
          {isNegative && <TrendingDown size={12} className="text-red-500" />}
          {!isPositive && !isNegative && (
            <Minus size={12} className="text-muted-foreground" />
          )}
          <span
            className={`text-xs font-medium ${isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"}`}
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
      )}
    </div>
  );
}

export const StatCard = memo(StatCardInner);
