import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

// ── POS Terminals ──────────────────────────────────────────────────────────────
const terminalsTab: TabDef = {
  key: "pos-terminals",
  label: "POS Terminals",
  labelAr: "أجهزة نقاط البيع",
  initialData: [
    {
      id: "t1",
      nameEn: "Main Counter",
      nameAr: "الكاونتر الرئيسي",
      branch: "Main Branch",
      printer: "Epson TM-T88VI",
      terminal_id: "POS-001",
      isActive: true,
    },
    {
      id: "t2",
      nameEn: "Express Lane",
      nameAr: "الخط السريع",
      branch: "Main Branch",
      printer: "Star TSP100",
      terminal_id: "POS-002",
      isActive: true,
    },
    {
      id: "t3",
      nameEn: "Customer Service",
      nameAr: "خدمة العملاء",
      branch: "Downtown Branch",
      printer: "Epson TM-T88VI",
      terminal_id: "POS-003",
      isActive: true,
    },
    {
      id: "t4",
      nameEn: "Warehouse POS",
      nameAr: "مستودع",
      branch: "Warehouse",
      printer: "None",
      terminal_id: "POS-004",
      isActive: false,
    },
  ],
  columns: [
    { key: "terminal_id", title: "Terminal ID", width: 110 },
    { key: "nameEn", title: "Name (EN)", width: 160 },
    { key: "nameAr", title: "Name (AR)", width: 160 },
    { key: "branch", title: "Branch", width: 140 },
    { key: "printer", title: "Printer", width: 160 },
  ],
  fields: [
    {
      key: "terminal_id",
      label: "Terminal ID",
      type: "text",
      required: true,
      hint: "Unique identifier, e.g. POS-001",
    },
    { key: "nameEn", label: "Name (English)", type: "text", required: true },
    {
      key: "nameAr",
      label: "Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    { key: "branch", label: "Branch", type: "text", required: true },
    {
      key: "printer",
      label: "Receipt Printer",
      type: "text",
      required: false,
      hint: "Printer model or 'None'",
    },
  ],
};

// ── Product Categories ─────────────────────────────────────────────────────────
const categoriesTab: TabDef = {
  key: "pos-categories",
  label: "Product Categories",
  labelAr: "فئات المنتجات",
  initialData: [
    {
      id: "pc1",
      nameEn: "Electronics",
      nameAr: "إلكترونيات",
      color: "#3B82F6",
      sort_order: 1,
      isActive: true,
    },
    {
      id: "pc2",
      nameEn: "Food",
      nameAr: "أغذية",
      color: "#10B981",
      sort_order: 2,
      isActive: true,
    },
    {
      id: "pc3",
      nameEn: "Clothing",
      nameAr: "ملابس",
      color: "#A855F7",
      sort_order: 3,
      isActive: true,
    },
    {
      id: "pc4",
      nameEn: "Home & Garden",
      nameAr: "المنزل والحديقة",
      color: "#F97316",
      sort_order: 4,
      isActive: true,
    },
    {
      id: "pc5",
      nameEn: "Sports",
      nameAr: "رياضة",
      color: "#F43F5E",
      sort_order: 5,
      isActive: true,
    },
    {
      id: "pc6",
      nameEn: "Beauty",
      nameAr: "جمال وعناية",
      color: "#EC4899",
      sort_order: 6,
      isActive: true,
    },
    {
      id: "pc7",
      nameEn: "Books",
      nameAr: "كتب",
      color: "#6366F1",
      sort_order: 7,
      isActive: false,
    },
  ],
  columns: [
    {
      key: "nameEn",
      title: "Name (EN)",
      width: 160,
      render: (v: string, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: row.color as string,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ),
    },
    { key: "nameAr", title: "Name (AR)", width: 160 },
    { key: "sort_order", title: "Sort Order", width: 100 },
    {
      key: "color",
      title: "Color",
      width: 70,
      render: (v: string) => (
        <span
          style={{
            display: "inline-block",
            width: 22,
            height: 22,
            borderRadius: 6,
            background: v,
            border: "1px solid rgba(0,0,0,0.12)",
            verticalAlign: "middle",
          }}
        />
      ),
    },
  ],
  fields: [
    {
      key: "nameEn",
      label: "Category Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "nameAr",
      label: "Category Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    { key: "color", label: "Display Color", type: "color", required: false },
    {
      key: "sort_order",
      label: "Sort Order",
      type: "number",
      required: false,
      min: 1,
    },
  ],
};

// ── Payment Methods ────────────────────────────────────────────────────────────
const paymentMethodsTab: TabDef = {
  key: "payment-methods",
  label: "Payment Methods",
  labelAr: "طرق الدفع",
  initialData: [
    {
      id: "pm1",
      nameEn: "Cash",
      nameAr: "نقدي",
      type: "cash",
      requires_change: true,
      sort_order: 1,
      isActive: true,
    },
    {
      id: "pm2",
      nameEn: "Visa / Debit",
      nameAr: "بطاقة فيزا",
      type: "card",
      requires_change: false,
      sort_order: 2,
      isActive: true,
    },
    {
      id: "pm3",
      nameEn: "Mastercard",
      nameAr: "ماستر كارد",
      type: "card",
      requires_change: false,
      sort_order: 3,
      isActive: true,
    },
    {
      id: "pm4",
      nameEn: "Mobile Wallet",
      nameAr: "محفظة إلكترونية",
      type: "wallet",
      requires_change: false,
      sort_order: 4,
      isActive: true,
    },
    {
      id: "pm5",
      nameEn: "Bank Transfer",
      nameAr: "تحويل بنكي",
      type: "bank",
      requires_change: false,
      sort_order: 5,
      isActive: true,
    },
    {
      id: "pm6",
      nameEn: "Store Credit",
      nameAr: "رصيد المحل",
      type: "credit",
      requires_change: false,
      sort_order: 6,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Name (EN)", width: 160 },
    { key: "nameAr", title: "Name (AR)", width: 160 },
    {
      key: "type",
      title: "Type",
      width: 100,
      render: (v: string) => {
        const map: Record<string, string> = {
          cash: "green",
          card: "blue",
          wallet: "purple",
          bank: "cyan",
          credit: "orange",
        };
        return (
          <Tag
            color={map[v] ?? "default"}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            {v}
          </Tag>
        );
      },
    },
    {
      key: "requires_change",
      title: "Change",
      width: 90,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>
      ),
    },
    { key: "sort_order", title: "Order", width: 70 },
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
      label: "Payment Type",
      type: "select",
      required: true,
      options: [
        { value: "cash", label: "Cash" },
        { value: "card", label: "Card (Visa / Debit / Credit)" },
        { value: "wallet", label: "Digital Wallet" },
        { value: "bank", label: "Bank Transfer" },
        { value: "credit", label: "Store Credit" },
      ],
    },
    {
      key: "requires_change",
      label: "Requires Change Calculation",
      type: "switch",
      required: false,
    },
    {
      key: "sort_order",
      label: "Sort Order",
      type: "number",
      required: false,
      min: 1,
    },
  ],
};

// ── Discount Reasons ───────────────────────────────────────────────────────────
const discountReasonsTab: TabDef = {
  key: "discount-reasons",
  label: "Discount Reasons",
  labelAr: "أسباب الخصم",
  initialData: [
    {
      id: "dr1",
      nameEn: "Loyalty Reward",
      nameAr: "مكافأة ولاء",
      requires_approval: false,
      max_percent: 100,
      isActive: true,
    },
    {
      id: "dr2",
      nameEn: "Employee Discount",
      nameAr: "خصم موظف",
      requires_approval: false,
      max_percent: 30,
      isActive: true,
    },
    {
      id: "dr3",
      nameEn: "Damaged Item",
      nameAr: "منتج تالف",
      requires_approval: true,
      max_percent: 50,
      isActive: true,
    },
    {
      id: "dr4",
      nameEn: "Promotional Event",
      nameAr: "حدث ترويجي",
      requires_approval: false,
      max_percent: 25,
      isActive: true,
    },
    {
      id: "dr5",
      nameEn: "Manager Discretion",
      nameAr: "تقدير المدير",
      requires_approval: true,
      max_percent: 100,
      isActive: true,
    },
    {
      id: "dr6",
      nameEn: "Clearance Sale",
      nameAr: "تصفية المخزون",
      requires_approval: true,
      max_percent: 70,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Reason (EN)", width: 180 },
    { key: "nameAr", title: "Reason (AR)", width: 180 },
    {
      key: "max_percent",
      title: "Max %",
      width: 80,
      render: (v: number) => `${v}%`,
    },
    {
      key: "requires_approval",
      title: "Manager Approval",
      width: 140,
      render: (v: boolean) => (
        <Tag color={v ? "warning" : "default"}>
          {v ? "Required" : "Not Required"}
        </Tag>
      ),
    },
  ],
  fields: [
    { key: "nameEn", label: "Reason (English)", type: "text", required: true },
    {
      key: "nameAr",
      label: "Reason (Arabic) / السبب بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "max_percent",
      label: "Max Discount %",
      type: "number",
      required: false,
      min: 0,
      max: 100,
    },
    {
      key: "requires_approval",
      label: "Requires Manager Approval",
      type: "switch",
      required: false,
    },
  ],
};

// ── Void / Refund Reasons ──────────────────────────────────────────────────────
const voidReasonsTab: TabDef = {
  key: "void-reasons",
  label: "Void / Refund Reasons",
  labelAr: "أسباب الإلغاء والاسترداد",
  initialData: [
    {
      id: "vr1",
      nameEn: "Customer Changed Mind",
      nameAr: "تغيير رأي العميل",
      type: "both",
      requires_manager: false,
      isActive: true,
    },
    {
      id: "vr2",
      nameEn: "Incorrect Item Scanned",
      nameAr: "خطأ في المسح",
      type: "void",
      requires_manager: false,
      isActive: true,
    },
    {
      id: "vr3",
      nameEn: "Defective Product",
      nameAr: "منتج معيب",
      type: "refund",
      requires_manager: true,
      isActive: true,
    },
    {
      id: "vr4",
      nameEn: "Duplicate Transaction",
      nameAr: "معاملة مكررة",
      type: "void",
      requires_manager: true,
      isActive: true,
    },
    {
      id: "vr5",
      nameEn: "Wrong Price Charged",
      nameAr: "خطأ في السعر",
      type: "refund",
      requires_manager: true,
      isActive: true,
    },
    {
      id: "vr6",
      nameEn: "Payment Issue",
      nameAr: "مشكلة في الدفع",
      type: "void",
      requires_manager: false,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Reason (EN)", width: 200 },
    { key: "nameAr", title: "Reason (AR)", width: 200 },
    {
      key: "type",
      title: "Applies To",
      width: 110,
      render: (v: string) => {
        const map: Record<string, string> = {
          void: "red",
          refund: "orange",
          both: "blue",
        };
        const label: Record<string, string> = {
          void: "Void",
          refund: "Refund",
          both: "Both",
        };
        return (
          <Tag color={map[v] ?? "default"} style={{ borderRadius: 6 }}>
            {label[v] ?? v}
          </Tag>
        );
      },
    },
    {
      key: "requires_manager",
      title: "Manager Req.",
      width: 120,
      render: (v: boolean) => (
        <Tag color={v ? "warning" : "default"}>{v ? "Yes" : "No"}</Tag>
      ),
    },
  ],
  fields: [
    { key: "nameEn", label: "Reason (English)", type: "text", required: true },
    {
      key: "nameAr",
      label: "Reason (Arabic) / السبب بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "type",
      label: "Applies To",
      type: "select",
      required: true,
      options: [
        { value: "void", label: "Void only" },
        { value: "refund", label: "Refund only" },
        { value: "both", label: "Void & Refund" },
      ],
    },
    {
      key: "requires_manager",
      label: "Requires Manager Approval",
      type: "switch",
      required: false,
    },
  ],
};

// ── Hold Reasons ───────────────────────────────────────────────────────────────
const holdReasonsTab: TabDef = {
  key: "hold-reasons",
  label: "Hold Reasons",
  labelAr: "أسباب التعليق",
  initialData: [
    {
      id: "hr1",
      nameEn: "Customer Undecided",
      nameAr: "العميل غير متأكد",
      max_hold_minutes: 30,
      isActive: true,
    },
    {
      id: "hr2",
      nameEn: "Price Check Required",
      nameAr: "التحقق من السعر",
      max_hold_minutes: 15,
      isActive: true,
    },
    {
      id: "hr3",
      nameEn: "Manager Approval",
      nameAr: "موافقة المدير",
      max_hold_minutes: 60,
      isActive: true,
    },
    {
      id: "hr4",
      nameEn: "Stock Verification",
      nameAr: "التحقق من المخزون",
      max_hold_minutes: 20,
      isActive: true,
    },
    {
      id: "hr5",
      nameEn: "Customer Will Return",
      nameAr: "العميل سيعود",
      max_hold_minutes: 120,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Reason (EN)", width: 200 },
    { key: "nameAr", title: "Reason (AR)", width: 200 },
    {
      key: "max_hold_minutes",
      title: "Max Hold (min)",
      width: 120,
      render: (v: number) => (v ? `${v} min` : "Unlimited"),
    },
  ],
  fields: [
    { key: "nameEn", label: "Reason (English)", type: "text", required: true },
    {
      key: "nameAr",
      label: "Reason (Arabic) / السبب بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "max_hold_minutes",
      label: "Max Hold Duration (minutes)",
      type: "number",
      required: false,
      min: 0,
      hint: "0 = no limit",
    },
  ],
};

// ── Cashier Shifts ─────────────────────────────────────────────────────────────
const shiftsTab: TabDef = {
  key: "cashier-shifts",
  label: "Cashier Shifts",
  labelAr: "ورديات الكاشير",
  initialData: [
    {
      id: "s1",
      nameEn: "Morning",
      nameAr: "صباحي",
      start_time: "06:00",
      end_time: "14:00",
      opening_float: 500,
      isActive: true,
    },
    {
      id: "s2",
      nameEn: "Afternoon",
      nameAr: "مسائي",
      start_time: "14:00",
      end_time: "22:00",
      opening_float: 500,
      isActive: true,
    },
    {
      id: "s3",
      nameEn: "Night",
      nameAr: "ليلي",
      start_time: "22:00",
      end_time: "06:00",
      opening_float: 300,
      isActive: true,
    },
    {
      id: "s4",
      nameEn: "Split",
      nameAr: "مقسّم",
      start_time: "08:00",
      end_time: "20:00",
      opening_float: 400,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Shift (EN)", width: 130 },
    { key: "nameAr", title: "Shift (AR)", width: 130 },
    { key: "start_time", title: "Start", width: 90 },
    { key: "end_time", title: "End", width: 90 },
    {
      key: "opening_float",
      title: "Opening Float",
      width: 130,
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ],
  fields: [
    {
      key: "nameEn",
      label: "Shift Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "nameAr",
      label: "Shift Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    { key: "start_time", label: "Start Time", type: "time", required: true },
    { key: "end_time", label: "End Time", type: "time", required: true },
    {
      key: "opening_float",
      label: "Opening Cash Float ($)",
      type: "number",
      required: false,
      min: 0,
    },
  ],
};

// ── Receipt Settings ───────────────────────────────────────────────────────────
const receiptSettingsTab: TabDef = {
  key: "receipt-settings",
  label: "Receipt Templates",
  labelAr: "قوالب الإيصالات",
  initialData: [
    {
      id: "rs1",
      nameEn: "Standard Receipt",
      nameAr: "إيصال قياسي",
      header_text: "Thank you for shopping with us!\nWelcome back anytime.",
      footer_text: "Returns accepted within 30 days with receipt.",
      show_logo: true,
      show_tax: true,
      show_barcode: true,
      copies: 1,
      isActive: true,
    },
    {
      id: "rs2",
      nameEn: "Gift Receipt",
      nameAr: "إيصال هدية",
      header_text: "Gift Receipt — No prices shown",
      footer_text:
        "This item was purchased as a gift. Exchange within 14 days.",
      show_logo: true,
      show_tax: false,
      show_barcode: false,
      copies: 1,
      isActive: true,
    },
    {
      id: "rs3",
      nameEn: "Kitchen Ticket",
      nameAr: "تذكرة المطبخ",
      header_text: "",
      footer_text: "",
      show_logo: false,
      show_tax: false,
      show_barcode: false,
      copies: 2,
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Template (EN)", width: 160 },
    { key: "nameAr", title: "Template (AR)", width: 160 },
    { key: "copies", title: "Copies", width: 70 },
    {
      key: "show_logo",
      title: "Logo",
      width: 70,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>
      ),
    },
    {
      key: "show_tax",
      title: "Tax Line",
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>
      ),
    },
    {
      key: "show_barcode",
      title: "Barcode",
      width: 80,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>
      ),
    },
  ],
  fields: [
    {
      key: "nameEn",
      label: "Template Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "nameAr",
      label: "Template Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "header_text",
      label: "Header Text",
      type: "text",
      required: false,
      hint: "Printed at the top of the receipt",
    },
    {
      key: "footer_text",
      label: "Footer Text",
      type: "text",
      required: false,
      hint: "Printed at the bottom of the receipt",
    },
    {
      key: "show_logo",
      label: "Show Company Logo",
      type: "switch",
      required: false,
    },
    {
      key: "show_tax",
      label: "Show Tax Breakdown",
      type: "switch",
      required: false,
    },
    {
      key: "show_barcode",
      label: "Show Barcode",
      type: "switch",
      required: false,
    },
    {
      key: "copies",
      label: "Number of Copies",
      type: "number",
      required: false,
      min: 1,
      max: 5,
    },
  ],
};

// ── Registers ──────────────────────────────────────────────────────────────────
const registersTab: TabDef = {
  key: "pos-registers",
  label: "Registers",
  labelAr: "السجلات",
  initialData: [
    {
      id: "reg1",
      nameEn: "Register 1",
      nameAr: "سجل 1",
      terminal: "POS-001",
      branch: "Main Branch",
      shift: "Morning",
      cash_drawer: "APG Series 4000",
      isActive: true,
    },
    {
      id: "reg2",
      nameEn: "Register 2",
      nameAr: "سجل 2",
      terminal: "POS-002",
      branch: "Main Branch",
      shift: "Afternoon",
      cash_drawer: "APG Series 4000",
      isActive: true,
    },
    {
      id: "reg3",
      nameEn: "Express Reg",
      nameAr: "سجل سريع",
      terminal: "POS-003",
      branch: "Downtown Branch",
      shift: "Morning",
      cash_drawer: "Star CD3-1616",
      isActive: true,
    },
    {
      id: "reg4",
      nameEn: "Night Reg",
      nameAr: "سجل الليل",
      terminal: "POS-001",
      branch: "Main Branch",
      shift: "Night",
      cash_drawer: "APG Series 4000",
      isActive: false,
    },
  ],
  columns: [
    { key: "nameEn", title: "Register (EN)", width: 140 },
    { key: "nameAr", title: "Register (AR)", width: 140 },
    { key: "terminal", title: "Terminal", width: 100 },
    { key: "branch", title: "Branch", width: 150 },
    { key: "shift", title: "Default Shift", width: 120 },
    { key: "cash_drawer", title: "Cash Drawer", width: 160 },
  ],
  fields: [
    {
      key: "nameEn",
      label: "Register Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "nameAr",
      label: "Register Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "terminal",
      label: "Linked Terminal ID",
      type: "text",
      required: true,
      hint: "e.g. POS-001",
    },
    { key: "branch", label: "Branch", type: "text", required: true },
    {
      key: "shift",
      label: "Default Shift",
      type: "select",
      required: false,
      options: [
        { value: "Morning", label: "Morning Shift" },
        { value: "Afternoon", label: "Afternoon Shift" },
        { value: "Night", label: "Night Shift" },
        { value: "Split", label: "Split Shift" },
      ],
    },
    {
      key: "cash_drawer",
      label: "Cash Drawer Model",
      type: "text",
      required: false,
    },
  ],
};

const tabs: TabDef[] = [
  registersTab,
  terminalsTab,
  categoriesTab,
  paymentMethodsTab,
  discountReasonsTab,
  voidReasonsTab,
  holdReasonsTab,
  shiftsTab,
  receiptSettingsTab,
];

export default function POSDefinitions() {
  return (
    <DefinitionsPage
      moduleName="POS Definitions"
      moduleNameAr="التعريفات — نقطة البيع"
      tabs={tabs}
      formDesign={1}
    />
  );
}
