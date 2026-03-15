import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import {
  Table,
  Button,
  Card,
  Row,
  Col,
  Space,
  Select,
  Tag,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Statistic,
  Dropdown,
  Typography,
  message,
  Grid,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  LockOutlined,
  UnlockOutlined,
  StopOutlined,
  MoreOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fiscalPeriodsService } from "@/services/accounting.service";
import type {
  FiscalPeriod,
  CreateFiscalPeriodDto,
} from "@/types/modules/accounting";
import { FiscalPeriodStatus, FiscalPeriodType } from "@/constants/enums";
import { t } from "@/i18n";
import dayjs from "dayjs";

const { Text } = Typography;

// ─── Status styling ─────────────────────────────────────────────────────────────

const STATUS_TAG: Record<FiscalPeriodStatus, { color: string; key: string }> = {
  [FiscalPeriodStatus.OPEN]: { color: "success", key: "accounting.pc.open" },
  [FiscalPeriodStatus.CLOSED]: { color: "orange", key: "accounting.pc.closed" },
  [FiscalPeriodStatus.LOCKED]: { color: "error", key: "accounting.pc.locked" },
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PeriodClosing() {
  const { theme, language: lang } = useAppSettings();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const primary = theme === "dark" ? "#37D399" : "#3B82F6";
  const queryClient = useQueryClient();

  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FiscalPeriod | null>(null);
  const [form] = Form.useForm();

  // ── Fetch fiscal periods ──────────────────────────────────────────────────────
  const {
    data: periods = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["fiscal-periods"],
    queryFn: () => fiscalPeriodsService.list(),
  });

  // ── Derived data ──────────────────────────────────────────────────────────────
  const uniqueYears = useMemo(() => {
    const years = [...new Set(periods.map(p => p.fiscalYear))].sort(
      (a, b) => b - a
    );
    return years;
  }, [periods]);

  const filtered = useMemo(() => {
    if (yearFilter === "all") return periods;
    return periods.filter(p => String(p.fiscalYear) === yearFilter);
  }, [periods, yearFilter]);

  const openCount = periods.filter(
    p => p.status === FiscalPeriodStatus.OPEN
  ).length;
  const closedCount = periods.filter(
    p => p.status === FiscalPeriodStatus.CLOSED
  ).length;
  const lockedCount = periods.filter(
    p => p.status === FiscalPeriodStatus.LOCKED
  ).length;

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["fiscal-periods"] });

  const createMutation = useMutation({
    mutationFn: (dto: CreateFiscalPeriodDto) =>
      fiscalPeriodsService.create(dto),
    onSuccess: () => {
      message.success(t("accounting.pc.created", lang));
      invalidate();
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: number;
      dto: Partial<CreateFiscalPeriodDto>;
    }) => fiscalPeriodsService.update(id, dto),
    onSuccess: () => {
      message.success(t("accounting.pc.created", lang));
      invalidate();
      closeModal();
    },
  });

  const closePeriodMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.close(id),
    onSuccess: () => {
      message.success(t("accounting.pc.closed_success", lang));
      invalidate();
    },
  });

  const reopenMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.reopen(id),
    onSuccess: () => {
      message.success(t("accounting.pc.reopened", lang));
      invalidate();
    },
  });

  const lockMutation = useMutation({
    mutationFn: (id: number) => fiscalPeriodsService.lock(id),
    onSuccess: () => {
      message.success(t("accounting.pc.locked_success", lang));
      invalidate();
    },
  });

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  function openCreateModal() {
    setEditRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  }

  function openEditModal(record: FiscalPeriod) {
    setEditRecord(record);
    form.setFieldsValue({
      fiscalYear: record.fiscalYear,
      periodNumber: record.periodNumber,
      nameEn: record.nameEn,
      nameAr: record.nameAr,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate),
      periodType: record.periodType,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditRecord(null);
    form.resetFields();
  }

  function handleModalOk() {
    form.validateFields().then(values => {
      const dto: CreateFiscalPeriodDto = {
        fiscalYear: values.fiscalYear,
        periodNumber: values.periodNumber,
        nameEn: values.nameEn,
        nameAr: values.nameAr,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        periodType: values.periodType,
      };

      if (editRecord) {
        updateMutation.mutate({ id: editRecord.id, dto });
      } else {
        createMutation.mutate(dto);
      }
    });
  }

  // ── Action handlers ───────────────────────────────────────────────────────────
  function confirmClose(record: FiscalPeriod) {
    Modal.confirm({
      title: t("accounting.pc.closeAction", lang),
      content: t("accounting.pc.closeConfirm", lang),
      okText: t("accounting.pc.closeAction", lang),
      okType: "primary",
      onOk: () => closePeriodMutation.mutate(record.id),
    });
  }

  function confirmLock(record: FiscalPeriod) {
    Modal.confirm({
      title: t("accounting.pc.lockAction", lang),
      content: t("accounting.pc.lockConfirm", lang),
      okText: t("accounting.pc.lockAction", lang),
      okType: "primary",
      okButtonProps: { danger: true },
      onOk: () => lockMutation.mutate(record.id),
    });
  }

  // ── Build action menu items per record ────────────────────────────────────────
  function getActionItems(record: FiscalPeriod) {
    if (record.status === FiscalPeriodStatus.OPEN) {
      return [
        {
          key: "edit",
          label: t("accounting.je.edit", lang),
          icon: <EditOutlined />,
          onClick: () => openEditModal(record),
        },
        {
          key: "close",
          label: t("accounting.pc.closeAction", lang),
          icon: <StopOutlined />,
          onClick: () => confirmClose(record),
        },
      ];
    }
    if (record.status === FiscalPeriodStatus.CLOSED) {
      return [
        {
          key: "reopen",
          label: t("accounting.pc.reopenAction", lang),
          icon: <UnlockOutlined />,
          onClick: () => reopenMutation.mutate(record.id),
        },
        {
          key: "lock",
          label: t("accounting.pc.lockAction", lang),
          icon: <LockOutlined />,
          danger: true,
          onClick: () => confirmLock(record),
        },
      ];
    }
    // locked — no actions
    return [];
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns: TableColumnsType<FiscalPeriod> = [
    {
      title: t("accounting.pc.year", lang),
      dataIndex: "fiscalYear",
      width: 100,
      sorter: (a, b) => a.fiscalYear - b.fiscalYear,
      render: (v: number) => (
        <Text strong style={{ fontSize: 13 }}>
          {v}
        </Text>
      ),
    },
    {
      title: t("accounting.pc.period", lang),
      dataIndex: "periodNumber",
      width: 100,
      align: "center",
      sorter: (a, b) => a.periodNumber - b.periodNumber,
      render: (v: number) => (
        <Tag
          style={{
            borderRadius: 20,
            fontFamily: "monospace",
            fontWeight: 600,
            minWidth: 32,
            textAlign: "center",
          }}
        >
          {String(v).padStart(2, "0")}
        </Tag>
      ),
    },
    {
      title: t("accounting.pc.periodName", lang),
      key: "name",
      width: 200,
      render: (_: unknown, rec: FiscalPeriod) => (
        <Text strong style={{ fontSize: 13 }}>
          {lang === "ar" ? rec.nameAr : rec.nameEn}
        </Text>
      ),
    },
    {
      title: t("accounting.pc.periodType", lang),
      dataIndex: "periodType",
      width: 120,
      align: "center",
      render: (v: string) => (
        <Tag color="blue" style={{ borderRadius: 20 }}>
          {v === FiscalPeriodType.MONTHLY
            ? t("accounting.pc.monthly", lang)
            : t("accounting.pc.quarterly", lang)}
        </Tag>
      ),
    },
    {
      title: t("accounting.pc.startDate", lang),
      dataIndex: "startDate",
      width: 130,
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(v).format("DD MMM YYYY")}
        </Text>
      ),
    },
    {
      title: t("accounting.pc.endDate", lang),
      dataIndex: "endDate",
      width: 130,
      render: (v: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {dayjs(v).format("DD MMM YYYY")}
        </Text>
      ),
    },
    {
      title: t("accounting.pc.status", lang),
      dataIndex: "status",
      width: 120,
      align: "center",
      filters: (Object.values(FiscalPeriodStatus) as FiscalPeriodStatus[]).map(
        s => ({
          text: t(STATUS_TAG[s].key, lang),
          value: s,
        })
      ),
      onFilter: (val, rec) => rec.status === val,
      render: (v: FiscalPeriodStatus) => {
        const cfg = STATUS_TAG[v];
        return (
          <Tag
            color={cfg.color}
            style={{ borderRadius: 20, padding: "2px 12px", fontWeight: 600 }}
          >
            {t(cfg.key, lang)}
          </Tag>
        );
      },
    },
    {
      title: t("accounting.common.actions", lang),
      align: "center",
      width: 140,
      render: (_: unknown, rec: FiscalPeriod) => {
        if (rec.status === FiscalPeriodStatus.LOCKED) {
          return <Text type="secondary">—</Text>;
        }
        if (rec.status === FiscalPeriodStatus.OPEN) {
          return (
            <Space size={4}>
              <Tooltip title={t("accounting.je.edit", lang)}>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openEditModal(rec)}
                />
              </Tooltip>
              <Tooltip title={t("accounting.pc.closeAction", lang)}>
                <Button
                  type="text"
                  size="small"
                  icon={<StopOutlined style={{ color: "#f59e0b" }} />}
                  onClick={() => confirmClose(rec)}
                />
              </Tooltip>
            </Space>
          );
        }
        if (rec.status === FiscalPeriodStatus.CLOSED) {
          return (
            <Space size={4}>
              <Tooltip title={t("accounting.pc.reopenAction", lang)}>
                <Button
                  type="text"
                  size="small"
                  icon={<UnlockOutlined style={{ color: "#10b981" }} />}
                  onClick={() => reopenMutation.mutate(rec.id)}
                />
              </Tooltip>
              <Tooltip title={t("accounting.pc.lockAction", lang)}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<LockOutlined />}
                  onClick={() => confirmLock(rec)}
                />
              </Tooltip>
            </Space>
          );
        }
        return null;
      },
    },
  ];

  // ── Gradient modal header ─────────────────────────────────────────────────────
  const modalTitle = (
    <div
      style={{
        margin: "-20px -24px 16px",
        padding: "20px 24px",
        borderRadius: "8px 8px 0 0",
        background: `linear-gradient(135deg, ${primary}, ${primary}cc)`,
        color: "#fff",
      }}
    >
      <Space>
        <CalendarOutlined />
        <span>
          {editRecord
            ? `${t("accounting.je.edit", lang)} — ${lang === "ar" ? editRecord.nameAr : editRecord.nameEn}`
            : t("accounting.pc.newPeriod", lang)}
        </span>
      </Space>
    </div>
  );

  return (
    <DashboardLayout
      currentPage="PeriodClosing"
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "#" },
        { label: t("accounting.pc.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── KPI Cards ──────────────────────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {[
            {
              title: t("accounting.pc.openPeriods", lang),
              value: openCount,
              icon: <CheckCircleOutlined />,
              iconColor: "#10b981",
              iconBg: "#10b98115",
              color: "#10b981",
            },
            {
              title: t("accounting.pc.closedPeriods", lang),
              value: closedCount,
              icon: <CloseCircleOutlined />,
              iconColor: "#f59e0b",
              iconBg: "#f59e0b15",
              color: "#f59e0b",
            },
            {
              title: t("accounting.pc.lockedPeriods", lang),
              value: lockedCount,
              icon: <LockOutlined />,
              iconColor: "#ef4444",
              iconBg: "#ef444415",
              color: "#ef4444",
            },
          ].map(s => (
            <Col key={s.title} xs={24} sm={8}>
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
                        color: s.color,
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

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <Card
          styles={{ body: { padding: 0 } }}
          title={
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Space>
                <CalendarOutlined style={{ color: primary }} />
                <Text strong style={{ fontSize: 15 }}>
                  {t("accounting.pc.title", lang)}
                </Text>
                <Tag style={{ borderRadius: 20, marginInlineStart: 4 }}>
                  {filtered.length}
                </Tag>
              </Space>

              <Space wrap>
                <Select
                  value={yearFilter}
                  onChange={setYearFilter}
                  style={{ width: 140 }}
                  size="small"
                  options={[
                    { value: "all", label: t("accounting.pc.allYears", lang) },
                    ...uniqueYears.map(y => ({
                      value: String(y),
                      label: String(y),
                    })),
                  ]}
                />
                <Tooltip title={t("accounting.common.reload", lang)}>
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
                  onClick={openCreateModal}
                >
                  {t("accounting.pc.newPeriod", lang)}
                </Button>
              </Space>
            </div>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filtered}
            loading={isLoading}
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 12,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}–${range[1]} / ${total}`,
              pageSizeOptions: ["12", "25", "50"],
            }}
          />
        </Card>
      </Space>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      <Modal
        title={modalTitle}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={closeModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={
          editRecord
            ? t("accounting.je.edit", lang)
            : t("accounting.pc.newPeriod", lang)
        }
        width={isMobile ? "95vw" : 520}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t("accounting.pc.year", lang)}
                name="fiscalYear"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={2000}
                  max={2099}
                  style={{ width: "100%" }}
                  placeholder="2026"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("accounting.pc.period", lang)}
                name="periodNumber"
                rules={[{ required: true }]}
              >
                <InputNumber
                  min={1}
                  max={12}
                  style={{ width: "100%" }}
                  placeholder="1"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("accounting.pc.nameEn", lang)}
            name="nameEn"
            rules={[{ required: true }]}
          >
            <Input dir="ltr" placeholder="January 2026" />
          </Form.Item>

          <Form.Item
            label={t("accounting.pc.nameAr", lang)}
            name="nameAr"
            rules={[{ required: true }]}
          >
            <Input dir="rtl" placeholder="يناير 2026" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t("accounting.pc.startDate", lang)}
                name="startDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t("accounting.pc.endDate", lang)}
                name="endDate"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t("accounting.pc.periodType", lang)}
            name="periodType"
            initialValue={FiscalPeriodType.MONTHLY}
          >
            <Select
              options={[
                {
                  value: FiscalPeriodType.MONTHLY,
                  label: t("accounting.pc.monthly", lang),
                },
                {
                  value: FiscalPeriodType.QUARTERLY,
                  label: t("accounting.pc.quarterly", lang),
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}
