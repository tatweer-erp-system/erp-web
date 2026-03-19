import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { accountGroupsService } from "@/services/accounting.service";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import type { AccountGroup } from "@/types/modules/accounting";
import {
  Tree,
  Card,
  Row,
  Col,
  Tag,
  Space,
  Typography,
  Button,
  Input,
  Drawer,
  Descriptions,
  Statistic,
  Badge,
  Grid,
  Tooltip,
  theme as antTheme,
  Modal,
  Form,
  Select,
  message,
  notification,
  Spin,
  Empty,
} from "antd";
import type { TreeDataNode } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileTextOutlined,
  ApartmentOutlined,
  EyeOutlined,
  CloseOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SubnodeOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenTree(nodes: AccountGroup[]): AccountGroup[] {
  const result: AccountGroup[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children?.length) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}

function filterTree(
  nodes: AccountGroup[],
  searchLower: string
): AccountGroup[] {
  return nodes.reduce<AccountGroup[]>((acc, node) => {
    const matchesSelf =
      node.codePrefix.toLowerCase().includes(searchLower) ||
      node.nameEn.toLowerCase().includes(searchLower) ||
      node.nameAr.toLowerCase().includes(searchLower);

    const filteredChildren = node.children
      ? filterTree(node.children, searchLower)
      : [];

    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: matchesSelf ? node.children : filteredChildren,
      });
    }
    return acc;
  }, []);
}

function collectKeys(nodes: AccountGroup[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    keys.push(node.id);
    if (node.children?.length) {
      keys.push(...collectKeys(node.children));
    }
  }
  return keys;
}

function buildParentOptions(
  nodes: AccountGroup[],
  depth = 0,
  excludeId?: string
): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue;
    const indent = "\u00A0\u00A0".repeat(depth);
    opts.push({
      value: node.id,
      label: `${indent}${node.codePrefix} - ${node.nameEn}`,
    });
    if (node.children?.length) {
      opts.push(...buildParentOptions(node.children, depth + 1, excludeId));
    }
  }
  return opts;
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

function AccountGroupModal({
  open,
  parent,
  editRecord,
  allNodes,
  onClose,
  lang,
}: {
  open: boolean;
  parent: AccountGroup | null;
  editRecord?: AccountGroup | null;
  allNodes: AccountGroup[];
  onClose: () => void;
  lang: string;
}) {
  const { token } = antTheme.useToken();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { theme } = useAppSettings();
  const isEdit = !!editRecord;

  const primaryColor = theme === "dark" ? "#37D399" : "#3B82F6";

  const createMutation = useMutation({
    mutationFn: (dto: Partial<AccountGroup>) =>
      accountGroupsService.create(
        dto as Parameters<typeof accountGroupsService.create>[0]
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNT_GROUPS_TREE],
      });
      message.success(t("accounting.ag.created", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", "en"),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: Partial<AccountGroup> & { version: number }) =>
      accountGroupsService.update(
        editRecord!.id,
        dto as Parameters<typeof accountGroupsService.update>[1]
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNT_GROUPS_TREE],
      });
      message.success(t("accounting.ag.updated", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", "en"),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit) {
        updateMutation.mutate({
          ...values,
          version: editRecord!.version ?? 0,
        });
      } else {
        createMutation.mutate({
          ...values,
          parentId: values.parentId || parent?.id || null,
        });
      }
    } catch {
      // validation failed
    }
  };

  const isSaving = isEdit ? updateMutation.isPending : createMutation.isPending;

  React.useEffect(() => {
    if (isEdit && editRecord && open) {
      form.setFieldsValue({
        codePrefix: editRecord.codePrefix,
        nameEn: editRecord.nameEn,
        nameAr: editRecord.nameAr,
        parentId: editRecord.parentId ?? undefined,
      });
    } else if (!isEdit && parent && open) {
      form.setFieldsValue({
        parentId: parent.id,
      });
    }
  }, [isEdit, editRecord, parent, open, form]);

  const parentOptions = useMemo(
    () => buildParentOptions(allNodes, 0, editRecord?.id),
    [allNodes, editRecord?.id]
  );

  const isTopLevel = !parent && !isEdit;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      destroyOnHidden
      width={640}
      styles={{
        body: { padding: 0 },
        mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
      }}
    >
      {/* Gradient header */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
            padding: "22px 24px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.18)",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {isEdit
                ? t("accounting.ag.edit", lang)
                : isTopLevel
                  ? t("accounting.ag.new", lang)
                  : t("accounting.ag.addChild", lang)}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "rgba(255,255,255,0.18)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
              }}
            >
              <CloseOutlined />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(255,255,255,0.22)",
                border: "2px solid rgba(255,255,255,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {isEdit ? (
                <EditOutlined />
              ) : isTopLevel ? (
                <PlusOutlined />
              ) : (
                <SubnodeOutlined />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                }}
              >
                {isEdit
                  ? t("accounting.ag.edit", lang)
                  : isTopLevel
                    ? t("accounting.ag.new", lang)
                    : t("accounting.ag.addChild", lang)}
              </div>
              {parent && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.72)",
                    marginTop: 3,
                  }}
                >
                  {parent.codePrefix} &middot; {getName(parent)}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: token.colorBgContainer,
            borderRadius: "24px 24px 0 0",
          }}
        />
      </div>

      {/* Form body */}
      <div style={{ padding: "4px 24px 8px" }}>
        <Form form={form} layout="vertical">
          {/* Code Prefix */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="codePrefix"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.ag.codePrefix", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.ag.codePrefix", lang),
                },
                {
                  max: 10,
                  message: `${t("accounting.ag.codePrefix", lang)} (max 10)`,
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input
                placeholder="e.g. 1000"
                style={{ fontFamily: "monospace" }}
                maxLength={10}
              />
            </Form.Item>
          </div>

          {/* Name EN */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="nameEn"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.ag.nameEn", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.ag.nameEn", lang),
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input placeholder="e.g. Current Assets" dir="ltr" />
            </Form.Item>
          </div>

          {/* Name AR */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="nameAr"
              label={
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 6 }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>
                    {t("accounting.ag.nameAr", lang)}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: token.colorError,
                      background: `${token.colorError}14`,
                      borderRadius: 4,
                      padding: "1px 5px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("accounting.coa.required", lang)}
                  </span>
                </div>
              }
              rules={[
                {
                  required: true,
                  message: t("accounting.ag.nameAr", lang),
                },
              ]}
              style={{ marginBottom: 14 }}
            >
              <Input
                placeholder={
                  "\u0645\u062B\u0644: \u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0645\u062A\u062F\u0627\u0648\u0644\u0629"
                }
                dir="rtl"
              />
            </Form.Item>
          </div>

          {/* Parent Group */}
          <div
            style={{
              background: token.colorBgLayout,
              borderRadius: 10,
              padding: "14px 16px 4px",
              marginBottom: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Form.Item
              name="parentId"
              label={
                <span style={{ fontSize: 12, fontWeight: 700 }}>
                  {t("accounting.ag.parent", lang)}
                </span>
              }
              style={{ marginBottom: 14 }}
            >
              <Select
                allowClear
                showSearch
                placeholder={t("accounting.ag.parent", lang)}
                options={parentOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>
        </Form>
      </div>

      {/* Footer */}
      <div
        style={{
          background: token.colorBgContainer,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          padding: "14px 24px",
          display: "flex",
          gap: 10,
        }}
      >
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSave}
          size="large"
          style={{
            flex: 1,
            height: 42,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            border: "none",
            boxShadow: `0 4px 12px ${primaryColor}44`,
          }}
        >
          {isEdit
            ? t("accounting.coa.saveChanges", lang)
            : t("accounting.coa.createAccount", lang)}
        </Button>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
          size="large"
          style={{ height: 42, fontWeight: 600, minWidth: 100 }}
        >
          {t("accounting.coa.cancel", lang)}
        </Button>
      </div>
    </Modal>
  );
}

// ─── Account Groups Content ──────────────────────────────────────────────────

function AccountGroupsContent() {
  const { token } = antTheme.useToken();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";
  const queryClient = useQueryClient();
  const { theme } = useAppSettings();

  const primaryColor = theme === "dark" ? "#37D399" : "#3B82F6";

  const { data: treeData, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ACCOUNT_GROUPS_TREE],
    queryFn: () => accountGroupsService.tree(),
    staleTime: 5 * 60_000,
  });

  const allNodes: AccountGroup[] = treeData ?? [];

  const agName = (ag: AccountGroup) => getName(ag);

  // Summary computed from tree data
  const summary = useMemo(() => {
    const flat = flattenTree(allNodes);
    return {
      total: flat.length,
      withChildren: flat.filter(g => g.children && g.children.length > 0)
        .length,
      withoutChildren: flat.filter(g => !g.children || g.children.length === 0)
        .length,
    };
  }, [allNodes]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountGroupsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ACCOUNT_GROUPS_TREE],
      });
      message.success(t("accounting.ag.deleted", lang));
      setDrawerOpen(false);
      setSelected(null);
    },
    onError: (err: Error) => {
      notification.error({
        message: t("mySettings.error.save", lang),
        description: err.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<AccountGroup | null>(null);
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<AccountGroup[]>([]);
  const [childModalOpen, setChildModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Auto-expand all keys on first load
  React.useEffect(() => {
    if (allNodes.length > 0 && expandedKeys.length === 0) {
      setExpandedKeys(collectKeys(allNodes));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNodes]);

  const visibleNodes = search.trim()
    ? filterTree(allNodes, search.trim().toLowerCase())
    : allNodes;

  const openAccountGroup = (ag: AccountGroup, pushHistory = true) => {
    if (pushHistory && selected) {
      setHistory(prev => [...prev, selected]);
    }
    setSelected(ag);
    setDrawerOpen(true);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setSelected(prev);
    }
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setHistory([]);
  };

  function buildTree(nodes: AccountGroup[]): TreeDataNode[] {
    return nodes.map(ag => {
      const isGroup = !!ag.children?.length;
      return {
        key: ag.id,
        isLeaf: !isGroup,
        children: ag.children ? buildTree(ag.children) : undefined,
        title: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingInlineEnd: 12,
              width: "100%",
            }}
            onClick={() => openAccountGroup(ag, false)}
          >
            <Space size={6}>
              {isGroup ? (
                <FolderOutlined style={{ color: primaryColor }} />
              ) : (
                <FileTextOutlined
                  style={{ color: token.colorTextTertiary, fontSize: 12 }}
                />
              )}
              <Text
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: token.colorTextTertiary,
                }}
              >
                {ag.codePrefix}
              </Text>
              <Text style={{ fontWeight: isGroup ? 600 : 400 }}>
                {agName(ag)}
              </Text>
            </Space>
            <Space size={8}>
              <Tag
                color={isGroup ? "processing" : "default"}
                style={{ borderRadius: 20, fontSize: 10 }}
              >
                {isGroup
                  ? `${ag.children!.length} ${t("accounting.ag.title", lang)}`
                  : t("accounting.ag.codePrefix", lang)}
              </Tag>
              <Tooltip title={t("accounting.ag.viewDetails", lang)}>
                <EyeOutlined
                  style={{ color: token.colorTextQuaternary, fontSize: 12 }}
                />
              </Tooltip>
            </Space>
          </div>
        ),
      };
    });
  }

  const kpiCards = [
    {
      title: t("accounting.ag.total", lang),
      value: summary.total,
      color: primaryColor,
    },
    {
      title:
        lang === "ar"
          ? "\u0645\u0639 \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0641\u0631\u0639\u064A\u0629"
          : "With Children",
      value: summary.withChildren,
      color: "#10B981",
    },
    {
      title:
        lang === "ar"
          ? "\u0628\u062F\u0648\u0646 \u0645\u062C\u0645\u0648\u0639\u0627\u062A \u0641\u0631\u0639\u064A\u0629"
          : "Without Children",
      value: summary.withoutChildren,
      color: "#F59E0B",
    },
  ];

  return (
    <>
      {/* KPI cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {kpiCards.map(kpi => (
          <Col xs={24} sm={8} key={kpi.title}>
            <Card
              size="small"
              styles={{ body: { padding: "14px 16px" } }}
              style={{
                borderLeft: `4px solid ${kpi.color}`,
              }}
            >
              <Statistic
                title={
                  <Text
                    type="secondary"
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {kpi.title}
                  </Text>
                }
                value={kpi.value}
                styles={{ content: {
                  fontSize: 24,
                  fontWeight: 700,
                  color: kpi.color,
                } }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main tree card */}
      <Card
        styles={{ body: { padding: 0 } }}
        title={
          <Space>
            <ApartmentOutlined style={{ color: primaryColor }} />
            <span style={{ fontWeight: 700 }}>
              {t("accounting.ag.title", lang)}
            </span>
          </Space>
        }
        extra={
          <Space>
            <Input
              prefix={
                <SearchOutlined style={{ color: token.colorTextQuaternary }} />
              }
              placeholder={t("accounting.ag.search", lang)}
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setNewModalOpen(true)}
            >
              {t("accounting.ag.new", lang)}
            </Button>
          </Space>
        }
      >
        <div style={{ padding: "8px 12px", minHeight: 200 }}>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 48,
              }}
            >
              <Spin size="large" />
            </div>
          ) : visibleNodes.length === 0 ? (
            <Empty
              description={
                search.trim()
                  ? t("accounting.ag.search", lang)
                  : t("accounting.ag.title", lang)
              }
              style={{ padding: 48 }}
            />
          ) : (
            <Tree
              treeData={buildTree(visibleNodes)}
              expandedKeys={expandedKeys}
              onExpand={keys => setExpandedKeys(keys)}
              blockNode
              showLine={{ showLeafIcon: false }}
              style={{ fontSize: 13 }}
            />
          )}
        </div>
      </Card>

      {/* Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        placement={isRTL ? "left" : "right"}
        size={isMobile ? "100%" : 480}
        title={null}
        closable={false}
        destroyOnHidden
        styles={{
          body: {
            padding: 0,
            background: token.colorBgLayout,
            display: "flex",
            flexDirection: "column",
          },
          mask: { backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.35)" },
        }}
      >
        {selected && (
          <>
            {/* Gradient header */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                  padding: "22px 24px 60px",
                }}
              >
                {/* top bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {history.length > 0 && (
                      <button
                        onClick={goBack}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.18)",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: 13,
                        }}
                      >
                        <ArrowLeftOutlined />
                      </button>
                    )}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        borderRadius: 6,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("accounting.ag.details", lang)}
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.18)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 13,
                    }}
                  >
                    <CloseOutlined />
                  </button>
                </div>
                {/* account group info */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.22)",
                      border: "2px solid rgba(255,255,255,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "monospace",
                      flexShrink: 0,
                    }}
                  >
                    {selected.codePrefix}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#fff",
                        lineHeight: 1.2,
                      }}
                    >
                      {agName(selected)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.72)",
                        marginTop: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>{selected.codePrefix}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* curved bottom mask */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 28,
                  background: token.colorBgLayout,
                  borderRadius: "24px 24px 0 0",
                }}
              />
            </div>

            {/* Scrollable content */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: "4px 20px 20px" }}
            >
              <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                {/* Details card */}
                <div
                  style={{
                    background: token.colorBgContainer,
                    borderRadius: 10,
                    padding: "16px",
                    border: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: token.colorTextSecondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 12,
                    }}
                  >
                    {t("accounting.ag.viewDetails", lang)}
                  </div>
                  <Descriptions
                    column={1}
                    size="small"
                    colon={false}
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: token.colorTextSecondary,
                        fontSize: 12,
                        width: 130,
                      },
                      content: { fontSize: 13 },
                    }}
                  >
                    <Descriptions.Item
                      label={t("accounting.ag.codePrefix", lang)}
                    >
                      <Text
                        style={{ fontFamily: "monospace", fontWeight: 600 }}
                      >
                        {selected.codePrefix}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t("accounting.ag.nameEn", lang)}>
                      {selected.nameEn}
                    </Descriptions.Item>
                    <Descriptions.Item label={t("accounting.ag.nameAr", lang)}>
                      <span dir="rtl">{selected.nameAr}</span>
                    </Descriptions.Item>
                    {selected.isActive !== undefined && (
                      <Descriptions.Item
                        label={
                          lang === "ar"
                            ? "\u0627\u0644\u062D\u0627\u0644\u0629"
                            : "Status"
                        }
                      >
                        <Badge
                          status={selected.isActive ? "success" : "default"}
                          text={
                            selected.isActive
                              ? lang === "ar"
                                ? "\u0646\u0634\u0637"
                                : "Active"
                              : lang === "ar"
                                ? "\u063A\u064A\u0631 \u0646\u0634\u0637"
                                : "Inactive"
                          }
                        />
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>

                {/* Children section */}
                {selected.children && selected.children.length > 0 && (
                  <div
                    style={{
                      background: token.colorBgContainer,
                      borderRadius: 10,
                      padding: "16px",
                      border: `1px solid ${token.colorBorderSecondary}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: token.colorTextSecondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {t("accounting.ag.title", lang)} (
                        {selected.children.length})
                      </div>
                      <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: primaryColor,
                        }}
                        onClick={() => setChildModalOpen(true)}
                      >
                        {t("accounting.ag.addChild", lang)}
                      </Button>
                    </div>
                    <Space
                      orientation="vertical"
                      size={6}
                      style={{ width: "100%" }}
                    >
                      {selected.children.map(c => (
                        <div
                          key={c.id}
                          onClick={() => openAccountGroup(c)}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 12px",
                            borderRadius: 8,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            background: token.colorBgLayout,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor =
                              primaryColor + "60";
                            e.currentTarget.style.background =
                              primaryColor + "08";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor =
                              token.colorBorderSecondary;
                            e.currentTarget.style.background =
                              token.colorBgLayout;
                          }}
                        >
                          <Space size={8}>
                            {c.children?.length ? (
                              <FolderOutlined
                                style={{ color: primaryColor, fontSize: 13 }}
                              />
                            ) : (
                              <FileTextOutlined
                                style={{
                                  color: token.colorTextTertiary,
                                  fontSize: 12,
                                }}
                              />
                            )}
                            <Text
                              style={{ fontFamily: "monospace", fontSize: 11 }}
                              type="secondary"
                            >
                              {c.codePrefix}
                            </Text>
                            <Text style={{ fontSize: 13 }}>{agName(c)}</Text>
                          </Space>
                          <Tag
                            color={
                              c.children?.length ? "processing" : "default"
                            }
                            style={{ borderRadius: 20, fontSize: 10 }}
                          >
                            {c.children?.length
                              ? `${c.children.length}`
                              : t("accounting.ag.codePrefix", lang)}
                          </Tag>
                        </div>
                      ))}
                    </Space>
                  </div>
                )}
              </Space>
            </div>

            {/* Sticky footer */}
            <div
              style={{
                background: token.colorBgContainer,
                borderTop: `1px solid ${token.colorBorderSecondary}`,
                padding: "12px 20px",
                display: "flex",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <Button
                type="primary"
                icon={<SubnodeOutlined />}
                onClick={() => setChildModalOpen(true)}
                style={{
                  flex: 1,
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                  border: "none",
                  boxShadow: `0 4px 12px ${primaryColor}44`,
                }}
              >
                {t("accounting.ag.addChild", lang)}
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditModalOpen(true)}
              >
                {t("accounting.ag.edit", lang)}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
                onClick={() => {
                  if (selected?.id) {
                    Modal.confirm({
                      title: t("accounting.ag.delete", lang),
                      content: `${t("accounting.ag.deleteConfirm", lang)} "${agName(selected)}"?`,
                      okText: t("accounting.ag.delete", lang),
                      okType: "danger",
                      onOk: () => deleteMutation.mutate(selected.id),
                    });
                  }
                }}
              >
                {t("accounting.ag.delete", lang)}
              </Button>
            </div>
          </>
        )}
      </Drawer>

      {/* Create child modal */}
      <AccountGroupModal
        open={childModalOpen}
        parent={selected}
        allNodes={allNodes}
        onClose={() => setChildModalOpen(false)}
        lang={lang}
      />

      {/* New account group modal (top-level) */}
      <AccountGroupModal
        open={newModalOpen}
        parent={null}
        allNodes={allNodes}
        onClose={() => setNewModalOpen(false)}
        lang={lang}
      />

      {/* Edit modal */}
      <AccountGroupModal
        open={editModalOpen}
        parent={null}
        editRecord={selected}
        allNodes={allNodes}
        onClose={() => setEditModalOpen(false)}
        lang={lang}
      />
    </>
  );
}

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function AccountGroups() {
  const lang = useLangStore(s => s.lang);
  const isRTL = lang === "ar";

  return (
    <DashboardLayout
      currentPage={t("accounting.ag.title", lang)}
      breadcrumbs={[
        { label: t("Dashboard", lang), href: "/" },
        { label: t("ACCOUNTING", lang) },
        { label: t("accounting.ag.title", lang) },
      ]}
    >
      <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
        <AccountGroupsContent />
      </div>
    </DashboardLayout>
  );
}
