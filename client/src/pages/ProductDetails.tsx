import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import {
  productsService,
  categoriesService,
} from "@/services/inventory.service";
import type {
  Product,
  CreateProductDto,
  DropdownItem,
} from "@/types/modules/inventory";
import { ProductType, InvoicePolicy } from "@/constants/enums";
import { getName } from "@/lib/utils";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Table,
  Card,
  Button,
  Input,
  Drawer,
  Modal,
  Form,
  Select,
  InputNumber,
  Switch,
  Tag,
  Space,
  Spin,
  Empty,
  Popconfirm,
  Dropdown,
  Segmented,
  DatePicker,
  notification,
  message,
  theme as antTheme,
  Row,
  Col,
  Statistic,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  CloseOutlined,
  SaveOutlined,
  FilterOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  WarningOutlined,
  StopOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  Warehouse,
  ShoppingCart,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePagination } from "@/hooks/usePagination";
import { useDebounce } from "@/hooks/useDebounce";
import { useBreakpoint } from "@/hooks/ui/useBreakpoint";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PRODUCT_TYPE_COLORS: Record<string, string> = {
  [ProductType.STORABLE]: "blue",
  [ProductType.CONSUMABLE]: "green",
  [ProductType.SERVICE]: "purple",
};

function formatCurrency(amount: number, currency = "SAR") {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Product Form Modal ──────────────────────────────────────────────────────

function ProductFormDrawer({
  open,
  editProduct,
  onClose,
  lang,
  categories,
}: {
  open: boolean;
  editProduct: Product | null;
  onClose: () => void;
  lang: string;
  categories: DropdownItem[];
}) {
  const { token } = antTheme.useToken();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { isMobile } = useBreakpoint();
  const isEdit = !!editProduct;
  const isRTL = lang === "ar";

  const createMutation = useMutation({
    mutationFn: (dto: CreateProductDto) => productsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS_SUMMARY] });
      message.success(t("products.createSuccess", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: { message?: string }) => {
      notification.error({
        message: t("products.addProduct", lang),
        description: err?.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (dto: Record<string, unknown>) =>
      productsService.update(editProduct!.id, dto as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS_SUMMARY] });
      message.success(t("products.updateSuccess", lang));
      form.resetFields();
      onClose();
    },
    onError: (err: { message?: string }) => {
      notification.error({
        message: t("products.editProduct", lang),
        description: err?.message,
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
          version: editProduct!.version ?? 0,
        });
      } else {
        createMutation.mutate(values);
      }
    } catch {
      // validation failed
    }
  };

  const isSaving = isEdit ? updateMutation.isPending : createMutation.isPending;

  React.useEffect(() => {
    if (open && isEdit && editProduct) {
      form.setFieldsValue({
        nameEn: editProduct.nameEn,
        nameAr: editProduct.nameAr,
        descriptionEn: editProduct.descriptionEn ?? "",
        descriptionAr: editProduct.descriptionAr ?? "",
        sku: editProduct.sku ?? "",
        barcode: editProduct.barcode ?? "",
        categoryId: editProduct.categoryId,
        unitPrice: editProduct.unitPrice,
        costPrice: editProduct.costPrice,
        taxRate: editProduct.taxRate ?? 15,
        productType: editProduct.productType,
        invoicePolicy: editProduct.invoicePolicy,
        reorderPoint: editProduct.reorderPoint,
        isActive: editProduct.isActive ?? true,
        canBeSold: editProduct.canBeSold ?? true,
        canBePurchased: editProduct.canBePurchased ?? true,
      });
    } else if (open && !isEdit) {
      form.resetFields();
    }
  }, [open, isEdit, editProduct, form]);

  const typeColor = token.colorPrimary;

  const handleClose = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: t("products.unsavedChanges", lang),
        content: t("products.unsavedChangesMsg", lang),
        onOk: () => {
          form.resetFields();
          onClose();
        },
      });
      return;
    }
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      destroyOnClose
      keyboard
      placement={isMobile ? "bottom" : isRTL ? "left" : "right"}
      width={isMobile ? "100%" : 600}
      height={isMobile ? "90%" : undefined}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
          {isEdit ? <EditOutlined /> : <PlusOutlined />}
          <span style={{ fontWeight: 600 }}>
            {isEdit
              ? t("products.editProduct", lang)
              : t("products.addProduct", lang)}
          </span>
        </div>
      }
      styles={{
        header: {
          background: `linear-gradient(135deg, ${typeColor} 0%, ${typeColor}dd 100%)`,
        },
        body: { direction: isRTL ? "rtl" : "ltr" },
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button onClick={handleClose} disabled={isSaving}>
            {t("products.cancel", lang)}
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSave}
          >
            {isEdit ? t("products.saveChanges", lang) : t("products.save", lang)}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          productType: ProductType.STORABLE,
          invoicePolicy: InvoicePolicy.ORDERED,
          taxRate: 15,
          isActive: true,
          canBeSold: true,
          canBePurchased: true,
          reorderPoint: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nameEn"
              label={t("products.nameEn", lang)}
              rules={[{ required: true }]}
            >
              <Input dir="ltr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nameAr"
              label={t("products.nameAr", lang)}
              rules={[{ required: true }]}
            >
              <Input dir="rtl" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="sku"
              label={t("products.sku", lang)}
              rules={[{ required: true }]}
            >
              <Input dir="ltr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="barcode" label={t("products.barcode", lang)}>
              <Input dir="ltr" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label={t("products.category", lang)}
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={categories.map(c => ({
                  value: c.id,
                  label: getName(c),
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productType"
              label={t("products.productType", lang)}
            >
              <Select
                options={[
                  {
                    value: ProductType.STORABLE,
                    label: t("products.storable", lang),
                  },
                  {
                    value: ProductType.CONSUMABLE,
                    label: t("products.consumable", lang),
                  },
                  {
                    value: ProductType.SERVICE,
                    label: t("products.service", lang),
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="unitPrice"
              label={t("products.unitPrice", lang)}
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="costPrice" label={t("products.costPrice", lang)}>
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxRate" label={t("products.taxRate", lang)}>
              <InputNumber min={0} max={100} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoicePolicy"
              label={t("products.invoicePolicy", lang)}
            >
              <Select
                options={[
                  {
                    value: InvoicePolicy.ORDERED,
                    label: t("products.ordered", lang),
                  },
                  {
                    value: InvoicePolicy.DELIVERED,
                    label: t("products.delivered", lang),
                  },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="reorderPoint"
              label={t("products.reorderPoint", lang)}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="descriptionEn"
              label={t("products.descriptionEn", lang)}
            >
              <Input.TextArea rows={2} dir="ltr" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="descriptionAr"
              label={t("products.descriptionAr", lang)}
            >
              <Input.TextArea rows={2} dir="rtl" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={24}>
          <Col>
            <Form.Item
              name="isActive"
              label={t("products.isActive", lang)}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="canBeSold"
              label={t("products.canBeSold", lang)}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col>
            <Form.Item
              name="canBePurchased"
              label={t("products.canBePurchased", lang)}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProductDetails() {
  const lang = useLangStore(s => s.lang);
  const navigate = useNavigate();
  const { pagination, goToPage, setLimit } = usePagination();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<string | undefined>();
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const queryClient = useQueryClient();

  // ── Fetch categories (shared by filters + modal) ──
  const { data: categoryOptions = [] } = useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES_DROPDOWN],
    queryFn: () => categoriesService.dropdown({ limit: 100 }),
    staleTime: 60_000,
  });

  // ── Fetch summary (server-side aggregates) ──
  const { data: summaryRes } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS_SUMMARY],
    queryFn: () => productsService.summary(),
    staleTime: 30_000,
  });
  const summary = (summaryRes as Record<string, unknown>)?.data as
    | { totalProducts: number; totalActive: number; totalInactive: number; totalStorable: number; totalConsumable: number; totalService: number }
    | undefined;

  // ── Fetch products ──
  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      QUERY_KEYS.PRODUCTS,
      pagination.page,
      pagination.limit,
      debouncedSearch,
    ],
    queryFn: () =>
      productsService.list({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
      }),
  });

  // ── Client-side filtering ──
  const allProducts = productsData?.data ?? [];
  const total = productsData?.meta?.total ?? 0;
  const products = allProducts.filter(p => {
    if (filterType && p.productType !== filterType) return false;
    if (filterStatus === "active" && !p.isActive) return false;
    if (filterStatus === "inactive" && p.isActive) return false;
    if (filterCategory && p.categoryId !== filterCategory) return false;
    return true;
  });

  // ── Delete mutation ──
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS_SUMMARY] });
      message.success(t("products.deleteSuccess", lang));
    },
    onError: (err: { message?: string }) => {
      notification.error({
        message: t("products.deleteProduct", lang),
        description: err?.message,
        style: { direction: document.dir as "rtl" | "ltr" },
      });
    },
  });

  // ── Open drawer ──
  const openCreate = () => {
    setEditProduct(null);
    setDrawerOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setEditProduct(null);
    setDrawerOpen(false);
  };

  // ── Export / Print ──
  const handleExport = () => {
    const header = [
      t("products.nameEn", lang),
      t("products.nameAr", lang),
      t("products.sku", lang),
      t("products.productType", lang),
      t("products.unitPrice", lang),
      t("products.costPrice", lang),
      t("products.taxRate", lang),
      t("products.isActive", lang),
    ];
    const rows = products.map(p => [
      p.nameEn,
      p.nameAr,
      p.sku ?? "",
      p.productType,
      p.unitPrice,
      p.costPrice ?? "",
      p.taxRate ?? "",
      p.isActive ? t("common.yes", lang) : t("common.no", lang),
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Table columns ──
  const columns: ColumnsType<Product> = [
    {
      title: t("products.nameEn", lang).replace(/ \(.*\)/, ""),
      key: "name",
      render: (_: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 600 }}>{getName(record)}</div>
          {record.sku && (
            <div style={{ fontSize: 12, color: "#888" }}>{record.sku}</div>
          )}
        </div>
      ),
    },
    {
      title: t("products.sku", lang),
      dataIndex: "sku",
      key: "sku",
      responsive: ["lg"],
    },
    {
      title: t("products.category", lang),
      key: "category",
      render: (_: unknown, record: Product) =>
        record.category
          ? lang === "ar"
            ? record.category.nameAr
            : record.category.nameEn
          : "—",
      responsive: ["md"],
    },
    {
      title: t("products.productType", lang),
      dataIndex: "productType",
      key: "productType",
      render: (type: string) => (
        <Tag color={PRODUCT_TYPE_COLORS[type] ?? "default"}>
          {t(`products.${type}`, lang)}
        </Tag>
      ),
      responsive: ["md"],
    },
    {
      title: t("products.unitPrice", lang),
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price: number, record: Product) =>
        formatCurrency(price, record.currency),
      align: "right" as const,
    },
    {
      title: t("products.costPrice", lang),
      dataIndex: "costPrice",
      key: "costPrice",
      render: (price: number | undefined, record: Product) =>
        price != null ? formatCurrency(price, record.currency) : "—",
      align: "right" as const,
      responsive: ["lg"],
    },
    {
      title: t("products.taxRate", lang),
      dataIndex: "taxRate",
      key: "taxRate",
      render: (rate: number) => (rate != null ? `${rate}%` : "—"),
      align: "center" as const,
      responsive: ["xl"],
    },
    {
      title: t("products.status", lang),
      dataIndex: "isActive",
      key: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active
            ? t("products.isActive", lang)
            : t("products.inactive", lang)}
        </Tag>
      ),
      align: "center" as const,
    },
    {
      title: t("products.actions", lang),
      key: "actions",
      align: "center" as const,
      width: 120,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title={t("products.deleteConfirm", lang)}
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText={t("common.yes", lang)}
            cancelText={t("common.no", lang)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const breadcrumbs = [
    { label: t("common.dashboard", lang), href: "/" },
    { label: t("inventory.title", lang), href: "#" },
    { label: t("products.title", lang) },
  ];

  return (
    <DashboardLayout
      currentPage={t("products.title", lang)}
      breadcrumbs={breadcrumbs}
    >
      <Space orientation="vertical" size={20} style={{ width: "100%" }}>
        {/* Summary Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("products.totalProducts", lang)}
                value={summary?.totalProducts ?? 0}
                prefix={
                  <InboxOutlined style={{ fontSize: 20, color: "#3B82F6" }} />
                }
              />
              <div className="text-xs text-muted-foreground mt-1">
                {t("products.activeInInventory", lang)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("products.storable", lang)}
                value={summary?.totalStorable ?? 0}
                prefix={
                  <WarningOutlined style={{ fontSize: 20, color: "#F59E0B" }} />
                }
                styles={{ content: { color: "#F59E0B" } }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {t("products.needReordering", lang)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("products.inactive", lang)}
                value={summary?.totalInactive ?? 0}
                prefix={
                  <StopOutlined style={{ fontSize: 20, color: "#EF4444" }} />
                }
                styles={{ content: { color: "#EF4444" } }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {t("products.urgentAction", lang)}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t("products.isActive", lang)}
                value={summary?.totalActive ?? 0}
                prefix={
                  <DollarOutlined style={{ fontSize: 20, color: "#10B981" }} />
                }
                styles={{ content: { color: "#10B981" } }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {t("products.inventoryValue", lang)}
              </div>
            </Card>
          </Col>
        </Row>

        {/* ── Toolbar Card ─────────────────────────────────────────────── */}
        <Card size="small" styles={{ body: { padding: "12px 16px" } }}>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="flex flex-wrap gap-2 items-center">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreate}
              >
                {t("products.addProduct", lang)}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <DatePicker.RangePicker
                value={dateRange}
                onChange={dates => {
                  setDateRange(dates);
                  goToPage(1);
                }}
                placeholder={[
                  t("common.dateFrom", lang),
                  t("common.dateTo", lang),
                ]}
                allowClear
                style={{ borderRadius: 8 }}
              />
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder={t("products.search", lang)}
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  goToPage(1);
                }}
                allowClear
                style={{ width: 240 }}
              />
              <Tooltip title={t("products.filter", lang)}>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  type={isFilterOpen ? "primary" : "default"}
                />
              </Tooltip>
              <Tooltip title={t("products.reload", lang)}>
                <Button
                  icon={<ReloadOutlined spin={isFetching} />}
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: [QUERY_KEYS.PRODUCTS],
                    })
                  }
                />
              </Tooltip>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "csv",
                      label: "CSV",
                      icon: <DownloadOutlined />,
                      onClick: handleExport,
                    },
                    {
                      key: "excel",
                      label: "Excel",
                      icon: <DownloadOutlined />,
                    },
                    {
                      key: "pdf",
                      label: "PDF",
                      icon: <DownloadOutlined />,
                    },
                  ],
                }}
              >
                <Button icon={<DownloadOutlined />}>
                  {t("products.export", lang)}
                </Button>
              </Dropdown>
              <Segmented
                value={viewMode}
                onChange={val => setViewMode(val as "table" | "grid")}
                options={[
                  { value: "table", icon: <UnorderedListOutlined /> },
                  { value: "grid", icon: <AppstoreOutlined /> },
                ]}
              />
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder={t("products.allTypes", lang)}
                    value={filterType}
                    onChange={val => {
                      setFilterType(val);
                      goToPage(1);
                    }}
                    allowClear
                    style={{ width: "100%" }}
                    options={[
                      {
                        value: ProductType.STORABLE,
                        label: t("products.storable", lang),
                      },
                      {
                        value: ProductType.CONSUMABLE,
                        label: t("products.consumable", lang),
                      },
                      {
                        value: ProductType.SERVICE,
                        label: t("products.service", lang),
                      },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder={t("products.allStatuses", lang)}
                    value={filterStatus}
                    onChange={val => {
                      setFilterStatus(val);
                      goToPage(1);
                    }}
                    allowClear
                    style={{ width: "100%" }}
                    options={[
                      {
                        value: "active",
                        label: t("products.active", lang),
                      },
                      {
                        value: "inactive",
                        label: t("products.inactive", lang),
                      },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Select
                    placeholder={t("products.allCategories", lang)}
                    value={filterCategory}
                    onChange={val => {
                      setFilterCategory(val);
                      goToPage(1);
                    }}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                    options={categoryOptions.map(c => ({
                      value: c.id,
                      label: getName(c),
                    }))}
                  />
                </Col>
              </Row>
              {(filterType || filterStatus || filterCategory) && (
                <div className="mt-2">
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setFilterType(undefined);
                      setFilterStatus(undefined);
                      setFilterCategory(undefined);
                      goToPage(1);
                    }}
                  >
                    {t("products.clearFilters", lang)}
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <Table<Product>
              columns={columns}
              dataSource={products}
              rowKey="id"
              loading={isLoading}
              locale={{
                emptyText: (
                  <Empty description={t("products.noProducts", lang)} />
                ),
              }}
              pagination={{
                current: pagination.page,
                pageSize: pagination.limit,
                total,
                showSizeChanger: true,
                pageSizeOptions: [10, 25, 50, 100],
                showTotal: (total, range) =>
                  `${t("products.showing", lang)} ${range[0]}-${range[1]} ${t("products.of", lang)} ${total}`,
                onChange: (page, pageSize) => {
                  goToPage(page);
                  if (pageSize !== pagination.limit) setLimit(pageSize);
                },
              }}
              scroll={{ x: 800 }}
            />
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spin size="large" />
              </div>
            ) : products.length === 0 ? (
              <Card>
                <Empty description={t("products.noProducts", lang)} />
              </Card>
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {products.map(product => (
                    <Col key={product.id} xs={24} sm={12} lg={8} xl={6}>
                      <Card
                        hoverable
                        actions={[
                          <Tooltip key="edit" title={t("products.edit", lang)}>
                            <EditOutlined onClick={() => openEdit(product)} />
                          </Tooltip>,
                          <Popconfirm
                            key="delete"
                            title={t("products.deleteConfirm", lang)}
                            onConfirm={() => deleteMutation.mutate(product.id)}
                            okText={lang === "ar" ? "نعم" : "Yes"}
                            cancelText={lang === "ar" ? "لا" : "No"}
                          >
                            <DeleteOutlined style={{ color: "#ff4d4f" }} />
                          </Popconfirm>,
                        ]}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-foreground text-sm leading-tight">
                              {getName(product)}
                            </h3>
                            <Tag
                              color={
                                PRODUCT_TYPE_COLORS[product.productType] ??
                                "default"
                              }
                            >
                              {t(`products.${product.productType}`, lang)}
                            </Tag>
                          </div>
                          {product.sku && (
                            <p className="text-xs text-muted-foreground">
                              SKU: {product.sku}
                            </p>
                          )}
                          {product.category && (
                            <p className="text-xs text-muted-foreground">
                              {lang === "ar"
                                ? product.category.nameAr
                                : product.category.nameEn}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="font-semibold text-foreground">
                              {formatCurrency(
                                product.unitPrice,
                                product.currency
                              )}
                            </span>
                            <Tag color={product.isActive ? "green" : "red"}>
                              {product.isActive
                                ? t("products.isActive", lang)
                                : lang === "ar"
                                  ? "غير نشط"
                                  : "Inactive"}
                            </Tag>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Grid pagination */}
                <div className="flex justify-end mt-4">
                  <Space>
                    <Button
                      disabled={pagination.page <= 1}
                      onClick={() => goToPage(pagination.page - 1)}
                    >
                      {t("products.previous", lang)}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {pagination.page} /{" "}
                      {Math.ceil(total / pagination.limit) || 1}
                    </span>
                    <Button
                      disabled={
                        pagination.page >= Math.ceil(total / pagination.limit)
                      }
                      onClick={() => goToPage(pagination.page + 1)}
                    >
                      {t("products.next", lang)}
                    </Button>
                  </Space>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Navigation */}
        <Card>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("products.quickNav", lang)}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/inventory/warehouses")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Warehouse size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t("products.stockLevels", lang)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("products.viewStockPerWarehouse", lang)}
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              onClick={() => navigate("/sales/orders")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <ShoppingCart size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t("products.relatedOrderLines", lang)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("products.salesOrdersWithProduct", lang)}
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              onClick={() => navigate("/inventory/stock-movement")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {t("products.lowStockAlert", lang)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("products.productsNeedAttention", lang)}
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </Card>

        {/* Product Form Drawer */}
        <ProductFormDrawer
          open={drawerOpen}
          editProduct={editProduct}
          onClose={closeDrawer}
          lang={lang}
          categories={categoryOptions}
        />
      </Space>
    </DashboardLayout>
  );
}
