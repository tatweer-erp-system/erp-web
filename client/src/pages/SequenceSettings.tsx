import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
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
  Modal,
  Form,
  InputNumber,
  Select,
  Tooltip,
  Switch,
  message,
  Typography,
  Alert,
  theme as antTheme,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  NumberOutlined,
  BranchesOutlined,
  SettingOutlined,
  UndoOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sequence {
  id: string;
  entity: string;
  entityKey: string;
  prefix: string;
  lastValue: number;
  padding: number;
  resetCycle: "never" | "yearly" | "monthly";
  scope: string;
  branchId?: string;
  branchName?: string;
  version: number;
  branchLevelEnabled: boolean;
  children?: Sequence[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SEQUENCES: Sequence[] = [
  {
    id: "seq-1",
    entity: "Sales Order",
    entityKey: "sales_order",
    prefix: "SO",
    lastValue: 42,
    padding: 5,
    resetCycle: "never",
    scope: "Company-wide",
    version: 3,
    branchLevelEnabled: false,
  },
  {
    id: "seq-2",
    entity: "Purchase Order",
    entityKey: "purchase_order",
    prefix: "PO",
    lastValue: 18,
    padding: 5,
    resetCycle: "yearly",
    scope: "Company-wide",
    version: 2,
    branchLevelEnabled: false,
  },
  {
    id: "seq-3",
    entity: "Employee",
    entityKey: "employee",
    prefix: "EMP",
    lastValue: 156,
    padding: 5,
    resetCycle: "never",
    scope: "Company-wide",
    version: 1,
    branchLevelEnabled: false,
  },
  {
    id: "seq-4",
    entity: "Sales Invoice",
    entityKey: "sales_invoice",
    prefix: "INV",
    lastValue: 891,
    padding: 6,
    resetCycle: "yearly",
    scope: "Company-wide",
    version: 5,
    branchLevelEnabled: true,
    children: [
      {
        id: "seq-4-b1",
        entity: "Sales Invoice",
        entityKey: "sales_invoice",
        prefix: "INV",
        lastValue: 312,
        padding: 6,
        resetCycle: "yearly",
        scope: "Main Branch",
        branchId: "b1",
        branchName: "Main Branch",
        version: 2,
        branchLevelEnabled: true,
      },
      {
        id: "seq-4-b2",
        entity: "Sales Invoice",
        entityKey: "sales_invoice",
        prefix: "INV",
        lastValue: 579,
        padding: 6,
        resetCycle: "yearly",
        scope: "Riyadh Branch",
        branchId: "b2",
        branchName: "Riyadh Branch",
        version: 3,
        branchLevelEnabled: true,
      },
    ],
  },
  {
    id: "seq-5",
    entity: "Purchase Invoice",
    entityKey: "purchase_invoice",
    prefix: "PINV",
    lastValue: 67,
    padding: 5,
    resetCycle: "never",
    scope: "Company-wide",
    version: 1,
    branchLevelEnabled: false,
  },
  {
    id: "seq-6",
    entity: "Journal Entry",
    entityKey: "journal_entry",
    prefix: "JE",
    lastValue: 204,
    padding: 5,
    resetCycle: "yearly",
    scope: "Company-wide",
    version: 2,
    branchLevelEnabled: false,
  },
  {
    id: "seq-7",
    entity: "Stock Transfer",
    entityKey: "stock_transfer",
    prefix: "ST",
    lastValue: 33,
    padding: 4,
    resetCycle: "never",
    scope: "Company-wide",
    version: 1,
    branchLevelEnabled: false,
  },
  {
    id: "seq-8",
    entity: "Customer Receipt",
    entityKey: "customer_receipt",
    prefix: "CR",
    lastValue: 445,
    padding: 5,
    resetCycle: "monthly",
    scope: "Company-wide",
    version: 4,
    branchLevelEnabled: false,
  },
  {
    id: "seq-9",
    entity: "Quotation",
    entityKey: "quotation",
    prefix: "QT",
    lastValue: 127,
    padding: 5,
    resetCycle: "never",
    scope: "Company-wide",
    version: 1,
    branchLevelEnabled: false,
  },
  {
    id: "seq-10",
    entity: "Leave Request",
    entityKey: "leave_request",
    prefix: "LR",
    lastValue: 89,
    padding: 4,
    resetCycle: "yearly",
    scope: "Company-wide",
    version: 2,
    branchLevelEnabled: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSequenceNumber(
  prefix: string,
  lastValue: number,
  padding: number
): string {
  return `${prefix}-${String(lastValue).padStart(padding, "0")}`;
}

const RESET_CYCLE_OPTIONS = [
  { value: "never" as const, label: "Never" },
  { value: "yearly" as const, label: "Yearly" },
  { value: "monthly" as const, label: "Monthly" },
];

const RESET_CYCLE_COLORS: Record<string, string> = {
  never: "default",
  yearly: "blue",
  monthly: "orange",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SequenceSettings() {
  const language = useLangStore(s => s.lang);
  const lang = language;
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [search, setSearch] = useState("");
  const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Sequence | null>(null);
  const [editForm] = Form.useForm();

  // Reset modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetRecord, setResetRecord] = useState<Sequence | null>(null);
  const [resetForm] = Form.useForm();

  // Filtered data
  const filtered = useMemo(() => {
    if (!search) return sequences;
    const q = search.toLowerCase();
    return sequences.filter(
      s =>
        s.entity.toLowerCase().includes(q) ||
        s.prefix.toLowerCase().includes(q) ||
        s.scope.toLowerCase().includes(q)
    );
  }, [search, sequences]);

  // ── Edit handlers ─────────────────────────────────────────────────────────

  function openEdit(record: Sequence) {
    setEditRecord(record);
    editForm.setFieldsValue({
      prefix: record.prefix,
      padding: record.padding,
      resetCycle: record.resetCycle,
    });
    setIsEditOpen(true);
  }

  function handleEditSave() {
    editForm.validateFields().then(values => {
      setSequences(prev =>
        prev.map(s =>
          s.id === editRecord?.id
            ? {
                ...s,
                prefix: values.prefix,
                padding: values.padding,
                resetCycle: values.resetCycle,
                version: s.version + 1,
              }
            : s
        )
      );
      message.success(t("seq.editSuccess", lang));
      setIsEditOpen(false);
    });
  }

  // ── Reset handlers ────────────────────────────────────────────────────────

  function openReset(record: Sequence) {
    setResetRecord(record);
    resetForm.resetFields();
    setIsResetOpen(true);
  }

  function handleResetConfirm() {
    resetForm.validateFields().then(() => {
      setSequences(prev =>
        prev.map(s =>
          s.id === resetRecord?.id
            ? { ...s, lastValue: 0, version: s.version + 1 }
            : s
        )
      );
      message.success(t("seq.resetSuccess", lang));
      setIsResetOpen(false);
    });
  }

  // ── Branch toggle ─────────────────────────────────────────────────────────

  function handleBranchToggle(record: Sequence, enabled: boolean) {
    setSequences(prev =>
      prev.map(s => {
        if (s.id !== record.id) return s;
        if (enabled) {
          return {
            ...s,
            branchLevelEnabled: true,
            children: [
              {
                id: `${s.id}-b1`,
                entity: s.entity,
                entityKey: s.entityKey,
                prefix: s.prefix,
                lastValue: 0,
                padding: s.padding,
                resetCycle: s.resetCycle,
                scope: "Main Branch",
                branchId: "b1",
                branchName: "Main Branch",
                version: 1,
                branchLevelEnabled: true,
              },
              {
                id: `${s.id}-b2`,
                entity: s.entity,
                entityKey: s.entityKey,
                prefix: s.prefix,
                lastValue: 0,
                padding: s.padding,
                resetCycle: s.resetCycle,
                scope: "Riyadh Branch",
                branchId: "b2",
                branchName: "Riyadh Branch",
                version: 1,
                branchLevelEnabled: true,
              },
            ],
          };
        }
        return { ...s, branchLevelEnabled: false, children: undefined };
      })
    );
    message.success(
      enabled ? t("seq.branchEnabled", lang) : t("seq.branchDisabled", lang)
    );
  }

  // ── Table columns ─────────────────────────────────────────────────────────

  const columns: TableColumnsType<Sequence> = [
    {
      title: t("seq.entity", lang),
      dataIndex: "entity",
      sorter: (a, b) => a.entity.localeCompare(b.entity),
      render: (v: string, r: Sequence) => (
        <div>
          <Text strong>{t(`seq.entity.${r.entityKey}`, lang)}</Text>
          {r.branchName && (
            <Text type="secondary" style={{ display: "block", fontSize: 11 }}>
              <BranchesOutlined style={{ marginInlineEnd: 4 }} />
              {r.branchName}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: t("seq.prefix", lang),
      dataIndex: "prefix",
      width: 100,
      render: (v: string) => (
        <Tag style={{ fontFamily: "monospace", borderRadius: 4 }}>{v}</Tag>
      ),
    },
    {
      title: t("seq.lastValue", lang),
      dataIndex: "lastValue",
      width: 110,
      sorter: (a, b) => a.lastValue - b.lastValue,
      render: (v: number) => (
        <Text style={{ fontFamily: "monospace" }}>{v}</Text>
      ),
    },
    {
      title: t("seq.padding", lang),
      dataIndex: "padding",
      width: 90,
      render: (v: number) => (
        <Text>
          {v} {t("seq.digits", lang)}
        </Text>
      ),
    },
    {
      title: t("seq.resetCycle", lang),
      dataIndex: "resetCycle",
      width: 120,
      filters: RESET_CYCLE_OPTIONS.map(o => ({
        text: t(`seq.cycle.${o.value}`, lang),
        value: o.value,
      })),
      onFilter: (val, rec) => rec.resetCycle === val,
      render: (v: string) => (
        <Tag
          color={RESET_CYCLE_COLORS[v] ?? "default"}
          style={{ borderRadius: 20 }}
        >
          {t(`seq.cycle.${v}`, lang)}
        </Tag>
      ),
    },
    {
      title: t("seq.scope", lang),
      dataIndex: "scope",
      width: 140,
      render: (v: string) => (
        <Tag
          icon={<BranchesOutlined />}
          color={v === "Company-wide" ? "geekblue" : "green"}
          style={{ borderRadius: 4 }}
        >
          {v === "Company-wide" ? t("seq.companyWide", lang) : v}
        </Tag>
      ),
    },
    {
      title: t("seq.lastNumber", lang),
      key: "formattedNumber",
      width: 160,
      render: (_: unknown, r: Sequence) => (
        <Text code style={{ fontSize: 12, letterSpacing: 0.5 }}>
          {formatSequenceNumber(r.prefix, r.lastValue, r.padding)}
        </Text>
      ),
    },
    {
      title: t("seq.branchLevel", lang),
      key: "branchToggle",
      width: 130,
      render: (_: unknown, r: Sequence) => {
        if (r.branchId) return null; // branch sub-rows don't show toggle
        return (
          <Tooltip title={t("seq.branchToggleTooltip", lang)}>
            <Switch
              size="small"
              checked={r.branchLevelEnabled}
              onChange={checked => handleBranchToggle(r, checked)}
            />
          </Tooltip>
        );
      },
    },
    {
      title: t("seq.actions", lang),
      key: "actions",
      align: "center",
      width: 100,
      render: (_: unknown, r: Sequence) => (
        <Space size={4}>
          <Tooltip title={t("seq.edit", lang)}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(r)}
            />
          </Tooltip>
          <Tooltip title={t("seq.reset", lang)}>
            <Button
              type="text"
              size="small"
              danger
              icon={<UndoOutlined />}
              onClick={() => openReset(r)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout
      currentPage="Sequence Settings"
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("Settings", lang), href: "/settings" },
        { label: t("seq.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <Title level={4} style={{ margin: 0 }}>
              <NumberOutlined
                style={{ marginInlineEnd: 8, color: token.colorPrimary }}
              />
              {t("seq.title", lang)}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {t("seq.subtitle", lang)}
            </Text>
          </div>
        </div>

        {/* Toolbar */}
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
            <Input
              prefix={
                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder={t("seq.searchPlaceholder", lang)}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 300 }}
            />
            <Tooltip title={t("seq.reload", lang)}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => message.info(t("seq.dataReloaded", lang))}
              />
            </Tooltip>
          </div>
        </Card>

        {/* Data table */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            size="middle"
            scroll={{ x: "max-content" }}
            expandable={{
              childrenColumnName: "children",
              defaultExpandAllRows: true,
            }}
            pagination={{
              pageSize: 15,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t("seq.of", lang)} ${total} ${t("seq.sequences", lang)}`,
              pageSizeOptions: ["10", "15", "25", "50"],
            }}
            locale={{ emptyText: t("seq.noData", lang) }}
          />
        </Card>
      </Space>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        open={isEditOpen}
        onOk={handleEditSave}
        onCancel={() => setIsEditOpen(false)}
        okText={t("seq.saveChanges", lang)}
        width={isMobile ? "95vw" : 480}
        destroyOnHidden
        title={
          <div
            style={{
              margin: "-20px -24px 0",
              padding: "16px 24px",
              background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorPrimary}cc)`,
              borderRadius: "8px 8px 0 0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <SettingOutlined style={{ fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {t("seq.editTitle", lang)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {editRecord?.entity ?? ""}
              </div>
            </div>
          </div>
        }
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("seq.prefix", lang)}
                name="prefix"
                rules={[
                  { required: true, message: t("seq.prefixRequired", lang) },
                ]}
              >
                <Input placeholder="e.g. SO" maxLength={10} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("seq.padding", lang)}
                name="padding"
                rules={[
                  { required: true, message: t("seq.paddingRequired", lang) },
                ]}
              >
                <InputNumber min={1} max={10} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={t("seq.resetCycle", lang)}
            name="resetCycle"
            rules={[{ required: true }]}
          >
            <Select
              options={RESET_CYCLE_OPTIONS.map(o => ({
                value: o.value,
                label: t(`seq.cycle.${o.value}`, lang),
              }))}
            />
          </Form.Item>
          {editRecord && (
            <Alert
              type="info"
              showIcon
              message={
                <Text style={{ fontSize: 12 }}>
                  {t("seq.versionInfo", lang)}:{" "}
                  <Text strong>v{editRecord.version}</Text>
                </Text>
              }
              style={{ marginBottom: 0 }}
            />
          )}
        </Form>
      </Modal>

      {/* ── Reset Confirmation Modal ─────────────────────────────────────── */}
      <Modal
        open={isResetOpen}
        onOk={handleResetConfirm}
        onCancel={() => setIsResetOpen(false)}
        okText={t("seq.confirmReset", lang)}
        okButtonProps={{ danger: true }}
        width={isMobile ? "95vw" : 460}
        destroyOnHidden
        title={
          <div
            style={{
              margin: "-20px -24px 0",
              padding: "16px 24px",
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              borderRadius: "8px 8px 0 0",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ExclamationCircleOutlined style={{ fontSize: 18 }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {t("seq.resetTitle", lang)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {resetRecord?.entity ?? ""} ({resetRecord?.prefix ?? ""})
              </div>
            </div>
          </div>
        }
      >
        <div style={{ marginTop: 16 }}>
          <Alert
            type="warning"
            showIcon
            message={t("seq.resetWarning", lang)}
            description={t("seq.resetWarningDesc", lang)}
            style={{ marginBottom: 16 }}
          />
          <Form form={resetForm} layout="vertical">
            <Form.Item
              label={t("seq.resetReason", lang)}
              name="reason"
              rules={[
                { required: true, message: t("seq.reasonRequired", lang) },
                { min: 3, message: t("seq.reasonMinLength", lang) },
              ]}
            >
              <TextArea
                rows={3}
                placeholder={t("seq.reasonPlaceholder", lang)}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
