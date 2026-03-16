import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { Card, Table, DatePicker, Tag, Space, Typography } from "antd";
import type { TableColumnsType } from "antd";

const { Text, Title } = Typography;

interface CashFlowPlaceholderRow {
  key: string;
  label: string;
  amount: string;
}

export default function CashFlow() {
  const { language } = useAppSettings();
  const lang = language;
  const isRTL = lang === "ar";

  const placeholderColumns: TableColumnsType<CashFlowPlaceholderRow> = [
    {
      title: "",
      dataIndex: "label",
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "",
      dataIndex: "amount",
      width: 160,
      align: "right" as const,
      render: () => <Text type="secondary">—</Text>,
    },
  ];

  const operatingRows: CashFlowPlaceholderRow[] = [
    {
      key: "op-1",
      label: lang === "ar" ? "صافي الدخل" : "Net Income",
      amount: "—",
    },
    {
      key: "op-2",
      label: lang === "ar" ? "الإهلاك" : "Depreciation",
      amount: "—",
    },
    {
      key: "op-3",
      label:
        lang === "ar" ? "تغيرات رأس المال العامل" : "Working Capital Changes",
      amount: "—",
    },
  ];

  const investingRows: CashFlowPlaceholderRow[] = [
    {
      key: "inv-1",
      label: lang === "ar" ? "شراء أصول ثابتة" : "Purchase of Fixed Assets",
      amount: "—",
    },
    {
      key: "inv-2",
      label: lang === "ar" ? "بيع أصول ثابتة" : "Sale of Fixed Assets",
      amount: "—",
    },
  ];

  const financingRows: CashFlowPlaceholderRow[] = [
    {
      key: "fin-1",
      label: lang === "ar" ? "القروض المستلمة" : "Loans Received",
      amount: "—",
    },
    {
      key: "fin-2",
      label: lang === "ar" ? "سداد القروض" : "Loan Repayments",
      amount: "—",
    },
    {
      key: "fin-3",
      label: lang === "ar" ? "توزيعات الأرباح" : "Dividends Paid",
      amount: "—",
    },
  ];

  return (
    <DashboardLayout
      currentPage="CashFlow"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.cf.title", lang) },
      ]}
    >
      <Space
        direction="vertical"
        size={20}
        style={{ width: "100%", direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* ── Page Header ──────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <Space align="center" size={10}>
              <Title level={3} style={{ margin: 0 }}>
                {t("accounting.cf.title", lang)}
              </Title>
              <Tag
                color="orange"
                style={{ borderRadius: 20, padding: "2px 12px", fontSize: 12 }}
              >
                {t("accounting.common.comingSoon", lang)}
              </Tag>
            </Space>
            <Text type="secondary">{t("accounting.cf.subtitle", lang)}</Text>
          </div>
        </div>

        {/* ── Filter Card (disabled) ───────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Space wrap size={12} align="end">
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.tb.from", lang)}
              </Text>
              <DatePicker disabled style={{ width: 160 }} />
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.tb.to", lang)}
              </Text>
              <DatePicker disabled style={{ width: 160 }} />
            </div>
          </Space>
        </Card>

        {/* ── Operating Activities ──────────────────────────────── */}
        <Card
          title={
            <Text strong style={{ fontSize: 15 }}>
              {t("accounting.cf.operating", lang)}
            </Text>
          }
          size="small"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={placeholderColumns}
            dataSource={operatingRows}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </Card>

        {/* ── Investing Activities ──────────────────────────────── */}
        <Card
          title={
            <Text strong style={{ fontSize: 15 }}>
              {t("accounting.cf.investing", lang)}
            </Text>
          }
          size="small"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={placeholderColumns}
            dataSource={investingRows}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </Card>

        {/* ── Financing Activities ──────────────────────────────── */}
        <Card
          title={
            <Text strong style={{ fontSize: 15 }}>
              {t("accounting.cf.financing", lang)}
            </Text>
          }
          size="small"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={placeholderColumns}
            dataSource={financingRows}
            pagination={false}
            size="small"
            showHeader={false}
          />
        </Card>

        {/* ── Net Cash Flow ────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ fontSize: 16 }}>
              {t("accounting.cf.netCashFlow", lang)}
            </Text>
            <Text strong type="secondary" style={{ fontSize: 18 }}>
              —
            </Text>
          </div>
        </Card>
      </Space>
    </DashboardLayout>
  );
}
