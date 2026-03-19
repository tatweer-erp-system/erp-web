import { useState } from "react";
import { Button, Input, Dropdown } from "antd";
import { t } from "@/i18n";
import { useLangStore } from "@/stores/lang.store";
import type { MenuProps } from "antd";
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

type TableControlsProps = {
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
};

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const lang = useLangStore(s => s.lang);

  const handleDateRangeChange = (_startDate: Date, _endDate: Date) => {
    // Date range filtering handled by parent via callback
  };

  const sortMenuItems: MenuProps["items"] = [
    "Name A-Z",
    "Name Z-A",
    "Date (New)",
    "Date (Old)",
    "Status",
  ].map(option => ({
    key: option,
    label: option,
    onClick: () => {},
  }));

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "CSV", onClick: () => onExport?.() },
    { key: "excel", label: "Excel", onClick: () => onExport?.() },
    { key: "pdf", label: "PDF", onClick: () => onExport?.() },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Input
            placeholder={t("Search...", lang)}
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            prefix={<Search size={18} className="text-gray-400" />}
            className="w-full"
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
          <Dropdown
            menu={{ items: sortMenuItems }}
            trigger={["click"]}
            placement={isRTL ? "bottomLeft" : "bottomRight"}
          >
            <Button className="flex-1 sm:flex-none">
              <span className="text-xs">Sort</span>
            </Button>
          </Dropdown>

          {/* Filter */}
          <Button className="flex-1 sm:flex-none">
            <Filter size={16} />
            <span className="hidden sm:inline text-xs">Filter</span>
          </Button>

          {/* Reload */}
          <Button className="flex-1 sm:flex-none" onClick={onReload}>
            <RotateCcw size={16} />
            <span className="hidden sm:inline text-xs">Reload</span>
          </Button>

          {/* Print */}
          <Button className="flex-1 sm:flex-none" onClick={onPrint}>
            <Printer size={16} />
            <span className="hidden sm:inline text-xs">Print</span>
          </Button>

          {/* Export */}
          <Dropdown
            menu={{ items: exportMenuItems }}
            trigger={["click"]}
            placement={isRTL ? "bottomLeft" : "bottomRight"}
          >
            <Button className="flex-1 sm:flex-none">
              <Download size={16} />
              <span className="hidden sm:inline text-xs">Export</span>
            </Button>
          </Dropdown>

          {/* View Toggle */}
          <Button.Group>
            <Button
              type={viewMode === "table" ? "primary" : "default"}
              onClick={() => onViewChange?.("table")}
            >
              <List size={16} />
            </Button>
            <Button
              type={viewMode === "grid" ? "primary" : "default"}
              onClick={() => onViewChange?.("grid")}
            >
              <Grid3x3 size={16} />
            </Button>
          </Button.Group>
        </div>
      </div>

      {/* Add New Button */}
      {showAddButton && (
        <div>
          <Button type="primary" onClick={onAddNew} icon={<Plus size={18} />}>
            {addButtonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
