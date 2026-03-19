import { useState, useMemo, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  stockService,
  productsService,
  warehousesService,
} from "@/services/inventory.service";
import { StockMovementType } from "@/constants/enums";
import type {
  CreateMovementDto,
  DropdownItem,
} from "@/types/modules/inventory";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import {
  Button,
  Space,
  Card,
  Row,
  Col,
  Grid,
  Select,
  Typography,
  InputNumber,
  Input,
  notification,
  Progress,
  Alert,
  Popconfirm,
  Table,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SendOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

// ─── Row type for editable table ────────────────────────────────────────────

interface StockRow {
  key: string;
  productId: string | undefined;
  quantity: number | undefined;
  unitCost: number | undefined;
  lotNumber: string | undefined;
  serialNumber: string | undefined;
}

let rowKeyCounter = 0;
function nextRowKey(): string {
  rowKeyCounter += 1;
  return `row-${rowKeyCounter}`;
}

function createEmptyRow(): StockRow {
  return {
    key: nextRowKey(),
    productId: undefined,
    quantity: undefined,
    unitCost: undefined,
    lotNumber: undefined,
    serialNumber: undefined,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function OpeningStock() {
  const { theme } = useAppSettings();
  const lang = useLangStore(s => s.lang);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const primary = theme === "dark" ? "#37D399" : "#3B82F6";

  // ── State ────────────────────────────────────────────────────────────────
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined);
  const [rows, setRows] = useState<StockRow[]>([createEmptyRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: warehousesList } = useQuery({
    queryKey: [QUERY_KEYS.WAREHOUSES_DROPDOWN],
    queryFn: () => warehousesService.dropdown(),
    staleTime: 60_000,
  });

  const warehouseOptions = useMemo(() => {
    const list = (warehousesList ?? []) as DropdownItem[];
    return list.map(w => ({
      value: w.id,
      label: getName(w),
    }));
  }, [warehousesList]);

  const { data: productsList } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "dropdown"],
    queryFn: () => productsService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  const productOptions = useMemo(() => {
    const list = (productsList ?? []) as DropdownItem[];
    return list.map(p => ({
      value: p.id,
      label: getName(p),
    }));
  }, [productsList]);

  // ── Row manipulation ─────────────────────────────────────────────────────

  const addRow = useCallback(() => {
    setRows(prev => [...prev, createEmptyRow()]);
  }, []);

  const removeRow = useCallback((key: string) => {
    setRows(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(r => r.key !== key);
    });
  }, []);

  const updateRow = useCallback(
    (key: string, field: keyof StockRow, value: unknown) => {
      setRows(prev =>
        prev.map(r => (r.key === key ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  // ── Validation ───────────────────────────────────────────────────────────

  const validRows = useMemo(
    () =>
      rows.filter(
        r =>
          r.productId &&
          r.quantity != null &&
          r.quantity > 0 &&
          r.unitCost != null &&
          r.unitCost >= 0
      ),
    [rows]
  );

  const canSubmit = !!warehouseId && validRows.length > 0 && !submitting;

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!warehouseId || validRows.length === 0) return;

    setSubmitting(true);
    setProgress({ current: 0, total: validRows.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      const dto: CreateMovementDto = {
        type: StockMovementType.OPENING,
        productId: row.productId!,
        warehouseId,
        quantity: row.quantity!,
        unitCost: row.unitCost ?? undefined,
        lotNumber: row.lotNumber ?? undefined,
        serialNumber: row.serialNumber ?? undefined,
      };

      try {
        await stockService.createMovement(dto);
        successCount += 1;
      } catch {
        failCount += 1;
      }

      setProgress({ current: i + 1, total: validRows.length });
    }

    setSubmitting(false);

    // Invalidate caches
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_LEVELS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.STOCK_MOVEMENTS] });

    if (failCount === 0) {
      notification.success({
        message: t("openingStock.submitSuccess", lang),
        description: `${successCount} ${t("openingStock.rowsCreated", lang)}`,
      });
      // Reset form
      setRows([createEmptyRow()]);
    } else {
      notification.warning({
        message: t("openingStock.submitPartial", lang),
        description: `${successCount} ${t("openingStock.succeeded", lang)}, ${failCount} ${t("openingStock.failed", lang)}`,
      });
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────

  const columns: TableColumnsType<StockRow> = [
    {
      title: "#",
      width: 50,
      align: "center" as const,
      render: (_, __, index) => <Text type="secondary">{index + 1}</Text>,
    },
    {
      title: t("openingStock.product", lang),
      dataIndex: "productId",
      width: 280,
      render: (_, rec) => (
        <Select
          value={rec.productId}
          onChange={v => updateRow(rec.key, "productId", v)}
          placeholder={t("openingStock.selectProduct", lang)}
          options={productOptions}
          showSearch
          optionFilterProp="label"
          allowClear
          style={{ width: "100%" }}
          disabled={submitting}
        />
      ),
    },
    {
      title: t("openingStock.quantity", lang),
      dataIndex: "quantity",
      width: 130,
      render: (_, rec) => (
        <InputNumber
          value={rec.quantity}
          onChange={v => updateRow(rec.key, "quantity", v)}
          min={1}
          placeholder="0"
          style={{ width: "100%" }}
          disabled={submitting}
        />
      ),
    },
    {
      title: t("openingStock.unitCost", lang),
      dataIndex: "unitCost",
      width: 150,
      render: (_, rec) => (
        <InputNumber
          value={rec.unitCost}
          onChange={v => updateRow(rec.key, "unitCost", v)}
          min={0}
          precision={2}
          placeholder="0.00"
          style={{ width: "100%" }}
          disabled={submitting}
        />
      ),
    },
    {
      title: t("openingStock.lotNumber", lang),
      dataIndex: "lotNumber",
      width: 150,
      render: (_, rec) => (
        <Input
          value={rec.lotNumber}
          onChange={e => updateRow(rec.key, "lotNumber", e.target.value)}
          placeholder={t("openingStock.optional", lang)}
          disabled={submitting}
        />
      ),
    },
    {
      title: t("openingStock.serialNumber", lang),
      dataIndex: "serialNumber",
      width: 150,
      render: (_, rec) => (
        <Input
          value={rec.serialNumber}
          onChange={e => updateRow(rec.key, "serialNumber", e.target.value)}
          placeholder={t("openingStock.optional", lang)}
          disabled={submitting}
        />
      ),
    },
    {
      title: "",
      width: 50,
      align: "center" as const,
      render: (_, rec) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeRow(rec.key)}
          disabled={rows.length <= 1 || submitting}
        />
      ),
    },
  ];

  return (
    <DashboardLayout
      currentPage="OpeningStock"
      breadcrumbs={[
        { label: t("common.dashboard", lang), href: "/" },
        { label: t("inventory.title", lang), href: "#" },
        { label: t("openingStock.title", lang) },
      ]}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* ── Header info ─────────────────────────────────────────────────── */}
        <Alert
          title={t("openingStock.title", lang)}
          description={t("openingStock.description", lang)}
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ borderRadius: 8 }}
        />

        {/* ── Warehouse selector ──────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Text strong style={{ fontSize: 14 }}>
                {t("openingStock.warehouse", lang)}
              </Text>
            </Col>
            <Col xs={24} sm={16} md={10}>
              <Select
                value={warehouseId}
                onChange={v => setWarehouseId(v)}
                placeholder={t("openingStock.selectWarehouse", lang)}
                options={warehouseOptions}
                showSearch
                optionFilterProp="label"
                allowClear
                style={{ width: "100%" }}
                disabled={submitting}
              />
            </Col>
          </Row>
        </Card>

        {/* ── Editable table ──────────────────────────────────────────────── */}
        <Card
          title={
            <Space>
              <Title level={5} style={{ margin: 0 }}>
                {t("openingStock.entries", lang)}
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                ({rows.length} {t("openingStock.rows", lang)})
              </Text>
            </Space>
          }
          extra={
            <Button
              icon={<PlusOutlined />}
              onClick={addRow}
              disabled={submitting}
            >
              {t("openingStock.addRow", lang)}
            </Button>
          }
          styles={{ body: { padding: 0 } }}
        >
          <Table
            rowKey="key"
            columns={columns}
            dataSource={rows}
            size="middle"
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </Card>

        {/* ── Progress bar (visible during submit) ────────────────────────── */}
        {submitting && (
          <Card size="small" styles={{ body: { padding: "16px 20px" } }}>
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Text>
                {t("openingStock.processing", lang)} {progress.current}{" "}
                {t("openingStock.of", lang)} {progress.total}
              </Text>
              <Progress
                percent={Math.round(
                  (progress.current / Math.max(progress.total, 1)) * 100
                )}
                status="active"
                strokeColor={primary}
              />
            </Space>
          </Card>
        )}

        {/* ── Submit button ───────────────────────────────────────────────── */}
        <Row justify={isMobile ? "center" : "end"}>
          <Col>
            <Space>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {validRows.length} {t("openingStock.validRows", lang)}
              </Text>
              <Popconfirm
                title={t("openingStock.confirmTitle", lang)}
                description={`${validRows.length} ${t("openingStock.confirmDesc", lang)}`}
                onConfirm={handleSubmit}
                okText={t("openingStock.confirm", lang)}
                cancelText={t("openingStock.cancel", lang)}
                disabled={!canSubmit}
              >
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  size="large"
                  disabled={!canSubmit}
                  loading={submitting}
                >
                  {t("openingStock.submit", lang)}
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Space>
    </DashboardLayout>
  );
}
