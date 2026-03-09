import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Departments ────────────────────────────────────────────────────────────
  {
    key: "departments",
    label: "Departments",
    labelAr: "الأقسام",
    initialData: [
      { id: "dep1", name_ar: "قسم المبيعات", name_en: "Sales Department", parent_department: "", manager: "Ahmed Ali", is_active: true },
      { id: "dep2", name_ar: "قسم المالية", name_en: "Finance Department", parent_department: "", manager: "Sara Hassan", is_active: true },
      { id: "dep3", name_ar: "قسم تقنية المعلومات", name_en: "IT Department", parent_department: "", manager: "Khaled Omar", is_active: true },
      { id: "dep4", name_ar: "قسم الموارد البشرية", name_en: "HR Department", parent_department: "", manager: "Fatima Said", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "parent_department", title: "Parent Dept.", width: 150 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "parent_department", label: "Parent Department", type: "text", required: false },
      { key: "manager", label: "Manager", type: "text", required: false },
    ],
  },

  // ── Job Titles ─────────────────────────────────────────────────────────────
  {
    key: "job-titles",
    label: "Job Titles",
    labelAr: "المسميات الوظيفية",
    initialData: [
      { id: "jt1", name_ar: "مدير مبيعات", name_en: "Sales Manager", department: "Sales Department", grade: "G5", is_active: true },
      { id: "jt2", name_ar: "محاسب", name_en: "Accountant", department: "Finance Department", grade: "G3", is_active: true },
      { id: "jt3", name_ar: "مطور برمجيات", name_en: "Software Developer", department: "IT Department", grade: "G4", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "department", title: "Department", width: 160 },
      { key: "grade", title: "Grade", width: 80 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "department", label: "Department", type: "text", required: false },
      { key: "grade", label: "Grade / Level", type: "text", required: false },
    ],
  },

  // ── Employment Types ───────────────────────────────────────────────────────
  {
    key: "employment-types",
    label: "Employment Types",
    labelAr: "أنواع التوظيف",
    initialData: [
      { id: "et1", name_ar: "دوام كامل", name_en: "Full-Time", is_active: true },
      { id: "et2", name_ar: "دوام جزئي", name_en: "Part-Time", is_active: true },
      { id: "et3", name_ar: "عقد مؤقت", name_en: "Contract", is_active: true },
      { id: "et4", name_ar: "متدرب", name_en: "Intern", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 220 },
      { key: "name_ar", title: "Name (AR)", width: 220 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
    ],
  },

  // ── Leave Types ────────────────────────────────────────────────────────────
  {
    key: "leave-types",
    label: "Leave Types",
    labelAr: "أنواع الإجازات",
    initialData: [
      { id: "lt1", name_ar: "إجازة سنوية", name_en: "Annual Leave", days_per_year: 21, is_paid: true, requires_approval: true, is_active: true },
      { id: "lt2", name_ar: "إجازة مرضية", name_en: "Sick Leave", days_per_year: 15, is_paid: true, requires_approval: false, is_active: true },
      { id: "lt3", name_ar: "إجازة غير مدفوعة", name_en: "Unpaid Leave", days_per_year: 30, is_paid: false, requires_approval: true, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "days_per_year", title: "Days/Year", width: 100 },
      {
        key: "is_paid",
        title: "Paid",
        width: 80,
        render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>,
      },
      {
        key: "requires_approval",
        title: "Approval",
        width: 90,
        render: (v: boolean) => <Tag color={v ? "warning" : "default"}>{v ? "Required" : "Auto"}</Tag>,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "days_per_year", label: "Days Per Year", type: "number", required: true, min: 0 },
      { key: "is_paid", label: "Is Paid Leave", type: "switch", required: false },
      { key: "requires_approval", label: "Requires Approval", type: "switch", required: false },
    ],
  },

  // ── Shifts ─────────────────────────────────────────────────────────────────
  {
    key: "shifts",
    label: "Shifts",
    labelAr: "الورديات",
    initialData: [
      { id: "sh1", name_ar: "وردية صباحية", name_en: "Morning Shift", start_time: "08:00", end_time: "16:00", break_duration: 60, is_active: true },
      { id: "sh2", name_ar: "وردية مسائية", name_en: "Evening Shift", start_time: "16:00", end_time: "00:00", break_duration: 60, is_active: true },
      { id: "sh3", name_ar: "وردية ليلية", name_en: "Night Shift", start_time: "00:00", end_time: "08:00", break_duration: 60, is_active: false },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 160 },
      { key: "name_ar", title: "Name (AR)", width: 160 },
      { key: "start_time", title: "Start Time", width: 100 },
      { key: "end_time", title: "End Time", width: 100 },
      { key: "break_duration", title: "Break (min)", width: 110 },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "start_time", label: "Start Time", type: "time", required: true },
      { key: "end_time", label: "End Time", type: "time", required: true },
      { key: "break_duration", label: "Break Duration (minutes)", type: "number", required: false, min: 0 },
    ],
  },

  // ── Salary Components ──────────────────────────────────────────────────────
  {
    key: "salary-components",
    label: "Salary Components",
    labelAr: "مكونات الراتب",
    initialData: [
      { id: "sc1", name_ar: "راتب أساسي", name_en: "Basic Salary", type: "allowance", is_taxable: true, is_active: true },
      { id: "sc2", name_ar: "بدل سكن", name_en: "Housing Allowance", type: "allowance", is_taxable: false, is_active: true },
      { id: "sc3", name_ar: "خصم التأخر", name_en: "Tardiness Deduction", type: "deduction", is_taxable: false, is_active: true },
      { id: "sc4", name_ar: "مكافأة أداء", name_en: "Performance Bonus", type: "bonus", is_taxable: true, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      {
        key: "type",
        title: "Type",
        width: 110,
        render: (v: string) => {
          const colors: Record<string, string> = { allowance: "green", deduction: "red", bonus: "gold" };
          return <Tag color={colors[v] ?? "default"}>{v}</Tag>;
        },
      },
      {
        key: "is_taxable",
        title: "Taxable",
        width: 90,
        render: (v: boolean) => <Tag color={v ? "orange" : "default"}>{v ? "Yes" : "No"}</Tag>,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      {
        key: "type",
        label: "Component Type",
        type: "select",
        required: true,
        options: [
          { value: "allowance", label: "Allowance" },
          { value: "deduction", label: "Deduction" },
          { value: "bonus", label: "Bonus" },
        ],
      },
      { key: "is_taxable", label: "Is Taxable", type: "switch", required: false },
    ],
  },

  // ── Grades & Levels ────────────────────────────────────────────────────────
  {
    key: "grades",
    label: "Grades & Levels",
    labelAr: "الدرجات الوظيفية",
    initialData: [
      { id: "gr1", name_ar: "درجة 1 - مبتدئ", name_en: "Grade 1 - Junior", min_salary: 3000, max_salary: 6000, is_active: true },
      { id: "gr2", name_ar: "درجة 2 - متوسط", name_en: "Grade 2 - Mid", min_salary: 6001, max_salary: 12000, is_active: true },
      { id: "gr3", name_ar: "درجة 3 - خبير", name_en: "Grade 3 - Senior", min_salary: 12001, max_salary: 20000, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      { key: "min_salary", title: "Min Salary", width: 110, render: (v: number) => v?.toLocaleString() },
      { key: "max_salary", title: "Max Salary", width: 110, render: (v: number) => v?.toLocaleString() },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "min_salary", label: "Min Salary", type: "number", required: true, min: 0 },
      { key: "max_salary", label: "Max Salary", type: "number", required: true, min: 0 },
    ],
  },

  // ── Termination Reasons ────────────────────────────────────────────────────
  {
    key: "termination-reasons",
    label: "Termination Reasons",
    labelAr: "أسباب إنهاء الخدمة",
    initialData: [
      { id: "tr1", name_ar: "استقالة", name_en: "Resignation", type: "resignation", is_active: true },
      { id: "tr2", name_ar: "فصل تأديبي", name_en: "Disciplinary Termination", type: "termination", is_active: true },
      { id: "tr3", name_ar: "تقاعد", name_en: "Retirement", type: "retirement", is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      {
        key: "type",
        title: "Type",
        width: 130,
        render: (v: string) => <Tag color="blue">{v}</Tag>,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      {
        key: "type",
        label: "Termination Type",
        type: "select",
        required: true,
        options: [
          { value: "resignation", label: "Resignation" },
          { value: "termination", label: "Termination" },
          { value: "retirement", label: "Retirement" },
        ],
      },
    ],
  },

  // ── Document Types ─────────────────────────────────────────────────────────
  {
    key: "document-types",
    label: "Document Types",
    labelAr: "أنواع الوثائق",
    initialData: [
      { id: "dt1", name_ar: "جواز سفر", name_en: "Passport", is_required: true, expiry_required: true, is_active: true },
      { id: "dt2", name_ar: "بطاقة هوية", name_en: "National ID", is_required: true, expiry_required: true, is_active: true },
      { id: "dt3", name_ar: "شهادة تعليمية", name_en: "Educational Certificate", is_required: false, expiry_required: false, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 200 },
      { key: "name_ar", title: "Name (AR)", width: 200 },
      {
        key: "is_required",
        title: "Required",
        width: 90,
        render: (v: boolean) => <Tag color={v ? "red" : "default"}>{v ? "Yes" : "No"}</Tag>,
      },
      {
        key: "expiry_required",
        title: "Has Expiry",
        width: 100,
        render: (v: boolean) => <Tag color={v ? "warning" : "default"}>{v ? "Yes" : "No"}</Tag>,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "is_required", label: "Is Required", type: "switch", required: false },
      { key: "expiry_required", label: "Has Expiry Date", type: "switch", required: false },
    ],
  },

  // ── Public Holidays ────────────────────────────────────────────────────────
  {
    key: "public-holidays",
    label: "Public Holidays",
    labelAr: "الإجازات الرسمية",
    initialData: [
      { id: "ph1", name_ar: "رأس السنة الميلادية", name_en: "New Year's Day", date: "2025-01-01", is_recurring: true, is_active: true },
      { id: "ph2", name_ar: "يوم العمال", name_en: "Labor Day", date: "2025-05-01", is_recurring: true, is_active: true },
      { id: "ph3", name_ar: "اليوم الوطني", name_en: "National Day", date: "2025-09-23", is_recurring: true, is_active: true },
    ],
    columns: [
      { key: "name_en", title: "Name (EN)", width: 180 },
      { key: "name_ar", title: "Name (AR)", width: 180 },
      { key: "date", title: "Date", width: 110 },
      {
        key: "is_recurring",
        title: "Recurring",
        width: 100,
        render: (v: boolean) => <Tag color={v ? "blue" : "default"}>{v ? "Yearly" : "One-time"}</Tag>,
      },
    ],
    fields: [
      { key: "name_en", label: "Name (English)", type: "text", required: true },
      { key: "name_ar", label: "Name (Arabic) / الاسم بالعربي", type: "text", required: true },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "is_recurring", label: "Recurring Annually", type: "switch", required: false },
    ],
  },
];

export default function HRDefinitions() {
  return (
    <DefinitionsPage
      moduleName="HR Definitions"
      moduleNameAr="التعريفات — الموارد البشرية"
      tabs={tabs}
      formDesign={3}
    />
  );
}
