import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import {
  reportsService,
  costCentersService,
} from "@/services/accounting.service";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Button,
  DatePicker,
  Select,
  Space,
  Dropdown,
  Spin,
  Row,
  Col,
  Typography,
  Grid,
} from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  PercentageOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import type { CostCenter } from "@/types/modules/accounting";
import dayjs from "dayjs";

const { Text, Title } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  if (value < 0) {
    return `(${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value))})`;
  }
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function IncomeStatement() {
  const { theme, language: lang } = useAppSettings();
  const screens = Grid.useBreakpoint();
  const isRTL = lang === "ar";
  const isMobile = !screens.md;
  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const borderSub = theme === "dark" ? "#232923" : "#EFF3F7";

  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [costCenterId, setCostCenterId] = useState<string | undefined>(
    undefined
  );
  const [filters, setFilters] = useState<{
    from: string;
    to: string;
    costCenterId?: string;
  } | null>(null);

  // Cost centers for filter
  const { data: costCentersData } = useQuery({
    queryKey: ["cost-centers-list"],
    queryFn: () => costCentersService.list({ page: 1, limit: 100 }),
  });

  const costCenters: CostCenter[] = costCentersData?.data ?? [];

  // Income statement data
  const { data, isFetching } = useQuery({
    queryKey: ["income-statement", filters],
    queryFn: () =>
      reportsService.incomeStatement(
        filters!.from,
        filters!.to,
        filters!.costCenterId
      ),
    enabled: filters !== null,
  });

  function handleGenerate() {
    if (!fromDate || !toDate) return;
    setFilters({
      from: fromDate.format("YYYY-MM-DD"),
      to: toDate.format("YYYY-MM-DD"),
      costCenterId,
    });
  }

  function handleExport(format: "pdf" | "xlsx") {
    if (!filters) return;
    reportsService.exportIncomeStatement(
      filters.from,
      filters.to,
      format,
      filters.costCenterId
    );
  }

  const revenue = data?.revenue ?? 0;
  const grossProfit = data?.grossProfit ?? 0;
  const netIncome = data?.netIncome ?? 0;
  const grossMargin = revenue !== 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin = revenue !== 0 ? (netIncome / revenue) * 100 : 0;

  return (
    <DashboardLayout
      currentPage="IncomeStatement"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.is.title", lang) },
      ]}
    >
      <Space
        orientation="vertical"
        size={20}
        style={{ width: "100%", direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* ── Filter Card ──────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
            }}
          >
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.is.from", lang)}
              </Text>
              <DatePicker
                value={fromDate}
                onChange={d => setFromDate(d)}
                style={{ width: isMobile ? "100%" : 160 }}
                placeholder={t("accounting.is.from", lang)}
              />
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.is.to", lang)}
              </Text>
              <DatePicker
                value={toDate}
                onChange={d => setToDate(d)}
                style={{ width: isMobile ? "100%" : 160 }}
                placeholder={t("accounting.is.to", lang)}
              />
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.is.costCenter", lang)}
              </Text>
              <Select
                value={costCenterId}
                onChange={v => setCostCenterId(v)}
                allowClear
                placeholder={t("accounting.is.costCenter", lang)}
                style={{ width: isMobile ? "100%" : 220 }}
                options={costCenters.map(cc => ({
                  value: cc.id,
                  label: lang === "ar" ? cc.nameAr : cc.nameEn,
                }))}
              />
            </div>
            <Button
              type="primary"
              onClick={handleGenerate}
              disabled={!fromDate || !toDate}
              loading={isFetching}
            >
              {t("accounting.is.generate", lang)}
            </Button>
            <Dropdown
              disabled={!data}
              menu={{
                items: [
                  {
                    key: "pdf",
                    label: "PDF",
                    icon: <FilePdfOutlined />,
                    onClick: () => handleExport("pdf"),
                  },
                  {
                    key: "xlsx",
                    label: "XLSX",
                    icon: <FileExcelOutlined />,
                    onClick: () => handleExport("xlsx"),
                  },
                ],
              }}
            >
              <Button icon={<DownloadOutlined />}>
                {t("accounting.is.export", lang)}
              </Button>
            </Dropdown>
          </div>
        </Card>

        {/* ── Loading State ──────────────────────────────────────────── */}
        {isFetching && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <Spin size="large" />
          </div>
        )}

        {/* ── Results ────────────────────────────────────────────────── */}
        {data && !isFetching && (
          <>
            {/* ── KPI Cards ───────────────────────────────────────────── */}
            <Row gutter={[16, 16]}>
              {[
                {
                  title: t("accounting.is.revenue", lang),
                  value: fmt(revenue),
                  icon: <DollarOutlined />,
                  iconColor: primary,
                  iconBg: `${primary}15`,
                },
                {
                  title: t("accounting.is.grossMargin", lang),
                  value: `${grossMargin.toFixed(1)}%`,
                  icon: <PercentageOutlined />,
                  iconColor: "#f59e0b",
                  iconBg: "#f59e0b15",
                },
                {
                  title: t("accounting.is.netMargin", lang),
                  value: `${netMargin.toFixed(1)}%`,
                  icon: <RiseOutlined />,
                  iconColor: netIncome >= 0 ? "#10b981" : "#ef4444",
                  iconBg: netIncome >= 0 ? "#10b98115" : "#ef444415",
                },
              ].map(s => (
                <Col key={s.title} xs={24} sm={8}>
                  <Card
                    size="small"
                    styles={{ body: { padding: "16px 20px" } }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {s.title}
                        </Text>
                        <Text strong style={{ fontSize: 24, lineHeight: 1 }}>
                          {s.value}
                        </Text>
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

            {/* ── Financial Statement Card ────────────────────────────── */}
            <Card
              styles={{ body: { padding: 0 } }}
              title={
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    {t("accounting.is.title", lang)}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t("accounting.is.subtitle", lang)} — {data.from}{" "}
                    {t("accounting.is.to", lang).toLowerCase()} {data.to}
                  </Text>
                </div>
              }
            >
              <div style={{ padding: "0 24px 24px" }}>
                {/* Revenue */}
                <StatementRow
                  label={t("accounting.is.revenue", lang)}
                  amount={revenue}
                  borderSub={borderSub}
                />

                {/* COGS */}
                <StatementRow
                  label={t("accounting.is.cogs", lang)}
                  amount={-Math.abs(data.cogs)}
                  borderSub={borderSub}
                />

                {/* Separator */}
                <div
                  style={{
                    borderTop: `1px solid ${borderSub}`,
                    margin: "4px 0",
                  }}
                />

                {/* Gross Profit — highlighted */}
                <StatementRow
                  label={t("accounting.is.grossProfit", lang)}
                  amount={grossProfit}
                  bold
                  highlight={primary}
                  borderSub={borderSub}
                />

                {/* Operating Expenses */}
                <StatementRow
                  label={t("accounting.is.expenses", lang)}
                  amount={-Math.abs(data.expenses)}
                  borderSub={borderSub}
                />

                {/* Separator */}
                <div
                  style={{
                    borderTop: `2px solid ${borderSub}`,
                    margin: "4px 0",
                  }}
                />

                {/* Net Income — bold, colored */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderTop: `2px solid ${borderSub}`,
                  }}
                >
                  <Text
                    strong
                    style={{ fontSize: 16, textTransform: "uppercase" }}
                  >
                    {t("accounting.is.netIncome", lang)}
                  </Text>
                  <Text
                    strong
                    style={{
                      fontSize: 18,
                      color: netIncome >= 0 ? "#10b981" : "#ef4444",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmt(netIncome)}
                  </Text>
                </div>
              </div>
            </Card>
          </>
        )}
      </Space>
    </DashboardLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatementRow({
  label,
  amount,
  bold = false,
  highlight,
  borderSub: _borderSub,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  highlight?: string;
  borderSub: string;
}) {
  const isNegative = amount < 0;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        ...(highlight
          ? {
              background: `${highlight}08`,
              borderRadius: 6,
              padding: "10px 8px",
            }
          : {}),
      }}
    >
      <Text strong={bold} style={{ fontSize: 14 }}>
        {label}
      </Text>
      <Text
        strong={bold}
        style={{
          fontFamily: "monospace",
          fontSize: 14,
          color: isNegative ? "#ef4444" : undefined,
          textAlign: "right" as const,
        }}
      >
        {fmt(amount)}
      </Text>
    </div>
  );
}
