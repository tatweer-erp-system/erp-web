import { type ReactNode } from "react";

import { Row, Col } from "antd";

import { StatCard } from "@/components/common/StatCard";

type StatItem = {
  title: string;
  value: string | number;
  icon?: ReactNode;
  iconBg?: string;
  change?: number;
};

type StatsRowProps = {
  items: StatItem[];
};

/**
 * Standard stats row for list pages.
 * Renders 1-4 stat cards in a responsive grid.
 * All list pages must use this component for KPI cards.
 */
export function StatsRow({ items }: StatsRowProps) {
  const colSpan = items.length <= 3 ? 24 / items.length : 6;

  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col key={item.title} xs={24} sm={12} lg={colSpan}>
          <StatCard
            title={item.title}
            value={item.value}
            icon={item.icon}
            iconBg={item.iconBg}
            change={item.change}
          />
        </Col>
      ))}
    </Row>
  );
}
