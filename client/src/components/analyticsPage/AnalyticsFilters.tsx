import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export type MetricKey = "served" | "declaredAbsent" | "noShow";
export type MealKey = "breakfast" | "lunch" | "snacks" | "dinner" | null;



export default function AnalyticsFilters({
  metrics,
  setMetrics,
  meals,
  setMeals,
  
}: {
  metrics: MetricKey[];
  setMetrics: Dispatch<SetStateAction<MetricKey[]>>;
  meals: MealKey[];
  setMeals: Dispatch<SetStateAction<MealKey[]>>;
 

}) {

  const METRICS = [
    {
      key: "served" as MetricKey,
      label: "Served",
      icon: CheckCircle2,
      active:
        "bg-emerald-500/15 text-emerald-600 ring-2 ring-emerald-500/30",
    },
    {
      key: "declaredAbsent" as MetricKey,
      label: "Absent",
      icon: AlertTriangle,
      active:
        "bg-amber-500/15 text-amber-600 ring-2 ring-amber-500/30",
    },
    {
      key: "noShow" as MetricKey,
      label: "No Show",
      icon: XCircle,
      active:
        "bg-red-500/15 text-red-600 ring-2 ring-red-500/30",
    },
  ];

  const MEALS: { key: MealKey; label: string }[] = [
    { key: null, label: "All" },
    { key: "breakfast", label: "Breakfast" },
    { key: "lunch", label: "Lunch" },
    { key: "snacks", label: "Snacks" },
    { key: "dinner", label: "Dinner" },
  ];

  /* ---------- METRIC TOGGLE ---------- */
  const toggleMetric = (key: MetricKey, e: React.MouseEvent) => {
  const multi = e.metaKey || e.ctrlKey || e.shiftKey;

  if (multi) {
    setMetrics((prev) =>
      prev.includes(key)
        ? prev.filter((m) => m !== key)
        : [...prev, key]
    );
  } else {
    setMetrics([key]);
  }
};
const toggleMeal = (key: MealKey) => {
  if (key === null) {
    // "All" clicked → reset
    setMeals([]);
    return;
  }

  setMeals((prev) =>
    prev.includes(key)
      ? prev.filter((m) => m !== key)
      : [...prev, key]
  );
};

 return (
  <div className="space-y-5 flex flex-col items-center">
    {/* ================= METRICS ================= */}
    <div className="flex flex-wrap justify-center gap-4">
      {METRICS.map((m) => {
        const Icon = m.icon;
        const active = metrics.includes(m.key);

        return (
          <button
            key={m.key}
            onClick={(e) => toggleMetric(m.key, e)}
            className={cn(
              `
              flex items-center gap-3
              rounded-2xl px-5 py-3
              border transition-all
              hover:scale-[1.03]
              `,
              active
                ? m.active
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon size={18} />
            <span className="text-sm font-semibold">
              {m.label}
            </span>
          </button>
        );
      })}
    </div>

    {/* ================= DIVIDER ================= */}
    <div className="h-px w-full bg-border/60" />

    {/* ================= MEALS ================= */}
    <div className="flex flex-wrap justify-center gap-2">
      {MEALS.map((m) => {
        const active =
          m.key === null
            ? meals.length === 0
            : meals.includes(m.key);

        return (
          <button
            type="button"
            key={m.label}
            onClick={() => toggleMeal(m.key)}
            className={cn(
              `
              rounded-full px-4 py-1.5
              text-sm transition-all
              `,
              active
                ? "bg-primary/15 text-primary ring-2 ring-primary/30"
                : "bg-muted/40 text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  </div>
);

}
