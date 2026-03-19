import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type StatusCount = {
  status: string;
  count: string | number;
  total: string | number;
};

type SalesOrdersStatsProps = {
  totalOrders: number;
  totalAmount: number;
  avgOrderValue: number;
  byStatus: StatusCount[];
  currencyCode?: string;
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * KPI stat cards row for the Sales Orders list page.
 * Shows total orders, pending drafts, to-invoice count, and total revenue.
 */
export function SalesOrdersStats({
  totalOrders,
  totalAmount,
  avgOrderValue,
  byStatus,
  currencyCode = "SAR",
  t,
  lang,
}: SalesOrdersStatsProps) {
  const draftCount = Number(
    byStatus.find(s => s.status === "draft")?.count ?? 0
  );
  const confirmedCount = Number(
    byStatus.find(s => s.status === "confirmed")?.count ?? 0
  );

  const statCards = [
    {
      title: t("sales.summary.totalOrders", lang),
      value: totalOrders,
      suffix: "",
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("sales.status.draft", lang),
      value: draftCount,
      suffix: "",
      icon: <ClockCircleOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
    {
      title: t("sales.status.confirmed", lang),
      value: confirmedCount,
      suffix: "",
      icon: <DollarOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("sales.summary.totalRevenue", lang),
      value: Number(totalAmount),
      suffix: ` ${currencyCode}`,
      icon: <RiseOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {statCards.map(s => (
        <Col key={s.title} xs={24} sm={12} lg={6}>
          <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
            <div className="flex justify-between items-start">
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                >
                  {s.title}
                </Text>
                <Statistic
                  value={s.value}
                  suffix={s.suffix}
                  styles={{ content: { fontSize: 24, lineHeight: 1 } }}
                />
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: s.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: s.iconColor,
                }}
              >
                {s.icon}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
