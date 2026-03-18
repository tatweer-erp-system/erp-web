/**
 * Roles & Permissions list page.
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
  Checkbox,
  Collapse,
  Badge,
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
  SafetyCertificateOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CopyableCode } from "@/components/common/CopyableCode";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import {
  rolesService,
  type RoleDetail,
  type CreateRoleDto,
  type UpdateRoleDto,
  type PermissionItem,
} from "@/services/roles.service";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function RolesPermissions() {
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewRole, setViewRole] = useState<RoleDetail | null>(null);
  const [form] = Form.useForm();

  // Permission state for create/edit modal
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: rolesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.ROLES],
    queryFn: () => rolesService.list({ limit: 200 }),
    staleTime: 30_000,
  });

  const allRoles: RoleDetail[] = useMemo(() => {
    return ((rolesRaw as Record<string, unknown>)?.data as RoleDetail[]) ?? [];
  }, [rolesRaw]);

  // All available permissions
  const { data: permissionsRaw } = useQuery({
    queryKey: [QUERY_KEYS.ROLES, "permissions"],
    queryFn: () => rolesService.listAllPermissions({ limit: 500 }),
    staleTime: 60_000,
  });

  const allPermissions: PermissionItem[] = useMemo(() => {
    return (
      ((permissionsRaw as Record<string, unknown>)?.data as PermissionItem[]) ??
      []
    );
  }, [permissionsRaw]);

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    for (const perm of allPermissions) {
      const mod = perm.module || "general";
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(perm);
    }
    return groups;
  }, [allPermissions]);

  // ── Filtered + paginated data ────────────────────────────────────────
  const filteredRoles = useMemo(() => {
    let filtered = [...allRoles];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        r =>
          r.nameEn.toLowerCase().includes(q) ||
          r.nameAr.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allRoles, search]);

  const totalRows = filteredRoles.length;
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, page, pageSize]);

  // ── KPI values ──────────────────────────────────────────────────────
  const kpiTotal = allRoles.length;
  const kpiActive = allRoles.filter(r => r.isActive !== false).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.ROLES],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateRoleDto) => rolesService.create(dto),
    onSuccess: () => {
      toast.success(t("roles.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      rolesService.update(id, dto),
    onSuccess: () => {
      toast.success(t("roles.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => {
      toast.success(t("roles.deleted", lang));
      invalidate();
    },
  });

  const assignPermMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => rolesService.assignPermissions(roleId, permissionIds),
    onSuccess: () => {
      toast.success(t("roles.permissionsSaved", lang));
      invalidate();
    },
    onError: () => {
      toast.error(t("roles.permissionsFailed", lang));
    },
  });

  // ── Role permissions for drawer ───────────────────────────────────────
  const [drawerPermissions, setDrawerPermissions] = useState<PermissionItem[]>(
    []
  );
  const [loadingPerms, setLoadingPerms] = useState(false);

  const loadRolePermissions = useCallback(async (roleId: string) => {
    setLoadingPerms(true);
    try {
      const res = await rolesService.getPermissions(roleId);
      const perms =
        ((res as Record<string, unknown>)?.data as PermissionItem[]) ?? [];
      setDrawerPermissions(perms);
    } catch {
      setDrawerPermissions([]);
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingRole(null);
    setSelectedPermissions([]);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    async (role: RoleDetail) => {
      if (role.isSystem) {
        toast.error(t("roles.cannotEditSystem", lang));
        return;
      }
      setEditingRole(role);
      form.setFieldsValue({
        nameEn: role.nameEn,
        nameAr: role.nameAr,
        descriptionEn: role.descriptionEn ?? undefined,
        descriptionAr: role.descriptionAr ?? undefined,
        isActive: role.isActive !== false,
      });
      // Load existing permissions
      try {
        const res = await rolesService.getPermissions(role.id);
        const perms =
          ((res as Record<string, unknown>)?.data as PermissionItem[]) ?? [];
        setSelectedPermissions(perms.map(p => p.id));
      } catch {
        setSelectedPermissions([]);
      }
      setModalOpen(true);
    },
    [form, t, lang]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingRole(null);
    setSelectedPermissions([]);
    form.resetFields();
  }, [form]);

  const openView = useCallback(
    (role: RoleDetail) => {
      setViewRole(role);
      setDrawerOpen(true);
      loadRolePermissions(role.id);
    },
    [loadRolePermissions]
  );

  // ── Permission toggle helpers ────────────────────────────────────────
  const togglePermission = useCallback((permId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(id => id !== permId)
        : [...prev, permId]
    );
  }, []);

  const toggleModuleAll = useCallback(
    (modulePerms: PermissionItem[]) => {
      const moduleIds = modulePerms.map(p => p.id);
      const allSelected = moduleIds.every(id =>
        selectedPermissions.includes(id)
      );
      if (allSelected) {
        setSelectedPermissions(prev =>
          prev.filter(id => !moduleIds.includes(id))
        );
      } else {
        setSelectedPermissions(prev =>
          Array.from(new Set([...prev, ...moduleIds]))
        );
      }
    },
    [selectedPermissions]
  );

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingRole) {
        updateMutation.mutate(
          {
            id: editingRole.id,
            dto: {
              nameEn: values.nameEn,
              nameAr: values.nameAr,
              descriptionEn: values.descriptionEn,
              descriptionAr: values.descriptionAr,
              permissionIds: selectedPermissions,
              version: editingRole.version ?? 0,
            },
          },
          {
            onSuccess: () => {
              // Also assign permissions
              assignPermMutation.mutate({
                roleId: editingRole.id,
                permissionIds: selectedPermissions,
              });
            },
          }
        );
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          descriptionEn: values.descriptionEn,
          descriptionAr: values.descriptionAr,
          permissionIds: selectedPermissions,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    const role = allRoles.find(r => r.id === deleteId);
    if (role?.isSystem) {
      toast.error(t("roles.cannotDeleteSystem", lang));
      setDeleteId(null);
      return;
    }
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("roles.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("roles.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, allRoles, t, lang]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useRoleColumns(t, lang, openView, openEdit, setDeleteId);

  const rowSelection: TableProps<RoleDetail>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("Settings", lang), href: "#" },
    { label: t("roles.title", lang) },
  ];

  // ── KPI cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      title: t("roles.total", lang),
      value: kpiTotal,
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("roles.totalActive", lang),
      value: kpiActive,
      icon: <CheckCircleOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
  ];

  // Group drawer permissions by module for display
  const drawerPermsByModule = useMemo(() => {
    const groups: Record<string, PermissionItem[]> = {};
    for (const perm of drawerPermissions) {
      const mod = perm.module || "general";
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(perm);
    }
    return groups;
  }, [drawerPermissions]);

  return (
    <DashboardLayout currentPage="RolesPermissions" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row (2 KPI cards) ──────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12}>
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
                {t("roles.new", lang)}
              </Button>
            </div>

            {/* Right: Search + Reload + Export + ViewMode */}
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("roles.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
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
                {selectedRows.length} {t("roles.selected", lang)}
              </Text>
              <Button size="small" icon={<DownloadOutlined />}>
                {t("products.export", lang)}
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("roles.delete", lang)}
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("roles.allStatuses", lang)}
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
              dataSource={paginatedRoles}
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
            roles={paginatedRoles}
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
        title={t("roles.delete", lang)}
        description={t("roles.deleteConfirm", lang)}
        confirmLabel={t("roles.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Create / Edit Modal ───────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingRole ? t("roles.edit", lang) : t("roles.new", lang)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 720}
        destroyOnHidden
        title={
          editingRole
            ? `${t("roles.edit", lang)} — ${getName(editingRole)}`
            : t("roles.new", lang)
        }
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("roles.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("roles.nameAr", lang)}
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
                label={t("roles.descriptionEn", lang)}
                name="descriptionEn"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("roles.descriptionAr", lang)}
                name="descriptionAr"
              >
                <Input.TextArea rows={2} dir="rtl" />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Permissions Section ──────────────────────────────────────── */}
          {Object.keys(permissionsByModule).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div className="flex justify-between items-center mb-2">
                <Text strong>{t("roles.permissions", lang)}</Text>
                <Space>
                  <Button
                    size="small"
                    type="link"
                    onClick={() =>
                      setSelectedPermissions(allPermissions.map(p => p.id))
                    }
                  >
                    {t("roles.selectAll", lang)}
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setSelectedPermissions([])}
                  >
                    {t("roles.deselectAll", lang)}
                  </Button>
                </Space>
              </div>
              <div
                style={{
                  maxHeight: 300,
                  overflowY: "auto",
                  border: "1px solid var(--ant-color-border)",
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <Collapse
                  ghost
                  size="small"
                  items={Object.entries(permissionsByModule).map(
                    ([mod, perms]) => {
                      const modSelectedCount = perms.filter(p =>
                        selectedPermissions.includes(p.id)
                      ).length;
                      return {
                        key: mod,
                        label: (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={modSelectedCount === perms.length}
                              indeterminate={
                                modSelectedCount > 0 &&
                                modSelectedCount < perms.length
                              }
                              onClick={e => e.stopPropagation()}
                              onChange={() => toggleModuleAll(perms)}
                            />
                            <Text
                              strong
                              style={{ textTransform: "capitalize" }}
                            >
                              {mod}
                            </Text>
                            <Badge
                              count={`${modSelectedCount}/${perms.length}`}
                              showZero
                              style={{
                                backgroundColor:
                                  modSelectedCount > 0 ? "#52c41a" : "#d9d9d9",
                              }}
                            />
                          </div>
                        ),
                        children: (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 ps-6">
                            {perms.map(perm => (
                              <Checkbox
                                key={perm.id}
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                              >
                                {getName(perm)}
                              </Checkbox>
                            ))}
                          </div>
                        ),
                      };
                    }
                  )}
                />
              </div>
            </div>
          )}
        </Form>
      </Modal>

      {/* ── 6. Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewRole(null);
          setDrawerPermissions([]);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewRole ? `${t("roles.details", lang)} — ${getName(viewRole)}` : ""
        }
      >
        {viewRole && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("roles.nameEn", lang)}</Text>
                <br />
                <Text strong>{viewRole.nameEn}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("roles.nameAr", lang)}</Text>
                <br />
                <Text strong dir="rtl">
                  {viewRole.nameAr}
                </Text>
              </Col>
              {(viewRole.descriptionEn || viewRole.descriptionAr) && (
                <>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("roles.descriptionEn", lang)}
                    </Text>
                    <br />
                    <Text>{viewRole.descriptionEn ?? "—"}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">
                      {t("roles.descriptionAr", lang)}
                    </Text>
                    <br />
                    <Text dir="rtl">{viewRole.descriptionAr ?? "—"}</Text>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Text type="secondary">{t("roles.isActive", lang)}</Text>
                <br />
                <Tag
                  color={viewRole.isActive !== false ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewRole.isActive !== false
                    ? t("roles.active", lang)
                    : t("roles.inactive", lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("roles.isSystem", lang)}</Text>
                <br />
                {viewRole.isSystem ? (
                  <Tag
                    color="orange"
                    icon={<LockOutlined />}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("roles.systemRole", lang)}
                  </Tag>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </Col>
              {viewRole.usersCount !== undefined && (
                <Col span={12}>
                  <Text type="secondary">{t("roles.usersCount", lang)}</Text>
                  <br />
                  <Text strong>{viewRole.usersCount}</Text>
                </Col>
              )}
            </Row>

            {/* ── Permissions list ──────────────────────────────────────── */}
            <div>
              <Text
                strong
                style={{ fontSize: 15, display: "block", marginBottom: 8 }}
              >
                {t("roles.permissions", lang)}
              </Text>
              {loadingPerms ? (
                <Card loading size="small" />
              ) : drawerPermissions.length === 0 ? (
                <Text type="secondary">{t("roles.noPermissions", lang)}</Text>
              ) : (
                <Collapse
                  ghost
                  size="small"
                  defaultActiveKey={Object.keys(drawerPermsByModule)}
                  items={Object.entries(drawerPermsByModule).map(
                    ([mod, perms]) => ({
                      key: mod,
                      label: (
                        <div className="flex items-center gap-2">
                          <SafetyCertificateOutlined
                            style={{ color: "#8b5cf6" }}
                          />
                          <Text strong style={{ textTransform: "capitalize" }}>
                            {mod}
                          </Text>
                          <Badge count={perms.length} showZero />
                        </div>
                      ),
                      children: (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 ps-6">
                          {perms.map(perm => (
                            <Tag key={perm.id} style={{ marginBottom: 4 }}>
                              {getName(perm)}
                            </Tag>
                          ))}
                        </div>
                      ),
                    })
                  )}
                />
              )}
            </div>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }}>
              {!viewRole.isSystem && (
                <>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      openEdit(viewRole);
                    }}
                  >
                    {t("roles.edit", lang)}
                  </Button>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      setDeleteId(viewRole.id);
                    }}
                  >
                    {t("roles.delete", lang)}
                  </Button>
                </>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useRoleColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (role: RoleDetail) => void,
  onEdit: (role: RoleDetail) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<RoleDetail> {
  return useMemo(
    () => [
      {
        title: t("roles.nameEn", lang),
        dataIndex: "nameEn",
        width: 200,
        sorter: false,
        render: (_: unknown, rec: RoleDetail) => (
          <div className="flex items-center gap-2">
            <CopyableCode value={getName(rec)} />
            {rec.isSystem && (
              <Tag
                color="orange"
                icon={<LockOutlined />}
                style={{ borderRadius: 20, padding: "2px 8px", fontSize: 11 }}
              >
                {t("roles.systemRole", lang)}
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: t("roles.descriptionEn", lang),
        dataIndex: "descriptionEn",
        width: 250,
        responsive: ["lg"] as const,
        render: (v: string | null | undefined) => (
          <Text type={v ? undefined : "secondary"} ellipsis>
            {v ?? "—"}
          </Text>
        ),
      },
      {
        title: t("roles.usersCount", lang),
        dataIndex: "usersCount",
        width: 100,
        align: "center" as const,
        render: (v: number | undefined) => <Text strong>{v ?? 0}</Text>,
      },
      {
        title: t("roles.isActive", lang),
        dataIndex: "isActive",
        width: 110,
        sorter: false,
        render: (v: boolean | undefined) => (
          <Tag
            color={v !== false ? "green" : "red"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v !== false ? t("roles.active", lang) : t("roles.inactive", lang)}
          </Tag>
        ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: RoleDetail) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("roles.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec),
                },
                ...(rec.isSystem
                  ? []
                  : [
                      {
                        key: "edit",
                        label: t("roles.edit", lang),
                        icon: <EditOutlined />,
                        onClick: () => onEdit(rec),
                      },
                      { type: "divider" as const, key: "d1" },
                      {
                        key: "delete",
                        label: t("roles.delete", lang),
                        danger: true,
                        icon: <DeleteOutlined />,
                        onClick: () => setDeleteId(rec.id),
                      },
                    ]),
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
  roles,
  isLoading,
  onClick,
  t,
  lang,
}: {
  roles: RoleDetail[];
  isLoading: boolean;
  onClick: (role: RoleDetail) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (roles.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {roles.map(r => (
        <Col key={r.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => onClick(r)}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="font-bold text-base text-primary">
                {getName(r)}
              </span>
              <div className="flex gap-1">
                {r.isSystem && (
                  <Tag
                    color="orange"
                    icon={<LockOutlined />}
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("roles.systemRole", lang)}
                  </Tag>
                )}
                <Tag
                  color={r.isActive !== false ? "green" : "red"}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {r.isActive !== false
                    ? t("roles.active", lang)
                    : t("roles.inactive", lang)}
                </Tag>
              </div>
            </div>

            {r.descriptionEn && (
              <p className="text-sm text-gray-500 mb-1">{r.descriptionEn}</p>
            )}
            {r.usersCount !== undefined && (
              <p className="text-sm text-gray-500">
                {t("roles.usersCount", lang)}: {r.usersCount}
              </p>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
