import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricKey } from "@/components/analyticsPage/AnalyticsFilters";

import type { AnalyticsMode } from "@/pages/mess-manager/AnalyticsPage";

const METRIC_META: Record<
  MetricKey,
  { label: string; color: string }
> = {
  served: { label: "Served", color: "emerald" },
  declaredAbsent: { label: "Declared Absent", color: "amber" },
  noShow: { label: "No Show", color: "red" },
};

function formatStatValue(
  value: number,
  mode: AnalyticsMode
): string {
  if (mode === "count") return String(value);

  if (value >= 1e7) return `₹${(value / 1e7).toFixed(3)}Cr`;
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(3)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(3)}K`;

  return `₹${value}`;
}

export default function StatGrid({
  totals,
  selectedMetrics,
  onToggleMetric,
  mode,
}: {
  totals: Record<string, number>;
  selectedMetrics: MetricKey[];
  onToggleMetric: (metric: MetricKey) => void;
  mode: AnalyticsMode;
}) {
  const metrics = Object.keys(METRIC_META) as MetricKey[];

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-4
        justify-items-center
      "
    >
      {metrics.map((key) => {
        const meta = METRIC_META[key];
        const active = selectedMetrics.includes(key);

        return (
          <Card
            key={key}
            onClick={() => onToggleMetric(key)}
            className={cn(
              "w-full max-w-[220px] cursor-pointer transition-all rounded-2xl hover:shadow-md",
              active
                ? `ring-2 ring-${meta.color}-500 bg-${meta.color}-50/40 dark:bg-${meta.color}-500/10`
                : "opacity-80 hover:opacity-100"
            )}
          >
            <CardContent className="p-4 text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                {meta.label}
              </p>

              <p
                className={cn(
                  "text-2xl font-semibold",
                  active &&
                    `text-${meta.color}-600 dark:text-${meta.color}-400`
                )}
              >
                {formatStatValue(totals[key] ?? 0, mode)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

