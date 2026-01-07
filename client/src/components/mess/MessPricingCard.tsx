
import { IndianRupee, AlertTriangle } from "lucide-react";
import { type MessProfile } from "@/types/mess.types";

export default function MessPricingCard({
  data,
}: {
  data: MessProfile;
}) {
  const { prices, penaltyPercent } = data.pricing;

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="text-lg font-semibold">Meal Pricing & Penalty</h3>

      {/* PRICES */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {Object.entries(prices).map(([meal, price]) => (
          <div
            key={meal}
            className="
              rounded-xl border bg-background p-3
              flex items-center justify-between
              hover:shadow-sm transition
            "
          >
            <span className="capitalize text-muted-foreground">
              {meal}
            </span>

            <span className="font-semibold inline-flex items-center gap-1">
              <IndianRupee className="h-4 w-4" />
              {price}
            </span>
          </div>
        ))}
      </div>

      {/* PENALTY */}
      <div
        className="
          flex items-center gap-2
          rounded-xl border border-red-500/30
          bg-red-500/10 px-4 py-3
          text-sm text-red-700
        "
      >
        <AlertTriangle className="h-4 w-4" />
        No-Show Penalty:
        <span className="font-semibold">
          {penaltyPercent}%
        </span>
      </div>
    </div>
  );
}
