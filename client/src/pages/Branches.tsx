/**
 * Branches list page.
 * Follows the CashAccounts.tsx design pattern exactly.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Grid,
  Dropdown,
  Typography,
  Tag,
  Statistic,
  Input,
  Segmented,
  Tooltip,
  Modal,
  Form,
  Switch,
  Drawer,
  Space,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExportOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import {
  branchesService,
  type BranchDetail,
  type CreateBranchDto,
  type UpdateBranchDto,
} from "@/services/branches.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function Branches() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  // ── Search with 400ms debounce ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // ── State ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewBranch, setViewBranch] = useState<BranchDetail | null>(null);
  const [form] = Form.useForm();

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: branchesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.BRANCHES],
    queryFn: () => branchesService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allBranches: BranchDetail[] = useMemo(() => {
    return (
      ((branchesRaw as Record<string, unknown>)?.data as BranchDetail[]) ?? []
    );
  }, [branchesRaw]);

  // ── Filtered + paginated data ────────────────────────────────────────
  const filteredBranches = useMemo(() => {
    let filtered = [...allBranches];
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(b => b.isActive === isActive);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        b =>
          b.nameEn.toLowerCase().includes(q) ||
          b.nameAr.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allBranches, statusFilter, search]);

  const totalRows = filteredBranches.length;
  const paginatedBranches = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBranches.slice(start, start + pageSize);
  }, [filteredBranches, page, pageSize]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────
  const kpiTotal = allBranches.length;
  const kpiActive = allBranches.filter(b => b.isActive).length;
  const kpiInactive = allBranches.filter(b => !b.isActive).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.BRANCHES],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateBranchDto) => branchesService.create(dto),
    onSuccess: () => {
      toast.success(t("branches.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchDto }) =>
      branchesService.update(id, dto),
    onSuccess: () => {
      toast.success(t("branches.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => branchesService.remove(id),
    onSuccess: () => {
      toast.success(t("branches.deleted", lang));
      invalidate();
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingBranch(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (branch: BranchDetail) => {
      setEditingBranch(branch);
      form.setFieldsValue({
        nameEn: branch.nameEn,
        nameAr: branch.nameAr,
        code: branch.code,
        city: branch.city ?? undefined,
        address: branch.address ?? undefined,
        phone: branch.phone ?? undefined,
        email: branch.email ?? undefined,
        isActive: branch.isActive,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingBranch(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((branch: BranchDetail) => {
    setViewBranch(branch);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingBranch) {
        updateMutation.mutate({
          id: editingBranch.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            code: values.code,
            city: values.city,
            address: values.address,
            phone: values.phone,
            email: values.email,
            isActive: values.isActive,
            version: editingBranch.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          code: values.code,
          city: values.city,
          address: values.address,
          phone: values.phone,
          email: values.email,
          isActive: values.isActive ?? true,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("branches.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("branches.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useBranchColumns(t, lang, openView, openEdit, setDeleteId);

  const rowSelection: TableProps<BranchDetail>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("Settings", lang), href: "#" },
    { label: t("branches.title", lang) },
  ];

  // ── KPI cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      title: t("branches.total", lang),
      value: kpiTotal,
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("branches.totalActive", lang),
      value: kpiActive,
      icon: <CheckCircleOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("branches.totalInactive", lang),
      value: kpiInactive,
      icon: <CloseCircleOutlined />,
      iconColor: "#ef4444",
      iconBg: "#ef444415",
    },
  ];

  return (
    <DashboardLayout currentPage="Branches" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row (3 KPI cards) ──────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={8}>
              <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
                <div className="flex justify-between items-start">
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
                    <Statistic
                      value={s.value}
                      valueStyle={{ fontSize: 24, lineHeight: 1 }}
                    />
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

        {/* ── 2. Toolbar Card ─────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            {/* Left: Create button */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("branches.new", lang)}
              </Button>
            </div>

            {/* Right: Search + Filter + Reload + Export + ViewMode */}
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("branches.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("branches.allStatuses", lang)}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  type={isFilterOpen ? "primary" : "default"}
                />
              </Tooltip>
              <Tooltip title={t("seq.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    { key: "csv", label: "CSV", icon: <ExportOutlined /> },
                    { key: "excel", label: "Excel", icon: <ExportOutlined /> },
                    { key: "pdf", label: "PDF", icon: <ExportOutlined /> },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  {t("products.export", lang)}
                </Button>
              </Dropdown>
              <Segmented
                value={viewMode}
                onChange={v => setViewMode(v as "table" | "grid")}
                options={[
                  { value: "table", icon: <UnorderedListOutlined /> },
                  { value: "grid", icon: <AppstoreOutlined /> },
                ]}
              />
            </div>
          </div>

          {/* Filter Panel (collapsible) */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("branches.isActive", lang)}
                  </Text>
                  <Segmented
                    value={statusFilter}
                    onChange={v => {
                      setStatusFilter(v as string);
                      setPage(1);
                    }}
                    block
                    options={[
                      {
                        value: "all",
                        label: t("branches.allStatuses", lang),
                      },
                      {
                        value: "active",
                        label: t("branches.active", lang),
                      },
                      {
                        value: "inactive",
                        label: t("branches.inactive", lang),
                      },
                    ]}
                    size="small"
                  />
                </Col>
              </Row>

              {/* Active filter tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {statusFilter !== "all" && (
                  <Tag closable onClose={() => setStatusFilter("all")}>
                    {t("branches.isActive", lang)}:{" "}
                    {statusFilter === "active"
                      ? t("branches.active", lang)
                      : t("branches.inactive", lang)}
                  </Tag>
                )}
              </div>
            </div>
          )}

          {/* Bulk Bar */}
          {selectedRows.length > 0 && (
            <div
              className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
              style={{
                background: "var(--ant-color-primary-bg)",
                border: "1px solid var(--ant-color-primary-border)",
              }}
            >
              <Text strong style={{ color: "var(--ant-color-primary)" }}>
                {selectedRows.length} {t("branches.selected", lang)}
              </Text>
              <Button size="small" icon={<DownloadOutlined />}>
                {t("products.export", lang)}
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("branches.delete", lang)}
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("branches.allStatuses", lang)}
              </Button>
            </div>
          )}
        </Card>

        {/* ── 3. Table view (desktop) OR Grid card view (mobile) ──────── */}
        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={paginatedBranches}
              rowSelection={rowSelection}
              loading={isLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              onRow={rec => ({
                onClick: () => openView(rec),
                style: { cursor: "pointer" },
              })}
              pagination={{
                current: page,
                pageSize,
                total: totalRows,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}--${range[1]} of ${total}`,
                onChange: (p, ps) => {
                  setPage(p);
                  setPageSize(ps);
                },
              }}
              locale={{ emptyText: <EmptyState /> }}
            />
          </Card>
        ) : (
          <MobileGrid
            branches={paginatedBranches}
            isLoading={isLoading}
            onClick={openView}
            t={t}
            lang={lang}
          />
        )}
      </div>

      {/* ── 4. ConfirmDialog for delete ──────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("branches.delete", lang)}
        description={t("branches.deleteConfirm", lang)}
        confirmLabel={t("branches.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingBranch ? t("branches.edit", lang) : t("branches.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={
          editingBranch
            ? `${t("branches.edit", lang)} — ${getName(editingBranch)}`
            : t("branches.new", lang)
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("branches.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("branches.nameAr", lang)}
                name="nameAr"
                rules={[{ required: true }]}
              >
                <Input dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("branches.code", lang)}
                name="code"
                rules={[{ required: true }]}
              >
                <Input style={{ fontFamily: "monospace" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("branches.city", lang)} name="city">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label={t("branches.address", lang)} name="address">
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("branches.phone", lang)} name="phone">
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("branches.email", lang)} name="email">
                <Input type="email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("branches.isActive", lang)}
                name="isActive"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* ── 6. Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewBranch(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewBranch
            ? `${t("branches.details", lang)} — ${getName(viewBranch)}`
            : ""
        }
      >
        {viewBranch && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("branches.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewBranch.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("branches.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewBranch.nameAr}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("branches.code", lang)}</Text>
                <br />
                <Text strong style={{ fontFamily: "monospace" }}>
                  {viewBranch.code}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("branches.isMain", lang)}</Text>
                <br />
                {viewBranch.isMain ? (
                  <Tag
                    color="gold"
                    icon={<StarFilled />}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("branches.hq", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              {viewBranch.city && (
                <Col span={12}>
                  <Text type="secondary">{t("branches.city", lang)}</Text>
                  <br />
                  <Text>{viewBranch.city}</Text>
                </Col>
              )}
              {viewBranch.address && (
                <Col span={12}>
                  <Text type="secondary">{t("branches.address", lang)}</Text>
                  <br />
                  <Text>{viewBranch.address}</Text>
                </Col>
              )}
              {viewBranch.phone && (
                <Col span={12}>
                  <Text type="secondary">{t("branches.phone", lang)}</Text>
                  <br />
                  <Text>{viewBranch.phone}</Text>
                </Col>
              )}
              {viewBranch.email && (
                <Col span={12}>
                  <Text type="secondary">{t("branches.email", lang)}</Text>
                  <br />
                  <Text>{viewBranch.email}</Text>
                </Col>
              )}
              <Col span={12}>
                <Text type="secondary">{t("branches.isActive", lang)}</Text>
                <br />
                <Tag
                  color={viewBranch.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewBranch.isActive
                    ? t("branches.active", lang)
                    : t("branches.inactive", lang)}
                </Tag>
              </Col>
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewBranch);
                }}
              >
                {t("branches.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  setDeleteId(viewBranch.id);
                }}
              >
                {t("branches.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useBranchColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (branch: BranchDetail) => void,
  onEdit: (branch: BranchDetail) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<BranchDetail> {
  return useMemo(
    () => [
      {
        title: t("branches.nameEn", lang),
        dataIndex: "nameEn",
        width: 200,
        sorter: false,
        render: (_: unknown, rec: BranchDetail) => (
          <CopyableCode value={getName(rec)} />
        ),
      },
      {
        title: t("branches.code", lang),
        dataIndex: "code",
        width: 120,
        sorter: false,
        render: (v: string) => <Text className="font-mono">{v}</Text>,
      },
      {
        title: t("branches.city", lang),
        dataIndex: "city",
        width: 140,
        responsive: ["lg"] as const,
        render: (v: string | null | undefined) => <Text>{v ?? "—"}</Text>,
      },
      {
        title: t("branches.phone", lang),
        dataIndex: "phone",
        width: 150,
        responsive: ["lg"] as const,
        render: (v: string | null | undefined) => <Text>{v ?? "—"}</Text>,
      },
      {
        title: t("branches.isMain", lang),
        dataIndex: "isMain",
        width: 110,
        render: (v: boolean) =>
          v ? (
            <Tag
              color="gold"
              icon={<StarFilled />}
              style={{ borderRadius: 20, padding: "2px 10px" }}
            >
              {t("branches.hq", lang)}
            </Tag>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: t("branches.isActive", lang),
        dataIndex: "isActive",
        width: 110,
        sorter: false,
        render: (v: boolean) => (
          <Tag
            color={v ? "green" : "red"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v ? t("branches.active", lang) : t("branches.inactive", lang)}
          </Tag>
        ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: BranchDetail) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("branches.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
                },
                {
                  key: "edit",
                  label: t("branches.edit", lang),
                  icon: <EditOutlined />,
                  onClick: () => onEdit(rec),
                },
                { type: "divider" as const, key: "d1" },
                {
                  key: "delete",
                  label: t("branches.delete", lang),
                  danger: true,
                  icon: <DeleteOutlined />,
                  onClick: () => setDeleteId(rec.id),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        ),
      },
    ],
    [t, lang, onView, onEdit, setDeleteId]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  branches,
  isLoading,
  onClick,
  t,
  lang,
}: {
  branches: BranchDetail[];
  isLoading: boolean;
  onClick: (branch: BranchDetail) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (branches.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {branches.map(b => (
        <Col key={b.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => onClick(b)}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="font-mono font-bold text-base text-primary">
                {getName(b)}
              </span>
              <div className="flex gap-1">
                {b.isMain && (
                  <Tag
                    color="gold"
                    icon={<StarFilled />}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("branches.hq", lang)}
                  </Tag>
                )}
                <Tag
                  color={b.isActive ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {b.isActive
                    ? t("branches.active", lang)
                    : t("branches.inactive", lang)}
                </Tag>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-1 font-mono">{b.code}</p>
            {b.city && <p className="text-sm text-gray-500">{b.city}</p>}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
