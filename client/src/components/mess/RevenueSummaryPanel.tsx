import { type MessProfile } from "@/types/mess.types";
import { Progress } from "@/components/ui/progress";

export default function RevenueSummaryPanel({
  data,
}: {
  data: MessProfile;
}) {
  const percent =
    (data.revenue.today / data.revenue.total) * 100 || 0;

  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <h3 className="font-semibold">Revenue Snapshot</h3>

      <div>
        <p className="text-sm text-muted-foreground">Today</p>
        <p className="text-2xl font-bold">
          ₹{data.revenue.today}
        </p>
      </div>

      <Progress value={percent} />

      <p className="text-xs text-muted-foreground">
        Today contributes {percent.toFixed(1)}% of total revenue
      </p>
    </div>
  );
}
