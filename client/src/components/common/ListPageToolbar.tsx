import { type ReactNode } from "react";

import { Button, Tooltip, Segmented, Space, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

import { SearchInput } from "@/components/common/SearchInput";

const { RangePicker } = DatePicker;

type ListPageToolbarProps = {
  /** Current search value */
  search: string;
  /** Called with new search value (already debounced by SearchInput) */
  onSearchChange: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Called when "New" button is clicked */
  onCreateNew: () => void;
  /** Label for the create button */
  createLabel: string;
  /** Called when reload button is clicked */
  onReload: () => void;
  /** Current view mode */
  viewMode?: "table" | "grid";
  /** Called when view mode changes */
  onViewModeChange?: (mode: "table" | "grid") => void;
  /** Whether filter panel is open */
  isFilterOpen?: boolean;
  /** Called when filter toggle is clicked */
  onToggleFilter?: () => void;
  /** Whether export button is shown */
  showExport?: boolean;
  /** Called when export is clicked */
  onExport?: () => void;
  /** Export button label */
  exportLabel?: string;
  /** Current date range filter value */
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  /** Called when date range changes */
  onDateRangeChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  /** Placeholders for date range picker */
  dateRangePlaceholder?: [string, string];
  /** Extra actions rendered after the standard buttons */
  extra?: ReactNode;
};

/**
 * Standard toolbar for list pages.
 * Left side: Create button
 * Right side: Search, filter toggle, reload, export, view mode
 *
 * All list pages must use this component to ensure consistent layout.
 */
export function ListPageToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  onCreateNew,
  createLabel,
  onReload,
  viewMode,
  onViewModeChange,
  isFilterOpen,
  onToggleFilter,
  showExport = true,
  onExport,
  exportLabel,
  dateRange,
  onDateRangeChange,
  dateRangePlaceholder,
  extra,
}: ListPageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
        {createLabel}
      </Button>

      <Space wrap size="small">
        {onDateRangeChange && (
          <RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder={dateRangePlaceholder}
            allowClear
            style={{ borderRadius: 8 }}
          />
        )}

        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        {onToggleFilter && (
          <Tooltip title="Filters">
            <Button
              icon={<FilterOutlined />}
              type={isFilterOpen ? "primary" : "default"}
              onClick={onToggleFilter}
            />
          </Tooltip>
        )}

        <Tooltip title="Reload">
          <Button icon={<ReloadOutlined />} onClick={onReload} />
        </Tooltip>

        {showExport && onExport && (
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            {exportLabel}
          </Button>
        )}

        {viewMode && onViewModeChange && (
          <Segmented
            value={viewMode}
            onChange={v => onViewModeChange(v as "table" | "grid")}
            options={[
              { value: "table", icon: <UnorderedListOutlined /> },
              { value: "grid", icon: <AppstoreOutlined /> },
            ]}
          />
        )}

        {extra}
      </Space>
    </div>
  );
}
