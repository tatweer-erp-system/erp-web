/**
 * Audit Logs list page (read-only).
 * Follows the CashAccounts.tsx / AllOrders.tsx design pattern.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Grid,
  Typography,
  Tag,
  Statistic,
  Input,
  Select,
  Tooltip,
  DatePicker,
  Button,
} from "antd";
import type { TableColumnsType } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { ROUTES } from "@/shared/constants/routes";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const DEFAULT_PAGE_SIZE = 20;

// ── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  userId: string;
  userName?: string;
  userNameEn?: string;
  userNameAr?: string;
  module: string;
  action: string;
  entityType: string;
  entityId: string;
  description?: string;
  changes?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ── API ──────────────────────────────────────────────────────────────────────

const auditLogsApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get("/audit-logs", { params }).then(r => r.data),
};

// ── Constants ────────────────────────────────────────────────────────────────

const MODULE_OPTIONS = [
  { value: "", label: "All" },
  { value: "sales", label: "Sales" },
  { value: "inventory", label: "Inventory" },
  { value: "hr", label: "HR" },
  { value: "accounting", label: "Accounting" },
  { value: "treasury", label: "Treasury" },
  { value: "crm", label: "CRM" },
  { value: "purchasing", label: "Purchasing" },
  { value: "pos", label: "POS" },
  { value: "settings", label: "Settings" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "statusChange", label: "Status Change" },
];

const MODULE_COLORS: Record<string, string> = {
  sales: "blue",
  inventory: "cyan",
  hr: "purple",
  accounting: "geekblue",
  treasury: "green",
  crm: "magenta",
  purchasing: "orange",
  pos: "volcano",
  settings: "default",
};

const ACTION_COLORS: Record<string, string> = {
  create: "green",
  update: "blue",
  delete: "red",
  statusChange: "gold",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function AuditLogs() {
  const { t, lang } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  // ── Search with 400ms debounce ──────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [userFilter, setUserFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  // ── Query params ───────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {
      page,
      limit: pageSize,
    };
    if (search.trim()) params.search = search.trim();
    if (moduleFilter) params.module = moduleFilter;
    if (actionFilter) params.action = actionFilter;
    if (userFilter) params.userId = userFilter;
    if (dateRange?.[0]) params.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) params.dateTo = dateRange[1].format("YYYY-MM-DD");
    return params;
  }, [
    page,
    pageSize,
    search,
    moduleFilter,
    actionFilter,
    userFilter,
    dateRange,
  ]);

  // ── Query ──────────────────────────────────────────────────────────────
  const {
    data: logsRaw,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.AUDIT_LOGS, queryParams],
    queryFn: () => auditLogsApi.list(queryParams),
    staleTime: 30_000,
  });

  const allLogs: AuditLog[] = useMemo(() => {
    const raw = logsRaw as Record<string, unknown> | undefined;
    return (raw?.data as AuditLog[]) ?? [];
  }, [logsRaw]);

  const meta = useMemo(() => {
    const raw = logsRaw as Record<string, unknown> | undefined;
    const m = raw?.meta as Record<string, number> | undefined;
    return {
      total: m?.total ?? 0,
      page: m?.page ?? 1,
      totalPages: m?.totalPages ?? 1,
    };
  }, [logsRaw]);

  // ── KPI values ─────────────────────────────────────────────────────────
  const kpiTotal = meta.total;
  const kpiToday = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    return allLogs.filter(
      l => dayjs(l.createdAt).format("YYYY-MM-DD") === today
    ).length;
  }, [allLogs]);
  const kpiThisWeek = useMemo(() => {
    const weekStart = dayjs().startOf("week");
    return allLogs.filter(l => dayjs(l.createdAt).isAfter(weekStart)).length;
  }, [allLogs]);

  // ── Expand row renderer ────────────────────────────────────────────────
  const expandedRowRender = useCallback(
    (record: AuditLog) => {
      const hasChanges = record.changes || record.oldValues || record.newValues;
      return (
        <div style={{ padding: "8px 16px" }}>
          {record.description && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("auditLogs.description", lang)}
              </Text>
              <br />
              <Text>{record.description}</Text>
            </div>
          )}
          {record.ipAddress && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                IP
              </Text>
              <br />
              <Text code style={{ fontSize: 12 }}>
                {record.ipAddress}
              </Text>
            </div>
          )}
          {hasChanges && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {t("auditLogs.changes", lang)}
              </Text>
              <pre
                style={{
                  background: "var(--ant-color-bg-container)",
                  border: "1px solid var(--ant-color-border)",
                  borderRadius: 6,
                  padding: 12,
                  fontSize: 12,
                  maxHeight: 300,
                  overflow: "auto",
                  marginTop: 4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(
                  record.changes ?? {
                    before: record.oldValues ?? {},
                    after: record.newValues ?? {},
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
          {!record.description && !hasChanges && (
            <Text type="secondary">{t("auditLogs.noDetails", lang)}</Text>
          )}
        </div>
      );
    },
    [t, lang]
  );

  // ── Table columns ──────────────────────────────────────────────────────
  const columns: TableColumnsType<AuditLog> = useMemo(
    () => [
      {
        title: t("auditLogs.timestamp", lang),
        dataIndex: "createdAt",
        width: 170,
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        defaultSortOrder: "descend",
        render: (v: string) => (
          <Text style={{ fontSize: 13, whiteSpace: "nowrap" }}>
            {dayjs(v).format("YYYY-MM-DD HH:mm:ss")}
          </Text>
        ),
      },
      {
        title: t("auditLogs.user", lang),
        dataIndex: "userName",
        width: 160,
        render: (_: unknown, r: AuditLog) => {
          const name =
            lang === "ar"
              ? r.userNameAr || r.userNameEn || r.userName
              : r.userNameEn || r.userName;
          return <Text>{name || r.userId?.slice(0, 8) || "—"}</Text>;
        },
      },
      {
        title: t("auditLogs.module", lang),
        dataIndex: "module",
        width: 120,
        filters: MODULE_OPTIONS.filter(o => o.value).map(o => ({
          text: o.label,
          value: o.value,
        })),
        onFilter: (val, rec) => rec.module === val,
        render: (v: string) => (
          <Tag
            color={MODULE_COLORS[v?.toLowerCase()] ?? "default"}
            style={{ borderRadius: 4, textTransform: "capitalize" }}
          >
            {v || "—"}
          </Tag>
        ),
      },
      {
        title: t("auditLogs.action", lang),
        dataIndex: "action",
        width: 120,
        filters: ACTION_OPTIONS.filter(o => o.value).map(o => ({
          text: o.label,
          value: o.value,
        })),
        onFilter: (val, rec) => rec.action === val,
        render: (v: string) => (
          <Tag
            color={ACTION_COLORS[v?.toLowerCase()] ?? "default"}
            style={{ borderRadius: 20, textTransform: "capitalize" }}
          >
            {v || "—"}
          </Tag>
        ),
      },
      {
        title: t("auditLogs.entityType", lang),
        dataIndex: "entityType",
        width: 150,
        render: (v: string) => (
          <Text style={{ textTransform: "capitalize" }}>{v || "—"}</Text>
        ),
      },
      {
        title: t("auditLogs.entityId", lang),
        dataIndex: "entityId",
        width: 140,
        render: (v: string) =>
          v ? (
            <Tooltip title={v}>
              <Text
                code
                style={{ fontSize: 11, cursor: "default" }}
                copyable={{ text: v }}
              >
                {v.length > 12 ? `${v.slice(0, 12)}...` : v}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: t("auditLogs.details", lang),
        key: "details",
        width: 80,
        align: "center",
        render: (_: unknown, r: AuditLog) => {
          const hasDetails =
            r.description || r.changes || r.oldValues || r.newValues;
          return hasDetails ? (
            <Tooltip title={t("auditLogs.expandDetails", lang)}>
              <InfoCircleOutlined
                style={{ color: "var(--ant-color-primary)", fontSize: 14 }}
              />
            </Tooltip>
          ) : (
            <Text type="secondary">—</Text>
          );
        },
      },
    ],
    [t, lang]
  );

  // ── KPI cards config ───────────────────────────────────────────────────
  const statCards = [
    {
      title: t("auditLogs.totalLogs", lang),
      value: kpiTotal,
      icon: <FileTextOutlined />,
      iconColor: "#3b82f6",
      iconBg: "#3b82f615",
    },
    {
      title: t("auditLogs.today", lang),
      value: kpiToday,
      icon: <CalendarOutlined />,
      iconColor: "#10b981",
      iconBg: "#10b98115",
    },
    {
      title: t("auditLogs.thisWeek", lang),
      value: kpiThisWeek,
      icon: <ClockCircleOutlined />,
      iconColor: "#f59e0b",
      iconBg: "#f59e0b15",
    },
  ];

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("Settings", lang), href: "#" },
    { label: t("auditLogs.title", lang) },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <DashboardLayout currentPage="AuditLogs" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        {/* ── 1. Stats Row (3 KPI cards) ──────────────────────────────────── */}
        <Row gutter={[16, 16]}>
          {statCards.map(s => (
            <Col key={s.title} xs={24} sm={8}>
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
                      styles={{ content: { fontSize: 24, lineHeight: 1 } }}
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
            {/* Left: Search */}
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("auditLogs.search", lang)}
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                allowClear
                style={{ width: isMobile ? "100%" : 240 }}
              />
            </div>

            {/* Right: Filters + Reload */}
            <div className="flex flex-wrap gap-2 items-center">
              <RangePicker
                value={dateRange}
                onChange={val => {
                  setDateRange(val);
                  setPage(1);
                }}
                placeholder={[
                  t("common.dateFrom", lang),
                  t("common.dateTo", lang),
                ]}
                allowClear
                style={{ borderRadius: 8 }}
              />
              <Select
                value={moduleFilter}
                onChange={val => {
                  setModuleFilter(val);
                  setPage(1);
                }}
                options={MODULE_OPTIONS}
                style={{ width: 140 }}
                placeholder={t("auditLogs.filterModule", lang)}
              />
              <Select
                value={actionFilter}
                onChange={val => {
                  setActionFilter(val);
                  setPage(1);
                }}
                options={ACTION_OPTIONS}
                style={{ width: 140 }}
                placeholder={t("auditLogs.filterAction", lang)}
              />
              <Input
                placeholder={t("auditLogs.filterUser", lang)}
                value={userFilter}
                onChange={e => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
                allowClear
                style={{ width: 160 }}
              />
              <Tooltip title={t("common.reload", lang)}>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} />
              </Tooltip>
            </div>
          </div>
        </Card>

        {/* ── 3. Data table ───────────────────────────────────────────────── */}
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={allLogs}
            loading={isLoading}
            size="middle"
            scroll={{ x: "max-content" }}
            expandable={{
              expandedRowRender,
              rowExpandable: (r: AuditLog) =>
                !!(r.description || r.changes || r.oldValues || r.newValues),
            }}
            pagination={{
              current: page,
              pageSize,
              total: meta.total,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
            locale={{ emptyText: <EmptyState /> }}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
