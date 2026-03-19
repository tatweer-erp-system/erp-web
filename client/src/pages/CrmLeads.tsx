/**
 * CRM Leads list page.
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
  Select,
  Drawer,
  Space,
  DatePicker,
  InputNumber,
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
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  SwapOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { getName } from "@/shared/utils/getName.util";
import { leadsService } from "@/services/crm.service";
import { LeadType, LeadPriority, LeadSource } from "@/constants/enums";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Lead, CreateLeadDto, UpdateLeadDto } from "@/types/modules/crm";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function CrmLeads() {
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
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Modal / Drawer state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [form] = Form.useForm();

  // Won / Lost / Convert modals
  const [wonId, setWonId] = useState<string | null>(null);
  const [lostId, setLostId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [convertId, setConvertId] = useState<string | null>(null);

  // ── Queries ────────────────────────────────────────────────────────────
  const {
    data: leadsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.CRM_LEADS],
    queryFn: () => leadsService.list({ limit: 100 }),
    staleTime: 30_000,
  });

  const allLeads: Lead[] = useMemo(() => {
    const list = ((leadsRaw as Record<string, unknown>)?.data as Lead[]) ?? [];
    return list;
  }, [leadsRaw]);

  // ── Filtered + paginated data ────────────────────────────────────────
  const filteredLeads = useMemo(() => {
    let filtered = [...allLeads];
    if (priorityFilter !== "all") {
      filtered = filtered.filter(l => l.priority === priorityFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter(l => l.type === typeFilter);
    }
    if (sourceFilter !== "all") {
      filtered = filtered.filter(l => l.source === sourceFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        l =>
          l.title?.toLowerCase().includes(q) ||
          l.partnerNameEn?.toLowerCase().includes(q) ||
          l.partnerNameAr?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allLeads, priorityFilter, typeFilter, sourceFilter, search]);

  const totalRows = filteredLeads.length;
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page, pageSize]);

  // ── KPI values (computed from ALL data, not filtered) ──────────────
  const kpiTotal = allLeads.length;
  const kpiOpportunities = allLeads.filter(
    l => l.type === LeadType.OPPORTUNITY
  ).length;
  const kpiWon = allLeads.filter(l => l.isWon).length;
  const kpiLost = allLeads.filter(l => l.isLost).length;

  // ── Mutations ──────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [QUERY_KEYS.CRM_LEADS],
    });

  const createMutation = useMutation({
    mutationFn: (dto: CreateLeadDto) => leadsService.create(dto),
    onSuccess: () => {
      toast.success(t("crm.leads.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateLeadDto }) =>
      leadsService.update(id, dto),
    onSuccess: () => {
      toast.success(t("crm.leads.updated", lang));
      invalidate();
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadsService.remove(id),
    onSuccess: () => {
      toast.success(t("crm.leads.deleted", lang));
      invalidate();
    },
  });

  const wonMutation = useMutation({
    mutationFn: (id: string) => leadsService.markWon(id),
    onSuccess: () => {
      toast.success(t("crm.leads.markedWon", lang));
      invalidate();
      setWonId(null);
    },
  });

  const lostMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leadsService.markLost(id, reason),
    onSuccess: () => {
      toast.success(t("crm.leads.markedLost", lang));
      invalidate();
      setLostId(null);
      setLostReason("");
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => leadsService.convert(id),
    onSuccess: () => {
      toast.success(t("crm.leads.converted", lang));
      invalidate();
      setConvertId(null);
    },
  });

  // ── Modal helpers ──────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingLead(null);
    form.resetFields();
    form.setFieldsValue({
      type: LeadType.LEAD,
      priority: LeadPriority.MEDIUM,
      source: LeadSource.OTHER,
    });
    setModalOpen(true);
  }, [form]);

  const openEdit = useCallback(
    (lead: Lead) => {
      setEditingLead(lead);
      form.setFieldsValue({
        title: lead.title,
        partnerId: lead.partnerId ?? undefined,
        type: lead.type,
        stageId: lead.stageId ?? undefined,
        priority: lead.priority,
        source: lead.source,
        expectedRevenue: lead.expectedRevenue
          ? Number(lead.expectedRevenue)
          : undefined,
        assignedTo: lead.assignedTo ?? undefined,
        expectedCloseDate: lead.expectedCloseDate ?? undefined,
        tags: lead.tags ?? undefined,
        notes: lead.notes ?? undefined,
      });
      setModalOpen(true);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingLead(null);
    form.resetFields();
  }, [form]);

  const openView = useCallback((lead: Lead) => {
    setViewLead(lead);
    setDrawerOpen(true);
  }, []);

  // ── Submit handler ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingLead) {
        updateMutation.mutate({
          id: editingLead.id,
          dto: {
            title: values.title,
            partnerId: values.partnerId,
            type: values.type,
            stageId: values.stageId,
            priority: values.priority,
            source: values.source,
            expectedRevenue: values.expectedRevenue,
            assignedTo: values.assignedTo,
            expectedCloseDate: values.expectedCloseDate,
            tags: values.tags,
            notes: values.notes,
            version: editingLead.version ?? 0,
          },
        });
      } else {
        createMutation.mutate({
          title: values.title,
          partnerId: values.partnerId,
          type: values.type ?? LeadType.LEAD,
          stageId: values.stageId,
          priority: values.priority ?? LeadPriority.MEDIUM,
          source: values.source ?? LeadSource.OTHER,
          expectedRevenue: values.expectedRevenue,
          assignedTo: values.assignedTo,
          expectedCloseDate: values.expectedCloseDate,
          tags: values.tags,
          notes: values.notes,
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
      onSuccess: () => setDeleteId(null),
      onError: () => toast.error(t("crm.leads.deleteFailed", lang)),
    });
  }, [deleteId, deleteMutation, t, lang]);

  // ── Columns ────────────────────────────────────────────────────────────
  const columns = useLeadColumns(
    t,
    lang,
    openView,
    openEdit,
    setDeleteId,
    setWonId,
    setLostId,
    setConvertId
  );

  const rowSelection: TableProps<Lead>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("crm.title", lang), href: "#" },
    { label: t("crm.leads.title", lang) },
  ];

  // ── KPI cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      title: t("crm.leads.totalLeads", lang),
      value: kpiTotal,
      suffix: "",
      icon: <FileTextOutlined />,
      iconColor: "#8b5cf6",
      iconBg: "#8b5cf615",
    },
    {
      title: t("crm.leads.opportunities", lang),
      value: kpiOpportunities,
      suffix: "",
      icon: <TrophyOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("crm.leads.won", lang),
      value: kpiWon,
      suffix: "",
      icon: <CheckCircleOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("crm.leads.lost", lang),
      value: kpiLost,
      suffix: "",
      icon: <CloseCircleOutlined />,
      iconColor: "#ef4444",
      iconBg: "#ef444415",
    },
  ];

  // ── Priority filter options ────────────────────────────────────────────
  const priorityOptions = [
    { value: "all", label: t("common.all", lang) },
    { value: LeadPriority.LOW, label: t("crm.leads.priorityLow", lang) },
    {
      value: LeadPriority.MEDIUM,
      label: t("crm.leads.priorityMedium", lang),
    },
    { value: LeadPriority.HIGH, label: t("crm.leads.priorityHigh", lang) },
  ];

  const typeOptions = [
    { value: "all", label: t("common.all", lang) },
    { value: LeadType.LEAD, label: t("crm.leads.typeLead", lang) },
    {
      value: LeadType.OPPORTUNITY,
      label: t("crm.leads.typeOpportunity", lang),
    },
  ];

  const sourceOptions = [
    { value: "all", label: t("common.all", lang) },
    { value: LeadSource.WEBSITE, label: t("crm.leads.sourceWebsite", lang) },
    { value: LeadSource.REFERRAL, label: t("crm.leads.sourceReferral", lang) },
    {
      value: LeadSource.SOCIAL_MEDIA,
      label: t("crm.leads.sourceSocialMedia", lang),
    },
    {
      value: LeadSource.COLD_CALL,
      label: t("crm.leads.sourceColdCall", lang),
    },
    { value: LeadSource.OTHER, label: t("crm.leads.sourceOther", lang) },
  ];

  return (
    <DashboardLayout currentPage="CrmLeads" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row (4 KPI cards) ──────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={12} lg={6}>
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
                      suffix={s.suffix}
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
            {/* Left: Create + Pipeline */}
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("crm.leads.new", lang)}
              </Button>
              <Button icon={<LinkOutlined />} href={ROUTES.CRM_PIPELINE}>
                {t("crm.leads.pipeline", lang)}
              </Button>
            </div>

            {/* Right: Search + Filter + Reload + ViewMode */}
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("crm.leads.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("crm.leads.filters", lang)}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  type={isFilterOpen ? "primary" : "default"}
                />
              </Tooltip>
              <Tooltip title={t("common.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
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
                <Col xs={24} sm={8} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("crm.leads.priority", lang)}
                  </Text>
                  <Select
                    value={priorityFilter}
                    onChange={v => {
                      setPriorityFilter(v);
                      setPage(1);
                    }}
                    options={priorityOptions}
                    style={{ width: "100%" }}
                    size="small"
                  />
                </Col>
                <Col xs={24} sm={8} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("crm.leads.type", lang)}
                  </Text>
                  <Select
                    value={typeFilter}
                    onChange={v => {
                      setTypeFilter(v);
                      setPage(1);
                    }}
                    options={typeOptions}
                    style={{ width: "100%" }}
                    size="small"
                  />
                </Col>
                <Col xs={24} sm={8} lg={6}>
                  <Text type="secondary" className="text-xs mb-1 block">
                    {t("crm.leads.source", lang)}
                  </Text>
                  <Select
                    value={sourceFilter}
                    onChange={v => {
                      setSourceFilter(v);
                      setPage(1);
                    }}
                    options={sourceOptions}
                    style={{ width: "100%" }}
                    size="small"
                  />
                </Col>
              </Row>

              {/* Active filter tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {priorityFilter !== "all" && (
                  <Tag closable onClose={() => setPriorityFilter("all")}>
                    {t("crm.leads.priority", lang)}: {priorityFilter}
                  </Tag>
                )}
                {typeFilter !== "all" && (
                  <Tag closable onClose={() => setTypeFilter("all")}>
                    {t("crm.leads.type", lang)}: {typeFilter}
                  </Tag>
                )}
                {sourceFilter !== "all" && (
                  <Tag closable onClose={() => setSourceFilter("all")}>
                    {t("crm.leads.source", lang)}: {sourceFilter}
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
                {selectedRows.length} {t("common.selected", lang)}
              </Text>
              <Button size="small" danger icon={<DeleteOutlined />}>
                {t("common.delete", lang)}
              </Button>
              <Button
                size="small"
                type="text"
                onClick={() => setSelectedRows([])}
              >
                {t("common.clearSelection", lang)}
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
              dataSource={paginatedLeads}
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
            leads={paginatedLeads}
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
        title={t("crm.leads.delete", lang)}
        description={t("crm.leads.deleteConfirm", lang)}
        confirmLabel={t("crm.leads.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />

      {/* ── 5. Won confirmation modal ────────────────────────────────────── */}
      <Modal
        open={!!wonId}
        onCancel={() => setWonId(null)}
        onOk={() => wonId && wonMutation.mutate(wonId)}
        okText={t("crm.leads.markWon", lang)}
        confirmLoading={wonMutation.isPending}
        title={t("crm.leads.markWon", lang)}
      >
        <Text>{t("crm.leads.wonConfirm", lang)}</Text>
      </Modal>

      {/* ── 6. Lost modal with reason ────────────────────────────────────── */}
      <Modal
        open={!!lostId}
        onCancel={() => {
          setLostId(null);
          setLostReason("");
        }}
        onOk={() =>
          lostId && lostMutation.mutate({ id: lostId, reason: lostReason })
        }
        okText={t("crm.leads.markLost", lang)}
        okButtonProps={{ danger: true }}
        confirmLoading={lostMutation.isPending}
        title={t("crm.leads.markLost", lang)}
      >
        <Text style={{ display: "block", marginBottom: 8 }}>
          {t("crm.leads.lostReasonLabel", lang)}
        </Text>
        <Input.TextArea
          rows={3}
          value={lostReason}
          onChange={e => setLostReason(e.target.value)}
          placeholder={t("crm.leads.lostReasonPlaceholder", lang)}
        />
      </Modal>

      {/* ── 7. Convert confirmation modal ────────────────────────────────── */}
      <Modal
        open={!!convertId}
        onCancel={() => setConvertId(null)}
        onOk={() => convertId && convertMutation.mutate(convertId)}
        okText={t("crm.leads.convert", lang)}
        confirmLoading={convertMutation.isPending}
        title={t("crm.leads.convert", lang)}
      >
        <Text>{t("crm.leads.convertConfirm", lang)}</Text>
      </Modal>

      {/* ── 8. Create / Edit Drawer ──────────────────────────────────────── */}
      <Drawer
        open={modalOpen}
        onClose={closeModal}
        size={isMobile ? "100%" : 640}
        title={
          editingLead
            ? `${t("crm.leads.edit", lang)} — ${editingLead.title}`
            : t("crm.leads.new", lang)
        }
        extra={
          <Space>
            <Button onClick={closeModal}>{t("common.cancel", lang)}</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingLead
                ? t("crm.leads.save", lang)
                : t("crm.leads.create", lang)}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label={t("crm.leads.titleField", lang)}
            name="title"
            rules={[
              { required: true, message: t("crm.leads.titleRequired", lang) },
            ]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("crm.leads.partner", lang)} name="partnerId">
                <Input placeholder={t("crm.leads.partnerPlaceholder", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("crm.leads.type", lang)} name="type">
                <Select
                  options={[
                    {
                      value: LeadType.LEAD,
                      label: t("crm.leads.typeLead", lang),
                    },
                    {
                      value: LeadType.OPPORTUNITY,
                      label: t("crm.leads.typeOpportunity", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("crm.leads.stage", lang)} name="stageId">
                <Input placeholder={t("crm.leads.stagePlaceholder", lang)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={t("crm.leads.priority", lang)} name="priority">
                <Select
                  options={[
                    {
                      value: LeadPriority.LOW,
                      label: t("crm.leads.priorityLow", lang),
                    },
                    {
                      value: LeadPriority.MEDIUM,
                      label: t("crm.leads.priorityMedium", lang),
                    },
                    {
                      value: LeadPriority.HIGH,
                      label: t("crm.leads.priorityHigh", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item label={t("crm.leads.source", lang)} name="source">
                <Select
                  options={[
                    {
                      value: LeadSource.WEBSITE,
                      label: t("crm.leads.sourceWebsite", lang),
                    },
                    {
                      value: LeadSource.REFERRAL,
                      label: t("crm.leads.sourceReferral", lang),
                    },
                    {
                      value: LeadSource.SOCIAL_MEDIA,
                      label: t("crm.leads.sourceSocialMedia", lang),
                    },
                    {
                      value: LeadSource.COLD_CALL,
                      label: t("crm.leads.sourceColdCall", lang),
                    },
                    {
                      value: LeadSource.OTHER,
                      label: t("crm.leads.sourceOther", lang),
                    },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("crm.leads.expectedRevenue", lang)}
                name="expectedRevenue"
              >
                <InputNumber style={{ width: "100%" }} min={0} precision={2} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("crm.leads.assignedTo", lang)}
                name="assignedTo"
              >
                <Input
                  placeholder={t("crm.leads.assignedToPlaceholder", lang)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={t("crm.leads.expectedCloseDate", lang)}
                name="expectedCloseDate"
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label={t("crm.leads.tags", lang)} name="tags">
            <Input placeholder={t("crm.leads.tagsPlaceholder", lang)} />
          </Form.Item>

          <Form.Item label={t("crm.leads.notes", lang)} name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ── 9. Detail Drawer ─────────────────────────────────────────────── */}
      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setViewLead(null);
        }}
        size={isMobile ? "100%" : 640}
        title={
          viewLead ? `${t("crm.leads.details", lang)} — ${viewLead.title}` : ""
        }
      >
        {viewLead && (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {/* Revenue highlight */}
            {viewLead.expectedRevenue != null && (
              <Card
                size="small"
                styles={{
                  body: {
                    padding: "16px 20px",
                    textAlign: "center",
                  },
                }}
              >
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 4 }}
                >
                  {t("crm.leads.expectedRevenue", lang)}
                </Text>
                <Text
                  strong
                  style={{
                    fontSize: 28,
                    fontFamily: "monospace",
                    color: "#10b981",
                  }}
                >
                  {Number(viewLead.expectedRevenue ?? 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginTop: 2 }}
                >
                  SAR
                </Text>
              </Card>
            )}

            <Row gutter={[16, 12]}>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.titleField", lang)}</Text>
                <br />
                <Text strong>{viewLead.title}</Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.partner", lang)}</Text>
                <br />
                <Text strong>
                  {viewLead.partnerNameEn || viewLead.partnerNameAr
                    ? getName({
                        nameEn: viewLead.partnerNameEn,
                        nameAr: viewLead.partnerNameAr,
                      })
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.type", lang)}</Text>
                <br />
                <Tag
                  color={
                    viewLead.type === LeadType.OPPORTUNITY ? "green" : "blue"
                  }
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewLead.type === LeadType.OPPORTUNITY
                    ? t("crm.leads.typeOpportunity", lang)
                    : t("crm.leads.typeLead", lang)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.stage", lang)}</Text>
                <br />
                <Text>
                  {viewLead.stageNameEn || viewLead.stageNameAr
                    ? getName({
                        nameEn: viewLead.stageNameEn,
                        nameAr: viewLead.stageNameAr,
                      })
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.priority", lang)}</Text>
                <br />
                <Tag
                  color={getPriorityColor(viewLead.priority)}
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {viewLead.priority}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.source", lang)}</Text>
                <br />
                <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>
                  {viewLead.source ?? "—"}
                </Tag>
              </Col>
              <Col span={12}>
                <Text type="secondary">{t("crm.leads.assignedTo", lang)}</Text>
                <br />
                <Text>
                  {viewLead.assignedToNameEn || viewLead.assignedToNameAr
                    ? getName({
                        nameEn: viewLead.assignedToNameEn,
                        nameAr: viewLead.assignedToNameAr,
                      })
                    : "—"}
                </Text>
              </Col>
              <Col span={12}>
                <Text type="secondary">
                  {t("crm.leads.expectedCloseDate", lang)}
                </Text>
                <br />
                <Text>{viewLead.expectedCloseDate ?? "—"}</Text>
              </Col>
              <Col span={24}>
                <Text type="secondary">{t("crm.leads.status", lang)}</Text>
                <br />
                {viewLead.isWon ? (
                  <Tag
                    color="green"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    <CheckCircleOutlined /> {t("crm.leads.won", lang)}
                  </Tag>
                ) : viewLead.isLost ? (
                  <Tag
                    color="red"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    <CloseCircleOutlined /> {t("crm.leads.lost", lang)}
                  </Tag>
                ) : (
                  <Tag
                    color="blue"
                    style={{ borderRadius: 20, padding: "2px 10px" }}
                  >
                    {t("crm.leads.active", lang)}
                  </Tag>
                )}
              </Col>
              {viewLead.tags && (
                <Col span={24}>
                  <Text type="secondary">{t("crm.leads.tags", lang)}</Text>
                  <br />
                  <Text>{viewLead.tags}</Text>
                </Col>
              )}
              {viewLead.notes && (
                <Col span={24}>
                  <Text type="secondary">{t("crm.leads.notes", lang)}</Text>
                  <br />
                  <Text>{viewLead.notes}</Text>
                </Col>
              )}
            </Row>

            {/* Action buttons */}
            <Space style={{ marginTop: 16 }} wrap>
              <Button
                icon={<EditOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  openEdit(viewLead);
                }}
              >
                {t("crm.leads.edit", lang)}
              </Button>
              {!viewLead.isWon && !viewLead.isLost && (
                <>
                  <Button
                    icon={<SwapOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      setConvertId(viewLead.id);
                    }}
                  >
                    {t("crm.leads.convert", lang)}
                  </Button>
                  <Button
                    type="primary"
                    style={{ background: "#10b981", borderColor: "#10b981" }}
                    icon={<CheckCircleOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      setWonId(viewLead.id);
                    }}
                  >
                    {t("crm.leads.markWon", lang)}
                  </Button>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      setLostId(viewLead.id);
                    }}
                  >
                    {t("crm.leads.markLost", lang)}
                  </Button>
                </>
              )}
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  setDeleteId(viewLead.id);
                }}
              >
                {t("crm.leads.delete", lang)}
              </Button>
            </Space>
          </Space>
        )}
      </Drawer>
    </DashboardLayout>
  );
}

// ── Priority color helper ──────────────────────────────────────────────────

function getPriorityColor(priority: string | undefined): string {
  switch (priority) {
    case LeadPriority.HIGH:
      return "red";
    case LeadPriority.MEDIUM:
      return "gold";
    case LeadPriority.LOW:
    default:
      return "default";
  }
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useLeadColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (lead: Lead) => void,
  onEdit: (lead: Lead) => void,
  setDeleteId: (id: string | null) => void,
  setWonId: (id: string | null) => void,
  setLostId: (id: string | null) => void,
  setConvertId: (id: string | null) => void
): TableColumnsType<Lead> {
  return useMemo(
    () => [
      {
        title: t("crm.leads.titleField", lang),
        dataIndex: "title",
        width: 200,
        sorter: (a: Lead, b: Lead) =>
          (a.title ?? "").localeCompare(b.title ?? ""),
        render: (v: string) => <Text strong>{v}</Text>,
      },
      {
        title: t("crm.leads.partner", lang),
        dataIndex: "partnerNameEn",
        width: 180,
        render: (_: unknown, rec: Lead) => (
          <Text>
            {rec.partnerNameEn || rec.partnerNameAr
              ? getName({
                  nameEn: rec.partnerNameEn,
                  nameAr: rec.partnerNameAr,
                })
              : "—"}
          </Text>
        ),
      },
      {
        title: t("crm.leads.type", lang),
        dataIndex: "type",
        width: 120,
        render: (v: string) => (
          <Tag
            color={v === LeadType.OPPORTUNITY ? "green" : "blue"}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v === LeadType.OPPORTUNITY
              ? t("crm.leads.typeOpportunity", lang)
              : t("crm.leads.typeLead", lang)}
          </Tag>
        ),
      },
      {
        title: t("crm.leads.stage", lang),
        dataIndex: "stageNameEn",
        width: 140,
        render: (_: unknown, rec: Lead) => (
          <Text>
            {rec.stageNameEn || rec.stageNameAr
              ? getName({
                  nameEn: rec.stageNameEn,
                  nameAr: rec.stageNameAr,
                })
              : "—"}
          </Text>
        ),
      },
      {
        title: t("crm.leads.priority", lang),
        dataIndex: "priority",
        width: 100,
        render: (v: string) => (
          <Tag
            color={getPriorityColor(v)}
            style={{ borderRadius: 20, padding: "2px 10px" }}
          >
            {v === LeadPriority.HIGH
              ? t("crm.leads.priorityHigh", lang)
              : v === LeadPriority.MEDIUM
                ? t("crm.leads.priorityMedium", lang)
                : t("crm.leads.priorityLow", lang)}
          </Tag>
        ),
      },
      {
        title: t("crm.leads.expectedRevenue", lang),
        dataIndex: "expectedRevenue",
        width: 160,
        align: "end" as const,
        render: (v: number | string | null) => {
          if (v == null) return <Text type="secondary">—</Text>;
          const num = Number(v);
          return (
            <Text strong className="font-mono">
              {num.toLocaleString("en-SA", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          );
        },
      },
      {
        title: t("crm.leads.source", lang),
        dataIndex: "source",
        width: 130,
        responsive: ["lg"] as const,
        render: (v: string | null) =>
          v ? (
            <Tag style={{ borderRadius: 20, padding: "2px 10px" }}>{v}</Tag>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: t("crm.leads.assignedTo", lang),
        dataIndex: "assignedToNameEn",
        width: 160,
        responsive: ["lg"] as const,
        render: (_: unknown, rec: Lead) => (
          <Text>
            {rec.assignedToNameEn || rec.assignedToNameAr
              ? getName({
                  nameEn: rec.assignedToNameEn,
                  nameAr: rec.assignedToNameAr,
                })
              : "—"}
          </Text>
        ),
      },
      {
        title: t("crm.leads.expectedCloseDate", lang),
        dataIndex: "expectedCloseDate",
        width: 140,
        responsive: ["lg"] as const,
        render: (v: string | null) => <Text>{v ?? "—"}</Text>,
      },
      {
        title: t("crm.leads.status", lang),
        width: 100,
        render: (_: unknown, rec: Lead) =>
          rec.isWon ? (
            <Tag
              color="green"
              style={{ borderRadius: 20, padding: "2px 10px" }}
            >
              <CheckCircleOutlined /> {t("crm.leads.won", lang)}
            </Tag>
          ) : rec.isLost ? (
            <Tag color="red" style={{ borderRadius: 20, padding: "2px 10px" }}>
              <CloseCircleOutlined /> {t("crm.leads.lost", lang)}
            </Tag>
          ) : (
            <Tag color="blue" style={{ borderRadius: 20, padding: "2px 10px" }}>
              {t("crm.leads.active", lang)}
            </Tag>
          ),
      },
      {
        title: t("common.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: Lead) => {
          return (
            <Dropdown
              menu={{
                items: [
                  {
                    key: "view",
                    label: t("crm.leads.view", lang),
                    icon: <EyeOutlined />,
                    onClick: () => onView(rec),
                  },
                  {
                    key: "edit",
                    label: t("crm.leads.edit", lang),
                    icon: <EditOutlined />,
                    onClick: () => onEdit(rec),
                  },
                  ...(!rec.isWon && !rec.isLost
                    ? [
                        {
                          key: "convert",
                          label: t("crm.leads.convert", lang),
                          icon: <SwapOutlined />,
                          onClick: () => setConvertId(rec.id),
                        },
                        {
                          key: "won",
                          label: t("crm.leads.markWon", lang),
                          icon: <CheckCircleOutlined />,
                          onClick: () => setWonId(rec.id),
                        },
                        {
                          key: "lost",
                          label: t("crm.leads.markLost", lang),
                          icon: <CloseCircleOutlined />,
                          onClick: () => setLostId(rec.id),
                        },
                      ]
                    : []),
                  { type: "divider" as const, key: "d1" },
                  {
                    key: "delete",
                    label: t("crm.leads.delete", lang),
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
          );
        },
      },
    ],
    [t, lang, onView, onEdit, setDeleteId, setWonId, setLostId, setConvertId]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  leads,
  isLoading,
  onClick,
  t,
  lang,
}: {
  leads: Lead[];
  isLoading: boolean;
  onClick: (lead: Lead) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (leads.length === 0) {
    return (
      <Card>
        <EmptyState />
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {leads.map(l => (
        <Col key={l.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            className="mb-3 cursor-pointer"
            onClick={() => onClick(l)}
          >
            <div className="flex items-start justify-between mb-1">
              <span className="font-bold text-base text-primary">
                {l.title}
              </span>
              {l.isWon ? (
                <Tag
                  color="green"
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t("crm.leads.won", lang)}
                </Tag>
              ) : l.isLost ? (
                <Tag
                  color="red"
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t("crm.leads.lost", lang)}
                </Tag>
              ) : (
                <Tag
                  color="blue"
                  style={{ borderRadius: 20, padding: "2px 10px" }}
                >
                  {t("crm.leads.active", lang)}
                </Tag>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-1">
              {l.partnerNameEn || l.partnerNameAr
                ? getName({
                    nameEn: l.partnerNameEn,
                    nameAr: l.partnerNameAr,
                  })
                : "—"}
            </p>

            <div className="flex items-center justify-between">
              <Tag
                color={l.type === LeadType.OPPORTUNITY ? "green" : "blue"}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {l.type === LeadType.OPPORTUNITY
                  ? t("crm.leads.typeOpportunity", lang)
                  : t("crm.leads.typeLead", lang)}
              </Tag>
              <Tag
                color={getPriorityColor(l.priority)}
                style={{ borderRadius: 20, padding: "2px 10px" }}
              >
                {l.priority}
              </Tag>
            </div>

            {l.expectedRevenue != null && (
              <div className="mt-2 text-end">
                <Text strong className="font-mono">
                  {Number(l.expectedRevenue).toLocaleString("en-SA", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  SAR
                </Text>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}
