import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { t } from "@/i18n";
import { reportsService } from "@/services/accounting.service";
import { useQuery } from "@tanstack/react-query";
import { AccountType } from "@/constants/enums";
import type { TrialBalanceRow } from "@/types/modules/accounting";
import {
  Card,
  Table,
  Button,
  DatePicker,
  Tag,
  Space,
  Dropdown,
  Spin,
  Empty,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";

const { Text, Title } = Typography;

const ACCOUNT_TYPE_TAG: Record<AccountType, { color: string; label: string }> =
  {
    [AccountType.ASSET]: { color: "blue", label: "Asset" },
    [AccountType.LIABILITY]: { color: "orange", label: "Liability" },
    [AccountType.EQUITY]: { color: "purple", label: "Equity" },
    [AccountType.REVENUE]: { color: "green", label: "Revenue" },
    [AccountType.EXPENSE]: { color: "red", label: "Expense" },
  };

function fmtNum(value: number): string {
  if (value < 0) {
    return `(${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TrialBalance() {
  const { language } = useAppSettings();
  const lang = language;
  const isRTL = lang === "ar";

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    dayjs().startOf("year")
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(dayjs());
  const [hasQueried, setHasQueried] = useState(false);

  const {
    data: result,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "trial-balance",
      dateFrom?.format("YYYY-MM-DD"),
      dateTo?.format("YYYY-MM-DD"),
    ],
    queryFn: () =>
      reportsService.trialBalance(
        dateFrom!.format("YYYY-MM-DD"),
        dateTo!.format("YYYY-MM-DD")
      ),
    enabled: false,
  });

  function handleGenerate() {
    if (!dateFrom || !dateTo) return;
    setHasQueried(true);
    refetch();
  }

  function handleExport(format: "pdf" | "xlsx") {
    if (!dateFrom || !dateTo) return;
    reportsService.exportTrialBalance(
      dateFrom.format("YYYY-MM-DD"),
      dateTo.format("YYYY-MM-DD"),
      format
    );
  }

  // Group rows by accountType
  const groupedData = useMemo(() => {
    if (!result?.data) return [];
    const groups: { type: AccountType; rows: TrialBalanceRow[] }[] = [];
    const typeOrder: AccountType[] = [
      AccountType.ASSET,
      AccountType.LIABILITY,
      AccountType.EQUITY,
      AccountType.REVENUE,
      AccountType.EXPENSE,
    ];
    for (const type of typeOrder) {
      const rows = result.data.filter(r => r.accountType === type);
      if (rows.length > 0) {
        groups.push({ type, rows });
      }
    }
    return groups;
  }, [result?.data]);

  const totals = useMemo(() => {
    if (!result?.data) return { debit: 0, credit: 0, balance: 0 };
    return result.data.reduce(
      (acc, r) => ({
        debit: acc.debit + r.totalDebit,
        credit: acc.credit + r.totalCredit,
        balance: acc.balance + r.balance,
      }),
      { debit: 0, credit: 0, balance: 0 }
    );
  }, [result?.data]);

  // Flatten grouped data with section headers for the table
  const tableData = useMemo(() => {
    const rows: (TrialBalanceRow & { isGroupHeader?: boolean })[] = [];
    for (const group of groupedData) {
      rows.push({
        id: `header-${group.type}`,
        code: "",
        nameEn: ACCOUNT_TYPE_TAG[group.type].label,
        nameAr: ACCOUNT_TYPE_TAG[group.type].label,
        accountType: group.type,
        totalDebit: 0,
        totalCredit: 0,
        balance: 0,
        isGroupHeader: true,
      } as TrialBalanceRow & { isGroupHeader?: boolean });
      rows.push(...group.rows);
    }
    return rows;
  }, [groupedData]);

  const columns: TableColumnsType<
    TrialBalanceRow & { isGroupHeader?: boolean }
  > = [
    {
      title: t("accounting.tb.code", lang),
      dataIndex: "code",
      width: 140,
      render: (v, rec) =>
        rec.isGroupHeader ? null : (
          <Text style={{ fontFamily: "monospace" }}>{v}</Text>
        ),
    },
    {
      title: t("accounting.tb.accountName", lang),
      dataIndex: lang === "ar" ? "nameAr" : "nameEn",
      render: (v, rec) =>
        rec.isGroupHeader ? (
          <Text strong style={{ fontSize: 14 }}>
            {v}
          </Text>
        ) : (
          <Text>{v}</Text>
        ),
    },
    {
      title: t("accounting.tb.accountType", lang),
      dataIndex: "accountType",
      width: 120,
      render: (v: AccountType, rec) => {
        if (rec.isGroupHeader) return null;
        const tag = ACCOUNT_TYPE_TAG[v];
        return tag ? (
          <Tag
            color={tag.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {tag.label}
          </Tag>
        ) : (
          v
        );
      },
    },
    {
      title: t("accounting.tb.totalDebit", lang),
      dataIndex: "totalDebit",
      width: 160,
      align: "right" as const,
      render: (v, rec) =>
        rec.isGroupHeader ? null : (
          <Text style={{ color: v < 0 ? "#ef4444" : undefined }}>
            {fmtNum(v)}
          </Text>
        ),
    },
    {
      title: t("accounting.tb.totalCredit", lang),
      dataIndex: "totalCredit",
      width: 160,
      align: "right" as const,
      render: (v, rec) =>
        rec.isGroupHeader ? null : (
          <Text style={{ color: v < 0 ? "#ef4444" : undefined }}>
            {fmtNum(v)}
          </Text>
        ),
    },
    {
      title: t("accounting.tb.balance", lang),
      dataIndex: "balance",
      width: 160,
      align: "right" as const,
      render: (v, rec) =>
        rec.isGroupHeader ? null : (
          <Text strong style={{ color: v < 0 ? "#ef4444" : undefined }}>
            {fmtNum(v)}
          </Text>
        ),
    },
  ];

  const canGenerate = dateFrom && dateTo;

  return (
    <DashboardLayout
      currentPage="TrialBalance"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Accounting", lang), href: "#" },
        { label: t("accounting.tb.title", lang) },
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
            {t("accounting.tb.title", lang)}
          </Title>
          <Text type="secondary">{t("accounting.tb.subtitle", lang)}</Text>
        </div>

        {/* ── Filter Card ──────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Space wrap size={12} align="end">
            <div>
              <Text
                type="secondary"
                style={{ fontSize: 12, display: "block", marginBottom: 4 }}
              >
                {t("accounting.tb.from", lang)}
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
                {t("accounting.tb.to", lang)}
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
              {t("accounting.tb.generate", lang)}
            </Button>
            {hasQueried && result && (
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
              >
                <Button icon={<DownloadOutlined />}>
                  {t("accounting.tb.export", lang)}
                </Button>
              </Dropdown>
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

        {hasQueried && !isFetching && !result?.data?.length && (
          <Card>
            <Empty description={t("accounting.common.noData", lang)} />
          </Card>
        )}

        {hasQueried && !isFetching && result?.data?.length > 0 && (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={tableData}
              pagination={false}
              size="middle"
              scroll={{ x: "max-content" }}
              rowClassName={rec =>
                (rec as TrialBalanceRow & { isGroupHeader?: boolean })
                  .isGroupHeader
                  ? "ant-table-group-header"
                  : ""
              }
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row
                    style={{ background: "#fafafa", fontWeight: 700 }}
                  >
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong>{t("accounting.tb.totals", lang)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text
                        strong
                        style={{
                          color: totals.debit < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(totals.debit)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="right">
                      <Text
                        strong
                        style={{
                          color: totals.credit < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(totals.credit)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      <Text
                        strong
                        style={{
                          color: totals.balance < 0 ? "#ef4444" : undefined,
                        }}
                      >
                        {fmtNum(totals.balance)}
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
