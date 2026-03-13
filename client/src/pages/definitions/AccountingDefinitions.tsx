import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Chart of Accounts ──────────────────────────────────────────────────────
  {
    key: "chart-of-accounts",
    label: "Chart of Accounts",
    labelAr: "دليل الحسابات",
    initialData: [
      {
        id: "coa1",
        name_ar: "الأصول المتداولة",
        name_en: "Current Assets",
        code: "1100",
        type: "asset",
        parent_account: "",
        is_active: true,
      },
      {
        id: "coa2",
        name_ar: "الالتزامات المتداولة",
        name_en: "Current Liabilities",
        code: "2100",
        type: "liability",
        parent_account: "",
        is_active: true,
      },
      {
        id: "coa3",
        name_ar: "إيرادات المبيعات",
        name_en: "Sales Revenue",
        code: "4100",
        type: "revenue",
        parent_account: "",
        is_active: true,
      },
      {
        id: "coa4",
        name_ar: "تكلفة البضاعة المباعة",
        name_en: "Cost of Goods Sold",
        code: "5100",
        type: "expense",
        parent_account: "",
        is_active: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 80 },
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (v: string) => {
          const colors: Record<string, string> = {
            asset: "blue",
            liability: "red",
            equity: "purple",
            revenue: "green",
            expense: "orange",
          };
          return <Tag color={colors[v] ?? "default"}>{v}</Tag>;
        },
      },
      { key: "parent_account", title: "Parent Account", width: 160 },
    ],
    fields: [
      { key: "code", label: "Account Code", type: "text", required: true },
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      {
        key: "type",
        label: "Account Type",
        type: "select",
        required: true,
        options: [
          { value: "asset", label: "Asset" },
          { value: "liability", label: "Liability" },
          { value: "equity", label: "Equity" },
          { value: "revenue", label: "Revenue" },
          { value: "expense", label: "Expense" },
        ],
      },
      {
        key: "parent_account",
        label: "Parent Account",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Cost Centers ───────────────────────────────────────────────────────────
  {
    key: "cost-centers",
    label: "Cost Centers",
    labelAr: "مراكز التكلفة",
    initialData: [
      {
        id: "cc1",
        name_ar: "قسم المبيعات",
        name_en: "Sales Department",
        code: "CC-001",
        manager: "Ahmed Ali",
        department: "Sales",
        is_active: true,
      },
      {
        id: "cc2",
        name_ar: "قسم التشغيل",
        name_en: "Operations",
        code: "CC-002",
        manager: "Sara Hassan",
        department: "Operations",
        is_active: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 90 },
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "department", title: "Department", width: 140 },
    ],
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "manager", label: "Manager", type: "text", required: false },
      { key: "department", label: "Department", type: "text", required: false },
    ],
  },

  // ── Tax Classes ────────────────────────────────────────────────────────────
  {
    key: "tax-classes",
    label: "Tax Classes",
    labelAr: "الفئات الضريبية",
    initialData: [
      {
        id: "tc1",
        name_ar: "ضريبة القيمة المضافة 15%",
        name_en: "VAT 15%",
        rate_percentage: 15,
        type: "VAT",
        applies_to: "All Goods",
        is_active: true,
      },
      {
        id: "tc2",
        name_ar: "ضريبة القيمة المضافة 5%",
        name_en: "VAT 5%",
        rate_percentage: 5,
        type: "VAT",
        applies_to: "Basic Goods",
        is_active: true,
      },
      {
        id: "tc3",
        name_ar: "معفى",
        name_en: "Exempt",
        rate_percentage: 0,
        type: "VAT",
        applies_to: "Exempt Items",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "rate_percentage", title: "Rate %", width: 90 },
      {
        key: "type",
        title: "Type",
        width: 100,
        render: (v: string) => <Tag color="orange">{v}</Tag>,
      },
      { key: "applies_to", title: "Applies To", width: 150 },
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
        key: "rate_percentage",
        label: "Rate Percentage (%)",
        type: "number",
        required: true,
        min: 0,
        max: 100,
      },
      {
        key: "type",
        label: "Tax Type",
        type: "select",
        required: true,
        options: [
          { value: "VAT", label: "VAT" },
          { value: "withholding", label: "Withholding Tax" },
        ],
      },
      { key: "applies_to", label: "Applies To", type: "text", required: false },
    ],
  },

  // ── Currencies ─────────────────────────────────────────────────────────────
  {
    key: "currencies",
    label: "Currencies",
    labelAr: "العملات",
    initialData: [
      {
        id: "cur1",
        name_ar: "دولار أمريكي",
        name_en: "US Dollar",
        code: "USD",
        symbol: "$",
        exchange_rate: 1,
        is_default: true,
        is_active: true,
      },
      {
        id: "cur2",
        name_ar: "يورو",
        name_en: "Euro",
        code: "EUR",
        symbol: "€",
        exchange_rate: 0.92,
        is_default: false,
        is_active: true,
      },
      {
        id: "cur3",
        name_ar: "جنيه مصري",
        name_en: "Egyptian Pound",
        code: "EGP",
        symbol: "£",
        exchange_rate: 48.5,
        is_default: false,
        is_active: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 70 },
      { key: "name_en", title: "Name (EN)", width: 150 },
      { key: "name_ar", title: "Name (AR)", width: 150 },
      { key: "symbol", title: "Symbol", width: 70 },
      { key: "exchange_rate", title: "Exchange Rate", width: 120 },
      {
        key: "is_default",
        title: "Default",
        width: 80,
        render: (v: boolean) => (v ? <Tag color="green">Default</Tag> : null),
      },
    ],
    fields: [
      {
        key: "code",
        label: "Currency Code (e.g. USD)",
        type: "text",
        required: true,
      },
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "symbol", label: "Symbol (e.g. $)", type: "text", required: true },
      {
        key: "exchange_rate",
        label: "Exchange Rate",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "is_default",
        label: "Set as Default Currency",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Fiscal Years ───────────────────────────────────────────────────────────
  {
    key: "fiscal-years",
    label: "Fiscal Years",
    labelAr: "السنوات المالية",
    initialData: [
      {
        id: "fy1",
        name_ar: "السنة المالية 2024",
        name_en: "FY 2024",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        is_current: false,
        is_closed: true,
        is_active: true,
      },
      {
        id: "fy2",
        name_ar: "السنة المالية 2025",
        name_en: "FY 2025",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        is_current: true,
        is_closed: false,
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 140 },
      { key: "start_date", title: "Start Date", width: 110 },
      { key: "end_date", title: "End Date", width: 110 },
      {
        key: "is_current",
        title: "Current",
        width: 90,
        render: (v: boolean) => (v ? <Tag color="blue">Current</Tag> : null),
      },
      {
        key: "is_closed",
        title: "Closed",
        width: 90,
        render: (v: boolean) =>
          v ? <Tag color="red">Closed</Tag> : <Tag color="green">Open</Tag>,
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
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "end_date", label: "End Date", type: "date", required: true },
      {
        key: "is_current",
        label: "Set as Current Year",
        type: "switch",
        required: false,
      },
      { key: "is_closed", label: "Is Closed", type: "switch", required: false },
    ],
  },

  // ── Journal Types ──────────────────────────────────────────────────────────
  {
    key: "journal-types",
    label: "Journal Types",
    labelAr: "أنواع القيود",
    initialData: [
      {
        id: "jt1",
        name_ar: "قيود المبيعات",
        name_en: "Sales Journal",
        type: "sales",
        is_active: true,
      },
      {
        id: "jt2",
        name_ar: "قيود المشتريات",
        name_en: "Purchase Journal",
        type: "purchase",
        is_active: true,
      },
      {
        id: "jt3",
        name_ar: "قيود النقدية",
        name_en: "Cash Journal",
        type: "cash",
        is_active: true,
      },
      {
        id: "jt4",
        name_ar: "قيود البنك",
        name_en: "Bank Journal",
        type: "bank",
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
        label: "Journal Type",
        type: "select",
        required: true,
        options: [
          { value: "sales", label: "Sales" },
          { value: "purchase", label: "Purchase" },
          { value: "cash", label: "Cash" },
          { value: "bank", label: "Bank" },
          { value: "general", label: "General" },
        ],
      },
    ],
  },

  // ── Payment Methods ────────────────────────────────────────────────────────
  {
    key: "payment-methods",
    label: "Payment Methods",
    labelAr: "طرق الدفع",
    initialData: [
      {
        id: "pm1",
        name_ar: "نقداً",
        name_en: "Cash",
        type: "cash",
        is_active: true,
      },
      {
        id: "pm2",
        name_ar: "تحويل بنكي",
        name_en: "Bank Transfer",
        type: "bank_transfer",
        is_active: true,
      },
      {
        id: "pm3",
        name_ar: "شيك",
        name_en: "Cheque",
        type: "cheque",
        is_active: true,
      },
      {
        id: "pm4",
        name_ar: "بطاقة ائتمان",
        name_en: "Credit Card",
        type: "card",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      {
        key: "type",
        title: "Type",
        width: 130,
        render: (v: string) => <Tag color="cyan">{v?.replace("_", " ")}</Tag>,
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
        label: "Payment Type",
        type: "select",
        required: true,
        options: [
          { value: "cash", label: "Cash" },
          { value: "bank_transfer", label: "Bank Transfer" },
          { value: "cheque", label: "Cheque" },
          { value: "card", label: "Card" },
        ],
      },
    ],
  },

  // ── Invoice Statuses ───────────────────────────────────────────────────────
  {
    key: "invoice-statuses",
    label: "Invoice Statuses",
    labelAr: "حالات الفواتير",
    initialData: [
      {
        id: "is1",
        name_ar: "مسودة",
        name_en: "Draft",
        color: "#94A3B8",
        is_terminal: false,
        is_active: true,
      },
      {
        id: "is2",
        name_ar: "معلقة",
        name_en: "Pending",
        color: "#F59E0B",
        is_terminal: false,
        is_active: true,
      },
      {
        id: "is3",
        name_ar: "مدفوعة",
        name_en: "Paid",
        color: "#10B981",
        is_terminal: true,
        is_active: true,
      },
      {
        id: "is4",
        name_ar: "ملغاة",
        name_en: "Cancelled",
        color: "#EF4444",
        is_terminal: true,
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
    ],
  },

  // ── Expense Categories ─────────────────────────────────────────────────────
  {
    key: "expense-categories",
    label: "Expense Categories",
    labelAr: "فئات المصروفات",
    initialData: [
      {
        id: "ec1",
        name_ar: "رواتب",
        name_en: "Salaries",
        account: "5200",
        is_active: true,
      },
      {
        id: "ec2",
        name_ar: "إيجار",
        name_en: "Rent",
        account: "5300",
        is_active: true,
      },
      {
        id: "ec3",
        name_ar: "مرافق",
        name_en: "Utilities",
        account: "5400",
        is_active: true,
      },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      { key: "account", title: "Account Code", width: 130 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      {
        key: "name_ar",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "account", label: "Account Code", type: "text", required: false },
    ],
  },
];

export default function AccountingDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Accounting Definitions"
      moduleNameAr="التعريفات — المحاسبة"
      tabs={tabs}
    />
  );
}
