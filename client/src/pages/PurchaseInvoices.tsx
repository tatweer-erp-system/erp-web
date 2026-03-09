import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Download, Printer, RotateCcw, Grid3x3, List } from "lucide-react";
import AnimatedModal from "@/components/AnimatedModal";
import BulkActions from "@/components/BulkActions";
import AdvancedFilters from "@/components/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";

const purchaseInvoicesData = [
  { id: 1, invoiceNo: "PI-2024-001", vendor: "Tech Supplies Inc.", amount: "$5,000", status: "paid", date: "2024-02-20", dueDate: "2024-03-20" },
  { id: 2, invoiceNo: "PI-2024-002", vendor: "Global Electronics", amount: "$12,500", status: "pending", date: "2024-02-19", dueDate: "2024-03-19" },
  { id: 3, invoiceNo: "PI-2024-003", vendor: "Premium Logistics", amount: "$3,200", status: "overdue", date: "2024-02-18", dueDate: "2024-03-18" },
  { id: 4, invoiceNo: "PI-2024-004", vendor: "Industrial Parts Co.", amount: "$25,000", status: "paid", date: "2024-02-17", dueDate: "2024-03-17" },
  { id: 5, invoiceNo: "PI-2024-005", vendor: "Office Supplies Ltd.", amount: "$8,750", status: "pending", date: "2024-02-16", dueDate: "2024-03-16" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-50 text-green-600";
    case "pending":
      return "bg-orange-50 text-orange-600";
    case "overdue":
      return "bg-red-50 text-red-600";
    case "cancelled":
      return "dark:bg-secondary bg-secondary text-gray-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function PurchaseInvoices() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  const totalPages = Math.ceil(purchaseInvoicesData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = purchaseInvoicesData.slice(startIndex, startIndex + pageSize);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const csv = [
      ["Invoice No", "Vendor", "Amount", "Status", "Date", "Due Date"],
      ...purchaseInvoicesData.map(item => [item.invoiceNo, item.vendor, item.amount, item.status, item.date, item.dueDate])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase-invoices-export.csv";
    a.click();
  };

  const handleReload = () => {
    window.location.reload();
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Purchases", href: "#" },
    { label: "Purchase Invoices" },
  ];

  return (
    <DashboardLayout currentPage="Purchase Invoices" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? "text-right" : ""}`}>
          <Button className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto">
            <Plus size={18} />
            Create Invoice
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
            <h3 className="text-2xl font-bold text-foreground mt-2">892</h3>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">18</h3>
            <p className="text-xs text-muted-foreground mt-2">Awaiting payment</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Paid</p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">856</h3>
            <p className="text-xs text-muted-foreground mt-2">Processed</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <h3 className="text-2xl font-bold text-primary mt-2">$3.1M</h3>
            <p className="text-xs text-muted-foreground mt-2">YTD spending</p>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            isAllSelected={selectedItems.length === paginatedData.length}
            onSelectAll={(checked) => {
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
                placeholder="Search by invoice number or vendor..." 
                className={`${isRTL ? "pr-4 text-right" : "pl-4"} bg-secondary border-0`} 
              />
            </div>

            {/* Advanced Filters */}
            <AdvancedFilters
              onApplyFilters={(filters) => setAppliedFilters(filters)}
              onClearFilters={() => setAppliedFilters({})}
              filterOptions={{
                status: {
                  label: "Status",
                  options: ["Paid", "Pending", "Overdue", "Cancelled"],
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
                <Button variant="outline" className="border-border flex items-center gap-2">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48">
                <DropdownMenuItem onClick={handleExport}>Export as CSV</DropdownMenuItem>
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
                        checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(paginatedData.map(item => item.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                        className="w-4 h-4 rounded border-border"
                      />
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Invoice No</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Vendor</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">Due Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{item.invoiceNo}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.vendor}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">{item.amount}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{item.dueDate}</td>
                      <td className="px-6 py-4 text-center">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
