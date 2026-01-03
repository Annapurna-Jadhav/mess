import { IndianRupee, TrendingUp } from "lucide-react";
import StatCard from "./StatCard";
import { type MessProfile } from "@/types/mess.types";

export default function KPIGrid({ data }: { data: MessProfile }) {
  const today = data.revenue.today;
  const total = data.revenue.total;

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      {/* TODAY REVENUE */}
      <StatCard
        title="Today's Revenue"
        value={`₹${today.toLocaleString()}`}
        icon={IndianRupee}
        highlight
        footer={
          <div className="flex items-center gap-1 text-xs text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            Earnings from meals served today
          </div>
        }
        className="
          bg-gradient-to-br
          from-emerald-500/10 via-transparent to-transparent
          hover:shadow-lg hover:-translate-y-0.5
          transition-all
        "
      />

      {/* TOTAL REVENUE */}
      <StatCard
        title="Total Revenue"
        value={`₹${total.toLocaleString()}`}
        icon={IndianRupee}
        footer={
          <div className="text-xs text-muted-foreground">
            Cumulative earnings till date
          </div>
        }
        className="
          bg-gradient-to-br
          from-blue-500/10 via-transparent to-transparent
          hover:shadow-lg hover:-translate-y-0.5
          transition-all
        "
      />
    </div>
  );
}
