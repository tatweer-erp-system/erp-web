import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Eye,
  Edit,
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
import { useSettings } from "@/contexts/SettingsContext";
import { t } from "@/i18n";
import { OrderStatus } from "@/constants/enums";

const salesOrdersData = [
  {
    id: 1,
    orderNo: "SO-RYD-00042",
    customer: "Ahmad Trading Co.",
    date: "Mar 5, 2024",
    items: 3,
    total: "$8,450",
    status: OrderStatus.COMPLETED,
    branch: "Riyadh HQ",
  },
  {
    id: 2,
    orderNo: "SO-JED-00043",
    customer: "Gulf Electronics",
    date: "Mar 4, 2024",
    items: 7,
    total: "$15,920",
    status: OrderStatus.PROCESSING,
    branch: "Jeddah",
  },
  {
    id: 3,
    orderNo: "SO-RYD-00044",
    customer: "Saudi Supply Chain",
    date: "Mar 3, 2024",
    items: 2,
    total: "$3,200",
    status: OrderStatus.PENDING,
    branch: "Riyadh HQ",
  },
  {
    id: 4,
    orderNo: "SO-DMM-00045",
    customer: "Eastern Logistics",
    date: "Mar 2, 2024",
    items: 5,
    total: "$12,340",
    status: OrderStatus.COMPLETED,
    branch: "Dammam",
  },
  {
    id: 5,
    orderNo: "SO-RYD-00046",
    customer: "National Services Ltd.",
    date: "Mar 1, 2024",
    items: 4,
    total: "$6,780",
    status: OrderStatus.CANCELLED,
    branch: "Riyadh HQ",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case OrderStatus.COMPLETED:
      return "bg-green-50 text-green-600";
    case OrderStatus.PROCESSING:
      return "bg-blue-50 text-blue-600";
    case OrderStatus.PENDING:
      return "bg-orange-50 text-orange-600";
    case OrderStatus.CANCELLED:
      return "bg-red-50 text-red-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function AllOrders() {
  const { language } = useSettings();
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
    orderNo: "",
    customer: "",
    date: "",
    total: "",
    branchId: "",
  });
  const [createFormData, setCreateFormData] = useState({
    customer: "",
    date: "",
    total: "",
    branchId: "",
  });

  const totalPages = Math.ceil(salesOrdersData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = salesOrdersData.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePrint = () => window.print();

  const handleExport = () => {
    const csv = [
      [
        t("orderNumber", language),
        "Customer",
        t("date", language),
        "Items",
        t("total", language),
        t("status", language),
        t("branch", language),
      ],
      ...salesOrdersData.map(item => [
        item.orderNo,
        item.customer,
        item.date,
        item.items,
        item.total,
        item.status,
        item.branch,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-orders-export.csv";
    a.click();
  };

  const breadcrumbs = [
    { label: t("Dashboard", language), href: "/" },
    { label: t("SALES", language), href: "#" },
    { label: t("All Orders", language) },
  ];

  return (
    <DashboardLayout currentPage="AllOrders" breadcrumbs={breadcrumbs}>
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
            {t("Sales Orders", language)}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Sales Orders", language)}
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">2,456</h3>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Pending", language)}
            </p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">34</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting processing
            </p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Completed", language)}
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">2,380</h3>
            <p className="text-xs text-muted-foreground mt-2">Fulfilled</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("total", language)}
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">$4.8M</h3>
            <p className="text-xs text-muted-foreground mt-2">YTD revenue</p>
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

        {/* Search and Controls */}
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
                  options: ["Completed", "Processing", "Pending", "Cancelled"],
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
                      {t("orderNumber", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("Customers", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("branch", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("date", language)}
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      Items
                    </th>
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t("total", language)}
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
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.orderNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.branch}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.items}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.total}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                        >
                          {item.status.charAt(0).toUpperCase() +
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
                                  orderNo: item.orderNo,
                                  customer: item.customer,
                                  date: item.date,
                                  total: item.total,
                                  branchId: "",
                                });
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit size={14} className="mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye size={14} className="mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancel
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
                {Math.min(startIndex + pageSize, salesOrdersData.length)} of{" "}
                {salesOrdersData.length}
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
                      {item.orderNo}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.customer}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                    <p className="text-xs text-primary mt-1">{item.branch}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.total}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Items: {item.items}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Modal - NO order number input, has branch selector */}
        <AnimatedModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={t("Sales Orders", language)}
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
                {t("Customers", language)}
              </label>
              <Input
                type="text"
                value={createFormData.customer}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    customer: e.target.value,
                  })
                }
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("date", language)}
              </label>
              <Input
                type="date"
                value={createFormData.date}
                onChange={e =>
                  setCreateFormData({ ...createFormData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("total", language)}
              </label>
              <Input
                type="text"
                value={createFormData.total}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    total: e.target.value,
                  })
                }
                placeholder="Total amount"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-blue-700 text-white">
              {t("save", language)}
            </Button>
          </div>
        </AnimatedModal>

        {/* Edit Modal - order number shown read-only, has branch selector */}
        <AnimatedModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${t("Sales Orders", language)}`}
        >
          <div className="space-y-4">
            {/* Order Number - read-only display */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("orderNumber", language)}
              </label>
              <div className="px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground font-medium">
                {editFormData.orderNo}
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
                {t("Customers", language)}
              </label>
              <Input
                type="text"
                value={editFormData.customer}
                onChange={e =>
                  setEditFormData({ ...editFormData, customer: e.target.value })
                }
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("date", language)}
              </label>
              <Input
                type="date"
                value={editFormData.date}
                onChange={e =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("total", language)}
              </label>
              <Input
                type="text"
                value={editFormData.total}
                onChange={e =>
                  setEditFormData({ ...editFormData, total: e.target.value })
                }
                placeholder="Total amount"
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
