import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Bank Accounts ──────────────────────────────────────────────────────────
  {
    key: "bank-accounts",
    label: "Bank Accounts",
    labelAr: "الحسابات البنكية",
    initialData: [
      {
        id: "ba1",
        nameAr: "حساب البنك الأهلي",
        nameEn: "National Bank Account",
        bank_name: "National Bank",
        account_number: "0123456789",
        IBAN: "SA0012345678901234567890",
        currency: "SAR",
        branch: "Main Branch",
        is_default: true,
        isActive: true,
      },
      {
        id: "ba2",
        nameAr: "حساب بنك القاهرة",
        nameEn: "Cairo Bank Account",
        bank_name: "Cairo Bank",
        account_number: "9876543210",
        IBAN: "EG009876543210987654321098",
        currency: "EGP",
        branch: "Cairo Branch",
        is_default: false,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "bank_name", title: "Bank Name", width: 150 },
      { key: "account_number", title: "Account No.", width: 130 },
      { key: "currency", title: "Currency", width: 90 },
      { key: "branch", title: "Branch", width: 130 },
      {
        key: "is_default",
        title: "Default",
        width: 80,
        render: (v: boolean) => (v ? <Tag color="green">Default</Tag> : null),
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
      { key: "bank_name", label: "Bank Name", type: "text", required: true },
      {
        key: "account_number",
        label: "Account Number",
        type: "text",
        required: true,
      },
      { key: "IBAN", label: "IBAN", type: "text", required: false },
      { key: "currency", label: "Currency", type: "text", required: true },
      { key: "branch", label: "Branch", type: "text", required: false },
      {
        key: "is_default",
        label: "Set as Default Account",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Cash Registers ─────────────────────────────────────────────────────────
  {
    key: "cash-registers",
    label: "Cash Registers",
    labelAr: "الصناديق النقدية",
    initialData: [
      {
        id: "cr1",
        nameAr: "صندوق الفرع الرئيسي",
        nameEn: "Main Branch Register",
        branch: "Main Branch",
        responsible_user: "Ahmed Ali",
        current_balance: 5000,
        isActive: true,
      },
      {
        id: "cr2",
        nameAr: "صندوق فرع دبي",
        nameEn: "Dubai Branch Register",
        branch: "Dubai Branch",
        responsible_user: "Sara Hassan",
        current_balance: 8000,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      { key: "branch", title: "Branch", width: 140 },
      { key: "responsible_user", title: "Responsible User", width: 150 },
      {
        key: "current_balance",
        title: "Balance",
        width: 110,
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
      { key: "branch", label: "Branch", type: "text", required: true },
      {
        key: "responsible_user",
        label: "Responsible User",
        type: "text",
        required: false,
      },
      {
        key: "current_balance",
        label: "Current Balance",
        type: "number",
        required: false,
        min: 0,
      },
    ],
  },

  // ── Transaction Types ──────────────────────────────────────────────────────
  {
    key: "transaction-types",
    label: "Transaction Types",
    labelAr: "أنواع المعاملات",
    initialData: [
      {
        id: "tt1",
        nameAr: "إيداع",
        nameEn: "Deposit",
        direction: "in",
        affects_account: "Cash Account",
        isActive: true,
      },
      {
        id: "tt2",
        nameAr: "سحب",
        nameEn: "Withdrawal",
        direction: "out",
        affects_account: "Cash Account",
        isActive: true,
      },
      {
        id: "tt3",
        nameAr: "تحويل",
        nameEn: "Transfer",
        direction: "in",
        affects_account: "Bank Account",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      {
        key: "direction",
        title: "Direction",
        width: 90,
        render: (v: string) => (
          <Tag color={v === "in" ? "success" : "error"}>
            {v === "in" ? "▲ In" : "▼ Out"}
          </Tag>
        ),
      },
      { key: "affects_account", title: "Affects Account", width: 160 },
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
        key: "direction",
        label: "Direction",
        type: "select",
        required: true,
        options: [
          { value: "in", label: "In (Credit)" },
          { value: "out", label: "Out (Debit)" },
        ],
      },
      {
        key: "affects_account",
        label: "Affects Account",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Cheque Statuses ────────────────────────────────────────────────────────
  {
    key: "cheque-statuses",
    label: "Cheque Statuses",
    labelAr: "حالات الشيكات",
    initialData: [
      {
        id: "cs1",
        nameAr: "في الانتظار",
        nameEn: "Pending",
        color: "#F59E0B",
        isActive: true,
      },
      {
        id: "cs2",
        nameAr: "تم الصرف",
        nameEn: "Cleared",
        color: "#10B981",
        isActive: true,
      },
      {
        id: "cs3",
        nameAr: "مرتجع",
        nameEn: "Bounced",
        color: "#EF4444",
        isActive: true,
      },
      {
        id: "cs4",
        nameAr: "ملغى",
        nameEn: "Cancelled",
        color: "#94A3B8",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
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

  // ── Transfer Reasons ───────────────────────────────────────────────────────
  {
    key: "transfer-reasons",
    label: "Transfer Reasons",
    labelAr: "أسباب التحويل",
    initialData: [
      {
        id: "tr1",
        nameAr: "دفع فواتير",
        nameEn: "Bill Payment",
        isActive: true,
      },
      {
        id: "tr2",
        nameAr: "رواتب موظفين",
        nameEn: "Employee Salaries",
        isActive: true,
      },
      {
        id: "tr3",
        nameAr: "تحويل داخلي",
        nameEn: "Internal Transfer",
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

  // ── Petty Cash Categories ──────────────────────────────────────────────────
  {
    key: "petty-cash",
    label: "Petty Cash Categories",
    labelAr: "فئات العهد النثرية",
    initialData: [
      {
        id: "pc1",
        nameAr: "مواصلات",
        nameEn: "Transportation",
        max_amount: 200,
        account: "5500",
        isActive: true,
      },
      {
        id: "pc2",
        nameAr: "ضيافة",
        nameEn: "Hospitality",
        max_amount: 500,
        account: "5600",
        isActive: true,
      },
      {
        id: "pc3",
        nameAr: "قرطاسية",
        nameEn: "Stationery",
        max_amount: 100,
        account: "5700",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      {
        key: "max_amount",
        title: "Max Amount",
        width: 120,
        render: (v: number) => v?.toLocaleString(),
      },
      { key: "account", title: "Account Code", width: 120 },
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
        key: "max_amount",
        label: "Max Amount",
        type: "number",
        required: true,
        min: 0,
      },
      { key: "account", label: "Account Code", type: "text", required: false },
    ],
  },
];

export default function TreasuryDefinitions() {
  return (
    <DefinitionsPage
      moduleName="Treasury Definitions"
      moduleNameAr="التعريفات — الخزينة"
      tabs={tabs}
    />
  );
}
