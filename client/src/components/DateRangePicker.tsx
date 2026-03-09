import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  isRTL?: boolean;
}

export default function DateRangePicker({ onDateRangeChange, isRTL = false }: DateRangePickerProps) {
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
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (selectingStart) {
      setStartDate(selectedDate);
      setSelectingStart(false);
    } else {
      if (selectedDate < (startDate || new Date())) {
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

  const monthName = currentMonth.toLocaleString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date >= startDate && date <= endDate;
  };

  const isDateStart = (day: number) => {
    if (!startDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === startDate.toDateString();
  };

  const isDateEnd = (day: number) => {
    if (!endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === endDate.toDateString();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-border gap-2 flex-1 sm:flex-none">
          <Calendar size={16} />
          <span className="hidden sm:inline text-xs">
            {startDate && endDate
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : "Date Range"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align={isRTL ? "start" : "end"}>
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
            ].map((range) => (
              <Button
                key={range.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickRange(range.days)}
                className="text-xs border-border"
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
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <h3 className="font-semibold text-sm">{monthName}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-xs font-semibold text-muted-foreground h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {days.map((day) => {
                const isStart = isDateStart(day);
                const isEnd = isDateEnd(day);
                const inRange = isDateInRange(day);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 rounded text-xs font-medium transition-colors ${
                      isStart || isEnd
                        ? "bg-primary text-white"
                        : inRange
                        ? "bg-primary/20 text-primary"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Range Display */}
          {startDate && endDate && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="text-sm">
                <p className="text-muted-foreground">Selected Range:</p>
                <p className="font-semibold text-foreground">
                  {formatDate(startDate)} → {formatDate(endDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex-1 border-border"
                >
                  <X size={14} className="mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
