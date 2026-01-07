import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Search } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  SERVED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  DECLARED_ABSENT:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  NO_SHOW:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

const MEALS = ["breakfast", "lunch", "snacks", "dinner"] as const;

export default function DailyAnalyticsTable({
  data,
}: {
  data: any[];
}) {
  const [search, setSearch] = useState("");
  const [dateFilter] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filteredData = useMemo(() => {
    let rows = [...data];

  
    rows.sort((a, b) =>
      sort === "newest"
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date)
    );

 
    if (dateFilter) {
      rows = rows.filter((d) => d.date === dateFilter);
    }

    /* ---------- SEARCH ---------- */
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((d) =>
        new Date(d.date)
          .toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })
          .toLowerCase()
          .includes(q)
      );
    }

    return rows;
  }, [data, search, dateFilter, sort]);

  if (!data?.length) return null;

 return (
  <Card className="p-5 space-y-4">
    {/* ---------- HEADER + CONTROLS ---------- */}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* LEFT: TITLE */}
      <div className="flex flex-col">
        <h3 className="text-sm font-semibold">
          Daily Meal & Spending
        </h3>
        <span className="text-xs text-muted-foreground">
          Search by date or weekday
        </span>
      </div>

      {/* RIGHT: CONTROLS */}
      <div className="flex items-center gap-2">
        {/* SEARCH */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mon, 5 Jan, 2026-01-05"
            className="
              h-9 w-[220px]
              pl-8
              bg-muted/40
              border-border/40
              focus:bg-background
            "
          />
        </div>

        {/* SORT */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setSort(sort === "newest" ? "oldest" : "newest")
          }
          className="h-9 px-3 gap-1.5"
        >
          <ArrowDownUp size={14} />
          {sort === "newest" ? "Newest" : "Oldest"}
        </Button>
      </div>
    </div>

    <div className="overflow-x-auto rounded-xl border border-border/40">
  <table className="w-full text-sm table-fixed">
    {/* ---------- HEADER ---------- */}
    <thead className="bg-muted/30 border-b">
      <tr className="text-muted-foreground">
        <th className="py-2 px-3 text-left w-[140px]">
          Date
        </th>

        {MEALS.map((m) => (
          <th
            key={m}
            className="py-2 px-3 text-center capitalize"
          >
            {m}
          </th>
        ))}

        <th className="py-2 px-3 text-right w-[110px]">
          Mess ₹
        </th>
        <th className="py-2 px-3 text-right w-[120px]">
          Wallet +₹
        </th>
      </tr>
    </thead>

    {/* ---------- BODY ---------- */}
    <tbody>
      {filteredData.map((day) => (
        <tr
          key={day.date}
          className="
            border-b last:border-0
            hover:bg-muted/40
            transition
          "
        >
          {/* DATE */}
          <td className="py-3 px-3 text-left font-medium whitespace-nowrap">
            {new Date(day.date).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </td>

          {/* MEALS */}
          {MEALS.map((meal) => {
            const m = day.meals?.[meal];
            return (
              <td
                key={meal}
                className="py-3 px-3 text-center"
              >
                {m ? (
                  <div className="flex justify-center">
                    <Badge
                      className={`${STATUS_STYLES[m.status]} px-2 py-0.5`}
                    >
                      {m.status.replace("_", " ")}
                    </Badge>
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    —
                  </span>
                )}
              </td>
            );
          })}

          {/* MONEY */}
          <td className="py-3 px-3 text-right font-medium">
            ₹{day.messSpent}
          </td>

          <td className="py-3 px-3 text-right font-medium text-emerald-600">
            +₹{day.walletCredit}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


    {/* ---------- EMPTY ---------- */}
    {filteredData.length === 0 && (
      <div className="py-6 text-center text-sm text-muted-foreground">
        No records found
      </div>
    )}
  </Card>
);

}
