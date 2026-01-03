import { type MessProfile } from "@/types/mess.types";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MealStatsTable({
  data,
}: {
  data: MessProfile;
}) {
  const rows = [
    {
      label: "Served",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      today: data.stats.today.served,
      total: data.stats.total.served,
    },
    {
      label: "Declared Absent",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      today: data.stats.today.declaredAbsent,
      total: data.stats.total.declaredAbsent,
    },
    {
      label: "No Show",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-500/10",
      today: data.stats.today.noShow,
      total: data.stats.total.noShow,
    },
  ];

  return (
    <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-5">
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">Meal Statistics</h3>
        <p className="text-xs text-muted-foreground">
          Today vs cumulative performance
        </p>
      </div>

      {/* STATS */}
      <div className="space-y-3">
        {rows.map((r) => {
          const Icon = r.icon;

          return (
            <div
              key={r.label}
              className="
                group flex items-center justify-between
                rounded-xl border px-4 py-3
                transition-all
                hover:shadow-sm hover:bg-muted/40
              "
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    r.bg
                  )}
                >
                  <Icon className={cn("h-5 w-5", r.color)} />
                </div>

                <span className="font-medium">{r.label}</span>
              </div>

              {/* RIGHT */}
              <div className="text-right text-sm">
                <div className="font-semibold">
                  Today:{" "}
                  <span className={r.color}>{r.today}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Total: {r.total}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
