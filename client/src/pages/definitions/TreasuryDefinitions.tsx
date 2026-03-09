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
      { id: "ba1", name_ar: "حساب البنك الأهلي", name_en: "National Bank Account", bank_name: "National Bank", account_number: "0123456789", IBAN: "SA0012345678901234567890", currency: "SAR", branch: "Main Branch", is_default: true, is_active: true },
      { id: "ba2", name_ar: "حساب بنك القاهرة", name_en: "Cairo Bank Account", bank_name: "Cairo Bank", account_number: "9876543210", IBAN: "EG009876543210987654321098", currency: "EGP", branch: "Cairo Branch", is_default: false, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "bank_name", title: "Bank Name", width: 150 },
      { key: "account_number", title: "Account No.", width: 130 },
      { key: "currency", title: "Currency", width: 90 },
      { key: "branch", title: "Branch", width: 130 },
      {
        key: "is_default",
        title: "Default",
        width: 80,
        render: (v: boolean) => v ? <Tag color="green">Default</Tag> : null,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "bank_name", label: "Bank Name", type: "text", required: true },
      { key: "account_number", label: "Account Number", type: "text", required: true },
      { key: "IBAN", label: "IBAN", type: "text", required: false },
      { key: "currency", label: "Currency", type: "text", required: true },
      { key: "branch", label: "Branch", type: "text", required: false },
      { key: "is_default", label: "Set as Default Account", type: "switch", required: false },
    ],
  },

  // ── Cash Registers ─────────────────────────────────────────────────────────
  {
    key: "cash-registers",
    label: "Cash Registers",
    labelAr: "الصناديق النقدية",
    initialData: [
      { id: "cr1", name_ar: "صندوق الفرع الرئيسي", name_en: "Main Branch Register", branch: "Main Branch", responsible_user: "Ahmed Ali", current_balance: 5000, is_active: true },
      { id: "cr2", name_ar: "صندوق فرع دبي", name_en: "Dubai Branch Register", branch: "Dubai Branch", responsible_user: "Sara Hassan", current_balance: 8000, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      { key: "branch", title: "Branch", width: 140 },
      { key: "responsible_user", title: "Responsible User", width: 150 },
      { key: "current_balance", title: "Balance", width: 110, render: (v: number) => v?.toLocaleString() },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "branch", label: "Branch", type: "text", required: true },
      { key: "responsible_user", label: "Responsible User", type: "text", required: false },
      { key: "current_balance", label: "Current Balance", type: "number", required: false, min: 0 },
    ],
  },

  // ── Transaction Types ──────────────────────────────────────────────────────
  {
    key: "transaction-types",
    label: "Transaction Types",
    labelAr: "أنواع المعاملات",
    initialData: [
      { id: "tt1", name_ar: "إيداع", name_en: "Deposit", direction: "in", affects_account: "Cash Account", is_active: true },
      { id: "tt2", name_ar: "سحب", name_en: "Withdrawal", direction: "out", affects_account: "Cash Account", is_active: true },
      { id: "tt3", name_ar: "تحويل", name_en: "Transfer", direction: "in", affects_account: "Bank Account", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      {
        key: "direction",
        title: "Direction",
        width: 90,
        render: (v: string) => <Tag color={v === "in" ? "success" : "error"}>{v === "in" ? "▲ In" : "▼ Out"}</Tag>,
      },
      { key: "affects_account", title: "Affects Account", width: 160 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
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
      { key: "affects_account", label: "Affects Account", type: "text", required: false },
    ],
  },

  // ── Cheque Statuses ────────────────────────────────────────────────────────
  {
    key: "cheque-statuses",
    label: "Cheque Statuses",
    labelAr: "حالات الشيكات",
    initialData: [
      { id: "cs1", name_ar: "في الانتظار", name_en: "Pending", color: "#F59E0B", is_active: true },
      { id: "cs2", name_ar: "تم الصرف", name_en: "Cleared", color: "#10B981", is_active: true },
      { id: "cs3", name_ar: "مرتجع", name_en: "Bounced", color: "#EF4444", is_active: true },
      { id: "cs4", name_ar: "ملغى", name_en: "Cancelled", color: "#94A3B8", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      {
        key: "color",
        title: "Color",
        width: 80,
        render: (v: string) => (
          <span style={{ display: "inline-block", width: 20, height: 20, borderRadius: 4, background: v, border: "1px solid #ccc" }} />
        ),
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "color", label: "Color", type: "color", required: false },
    ],
  },

  // ── Transfer Reasons ───────────────────────────────────────────────────────
  {
    key: "transfer-reasons",
    label: "Transfer Reasons",
    labelAr: "أسباب التحويل",
    initialData: [
      { id: "tr1", name_ar: "دفع فواتير", name_en: "Bill Payment", is_active: true },
      { id: "tr2", name_ar: "رواتب موظفين", name_en: "Employee Salaries", is_active: true },
      { id: "tr3", name_ar: "تحويل داخلي", name_en: "Internal Transfer", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 240 },
      { key: "name_ar", title: "Name (AR)", width: 240 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
    ],
  },

  // ── Petty Cash Categories ──────────────────────────────────────────────────
  {
    key: "petty-cash",
    label: "Petty Cash Categories",
    labelAr: "فئات العهد النثرية",
    initialData: [
      { id: "pc1", name_ar: "مواصلات", name_en: "Transportation", max_amount: 200, account: "5500", is_active: true },
      { id: "pc2", name_ar: "ضيافة", name_en: "Hospitality", max_amount: 500, account: "5600", is_active: true },
      { id: "pc3", name_ar: "قرطاسية", name_en: "Stationery", max_amount: 100, account: "5700", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "max_amount", title: "Max Amount", width: 120, render: (v: number) => v?.toLocaleString() },
      { key: "account", title: "Account Code", width: 120 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "max_amount", label: "Max Amount", type: "number", required: true, min: 0 },
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
