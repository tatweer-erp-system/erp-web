import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { reportsService, accountsService } from "@/services/accounting.service";
import { useQuery } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import type { GeneralLedgerRow, Account } from "@/types/modules/accounting";
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

export default function GeneralLedger() {
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
    queryKey: [QUERY_KEYS.ACCOUNTS_LIST_GL],
    queryFn: () => accountsService.list({ page: 1, limit: 100 }),
  });

  const accounts: Account[] = accountsData?.data ?? [];

  const accountOptions = accounts.map(a => ({
    value: a.id,
    label: `${a.code} - ${getName(a)}`,
  }));

  const {
    data: rows,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.GENERAL_LEDGER,
      accountId,
      dateFrom?.format("YYYY-MM-DD"),
      dateTo?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.generalLedger(
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
    if (!rows || rows.length === 0) return;
    const header = [
      t("accounting.gl.date", lang),
      t("accounting.gl.entryNumber", lang),
      t("accounting.gl.description", lang),
      t("accounting.gl.debit", lang),
      t("accounting.gl.credit", lang),
      t("accounting.gl.runningBalance", lang),
    ];
    const csvRows = rows.map((r: GeneralLedgerRow) => [
      r.entryDate,
      r.entryNumber,
      `"${(r.description ?? "").replace(/"/g, '""')}"`,
      r.debit.toFixed(2),
      r.credit.toFixed(2),
      r.runningBalance.toFixed(2),
    ]);
    const csv = [header, ...csvRows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "general-ledger.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [rows, lang]);

  const columns: TableColumnsType<GeneralLedgerRow> = [
    {
      title: t("accounting.gl.date", lang),
      dataIndex: "entryDate",
      width: 120,
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: t("accounting.gl.entryNumber", lang),
      dataIndex: "entryNumber",
      width: 140,
      render: v => <Text style={{ fontFamily: "monospace" }}>{v}</Text>,
    },
    {
      title: t("accounting.gl.description", lang),
      dataIndex: "description",
      ellipsis: true,
      render: v => <Text>{v ?? "—"}</Text>,
    },
    {
      title: t("accounting.gl.debit", lang),
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
      title: t("accounting.gl.credit", lang),
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
      title: t("accounting.gl.runningBalance", lang),
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
      currentPage="GeneralLedger"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.gl.title", lang) },
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
            {t("accounting.gl.title", lang)}
          </Title>
          <Text type="secondary">{t("accounting.gl.subtitle", lang)}</Text>
        </div>

        {/* ── Filter Card ──────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Space wrap size={12} align="end">
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.gl.selectAccount", lang)}
              </Text>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder={t("accounting.gl.selectAccount", lang)}
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
                {t("accounting.gl.from", lang)}
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
                {t("accounting.gl.to", lang)}
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
              {t("accounting.gl.generate", lang)}
            </Button>
            {hasQueried && rows && rows.length > 0 && (
              <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
                {t("accounting.gl.export", lang)}
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

        {hasQueried && !isFetching && (!rows || rows.length === 0) && (
          <Card>
            <Empty description={t("accounting.common.noData", lang)} />
          </Card>
        )}

        {hasQueried && !isFetching && rows && rows.length > 0 && (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey={(_, idx) => String(idx)}
              columns={columns}
              dataSource={rows}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ["25", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} / ${total}`,
              }}
              size="middle"
              scroll={{ x: "max-content" }}
            />
          </Card>
        )}
      </Space>
    </DashboardLayout>
  );
}
