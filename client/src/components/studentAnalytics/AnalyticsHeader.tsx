import ModeToggle from "./ModeToggle";
import StudentDateRangePicker from "./StudentDateRangePicker";
import type { AnalyticsMode, DateRange } from "./types";

type Props = {
  mode: AnalyticsMode;
  onModeChange: (v: AnalyticsMode) => void;

  dateRange: DateRange;
  onDateChange: (v: DateRange) => void;
  onApplyDateRange: () => void;
};

export default function AnalyticsHeader({
  mode,
  onModeChange,
  dateRange,
  onDateChange,
  onApplyDateRange,
}: Props) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      {/* ---------- LEFT: MODE ---------- */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          View
        </span>
        <ModeToggle value={mode} onChange={onModeChange} />
      </div>

      {/* ---------- RIGHT: DATE RANGE ---------- */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">
          Date range
        </span>
        <StudentDateRangePicker
          value={dateRange}
          onChange={onDateChange}
          onApply={onApplyDateRange}
        />
      </div>
    </div>
  );
}
