import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { useBranchStore } from "@/stores/branch.store";
import { t } from "@/i18n";
import {
  pipelineService,
  leadsService,
  crmStagesService,
} from "@/services/crm.service";
import { getPartnersDropdown } from "@/api/endpoints/partners.api";
import { LeadPriority, LeadType, LeadSource } from "@/constants/enums";
import type {
  PipelineStage,
  PipelineLead,
  Lead,
  CreateLeadDto,
  CrmStage,
  LeadActivity,
} from "@/types/modules/crm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Button,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Drawer,
  notification,
  Typography,
  Space,
  Tooltip,
  Empty,
  Spin,
  DatePicker,
  Timeline,
  Divider,
  Badge,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  SwapOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FunnelPlotOutlined,
  RiseOutlined,
  FieldTimeOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text, Title } = Typography;
const { TextArea } = Input;

// ─── Priority tag config ────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<string, { color: string; i18nKey: string }> = {
  [LeadPriority.LOW]: { color: "default", i18nKey: "crm.priority.low" },
  [LeadPriority.MEDIUM]: { color: "gold", i18nKey: "crm.priority.medium" },
  [LeadPriority.HIGH]: { color: "red", i18nKey: "crm.priority.high" },
};

const SOURCE_OPTIONS = [
  { value: LeadSource.WEBSITE, i18nKey: "crm.source.website" },
  { value: LeadSource.REFERRAL, i18nKey: "crm.source.referral" },
  { value: LeadSource.SOCIAL_MEDIA, i18nKey: "crm.source.social_media" },
  { value: LeadSource.COLD_CALL, i18nKey: "crm.source.cold_call" },
  { value: LeadSource.OTHER, i18nKey: "crm.source.other" },
];

// ─── Stage column gradient ──────────────────────────────────────────────────

function getStageHeaderColor(probability: number, isWon: boolean): string {
  if (isWon) return "#faad14";
  if (probability >= 80) return "#52c41a";
  if (probability >= 50) return "#1890ff";
  if (probability >= 20) return "#69b1ff";
  return "#8c8c8c";
}

function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "-";
  return Number(value).toLocaleString("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function CrmPipeline() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const branchId = useBranchStore(s => s.activeBranch?.id ?? null);
  const queryClient = useQueryClient();
  const [form] = Form.useForm<CreateLeadDto>();

  // ─── State ──────────────────────────────────────────────────────────────
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState("");
  const [wonModalOpen, setWonModalOpen] = useState(false);

  // ─── Queries ────────────────────────────────────────────────────────────
  const {
    data: pipeline,
    isLoading: pipelineLoading,
    refetch: refetchPipeline,
  } = useQuery({
    queryKey: [QUERY_KEYS.CRM_PIPELINE, branchId],
    queryFn: () => pipelineService.get(),
    enabled: !!branchId,
  });

  const { data: conversionReport } = useQuery({
    queryKey: [QUERY_KEYS.CRM_CONVERSION, branchId],
    queryFn: () => pipelineService.getConversionReport(),
    enabled: !!branchId,
  });

  const { data: stagesRes } = useQuery({
    queryKey: [QUERY_KEYS.CRM_STAGES, branchId],
    queryFn: () => crmStagesService.list({ limit: 100 }),
    enabled: !!branchId,
  });

  const { data: partnersDropdown } = useQuery({
    queryKey: ["partners-dropdown-crm", branchId],
    queryFn: () => getPartnersDropdown({ limit: 200 }),
    enabled: !!branchId,
  });

  const stages: CrmStage[] = useMemo(
    () =>
      ((stagesRes as unknown as Record<string, unknown>)?.data as CrmStage[]) ??
      [],
    [stagesRes]
  );

  const partners = useMemo(
    () =>
      (partnersDropdown ?? []) as {
        id: string;
        nameEn?: string;
        nameAr?: string;
      }[],
    [partnersDropdown]
  );

  // ─── Derived data ──────────────────────────────────────────────────────

  const pipelineStages: PipelineStage[] = useMemo(
    () => pipeline ?? [],
    [pipeline]
  );

  const totalLeads = useMemo(
    () => pipelineStages.reduce((sum, s) => sum + s.count, 0),
    [pipelineStages]
  );

  const totalValue = useMemo(
    () => pipelineStages.reduce((sum, s) => sum + Number(s.totalValue ?? 0), 0),
    [pipelineStages]
  );

  // ─── Mutations ─────────────────────────────────────────────────────────

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRM_PIPELINE] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRM_LEADS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRM_CONVERSION] });
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: (dto: CreateLeadDto) => leadsService.create(dto),
    onSuccess: () => {
      notification.success({ message: t("crm.leadCreated", lang) });
      setCreateDrawerOpen(false);
      form.resetFields();
      invalidateAll();
    },
    onError: (err: { message?: string }) => {
      notification.error({ message: err.message ?? "Error" });
    },
  });

  const wonMutation = useMutation({
    mutationFn: (id: string) => leadsService.markWon(id),
    onSuccess: () => {
      notification.success({ message: t("crm.leadWon", lang) });
      setWonModalOpen(false);
      setDetailDrawerOpen(false);
      setSelectedLead(null);
      invalidateAll();
    },
    onError: (err: { message?: string }) => {
      notification.error({ message: err.message ?? "Error" });
    },
  });

  const lostMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leadsService.markLost(id, reason),
    onSuccess: () => {
      notification.success({ message: t("crm.leadLost", lang) });
      setLostModalOpen(false);
      setLostReason("");
      setDetailDrawerOpen(false);
      setSelectedLead(null);
      invalidateAll();
    },
    onError: (err: { message?: string }) => {
      notification.error({ message: err.message ?? "Error" });
    },
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => leadsService.convert(id),
    onSuccess: () => {
      notification.success({ message: t("crm.leadConverted", lang) });
      setDetailDrawerOpen(false);
      setSelectedLead(null);
      invalidateAll();
    },
    onError: (err: { message?: string }) => {
      notification.error({ message: err.message ?? "Error" });
    },
  });

  // ─── Lead detail fetch ─────────────────────────────────────────────────

  const { data: leadDetail, isLoading: detailLoading } = useQuery({
    queryKey: [QUERY_KEYS.CRM_LEADS, "detail", selectedLead?.id],
    queryFn: () => leadsService.get(selectedLead!.id),
    enabled: !!selectedLead?.id && detailDrawerOpen,
  });

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleCardClick = useCallback((lead: PipelineLead) => {
    setSelectedLead(lead as unknown as Lead);
    setDetailDrawerOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(() => {
    form.validateFields().then(values => {
      const dto: CreateLeadDto = {
        ...values,
        expectedCloseDate: values.expectedCloseDate
          ? dayjs(values.expectedCloseDate).format("YYYY-MM-DD")
          : undefined,
      };
      createMutation.mutate(dto);
    });
  }, [form, createMutation]);

  const handleWonConfirm = useCallback(() => {
    if (selectedLead) {
      wonMutation.mutate(selectedLead.id);
    }
  }, [selectedLead, wonMutation]);

  const handleLostConfirm = useCallback(() => {
    if (selectedLead && lostReason.trim()) {
      lostMutation.mutate({ id: selectedLead.id, reason: lostReason.trim() });
    }
  }, [selectedLead, lostReason, lostMutation]);

  const handleConvert = useCallback(() => {
    if (selectedLead) {
      convertMutation.mutate(selectedLead.id);
    }
  }, [selectedLead, convertMutation]);

  // ─── Render helpers ────────────────────────────────────────────────────

  const renderKpiCards = () => {
    const report = conversionReport;
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered>
            <Statistic
              title={t("crm.totalLeads", lang)}
              value={totalLeads}
              prefix={<FunnelPlotOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered>
            <Statistic
              title={t("crm.pipelineValue", lang)}
              value={totalValue}
              prefix={<DollarOutlined />}
              formatter={v => formatCurrency(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered>
            <Statistic
              title={t("crm.winRate", lang)}
              value={report?.winRate ?? 0}
              suffix="%"
              prefix={<RiseOutlined />}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered>
            <Statistic
              title={t("crm.avgDealSize", lang)}
              value={report?.avgDealSize ?? 0}
              prefix={<DollarOutlined />}
              formatter={v => formatCurrency(Number(v))}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderLeadCard = (lead: PipelineLead) => {
    const priorityCfg =
      PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG[LeadPriority.LOW];
    const partnerName =
      lead.partnerNameEn || lead.partnerNameAr
        ? getName({ nameEn: lead.partnerNameEn, nameAr: lead.partnerNameAr })
        : null;

    return (
      <Card
        key={lead.id}
        size="small"
        hoverable
        onClick={() => handleCardClick(lead)}
        style={{
          marginBottom: 8,
          borderRadius: 8,
          cursor: "pointer",
          borderInlineStart: `3px solid ${getStageHeaderColor(Number(lead.probability ?? 0), lead.isWon)}`,
        }}
        bodyStyle={{ padding: "12px 14px" }}
      >
        <div style={{ marginBottom: 6 }}>
          <Text strong style={{ fontSize: 14 }}>
            {lead.title}
          </Text>
        </div>

        {partnerName && (
          <div style={{ marginBottom: 4 }}>
            <UserOutlined
              style={{ marginInlineEnd: 6, color: "#8c8c8c", fontSize: 12 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {partnerName}
            </Text>
          </div>
        )}

        {lead.expectedRevenue != null && Number(lead.expectedRevenue) > 0 && (
          <div style={{ marginBottom: 4 }}>
            <DollarOutlined
              style={{ marginInlineEnd: 6, color: "#8c8c8c", fontSize: 12 }}
            />
            <Text style={{ fontSize: 12, fontWeight: 500 }}>
              {formatCurrency(Number(lead.expectedRevenue))}
            </Text>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <Tag color={priorityCfg.color} style={{ margin: 0, fontSize: 11 }}>
            {t(priorityCfg.i18nKey, lang)}
          </Tag>

          {lead.expectedCloseDate && (
            <Tooltip title={t("crm.expectedCloseDate", lang)}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                <CalendarOutlined style={{ marginInlineEnd: 4 }} />
                {dayjs(lead.expectedCloseDate).format("MMM DD")}
              </Text>
            </Tooltip>
          )}
        </div>
      </Card>
    );
  };

  const renderStageColumn = (stage: PipelineStage) => {
    const headerColor = getStageHeaderColor(
      stage.stageProbability,
      stage.isWon
    );
    const stageName = getName({ nameEn: stage.nameEn, nameAr: stage.nameAr });

    return (
      <div
        key={stage.stageId}
        style={{
          minWidth: 300,
          maxWidth: 320,
          flex: "0 0 300px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Column header */}
        <div
          style={{
            background: headerColor,
            borderRadius: "8px 8px 0 0",
            padding: "12px 16px",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong style={{ color: "#fff", fontSize: 15 }}>
              {stageName}
            </Text>
            <Badge
              count={stage.count}
              style={{
                backgroundColor: "rgba(255,255,255,0.3)",
                color: "#fff",
                fontWeight: 600,
              }}
            />
          </div>
          <div style={{ marginTop: 4 }}>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>
              {formatCurrency(Number(stage.totalValue ?? 0))}
            </Text>
          </div>
        </div>

        {/* Column body */}
        <div
          style={{
            flex: 1,
            background: theme === "dark" ? "#1f1f1f" : "#fafafa",
            borderRadius: "0 0 8px 8px",
            padding: 8,
            overflowY: "auto",
            minHeight: 200,
            border: `1px solid ${theme === "dark" ? "#303030" : "#f0f0f0"}`,
            borderTop: "none",
          }}
        >
          {stage.leads.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t("crm.noLeads", lang)}
                </Text>
              }
              style={{ marginTop: 40 }}
            />
          ) : (
            stage.leads.map(lead => renderLeadCard(lead))
          )}
        </div>
      </div>
    );
  };

  // ─── Activity timeline ─────────────────────────────────────────────────

  const renderActivityTimeline = (activities: LeadActivity[] | undefined) => {
    if (!activities || activities.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Title level={5}>{t("crm.activityTimeline", lang)}</Title>
        <Timeline
          items={activities.map(act => ({
            key: act.id,
            color:
              act.activityType === "won"
                ? "green"
                : act.activityType === "lost"
                  ? "red"
                  : "blue",
            children: (
              <div>
                <Text strong style={{ fontSize: 13 }}>
                  {t(`crm.activity.${act.activityType}`, lang)}
                </Text>
                {act.activityType === "stage_change" &&
                  act.fromStageNameEn &&
                  act.toStageNameEn && (
                    <Text
                      type="secondary"
                      style={{ fontSize: 12, display: "block" }}
                    >
                      {getName({
                        nameEn: act.fromStageNameEn,
                        nameAr: act.fromStageNameAr,
                      })}
                      {" → "}
                      {getName({
                        nameEn: act.toStageNameEn,
                        nameAr: act.toStageNameAr,
                      })}
                    </Text>
                  )}
                {act.notes && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, display: "block" }}
                  >
                    {act.notes}
                  </Text>
                )}
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {act.createdAt
                    ? dayjs(act.createdAt).format("YYYY-MM-DD HH:mm")
                    : ""}
                  {act.userNameEn && (
                    <>
                      {" - "}
                      {getName({
                        nameEn: act.userNameEn,
                        nameAr: act.userNameAr,
                      })}
                    </>
                  )}
                </Text>
              </div>
            ),
          }))}
        />
      </div>
    );
  };

  // ─── Detail drawer content ─────────────────────────────────────────────

  const detail = leadDetail ?? selectedLead;

  const renderDetailDrawer = () => (
    <Drawer
      title={t("crm.leadDetails", lang)}
      open={detailDrawerOpen}
      onClose={() => {
        setDetailDrawerOpen(false);
        setSelectedLead(null);
      }}
      width={520}
      extra={
        <Space>
          {detail &&
            !detail.isWon &&
            !detail.isLost &&
            detail.type === LeadType.LEAD && (
              <Button
                icon={<SwapOutlined />}
                onClick={handleConvert}
                loading={convertMutation.isPending}
              >
                {t("crm.convertToOpportunity", lang)}
              </Button>
            )}
          {detail && !detail.isWon && !detail.isLost && (
            <>
              <Button
                type="primary"
                icon={<TrophyOutlined />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => setWonModalOpen(true)}
              >
                {t("crm.markWon", lang)}
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setLostModalOpen(true)}
              >
                {t("crm.markLost", lang)}
              </Button>
            </>
          )}
        </Space>
      }
    >
      {detailLoading ? (
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <Spin />
        </div>
      ) : detail ? (
        <div>
          <Title level={4} style={{ marginBottom: 16 }}>
            {detail.title}
          </Title>

          <Row gutter={[16, 12]}>
            <Col span={12}>
              <Text type="secondary">{t("crm.type", lang)}</Text>
              <div>
                <Tag
                  color={
                    detail.type === LeadType.OPPORTUNITY ? "blue" : "default"
                  }
                >
                  {t(`crm.type.${detail.type}`, lang)}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.priority", lang)}</Text>
              <div>
                <Tag
                  color={
                    (
                      PRIORITY_CONFIG[detail.priority] ??
                      PRIORITY_CONFIG[LeadPriority.LOW]
                    ).color
                  }
                >
                  {t(
                    (
                      PRIORITY_CONFIG[detail.priority] ??
                      PRIORITY_CONFIG[LeadPriority.LOW]
                    ).i18nKey,
                    lang
                  )}
                </Tag>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.stage", lang)}</Text>
              <div>
                <Text>
                  {getName({
                    nameEn: detail.stageNameEn,
                    nameAr: detail.stageNameAr,
                  }) || "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.probability", lang)}</Text>
              <div>
                <Text>
                  {detail.probability != null ? `${detail.probability}%` : "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.partner", lang)}</Text>
              <div>
                <Text>
                  {getName({
                    nameEn: detail.partnerNameEn,
                    nameAr: detail.partnerNameAr,
                  }) || "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.assignedTo", lang)}</Text>
              <div>
                <Text>
                  {getName({
                    nameEn: detail.assignedToNameEn,
                    nameAr: detail.assignedToNameAr,
                  }) || "-"}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.expectedRevenue", lang)}</Text>
              <div>
                <Text strong>
                  {formatCurrency(Number(detail.expectedRevenue ?? 0))}
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">{t("crm.expectedCloseDate", lang)}</Text>
              <div>
                <Text>
                  {detail.expectedCloseDate
                    ? dayjs(detail.expectedCloseDate).format("YYYY-MM-DD")
                    : "-"}
                </Text>
              </div>
            </Col>
            {detail.source && (
              <Col span={12}>
                <Text type="secondary">{t("crm.source", lang)}</Text>
                <div>
                  <Text>{t(`crm.source.${detail.source}`, lang)}</Text>
                </div>
              </Col>
            )}
            {detail.campaign && (
              <Col span={12}>
                <Text type="secondary">{t("crm.campaign", lang)}</Text>
                <div>
                  <Text>{detail.campaign}</Text>
                </div>
              </Col>
            )}
          </Row>

          {detail.notes && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">{t("crm.notes", lang)}</Text>
              <div
                style={{
                  marginTop: 4,
                  padding: 12,
                  background: theme === "dark" ? "#1f1f1f" : "#fafafa",
                  borderRadius: 6,
                }}
              >
                <Text>{detail.notes}</Text>
              </div>
            </div>
          )}

          {detail.isWon && (
            <div style={{ marginTop: 16 }}>
              <Tag
                color="green"
                icon={<TrophyOutlined />}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {t("crm.wonDeals", lang)}
                {detail.wonAt &&
                  ` - ${dayjs(detail.wonAt).format("YYYY-MM-DD")}`}
              </Tag>
            </div>
          )}

          {detail.isLost && (
            <div style={{ marginTop: 16 }}>
              <Tag
                color="red"
                icon={<CloseCircleOutlined />}
                style={{ fontSize: 14, padding: "4px 12px" }}
              >
                {t("crm.lostDeals", lang)}
                {detail.lostAt &&
                  ` - ${dayjs(detail.lostAt).format("YYYY-MM-DD")}`}
              </Tag>
              {detail.lostReason && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">{t("crm.lostReason", lang)}: </Text>
                  <Text>{detail.lostReason}</Text>
                </div>
              )}
            </div>
          )}

          <Divider />

          {renderActivityTimeline(detail.activities)}
        </div>
      ) : null}
    </Drawer>
  );

  // ─── Create lead drawer ────────────────────────────────────────────────

  const renderCreateDrawer = () => (
    <Drawer
      title={t("crm.newLead", lang)}
      open={createDrawerOpen}
      onClose={() => {
        setCreateDrawerOpen(false);
        form.resetFields();
      }}
      width={480}
      extra={
        <Space>
          <Button onClick={() => setCreateDrawerOpen(false)}>
            {t("crm.close", lang)}
          </Button>
          <Button
            type="primary"
            onClick={handleCreateSubmit}
            loading={createMutation.isPending}
          >
            {t("crm.newLead", lang)}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        <Form.Item
          name="title"
          label={t("crm.title", lang)}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="type"
              label={t("crm.type", lang)}
              initialValue={LeadType.LEAD}
            >
              <Select>
                <Select.Option value={LeadType.LEAD}>
                  {t("crm.type.lead", lang)}
                </Select.Option>
                <Select.Option value={LeadType.OPPORTUNITY}>
                  {t("crm.type.opportunity", lang)}
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label={t("crm.priority", lang)}
              initialValue={LeadPriority.MEDIUM}
            >
              <Select>
                {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                  <Select.Option key={val} value={val}>
                    {t(cfg.i18nKey, lang)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="partnerId" label={t("crm.partner", lang)}>
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("crm.partner", lang)}
            options={partners.map(p => ({
              value: p.id,
              label: getName(p),
            }))}
          />
        </Form.Item>

        <Form.Item name="stageId" label={t("crm.stage", lang)}>
          <Select
            allowClear
            placeholder={t("crm.stage", lang)}
            options={stages.map(s => ({
              value: s.id,
              label: getName(s),
            }))}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="expectedRevenue"
              label={t("crm.expectedRevenue", lang)}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="probability" label={t("crm.probability", lang)}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                suffix="%"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="source" label={t("crm.source", lang)}>
          <Select allowClear>
            {SOURCE_OPTIONS.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {t(opt.i18nKey, lang)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="expectedCloseDate"
          label={t("crm.expectedCloseDate", lang)}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="notes" label={t("crm.notes", lang)}>
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Drawer>
  );

  // ─── Won / Lost modals ─────────────────────────────────────────────────

  const renderWonModal = () => (
    <Modal
      title={t("crm.markWon", lang)}
      open={wonModalOpen}
      onOk={handleWonConfirm}
      onCancel={() => setWonModalOpen(false)}
      confirmLoading={wonMutation.isPending}
      okText={t("crm.markWon", lang)}
      okButtonProps={{
        style: { background: "#52c41a", borderColor: "#52c41a" },
      }}
    >
      <div style={{ padding: "16px 0" }}>
        <TrophyOutlined
          style={{ fontSize: 40, color: "#faad14", marginBottom: 12 }}
        />
        <Title level={5} style={{ marginBottom: 8 }}>
          {selectedLead?.title}
        </Title>
        <Text type="secondary">{t("crm.confirmWon", lang)}</Text>
      </div>
    </Modal>
  );

  const renderLostModal = () => (
    <Modal
      title={t("crm.markLost", lang)}
      open={lostModalOpen}
      onOk={handleLostConfirm}
      onCancel={() => {
        setLostModalOpen(false);
        setLostReason("");
      }}
      confirmLoading={lostMutation.isPending}
      okText={t("crm.markLost", lang)}
      okButtonProps={{ danger: true, disabled: !lostReason.trim() }}
    >
      <div style={{ padding: "16px 0" }}>
        <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
          {t("crm.confirmLost", lang)}
        </Text>
        <TextArea
          rows={3}
          value={lostReason}
          onChange={e => setLostReason(e.target.value)}
          placeholder={t("crm.lostReason", lang)}
        />
      </div>
    </Modal>
  );

  // ─── Main render ───────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {t("crm.pipeline", lang)}
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetchPipeline()}>
            {t("crm.close", lang) === "Close" ? "Refresh" : ""}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateDrawerOpen(true)}
          >
            {t("crm.newLead", lang)}
          </Button>
        </Space>
      </div>

      {/* KPI Stats */}
      {renderKpiCards()}

      {/* Conversion stats row */}
      {conversionReport && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card size="small" bordered>
              <Statistic
                title={t("crm.wonDeals", lang)}
                value={conversionReport.wonCount}
                prefix={<TrophyOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered>
              <Statistic
                title={t("crm.lostDeals", lang)}
                value={conversionReport.lostCount}
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered>
              <Statistic
                title={t("crm.avgDaysToClose", lang)}
                value={conversionReport.avgDaysToClose}
                prefix={<FieldTimeOutlined />}
                precision={0}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered>
              <Statistic
                title={t("crm.winRate", lang)}
                value={conversionReport.winRate}
                suffix="%"
                prefix={<StarOutlined style={{ color: "#faad14" }} />}
                precision={1}
                valueStyle={{ color: "#faad14" }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Kanban board */}
      {pipelineLoading ? (
        <div style={{ textAlign: "center", paddingTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : pipelineStages.length === 0 ? (
        <Empty description={t("crm.noLeads", lang)} style={{ marginTop: 60 }} />
      ) : (
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 16,
            minHeight: 400,
            alignItems: "flex-start",
          }}
        >
          {pipelineStages.map(stage => renderStageColumn(stage))}
        </div>
      )}

      {/* Drawers & Modals */}
      {renderDetailDrawer()}
      {renderCreateDrawer()}
      {renderWonModal()}
      {renderLostModal()}
    </DashboardLayout>
  );
}
