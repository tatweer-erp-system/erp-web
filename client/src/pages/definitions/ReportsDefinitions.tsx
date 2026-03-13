import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Report Categories ──────────────────────────────────────────────────────
  {
    key: "report-categories",
    label: "Report Categories",
    labelAr: "فئات التقارير",
    initialData: [
      {
        id: "rc1",
        nameAr: "تقارير المبيعات",
        nameEn: "Sales Reports",
        icon: "📊",
        isActive: true,
      },
      {
        id: "rc2",
        nameAr: "تقارير المالية",
        nameEn: "Financial Reports",
        icon: "💰",
        isActive: true,
      },
      {
        id: "rc3",
        nameAr: "تقارير المخزون",
        nameEn: "Inventory Reports",
        icon: "📦",
        isActive: true,
      },
      {
        id: "rc4",
        nameAr: "تقارير الموارد البشرية",
        nameEn: "HR Reports",
        icon: "👥",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      { key: "icon", title: "Icon", width: 70 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "icon",
        label: "Icon (emoji or URL)",
        type: "text",
        required: false,
      },
    ],
  },

  // ── KPI Definitions ────────────────────────────────────────────────────────
  {
    key: "kpi-definitions",
    label: "KPI Definitions",
    labelAr: "تعريفات مؤشرات الأداء",
    initialData: [
      {
        id: "kpi1",
        nameAr: "معدل تحويل المبيعات",
        nameEn: "Sales Conversion Rate",
        formula: "(Closed Deals / Total Leads) * 100",
        unit: "%",
        target_value: 25,
        module: "Sales",
        isActive: true,
      },
      {
        id: "kpi2",
        nameAr: "متوسط قيمة الطلب",
        nameEn: "Average Order Value",
        formula: "Total Revenue / Number of Orders",
        unit: "USD",
        target_value: 500,
        module: "Sales",
        isActive: true,
      },
      {
        id: "kpi3",
        nameAr: "معدل دوران المخزون",
        nameEn: "Inventory Turnover Rate",
        formula: "COGS / Average Inventory",
        unit: "times/year",
        target_value: 12,
        module: "Inventory",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      { key: "unit", title: "Unit", width: 100 },
      { key: "target_value", title: "Target", width: 90 },
      {
        key: "module",
        title: "Module",
        width: 110,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "formula",
        label: "Formula / Description",
        type: "textarea",
        required: false,
      },
      {
        key: "unit",
        label: "Unit (e.g. %, USD, times)",
        type: "text",
        required: false,
      },
      {
        key: "target_value",
        label: "Target Value",
        type: "number",
        required: false,
        min: 0,
      },
      {
        key: "module",
        label: "Module",
        type: "select",
        required: false,
        options: [
          { value: "Sales", label: "Sales" },
          { value: "Purchases", label: "Purchases" },
          { value: "Inventory", label: "Inventory" },
          { value: "Accounting", label: "Accounting" },
          { value: "Treasury", label: "Treasury" },
          { value: "HR", label: "HR" },
        ],
      },
    ],
  },

  // ── Dashboard Widgets ──────────────────────────────────────────────────────
  {
    key: "dashboard-widgets",
    label: "Dashboard Widgets",
    labelAr: "عناصر لوحة التحكم",
    initialData: [
      {
        id: "dw1",
        nameAr: "مبيعات اليوم",
        nameEn: "Today's Sales",
        type: "counter",
        data_source: "sales_orders",
        isActive: true,
      },
      {
        id: "dw2",
        nameAr: "أفضل المنتجات",
        nameEn: "Top Products",
        type: "chart",
        data_source: "product_sales",
        isActive: true,
      },
      {
        id: "dw3",
        nameAr: "حالة المخزون",
        nameEn: "Inventory Status",
        type: "table",
        data_source: "inventory_levels",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      {
        key: "type",
        title: "Widget Type",
        width: 110,
        render: (v: string) => {
          const colors: Record<string, string> = {
            chart: "blue",
            table: "green",
            counter: "orange",
          };
          return <Tag color={colors[v] ?? "default"}>{v}</Tag>;
        },
      },
      { key: "data_source", title: "Data Source", width: 160 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "type",
        label: "Widget Type",
        type: "select",
        required: true,
        options: [
          { value: "chart", label: "Chart" },
          { value: "table", label: "Table" },
          { value: "counter", label: "Counter" },
        ],
      },
      {
        key: "data_source",
        label: "Data Source",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Scheduled Reports ──────────────────────────────────────────────────────
  {
    key: "scheduled-reports",
    label: "Scheduled Reports",
    labelAr: "التقارير المجدولة",
    initialData: [
      {
        id: "sr1",
        nameAr: "تقرير المبيعات اليومي",
        nameEn: "Daily Sales Report",
        frequency: "daily",
        recipients: "management@company.com",
        format: "PDF",
        isActive: true,
      },
      {
        id: "sr2",
        nameAr: "ملخص المخزون الأسبوعي",
        nameEn: "Weekly Inventory Summary",
        frequency: "weekly",
        recipients: "warehouse@company.com",
        format: "Excel",
        isActive: true,
      },
      {
        id: "sr3",
        nameAr: "التقرير المالي الشهري",
        nameEn: "Monthly Financial Report",
        frequency: "monthly",
        recipients: "cfo@company.com",
        format: "PDF",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "frequency",
        title: "Frequency",
        width: 100,
        render: (v: string) => <Tag color="cyan">{v}</Tag>,
      },
      {
        key: "format",
        title: "Format",
        width: 90,
        render: (v: string) => (
          <Tag color={v === "PDF" ? "red" : "green"}>{v}</Tag>
        ),
      },
      {
        key: "recipients",
        title: "Recipients",
        width: 200,
        render: (v: string) => (
          <span style={{ fontSize: 12, color: "#666" }}>{v}</span>
        ),
      },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "frequency",
        label: "Frequency",
        type: "select",
        required: true,
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" },
        ],
      },
      {
        key: "recipients",
        label: "Recipients (emails)",
        type: "text",
        required: false,
      },
      {
        key: "format",
        label: "Export Format",
        type: "select",
        required: true,
        options: [
          { value: "PDF", label: "PDF" },
          { value: "Excel", label: "Excel" },
        ],
      },
    ],
  },

  // ── Export Templates ───────────────────────────────────────────────────────
  {
    key: "export-templates",
    label: "Export Templates",
    labelAr: "قوالب التصدير",
    initialData: [
      {
        id: "et1",
        nameAr: "قالب فاتورة المبيعات",
        nameEn: "Sales Invoice Template",
        module: "Sales",
        format: "PDF",
        columns_config: "id, date, customer, total",
        isActive: true,
      },
      {
        id: "et2",
        nameAr: "قالب تقرير المخزون",
        nameEn: "Inventory Report Template",
        module: "Inventory",
        format: "Excel",
        columns_config: "sku, name, qty, value",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "module",
        title: "Module",
        width: 110,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
      {
        key: "format",
        title: "Format",
        width: 90,
        render: (v: string) => (
          <Tag color={v === "PDF" ? "red" : "green"}>{v}</Tag>
        ),
      },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "module",
        label: "Module",
        type: "select",
        required: true,
        options: [
          { value: "Sales", label: "Sales" },
          { value: "Purchases", label: "Purchases" },
          { value: "Inventory", label: "Inventory" },
          { value: "Accounting", label: "Accounting" },
          { value: "Treasury", label: "Treasury" },
          { value: "HR", label: "HR" },
        ],
      },
      {
        key: "format",
        label: "Export Format",
        type: "select",
        required: true,
        options: [
          { value: "PDF", label: "PDF" },
          { value: "Excel", label: "Excel" },
        ],
      },
      {
        key: "columns_config",
        label: "Columns Configuration",
        type: "textarea",
        required: false,
      },
    ],
  },
];

export default function ReportsDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Reports Definitions"
      moduleNameAr="التعريفات — التقارير"
      tabs={tabs}
    />
  );
}
