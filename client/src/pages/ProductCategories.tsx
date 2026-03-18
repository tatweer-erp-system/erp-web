import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { categoriesService } from "@/services/inventory.service";
import type {
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/modules/inventory";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Tree,
  Button,
  Card,
  Row,
  Col,
  Grid,
  Statistic,
  Modal,
  Form,
  Select,
  Tooltip,
  Typography,
  Space,
  Input,
  Empty,
  Spin,
  Descriptions,
  notification,
} from "antd";
import type { TreeDataNode } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  ApartmentOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

// ─── Helper: Build tree from flat list ─────────────────────────────────────

interface CategoryTreeNode extends TreeDataNode {
  key: string;
  title: string;
  children: CategoryTreeNode[];
}

function buildTree(
  categories: ProductCategory[],
  getLabel: (cat: ProductCategory) => string
): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  // Create nodes
  for (const cat of categories) {
    map.set(cat.id, {
      key: cat.id,
      title: getLabel(cat),
      children: [],
      icon: <FolderOutlined />,
    });
  }

  // Build hierarchy
  for (const cat of categories) {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Mark folders with children
  const markFolders = (nodes: CategoryTreeNode[]) => {
    for (const node of nodes) {
      if (node.children.length > 0) {
        node.icon = <FolderOpenOutlined />;
        markFolders(node.children);
      }
    }
  };
  markFolders(roots);

  return roots;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductCategories() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const textMuted = theme === "dark" ? "#8a9a8a" : "#94a3b8";
  const token = {
    colorPrimary: primary,
    colorTextQuaternary: textMuted,
  };

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const [form] = Form.useForm();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: categoriesRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES_DROPDOWN, "full-list"],
    queryFn: () => categoriesService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allCategories: ProductCategory[] = useMemo(() => {
    const raw = categoriesRaw as Record<string, unknown> | undefined;
    return (raw?.data as ProductCategory[]) ?? [];
  }, [categoriesRaw]);

  // ── Selected category ──────────────────────────────────────────────────

  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return allCategories.find(c => c.id === selectedCategoryId) ?? null;
  }, [allCategories, selectedCategoryId]);

  const parentCategory = useMemo(() => {
    if (!selectedCategory?.parentId) return null;
    return allCategories.find(c => c.id === selectedCategory.parentId) ?? null;
  }, [allCategories, selectedCategory]);

  // ── Tree data ──────────────────────────────────────────────────────────

  const treeData = useMemo(
    () => buildTree(allCategories, cat => getName(cat)),
    [allCategories]
  );

  // ── Filtered tree (search) ─────────────────────────────────────────────

  const filteredTreeData = useMemo(() => {
    if (!searchText.trim()) return treeData;
    const q = searchText.trim().toLowerCase();

    // Find all matching IDs and their ancestors
    const matchingIds = new Set<string>();

    const collectAncestors = (catId: string) => {
      matchingIds.add(catId);
      const cat = allCategories.find(c => c.id === catId);
      if (cat?.parentId) collectAncestors(cat.parentId);
    };

    for (const cat of allCategories) {
      if (
        cat.nameEn.toLowerCase().includes(q) ||
        cat.nameAr.toLowerCase().includes(q)
      ) {
        collectAncestors(cat.id);
      }
    }

    // Filter tree to only show matching branches
    const filterNodes = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .filter(n => matchingIds.has(n.key))
        .map(n => ({
          ...n,
          children: filterNodes(n.children),
        }));
    };

    return filterNodes(treeData);
  }, [treeData, searchText, allCategories]);

  // ── KPI values ──────────────────────────────────────────────────────────

  const kpiTotal = allCategories.length;
  const kpiRoot = allCategories.filter(c => !c.parentId).length;

  // ── Parent dropdown options ─────────────────────────────────────────────

  const parentOptions = useMemo(() => {
    const opts = allCategories
      .filter(c => {
        // Exclude the editing category itself and its children to avoid circular refs
        if (!editingCategory) return true;
        return c.id !== editingCategory.id;
      })
      .map(c => ({
        value: c.id,
        label: getName(c),
      }));
    return [{ value: "", label: t("categories.noParent", lang) }, ...opts];
  }, [allCategories, editingCategory, lang]);

  // ── Mutations ──────────────────────────────────────────────────────────

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CATEGORIES_DROPDOWN],
    });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (dto: CreateCategoryDto) => categoriesService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("categories.created", lang) });
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCategoryDto }) =>
      categoriesService.update(id, dto),
    onSuccess: () => {
      notification.success({ message: t("categories.updated", lang) });
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      notification.success({ message: t("categories.deleted", lang) });
      setSelectedCategoryId(null);
      invalidate();
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({
      parentId: selectedCategoryId ?? "",
    });
    setModalOpen(true);
  }, [form, selectedCategoryId]);

  const openEdit = useCallback(
    (category: ProductCategory) => {
      setEditingCategory(category);
      form.setFieldsValue({
        nameEn: category.nameEn,
        nameAr: category.nameAr,
        descriptionEn: category.descriptionEn ?? undefined,
        descriptionAr: category.descriptionAr ?? undefined,
        parentId: category.parentId ?? "",
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  }, [form]);

  // ── Submit handler ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const parentId = values.parentId || undefined;

      if (editingCategory) {
        updateMutation.mutate({
          id: editingCategory.id,
          dto: {
            nameEn: values.nameEn,
            nameAr: values.nameAr,
            descriptionEn: values.descriptionEn || undefined,
            descriptionAr: values.descriptionAr || undefined,
            parentId,
            version: editingCategory.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          nameEn: values.nameEn,
          nameAr: values.nameAr,
          descriptionEn: values.descriptionEn || undefined,
          descriptionAr: values.descriptionAr || undefined,
          parentId,
        });
      }
    } catch {
      // form validation failed
    }
  };

  // ── Gradient header style for modal ────────────────────────────────────

  const gradientHeader = {
    background: `linear-gradient(135deg, ${primary}, ${theme === "dark" ? "#2dd4bf" : "#6366f1"})`,
    padding: "16px 24px",
    margin: "-20px -24px 16px -24px",
    borderRadius: "8px 8px 0 0",
    color: "#fff",
  };

  return (
    <DashboardLayout
      currentPage="ProductCategories"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Inventory", href: "#" },
        { label: t("categories.title", lang) },
      ]}
    >
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("categories.total", lang),
              value: kpiTotal,
              icon: <AppstoreOutlined />,
              iconColor: token.colorPrimary,
              iconBg: `${token.colorPrimary}15`,
            },
            {
              title: t("categories.rootCategories", lang),
              value: kpiRoot,
              icon: <ApartmentOutlined />,
              iconColor: "#6366f1",
              iconBg: "#6366f115",
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
                    <Statistic
                      value={s.value}
                      valueStyle={{
                        fontSize: 24,
                        lineHeight: 1,
                      }}
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

        {/* ── Main Content: Split Panel ────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {/* ── Left Panel: Tree ──────────────────────────────────────── */}
          <Col xs={24} md={8}>
            <Card
              title={t("categories.title", lang)}
              extra={
                <Space>
                  <Tooltip title="Reload">
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => refetch()}
                    />
                  </Tooltip>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={openCreate}
                  >
                    {!isMobile && t("categories.new", lang)}
                  </Button>
                </Space>
              }
              styles={{ body: { padding: "8px 16px" } }}
            >
              <Input.Search
                placeholder={t("categories.search", lang)}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                style={{ marginBottom: 12 }}
              />

              {isLoading ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <Spin />
                </div>
              ) : filteredTreeData.length === 0 ? (
                <Empty
                  description={t("categories.noData", lang) || "No categories"}
                  style={{ padding: "40px 0" }}
                />
              ) : (
                <Tree
                  showIcon
                  treeData={filteredTreeData}
                  selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
                  expandedKeys={expandedKeys}
                  onExpand={keys => setExpandedKeys(keys as string[])}
                  onSelect={keys => {
                    if (keys.length > 0) {
                      setSelectedCategoryId(keys[0] as string);
                    }
                  }}
                  style={{ maxHeight: 500, overflow: "auto" }}
                  blockNode
                />
              )}
            </Card>
          </Col>

          {/* ── Right Panel: Details ─────────────────────────────────── */}
          <Col xs={24} md={16}>
            <Card
              styles={{
                body: { padding: selectedCategory ? "24px" : "60px 24px" },
              }}
            >
              {!selectedCategory ? (
                <Empty
                  image={
                    <ApartmentOutlined
                      style={{ fontSize: 48, color: textMuted }}
                    />
                  }
                  description={
                    <Text type="secondary">
                      {t("categories.selectCategory", lang)}
                    </Text>
                  }
                  style={{ padding: "60px 0" }}
                />
              ) : (
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div>
                      <Title
                        level={4}
                        style={{ margin: 0, color: token.colorPrimary }}
                      >
                        {getName(selectedCategory)}
                      </Title>
                      <Text type="secondary">
                        {t("categories.details", lang)}
                      </Text>
                    </div>
                    <Space>
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => openEdit(selectedCategory)}
                      >
                        {t("categories.edit", lang)}
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          Modal.confirm({
                            title: t("categories.delete", lang),
                            content: t("categories.deleteConfirm", lang),
                            okButtonProps: { danger: true },
                            onOk: () =>
                              deleteMutation.mutate(selectedCategory.id),
                          });
                        }}
                      >
                        {t("categories.delete", lang)}
                      </Button>
                    </Space>
                  </div>

                  {/* Details */}
                  <Descriptions
                    bordered
                    column={{ xs: 1, sm: 2 }}
                    size="middle"
                  >
                    <Descriptions.Item label={t("categories.nameEn", lang)}>
                      <Text strong>{selectedCategory.nameEn}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("categories.nameAr", lang)}>
                      <Text strong dir="rtl">
                        {selectedCategory.nameAr}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("categories.descriptionEn", lang)}
                    >
                      {selectedCategory.descriptionEn || (
                        <Text type="secondary">—</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("categories.descriptionAr", lang)}
                    >
                      {selectedCategory.descriptionAr ? (
                        <span dir="rtl">{selectedCategory.descriptionAr}</span>
                      ) : (
                        <Text type="secondary">—</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label={t("categories.parent", lang)}
                      span={2}
                    >
                      {parentCategory ? (
                        <Button
                          type="link"
                          size="small"
                          style={{ padding: 0 }}
                          onClick={() =>
                            setSelectedCategoryId(parentCategory.id)
                          }
                        >
                          {getName(parentCategory)}
                        </Button>
                      ) : (
                        <Text type="secondary">
                          {t("categories.noParent", lang)}
                        </Text>
                      )}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Child categories list */}
                  {(() => {
                    const children = allCategories.filter(
                      c => c.parentId === selectedCategory.id
                    );
                    if (children.length === 0) return null;
                    return (
                      <div>
                        <Text
                          type="secondary"
                          style={{ marginBottom: 8, display: "block" }}
                        >
                          {t("categories.subtitle", lang)} ({children.length})
                        </Text>
                        <Space wrap>
                          {children.map(child => (
                            <Button
                              key={child.id}
                              size="small"
                              icon={<FolderOutlined />}
                              onClick={() => setSelectedCategoryId(child.id)}
                            >
                              {getName(child)}
                            </Button>
                          ))}
                        </Space>
                      </div>
                    );
                  })()}
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </Space>

      {/* ── Create / Edit Modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={
          editingCategory
            ? t("categories.edit", lang)
            : t("categories.new", lang)
        }
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={isMobile ? "95vw" : 640}
        destroyOnHidden
        title={null}
        styles={{ body: { paddingTop: 20 } }}
      >
        {/* Gradient header */}
        <div style={gradientHeader}>
          <Space>
            {editingCategory ? <EditOutlined /> : <PlusOutlined />}
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              {editingCategory
                ? `${t("categories.edit", lang)} — ${getName(editingCategory)}`
                : t("categories.new", lang)}
            </span>
          </Space>
        </div>

        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("categories.nameEn", lang)}
                name="nameEn"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("categories.nameAr", lang)}
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
                label={t("categories.descriptionEn", lang)}
                name="descriptionEn"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("categories.descriptionAr", lang)}
                name="descriptionAr"
              >
                <Input.TextArea rows={2} dir="rtl" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item label={t("categories.parent", lang)} name="parentId">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder={t("categories.noParent", lang)}
                  options={parentOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
