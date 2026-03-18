import { Button, Input, Tooltip, Dropdown, Segmented, DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExportOutlined,
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

type SalesOrdersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  viewMode: "table" | "grid";
  onViewModeChange: (v: "table" | "grid") => void;
  onReload: () => void;
  onCreateNew: () => void;
  dateRange?: [Dayjs | null, Dayjs | null] | null;
  onDateRangeChange?: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  t: (key: string, lang: string) => string;
  lang: "ar" | "en";
};

/**
 * Action toolbar for the Sales Orders list page.
 * Contains search, filter toggle, reload, export dropdown, and view mode.
 */
export function SalesOrdersToolbar({
  search,
  onSearchChange,
  isFilterOpen,
  onToggleFilter,
  viewMode,
  onViewModeChange,
  onReload,
  onCreateNew,
  dateRange,
  onDateRangeChange,
  t,
  lang,
}: SalesOrdersToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-between items-center">
      <div className="flex flex-wrap gap-2 items-center">
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
          {t("sales.action.create", lang)}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {onDateRangeChange && (
          <RangePicker
            value={dateRange}
            onChange={onDateRangeChange}
            placeholder={[t("common.dateFrom", lang), t("common.dateTo", lang)]}
            allowClear
            style={{ borderRadius: 8 }}
          />
        )}
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder={t("common.search", lang)}
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        <Tooltip title={t("sales.filter.allStatuses", lang)}>
          <Button
            icon={<FilterOutlined />}
            onClick={onToggleFilter}
            type={isFilterOpen ? "primary" : "default"}
          />
        </Tooltip>
        <Tooltip title={t("seq.reload", lang)}>
          <Button icon={<ReloadOutlined />} onClick={onReload} />
        </Tooltip>
        <Dropdown
          menu={{
            items: [
              { key: "csv", label: "CSV", icon: <ExportOutlined /> },
              { key: "excel", label: "Excel", icon: <ExportOutlined /> },
              { key: "pdf", label: "PDF", icon: <ExportOutlined /> },
            ],
          }}
        >
          <Button icon={<DownloadOutlined />}>
            {t("products.export", lang)}
          </Button>
        </Dropdown>
        <Segmented
          value={viewMode}
          onChange={v => onViewModeChange(v as "table" | "grid")}
          options={[
            { value: "table", icon: <UnorderedListOutlined /> },
            { value: "grid", icon: <AppstoreOutlined /> },
          ]}
        />
      </div>
    </div>
  );
}
