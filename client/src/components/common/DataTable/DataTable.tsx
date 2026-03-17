import { ReactNode, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Checkbox } from "antd";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import type { PaginationState } from "./types";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  pagination: PaginationState;
  onPaginationChange: (next: PaginationState) => void;
  totalRows: number;
  onSortingChange?: (sorting: SortingState) => void;
  onSearchChange?: (value: string) => void;
  onExportCSV?: () => void;
  selectable?: boolean;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPaginationChange,
  totalRows,
  onSortingChange,
  onSearchChange,
  onExportCSV,
  selectable = false,
  toolbar,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<T> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={e => row.toggleSelected(e.target.checked)}
        onClick={e => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };

  const table = useReactTable({
    data,
    columns: selectable ? [selectionColumn, ...columns] : columns,
    state: { sorting, rowSelection },
    onSortingChange: updater => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(next);
      onSortingChange?.(next);
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(totalRows / pagination.pageSize)),
  });

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <DataTableToolbar
        table={table}
        onSearchChange={onSearchChange}
        onExportCSV={onExportCSV}
        extra={toolbar}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border bg-muted/50"
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp size={12} />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown size={12} />
                        )}
                        {!header.column.getIsSorted() && (
                          <ArrowUpDown size={12} className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-0"
                >
                  <LoadingSkeleton
                    rows={pagination.pageSize}
                    columns={columns.length}
                    showHeader={false}
                  />
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-8"
                >
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className={`border-b border-border transition-colors hover:bg-muted/30 ${row.getIsSelected() ? "bg-primary/5" : ""}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-foreground">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DataTablePagination
        pagination={pagination}
        totalRows={totalRows}
        onPaginationChange={onPaginationChange}
      />
    </div>
  );
}
