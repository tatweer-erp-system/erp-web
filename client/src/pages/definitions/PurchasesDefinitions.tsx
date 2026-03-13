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
        nameAr: "مورد محلي",
        nameEn: "Local Supplier",
        isActive: true,
      },
      {
        id: "suc2",
        nameAr: "مورد دولي",
        nameEn: "International Supplier",
        isActive: true,
      },
      {
        id: "suc3",
        nameAr: "مورد مفضل",
        nameEn: "Preferred Supplier",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 220 },
      { key: "nameAr", title: "Name (AR)", width: 220 },
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

  // ── PO Statuses ────────────────────────────────────────────────────────────
  {
    key: "po-statuses",
    label: "Purchase Order Statuses",
    labelAr: "حالات أوامر الشراء",
    initialData: [
      {
        id: "pos1",
        nameAr: "مسودة",
        nameEn: "Draft",
        color: "#94A3B8",
        is_terminal: false,
        order: 1,
        isActive: true,
      },
      {
        id: "pos2",
        nameAr: "معتمد",
        nameEn: "Approved",
        color: "#3B82F6",
        is_terminal: false,
        order: 2,
        isActive: true,
      },
      {
        id: "pos3",
        nameAr: "مستلم",
        nameEn: "Received",
        color: "#10B981",
        is_terminal: true,
        order: 3,
        isActive: true,
      },
      {
        id: "pos4",
        nameAr: "ملغى",
        nameEn: "Cancelled",
        color: "#EF4444",
        is_terminal: true,
        order: 4,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 140 },
      { key: "nameAr", title: "Name (AR)", width: 140 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "فوري",
        nameEn: "Immediate",
        days_due: 0,
        penalty_percentage: 0,
        isActive: true,
      },
      {
        id: "ppt2",
        nameAr: "30 يوم",
        nameEn: "Net 30",
        days_due: 30,
        penalty_percentage: 1.5,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "days_due", title: "Days Due", width: 100 },
      { key: "penalty_percentage", title: "Penalty %", width: 100 },
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
        nameAr: "جودة غير مقبولة",
        nameEn: "Quality Not Acceptable",
        isActive: true,
      },
      {
        id: "rj2",
        nameAr: "سعر مرتفع",
        nameEn: "Price Too High",
        isActive: true,
      },
      {
        id: "rj3",
        nameAr: "تأخر في التسليم",
        nameEn: "Late Delivery",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 240 },
      { key: "nameAr", title: "Name (AR)", width: 240 },
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

  // ── Delivery Terms ─────────────────────────────────────────────────────────
  {
    key: "delivery-terms",
    label: "Delivery Terms",
    labelAr: "شروط التسليم",
    initialData: [
      {
        id: "dlt1",
        nameAr: "تسليم في الميناء",
        nameEn: "FOB (Free On Board)",
        isActive: true,
      },
      {
        id: "dlt2",
        nameAr: "تكلفة وشحن وتأمين",
        nameEn: "CIF (Cost Insurance Freight)",
        isActive: true,
      },
      {
        id: "dlt3",
        nameAr: "تسليم موقع المشتري",
        nameEn: "DDP (Delivered Duty Paid)",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 240 },
      { key: "nameAr", title: "Name (AR)", width: 240 },
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

  // ── Approval Levels ────────────────────────────────────────────────────────
  {
    key: "approval-levels",
    label: "Approval Levels",
    labelAr: "مستويات الاعتماد",
    initialData: [
      {
        id: "al1",
        nameAr: "مدير قسم",
        nameEn: "Department Manager",
        min_amount: 0,
        max_amount: 10000,
        approver_role: "Manager",
        isActive: true,
      },
      {
        id: "al2",
        nameAr: "مدير مالي",
        nameEn: "Finance Director",
        min_amount: 10001,
        max_amount: 100000,
        approver_role: "Finance Director",
        isActive: true,
      },
      {
        id: "al3",
        nameAr: "الرئيس التنفيذي",
        nameEn: "CEO",
        min_amount: 100001,
        max_amount: 9999999,
        approver_role: "CEO",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "شحن",
        nameEn: "Freight",
        type: "freight",
        allocation_method: "By Weight",
        isActive: true,
      },
      {
        id: "lc2",
        nameAr: "جمارك",
        nameEn: "Customs",
        type: "customs",
        allocation_method: "By Value",
        isActive: true,
      },
      {
        id: "lc3",
        nameAr: "تأمين",
        nameEn: "Insurance",
        type: "insurance",
        allocation_method: "By Value",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 150 },
      { key: "nameAr", title: "Name (AR)", width: 150 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
      { key: "allocation_method", title: "Allocation Method", width: 160 },
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
        nameAr: "في الانتظار",
        nameEn: "Pending",
        color: "#F59E0B",
        isActive: true,
      },
      {
        id: "rs2",
        nameAr: "مستلم جزئياً",
        nameEn: "Partially Received",
        color: "#3B82F6",
        isActive: true,
      },
      {
        id: "rs3",
        nameAr: "مستلم بالكامل",
        nameEn: "Fully Received",
        color: "#10B981",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
