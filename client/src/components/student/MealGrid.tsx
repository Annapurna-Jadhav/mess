import type { MealType } from "@/types/meal.types";
import type { StudentMealDay } from "@/types/mess.types";
import MealActionCard from "./MealActionCard";
import { MEAL_ORDER } from "@/constants/Meal.constants";

const MEAL_RANGES: Record<MealType, string> = {
  breakfast: "07:30-09:30",
  lunch: "12:00-14:00",
  snacks: "16:30-18:00",
  dinner: "19:30-21:00",
};

function isWithinTime(range: string) {
  const now = new Date();
  const [start, end] = range.split("-");
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const s = new Date(); s.setHours(sh, sm, 0, 0);
  const e = new Date(); e.setHours(eh, em, 0, 0);

  return now >= s && now <= e;
}

function canGenerateQRForMeal(
  date: string,
  meal: MealType,
  meals: StudentMealDay["meals"]
) {
  const today = new Date().toISOString().split("T")[0];

  // ❌ Not today
  if (date !== today) return false;

  const status = meals[meal].status;

  // ❌ Hard blocks
  if (
    status === "SERVED" ||
    status === "DECLARED_ABSENT" ||
    status === "NO_SHOW"
  ) {
    return false;
  }

  // 🧪 HACKATHON OVERRIDE — dinner always enabled
  if (meal === "dinner") return true;

  // ✅ Normal meals only during time window
  return isWithinTime(MEAL_RANGES[meal]);
}

function canDeclareAbsentForMeal(date: string, meal: MealType) {
  const START: Record<MealType, string> = {
    breakfast: "08:00",
    lunch: "12:30",
    snacks: "16:30",
    dinner: "19:30",
  };

  const [h, m] = START[meal].split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);

  return d.getTime() - Date.now() >= 24 * 60 * 60 * 1000;
}

export function MealGrid({
  day,
  prices,
  onDeclareAbsent,
  onGenerateQR,
}: {
  day: StudentMealDay;
  prices: Record<MealType, number>;
  onDeclareAbsent: (meal: MealType) => void;
  onGenerateQR: (meal: MealType) => void;
}) {
  return (
    <div className="flex flex-col gap-4 items-center">
      {MEAL_ORDER.map((meal) => {
  const status = day.meals[meal].status;

  const canQR = canGenerateQRForMeal(
    day.date,
    meal,
    day.meals
  );

  console.group(`🍽️ MEAL GRID DEBUG → ${meal.toUpperCase()}`);
  console.log("date:", day.date);
  console.log("today:", new Date().toISOString().split("T")[0]);
  console.log("status:", status);
  console.log("isDinner:", meal === "dinner");
  console.log("canGenerateQR:", canQR);
  console.groupEnd();

  return (
    <MealActionCard
      key={meal}
      meal={meal}
      price={prices[meal]}
      status={status}
      canDeclareAbsent={canDeclareAbsentForMeal(day.date, meal)}
      canGenerateQR={canQR}
      onDeclareAbsent={() => onDeclareAbsent(meal)}
      onGenerateQR={() => onGenerateQR(meal)}
    />
  );
})}

    </div>
  );
}
