import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  CalendarX,
  AlertTriangle,
  CalendarDays,
  Wallet,
  IndianRupee,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react";
import type { AnalyticsMode } from "./types";

type Props = {
  mode: AnalyticsMode;
  summary: any;
  loading?: boolean;
};

export default function StatsGrid({ mode, summary, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-7 w-16 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const stats =
    mode === "meals"
      ? [
          {
            label: "Meals Served",
            value: summary.totalServed,
            icon: CheckCircle2,
            color: "text-emerald-600",
            hint: "Meals you actually consumed",
          },
          {
            label: "Declared Absent",
            value: summary.totalDeclaredAbsent,
            icon: CalendarX,
            color: "text-blue-600",
            hint: "Absences declared in advance",
          },
          {
            label: "No Shows",
            value: summary.totalNoShow,
            icon: AlertTriangle,
            color: "text-amber-600",
            hint: "Missed meals without declaration",
          },
          {
            label: "Days Tracked",
            value: summary.totalDays,
            icon: CalendarDays,
            color: "text-muted-foreground",
            hint: "Total days in selected period",
          },
        ]
      : [
          {
            label: "Mess Spent",
            value: `₹${summary.totalMessSpent}`,
            icon: IndianRupee,
            color: "text-red-600",
            hint: "Amount charged for mess meals",
          },
          {
            label: "Wallet Earned",
            value: `₹${summary.totalWalletCredit}`,
            icon: Wallet,
            color: "text-emerald-600",
            hint: "Money saved from absences",
          },
          {
            label: "Food Court Spent",
            value: `₹${summary.totalFoodCourtSpent}`,
            icon: UtensilsCrossed,
            color: "text-orange-600",
            hint: "Spent using wallet in food court",
          },
          {
            label: "Net Wallet Change",
            value: `₹${summary.netWalletChange}`,
            icon: TrendingUp,
            color:
              summary.netWalletChange >= 0
                ? "text-emerald-600"
                : "text-red-600",
            hint: "Wallet gain/loss in this period",
          },
        ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card
          key={s.label}
          className="
            p-4
            transition
            hover:shadow-md
            hover:-translate-y-[1px]
          "
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm text-muted-foreground">
                {s.label}
              </div>

              <div className="text-2xl font-bold mt-1">
                {s.value}
              </div>
            </div>

            <s.icon className={`h-5 w-5 ${s.color}`} />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            {s.hint}
          </div>
        </Card>
      ))}
    </div>
  );
}
