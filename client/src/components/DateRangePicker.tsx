import { useState } from "react";
import { Button, Popover } from "antd";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isRTL?: boolean;
};

export function DateRangePicker({
  onDateRangeChange,
  isRTL = false,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (selectingStart) {
      setStartDate(selectedDate);
      setSelectingStart(false);
    } else {
      if (selectedDate < (startDate ?? new Date())) {
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      if (startDate && selectedDate >= startDate) {
        onDateRangeChange?.(startDate, selectedDate);
      }
    }
  };

  const handleQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
    setSelectingStart(true);
    onDateRangeChange?.(start, end);
  };

  const handleReset = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectingStart(true);
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date >= startDate && date <= endDate;
  };

  const isDateStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.toDateString() === startDate.toDateString();
  };

  const isDateEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return date.toDateString() === endDate.toDateString();
  };

  const popoverContent = (
    <div className="space-y-4">
      {/* Quick Range Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Today", days: 0 },
          { label: "7 Days", days: 7 },
          { label: "30 Days", days: 30 },
          { label: "90 Days", days: 90 },
          { label: "6 Months", days: 180 },
          { label: "1 Year", days: 365 },
        ].map(range => (
          <Button
            key={range.label}
            size="small"
            onClick={() => handleQuickRange(range.days)}
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Calendar */}
      <div className="space-y-3">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            type="text"
            size="small"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            icon={<ChevronLeft size={16} />}
          />
          <h3 className="font-semibold text-sm">{monthName}</h3>
          <Button
            type="text"
            size="small"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            icon={<ChevronRight size={16} />}
          />
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div
              key={day}
              className="text-xs font-semibold text-gray-400 h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          {days.map(day => {
            const isStart = isDateStart(day);
            const isEnd = isDateEnd(day);
            const inRange = isDateInRange(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={cn(
                  "h-8 rounded text-xs font-medium transition-colors",
                  isStart || isEnd
                    ? "bg-blue-500 text-white"
                    : inRange
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Range Display */}
      {startDate && endDate && (
        <div className="pt-3 border-t space-y-2">
          <div className="text-sm">
            <p className="text-gray-400">Selected Range:</p>
            <p className="font-semibold">
              {formatDate(startDate)} &rarr; {formatDate(endDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={handleReset}
              className="flex-1"
              icon={<X size={14} />}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement={isRTL ? "bottomLeft" : "bottomRight"}
      content={popoverContent}
      arrow={false}
    >
      <Button className="flex-1 sm:flex-none">
        <Calendar size={16} />
        <span className="hidden sm:inline text-xs">
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "Date Range"}
        </span>
      </Button>
    </Popover>
  );
}
