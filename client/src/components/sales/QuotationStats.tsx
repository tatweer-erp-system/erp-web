import { Card, Row, Col, Statistic, Typography } from "antd";
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

type StatusCount = {
  status: string;
  count: string | number;
  total: string | number;
};

type QuotationStatsProps = {
  totalRows: number;
  summary?: {
    totalOrders?: number;
    totalAmount?: number;
    avgOrderValue?: number;
    byStatus?: StatusCount[];
  };
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * KPI stat cards row for the Quotations list page.
 * Shows total quotations, pending, confirmed, and pipeline value.
 */
export function QuotationStats({
  totalRows,
  summary,
  t,
  lang,
}: QuotationStatsProps) {
  const draftCount = Number(
    summary?.byStatus?.find(s => s.status === "draft")?.count ?? 0
  );
  const totalAmount = Number(summary?.totalAmount ?? 0);

  const statCards = [
    {
      title: t("sales.summary.totalOrders", lang),
      value: Number(summary?.totalOrders ?? totalRows),
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("sales.status.draft", lang),
      value: draftCount,
      icon: <ClockCircleOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
    {
      title: t("sales.status.confirmed", lang),
      value: 0,
      icon: <CheckCircleOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("sales.summary.totalRevenue", lang),
      value: totalAmount,
      suffix: " SAR",
      icon: <DollarOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
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
                  suffix={"suffix" in s ? s.suffix : undefined}
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
