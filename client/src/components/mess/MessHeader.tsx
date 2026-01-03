import { Badge } from "@/components/ui/badge";
import { CalendarRange, Users, UtensilsCrossed } from "lucide-react";
import { type MessProfile } from "@/types/mess.types";
import { cn } from "@/lib/utils";

export default function MessHeader({
  data,
}: {
  data: MessProfile;
}) {
  const { messInfo, period } = data;

  const statusColor =
    messInfo.status === "ACTIVE"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
      : "bg-red-500/10 text-red-700 border-red-500/30";

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4">
      {/* TOP ROW */}
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {messInfo.messName}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <UtensilsCrossed className="h-4 w-4" />
              {messInfo.foodType}
            </span>

            <span className="hidden sm:inline">•</span>

            <span>{messInfo.campusType}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          <Badge
            variant="outline"
            className={cn("px-3 py-1 text-sm", statusColor)}
          >
            {messInfo.status}
          </Badge>

          <Badge
            variant="secondary"
            className="px-3 py-1 text-sm inline-flex items-center gap-1.5"
          >
            <Users className="h-4 w-4" />
            {messInfo.studentCount} students
          </Badge>
        </div>
      </div>

      {/* ACTIVE PERIOD */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarRange className="h-4 w-4" />
        Active Period:
        <span className="font-medium text-foreground">
          {period.startDate}
        </span>
        →
        <span className="font-medium text-foreground">
          {period.endDate}
        </span>
      </div>
    </div>
  );
}
