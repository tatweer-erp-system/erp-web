import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import TableControls from "@/components/TableControls";
import AnimatedModal from "@/components/AnimatedModal";
import BulkActions from "@/components/BulkActions";
import AdvancedFilters from "@/components/AdvancedFilters";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Search,
  Plus,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
  ExternalLink,
  User,
  ArrowLeftRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocation } from "wouter";

const ordersData = [
  {
    id: 1,
    orderNo: "ORD-2024-001",
    customer: "John Doe",
    amount: "$1,299",
    status: "completed",
    date: "2024-02-20",
  },
  {
    id: 2,
    orderNo: "ORD-2024-002",
    customer: "Jane Smith",
    amount: "$2,450",
    status: "in-transit",
    date: "2024-02-21",
  },
  {
    id: 3,
    orderNo: "ORD-2024-003",
    customer: "Mike Johnson",
    amount: "$899",
    status: "pending",
    date: "2024-02-22",
  },
  {
    id: 4,
    orderNo: "ORD-2024-004",
    customer: "Sarah Williams",
    amount: "$3,200",
    status: "completed",
    date: "2024-02-23",
  },
  {
    id: 5,
    orderNo: "ORD-2024-005",
    customer: "Tom Brown",
    amount: "$1,550",
    status: "pending",
    date: "2024-02-24",
  },
  {
    id: 6,
    orderNo: "ORD-2024-006",
    customer: "Emma Davis",
    amount: "$2,100",
    status: "in-transit",
    date: "2024-02-25",
  },
  {
    id: 7,
    orderNo: "ORD-2024-007",
    customer: "Chris Wilson",
    amount: "$890",
    status: "completed",
    date: "2024-02-26",
  },
  {
    id: 8,
    orderNo: "ORD-2024-008",
    customer: "Lisa Anderson",
    amount: "$1,750",
    status: "pending",
    date: "2024-02-27",
  },
  {
    id: 9,
    orderNo: "ORD-2024-009",
    customer: "David Taylor",
    amount: "$2,600",
    status: "completed",
    date: "2024-02-28",
  },
  {
    id: 10,
    orderNo: "ORD-2024-010",
    customer: "Rachel Martin",
    amount: "$1,200",
    status: "in-transit",
    date: "2024-02-29",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-600";
    case "in-transit":
      return "bg-blue-50 text-blue-600";
    case "pending":
      return "bg-orange-50 text-orange-600";
    case "cancelled":
      return "bg-red-50 text-red-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function OrderDetails() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [, navigate] = useLocation();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    orderNo: "",
    customer: "",
    amount: "",
    status: "",
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );

  const totalPages = Math.ceil(ordersData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = ordersData.slice(startIndex, startIndex + pageSize);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csv = [
      ["Order No", "Customer", "Amount", "Status", "Date"],
      ...ordersData.map(item => [
        item.orderNo,
        item.customer,
        item.amount,
        item.status,
        item.date,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-export.csv";
    a.click();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const breadcrumbs = [{ label: "Dashboard", href: "/" }, { label: "Orders" }];

  return (
    <DashboardLayout currentPage="Orders" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? "text-right" : ""}`}
        >
          <h2 className="text-2xl font-bold text-foreground">Sales Orders</h2>
          <Button
            className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            Create Order
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Orders
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">2,345</h3>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">23</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting action
            </p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              In Transit
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mt-2">45</h3>
            <p className="text-xs text-muted-foreground mt-2">On the way</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Completed
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">2,277</h3>
            <p className="text-xs text-muted-foreground mt-2">Delivered</p>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            onDelete={() => {
              setSelectedItems([]);
            }}
            onExport={() => {
              handleExport();
              setSelectedItems([]);
            }}
            onStatusUpdate={() => {
              setSelectedItems([]);
            }}
            onSelectAll={() => {
              setSelectedItems(paginatedData.map(item => item.id));
            }}
            isAllSelected={selectedItems.length === paginatedData.length}
          />
        )}

        {/* Search and Advanced Controls - Single Row */}
        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <div className={`flex flex-wrap gap-2 items-center`}>
            {/* Search Bar */}
            <div className="flex-1 min-w-xs">
              <Input
                type="text"
                placeholder="Search by order number or customer..."
                className={`${isRTL ? "pr-4 pl-4 text-right" : "pl-4 pr-4"} bg-secondary border-0 h-10 focus:outline-none focus:ring-0`}
              />
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters
              onApplyFilters={filters => setAppliedFilters(filters)}
              onClearFilters={() => setAppliedFilters({})}
              filterOptions={{
                status: {
                  label: "Status",
                  options: ["Pending", "In Transit", "Completed", "Cancelled"],
                },
                dateRange: {
                  label: "Date Range",
                  options: ["Last 7 days", "Last 30 days", "Last 90 days"],
                },
              }}
            />

            {/* Reload Button */}
            <Button
              variant="outline"
              className="border-border"
              onClick={handleReload}
              title="Reload data"
            >
              <RotateCcw size={16} />
            </Button>

            {/* Print Button */}
            <Button
              variant="outline"
              className="border-border"
              onClick={handlePrint}
              title="Print table"
            >
              <Printer size={16} />
            </Button>

            {/* Export Button */}
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

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-secondary"
                }`}
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "text-foreground hover:bg-secondary"
                }`}
                title="Grid view"
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
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-foreground">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.length === paginatedData.length &&
                          paginatedData.length > 0
                        }
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedItems(
                              paginatedData.map(item => item.id)
                            );
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Order No
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Customer
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Amount
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedData.map(order => (
                    <tr
                      key={order.id}
                      className="hover:bg-secondary transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(order.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, order.id]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(id => id !== order.id)
                              );
                            }
                          }}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-medium text-foreground ${isRTL ? "text-right" : ""}`}
                      >
                        {order.orderNo}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm text-foreground ${isRTL ? "text-right" : ""}`}
                      >
                        {order.customer}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : ""}`}
                      >
                        {order.amount}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${isRTL ? "text-right" : ""}`}
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1).replace("-", " ")}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-sm text-muted-foreground ${isRTL ? "text-right" : ""}`}
                      >
                        {order.date}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm ${isRTL ? "text-right" : ""}`}
                      >
                        <div className={`flex gap-2`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setFormData({
                                orderNo: order.orderNo,
                                customer: order.customer,
                                amount: order.amount,
                                status: order.status,
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              className={`px-6 py-4 border-t border-border flex items-center justify-between`}
            >
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, ordersData.length)} of{" "}
                {ordersData.length} orders
              </p>
              <div className={`flex items-center gap-2`}>
                <Button
                  variant="outline"
                  className="border-border"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded transition-colors text-sm ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "border border-border hover:bg-secondary"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <Button
                  variant="outline"
                  className="border-border"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedData.map(order => (
              <Card
                key={order.id}
                className="p-6 dark:bg-card bg-card shadow-sm border-0 hover:shadow-md transition-shadow"
              >
                <div className={`flex justify-between items-start mb-4`}>
                  <div className={isRTL ? "text-right" : ""}>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {order.orderNo}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {order.customer}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1).replace("-", " ")}
                  </span>
                </div>
                <div className="space-y-3 mb-4">
                  <div className={`flex justify-between`}>
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {order.amount}
                    </span>
                  </div>
                  <div className={`flex justify-between`}>
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm font-semibold text-foreground">
                      {order.date}
                    </span>
                  </div>
                </div>
                <div className={`flex gap-2`}>
                  <Button variant="outline" className="flex-1 border-border">
                    <Eye size={16} />
                  </Button>
                  <Button variant="outline" className="flex-1 border-border">
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-border text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Cross-Module Navigation Links */}
        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Related Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate("/customer-details")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Related Contact
                </p>
                <p className="text-xs text-muted-foreground">
                  View customer details
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              onClick={() =>
                navigate("/stock-movement?reference_type=sales_order")
              }
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <ArrowLeftRight size={16} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Stock Movements
                </p>
                <p className="text-xs text-muted-foreground">
                  View stock movements for orders
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </Card>

        {/* Create Modal */}
        <AnimatedModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Order"
          onSubmit={() => {
            setIsCreateModalOpen(false);
            setFormData({ orderNo: "", customer: "", amount: "", status: "" });
          }}
          submitLabel="Create Order"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Order Number
              </label>
              <Input placeholder="ORD-2024-XXX" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Customer Name
              </label>
              <Input placeholder="Enter customer name" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <Input placeholder="Enter amount" className="mt-1" />
            </div>
          </div>
        </AnimatedModal>

        {/* Edit Modal */}
        <AnimatedModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Order"
          onSubmit={() => {
            setIsEditModalOpen(false);
            setFormData({ orderNo: "", customer: "", amount: "", status: "" });
          }}
          submitLabel="Update Order"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Order Number
              </label>
              <Input
                value={formData.orderNo}
                placeholder="ORD-2024-XXX"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Customer Name
              </label>
              <Input
                value={formData.customer}
                placeholder="Enter customer name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Amount
              </label>
              <Input
                value={formData.amount}
                placeholder="Enter amount"
                className="mt-1"
              />
            </div>
          </div>
        </AnimatedModal>
      </div>
    </DashboardLayout>
  );
}
