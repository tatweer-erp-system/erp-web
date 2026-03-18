/**
 * Sales Orders list page.
 * Wired to useSalesOrders hook with server-side pagination.
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
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SalesStatusBadge } from "@/components/sales/SalesStatusBadge";
import { CopyableCode } from "@/components/common/CopyableCode";
import { SalesOrderCard } from "@/components/sales/SalesOrderCard";
import { SalesOrdersStats } from "@/components/sales/SalesOrdersStats";
import { SalesOrdersToolbar } from "@/components/sales/SalesOrdersToolbar";
import { SalesOrdersFilterPanel } from "@/components/sales/SalesOrdersFilterPanel";
import { SalesOrdersBulkBar } from "@/components/sales/SalesOrdersBulkBar";
import { SalesOrderFastCreate } from "@/components/sales/SalesOrderFastCreate";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useTranslation } from "@/hooks/ui/useTranslation";
import {
  useSalesOrders,
  useSalesSummary,
} from "@/hooks/queries/useSalesOrders";
import {
  useConfirmSalesOrder,
  useDeleteSalesOrder,
  useCancelSalesOrder,
} from "@/hooks/mutations/useSalesOrderMutations";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import { SalesOrderStatus, SalesOrderInvoiceStatus } from "@/constants/enums";
import type {
  SalesOrderRow,
  SalesOrderFilterParams,
} from "@/types/modules/sales";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function AllOrders() {
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [invoiceFilter, setInvoiceFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [fastCreateOpen, setFastCreateOpen] = useState(false);

  const queryParams = useMemo<SalesOrderFilterParams>(() => {
    const params: SalesOrderFilterParams = {
      page,
      limit: pageSize,
      search: search || undefined,
      sortOrder: "DESC",
    };
    if (statusFilter !== "all")
      params.status = statusFilter as SalesOrderRow["status"];
    if (invoiceFilter !== "all")
      params.invoiceStatus = invoiceFilter as SalesOrderRow["invoiceStatus"];
    if (deliveryFilter !== "all")
      params.deliveryStatus = deliveryFilter as SalesOrderRow["deliveryStatus"];
    return params;
  }, [page, pageSize, search, statusFilter, invoiceFilter, deliveryFilter]);

  const { data: res, isLoading, refetch } = useSalesOrders(queryParams);
  const { data: summaryRes } = useSalesSummary();
  const confirmMut = useConfirmSalesOrder();
  const deleteMut = useDeleteSalesOrder();
  const cancelMut = useCancelSalesOrder();

  const orders = res?.data ?? [];
  const totalRows = res?.total ?? 0;

  const summary = (summaryRes as Record<string, unknown>)?.data as
    | {
        totalOrders?: number;
        totalAmount?: number;
        avgOrderValue?: number;
        byStatus?: {
          status: string;
          count: string | number;
          total: string | number;
        }[];
      }
    | undefined;

  const handleRowClick = useCallback(
    (orderNumber: string) => navigate(ROUTES.orderDetail(orderNumber)),
    [navigate]
  );

  const handleConfirm = useCallback(() => {
    if (!confirmId) return;
    confirmMut.mutate(confirmId, {
      onSuccess: () => {
        toast.success(t("sales.message.confirmed", lang));
        setConfirmId(null);
      },
      onError: () => toast.error(t("sales.message.loadFailed", lang)),
    });
  }, [confirmId, confirmMut, t, lang]);

  const handleDelete = useCallback(() => {
    if (!deleteId) return;
    deleteMut.mutate(deleteId, {
      onSuccess: () => {
        toast.success(t("sales.message.deleted", lang));
        setDeleteId(null);
      },
      onError: () => toast.error(t("sales.message.loadFailed", lang)),
    });
  }, [deleteId, deleteMut, t, lang]);

  const handleCancel = useCallback(() => {
    if (!cancelId) return;
    cancelMut.mutate(cancelId, {
      onSuccess: () => {
        toast.success(t("sales.message.cancelled", lang));
        setCancelId(null);
      },
      onError: () => toast.error(t("sales.message.loadFailed", lang)),
    });
  }, [cancelId, cancelMut, t, lang]);

  const columns = useOrderColumns(
    t,
    lang,
    handleRowClick,
    navigate,
    setConfirmId,
    setCancelId,
    setDeleteId
  );

  const rowSelection: TableProps<SalesOrderRow>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("SALES", lang), href: "#" },
    { label: t("sales.orders.breadcrumb", lang) },
  ];

  return (
    <DashboardLayout currentPage="AllOrders" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        <SalesOrdersStats
          totalOrders={Number(summary?.totalOrders ?? 0)}
          totalAmount={Number(summary?.totalAmount ?? 0)}
          avgOrderValue={Number(summary?.avgOrderValue ?? 0)}
          byStatus={summary?.byStatus ?? []}
          t={t}
          lang={lang}
        />

        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <SalesOrdersToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            isFilterOpen={isFilterOpen}
            onToggleFilter={() => setIsFilterOpen(!isFilterOpen)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onReload={() => refetch()}
            onCreateNew={() => navigate(ROUTES.ORDER_CREATE)}
            t={t}
            lang={lang}
          />
          {isFilterOpen && (
            <SalesOrdersFilterPanel
              invoiceFilter={invoiceFilter}
              deliveryFilter={deliveryFilter}
              onInvoiceFilterChange={v => {
                setInvoiceFilter(v);
                setPage(1);
              }}
              onDeliveryFilterChange={v => {
                setDeliveryFilter(v);
                setPage(1);
              }}
              t={t}
              lang={lang}
            />
          )}
          {selectedRows.length > 0 && (
            <SalesOrdersBulkBar
              count={selectedRows.length}
              onClear={() => setSelectedRows([])}
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
              dataSource={orders}
              rowSelection={rowSelection}
              loading={isLoading}
              size="middle"
              scroll={{ x: "max-content" }}
              onRow={rec => ({
                onClick: () => handleRowClick(rec.orderNumber),
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
              locale={{ emptyText: t("sales.line.noLines", lang) }}
            />
          </Card>
        ) : (
          <MobileGrid
            orders={orders}
            isLoading={isLoading}
            onClick={handleRowClick}
            t={t}
            lang={lang}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={v => !v && setConfirmId(null)}
        title={t("sales.message.confirmOrder", lang)}
        description={t("sales.message.confirmOrderNote", lang)}
        confirmLabel={t("sales.action.confirm", lang)}
        onConfirm={handleConfirm}
        variant="warning"
      />
      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={v => !v && setCancelId(null)}
        title={t("sales.message.cancelWarning", lang)}
        description={t("sales.message.cancelWarningNote", lang)}
        confirmLabel={t("sales.action.cancel", lang)}
        onConfirm={handleCancel}
        variant="warning"
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={v => !v && setDeleteId(null)}
        title={t("sales.message.deleteConfirm", lang)}
        description={t("sales.message.deleteConfirmNote", lang)}
        confirmLabel={t("sales.action.delete", lang)}
        onConfirm={handleDelete}
        variant="danger"
      />
      <SalesOrderFastCreate
        open={fastCreateOpen}
        onClose={() => setFastCreateOpen(false)}
      />
    </DashboardLayout>
  );
}

// ── Columns hook ──────────────────────────────────────────────────────────

function useOrderColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setConfirmId: (id: string | null) => void,
  setCancelId: (id: string | null) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<SalesOrderRow> {
  return useMemo(
    () => [
      {
        title: t("sales.column.orderNumber", lang),
        dataIndex: "orderNumber",
        width: 150,
        sorter: false,
        render: (v: string) => <CopyableCode value={v} />,
      },
      {
        title: t("sales.column.customer", lang),
        dataIndex: "partnerNameEn",
        width: 200,
        ellipsis: true,
        render: (_: unknown, r: SalesOrderRow) => (
          <Text>
            {getName({ nameEn: r.partnerNameEn, nameAr: r.partnerNameAr }) ||
              "--"}
          </Text>
        ),
      },
      {
        title: t("sales.column.date", lang),
        dataIndex: "createdAt",
        width: 120,
        sorter: false,
        render: (v: string) => (
          <Text type="secondary">{dayjs(v).format("DD MMM YYYY")}</Text>
        ),
      },
      {
        title: t("sales.column.total", lang),
        dataIndex: "totalAmount",
        width: 140,
        sorter: false,
        align: "end" as const,
        render: (v: number | string, r: SalesOrderRow) => (
          <Text strong className="font-mono">
            {r.currencyCode ?? "SAR"}{" "}
            {Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </Text>
        ),
      },
      {
        title: t("sales.column.status", lang),
        dataIndex: "status",
        width: 110,
        sorter: false,
        render: (v: string) => <SalesStatusBadge status={v} type="order" />,
      },
      {
        title: t("sales.column.invoiceStatus", lang),
        dataIndex: "invoiceStatus",
        width: 150,
        responsive: ["lg"] as const,
        render: (v: string) => <SalesStatusBadge status={v} type="invoice" />,
      },
      {
        title: t("sales.column.deliveryStatus", lang),
        dataIndex: "deliveryStatus",
        width: 150,
        responsive: ["lg"] as const,
        render: (v: string) => <SalesStatusBadge status={v} type="delivery" />,
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: SalesOrderRow) => (
          <Dropdown
            menu={{
              items: buildActions(
                rec,
                t,
                lang,
                onView,
                navigate,
                setConfirmId,
                setCancelId,
                setDeleteId
              ),
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
    [t, lang, onView, navigate, setConfirmId, setCancelId, setDeleteId]
  );
}

function buildActions(
  rec: SalesOrderRow,
  t: (k: string, l: string) => string,
  lang: string,
  onView: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setConfirmId: (id: string | null) => void,
  setCancelId: (id: string | null) => void,
  setDeleteId: (id: string | null) => void
) {
  const items: NonNullable<Parameters<typeof Dropdown>[0]["menu"]>["items"] = [
    {
      key: "view",
      label: t("common.view", lang),
      icon: <EyeOutlined />,
      onClick: () => onView(rec.orderNumber),
    },
  ];
  if (rec.status === SalesOrderStatus.DRAFT) {
    items.push({
      key: "confirm",
      label: t("sales.action.confirm", lang),
      icon: <CheckCircleOutlined />,
      onClick: () => setConfirmId(rec.orderNumber),
    });
  }
  if (
    (rec.status === SalesOrderStatus.CONFIRMED ||
      rec.status === SalesOrderStatus.DONE) &&
    rec.invoiceStatus !== SalesOrderInvoiceStatus.INVOICED
  ) {
    items.push({
      key: "invoice",
      label: t("sales.action.createInvoice", lang),
      icon: <FileTextOutlined />,
      onClick: () => navigate(ROUTES.orderDetail(rec.orderNumber)),
    });
  }
  if (
    rec.status === SalesOrderStatus.DRAFT ||
    rec.status === SalesOrderStatus.CONFIRMED
  ) {
    items.push({ type: "divider" as const, key: "d" });
    items.push({
      key: "cancel",
      label: t("sales.action.cancel", lang),
      icon: <CloseCircleOutlined />,
      danger: true,
      onClick: () => setCancelId(rec.orderNumber),
    });
  }
  if (rec.status === SalesOrderStatus.DRAFT) {
    items.push({
      key: "delete",
      label: t("sales.action.delete", lang),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => setDeleteId(rec.orderNumber),
    });
  }
  return items;
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function MobileGrid({
  orders,
  isLoading,
  onClick,
  t,
  lang,
}: {
  orders: SalesOrderRow[];
  isLoading: boolean;
  onClick: (id: string) => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  if (isLoading) return <Card loading />;
  if (orders.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-400">
          {t("sales.line.noLines", lang)}
        </div>
      </Card>
    );
  }
  return (
    <Row gutter={[16, 16]}>
      {orders.map(o => (
        <Col key={o.id} xs={24} sm={12} xl={8}>
          <SalesOrderCard order={o} onClick={onClick} />
        </Col>
      ))}
    </Row>
  );
}
