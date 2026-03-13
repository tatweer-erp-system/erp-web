import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  Table,
  Row,
  Col,
  Card,
  DatePicker,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  FileTextOutlined,
  UserOutlined,
  NumberOutlined,
  TagsOutlined,
  PhoneOutlined,
  DollarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineItem {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const CUSTOMERS = [
  { value: "Acme Corp", label: "Acme Corp" },
  { value: "Globex Industries", label: "Globex Industries" },
  { value: "Initech Solutions", label: "Initech Solutions" },
  { value: "Umbrella LLC", label: "Umbrella LLC" },
  { value: "Stark Enterprises", label: "Stark Enterprises" },
];

const SALES_REPS = [
  { value: "rep-1", label: "Ahmed Al-Rashid" },
  { value: "rep-2", label: "Sara Johnson" },
  { value: "rep-3", label: "Mohamed Ali" },
  { value: "rep-4", label: "Emily Chen" },
];

const TAG_OPTIONS = [
  "Urgent",
  "Renewal",
  "VIP",
  "Trial",
  "Wholesale",
  "Retail",
  "Government",
].map(t => ({ value: t, label: t }));

const DIAL_CODES = [
  { value: "+966", label: "🇸🇦 +966" },
  { value: "+971", label: "🇦🇪 +971" },
  { value: "+20", label: "🇪🇬 +20" },
  { value: "+965", label: "🇰🇼 +965" },
  { value: "+974", label: "🇶🇦 +974" },
  { value: "+1", label: "🇺🇸 +1" },
  { value: "+44", label: "🇬🇧 +44" },
  { value: "+49", label: "🇩🇪 +49" },
  { value: "+91", label: "🇮🇳 +91" },
];

// ─── Line items hook ─────────────────────────────────────────────────────────

function useLineItems() {
  const [items, setItems] = useState<LineItem[]>([
    { id: 1, description: "", qty: 1, unitPrice: 0, discount: 0, tax: 0 },
  ]);
  const [nextId, setNextId] = useState(2);

  function add() {
    setItems(p => [
      ...p,
      {
        id: nextId,
        description: "",
        qty: 1,
        unitPrice: 0,
        discount: 0,
        tax: 0,
      },
    ]);
    setNextId(n => n + 1);
  }

  function remove(id: number) {
    setItems(p => p.filter(i => i.id !== id));
  }

  function update<K extends keyof LineItem>(
    id: number,
    field: K,
    value: LineItem[K]
  ) {
    setItems(p => p.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function getAmount(item: LineItem) {
    return (
      item.qty *
      item.unitPrice *
      (1 - item.discount / 100) *
      (1 + item.tax / 100)
    );
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discount = items.reduce(
    (s, i) => s + i.qty * i.unitPrice * (i.discount / 100),
    0
  );
  const taxAmount = items.reduce(
    (s, i) => s + i.qty * i.unitPrice * (1 - i.discount / 100) * (i.tax / 100),
    0
  );
  const total = subtotal - discount + taxAmount;

  return {
    items,
    add,
    remove,
    update,
    getAmount,
    subtotal,
    discount,
    taxAmount,
    total,
  };
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  const { token } = antTheme.useToken();
  return (
    <Card
      size="small"
      styles={{
        header: {
          minHeight: 40,
          padding: "0 16px",
          background: token.colorFillAlter,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
        body: { padding: "16px 16px 4px" },
      }}
      title={
        <Space size={8}>
          <span
            style={{
              color: token.colorPrimary,
              display: "flex",
              alignItems: "center",
            }}
          >
            {icon}
          </span>
          <Text strong style={{ fontSize: 13 }}>
            {title}
          </Text>
        </Space>
      }
    >
      {children}
    </Card>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface CreateQuotationModalProps {
  onClose: () => void;
  onSubmit?: (data: unknown) => void;
}

export function CreateQuotationModal({
  onClose,
  onSubmit,
}: CreateQuotationModalProps) {
  const [form] = Form.useForm();
  const li = useLineItems();
  const [dialCode, setDialCode] = useState("+966");

  function handleSave(send = false) {
    form.validateFields().then(values => {
      onSubmit?.({ ...values, dialCode, items: li.items, send });
      onClose();
    });
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const liColumns: TableColumnsType<LineItem> = [
    {
      title: "#",
      width: 36,
      align: "center",
      render: (_, __, idx) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {idx + 1}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "32%",
      render: (_, rec) => (
        <Input
          placeholder="Product or service description…"
          value={rec.description}
          onChange={e => li.update(rec.id, "description", e.target.value)}
          variant="borderless"
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      width: 80,
      align: "right",
      render: (_, rec) => (
        <InputNumber
          min={0}
          value={rec.qty}
          onChange={v => li.update(rec.id, "qty", v ?? 0)}
          variant="borderless"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit Price",
      dataIndex: "unitPrice",
      width: 115,
      align: "right",
      render: (_, rec) => (
        <InputNumber
          min={0}
          precision={2}
          prefix="$"
          value={rec.unitPrice}
          onChange={v => li.update(rec.id, "unitPrice", v ?? 0)}
          variant="borderless"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Disc %",
      dataIndex: "discount",
      width: 85,
      align: "right",
      render: (_, rec) => (
        <InputNumber
          min={0}
          max={100}
          value={rec.discount}
          onChange={v => li.update(rec.id, "discount", v ?? 0)}
          variant="borderless"
          suffix="%"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Tax %",
      dataIndex: "tax",
      width: 85,
      align: "right",
      render: (_, rec) => (
        <InputNumber
          min={0}
          value={rec.tax}
          onChange={v => li.update(rec.id, "tax", v ?? 0)}
          variant="borderless"
          suffix="%"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 110,
      align: "right",
      render: (_, rec) => <Text strong>${fmt(li.getAmount(rec))}</Text>,
    },
    {
      title: "",
      dataIndex: "actions",
      width: 36,
      align: "center",
      render: (_, rec) => (
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={li.items.length === 1}
          onClick={() => li.remove(rec.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      open
      onCancel={onClose}
      width={960}
      styles={{
        body: { maxHeight: "78vh", overflowY: "auto", padding: "20px 24px" },
      }}
      title={
        <Space size={10}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(59,130,246,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "#3b82f6", fontSize: 16 }} />
          </div>
          <div>
            <Text
              strong
              style={{ fontSize: 15, display: "block", lineHeight: 1.3 }}
            >
              Create Quotation
            </Text>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              Fill in the details to generate a new quotation
            </Text>
          </div>
        </Space>
      }
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button onClick={onClose} size="large">
            Cancel
          </Button>
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSave(false)}
              size="large"
            >
              Save as Draft
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSave(true)}
              size="large"
            >
              Send Quotation
            </Button>
          </Space>
        </div>
      }
      destroyOnClose
    >
      <Form form={form} layout="vertical" colon={false}>
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {/* ── Quotation Info ─────────────────────────────────────────────── */}
          <SectionCard icon={<NumberOutlined />} title="Quotation Info">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Quotation No."
                  name="quotationNo"
                  initialValue="QT-2026-0001"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Issue Date"
                  name="issueDate"
                  initialValue={dayjs()}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="MMM DD, YYYY"
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Valid Until" name="validUntil">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="MMM DD, YYYY"
                    placeholder="Select expiry date"
                    disabledDate={(d: Dayjs) => {
                      const issue = form.getFieldValue(
                        "issueDate"
                      ) as Dayjs | null;
                      return issue ? d.isBefore(issue, "day") : false;
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Currency" name="currency" initialValue="SAR">
                  <Select
                    options={[
                      { value: "SAR", label: "SAR — Saudi Riyal" },
                      { value: "USD", label: "USD — US Dollar" },
                      { value: "EUR", label: "EUR — Euro" },
                      { value: "AED", label: "AED — UAE Dirham" },
                      { value: "GBP", label: "GBP — British Pound" },
                    ]}
                    showSearch
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Payment Terms"
                  name="paymentTerms"
                  initialValue="net-30"
                >
                  <Select
                    options={[
                      { value: "immediate", label: "Immediate" },
                      { value: "net-15", label: "Net 15 days" },
                      { value: "net-30", label: "Net 30 days" },
                      { value: "net-60", label: "Net 60 days" },
                      { value: "net-90", label: "Net 90 days" },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Delivery Terms" name="deliveryTerms">
                  <Input placeholder="e.g. FOB, CIF" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Reference / PO No." name="reference">
                  <Input placeholder="e.g. PO-1234" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Sales Rep" name="salesRep">
                  <Select
                    options={SALES_REPS}
                    placeholder="Assign rep…"
                    showSearch
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Tags" name="tags">
                  <Select
                    mode="tags"
                    placeholder="Add tags…"
                    options={TAG_OPTIONS}
                    maxCount={8}
                    allowClear
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          {/* ── Customer ───────────────────────────────────────────────────── */}
          <SectionCard icon={<UserOutlined />} title="Customer">
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Customer Name"
                  name="customer"
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select or search customer…"
                    options={CUSTOMERS}
                    filterOption={(val, opt) =>
                      (opt?.label as string)
                        ?.toLowerCase()
                        .includes(val.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ type: "email", message: "Invalid email" }]}
                >
                  <Input placeholder="customer@company.com" type="email" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item label="Phone" name="phone">
                  <Space.Compact style={{ width: "100%" }}>
                    <Select
                      value={dialCode}
                      onChange={setDialCode}
                      options={DIAL_CODES}
                      style={{ width: 110 }}
                      showSearch
                      optionFilterProp="label"
                      suffixIcon={<PhoneOutlined />}
                    />
                    <Input placeholder="5x xxx xxxx" style={{ flex: 1 }} />
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Billing Address" name="billingAddr">
                  <Input placeholder="Street, City, Country" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Shipping Address" name="shippingAddr">
                  <Input placeholder="Same as billing or different" />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>

          {/* ── Line Items ─────────────────────────────────────────────────── */}
          <SectionCard icon={<FileTextOutlined />} title="Line Items">
            <div style={{ margin: "0 -16px -4px" }}>
              <Table
                rowKey="id"
                size="small"
                columns={liColumns}
                dataSource={li.items}
                pagination={false}
                scroll={{ x: "max-content" }}
                footer={() => (
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={li.add}
                    block
                    size="small"
                  >
                    Add Line Item
                  </Button>
                )}
              />
            </div>

            {/* Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <div style={{ minWidth: 260 }}>
                {[
                  { label: "Subtotal", value: `$${fmt(li.subtotal)}` },
                  {
                    label: "Discount",
                    value: `($${fmt(li.discount)})`,
                    dim: true,
                  },
                  { label: "Tax", value: `$${fmt(li.taxAmount)}` },
                ].map(({ label, value, dim }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px dashed var(--color-border, #e2e8f0)",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {label}
                    </Text>
                    <Text
                      type={dim ? "secondary" : undefined}
                      style={{ fontSize: 13 }}
                    >
                      {value}
                    </Text>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0 4px",
                  }}
                >
                  <Space>
                    <DollarOutlined style={{ color: "#3b82f6" }} />
                    <Text strong style={{ fontSize: 14 }}>
                      Total
                    </Text>
                  </Space>
                  <Text strong style={{ fontSize: 16, color: "#3b82f6" }}>
                    ${fmt(li.total)}
                  </Text>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── Notes & Terms ──────────────────────────────────────────────── */}
          <SectionCard icon={<TagsOutlined />} title="Notes & Terms">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Notes to Customer" name="notes">
                  <Input.TextArea
                    rows={3}
                    placeholder="Thank you for your inquiry…"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Terms & Conditions" name="terms">
                  <Input.TextArea
                    rows={3}
                    placeholder="Prices are valid for 30 days…"
                  />
                </Form.Item>
              </Col>
            </Row>
          </SectionCard>
        </Space>
      </Form>
    </Modal>
  );
}
