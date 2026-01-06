import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TAG_COLORS: Record<string, string> = {
  CLEANLINESS: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  HYGIENE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  FOOD_QUALITY: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  FOOD_TASTE: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  FOOD_QUANTITY: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  SERVICE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  TIMING: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
  INFRASTRUCTURE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function FeedbackCard({ fb }: { fb: any }) {
  return (
    <Card
      className="
        group
        rounded-xl border
        bg-background
        px-4 py-3
        transition-all
        hover:border-[#6770d2]/40
        hover:bg-[#6770d2]/[0.03]
        hover:shadow-sm
      "
    >
      {/* 💬 MESSAGE */}
      <p className="text-sm leading-relaxed text-foreground/90 mb-2">
        {fb.message}
      </p>

      {/* 🏷 TAGS (LEFT) + META (RIGHT) */}
      <div className="flex items-center justify-between gap-3">
        {/* TAGS */}
        <div className="flex flex-wrap gap-1.5">
          {Array.isArray(fb.tags) && fb.tags.length > 0 ? (
            fb.tags.map((tag: string) => (
              <Badge
                key={tag}
                className={cn(
                  "text-[11px] px-2 py-0.5 rounded-md font-medium",
                  TAG_COLORS[tag] ?? "bg-muted text-muted-foreground"
                )}
              >
                {tag.replace("_", " ")}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary" className="text-[11px]">
              General
            </Badge>
          )}
        </div>

        {/* META */}
        <div className="flex items-center gap-3 text-xs whitespace-nowrap">
          <span
            className={cn(
              "font-medium",
              fb.sentiment === "POSITIVE" && "text-emerald-600",
              fb.sentiment === "NEGATIVE" && "text-rose-600",
              fb.sentiment === "NEUTRAL" && "text-zinc-500"
            )}
          >
            {fb.sentiment}
          </span>

          <span className="text-muted-foreground">
            {fb.createdAtFormatted}
          </span>
        </div>
      </div>

      {/* 🎨 SUBTLE LEFT ACCENT (HOVER ONLY) */}
      <span
        className="
          absolute left-0 top-0 h-full w-[3px]
          bg-[#6770d2]
          opacity-0
          group-hover:opacity-100
          transition-opacity
          rounded-l-xl
        "
      />
    </Card>
  );
}
