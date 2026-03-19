import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  reportsService,
  costCentersService,
} from "@/services/accounting.service";
import type {
  IncomeStatementResult,
  CostCenter,
} from "@/types/modules/accounting";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Typography,
  DatePicker,
  Dropdown,
  Select,
  notification,
  Divider,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  PercentageOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

const pct = (part: number, whole: number) =>
  whole !== 0 ? ((Number(part) / Number(whole)) * 100).toFixed(1) : "0.0";

// ─── Component ───────────────────────────────────────────────────────────────

export default function IncomeStatement() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // ── State ──────────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [costCenterId, setCostCenterId] = useState<string | undefined>(
    undefined
  );
  const [shouldFetch, setShouldFetch] = useState(false);

  const canGenerate = !!fromDate && !!toDate;

  // ── Cost Centers Dropdown ────────────────────────────────────────────────
  const { data: costCentersRes } = useQuery({
    queryKey: [QUERY_KEYS.COST_CENTERS_LIST, "dropdown"],
    queryFn: () => costCentersService.list({ limit: 100 }),
    staleTime: 300_000,
  });

  const costCenters: CostCenter[] = costCentersRes?.data ?? [];

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery<IncomeStatementResult>({
    queryKey: [
      QUERY_KEYS.INCOME_STATEMENT,
      fromDate?.format("YYYY-MM-DD"),
      toDate?.format("YYYY-MM-DD"),
      costCenterId,
    ],
    queryFn: () =>
      reportsService.incomeStatement(
        fromDate!.format("YYYY-MM-DD"),
        toDate!.format("YYYY-MM-DD"),
        costCenterId
      ),
    enabled: shouldFetch && canGenerate,
    staleTime: 60_000,
  });

  const data = result ?? null;

  // ── Generate handler ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!canGenerate) {
      notification.warning({
        message:
          t("accounting.is.from", lang) + " / " + t("accounting.is.to", lang),
      });
      return;
    }
    setShouldFetch(true);
  };

  const handleFromChange = (d: dayjs.Dayjs | null) => {
    setFromDate(d);
    setShouldFetch(false);
  };
  const handleToChange = (d: dayjs.Dayjs | null) => {
    setToDate(d);
    setShouldFetch(false);
  };
  const handleCostCenterChange = (v: string | undefined) => {
    setCostCenterId(v || undefined);
    setShouldFetch(false);
  };

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = (format: "pdf" | "xlsx") => {
    if (!fromDate || !toDate) return;
    reportsService.exportIncomeStatement(
      fromDate.format("YYYY-MM-DD"),
      toDate.format("YYYY-MM-DD"),
      format,
      costCenterId
    );
  };

  // ── Computed values ────────────────────────────────────────────────────────
  const revenue = Number(data?.revenue ?? 0);
  const cogs = Number(data?.cogs ?? 0);
  const grossProfit = Number(data?.grossProfit ?? 0);
  const expenses = Number(data?.expenses ?? 0);
  const netIncome = Number(data?.netIncome ?? 0);
  const details = data?.details ?? [];
  const hasData = data !== null;

  // ── Detail table columns ──────────────────────────────────────────────────
  const columns: TableColumnsType<{
    code: string;
    nameEn: string;
    nameAr: string;
    balance: number;
  }> = [
    {
      title: t("accounting.tb.code", lang),
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (v: string) => (
        <Text strong style={{ fontFamily: "monospace" }}>
          {v}
        </Text>
      ),
    },
    {
      title: t("accounting.tb.accountName", lang),
      key: "name",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text>{getName(rec)}</Text>,
    },
    {
      title: t("accounting.tb.balance", lang),
      dataIndex: "balance",
      align: "right" as const,
      sorter: (a, b) => Number(a.balance) - Number(b.balance),
      render: (v: number) => {
        const num = Number(v);
        const color = num > 0 ? "#10b981" : num < 0 ? "#ef4444" : undefined;
        return (
          <Text strong style={{ color }}>
            {fmt(num)}
          </Text>
        );
      },
    },
  ];

  // ── P&L structure row helper ──────────────────────────────────────────────
  const plRow = (
    label: string,
    value: number,
    opts?: {
      bold?: boolean;
      prefix?: string;
      color?: string;
      dividerBefore?: boolean;
    }
  ) => (
    <>
      {opts?.dividerBefore && <Divider style={{ margin: "8px 0" }} />}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
          fontWeight: opts?.bold ? 600 : 400,
        }}
      >
        <Text strong={opts?.bold}>
          {opts?.prefix ? `${opts.prefix} ` : ""}
          {label}
        </Text>
        <Text
          strong={opts?.bold}
          style={{
            color:
              opts?.color ??
              (opts?.bold ? (value >= 0 ? "#10b981" : "#ef4444") : undefined),
            fontFamily: "monospace",
            fontSize: opts?.bold ? 16 : 14,
          }}
        >
          {fmt(value)}
        </Text>
      </div>
    </>
  );

  return (
    <DashboardLayout
      currentPage="IncomeStatement"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.is.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Toolbar Card ───────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Space wrap>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 2 }}
                >
                  {t("accounting.is.from", lang)}
                </Text>
                <DatePicker
                  value={fromDate}
                  onChange={handleFromChange}
                  style={{ width: isMobile ? "100%" : 160 }}
                />
              </div>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 2 }}
                >
                  {t("accounting.is.to", lang)}
                </Text>
                <DatePicker
                  value={toDate}
                  onChange={handleToChange}
                  style={{ width: isMobile ? "100%" : 160 }}
                />
              </div>
              <div>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 2 }}
                >
                  {t("accounting.is.costCenter", lang)}
                </Text>
                <Select
                  allowClear
                  placeholder={t("accounting.is.costCenter", lang)}
                  value={costCenterId}
                  onChange={handleCostCenterChange}
                  style={{ width: isMobile ? "100%" : 200 }}
                  options={costCenters.map(cc => ({
                    label: `${cc.code} — ${getName(cc)}`,
                    value: cc.id,
                  }))}
                />
              </div>
              <div style={{ paddingTop: 18 }}>
                <Button
                  type="primary"
                  icon={<BarChartOutlined />}
                  onClick={handleGenerate}
                  loading={isFetching}
                  disabled={!canGenerate}
                >
                  {t("accounting.is.generate", lang)}
                </Button>
              </div>
            </Space>

            {hasData && (
              <Space>
                <Dropdown
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
                  trigger={["click"]}
                >
                  <Button icon={<DownloadOutlined />}>
                    {t("accounting.is.export", lang)}
                  </Button>
                </Dropdown>
              </Space>
            )}
          </div>
        </Card>

        {/* ── KPI Cards (5) ────────────────────────────────────────────── */}
        {hasData && (
          <Row gutter={[16, 16]}>
            {[
              {
                title: t("accounting.is.revenue", lang),
                value: revenue,
                icon: <DollarOutlined />,
                iconColor: "#10b981",
                iconBg: "#10b98115",
                color: "#10b981",
                suffix: undefined as string | undefined,
              },
              {
                title: t("accounting.is.cogs", lang),
                value: cogs,
                icon: <MinusCircleOutlined />,
                iconColor: "#f59e0b",
                iconBg: "#f59e0b15",
                color: "#f59e0b",
                suffix: undefined as string | undefined,
              },
              {
                title: t("accounting.is.grossProfit", lang),
                value: grossProfit,
                icon: <RiseOutlined />,
                iconColor: grossProfit >= 0 ? "#10b981" : "#ef4444",
                iconBg: grossProfit >= 0 ? "#10b98115" : "#ef444415",
                color: grossProfit >= 0 ? "#10b981" : "#ef4444",
                suffix: `${t("accounting.is.grossMargin", lang)}: ${pct(grossProfit, revenue)}%`,
              },
              {
                title: t("accounting.is.expenses", lang),
                value: expenses,
                icon: <FallOutlined />,
                iconColor: "#ef4444",
                iconBg: "#ef444415",
                color: "#ef4444",
                suffix: undefined as string | undefined,
              },
              {
                title: t("accounting.is.netIncome", lang),
                value: netIncome,
                icon: <PercentageOutlined />,
                iconColor: netIncome >= 0 ? "#10b981" : "#ef4444",
                iconBg: netIncome >= 0 ? "#10b98115" : "#ef444415",
                color: netIncome >= 0 ? "#10b981" : "#ef4444",
                suffix: `${t("accounting.is.netMargin", lang)}: ${pct(netIncome, revenue)}%`,
              },
            ].map(s => (
              <Col key={s.title} xs={24} sm={12} lg={Math.floor(24 / 5)}>
                <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
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
                      <Statistic
                        value={Number(s.value)}
                        precision={2}
                        styles={{ content: {
                          fontSize: 22,
                          lineHeight: 1,
                          color: s.color,
                        } }}
                      />
                      {s.suffix && (
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 11,
                            marginTop: 4,
                            display: "block",
                          }}
                        >
                          {s.suffix}
                        </Text>
                      )}
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
        )}

        {/* ── P&L Structure Card ───────────────────────────────────────── */}
        {hasData && (
          <Card
            title={t("accounting.is.title", lang)}
            size="small"
            styles={{ body: { padding: "8px 0" } }}
          >
            {plRow(t("accounting.is.revenue", lang), revenue)}
            {plRow(t("accounting.is.cogs", lang), cogs, { prefix: "(-)" })}
            {plRow(t("accounting.is.grossProfit", lang), grossProfit, {
              bold: true,
              dividerBefore: true,
            })}
            {plRow(t("accounting.is.expenses", lang), expenses, {
              prefix: "(-)",
              dividerBefore: true,
            })}
            {plRow(t("accounting.is.netIncome", lang), netIncome, {
              bold: true,
              dividerBefore: true,
              color: netIncome >= 0 ? "#10b981" : "#ef4444",
            })}
          </Card>
        )}

        {/* ── Details Table ────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="code"
            columns={columns}
            dataSource={details}
            loading={isLoading || isFetching}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={false}
            locale={{
              emptyText: !shouldFetch ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <FileTextOutlined
                    style={{
                      fontSize: 48,
                      color: theme === "dark" ? "#4a5a4a" : "#d1d5db",
                      marginBottom: 12,
                    }}
                  />
                  <br />
                  <Text type="secondary">
                    {t("accounting.is.subtitle", lang)}
                  </Text>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Text type="secondary">
                    {t("accounting.is.title", lang)} — 0
                  </Text>
                </div>
              ),
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
}
