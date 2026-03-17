import { ReactNode, useState } from "react";
import { Search, Download, Columns } from "lucide-react";
import { Button, Input, Dropdown, Checkbox } from "antd";
import type { MenuProps } from "antd";
import { useDebounce } from "@/hooks/useDebounce";
import type { Table } from "@tanstack/react-table";

interface DataTableToolbarProps<T> {
  table: Table<T>;
  onSearchChange?: (value: string) => void;
  onExportCSV?: () => void;
  extra?: ReactNode;
}

export function DataTableToolbar<T>({
  table,
  onSearchChange,
  onExportCSV,
  extra,
}: DataTableToolbarProps<T>) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  // Notify parent when debounced value changes
  if (onSearchChange) {
    const prev = debouncedSearch;
    void prev;
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const allColumns = table.getAllColumns().filter(c => c.getCanHide());

  const columnMenuItems: MenuProps["items"] = allColumns.map(col => ({
    key: col.id,
    label: (
      <Checkbox
        checked={col.getIsVisible()}
        onChange={e => col.toggleVisibility(e.target.checked)}
      >
        <span className="capitalize text-xs">{col.id}</span>
      </Checkbox>
    ),
  }));

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search..."
          prefix={<Search size={14} className="text-muted-foreground" />}
          size="small"
        />
      </div>

      <div className="flex items-center gap-2">
        {extra}

        {/* Column visibility */}
        <Dropdown menu={{ items: columnMenuItems }} trigger={["click"]}>
          <Button size="small" icon={<Columns size={13} />}>
            Columns
          </Button>
        </Dropdown>

        {/* Export CSV */}
        {onExportCSV && (
          <Button
            size="small"
            icon={<Download size={13} />}
            onClick={onExportCSV}
          >
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
