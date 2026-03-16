import { DefinitionsPage } from "@/components/common/DefinitionsPage";
import type { TabDef } from "@/components/common/DefinitionsPage";
import {
  jobTitlesService,
  employmentTypesService,
  leaveTypesService,
  publicHolidaysService,
  terminationReasonsService,
} from "@/services/definitions.service";
import { Tag } from "antd";

const tabs: TabDef[] = [
  // ── Departments ────────────────────────────────────────────────────────────
  {
    key: "departments",
    label: "Departments",
    labelAr: "الأقسام",
    initialData: [
      {
        id: "dep1",
        nameAr: "قسم المبيعات",
        nameEn: "Sales Department",
        parent_department: "",
        manager: "Ahmed Ali",
        isActive: true,
      },
      {
        id: "dep2",
        nameAr: "قسم المالية",
        nameEn: "Finance Department",
        parent_department: "",
        manager: "Sara Hassan",
        isActive: true,
      },
      {
        id: "dep3",
        nameAr: "قسم تقنية المعلومات",
        nameEn: "IT Department",
        parent_department: "",
        manager: "Khaled Omar",
        isActive: true,
      },
      {
        id: "dep4",
        nameAr: "قسم الموارد البشرية",
        nameEn: "HR Department",
        parent_department: "",
        manager: "Fatima Said",
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "manager", title: "Manager", width: 140 },
      { key: "parent_department", title: "Parent Dept.", width: 150 },
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
        key: "parent_department",
        label: "Parent Department",
        type: "text",
        required: false,
      },
      { key: "manager", label: "Manager", type: "text", required: false },
    ],
  },

  // ── Job Titles ─────────────────────────────────────────────────────────────
  {
    key: "job-titles",
    label: "Job Titles",
    labelAr: "المسميات الوظيفية",
    service: jobTitlesService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "departmentId", title: "Department", width: 160 },
      { key: "grade", title: "Grade", width: 80 },
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
        key: "departmentId",
        label: "Department",
        type: "text",
        required: false,
      },
      { key: "grade", label: "Grade / Level", type: "text", required: false },
    ],
  },

  // ── Employment Types ───────────────────────────────────────────────────────
  {
    key: "employment-types",
    label: "Employment Types",
    labelAr: "أنواع التوظيف",
    service: employmentTypesService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "descriptionEn", title: "Description (EN)", width: 200 },
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
        key: "descriptionEn",
        label: "Description (English)",
        type: "text",
        required: false,
      },
      {
        key: "descriptionAr",
        label: "Description (Arabic) / الوصف بالعربي",
        type: "text",
        required: false,
      },
    ],
  },

  // ── Leave Types ────────────────────────────────────────────────────────────
  {
    key: "leave-types",
    label: "Leave Types",
    labelAr: "أنواع الإجازات",
    service: leaveTypesService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "daysPerYear", title: "Days/Year", width: 100 },
      {
        key: "isPaid",
        title: "Paid",
        width: 80,
        render: (v: boolean) => (
          <Tag color={v ? "green" : "default"}>{v ? "Yes" : "No"}</Tag>
        ),
      },
      {
        key: "requiresApproval",
        title: "Approval",
        width: 90,
        render: (v: boolean) => (
          <Tag color={v ? "warning" : "default"}>{v ? "Required" : "Auto"}</Tag>
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
        key: "descriptionEn",
        label: "Description (English)",
        type: "text",
        required: false,
      },
      {
        key: "descriptionAr",
        label: "Description (Arabic) / الوصف بالعربي",
        type: "text",
        required: false,
      },
      {
        key: "daysPerYear",
        label: "Days Per Year",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "isPaid",
        label: "Is Paid Leave",
        type: "switch",
        required: false,
      },
      {
        key: "requiresApproval",
        label: "Requires Approval",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Shifts ─────────────────────────────────────────────────────────────────
  {
    key: "shifts",
    label: "Shifts",
    labelAr: "الورديات",
    initialData: [
      {
        id: "sh1",
        nameAr: "وردية صباحية",
        nameEn: "Morning Shift",
        start_time: "08:00",
        end_time: "16:00",
        break_duration: 60,
        isActive: true,
      },
      {
        id: "sh2",
        nameAr: "وردية مسائية",
        nameEn: "Evening Shift",
        start_time: "16:00",
        end_time: "00:00",
        break_duration: 60,
        isActive: true,
      },
      {
        id: "sh3",
        nameAr: "وردية ليلية",
        nameEn: "Night Shift",
        start_time: "00:00",
        end_time: "08:00",
        break_duration: 60,
        isActive: false,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 160 },
      { key: "nameAr", title: "Name (AR)", width: 160 },
      { key: "start_time", title: "Start Time", width: 100 },
      { key: "end_time", title: "End Time", width: 100 },
      { key: "break_duration", title: "Break (min)", width: 110 },
    ],
    fields: [
      { key: "nameEn", label: "Name (English)", type: "text", required: true },
      {
        key: "nameAr",
        label: "Name (Arabic) / الاسم بالعربي",
        type: "text",
        required: true,
      },
      { key: "start_time", label: "Start Time", type: "time", required: true },
      { key: "end_time", label: "End Time", type: "time", required: true },
      {
        key: "break_duration",
        label: "Break Duration (minutes)",
        type: "number",
        required: false,
        min: 0,
      },
    ],
  },

  // ── Salary Components ──────────────────────────────────────────────────────
  {
    key: "salary-components",
    label: "Salary Components",
    labelAr: "مكونات الراتب",
    initialData: [
      {
        id: "sc1",
        nameAr: "راتب أساسي",
        nameEn: "Basic Salary",
        type: "allowance",
        is_taxable: true,
        isActive: true,
      },
      {
        id: "sc2",
        nameAr: "بدل سكن",
        nameEn: "Housing Allowance",
        type: "allowance",
        is_taxable: false,
        isActive: true,
      },
      {
        id: "sc3",
        nameAr: "خصم التأخر",
        nameEn: "Tardiness Deduction",
        type: "deduction",
        is_taxable: false,
        isActive: true,
      },
      {
        id: "sc4",
        nameAr: "مكافأة أداء",
        nameEn: "Performance Bonus",
        type: "bonus",
        is_taxable: true,
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
        render: (v: string) => {
          const colors: Record<string, string> = {
            allowance: "green",
            deduction: "red",
            bonus: "gold",
          };
          return <Tag color={colors[v] ?? "default"}>{v}</Tag>;
        },
      },
      {
        key: "is_taxable",
        title: "Taxable",
        width: 90,
        render: (v: boolean) => (
          <Tag color={v ? "orange" : "default"}>{v ? "Yes" : "No"}</Tag>
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
      {
        key: "is_taxable",
        label: "Is Taxable",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Grades & Levels ────────────────────────────────────────────────────────
  {
    key: "grades",
    label: "Grades & Levels",
    labelAr: "الدرجات الوظيفية",
    initialData: [
      {
        id: "gr1",
        nameAr: "درجة 1 - مبتدئ",
        nameEn: "Grade 1 - Junior",
        min_salary: 3000,
        max_salary: 6000,
        isActive: true,
      },
      {
        id: "gr2",
        nameAr: "درجة 2 - متوسط",
        nameEn: "Grade 2 - Mid",
        min_salary: 6001,
        max_salary: 12000,
        isActive: true,
      },
      {
        id: "gr3",
        nameAr: "درجة 3 - خبير",
        nameEn: "Grade 3 - Senior",
        min_salary: 12001,
        max_salary: 20000,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "min_salary",
        title: "Min Salary",
        width: 110,
        render: (v: number) => v?.toLocaleString(),
      },
      {
        key: "max_salary",
        title: "Max Salary",
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
      {
        key: "min_salary",
        label: "Min Salary",
        type: "number",
        required: true,
        min: 0,
      },
      {
        key: "max_salary",
        label: "Max Salary",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // ── Termination Reasons ────────────────────────────────────────────────────
  {
    key: "termination-reasons",
    label: "Termination Reasons",
    labelAr: "أسباب إنهاء الخدمة",
    service: terminationReasonsService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "type",
        title: "Type",
        width: 130,
        render: (v: string) => {
          const colors: Record<string, string> = {
            voluntary: "blue",
            involuntary: "red",
            end_of_contract: "orange",
            retirement: "green",
          };
          return <Tag color={colors[v] ?? "default"}>{v}</Tag>;
        },
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
        label: "Termination Type",
        type: "select",
        required: true,
        options: [
          { value: "voluntary", label: "Voluntary" },
          { value: "involuntary", label: "Involuntary" },
          { value: "end_of_contract", label: "End of Contract" },
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
      {
        id: "dt1",
        nameAr: "جواز سفر",
        nameEn: "Passport",
        is_required: true,
        expiry_required: true,
        isActive: true,
      },
      {
        id: "dt2",
        nameAr: "بطاقة هوية",
        nameEn: "National ID",
        is_required: true,
        expiry_required: true,
        isActive: true,
      },
      {
        id: "dt3",
        nameAr: "شهادة تعليمية",
        nameEn: "Educational Certificate",
        is_required: false,
        expiry_required: false,
        isActive: true,
      },
    ],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 200 },
      { key: "nameAr", title: "Name (AR)", width: 200 },
      {
        key: "is_required",
        title: "Required",
        width: 90,
        render: (v: boolean) => (
          <Tag color={v ? "red" : "default"}>{v ? "Yes" : "No"}</Tag>
        ),
      },
      {
        key: "expiry_required",
        title: "Has Expiry",
        width: 100,
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
        key: "is_required",
        label: "Is Required",
        type: "switch",
        required: false,
      },
      {
        key: "expiry_required",
        label: "Has Expiry Date",
        type: "switch",
        required: false,
      },
    ],
  },

  // ── Public Holidays ────────────────────────────────────────────────────────
  {
    key: "public-holidays",
    label: "Public Holidays",
    labelAr: "الإجازات الرسمية",
    service: publicHolidaysService,
    initialData: [],
    columns: [
      { key: "nameEn", title: "Name (EN)", width: 180 },
      { key: "nameAr", title: "Name (AR)", width: 180 },
      { key: "date", title: "Date", width: 110 },
      {
        key: "isRecurring",
        title: "Recurring",
        width: 100,
        render: (v: boolean) => (
          <Tag color={v ? "blue" : "default"}>{v ? "Yearly" : "One-time"}</Tag>
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
      { key: "date", label: "Date", type: "date", required: true },
      {
        key: "isRecurring",
        label: "Recurring Annually",
        type: "switch",
        required: false,
      },
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
