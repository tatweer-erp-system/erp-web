/**
 * Quotations list page.
 * Quotations are draft sales orders -- uses useQuotations hook (status=draft filter).
 * Default export for lazy loading via React.lazy().
 */

import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import {
  Table,
  Button,
  Input,
  Card,
  Row,
  Col,
  Grid,
  Tooltip,
  Dropdown,
  Segmented,
  Typography,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExportOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import dayjs from "dayjs";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SalesStatusBadge } from "@/components/sales/SalesStatusBadge";
import { SalesOrderCard } from "@/components/sales/SalesOrderCard";
import { QuotationStats } from "@/components/sales/QuotationStats";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SalesOrderFastCreate } from "@/components/sales/SalesOrderFastCreate";
import { useTranslation } from "@/hooks/ui/useTranslation";
import { useQuotations } from "@/hooks/queries/useSalesOrders";
import {
  useConfirmSalesOrder,
  useDeleteSalesOrder,
} from "@/hooks/mutations/useSalesOrderMutations";
import { ROUTES } from "@/shared/constants/routes";
import { getName } from "@/shared/utils/getName.util";
import type {
  SalesOrderRow,
  SalesOrderFilterParams,
} from "@/types/modules/sales";

const { Text } = Typography;
const DEFAULT_PAGE_SIZE = 20;

export default function Quotations() {
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
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [confirmAsOrderId, setConfirmAsOrderId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fastCreateOpen, setFastCreateOpen] = useState(false);

  const queryParams = useMemo<Omit<SalesOrderFilterParams, "status">>(
    () => ({
      page,
      limit: pageSize,
      search: search || undefined,
      sortOrder: "DESC",
    }),
    [page, pageSize, search]
  );

  const { data: res, isLoading, refetch } = useQuotations(queryParams);
  const confirmMut = useConfirmSalesOrder();
  const deleteMut = useDeleteSalesOrder();

  const quotations = res?.data ?? [];
  const totalRows = res?.total ?? 0;

  const handleRowClick = useCallback(
    (orderNumber: string) => navigate(ROUTES.quotationDetail(orderNumber)),
    [navigate]
  );

  const handleConfirmAsOrder = useCallback(() => {
    if (!confirmAsOrderId) return;
    confirmMut.mutate(confirmAsOrderId, {
      onSuccess: () => {
        toast.success(t("sales.message.confirmed", lang));
        setConfirmAsOrderId(null);
        navigate(ROUTES.orderDetail(confirmAsOrderId));
      },
      onError: () => toast.error(t("sales.message.loadFailed", lang)),
    });
  }, [confirmAsOrderId, confirmMut, t, lang, navigate]);

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

  const columns = useQuotationColumns(
    t,
    lang,
    handleRowClick,
    navigate,
    setConfirmAsOrderId,
    setDeleteId
  );

  const rowSelection: TableProps<SalesOrderRow>["rowSelection"] = {
    selectedRowKeys: selectedRows,
    onChange: keys => setSelectedRows(keys as string[]),
  };

  const breadcrumbs = [
    { label: t("Dashboard", lang), href: ROUTES.DASHBOARD },
    { label: t("SALES", lang), href: "#" },
    { label: t("sales.quotations.breadcrumb", lang) },
  ];

  return (
    <DashboardLayout currentPage="Quotations" breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        <QuotationStats totalRows={totalRows} t={t} lang={lang} />

        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <QuotationsToolbar
            search={searchInput}
            onSearchChange={setSearchInput}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onReload={() => refetch()}
            onCreateNew={() => navigate(ROUTES.QUOTATION_CREATE)}
            t={t}
            lang={lang}
          />

          {selectedRows.length > 0 && (
            <QuotationsBulkBar
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
              dataSource={quotations}
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
          <QuotationsMobileGrid
            orders={quotations}
            isLoading={isLoading}
            onClick={handleRowClick}
            t={t}
            lang={lang}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAsOrderId}
        onOpenChange={v => !v && setConfirmAsOrderId(null)}
        title={t("sales.quotation.convertToOrder", lang)}
        description={t("sales.quotation.convertConfirm", lang)}
        confirmLabel={t("sales.quotation.convertToOrder", lang)}
        onConfirm={handleConfirmAsOrder}
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
        isQuotation
      />
    </DashboardLayout>
  );
}

// ── Columns ───────────────────────────────────────────────────────────────

function useQuotationColumns(
  t: (k: string, l: string) => string,
  lang: "ar" | "en",
  onView: (id: string) => void,
  navigate: ReturnType<typeof useNavigate>,
  setConfirmId: (id: string | null) => void,
  setDeleteId: (id: string | null) => void
): TableColumnsType<SalesOrderRow> {
  return useMemo(
    () => [
      {
        title: t("sales.column.orderNumber", lang),
        dataIndex: "orderNumber",
        width: 150,
        render: (v: string) => (
          <Text
            strong
            className="font-mono"
            style={{ color: "var(--ant-color-primary)" }}
          >
            {v}
          </Text>
        ),
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
        title: t("sales.column.total", lang),
        dataIndex: "totalAmount",
        width: 140,
        align: "end" as const,
        render: (v: number | string, r: SalesOrderRow) => (
          <Text strong className="font-mono">
            {r.currencyCode ?? "SAR"}{" "}
            {Number(v).toLocaleString("en-SA", { minimumFractionDigits: 2 })}
          </Text>
        ),
      },
      {
        title: t("sales.column.date", lang),
        dataIndex: "createdAt",
        width: 120,
        render: (v: string) => (
          <Text type="secondary">{dayjs(v).format("DD MMM YYYY")}</Text>
        ),
      },
      {
        title: t("sales.column.salesperson", lang),
        dataIndex: "salespersonNameEn",
        width: 160,
        responsive: ["lg"] as const,
        render: (_: unknown, r: SalesOrderRow) => (
          <Text type="secondary">
            {getName({
              nameEn: r.salespersonNameEn,
              nameAr: r.salespersonNameAr,
            }) || "--"}
          </Text>
        ),
      },
      {
        title: t("seq.actions", lang),
        align: "center" as const,
        width: 60,
        fixed: "right" as const,
        render: (_: unknown, rec: SalesOrderRow) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: "view",
                  label: t("common.view", lang),
                  icon: <EyeOutlined />,
                  onClick: () => onView(rec.orderNumber),
                },
                {
                  key: "confirm",
                  label: t("sales.quotation.convertToOrder", lang),
                  icon: <SwapOutlined />,
                  onClick: () => setConfirmId(rec.orderNumber),
                },
                {
                  key: "dup",
                  label: t("sales.action.duplicate", lang),
                  icon: <CopyOutlined />,
                },
                { type: "divider" as const, key: "d" },
                {
                  key: "delete",
                  label: t("sales.action.delete", lang),
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => setDeleteId(rec.orderNumber),
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
        ),
      },
    ],
    [t, lang, onView, navigate, setConfirmId, setDeleteId]
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────

function QuotationsToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onReload,
  onCreateNew,
  t,
  lang,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (v: "table" | "grid") => void;
  onReload: () => void;
  onCreateNew: () => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  return (
    <div className="flex flex-wrap gap-2 justify-between items-center">
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
        {t("sales.quotation.newQuotation", lang)}
      </Button>
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder={t("common.search", lang)}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <Tooltip title={t("seq.reload", lang)}>
          <Button icon={<ReloadOutlined />} onClick={onReload} />
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
          onChange={v => onViewModeChange(v as "table" | "grid")}
          options={[
            { value: "table", icon: <UnorderedListOutlined /> },
            { value: "grid", icon: <AppstoreOutlined /> },
          ]}
        />
      </div>
    </div>
  );
}

// ── Bulk Bar ──────────────────────────────────────────────────────────────

function QuotationsBulkBar({
  count,
  onClear,
  t,
  lang,
}: {
  count: number;
  onClear: () => void;
  t: (k: string, l: string) => string;
  lang: "ar" | "en";
}) {
  return (
    <div
      className="mt-3 py-2 px-3 rounded-md flex flex-wrap gap-3 items-center"
      style={{
        background: "var(--ant-color-primary-bg)",
        border: "1px solid var(--ant-color-primary-border)",
      }}
    >
      <Text strong style={{ color: "var(--ant-color-primary)" }}>
        {count} {t("sales.column.status", lang)}
      </Text>
      <Button size="small" icon={<DownloadOutlined />}>
        {t("products.export", lang)}
      </Button>
      <Button size="small" icon={<SwapOutlined />}>
        {t("sales.quotation.convertToOrder", lang)}
      </Button>
      <Button size="small" danger icon={<DeleteOutlined />}>
        {t("sales.action.delete", lang)}
      </Button>
      <Button size="small" type="text" onClick={onClear}>
        {t("sales.filter.allStatuses", lang)}
      </Button>
    </div>
  );
}

// ── Mobile Grid ───────────────────────────────────────────────────────────

function QuotationsMobileGrid({
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
