import { memo, ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;    // percentage, positive = up, negative = down
  period?: string;   // e.g. "vs last month"
  icon?: ReactNode;
  iconBg?: string;   // Tailwind class for icon container background
}

function StatCardInner({ title, value, change, period = "vs last month", icon, iconBg }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="card-component p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg ?? "bg-primary/10"}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {isPositive && <TrendingUp size={14} className="text-green-500" />}
          {isNegative && <TrendingDown size={14} className="text-red-500" />}
          {!isPositive && !isNegative && <Minus size={14} className="text-muted-foreground" />}
          <span className={`text-xs font-medium ${isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-muted-foreground"}`}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">{period}</span>
        </div>
      )}
    </div>
  );
}

export const StatCard = memo(StatCardInner);
