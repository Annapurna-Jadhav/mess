import { useEffect, useState } from "react";
import axiosClient from "@/api/axiosClient";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import AnalyticsHeader from "@/components/studentAnalytics/AnalyticsHeader";
import StatsGrid from "@/components/studentAnalytics/StatsGrid";
import StudentRevenueChart from "@/components/studentAnalytics/AnalyticsChart";
import DailyAnalyticsTable from "@/components/studentAnalytics/DailyAnalyticsTable";


import type { AnalyticsMode } from "@/components/studentAnalytics/types";

export default function StudentAnalyticsPage() {
 

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<AnalyticsMode>("meals");

  const [dateRange, setDateRange] = useState<{
    from?: string;
    to?: string;
  }>({});

 
  const [data, setData] = useState<{
    daily: any[];
    summary: any | null;
  }>({
    daily: [],
    summary: null,
  });

  
 

  //   data.daily.forEach((day) => {
  //     Object.entries(day.meals || {}).forEach(([meal, m]: any) => {
  //       if (m.status === "SERVED") {
  //         acc[meal] = (acc[meal] || 0) + 1;
  //       }
  //     });
  //   });

  //   console.log("🍽️ Meal counts:", acc);
  //   return acc;
  // }, [data.daily]);

  const getEffectiveRange = () => {
    if (dateRange.from && dateRange.to) {
      console.log("📅 Using selected range:", dateRange);
      return dateRange;
    }

    const end = new Date().toISOString().split("T")[0];
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const fallback = {
      from: start.toISOString().split("T")[0],
      to: end,
    };

   
    return fallback;
  };

 
  const loadAnalytics = async () => {
    const { from, to } = getEffectiveRange();

    console.log("🚀 loadAnalytics()", { mode, from, to });

    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/student/analytics", {
        params: { mode, from, to },
      });

      console.log("📦 RAW API RESPONSE:", res.data);

      const payload = res.data?.data;

      setData({
        daily: payload?.daily ?? [],
        summary: payload?.summary ?? null,
      });

      console.log("✅ Analytics state updated");
    } catch (err) {
      console.error("❌ Failed to load analytics", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    console.log("🔄 Mode changed → reload analytics:", mode);
    loadAnalytics();
   
  }, [mode]);

  
  if (loading) {
    console.log("⏳ Loading state");
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
    );
  }

  if (error) {
    console.log("🟥 Error state:", error);
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

  if (!data.daily.length) {
    console.log("⚠️ Empty analytics");
    return (
      <Card className="max-w-xl mx-auto text-center">
        <CardContent className="py-8 space-y-2">
          <p className="font-medium">No activity found</p>
          <p className="text-sm text-muted-foreground">
            You have no mess records for this period.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log("🟦 Rendering analytics UI");

 
  return (
    <div className="min-h-screen bg-background px-6 py-6 space-y-6">
      
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your Mess Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          See what you ate, what you missed, and how your money moved.
        </p>
      </div>

     
      <div className="rounded-3xl border border-border/50 bg-card px-6 py-5 shadow-sm space-y-5">
      <AnalyticsHeader
  mode={mode}
  onModeChange={setMode}
  dateRange={dateRange}
  onDateChange={setDateRange}
  onApplyDateRange={loadAnalytics}
/>


        <StatsGrid
          mode={mode}
          summary={data.summary}
          loading={loading}
        />
      </div>

      {/* CHART */}
    {mode === "revenue" && (
  <StudentRevenueChart
    data={data.daily}
    loading={loading}
  />
)}


      
      <DailyAnalyticsTable data={data.daily} />

      
    </div>
  );
}
