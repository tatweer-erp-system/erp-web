import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Supplier Categories ────────────────────────────────────────────────────
  {
    key: "supplier-categories",
    label: "Supplier Categories",
    labelAr: "فئات الموردين",
    initialData: [
      {
        id: "suc1",
        name_ar: "مورد محلي",
        name_en: "Local Supplier",
        is_active: true,
      },
      {
        id: "suc2",
        name_ar: "مورد دولي",
        name_en: "International Supplier",
        is_active: true,
      },
      {
        id: "suc3",
        name_ar: "مورد مفضل",
        name_en: "Preferred Supplier",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 220 },
      { key: "name_ar", title: "Name (AR)", width: 220 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
    ],
  },

  // ── PO Statuses ────────────────────────────────────────────────────────────
  {
    key: "po-statuses",
    label: "Purchase Order Statuses",
    labelAr: "حالات أوامر الشراء",
    initialData: [
      {
        id: "pos1",
        name_ar: "مسودة",
        name_en: "Draft",
        color: "#94A3B8",
        is_terminal: false,
        order: 1,
        is_active: true,
      },
      {
        id: "pos2",
        name_ar: "معتمد",
        name_en: "Approved",
        color: "#3B82F6",
        is_terminal: false,
        order: 2,
        is_active: true,
      },
      {
        id: "pos3",
        name_ar: "مستلم",
        name_en: "Received",
        color: "#10B981",
        is_terminal: true,
        order: 3,
        is_active: true,
      },
      {
        id: "pos4",
        name_ar: "ملغى",
        name_en: "Cancelled",
        color: "#EF4444",
        is_terminal: true,
        order: 4,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 140 },
      { key: "name_ar", title: "Name (AR)", width: 140 },
      {
        key: "color",
        title: "Color",
        width: 80,
        render: (v: string) => (
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              borderRadius: 4,
              background: v,
              border: "1px solid #ccc",
            }}
          />
        ),
      },
      {
        key: "is_terminal",
        title: "Terminal",
        width: 90,
        render: (v: boolean) => (
          <Tag color={v ? "red" : "default"}>{v ? "Yes" : "No"}</Tag>
        ),
      },
      { key: "order", title: "Order", width: 70 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "color", label: "Color", type: "color", required: false },
      {
        key: "is_terminal",
        label: "Is Terminal Status",
        type: "switch",
        required: false,
      },
      {
        key: "order",
        label: "Display Order",
        type: "number",
        required: false,
        min: 1,
      },
    ],
  },

  // ── Payment Terms ──────────────────────────────────────────────────────────
  {
    key: "payment-terms",
    label: "Payment Terms",
    labelAr: "شروط الدفع",
    initialData: [
      {
        id: "ppt1",
        name_ar: "فوري",
        name_en: "Immediate",
        days_due: 0,
        penalty_percentage: 0,
        is_active: true,
      },
      {
        id: "ppt2",
        name_ar: "30 يوم",
        name_en: "Net 30",
        days_due: 30,
        penalty_percentage: 1.5,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "days_due", title: "Days Due", width: 100 },
      { key: "penalty_percentage", title: "Penalty %", width: 100 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "days_due",
        label: "Days Due",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "penalty_percentage",
        label: "Penalty Percentage (%)",
        type: "number",
        required: false,
        min: 0,
      },
    ],
  },

  // ── Rejection Reasons ──────────────────────────────────────────────────────
  {
    key: "rejection-reasons",
    label: "Rejection Reasons",
    labelAr: "أسباب الرفض",
    initialData: [
      {
        id: "rj1",
        name_ar: "جودة غير مقبولة",
        name_en: "Quality Not Acceptable",
        is_active: true,
      },
      {
        id: "rj2",
        name_ar: "سعر مرتفع",
        name_en: "Price Too High",
        is_active: true,
      },
      {
        id: "rj3",
        name_ar: "تأخر في التسليم",
        name_en: "Late Delivery",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 240 },
      { key: "name_ar", title: "Name (AR)", width: 240 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
    ],
  },

  // ── Delivery Terms ─────────────────────────────────────────────────────────
  {
    key: "delivery-terms",
    label: "Delivery Terms",
    labelAr: "شروط التسليم",
    initialData: [
      {
        id: "dlt1",
        name_ar: "تسليم في الميناء",
        name_en: "FOB (Free On Board)",
        is_active: true,
      },
      {
        id: "dlt2",
        name_ar: "تكلفة وشحن وتأمين",
        name_en: "CIF (Cost Insurance Freight)",
        is_active: true,
      },
      {
        id: "dlt3",
        name_ar: "تسليم موقع المشتري",
        name_en: "DDP (Delivered Duty Paid)",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 240 },
      { key: "name_ar", title: "Name (AR)", width: 240 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
    ],
  },

  // ── Approval Levels ────────────────────────────────────────────────────────
  {
    key: "approval-levels",
    label: "Approval Levels",
    labelAr: "مستويات الاعتماد",
    initialData: [
      {
        id: "al1",
        name_ar: "مدير قسم",
        name_en: "Department Manager",
        min_amount: 0,
        max_amount: 10000,
        approver_role: "Manager",
        is_active: true,
      },
      {
        id: "al2",
        name_ar: "مدير مالي",
        name_en: "Finance Director",
        min_amount: 10001,
        max_amount: 100000,
        approver_role: "Finance Director",
        is_active: true,
      },
      {
        id: "al3",
        name_ar: "الرئيس التنفيذي",
        name_en: "CEO",
        min_amount: 100001,
        max_amount: 9999999,
        approver_role: "CEO",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      {
        key: "min_amount",
        title: "Min Amount",
        width: 110,
        render: (v: number) => v?.toLocaleString(),
      },
      {
        key: "max_amount",
        title: "Max Amount",
        width: 110,
        render: (v: number) => v?.toLocaleString(),
      },
      { key: "approver_role", title: "Approver Role", width: 150 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "min_amount",
        label: "Min Amount",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "max_amount",
        label: "Max Amount",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "approver_role",
        label: "Approver Role",
        type: "text",
        required: true,
      },
    ],
  },

  // ── Landed Cost Types ──────────────────────────────────────────────────────
  {
    key: "landed-cost-types",
    label: "Landed Cost Types",
    labelAr: "أنواع التكاليف الإضافية",
    initialData: [
      {
        id: "lc1",
        name_ar: "شحن",
        name_en: "Freight",
        type: "freight",
        allocation_method: "By Weight",
        is_active: true,
      },
      {
        id: "lc2",
        name_ar: "جمارك",
        name_en: "Customs",
        type: "customs",
        allocation_method: "By Value",
        is_active: true,
      },
      {
        id: "lc3",
        name_ar: "تأمين",
        name_en: "Insurance",
        type: "insurance",
        allocation_method: "By Value",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 150 },
      { key: "name_ar", title: "Name (AR)", width: 150 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
      { key: "allocation_method", title: "Allocation Method", width: 160 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
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
          { value: "freight", label: "Freight" },
          { value: "customs", label: "Customs" },
          { value: "insurance", label: "Insurance" },
        ],
      },
      {
        key: "allocation_method",
        label: "Allocation Method",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Receiving Statuses ─────────────────────────────────────────────────────
  {
    key: "receiving-statuses",
    label: "Receiving Statuses",
    labelAr: "حالات الاستلام",
    initialData: [
      {
        id: "rs1",
        name_ar: "في الانتظار",
        name_en: "Pending",
        color: "#F59E0B",
        is_active: true,
      },
      {
        id: "rs2",
        name_ar: "مستلم جزئياً",
        name_en: "Partially Received",
        color: "#3B82F6",
        is_active: true,
      },
      {
        id: "rs3",
        name_ar: "مستلم بالكامل",
        name_en: "Fully Received",
        color: "#10B981",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      {
        key: "color",
        title: "Color",
        width: 80,
        render: (v: string) => (
          <span
            style={{
              display: "inline-block",
              width: 20,
              height: 20,
              borderRadius: 4,
              background: v,
              border: "1px solid #ccc",
            }}
          />
        ),
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "color", label: "Color", type: "color", required: false },
    ],
  },
];

export default function PurchasesDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Purchases Definitions"
      moduleNameAr="التعريفات — المشتريات"
      tabs={tabs}
    />
  );
}
