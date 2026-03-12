import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TabsWithIcons from "@/components/TabsWithIcons";
import AnimatedModal from "@/components/AnimatedModal";
import BranchSelector from "@/components/BranchSelector";
import AttachmentsTab from "@/components/AttachmentsTab";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  Clock,
  DollarSign,
  BarChart2,
  Edit,
  Download,
  CheckCircle,
  AlertCircle,
  Heart,
  Building2,
  CreditCard,
  Users,
  ExternalLink,
  ClipboardList,
  UserCog,
} from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocation } from "wouter";
import { t } from "@/i18n";

const employee = {
  id: "EMP-00142",
  name: "Sarah Johnson",
  photo: "https://i.pravatar.cc/150?img=47",
  status: "active",
  role: "Sales Manager",
  department: "Sales",
  gender: "Female",
  dob: "12 Mar 1990",
  bloodGroup: "A+",
  nationality: "American",
  religion: "Christianity",
  joinDate: "15 Jan 2023",
  contractType: "Full-time",
  branch: "Riyadh HQ",
  phone: "+1 (555) 123-4567",
  email: "sarah.johnson@company.com",
  currentAddress: "3495 Red Hawk Road, Buffalo Lake, MN 55314",
  permanentAddress: "3495 Red Hawk Road, Buffalo Lake, MN 55314",
  emergencyContacts: [
    {
      name: "Robert Johnson",
      relation: "Husband",
      phone: "+1 (555) 987-6543",
      email: "robert.j@example.com",
    },
    {
      name: "Linda Davis",
      relation: "Mother",
      phone: "+1 (555) 876-5432",
      email: "linda.d@example.com",
    },
  ],
  documents: [
    { name: "EmploymentContract.pdf", size: "1.2 MB" },
    { name: "NDA_Agreement.pdf", size: "540 KB" },
    { name: "IDProof.pdf", size: "820 KB" },
  ],
  bank: {
    bankName: "Bank of America",
    branch: "Minneapolis",
    accountNo: "****4892",
    routingNo: "026009593",
  },
  medicalHistory: {
    allergies: ["Penicillin"],
    medications: "None",
    bloodGroup: "A+",
    notes: "No chronic conditions on record.",
  },
  schedule: {
    shift: "Morning Shift",
    workDays: "Mon – Fri",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    breakDuration: "1 hour",
  },
  leaveBalance: [
    { type: "Annual Leave", total: 20, used: 8, remaining: 12 },
    { type: "Sick Leave", total: 10, used: 2, remaining: 8 },
    { type: "Emergency Leave", total: 5, used: 0, remaining: 5 },
  ],
  attendanceRecent: [
    { date: "04 Mar 2026", checkIn: "08:55 AM", checkOut: "06:05 PM", status: "present" },
    { date: "03 Mar 2026", checkIn: "09:02 AM", checkOut: "06:00 PM", status: "present" },
    { date: "02 Mar 2026", checkIn: "-", checkOut: "-", status: "absent" },
    { date: "01 Mar 2026", checkIn: "08:50 AM", checkOut: "03:30 PM", status: "half-day" },
    { date: "28 Feb 2026", checkIn: "09:00 AM", checkOut: "06:00 PM", status: "present" },
  ],
  payroll: {
    basicSalary: "$5,000",
    housingAllowance: "$800",
    transportAllowance: "$300",
    grossSalary: "$6,100",
    taxDeduction: "$610",
    netSalary: "$5,490",
    paymentMethod: "Bank Transfer",
    lastPayDate: "28 Feb 2026",
  },
  payslips: [
    { period: "February 2026", amount: "$5,490", date: "28 Feb 2026" },
    { period: "January 2026", amount: "$5,490", date: "31 Jan 2026" },
    { period: "December 2025", amount: "$5,790", date: "31 Dec 2025" },
  ],
  performance: {
    overallRating: 4.3,
    kpis: [
      { label: "Sales Target", achieved: "92%", status: "good" },
      { label: "Client Retention", achieved: "88%", status: "good" },
      { label: "Report Submission", achieved: "100%", status: "excellent" },
      { label: "Team Collaboration", achieved: "75%", status: "average" },
    ],
    lastReviewDate: "15 Jan 2026",
    nextReviewDate: "15 Jul 2026",
    reviewer: "Mark Thompson (Director)",
  },
};

const tabs = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "schedule", label: "Schedule", icon: Clock },
  { id: "attendance", label: "Leave & Attendance", icon: Calendar },
  { id: "payroll", label: "Payroll", icon: DollarSign },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "performance", label: "Performance", icon: BarChart2 },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-secondary text-muted-foreground",
    "on-leave": "bg-orange-100 text-orange-600",
    present: "bg-green-100 text-green-700",
    absent: "bg-red-100 text-red-600",
    "half-day": "bg-orange-100 text-orange-600",
    good: "bg-green-100 text-green-700",
    excellent: "bg-primary/10 text-primary",
    average: "bg-yellow-100 text-yellow-700",
  };
  return map[status] ?? "bg-secondary text-muted-foreground";
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function EmployeeDetails() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    department: employee.department,
    branchId: "",
  });

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "HR", href: "#" },
    { label: "Employee Details" },
  ];

  return (
    <DashboardLayout currentPage="Employee Details" breadcrumbs={breadcrumbs}>
      {/* Page Header */}
      <div className={`flex items-center justify-between mb-6`}>
        <div>
          <h1 className="text-xl font-bold text-foreground">Employee Details</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard / HR / Employee Details
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border flex items-center gap-2">
            <Users size={16} />
            All Employees
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit size={16} />
            Edit Employee
          </Button>
        </div>
      </div>

      <div className={`flex gap-6`}>
        {/* ── Left Panel ─────────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Profile Card */}
          <Card className="dark:bg-card bg-card shadow-sm border-0 p-5 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <img
                src={employee.photo}
                alt={employee.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-border"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${statusBadge(employee.status)}`}
            >
              {employee.status === "active" ? "Active" : employee.status}
            </span>
            <h2 className="text-base font-bold text-foreground">{employee.name}</h2>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {employee.id}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {employee.role} · {employee.department}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {employee.branch}
            </p>
          </Card>

          {/* Basic Information */}
          <Card className="dark:bg-card bg-card shadow-sm border-0 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Basic Information</h3>
            <InfoRow label="Gender" value={employee.gender} />
            <InfoRow label="Date of Birth" value={employee.dob} />
            <InfoRow label="Blood Group" value={employee.bloodGroup} />
            <InfoRow label="Nationality" value={employee.nationality} />
            <InfoRow label="Religion" value={employee.religion} />
            <InfoRow label="Join Date" value={employee.joinDate} />
            <InfoRow label="Contract Type" value={employee.contractType} />
          </Card>

          {/* Primary Contact */}
          <Card className="dark:bg-card bg-card shadow-sm border-0 p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Primary Contact</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium text-foreground">{employee.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail size={14} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email Address</p>
                <p className="text-sm font-medium text-foreground break-all">{employee.email}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Panel ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <Card className="dark:bg-card bg-card shadow-sm border-0 overflow-hidden">
            <TabsWithIcons
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isRTL={isRTL}
            />

            <div className="p-6 space-y-6">
              {/* ── Personal Details ── */}
              {activeTab === "personal" && (
                <>
                  {/* Emergency Contacts */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Emergency Contacts
                    </h3>
                    <div className="space-y-3">
                      {employee.emergencyContacts.map((contact, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={18} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {contact.name}
                              </p>
                              <p className="text-xs text-primary">{contact.relation}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium text-foreground">
                              {contact.phone}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium text-foreground">
                              {contact.email}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <User size={14} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Documents + Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
                      <div className="space-y-2">
                        {employee.documents.map((doc, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30"
                          >
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium text-foreground">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary">
                              <Download size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-4">Address</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                          <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">
                              Current Address
                            </p>
                            <p className="text-sm text-foreground">{employee.currentAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl border border-border bg-secondary/30">
                          <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">
                              Permanent Address
                            </p>
                            <p className="text-sm text-foreground">
                              {employee.permanentAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Bank Details + Medical History */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        Bank Details
                      </h3>
                      <Card className="p-4 border border-border bg-secondary/20 shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard size={18} className="text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {employee.bank.bankName}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Branch</p>
                            <p className="font-medium text-foreground">{employee.bank.branch}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Account No.</p>
                            <p className="font-medium text-foreground">
                              {employee.bank.accountNo}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Routing No.</p>
                            <p className="font-medium text-foreground">
                              {employee.bank.routingNo}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold text-foreground mb-4">
                        Medical History
                      </h3>
                      <Card className="p-4 border border-border bg-secondary/20 shadow-none">
                        <div className="flex items-center gap-2 mb-4">
                          <Heart size={18} className="text-red-500" />
                          <span className="text-sm font-semibold text-foreground">
                            Health Overview
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Blood Group</span>
                            <span className="font-medium text-foreground">
                              {employee.medicalHistory.bloodGroup}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Known Allergies</span>
                            <div className="flex gap-1">
                              {employee.medicalHistory.allergies.map((a, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-medium"
                                >
                                  {a}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Medications</span>
                            <span className="font-medium text-foreground">
                              {employee.medicalHistory.medications}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                            {employee.medicalHistory.notes}
                          </p>
                        </div>
                      </Card>
                    </section>
                  </div>
                </>
              )}

              {/* ── Schedule ── */}
              {activeTab === "schedule" && (
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Work Schedule</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: "Shift", value: employee.schedule.shift, icon: Briefcase },
                      { label: "Work Days", value: employee.schedule.workDays, icon: Calendar },
                      { label: "Start Time", value: employee.schedule.startTime, icon: Clock },
                      { label: "End Time", value: employee.schedule.endTime, icon: Clock },
                      { label: "Break Duration", value: employee.schedule.breakDuration, icon: Clock },
                    ].map(({ label, value, icon: Icon }) => (
                      <Card
                        key={label}
                        className="p-4 border border-border bg-secondary/20 shadow-none"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={16} className="text-primary" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{value}</p>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Leave & Attendance ── */}
              {activeTab === "attendance" && (
                <>
                  {/* Leave Balance */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Leave Balance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {employee.leaveBalance.map((leave) => (
                        <Card
                          key={leave.type}
                          className="p-4 border border-border bg-secondary/20 shadow-none"
                        >
                          <p className="text-xs text-muted-foreground mb-2">{leave.type}</p>
                          <div className="flex items-end gap-1 mb-2">
                            <span className="text-2xl font-bold text-foreground">
                              {leave.remaining}
                            </span>
                            <span className="text-xs text-muted-foreground mb-1">
                              / {leave.total} days
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{
                                width: `${(leave.remaining / leave.total) * 100}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {leave.used} used
                          </p>
                        </Card>
                      ))}
                    </div>
                  </section>

                  {/* Recent Attendance */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Recent Attendance
                    </h3>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-secondary/30">
                            <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">Check In</th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">Check Out</th>
                            <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employee.attendanceRecent.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                            >
                              <td className="px-4 py-3 text-foreground">{row.date}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.checkIn}</td>
                              <td className="px-4 py-3 text-muted-foreground">{row.checkOut}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge(row.status)}`}
                                >
                                  {row.status.replace("-", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </>
              )}

              {/* ── Payroll ── */}
              {activeTab === "payroll" && (
                <>
                  {/* Salary Breakdown */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Salary Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-5 border border-border bg-secondary/20 shadow-none">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                          Earnings
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Basic Salary</span>
                            <span className="font-medium text-foreground">
                              {employee.payroll.basicSalary}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Housing Allowance</span>
                            <span className="font-medium text-foreground">
                              {employee.payroll.housingAllowance}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transport Allowance</span>
                            <span className="font-medium text-foreground">
                              {employee.payroll.transportAllowance}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-border font-semibold">
                            <span className="text-foreground">Gross Salary</span>
                            <span className="text-primary">{employee.payroll.grossSalary}</span>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-5 border border-border bg-secondary/20 shadow-none">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                          Deductions & Net
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tax Deduction</span>
                            <span className="font-medium text-red-500">
                              -{employee.payroll.taxDeduction}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Method</span>
                            <span className="font-medium text-foreground">
                              {employee.payroll.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Pay Date</span>
                            <span className="font-medium text-foreground">
                              {employee.payroll.lastPayDate}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-border font-semibold">
                            <span className="text-foreground">Net Salary</span>
                            <span className="text-green-600">{employee.payroll.netSalary}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </section>

                  {/* Payslip History */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Payslip History
                    </h3>
                    <div className="space-y-2">
                      {employee.payslips.map((slip, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <DollarSign size={16} className="text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{slip.period}</p>
                              <p className="text-xs text-muted-foreground">Paid on {slip.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-foreground">
                              {slip.amount}
                            </span>
                            <Button variant="ghost" size="sm" className="text-primary">
                              <Download size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* ── Documents ── */}
              {activeTab === "documents" && (
                <AttachmentsTab entityName={`Employee: ${employee.name}`} />
              )}

              {/* ── Performance ── */}
              {activeTab === "performance" && (
                <>
                  {/* Rating Overview */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Performance Overview
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <Card className="p-4 border border-border bg-secondary/20 shadow-none col-span-1">
                        <p className="text-xs text-muted-foreground mb-1">Overall Rating</p>
                        <p className="text-4xl font-bold text-primary">
                          {employee.performance.overallRating}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
                      </Card>
                      <Card className="p-4 border border-border bg-secondary/20 shadow-none">
                        <p className="text-xs text-muted-foreground mb-1">Last Review</p>
                        <p className="text-sm font-semibold text-foreground">
                          {employee.performance.lastReviewDate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {employee.performance.reviewer}
                        </p>
                      </Card>
                      <Card className="p-4 border border-border bg-secondary/20 shadow-none">
                        <p className="text-xs text-muted-foreground mb-1">Next Review</p>
                        <p className="text-sm font-semibold text-foreground">
                          {employee.performance.nextReviewDate}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
                      </Card>
                    </div>
                  </section>

                  {/* KPIs */}
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-4">KPI Results</h3>
                    <div className="space-y-3">
                      {employee.performance.kpis.map((kpi, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/20"
                        >
                          <div className="flex items-center gap-3">
                            {kpi.status === "excellent" ? (
                              <CheckCircle size={18} className="text-primary" />
                            ) : kpi.status === "good" ? (
                              <CheckCircle size={18} className="text-green-500" />
                            ) : (
                              <AlertCircle size={18} className="text-yellow-500" />
                            )}
                            <span className="text-sm font-medium text-foreground">{kpi.label}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-foreground">{kpi.achieved}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(kpi.status)}`}
                            >
                              {kpi.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cross-Module Navigation Links */}
      <Card className="p-4 dark:bg-card bg-card shadow-sm border-0 mt-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Related Modules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate(`/leave-management?employeeId=${employee.id}`)}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Leave Requests</p>
              <p className="text-xs text-muted-foreground">View leave requests for this employee</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => navigate(`/employees?assignedTo=${employee.id}`)}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <ClipboardList size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Assigned Tasks</p>
              <p className="text-xs text-muted-foreground">View tasks assigned to this employee</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          <button
            onClick={() => navigate("/users")}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <UserCog size={16} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">User Account</p>
              <p className="text-xs text-muted-foreground">Manage user profile and permissions</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </Card>

      {/* Edit Modal */}
      <AnimatedModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Employee"
      >
        <div className="space-y-4">
          {/* Employee Number - read-only */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t("employeeNumber", language)}</label>
            <div className="px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-primary font-medium">
              {employee.id}
            </div>
          </div>
          <BranchSelector
            value={editForm.branchId}
            onChange={(branchId) => setEditForm({ ...editForm, branchId })}
          />
          {(
            [
              { label: "Full Name", key: "name", type: "text" },
              { label: "Email", key: "email", type: "email" },
              { label: "Phone", key: "phone", type: "tel" },
              { label: "Role", key: "role", type: "text" },
              { label: "Department", key: "department", type: "text" },
            ] as const
          ).map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
              <Input
                type={type}
                value={editForm[key]}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                placeholder={label}
              />
            </div>
          ))}
          <Button className="w-full bg-primary hover:bg-primary/90 text-white">
            {t("save", language)}
          </Button>
        </div>
      </AnimatedModal>
    </DashboardLayout>
  );
}
