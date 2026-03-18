import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService } from "@/services/accounting.service";
import { AccountType } from "@/constants/enums";
import type {
  TrialBalanceRow,
  TrialBalanceResult,
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
  Tooltip,
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
  SwapOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Account type tag config ─────────────────────────────────────────────────

const ACCOUNT_TYPE_TAG: Record<AccountType, { color: string; label: string }> =
  {
    [AccountType.ASSET]: { color: "blue", label: "Asset" },
    [AccountType.LIABILITY]: { color: "orange", label: "Liability" },
    [AccountType.EQUITY]: { color: "purple", label: "Equity" },
    [AccountType.REVENUE]: { color: "green", label: "Revenue" },
    [AccountType.EXPENSE]: { color: "red", label: "Expense" },
  };

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

// ─── Component ───────────────────────────────────────────────────────────────

export default function TrialBalance() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const token = {
    colorPrimary: primary,
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const canGenerate = !!fromDate && !!toDate;

  // ── Query ──────────────────────────────────────────────────────────────────
  const {
    data: result,
    isLoading,
    isFetching,
  } = useQuery<TrialBalanceResult>({
    queryKey: [
      QUERY_KEYS.TRIAL_BALANCE,
      fromDate?.format("YYYY-MM-DD"),
      toDate?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.trialBalance(
        fromDate!.format("YYYY-MM-DD"),
        toDate!.format("YYYY-MM-DD")
      ),
    enabled: shouldFetch && canGenerate,
    staleTime: 60_000,
  });

  const rows: TrialBalanceRow[] = result?.data ?? [];

  // ── KPI values (computed from full dataset) ────────────────────────────────
  const totals = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    for (const row of rows) {
      totalDebit += Number(row.totalDebit);
      totalCredit += Number(row.totalCredit);
    }
    return {
      totalDebit,
      totalCredit,
      netBalance: totalDebit - totalCredit,
    };
  }, [rows]);

  // ── Generate handler ───────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!canGenerate) {
      notification.warning({
        message:
          t("accounting.tb.from", lang) + " / " + t("accounting.tb.to", lang),
      });
      return;
    }
    setShouldFetch(true);
  };

  // Reset fetch flag when dates change
  const handleFromChange = (d: dayjs.Dayjs | null) => {
    setFromDate(d);
    setShouldFetch(false);
  };
  const handleToChange = (d: dayjs.Dayjs | null) => {
    setToDate(d);
    setShouldFetch(false);
  };

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = (format: "pdf" | "xlsx") => {
    if (!fromDate || !toDate) return;
    reportsService.exportTrialBalance(
      fromDate.format("YYYY-MM-DD"),
      toDate.format("YYYY-MM-DD"),
      format
    );
  };

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: TableColumnsType<TrialBalanceRow> = [
    {
      title: t("accounting.tb.code", lang),
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
      title: t("accounting.tb.accountName", lang),
      key: "name",
      sorter: (a, b) => getName(a).localeCompare(getName(b)),
      render: (_, rec) => <Text>{getName(rec)}</Text>,
    },
    {
      title: t("accounting.tb.accountType", lang),
      dataIndex: "accountType",
      filters: Object.entries(ACCOUNT_TYPE_TAG).map(([val, cfg]) => ({
        text: cfg.label,
        value: val,
      })),
      onFilter: (value, record) => record.accountType === value,
      render: (v: AccountType) => {
        const cfg = ACCOUNT_TYPE_TAG[v];
        return cfg ? (
          <Tag
            color={cfg.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {cfg.label}
          </Tag>
        ) : (
          v
        );
      },
    },
    {
      title: t("accounting.tb.totalDebit", lang),
      dataIndex: "totalDebit",
      align: "right" as const,
      sorter: (a, b) => Number(a.totalDebit) - Number(b.totalDebit),
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
    {
      title: t("accounting.tb.totalCredit", lang),
      dataIndex: "totalCredit",
      align: "right" as const,
      sorter: (a, b) => Number(a.totalCredit) - Number(b.totalCredit),
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
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

  // ── Has data ───────────────────────────────────────────────────────────────
  const hasData = rows.length > 0;

  return (
    <DashboardLayout
      currentPage="TrialBalance"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.tb.title", lang) },
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
                  {t("accounting.tb.from", lang)}
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
                  {t("accounting.tb.to", lang)}
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
                  {t("accounting.tb.generate", lang)}
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
                        label: t("accounting.tb.pdf", lang),
                        icon: <FilePdfOutlined />,
                        onClick: () => handleExport("pdf"),
                      },
                      {
                        key: "xlsx",
                        label: t("accounting.tb.xlsx", lang),
                        icon: <FileExcelOutlined />,
                        onClick: () => handleExport("xlsx"),
                      },
                    ],
                  }}
                  trigger={["click"]}
                >
                  <Button icon={<DownloadOutlined />}>
                    {t("accounting.tb.export", lang)}
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
                title: t("accounting.tb.totalDebit", lang),
                value: totals.totalDebit,
                icon: <DollarOutlined />,
                iconColor: "#10b981",
                iconBg: "#10b98115",
                color: "#10b981",
              },
              {
                title: t("accounting.tb.totalCredit", lang),
                value: totals.totalCredit,
                icon: <DollarOutlined />,
                iconColor: "#f59e0b",
                iconBg: "#f59e0b15",
                color: "#f59e0b",
              },
              {
                title: t("accounting.tb.balance", lang),
                value: totals.netBalance,
                icon: <SwapOutlined />,
                iconColor: totals.netBalance >= 0 ? "#10b981" : "#ef4444",
                iconBg: totals.netBalance >= 0 ? "#10b98115" : "#ef444415",
                color: totals.netBalance >= 0 ? "#10b981" : "#ef4444",
              },
            ].map(s => (
              <Col key={s.title} xs={24} sm={8}>
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

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={rows}
            loading={isLoading || isFetching}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={false}
            summary={() =>
              hasData ? (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{
                      background: theme === "dark" ? "#1a2e1a" : "#f0fdf4",
                      fontWeight: 600,
                    }}
                  >
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>{t("accounting.tb.totals", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong>{fmt(totals.totalDebit)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text strong>{fmt(totals.totalCredit)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text
                        strong
                        style={{
                          color:
                            totals.netBalance > 0
                              ? "#10b981"
                              : totals.netBalance < 0
                                ? "#ef4444"
                                : undefined,
                        }}
                      >
                        {fmt(totals.netBalance)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ) : undefined
            }
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
                    {t("accounting.tb.subtitle", lang)}
                  </Text>
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Text type="secondary">
                    {t("accounting.tb.title", lang)} — 0
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
