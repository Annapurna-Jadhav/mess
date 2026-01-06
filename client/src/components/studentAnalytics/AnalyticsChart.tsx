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

/* ---------- COLORS ---------- */
const COLORS = {
  messSpent: "#ef4444",
  walletCredit: "#22c55e",
  foodCourtSpent: "#f59e0b",
};

/* ---------- FORMATTERS ---------- */
function formatCurrency(value: number) {
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(1)}L`;
  if (value >= 1e3) return `₹${(value / 1e3).toFixed(1)}K`;
  return `₹${value}`;
}

function formatDayDate(dateStr: string) {
  const d = new Date(dateStr);

  const day = d.toLocaleDateString("en-US", {
    weekday: "short",
  });

  const date = d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  return `${day} ${date}`;
}

/* ---------- COMPONENT ---------- */
export default function StudentRevenueChart({
  data,
  loading,
}: {
  data: any[];
  loading?: boolean;
}) {
  /* ---------- STATES ---------- */
  if (loading) {
    return (
      <div className="h-[340px] flex items-center justify-center text-muted-foreground">
        Loading revenue analytics…
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="h-[340px] flex items-center justify-center text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  /* ---------- SCALE ---------- */
  const maxY = Math.max(
    ...data.flatMap((row) =>
      ["messSpent", "walletCredit", "foodCourtSpent"].map(
        (k) => Number(row[k] || 0)
      )
    ),
    0
  );

  const maxTicks = 10;
  const xAxisInterval =
    data.length <= maxTicks
      ? 0
      : Math.ceil(data.length / maxTicks) - 1;

  /* ---------- UI ---------- */
  return (
    <div className="rounded-2xl border bg-card p-4">
      <h3 className="font-semibold mb-3 text-sm text-muted-foreground">
        Spending & Savings Trend
      </h3>

      <div className="text-black dark:text-white">
        <ResponsiveContainer width="100%" height={340}>
          <LineChart
            data={data}
            margin={{ top: 16, right: 14, bottom: 12, left: 16 }}
          >
            {/* X AXIS */}
            <XAxis
              dataKey="date"
              tickFormatter={formatDayDate}
              interval={xAxisInterval}
              padding={{ left: 10, right: 20 }}
              tick={{
                fill: "currentColor",
                fontSize: 12,
                fontWeight: 600,
              }}
            />

            {/* Y AXIS */}
            <YAxis
              domain={[0, Math.ceil(maxY * 1.15)]}
              tickFormatter={(v) => formatCurrency(Number(v))}
              tick={{ fill: "currentColor", fontSize: 12 }}
            >
              <Label
                value="Amount (₹)"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: "middle", fill: "currentColor" }}
              />
            </YAxis>

            {/* TOOLTIP */}
            <Tooltip
              content={(props) => <RevenueTooltip {...props} />}
              wrapperStyle={{
                zIndex: 9999,
                pointerEvents: "none",
              }}
            />

            {/* LEGEND */}
            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: "hsl(var(--foreground))",
              }}
            />

            {/* LINES */}
            <Line
              type="monotone"
              dataKey="messSpent"
              stroke={COLORS.messSpent}
              strokeWidth={2.5}
              dot={false}
              name="Mess Spent"
            />

            <Line
              type="monotone"
              dataKey="walletCredit"
              stroke={COLORS.walletCredit}
              strokeWidth={2.5}
              dot={false}
              name="Wallet Earned"
            />

            <Line
              type="monotone"
              dataKey="foodCourtSpent"
              stroke={COLORS.foodCourtSpent}
              strokeWidth={2.5}
              dot={false}
              name="Food Court Spent"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- TOOLTIP ---------- */
function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: readonly any[];
  label?: string | number;
}): JSX.Element | null {
  if (!active || !payload?.length || label == null) return null;

  const date = new Date(String(label));
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-xl border bg-background px-4 py-3 shadow-2xl text-sm">
      <p className="mb-2 font-semibold">{formattedDate}</p>

      <div className="space-y-1">
        {payload.map((p: any) => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <span style={{ color: p.stroke }}>{p.name}</span>
            <span className="font-medium">
              {formatCurrency(Number(p.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
