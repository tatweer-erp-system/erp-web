import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
} from "lucide-react";
import BulkActions from "@/components/BulkActions";
import AdvancedFilters from "@/components/AdvancedFilters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { ReturnStatus } from "@/constants/enums";

const salesReturnsData = [
  {
    id: 1,
    returnNo: "SR-2024-001",
    customer: "Tech Corp",
    amount: "$500",
    reason: "Defective",
    date: "2024-02-20",
    status: ReturnStatus.PROCESSED,
  },
  {
    id: 2,
    returnNo: "SR-2024-002",
    customer: "Global Industries",
    amount: "$1,250",
    reason: "Wrong item",
    date: "2024-02-19",
    status: ReturnStatus.PENDING,
  },
  {
    id: 3,
    returnNo: "SR-2024-003",
    customer: "Local Business",
    amount: "$320",
    reason: "Not as described",
    date: "2024-02-18",
    status: ReturnStatus.PROCESSED,
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case ReturnStatus.PROCESSED:
      return "bg-green-50 text-green-600";
    case ReturnStatus.PENDING:
      return "bg-orange-50 text-orange-600";
    case ReturnStatus.REJECTED:
      return "bg-red-50 text-red-600";
    default:
      return "dark:bg-secondary bg-secondary text-gray-600";
  }
}

export default function SalesReturns() {
  const { language } = useSettings();
  const isRTL = language === "ar";
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>(
    {}
  );

  const totalPages = Math.ceil(salesReturnsData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = salesReturnsData.slice(
    startIndex,
    startIndex + pageSize
  );

  const handlePrint = () => window.print();
  const handleExport = () => {
    const csv = [
      ["Return No", "Customer", "Amount", "Reason", "Date", "Status"],
      ...salesReturnsData.map(item => [
        item.returnNo,
        item.customer,
        item.amount,
        item.reason,
        item.date,
        item.status,
      ]),
    ]
      .map(row => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-returns-export.csv";
    a.click();
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Sales", href: "#" },
    { label: "Sales Returns" },
  ];

  return (
    <DashboardLayout currentPage="Sales Returns" breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${isRTL ? "text-right" : ""}`}
        >
          <Button className="bg-primary hover:bg-blue-700 text-white flex items-center gap-2 w-full sm:w-auto">
            <Plus size={18} /> Create Return
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Returns
            </p>
            <h3 className="text-2xl font-bold text-foreground mt-2">145</h3>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">Pending</p>
            <h3 className="text-2xl font-bold text-orange-600 mt-2">8</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting processing
            </p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Processed
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">137</h3>
            <p className="text-xs text-muted-foreground mt-2">Completed</p>
          </Card>
          <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Value
            </p>
            <h3 className="text-2xl font-bold text-primary mt-2">$52.3K</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Returned amount
            </p>
          </Card>
        </div>

        {selectedItems.length > 0 && (
          <BulkActions
            selectedCount={selectedItems.length}
            isAllSelected={selectedItems.length === paginatedData.length}
            onSelectAll={checked => {
              setSelectedItems(
                checked ? paginatedData.map(item => item.id) : []
              );
            }}
            onDelete={() => setSelectedItems([])}
            onExport={() => {
              handleExport();
              setSelectedItems([]);
            }}
            onStatusUpdate={() => setSelectedItems([])}
          />
        )}

        <Card className="p-4 dark:bg-card bg-card shadow-sm border-0">
          <div className={`flex flex-wrap gap-2 items-center`}>
            <div className="flex-1 min-w-xs">
              <Input
                placeholder="Search by return number or customer..."
                className={`${isRTL ? "pr-4 text-right" : "pl-4"} bg-secondary border-0`}
              />
            </div>
            <AdvancedFilters
              onApplyFilters={filters => setAppliedFilters(filters)}
              onClearFilters={() => setAppliedFilters({})}
              filterOptions={{
                status: {
                  label: "Status",
                  options: ["Pending", "Processed", "Rejected"],
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
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Return No
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Date
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-left">
                      Status
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-foreground text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map(item => (
                    <tr
                      key={item.id}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={e =>
                            setSelectedItems(
                              e.target.checked
                                ? [...selectedItems, item.id]
                                : selectedItems.filter(id => id !== item.id)
                            )
                          }
                          className="w-4 h-4 rounded border-border"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {item.returnNo}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.customer}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">
                        {item.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.reason}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {item.date}
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
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
