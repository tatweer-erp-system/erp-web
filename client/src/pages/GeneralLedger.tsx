import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService, accountsService } from "@/services/accounting.service";
import type { GeneralLedgerRow, Account } from "@/types/modules/accounting";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Table,
  Button,
  Select,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Space,
  DatePicker,
  Typography,
  Empty,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  DollarOutlined,
  SwapOutlined,
  BankOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });

// ─── Component ────────────────────────────────────────────────────────────────

export default function GeneralLedger() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";

  // ── State ───────────────────────────────────────────────────────────────────
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState<dayjs.Dayjs | null>(null);
  const [toDate, setToDate] = useState<dayjs.Dayjs | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const canGenerate = !!accountId && !!fromDate && !!toDate;

  // ── Accounts dropdown query ─────────────────────────────────────────────────
  const { data: accountsData } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_LIST_GL],
    queryFn: () => accountsService.list({ limit: 100 }),
    staleTime: 60_000,
  });
  const accounts: Account[] = accountsData?.data ?? [];

  const accountOptions = useMemo(
    () =>
      accounts.map(a => ({
        value: a.id,
        label: `${a.code} - ${getName(a)}`,
      })),
    [accounts]
  );

  // ── General Ledger query — disabled until Generate is clicked ───────────────
  const {
    data: rows,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.GENERAL_LEDGER,
      accountId,
      fromDate?.format("YYYY-MM-DD"),
      toDate?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.generalLedger(
        accountId!,
        fromDate!.format("YYYY-MM-DD"),
        toDate!.format("YYYY-MM-DD")
      ),
    enabled: shouldFetch && canGenerate,
    staleTime: 30_000,
  });

  const data: GeneralLedgerRow[] = rows ?? [];

  // Reset fetch flag when filters change
  const handleAccountChange = useCallback((v: string) => {
    setAccountId(v);
    setShouldFetch(false);
  }, []);

  const handleFromChange = useCallback((v: dayjs.Dayjs | null) => {
    setFromDate(v);
    setShouldFetch(false);
  }, []);

  const handleToChange = useCallback((v: dayjs.Dayjs | null) => {
    setToDate(v);
    setShouldFetch(false);
  }, []);

  const handleGenerate = useCallback(() => {
    if (canGenerate) setShouldFetch(true);
  }, [canGenerate]);

  // ── Summary KPIs ────────────────────────────────────────────────────────────
  const totalDebit = useMemo(
    () => data.reduce((sum, r) => sum + Number(r.debit), 0),
    [data]
  );
  const totalCredit = useMemo(
    () => data.reduce((sum, r) => sum + Number(r.credit), 0),
    [data]
  );
  const netMovement = totalDebit - totalCredit;
  const endingBalance =
    data.length > 0 ? Number(data[data.length - 1].runningBalance) : 0;

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (data.length === 0) return;

    const headers = [
      t("accounting.gl.entryNumber", lang),
      t("accounting.gl.date", lang),
      t("accounting.gl.description", lang),
      t("accounting.gl.debit", lang),
      t("accounting.gl.credit", lang),
      t("accounting.gl.runningBalance", lang),
    ];

    const csvRows = [
      headers.join(","),
      ...data.map(r =>
        [
          r.entryNumber,
          dayjs(r.entryDate).format("YYYY-MM-DD"),
          `"${(r.description ?? "").replace(/"/g, '""')}"`,
          Number(r.debit).toFixed(2),
          Number(r.credit).toFixed(2),
          Number(r.runningBalance).toFixed(2),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `general-ledger-${fromDate?.format("YYYY-MM-DD")}-${toDate?.format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, lang, fromDate, toDate]);

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns: TableColumnsType<GeneralLedgerRow> = [
    {
      title: t("accounting.gl.entryNumber", lang),
      dataIndex: "entryNumber",
      render: (v: string) => (
        <Text strong style={{ color: primary, fontFamily: "monospace" }}>
          {v}
        </Text>
      ),
    },
    {
      title: t("accounting.gl.date", lang),
      dataIndex: "entryDate",
      render: (v: string) => (
        <Text type="secondary">{dayjs(v).format("YYYY-MM-DD")}</Text>
      ),
    },
    {
      title: t("accounting.gl.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: (v: string | undefined) => (
        <Text type="secondary">{v ?? "\u2014"}</Text>
      ),
    },
    {
      title: t("accounting.gl.debit", lang),
      dataIndex: "debit",
      align: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
    {
      title: t("accounting.gl.credit", lang),
      dataIndex: "credit",
      align: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
    {
      title: t("accounting.gl.runningBalance", lang),
      dataIndex: "runningBalance",
      align: "right",
      render: (v: number) => {
        const num = Number(v);
        const color = num >= 0 ? "#10b981" : "#ef4444";
        return (
          <Text strong style={{ color }}>
            {fmt(num)}
          </Text>
        );
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout
      currentPage="GeneralLedger"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.gl.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Toolbar Card ───────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("accounting.gl.selectAccount", lang)}
              value={accountId}
              onChange={handleAccountChange}
              options={accountOptions}
              style={{ minWidth: 280, flex: isMobile ? 1 : undefined }}
              suffixIcon={<SearchOutlined style={{ color: textMuted }} />}
            />

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {t("accounting.gl.from", lang)}
              </Text>
              <DatePicker
                value={fromDate}
                onChange={handleFromChange}
                style={{ width: 150 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {t("accounting.gl.to", lang)}
              </Text>
              <DatePicker
                value={toDate}
                onChange={handleToChange}
                style={{ width: 150 }}
              />
            </div>

            <Button
              type="primary"
              icon={<FileTextOutlined />}
              onClick={handleGenerate}
              disabled={!canGenerate}
              loading={isFetching}
            >
              {t("accounting.gl.generate", lang)}
            </Button>

            {data.length > 0 && (
              <Button icon={<DownloadOutlined />} onClick={handleExport}>
                {t("accounting.gl.export", lang)}
              </Button>
            )}
          </div>
        </Card>

        {/* ── KPI Summary Cards ──────────────────────────────────────────── */}
        {data.length > 0 && (
          <Row gutter={[16, 16]}>
            {[
              {
                title: t("accounting.gl.debit", lang),
                value: fmt(totalDebit),
                icon: <DollarOutlined />,
                iconColor: primary,
                iconBg: `${primary}15`,
              },
              {
                title: t("accounting.gl.credit", lang),
                value: fmt(totalCredit),
                icon: <DollarOutlined />,
                iconColor: "#f59e0b",
                iconBg: "#f59e0b15",
              },
              {
                title: lang === "ar" ? "صافي الحركة" : "Net Movement",
                value: fmt(netMovement),
                icon: <SwapOutlined />,
                iconColor: netMovement >= 0 ? "#10b981" : "#ef4444",
                iconBg: netMovement >= 0 ? "#10b98115" : "#ef444415",
                valueColor: netMovement >= 0 ? "#10b981" : "#ef4444",
              },
              {
                title: lang === "ar" ? "الرصيد النهائي" : "Ending Balance",
                value: fmt(endingBalance),
                icon: <BankOutlined />,
                iconColor: "#8b5cf6",
                iconBg: "#8b5cf615",
                valueColor: endingBalance >= 0 ? "#10b981" : "#ef4444",
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
                        value={s.value}
                        styles={{ content: {
                          fontSize: 24,
                          lineHeight: 1,
                          color:
                            ((s as Record<string, unknown>).valueColor as
                              | string
                              | undefined) ?? "inherit",
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

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          {shouldFetch && data.length > 0 ? (
            <Table
              rowKey={(_, idx) => String(idx)}
              columns={columns}
              dataSource={data}
              loading={isLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}\u2013${range[1]} of ${total}`,
                pageSizeOptions: ["10", "25", "50", "100"],
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>{lang === "ar" ? "الإجمالي" : "Total"}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong>{fmt(totalDebit)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text strong>{fmt(totalCredit)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          ) : (
            <div style={{ padding: "48px 0" }}>
              <Empty
                description={
                  !accountId
                    ? t("accounting.gl.selectAccount", lang)
                    : !canGenerate
                      ? t("accounting.gl.subtitle", lang)
                      : shouldFetch && data.length === 0 && !isLoading
                        ? lang === "ar"
                          ? "لا توجد بيانات للفترة المحددة"
                          : "No data for the selected period"
                        : t("accounting.gl.subtitle", lang)
                }
              />
            </div>
          )}
        </Card>
      </Space>
    </DashboardLayout>
  );
}
