
import { useEffect, useState } from "react";
import { type MessProfile } from "@/types/mess.types";
import api from "@/api/axiosClient";


import { Card } from "@/components/ui/card";

import MessHeader from "@/components/mess/MessHeader";
import KPIGrid from "@/components/mess/KPIGrid";
import MealStatsTable from "@/components/mess/MealStatsTable";

import MessPricingCard from "@/components/mess/MessPricingCard";

export default function MessDashboardPage() {
  const [data, setData] = useState<MessProfile | null>(null);

  useEffect(() => {
    api.get("/mess-manager/profile").then((res) => {
      setData(res.data.data);
    });
  }, []);

  /* ---------------- LOADING ---------------- */
  if (!data) {
    return (
      <div className="h-[60vh] flex items-center justify-center text-muted-foreground">
        Loading mess dashboard…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="rounded-3xl border bg-gradient-to-br from-[#6770d2]/10 via-transparent to-transparent p-6">
        <MessHeader data={data} />
      </div>

   
      <div className="rounded-3xl border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-[#6770d2] uppercase">
            Revenue Snapshot
          </h2>

          <span className="text-xs text-muted-foreground">
            Auto-calculated after each meal window
          </span>
        </div>

        <KPIGrid data={data} />
      </div>

      
      <div className="grid lg:grid-cols-2 gap-6">

        {/* PRICING & POLICY */}
        <Card className="rounded-3xl p-6 hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-[#6770d2] mb-4 uppercase tracking-wide">
            Pricing & Policy
          </h3>
          <MessPricingCard data={data} />
        </Card>

        {/* MEAL STATS */}
        <Card className="rounded-3xl p-6 hover:shadow-xl transition">
          <h3 className="text-sm font-semibold text-[#6770d2] mb-4 uppercase tracking-wide">
            Meal Performance
          </h3>
          <MealStatsTable data={data} />
        </Card>

       
      </div>

      
      <div className="rounded-3xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        AI insights & peak-hour predictions will appear here
      </div>
    </div>
  );
}
