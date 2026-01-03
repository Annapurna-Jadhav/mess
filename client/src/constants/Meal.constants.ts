// meal.constants.ts
import {
  Coffee,
  Utensils,
  Cookie,
  Soup,
} from "lucide-react";
import type { MealType } from "@/types/meal.types";

export const MEAL_ORDER: MealType[] = [
  "breakfast",
  "lunch",
  "snacks",
  "dinner",
];

export const MEAL_META: Record<
  MealType,
  {
    label: string;
    time12h: string;
    Icon: any;
  }
> = {
  breakfast: {
    label: "Breakfast",
    time12h: "7:00 AM – 9:30 AM",
    Icon: Coffee,
  },
  lunch: {
    label: "Lunch",
    time12h: "12:00 PM – 2:00 PM",
    Icon: Utensils,
  },
  snacks: {
    label: "Snacks",
    time12h: "4:30 PM – 6:00 PM",
    Icon: Cookie,
  },
  dinner: {
    label: "Dinner",
    time12h: "7:30 PM – 9:30 PM",
    Icon: Soup,
  },
};
