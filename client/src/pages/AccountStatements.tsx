import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService, accountsService } from "@/services/accounting.service";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type {
  AccountStatementResult,
  GeneralLedgerRow,
  Account,
} from "@/types/modules/accounting";
import {
  Card,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Spin,
  Empty,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import { DownloadOutlined, ThunderboltOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

const { Text, Title } = Typography;

function fmtNum(value: number): string {
  if (value < 0) {
    return `(${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AccountStatements() {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";

  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    dayjs().startOf("year")
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());
  const [hasQueried, setHasQueried] = useState(false);

  // Load accounts list for the selector
  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNTS_LIST_AS],
    queryFn: () => accountsService.list({ page: 1, limit: 100 }),
  });

  const accounts: Account[] = accountsData?.data ?? [];

  const accountOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.code} - ${getName(a)}`,
  }));

  const {
    data: result,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.ACCOUNT_STATEMENT,
      accountId,
      dateFrom?.format("YYYY-MM-DD"),
      dateTo?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.accountStatement(
        accountId!,
        dateFrom!.format("YYYY-MM-DD"),
        dateTo!.format("YYYY-MM-DD")
      ),
    enabled: false,
  });

  function handleGenerate() {
    if (!accountId || !dateFrom || !dateTo) return;
    setHasQueried(true);
    refetch();
  }

  const handleExportCSV = useCallback(() => {
    if (!result) return;
    const header = [
      t("accounting.as.date", lang),
      t("accounting.as.entryNumber", lang),
      t("accounting.as.description", lang),
      t("accounting.as.debit", lang),
      t("accounting.as.credit", lang),
      t("accounting.as.runningBalance", lang),
    ];
    const openingRow = [
      "",
      "",
      t("accounting.as.openingBalance", lang),
      "",
      "",
      result.openingBalance.toFixed(2),
    ];
    const movementRows = result.movements.map((r: GeneralLedgerRow) => [
      r.entryDate,
      r.entryNumber,
      `"${(r.description ?? "").replace(/"/g, '""')}"`,
      r.debit.toFixed(2),
      r.credit.toFixed(2),
      r.runningBalance.toFixed(2),
    ]);
    const closingRow = [
      "",
      "",
      t("accounting.as.closingBalance", lang),
      result.totalDebit.toFixed(2),
      result.totalCredit.toFixed(2),
      result.closingBalance.toFixed(2),
    ];
    const csv = [header, openingRow, ...movementRows, closingRow]
      .map(r => r.join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "account-statement.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [result, lang]);

  const columns: TableColumnsType<GeneralLedgerRow> = [
    {
      title: t("accounting.as.date", lang),
      dataIndex: "entryDate",
      width: 120,
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: t("accounting.as.entryNumber", lang),
      dataIndex: "entryNumber",
      width: 140,
      render: v => <Text style={{ fontFamily: "monospace" }}>{v}</Text>,
    },
    {
      title: t("accounting.as.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: v => <Text>{v ?? "—"}</Text>,
    },
    {
      title: t("accounting.as.debit", lang),
      dataIndex: "debit",
      width: 150,
      align: "right" as const,
      render: v => (
        <Text style={{ color: v < 0 ? "#ef4444" : undefined }}>
          {fmtNum(v)}
        </Text>
      ),
    },
    {
      title: t("accounting.as.credit", lang),
      dataIndex: "credit",
      width: 150,
      align: "right" as const,
      render: v => (
        <Text style={{ color: v < 0 ? "#ef4444" : undefined }}>
          {fmtNum(v)}
        </Text>
      ),
    },
    {
      title: t("accounting.as.runningBalance", lang),
      dataIndex: "runningBalance",
      width: 160,
      align: "right" as const,
      render: v => (
        <Text strong style={{ color: v < 0 ? "#ef4444" : undefined }}>
          {fmtNum(v)}
        </Text>
      ),
    },
  ];

  const canGenerate = accountId && dateFrom && dateTo;

  return (
    <DashboardLayout
      currentPage="AccountStatements"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.as.title", lang) },
      ]}
    >
      <Space
        direction="vertical"
        size={20}
        style={{ width: "100%", direction: isRTL ? "rtl" : "ltr" }}
      >
        {/* ── Page Header ──────────────────────────────────────── */}
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {t("accounting.as.title", lang)}
          </Title>
          <Text type="secondary">{t("accounting.as.subtitle", lang)}</Text>
        </div>

        {/* ── Filter Card ──────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Space wrap size={12} align="end">
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.as.selectAccount", lang)}
              </Text>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={t("accounting.as.selectAccount", lang)}
                value={accountId}
                onChange={setAccountId}
                options={accountOptions}
                loading={accountsLoading}
                style={{ width: 280 }}
              />
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.as.from", lang)}
              </Text>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                style={{ width: 160 }}
              />
            </div>
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.as.to", lang)}
              </Text>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                style={{ width: 160 }}
              />
            </div>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              disabled={!canGenerate}
              loading={isFetching}
            >
              {t("accounting.as.generate", lang)}
            </Button>
            {hasQueried && result && result.movements.length > 0 && (
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                {t("accounting.as.export", lang)}
              </Button>
            )}
          </Space>
        </Card>

        {/* ── Results ──────────────────────────────────────────── */}
        {isFetching && (
          <Card>
            <div style={{ textAlign: "center", padding: 40 }}>
              <Spin size="large" />
            </div>
          </Card>
        )}

        {hasQueried &&
          !isFetching &&
          (!result || result.movements.length === 0) && (
            <Card>
              <Empty description={t("accounting.common.noData", lang)} />
            </Card>
          )}

        {hasQueried && !isFetching && result && result.movements.length > 0 && (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey={(_, idx) => String(idx)}
              columns={columns}
              dataSource={result.movements}
              pagination={false}
              size="middle"
              scroll={{ x: "max-content" }}
              title={() => (
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#e6f4ff",
                    borderRadius: 6,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text strong>{t("accounting.as.openingBalance", lang)}</Text>
                  <Text
                    strong
                    style={{
                      fontSize: 16,
                      color: result.openingBalance < 0 ? "#ef4444" : undefined,
                    }}
                  >
                    {fmtNum(result.openingBalance)}
                  </Text>
                </div>
              )}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{ background: "#f0f5ff", fontWeight: 700 }}
                  >
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>
                        {t("accounting.as.closingBalance", lang)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text
                        strong
                        style={{
                          color: result.totalDebit < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(result.totalDebit)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text
                        strong
                        style={{
                          color: result.totalCredit < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(result.totalCredit)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text
                        strong
                        style={{
                          fontSize: 15,
                          color:
                            result.closingBalance < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(result.closingBalance)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        )}
      </Space>
    </DashboardLayout>
  );
}
