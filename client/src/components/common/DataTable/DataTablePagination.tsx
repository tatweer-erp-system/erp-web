import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "antd";
import { PAGE_SIZE_OPTIONS } from "@/lib/constants";
import type { PaginationState } from "./types";

interface DataTablePaginationProps {
  pagination: PaginationState;
  totalRows: number;
  onPaginationChange: (next: PaginationState) => void;
}

export function DataTablePagination({
  pagination,
  totalRows,
  onPaginationChange,
}: DataTablePaginationProps) {
  const { pageIndex, pageSize } = pagination;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const from = pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalRows);

  const go = (idx: number) =>
    onPaginationChange({ ...pagination, pageIndex: idx });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Rows per page</span>
        <select
          value={pageSize}
          onChange={e =>
            onPaginationChange({
              pageIndex: 0,
              pageSize: Number(e.target.value),
            })
          }
          className="text-xs border border-border rounded px-2 py-1 bg-background"
        >
          {PAGE_SIZE_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <span className="text-xs text-muted-foreground">
        {totalRows === 0 ? "0 results" : `${from}–${to} of ${totalRows}`}
      </span>

      <div className="flex items-center gap-1">
        <Button
          type="text"
          size="small"
          onClick={() => go(0)}
          disabled={pageIndex === 0}
          icon={<ChevronsLeft size={14} />}
        />
        <Button
          type="text"
          size="small"
          onClick={() => go(pageIndex - 1)}
          disabled={pageIndex === 0}
          icon={<ChevronLeft size={14} />}
        />
        <span className="text-xs text-muted-foreground px-2">
          {pageIndex + 1} / {totalPages}
        </span>
        <Button
          type="text"
          size="small"
          onClick={() => go(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
          icon={<ChevronRight size={14} />}
        />
        <Button
          type="text"
          size="small"
          onClick={() => go(totalPages - 1)}
          disabled={pageIndex >= totalPages - 1}
          icon={<ChevronsRight size={14} />}
        />
      </div>
    </div>
  );
}
