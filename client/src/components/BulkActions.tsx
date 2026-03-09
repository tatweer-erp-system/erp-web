import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";

interface BulkActionsProps {
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
  onDelete: () => void;
  onExport: () => void;
  onStatusUpdate: () => void;
  isAllSelected: boolean;
}

export default function BulkActions({
  selectedCount,
  onSelectAll,
  onDelete,
  onExport,
  onStatusUpdate,
  isAllSelected,
}: BulkActionsProps) {
  return (
    <div className="flex items-center gap-4 p-4 dark:bg-card bg-card rounded-lg border border-E9EDF4 shadow-sm">
      <Checkbox
        checked={isAllSelected}
        onCheckedChange={(checked) => onSelectAll(checked as boolean)}
        className="h-5 w-5"
      />
      <span className="text-sm font-medium text-foreground">
        {selectedCount} selected
      </span>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={onStatusUpdate}
          >
            <Edit2 size={16} />
            Update Status
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={onExport}
          >
            <Download size={16} />
            Export
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-2"
            onClick={onDelete}
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
