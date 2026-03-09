import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Units of Measure ───────────────────────────────────────────────────────
  {
    key: "uom",
    label: "Units of Measure",
    labelAr: "وحدات القياس",
    initialData: [
      { id: "uom1", name_ar: "كيلوجرام", name_en: "Kilogram", symbol: "kg", type: "weight", is_active: true },
      { id: "uom2", name_ar: "متر", name_en: "Meter", symbol: "m", type: "length", is_active: true },
      { id: "uom3", name_ar: "لتر", name_en: "Liter", symbol: "L", type: "volume", is_active: true },
      { id: "uom4", name_ar: "قطعة", name_en: "Piece", symbol: "pcs", type: "unit", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "symbol", title: "Symbol", width: 80 },
      {
        key: "type",
        title: "Type",
        width: 100,
        render: (val: string) => {
          const colors: Record<string, string> = { weight: "blue", length: "green", volume: "cyan", unit: "purple" };
          return <Tag color={colors[val] ?? "default"}>{val}</Tag>;
        },
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "symbol", label: "Symbol", type: "text", required: true },
      {
        key: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "length", label: "Length" },
          { value: "weight", label: "Weight" },
          { value: "volume", label: "Volume" },
          { value: "unit", label: "Unit" },
        ],
      },
    ],
  },

  // ── Product Categories ─────────────────────────────────────────────────────
  {
    key: "product-categories",
    label: "Product Categories",
    labelAr: "فئات المنتجات",
    initialData: [
      { id: "pc1", name_ar: "إلكترونيات", name_en: "Electronics", parent_category: "", icon: "💻", is_active: true },
      { id: "pc2", name_ar: "ملابس", name_en: "Clothing", parent_category: "", icon: "👕", is_active: true },
      { id: "pc3", name_ar: "أغذية", name_en: "Food & Beverages", parent_category: "", icon: "🍎", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "icon", title: "Icon", width: 60 },
      { key: "parent_category", title: "Parent Category", width: 150 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "parent_category", label: "Parent Category", type: "text", required: false },
      { key: "icon", label: "Icon (emoji or URL)", type: "text", required: false },
    ],
  },

  // ── Product Brands ─────────────────────────────────────────────────────────
  {
    key: "brands",
    label: "Product Brands",
    labelAr: "العلامات التجارية",
    initialData: [
      { id: "br1", name_ar: "سامسونج", name_en: "Samsung", logo: "", is_active: true },
      { id: "br2", name_ar: "أبل", name_en: "Apple", logo: "", is_active: true },
      { id: "br3", name_ar: "سوني", name_en: "Sony", logo: "", is_active: false },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "logo", title: "Logo URL", width: 200 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "logo", label: "Logo URL", type: "text", required: false },
    ],
  },

  // ── Warehouses ─────────────────────────────────────────────────────────────
  {
    key: "warehouses",
    label: "Warehouses",
    labelAr: "المستودعات",
    initialData: [
      { id: "wh1", name_ar: "المستودع الرئيسي", name_en: "Main Warehouse", location: "Cairo", manager: "Ahmed Ali", branch: "Main Branch", is_active: true },
      { id: "wh2", name_ar: "مستودع دبي", name_en: "Dubai Warehouse", location: "Dubai", manager: "Sara Hassan", branch: "Dubai Branch", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "location", title: "Location", width: 120 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "branch", title: "Branch", width: 140 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "location", label: "Location", type: "text", required: true },
      { key: "manager", label: "Manager", type: "text", required: false },
      { key: "branch", label: "Branch", type: "text", required: false },
    ],
  },

  // ── Storage Locations ──────────────────────────────────────────────────────
  {
    key: "storage-locations",
    label: "Storage Locations",
    labelAr: "مواقع التخزين",
    initialData: [
      { id: "sl1", name_ar: "الممر أ-1-001", name_en: "Aisle A-1-001", warehouse: "Main Warehouse", aisle: "A", shelf: "1", bin: "001", is_active: true },
      { id: "sl2", name_ar: "الممر ب-2-005", name_en: "Aisle B-2-005", warehouse: "Main Warehouse", aisle: "B", shelf: "2", bin: "005", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "warehouse", title: "Warehouse", width: 150 },
      { key: "aisle", title: "Aisle", width: 80 },
      { key: "shelf", title: "Shelf", width: 80 },
      { key: "bin", title: "Bin", width: 80 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      { key: "aisle", label: "Aisle", type: "text", required: false },
      { key: "shelf", label: "Shelf", type: "text", required: false },
      { key: "bin", label: "Bin", type: "text", required: false },
    ],
  },

  // ── Adjustment Reasons ─────────────────────────────────────────────────────
  {
    key: "adjustment-reasons",
    label: "Adjustment Reasons",
    labelAr: "أسباب التسوية",
    initialData: [
      { id: "ar1", name_ar: "تلف", name_en: "Damage", type: "decrease", is_active: true },
      { id: "ar2", name_ar: "عد مادي", name_en: "Physical Count", type: "increase", is_active: true },
      { id: "ar3", name_ar: "سرقة", name_en: "Theft", type: "decrease", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (val: string) => (
          <Tag color={val === "increase" ? "success" : "error"}>{val}</Tag>
        ),
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      {
        key: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "increase", label: "Increase" },
          { value: "decrease", label: "Decrease" },
        ],
      },
    ],
  },

  // ── Item Conditions ────────────────────────────────────────────────────────
  {
    key: "item-conditions",
    label: "Item Conditions",
    labelAr: "حالات الأصناف",
    initialData: [
      { id: "ic1", name_ar: "جديد", name_en: "New", is_active: true },
      { id: "ic2", name_ar: "مستعمل", name_en: "Used", is_active: true },
      { id: "ic3", name_ar: "تالف", name_en: "Damaged", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
    ],
  },

  // ── Reorder Rules ──────────────────────────────────────────────────────────
  {
    key: "reorder-rules",
    label: "Reorder Rules",
    labelAr: "قواعد إعادة الطلب",
    initialData: [
      { id: "rr1", name_ar: "قاعدة اللابتوب", name_en: "Laptop Rule", product: "Laptop", warehouse: "Main Warehouse", min_qty: 5, reorder_qty: 20, is_active: true },
      { id: "rr2", name_ar: "قاعدة الهاتف", name_en: "Phone Rule", product: "Mobile Phone", warehouse: "Dubai Warehouse", min_qty: 10, reorder_qty: 50, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "product", title: "Product", width: 150 },
      { key: "warehouse", title: "Warehouse", width: 150 },
      { key: "min_qty", title: "Min Qty", width: 90 },
      { key: "reorder_qty", title: "Reorder Qty", width: 110 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "product", label: "Product", type: "text", required: true },
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      { key: "min_qty", label: "Min Quantity", type: "number", required: true, min: 0 },
      { key: "reorder_qty", label: "Reorder Quantity", type: "number", required: true, min: 1 },
    ],
  },
];

export default function InventoryDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Inventory Definitions"
      moduleNameAr="التعريفات — المخزون"
      tabs={tabs}
      formDesign={1}
    />
  );
}
