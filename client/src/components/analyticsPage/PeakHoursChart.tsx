
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

/* ---------- STYLES ---------- */

const MEAL_COLORS: Record<string, string> = {
  breakfast: "#22c55e",
  lunch: "#3b82f6",
  snacks: "#f59e0b",
  dinner: "#ef4444",
};

const MEAL_STYLES: Record<string, string> = {
  breakfast: "0",
  lunch: "5 5",
  snacks: "2 2",
  dinner: "8 4",
};

/* ---------- TIME HELPERS ---------- */

// "08:15-08:30" → 495
function bucketToMinutes(bucket?: string) {
  if (!bucket || typeof bucket !== "string") return null;

  const [start] = bucket.split("-");
  if (!start) return null;

  const [h, m] = start.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;

  return h * 60 + m;
}

function minutesToLabel(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function formatDayDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.toLocaleDateString("en-US", { weekday: "short" });
  const date = d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });
  return `${day} ${date}`;
}

/* ---------- COMPONENT ---------- */

export default function PeakHoursChart({
  peakByMeal,
  meals,
}: {
  peakByMeal: {
    date: string;
    meals: Record<string, string>;
  }[];
  meals: string[] | null;
}) {
  if (!peakByMeal?.length) return null;

  /* ---------- BUILD CHART DATA ---------- */
  const chartData = peakByMeal.map((day) => {
    const row: any = { date: day.date };

    const activeMeals =
      meals && meals.length ? meals : Object.keys(day.meals || {});

    activeMeals.forEach((meal) => {
      const mins = bucketToMinutes(day.meals?.[meal]);
      if (mins !== null) {
        row[meal] = mins;
      }
    });

    return row;
  });
  const totalPoints = chartData.length;

// max 12 visible ticks
const xAxisInterval =
  totalPoints <= 12
    ? 0
    : Math.ceil(totalPoints / 12) - 1;


  const values = chartData.flatMap((r) =>
    Object.keys(r)
      .filter((k) => k !== "date")
      .map((k) => r[k])
  );

  const minY = Math.min(...values) - 15;
  const maxY = Math.max(...values) + 15;

  /* ---------- UI ---------- */
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
        Peak Meal Hours
      </h3>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={chartData}
          margin={{ top: 16, right: 5, bottom: 12, left: 5 }}
          >
         <XAxis
  dataKey="date"
  type="category"
  interval={xAxisInterval}       
  tickFormatter={formatDayDate}
  padding={{ left: 16, right: 16 }} 
  minTickGap={24}                
  tick={{
    fill: "currentColor",
    fontSize: 12,
    fontWeight: 600,
  }}
/>

          <YAxis
            domain={[minY, maxY]}
            tickFormatter={minutesToLabel}
            tick={{ fill: "currentColor", fontSize: 12 }}
            width={110}
          >
            <Label
              value="Time"
              angle={-90}
              position="insideLeft"
              offset={5}
              style={{ textAnchor: "middle", fill: "currentColor" }}
            />
          </YAxis>

          <Tooltip content={<PeakTooltip />}  wrapperStyle={{
    zIndex: 9999,             
    pointerEvents: "none",     
  }}/>

          <Legend
            wrapperStyle={{
              fontSize: 12,
              color: "hsl(var(--foreground))",
            }}
          />

          {(meals?.length
            ? meals
            : Object.keys(MEAL_COLORS)
          ).map((meal) => (
            <Line
              key={meal}
              type="monotone"
              dataKey={meal}
              stroke={MEAL_COLORS[meal]}
              strokeWidth={2.5}
              strokeDasharray={MEAL_STYLES[meal]}
              dot={false}
              name={meal}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- TOOLTIP ---------- */

function PeakTooltip({
  active,
  payload,
  label,
}: any): JSX.Element | null {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-xl border bg-background px-4 py-3 shadow-2xl text-sm">
      <p className="mb-2 font-semibold">
        {new Date(label).toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })}
      </p>

      <div className="space-y-1">
        {payload.map((p: any) => (
          <div
            key={p.dataKey}
            className="flex justify-between gap-4"
          >
            <span
              className="capitalize"
              style={{ color: p.stroke }}
            >
              {p.name}
            </span>
            <span className="font-medium">
              {minutesToLabel(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
