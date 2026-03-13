import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const tabs: TabDef[] = [
  // ── Customer Categories ────────────────────────────────────────────────────
  {
    key: "customer-categories",
    label: "Customer Categories",
    labelAr: "فئات العملاء",
    initialData: [
      {
        id: "cc1",
        name_ar: "مؤسسات",
        name_en: "Enterprise",
        discount_percentage: 15,
        credit_limit: 100000,
        is_active: true,
      },
      {
        id: "cc2",
        name_ar: "شركات صغيرة",
        name_en: "SMB",
        discount_percentage: 10,
        credit_limit: 50000,
        is_active: true,
      },
      {
        id: "cc3",
        name_ar: "أفراد",
        name_en: "Individual",
        discount_percentage: 5,
        credit_limit: 10000,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "discount_percentage", title: "Discount %", width: 100 },
      {
        key: "credit_limit",
        title: "Credit Limit",
        width: 120,
        render: (v: number) => v?.toLocaleString(),
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
        name_ar: "متجر إلكتروني",
        name_en: "Online Store",
        type: "online",
        is_active: true,
      },
      {
        id: "sc2",
        name_ar: "متجر فعلي",
        name_en: "Physical Store",
        type: "offline",
        is_active: true,
      },
      {
        id: "sc3",
        name_ar: "مبيعات B2B",
        name_en: "B2B Sales",
        type: "B2B",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      {
        key: "type",
        title: "Type",
        width: 100,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
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
        name_ar: "قائمة التجزئة",
        name_en: "Retail Price List",
        currency: "USD",
        valid_from: "2025-01-01",
        valid_to: "2025-12-31",
        is_active: true,
      },
      {
        id: "pl2",
        name_ar: "قائمة الجملة",
        name_en: "Wholesale Price List",
        currency: "USD",
        valid_from: "2025-01-01",
        valid_to: "2025-12-31",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "currency", title: "Currency", width: 90 },
      { key: "valid_from", title: "Valid From", width: 110 },
      { key: "valid_to", title: "Valid To", width: 110 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
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
        name_ar: "خصم نسبي",
        name_en: "Percentage Discount",
        type: "percentage",
        max_value: 30,
        is_active: true,
      },
      {
        id: "dt2",
        name_ar: "خصم ثابت",
        name_en: "Fixed Discount",
        type: "fixed",
        max_value: 500,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
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
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
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

  // ── Order Statuses ─────────────────────────────────────────────────────────
  {
    key: "order-statuses",
    label: "Order Statuses",
    labelAr: "حالات الطلبات",
    initialData: [
      {
        id: "os1",
        name_ar: "جديد",
        name_en: "New",
        color: "#3B82F6",
        is_terminal: false,
        order: 1,
        is_active: true,
      },
      {
        id: "os2",
        name_ar: "قيد المعالجة",
        name_en: "Processing",
        color: "#F59E0B",
        is_terminal: false,
        order: 2,
        is_active: true,
      },
      {
        id: "os3",
        name_ar: "مكتمل",
        name_en: "Completed",
        color: "#10B981",
        is_terminal: true,
        order: 3,
        is_active: true,
      },
      {
        id: "os4",
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

  // ── Cancellation Reasons ───────────────────────────────────────────────────
  {
    key: "cancellation-reasons",
    label: "Cancellation Reasons",
    labelAr: "أسباب الإلغاء",
    initialData: [
      {
        id: "cr1",
        name_ar: "طلب العميل",
        name_en: "Customer Request",
        requires_approval: false,
        is_active: true,
      },
      {
        id: "cr2",
        name_ar: "نفاد المخزون",
        name_en: "Out of Stock",
        requires_approval: true,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
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
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
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
        name_ar: "توصيل منزلي",
        name_en: "Home Delivery",
        estimated_days: 3,
        cost: 10,
        is_active: true,
      },
      {
        id: "dm2",
        name_ar: "استلام من الفرع",
        name_en: "Store Pickup",
        estimated_days: 0,
        cost: 0,
        is_active: true,
      },
      {
        id: "dm3",
        name_ar: "شحن دولي",
        name_en: "International Shipping",
        estimated_days: 14,
        cost: 50,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "estimated_days", title: "Est. Days", width: 100 },
      { key: "cost", title: "Cost", width: 90, render: (v: number) => `$${v}` },
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
        key: "estimated_days",
        label: "Estimated Days",
        type: "number",
        required: false,
        min: 0,
      },
      { key: "cost", label: "Cost", type: "number", required: false, min: 0 },
    ],
  },

  // ── Payment Terms ──────────────────────────────────────────────────────────
  {
    key: "payment-terms",
    label: "Payment Terms",
    labelAr: "شروط الدفع",
    initialData: [
      {
        id: "pt1",
        name_ar: "فوري",
        name_en: "Immediate",
        days_due: 0,
        penalty_percentage: 0,
        is_active: true,
      },
      {
        id: "pt2",
        name_ar: "30 يوم",
        name_en: "Net 30",
        days_due: 30,
        penalty_percentage: 1.5,
        is_active: true,
      },
      {
        id: "pt3",
        name_ar: "60 يوم",
        name_en: "Net 60",
        days_due: 60,
        penalty_percentage: 2,
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

  // ── Sales Zones ────────────────────────────────────────────────────────────
  {
    key: "sales-zones",
    label: "Sales Zones",
    labelAr: "مناطق البيع",
    initialData: [
      {
        id: "sz1",
        name_ar: "منطقة القاهرة",
        name_en: "Cairo Zone",
        regions: "Cairo, Giza",
        assigned_rep: "Ahmed Ali",
        is_active: true,
      },
      {
        id: "sz2",
        name_ar: "منطقة الإسكندرية",
        name_en: "Alexandria Zone",
        regions: "Alexandria",
        assigned_rep: "Sara Hassan",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "regions", title: "Regions", width: 180 },
      { key: "assigned_rep", title: "Assigned Rep", width: 140 },
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

// ── Loyalty Tiers ──────────────────────────────────────────────────────────────
const loyaltyTiersTab: TabDef = {
  key: "loyalty-tiers",
  label: "Loyalty Tiers",
  labelAr: "مستويات الولاء",
  initialData: [
    {
      id: "lt1",
      name_ar: "برونزي",
      name_en: "Bronze",
      min_points: 0,
      max_points: 500,
      earn_ratio: 0.1,
      redeem_ratio: 0.1,
      color: "#CD7F32",
      is_active: true,
    },
    {
      id: "lt2",
      name_ar: "فضي",
      name_en: "Silver",
      min_points: 501,
      max_points: 2000,
      earn_ratio: 0.15,
      redeem_ratio: 0.12,
      color: "#A8A9AD",
      is_active: true,
    },
    {
      id: "lt3",
      name_ar: "ذهبي",
      name_en: "Gold",
      min_points: 2001,
      max_points: 5000,
      earn_ratio: 0.2,
      redeem_ratio: 0.15,
      color: "#FFD700",
      is_active: true,
    },
    {
      id: "lt4",
      name_ar: "بلاتيني",
      name_en: "Platinum",
      min_points: 5001,
      max_points: 999999,
      earn_ratio: 0.25,
      redeem_ratio: 0.2,
      color: "#E5E4E2",
      is_active: true,
    },
  ],
  columns: [
    {
      key: "name_en",
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
      key: "name_en",
      label: "Tier Name (English)",
      type: "text",
      required: true,
    },
    {
      key: "name_ar",
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
      key: "name_en",
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
      name_en: "Welcome Discount",
      name_ar: "خصم الترحيب",
      discount_type: "fixed",
      discount_value: 5,
      min_order: 0,
      valid_days: 30,
      max_uses: 0,
      is_active: true,
    },
    {
      id: "VT002",
      name_en: "Summer Sale 10%",
      name_ar: "تخفيضات الصيف",
      discount_type: "percent",
      discount_value: 10,
      min_order: 0,
      valid_days: 60,
      max_uses: 500,
      is_active: true,
    },
    {
      id: "VT003",
      name_en: "Flat $20 Off",
      name_ar: "خصم ثابت 20$",
      discount_type: "fixed",
      discount_value: 20,
      min_order: 50,
      valid_days: 90,
      max_uses: 200,
      is_active: true,
    },
    {
      id: "VT004",
      name_en: "Summer 15%",
      name_ar: "خصم 15%",
      discount_type: "percent",
      discount_value: 15,
      min_order: 100,
      valid_days: 45,
      max_uses: 100,
      is_active: true,
    },
    {
      id: "VT005",
      name_en: "Clearance Fixed",
      name_ar: "خصم التصفية",
      discount_type: "fixed",
      discount_value: 50,
      min_order: 200,
      valid_days: 14,
      max_uses: 50,
      is_active: false,
    },
  ],
  fields: [
    { key: "name_en", label: "Type Name (EN)", required: true },
    { key: "name_ar", label: "Type Name (AR)", required: true },
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
    { key: "name_en", label: "Label" },
  ],
  initialData: [
    {
      id: "D001",
      amount: 10,
      name_en: "$10 Gift Card",
      name_ar: "بطاقة هدية 10$",
      is_active: true,
    },
    {
      id: "D002",
      amount: 25,
      name_en: "$25 Gift Card",
      name_ar: "بطاقة هدية 25$",
      is_active: true,
    },
    {
      id: "D003",
      amount: 50,
      name_en: "$50 Gift Card",
      name_ar: "بطاقة هدية 50$",
      is_active: true,
    },
    {
      id: "D004",
      amount: 100,
      name_en: "$100 Gift Card",
      name_ar: "بطاقة هدية 100$",
      is_active: true,
    },
    {
      id: "D005",
      amount: 200,
      name_en: "$200 Gift Card",
      name_ar: "بطاقة هدية 200$",
      is_active: true,
    },
    {
      id: "D006",
      amount: 500,
      name_en: "$500 Gift Card",
      name_ar: "بطاقة هدية 500$",
      is_active: false,
    },
  ],
  fields: [
    { key: "name_en", label: "Label (EN)", required: true },
    { key: "name_ar", label: "Label (AR)", required: true },
    {
      key: "amount",
      label: "Amount ($)",
      type: "number",
      required: true,
      min: 1,
    },
  ],
};

// ── Cashier PINs ───────────────────────────────────────────────────────────────
const cashierPINsTab: TabDef = {
  key: "cashier-pins",
  label: "Cashier PINs",
  labelAr: "أرقام التعريف الشخصي",
  columns: [
    {
      key: "name_en",
      title: "Name",
      width: 180,
      render: (v: string, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: row.color as string,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            {row.initials as string}
          </div>
          <span style={{ fontWeight: 600 }}>{v}</span>
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      width: 140,
      render: (v: string) => {
        const colors: Record<string, string> = {
          manager: "purple",
          senior_cashier: "blue",
          cashier: "default",
        };
        const labels: Record<string, string> = {
          manager: "Manager",
          senior_cashier: "Senior Cashier",
          cashier: "Cashier",
        };
        return (
          <Tag
            color={colors[v] ?? "default"}
            style={{ borderRadius: 6, fontWeight: 600 }}
          >
            {labels[v] ?? v}
          </Tag>
        );
      },
    },
    {
      key: "pin_set",
      title: "PIN Status",
      width: 120,
      render: (v: boolean) =>
        v ? (
          <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            style={{ borderRadius: 6 }}
          >
            PIN Set
          </Tag>
        ) : (
          <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ borderRadius: 6 }}
          >
            No PIN
          </Tag>
        ),
    },
    {
      key: "last_login",
      title: "Last Login",
      width: 160,
      render: (v: string) =>
        v ?? <span style={{ color: "#9CA3AF" }}>Never</span>,
    },
  ],
  initialData: [
    {
      id: "c1",
      name_en: "Alex Johnson",
      name_ar: "",
      role: "cashier",
      initials: "AJ",
      color: "#0066CC",
      pin_set: true,
      last_login: "Today, 09:15 AM",
      is_active: true,
    },
    {
      id: "c2",
      name_en: "Sara Ahmed",
      name_ar: "",
      role: "cashier",
      initials: "SA",
      color: "#10B981",
      pin_set: true,
      last_login: "Today, 08:30 AM",
      is_active: true,
    },
    {
      id: "c3",
      name_en: "Mohammed Al-Rashid",
      name_ar: "",
      role: "senior_cashier",
      initials: "MR",
      color: "#F59E0B",
      pin_set: true,
      last_login: "Yesterday",
      is_active: true,
    },
    {
      id: "c4",
      name_en: "Layla Hassan",
      name_ar: "",
      role: "cashier",
      initials: "LH",
      color: "#EC4899",
      pin_set: false,
      last_login: undefined,
      is_active: true,
    },
    {
      id: "mgr",
      name_en: "Omar Al-Manager",
      name_ar: "",
      role: "manager",
      initials: "OM",
      color: "#A855F7",
      pin_set: true,
      last_login: "Today, 07:00 AM",
      is_active: true,
    },
  ],
  fields: [
    { key: "name_en", label: "Cashier Name", type: "text", required: false },
    {
      key: "new_pin",
      label: "New PIN (4 digits)",
      type: "text",
      required: true,
      hint: "Enter a 4-digit numeric PIN",
    },
    {
      key: "confirm_pin",
      label: "Confirm PIN",
      type: "text",
      required: true,
      hint: "Re-enter the PIN to confirm",
    },
  ],
};

export default function SalesDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Sales Definitions"
      moduleNameAr="التعريفات — المبيعات"
      tabs={[
        ...tabs,
        loyaltyTiersTab,
        voucherTypesTab,
        giftCardDenominationsTab,
        cashierPINsTab,
      ]}
      formDesign={1}
    />
  );
}
