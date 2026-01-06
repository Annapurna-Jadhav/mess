
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

export default function StudentDateRangePicker({
  value,
  onChange,
  onApply,
}: {
  value: { from?: string; to?: string };
  onChange: (v: { from?: string; to?: string }) => void;
  onApply: () => void;
}) {
  // yesterday (no future dates)
  const maxDate = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];

  return (
    <div
      className="
        flex flex-wrap items-end gap-4
        rounded-3xl px-6 py-4
        bg-background/70 backdrop-blur-xl
        border border-border/40
        shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)]
      "
    >
      {/* FROM */}
      <DateField
        label="From"
        value={value.from}
        max={maxDate}
        onChange={(v) => onChange({ ...value, from: v })}
      />

      {/* TO */}
      <DateField
        label="To"
        value={value.to}
        min={value.from}
        max={maxDate}
        onChange={(v) => onChange({ ...value, to: v })}
      />

      {/* APPLY */}
      <Button
        onClick={onApply}
        disabled={!value.from || !value.to}
        className="
          h-11 px-7
          rounded-2xl
          bg-primary text-primary-foreground
          shadow-lg
          hover:shadow-xl hover:scale-[1.02]
          active:scale-[0.98]
          transition-all
          disabled:opacity-50 disabled:shadow-none
        "
      >
        Apply
      </Button>
    </div>
  );
}

/* ---------- SUB COMPONENT ---------- */

function DateField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value?: string;
  min?: string;
  max?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
      </span>

      <div
        className="
          relative group
          rounded-xl
          bg-muted/40
          border border-border/40
          focus-within:border-primary/60
          focus-within:ring-2 focus-within:ring-primary/20
          transition
        "
      >
        <Calendar
          size={16}
          className="
            absolute left-3 top-1/2 -translate-y-1/2
            text-foreground/70
            group-focus-within:text-primary
            transition
          "
        />

        <Input
          type="date"
          value={value || ""}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          className="
            h-11 pl-9 pr-3
            border-0 bg-transparent
            text-foreground
            focus-visible:ring-0
          "
        />
      </div>
    </div>
  );
}
