import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreateQuotationModal } from "@/pages/CreateQuotation";
import { useLangStore } from "@/stores/lang.store";
import { useThemeStore } from "@/stores/theme.store";
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Select,
  Tooltip,
  Popconfirm,
  message,
  Typography,
  Dropdown,
  Segmented,
  Avatar,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  SwapOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { QuotationStatus } from "@/constants/enums";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Quotation {
  id: number;
  quoteNo: string;
  customer: string;
  amount: number;
  status: QuotationStatus;
  date: string;
  validUntil: string;
  salesRep: string;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const quotationsData: Quotation[] = [
  {
    id: 1,
    quoteNo: "QT-2024-001",
    customer: "Tech Corp",
    amount: 5000,
    status: QuotationStatus.PENDING,
    date: "2024-02-20",
    validUntil: "2024-03-20",
    salesRep: "Ahmed Al-Rashid",
  },
  {
    id: 2,
    quoteNo: "QT-2024-002",
    customer: "Global Industries",
    amount: 12500,
    status: QuotationStatus.ACCEPTED,
    date: "2024-02-19",
    validUntil: "2024-03-19",
    salesRep: "Sara Johnson",
  },
  {
    id: 3,
    quoteNo: "QT-2024-003",
    customer: "Local Business",
    amount: 3200,
    status: QuotationStatus.REJECTED,
    date: "2024-02-18",
    validUntil: "2024-03-18",
    salesRep: "Mohamed Ali",
  },
  {
    id: 4,
    quoteNo: "QT-2024-004",
    customer: "Enterprise Ltd",
    amount: 25000,
    status: QuotationStatus.PENDING,
    date: "2024-02-17",
    validUntil: "2024-03-17",
    salesRep: "Emily Chen",
  },
  {
    id: 5,
    quoteNo: "QT-2024-005",
    customer: "Startup Inc",
    amount: 8750,
    status: QuotationStatus.ACCEPTED,
    date: "2024-02-16",
    validUntil: "2024-03-16",
    salesRep: "Ahmed Al-Rashid",
  },
  {
    id: 6,
    quoteNo: "QT-2024-006",
    customer: "Alpha Solutions",
    amount: 15300,
    status: QuotationStatus.EXPIRED,
    date: "2024-01-10",
    validUntil: "2024-02-10",
    salesRep: "Bob Smith",
  },
  {
    id: 7,
    quoteNo: "QT-2024-007",
    customer: "Beta Corp",
    amount: 7400,
    status: QuotationStatus.PENDING,
    date: "2024-02-15",
    validUntil: "2024-03-15",
    salesRep: "Sara Johnson",
  },
];

const STATUS_TAG: Record<QuotationStatus, { color: string; label: string }> = {
  [QuotationStatus.PENDING]: { color: "orange", label: "Pending" },
  [QuotationStatus.ACCEPTED]: { color: "success", label: "Accepted" },
  [QuotationStatus.REJECTED]: { color: "error", label: "Rejected" },
  [QuotationStatus.EXPIRED]: { color: "default", label: "Expired" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Quotations() {
  const lang = useLangStore(s => s.lang);
  const theme = useThemeStore(s => s.mode);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const borderSub = theme === "dark" ? "#232923" : "#EFF3F7";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorBorderSecondary: borderSub,
    colorTextQuaternary: textMuted,
  };
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Quotation | null>(null);
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let d = quotationsData;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(
        i =>
          i.quoteNo.toLowerCase().includes(q) ||
          i.customer.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") d = d.filter(i => i.status === statusFilter);
    return d;
  }, [search, statusFilter]);

  const totalValue = quotationsData.reduce((s, i) => s + i.amount, 0);

  function handleExport() {
    const csv = [
      [
        "Quote No",
        "Customer",
        "Amount",
        "Status",
        "Date",
        "Valid Until",
        "Sales Rep",
      ],
      ...filtered.map(i => [
        i.quoteNo,
        i.customer,
        `$${i.amount}`,
        i.status,
        i.date,
        i.validUntil,
        i.salesRep,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "quotations.csv";
    a.click();
  }

  function openEdit(record: Quotation) {
    setEditRecord(record);
    editForm.setFieldsValue(record);
    setIsEditOpen(true);
  }

  const columns: TableColumnsType<Quotation> = [
    {
      title: "Quote No",
      dataIndex: "quoteNo",
      sorter: (a, b) => a.quoteNo.localeCompare(b.quoteNo),
      render: v => (
        <Text
          strong
          style={{ color: token.colorPrimary, fontFamily: "monospace" }}
        >
          {v}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      sorter: (a, b) => a.customer.localeCompare(b.customer),
      render: v => (
        <Space>
          <Avatar
            size={28}
            style={{ background: token.colorPrimary, fontSize: 11 }}
          >
            {v.slice(0, 2).toUpperCase()}
          </Avatar>
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: v => <Text strong>${v.toLocaleString()}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: (Object.keys(STATUS_TAG) as QuotationStatus[]).map(k => ({
        text: STATUS_TAG[k].label,
        value: k,
      })),
      onFilter: (val, rec) => rec.status === val,
      render: (v: QuotationStatus) => {
        const s = STATUS_TAG[v];
        return (
          <Tag
            color={s.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {s.label}
          </Tag>
        );
      },
    },
    {
      title: "Issue Date",
      dataIndex: "date",
      sorter: (a, b) => a.date.localeCompare(b.date),
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Sales Rep",
      dataIndex: "salesRep",
      render: v => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Actions",
      align: "center",
      width: 60,
      render: (_, rec) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
                icon: <EditOutlined />,
                onClick: () => openEdit(rec),
              },
              { key: "view", label: "View Details", icon: <EyeOutlined /> },
              {
                key: "convert",
                label: "Convert to Order",
                icon: <SwapOutlined />,
              },
              { type: "divider" },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                icon: <DeleteOutlined />,
                onClick: () => message.success(`${rec.quoteNo} deleted`),
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const rowSelection: TableProps<Quotation>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as number[]),
  };

  return (
    <DashboardLayout
      currentPage="Quotations"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "#" },
        { label: "Quotations" },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: "Total Quotations",
              value: quotationsData.length,
              suffix: "all time",
              icon: <FileTextOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: "Pending",
              value: quotationsData.filter(
                i => i.status === QuotationStatus.PENDING
              ).length,
              suffix: "awaiting response",
              icon: <ClockCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: "Accepted",
              value: quotationsData.filter(
                i => i.status === QuotationStatus.ACCEPTED
              ).length,
              suffix: "converted to orders",
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: "Pipeline Value",
              value: `$${(totalValue / 1000).toFixed(0)}K`,
              suffix: "total quoted",
              icon: <DollarOutlined />,
              iconColor: "#8b5cf6",
              iconBg: "#8b5cf615",
              color: undefined,
              isStr: true,
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
                    {s.isStr ? (
                      <Text strong style={{ fontSize: 24, lineHeight: 1 }}>
                        {s.value}
                      </Text>
                    ) : (
                      <Statistic
                        value={s.value as number}
                        valueStyle={{
                          fontSize: 24,
                          lineHeight: 1,
                          color: s.color ?? "inherit",
                        }}
                      />
                    )}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {s.suffix}
                    </Text>
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
              <Input
                prefix={
                  <SearchOutlined
                    style={{ color: token.colorTextQuaternary }}
                  />
                }
                placeholder="Search by quote number or customer…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ width: 280 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "accepted", label: "Accepted" },
                  { value: "rejected", label: "Rejected" },
                  { value: "expired", label: "Expired" },
                ]}
              />
            </Space>

            <Space>
              <Tooltip title="Reload">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => message.info("Reloaded")}
                />
              </Tooltip>
              <Tooltip title="Print">
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
                      label: "Export as CSV",
                      icon: <ExportOutlined />,
                      onClick: handleExport,
                    },
                    {
                      key: "excel",
                      label: "Export as Excel",
                      icon: <ExportOutlined />,
                    },
                    {
                      key: "pdf",
                      label: "Export as PDF",
                      icon: <ExportOutlined />,
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>Export</Button>
              </Dropdown>
              <Segmented
                value={viewMode}
                onChange={v => setViewMode(v as "table" | "grid")}
                options={[
                  { value: "table", icon: <UnorderedListOutlined /> },
                  { value: "grid", icon: <AppstoreOutlined /> },
                ]}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateOpen(true)}
              >
                Create Quotation
              </Button>
            </Space>
          </div>

          {selectedRows.length > 0 && (
            <div
              style={{
                marginTop: 10,
                padding: "8px 12px",
                background: `${token.colorPrimary}10`,
                border: `1px solid ${token.colorPrimary}30`,
                borderRadius: 6,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Text strong style={{ color: token.colorPrimary }}>
                {selectedRows.length} selected
              </Text>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  message.success("Deleted");
                  setSelectedRows([]);
                }}
              >
                Delete
              </Button>
              <Button size="small" icon={<SwapOutlined />}>
                Convert to Orders
              </Button>
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                Clear
              </Button>
            </div>
          )}
        </Card>

        {/* ── Table View ─────────────────────────────────────────────────── */}
        {viewMode === "table" && (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              rowSelection={rowSelection}
              size="middle"
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} of ${total} quotations`,
                pageSizeOptions: ["5", "10", "25", "50"],
              }}
              locale={{ emptyText: "No quotations found." }}
            />
          </Card>
        )}

        {/* ── Grid View ──────────────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <Row gutter={[16, 16]}>
            {filtered.map(item => {
              const s = STATUS_TAG[item.status];
              return (
                <Col key={item.id} xs={24} sm={12} xl={8}>
                  <Card
                    size="small"
                    hoverable
                    styles={{ body: { padding: 16 } }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <Text
                          strong
                          style={{
                            fontFamily: "monospace",
                            color: token.colorPrimary,
                            display: "block",
                            marginBottom: 2,
                          }}
                        >
                          {item.quoteNo}
                        </Text>
                        <Space size={4}>
                          <Avatar
                            size={20}
                            style={{
                              background: token.colorPrimary,
                              fontSize: 10,
                            }}
                          >
                            {item.customer.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Text style={{ fontSize: 13 }}>{item.customer}</Text>
                        </Space>
                      </div>
                      <Tag color={s.color} style={{ borderRadius: 20 }}>
                        {s.label}
                      </Tag>
                    </div>

                    {/* Amount */}
                    <Text
                      strong
                      style={{
                        fontSize: 20,
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      ${item.amount.toLocaleString()}
                    </Text>

                    {/* Dates */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, display: "block" }}
                        >
                          Issue Date
                        </Text>
                        <Text style={{ fontSize: 12 }}>{item.date}</Text>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, display: "block" }}
                        >
                          Valid Until
                        </Text>
                        <Text style={{ fontSize: 12 }}>{item.validUntil}</Text>
                      </div>
                    </div>

                    {/* Actions */}
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.salesRep}
                      </Text>
                      <Space size={4}>
                        <Tooltip title="Edit">
                          <Button
                            size="small"
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(item)}
                          />
                        </Tooltip>
                        <Tooltip title="Convert to Order">
                          <Button
                            size="small"
                            type="text"
                            icon={<SwapOutlined />}
                          />
                        </Tooltip>
                        <Popconfirm
                          title="Delete this quotation?"
                          onConfirm={() => message.success("Deleted")}
                          okButtonProps={{ danger: true }}
                        >
                          <Tooltip title="Delete">
                            <Button
                              size="small"
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      </Space>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Space>

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <CreateQuotationModal onClose={() => setIsCreateOpen(false)} />
      )}

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>{editRecord?.quoteNo ?? ""}</span>
          </Space>
        }
        open={isEditOpen}
        onOk={() =>
          editForm.validateFields().then(() => {
            message.success("Quotation updated");
            setIsEditOpen(false);
          })
        }
        onCancel={() => setIsEditOpen(false)}
        okText="Save Changes"
        width={isMobile ? "95vw" : 480}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Quote Number" name="quoteNo">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Customer"
            name="customer"
            rules={[{ required: true }]}
          >
            <Input placeholder="Customer name" />
          </Form.Item>
          <Form.Item
            label="Amount ($)"
            name="amount"
            rules={[{ required: true }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: "100%" }}
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: "pending", label: "Pending" },
                { value: "accepted", label: "Accepted" },
                { value: "rejected", label: "Rejected" },
                { value: "expired", label: "Expired" },
              ]}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Issue Date" name="date">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Valid Until" name="validUntil">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
