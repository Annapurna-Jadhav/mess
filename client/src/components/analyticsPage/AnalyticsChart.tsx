import type { JSX } from "react";
import { Label } from "recharts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const METRIC_COLORS: Record<string, string> = {
  served: "#22c55e",
  declaredAbsent: "#f59e0b",
  noShow: "#ef4444",
};

const MEAL_STYLES: Record<string, string> = {
  breakfast: "0",
  lunch: "5 5",
  snacks: "2 2",
  dinner: "8 4",
};
function formatValue(value: number, mode: "count" | "revenue" | "peakHours") {
  if (mode === "count") return value.toString();

  if (mode === "revenue") {
    if (value >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (value >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
    if (value >= 1e3) return `₹${(value / 1e3).toFixed(2)} K`;
    return `₹${value}`;
  }

  return value.toString();
}


export default function AnalyticsChart({
  daily,
  metrics,
  meals,
  mode = "count", // count | revenue
}: {
  daily: any[];
  metrics: string[];
  meals: string[] | null;
  mode?: "count" | "revenue";
}) {

  if (!daily?.length) return null;

  
const chartData = daily.map((d) => {
  const row: any = { date: d.date };

  metrics.forEach((metric) => {
    
    if (!meals || meals.length === 0) {
      let total = 0;

      Object.values(d.meals || {}).forEach((m: any) => {
        total += Number(m?.[metric] || 0);
      });

      row[metric] = total;
    }

    
    else {
      meals.forEach((meal) => {
        row[`${meal}_${metric}`] =
          Number(d.meals?.[meal]?.[metric] || 0);
      });
    }
  });

  return row;
});
const maxY = Math.max(
  ...chartData.flatMap((row) =>
    Object.keys(row)
      .filter((k) => k !== "date")
      .map((k) => Number(row[k] || 0))
  ),
  0
);
const maxTicks = 12;

const xAxisInterval =
  daily.length <= maxTicks
    ? 0
    : Math.ceil(daily.length / maxTicks) - 1;


  const formatDayDate = (dateStr: string) => {
  const d = new Date(dateStr);

  const day = d.toLocaleDateString("en-US", {
    weekday: "short",
  });

  const date = d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  return `${day} ${date}`;
};


  /* ---------------- LINES ---------------- */
  const lines: JSX.Element[] = [];

  metrics.forEach((metric) => {
    if (!meals || meals.length === 0) {
      lines.push(
        <Line
          key={metric}
          type="monotone"
          dataKey={metric}
          stroke={METRIC_COLORS[metric]}
          strokeWidth={2.5}
          dot={false}
          name={metric.replace(/([A-Z])/g, " $1")}
        />
      );
    } else {
      meals.forEach((meal) => {
        lines.push(
          <Line
            key={`${meal}_${metric}`}
            type="monotone"
            dataKey={`${meal}_${metric}`}
            stroke={METRIC_COLORS[metric]}
            strokeWidth={2}
            strokeDasharray={MEAL_STYLES[meal]}
            dot={false}
            name={`${meal} • ${metric}`}
          />
        );
      });
    }
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
  {mode === "revenue"
    ? "Revenue Trends"
    : "Attendance Trends"}
</h3>

<div className="text-black dark:text-white">
     <ResponsiveContainer
  key={mode}              
  width="100%"
  height={340}
>
  <LineChart
  data={chartData}
  margin={{ top: 16, right: 14, bottom: 12, left: 16 }} 
>


<XAxis
  dataKey="date"
  type="category"
  tickFormatter={formatDayDate}
  interval={xAxisInterval}
  padding={{ left:10, right: 20 }}
  tick={{
    fill: "currentColor",
    fontSize: 12,
    fontWeight: 600,
  }}
/>



<YAxis
  domain={
    mode === "revenue"
      ? [0, Math.ceil(maxY * 1.15)] 
      : [0, "auto"]
  }
  tickFormatter={(v) => formatValue(Number(v), mode)}
  tick={{
    fill: "currentColor",
    fontSize: 12,
  }}
>
  <Label
    value={mode === "revenue" ? "Revenue (₹)" : "Students"}
    angle={-90}
    position="insideLeft"
    offset={0}
    style={{ textAnchor: "middle", fill: "currentColor" }}
  />
</YAxis>





  <Tooltip
  content={(props) => (
    <CustomTooltip
      {...props}
      mode={mode}
    />
  )}
   wrapperStyle={{
    zIndex: 9999,             
    pointerEvents: "none",     
  }}
/>


    <Legend
      wrapperStyle={{
        fontSize: 12,
        color: "hsl(var(--foreground))",
      }}
    />

    {lines}
  </LineChart>
</ResponsiveContainer>
</div>

    </div>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: readonly any[]; // ✅ FIX
  label?: string|number;
  mode: "count" | "revenue" | "peakHours";
};

function CustomTooltip({
  active,
  payload,
  label,
  mode,
}: TooltipProps): JSX.Element | null {
  if (!active || !payload?.length || label == null) return null;

  const date =
    typeof label === "string"
      ? new Date(label)
      : new Date(String(label));

  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="
        rounded-xl border
        bg-background
        px-4 py-3
        shadow-2xl
        text-sm
      "
    >
      <p className="mb-2 font-semibold">{formattedDate}</p>

      <div className="space-y-1">
        {payload.map((p: any) => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <span
              className="capitalize"
              style={{ color: p.stroke }}
            >
              {p.name}
            </span>

            <span className="font-medium">
              {formatValue(Number(p.value), mode)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
