import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import {
  unitsOfMeasureService,
  adjustmentReasonsService,
} from "@/services/definitions.service";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Units of Measure ───────────────────────────────────────────────────────
  {
    key: "uom",
    label: "Units of Measure",
    labelAr: "وحدات القياس",
    service: unitsOfMeasureService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "symbol", title: "Symbol", width: 80 },
      {
        key: "uomType",
        title: "Type",
        width: 100,
        render: (val: string) => {
          const colors: Record<string, string> = {
            weight: "blue",
            length: "green",
            volume: "cyan",
            unit: "purple",
            time: "orange",
          };
          return <Tag color={colors[val] ?? "default"}>{val}</Tag>;
        },
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
      { key: "symbol", label: "Symbol", type: "text", required: true },
      {
        key: "uomType",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "unit", label: "Unit" },
          { value: "weight", label: "Weight" },
          { value: "volume", label: "Volume" },
          { value: "length", label: "Length" },
          { value: "time", label: "Time" },
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
      {
        id: "pc1",
        nameAr: "إلكترونيات",
        nameEn: "Electronics",
        parent_category: "",
        icon: "💻",
        isActive: true,
      },
      {
        id: "pc2",
        nameAr: "ملابس",
        nameEn: "Clothing",
        parent_category: "",
        icon: "👕",
        isActive: true,
      },
      {
        id: "pc3",
        nameAr: "أغذية",
        nameEn: "Food & Beverages",
        parent_category: "",
        icon: "🍎",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "icon", title: "Icon", width: 60 },
      { key: "parent_category", title: "Parent Category", width: 150 },
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
        key: "parent_category",
        label: "Parent Category",
        type: "text",
        required: false,
      },
      {
        key: "icon",
        label: "Icon (emoji or URL)",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Product Brands ─────────────────────────────────────────────────────────
  {
    key: "brands",
    label: "Product Brands",
    labelAr: "العلامات التجارية",
    initialData: [
      {
        id: "br1",
        nameAr: "سامسونج",
        nameEn: "Samsung",
        logo: "",
        isActive: true,
      },
      {
        id: "br2",
        nameAr: "أبل",
        nameEn: "Apple",
        logo: "",
        isActive: true,
      },
      {
        id: "br3",
        nameAr: "سوني",
        nameEn: "Sony",
        logo: "",
        isActive: false,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "logo", title: "Logo URL", width: 200 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "logo", label: "Logo URL", type: "text", required: false },
    ],
  },

  // ── Warehouses ─────────────────────────────────────────────────────────────
  {
    key: "warehouses",
    label: "Warehouses",
    labelAr: "المستودعات",
    initialData: [
      {
        id: "wh1",
        nameAr: "المستودع الرئيسي",
        nameEn: "Main Warehouse",
        location: "Cairo",
        manager: "Ahmed Ali",
        branch: "Main Branch",
        isActive: true,
      },
      {
        id: "wh2",
        nameAr: "مستودع دبي",
        nameEn: "Dubai Warehouse",
        location: "Dubai",
        manager: "Sara Hassan",
        branch: "Dubai Branch",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "location", title: "Location", width: 120 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "branch", title: "Branch", width: 140 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
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
      {
        id: "sl1",
        nameAr: "الممر أ-1-001",
        nameEn: "Aisle A-1-001",
        warehouse: "Main Warehouse",
        aisle: "A",
        shelf: "1",
        bin: "001",
        isActive: true,
      },
      {
        id: "sl2",
        nameAr: "الممر ب-2-005",
        nameEn: "Aisle B-2-005",
        warehouse: "Main Warehouse",
        aisle: "B",
        shelf: "2",
        bin: "005",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "warehouse", title: "Warehouse", width: 150 },
      { key: "aisle", title: "Aisle", width: 80 },
      { key: "shelf", title: "Shelf", width: 80 },
      { key: "bin", title: "Bin", width: 80 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
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
    service: adjustmentReasonsService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
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
      { id: "ic1", nameAr: "جديد", nameEn: "New", isActive: true },
      { id: "ic2", nameAr: "مستعمل", nameEn: "Used", isActive: true },
      { id: "ic3", nameAr: "تالف", nameEn: "Damaged", isActive: true },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
    ],
  },

  // ── Reorder Rules ──────────────────────────────────────────────────────────
  {
    key: "reorder-rules",
    label: "Reorder Rules",
    labelAr: "قواعد إعادة الطلب",
    initialData: [
      {
        id: "rr1",
        nameAr: "قاعدة اللابتوب",
        nameEn: "Laptop Rule",
        product: "Laptop",
        warehouse: "Main Warehouse",
        min_qty: 5,
        reorder_qty: 20,
        isActive: true,
      },
      {
        id: "rr2",
        nameAr: "قاعدة الهاتف",
        nameEn: "Phone Rule",
        product: "Mobile Phone",
        warehouse: "Dubai Warehouse",
        min_qty: 10,
        reorder_qty: 50,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "product", title: "Product", width: 150 },
      { key: "warehouse", title: "Warehouse", width: 150 },
      { key: "min_qty", title: "Min Qty", width: 90 },
      { key: "reorder_qty", title: "Reorder Qty", width: 110 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "product", label: "Product", type: "text", required: true },
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      {
        key: "min_qty",
        label: "Min Quantity",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "reorder_qty",
        label: "Reorder Quantity",
        type: "number",
        required: true,
        min: 1,
      },
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
