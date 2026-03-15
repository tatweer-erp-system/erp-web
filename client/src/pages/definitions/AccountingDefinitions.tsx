import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
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
      {
        id: "cc3",
        nameAr: "قسم الإدارة",
        nameEn: "Administration",
        code: "CC-003",
        manager: "Khalid Omar",
        department: "Admin",
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

  // ── Expense Categories ─────────────────────────────────────────────────────
  {
    key: "expense-categories",
    label: "Expense Categories",
    labelAr: "فئات المصروفات",
    initialData: [
      {
        id: "ec1",
        nameAr: "رواتب وأجور",
        nameEn: "Salaries & Wages",
        account: "5201",
        isActive: true,
      },
      {
        id: "ec2",
        nameAr: "إيجار",
        nameEn: "Rent",
        account: "5101",
        isActive: true,
      },
      {
        id: "ec3",
        nameAr: "مرافق",
        nameEn: "Utilities",
        account: "5101",
        isActive: true,
      },
      {
        id: "ec4",
        nameAr: "تسويق وإعلان",
        nameEn: "Marketing & Advertising",
        account: "5101",
        isActive: true,
      },
      {
        id: "ec5",
        nameAr: "صيانة وإصلاحات",
        nameEn: "Maintenance & Repairs",
        account: "5101",
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
