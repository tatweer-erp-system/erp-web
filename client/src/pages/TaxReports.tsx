import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card, Row, Col, Table, Tag, Space, Typography, Button, Select,
  Timeline, Descriptions, Divider, Alert, Statistic, Tooltip, Dropdown,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  PrinterOutlined, DownloadOutlined, ExportOutlined, PercentageOutlined,
  FileTextOutlined, BankOutlined, CalendarOutlined,
} from "@ant-design/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, Legend, ResponsiveContainer,
} from "recharts";

const { Text, Title } = Typography;

// ─── Mock data ─────────────────────────────────────────────────────────────────

type FilingStatus = "filed" | "pending" | "overdue" | "draft";

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
  { key: "1",  period: "Jan 2024", dueDate: "2024-02-28", taxableOutput: 142000, outputVAT: 21300, taxableInput: 98000,  inputVAT: 14700, netVAT: 6600,  status: "filed",   refNo: "VAT-2024-001" },
  { key: "2",  period: "Feb 2024", dueDate: "2024-03-31", taxableOutput: 168000, outputVAT: 25200, taxableInput: 112000, inputVAT: 16800, netVAT: 8400,  status: "filed",   refNo: "VAT-2024-002" },
  { key: "3",  period: "Mar 2024", dueDate: "2024-04-30", taxableOutput: 195000, outputVAT: 29250, taxableInput: 138000, inputVAT: 20700, netVAT: 8550,  status: "filed",   refNo: "VAT-2024-003" },
  { key: "4",  period: "Apr 2024", dueDate: "2024-05-31", taxableOutput: 183000, outputVAT: 27450, taxableInput: 154000, inputVAT: 23100, netVAT: 4350,  status: "filed",   refNo: "VAT-2024-004" },
  { key: "5",  period: "May 2024", dueDate: "2024-06-30", taxableOutput: 221000, outputVAT: 33150, taxableInput: 167000, inputVAT: 25050, netVAT: 8100,  status: "filed",   refNo: "VAT-2024-005" },
  { key: "6",  period: "Jun 2024", dueDate: "2024-07-31", taxableOutput: 247000, outputVAT: 37050, taxableInput: 189000, inputVAT: 28350, netVAT: 8700,  status: "filed",   refNo: "VAT-2024-006" },
  { key: "7",  period: "Jul 2024", dueDate: "2024-08-31", taxableOutput: 238000, outputVAT: 35700, taxableInput: 172000, inputVAT: 25800, netVAT: 9900,  status: "filed",   refNo: "VAT-2024-007" },
  { key: "8",  period: "Aug 2024", dueDate: "2024-09-30", taxableOutput: 264000, outputVAT: 39600, taxableInput: 198000, inputVAT: 29700, netVAT: 9900,  status: "filed",   refNo: "VAT-2024-008" },
  { key: "9",  period: "Sep 2024", dueDate: "2024-10-31", taxableOutput: 289000, outputVAT: 43350, taxableInput: 212000, inputVAT: 31800, netVAT: 11550, status: "filed",   refNo: "VAT-2024-009" },
  { key: "10", period: "Oct 2024", dueDate: "2024-11-30", taxableOutput: 271000, outputVAT: 40650, taxableInput: 204000, inputVAT: 30600, netVAT: 10050, status: "filed",   refNo: "VAT-2024-010" },
  { key: "11", period: "Nov 2024", dueDate: "2024-12-31", taxableOutput: 318000, outputVAT: 47700, taxableInput: 241000, inputVAT: 36150, netVAT: 11550, status: "pending", refNo: "—" },
  { key: "12", period: "Dec 2024", dueDate: "2025-01-31", taxableOutput: 356000, outputVAT: 53400, taxableInput: 268000, inputVAT: 40200, netVAT: 13200, status: "draft",   refNo: "—" },
];

const chartData = taxPeriods.map((p) => ({
  month: p.period.split(" ")[0],
  "Output VAT": p.outputVAT,
  "Input VAT":  p.inputVAT,
  "Net VAT":    p.netVAT,
}));

const STATUS_META: Record<FilingStatus, { color: string; label: string; icon: React.ReactNode }> = {
  filed:   { color: "success",   label: "Filed",   icon: <CheckCircleOutlined /> },
  pending: { color: "processing",label: "Pending", icon: <ClockCircleOutlined /> },
  overdue: { color: "error",     label: "Overdue", icon: <ExclamationCircleOutlined /> },
  draft:   { color: "default",   label: "Draft",   icon: <FileTextOutlined /> },
};

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
  const [year, setYear] = useState("2024");

  const totalOutputVAT = taxPeriods.reduce((s, p) => s + p.outputVAT, 0);
  const totalInputVAT  = taxPeriods.reduce((s, p) => s + p.inputVAT, 0);
  const totalNetVAT    = taxPeriods.reduce((s, p) => s + p.netVAT, 0);
  const filedCount     = taxPeriods.filter((p) => p.status === "filed").length;

  const columns: TableColumnsType<TaxPeriod> = [
    { title: "Period",       dataIndex: "period",       render: (v) => <Text strong>{v}</Text>, width: 110 },
    { title: "Due Date",     dataIndex: "dueDate",      render: (v) => <Text type="secondary">{v}</Text>, width: 120 },
    { title: "Taxable Output", dataIndex: "taxableOutput", align: "right", render: (v) => <Text>{fmtFull(v)}</Text> },
    { title: "Output VAT",   dataIndex: "outputVAT",    align: "right", render: (v) => <Text style={{ color: "#EF4444" }}>{fmtFull(v)}</Text> },
    { title: "Taxable Input", dataIndex: "taxableInput", align: "right", render: (v) => <Text>{fmtFull(v)}</Text> },
    { title: "Input VAT",    dataIndex: "inputVAT",     align: "right", render: (v) => <Text style={{ color: "#10B981" }}>{fmtFull(v)}</Text> },
    {
      title: "Net VAT Payable", dataIndex: "netVAT", align: "right", sorter: (a, b) => a.netVAT - b.netVAT,
      render: (v) => <Text strong style={{ color: token.colorPrimary }}>{fmtFull(v)}</Text>,
    },
    {
      title: "Status", dataIndex: "status", align: "center", width: 110,
      render: (v: FilingStatus) => (
        <Tag icon={STATUS_META[v].icon} color={STATUS_META[v].color} style={{ borderRadius: 20 }}>
          {STATUS_META[v].label}
        </Tag>
      ),
    },
    { title: "Ref #", dataIndex: "refNo", render: (v) => v === "—" ? <Text type="secondary">—</Text> : <Text code style={{ fontSize: 11 }}>{v}</Text> },
  ];

  function handleExport() {
    const csv = [
      ["Period","Due Date","Taxable Output","Output VAT","Taxable Input","Input VAT","Net VAT","Status","Ref #"],
      ...taxPeriods.map((p) => [p.period,p.dueDate,p.taxableOutput,p.outputVAT,p.taxableInput,p.inputVAT,p.netVAT,p.status,p.refNo]),
    ].map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `vat-report-${year}.csv`;
    a.click();
  }

  return (
    <DashboardLayout
      currentPage="Tax Reports"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Reports" }, { label: "Tax" }]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Space>
            <PercentageOutlined style={{ fontSize: 22, color: token.colorPrimary }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>VAT / Tax Report</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>Value Added Tax — Filing Summary</Text>
            </div>
          </Space>
          <Space>
            <Select
              value={year}
              onChange={setYear}
              style={{ width: 120 }}
              options={[{ value: "2024", label: "FY 2024" }, { value: "2023", label: "FY 2023" }]}
            />
            <Tooltip title="Print"><Button icon={<PrinterOutlined />} onClick={() => window.print()} /></Tooltip>
            <Dropdown menu={{ items: [
              { key: "csv",  label: "Export CSV",   icon: <ExportOutlined />, onClick: handleExport },
              { key: "xlsx", label: "Export Excel", icon: <ExportOutlined /> },
              { key: "pdf",  label: "Export PDF",   icon: <ExportOutlined /> },
            ]}}>
              <Button icon={<DownloadOutlined />}>Export</Button>
            </Dropdown>
          </Space>
        </div>

        {/* ── Summary KPIs ────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            { label: "Total Output VAT",  value: fmt(totalOutputVAT), color: "#EF4444", icon: <PercentageOutlined />, sub: "Collected from customers" },
            { label: "Total Input VAT",   value: fmt(totalInputVAT),  color: "#10B981", icon: <BankOutlined />,       sub: "Paid to vendors" },
            { label: "Net VAT Payable",   value: fmt(totalNetVAT),    color: token.colorPrimary, icon: <FileTextOutlined />, sub: "Total liability YTD" },
            { label: "Filing Compliance", value: `${filedCount}/12`,  color: "#F59E0B", icon: <CalendarOutlined />,   sub: "Periods filed on time" },
          ].map((k) => (
            <Col xs={24} sm={12} lg={6} key={k.label}>
              <Card size="small" styles={{ body: { padding: "20px" } }} style={{ borderTop: `4px solid ${k.color}` }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em" }}>{k.label}</Text>
                    <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1.2, marginTop: 6 }}>{k.value}</div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{k.sub}</Text>
                  </div>
                  <div style={{ fontSize: 24, color: k.color, opacity: 0.25 }}>{k.icon}</div>
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
          message="November 2024 VAT return is pending filing. Due date: December 31, 2024."
          action={<Button size="small" type="primary">File Now</Button>}
          style={{ borderRadius: 8 }}
        />

        {/* ── VAT chart + Tax registration ────────────────────────────────── */}
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <Card title={<Text strong>VAT by Period (Monthly)</Text>} styles={{ body: { paddingTop: 8 } }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border,#e2e8f0)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `$${v / 1000}K`} tick={{ fontSize: 11 }} />
                  <RTooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="Output VAT" fill="#EF4444" radius={[4,4,0,0]} opacity={0.85} />
                  <Bar dataKey="Input VAT"  fill="#10B981" radius={[4,4,0,0]} opacity={0.85} />
                  <Bar dataKey="Net VAT"    fill={token.colorPrimary} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={12} style={{ width: "100%", height: "100%" }}>
              {/* Tax registration info */}
              <Card title={<Space><BankOutlined /><Text strong>Tax Registration</Text></Space>} size="small" style={{ flex: 1 }}>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="TRN"         ><Text code>TRN-100248916-003</Text></Descriptions.Item>
                  <Descriptions.Item label="Tax Rate"    ><Tag color="blue">15% VAT</Tag></Descriptions.Item>
                  <Descriptions.Item label="Filing Freq" >Monthly</Descriptions.Item>
                  <Descriptions.Item label="Reg. Date"   >Jan 1, 2019</Descriptions.Item>
                  <Descriptions.Item label="Authority"   >ZATCA</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Filing timeline */}
              <Card title={<Space><CalendarOutlined /><Text strong>Recent Activity</Text></Space>} size="small" style={{ flex: 1 }} styles={{ body: { paddingTop: 8 } }}>
                <Timeline
                  items={[
                    { color: "gray",  children: <Text style={{ fontSize: 12 }}>Dec 2024 return — <Text type="secondary">Draft in progress</Text></Text> },
                    { color: "blue",  children: <Text style={{ fontSize: 12 }}>Nov 2024 return — <Text type="secondary">Due Dec 31</Text></Text> },
                    { color: "green", children: <Text style={{ fontSize: 12 }}>Oct 2024 return filed <Text type="secondary">(VAT-2024-010)</Text></Text> },
                    { color: "green", children: <Text style={{ fontSize: 12 }}>Sep 2024 return filed <Text type="secondary">(VAT-2024-009)</Text></Text> },
                    { color: "green", children: <Text style={{ fontSize: 12 }}>Q3 audit completed successfully</Text> },
                  ]}
                />
              </Card>
            </Space>
          </Col>
        </Row>

        {/* ── Detail table ────────────────────────────────────────────────── */}
        <Card
          title={<Text strong>Monthly VAT Filing Details</Text>}
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            size="small"
            columns={columns}
            dataSource={taxPeriods}
            scroll={{ x: "max-content" }}
            pagination={false}
            rowClassName={(row) => row.status === "pending" || row.status === "draft" ? "opacity-80" : ""}
            summary={() => (
              <Table.Summary.Row style={{ background: token.colorFillAlter }}>
                <Table.Summary.Cell index={0} colSpan={2}><Text strong>TOTAL FY {year}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><Text strong>{fmtFull(taxPeriods.reduce((s,p)=>s+p.taxableOutput,0))}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right"><Text strong style={{ color: "#EF4444" }}>{fmtFull(totalOutputVAT)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right"><Text strong>{fmtFull(taxPeriods.reduce((s,p)=>s+p.taxableInput,0))}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right"><Text strong style={{ color: "#10B981" }}>{fmtFull(totalInputVAT)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right"><Text strong style={{ color: token.colorPrimary }}>{fmtFull(totalNetVAT)}</Text></Table.Summary.Cell>
                <Table.Summary.Cell index={7} colSpan={2} align="center">
                  <Tag color="success" icon={<CheckCircleOutlined />}>{filedCount} of 12 Filed</Tag>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>

      </Space>
    </DashboardLayout>
  );
}
