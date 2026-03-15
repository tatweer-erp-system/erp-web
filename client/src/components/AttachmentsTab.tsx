/**
 * AttachmentsTab — reusable per-entity attachment panel.
 *
 * Works inside any detail page regardless of whether it uses
 * antd Tabs, shadcn Tabs, or a custom TabsWithIcons component.
 * Just render <AttachmentsTab entityName="Customer: ABC" /> inside
 * the relevant tab content slot.
 */

import { useState } from "react";
import {
  Upload,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Tooltip,
  Dropdown,
  Empty,
  Modal,
  Input,
  Select,
  Progress,
  Avatar,
  Row,
  Col,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UploadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  InboxOutlined,
  PaperClipOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { UploadStatus } from "@/constants/enums";

const { Text } = Typography;
const { Dragger } = Upload;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  description?: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  uploadStatus: "done" | "uploading" | "error";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
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

// ─── Pending file row (during upload) ────────────────────────────────────────

interface PendingFile {
  uid: string;
  name: string;
  type: string;
  size: number;
  description: string;
  tags: string[];
  progress: number;
  status: UploadStatus;
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function AttachUploadModal({
  open,
  onClose,
  onUploaded,
  entityName,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: (
    files: Omit<
      Attachment,
      "id" | "uploadedAt" | "uploadedBy" | "uploadStatus"
    >[]
  ) => void;
  entityName: string;
}) {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);

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
          type: ext,
          size: file.size,
          description: "",
          tags: [],
          progress: 0,
          status: UploadStatus.PENDING,
        },
      ]);
      return false;
    },
  };

  function updateFile(uid: string, patch: Partial<PendingFile>) {
    setPendingFiles(prev =>
      prev.map(f => (f.uid === uid ? { ...f, ...patch } : f))
    );
  }

  function removeFile(uid: string) {
    setPendingFiles(prev => prev.filter(f => f.uid !== uid));
  }

  async function handleUpload() {
    setUploading(true);
    // Simulate upload progress per file
    for (const file of pendingFiles) {
      updateFile(file.uid, { status: UploadStatus.UPLOADING });
      for (let p = 10; p <= 100; p += 20) {
        await new Promise<void>(r => setTimeout(r, 80));
        updateFile(file.uid, { progress: p });
      }
      updateFile(file.uid, { status: UploadStatus.DONE, progress: 100 });
    }
    setUploading(false);
    onUploaded(
      pendingFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
        description: f.description,
        tags: f.tags,
      }))
    );
    setPendingFiles([]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onCancel={() => {
        if (!uploading) {
          setPendingFiles([]);
          onClose();
        }
      }}
      title={
        <Space>
          <PaperClipOutlined />
          <span>Attach Files — {entityName}</span>
        </Space>
      }
      width={680}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setPendingFiles([]);
            onClose();
          }}
          disabled={uploading}
        >
          Cancel
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
          disabled={pendingFiles.length === 0}
          loading={uploading}
          onClick={handleUpload}
        >
          {uploading
            ? "Uploading…"
            : `Upload${pendingFiles.length > 0 ? ` (${pendingFiles.length})` : ""}`}
        </Button>,
      ]}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {/* Drop zone */}
        <Dragger {...draggerProps} style={{ padding: "8px 0" }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 36, color: "#1677ff" }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 14 }}>
            Click or drag files here
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 12 }}>
            PDF, Word, Excel, images, ZIP — max 50 MB each
          </p>
        </Dragger>

        {/* Per-file metadata */}
        {pendingFiles.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {pendingFiles.map(file => (
              <div
                key={file.uid}
                style={{
                  padding: "12px 14px",
                  marginBottom: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.02)",
                }}
              >
                {/* File header */}
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ marginBottom: 8 }}
                >
                  <Col>
                    <Space>
                      {fileIcon(file.type)}
                      <div>
                        <Text strong style={{ fontSize: 13 }}>
                          {file.name}
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, marginLeft: 8 }}
                        >
                          {formatBytes(file.size)}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    {file.status === UploadStatus.DONE ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : file.status === UploadStatus.ERROR ? (
                      <CloseCircleOutlined style={{ color: "#f5222d" }} />
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

                {/* Progress bar when uploading */}
                {file.status === UploadStatus.UPLOADING && (
                  <Progress
                    percent={file.progress}
                    size="small"
                    style={{ marginBottom: 8 }}
                  />
                )}

                {/* Metadata fields (only before upload starts) */}
                {file.status === UploadStatus.PENDING && (
                  <Row gutter={[8, 8]}>
                    <Col xs={24} sm={14}>
                      <Input
                        placeholder="Description (optional)"
                        size="small"
                        value={file.description}
                        onChange={e =>
                          updateFile(file.uid, { description: e.target.value })
                        }
                      />
                    </Col>
                    <Col xs={24} sm={10}>
                      <Select
                        mode="tags"
                        size="small"
                        placeholder="Tags"
                        style={{ width: "100%" }}
                        value={file.tags}
                        onChange={val => updateFile(file.uid, { tags: val })}
                        options={[
                          { value: "contract" },
                          { value: "invoice" },
                          { value: "report" },
                          { value: "id" },
                          { value: "certificate" },
                          { value: "photo" },
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

// ─── Main Component ────────────────────────────────────────────────────────────

interface AttachmentsTabProps {
  /** Name shown in the upload modal title, e.g. "Customer: Acme Corp" */
  entityName: string;
  /** Seed data (optional) */
  initialAttachments?: Attachment[];
}

const SEED: Attachment[] = [
  {
    id: "a1",
    name: "signed-agreement.pdf",
    type: "pdf",
    size: 430_000,
    description: "Signed customer agreement",
    tags: ["contract", "signed"],
    uploadedBy: "Ahmed Ali",
    uploadedAt: "2025-02-10",
    uploadStatus: "done",
  },
  {
    id: "a2",
    name: "id-copy.jpg",
    type: "jpg",
    size: 1_200_000,
    description: "National ID copy",
    tags: ["id"],
    uploadedBy: "Sara Hassan",
    uploadedAt: "2025-01-20",
    uploadStatus: "done",
  },
];

export default function AttachmentsTab({
  entityName,
  initialAttachments = SEED,
}: AttachmentsTabProps) {
  const [attachments, setAttachments] =
    useState<Attachment[]>(initialAttachments);
  const [modalOpen, setModalOpen] = useState(false);

  function handleUploaded(
    files: Omit<
      Attachment,
      "id" | "uploadedAt" | "uploadedBy" | "uploadStatus"
    >[]
  ) {
    const now = new Date().toISOString().slice(0, 10);
    setAttachments(prev => [
      ...prev,
      ...files.map((f, i) => ({
        ...f,
        id: `new-${Date.now()}-${i}`,
        uploadedBy: "Current User",
        uploadedAt: now,
        uploadStatus: "done" as const,
      })),
    ]);
  }

  function deleteAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  const columns: ColumnsType<Attachment> = [
    {
      title: "File",
      key: "file",
      render: (_, a) => (
        <Space>
          {fileIcon(a.type)}
          <div>
            <Text strong style={{ fontSize: 13 }}>
              {a.name}
            </Text>
            {a.description && (
              <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                {a.description}
              </Text>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 90,
      render: (s: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatBytes(s)}
        </Text>
      ),
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      width: 160,
      render: (tags: string[]) => (
        <>
          {tags.map(t => (
            <Tag key={t} style={{ fontSize: 11 }}>
              {t}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Uploaded By",
      key: "by",
      width: 150,
      render: (_, a) => (
        <Space>
          <Avatar size={22} style={{ background: "#1677ff", fontSize: 10 }}>
            {a.uploadedBy
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <Text style={{ fontSize: 12 }}>{a.uploadedBy}</Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "uploadedAt",
      key: "date",
      width: 110,
      render: (d: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {d}
        </Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, a) => (
        <Dropdown
          menu={{
            items: [
              { key: "preview", icon: <EyeOutlined />, label: "Preview" },
              {
                key: "download",
                icon: <DownloadOutlined />,
                label: "Download",
              },
              { type: "divider" },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Delete",
                danger: true,
                onClick: () => deleteAttachment(a.id),
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
    <div style={{ padding: "16px 0" }}>
      {/* Header row */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <PaperClipOutlined style={{ fontSize: 16 }} />
            <Text strong>
              {attachments.length} attachment
              {attachments.length !== 1 ? "s" : ""}
            </Text>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="small"
            onClick={() => setModalOpen(true)}
          >
            Attach Files
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={attachments}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No attachments yet"
              style={{ padding: "32px 0" }}
            >
              <Button
                type="dashed"
                icon={<UploadOutlined />}
                onClick={() => setModalOpen(true)}
              >
                Upload First File
              </Button>
            </Empty>
          ),
        }}
      />

      <AttachUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUploaded={handleUploaded}
        entityName={entityName}
      />
    </div>
  );
}
