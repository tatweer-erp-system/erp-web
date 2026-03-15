import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Customer Categories ────────────────────────────────────────────────────
  {
    key: "customer-categories",
    label: "Customer Categories",
    labelAr: "فئات العملاء",
    initialData: [
      {
        id: "cc1",
        nameAr: "مؤسسات",
        nameEn: "Enterprise",
        discount_percentage: 15,
        credit_limit: 100000,
        isActive: true,
      },
      {
        id: "cc2",
        nameAr: "شركات صغيرة",
        nameEn: "SMB",
        discount_percentage: 10,
        credit_limit: 50000,
        isActive: true,
      },
      {
        id: "cc3",
        nameAr: "أفراد",
        nameEn: "Individual",
        discount_percentage: 5,
        credit_limit: 10000,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "discount_percentage", title: "Discount %", width: 100 },
      {
        key: "credit_limit",
        title: "Credit Limit",
        width: 120,
        render: (v: number) => v?.toLocaleString(),
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
        key: "discount_percentage",
        label: "Discount Percentage (%)",
        type: "number",
        required: false,
        min: 0,
        max: 100,
      },
      {
        key: "credit_limit",
        label: "Credit Limit",
        type: "number",
        required: false,
        min: 0,
      },
    ],
  },

  // ── Sales Channels ─────────────────────────────────────────────────────────
  {
    key: "sales-channels",
    label: "Sales Channels",
    labelAr: "قنوات البيع",
    initialData: [
      {
        id: "sc1",
        nameAr: "متجر إلكتروني",
        nameEn: "Online Store",
        type: "online",
        isActive: true,
      },
      {
        id: "sc2",
        nameAr: "متجر فعلي",
        nameEn: "Physical Store",
        type: "offline",
        isActive: true,
      },
      {
        id: "sc3",
        nameAr: "مبيعات B2B",
        nameEn: "B2B Sales",
        type: "B2B",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      {
        key: "type",
        title: "Type",
        width: 100,
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
        key: "type",
        label: "Channel Type",
        type: "select",
        required: true,
        options: [
          { value: "online", label: "Online" },
          { value: "offline", label: "Offline" },
          { value: "B2B", label: "B2B" },
          { value: "B2C", label: "B2C" },
        ],
      },
    ],
  },

  // ── Price Lists ────────────────────────────────────────────────────────────
  {
    key: "price-lists",
    label: "Price Lists",
    labelAr: "قوائم الأسعار",
    initialData: [
      {
        id: "pl1",
        nameAr: "قائمة التجزئة",
        nameEn: "Retail Price List",
        currency: "USD",
        valid_from: "2025-01-01",
        valid_to: "2025-12-31",
        isActive: true,
      },
      {
        id: "pl2",
        nameAr: "قائمة الجملة",
        nameEn: "Wholesale Price List",
        currency: "USD",
        valid_from: "2025-01-01",
        valid_to: "2025-12-31",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "currency", title: "Currency", width: 90 },
      { key: "valid_from", title: "Valid From", width: 110 },
      { key: "valid_to", title: "Valid To", width: 110 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "currency", label: "Currency", type: "text", required: true },
      { key: "valid_from", label: "Valid From", type: "date", required: false },
      { key: "valid_to", label: "Valid To", type: "date", required: false },
    ],
  },

  // ── Discount Types ─────────────────────────────────────────────────────────
  {
    key: "discount-types",
    label: "Discount Types",
    labelAr: "أنواع الخصومات",
    initialData: [
      {
        id: "dt1",
        nameAr: "خصم نسبي",
        nameEn: "Percentage Discount",
        type: "percentage",
        max_value: 30,
        isActive: true,
      },
      {
        id: "dt2",
        nameAr: "خصم ثابت",
        nameEn: "Fixed Discount",
        type: "fixed",
        max_value: 500,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (v: string) => (
          <Tag color={v === "percentage" ? "gold" : "cyan"}>{v}</Tag>
        ),
      },
      { key: "max_value", title: "Max Value", width: 110 },
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
        label: "Discount Type",
        type: "select",
        required: true,
        options: [
          { value: "percentage", label: "Percentage" },
          { value: "fixed", label: "Fixed Amount" },
        ],
      },
      {
        key: "max_value",
        label: "Max Value",
        type: "number",
        required: false,
        min: 0,
      },
    ],
  },

  // ── Cancellation Reasons ───────────────────────────────────────────────────
  {
    key: "cancellation-reasons",
    label: "Cancellation Reasons",
    labelAr: "أسباب الإلغاء",
    initialData: [
      {
        id: "cr1",
        nameAr: "طلب العميل",
        nameEn: "Customer Request",
        requires_approval: false,
        isActive: true,
      },
      {
        id: "cr2",
        nameAr: "نفاد المخزون",
        nameEn: "Out of Stock",
        requires_approval: true,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "requires_approval",
        title: "Requires Approval",
        width: 150,
        render: (v: boolean) => (
          <Tag color={v ? "warning" : "default"}>{v ? "Yes" : "No"}</Tag>
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
        key: "requires_approval",
        label: "Requires Approval",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Delivery Methods ───────────────────────────────────────────────────────
  {
    key: "delivery-methods",
    label: "Delivery Methods",
    labelAr: "طرق التوصيل",
    initialData: [
      {
        id: "dm1",
        nameAr: "توصيل منزلي",
        nameEn: "Home Delivery",
        estimated_days: 3,
        cost: 10,
        isActive: true,
      },
      {
        id: "dm2",
        nameAr: "استلام من الفرع",
        nameEn: "Store Pickup",
        estimated_days: 0,
        cost: 0,
        isActive: true,
      },
      {
        id: "dm3",
        nameAr: "شحن دولي",
        nameEn: "International Shipping",
        estimated_days: 14,
        cost: 50,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "estimated_days", title: "Est. Days", width: 100 },
      { key: "cost", title: "Cost", width: 90, render: (v: number) => `$${v}` },
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
        key: "estimated_days",
        label: "Estimated Days",
        type: "number",
        required: false,
        min: 0,
      },
      { key: "cost", label: "Cost", type: "number", required: false, min: 0 },
    ],
  },

  // ── Sales Zones ────────────────────────────────────────────────────────────
  {
    key: "sales-zones",
    label: "Sales Zones",
    labelAr: "مناطق البيع",
    initialData: [
      {
        id: "sz1",
        nameAr: "منطقة القاهرة",
        nameEn: "Cairo Zone",
        regions: "Cairo, Giza",
        assigned_rep: "Ahmed Ali",
        isActive: true,
      },
      {
        id: "sz2",
        nameAr: "منطقة الإسكندرية",
        nameEn: "Alexandria Zone",
        regions: "Alexandria",
        assigned_rep: "Sara Hassan",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "regions", title: "Regions", width: 180 },
      { key: "assigned_rep", title: "Assigned Rep", width: 140 },
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
        key: "regions",
        label: "Regions (comma-separated)",
        type: "text",
        required: false,
      },
      {
        key: "assigned_rep",
        label: "Assigned Sales Rep",
        type: "text",
        required: false,
      },
    ],
  },
];

// ── POS Registers ──────────────────────────────────────────────────────────────
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

// ── POS Payment Methods ────────────────────────────────────────────────────────
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

// ── POS Discount Reasons ───────────────────────────────────────────────────────
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

// ── POS Void / Refund Reasons ──────────────────────────────────────────────────
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

// ── POS Hold Reasons ───────────────────────────────────────────────────────────
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

// ── POS Receipt Settings ───────────────────────────────────────────────────────
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

// ── Loyalty Tiers ──────────────────────────────────────────────────────────────
const loyaltyTiersTab: TabDef = {
  key: "loyalty-tiers",
  label: "Loyalty Tiers",
  labelAr: "مستويات الولاء",
  initialData: [
    {
      id: "lt1",
      nameAr: "برونزي",
      nameEn: "Bronze",
      min_points: 0,
      max_points: 500,
      earn_ratio: 0.1,
      redeem_ratio: 0.1,
      color: "#CD7F32",
      isActive: true,
    },
    {
      id: "lt2",
      nameAr: "فضي",
      nameEn: "Silver",
      min_points: 501,
      max_points: 2000,
      earn_ratio: 0.15,
      redeem_ratio: 0.12,
      color: "#A8A9AD",
      isActive: true,
    },
    {
      id: "lt3",
      nameAr: "ذهبي",
      nameEn: "Gold",
      min_points: 2001,
      max_points: 5000,
      earn_ratio: 0.2,
      redeem_ratio: 0.15,
      color: "#FFD700",
      isActive: true,
    },
    {
      id: "lt4",
      nameAr: "بلاتيني",
      nameEn: "Platinum",
      min_points: 5001,
      max_points: 999999,
      earn_ratio: 0.25,
      redeem_ratio: 0.2,
      color: "#E5E4E2",
      isActive: true,
    },
  ],
  columns: [
    {
      key: "nameEn",
      title: "Tier Name",
      width: 120,
      render: (v: string, record) => (
        <Tag
          style={{
            background: `${record.color}22`,
            border: `1px solid ${record.color}66`,
            color: record.color,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: 11,
          }}
        >
          {v}
        </Tag>
      ),
    },
    { key: "min_points", title: "Min Points", width: 110 },
    { key: "max_points", title: "Max Points", width: 110 },
    {
      key: "earn_ratio",
      title: "Earn Ratio",
      width: 120,
      render: (v: number) => `${v} pt / $1`,
    },
    {
      key: "redeem_ratio",
      title: "Redeem Ratio",
      width: 130,
      render: (v: number) => `$${v.toFixed(2)} / pt`,
    },
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
            border: "1px solid rgba(0,0,0,0.15)",
            verticalAlign: "middle",
          }}
        />
      ),
    },
  ],
  fields: [
    {
      key: "nameEn",
      label: "Tier Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "nameAr",
      label: "Tier Name (Arabic) / الاسم بالعربي",
      type: "text",
      required: true,
    },
    {
      key: "min_points",
      label: "Minimum Points",
      type: "number",
      required: true,
      min: 0,
    },
    {
      key: "max_points",
      label: "Maximum Points",
      type: "number",
      required: true,
      min: 0,
    },
    {
      key: "earn_ratio",
      label: "Points Earn Ratio (pts per $1 spent)",
      type: "number",
      required: true,
      min: 0,
      hint: "e.g. 0.1 = 1 point per $10 spent",
    },
    {
      key: "redeem_ratio",
      label: "Points Redeem Ratio ($ per point)",
      type: "number",
      required: true,
      min: 0,
      hint: "e.g. 0.10 = 1 point = $0.10 discount",
    },
    { key: "color", label: "Tier Color", type: "color", required: false },
  ],
};

// ── Voucher Types ──────────────────────────────────────────────────────────────
const voucherTypesTab: TabDef = {
  key: "voucher-types",
  label: "Voucher Types",
  labelAr: "أنواع القسائم",
  columns: [
    {
      key: "nameEn",
      label: "Type Name",
      render: (v: string) => <strong>{v}</strong>,
    },
    {
      key: "discount_type",
      label: "Discount Type",
      render: (v: string) => (
        <Tag
          color={v === "percent" ? "blue" : "green"}
          style={{ borderRadius: 6, fontWeight: 600 }}
        >
          {v === "percent" ? "Percentage" : "Fixed Amount"}
        </Tag>
      ),
    },
    {
      key: "discount_value",
      label: "Value",
      render: (v: number, row: Record<string, unknown>) =>
        row.discount_type === "percent" ? `${v}%` : `$${Number(v).toFixed(2)}`,
    },
    {
      key: "min_order",
      label: "Min Order",
      render: (v: number) => `$${Number(v).toFixed(2)}`,
    },
    {
      key: "valid_days",
      label: "Valid Days",
      render: (v: number) => (v ? `${v} days` : "—"),
    },
    {
      key: "max_uses",
      label: "Max Uses",
      render: (v: number) => (v === 0 ? "Unlimited" : v),
    },
  ],
  initialData: [
    {
      id: "VT001",
      nameEn: "Welcome Discount",
      nameAr: "خصم الترحيب",
      discount_type: "fixed",
      discount_value: 5,
      min_order: 0,
      valid_days: 30,
      max_uses: 0,
      isActive: true,
    },
    {
      id: "VT002",
      nameEn: "Summer Sale 10%",
      nameAr: "تخفيضات الصيف",
      discount_type: "percent",
      discount_value: 10,
      min_order: 0,
      valid_days: 60,
      max_uses: 500,
      isActive: true,
    },
    {
      id: "VT003",
      nameEn: "Flat $20 Off",
      nameAr: "خصم ثابت 20$",
      discount_type: "fixed",
      discount_value: 20,
      min_order: 50,
      valid_days: 90,
      max_uses: 200,
      isActive: true,
    },
    {
      id: "VT004",
      nameEn: "Summer 15%",
      nameAr: "خصم 15%",
      discount_type: "percent",
      discount_value: 15,
      min_order: 100,
      valid_days: 45,
      max_uses: 100,
      isActive: true,
    },
    {
      id: "VT005",
      nameEn: "Clearance Fixed",
      nameAr: "خصم التصفية",
      discount_type: "fixed",
      discount_value: 50,
      min_order: 200,
      valid_days: 14,
      max_uses: 50,
      isActive: false,
    },
  ],
  fields: [
    { key: "nameEn", label: "Type Name (EN)", required: true },
    { key: "nameAr", label: "Type Name (AR)", required: true },
    {
      key: "discount_type",
      label: "Discount Type",
      type: "select",
      required: true,
      options: [
        { value: "percent", label: "Percentage (%)" },
        { value: "fixed", label: "Fixed Amount ($)" },
      ],
    },
    {
      key: "discount_value",
      label: "Discount Value",
      type: "number",
      required: true,
      min: 0,
    },
    { key: "min_order", label: "Min Order Amount ($)", type: "number", min: 0 },
    {
      key: "valid_days",
      label: "Valid for Days",
      type: "number",
      min: 0,
      hint: "0 = no expiry",
    },
    {
      key: "max_uses",
      label: "Max Uses",
      type: "number",
      min: 0,
      hint: "0 = unlimited",
    },
  ],
};

// ── Gift Card Denominations ────────────────────────────────────────────────────
const giftCardDenominationsTab: TabDef = {
  key: "gc-denominations",
  label: "Gift Card Denominations",
  labelAr: "فئات بطاقات الهدايا",
  columns: [
    {
      key: "amount",
      label: "Amount",
      render: (v: number) => (
        <strong style={{ fontSize: 14, color: "#A855F7" }}>
          ${Number(v).toFixed(2)}
        </strong>
      ),
    },
    { key: "nameEn", label: "Label" },
  ],
  initialData: [
    {
      id: "D001",
      amount: 10,
      nameEn: "$10 Gift Card",
      nameAr: "بطاقة هدية 10$",
      isActive: true,
    },
    {
      id: "D002",
      amount: 25,
      nameEn: "$25 Gift Card",
      nameAr: "بطاقة هدية 25$",
      isActive: true,
    },
    {
      id: "D003",
      amount: 50,
      nameEn: "$50 Gift Card",
      nameAr: "بطاقة هدية 50$",
      isActive: true,
    },
    {
      id: "D004",
      amount: 100,
      nameEn: "$100 Gift Card",
      nameAr: "بطاقة هدية 100$",
      isActive: true,
    },
    {
      id: "D005",
      amount: 200,
      nameEn: "$200 Gift Card",
      nameAr: "بطاقة هدية 200$",
      isActive: true,
    },
    {
      id: "D006",
      amount: 500,
      nameEn: "$500 Gift Card",
      nameAr: "بطاقة هدية 500$",
      isActive: false,
    },
  ],
  fields: [
    { key: "nameEn", label: "Label (EN)", required: true },
    { key: "nameAr", label: "Label (AR)", required: true },
    {
      key: "amount",
      label: "Amount ($)",
      type: "number",
      required: true,
      min: 1,
    },
  ],
};

export default function SalesDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Sales & POS Definitions"
      moduleNameAr="التعريفات — المبيعات ونقاط البيع"
      tabs={[
        ...tabs,
        registersTab,
        terminalsTab,
        paymentMethodsTab,
        discountReasonsTab,
        voidReasonsTab,
        holdReasonsTab,
        receiptSettingsTab,
        loyaltyTiersTab,
        voucherTypesTab,
        giftCardDenominationsTab,
      ]}
      formDesign={1}
    />
  );
}
