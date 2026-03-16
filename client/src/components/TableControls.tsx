import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  Search,
  Plus,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Grid3x3,
  List,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TableControlsProps {
  onSearch?: (query: string) => void;
  onAddNew?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onReload?: () => void;
  onViewChange?: (view: "table" | "grid") => void;
  viewMode?: "table" | "grid";
  isRTL?: boolean;
  showAddButton?: boolean;
  addButtonLabel?: string;
}

export function TableControls({
  onSearch,
  onAddNew,
  onPrint,
  onExport,
  onReload,
  onViewChange,
  viewMode = "table",
  isRTL = false,
  showAddButton = true,
  addButtonLabel = "Add New",
}: TableControlsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleDateRangeChange = (_startDate: Date, _endDate: Date) => {
    // Date range filtering handled by parent via callback
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search
            size={18}
            className="absolute top-1/2 transform -translate-y-1/2 text-muted-foreground start-3"
          />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            className="ps-12 bg-secondary border-0 rounded-lg focus:ring-2 focus:ring-primary w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Date Range Picker */}
          <DateRangePicker
            isRTL={isRTL}
            onDateRangeChange={handleDateRangeChange}
          />

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-border gap-2 flex-1 sm:flex-none"
              >
                <span className="text-xs">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              {[
                "Name A-Z",
                "Name Z-A",
                "Date (New)",
                "Date (Old)",
                "Status",
              ].map(option => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                >
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter */}
          <Button
            variant="outline"
            className="border-border gap-2 flex-1 sm:flex-none"
          >
            <Filter size={16} />
            <span className="hidden sm:inline text-xs">Filter</span>
          </Button>

          {/* Reload */}
          <Button
            variant="outline"
            className="border-border gap-2 flex-1 sm:flex-none"
            onClick={onReload}
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline text-xs">Reload</span>
          </Button>

          {/* Print */}
          <Button
            variant="outline"
            className="border-border gap-2 flex-1 sm:flex-none"
            onClick={onPrint}
          >
            <Printer size={16} />
            <span className="hidden sm:inline text-xs">Print</span>
          </Button>

          {/* Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-border gap-2 flex-1 sm:flex-none"
              >
                <Download size={16} />
                <span className="hidden sm:inline text-xs">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRTL ? "start" : "end"}>
              <DropdownMenuItem onClick={onExport}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={onExport}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Toggle */}
          <div className="flex border border-border rounded-lg">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => onViewChange?.("table")}
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-0"
              onClick={() => onViewChange?.("grid")}
            >
              <Grid3x3 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Button */}
      {showAddButton && (
        <div>
          <Button
            onClick={onAddNew}
            className="bg-primary hover:bg-blue-700 text-white gap-2"
          >
            <Plus size={18} />
            {addButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
