import { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  Upload,
  Modal,
  Badge,
  Row,
  Col,
  Card,
  Dropdown,
  Progress,
  Avatar,
  Empty,
  theme as antTheme,
} from "antd";
import type { UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ShareAltOutlined,
  InboxOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FolderOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  BankOutlined,
  UsergroupAddOutlined,
  AppstoreOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import DashboardLayout from "@/components/layout/DashboardLayout";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ─── Types ────────────────────────────────────────────────────────────────────

type DocModule =
  | "all"
  | "sales"
  | "purchases"
  | "inventory"
  | "accounting"
  | "treasury"
  | "hr"
  | "general";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number; // bytes
  module: DocModule;
  relatedTo?: string; // e.g. "Invoice #INV-0042"
  uploadedBy: string;
  uploadedAt: string; // ISO date string
  tags: string[];
  status: "active" | "archived";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DOCUMENTS: Document[] = [
  {
    id: "1",
    name: "Q1-2025-Sales-Report.pdf",
    type: "pdf",
    size: 2_450_000,
    module: "sales",
    relatedTo: "Sales Report Q1",
    uploadedBy: "Ahmed Ali",
    uploadedAt: "2025-03-15",
    tags: ["report", "q1"],
    status: "active",
  },
  {
    id: "2",
    name: "Invoice-INV-0042.pdf",
    type: "pdf",
    size: 340_000,
    module: "sales",
    relatedTo: "Invoice #INV-0042",
    uploadedBy: "Sara Hassan",
    uploadedAt: "2025-03-10",
    tags: ["invoice"],
    status: "active",
  },
  {
    id: "3",
    name: "Vendor-Contract-ABC.docx",
    type: "docx",
    size: 890_000,
    module: "purchases",
    relatedTo: "Vendor: ABC Corp",
    uploadedBy: "Omar Khalid",
    uploadedAt: "2025-02-28",
    tags: ["contract", "vendor"],
    status: "active",
  },
  {
    id: "4",
    name: "Purchase-Order-PO-0101.pdf",
    type: "pdf",
    size: 210_000,
    module: "purchases",
    relatedTo: "PO #PO-0101",
    uploadedBy: "Mona Saad",
    uploadedAt: "2025-02-25",
    tags: ["po"],
    status: "active",
  },
  {
    id: "5",
    name: "Warehouse-Layout-2025.png",
    type: "png",
    size: 5_200_000,
    module: "inventory",
    relatedTo: "Warehouse: Main",
    uploadedBy: "Ahmed Ali",
    uploadedAt: "2025-02-20",
    tags: ["layout", "warehouse"],
    status: "active",
  },
  {
    id: "6",
    name: "Stock-Count-Feb-2025.xlsx",
    type: "xlsx",
    size: 1_100_000,
    module: "inventory",
    relatedTo: "Stock Count Feb",
    uploadedBy: "Youssef Nasr",
    uploadedAt: "2025-02-18",
    tags: ["stock", "count"],
    status: "active",
  },
  {
    id: "7",
    name: "Bank-Statement-Feb-2025.pdf",
    type: "pdf",
    size: 780_000,
    module: "accounting",
    relatedTo: "Bank Reconciliation",
    uploadedBy: "Sara Hassan",
    uploadedAt: "2025-02-15",
    tags: ["bank", "statement"],
    status: "active",
  },
  {
    id: "8",
    name: "Tax-Certificate-2024.pdf",
    type: "pdf",
    size: 450_000,
    module: "accounting",
    relatedTo: "Tax Year 2024",
    uploadedBy: "Omar Khalid",
    uploadedAt: "2025-01-30",
    tags: ["tax", "certificate"],
    status: "active",
  },
  {
    id: "9",
    name: "Treasury-Report-Q4-2024.xlsx",
    type: "xlsx",
    size: 1_800_000,
    module: "treasury",
    relatedTo: "Treasury Q4 2024",
    uploadedBy: "Mona Saad",
    uploadedAt: "2025-01-20",
    tags: ["treasury", "q4"],
    status: "active",
  },
  {
    id: "10",
    name: "Employee-Contract-EMP-005.pdf",
    type: "pdf",
    size: 520_000,
    module: "hr",
    relatedTo: "Employee #EMP-005",
    uploadedBy: "Ahmed Ali",
    uploadedAt: "2025-01-15",
    tags: ["contract", "hr"],
    status: "active",
  },
  {
    id: "11",
    name: "Payroll-January-2025.xlsx",
    type: "xlsx",
    size: 990_000,
    module: "hr",
    relatedTo: "Payroll Jan 2025",
    uploadedBy: "Youssef Nasr",
    uploadedAt: "2025-02-01",
    tags: ["payroll"],
    status: "active",
  },
  {
    id: "12",
    name: "Company-Policy-2025.docx",
    type: "docx",
    size: 1_300_000,
    module: "general",
    relatedTo: undefined,
    uploadedBy: "Sara Hassan",
    uploadedAt: "2025-01-10",
    tags: ["policy", "general"],
    status: "active",
  },
  {
    id: "13",
    name: "Office-Photo-HQ.jpg",
    type: "jpg",
    size: 3_600_000,
    module: "general",
    relatedTo: undefined,
    uploadedBy: "Omar Khalid",
    uploadedAt: "2025-01-05",
    tags: ["photo"],
    status: "archived",
  },
  {
    id: "14",
    name: "Audit-Report-2024.pdf",
    type: "pdf",
    size: 4_100_000,
    module: "accounting",
    relatedTo: "Audit 2024",
    uploadedBy: "Mona Saad",
    uploadedAt: "2024-12-20",
    tags: ["audit", "2024"],
    status: "archived",
  },
  {
    id: "15",
    name: "Customer-Agreement-CUST-101.pdf",
    type: "pdf",
    size: 630_000,
    module: "sales",
    relatedTo: "Customer #CUST-101",
    uploadedBy: "Ahmed Ali",
    uploadedAt: "2024-12-15",
    tags: ["agreement", "customer"],
    status: "active",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function totalBytes(docs: Document[]): number {
  return docs.reduce((s, d) => s + d.size, 0);
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: "#f5222d", fontSize: 18 }} />,
  docx: <FileWordOutlined style={{ color: "#1677ff", fontSize: 18 }} />,
  doc: <FileWordOutlined style={{ color: "#1677ff", fontSize: 18 }} />,
  xlsx: <FileExcelOutlined style={{ color: "#52c41a", fontSize: 18 }} />,
  xls: <FileExcelOutlined style={{ color: "#52c41a", fontSize: 18 }} />,
  png: <FileImageOutlined style={{ color: "#722ed1", fontSize: 18 }} />,
  jpg: <FileImageOutlined style={{ color: "#722ed1", fontSize: 18 }} />,
  jpeg: <FileImageOutlined style={{ color: "#722ed1", fontSize: 18 }} />,
  zip: <FileZipOutlined style={{ color: "#fa8c16", fontSize: 18 }} />,
  txt: <FileTextOutlined style={{ color: "#8c8c8c", fontSize: 18 }} />,
};

function fileIcon(type: string) {
  return (
    FILE_ICONS[type.toLowerCase()] ?? (
      <FileUnknownOutlined style={{ color: "#8c8c8c", fontSize: 18 }} />
    )
  );
}

const MODULE_META: Record<
  DocModule,
  { label: string; color: string; icon: React.ReactNode }
> = {
  all: { label: "All Modules", color: "default", icon: <FolderOpenOutlined /> },
  sales: { label: "Sales", color: "blue", icon: <ShoppingCartOutlined /> },
  purchases: {
    label: "Purchases",
    color: "orange",
    icon: <ShoppingOutlined />,
  },
  inventory: { label: "Inventory", color: "green", icon: <AppstoreOutlined /> },
  accounting: { label: "Accounting", color: "purple", icon: <BankOutlined /> },
  treasury: { label: "Treasury", color: "cyan", icon: <BankOutlined /> },
  hr: { label: "HR", color: "geekblue", icon: <UsergroupAddOutlined /> },
  general: { label: "General", color: "default", icon: <FolderOutlined /> },
};

// ─── Upload Modal (Enhanced) ──────────────────────────────────────────────────

interface PendingUpload {
  uid: string;
  name: string;
  ext: string;
  size: number;
  module: DocModule;
  description: string;
  tags: string[];
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
}

const UPLOAD_FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: "#f5222d", fontSize: 20 }} />,
  docx: <FileWordOutlined style={{ color: "#1677ff", fontSize: 20 }} />,
  doc: <FileWordOutlined style={{ color: "#1677ff", fontSize: 20 }} />,
  xlsx: <FileExcelOutlined style={{ color: "#52c41a", fontSize: 20 }} />,
  xls: <FileExcelOutlined style={{ color: "#52c41a", fontSize: 20 }} />,
  png: <FileImageOutlined style={{ color: "#722ed1", fontSize: 20 }} />,
  jpg: <FileImageOutlined style={{ color: "#722ed1", fontSize: 20 }} />,
  jpeg: <FileImageOutlined style={{ color: "#722ed1", fontSize: 20 }} />,
  zip: <FileZipOutlined style={{ color: "#fa8c16", fontSize: 20 }} />,
};
function uploadFileIcon(ext: string) {
  return (
    UPLOAD_FILE_ICONS[ext.toLowerCase()] ?? (
      <FileUnknownOutlined style={{ color: "#8c8c8c", fontSize: 20 }} />
    )
  );
}

function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { token } = antTheme.useToken();
  const [pendingFiles, setPendingFiles] = useState<PendingUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [globalModule, setGlobalModule] = useState<DocModule>("general");

  function updateFile(uid: string, patch: Partial<PendingUpload>) {
    setPendingFiles(prev =>
      prev.map(f => (f.uid === uid ? { ...f, ...patch } : f))
    );
  }

  function removeFile(uid: string) {
    setPendingFiles(prev => prev.filter(f => f.uid !== uid));
  }

  const draggerProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    beforeUpload: file => {
      const ext = file.name.split(".").pop() ?? "file";
      setPendingFiles(prev => [
        ...prev,
        {
          uid: file.uid,
          name: file.name,
          ext,
          size: file.size,
          module: globalModule,
          description: "",
          tags: [],
          progress: 0,
          status: "pending",
        },
      ]);
      return false;
    },
  };

  async function handleUpload() {
    setUploading(true);
    for (const file of pendingFiles) {
      updateFile(file.uid, { status: "uploading" });
      for (let p = 15; p <= 100; p += 17) {
        await new Promise<void>(r => setTimeout(r, 90));
        updateFile(file.uid, { progress: Math.min(p, 100) });
      }
      updateFile(file.uid, { status: "done", progress: 100 });
    }
    setUploading(false);
    // Brief pause so user sees all green, then close
    setTimeout(() => {
      setPendingFiles([]);
      onClose();
    }, 700);
  }

  function handleCancel() {
    if (!uploading) {
      setPendingFiles([]);
      onClose();
    }
  }

  const allDone =
    pendingFiles.length > 0 && pendingFiles.every(f => f.status === "done");

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      closable={!uploading}
      maskClosable={!uploading}
      title={
        <Space>
          <CloudUploadOutlined
            style={{ color: token.colorPrimary, fontSize: 18 }}
          />
          <span style={{ fontSize: 15 }}>Upload Documents</span>
        </Space>
      }
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={uploading}>
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={
            uploading ? (
              <LoadingOutlined />
            ) : allDone ? (
              <CheckCircleOutlined />
            ) : (
              <UploadOutlined />
            )
          }
          disabled={pendingFiles.length === 0 || allDone}
          loading={uploading}
          onClick={handleUpload}
        >
          {uploading
            ? "Uploading…"
            : allDone
              ? "Done"
              : `Upload${pendingFiles.length > 0 ? ` (${pendingFiles.length} file${pendingFiles.length > 1 ? "s" : ""})` : ""}`}
        </Button>,
      ]}
      width={680}
    >
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        {/* Global module selector */}
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 4 }}
            >
              Default Module (applied to all files, overridable per file)
            </Text>
            <Select
              value={globalModule}
              onChange={v => {
                setGlobalModule(v);
                // Only update pending files that haven't been individually changed
                setPendingFiles(prev =>
                  prev.map(f =>
                    f.status === "pending" ? { ...f, module: v } : f
                  )
                );
              }}
              style={{ width: "100%" }}
              options={Object.entries(MODULE_META)
                .filter(([k]) => k !== "all")
                .map(([k, v]) => ({ value: k, label: v.label }))}
            />
          </Col>
        </Row>

        {/* Drop zone */}
        <Dragger
          {...draggerProps}
          style={{
            background: token.colorFillAlter,
            borderColor: token.colorBorder,
            borderRadius: 10,
          }}
        >
          <div style={{ padding: "12px 0" }}>
            <InboxOutlined
              style={{ fontSize: 44, color: token.colorPrimary }}
            />
            <p style={{ margin: "10px 0 4px", fontWeight: 600, fontSize: 14 }}>
              Click or drag files here to upload
            </p>
            <p style={{ fontSize: 12, color: token.colorTextTertiary }}>
              PDF, Word, Excel, images, ZIP — max 50 MB each
            </p>
          </div>
        </Dragger>

        {/* Per-file rows */}
        {pendingFiles.length > 0 && (
          <div
            style={{
              maxHeight: 380,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {pendingFiles.map(file => (
              <div
                key={file.uid}
                style={{
                  border: `1px solid ${
                    file.status === "done"
                      ? token.colorSuccess
                      : file.status === "error"
                        ? token.colorError
                        : token.colorBorderSecondary
                  }`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: token.colorFillAlter,
                  transition: "border-color 0.3s",
                }}
              >
                {/* Top row: icon + name + size + status/remove */}
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 8 }}
                >
                  <Col>
                    <Space>
                      {uploadFileIcon(file.ext)}
                      <div>
                        <Text strong style={{ fontSize: 13 }}>
                          {file.name}
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 11, marginLeft: 8 }}
                        >
                          {formatBytes(file.size)}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    {file.status === "done" ? (
                      <CheckCircleOutlined
                        style={{ color: token.colorSuccess, fontSize: 18 }}
                      />
                    ) : file.status === "error" ? (
                      <CloseCircleOutlined
                        style={{ color: token.colorError, fontSize: 18 }}
                      />
                    ) : file.status === "uploading" ? (
                      <LoadingOutlined
                        style={{ color: token.colorPrimary, fontSize: 18 }}
                      />
                    ) : (
                      !uploading && (
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeFile(file.uid)}
                        />
                      )
                    )}
                  </Col>
                </Row>

                {/* Progress bar */}
                {file.status === "uploading" && (
                  <Progress
                    percent={file.progress}
                    size="small"
                    strokeColor={token.colorPrimary}
                    style={{ marginBottom: 6 }}
                  />
                )}
                {file.status === "done" && (
                  <Progress
                    percent={100}
                    size="small"
                    strokeColor={token.colorSuccess}
                    style={{ marginBottom: 6 }}
                  />
                )}

                {/* Metadata fields (only for pending files) */}
                {file.status === "pending" && (
                  <Row gutter={[8, 6]}>
                    <Col xs={24} sm={10}>
                      <Select
                        size="small"
                        value={file.module}
                        onChange={v => updateFile(file.uid, { module: v })}
                        style={{ width: "100%" }}
                        options={Object.entries(MODULE_META)
                          .filter(([k]) => k !== "all")
                          .map(([k, v]) => ({ value: k, label: v.label }))}
                      />
                    </Col>
                    <Col xs={24} sm={14}>
                      <Input
                        size="small"
                        placeholder="Description (optional)"
                        value={file.description}
                        onChange={e =>
                          updateFile(file.uid, { description: e.target.value })
                        }
                      />
                    </Col>
                    <Col xs={24}>
                      <Select
                        mode="tags"
                        size="small"
                        placeholder="Add tags (press Enter)"
                        style={{ width: "100%" }}
                        value={file.tags}
                        onChange={v => updateFile(file.uid, { tags: v })}
                        options={[
                          { value: "contract" },
                          { value: "invoice" },
                          { value: "report" },
                          { value: "certificate" },
                          { value: "id" },
                          { value: "photo" },
                          { value: "statement" },
                          { value: "policy" },
                        ]}
                      />
                    </Col>
                  </Row>
                )}
              </div>
            ))}
          </div>
        )}
      </Space>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Documents() {
  const { token } = antTheme.useToken();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<DocModule>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "archived"
  >("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = DOCUMENTS.filter(d => {
    if (moduleFilter !== "all" && d.module !== moduleFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.tags.some(t => t.includes(q)) ||
        (d.relatedTo?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // Stats
  const active = DOCUMENTS.filter(d => d.status === "active").length;
  const archived = DOCUMENTS.filter(d => d.status === "archived").length;
  const totalSize = totalBytes(DOCUMENTS);
  const usedPercent = Math.round((totalSize / (200 * 1_048_576)) * 100); // assume 200 MB quota

  // Available file types from current dataset
  const fileTypes = Array.from(new Set(DOCUMENTS.map(d => d.type))).sort();

  const columns: ColumnsType<Document> = [
    {
      title: "File",
      key: "file",
      render: (_, doc) => (
        <Space>
          {fileIcon(doc.type)}
          <div>
            <Text strong style={{ display: "block", fontSize: 13 }}>
              {doc.name}
            </Text>
            {doc.relatedTo && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {doc.relatedTo}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      width: 140,
      render: (mod: DocModule) => (
        <Tag color={MODULE_META[mod].color}>{MODULE_META[mod].label}</Tag>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 100,
      render: (s: number) => <Text type="secondary">{formatBytes(s)}</Text>,
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: "Uploaded By",
      dataIndex: "uploadedBy",
      key: "uploadedBy",
      width: 140,
      render: (name: string) => (
        <Space>
          <Avatar
            size={24}
            style={{ background: token.colorPrimary, fontSize: 11 }}
          >
            {name
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <Text style={{ fontSize: 13 }}>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      width: 120,
      render: (d: string) => <Text type="secondary">{d}</Text>,
      sorter: (a, b) => a.uploadedAt.localeCompare(b.uploadedAt),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 180,
      render: (tags: string[]) => (
        <>
          {tags.map(t => (
            <Tag key={t} style={{ marginBottom: 2, fontSize: 11 }}>
              {t}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) =>
        s === "active" ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Active
          </Tag>
        ) : (
          <Tag icon={<WarningOutlined />} color="warning">
            Archived
          </Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, doc) => (
        <Dropdown
          menu={{
            items: [
              { key: "view", icon: <EyeOutlined />, label: "Preview" },
              {
                key: "download",
                icon: <DownloadOutlined />,
                label: "Download",
              },
              { key: "share", icon: <ShareAltOutlined />, label: "Share Link" },
              { type: "divider" },
              {
                key: "archive",
                icon:
                  doc.status === "active" ? (
                    <WarningOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  ),
                label: doc.status === "active" ? "Archive" : "Restore",
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div style={{ padding: "24px 24px 40px" }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Space align="center">
              <FolderOpenOutlined
                style={{ fontSize: 28, color: token.colorPrimary }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Document Manager
                </Title>
                <Text type="secondary">
                  Centralized file storage across all modules
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              size="large"
              onClick={() => setUploadOpen(true)}
            >
              Upload Files
            </Button>
          </Col>
        </Row>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {[
            {
              title: "Total Files",
              value: DOCUMENTS.length,
              icon: (
                <FolderOpenOutlined
                  style={{ color: token.colorPrimary, fontSize: 20 }}
                />
              ),
              iconBg: token.colorPrimaryBg,
              borderAccent: token.colorPrimaryBorder,
              valueColor: token.colorPrimary,
              sub: `${formatBytes(totalBytes(DOCUMENTS))} total`,
            },
            {
              title: "Active",
              value: active,
              icon: (
                <CheckCircleOutlined
                  style={{ color: token.colorSuccess, fontSize: 20 }}
                />
              ),
              iconBg: token.colorSuccessBg,
              borderAccent: token.colorSuccessBorder,
              valueColor: token.colorSuccess,
              sub: `${Math.round((active / DOCUMENTS.length) * 100)}% of all files`,
            },
            {
              title: "Archived",
              value: archived,
              icon: (
                <WarningOutlined
                  style={{ color: token.colorWarning, fontSize: 20 }}
                />
              ),
              iconBg: token.colorWarningBg,
              borderAccent: token.colorWarningBorder,
              valueColor: token.colorWarning,
              sub: `${Math.round((archived / DOCUMENTS.length) * 100)}% of all files`,
            },
          ].map(card => (
            <Col xs={24} sm={6} key={card.title}>
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {card.title}
                  </Text>
                  <div style={{ marginTop: 6 }}>
                    <Text
                      strong
                      style={{ fontSize: 24, color: card.valueColor }}
                    >
                      {card.value}
                    </Text>
                  </div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, marginTop: 4, display: "block" }}
                  >
                    {card.sub}
                  </Text>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: card.iconBg,
                    border: `1px solid ${card.borderAccent}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Col>
          ))}
          <Col xs={24} sm={6}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: "18px 20px",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Storage Used
                </Text>
                <div style={{ marginTop: 6 }}>
                  <Text strong style={{ fontSize: 24 }}>
                    {formatBytes(totalSize)}
                  </Text>
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginLeft: 6 }}
                  >
                    / 200 MB
                  </Text>
                </div>
                <Progress
                  percent={usedPercent}
                  size="small"
                  strokeColor={
                    usedPercent > 80 ? token.colorError : token.colorPrimary
                  }
                  style={{ marginTop: 8 }}
                />
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background:
                    usedPercent > 80
                      ? token.colorErrorBg
                      : token.colorPrimaryBg,
                  border: `1px solid ${usedPercent > 80 ? token.colorErrorBorder : token.colorPrimaryBorder}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <CloudUploadOutlined
                  style={{
                    color:
                      usedPercent > 80 ? token.colorError : token.colorPrimary,
                    fontSize: 20,
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* Module Filter Chips */}
        <Card
          size="small"
          bordered={false}
          style={{ marginBottom: 16, background: token.colorFillAlter }}
        >
          <Space wrap>
            <Text type="secondary" style={{ fontSize: 13, marginRight: 4 }}>
              <FilterOutlined /> Filter by module:
            </Text>
            {(
              Object.entries(MODULE_META) as [
                DocModule,
                (typeof MODULE_META)[DocModule],
              ][]
            ).map(([key, meta]) => {
              const count =
                key === "all"
                  ? DOCUMENTS.length
                  : DOCUMENTS.filter(d => d.module === key).length;
              const active = moduleFilter === key;
              return (
                <Badge
                  key={key}
                  count={count}
                  size="small"
                  offset={[-4, 0]}
                  style={{
                    background: active
                      ? token.colorPrimary
                      : token.colorTextTertiary,
                  }}
                >
                  <Button
                    size="small"
                    type={active ? "primary" : "default"}
                    icon={meta.icon}
                    onClick={() => setModuleFilter(key)}
                    style={{ fontSize: 12 }}
                  >
                    {meta.label}
                  </Button>
                </Badge>
              );
            })}
          </Space>
        </Card>

        {/* Search + Filters */}
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={10}>
            <Input
              placeholder="Search by name, tags, or related record…"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: "100%" }}
              options={[
                { value: "all", label: "All Types" },
                ...fileTypes.map(t => ({ value: t, label: t.toUpperCase() })),
              ]}
            />
          </Col>
          <Col xs={24} md={4}>
            <Text type="secondary" style={{ lineHeight: "32px" }}>
              {filtered.length} file{filtered.length !== 1 ? "s" : ""}
            </Text>
          </Col>
        </Row>

        {/* Table */}
        <Card bordered={false} style={{ boxShadow: "none" }}>
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No documents found"
                />
              ),
            }}
          />
        </Card>

        <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
