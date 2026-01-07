import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";
import { getMessAnalyticsSummary } from "@/api/mess.api";
import { cn } from "@/lib/utils";
 

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AnalyticsAIBox from "@/components/analyticsPage/AnalyticsAiBox";
import AnalyticsChart from "@/components/analyticsPage/AnalyticsChart";
import AnalyticsFilters, {
  type MetricKey,
  type MealKey,
} from "@/components/analyticsPage/AnalyticsFilters";
import DateRangePicker from "@/components/analyticsPage/DateRangePicker";
import StatGrid from "@/components/analyticsPage/StatGrid";
import PeakHoursChart from "@/components/analyticsPage/PeakHoursChart";

export type AnalyticsMode = "count" | "revenue" | "peakHours";

export default function AnalyticsPage() {
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const [mode, setMode] = useState<AnalyticsMode>("count");

const [metrics, setMetrics] = useState<MetricKey[]>(["served"]);
const [meals, setMeals] = useState<MealKey[]>(["breakfast"]);


const [rangeWarning, setRangeWarning] = useState<string | null>(null);

const [data, setData] = useState<{
  range?: any;
  daily: any[];
  totals?: any;
  peakByMeal?: any;
}>({
  daily: [], 
});

const [dateRange, setDateRange] = useState<{
  from?: string;
  to?: string;
}>({});




const getEffectiveRange = () => {
  if (dateRange.from && dateRange.to) {
    return {
      fromDate: dateRange.from,
      toDate: dateRange.to,
    };
  }

  // fallback → last 30 days
  const today = new Date();
  const end = today.toISOString().split("T")[0];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  const start = startDate.toISOString().split("T")[0];

  return {
    fromDate: start,
    toDate: end,
  };
};


useEffect(() => {
  loadInitialAnalytics();
}, []);

const loadInitialAnalytics = async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await getMessAnalyticsSummary(30);

    setData({
      range: res.data.range,
      daily: res.data.daily ?? [],
      totals: res.data.totals ?? null,
      peakByMeal: null,
    });

    setRangeWarning(null);
  } catch {
    setError("Failed to load analytics");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  
  loadRangeAnalytics();
}, [mode]);

const loadRangeAnalytics = async () => {
  const { fromDate, toDate } = getEffectiveRange();

  try {
    setLoading(true);
    setError(null);

    const res = await axiosClient.get(
      "mess-manager/analytics",
      {
        params: {
          fromDate,
          toDate,
          mode,
        },
      }
    );

    if (mode === "peakHours") {
      setData((prev) => ({
        range: res.data.data.range,
        daily: prev?.daily ?? [],
        totals: res.data.data.totals??null,
        peakByMeal: res.data.data.peakByMeal,
      }));
      setRangeWarning(null);
      return;
    }

    setData({
      range: res.data.data.range,
      daily: res.data.data.daily ?? [],
      totals: res.data.data.totals ?? null,
      peakByMeal: null,
    });

    
    setRangeWarning(null);
  } catch {
    setRangeWarning(
      "No data available for this date range. Please adjust dates."
    );
  } finally {
    setLoading(false);
  }
};


  
 if (loading) {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-[360px] w-full" />
    </div>
  );
}

  /* ---------------- ERROR ---------------- */
 if (error) {
  return (
    <Card className="max-w-xl mx-auto text-center">
      <CardContent className="py-8 space-y-2">
        <p className="text-destructive font-medium">{error}</p>
        <p className="text-sm text-muted-foreground">
          Try changing the date range.
        </p>
      </CardContent>
    </Card>
  );
}


  /* ---------------- EMPTY ---------------- */
 if (!data || (mode !== "peakHours" && data.daily.length === 0)) {
  return (
    <Card className="max-w-xl mx-auto text-center">
      <CardContent className="py-8 space-y-2">
        <p className="font-medium">No analytics available</p>
        <p className="text-sm text-muted-foreground">
          Select a different date range.
        </p>
      </CardContent>
    </Card>
  );
}


  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="min-h-screen bg-background px-6 py-6 space-y-6">
      {/* ---------- HEADER ---------- */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Mess Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Analyze attendance, revenue, and peak patterns.
        </p>
      </div>

      {/* ---------- CONTAINER 1: DATE + STATS ---------- */}
   <div
  className="
    w-full
    rounded-2xl
    border border-border/50
    bg-card
    px-6 py-4
    flex flex-wrap items-start justify-between gap-8
    shadow-sm
  "
>
  {/* ---------- DATE STRIP ---------- */}
  <div className="space-y-1">
    <p className="text-sm font-medium">
      Date Range
    </p>
    <p className="text-xs text-muted-foreground">
      Choose a custom date range to analyse
    </p>

    <DateRangePicker
      value={dateRange}
      onChange={setDateRange}
      onApply={loadRangeAnalytics}
    />
  </div>

  {/* ---------- STATS GRID ---------- */}
  <div className="flex-1 space-y-2">
    <h3 className="text-sm font-semibold tracking-wide">
      {mode === "revenue"
        ? "Revenue generated in selected period"
        : "Student count in selected period"}
    </h3>

    <StatGrid
      totals={data.totals}
      selectedMetrics={metrics}
      onToggleMetric={(m) =>
        setMetrics((prev) =>
          prev.includes(m)
            ? prev.filter((x) => x !== m)
            : [...prev, m]
        )
      }
      mode={mode === "revenue" ? "revenue" : "count"}
    />

    {rangeWarning && (
      <p className="text-xs text-muted-foreground">
        {rangeWarning}
      </p>
    )}
  </div>
</div>


      {/* ---------- CONTAINER 2: MODE + FILTERS ---------- */}
<div
  className="
    w-full
    rounded-2xl
    border border-border/50
    bg-card
    px-10 py-6
    shadow-sm
  "
>
  
  {/* ---------- MAIN GRID ---------- */}
  <div
    className="
      grid
      grid-cols-1
      lg:grid-cols-[260px_1fr]
      gap-12
      items-start
    "
  >
    {/* ---------- MODE SELECTION (LEFT) ---------- */}
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-foreground">
          View Mode
        </p>
        <p className="text-xs text-muted-foreground">
          Select analysis type
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {(["count", "revenue", "peakHours"] as AnalyticsMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              `
                w-full
                text-left
                px-4 py-2.5
                rounded-xl
                text-sm
                font-medium
                transition-all
              `,
              mode === m
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {m === "count" && "Student Count"}
            {m === "revenue" && "Revenue"}
            {m === "peakHours" && "Peak Hours"}
          </button>
        ))}
      </div>
    </div>

    {/* ---------- FILTERS (RIGHT) ---------- */}
    <div
      className="
        relative
        pl-10
        border-l
        border-border/60
      "
    >
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">
          Filters
        </p>
        <p className="text-xs text-muted-foreground">
          Narrow results by meal and metric
        </p>
      </div>

      <AnalyticsFilters
        metrics={metrics}
        setMetrics={setMetrics}
        meals={meals}
        setMeals={setMeals}
      />
    </div>
  </div>
</div>


      {/* ---------- CHART ---------- */}
      <div className="w-full h-[420px]">
        {mode !== "peakHours" && (
          <AnalyticsChart
            daily={data.daily}
            metrics={metrics}
            meals={meals.length ? (meals as string[]) : null}
            mode={mode}
          />
        )}

    {mode === "peakHours" && data.peakByMeal && (
  <PeakHoursChart
    peakByMeal={data.peakByMeal}
    meals={meals.length ?( meals as string[]) : null}
  />
)}

        </div>

      {/* ---------- AI ASSISTANT ---------- */}
      <section className="mt-10 pt-6 border-t border-border/60">
        <AnalyticsAIBox />
      </section>
    </div>
  );
}
