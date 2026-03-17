import { useState } from "react";
import { Button, Input, Select, Popover, Space } from "antd";
import {
  SlidersHorizontal,
  X,
  Save,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterPreset = {
  name: string;
  filters: Record<string, string>;
};

type AdvancedFiltersProps = {
  onApplyFilters: (filters: Record<string, string>) => void;
  onClearFilters: () => void;
  filterOptions: Record<string, { label: string; options: string[] }>;
};

export function AdvancedFilters({
  onApplyFilters,
  onClearFilters,
  filterOptions,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [presets, setPresets] = useState<FilterPreset[]>([
    { name: "Active Items", filters: { status: "active" } },
    { name: "Recent", filters: { dateRange: "last30days" } },
  ]);
  const [presetName, setPresetName] = useState("");

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      setPresets([...presets, { name: presetName, filters: { ...filters } }]);
      setPresetName("");
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    onApplyFilters(preset.filters);
  };

  const popoverContent = (
    <div className="w-[440px] max-w-[88vw]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-blue-500" />
          <span className="text-sm font-semibold">Advanced Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
              {activeCount} active
            </span>
          )}
        </div>
        <button
          onClick={() => setOpen(false)}
          className="w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Presets */}
        {presets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-gray-400 me-0.5 font-medium">
              Presets:
            </span>
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        )}

        {/* Filter fields grid */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(filterOptions).map(([key, { label, options }]) => (
            <div key={key}>
              <label className="text-[10px] font-semibold text-gray-400 mb-1.5 block uppercase tracking-wider">
                {label}
              </label>
              <Select
                value={filters[key] ?? undefined}
                onChange={v => handleFilterChange(key, v)}
                placeholder="Any"
                size="small"
                className="w-full"
                options={[
                  { value: "__any__", label: "Any" },
                  ...options.map(opt => ({ value: opt, label: opt })),
                ]}
              />
            </div>
          ))}
        </div>

        {/* Save preset row */}
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <Input
            placeholder="Save current filters as preset..."
            value={presetName}
            onChange={e => setPresetName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSavePreset()}
            size="small"
            className="flex-1"
          />
          <Button
            size="small"
            onClick={handleSavePreset}
            disabled={!presetName.trim()}
            icon={<Save size={12} />}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="small"
            className="flex-1"
            onClick={handleClear}
            icon={<RotateCcw size={12} />}
          >
            Clear All
          </Button>
          <Button
            type="primary"
            size="small"
            className="flex-1"
            onClick={handleApply}
          >
            Apply{activeCount > 0 ? ` (${activeCount})` : " Filters"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      content={popoverContent}
      arrow={false}
    >
      <Button
        type={activeCount > 0 ? "primary" : "default"}
        size="small"
        className="gap-1.5 relative"
      >
        <SlidersHorizontal size={14} />
        <span className="hidden sm:inline text-xs">Filters</span>
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={12}
          className={cn(
            "transition-transform duration-200 opacity-60",
            open && "rotate-180"
          )}
        />
      </Button>
    </Popover>
  );
}
