import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService } from "@/services/accounting.service";
import type { IncomeStatementResult } from "@/types/modules/accounting";
import { useQuery } from "@tanstack/react-query";
import {
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
  Divider,
  Alert,
  notification,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  BankOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

// ─── Component ───────────────────────────────────────────────────────────────

export default function CashFlow() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // ── State ──────────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const canGenerate = !!fromDate && !!toDate;

  // ── Query — fetch income statement data ──────────────────────────────────
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery<IncomeStatementResult>({
    queryKey: [
      "cash-flow",
      fromDate?.format("YYYY-MM-DD"),
      toDate?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.incomeStatement(
        fromDate!.format("YYYY-MM-DD"),
        toDate!.format("YYYY-MM-DD")
      ),
    enabled: shouldFetch && canGenerate,
    staleTime: 60_000,
  });

  // ── Computed cash flow values (simplified) ───────────────────────────────
  const cashFlow = useMemo(() => {
    if (!result) return null;

    const netIncome = Number(result.netIncome ?? 0);
    // Simplified: operating = net income (placeholder for depreciation / WC adjustments)
    const depreciation = 0;
    const workingCapital = 0;
    const operatingTotal = netIncome + depreciation + workingCapital;

    // Placeholders for investing & financing until backend support
    const capex = 0;
    const investments = 0;
    const investingTotal = capex + investments;

    const debtRepayment = 0;
    const equityChanges = 0;
    const financingTotal = debtRepayment + equityChanges;

    const netCashFlow = operatingTotal + investingTotal + financingTotal;
    const openingCash = 0;
    const closingCash = openingCash + netCashFlow;

    return {
      netIncome,
      depreciation,
      workingCapital,
      operatingTotal,
      capex,
      investments,
      investingTotal,
      debtRepayment,
      equityChanges,
      financingTotal,
      netCashFlow,
      openingCash,
      closingCash,
    };
  }, [result]);

  // ── Generate handler ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!canGenerate) {
      notification.warning({
        message:
          t("accounting.cf.from", lang) + " / " + t("accounting.cf.to", lang),
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

  // ── Export handler (placeholder — no dedicated cash flow export yet) ──────
  const handleExport = (_format: "pdf" | "xlsx") => {
    if (!fromDate || !toDate) return;
    // Re-use income statement export as a fallback
    reportsService.exportIncomeStatement(
      fromDate.format("YYYY-MM-DD"),
      toDate.format("YYYY-MM-DD"),
      _format
    );
  };

  const hasData = cashFlow !== null;

  // ── Section row helper ───────────────────────────────────────────────────
  const sectionRow = (
    label: string,
    value: number,
    opts?: {
      bold?: boolean;
      prefix?: string;
      color?: string;
      dividerBefore?: boolean;
      indent?: boolean;
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
          paddingInlineStart: opts?.indent ? 32 : 16,
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
      currentPage="CashFlow"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.cf.title", lang) },
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
                  {t("accounting.cf.from", lang)}
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
                  {t("accounting.cf.to", lang)}
                </Text>
                <DatePicker
                  value={toDate}
                  onChange={handleToChange}
                  style={{ width: isMobile ? "100%" : 160 }}
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
                  {t("accounting.cf.generate", lang)}
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
                    {t("accounting.cf.export", lang)}
                  </Button>
                </Dropdown>
              </Space>
            )}
          </div>
        </Card>

        {/* ── Info Banner ────────────────────────────────────────────────── */}
        {hasData && (
          <Alert
            title={t("accounting.cf.simplifiedNote", lang)}
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ borderRadius: 8 }}
          />
        )}

        {/* ── KPI Cards (4) ──────────────────────────────────────────────── */}
        {hasData && cashFlow && (
          <Row gutter={[16, 16]}>
            {[
              {
                title: t("accounting.cf.operating", lang),
                value: cashFlow.operatingTotal,
                icon: <DollarOutlined />,
                iconColor: cashFlow.operatingTotal >= 0 ? "#10b981" : "#ef4444",
                iconBg:
                  cashFlow.operatingTotal >= 0 ? "#10b98115" : "#ef444415",
                color: cashFlow.operatingTotal >= 0 ? "#10b981" : "#ef4444",
              },
              {
                title: t("accounting.cf.investing", lang),
                value: cashFlow.investingTotal,
                icon: <FallOutlined />,
                iconColor: cashFlow.investingTotal >= 0 ? "#10b981" : "#ef4444",
                iconBg:
                  cashFlow.investingTotal >= 0 ? "#10b98115" : "#ef444415",
                color: cashFlow.investingTotal >= 0 ? "#10b981" : "#ef4444",
              },
              {
                title: t("accounting.cf.financing", lang),
                value: cashFlow.financingTotal,
                icon: <BankOutlined />,
                iconColor: cashFlow.financingTotal >= 0 ? "#10b981" : "#ef4444",
                iconBg:
                  cashFlow.financingTotal >= 0 ? "#10b98115" : "#ef444415",
                color: cashFlow.financingTotal >= 0 ? "#10b981" : "#ef4444",
              },
              {
                title: t("accounting.cf.netCashFlow", lang),
                value: cashFlow.netCashFlow,
                icon: <RiseOutlined />,
                iconColor: cashFlow.netCashFlow >= 0 ? "#10b981" : "#ef4444",
                iconBg: cashFlow.netCashFlow >= 0 ? "#10b98115" : "#ef444415",
                color: cashFlow.netCashFlow >= 0 ? "#10b981" : "#ef4444",
              },
            ].map(s => (
              <Col key={s.title} xs={24} sm={12} lg={6}>
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

        {/* ── Operating Activities Card ──────────────────────────────────── */}
        {hasData && cashFlow && (
          <Card
            title={t("accounting.cf.operating", lang)}
            size="small"
            styles={{ body: { padding: "8px 0" } }}
          >
            {sectionRow(
              t("accounting.cf.netIncome", lang),
              cashFlow.netIncome,
              {
                indent: true,
              }
            )}
            {sectionRow(
              t("accounting.cf.depreciation", lang),
              cashFlow.depreciation,
              { indent: true, prefix: "(+)" }
            )}
            {sectionRow(
              t("accounting.cf.workingCapital", lang),
              cashFlow.workingCapital,
              { indent: true, prefix: "(+/-)" }
            )}
            {sectionRow(
              t("accounting.cf.operating", lang),
              cashFlow.operatingTotal,
              { bold: true, dividerBefore: true }
            )}
          </Card>
        )}

        {/* ── Investing Activities Card ──────────────────────────────────── */}
        {hasData && cashFlow && (
          <Card
            title={t("accounting.cf.investing", lang)}
            size="small"
            styles={{ body: { padding: "8px 0" } }}
          >
            {sectionRow(t("accounting.cf.capex", lang), cashFlow.capex, {
              indent: true,
              prefix: "(-)",
            })}
            {sectionRow(
              t("accounting.cf.investments", lang),
              cashFlow.investments,
              { indent: true, prefix: "(-)" }
            )}
            {sectionRow(
              t("accounting.cf.investing", lang),
              cashFlow.investingTotal,
              { bold: true, dividerBefore: true }
            )}
          </Card>
        )}

        {/* ── Financing Activities Card ──────────────────────────────────── */}
        {hasData && cashFlow && (
          <Card
            title={t("accounting.cf.financing", lang)}
            size="small"
            styles={{ body: { padding: "8px 0" } }}
          >
            {sectionRow(
              t("accounting.cf.debtRepayment", lang),
              cashFlow.debtRepayment,
              { indent: true, prefix: "(-)" }
            )}
            {sectionRow(
              t("accounting.cf.equityChanges", lang),
              cashFlow.equityChanges,
              { indent: true, prefix: "(+/-)" }
            )}
            {sectionRow(
              t("accounting.cf.financing", lang),
              cashFlow.financingTotal,
              { bold: true, dividerBefore: true }
            )}
          </Card>
        )}

        {/* ── Net Cash Flow Summary ──────────────────────────────────────── */}
        {hasData && cashFlow && (
          <Card
            title={t("accounting.cf.netCashFlow", lang)}
            size="small"
            styles={{
              body: {
                padding: "8px 0",
                background: theme === "dark" ? "#1a2e1a" : "#f0fdf4",
              },
            }}
          >
            {sectionRow(
              t("accounting.cf.openingCash", lang),
              cashFlow.openingCash
            )}
            {sectionRow(
              t("accounting.cf.netCashFlow", lang),
              cashFlow.netCashFlow,
              {
                color: cashFlow.netCashFlow >= 0 ? "#10b981" : "#ef4444",
                prefix: cashFlow.netCashFlow >= 0 ? "(+)" : "(-)",
              }
            )}
            {sectionRow(
              t("accounting.cf.closingCash", lang),
              cashFlow.closingCash,
              {
                bold: true,
                dividerBefore: true,
                color: cashFlow.closingCash >= 0 ? "#10b981" : "#ef4444",
              }
            )}
          </Card>
        )}

        {/* ── Empty State ────────────────────────────────────────────────── */}
        {!hasData && (
          <Card styles={{ body: { padding: 0 } }}>
            <div style={{ padding: 60, textAlign: "center" }}>
              <FileTextOutlined
                style={{
                  fontSize: 48,
                  color: theme === "dark" ? "#4a5a4a" : "#d1d5db",
                  marginBottom: 12,
                }}
              />
              <br />
              <Text type="secondary">
                {!shouldFetch && !isLoading
                  ? t("accounting.cf.subtitle", lang)
                  : isFetching || isLoading
                    ? ""
                    : t("accounting.cf.title", lang)}
              </Text>
            </div>
          </Card>
        )}
      </Space>
    </DashboardLayout>
  );
}
