import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Space,
  Typography,
  Button,
  Select,
  Timeline,
  Descriptions,
  Divider,
  Alert,
  Statistic,
  Tooltip,
  Dropdown,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ExportOutlined,
  PercentageOutlined,
  FileTextOutlined,
  BankOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FilingStatus } from "@/constants/enums";
import { t } from "@/i18n";
import { useLangStore } from "@/stores/lang.store";

const { Text, Title } = Typography;

// ─── Mock data ─────────────────────────────────────────────────────────────────

interface TaxPeriod {
  key: string;
  period: string;
  dueDate: string;
  taxableOutput: number;
  outputVAT: number;
  taxableInput: number;
  inputVAT: number;
  netVAT: number;
  status: FilingStatus;
  refNo: string;
}

const taxPeriods: TaxPeriod[] = [
  {
    key: "1",
    period: "Jan 2024",
    dueDate: "2024-02-28",
    taxableOutput: 142000,
    outputVAT: 21300,
    taxableInput: 98000,
    inputVAT: 14700,
    netVAT: 6600,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-001",
  },
  {
    key: "2",
    period: "Feb 2024",
    dueDate: "2024-03-31",
    taxableOutput: 168000,
    outputVAT: 25200,
    taxableInput: 112000,
    inputVAT: 16800,
    netVAT: 8400,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-002",
  },
  {
    key: "3",
    period: "Mar 2024",
    dueDate: "2024-04-30",
    taxableOutput: 195000,
    outputVAT: 29250,
    taxableInput: 138000,
    inputVAT: 20700,
    netVAT: 8550,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-003",
  },
  {
    key: "4",
    period: "Apr 2024",
    dueDate: "2024-05-31",
    taxableOutput: 183000,
    outputVAT: 27450,
    taxableInput: 154000,
    inputVAT: 23100,
    netVAT: 4350,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-004",
  },
  {
    key: "5",
    period: "May 2024",
    dueDate: "2024-06-30",
    taxableOutput: 221000,
    outputVAT: 33150,
    taxableInput: 167000,
    inputVAT: 25050,
    netVAT: 8100,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-005",
  },
  {
    key: "6",
    period: "Jun 2024",
    dueDate: "2024-07-31",
    taxableOutput: 247000,
    outputVAT: 37050,
    taxableInput: 189000,
    inputVAT: 28350,
    netVAT: 8700,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-006",
  },
  {
    key: "7",
    period: "Jul 2024",
    dueDate: "2024-08-31",
    taxableOutput: 238000,
    outputVAT: 35700,
    taxableInput: 172000,
    inputVAT: 25800,
    netVAT: 9900,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-007",
  },
  {
    key: "8",
    period: "Aug 2024",
    dueDate: "2024-09-30",
    taxableOutput: 264000,
    outputVAT: 39600,
    taxableInput: 198000,
    inputVAT: 29700,
    netVAT: 9900,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-008",
  },
  {
    key: "9",
    period: "Sep 2024",
    dueDate: "2024-10-31",
    taxableOutput: 289000,
    outputVAT: 43350,
    taxableInput: 212000,
    inputVAT: 31800,
    netVAT: 11550,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-009",
  },
  {
    key: "10",
    period: "Oct 2024",
    dueDate: "2024-11-30",
    taxableOutput: 271000,
    outputVAT: 40650,
    taxableInput: 204000,
    inputVAT: 30600,
    netVAT: 10050,
    status: FilingStatus.FILED,
    refNo: "VAT-2024-010",
  },
  {
    key: "11",
    period: "Nov 2024",
    dueDate: "2024-12-31",
    taxableOutput: 318000,
    outputVAT: 47700,
    taxableInput: 241000,
    inputVAT: 36150,
    netVAT: 11550,
    status: FilingStatus.PENDING,
    refNo: "—",
  },
  {
    key: "12",
    period: "Dec 2024",
    dueDate: "2025-01-31",
    taxableOutput: 356000,
    outputVAT: 53400,
    taxableInput: 268000,
    inputVAT: 40200,
    netVAT: 13200,
    status: FilingStatus.DRAFT,
    refNo: "—",
  },
];

function fmt(n: number) {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function fmtFull(n: number) {
  return `$${n.toLocaleString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaxReports() {
  const { token } = antTheme.useToken();
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";
  const [year, setYear] = useState("2024");

  const chartData = taxPeriods.map(p => ({
    month: p.period.split(" ")[0],
    [t("accounting.tax.outputVat", lang)]: p.outputVAT,
    [t("accounting.tax.inputVat", lang)]: p.inputVAT,
    [t("accounting.tax.netVat", lang)]: p.netVAT,
  }));

  const STATUS_META: Record<
    FilingStatus,
    { color: string; label: string; icon: React.ReactNode }
  > = {
    filed: {
      color: "success",
      label: t("accounting.tax.statusFiled", lang),
      icon: <CheckCircleOutlined />,
    },
    pending: {
      color: "processing",
      label: t("accounting.tax.statusPending", lang),
      icon: <ClockCircleOutlined />,
    },
    overdue: {
      color: "error",
      label: t("accounting.tax.statusOverdue", lang),
      icon: <ExclamationCircleOutlined />,
    },
    draft: {
      color: "default",
      label: t("accounting.tax.statusDraft", lang),
      icon: <FileTextOutlined />,
    },
  };

  const totalOutputVAT = taxPeriods.reduce((s, p) => s + p.outputVAT, 0);
  const totalInputVAT = taxPeriods.reduce((s, p) => s + p.inputVAT, 0);
  const totalNetVAT = taxPeriods.reduce((s, p) => s + p.netVAT, 0);
  const filedCount = taxPeriods.filter(
    p => p.status === FilingStatus.FILED
  ).length;

  const columns: TableColumnsType<TaxPeriod> = [
    {
      title: t("accounting.tax.colPeriod", lang),
      dataIndex: "period",
      render: v => <Text strong>{v}</Text>,
      width: 110,
    },
    {
      title: t("accounting.tax.colDueDate", lang),
      dataIndex: "dueDate",
      render: v => <Text type="secondary">{v}</Text>,
      width: 120,
    },
    {
      title: t("accounting.tax.colTaxableOutput", lang),
      dataIndex: "taxableOutput",
      align: "right",
      render: v => <Text>{fmtFull(v)}</Text>,
    },
    {
      title: t("accounting.tax.colOutputVat", lang),
      dataIndex: "outputVAT",
      align: "right",
      render: v => <Text style={{ color: "#EF4444" }}>{fmtFull(v)}</Text>,
    },
    {
      title: t("accounting.tax.colTaxableInput", lang),
      dataIndex: "taxableInput",
      align: "right",
      render: v => <Text>{fmtFull(v)}</Text>,
    },
    {
      title: t("accounting.tax.colInputVat", lang),
      dataIndex: "inputVAT",
      align: "right",
      render: v => <Text style={{ color: "#10B981" }}>{fmtFull(v)}</Text>,
    },
    {
      title: t("accounting.tax.colNetVatPayable", lang),
      dataIndex: "netVAT",
      align: "right",
      sorter: (a, b) => a.netVAT - b.netVAT,
      render: v => (
        <Text strong style={{ color: token.colorPrimary }}>
          {fmtFull(v)}
        </Text>
      ),
    },
    {
      title: t("accounting.tax.colStatus", lang),
      dataIndex: "status",
      align: "center",
      width: 110,
      render: (v: FilingStatus) => (
        <Tag
          icon={STATUS_META[v].icon}
          color={STATUS_META[v].color}
          style={{ borderRadius: 20 }}
        >
          {STATUS_META[v].label}
        </Tag>
      ),
    },
    {
      title: t("accounting.tax.colRefNo", lang),
      dataIndex: "refNo",
      render: v =>
        v === "—" ? (
          <Text type="secondary">—</Text>
        ) : (
          <Text code style={{ fontSize: 11 }}>
            {v}
          </Text>
        ),
    },
  ];

  function handleExport() {
    const csv = [
      [
        t("accounting.tax.colPeriod", lang),
        t("accounting.tax.colDueDate", lang),
        t("accounting.tax.colTaxableOutput", lang),
        t("accounting.tax.colOutputVat", lang),
        t("accounting.tax.colTaxableInput", lang),
        t("accounting.tax.colInputVat", lang),
        t("accounting.tax.netVat", lang),
        t("accounting.tax.colStatus", lang),
        t("accounting.tax.colRefNo", lang),
      ],
      ...taxPeriods.map(p => [
        p.period,
        p.dueDate,
        p.taxableOutput,
        p.outputVAT,
        p.taxableInput,
        p.inputVAT,
        p.netVAT,
        p.status,
        p.refNo,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `vat-report-${year}.csv`;
    a.click();
  }

  return (
    <DashboardLayout
      currentPage={t("Tax Reports", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("accounting.tax.breadcrumbReports", lang) },
        { label: t("accounting.tax.breadcrumbTax", lang) },
      ]}
    >
      <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <Space orientation="vertical" size={20} style={{ width: "100%" }}>
          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <Space>
              <PercentageOutlined
                style={{ fontSize: 22, color: token.colorPrimary }}
              />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {t("accounting.tax.title", lang)}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("accounting.tax.subtitle", lang)}
                </Text>
              </div>
            </Space>
            <Space>
              <Select
                value={year}
                onChange={setYear}
                style={{ width: 120 }}
                options={[
                  {
                    value: "2024",
                    label: `${t("accounting.tax.fy", lang)} 2024`,
                  },
                  {
                    value: "2023",
                    label: `${t("accounting.tax.fy", lang)} 2023`,
                  },
                ]}
              />
              <Tooltip title={t("accounting.tax.print", lang)}>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "csv",
                      label: t("accounting.tax.exportCsv", lang),
                      icon: <ExportOutlined />,
                      onClick: handleExport,
                    },
                    {
                      key: "xlsx",
                      label: t("accounting.tax.exportExcel", lang),
                      icon: <ExportOutlined />,
                    },
                    {
                      key: "pdf",
                      label: t("accounting.tax.exportPdf", lang),
                      icon: <ExportOutlined />,
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  {t("accounting.tax.export", lang)}
                </Button>
              </Dropdown>
            </Space>
          </div>

          {/* ── Summary KPIs ────────────────────────────────────────────────── */}
          <Row gutter={[16, 16]}>
            {[
              {
                label: t("accounting.tax.totalOutputVat", lang),
                value: fmt(totalOutputVAT),
                color: "#EF4444",
                icon: <PercentageOutlined />,
                sub: t("accounting.tax.collectedFromCustomers", lang),
              },
              {
                label: t("accounting.tax.totalInputVat", lang),
                value: fmt(totalInputVAT),
                color: "#10B981",
                icon: <BankOutlined />,
                sub: t("accounting.tax.paidToVendors", lang),
              },
              {
                label: t("accounting.tax.netVatPayable", lang),
                value: fmt(totalNetVAT),
                color: token.colorPrimary,
                icon: <FileTextOutlined />,
                sub: t("accounting.tax.totalLiabilityYtd", lang),
              },
              {
                label: t("accounting.tax.filingCompliance", lang),
                value: `${filedCount}/12`,
                color: "#F59E0B",
                icon: <CalendarOutlined />,
                sub: t("accounting.tax.periodsFiledOnTime", lang),
              },
            ].map(k => (
              <Col xs={24} sm={12} lg={6} key={k.label}>
                <Card
                  size="small"
                  styles={{ body: { padding: "20px" } }}
                  style={{ borderTop: `4px solid ${k.color}` }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}
                      >
                        {k.label}
                      </Text>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: k.color,
                          lineHeight: 1.2,
                          marginTop: 6,
                        }}
                      >
                        {k.value}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {k.sub}
                      </Text>
                    </div>
                    <div
                      style={{ fontSize: 24, color: k.color, opacity: 0.25 }}
                    >
                      {k.icon}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ── Pending alert ───────────────────────────────────────────────── */}
          <Alert
            icon={<ClockCircleOutlined />}
            showIcon
            type="info"
            message={t("accounting.tax.pendingAlert", lang)}
            action={
              <Button size="small" type="primary">
                {t("accounting.tax.fileNow", lang)}
              </Button>
            }
            style={{ borderRadius: 8 }}
          />

          {/* ── VAT chart + Tax registration ────────────────────────────────── */}
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <Text strong>{t("accounting.tax.vatByPeriod", lang)}</Text>
                }
                styles={{ body: { paddingTop: 8 } }}
              >
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border,#e2e8f0)"
                    />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={v => `$${v / 1000}K`}
                      tick={{ fontSize: 11 }}
                    />
                    <RTooltip
                      formatter={(v: number) => `$${v.toLocaleString()}`}
                    />
                    <Legend />
                    <Bar
                      dataKey={t("accounting.tax.outputVat", lang)}
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      opacity={0.85}
                    />
                    <Bar
                      dataKey={t("accounting.tax.inputVat", lang)}
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                      opacity={0.85}
                    />
                    <Bar
                      dataKey={t("accounting.tax.netVat", lang)}
                      fill={token.colorPrimary}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Space
                direction="vertical"
                size={12}
                style={{ width: "100%", height: "100%" }}
              >
                {/* Tax registration info */}
                <Card
                  title={
                    <Space>
                      <BankOutlined />
                      <Text strong>
                        {t("accounting.tax.taxRegistration", lang)}
                      </Text>
                    </Space>
                  }
                  size="small"
                  style={{ flex: 1 }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t("accounting.tax.trn", lang)}>
                      <Text code>TRN-100248916-003</Text>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.tax.taxRate", lang)}
                    >
                      <Tag color="blue">15% VAT</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.tax.filingFreq", lang)}
                    >
                      {t("accounting.tax.monthly", lang)}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.tax.regDate", lang)}
                    >
                      Jan 1, 2019
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("accounting.tax.authority", lang)}
                    >
                      ZATCA
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Filing timeline */}
                <Card
                  title={
                    <Space>
                      <CalendarOutlined />
                      <Text strong>
                        {t("accounting.tax.recentActivity", lang)}
                      </Text>
                    </Space>
                  }
                  size="small"
                  style={{ flex: 1 }}
                  styles={{ body: { paddingTop: 8 } }}
                >
                  <Timeline
                    items={[
                      {
                        color: "gray",
                        children: (
                          <Text style={{ fontSize: 12 }}>
                            {t("accounting.tax.decReturnDraft", lang)}
                          </Text>
                        ),
                      },
                      {
                        color: "blue",
                        children: (
                          <Text style={{ fontSize: 12 }}>
                            {t("accounting.tax.novReturnDue", lang)}
                          </Text>
                        ),
                      },
                      {
                        color: "green",
                        children: (
                          <Text style={{ fontSize: 12 }}>
                            {t("accounting.tax.octReturnFiled", lang)}
                          </Text>
                        ),
                      },
                      {
                        color: "green",
                        children: (
                          <Text style={{ fontSize: 12 }}>
                            {t("accounting.tax.sepReturnFiled", lang)}
                          </Text>
                        ),
                      },
                      {
                        color: "green",
                        children: (
                          <Text style={{ fontSize: 12 }}>
                            {t("accounting.tax.q3AuditCompleted", lang)}
                          </Text>
                        ),
                      },
                    ]}
                  />
                </Card>
              </Space>
            </Col>
          </Row>

          {/* ── Detail table ────────────────────────────────────────────────── */}
          <Card
            title={
              <Text strong>{t("accounting.tax.monthlyVatFiling", lang)}</Text>
            }
            styles={{ body: { padding: 0 } }}
          >
            <Table
              rowKey="key"
              size="small"
              columns={columns}
              dataSource={taxPeriods}
              scroll={{ x: "max-content" }}
              pagination={false}
              rowClassName={row =>
                row.status === FilingStatus.PENDING ||
                row.status === FilingStatus.DRAFT
                  ? "opacity-80"
                  : ""
              }
              summary={() => (
                <Table.Summary.Row style={{ background: token.colorFillAlter }}>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <Text strong>
                      {t("accounting.tax.totalFy", lang)} {year}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    <Text strong>
                      {fmtFull(
                        taxPeriods.reduce((s, p) => s + p.taxableOutput, 0)
                      )}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong style={{ color: "#EF4444" }}>
                      {fmtFull(totalOutputVAT)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong>
                      {fmtFull(
                        taxPeriods.reduce((s, p) => s + p.taxableInput, 0)
                      )}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ color: "#10B981" }}>
                      {fmtFull(totalInputVAT)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <Text strong style={{ color: token.colorPrimary }}>
                      {fmtFull(totalNetVAT)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} colSpan={2} align="center">
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      {filedCount} {t("accounting.tax.ofFiled", lang)}
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Space>
      </div>
    </DashboardLayout>
  );
}
