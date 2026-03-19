/**
 * Customers list page.
 * Wired to useCustomers hook with server-side pagination.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import { Table, Card, Tag, Row, Col, Grid, Typography } from "antd";
import type { Dayjs } from "dayjs";
import type { TableColumnsType } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ListPageToolbar } from "@/components/common/ListPageToolbar";
import { StatsRow } from "@/components/common/StatsRow";
import { ActionDropdown } from "@/components/common/ActionDropdown";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useCustomers, useCustomerSummary } from "@/hooks/queries/usePartners";
import { useDeletePartner } from "@/hooks/mutations/usePartnerMutations";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import { PartnerType } from "@/constants/enums";
import type { PartnerRow, PartnerFilterParams } from "@/types/modules/partners";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function AllCustomers() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const queryParams = useMemo<PartnerFilterParams>(() => {
    const params: PartnerFilterParams = {
      page,
      limit: pageSize,
      search: search || undefined,
      sortOrder: "DESC",
      isCustomer: true,
    };
    if (statusFilter === "active") params.isActive = true;
    if (statusFilter === "inactive") params.isActive = false;
    if (typeFilter !== "all") params.type = typeFilter as PartnerRow["type"];
    if (dateRange?.[0]) params.dateFrom = dateRange[0].format("YYYY-MM-DD");
    if (dateRange?.[1]) params.dateTo = dateRange[1].format("YYYY-MM-DD");
    return params;
  }, [page, pageSize, search, statusFilter, typeFilter, dateRange]);

  const { data: res, isLoading, refetch } = useCustomers(queryParams);
  const deleteMut = useDeletePartner();

  const customers = res?.data ?? [];
  const totalRows = res?.meta?.total ?? 0;

  const { data: summaryRes } = useCustomerSummary();
  const summary = summaryRes?.data as
    | { totalCustomers?: number; totalActive?: number; totalInactive?: number }
    | undefined;

  const totalActive = summary?.totalActive ?? 0;
  const totalInactive = summary?.totalInactive ?? 0;

  const handleRowClick = useCallback(
    (id: string) => navigate(ROUTES.customerDetail(id)),
    [navigate]
  );

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("customers.deleteSuccess", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("common.error_occurred", lang)),
    });
  }, [deleteId, deleteMut, t, lang]);

  const columns = useCustomerColumns(
    t,
    lang,
    handleRowClick,
    navigate,
    setDeleteId
  );

  const statsItems = useMemo(
    () => [
      {
        title: t("customers.stats.totalCustomers", lang),
        value: totalRows,
        icon: <TeamOutlined />,
        iconColor: "#8b5cf6",
        iconBg: "#8b5cf615",
      },
      {
        title: t("customers.stats.activeCustomers", lang),
        value: totalActive,
        icon: <CheckCircleOutlined />,
        iconColor: "#10b981",
        iconBg: "#10b98115",
      },
      {
        title: t("customers.status.inactive", lang),
        value: totalInactive,
        icon: <CloseCircleOutlined />,
        iconColor: "#ef4444",
        iconBg: "#ef444415",
      },
    ],
    [t, lang, totalRows, totalActive, totalInactive]
  );

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("SALES", lang), href: "#" },
    { label: t("customers.allCustomers", lang) },
  ];

  return (
    <DashboardLayout currentPage="AllCustomers" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        <StatsRow items={statsItems} />

        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <ListPageToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder={t("customers.search", lang)}
            onCreateNew={() => navigate(ROUTES.CUSTOMER_CREATE)}
            createLabel={t("customers.addCustomer", lang)}
            onReload={() => refetch()}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            isFilterOpen={isFilterOpen}
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            dateRangePlaceholder={[
              t("common.dateFrom", lang),
              t("common.dateTo", lang),
            ]}
            showExport={false}
          />
          {isFilterOpen && (
            <CustomerFilterPanel
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              onStatusChange={v => {
                setStatusFilter(v);
                setPage(1);
              }}
              onTypeChange={v => {
                setTypeFilter(v);
                setPage(1);
              }}
              t={t}
              lang={lang}
            />
          )}
        </Card>

        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={customers}
              loading={isLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              onRow={rec => ({
                onClick: () => handleRowClick(rec.id),
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
              locale={{
                emptyText: (
                  <EmptyState description={t("customers.noCustomers", lang)} />
                ),
              }}
            />
          </Card>
        ) : (
          <MobileGrid
            customers={customers}
            isLoading={isLoading}
            onClick={handleRowClick}
            t={t}
            lang={lang}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("customers.deleteCustomer", lang)}
        description={t("customers.deleteConfirm", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />
    </DashboardLayout>
  );
}

// ── Filter Panel ──────────────────────────────────────────────────────────

function CustomerFilterPanel({
  statusFilter,
  typeFilter,
  onStatusChange,
  onTypeChange,
  t,
  lang,
}: {
  statusFilter: string;
  typeFilter: string;
  onStatusChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <Tag.CheckableTag
        checked={statusFilter === "all"}
        onChange={() => onStatusChange("all")}
      >
        {t("customers.filter.allStatuses", lang)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        checked={statusFilter === "active"}
        onChange={() => onStatusChange("active")}
      >
        {t("customers.filter.active", lang)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        checked={statusFilter === "inactive"}
        onChange={() => onStatusChange("inactive")}
      >
        {t("customers.filter.inactive", lang)}
      </Tag.CheckableTag>

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

      <Tag.CheckableTag
        checked={typeFilter === "all"}
        onChange={() => onTypeChange("all")}
      >
        {t("customers.filter.allTypes", lang)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        checked={typeFilter === PartnerType.CUSTOMER}
        onChange={() => onTypeChange(PartnerType.CUSTOMER)}
      >
        {t("customers.type.customer", lang)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        checked={typeFilter === PartnerType.INDIVIDUAL}
        onChange={() => onTypeChange(PartnerType.INDIVIDUAL)}
      >
        {t("customers.type.individual", lang)}
      </Tag.CheckableTag>
      <Tag.CheckableTag
        checked={typeFilter === PartnerType.BOTH}
        onChange={() => onTypeChange(PartnerType.BOTH)}
      >
        {t("customers.type.both", lang)}
      </Tag.CheckableTag>
    </div>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useCustomerColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setDeleteId: (id: string | null) => void
): TableColumnsType<PartnerRow> {
  return useMemo(
    () => [
      {
        title: t("customers.column.name", lang),
        dataIndex: "nameEn",
        width: 220,
        ellipsis: true,
        sorter: false,
        render: (_: unknown, r: PartnerRow) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserOutlined
                style={{ fontSize: 13, color: "var(--ant-color-primary)" }}
              />
            </div>
            <Text strong>{getName(r) || "--"}</Text>
          </div>
        ),
      },
      {
        title: t("customers.column.type", lang),
        dataIndex: "type",
        width: 130,
        sorter: false,
        render: (v: string) => {
          const colorMap: Record<string, string> = {
            [PartnerType.CUSTOMER]: "blue",
            [PartnerType.SUPPLIER]: "orange",
            [PartnerType.BOTH]: "purple",
            [PartnerType.INDIVIDUAL]: "green",
          };
          const labelMap: Record<string, string> = {
            [PartnerType.CUSTOMER]: t("customers.type.customer", lang),
            [PartnerType.SUPPLIER]: t("customers.type.supplier", lang),
            [PartnerType.BOTH]: t("customers.type.both", lang),
            [PartnerType.INDIVIDUAL]: t("customers.type.individual", lang),
          };
          return <Tag color={colorMap[v] ?? "default"}>{labelMap[v] ?? v}</Tag>;
        },
      },
      {
        title: t("customers.column.email", lang),
        dataIndex: "email",
        width: 200,
        ellipsis: true,
        sorter: false,
        render: (v: string | null) => <Text type="secondary">{v || "--"}</Text>,
      },
      {
        title: t("customers.column.phone", lang),
        dataIndex: "phone",
        width: 150,
        sorter: false,
        render: (v: string | null) => <Text type="secondary">{v || "--"}</Text>,
      },
      {
        title: t("customers.column.city", lang),
        dataIndex: "city",
        width: 130,
        sorter: false,
        responsive: ["lg"] as const,
        render: (v: string | null) => <Text type="secondary">{v || "--"}</Text>,
      },
      {
        title: t("customers.column.creditLimit", lang),
        dataIndex: "creditLimit",
        width: 140,
        sorter: false,
        align: "end" as const,
        render: (v: number | string) => (
          <Text strong className="font-mono">
            {Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </Text>
        ),
      },
      {
        title: t("customers.column.status", lang),
        dataIndex: "isActive",
        width: 110,
        sorter: false,
        render: (v: boolean) => (
          <Tag color={v ? "green" : "default"}>
            {v
              ? t("customers.status.active", lang)
              : t("customers.status.inactive", lang)}
          </Tag>
        ),
      },
      {
        title: t("customers.column.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: PartnerRow) => (
          <ActionDropdown
            items={[
              {
                key: "view",
                label: t("customers.viewDetails", lang),
                icon: <EyeOutlined />,
                onClick: () => onView(rec.id),
              },
              {
                key: "edit",
                label: t("customers.editCustomer", lang),
                icon: <EditOutlined />,
                onClick: () => navigate(ROUTES.customerDetail(rec.id)),
              },
              { type: "divider" as const, key: "d" },
              {
                key: "delete",
                label: t("customers.deleteCustomer", lang),
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => setDeleteId(rec.id),
              },
            ]}
          />
        ),
      },
    ],
    [t, lang, onView, navigate, setDeleteId]
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  customers,
  isLoading,
  onClick,
  t,
  lang,
}: {
  customers: PartnerRow[];
  isLoading: boolean;
  onClick: (id: string) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (customers.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          {t("customers.noCustomers", lang)}
        </div>
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {customers.map(c => (
        <Col key={c.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            onClick={() => onClick(c.id)}
            styles={{ body: { padding: "12px 16px" } }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserOutlined
                  style={{ fontSize: 16, color: "var(--ant-color-primary)" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <Text strong className="block truncate">
                  {getName(c) || "--"}
                </Text>
                <Text type="secondary" className="text-xs">
                  {c.email || "--"}
                </Text>
              </div>
              <Tag
                color={c.isActive ? "green" : "default"}
                className="shrink-0"
              >
                {c.isActive
                  ? t("customers.status.active", lang)
                  : t("customers.status.inactive", lang)}
              </Tag>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{c.phone || "--"}</span>
              <span>{c.city || "--"}</span>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
