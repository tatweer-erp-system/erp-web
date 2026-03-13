import { useState } from "react";
import { PaymentStatus, PurchaseOrderStatus } from "@/constants/enums";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
  MoreVertical,
  ExternalLink,
  User,
  ArrowLeftRight,
} from "lucide-react";
import AnimatedModal from "@/components/AnimatedModal";
import BranchSelector from "@/components/BranchSelector";
import BulkActions from "@/components/BulkActions";
import AdvancedFilters from "@/components/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocation } from "wouter";
import { t } from "@/i18n";

const purchaseOrdersData = [
  {
    id: 1,
    poNo: "PO-RYD-00001",
    supplier: "Tech Supplies Inc.",
    date: "Feb 20, 2024",
    items: 5,
    total: "$12,450",
    status: PurchaseOrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    branch: "Riyadh HQ",
  },
  {
    id: 2,
    poNo: "PO-JED-00002",
    supplier: "Global Electronics",
    date: "Feb 18, 2024",
    items: 3,
    total: "$8,920",
    status: PurchaseOrderStatus.IN_TRANSIT,
    paymentStatus: PaymentStatus.PENDING,
    branch: "Jeddah",
  },
  {
    id: 3,
    poNo: "PO-RYD-00003",
    supplier: "Premium Logistics",
    date: "Feb 15, 2024",
    items: 8,
    total: "$15,680",
    status: PurchaseOrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PENDING,
    branch: "Riyadh HQ",
  },
  {
    id: 4,
    poNo: "PO-DMM-00004",
    supplier: "Industrial Parts Co.",
    date: "Feb 10, 2024",
    items: 12,
    total: "$22,340",
    status: PurchaseOrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    branch: "Dammam",
  },
  {
    id: 5,
    poNo: "PO-RYD-00005",
    supplier: "Office Supplies Ltd.",
    date: "Feb 8, 2024",
    items: 6,
    total: "$5,200",
    status: PurchaseOrderStatus.PROCESSING,
    paymentStatus: PaymentStatus.PENDING,
    branch: "Riyadh HQ",
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case PurchaseOrderStatus.DELIVERED:
      return "bg-green-50 text-green-600";
    case PurchaseOrderStatus.IN_TRANSIT:
      return "bg-blue-50 text-blue-600";
    case PurchaseOrderStatus.PROCESSING:
      return "bg-orange-50 text-orange-600";
    case PurchaseOrderStatus.CANCELLED:
      return "bg-red-50 text-red-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-green-50 text-green-600";
    case PaymentStatus.PENDING:
      return "bg-orange-50 text-orange-600";
    case PaymentStatus.OVERDUE:
      return "bg-red-50 text-red-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function PurchaseOrders() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [, navigate] = useLocation();
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
    poNo: "",
    supplier: "",
    date: "",
    total: "",
    branchId: "",
  });
  const [createFormData, setCreateFormData] = useState({
    supplier: "",
    date: "",
    total: "",
    branchId: "",
  });

  const totalPages = Math.ceil(purchaseOrdersData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = purchaseOrdersData.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csv = [
      [
        t("orderNumber", language),
        "Supplier",
        t("date", language),
        "Items",
        t("total", language),
        t("status", language),
        "Payment Status",
        t("branch", language),
      ],
      ...purchaseOrdersData.map(item => [
        item.poNo,
        item.supplier,
        item.date,
        item.items,
        item.total,
        item.status,
        item.paymentStatus,
        item.branch,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-orders-export.csv";
    a.click();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const breadcrumbs = [
    { label: t("Dashboard", language), href: "/" },
    { label: t("PURCHASES", language), href: "#" },
    { label: t("Purchase Orders", language) },
  ];

  return (
    <DashboardLayout currentPage="Purchase Orders" breadcrumbs={breadcrumbs}>
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
            {t("Purchase Orders", language)}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Purchase Orders", language)}
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">1,245</h3>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Processing
            </p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">23</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting delivery
            </p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("Pending", language)}
            </p>
            <h3 className="text-2xl font-bold text-blue-600 mt-2">15</h3>
            <p className="text-xs text-muted-foreground mt-2">Outstanding</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              {t("total", language)}
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">$2.3M</h3>
            <p className="text-xs text-muted-foreground mt-2">YTD spending</p>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            isAllSelected={selectedItems.length === paginatedData.length}
            onSelectAll={checked => {
              if (checked) {
                setSelectedItems(paginatedData.map(item => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
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
          />
        )}

        {/* Search and Advanced Controls - Single Row */}
        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <div className={`flex flex-wrap gap-2 items-center`}>
            {/* Search Bar */}
            <div className="flex-1 min-w-xs">
              <Input
                type="text"
                placeholder={`${t("Search", language)}...`}
                className={`${isRTL ? "pr-12 text-right" : "pl-12"} bg-secondary border-0`}
              />
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters
              onApplyFilters={filters => setAppliedFilters(filters)}
              onClearFilters={() => setAppliedFilters({})}
              filterOptions={{
                status: {
                  label: t("status", language),
                  options: [
                    "Delivered",
                    "In Transit",
                    "Processing",
                    "Cancelled",
                  ],
                },
                paymentStatus: {
                  label: "Payment Status",
                  options: ["Paid", "Pending", "Overdue"],
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
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
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
                      Supplier
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
                    <th
                      className={`px-6 py-4 text-sm font-semibold text-foreground ${isRTL ? "text-right" : "text-left"}`}
                    >
                      Payment
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
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(
                                selectedItems.filter(id => id !== item.id)
                              );
                            }
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.poNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.supplier}
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
                          {item.status
                            .replace("-", " ")
                            .charAt(0)
                            .toUpperCase() +
                            item.status.replace("-", " ").slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.paymentStatus)}`}
                        >
                          {item.paymentStatus.charAt(0).toUpperCase() +
                            item.paymentStatus.slice(1)}
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
                                  poNo: item.poNo,
                                  supplier: item.supplier,
                                  date: item.date,
                                  total: item.total,
                                  branchId: "",
                                });
                                setIsEditModalOpen(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Receive Items</DropdownMenuItem>
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
            <div
              className={`flex items-center justify-between px-6 py-4 border-t border-border`}
            >
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, purchaseOrdersData.length)} of{" "}
                {purchaseOrdersData.length}
              </div>
              <div className={`flex gap-2`}>
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
                <div className={`flex items-start justify-between`}>
                  <div className={isRTL ? "text-right" : ""}>
                    <h3 className="font-semibold text-foreground">
                      {item.poNo}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.supplier}
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
                  <div
                    className={`flex flex-col gap-2 ${isRTL ? "items-start" : "items-end"}`}
                  >
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                    >
                      {item.status.replace("-", " ").charAt(0).toUpperCase() +
                        item.status.replace("-", " ").slice(1)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(item.paymentStatus)}`}
                    >
                      {item.paymentStatus.charAt(0).toUpperCase() +
                        item.paymentStatus.slice(1)}
                    </span>
                  </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/vendors")}
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <User size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Related Vendor
                </p>
                <p className="text-xs text-muted-foreground">
                  View vendor details
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
            <button
              onClick={() =>
                navigate("/stock-movement?reference_type=purchase_order")
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
                  View stock movements from purchase orders
                </p>
              </div>
              <ExternalLink
                size={14}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          </div>
        </Card>

        {/* Create Modal - NO order number input, has branch selector */}
        <AnimatedModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={t("Purchase Orders", language)}
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
                Supplier
              </label>
              <Input
                type="text"
                value={createFormData.supplier}
                onChange={e =>
                  setCreateFormData({
                    ...createFormData,
                    supplier: e.target.value,
                  })
                }
                placeholder="Supplier name"
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
          title={`Edit ${t("Purchase Orders", language)}`}
        >
          <div className="space-y-4">
            {/* Order Number - read-only */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t("orderNumber", language)}
              </label>
              <div className="px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground font-medium">
                {editFormData.poNo}
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
                Supplier
              </label>
              <Input
                type="text"
                value={editFormData.supplier}
                onChange={e =>
                  setEditFormData({ ...editFormData, supplier: e.target.value })
                }
                placeholder="Supplier name"
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
