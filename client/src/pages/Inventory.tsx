import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
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
  Progress,
  Dropdown,
  Segmented,
  Switch,
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
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  AlertOutlined,
  StopOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { StockStatus } from "@/constants/enums";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  status: StockStatus;
  price: number;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const inventoryData: InventoryItem[] = [
  {
    id: 1,
    name: 'Laptop Pro 15"',
    sku: "LAP-001",
    category: "Electronics",
    quantity: 45,
    reorderLevel: 20,
    status: StockStatus.IN_STOCK,
    price: 1299,
  },
  {
    id: 2,
    name: "Wireless Mouse",
    sku: "MOU-002",
    category: "Peripherals",
    quantity: 8,
    reorderLevel: 15,
    status: StockStatus.LOW_STOCK,
    price: 29,
  },
  {
    id: 3,
    name: "USB-C Cable",
    sku: "USB-003",
    category: "Accessories",
    quantity: 0,
    reorderLevel: 50,
    status: StockStatus.OUT_OF_STOCK,
    price: 12,
  },
  {
    id: 4,
    name: "Monitor 4K",
    sku: "MON-004",
    category: "Electronics",
    quantity: 32,
    reorderLevel: 10,
    status: StockStatus.IN_STOCK,
    price: 599,
  },
  {
    id: 5,
    name: "Mechanical Keyboard",
    sku: "KEY-005",
    category: "Peripherals",
    quantity: 5,
    reorderLevel: 10,
    status: StockStatus.LOW_STOCK,
    price: 149,
  },
  {
    id: 6,
    name: "Desk Lamp LED",
    sku: "LAM-006",
    category: "Office",
    quantity: 120,
    reorderLevel: 30,
    status: StockStatus.IN_STOCK,
    price: 45,
  },
  {
    id: 7,
    name: "Webcam HD",
    sku: "WEB-007",
    category: "Electronics",
    quantity: 0,
    reorderLevel: 20,
    status: StockStatus.OUT_OF_STOCK,
    price: 89,
  },
  {
    id: 8,
    name: "Phone Stand",
    sku: "PHO-008",
    category: "Accessories",
    quantity: 67,
    reorderLevel: 25,
    status: StockStatus.IN_STOCK,
    price: 19,
  },
  {
    id: 9,
    name: "USB Hub 7-Port",
    sku: "HUB-009",
    category: "Accessories",
    quantity: 23,
    reorderLevel: 15,
    status: StockStatus.IN_STOCK,
    price: 35,
  },
  {
    id: 10,
    name: "Laptop Stand",
    sku: "STD-010",
    category: "Office",
    quantity: 15,
    reorderLevel: 10,
    status: StockStatus.LOW_STOCK,
    price: 55,
  },
  {
    id: 11,
    name: "Wireless Charger",
    sku: "CHG-011",
    category: "Electronics",
    quantity: 42,
    reorderLevel: 20,
    status: StockStatus.IN_STOCK,
    price: 25,
  },
  {
    id: 12,
    name: "HDMI Cable",
    sku: "HDM-012",
    category: "Accessories",
    quantity: 3,
    reorderLevel: 30,
    status: StockStatus.LOW_STOCK,
    price: 8,
  },
];

const CATEGORIES = inventoryData
  .map(i => i.category)
  .filter((v, idx, arr) => arr.indexOf(v) === idx);

const STATUS_CFG = {
  "in-stock": {
    color: "success",
    icon: <CheckCircleOutlined />,
    label: "In Stock",
    hex: "#10b981",
  },
  "low-stock": {
    color: "warning",
    icon: <WarningOutlined />,
    label: "Low Stock",
    hex: "#f59e0b",
  },
  "out-of-stock": {
    color: "error",
    icon: <CloseCircleOutlined />,
    label: "Out of Stock",
    hex: "#ef4444",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function Inventory() {
  const { theme } = useAppSettings();
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
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<InventoryItem | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const filtered = useMemo(() => {
    let d = inventoryData;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") d = d.filter(i => i.status === statusFilter);
    if (showLowStockOnly) d = d.filter(i => i.quantity <= i.reorderLevel);
    return d;
  }, [search, statusFilter, showLowStockOnly]);

  const totalValue = inventoryData.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  function handleExportCSV() {
    const csv = [
      [
        "Product Name",
        "SKU",
        "Category",
        "Quantity",
        "Reorder Level",
        "Status",
        "Price",
      ],
      ...filtered.map(i => [
        i.name,
        i.sku,
        i.category,
        i.quantity,
        i.reorderLevel,
        i.status,
        `$${i.price}`,
      ]),
    ]
      .map(r => r.join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "inventory.csv";
    a.click();
  }

  function openEdit(record: InventoryItem) {
    setEditRecord(record);
    editForm.setFieldsValue({ ...record, price: `${record.price}` });
    setIsEditOpen(true);
  }

  const columns: TableColumnsType<InventoryItem> = [
    {
      title: "Product",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (v, r) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Text strong>{v}</Text>
            {r.quantity <= r.reorderLevel && r.quantity > 0 && (
              <Tag
                color="warning"
                style={{
                  borderRadius: 10,
                  fontSize: 10,
                  lineHeight: "16px",
                  padding: "0 6px",
                  margin: 0,
                }}
              >
                <WarningOutlined style={{ marginInlineEnd: 2 }} />
                Low Stock
              </Tag>
            )}
            {r.quantity === 0 && (
              <Tag
                color="error"
                style={{
                  borderRadius: 10,
                  fontSize: 10,
                  lineHeight: "16px",
                  padding: "0 6px",
                  margin: 0,
                }}
              >
                <CloseCircleOutlined style={{ marginInlineEnd: 2 }} />
                Out of Stock
              </Tag>
            )}
          </div>
          <Text code style={{ fontSize: 11 }}>
            {r.sku}
          </Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      filters: CATEGORIES.map(c => ({ text: c, value: c })),
      onFilter: (val, rec) => rec.category === val,
      render: v => <Tag style={{ borderRadius: 4 }}>{v}</Tag>,
    },
    {
      title: "Stock Level",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      width: 160,
      render: (v, r) => {
        const pct =
          r.reorderLevel > 0
            ? Math.min(100, Math.round((v / (r.reorderLevel * 3)) * 100))
            : 100;
        return (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <Text style={{ fontSize: 12 }}>{v} units</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                min {r.reorderLevel}
              </Text>
            </div>
            <Progress
              percent={pct}
              size="small"
              showInfo={false}
              strokeColor={STATUS_CFG[r.status].hex}
            />
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "In Stock", value: "in-stock" },
        { text: "Low Stock", value: "low-stock" },
        { text: "Out of Stock", value: "out-of-stock" },
      ],
      onFilter: (val, rec) => rec.status === val,
      render: (v: InventoryItem["status"]) => {
        const c = STATUS_CFG[v];
        return (
          <Tag
            icon={c.icon}
            color={c.color}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {c.label}
          </Tag>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      render: v => <Text strong>${v.toLocaleString()}</Text>,
    },
    {
      title: "Actions",
      align: "center",
      width: 90,
      render: (_, rec) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(rec)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this product?"
            description="This action cannot be undone."
            onConfirm={() => message.success(`"${rec.name}" deleted`)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection: TableProps<InventoryItem>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as number[]),
  };

  return (
    <DashboardLayout
      currentPage="Inventory"
      breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Inventory" }]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: "Total Products",
              value: inventoryData.length,
              suffix: "SKUs tracked",
              icon: <ShopOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
              color: undefined,
            },
            {
              title: "Low Stock",
              value: inventoryData.filter(
                i => i.status === StockStatus.LOW_STOCK
              ).length,
              suffix: "need reordering",
              icon: <AlertOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: "Out of Stock",
              value: inventoryData.filter(
                i => i.status === StockStatus.OUT_OF_STOCK
              ).length,
              suffix: "urgent action",
              icon: <StopOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
            {
              title: "Total Value",
              value: `$${(totalValue / 1000).toFixed(0)}K`,
              suffix: "inventory worth",
              icon: <DollarOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
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
                      <Text
                        strong
                        style={{
                          fontSize: 24,
                          lineHeight: 1,
                          color: s.color ?? "inherit",
                        }}
                      >
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
                placeholder="Search by name, SKU, or category…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 160 }}
                suffixIcon={<FilterOutlined />}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "in-stock", label: "✓ In Stock" },
                  { value: "low-stock", label: "⚠ Low Stock" },
                  { value: "out-of-stock", label: "✕ Out of Stock" },
                ]}
              />
              <Tooltip title="Show Low Stock Only">
                <Button
                  type={showLowStockOnly ? "primary" : "default"}
                  icon={<AlertOutlined />}
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  danger={showLowStockOnly}
                >
                  {showLowStockOnly ? "Low Stock" : "Low Stock"}
                </Button>
              </Tooltip>
            </Space>

            <Space>
              <Tooltip title="Reload">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => message.info("Data reloaded")}
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
                      onClick: handleExportCSV,
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
                Add Product
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
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleExportCSV}
              >
                Export
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                Clear selection
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
                  `${range[0]}–${range[1]} of ${total} products`,
                pageSizeOptions: ["5", "10", "25", "50"],
              }}
              locale={{ emptyText: "No products found. Adjust your filters." }}
            />
          </Card>
        )}

        {/* ── Grid View ──────────────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <Row gutter={[16, 16]}>
            {filtered.map(item => {
              const c = STATUS_CFG[item.status];
              const pct =
                item.reorderLevel > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (item.quantity / (item.reorderLevel * 3)) * 100
                      )
                    )
                  : 100;
              return (
                <Col key={item.id} xs={24} sm={12} xl={8}>
                  <Card
                    size="small"
                    hoverable
                    actions={[
                      <Button
                        key="e"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </Button>,
                      <Popconfirm
                        key="d"
                        title="Delete?"
                        onConfirm={() => message.success("Deleted")}
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: 2 }}
                        >
                          {item.name}
                        </Text>
                        <Space size={4}>
                          <Text code style={{ fontSize: 11 }}>
                            {item.sku}
                          </Text>
                          <Tag
                            style={{
                              fontSize: 11,
                              lineHeight: "18px",
                              padding: "0 6px",
                            }}
                          >
                            {item.category}
                          </Tag>
                        </Space>
                      </div>
                      <Tag
                        icon={c.icon}
                        color={c.color}
                        style={{ borderRadius: 20, alignSelf: "flex-start" }}
                      >
                        {c.label}
                      </Tag>
                    </div>

                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Stock: {item.quantity} / min {item.reorderLevel}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {pct}%
                        </Text>
                      </div>
                      <Progress
                        percent={pct}
                        size="small"
                        showInfo={false}
                        strokeColor={c.hex}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0 0",
                        borderTop: `1px solid ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Unit Price
                      </Text>
                      <Text strong>${item.price.toLocaleString()}</Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Space>

      {/* ── Create Modal ──────────────────────────────────────────────────── */}
      <Modal
        title="Add New Product"
        open={isCreateOpen}
        onOk={() =>
          form.validateFields().then(() => {
            message.success("Product added");
            setIsCreateOpen(false);
            form.resetFields();
          })
        }
        onCancel={() => {
          setIsCreateOpen(false);
          form.resetFields();
        }}
        okText="Add Product"
        width={isMobile ? "95vw" : 520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true }]}
              >
                <Input placeholder='e.g. Laptop Pro 15"' />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
                <Input placeholder="LAP-001" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select category"
                  options={[
                    ...CATEGORIES.map(c => ({ value: c, label: c })),
                    { value: "Other", label: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Price ($)"
                name="price"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                  placeholder="0.00"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Quantity"
                name="quantity"
                rules={[{ required: true }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Reorder Level" name="reorderLevel">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Status" name="status" initialValue="in-stock">
            <Select
              options={[
                { value: "in-stock", label: "✓ In Stock" },
                { value: "low-stock", label: "⚠ Low Stock" },
                { value: "out-of-stock", label: "✕ Out of Stock" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────────────────── */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>{editRecord?.name ?? ""}</span>
          </Space>
        }
        open={isEditOpen}
        onOk={() =>
          editForm.validateFields().then(() => {
            message.success("Product updated");
            setIsEditOpen(false);
          })
        }
        onCancel={() => setIsEditOpen(false)}
        okText="Save Changes"
        width={isMobile ? "95vw" : 520}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={16}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="SKU" name="sku">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Category" name="category">
                <Select
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Price ($)" name="price">
                <InputNumber min={0} precision={2} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label="Quantity" name="quantity">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Reorder Level" name="reorderLevel">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Status" name="status">
            <Select
              options={[
                { value: "in-stock", label: "✓ In Stock" },
                { value: "low-stock", label: "⚠ Low Stock" },
                { value: "out-of-stock", label: "✕ Out of Stock" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
