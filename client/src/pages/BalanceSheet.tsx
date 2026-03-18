import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService } from "@/services/accounting.service";
import type {
  BalanceSheetRow,
  BalanceSheetResult,
} from "@/types/modules/accounting";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Typography,
  DatePicker,
  Dropdown,
  notification,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  DollarOutlined,
  BarChartOutlined,
  BankOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

// ─── Component ───────────────────────────────────────────────────────────────

export default function BalanceSheet() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [asOfDate, setAsOfDate] = useState<dayjs.Dayjs | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const canGenerate = !!asOfDate;

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery<BalanceSheetResult>({
    queryKey: [QUERY_KEYS.BALANCE_SHEET, asOfDate?.format("YYYY-MM-DD")],
    queryFn: () => reportsService.balanceSheet(asOfDate!.format("YYYY-MM-DD")),
    enabled: shouldFetch && canGenerate,
    staleTime: 60_000,
  });

  const assets: BalanceSheetRow[] = result?.assets ?? [];
  const liabilities: BalanceSheetRow[] = result?.liabilities ?? [];
  const equity: BalanceSheetRow[] = result?.equity ?? [];

  const totalAssets = Number(result?.totalAssets ?? 0);
  const totalLiabilities = Number(result?.totalLiabilities ?? 0);
  const totalEquity = Number(result?.totalEquity ?? 0);
  const totalLiabilitiesAndEquity = Number(
    result?.totalLiabilitiesAndEquity ?? 0
  );
  const isBalanced = totalAssets === totalLiabilitiesAndEquity;

  const hasData =
    assets.length > 0 || liabilities.length > 0 || equity.length > 0;

  // ── Generate handler ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!canGenerate) {
      notification.warning({
        message: t("accounting.bs.asOfDate", lang),
      });
      return;
    }
    setShouldFetch(true);
  };

  // Reset fetch flag when date changes
  const handleDateChange = (d: dayjs.Dayjs | null) => {
    setAsOfDate(d);
    setShouldFetch(false);
  };

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = (format: "pdf" | "xlsx") => {
    if (!asOfDate) return;
    reportsService.exportBalanceSheet(asOfDate.format("YYYY-MM-DD"), format);
  };

  // ── Shared table columns builder ──────────────────────────────────────────
  const buildColumns = (): TableColumnsType<BalanceSheetRow> => [
    {
      title: t("accounting.bs.code", lang),
      dataIndex: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (v: string) => (
        <Text
          strong
          style={{ color: token.colorPrimary, fontFamily: "monospace" }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: t("accounting.bs.accountName", lang),
      key: "name",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text>{getName(rec)}</Text>,
    },
    {
      title: t("accounting.bs.balance", lang),
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

  // ── Section table renderer ────────────────────────────────────────────────
  const renderSectionTable = (
    title: string,
    rows: BalanceSheetRow[],
    total: number,
    totalLabel: string
  ) => (
    <Card title={<Text strong>{title}</Text>} styles={{ body: { padding: 0 } }}>
      <Table
        rowKey="id"
        columns={buildColumns()}
        dataSource={rows}
        loading={isLoading || isFetching}
        size="middle"
        scroll={{ x: "max-content" }}
        pagination={false}
        summary={() =>
          rows.length > 0 ? (
            <Table.Summary fixed>
              <Table.Summary.Row
                style={{
                  background: theme === "dark" ? "#1a2e1a" : "#f0fdf4",
                  fontWeight: 600,
                }}
              >
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Text strong>{totalLabel}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Text strong>{fmt(total)}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          ) : undefined
        }
        locale={{
          emptyText: (
            <div style={{ padding: 20, textAlign: "center" }}>
              <Text type="secondary">--</Text>
            </div>
          ),
        }}
      />
    </Card>
  );

  return (
    <DashboardLayout
      currentPage="BalanceSheet"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.bs.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
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
                  {t("accounting.bs.asOfDate", lang)}
                </Text>
                <DatePicker
                  value={asOfDate}
                  onChange={handleDateChange}
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
                  {t("accounting.bs.generate", lang)}
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
                    {t("accounting.bs.export", lang)}
                  </Button>
                </Dropdown>
              </Space>
            )}
          </div>
        </Card>

        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        {hasData && (
          <Row gutter={[16, 16]}>
            {[
              {
                title: t("accounting.bs.totalAssets", lang),
                value: totalAssets,
                icon: <DollarOutlined />,
                iconColor: "#3b82f6",
                iconBg: "#3b82f615",
                color: "#3b82f6",
              },
              {
                title: t("accounting.bs.totalLiabilities", lang),
                value: totalLiabilities,
                icon: <BankOutlined />,
                iconColor: "#f59e0b",
                iconBg: "#f59e0b15",
                color: "#f59e0b",
              },
              {
                title: t("accounting.bs.totalEquity", lang),
                value: totalEquity,
                icon: <SafetyOutlined />,
                iconColor: "#8b5cf6",
                iconBg: "#8b5cf615",
                color: "#8b5cf6",
              },
              {
                title: t("accounting.bs.totalLiabilitiesEquity", lang),
                value: totalLiabilitiesAndEquity,
                icon: isBalanced ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                ),
                iconColor: isBalanced ? "#10b981" : "#ef4444",
                iconBg: isBalanced ? "#10b98115" : "#ef444415",
                color: isBalanced ? "#10b981" : "#ef4444",
                badge: isBalanced
                  ? t("accounting.bs.balanced", lang)
                  : t("accounting.bs.unbalanced", lang),
                badgeColor: isBalanced ? "green" : "red",
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
                        valueStyle={{
                          fontSize: 24,
                          lineHeight: 1,
                          color: s.color,
                        }}
                      />
                      {"badge" in s && s.badge && (
                        <Tag
                          color={s.badgeColor}
                          style={{ marginTop: 8, borderRadius: 20 }}
                        >
                          {s.badge}
                        </Tag>
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

        {/* ── Three-Section Layout ───────────────────────────────────────── */}
        {hasData ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              {renderSectionTable(
                t("accounting.bs.assets", lang),
                assets,
                totalAssets,
                t("accounting.bs.totalAssets", lang)
              )}
            </Col>
            <Col xs={24} lg={8}>
              {renderSectionTable(
                t("accounting.bs.liabilities", lang),
                liabilities,
                totalLiabilities,
                t("accounting.bs.totalLiabilities", lang)
              )}
            </Col>
            <Col xs={24} lg={8}>
              {renderSectionTable(
                t("accounting.bs.equity", lang),
                equity,
                totalEquity,
                t("accounting.bs.totalEquity", lang)
              )}
            </Col>
          </Row>
        ) : (
          <Card styles={{ body: { padding: 0 } }}>
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
                {!shouldFetch
                  ? t("accounting.bs.subtitle", lang)
                  : t("accounting.bs.title", lang) + " — 0"}
              </Text>
            </div>
          </Card>
        )}
      </Space>
    </DashboardLayout>
  );
}
