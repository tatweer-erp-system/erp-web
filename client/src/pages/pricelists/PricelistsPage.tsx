/**
 * Pricelists list page.
 * Wired to usePricelists hook with server-side pagination.
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import { Table, Card, Row, Col, Grid, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ListPageToolbar } from "@/components/common/ListPageToolbar";
import { StatsRow } from "@/components/common/StatsRow";
import { ActionDropdown } from "@/components/common/ActionDropdown";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { usePricelists } from "@/hooks/queries/usePricelists";
import { useDeletePricelist } from "@/hooks/mutations/usePricelistMutations";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import { PricelistDiscountPolicy } from "@/constants/enums";
import type {
  PricelistRow,
  PricelistFilterParams,
} from "@/types/modules/pricelists";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function PricelistsPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const queryParams = useMemo<PricelistFilterParams>(() => {
    const params: PricelistFilterParams = {
      page,
      limit: pageSize,
      search: search || undefined,
      sortOrder: "DESC",
    };
    return params;
  }, [page, pageSize, search]);

  const { data: res, isLoading, refetch } = usePricelists(queryParams);
  const deleteMut = useDeletePricelist();

  const pricelists = res?.data ?? [];
  const totalRows = res?.total ?? 0;

  const activePricelists = pricelists.filter(p => p.isActive).length;
  const inactivePricelists = pricelists.filter(p => !p.isActive).length;

  const handleRowClick = useCallback(
    (id: string) => navigate(ROUTES.pricelistDetail(id)),
    [navigate]
  );

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("pricelists.message.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("pricelists.message.loadFailed", lang)),
    });
  }, [deleteId, deleteMut, t, lang]);

  const columns = usePricelistColumns(
    t,
    lang,
    handleRowClick,
    navigate,
    setDeleteId
  );

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("pricelists.title", lang) },
  ];

  const statsItems = [
    {
      title: t("pricelists.stats.total", lang),
      value: totalRows,
      icon: <UnorderedListOutlined />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: t("pricelists.stats.active", lang),
      value: activePricelists,
      icon: <CheckCircleOutlined />,
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: t("pricelists.stats.inactive", lang),
      value: inactivePricelists,
      icon: <CloseCircleOutlined />,
      iconBg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <DashboardLayout currentPage="Pricelists" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        <StatsRow items={statsItems} />

        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <ListPageToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder={t("common.search", lang)}
            onCreateNew={() => navigate(ROUTES.PRICELIST_CREATE)}
            createLabel={t("pricelists.create", lang)}
            onReload={() => refetch()}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showExport={false}
          />
        </Card>

        {viewMode === "table" && !isMobile ? (
          <Card styles={{ body: { padding: 0 } }}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={pricelists}
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
              locale={{ emptyText: t("common.no_data_title", lang) }}
            />
          </Card>
        ) : (
          <MobileGrid
            pricelists={pricelists}
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
        title={t("pricelists.message.deleteConfirm", lang)}
        description={t("common.action_cannot_be_undone", lang)}
        confirmLabel={t("common.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />
    </DashboardLayout>
  );
}

// ── Discount policy label helper ──────────────────────────────────────────────

function discountPolicyLabel(
  policy: string,
  t: (k: string, l: string) => string,
  lang: string
): string {
  switch (policy) {
    case PricelistDiscountPolicy.INCLUDE_IN_PRICE:
      return t("pricelists.discountPolicy.includeInPrice", lang);
    case PricelistDiscountPolicy.DISCOUNT_ON_SALE:
      return t("pricelists.discountPolicy.discountOnSale", lang);
    default:
      return policy;
  }
}

// ── Columns hook ──────────────────────────────────────────────────────────────

function usePricelistColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setDeleteId: (id: string | null) => void
): TableColumnsType<PricelistRow> {
  return useMemo(
    () => [
      {
        title: t("pricelists.column.name", lang),
        dataIndex: "nameEn",
        width: 220,
        sorter: false,
        ellipsis: true,
        render: (_: unknown, r: PricelistRow) => (
          <Text strong>{getName(r) || "--"}</Text>
        ),
      },
      {
        title: t("pricelists.column.currency", lang),
        dataIndex: "currencyCode",
        width: 100,
        sorter: false,
        render: (v: string | null) => <Text type="secondary">{v ?? "--"}</Text>,
      },
      {
        title: t("pricelists.column.discountPolicy", lang),
        dataIndex: "discountPolicy",
        width: 180,
        sorter: false,
        render: (v: string) => (
          <Text type="secondary">{discountPolicyLabel(v, t, lang)}</Text>
        ),
      },
      {
        title: t("pricelists.column.startDate", lang),
        dataIndex: "startDate",
        width: 130,
        sorter: false,
        render: (v: string | null) => (
          <Text type="secondary">
            {v ? dayjs(v).format("DD MMM YYYY") : "--"}
          </Text>
        ),
      },
      {
        title: t("pricelists.column.endDate", lang),
        dataIndex: "endDate",
        width: 130,
        sorter: false,
        render: (v: string | null) => (
          <Text type="secondary">
            {v ? dayjs(v).format("DD MMM YYYY") : "--"}
          </Text>
        ),
      },
      {
        title: t("pricelists.column.isActive", lang),
        dataIndex: "isActive",
        width: 100,
        sorter: false,
        align: "center" as const,
        render: (v: boolean) =>
          v ? (
            <Tag color="success">{t("pricelists.stats.active", lang)}</Tag>
          ) : (
            <Tag color="default">{t("pricelists.stats.inactive", lang)}</Tag>
          ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: PricelistRow) => (
          <ActionDropdown
            items={[
              {
                key: "view",
                label: t("common.view", lang),
                icon: <EyeOutlined />,
                onClick: () => onView(rec.id),
              },
              {
                key: "edit",
                label: t("pricelists.edit", lang),
                icon: <EditOutlined />,
                onClick: () => navigate(ROUTES.pricelistDetail(rec.id)),
              },
              { type: "divider" as const, key: "d" },
              {
                key: "delete",
                label: t("common.delete", lang),
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

// ── Mobile Grid ───────────────────────────────────────────────────────────────

function MobileGrid({
  pricelists,
  isLoading,
  onClick,
  t,
  lang,
}: {
  pricelists: PricelistRow[];
  isLoading: boolean;
  onClick: (id: string) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (pricelists.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          {t("common.no_data_title", lang)}
        </div>
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {pricelists.map(p => (
        <Col key={p.id} xs={24} sm={12} xl={8}>
          <Card
            hoverable
            size="small"
            onClick={() => onClick(p.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <Text strong>{getName(p) || "--"}</Text>
              {p.isActive ? (
                <Tag color="success">{t("pricelists.stats.active", lang)}</Tag>
              ) : (
                <Tag color="default">
                  {t("pricelists.stats.inactive", lang)}
                </Tag>
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>{t("pricelists.column.currency", lang)}</span>
                <span>{p.currencyCode ?? "--"}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("pricelists.column.discountPolicy", lang)}</span>
                <span>{discountPolicyLabel(p.discountPolicy, t, lang)}</span>
              </div>
              {p.startDate && (
                <div className="flex justify-between">
                  <span>{t("pricelists.column.startDate", lang)}</span>
                  <span>{dayjs(p.startDate).format("DD MMM YYYY")}</span>
                </div>
              )}
              {p.endDate && (
                <div className="flex justify-between">
                  <span>{t("pricelists.column.endDate", lang)}</span>
                  <span>{dayjs(p.endDate).format("DD MMM YYYY")}</span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
