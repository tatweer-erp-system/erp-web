import { Checkbox, Button } from "antd";
import { Trash2, Download, Edit2 } from "lucide-react";

type BulkActionsProps = {
  selectedCount: number;
  onSelectAll: (checked: boolean) => void;
  onDelete: () => void;
  onExport: () => void;
  onStatusUpdate: () => void;
  isAllSelected: boolean;
};

export function BulkActions({
  selectedCount,
  onSelectAll,
  onDelete,
  onExport,
  onStatusUpdate,
  isAllSelected,
}: BulkActionsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
      <Checkbox
        checked={isAllSelected}
        onChange={e => onSelectAll(e.target.checked)}
      />
      <span className="text-sm font-medium">{selectedCount} selected</span>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2 ms-auto">
          <Button
            size="small"
            icon={<Edit2 size={16} />}
            onClick={onStatusUpdate}
          >
            Update Status
          </Button>
          <Button size="small" icon={<Download size={16} />} onClick={onExport}>
            Export
          </Button>
          <Button
            size="small"
            danger
            icon={<Trash2 size={16} />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
