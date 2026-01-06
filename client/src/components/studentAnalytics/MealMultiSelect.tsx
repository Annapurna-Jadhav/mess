import { Badge } from "@/components/ui/badge";
import { type MealType } from "./types";

const MEALS: MealType[] = [
  "breakfast",
  "lunch",
  "snacks",
  "dinner",
];

export default function MealMultiSelect({
  value,
  onChange,
  disabled,
  mealCounts = {},
}: {
  value: MealType[];
  onChange: (v: MealType[]) => void;
  disabled?: boolean;
  mealCounts?: Partial<Record<MealType, number>>;
}) {
  const toggle = (meal: MealType) => {
    if (value.includes(meal)) {
      onChange(value.filter((m) => m !== meal));
    } else {
      onChange([...value, meal]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {MEALS.map((meal) => {
        const isActive = value.includes(meal);
        const count = mealCounts[meal] ?? 0;

        return (
          <Badge
            key={meal}
            onClick={() => !disabled && toggle(meal)}
            className={`
              flex items-center gap-1.5
              cursor-pointer select-none
              capitalize
              px-3 py-1.5
              transition
              ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span>{meal}</span>

            {/* COUNT */}
            <span
              className={`
                text-[11px] font-medium
                rounded-md px-1.5 py-0.5
                ${
                  isActive
                    ? "bg-primary-foreground/20"
                    : "bg-background/70"
                }
              `}
            >
              {count}
            </span>
          </Badge>
        );
      })}
    </div>
  );
}
