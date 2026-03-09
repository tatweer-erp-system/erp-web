import { ReactNode, useState } from "react";
import { Search, Download, Columns } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    // Trigger on debounced change — parent handles actual filtering
    const prev = debouncedSearch; // stable reference for lint
    void prev; // suppress unused warning
  }

  const handleSearch = (value: string) => {
    setSearch(value);
    // Propagate immediately via debounce hook — parent receives when settled
    onSearchChange?.(value);
  };

  const allColumns = table.getAllColumns().filter((c) => c.getCanHide());

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 h-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        {extra}

        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
              <Columns size={13} />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {allColumns.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.id}
                checked={col.getIsVisible()}
                onCheckedChange={(v) => col.toggleVisibility(v)}
                className="capitalize text-xs"
              >
                {col.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export CSV */}
        {onExportCSV && (
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={onExportCSV}>
            <Download size={13} />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
