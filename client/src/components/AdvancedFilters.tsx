import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SlidersHorizontal,
  X,
  Save,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

interface FilterPreset {
  name: string;
  filters: Record<string, string>;
}

interface AdvancedFiltersProps {
  onApplyFilters: (filters: Record<string, string>) => void;
  onClearFilters: () => void;
  filterOptions: Record<string, { label: string; options: string[] }>;
}

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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Trigger button */}
        <Button
          variant={activeCount > 0 ? "default" : "outline"}
          size="sm"
          className="gap-1.5 relative h-9 border-border"
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline text-xs">Filters</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -end-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow">
              {activeCount}
            </span>
          )}
          <ChevronDown
            size={12}
            className={`transition-transform duration-200 opacity-60 ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[480px] max-w-[92vw] p-0 rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/40">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-primary" />
            <span className="text-sm font-semibold">Advanced Filters</span>
            {activeCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Presets */}
          {presets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground me-0.5 font-medium">
                Presets:
              </span>
              {presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleLoadPreset(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/70 text-foreground border border-border transition-colors"
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
                <label className="text-[10px] font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">
                  {label}
                </label>
                <Select
                  value={filters[key] ?? ""}
                  onValueChange={v => handleFilterChange(key, v)}
                >
                  <SelectTrigger className="h-8 text-sm bg-secondary border-0 rounded-lg">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__">Any</SelectItem>
                    {options.map(opt => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          {/* Save preset row */}
          <div className="flex gap-2 pt-1 border-t border-border">
            <Input
              placeholder="Save current filters as preset..."
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSavePreset()}
              className="h-8 text-xs bg-secondary border-0 flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className="h-8 px-3"
            >
              <Save size={12} />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
              onClick={handleClear}
            >
              <RotateCcw size={12} />
              Clear All
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={handleApply}
            >
              Apply{activeCount > 0 ? ` (${activeCount})` : " Filters"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
