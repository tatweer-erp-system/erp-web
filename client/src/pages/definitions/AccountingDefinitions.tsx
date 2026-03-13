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
        nameAr: "الأصول المتداولة",
        nameEn: "Current Assets",
        code: "1100",
        type: "asset",
        parent_account: "",
        isActive: true,
      },
      {
        id: "coa2",
        nameAr: "الالتزامات المتداولة",
        nameEn: "Current Liabilities",
        code: "2100",
        type: "liability",
        parent_account: "",
        isActive: true,
      },
      {
        id: "coa3",
        nameAr: "إيرادات المبيعات",
        nameEn: "Sales Revenue",
        code: "4100",
        type: "revenue",
        parent_account: "",
        isActive: true,
      },
      {
        id: "coa4",
        nameAr: "تكلفة البضاعة المباعة",
        nameEn: "Cost of Goods Sold",
        code: "5100",
        type: "expense",
        parent_account: "",
        isActive: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 80 },
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "قسم المبيعات",
        nameEn: "Sales Department",
        code: "CC-001",
        manager: "Ahmed Ali",
        department: "Sales",
        isActive: true,
      },
      {
        id: "cc2",
        nameAr: "قسم التشغيل",
        nameEn: "Operations",
        code: "CC-002",
        manager: "Sara Hassan",
        department: "Operations",
        isActive: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 90 },
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "department", title: "Department", width: 140 },
    ],
    fields: [
      { key: "code", label: "Code", type: "text", required: true },
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "ضريبة القيمة المضافة 15%",
        nameEn: "VAT 15%",
        rate_percentage: 15,
        type: "VAT",
        applies_to: "All Goods",
        isActive: true,
      },
      {
        id: "tc2",
        nameAr: "ضريبة القيمة المضافة 5%",
        nameEn: "VAT 5%",
        rate_percentage: 5,
        type: "VAT",
        applies_to: "Basic Goods",
        isActive: true,
      },
      {
        id: "tc3",
        nameAr: "معفى",
        nameEn: "Exempt",
        rate_percentage: 0,
        type: "VAT",
        applies_to: "Exempt Items",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "دولار أمريكي",
        nameEn: "US Dollar",
        code: "USD",
        symbol: "$",
        exchange_rate: 1,
        is_default: true,
        isActive: true,
      },
      {
        id: "cur2",
        nameAr: "يورو",
        nameEn: "Euro",
        code: "EUR",
        symbol: "€",
        exchange_rate: 0.92,
        is_default: false,
        isActive: true,
      },
      {
        id: "cur3",
        nameAr: "جنيه مصري",
        nameEn: "Egyptian Pound",
        code: "EGP",
        symbol: "£",
        exchange_rate: 48.5,
        is_default: false,
        isActive: true,
      },
    ],
    columns: [
      { key: "code", title: "Code", width: 70 },
      { key: "nameEn", title: "Name (EN)", width: 150 },
      { key: "nameAr", title: "Name (AR)", width: 150 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "السنة المالية 2024",
        nameEn: "FY 2024",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        is_current: false,
        is_closed: true,
        isActive: true,
      },
      {
        id: "fy2",
        nameAr: "السنة المالية 2025",
        nameEn: "FY 2025",
        start_date: "2025-01-01",
        end_date: "2025-12-31",
        is_current: true,
        is_closed: false,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 140 },
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
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
        nameAr: "قيود المبيعات",
        nameEn: "Sales Journal",
        type: "sales",
        isActive: true,
      },
      {
        id: "jt2",
        nameAr: "قيود المشتريات",
        nameEn: "Purchase Journal",
        type: "purchase",
        isActive: true,
      },
      {
        id: "jt3",
        nameAr: "قيود النقدية",
        nameEn: "Cash Journal",
        type: "cash",
        isActive: true,
      },
      {
        id: "jt4",
        nameAr: "قيود البنك",
        nameEn: "Bank Journal",
        type: "bank",
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
        nameAr: "نقداً",
        nameEn: "Cash",
        type: "cash",
        isActive: true,
      },
      {
        id: "pm2",
        nameAr: "تحويل بنكي",
        nameEn: "Bank Transfer",
        type: "bank_transfer",
        isActive: true,
      },
      {
        id: "pm3",
        nameAr: "شيك",
        nameEn: "Cheque",
        type: "cheque",
        isActive: true,
      },
      {
        id: "pm4",
        nameAr: "بطاقة ائتمان",
        nameEn: "Credit Card",
        type: "card",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      {
        key: "type",
        title: "Type",
        width: 130,
        render: (v: string) => <Tag color="cyan">{v?.replace("_", " ")}</Tag>,
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
        nameAr: "مسودة",
        nameEn: "Draft",
        color: "#94A3B8",
        is_terminal: false,
        isActive: true,
      },
      {
        id: "is2",
        nameAr: "معلقة",
        nameEn: "Pending",
        color: "#F59E0B",
        is_terminal: false,
        isActive: true,
      },
      {
        id: "is3",
        nameAr: "مدفوعة",
        nameEn: "Paid",
        color: "#10B981",
        is_terminal: true,
        isActive: true,
      },
      {
        id: "is4",
        nameAr: "ملغاة",
        nameEn: "Cancelled",
        color: "#EF4444",
        is_terminal: true,
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
        nameAr: "رواتب",
        nameEn: "Salaries",
        account: "5200",
        isActive: true,
      },
      {
        id: "ec2",
        nameAr: "إيجار",
        nameEn: "Rent",
        account: "5300",
        isActive: true,
      },
      {
        id: "ec3",
        nameAr: "مرافق",
        nameEn: "Utilities",
        account: "5400",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      { key: "account", title: "Account Code", width: 130 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
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
