import { type ReactNode } from "react";

import { Card, Row, Col, Statistic, Typography } from "antd";

const { Text } = Typography;

type StatItem = {
  title: string;
  value: string | number;
  suffix?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
};

type StatsRowProps = {
  items: StatItem[];
};

/**
 * Standard stats row for list pages.
 * Uses the EXACT same design as SalesOrdersStats —
 * Ant Design Card + Statistic with colored icon circle.
 */
export function StatsRow({ items }: StatsRowProps) {
  const colSpan = items.length <= 3 ? 24 / items.length : 6;

  return (
    <Row gutter={[16, 16]}>
      {items.map(item => (
        <Col key={item.title} xs={24} sm={12} lg={colSpan}>
          <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex justify-between items-start">
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                >
                  {item.title}
                </Text>
                <Statistic
                  value={
                    typeof item.value === "number" ? item.value : undefined
                  }
                  formatter={
                    typeof item.value === "string"
                      ? () => item.value
                      : undefined
                  }
                  suffix={item.suffix}
                  valueStyle={{ fontSize: 24, lineHeight: 1 }}
                />
              </div>
              {item.icon && (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: item.iconBg ?? "#8b5cf615",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: item.iconColor ?? "#8b5cf6",
                  }}
                >
                  {item.icon}
                </div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
