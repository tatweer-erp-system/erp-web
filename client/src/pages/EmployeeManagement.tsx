import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
  MoreVertical,
} from "lucide-react";
import { AnimatedModal } from "@/components/AnimatedModal";
import { BranchSelector } from "@/components/BranchSelector";
import { BulkActions } from "@/components/BulkActions";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLangStore } from "@/stores/lang.store";
import { t } from "@/i18n";
import { EmployeeStatus } from "@/constants/enums";

const employeesData = [
  {
    id: 1,
    employeeNumber: "EMP-RYD-00001",
    name: "Sarah Johnson",
    role: "Sales Manager",
    department: "Sales",
    email: "sarah@company.com",
    phone: "+1 (555) 123-4567",
    status: EmployeeStatus.ACTIVE,
    joinDate: "Jan 15, 2023",
    branch: "Riyadh HQ",
  },
  {
    id: 2,
    employeeNumber: "EMP-JED-00002",
    name: "Michael Chen",
    role: "Software Developer",
    department: "IT",
    email: "michael@company.com",
    phone: "+1 (555) 234-5678",
    status: EmployeeStatus.ACTIVE,
    joinDate: "Mar 20, 2023",
    branch: "Jeddah",
  },
  {
    id: 3,
    employeeNumber: "EMP-RYD-00003",
    name: "Emily Rodriguez",
    role: "HR Specialist",
    department: "Human Resources",
    email: "emily@company.com",
    phone: "+1 (555) 345-6789",
    status: EmployeeStatus.ACTIVE,
    joinDate: "Feb 10, 2023",
    branch: "Riyadh HQ",
  },
  {
    id: 4,
    employeeNumber: "EMP-DMM-00004",
    name: "David Williams",
    role: "Accountant",
    department: "Finance",
    email: "david@company.com",
    phone: "+1 (555) 456-7890",
    status: EmployeeStatus.ON_LEAVE,
    joinDate: "May 5, 2022",
    branch: "Dammam",
  },
  {
    id: 5,
    employeeNumber: "EMP-RYD-00005",
    name: "Jessica Lee",
    role: "Marketing Manager",
    department: "Marketing",
    email: "jessica@company.com",
    phone: "+1 (555) 567-8901",
    status: EmployeeStatus.ACTIVE,
    joinDate: "Jul 12, 2023",
    branch: "Riyadh HQ",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case EmployeeStatus.ACTIVE:
      return "bg-green-50 text-green-600";
    case EmployeeStatus.ON_LEAVE:
      return "bg-orange-50 text-orange-600";
    case EmployeeStatus.INACTIVE:
      return "dark:bg-secondary bg-secondary text-gray-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function EmployeeManagement() {
  const language = useLangStore(s => s.lang);
  const isRTL = language === "ar";
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    employeeNumber: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    branchId: "",
  });
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    branchId: "",
  });

  const totalPages = Math.ceil(employeesData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = employeesData.slice(startIndex, startIndex + pageSize);

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csv = [
      [
        t("employeeNumber", language),
        t("name", language),
        "Role",
        "Department",
        t("email", language),
        "Phone",
        t("status", language),
        "Join Date",
        t("branch", language),
      ],
      ...employeesData.map(item => [
        item.employeeNumber,
        item.name,
        item.role,
        item.department,
        item.email,
        item.phone,
        item.status,
        item.joinDate,
        item.branch,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees-export.csv";
    a.click();
  };

  const breadcrumbs = [
    { label: t("Dashboard", language), href: "/" },
    { label: t("Settings", language), href: "#" },
    { label: t("Users", language) },
  ];

  return (
    <DashboardLayout currentPage="Users" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Section */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? "text-right" : ""}`}
        >
          <Button
            className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            Add Employee
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Employees
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">245</h3>
            <p className="text-xs text-muted-foreground mt-2">Active staff</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              On Leave
            </p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">12</h3>
            <p className="text-xs text-muted-foreground mt-2">Currently away</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              New This Month
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">8</h3>
            <p className="text-xs text-muted-foreground mt-2">Recent hires</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Departments
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">12</h3>
            <p className="text-xs text-muted-foreground mt-2">Across company</p>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            isAllSelected={selectedItems.length === paginatedData.length}
            onSelectAll={checked =>
              setSelectedItems(
                checked ? paginatedData.map(item => item.id) : []
              )
            }
            onDelete={() => setSelectedItems([])}
            onExport={() => {
              handleExport();
              setSelectedItems([]);
            }}
            onStatusUpdate={() => setSelectedItems([])}
          />
        )}

        {/* Search and Advanced Controls */}
        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-xs">
              <Input
                type="text"
                placeholder={`${t("Search", language)}...`}
                className={`${isRTL ? "pr-12 text-right" : "pl-12"} bg-secondary border-0`}
              />
            </div>
            <AdvancedFilters
              onApplyFilters={filters => setAppliedFilters(filters)}
              onClearFilters={() => setAppliedFilters({})}
              filterOptions={{
                status: {
                  label: t("status", language),
                  options: ["Active", "On Leave", "Inactive"],
                },
                department: {
                  label: "Department",
                  options: ["Sales", "IT", "HR", "Finance", "Marketing"],
                },
              }}
            />
            <Button
              variant="outline"
              className="border-border"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={16} />
            </Button>
            <Button
              variant="outline"
              className="border-border"
              onClick={handlePrint}
            >
              <Printer size={16} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border flex items-center gap-2"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isRTL ? "start" : "end"}
                className="w-48"
              >
                <DropdownMenuItem onClick={handleExport}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-foreground hover:bg-secondary"}`}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-foreground hover:bg-secondary"}`}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>
        </Card>

        {/* Table View */}
        {viewMode === "table" && (
          <Card className="dark:bg-card bg-card shadow-sm border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === paginatedData.length &&
                          paginatedData.length > 0
                        }
                        onChange={e =>
                          setSelectedItems(
                            e.target.checked
                              ? paginatedData.map(item => item.id)
                              : []
                          )
                        }
                        className="w-4 h-4 rounded border-border"
                      />
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("employeeNumber", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("name", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      Role
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      Department
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("branch", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("email", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("status", language)}
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
                      {t("actions", language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-secondary/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={e => {
                            setSelectedItems(
                              e.target.checked
                                ? [...selectedItems, item.id]
                                : selectedItems.filter(id => id !== item.id)
                            );
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-primary font-medium">
                        {item.employeeNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.role}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.branch}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status === EmployeeStatus.ON_LEAVE
                            ? "On Leave"
                            : item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditFormData({
                                  employeeNumber: item.employeeNumber,
                                  name: item.name,
                                  email: item.email,
                                  phone: item.phone,
                                  role: item.role,
                                  department: item.department,
                                  branchId: "",
                                });
                                setIsEditModalOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Send Email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, employeesData.length)} of{" "}
                {employeesData.length}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    page => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-border rounded-lg text-sm dark:bg-card bg-card text-foreground"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedData.map(item => (
              <Card
                key={item.id}
                className="p-4 dark:bg-card bg-card shadow-sm border-0"
              >
                <div className="flex items-start justify-between">
                  <div className={isRTL ? "text-right" : ""}>
                    <h3 className="font-semibold text-foreground">
                      {item.name}
                    </h3>
                    <p className="text-xs text-primary mt-0.5">
                      {item.employeeNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.department}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.branch}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined: {item.joinDate}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {item.status === EmployeeStatus.ON_LEAVE
                      ? "On Leave"
                      : item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal - NO employee number input, has branch selector */}
        <AnimatedModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add Employee"
        >
          <div className="space-y-4">
            <BranchSelector
              value={createFormData.branchId}
              onChange={branchId =>
                setCreateFormData({ ...createFormData, branchId })
              }
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("name", language)}
              </label>
              <Input
                type="text"
                value={createFormData.name}
                onChange={e =>
                  setCreateFormData({ ...createFormData, name: e.target.value })
                }
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("email", language)}
              </label>
              <Input
                type="email"
                value={createFormData.email}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    email: e.target.value,
                  })
                }
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={createFormData.phone}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <Input
                type="text"
                value={createFormData.role}
                onChange={e =>
                  setCreateFormData({ ...createFormData, role: e.target.value })
                }
                placeholder="Job role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <Input
                type="text"
                value={createFormData.department}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    department: e.target.value,
                  })
                }
                placeholder="Department"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-blue-700 text-white">
              {t("save", language)}
            </Button>
          </div>
        </AnimatedModal>

        {/* Edit Modal - employee number shown as read-only badge, has branch selector */}
        <AnimatedModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Employee"
        >
          <div className="space-y-4">
            {/* Employee Number - read-only badge */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("employeeNumber", language)}
              </label>
              <div className="px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-primary font-medium">
                {editFormData.employeeNumber}
              </div>
            </div>
            <BranchSelector
              value={editFormData.branchId}
              onChange={branchId =>
                setEditFormData({ ...editFormData, branchId })
              }
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("name", language)}
              </label>
              <Input
                type="text"
                value={editFormData.name}
                onChange={e =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                placeholder="Employee name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("email", language)}
              </label>
              <Input
                type="email"
                value={editFormData.email}
                onChange={e =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={editFormData.phone}
                onChange={e =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Role
              </label>
              <Input
                type="text"
                value={editFormData.role}
                onChange={e =>
                  setEditFormData({ ...editFormData, role: e.target.value })
                }
                placeholder="Job role"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department
              </label>
              <Input
                type="text"
                value={editFormData.department}
                onChange={e =>
                  setEditFormData({
                    ...editFormData,
                    department: e.target.value,
                  })
                }
                placeholder="Department"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-blue-700 text-white">
              {t("save", language)}
            </Button>
          </div>
        </AnimatedModal>
      </div>
    </DashboardLayout>
  );
}
