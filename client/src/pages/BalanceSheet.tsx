import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { reportsService } from "@/services/accounting.service";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Card,
  Button,
  DatePicker,
  Space,
  Dropdown,
  Spin,
  Row,
  Col,
  Typography,
  Grid,
  Tag,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { BalanceSheetRow } from "@/types/modules/accounting";
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

export default function BalanceSheet() {
  const { theme, language: lang } = useAppSettings();
  const screens = Grid.useBreakpoint();
  const isRTL = lang === "ar";
  const isMobile = !screens.md;
  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const borderSub = theme === "dark" ? "#232923" : "#EFF3F7";

  const [dateValue, setDateValue] = useState<dayjs.Dayjs | null>(null);
  const [asOfDate, setAsOfDate] = useState<string | null>(null);

  const { data, isFetching } = useQuery({
    queryKey: [QUERY_KEYS.BALANCE_SHEET, asOfDate],
    queryFn: () => reportsService.balanceSheet(asOfDate!),
    enabled: asOfDate !== null,
  });

  function handleGenerate() {
    if (!dateValue) return;
    setAsOfDate(dateValue.format("YYYY-MM-DD"));
  }

  function handleExport(format: "pdf" | "xlsx") {
    if (!asOfDate) return;
    reportsService.exportBalanceSheet(asOfDate, format);
  }

  // Split assets into current and fixed
  const { currentAssets, fixedAssets } = useMemo(() => {
    if (!data) return { currentAssets: [], fixedAssets: [] };
    const current: BalanceSheetRow[] = [];
    const fixed: BalanceSheetRow[] = [];
    for (const row of data.assets) {
      if (/^1[0-4]/.test(row.code)) {
        current.push(row);
      } else {
        fixed.push(row);
      }
    }
    return { currentAssets: current, fixedAssets: fixed };
  }, [data]);

  const isBalanced =
    data !== undefined &&
    Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01;

  const columns: TableColumnsType<BalanceSheetRow> = [
    {
      title: t("accounting.bs.code", lang),
      dataIndex: "code",
      width: 100,
      render: (v: string) => (
        <Text style={{ fontFamily: "monospace", fontSize: 13 }}>{v}</Text>
      ),
    },
    {
      title: t("accounting.bs.accountName", lang),
      key: "name",
      ellipsis: true,
      render: (_, rec) => getName(rec),
    },
    {
      title: t("accounting.bs.balance", lang),
      dataIndex: "balance",
      align: "right" as const,
      width: 160,
      render: (v: number) => (
        <Text
          style={{
            fontFamily: "monospace",
            color: v < 0 ? "#ef4444" : undefined,
          }}
        >
          {fmt(v)}
        </Text>
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="BalanceSheet"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.bs.title", lang) },
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
                {t("accounting.bs.asOfDate", lang)}
              </Text>
              <DatePicker
                value={dateValue}
                onChange={d => setDateValue(d)}
                defaultValue={dayjs()}
                style={{ width: isMobile ? "100%" : 180 }}
                placeholder={t("accounting.bs.asOfDate", lang)}
              />
            </div>
            <Button
              type="primary"
              onClick={handleGenerate}
              disabled={!dateValue}
              loading={isFetching}
            >
              {t("accounting.bs.generate", lang)}
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
                {t("accounting.bs.export", lang)}
              </Button>
            </Dropdown>

            {/* Balance check badge */}
            {data && (
              <div style={{ marginInlineStart: "auto" }}>
                {isBalanced ? (
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color="success"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                  >
                    {t("accounting.bs.balanced", lang)}
                  </Tag>
                ) : (
                  <Tag
                    icon={<WarningOutlined />}
                    color="error"
                    style={{ fontSize: 13, padding: "4px 12px" }}
                  >
                    {t("accounting.bs.unbalanced", lang)}
                  </Tag>
                )}
              </div>
            )}
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
          <Row gutter={[16, 16]}>
            {/* ── Left Column: ASSETS ─────────────────────────────────── */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ body: { padding: 0 } }}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Title level={5} style={{ margin: 0 }}>
                      {t("accounting.bs.assets", lang)}
                    </Title>
                  </div>
                }
              >
                {/* Current Assets Section */}
                {currentAssets.length > 0 && (
                  <SectionBlock
                    title={t("accounting.bs.currentAssets", lang)}
                    rows={currentAssets}
                    columns={columns}
                    subtotal={currentAssets.reduce((s, r) => s + r.balance, 0)}
                    borderSub={borderSub}
                    primary={primary}
                  />
                )}

                {/* Fixed Assets Section */}
                {fixedAssets.length > 0 && (
                  <SectionBlock
                    title={t("accounting.bs.fixedAssets", lang)}
                    rows={fixedAssets}
                    columns={columns}
                    subtotal={fixedAssets.reduce((s, r) => s + r.balance, 0)}
                    borderSub={borderSub}
                    primary={primary}
                  />
                )}

                {/* Total Assets */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 24px",
                    borderTop: `2px solid ${borderSub}`,
                    background: `${primary}08`,
                  }}
                >
                  <Text strong style={{ fontSize: 15 }}>
                    {t("accounting.bs.totalAssets", lang)}
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: 15, fontFamily: "monospace" }}
                  >
                    {fmt(data.totalAssets)}
                  </Text>
                </div>
              </Card>
            </Col>

            {/* ── Right Column: LIABILITIES + EQUITY ──────────────────── */}
            <Col xs={24} lg={12}>
              <Card
                styles={{ body: { padding: 0 } }}
                title={
                  <Title level={5} style={{ margin: 0 }}>
                    {t("accounting.bs.liabilities", lang)} &{" "}
                    {t("accounting.bs.equity", lang)}
                  </Title>
                }
              >
                {/* Liabilities Section */}
                {data.liabilities.length > 0 && (
                  <SectionBlock
                    title={t("accounting.bs.liabilities", lang)}
                    rows={data.liabilities}
                    columns={columns}
                    subtotal={data.totalLiabilities}
                    borderSub={borderSub}
                    primary={primary}
                  />
                )}

                {/* Equity Section */}
                {data.equity.length > 0 && (
                  <SectionBlock
                    title={t("accounting.bs.equity", lang)}
                    rows={data.equity}
                    columns={columns}
                    subtotal={data.totalEquity}
                    borderSub={borderSub}
                    primary={primary}
                  />
                )}

                {/* Total Liabilities + Equity */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 24px",
                    borderTop: `2px solid ${borderSub}`,
                    background: `${primary}08`,
                  }}
                >
                  <Text strong style={{ fontSize: 15 }}>
                    {t("accounting.bs.totalLiabilitiesEquity", lang)}
                  </Text>
                  <Text
                    strong
                    style={{ fontSize: 15, fontFamily: "monospace" }}
                  >
                    {fmt(data.totalLiabilitiesAndEquity)}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Space>
    </DashboardLayout>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionBlock({
  title,
  rows,
  columns,
  subtotal,
  borderSub,
  primary: _primary,
}: {
  title: string;
  rows: BalanceSheetRow[];
  columns: TableColumnsType<BalanceSheetRow>;
  subtotal: number;
  borderSub: string;
  primary: string;
}) {
  return (
    <div>
      <div
        style={{
          padding: "8px 24px",
          background: `${borderSub}80`,
          borderBottom: `1px solid ${borderSub}`,
        }}
      >
        <Text strong style={{ fontSize: 13, textTransform: "uppercase" }}>
          {title}
        </Text>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        size="small"
        pagination={false}
        showHeader={false}
        style={{ margin: "0" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 24px",
          borderTop: `1px solid ${borderSub}`,
          borderBottom: `1px solid ${borderSub}`,
        }}
      >
        <Text strong style={{ fontSize: 13 }}>
          {title}
        </Text>
        <Text strong style={{ fontSize: 13, fontFamily: "monospace" }}>
          {fmt(subtotal)}
        </Text>
      </div>
    </div>
  );
}
